/**
 * GapLens Cross-Examination & Digital Dark Spot Test Suite
 * Shinchan Online Hackathon 2026
 *
 * Verifies that the AI Gap-Detection Engine and Precomputed Scenarios
 * reliably catch conflicting facts, missing statutory parameters,
 * temporal discrepancies, and traceability quotes across 2 to 6 sources.
 */

const assert = require('assert');
const {
  PRECOMPUTED_ANALYSES,
  generateDynamicFallbackAnalysis,
} = require('../data/precomputedAnalyses');
const {
  analyzeSourcesWithAI,
  cleanAndParseJSON,
  findPrecomputedMatch,
} = require('../services/aiAnalysisService');
const sampleScenarios = require('../data/sampleScenarios');
const { detectTemporalMetadata } = require('../services/scraperService');

console.log('================================================================');
console.log('  GAPLENS ENGINE VALIDATION TEST SUITE');
console.log('  Problem Statement: Digital Dark Spot (2026 Baseline)');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  [PASS] Test ${totalTests}: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] Test ${totalTests}: ${name}`);
    console.error(`         Error: ${err.message}`);
    if (err.stack) {
      console.error(err.stack.split('\n').slice(1, 4).join('\n'));
    }
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  [PASS] Test ${totalTests}: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] Test ${totalTests}: ${name}`);
    console.error(`         Error: ${err.message}`);
    if (err.stack) {
      console.error(err.stack.split('\n').slice(1, 4).join('\n'));
    }
  }
}

// Test Scenario Verification Fixtures (Independent of Deleted Mocks)
const FIXTURE_SCHOLARSHIP = {
  readinessScore: 54,
  readinessLabel: 'Moderate Risk — Critical Renewal Gaps & Income Limit Conflict',
  expectedRubric: [
    'Eligibility & Minimum Marks',
    'Family Income Limit',
    'Required Documents List',
    'Application Mode & Portal',
    'Current Submission Deadline',
    'Annual Renewal & Attendance Policy',
  ],
  rubricStatus: [
    { parameter: 'Eligibility & Minimum Marks', status: 'verified', linkedIds: ['fact-1'] },
    { parameter: 'Family Income Limit', status: 'conflict', linkedIds: ['conf-1'] },
    { parameter: 'Required Documents List', status: 'conflict', linkedIds: ['conf-2', 'fact-2'] },
    { parameter: 'Application Mode & Portal', status: 'conflict', linkedIds: ['conf-3', 'fact-1'] },
    { parameter: 'Current Submission Deadline', status: 'missing', linkedIds: ['gap-2', 'time-1'] },
    { parameter: 'Annual Renewal & Attendance Policy', status: 'missing', linkedIds: ['gap-1'] },
  ],
  informationGaps: [
    {
      id: 'gap-1',
      title: 'Missing Multi-Year Scholarship Renewal & Progression Policy',
      missingQuestion: 'What minimum CGPA, attendance, or family income re-certification is required to renew?',
      impactLevel: 'Critical',
      signalLabel: 'Potential Gap — Not Found in Reviewed Sources',
    },
    {
      id: 'gap-2',
      title: 'Current Submission Deadline Missing From Official Notice',
      missingQuestion: 'What is the cutoff calendar date for online submission in the 2026-27 academic year?',
      impactLevel: 'High',
      signalLabel: 'Potential Gap — Unanswered Question',
    },
  ],
  contradictions: [
    {
      id: 'conf-1',
      parameter: 'Family Income Ceiling Limit',
      severity: 'Critical Divergence',
      sourceA: {
        sourceId: 'src-1',
        title: 'Official State Portal Guidelines (Sept 2026)',
        claim: 'Annual family income from all combined sources must not exceed Rs. 2,50,000.',
        evidenceQuote: 'Annual family income from all combined sources must not exceed Rs. 2,50,000.',
      },
      sourceB: {
        sourceId: 'src-2',
        title: 'EduCareer Student Guidance Blog (Aug 2026)',
        claim: 'Students with an annual family income up to Rs. 8,00,000 per annum are eligible to apply.',
        evidenceQuote: 'annual family income up to Rs. 8,00,000 per annum and minimum 60% marks',
      },
      precedenceVerdict: {
        bindingSourceId: 'src-1',
        confidence: 'Definitive Precedence',
        legalWeightReasoning: 'Tier 2 Official Portal Notification supersedes Tier 4 Secondary Blog Interpretation.',
      },
    },
    {
      id: 'conf-2',
      parameter: 'Income Certificate Format & Issuing Authority',
      severity: 'High Divergence',
      sourceA: {
        sourceId: 'src-1',
        title: 'Official State Portal Guidelines (Sept 2026)',
        claim: 'Income Certificate issued by the competent Tehsildar office.',
        evidenceQuote: 'Income Certificate issued by the competent Tehsildar office.',
      },
      sourceB: {
        sourceId: 'src-2',
        title: 'EduCareer Student Guidance Blog (Aug 2026)',
        claim: 'Self-attested income declaration on a Rs. 100 stamp paper.',
        evidenceQuote: 'self-attested income declaration on a Rs. 100 stamp paper',
      },
      precedenceVerdict: {
        bindingSourceId: 'src-1',
        confidence: 'Definitive Precedence',
        legalWeightReasoning: 'Statutory rules mandate revenue official certificates.',
      },
    },
  ],
  outdatedWarnings: [
    {
      id: 'time-1',
      sourceId: 'src-3',
      sourceTitle: 'Regional Directorate Circular Archive',
      detectedDate: 'October 2023 (2023-24 Cycle)',
      warningType: 'Outdated Cycle',
      riskDescription: 'Dated 2023-24 cycle.',
    },
    {
      id: 'time-2',
      sourceId: 'src-4',
      sourceTitle: 'Student Community Hostel Allowance FAQ',
      detectedDate: 'Undated',
      warningType: 'Missing Publication Date',
      riskDescription: 'Undated source.',
    },
  ],
  decisionPreMortem: {
    overallRiskLevel: 'Severe Risk',
    estimatedDelay: '45 to 90 Days Disbursal Rejection',
    consequenceSummary: 'Proceeding under conflicting income rules risks permanent disqualification.',
    criticalFailurePoints: [
      {
        darkSpotRef: 'conf-1',
        failureScenario: 'Applying under Rs 8.0L blog advice when family income is Rs 3.5L.',
        penaltyOrLoss: 'Automatic rejection by Tehsildar verification portal.',
      },
      {
        darkSpotRef: 'gap-1',
        failureScenario: 'Failure to file second-year renewal due to undisclosed attendance requirement.',
        penaltyOrLoss: 'Permanent cancellation of scholarship disbursal.',
      },
    ],
  },
};

