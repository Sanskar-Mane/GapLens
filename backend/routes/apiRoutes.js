const express = require('express');
const sampleScenarios = require('../data/sampleScenarios');
const { supabase, isSupabaseConfigured, inMemorySessions } = require('../config/supabaseClient');
const {
  getAvailableModels,
  getDefaultModel,
  FREE_MODELS,
  DEFAULT_MODEL,
} = require('../config/openRouterConfig');
const {
  extractUrlContent,
  detectTemporalMetadata,
  searchPermittedSources,
} = require('../services/scraperService');
const { analyzeSourcesWithAI } = require('../services/aiAnalysisService');

const router = express.Router();

/**
 * GET /api/health
 * Returns service status, Supabase connectivity, Google Gemini configuration, and models from .env
 */
router.get('/health', (req, res) => {
  const envKey = process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY;
  const hasServerKey = Boolean(
    envKey &&
      envKey.trim() !== '' &&
      envKey !== 'your_gemini_api_key_here' &&
      envKey !== 'your_openrouter_key_here'
  );
  const defaultModel = getDefaultModel();
  const availableModels = getAvailableModels();

  res.json({
    status: 'ok',
    supabaseConnected: isSupabaseConfigured,
    storageMode: isSupabaseConfigured ? 'Supabase Database' : 'In-Memory Fallback',
    hasServerOpenRouterKey: hasServerKey,
    hasServerGeminiKey: hasServerKey,
    defaultModel,
    availableModels,
    timestamp: new Date().toISOString(),
    inMemorySessionsCount: inMemorySessions.length,
  });
});

/**
 * GET /api/models
 * Returns the models strictly configured in .env (GEMINI_MODEL / OPENROUTER_MODEL)
 */
router.get('/models', (req, res) => {
  res.json({
    success: true,
    defaultModel: getDefaultModel(),
    models: getAvailableModels(),
  });
});

/**
 * GET /api/scenarios
 * Returns the 3 pre-seeded realistic sample scenarios
 */
router.get('/scenarios', (req, res) => {
  res.json({
    success: true,
    count: sampleScenarios.length,
    scenarios: sampleScenarios,
  });
});

/**
 * POST /api/extract-url
 * Smart multi-tier URL extraction with CAPTCHA/Cloudflare firewall guard and temporal scanning
 */
router.post('/extract-url', async (req, res) => {
  const { url } = req.body;
  const result = await extractUrlContent(url);
  return res.json(result);
});

/**
 * POST /api/search-sources
 * Permitted web search across government, Wikipedia, and curated references
 */
router.post('/search-sources', async (req, res) => {
  const { query } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ success: false, error: 'Query string is required.' });
  }
  const result = await searchPermittedSources(query);
  return res.json(result);
});

/**
 * POST /api/scan-text
 * Automatically detects dates, academic cycles, and temporal currency from raw text
 */
router.post('/scan-text', (req, res) => {
  const { content, publishedDate } = req.body;
  const temporal = detectTemporalMetadata(content, publishedDate);
  const wordCount = (content || '').trim().split(/\s+/).filter(Boolean).length;

  return res.json({
    success: true,
    detectedDate: temporal.detectedDateString,
    temporalStatus: temporal.temporalStatus,
    detectedYears: temporal.detectedYears,
    wordCount,
  });
});

/**
 * POST /api/sessions
 * Inserts research session into Supabase research_sessions or in-memory fallback
 */
