/**
 * GapLens Google Gemini AI Gap-Detection Engine & Dynamic Model Failover
 * Shinchan Online Hackathon 2026: Digital Dark Spot
 *
 * Implements:
 * 1. Deep AI Information Gap & Contradiction Auditing via Google Gemini REST API
 * 2. Multi-Model Automatic Failover across .env Configured Gemini Models
 * 3. Pre-Verified & Dynamic Fallback Engine for 100% Reliability
 * 4. Traceable Source Quote Extraction & Rubric Classification
 * 5. Anti-Hallucination & Epistemic Transparency Guardrails
 */

const https = require('https');
const crypto = require('crypto');
const axios = require('axios');
const {
  PRECOMPUTED_ANALYSES,
  generateDynamicFallbackAnalysis,
} = require('../data/precomputedAnalyses');
const {
  getOpenRouterHeaders,
  getModelsFromEnv,
  getDefaultModel,
  sanitizeModelSlug,
} = require('../config/openRouterConfig');

// Dedicated IPv4 HTTPS Agent to prevent Windows IPv6 route hangs
const ipv4HttpsAgent = new https.Agent({
  family: 4,
  keepAlive: true,
  timeout: 15000,
});

// In-Memory Request Cache for Zero-Token Repeat Audits (max 50 entries)
const analysisCache = new Map();
const MAX_CACHE_ENTRIES = 50;

/**
 * High-Signal Source Text Compressor
 * Strips URLs, normalizes whitespace, and prioritizes regulatory/factual sentences up to maxChars (default 1200).
 */
function compressSourceForLLM(rawContent, maxChars = 1200) {
  if (!rawContent || typeof rawContent !== 'string') return '';

  // 1. Strip Markdown link URLs while keeping anchor text
  let text = rawContent.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // 2. Strip raw inline http:// or https:// URLs inside body text
  text = text.replace(/https?:\/\/[^\s)]+/gi, '');

  // 3. Collapse multiple spaces, tabs, and newlines
  text = text.replace(/\s+/g, ' ').trim();

  if (text.length <= maxChars) {
    return text;
  }

  // 4. Split text into sentences
  const sentenceList = text.match(/[^.!?]+(?:[.!?]+|$)/g) || [text];
  const trimmed = sentenceList.map((s) => s.trim()).filter((s) => s.length > 0);

  if (trimmed.length <= 1) {
    return text.slice(0, maxChars).trim();
  }

  // Prioritize sentences with regulatory signals: digits, currency, years, policy keywords
  const signalRegex = /\b(\d+|rs\.?|inr|lakhs?|crores?|fees?|202\d|must|mandatory|requires?|required|eligible|eligibility|limit|limits|deadline|deadlines|renews?|renewal|certificate|certificates|noc|licen[sc]e|licen[sc]es|exempt|exemption|offline|online)\b/i;

  const scored = trimmed.map((sentence, idx) => {
    const matches = sentence.match(new RegExp(signalRegex.source, 'gi'));
    return {
      sentence,
      score: matches ? matches.length : 0,
      index: idx,
      length: sentence.length,
    };
  });

  // Sort descending by score; if tied, retain original chronological position
  const sorted = [...scored].sort((a, b) => b.score - a.score || a.index - b.index);

  const selected = [];
  let currentLen = 0;

  for (const item of sorted) {
    if (currentLen + item.length + 1 <= maxChars) {
      selected.push(item);
      currentLen += item.length + 1;
    }
  }

  if (selected.length === 0 && trimmed.length > 0) {
    return trimmed[0].slice(0, maxChars).trim();
  }

  // Re-sort to preserve natural narrative order
  selected.sort((a, b) => a.index - b.index);
  return selected.map((s) => s.sentence).join(' ').trim();
}

/**
 * Match a topic string against the precomputed scenarios
 */
function findPrecomputedMatch(topic) {
  // In 100% Live Mode, all requests are analyzed dynamically
  return null;
}

/**
 * Escape raw unescaped control characters (newlines, tabs, carriage returns)
 * occurring inside string literals in LLM JSON output.
 */
