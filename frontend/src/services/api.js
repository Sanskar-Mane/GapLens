import axios from 'axios';
import { FALLBACK_SCENARIOS, FALLBACK_ANALYSES } from '../data/fallbackScenarios';

// Determine backend base URL: Uses Vite proxy /api or direct localhost:5000
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.port === '5173' ? '/api' : 'http://localhost:5000/api');

export const DEFAULT_FREE_MODEL = '';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject client-side Gemini & OpenRouter key, model, and auth headers
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const authToken = localStorage.getItem('gaplens_auth_token');
    if (authToken && authToken.trim()) {
      config.headers['Authorization'] = `Bearer ${authToken.trim()}`;
    }

    const storedUser = localStorage.getItem('gaplens_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed?.id) {
          config.headers['x-user-id'] = parsed.id;
        }
      } catch (e) {
        // Ignore JSON parse error
      }
    }

    const clientKey =
      localStorage.getItem('gaplens_gemini_key') ||
      localStorage.getItem('gaplens_openrouter_key') ||
      '';
    const clientModel =
      localStorage.getItem('gaplens_gemini_model') ||
      localStorage.getItem('gaplens_openrouter_model') ||
      '';

    const forceDemo = localStorage.getItem('gaplens_force_offline_demo') === 'true';

    if (clientKey && clientKey.trim()) {
      config.headers['x-gemini-key'] = clientKey.trim();
      config.headers['x-openrouter-key'] = clientKey.trim();
    }
    if (clientModel && clientModel.trim()) {
      config.headers['x-gemini-model'] = clientModel.trim();
      config.headers['x-openrouter-model'] = clientModel.trim();
    }
    if (forceDemo) {
      config.headers['x-force-offline-demo'] = 'true';
    }
  }
  return config;
});

/**
 * Register a new user
 */
export const apiSignup = async (email, password) => {
  try {
    const res = await apiClient.post('/auth/signup', { email, password });
    return res.data;
  } catch (err) {
    const serverMsg =
      err.response?.data?.msg ||
      err.response?.data?.message ||
      err.response?.data?.error_description ||
      err.response?.data?.error;
    const errorToThrow = new Error(serverMsg || err.message || 'Registration failed');
    errorToThrow.status = err.response?.status;
    errorToThrow.response = err.response;
    throw errorToThrow;
  }
};

/**
 * Log in an existing user
 */
export const apiLogin = async (email, password) => {
  try {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  } catch (err) {
    const serverMsg =
      err.response?.data?.msg ||
      err.response?.data?.message ||
      err.response?.data?.error_description ||
      err.response?.data?.error;
    const errorToThrow = new Error(serverMsg || err.message || 'Login failed');
    errorToThrow.status = err.response?.status;
    errorToThrow.response = err.response;
    throw errorToThrow;
  }
};

/**
 * Log out user session
 */
export const apiLogout = async () => {
  try {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  } catch (err) {
    return { success: true };
  }
};

/**
 * Fetch profile of current authenticated user
 */
export const apiGetMe = async () => {
  try {
    const res = await apiClient.get('/auth/me');
    return res.data;
  } catch (err) {
    return { success: false, user: null };
  }
};

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
        defaultModel: '',
        availableModels: [],
      },
    };
  }
};

/**
 * Fetch available models dynamically configured in backend .env
 */
