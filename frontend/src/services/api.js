import axios from 'axios';
import { FALLBACK_SCENARIOS, FALLBACK_ANALYSES } from '../data/fallbackScenarios';

// Determine backend base URL: Uses Vite proxy /api or direct localhost:5000
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.port === '5173' ? '/api' : 'http://localhost:5000/api');

export const DEFAULT_FREE_MODEL = 'meta-llama/llama-3.3-70b-instruct:free';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject client-side OpenRouter key & model headers
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const clientKey = localStorage.getItem('gaplens_openrouter_key');
    const clientModel = localStorage.getItem('gaplens_openrouter_model') || DEFAULT_FREE_MODEL;
    const forceDemo = localStorage.getItem('gaplens_force_offline_demo') === 'true';

    if (clientKey && clientKey.trim()) {
      config.headers['x-openrouter-key'] = clientKey.trim();
    }
    config.headers['x-openrouter-model'] = clientModel;
    if (forceDemo) {
      config.headers['x-force-offline-demo'] = 'true';
    }
  }
  return config;
});

/**
 * Fetch backend system health, Supabase connectivity status, and OpenRouter config
 */
export const checkHealth = async () => {
  try {
    const res = await apiClient.get('/health', { timeout: 5000 });
    return {
      online: true,
      data: res.data,
    };
  } catch (err) {
    return {
      online: false,
      error: err.message,
      data: {
        status: 'offline-demo',
        supabaseConnected: false,
        storageMode: 'Browser In-Memory Fallback',
        hasServerOpenRouterKey: false,
        defaultModel: DEFAULT_FREE_MODEL,
      },
    };
  }
};

/**
 * Fetch hackathon pre-seeded sample scenarios
 */
export const fetchScenarios = async () => {
  try {
    const res = await apiClient.get('/scenarios', { timeout: 5000 });
    if (res.data && res.data.scenarios && res.data.scenarios.length > 0) {
      return res.data.scenarios;
    }
    return FALLBACK_SCENARIOS;
  } catch (err) {
    console.warn('[GapLens API] Backend scenarios unavailable, using client fallback scenarios.');
    return FALLBACK_SCENARIOS;
  }
};

/**
 * Extract clean readable content from a given URL via backend Jina AI / Cheerio scraper
 */
export const extractUrlContent = async (url) => {
  try {
    const res = await apiClient.post('/extract-url', { url });
    return res.data;
  } catch (err) {
    return {
      success: false,
      error:
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Unable to reach extraction service. Please paste text directly into the Source Content box.',
    };
  }
};

/**
 * Search permitted web sources for research topic
 */
export const searchWebSources = async (query) => {
  try {
    const res = await apiClient.post('/search-sources', { query });
    if (res.data && Array.isArray(res.data.results)) {
      return res.data.results;
    }
    return [];
  } catch (err) {
    console.warn('[GapLens API] Web search backend offline, providing local reference matches.');
    const lower = (query || '').toLowerCase();
    if (lower.includes('scholarship') || lower.includes('matric')) {
      return [
        {
          title: 'State Portal: Post-Matric Scholarship Scheme Guidelines (2026-27)',
          url: 'https://scholarships.gov.in/post-matric-scholarship-guidelines-2026',
          snippet:
            'Annual income criteria must not exceed Rs. 2,50,000. Domicile proof, digital income certificate, marksheet, and Aadhaar-seeded account required for online registration.',
          suggestedSourceType: 'Official Notice',
        },
        {
          title: 'Student Education Guidance: Post-Matric Application Process & Documents',
          url: 'https://educareer-guidance.org/state-post-matric-scheme-summary',
          snippet:
            'Comprehensive overview of qualifying degrees, income declaration procedures, institutional bonafide submission, and caste validity verification.',
          suggestedSourceType: 'Third-Party Guide',
        },
        {
          title: 'Directorate of Technical Education: Archived Circular 2023-24',
          url: 'https://dte-archive.nic.in/circulars/scholarship-verification-2023.pdf',
          snippet:
            'Archived instruction mandating offline physical submission of application forms and verified vouchers to the District Nodal Officer on or before Nov 2023.',
          suggestedSourceType: 'Archived Circular',
        },
      ];
    }
    return [
      {
        title: `Official Regulatory Framework for: ${query}`,
        url: `https://gov-portal.example/search?q=${encodeURIComponent(query)}`,
        snippet: `Public notice and compliance circular covering prerequisites and filing deadlines for ${query}.`,
        suggestedSourceType: 'Official Notice',
      },
      {
        title: `Community Guidelines & Advisory Summary: ${query}`,
        url: `https://advisory-guide.example/details/${encodeURIComponent(query)}`,
        snippet: `Advisory summary for applicants navigating paperwork and fee structures for ${query}.`,
        suggestedSourceType: 'Third-Party Guide',
      },
    ];
  }
};

/**
 * Scan raw text for academic cycles, explicit dates, and temporal status
 */