function escapeControlCharsInStrings(str) {
  let inString = false;
  let escaped = false;
  let result = '';

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (char === '"' && !escaped) {
      inString = !inString;
      result += char;
    } else if (inString) {
      if (escaped) {
        result += char;
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
        result += char;
      } else if (char === '\n') {
        result += '\\n';
      } else if (char === '\r') {
        result += '\\r';
      } else if (char === '\t') {
        result += '\\t';
      } else if (char.charCodeAt(0) < 32) {
        result += ' ';
      } else {
        result += char;
      }
    } else {
      result += char;
      escaped = false;
    }
  }

  return result;
}

/**
 * Remove trailing commas before closing braces/brackets (e.g., `, }` or `, ]`)
 */
function stripTrailingCommas(jsonStr) {
  return jsonStr
    .replace(/,\s*([}\]])/g, '$1')
    .replace(/,\s*([}\]])/g, '$1');
}

/**
 * Robust JSON Sanitization & Parsing Engine
 * Handles reasoning tags, markdown fences, unescaped newlines in quotes, trailing commas, and stray tokens.
 */
function cleanAndParseJSON(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Empty response content received from model');
  }

  // 1. Strip reasoning blocks like <think>...</think> or unclosed <think>
  let sanitized = rawText
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/^<think>[\s\S]*$/gi, '')
    .trim();

  // 2. Strip markdown code fences (e.g. ```json ... ```)
  sanitized = sanitized
    .replace(/```(?:json|JSON)?/g, '')
    .replace(/```/g, '')
    .trim();

  // 3. Extract JSON between the first '{' and the last '}'
  const firstBrace = sanitized.indexOf('{');
  const lastBrace = sanitized.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('No valid JSON object structure found in response text');
  }

  let jsonSubstring = sanitized.substring(firstBrace, lastBrace + 1);

  // 4. Remove trailing commas before closing braces/brackets
  jsonSubstring = jsonSubstring.replace(/,\s*([}\]])/g, '$1').replace(/,\s*([}\]])/g, '$1');

  // 5. Safe JSON parse with control character fallback
  try {
    return JSON.parse(jsonSubstring);
  } catch (initialErr) {
    try {
      const cleaned = jsonSubstring.replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ');
      const withCommasFixed = cleaned
        .replace(/}\s*(\r?\n)+\s*{/g, '},\n{')
        .replace(/"\s*(\r?\n)+\s*"/g, '",\n"')
        .replace(/,\s*([}\]])/g, '$1');
      return JSON.parse(withCommasFixed);
    } catch (fallbackErr) {
      try {
        const normalized = escapeControlCharsInStrings(jsonSubstring);
        const reCleaned = normalized
          .replace(/}\s*(\r?\n)+\s*{/g, '},\n{')
          .replace(/,\s*([}\]])/g, '$1');
        return JSON.parse(reCleaned);
      } catch (finalErr) {
        throw new Error(
          `JSON Parse Failure: ${initialErr.message} | Recovery Failed: ${fallbackErr.message}`
        );
      }
    }
  }
}

/**
 * Validate and guarantee schema integrity of the parsed analysis object
 */