router.post('/sessions', async (req, res) => {
  try {
    const { topic, category, sources, model_used, modelUsed, analysis_result, analysisResult } = req.body;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Topic or research question is required.',
      });
    }

    if (!Array.isArray(sources) || sources.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least two sources are required for cross-verification.',
      });
    }

    const cleanedSources = sources.map((src, idx) => ({
      id: src.id || `src-${idx + 1}`,
      title: (src.title || '').trim(),
      sourceType: src.sourceType || 'Official Notice',
      url: (src.url || '').trim(),
      publishedDate: (src.publishedDate || '').trim(),
      content: (src.content || '').trim(),
    }));

    const sessionPayload = {
      topic: topic.trim(),
      category: category || 'Education',
      sources: cleanedSources,
      model_used: model_used || modelUsed || getDefaultModel(),
      analysis_result: analysis_result || analysisResult || null,
      created_at: new Date().toISOString(),
    };

    // Try Supabase first if configured
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('research_sessions')
          .insert([sessionPayload])
          .select()
          .single();

        if (!error && data) {
          return res.status(201).json({
            success: true,
            storage: 'supabase',
            session: data,
          });
        }
        console.warn('[Supabase Insert Warning]', error?.message || 'Falling back to in-memory store.');
      } catch (sbErr) {
        console.warn('[Supabase Insert Exception]', sbErr.message);
      }
    }

    // In-memory fallback
    const memSession = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      ...sessionPayload,
    };

    inMemorySessions.unshift(memSession);
    if (inMemorySessions.length > 50) {
      inMemorySessions.pop();
    }

    return res.status(201).json({
      success: true,
      storage: 'in-memory',
      session: memSession,
    });
  } catch (err) {
    console.error('[Session Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to save research session: ' + err.message,
    });
  }
});

/**
 * GET /api/sessions
 * Fetches the 15 most recent saved research sessions
 */
router.get('/sessions', async (req, res) => {
  try {
    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('research_sessions')
          .select('id, topic, category, sources, model_used, analysis_result, created_at')
          .order('created_at', { ascending: false })
          .limit(15);

        if (!error && Array.isArray(data)) {
          return res.json({
            success: true,
            storage: 'supabase',
            count: data.length,
            sessions: data,
          });
        }
      } catch (sbErr) {
        console.warn('[Supabase Query Exception]', sbErr.message);
      }
    }

    // Return in-memory fallback sessions
    const recentMemory = inMemorySessions.slice(0, 15);
    return res.json({
      success: true,
      storage: 'in-memory',
      count: recentMemory.length,
      sessions: recentMemory,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve sessions: ' + err.message,
    });
  }
});

/**
 * PATCH /api/sessions/:id/checklist
 * Persists interactive checklist state and official verification notes
 */
router.patch('/sessions/:id/checklist', async (req, res) => {
  try {
    const { id } = req.params;
    const { checkedIds = [], verificationNotes = {} } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Session ID is required.' });
    }

    let updated = false;

    // 1. Try Supabase update if configured
    if (supabase && isSupabaseConfigured) {
      try {
        const { data: existing } = await supabase
          .from('research_sessions')
          .select('analysis_result')
          .eq('id', id)
          .single();

        if (existing && existing.analysis_result) {
          const mergedAnalysis = {
            ...existing.analysis_result,
            checkedChecklistIds: checkedIds,
            verificationNotes: verificationNotes,
          };

          const { error: updateErr } = await supabase
            .from('research_sessions')
            .update({ analysis_result: mergedAnalysis })
            .eq('id', id);

          if (!updateErr) {
            updated = true;
          }
        }
      } catch (sbErr) {
        console.warn('[Supabase Patch Error]', sbErr.message);
      }
    }

    // 2. Also update in-memory session if found
    const memIndex = inMemorySessions.findIndex((s) => s.id === id);
    if (memIndex !== -1) {
      const existingAnalysis = inMemorySessions[memIndex].analysis_result || {};
      inMemorySessions[memIndex].analysis_result = {
        ...existingAnalysis,
        checkedChecklistIds: checkedIds,
        verificationNotes: verificationNotes,
      };
      updated = true;
    }

    return res.json({
      success: true,
      message: 'Checklist progress persisted successfully.',
      sessionId: id,
      updated,
    });
  } catch (err) {
    console.error('[Patch Checklist Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update session checklist: ' + err.message,
    });
  }
});

/**
 * DELETE /api/sessions/:id
 * Removes a saved research session from Supabase or in-memory fallback
 */