export const scanTextMetadata = async (content, publishedDate = '') => {
  try {
    const res = await apiClient.post('/scan-text', { content, publishedDate });
    return res.data;
  } catch (err) {
    const combined = `${publishedDate || ''} ${content || ''}`;
    const cycleMatch = combined.match(/\b(20\d{2}[-–/]\d{2,4})\b/);
    const dateMatch = combined.match(
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(?:\d{1,2},?\s+)?(20\d{2})\b/i
    );
    const yearMatch = combined.match(/\b(201\d|202[0-7])\b/);

    let detectedDate = '';
    if (cycleMatch) detectedDate = `${cycleMatch[1]} Cycle`;
    else if (dateMatch) detectedDate = dateMatch[0];
    else if (yearMatch) detectedDate = yearMatch[0];

    const yr = yearMatch ? parseInt(yearMatch[0], 10) : 0;
    let temporalStatus = 'undated';
    if (yr > 0) {
      temporalStatus = yr <= 2024 ? 'outdated' : 'current';
    }

    return {
      success: true,
      detectedDate,
      temporalStatus,
      wordCount: (content || '').trim().split(/\s+/).filter(Boolean).length,
    };
  }
};

/**
 * Save current research session (persisted to Supabase research_sessions or In-Memory backend store)
 */
export const saveResearchSession = async (sessionData) => {
  try {
    const payload = {
      topic: sessionData.topic,
      category: sessionData.category,
      sources: sessionData.sources,
      model_used: sessionData.modelUsed || sessionData.model_used || DEFAULT_FREE_MODEL,
      analysis_result: sessionData.analysisResult || sessionData.analysis_result,
    };
    const res = await apiClient.post('/sessions', payload);
    return res.data;
  } catch (err) {
    console.warn('[GapLens API] Backend session save error, caching locally in localStorage');
    const localId = `local-${Date.now()}`;
    const localRecord = { ...sessionData, id: localId, savedLocally: true };
    const history = JSON.parse(localStorage.getItem('gaplens_local_sessions') || '[]');
    history.unshift(localRecord);
    localStorage.setItem('gaplens_local_sessions', JSON.stringify(history.slice(0, 20)));
    return {
      success: true,
      storage: 'localStorage',
      session: localRecord,
    };
  }
};

/**
 * Run Phase 3 Deep AI Gap-Detection Analysis
 * Calls backend POST /api/analyze with Multi-Model Failover, or returns client fallback analysis
 */
export const runAiAnalysis = async (payload) => {
  const clientKey = typeof window !== 'undefined' ? localStorage.getItem('gaplens_openrouter_key') || '' : '';
  const clientModel = typeof window !== 'undefined' ? localStorage.getItem('gaplens_openrouter_model') || DEFAULT_FREE_MODEL : DEFAULT_FREE_MODEL;
  const forceOffline = typeof window !== 'undefined' ? localStorage.getItem('gaplens_force_offline_demo') === 'true' : false;

  const enrichedPayload = {
    ...payload,
    openRouterKey: forceOffline ? '' : (clientKey || payload.openRouterKey || ''),
    model: clientModel || payload.model || DEFAULT_FREE_MODEL,
    forceDemoMode: forceOffline || payload.forceDemoMode,
  };

  try {
    const res = await apiClient.post('/analyze', enrichedPayload, { timeout: 35000 });
    if (res.data && res.data.analysis) {
      return res.data;
    }
    throw new Error(res.data?.message || 'Invalid analysis response format');
  } catch (err) {
    console.warn('[GapLens API] /api/analyze failed, using client fallback analysis:', err.message);

    // Topic matching for offline resilience
    const lower = (payload.topic || '').toLowerCase();
    let analysis = FALLBACK_ANALYSES['scholarship-2026'];
    if (lower.includes('cloud kitchen') || lower.includes('fssai') || lower.includes('pune')) {
      analysis = FALLBACK_ANALYSES['fssai-cloud-kitchen'] || analysis;
    } else if (lower.includes('overseas') || lower.includes('subsidy') || lower.includes('csis')) {
      analysis = FALLBACK_ANALYSES['overseas-edu-subsidy'] || analysis;
    }

    return {
      success: true,
      analysis,
      meta: {
        mode: 'Offline Demo Mode (Client Fallback Engine)',
        modelUsed: 'gaplens-deterministic-fallback',
        isOfflineDemo: true,
        timestamp: new Date().toISOString(),
        sourcesAnalyzed: (payload.sources || []).length,
        fallbackNotice: 'Executed in Offline Demo Mode. Pre-verified gap detection analysis loaded.',
      },
    };
  }
};

/**
 * Compatibility alias for Phase 1/2 trigger
 */
export const triggerAnalysisPrep = runAiAnalysis;

/**
 * Direct OpenRouter probe (for testing key and model validity in ApiKeyModal)
 */
export const probeOpenRouter = async (key, model = DEFAULT_FREE_MODEL) => {
  if (!key || !key.trim()) {
    return { success: false, message: 'API key is empty.' };
  }

  try {
    const res = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model,
        messages: [{ role: 'user', content: 'Say "GapLens OpenRouter Ready" in 4 words.' }],
        max_tokens: 20,
      },
      {
        headers: {
          Authorization: `Bearer ${key.trim()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://gaplens.local',
          'X-Title': 'GapLens Hackathon Platform',
        },
        timeout: 10000,
      }
    );

    const reply = res.data?.choices?.[0]?.message?.content || 'Verified successfully';
    return {
      success: true,
      reply,
      modelUsed: res.data?.model || model,
    };
  } catch (err) {
    const msg =
      err.response?.data?.error?.message ||
      err.response?.data?.message ||
      err.message ||
      'Failed to reach OpenRouter API';
    return { success: false, message: msg };
  }
};