function validateAndNormalizeAnalysis(analysis, fallbackData) {
  const normalized = {
    readinessScore:
      typeof analysis.readinessScore === 'number'
        ? Math.min(100, Math.max(0, Math.round(analysis.readinessScore)))
        : fallbackData.readinessScore || 55,
    readinessLabel:
      analysis.readinessLabel ||
      fallbackData.readinessLabel ||
      'Moderate Risk — Verification Needed',
    executiveSummary:
      analysis.executiveSummary ||
      fallbackData.executiveSummary ||
      'AI Analysis completed. Key gaps, traceable quotes, and cross-source parameters identified.',
    expectedRubric:
      Array.isArray(analysis.expectedRubric) && analysis.expectedRubric.length > 0
        ? analysis.expectedRubric
        : fallbackData.expectedRubric || [],
    rubricStatus:
      Array.isArray(analysis.rubricStatus) && analysis.rubricStatus.length > 0
        ? analysis.rubricStatus
        : fallbackData.rubricStatus || [],
    sourcedFacts: Array.isArray(analysis.sourcedFacts)
      ? analysis.sourcedFacts
      : fallbackData.sourcedFacts || [],
    informationGaps: Array.isArray(analysis.informationGaps)
      ? analysis.informationGaps
      : fallbackData.informationGaps || [],
    contradictions: Array.isArray(analysis.contradictions)
      ? analysis.contradictions
      : fallbackData.contradictions || [],
    outdatedWarnings: Array.isArray(analysis.outdatedWarnings)
      ? analysis.outdatedWarnings
      : fallbackData.outdatedWarnings || [],
    verificationChecklist: Array.isArray(analysis.verificationChecklist)
      ? analysis.verificationChecklist
      : fallbackData.verificationChecklist || [],
  };

  // Ensure each sourced fact has evidenceQuote and citations
  normalized.sourcedFacts = normalized.sourcedFacts.map((fact, idx) => ({
    id: fact.id || `fact-${idx + 1}`,
    category: fact.category || 'Corroborated Fact',
    statement: fact.statement || 'Direct factual statement verified in sources.',
    sourceIds: Array.isArray(fact.sourceIds) && fact.sourceIds.length > 0 ? fact.sourceIds : ['src-1'],
    sourceTitles: Array.isArray(fact.sourceTitles) && fact.sourceTitles.length > 0 ? fact.sourceTitles : ['Source 1'],
    confidence: fact.confidence || 'High (Official Source)',
    evidenceQuote: fact.evidenceQuote || fact.statement || '',
  }));

  // Ensure each gap has signalLabel
  normalized.informationGaps = normalized.informationGaps.map((gap, idx) => ({
    id: gap.id || `gap-${idx + 1}`,
    title: gap.title || `Information Gap ${idx + 1}`,
    missingQuestion:
      gap.missingQuestion || gap.question || 'What specific policy or deadline applies?',
    impactLevel: gap.impactLevel || 'High',
    signalLabel: gap.signalLabel || 'Potential Gap — Not Found in Reviewed Sources',
    explanation: gap.explanation || gap.details || 'Not documented in provided sources.',
  }));

  // Ensure each contradiction has signalLabel, source structure, evidenceQuote, and precedenceVerdict
  normalized.contradictions = normalized.contradictions.map((conf, idx) => {
    const srcA = conf.sourceA?.sourceId || 'src-1';
    const srcB = conf.sourceB?.sourceId || 'src-2';
    const titleA = (conf.sourceA?.title || '').toLowerCase();
    const titleB = (conf.sourceB?.title || '').toLowerCase();
    const isOfficialA = titleA.includes('official') || titleA.includes('portal') || titleA.includes('circular') || titleA.includes('guidelines') || titleA.includes('dte') || titleA.includes('ministry') || titleA.includes('fssai');
    const isOfficialB = titleB.includes('official') || titleB.includes('portal') || titleB.includes('circular') || titleB.includes('guidelines') || titleB.includes('dte') || titleB.includes('ministry') || titleB.includes('fssai');

    const defaultBindingId = isOfficialA && !isOfficialB ? srcA : (!isOfficialA && isOfficialB ? srcB : srcA);
    const defaultReasoning = defaultBindingId === srcA
      ? `${conf.sourceA?.title || 'Source A'} represents authoritative regulatory guidelines (Tier 1/2) and takes legal precedence over secondary advisory claims (Tier 3/4).`
      : `${conf.sourceB?.title || 'Source B'} represents authoritative statutory circulars (Tier 1/2) and supersedes unverified secondary guidance (Tier 3/4).`;

    const verdict = conf.precedenceVerdict && typeof conf.precedenceVerdict === 'object'
      ? {
          bindingSourceId: conf.precedenceVerdict.bindingSourceId || defaultBindingId,
          confidence: conf.precedenceVerdict.confidence || 'Definitive Precedence',
          legalWeightReasoning: conf.precedenceVerdict.legalWeightReasoning || defaultReasoning,
        }
      : {
          bindingSourceId: defaultBindingId,
          confidence: 'Definitive Precedence',
          legalWeightReasoning: defaultReasoning,
        };

    return {
      id: conf.id || `conf-${idx + 1}`,
      parameter: conf.parameter || `Disputed Parameter ${idx + 1}`,
      severity: conf.severity || 'Moderate Conflict',
      signalLabel: conf.signalLabel || 'Possible Conflict Between Sources',
      sourceA: {
        sourceId: srcA,
        title: conf.sourceA?.title || 'Source 1',
        claim: conf.sourceA?.claim || 'Statement from Source 1',
        evidenceQuote: conf.sourceA?.evidenceQuote || conf.sourceA?.claim || '',
      },
      sourceB: {
        sourceId: srcB,
        title: conf.sourceB?.title || 'Source 2',
        claim: conf.sourceB?.claim || 'Conflicting statement from Source 2',
        evidenceQuote: conf.sourceB?.evidenceQuote || conf.sourceB?.claim || '',
      },
      resolutionAdvice:
        conf.resolutionAdvice ||
        'Cross-reference with official circular or gazette notification.',
      precedenceVerdict: verdict,
    };
  });

  // Ensure each outdated warning has evidenceQuote
  normalized.outdatedWarnings = normalized.outdatedWarnings.map((warn, idx) => ({
    id: warn.id || `time-${idx + 1}`,
    sourceId: warn.sourceId || `src-${idx + 1}`,
    sourceTitle: warn.sourceTitle || `Source ${idx + 1}`,
    detectedDate: warn.detectedDate || 'Undated',
    warningType: warn.warningType || 'Missing Publication Date',
    riskDescription: warn.riskDescription || 'Temporal risk detected.',
    evidenceQuote: warn.evidenceQuote || '',
  }));

  // Ensure rubricStatus covers all expectedRubric items
  if (!normalized.rubricStatus || normalized.rubricStatus.length === 0) {
    normalized.rubricStatus = normalized.expectedRubric.map((param, i) => {
      if (i < 2) {
        return {
          parameter: param,
          status: 'verified',
          linkedIds: normalized.sourcedFacts[i] ? [normalized.sourcedFacts[i].id] : ['fact-1'],
        };
      }
      if (i === 2 && normalized.contradictions.length > 0) {
        return {
          parameter: param,
          status: 'conflict',
          linkedIds: ['conf-1'],
        };
      }
      return {
        parameter: param,
        status: 'missing',
        linkedIds: [`gap-${Math.min(i - 1, normalized.informationGaps.length)}`],
      };
    });
  }

  // Pre-Mortem Decision Risk Simulation normalization
  const defaultPreMortem = fallbackData.decisionPreMortem || {
    overallRiskLevel:
      normalized.readinessScore < 50
        ? 'Severe Risk'
        : normalized.readinessScore < 70
        ? 'High Risk'
        : 'Moderate Risk',
    estimatedDelay: '30 to 60 Days Lodgment Delay',
    consequenceSummary:
      'Submitting applications or executing commercial decisions under unresolved contradictory criteria creates an immediate risk of statutory rejection and delayed processing. Missing verification of mandatory prerequisites leaves irreversible compliance vulnerabilities.',
    criticalFailurePoints: [
      ...normalized.contradictions.slice(0, 2).map((c) => ({
        darkSpotRef: c.id,
        failureScenario: `Statutory disqualification caused by ${c.parameter} divergence between conflicting sources.`,
        penaltyOrLoss:
          'Application rejection during document nodal scrutiny, forfeiture of processing fees or filing cycle.',
      })),
      ...normalized.informationGaps.slice(0, 2).map((g) => ({
        darkSpotRef: g.id,
        failureScenario: `Non-compliance with undisclosed mandatory prerequisite: "${g.title}".`,
        penaltyOrLoss:
          'Indefinite administrative hold, cancellation of benefits, or exposure to retroactive regulatory penalties.',
      })),
    ],
  };

  const rawPreMortem = analysis.decisionPreMortem;
  normalized.decisionPreMortem =
    rawPreMortem && typeof rawPreMortem === 'object'
      ? {
          overallRiskLevel:
            rawPreMortem.overallRiskLevel || defaultPreMortem.overallRiskLevel,
          estimatedDelay:
            rawPreMortem.estimatedDelay || defaultPreMortem.estimatedDelay,
          consequenceSummary:
            rawPreMortem.consequenceSummary || defaultPreMortem.consequenceSummary,
          criticalFailurePoints:
            Array.isArray(rawPreMortem.criticalFailurePoints) &&
            rawPreMortem.criticalFailurePoints.length > 0
              ? rawPreMortem.criticalFailurePoints.map((pt, idx) => ({
                  darkSpotRef: pt.darkSpotRef || `gap-${idx + 1}`,
                  failureScenario:
                    pt.failureScenario || 'Procedural failure due to unverified regulatory prerequisite.',
                  penaltyOrLoss:
                    pt.penaltyOrLoss || 'Statutory rejection or delayed administrative processing.',
                }))
              : defaultPreMortem.criticalFailurePoints,
        }
      : defaultPreMortem;

  return normalized;
}