router.delete('/sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Session ID is required.' });
    }

    // 1. Delete from Supabase if configured
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('research_sessions').delete().eq('id', id);
      } catch (sbErr) {
        console.warn('[Supabase Delete Error]', sbErr.message);
      }
    }

    // 2. Delete from in-memory fallback array
    const initialLen = inMemorySessions.length;
    const filtered = inMemorySessions.filter((s) => s.id !== id);
    inMemorySessions.length = 0;
    filtered.forEach((s) => inMemorySessions.push(s));

    return res.json({
      success: true,
      message: 'Session deleted successfully.',
      sessionId: id,
    });
  } catch (err) {
    console.error('[Delete Session Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete session: ' + err.message,
    });
  }
});

/**
 * POST /api/analyze
 * Phase 3 Deep AI Gap-Detection Engine with Multi-Model Fallback
 * Analyzes provided sources for information gaps, cross-source contradictions,
 * outdated warnings, and generates a prioritized verification checklist.
 */
router.post('/analyze', async (req, res) => {
  try {
    const { topic, category, sources, openRouterKey, geminiKey, model, forceDemoMode } = req.body;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a clear research question or decision goal.',
      });
    }

    if (!Array.isArray(sources) || sources.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Minimum 2 sources are required for cross-source gap detection.',
      });
    }

    const validSources = sources.filter(
      (s) => s && s.content && typeof s.content === 'string' && s.content.trim().length >= 10
    );

    if (validSources.length < 2) {
      return res.status(400).json({
        success: false,
        message: `At least 2 sources must contain meaningful text (found ${validSources.length} valid source${
          validSources.length === 1 ? '' : 's'
        }). Please fill in or paste content for your sources.`,
      });
    }

    // Resolve client key and model
    const headerKey = req.headers['x-gemini-key'] || req.headers['x-openrouter-key'];
    const envKey = process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY;
    const isEnvKeyValid =
      envKey &&
      envKey.trim() !== '' &&
      envKey !== 'your_gemini_api_key_here' &&
      envKey !== 'your_openrouter_key_here';

    const activeKey =
      (typeof geminiKey === 'string' && geminiKey.trim() !== '' && geminiKey.trim()) ||
      (typeof openRouterKey === 'string' && openRouterKey.trim() !== '' && openRouterKey.trim()) ||
      (typeof headerKey === 'string' && headerKey.trim() !== '' && headerKey.trim()) ||
      (isEnvKeyValid ? envKey.trim() : '');

    const activeModel =
      model ||
      req.headers['x-gemini-model'] ||
      req.headers['x-openrouter-model'] ||
      getDefaultModel();

    const isForceDemo = Boolean(
      forceDemoMode === true ||
        req.headers['x-force-offline-demo'] === 'true' ||
        process.env.FORCE_OFFLINE_DEMO === 'true'
    );

    // Run Phase 3 Deep AI Analysis
    const aiResult = await analyzeSourcesWithAI({
      topic: topic.trim(),
      category: category || 'Education',
      sources: validSources,
      openRouterKey: activeKey,
      geminiKey: activeKey,
      preferredModel: activeModel,
      forceDemoMode: isForceDemo,
    });

    // Save session automatically
    let savedSessionId = null;
    let savedStorage = 'in-memory';

    try {
      const sessionPayload = {
        topic: topic.trim(),
        category: category || 'Education',
        sources: validSources,
        model_used: aiResult.meta.modelUsed,
        analysis_result: aiResult.analysis,
        created_at: new Date().toISOString(),
      };

      if (supabase && isSupabaseConfigured) {
        const { data } = await supabase
          .from('research_sessions')
          .insert([sessionPayload])
          .select()
          .single();

        if (data) {
          savedSessionId = data.id;
          savedStorage = 'supabase';
        }
      }

      if (!savedSessionId) {
        const memSession = {
          id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          ...sessionPayload,
        };
        inMemorySessions.unshift(memSession);
        if (inMemorySessions.length > 50) inMemorySessions.pop();
        savedSessionId = memSession.id;
      }
    } catch (saveErr) {
      console.warn('[Session Auto-Save Error]', saveErr.message);
    }

    return res.json({
      success: true,
      analysis: aiResult.analysis,
      meta: {
        ...aiResult.meta,
        sessionId: savedSessionId,
        storage: savedStorage,
      },
    });
  } catch (err) {
    console.error('[Analyze Phase 3 Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Analysis failed: ' + err.message,
    });
  }
});

module.exports = router;