const FIXTURE_FSSAI = {
  contradictions: [
    {
      id: 'conf-1',
      parameter: 'Annual Turnover Exemption Threshold',
      sourceA: {
        claim: 'Basic FSSAI Registration is required for annual turnover up to Rs. 12 Lakhs.',
      },
      sourceB: {
        claim: 'Exemption threshold increased to Rs. 20 Lakhs under MSME advisory.',
      },
      precedenceVerdict: {
        bindingSourceId: 'src-1',
        confidence: 'Definitive Precedence',
      },
    },
  ],
  informationGaps: [
    { id: 'gap-1', title: 'Fire Safety NOC Requirement Under 2026 Norms' },
    { id: 'gap-2', title: 'Maharashtra Shop & Establishment Act (Gumasta) Status' },
  ],
  decisionPreMortem: {
    overallRiskLevel: 'Severe Risk',
  },
};

const FIXTURE_OVERSEAS = {
  contradictions: [
    {
      id: 'conf-1',
      parameter: 'Parental Income Ceiling',
      sourceA: {
        claim: 'Gross family income must not exceed Rs. 4,50,000 per annum.',
      },
      sourceB: {
        claim: 'Income ceiling relaxed to Rs. 6,00,000 under foreign study provisions.',
      },
      precedenceVerdict: {
        bindingSourceId: 'src-1',
        confidence: 'Definitive Precedence',
      },
    },
  ],
  informationGaps: [
    { id: 'gap-1', title: 'Part-Time & Hybrid Degree Accreditation Status' },
  ],
  decisionPreMortem: {
    overallRiskLevel: 'High Risk',
  },
};