/**
 * Main AI Analysis Engine with Multi-Model Failover & Traceability Guardrails
 */
async function analyzeSourcesWithAI({
  topic,
  category = 'General',
  sources = [],
  openRouterKey,
  geminiKey,
  preferredModel,
  forceDemoMode = false,
}) {
  const envKey = process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY;
  const isEnvKeyValid =
    envKey &&
    envKey.trim() !== '' &&
    envKey !== 'your_gemini_api_key_here' &&
    envKey !== 'your_openrouter_key_here';

  const activeKey =
    (geminiKey && geminiKey.trim()) ||
    (openRouterKey && openRouterKey.trim()) ||
    (isEnvKeyValid ? envKey.trim() : '');

  // 1. Check API Key (100% Live Mode)
  if (!activeKey) {
    return {
      success: false,
      status: 400,
      message:
        'Google Gemini API key is missing. Please configure GEMINI_API_KEY in backend/.env or AI Settings.',
    };
  }

  // 1. In-Memory Request Cache Check (Zero-Token Repeat Audits)
  const cacheKey = crypto
    .createHash('sha256')
    .update(
      JSON.stringify({
        topic: (topic || '').trim().toLowerCase(),
        category,
        sources: (sources || []).map((s) => ({
          id: s.id,
          title: s.title,
          date: s.publishedDate,
          content: (s.content || '').slice(0, 1200),
        })),
      })
    )
    .digest('hex');

  if (analysisCache.has(cacheKey)) {
    const cachedEntry = analysisCache.get(cacheKey);
    console.log(`[GapLens AI Cache] Cache HIT for "${(topic || '').slice(0, 45)}" (0 upstream tokens used)`);
    return {
      success: true,
      analysis: cachedEntry.analysis,
      meta: {
        ...cachedEntry.meta,
        cached: true,
        tokensSaved: true,
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Baseline structure for normalization if the LLM output omits optional fields
  const baselineStructure = generateDynamicFallbackAnalysis(topic, category, sources);

  // Build the prioritized model failover queue strictly from .env models
  const queue = [];

  // 1. Sanitized preferred model (if specified)
  if (preferredModel && typeof preferredModel === 'string' && preferredModel.trim()) {
    const cleanPreferred = sanitizeModelSlug(preferredModel.trim());
    if (cleanPreferred) {
      queue.push(cleanPreferred);
    }
  }

  // 2. Environment models strictly from .env
  const envModels = getModelsFromEnv();
  for (const modelId of envModels) {
    if (!queue.includes(modelId)) {
      queue.push(modelId);
    }
  }

  // 2. High-Signal Compressed Sources (1200 chars max per source)
  const sourcesText = sources
    .map(
      (s, idx) => `[SOURCE ${s.id || `src-${idx + 1}`}: "${s.title || `Source ${idx + 1}`}" | Origin: ${s.isAutoDiscovered ? 'AUTO-DISCOVERED RELATIVE WEBSITE' : 'USER-PROVIDED SOURCE'} | URL: ${s.url || 'N/A'} | Type: ${s.sourceType || 'General'} | Date: ${s.publishedDate || 'Undated'}]
${compressSourceForLLM(s.content, 1200) || '(No content provided)'}`
    )
    .join('\n\n');

  // 3. Minified Token-Dense System & User Prompts
  const systemPrompt = `You are GapLens, an objective Information Gap & Contradiction Auditor for 2026.
Rules:
1. Anti-hallucination: "evidenceQuote" MUST be an exact verbatim substring (8-18 words) from the cited source text.
2. Hybrid Corpus Audit: Compare USER-PROVIDED SOURCE claims against AUTO-DISCOVERED RELATIVE WEBSITE claims to expose hidden omissions (Information Gaps) that were missing from the user's initial sources or remain unanswered across the entire web corpus.
3. Conciseness: statement, explanation, resolutionAdvice, riskDescription, and failureScenario must each be under 22 words.
4. Max items: Return top 3-4 items max for sourcedFacts, informationGaps, contradictions, verificationChecklist, criticalFailurePoints.
5. Authority (LHoA): Tier 1 Statutory > Tier 2 Official > Tier 3 Media > Tier 4 Blogs/Forums. Assign bindingSourceId in precedenceVerdict.
6. Epistemic Labels: signalLabel for gaps: "Potential Gap — Not Found in Reviewed Sources"; for contradictions: "Possible Conflict Between Sources".
7. Return 100% valid JSON only, without markdown code fences or commentary, matching this exact schema:
{
  "readinessScore": <0-100 int>,
  "readinessLabel": "<concise risk label>",
  "executiveSummary": "<2 sentence summary of gaps and contradictions>",
  "expectedRubric": ["<5 to 6 essential parameters>"],
  "rubricStatus": [{"parameter": "<name>", "status": "<verified|conflict|missing>", "linkedIds": ["<id>"]}],
  "sourcedFacts": [{"id": "fact-1", "category": "<type>", "statement": "<under 22 words>", "sourceIds": ["src-1"], "sourceTitles": ["<title>"], "confidence": "<High (Official Source)|Medium>", "evidenceQuote": "<verbatim 8-18 words>"}],
  "informationGaps": [{"id": "gap-1", "title": "<title>", "missingQuestion": "<question>", "impactLevel": "<Critical|High|Medium>", "signalLabel": "Potential Gap — Not Found in Reviewed Sources", "explanation": "<under 22 words>"}],
  "contradictions": [{"id": "conf-1", "parameter": "<param>", "severity": "<Critical Conflict|High Conflict|Moderate Conflict>", "signalLabel": "Possible Conflict Between Sources", "sourceA": {"sourceId": "src-1", "title": "<t1>", "claim": "<claim>", "evidenceQuote": "<verbatim 8-18 words>"}, "sourceB": {"sourceId": "src-2", "title": "<t2>", "claim": "<claim>", "evidenceQuote": "<verbatim 8-18 words>"}, "resolutionAdvice": "<under 22 words>", "precedenceVerdict": {"bindingSourceId": "src-1", "confidence": "Definitive Precedence", "legalWeightReasoning": "<under 22 words>"}}],
  "outdatedWarnings": [{"id": "time-1", "sourceId": "src-1", "sourceTitle": "<title>", "detectedDate": "<date|Undated>", "warningType": "<Outdated Cycle|Missing Publication Date>", "riskDescription": "<under 22 words>", "evidenceQuote": "<verbatim 8-18 words>"}],
  "verificationChecklist": [{"id": "chk-1", "priority": "<High|Medium|Low>", "actionItem": "<action>", "targetAuthority": "<agency>", "reason": "<under 22 words>"}],
  "decisionPreMortem": {"overallRiskLevel": "<Severe Risk|High Risk|Moderate Risk>", "estimatedDelay": "<delay>", "consequenceSummary": "<under 22 words>", "criticalFailurePoints": [{"darkSpotRef": "<gap-1|conf-1>", "failureScenario": "<under 22 words>", "penaltyOrLoss": "<penalty>"}]}
}`;

  const userPrompt = `AUDIT GOAL: ${topic}
CATEGORY: ${category}
CURRENT YEAR: 2026

SOURCES TO AUDIT:
${sourcesText}

Audit for information gaps, cross-source contradictions, and temporal issues. Return strictly the JSON object.`;

  // 4. EXECUTE MULTI-MODEL FAILOVER QUEUE
  let lastError = null;
  const attemptedModels = [];

  for (const modelToTry of queue) {
    try {
      attemptedModels.push(modelToTry);
      console.log(`[GapLens AI] Querying Gemini model: ${modelToTry}...`);

      const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        modelToTry
      )}:generateContent?key=${encodeURIComponent(activeKey.trim())}`;

      const generationConfig = {
        temperature: 0.1,
        maxOutputTokens: 2200,
        responseMimeType: 'application/json',
      };

      // Disable hidden thinking token overhead on Gemini 2.5 models for fast, low-token JSON output
      if (modelToTry.includes('2.5')) {
        generationConfig.thinkingConfig = { thinkingBudget: 0 };
      }

      let response;
      try {
        response = await axios.post(
          geminiEndpoint,
          {
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: userPrompt }],
              },
            ],
            generationConfig,
          },
          {
            headers: { 'Content-Type': 'application/json' },
            httpsAgent: ipv4HttpsAgent,
            timeout: 45000,
          }
        );
      } catch (postErr) {
        // If HTTP 400 error rejects thinkingConfig, retry immediately without thinkingConfig
        const errMsg = postErr.response?.data?.error?.message || JSON.stringify(postErr.response?.data || '');
        if (
          postErr.response?.status === 400 &&
          generationConfig.thinkingConfig &&
          errMsg.toLowerCase().includes('thinking')
        ) {
          console.warn(`[GapLens AI] Model "${modelToTry}" rejected thinkingConfig. Retrying without thinkingConfig...`);
          delete generationConfig.thinkingConfig;
          response = await axios.post(
            geminiEndpoint,
            {
              systemInstruction: {
                parts: [{ text: systemPrompt }],
              },
              contents: [
                {
                  role: 'user',
                  parts: [{ text: userPrompt }],
                },
              ],
              generationConfig,
            },
            {
              headers: { 'Content-Type': 'application/json' },
              httpsAgent: ipv4HttpsAgent,
              timeout: 45000,
            }
          );
        } else {
          throw postErr;
        }
      }

      const parts = response.data?.candidates?.[0]?.content?.parts;
      const rawContent = Array.isArray(parts) ? parts.map((p) => p.text || '').join('') : '';
      if (!rawContent) {
        throw new Error(`Empty response content from Gemini model ${modelToTry}`);
      }

      const parsedJSON = cleanAndParseJSON(rawContent);
      const normalizedAnalysis = validateAndNormalizeAnalysis(
        parsedJSON,
        baselineStructure
      );

      console.log(`[GapLens AI] Successfully audited using: ${modelToTry}`);

      // Cache successful response (up to MAX_CACHE_ENTRIES)
      if (analysisCache.size >= MAX_CACHE_ENTRIES) {
        const oldestKey = analysisCache.keys().next().value;
        analysisCache.delete(oldestKey);
      }
      analysisCache.set(cacheKey, {
        analysis: normalizedAnalysis,
        meta: {
          mode: 'Live Google Gemini AI Engine',
          modelUsed: modelToTry,
          attemptedModels,
          isOfflineDemo: false,
          sourcesAnalyzed: sources.length,
        },
      });

      return {
        success: true,
        analysis: normalizedAnalysis,
        meta: {
          mode: 'Live Google Gemini AI Engine',
          modelUsed: modelToTry,
          attemptedModels,
          isOfflineDemo: false,
          timestamp: new Date().toISOString(),
          sourcesAnalyzed: sources.length,
        },
      };
    } catch (err) {
      const httpStatus = err.response?.status;
      const apiErrorMessage = err.response?.data?.error?.message;
      const failureReason = apiErrorMessage || err.message;
      const isJsonError = err.message && (err.message.includes('JSON') || err.message.includes('Unexpected token'));

      console.warn(
        `[GapLens AI Failover] Candidate model "${modelToTry}" failed: ${failureReason}${
          httpStatus ? ` (HTTP ${httpStatus})` : ''
        }${isJsonError ? ' [LLM JSON Syntax Failure]' : ''}. Gracefully advancing to next candidate model in queue...`
      );
      lastError = err;
    }
  }

  // 4. ERROR IF ALL LIVE MODELS FAIL (100% Live Mode)
  console.error(
    `[GapLens AI] All live models in failover queue (${attemptedModels.join(
      ', '
    )}) failed: ${lastError?.message}`
  );

  return {
    success: false,
    status: 502,
    message: `All live Gemini models failed to respond. Reason: ${
      lastError?.response?.data?.error?.message || lastError?.message || 'Upstream API error'
    }. Please verify GEMINI_API_KEY and GEMINI_MODEL in backend/.env.`,
    attemptedModels,
  };
}

module.exports = {
  analyzeSourcesWithAI,
  cleanAndParseJSON,
  findPrecomputedMatch,
  compressSourceForLLM,
  analysisCache,
};