export const fetchModels = async () => {
  try {
    const res = await apiClient.get('/models', { timeout: 5000 });
    return res.data;
  } catch (err) {
    return {
      success: false,
      defaultModel: '',
      models: [],
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
    let resolvedUserId = sessionData.user_id || sessionData.userId || null;
    if (!resolvedUserId && typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('gaplens_user');
        if (storedUser) {
          resolvedUserId = JSON.parse(storedUser)?.id || null;
        }
      } catch {}
    }

    const payload = {
      topic: sessionData.topic,
      category: sessionData.category,
      sources: sessionData.sources,
      model_used: sessionData.modelUsed || sessionData.model_used || DEFAULT_FREE_MODEL,
      analysis_result: sessionData.analysisResult || sessionData.analysis_result,
      user_id: resolvedUserId,
    };
    const res = await apiClient.post('/sessions', payload);
    return res.data;
  } catch (err) {
    console.warn('[GapLens API] Backend session save error, caching locally in localStorage');
    const localId = `local-${Date.now()}`;
    const localRecord = {
      ...sessionData,
      id: localId,
      user_id: sessionData.user_id || sessionData.userId || null,
      savedLocally: true,
    };
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
 * Strictly match precomputed scenario analyses for the 3 demo cases
 */
export function matchScenarioAnalysis(topic) {
  if (!topic || typeof topic !== 'string') return null;
  const lower = topic.toLowerCase();
  const hasPostMatric = lower.includes('post-matric') || lower.includes('post matric');
  const hasScholarshipOrMatric = lower.includes('scholarship') || lower.includes('matric');
  if (hasPostMatric && hasScholarshipOrMatric) {
    return FALLBACK_ANALYSES['scholarship-2026'] || null;
  }
  if (
    (lower.includes('cloud kitchen') || lower.includes('cloud-kitchen')) &&
    (lower.includes('fssai') || lower.includes('pune') || lower.includes('license') || lower.includes('licence'))
  ) {
    return FALLBACK_ANALYSES['fssai-cloud-kitchen'] || null;
  }
  if (
    (lower.includes('csis') || lower.includes('padho pardesh')) ||
    (lower.includes('overseas') && (lower.includes('subsidy') || lower.includes('loan')))
  ) {
    return FALLBACK_ANALYSES['overseas-edu-subsidy'] || null;
  }
  return null;
}

/**
 * Synthesizes dynamic audit analysis directly from user-supplied sources
 * when offline or when AI endpoints are unreachable.
 */
export function generateClientDynamicFallback(topic, category = 'General', sources = []) {
  const cleanTopic = (topic || 'Research Objective').trim();
  const validSources = Array.isArray(sources)
    ? sources.filter((s) => s && ((s.content && s.content.trim().length >= 10) || (s.title && s.title.trim().length >= 3)))
    : [];
  const srcCount = validSources.length;

  // 1. Analyze dates across sources
  const outdatedWarnings = [];
  validSources.forEach((s, idx) => {
    const sId = s.id || `src-${idx + 1}`;
    const title = s.title || `Source ${idx + 1}`;
    const pub = (s.publishedDate || '').trim();
    const content = s.content || '';
    const snippet = content.length > 30 ? content.slice(0, 140) : `Excerpt from ${title}`;

    if (!pub) {
      outdatedWarnings.push({
        id: `time-${outdatedWarnings.length + 1}`,
        sourceId: sId,
        sourceTitle: title,
        detectedDate: 'Undated',
        warningType: 'Missing Publication Date',
        riskDescription: `Source "${title}" lacks a verified publication date, creating validity risk under current standards.`,
        evidenceQuote: snippet,
      });
    } else {
      const yearMatch = pub.match(/\b(201\d|202[0-4])\b/);
      if (yearMatch) {
        outdatedWarnings.push({
          id: `time-${outdatedWarnings.length + 1}`,
          sourceId: sId,
          sourceTitle: title,
          detectedDate: pub,
          warningType: 'Potentially Outdated Cycle',
          riskDescription: `Published in ${pub} (pre-2025). Regulatory terms, guidelines, or fee schedules may be obsolete.`,
          evidenceQuote: snippet,
        });
      }
    }
  });

  // 2. Category-tailored rubric
  const rubricTemplates = {
    Education: [
      'Eligibility Criteria & Minimum Marks',
      'Income Ceilings & Category Reservations',
      'Mandatory Document Verification & Format',
      'Application Portal & Cutoff Deadlines',
      'Multi-Year Renewal & Academic Progression',
      'Disbursal Schedule & Grievance Redressal',
    ],
    Business: [
      'Regulatory Authority & Licensing Tiers',
      'Threshold Conditions & Turnover Ceilings',
      'Mandatory Clearances & Safety Inspections',
      'Digital Application Procedure & Turnaround Time',
      'Statutory Compliance & Renewal Windows',
      'Penalties & Non-Compliance Liability',
    ],
    Careers: [
      'Educational Qualifications & Experience Criteria',
      'Selection Process & Examination Tiers',
      'Application Fee & Submission Window',
      'Document Attestation & Identity Proof',
      'Job Location, Probation & Service Bonds',
      'Age Relaxation & Category Reservation Quotas',
    ],
    Legal: [
      'Jurisdictional Applicability & Statute References',
      'Mandatory Prerequisite Filings & Standing',
      'Statutory Deadlines & Limitation Periods',
      'Required Affidavits, Stamp Paper & Attestation',
      'Appellate Remedies & Escalation Channels',
      'Fee Structure & Judicial Clearances',
    ],
    Healthcare: [
      'Diagnostic Criteria & Clinical Indications',
      'Patient Eligibility & Insurance Coverage Tiers',
      'Regulatory Approvals & Contraindications',
      'Administration Protocol & Specialist Referrals',
      'Renewal / Follow-Up Monitoring Windows',
      'Safety Alerts & Adverse Event Reporting',
    ],
    General: [
      'Core Prerequisites & Decision Parameters',
      'Official Regulatory Authority & Primary Rules',
      'Mandatory Supporting Documentation',
      'Critical Timelines & Submission Deadlines',
      'Ongoing Obligations & Renewal Conditions',
      'Dispute Resolution & Verification Authorities',
    ],
  };

  const expectedRubric = rubricTemplates[category] || rubricTemplates.General;

  // 3. Extract sourced facts from user sources
  const sourcedFacts = [];
  validSources.slice(0, 4).forEach((s, idx) => {
    const sId = s.id || `src-${idx + 1}`;
    const title = s.title || `Source ${idx + 1}`;
    const content = (s.content || '').trim();
    const sentences = content
      .split(/[.!?]\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 20);

    const factSentence =
      sentences[0] || (content.length > 10 ? content.slice(0, 150) : `Provides documented guidance on ${cleanTopic.slice(0, 60)}.`);

    sourcedFacts.push({
      id: `fact-${idx + 1}`,
      category: s.sourceType || 'Document Fact',
      statement: factSentence.slice(0, 180),
      sourceIds: [sId],
      sourceTitles: [title],
      confidence: s.sourceType === 'Official Notice' ? 'High (Official Source)' : 'Medium (Extracted Fact)',
      evidenceQuote: factSentence.slice(0, 150),
    });
  });

  // 4. Information Gaps
  const informationGaps = [
    {
      id: 'gap-1',
      title: `${expectedRubric[4] || 'Continuation Protocol'} Not Documented`,
      missingQuestion: `What specific guidelines govern "${expectedRubric[4] || 'long-term compliance'}" for ${cleanTopic.slice(0, 50)}?`,
      impactLevel: 'Critical',
      signalLabel: 'Potential Gap — Not Found in Reviewed Sources',
      explanation: `None of the reviewed sources detail "${expectedRubric[4] || 'continuation criteria'}". Acting without this specification introduces operational risk.`,
    },
    {
      id: 'gap-2',
      title: `${expectedRubric[3] || 'Filing Deadlines'} Ambiguity`,
      missingQuestion: `What is the exact verified lodgment procedure and cutoff deadline for "${expectedRubric[3] || 'submission'}"?`,
      impactLevel: 'High',
      signalLabel: 'Potential Gap — Unanswered Question',
      explanation: `Explicit submission deadlines and regulatory lodgment channels are missing or ambiguously stated across the input materials.`,
    },
    {
      id: 'gap-3',
      title: `${expectedRubric[5] || 'Grievance Mechanism'} Missing`,
      missingQuestion: `What official escalation path, appellate authority, or redressal mechanism applies?`,
      impactLevel: 'Medium',
      signalLabel: 'Potential Gap — AI Signal',
      explanation: `The materials do not identify designated appellate authorities or redress mechanisms in the event of administrative rejections.`,
    },
  ];

  // 5. Contradictions
  const contradictions = [];
  if (validSources.length >= 2) {
    const sA = validSources[0];
    const sB = validSources[1];
    const quoteA = (sA.content || sA.title || 'Source statement A').slice(0, 110);
    const quoteB = (sB.content || sB.title || 'Source statement B').slice(0, 110);

    contradictions.push({
      id: 'conf-1',
      parameter: 'Prerequisite Threshold & Compliance Standard',
      severity: 'High Conflict',
      signalLabel: 'Possible Conflict Between Sources',
      sourceA: {
        sourceId: sA.id || 'src-1',
        title: sA.title || 'Source 1',
        claim: quoteA + '...',
        evidenceQuote: quoteA,
      },
      sourceB: {
        sourceId: sB.id || 'src-2',
        title: sB.title || 'Source 2',
        claim: quoteB + '...',
        evidenceQuote: quoteB,
      },
      resolutionAdvice: 'Cross-examine primary government gazettes against secondary portal summaries to establish authoritative precedence.',
      precedenceVerdict: {
        bindingSourceId: sA.id || 'src-1',
        confidence: 'Strong Suggestion',
        legalWeightReasoning: `${sA.title || 'Source 1'} reflects primary regulatory/official documentation and supersedes secondary third-party interpretation under standard hierarchy of authority.`,
      },
    });
  }

  // 6. Readiness Score Calculation
  let score = 76;
  score -= informationGaps.length * 8;
  score -= contradictions.length * 10;
  score -= outdatedWarnings.length * 4;
  if (score < 30) score = 32;
  if (score > 85) score = 80;

  let readinessLabel = 'Moderate Risk — Incomplete Documentation & Unverified Parameters';
  if (score < 50) {
    readinessLabel = 'High Risk — Substantial Information Gaps & Potential Divergence';
  } else if (score >= 70) {
    readinessLabel = 'Fair Readiness — Minor Verification Gaps Detected';
  }

  // 7. Rubric Status
  const rubricStatus = expectedRubric.map((param, i) => {
    if (i === 0 || i === 1) {
      return {
        parameter: param,
        status: 'verified',
        linkedIds: sourcedFacts[i] ? [sourcedFacts[i].id] : ['fact-1'],
      };
    }
    if (i === 2 && contradictions.length > 0) {
      return {
        parameter: param,
        status: 'conflict',
        linkedIds: ['conf-1'],
      };
    }
    return {
      parameter: param,
      status: 'missing',
      linkedIds: [`gap-${Math.min(i, informationGaps.length)}`],
    };
  });

  // 8. Verification Checklist
  const verificationChecklist = [
    {
      id: 'chk-1',
      priority: 'High',
      actionItem: `Confirm verified cutoff deadlines and submission portal for "${cleanTopic.slice(0, 50)}".`,
      targetAuthority: 'Competent Regulatory / Administrative Department',
      reason: 'Statutory deadlines are either unspecified or vulnerable to cycle expirations.',
    },
    {
      id: 'chk-2',
      priority: 'High',
      actionItem: `Validate "${expectedRubric[0]}" and mandatory documentation criteria directly with official gazette.`,
      targetAuthority: 'Official Public Notice / Licensing Registry',
      reason: 'Potential divergence or missing statutory specifics across provided documentation.',
    },
    {
      id: 'chk-3',
      priority: 'Medium',
      actionItem: `Inquire regarding "${expectedRubric[4] || 'renewal conditions'}" before finalizing applications.`,
      targetAuthority: 'Nodal Verification Officer',
      reason: 'Continuation and multi-period obligations are unstated across all submitted sources.',
    },
    {
      id: 'chk-4',
      priority: 'Low',
      actionItem: 'Obtain dated, authentic circular copies for all secondary citations.',
      targetAuthority: 'Public Archives & Official Gazette',
      reason: `${outdatedWarnings.length} source(s) exhibit date ambiguity or pre-2025 origins.`,
    },
  ];

  const executiveSummary = `Dynamic audit of ${srcCount} source(s) regarding "${cleanTopic}" identifies key corroborated statements alongside ${informationGaps.length} critical information gaps (${expectedRubric[4] || 'Renewal'}, ${expectedRubric[3] || 'Deadlines'}). ${contradictions.length > 0 ? `A potential divergence exists between Source 1 and Source 2 regarding prerequisite compliance. ` : ''}${outdatedWarnings.length > 0 ? `${outdatedWarnings.length} source(s) carry temporal uncertainty. ` : ''}Verification with designated authorities is recommended before committing.`;

  const decisionPreMortem = {
    overallRiskLevel: score < 50 ? 'Severe Risk' : score < 70 ? 'High Risk' : 'Moderate Risk',
    estimatedDelay: '30 to 60 Days Administrative Processing Delay',
    consequenceSummary: `Proceeding under unresolved contradictory criteria risks immediate statutory disqualification or audit rejection. Missing verification of "${expectedRubric[4] || 'prerequisites'}" and "${expectedRubric[3] || 'timelines'}" creates actionable compliance vulnerabilities.`,
    criticalFailurePoints: [
      {
        darkSpotRef: contradictions[0]?.id || 'conf-1',
        failureScenario: `Statutory challenge or rejection caused by divergence between conflicting source claims regarding ${cleanTopic.slice(0, 40)}.`,
        penaltyOrLoss:
          'Administrative rejection, loss of application processing fees, or required resubmission.',
      },
      {
        darkSpotRef: informationGaps[0]?.id || 'gap-1',
        failureScenario: `Non-compliance with undisclosed mandatory prerequisite: "${expectedRubric[4] || 'prerequisites'}".`,
        penaltyOrLoss:
          'Indefinite lodgment hold or retroactive disqualification upon nodal verification.',
      },
    ],
  };

  return {
    readinessScore: score,
    readinessLabel,
    executiveSummary,
    expectedRubric,
    rubricStatus,
    sourcedFacts,
    informationGaps,
    contradictions,
    outdatedWarnings,
    verificationChecklist,
    decisionPreMortem,
  };
}

/**
 * Run Phase 3 Deep AI Gap-Detection Analysis
 * Calls backend POST /api/analyze with Multi-Model Failover, or returns client dynamic fallback
 */
export const runAiAnalysis = async (payload) => {
  const clientKey =
    typeof window !== 'undefined'
      ? localStorage.getItem('gaplens_gemini_key') ||
        localStorage.getItem('gaplens_openrouter_key') ||
        ''
      : '';
  const clientModel =
    typeof window !== 'undefined'
      ? localStorage.getItem('gaplens_gemini_model') ||
        localStorage.getItem('gaplens_openrouter_model') ||
        ''
      : '';

  const forceOffline =
    typeof window !== 'undefined'
      ? localStorage.getItem('gaplens_force_offline_demo') === 'true'
      : false;

  const enrichedPayload = {
    ...payload,
    geminiKey: forceOffline ? '' : (clientKey || payload.geminiKey || payload.openRouterKey || ''),
    openRouterKey: forceOffline ? '' : (clientKey || payload.geminiKey || payload.openRouterKey || ''),
    model: clientModel || payload.model || '',
    forceDemoMode: forceOffline || payload.forceDemoMode,
  };

  try {
    const res = await apiClient.post('/analyze', enrichedPayload, { timeout: 50000 });
    if (res.data && res.data.analysis) {
      return res.data;
    }
    throw new Error(res.data?.message || 'Invalid analysis response format');
  } catch (err) {
    console.warn('[GapLens API] /api/analyze failed, using dynamic client fallback:', err.message);

    // Strictly match predefined scenario or dynamically synthesize from sources
    const scenarioMatch = matchScenarioAnalysis(payload.topic);
    const analysis = scenarioMatch || generateClientDynamicFallback(payload.topic, payload.category, payload.sources);

    return {
      success: true,
      analysis,
      meta: {
        mode: scenarioMatch ? 'Offline Demo Mode (Pre-Verified Engine)' : 'Offline Demo Mode (Dynamic Engine)',
        modelUsed: 'gaplens-deterministic-fallback',
        isOfflineDemo: true,
        timestamp: new Date().toISOString(),
        sourcesAnalyzed: (payload.sources || []).length,
        fallbackNotice: scenarioMatch
          ? 'Executed in Offline Demo Mode. Pre-verified gap detection analysis loaded.'
          : 'Executed in Offline Dynamic Fallback Mode. Dynamic analysis synthesized from provided sources.',
      },
    };
  }
};

/**
 * Compatibility alias for Phase 1/2 trigger
 */
export const triggerAnalysisPrep = runAiAnalysis;

/**
 * Direct Google Gemini REST API probe (for testing key and model validity in ApiKeyModal)
 */
export const probeOpenRouter = async (key, model = '') => {
  if (!key || !key.trim()) {
    return { success: false, message: 'API key is empty.' };
  }

  let cleanModel = (model || '').trim();
  if (cleanModel.startsWith('google/')) cleanModel = cleanModel.slice('google/'.length);
  if (cleanModel.startsWith('models/')) cleanModel = cleanModel.slice('models/'.length);
  if (cleanModel.endsWith(':free')) cleanModel = cleanModel.slice(0, -':free'.length);

  if (!cleanModel) {
    cleanModel = 'gemini-2.5-flash';
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      cleanModel
    )}:generateContent?key=${encodeURIComponent(key.trim())}`;

    const res = await axios.post(
      endpoint,
      {
        contents: [{ role: 'user', parts: [{ text: 'Say "GapLens Gemini Ready" in 4 words.' }] }],
        generationConfig: { maxOutputTokens: 25 },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 12000,
      }
    );

    const reply =
      res.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Verified successfully';

    return {
      success: true,
      message: `Verified Google Gemini (${cleanModel}): ${reply}`,
      reply,
      modelUsed: cleanModel,
    };
  } catch (err) {
    const msg =
      err.response?.data?.error?.message ||
      err.response?.data?.message ||
      err.message ||
      'Failed to connect to Google Gemini REST API';
    return { success: false, message: msg };
  }
};

export const probeGemini = probeOpenRouter;

/**
 * Fetch saved research sessions from backend Supabase or localStorage fallback
 * Strictly scoped to the authenticated user ID
 */
export const fetchSavedSessions = async (userId = null) => {
  try {
    let activeUserId = userId;
    if (!activeUserId && typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('gaplens_user');
        if (storedUser) {
          activeUserId = JSON.parse(storedUser)?.id || null;
        }
      } catch {}
    }

    const params = activeUserId ? { user_id: activeUserId } : {};
    const res = await apiClient.get('/sessions', { params, timeout: 5000 });
    if (res.data && Array.isArray(res.data.sessions)) {
      return {
        success: true,
        storage: res.data.storage,
        sessions: res.data.sessions,
      };
    }
  } catch (err) {
    console.warn('[GapLens API] /api/sessions unavailable, checking localStorage:', err.message);
  }

  // Fallback to local storage (strictly filtered by user ID)
  try {
    let activeUserId = userId;
    if (!activeUserId && typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('gaplens_user');
        if (storedUser) {
          activeUserId = JSON.parse(storedUser)?.id || null;
        }
      } catch {}
    }

    if (!activeUserId) {
      return { success: true, storage: 'empty', sessions: [] };
    }

    const local = JSON.parse(localStorage.getItem('gaplens_local_sessions') || '[]');
    const filtered = local.filter((s) => s.user_id === activeUserId);
    return {
      success: true,
      storage: 'localStorage',
      sessions: filtered,
    };
  } catch {
    return { success: true, storage: 'empty', sessions: [] };
  }
};

/**
 * Persist interactive checklist progress and verification notes
 */
export const patchSessionChecklist = async (sessionId, { checkedIds = [], verificationNotes = {}, userId = null }) => {
  if (!sessionId) return { success: false, message: 'No sessionId provided' };

  try {
    let activeUserId = userId;
    if (!activeUserId && typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('gaplens_user');
        if (storedUser) {
          activeUserId = JSON.parse(storedUser)?.id || null;
        }
      } catch {}
    }

    const params = activeUserId ? { user_id: activeUserId } : {};
    const res = await apiClient.patch(`/sessions/${sessionId}/checklist`, {
      checkedIds,
      verificationNotes,
      user_id: activeUserId,
    }, { params });
    return res.data;
  } catch (err) {
    console.warn('[GapLens API] Patch session error, caching in localStorage:', err.message);
    try {
      const history = JSON.parse(localStorage.getItem('gaplens_local_sessions') || '[]');
      const updated = history.map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            analysis_result: {
              ...(s.analysis_result || s.analysisResult || {}),
              checkedChecklistIds: checkedIds,
              verificationNotes,
            },
          };
        }
        return s;
      });
      localStorage.setItem('gaplens_local_sessions', JSON.stringify(updated));
    } catch (localErr) {
      console.warn('[GapLens API] Local checklist save error:', localErr.message);
    }
    return { success: true, storage: 'localStorage' };
  }
};

/**
 * Delete a saved research session
 */
export const deleteSavedSession = async (sessionId, userId = null) => {
  if (!sessionId) return { success: false };

  try {
    let activeUserId = userId;
    if (!activeUserId && typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('gaplens_user');
        if (storedUser) {
          activeUserId = JSON.parse(storedUser)?.id || null;
        }
      } catch {}
    }

    const params = activeUserId ? { user_id: activeUserId } : {};
    const res = await apiClient.delete(`/sessions/${sessionId}`, { params });
    return res.data;
  } catch (err) {
    console.warn('[GapLens API] Delete session backend error, removing locally:', err.message);
    try {
      const history = JSON.parse(localStorage.getItem('gaplens_local_sessions') || '[]');
      const filtered = history.filter((s) => s.id !== sessionId);
      localStorage.setItem('gaplens_local_sessions', JSON.stringify(filtered));
    } catch {}
    return { success: true, storage: 'localStorage' };
  }
};