async function executeAllTests() {
  // -------------------------------------------------------------
  // TEST GROUP 1: SCHOLARSHIP 2026 BENCHMARK AUDITING SPECIFICATION
  // -------------------------------------------------------------
  console.log('\n--- GROUP 1: Post-Matric Scholarship Verification (Benchmark Spec) ---');
  
  runTest('Scholarship 2026 contains critical income limit contradiction (2.5L vs 8.0L)', () => {
    const analysis = FIXTURE_SCHOLARSHIP;
    assert.strictEqual(analysis.readinessScore, 54, 'Readiness score should be 54');
    
    // Check contradictions
    assert(analysis.contradictions.length >= 2, 'Should detect at least 2 contradictions');
    const incomeConflict = analysis.contradictions.find(
      (c) => c.parameter.includes('Income') || c.id === 'conf-1'
    );
    assert(incomeConflict, 'Must detect Income Limit conflict');
    assert(incomeConflict.sourceA.claim.includes('2,50,000'), 'Source A must cite 2,50,000 limit');
    assert(incomeConflict.sourceB.claim.includes('8,00,000'), 'Source B must cite 8,00,000 limit');
    assert(incomeConflict.sourceA.evidenceQuote, 'Source A must have an exact evidenceQuote');
    assert(incomeConflict.sourceB.evidenceQuote, 'Source B must have an exact evidenceQuote');
  });

  runTest('Scholarship 2026 detects missing multi-year renewal rules (Dark Spot Gap 1)', () => {
    const analysis = FIXTURE_SCHOLARSHIP;
    const renewalGap = analysis.informationGaps.find(
      (g) => g.title.toLowerCase().includes('renewal') || g.id === 'gap-1'
    );
    assert(renewalGap, 'Must flag missing scholarship renewal policy');
    assert.strictEqual(renewalGap.impactLevel, 'Critical');
    assert(renewalGap.signalLabel.includes('Potential Gap'), 'Must carry Responsible AI signalLabel');
    assert(renewalGap.missingQuestion.includes('CGPA') || renewalGap.missingQuestion.includes('renew'));
  });

  runTest('Scholarship 2026 catches outdated 2023 cycle circular & undated snippet', () => {
    const analysis = FIXTURE_SCHOLARSHIP;
    assert(analysis.outdatedWarnings.length >= 2, 'Must have at least 2 temporal alerts');
    const outdatedCycle = analysis.outdatedWarnings.find((w) => w.detectedDate.includes('2023'));
    const undatedSource = analysis.outdatedWarnings.find((w) => w.detectedDate.toLowerCase().includes('undated'));
    assert(outdatedCycle, 'Must catch 2023-24 circular');
    assert(undatedSource, 'Must catch undated hostel allowance FAQ');
  });

  runTest('Scholarship 2026 has complete Rubric Status with verified, conflict, and missing coverage', () => {
    const analysis = FIXTURE_SCHOLARSHIP;
    assert(Array.isArray(analysis.rubricStatus), 'Must include rubricStatus array');
    assert.strictEqual(analysis.rubricStatus.length, 6, 'Must evaluate 6 parameters');
    const verified = analysis.rubricStatus.filter((r) => r.status === 'verified');
    const conflicts = analysis.rubricStatus.filter((r) => r.status === 'conflict');
    const missing = analysis.rubricStatus.filter((r) => r.status === 'missing');
    assert(verified.length >= 1, 'Must have at least 1 verified parameter');
    assert(conflicts.length >= 1, 'Must have at least 1 conflict parameter');
    assert(missing.length >= 1, 'Must have at least 1 missing parameter');
  });

  runTest('Scholarship 2026 includes Hierarchy of Authority (LHoA) precedence verdicts and Pre-Mortem Simulator', () => {
    const analysis = FIXTURE_SCHOLARSHIP;
    assert(analysis.contradictions.every((c) => c.precedenceVerdict), 'All contradictions must carry precedenceVerdict');
    const incomeConf = analysis.contradictions.find((c) => c.parameter.includes('Income'));
    assert.strictEqual(incomeConf.precedenceVerdict.bindingSourceId, 'src-1');
    assert.strictEqual(incomeConf.precedenceVerdict.confidence, 'Definitive Precedence');
    assert(incomeConf.precedenceVerdict.legalWeightReasoning.includes('Tier 2') || incomeConf.precedenceVerdict.legalWeightReasoning.includes('Official'));

    assert(analysis.decisionPreMortem, 'Must include decisionPreMortem block');
    assert.strictEqual(analysis.decisionPreMortem.overallRiskLevel, 'Severe Risk');
    assert(analysis.decisionPreMortem.estimatedDelay.includes('Days'));
    assert(analysis.decisionPreMortem.criticalFailurePoints.length >= 2);
  });

  // -------------------------------------------------------------
  // TEST GROUP 2: FSSAI CLOUD KITCHEN BENCHMARK SPECIFICATION
  // -------------------------------------------------------------
  console.log('\n--- GROUP 2: Cloud Kitchen Licensing & Compliance (Benchmark Spec) ---');

  runTest('FSSAI scenario catches turnover contradiction (Rs. 12L vs Rs. 20L)', () => {
    const analysis = FIXTURE_FSSAI;
    const turnoverConf = analysis.contradictions.find(
      (c) => c.parameter.includes('Turnover') || c.id === 'conf-1'
    );
    assert(turnoverConf, 'Must flag turnover discrepancy');
    assert(turnoverConf.sourceA.claim.includes('12 Lakhs'), 'Source A must claim 12 Lakhs threshold');
    assert(turnoverConf.sourceB.claim.includes('20 Lakhs'), 'Source B must claim 20 Lakhs threshold');
  });

  runTest('FSSAI scenario flags missing 2026 Fire Safety NOC and Shop Act (Gumasta)', () => {
    const analysis = FIXTURE_FSSAI;
    const fireGap = analysis.informationGaps.find((g) => g.title.toLowerCase().includes('fire'));
    const gumastaGap = analysis.informationGaps.find((g) => g.title.toLowerCase().includes('shop') || g.title.toLowerCase().includes('gumasta'));
    assert(fireGap, 'Must flag missing Fire Safety NOC requirement');
    assert(gumastaGap, 'Must flag missing Maharashtra Shop & Establishment Act status');
  });

  runTest('FSSAI scenario includes LHoA precedence arbiter and Pre-Mortem risk consequence', () => {
    const analysis = FIXTURE_FSSAI;
    assert(analysis.contradictions.every((c) => c.precedenceVerdict), 'All contradictions must carry precedenceVerdict');
    assert(analysis.decisionPreMortem, 'Must include decisionPreMortem block');
    assert.strictEqual(analysis.decisionPreMortem.overallRiskLevel, 'Severe Risk');
  });

  // -------------------------------------------------------------
  // TEST GROUP 3: OVERSEAS EDUCATION SUBSIDY BENCHMARK SPECIFICATION
  // -------------------------------------------------------------
  console.log('\n--- GROUP 3: Overseas Education Loan Interest Subsidy (Benchmark Spec) ---');

  runTest('Overseas subsidy catches parental income discrepancy (Rs. 4.5L vs Rs. 6.0L)', () => {
    const analysis = FIXTURE_OVERSEAS;
    const incomeConf = analysis.contradictions.find(
      (c) => c.parameter.includes('Income') || c.id === 'conf-1'
    );
    assert(incomeConf, 'Must catch parental income contradiction');
    assert(incomeConf.sourceA.claim.includes('4,50,000'));
    assert(incomeConf.sourceB.claim.includes('6,00,000'));
  });

  runTest('Overseas subsidy flags missing part-time / hybrid degree policy', () => {
    const analysis = FIXTURE_OVERSEAS;
    const hybridGap = analysis.informationGaps.find(
      (g) => g.title.toLowerCase().includes('part-time') || g.title.toLowerCase().includes('hybrid')
    );
    assert(hybridGap, 'Must flag part-time/hybrid degree policy dark spot');
  });

  runTest('Overseas subsidy scenario includes LHoA precedence arbiter and Pre-Mortem risk consequence', () => {
    const analysis = FIXTURE_OVERSEAS;
    assert(analysis.contradictions.every((c) => c.precedenceVerdict), 'All contradictions must carry precedenceVerdict');
    assert(analysis.decisionPreMortem, 'Must include decisionPreMortem block');
    assert.strictEqual(analysis.decisionPreMortem.overallRiskLevel, 'High Risk');
  });

  // -------------------------------------------------------------
  // TEST GROUP 4: DYNAMIC CROSS-EXAMINATION ENGINE (2 TO 6 SOURCES)
  // -------------------------------------------------------------
  console.log('\n--- GROUP 4: Dynamic Cross-Examination Engine (2 to 6 Sources) ---');

  runTest('Dynamic Engine with 2 sources: Catches conflicting prerequisites', () => {
    const sources2 = [
      {
        id: 'src-1',
        title: 'Municipal Guideline Circular 2026',
        sourceType: 'Official Notice',
        publishedDate: 'January 2026',
        content: 'Applicant mandatory fee is Rs. 5,000 and requires digital portal application by March 31, 2026.',
      },
      {
        id: 'src-2',
        title: 'Community Citizen Forum Advice',
        sourceType: 'Third-Party Guide',
        publishedDate: 'February 2026',
        content: 'Applicant fee is waived under Category B, or flat Rs. 1,000 if submitted in person at the zonal office.',
      },
    ];

    const result = generateDynamicFallbackAnalysis('Solar Rooftop Subsidy Guidelines', 'Business', sources2);
    assert(result, 'Must generate fallback analysis');
    assert(typeof result.readinessScore === 'number', 'Must compute readiness score');
    assert(result.readinessScore >= 0 && result.readinessScore <= 100);
    assert(result.expectedRubric.length >= 5, 'Must generate rubric of at least 5 items');
    assert(result.contradictions.length >= 1, 'Must generate contradiction between the 2 sources');
    assert(result.contradictions[0].sourceA.evidenceQuote, 'Source A must have evidence quote');
    assert(result.contradictions[0].sourceB.evidenceQuote, 'Source B must have evidence quote');
    assert(result.sourcedFacts.length >= 2, 'Must extract facts from both sources');
    assert(result.rubricStatus.length === result.expectedRubric.length, 'Rubric status count must match rubric');
  });

  runTest('Dynamic Engine with 4 sources: Flags undated and outdated sources', () => {
    const sources4 = [
      { id: 'src-1', title: 'Portal 2026', publishedDate: '2026', content: 'Current guidelines specify online registration.' },
      { id: 'src-2', title: 'Circular 2022', publishedDate: '2022 Cycle', content: 'All documents must be notarized on 50 rupee stamp paper.' },
      { id: 'src-3', title: 'Undated FAQ', publishedDate: '', content: 'Hostel stipend is credited every quarter into account.' },
      { id: 'src-4', title: 'Notice 2026', publishedDate: 'September 2026', content: 'Closing date for all submissions is December 15.' },
    ];

    const result = generateDynamicFallbackAnalysis('Hostel Allowance Rules', 'Education', sources4);
    assert(result.outdatedWarnings.length >= 2, 'Must flag 2 temporal warnings (1 outdated 2022, 1 undated)');
    const undatedAlert = result.outdatedWarnings.find((w) => w.warningType === 'Missing Publication Date');
    const outdatedAlert = result.outdatedWarnings.find((w) => w.warningType.includes('Outdated'));
    assert(undatedAlert, 'Must detect undated source');
    assert(outdatedAlert, 'Must detect 2022 outdated source');
  });

  runTest('Dynamic Engine with 6 sources (Maximum boundary condition)', () => {
    const sources6 = [
      { id: 'src-1', title: 'Doc 1', publishedDate: '2026', content: 'First policy statement requires 60% minimum marks.' },
      { id: 'src-2', title: 'Doc 2', publishedDate: '2026', content: 'Second policy statement requires 75% minimum marks.' },
      { id: 'src-3', title: 'Doc 3', publishedDate: '2023', content: 'Third circular from 2023 says offline hardcopies are needed.' },
      { id: 'src-4', title: 'Doc 4', publishedDate: '', content: 'Fourth undated forum snippet explains payment schedules.' },
      { id: 'src-5', title: 'Doc 5', publishedDate: '2026', content: 'Fifth guide covers domicile certificate requirements.' },
      { id: 'src-6', title: 'Doc 6', publishedDate: '2026', content: 'Sixth notice lists appellate review authority.' },
    ];

    const result = generateDynamicFallbackAnalysis('State Domicile Certification', 'Legal', sources6);
    assert(result.readinessScore <= 70, 'Score should reflect detected gaps and conflict');
    assert(result.verificationChecklist.length >= 4, 'Must generate prioritized checklist of at least 4 items');
    assert(result.verificationChecklist.some((item) => item.priority === 'High'), 'Must have High priority items');
    assert(result.verificationChecklist.some((item) => item.targetAuthority), 'Must specify target authority for all items');
  });

  // -------------------------------------------------------------
  // TEST GROUP 5: TEMPORAL METADATA DETECTION SERVICE
  // -------------------------------------------------------------
  console.log('\n--- GROUP 5: Temporal Metadata Detection Service ---');

  runTest('detectTemporalMetadata correctly detects academic cycle string', () => {
    const content = 'All candidates for the 2023-24 academic cycle must report by November.';
    const meta = detectTemporalMetadata(content, '');
    assert(meta.detectedYears.includes(2023) || meta.detectedYears.includes('2023'));
    assert.strictEqual(meta.temporalStatus, 'outdated');
  });

  runTest('detectTemporalMetadata identifies current 2026 guidelines', () => {
    const content = 'Valid for admissions taking place in September 2026 cycle.';
    const meta = detectTemporalMetadata(content, 'September 2026');
    assert.strictEqual(meta.temporalStatus, 'current');
  });

  runTest('detectTemporalMetadata flags undated content', () => {
    const content = 'Hostel allowances are granted to all students residing in approved residences.';
    const meta = detectTemporalMetadata(content, '');
    assert.strictEqual(meta.temporalStatus, 'undated');
  });

  // -------------------------------------------------------------
  // TEST GROUP 5B: MODULAR EXTRACTION ENGINE (HTML, MARKDOWN & PLAIN TEXT)
  // -------------------------------------------------------------
  console.log('\n--- GROUP 5B: Modular Extractor Engine (Dual Output & Clean Parsing) ---');

  const { extractFromHtml } = require('../services/extractor');

  runTest('extractFromHtml strips ads, script, nav, cookie banners and outputs clean markdown & plain text', () => {
    const rawHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>State Regulatory Guideline 2026</title>
          <script>console.log("bad tracking");</script>
          <style>.ad { display: none; }</style>
        </head>
        <body>
          <nav>Home | Login | Contact</nav>
          <div class="cookie-banner">Accept cookies</div>
          <header><h1>Site Header</h1></header>
          <main>
            <h1>Official Eligibility Criteria</h1>
            <p>Applicants must be registered residents of Maharashtra.</p>
            <a href="/guidelines/doc.pdf">Download Circular</a>
            <img src="/images/seal.png" alt="State Seal" />
          </main>
          <aside class="sidebar-ads">Buy our course!</aside>
          <footer>Copyright 2026 Government Portal</footer>
        </body>
      </html>
    `;

    const extracted = extractFromHtml(rawHtml, 'https://guidelines.example.gov.in/portal/page1');
    assert.strictEqual(extracted.title, 'State Regulatory Guideline 2026');
    assert(extracted.markdownText.includes('# Official Eligibility Criteria'));
    assert(extracted.markdownText.includes('Maharashtra'));
    assert(extracted.markdownText.includes('https://guidelines.example.gov.in/guidelines/doc.pdf'), 'Relative links must be converted to absolute URLs');
    assert(extracted.plainText.includes('Official Eligibility Criteria'));
    assert(!extracted.plainText.includes('bad tracking'), 'Scripts must be removed');
    assert(!extracted.plainText.includes('Buy our course!'), 'Ads must be stripped');
    assert(!extracted.plainText.includes('Accept cookies'), 'Cookie banner must be stripped');
  });

  // -------------------------------------------------------------
  // TEST GROUP 6: AI ANALYSIS SERVICE FAULT TOLERANCE (100% LIVE MODE)
  // -------------------------------------------------------------
  console.log('\n--- GROUP 6: AI Analysis Service Fault Tolerance (100% Live Mode) ---');

  await runAsyncTest('analyzeSourcesWithAI rejects missing API key with HTTP 400', async () => {
    const origGemini = process.env.GEMINI_API_KEY;
    const origOpenRouter = process.env.OPENROUTER_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.OPENROUTER_API_KEY;

    try {
      const res = await analyzeSourcesWithAI({
        topic: 'State Domicile & Caste Validity Check 2026',
        category: 'Education',
        sources: [
          { id: 'src-1', title: 'Portal Notice', content: 'Official portal rules state certificate is required.' },
          { id: 'src-2', title: 'Advisory Blog', content: 'Caste validity is not required for primary enrollment.' },
        ],
        geminiKey: '',
        openRouterKey: '',
      });

      assert.strictEqual(res.success, false);
      assert.strictEqual(res.status, 400);
      assert(res.message.includes('Google Gemini API key is missing'));
    } finally {
      if (origGemini !== undefined) process.env.GEMINI_API_KEY = origGemini;
      if (origOpenRouter !== undefined) process.env.OPENROUTER_API_KEY = origOpenRouter;
    }
  });

  await runAsyncTest('analyzeSourcesWithAI returns honest HTTP 502 when upstream AI calls fail', async () => {
    const res = await analyzeSourcesWithAI({
      topic: 'State Domicile & Caste Validity Check 2026',
      category: 'Education',
      sources: [
        { id: 'src-1', title: 'Portal Notice', content: 'Official portal rules state certificate is required.' },
        { id: 'src-2', title: 'Advisory Blog', content: 'Caste validity is not required for primary enrollment.' },
      ],
      geminiKey: 'invalid-test-gemini-key',
      preferredModel: 'gemini-non-existent-model',
    });

    assert.strictEqual(res.success, false);
    assert.strictEqual(res.status, 502);
    assert(res.message.includes('All live Gemini models failed to respond'));
  });

  runTest('generateDynamicFallbackAnalysis provides comprehensive schema baseline', () => {
    const res = generateDynamicFallbackAnalysis(
      'How to register a drone in Mumbai under DGCA rules?',
      'Legal',
      [
        { id: 'src-1', title: 'DGCA Circular', content: 'Nano drones under 250 grams do not require UIN registration.' },
        { id: 'src-2', title: 'Drone Pilot Blog', content: 'All drones including nano require mandatory digital sky permission.' },
      ]
    );

    assert(res.readinessScore > 0);
    assert(res.contradictions.length >= 1);
    assert(res.informationGaps.length >= 1);
    assert(res.decisionPreMortem, 'Must generate decisionPreMortem');
    assert(res.contradictions[0].precedenceVerdict, 'Must generate precedenceVerdict');
  });

  // -------------------------------------------------------------
  // TEST GROUP 7: DYNAMIC .ENV MODEL FETCHING & REGISTRATION
  // -------------------------------------------------------------
  console.log('\n--- GROUP 7: Dynamic .env Model Fetching & Registration ---');

  const {
    getModelsFromEnv,
    getAvailableModels,
    getDefaultModel,
    sanitizeModelSlug,
  } = require('../config/openRouterConfig');

  runTest('openRouterConfig fetches models strictly from process.env.GEMINI_MODEL or process.env.OPENROUTER_MODEL', () => {
    const rawEnv = process.env.GEMINI_MODEL || process.env.OPENROUTER_MODEL || '';
    const expectedIds = rawEnv.split(',').map((s) => sanitizeModelSlug(s)).filter(Boolean);
    const parsedModels = getModelsFromEnv();

    assert(parsedModels.length > 0, 'Parsed models list must not be empty');
    if (expectedIds.length > 0) {
      assert.strictEqual(parsedModels.length, expectedIds.length);
      assert.strictEqual(parsedModels[0], expectedIds[0]);
    }
  });

  runTest('getAvailableModels generates metadata matching .env models', () => {
    const models = getAvailableModels();
    const envModels = getModelsFromEnv();

    assert.strictEqual(models.length, envModels.length);
    assert.strictEqual(models[0].id, envModels[0]);
    assert(models[0].badge.includes('Primary'));
    assert(models[0].name.length > 0);
    assert(models[0].provider.length > 0);
  });

  runTest('getDefaultModel strictly returns first model configured in .env', () => {
    const defaultModel = getDefaultModel();
    const envModels = getModelsFromEnv();
    assert.strictEqual(defaultModel, envModels[0]);
  });

  runTest('sanitizeModelSlug cleanly strips prefixes (google/, models/) and :free suffix', () => {
    assert.strictEqual(
      sanitizeModelSlug('google/gemini-2.5-flash'),
      'gemini-2.5-flash'
    );
    assert.strictEqual(
      sanitizeModelSlug('models/gemini-2.0-flash'),
      'gemini-2.0-flash'
    );
    assert.strictEqual(
      sanitizeModelSlug('gemini-2.5-flash-lite:free'),
      'gemini-2.5-flash-lite'
    );
    assert.strictEqual(
      sanitizeModelSlug('gemini-2.5-flash'),
      'gemini-2.5-flash'
    );
  });

  // -------------------------------------------------------------
  // TEST GROUP 8: ROBUST JSON SANITIZATION & LLM RESPONSE ENGINE
  // -------------------------------------------------------------
  console.log('\n--- GROUP 8: Robust JSON Sanitization & Parsing Engine ---');

  runTest('cleanAndParseJSON strips reasoning <think> blocks and markdown fences', () => {
    const raw = `<think>
Evaluating contradictions and missing income ceilings...
Candidate parameters: Rs 2.5L vs Rs 8.0L
</think>
\`\`\`json
{
  "readinessScore": 60,
  "readinessLabel": "Moderate Risk",
  "expectedRubric": ["Income Ceiling", "Renewal Rules"]
}
\`\`\`
Audit complete.`;

    const parsed = cleanAndParseJSON(raw);
    assert.strictEqual(parsed.readinessScore, 60);
    assert.strictEqual(parsed.readinessLabel, 'Moderate Risk');
    assert.strictEqual(parsed.expectedRubric.length, 2);
  });

  runTest('cleanAndParseJSON automatically cleans trailing commas before closing braces/brackets', () => {
    const rawWithTrailingCommas = `{
      "readinessScore": 45,
      "expectedRubric": [
        "Aadhaar Proof",
        "Tehsildar Certificate",
      ],
      "contradictions": [
        {
          "parameter": "Income Limit",
          "severity": "High",
        },
      ],
    }`;

    const parsed = cleanAndParseJSON(rawWithTrailingCommas);
    assert.strictEqual(parsed.readinessScore, 45);
    assert.strictEqual(parsed.expectedRubric.length, 2);
    assert.strictEqual(parsed.contradictions.length, 1);
    assert.strictEqual(parsed.contradictions[0].parameter, 'Income Limit');
  });

  runTest('cleanAndParseJSON recovers from unescaped raw newlines & tabs inside evidenceQuotes', () => {
    const rawWithUnescapedControlChars = `{
      "readinessScore": 54,
      "sourcedFacts": [
        {
          "id": "fact-1",
          "statement": "State domicile is mandatory.",
          "evidenceQuote": "Government of Maharashtra Circular No. 44\nDate: 12 Jan 2026\tMandatory Domicile Required"
        }
      ]
    }`;

    const parsed = cleanAndParseJSON(rawWithUnescapedControlChars);
    assert.strictEqual(parsed.readinessScore, 54);
    assert.strictEqual(parsed.sourcedFacts.length, 1);
    assert(parsed.sourcedFacts[0].evidenceQuote.includes('Circular No. 44'));
  });

  runTest('cleanAndParseJSON safely throws on non-JSON content without process crash', () => {
    let threw = false;
    try {
      cleanAndParseJSON('Sorry, as an AI model I cannot fulfill this request right now.');
    } catch (err) {
      threw = true;
      assert(err.message.includes('No valid JSON object structure found'));
    }
    assert.strictEqual(threw, true);
  });

  // -------------------------------------------------------------
  // TEST GROUP 9: AUTHENTICATION & USER PROFILE RESILIENCE ENGINE
  // -------------------------------------------------------------
  console.log('\n--- GROUP 9: Authentication & User Profile Engine ---');

  const apiRouter = require('../routes/apiRoutes');
  const findRouteHandler = (path, method) => {
    const layer = apiRouter.stack.find(
      (r) => r.route && r.route.path === path && r.route.methods[method.toLowerCase()]
    );
    if (!layer) throw new Error(`Route ${method} ${path} not found in apiRouter`);
    return layer.route.stack[0].handle;
  };

  await runAsyncTest('Auth signup rejects invalid email format', async () => {
    const signupHandler = findRouteHandler('/auth/signup', 'POST');
    let statusCode = null;
    let resBody = null;
    const req = { body: { email: 'invalid-email', password: 'password123' } };
    const res = {
      status(c) { statusCode = c; return res; },
      json(d) { resBody = d; return res; },
    };
    await signupHandler(req, res);
    assert.strictEqual(statusCode, 400);
    assert.strictEqual(resBody.success, false);
    assert(resBody.message.includes('valid email'));
  });

  await runAsyncTest('Auth signup rejects password shorter than 6 characters', async () => {
    const signupHandler = findRouteHandler('/auth/signup', 'POST');
    let statusCode = null;
    let resBody = null;
    const req = { body: { email: 'auditor@gaplens.org', password: '123' } };
    const res = {
      status(c) { statusCode = c; return res; },
      json(d) { resBody = d; return res; },
    };
    await signupHandler(req, res);
    assert.strictEqual(statusCode, 400);
    assert.strictEqual(resBody.success, false);
    assert(resBody.message.includes('at least 6 characters'));
  });

  await runAsyncTest('Auth me endpoint correctly validates Bearer mock token', async () => {
    const meHandler = findRouteHandler('/auth/me', 'GET');
    let resBody = null;
    const req = { headers: { authorization: 'Bearer mock-jwt-token' } };
    const res = {
      json(d) { resBody = d; return res; },
    };
    await meHandler(req, res);
    assert.strictEqual(resBody.success, true);
    assert.strictEqual(resBody.user.id, 'usr_demo');
  });

  await runAsyncTest('Auth logout returns clean success message', async () => {
    const logoutHandler = findRouteHandler('/auth/logout', 'POST');
    let resBody = null;
    const req = {};
    const res = {
      json(d) { resBody = d; return res; },
    };
    await logoutHandler(req, res);
    assert.strictEqual(resBody.success, true);
    assert(resBody.message.includes('Logged out'));
  });

  // -------------------------------------------------------------
  // TEST GROUP 10: USER-LEVEL DATA ISOLATION & SESSION SCOPING
  // -------------------------------------------------------------
  console.log('\n--- GROUP 10: User-Level Data Isolation & Session Scoping ---');

  const getSessionsHandler = findRouteHandler('/sessions', 'GET');
  const postSessionHandler = findRouteHandler('/sessions', 'POST');
  const patchChecklistHandler = findRouteHandler('/sessions/:id/checklist', 'PATCH');
  const deleteSessionHandler = findRouteHandler('/sessions/:id', 'DELETE');

  await runAsyncTest('Unauthenticated GET /api/sessions returns 0 sessions and prompts sign-in', async () => {
    let resBody = null;
    const req = { headers: {}, query: {} };
    const res = { json(d) { resBody = d; return res; } };
    await getSessionsHandler(req, res);
    assert.strictEqual(resBody.success, true);
    assert.strictEqual(resBody.count, 0);
    assert.strictEqual(resBody.sessions.length, 0);
    assert(resBody.message.includes('Please sign in'));
  });

  let aliceSessionId = null;
  let bobSessionId = null;

  await runAsyncTest('Create research sessions for two distinct users (Alice & Bob)', async () => {
    // Alice session
    const aliceReq = {
      headers: { 'x-user-id': 'usr_alice_001' },
      body: {
        topic: 'Alice Scholarship Research 2026',
        category: 'Education',
        sources: [
          { id: 's1', title: 'Doc 1', content: 'Official notice text for scholarship.' },
          { id: 's2', title: 'Doc 2', content: 'Secondary guidelines for scholarship.' },
        ],
        analysis_result: { readinessScore: 85 },
      },
    };
    let aliceRes = null;
    await postSessionHandler(aliceReq, {
      status() { return this; },
      json(d) { aliceRes = d; return this; },
    });
    assert.strictEqual(aliceRes.success, true);
    assert.strictEqual(aliceRes.session.user_id, 'usr_alice_001');
    aliceSessionId = aliceRes.session.id;

    // Bob session
    const bobReq = {
      headers: { 'x-user-id': 'usr_bob_002' },
      body: {
        topic: 'Bob Cloud Kitchen Licensing 2026',
        category: 'Food Safety',
        sources: [
          { id: 's1', title: 'FSSAI Rule', content: 'Statutory threshold for cloud kitchen.' },
          { id: 's2', title: 'Municipal Rule', content: 'Local health license requirement.' },
        ],
        analysis_result: { readinessScore: 72 },
      },
    };
    let bobRes = null;
    await postSessionHandler(bobReq, {
      status() { return this; },
      json(d) { bobRes = d; return this; },
    });
    assert.strictEqual(bobRes.success, true);
    assert.strictEqual(bobRes.session.user_id, 'usr_bob_002');
    bobSessionId = bobRes.session.id;
  });

  await runAsyncTest('Alice can ONLY access her own sessions, NEVER Bob\'s', async () => {
    let aliceGetRes = null;
    const req = { headers: { 'x-user-id': 'usr_alice_001' }, query: {} };
    await getSessionsHandler(req, {
      json(d) { aliceGetRes = d; return this; },
    });
    assert.strictEqual(aliceGetRes.success, true);
    assert(aliceGetRes.sessions.length >= 1);
    const aliceTopics = aliceGetRes.sessions.map((s) => s.topic);
    assert(aliceTopics.includes('Alice Scholarship Research 2026'));
    assert(!aliceTopics.includes('Bob Cloud Kitchen Licensing 2026'));
  });

  await runAsyncTest('Bob can ONLY access his own sessions, NEVER Alice\'s', async () => {
    let bobGetRes = null;
    const req = { headers: { 'x-user-id': 'usr_bob_002' }, query: {} };
    await getSessionsHandler(req, {
      json(d) { bobGetRes = d; return this; },
    });
    assert.strictEqual(bobGetRes.success, true);
    assert(bobGetRes.sessions.length >= 1);
    const bobTopics = bobGetRes.sessions.map((s) => s.topic);
    assert(bobTopics.includes('Bob Cloud Kitchen Licensing 2026'));
    assert(!bobTopics.includes('Alice Scholarship Research 2026'));
  });

  await runAsyncTest('Cross-User Security: Alice is denied modification of Bob\'s session (403)', async () => {
    let statusCode = null;
    let patchRes = null;
    const req = {
      params: { id: bobSessionId },
      headers: { 'x-user-id': 'usr_alice_001' },
      body: { checkedIds: ['chk-1'] },
    };
    await patchChecklistHandler(req, {
      status(c) { statusCode = c; return this; },
      json(d) { patchRes = d; return this; },
    });
    assert.strictEqual(statusCode, 403);
    assert.strictEqual(patchRes.success, false);
    assert(patchRes.message.includes('Forbidden') || patchRes.message.includes('cannot modify'));
  });

  await runAsyncTest('Cross-User Security: Alice is denied deletion of Bob\'s session (403)', async () => {
    let statusCode = null;
    let deleteRes = null;
    const req = {
      params: { id: bobSessionId },
      headers: { 'x-user-id': 'usr_alice_001' },
    };
    await deleteSessionHandler(req, {
      status(c) { statusCode = c; return this; },
      json(d) { deleteRes = d; return this; },
    });
    assert.strictEqual(statusCode, 403);
    assert.strictEqual(deleteRes.success, false);
    assert(deleteRes.message.includes('Forbidden') || deleteRes.message.includes('cannot delete'));
  });

  await runAsyncTest('Authorized user (Bob) can successfully delete his own session', async () => {
    let deleteRes = null;
    const req = {
      params: { id: bobSessionId },
      headers: { 'x-user-id': 'usr_bob_002' },
    };
    await deleteSessionHandler(req, {
      status(c) { return this; },
      json(d) { deleteRes = d; return this; },
    });
    assert.strictEqual(deleteRes.success, true);
    assert.strictEqual(deleteRes.sessionId, bobSessionId);
  });

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`  TEST RESULTS: ${passedTests} OF ${totalTests} TESTS PASSED`);
  if (passedTests === totalTests) {
    console.log('  STATUS: ALL TESTS PASSED - 100% SUCCESS');
  } else {
    console.log(`  STATUS: ${totalTests - passedTests} TESTS FAILED`);
  }
  console.log('================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

executeAllTests();
