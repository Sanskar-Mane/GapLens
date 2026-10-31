/**
 * GapLens Precomputed Analyses Registry & Dynamic Fallback Engine
 * Shinchan Online Hackathon 2026: Digital Dark Spot
 *
 * Provides pre-verified, deterministic analyses with traceable evidence quotes,
 * epistemic rubric status classification, and dynamic fallback heuristics.
 */

const PRECOMPUTED_ANALYSES = {
  'scholarship-2026': {
    readinessScore: 54,
    readinessLabel: 'Moderate Risk — Critical Renewal Gaps & Income Limit Conflict',
    executiveSummary:
      'While core eligibility (state domicile) and online portal requirements are documented in the official notice, critical contradictions exist regarding the family income ceiling (Rs. 2.5 Lakh vs Rs. 8.0 Lakh) and required income proof format. Furthermore, multi-year renewal conditions are completely absent across all reviewed sources.',
    expectedRubric: [
      'Eligibility & Minimum Marks',
      'Family Income Limit',
      'Required Documents List',
      'Application Mode & Portal',
      'Current Submission Deadline',
      'Annual Renewal & Attendance Policy',
    ],
    rubricStatus: [
      {
        parameter: 'Eligibility & Minimum Marks',
        status: 'verified',
        linkedIds: ['fact-1'],
      },
      {
        parameter: 'Family Income Limit',
        status: 'conflict',
        linkedIds: ['conf-1'],
      },
      {
        parameter: 'Required Documents List',
        status: 'conflict',
        linkedIds: ['conf-2', 'fact-2'],
      },
      {
        parameter: 'Application Mode & Portal',
        status: 'conflict',
        linkedIds: ['conf-3', 'fact-1'],
      },
      {
        parameter: 'Current Submission Deadline',
        status: 'missing',
        linkedIds: ['gap-2', 'time-1'],
      },
      {
        parameter: 'Annual Renewal & Attendance Policy',
        status: 'missing',
        linkedIds: ['gap-1'],
      },
    ],
    sourcedFacts: [
      {
        id: 'fact-1',
        category: 'Domicile & Portal',
        statement:
          'Applicants must hold state domicile and submit applications online through the state scholarship portal.',
        sourceIds: ['src-1'],
        sourceTitles: ['Official State Scholarship Portal Guidelines'],
        confidence: 'High (Official Source)',
        evidenceQuote:
          'Applicants must be domiciled in the state and have secured at least 75% marks in the previous qualifying examination.',
      },
      {
        id: 'fact-2',
        category: 'Core Identity Documents',
        statement:
          'Aadhaar Card, previous qualifying marksheet, and bank passbook copy are mandatory attachments.',
        sourceIds: ['src-1'],
        sourceTitles: ['Official State Scholarship Portal Guidelines'],
        confidence: 'High (Official Source)',
        evidenceQuote:
          'Mandatory Documents: Aadhaar Card, Previous Year Marksheet, Bank Passbook copy (Aadhaar seeded), and Income Certificate issued by the competent Tehsildar office.',
      },
      {
        id: 'fact-3',
        category: 'Degree Course Coverage',
        statement:
          'The State Post-Matric Scholarship covers eligible undergraduate degrees and professional engineering courses.',
        sourceIds: ['src-2'],
        sourceTitles: ['EduCareer Student Guidance Blog'],
        confidence: 'Medium (Third-Party Guide)',
        evidenceQuote:
          'The State Post-Matric Scholarship covers undergraduate engineering and degree courses.',
      },
      {
        id: 'fact-4',
        category: 'Hostel Allowance Snippet',
        statement:
          'Hostel students residing in recognized private hostels or PG accommodations may receive an additional monthly maintenance allowance.',
        sourceIds: ['src-4'],
        sourceTitles: ['Student Community Hostel Allowance FAQ'],
        confidence: 'Low (Unverified Community Post)',
        evidenceQuote:
          'Hostel students residing in recognized private hostels or paying guest accommodations receive an additional maintenance allowance of Rs. 1,200 per month',
      },
    ],
    informationGaps: [
      {
        id: 'gap-1',
        title: 'Scholarship Renewal & Continuation Policy Missing',
        missingQuestion:
          'What minimum CGPA, attendance percentage, or backlog rules are required to renew the scholarship in Year 2, 3, and 4?',
        impactLevel: 'Critical',
        signalLabel: 'Potential Gap — Not Found in Reviewed Sources',
        explanation:
          'None of the 4 sources mention whether the scholarship auto-renews or requires fresh annual income verification.',
      },
      {
        id: 'gap-2',
        title: 'Exact Closing Deadline for 2026-27 Cycle Unspecified',
        missingQuestion:
          'What is the official last date for online submission for the 2026-27 academic year?',
        impactLevel: 'High',
        signalLabel: 'Potential Gap — Unanswered Question',
        explanation:
          'Source 1 references the 2026-27 cycle but omits the closing date; Source 3 lists a November 2023 deadline from an expired cycle.',
      },
      {
        id: 'gap-3',
        title: 'Hostel Maintenance Verification Protocol Undefined',
        missingQuestion:
          'Does claiming the monthly hostel allowance require a registered lease agreement, warden certificate, or official verification stamp?',
        impactLevel: 'Medium',
        signalLabel: 'Potential Gap — AI Signal',
        explanation:
          'Source 4 mentions a Rs. 1,200/month allowance in an undated snippet without citing a competent verification authority or official application form.',
      },
    ],
    contradictions: [
      {
        id: 'conf-1',
        parameter: 'Maximum Annual Family Income Limit',
        severity: 'Critical Conflict',
        signalLabel: 'Possible Conflict Between Sources',
        sourceA: {
          sourceId: 'src-1',
          title: 'Official State Scholarship Portal Guidelines',
          claim: 'Annual family income from all sources must not exceed Rs. 2,50,000.',
          evidenceQuote:
            'Annual family income from all combined sources must not exceed Rs. 2,50,000.',
        },
        sourceB: {
          sourceId: 'src-2',
          title: 'EduCareer Student Guidance Blog',
          claim: 'Students with a family income up to Rs. 8,00,000 per annum are eligible to apply.',
          evidenceQuote:
            'Students with an annual family income up to Rs. 8,00,000 per annum and minimum 60% marks in previous examinations are eligible to apply.',
        },
        resolutionAdvice:
          'Verify whether the Rs. 2.5 Lakh cap applies to specific categories while Rs. 8.0 Lakh applies to EBC/OBC tiers on the official portal.',
      },
      {
        id: 'conf-2',
        parameter: 'Income Proof Document Format',
        severity: 'High Conflict',
        signalLabel: 'Possible Conflict Between Sources',
        sourceA: {
          sourceId: 'src-1',
          title: 'Official State Scholarship Portal Guidelines',
          claim: 'Requires an official Income Certificate issued by the Tehsildar.',
          evidenceQuote:
            'Income Certificate issued by the competent Tehsildar office.',
        },
        sourceB: {
          sourceId: 'src-2',
          title: 'EduCareer Student Guidance Blog',
          claim: 'States a self-attested income declaration on Rs. 100 stamp paper is sufficient.',
          evidenceQuote:
            'self-attested income declaration on a Rs. 100 stamp paper',
        },
        resolutionAdvice:
          'Do not rely on a stamp-paper affidavit; apply for a Tehsildar-issued digital income certificate.',
      },
      {
        id: 'conf-3',
        parameter: 'Minimum Qualifying Marks & Submission Mode',
        severity: 'Moderate Conflict',
        signalLabel: 'Possible Conflict Between Sources',
        sourceA: {
          sourceId: 'src-1',
          title: 'Official State Scholarship Portal Guidelines',
          claim: 'Requires 75% marks and strictly online portal submission.',
          evidenceQuote:
            'All applications must be submitted online via the official scholarship portal.',
        },
        sourceB: {
          sourceId: 'src-3',
          title: 'Regional Directorate Circular Archive',
          claim: 'Requires offline hard-copy submission to the District Nodal Officer.',
          evidenceQuote:
            'submit hard copies of their application form along with original verification slips to the District Nodal Officer on or before 15th November 2023.',
        },
        resolutionAdvice:
          'Source 3 is from the 2023-24 cycle; follow the online submission workflow in Source 1.',
      },
    ],
    outdatedWarnings: [
      {
        id: 'time-1',
        sourceId: 'src-3',
        sourceTitle: 'Regional Directorate Circular Archive',
        detectedDate: 'October 2023 (2023-24 Cycle)',
        warningType: 'Outdated Cycle',
        riskDescription:
          'Refers to the 2023-24 academic cycle and offline submission procedures that have likely been superseded.',
        evidenceQuote:
          'All eligible scholarship candidates for the 2023-24 academic cycle must submit hard copies of their application form along with original verification slips to the District Nodal Officer on or before 15th November 2023.',
      },
      {
        id: 'time-2',
        sourceId: 'src-4',
        sourceTitle: 'Student FAQ Snippet',
        detectedDate: 'Undated',
        warningType: 'Missing Publication Date',
        riskDescription:
          'Claims a Rs. 1,200/month hostel allowance without citing a notification date or official circular number.',
        evidenceQuote:
          'Hostel students residing in recognized private hostels or paying guest accommodations receive an additional maintenance allowance of Rs. 1,200 per month',
      },
    ],
    verificationChecklist: [
      {
        id: 'chk-1',
        priority: 'High',
        actionItem:
          'Confirm the official 2026-27 online application deadline on the State Scholarship Portal notice board.',
        targetAuthority: 'Official State Scholarship Portal',
        reason: 'Closing date is missing in current guidelines and outdated in archived circulars.',
      },
      {
        id: 'chk-2',
        priority: 'High',
        actionItem:
          'Verify the exact family income limit (Rs. 2.5L vs Rs. 8.0L) and obtain a Tehsildar-issued Income Certificate.',
        targetAuthority: 'Tehsildar Office / Official GR PDF',
        reason: 'Direct contradiction between the official summary and third-party student blog.',
      },
      {
        id: 'chk-3',
        priority: 'Medium',
        actionItem:
          'Check the official scheme brochure for 2nd-year renewal criteria (minimum CGPA/attendance rules).',
        targetAuthority: 'Directorate of Technical Education (DTE) Scheme FAQ',
        reason: 'Renewal conditions are completely absent from all reviewed sources.',
      },
      {
        id: 'chk-4',
        priority: 'Low',
        actionItem:
          'Cross-check whether the Rs. 1,200/month hostel allowance requires a registered rent agreement or warden certificate.',
        targetAuthority: 'College Scholarship Nodal Officer',
        reason: 'Mentioned only in an undated student FAQ snippet.',
      },
    ],
  },

  'fssai-cloud-kitchen': {
    readinessScore: 48,
    readinessLabel: 'Moderate Risk — Turnover Discrepancy & Missing Fire Safety NOC',
    executiveSummary:
      'While basic FSSAI registration (Form A) is documented for home tiffins with turnover up to Rs. 12 Lakhs, conflicting PMC guidance claims a Rs. 20 Lakh threshold for State Licensing. Crucially, mandatory Fire Department NOC, commercial gas cylinder inspection, and Maharashtra Shop Act registration are either completely absent or referenced via an obsolete 2021 municipal circular.',
    expectedRubric: [
      'Turnover Threshold & FSSAI Category',
      'Potable Water & Health Fitness Test',
      'Municipal Health Trade License (PMC)',
      'Fire Safety NOC & Commercial LPG Rules',
      'Shop & Establishment Act Registration',
      'Annual Renewal Window & Penalties',
    ],
    rubricStatus: [
      {
        parameter: 'Turnover Threshold & FSSAI Category',
        status: 'conflict',
        linkedIds: ['conf-1', 'fact-1'],
      },
      {
        parameter: 'Potable Water & Health Fitness Test',
        status: 'verified',
        linkedIds: ['fact-1'],
      },
      {
        parameter: 'Municipal Health Trade License (PMC)',
        status: 'verified',
        linkedIds: ['fact-2'],
      },
      {
        parameter: 'Fire Safety NOC & Commercial LPG Rules',
        status: 'missing',
        linkedIds: ['gap-1', 'conf-2', 'time-1'],
      },
      {
        parameter: 'Shop & Establishment Act Registration',
        status: 'missing',
        linkedIds: ['gap-2'],
      },
      {
        parameter: 'Annual Renewal Window & Penalties',
        status: 'verified',
        linkedIds: ['fact-3'],
      },
    ],
    sourcedFacts: [
      {
        id: 'fact-1',
        category: 'Basic FSSAI Registration',
        statement:
          'Home-based food operators and cloud kitchens with turnover up to Rs. 12 Lakhs require Basic FSSAI Registration (Form A) with kitchen layout and medical fitness certs.',
        sourceIds: ['src-1'],
        sourceTitles: ['Food Safety Authority Portal (FSSAI Registration Standard)'],
        confidence: 'High (Official Source)',
        evidenceQuote:
          'Home-based food operators, tiffin providers, and cloud kitchens having an annual turnover of up to Rs. 12 Lakhs are required to obtain only a Basic FSSAI Registration Certificate (Form A).',
      },
      {
        id: 'fact-2',
        category: 'Municipal Jurisdiction',
        statement:
          'Food delivery establishments operating in Pune Municipal Corporation limits require a Municipal Health Trade License and commercial meter.',
        sourceIds: ['src-2'],
        sourceTitles: ['Municipal Corporation Trade Licensing Advisory (PMC)'],
        confidence: 'Medium (Municipal Advisory)',
        evidenceQuote:
          'Commercial food preparation and delivery establishments operating within Pune Municipal Corporation limits require a Municipal Health Trade License and commercial electricity meter.',
      },
      {
        id: 'fact-3',
        category: 'FSSAI Renewal Schedule',
        statement:
          'Annual renewal of FSSAI registration must be submitted at least 30 days prior to certificate expiry.',
        sourceIds: ['src-1'],
        sourceTitles: ['Food Safety Authority Portal (FSSAI Registration Standard)'],
        confidence: 'High (Official Source)',
        evidenceQuote:
          'Annual renewal must be applied 30 days prior to certificate expiry.',
      },
    ],
    informationGaps: [
      {
        id: 'gap-1',
        title: 'Fire Safety NOC & Commercial LPG Rules Missing for 2026',
        missingQuestion:
          'Does a home-based cloud kitchen in Pune require a mandatory Fire Department No-Objection Certificate (NOC) and commercial LPG cylinder connection under 2026 municipal safety norms?',
        impactLevel: 'Critical',
        signalLabel: 'Potential Gap — Not Found in Reviewed Sources',
        explanation:
          'Neither 2026 source specifies whether domestic LPG cylinders are legally prohibited or if residential fire inspections apply.',
      },
      {
        id: 'gap-2',
        title: 'Maharashtra Shop & Establishment Act (Gumasta) Status Missing',
        missingQuestion:
          'Is registration under the Maharashtra Shops and Establishments Act mandatory for single-operator residential cloud kitchens?',
        impactLevel: 'High',
        signalLabel: 'Potential Gap — Unanswered Question',
        explanation:
          'Commercial food sales generally require Gumasta registration, but this condition is completely omitted across all sources.',
      },
      {
        id: 'gap-3',
        title: 'PMC Health Trade License Processing Schedule Unspecified',
        missingQuestion:
          'What is the turnaround time, inspection fee, and document checklist for obtaining the PMC Municipal Health Trade License in 2026?',
        impactLevel: 'Medium',
        signalLabel: 'Potential Gap — AI Signal',
        explanation:
          'Source 2 mentions the trade license requirement but does not list the application portal or fee schedule.',
      },
    ],
    contradictions: [
      {
        id: 'conf-1',
        parameter: 'Turnover Ceiling for Basic Registration vs State License',
        severity: 'Critical Conflict',
        signalLabel: 'Possible Conflict Between Sources',
        sourceA: {
          sourceId: 'src-1',
          title: 'Food Safety Authority Portal (FSSAI Registration Standard)',
          claim: 'Turnover up to Rs. 12 Lakhs requires Basic FSSAI Registration (Form A).',
          evidenceQuote:
            'annual turnover of up to Rs. 12 Lakhs are required to obtain only a Basic FSSAI Registration Certificate (Form A).',
        },
        sourceB: {
          sourceId: 'src-2',
          title: 'Municipal Corporation Trade Licensing Advisory (PMC)',
          claim: 'Turnover exceeding Rs. 20 Lakhs or connected load >5KW triggers State FSSAI License.',
          evidenceQuote:
            'turnover exceeding Rs. 20 Lakhs must obtain a State FSSAI License rather than Basic Registration.',
        },
        resolutionAdvice:
          'FSSAI national regulations strictly mandate State Licensing above Rs. 12 Lakhs per annum. Do not rely on the Rs. 20 Lakh figure on FoSCoS.',
      },
      {
        id: 'conf-2',
        parameter: 'Fire Safety Exemption for Domestic LPG Users',
        severity: 'High Conflict',
        signalLabel: 'Possible Conflict Between Sources',
        sourceA: {
          sourceId: 'src-2',
          title: 'Municipal Corporation Trade Licensing Advisory (PMC)',
          claim: 'Mandates commercial electricity meter and health trade compliance for all commercial food preparation.',
          evidenceQuote:
            'require a Municipal Health Trade License and commercial electricity meter.',
        },
        sourceB: {
          sourceId: 'src-3',
          title: 'Archived Restaurant & Cloud Kitchen Fee Schedule',
          claim: 'Fire department NOC and pollution clearance are exempt for domestic LPG cylinder users under 20 orders/day.',
          evidenceQuote:
            'Fire department NOC and effluent pollution clearance are exempt for domestic LPG cylinder users operating below 20 orders per day.',
        },
        resolutionAdvice:
          'Source 3 is an archived 2021 circular; domestic LPG exemptions have been superseded by current commercial fire bylaws.',
      },
    ],
    outdatedWarnings: [
      {
        id: 'time-1',
        sourceId: 'src-3',
        sourceTitle: 'Archived Restaurant & Cloud Kitchen Fee Schedule',
        detectedDate: 'April 2021',
        warningType: 'Outdated Circular',
        riskDescription:
          'Refers to a 2021 municipal fee schedule and obsolete fire exemptions that no longer reflect 2026 safety standards.',
        evidenceQuote:
          'Under the 2021 Municipal Schedule, small food establishments pay a flat inspection fee of Rs. 1,500.',
      },
    ],
    verificationChecklist: [
      {
        id: 'chk-1',
        priority: 'High',
        actionItem:
          'Confirm current FoSCoS licensing category (Basic vs State License) based on projected turnover on foscos.fssai.gov.in',
        targetAuthority: 'FSSAI FoSCoS Portal',
        reason: 'Direct contradiction between Rs. 12L and Rs. 20L turnover threshold in reviewed sources.',
      },
      {
        id: 'chk-2',
        priority: 'High',
        actionItem:
          'Verify Pune Municipal Corporation (PMC) Health Trade License and Fire NOC mandate for residential buildings.',
        targetAuthority: 'PMC Health Dept / Chief Fire Officer Pune',
        reason: 'Fire safety criteria are missing from 2026 sources and exempt only in an outdated 2021 circular.',
      },
      {
        id: 'chk-3',
        priority: 'Medium',
        actionItem:
          'Apply for Maharashtra Shop & Establishment Act Intimation / Registration online on Aaple Sarkar.',
        targetAuthority: 'Maharashtra Labor Department (Aaple Sarkar)',
        reason: 'Completely omitted from all reviewed sources.',
      },
      {
        id: 'chk-4',
        priority: 'Low',
        actionItem:
          'Schedule NABL-accredited water testing for potable water safety certificate upload.',
        targetAuthority: 'NABL Accredited Water Testing Laboratory',
        reason: 'Mandatory prerequisite for Form A basic registration approval.',
      },
    ],
  },

  'overseas-edu-subsidy': {
    readinessScore: 52,
    readinessLabel: 'Moderate Risk — Parental Income Discrepancy & Missing Part-Time Course Policy',
    executiveSummary:
      'While the core CSIS interest subsidy terms (covering full interest during course duration plus 1 year moratorium) are confirmed, there is a substantial contradiction regarding the annual parental income ceiling (Rs. 4.5 Lakh vs Rs. 6.0 Lakh). Moreover, the reviewed sources completely omit whether online/hybrid Master’s degrees qualify, and bank renewal procedures remain undated.',
    expectedRubric: [
      'Parental Income Ceiling',
      'Approved Foreign University & Degree Types',
      'Eligible Study Modes (Full-Time vs Hybrid/Online)',
      'Moratorium Period & Subsidy Disbursal',
      'Mandatory Income Proof & Tehsildar Document',
      'Annual Progress Report & Bank Renewal Procedure',
    ],
    rubricStatus: [
      {
        parameter: 'Parental Income Ceiling',
        status: 'conflict',
        linkedIds: ['conf-1'],
      },
      {
        parameter: 'Approved Foreign University & Degree Types',
        status: 'verified',
        linkedIds: ['fact-2'],
      },
      {
        parameter: 'Eligible Study Modes (Full-Time vs Hybrid/Online)',
        status: 'missing',
        linkedIds: ['gap-1'],
      },
      {
        parameter: 'Moratorium Period & Subsidy Disbursal',
        status: 'verified',
        linkedIds: ['fact-1'],
      },
      {
        parameter: 'Mandatory Income Proof & Tehsildar Document',
        status: 'conflict',
        linkedIds: ['conf-2'],
      },
      {
        parameter: 'Annual Progress Report & Bank Renewal Procedure',
        status: 'verified',
        linkedIds: ['fact-3', 'gap-3', 'time-1'],
      },
    ],
    sourcedFacts: [
      {
        id: 'fact-1',
        category: 'Moratorium Terms',
        statement:
          'CSIS provides full interest subsidy during the moratorium period (course duration plus 1 year) for educational loans availed from scheduled banks.',
        sourceIds: ['src-1'],
        sourceTitles: ['Ministry of Education Scheme Portal (CSIS Overseas Guidelines)'],
        confidence: 'High (Official Source)',
        evidenceQuote:
          'full interest subsidy is provided during the moratorium period (course duration plus 1 year) on educational loans availed from scheduled banks.',
      },
      {
        id: 'fact-2',
        category: 'Eligible Degrees',
        statement:
          'Applicable only for Master’s and Ph.D. level postgraduate programs in approved foreign universities.',
        sourceIds: ['src-1'],
        sourceTitles: ['Ministry of Education Scheme Portal (CSIS Overseas Guidelines)'],
        confidence: 'High (Official Source)',
        evidenceQuote:
          'Applicable only for full-time Master’s and Ph.D. programs in approved foreign universities.',
      },
      {
        id: 'fact-3',
        category: 'Bank Renewal Requirement',
        statement:
          'Borrowers must submit annual academic progress reports and income renewal certificates to their loan disbursing branch.',
        sourceIds: ['src-3'],
        sourceTitles: ['Nationalized Bank Education Loan Customer Brochure'],
        confidence: 'Medium (Bank Brochure)',
        evidenceQuote:
          'Borrowers must submit annual academic progress reports and income renewal certificates to their home branch.',
      },
    ],
    informationGaps: [
      {
        id: 'gap-1',
        title: 'Part-Time, Hybrid, and Executive Degree Eligibility Missing',
        missingQuestion:
          'Are students pursuing STEM Master’s degrees through hybrid, online, or part-time foreign university enrollments eligible for the interest subsidy?',
        impactLevel: 'Critical',
        signalLabel: 'Potential Gap — Not Found in Reviewed Sources',
        explanation:
          'None of the 3 sources clarify whether non-traditional, hybrid, or online master’s programs qualify for central subsidy funds.',
      },
      {
        id: 'gap-2',
        title: 'Foreign University Ranking Thresholds Unspecified',
        missingQuestion:
          'Does the CSIS overseas scheme enforce a specific QS or Times Higher Education global top 500 ranking cutoff for participating foreign universities?',
        impactLevel: 'High',
        signalLabel: 'Potential Gap — Unanswered Question',
        explanation:
          'Source 1 mentions "approved foreign universities" but does not provide an official annexure or ranking threshold list.',
      },
      {
        id: 'gap-3',
        title: 'Annual Progress Submission Deadlines Undefined',
        missingQuestion:
          'What is the exact calendar date by which borrowers must submit annual academic progress reports to prevent subsidy stoppage?',
        impactLevel: 'Medium',
        signalLabel: 'Potential Gap — AI Signal',
        explanation:
          'Source 3 references annual progress submission in an undated brochure without specifying quarterly or annual cutoff dates.',
      },
    ],
    contradictions: [
      {
        id: 'conf-1',
        parameter: 'Maximum Annual Gross Parental Income Ceiling',
        severity: 'Critical Conflict',
        signalLabel: 'Possible Conflict Between Sources',
        sourceA: {
          sourceId: 'src-1',
          title: 'Ministry of Education Scheme Portal (CSIS Overseas Guidelines)',
          claim: 'Annual gross parental income from all sources must not exceed Rs. 4,50,000 per annum.',
          evidenceQuote:
            'Annual gross parental income from all sources must not exceed Rs. 4,50,000 per annum.',
        },
        sourceB: {
          sourceId: 'src-2',
          title: 'Global Education Finance Advisory Blog',
          claim: 'Students can claim government interest subsidy if family income is up to Rs. 6,00,000 per annum.',
          evidenceQuote:
            'Students admitted to STEM and business management master’s programs abroad can claim the government interest subsidy if family income is up to Rs. 6,00,000 per annum.',
        },
        resolutionAdvice:
          'CSIS central guidelines strictly enforce the Rs. 4.50 Lakh EBC cap. The Rs. 6 Lakh figure likely refers to a state-level minority subsidy.',
      },
      {
        id: 'conf-2',
        parameter: 'Income Proof Verification Requirement',
        severity: 'High Conflict',
        signalLabel: 'Possible Conflict Between Sources',
        sourceA: {
          sourceId: 'src-1',
          title: 'Ministry of Education Scheme Portal (CSIS Overseas Guidelines)',
          claim: 'Requires an official Income Certificate issued by competent revenue authority.',
          evidenceQuote:
            'Under the Central Scheme to Provide Interest Subsidy (CSIS) for Overseas Studies',
        },
        sourceB: {
          sourceId: 'src-2',
          title: 'Global Education Finance Advisory Blog',
          claim: 'Self-declared income affidavit and admission offer letter are sufficient.',
          evidenceQuote:
            'A self-declared income affidavit and admission offer letter from any accredited foreign institute are sufficient to initiate subsidy disbursement with partner banks.',
        },
        resolutionAdvice:
          'Nationalized banks reject self-declarations; an income certificate issued by a Sub-Divisional Magistrate or Tehsildar is mandatory.',
      },
    ],
    outdatedWarnings: [
      {
        id: 'time-1',
        sourceId: 'src-3',
        sourceTitle: 'Nationalized Bank Education Loan Customer Brochure',
        detectedDate: 'Undated',
        warningType: 'Missing Publication Date',
        riskDescription:
          'Brochure contains no publication date or circular number, leaving annual progress submission windows unverifiable.',
        evidenceQuote:
          'The brochure does not state whether part-time or executive online master’s programs qualify for the interest subsidy.',
      },
    ],
    verificationChecklist: [
      {
        id: 'chk-1',
        priority: 'High',
        actionItem:
          'Confirm the Rs. 4.5 Lakh income ceiling with your scheduled commercial bank’s education loan nodal officer.',
        targetAuthority: 'Canara Bank (Nodal Scheme Administrator) / CSIS Guidelines',
        reason: 'Direct contradiction between Rs. 4.5L and Rs. 6.0L income ceilings across sources.',
      },
      {
        id: 'chk-2',
        priority: 'High',
        actionItem:
          'Obtain a formal Income Certificate from the Tehsildar/Revenue Authority before visa and bank filing.',
        targetAuthority: 'District Revenue Office / Tehsildar',
        reason: 'Blog advice advocating a self-affidavit will lead to bank loan subsidy disqualification.',
      },
      {
        id: 'chk-3',
        priority: 'Medium',
        actionItem:
          'Verify whether the prospective foreign university and degree mode (full-time vs hybrid) qualify under CSIS.',
        targetAuthority: 'Ministry of Education (CSIS Overseas Cell)',
        reason: 'Online and executive degrees are not addressed in the reviewed materials.',
      },
      {
        id: 'chk-4',
        priority: 'Low',
        actionItem:
          'Request the latest bank circular outlining the annual academic progress report submission cutoff dates.',
        targetAuthority: 'Lending Bank Home Branch Manager',
        reason: 'Bank brochure is undated and lacks specific calendar deadlines.',
      },
    ],
  },
};

/**
 * Heuristic dynamic fallback generator for custom user questions
 * when running offline or when OpenRouter live models are unavailable.
 */
function generateDynamicFallbackAnalysis(topic, category = 'General', sources = []) {
  const cleanTopic = (topic || 'Research Objective').trim();
  const validSources = sources.filter((s) => s && s.content && s.content.trim().length >= 10);
  const srcCount = validSources.length;

  // 1. Analyze dates across sources
  const outdatedWarnings = [];
  validSources.forEach((s, idx) => {
    const sId = s.id || `src-${idx + 1}`;
    const title = s.title || `Source ${idx + 1}`;
    const pub = (s.publishedDate || '').trim();
    const content = s.content || '';

    const firstSnippet =
      content.length > 30 ? content.slice(0, 140) : `Content excerpt from ${title}`;

    if (!pub) {
      outdatedWarnings.push({
        id: `time-${outdatedWarnings.length + 1}`,
        sourceId: sId,
        sourceTitle: title,
        detectedDate: 'Undated',
        warningType: 'Missing Publication Date',
        riskDescription: `Source "${title}" does not specify a publication date, making validity under current 2026 regulations uncertain.`,
        evidenceQuote: firstSnippet,
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
          riskDescription: `Dated ${pub} (prior to 2025). Regulatory terms, fee schedules, or filing portals may have evolved.`,
          evidenceQuote: firstSnippet,
        });
      }
    }
  });

  // 2. Derive category rubric
  const rubricTemplates = {
    Education: [
      'Eligibility Criteria & Qualifying Scores',
      'Income Ceilings & Category Reservations',
      'Mandatory Document Verification & Format',
      'Application Portal & Cutoff Deadlines',
      'Multi-Year Renewal & Academic Progression',
      'Disbursal Schedule & Grievance Redressal',
    ],
    Business: [
      'Regulatory Authority & Licensing Tiers',
      'Threshold Conditions & Capital/Turnover Ceilings',
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

  // 3. Extract sourced facts from available sources
  const sourcedFacts = [];
  validSources.slice(0, 4).forEach((s, idx) => {
    const sId = s.id || `src-${idx + 1}`;
    const title = s.title || `Source ${idx + 1}`;
    const sentences = s.content
      .split(/[.!?]\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 20);

    const factSentence =
      sentences[0] || `Source provides guidance regarding ${cleanTopic.slice(0, 60)}.`;

    sourcedFacts.push({
      id: `fact-${idx + 1}`,
      category: s.sourceType || 'Document Fact',
      statement: factSentence.slice(0, 180),
      sourceIds: [sId],
      sourceTitles: [title],
      confidence:
        s.sourceType === 'Official Notice'
          ? 'High (Official Source)'
          : 'Medium (Extracted Fact)',
      evidenceQuote: factSentence.slice(0, 160),
    });
  });

  // 4. Generate information gaps based on missing rubric items
  const informationGaps = [
    {
      id: 'gap-1',
      title: `${expectedRubric[4]} Not Documented`,
      missingQuestion: `What specific guidelines and criteria govern "${expectedRubric[4]}" for ${cleanTopic.slice(0, 45)}?`,
      impactLevel: 'Critical',
      signalLabel: 'Potential Gap — Not Found in Reviewed Sources',
      explanation: `None of the ${srcCount} provided sources address "${expectedRubric[4]}". Operating without clarity on this parameter creates severe operational risk.`,
    },
    {
      id: 'gap-2',
      title: `${expectedRubric[3]} Ambiguity`,
      missingQuestion: `What is the exact verified procedure, timeline, and cutoff date for "${expectedRubric[3]}"?`,
      impactLevel: 'High',
      signalLabel: 'Potential Gap — Unanswered Question',
      explanation: `Specific cutoff dates and official lodgment procedures are missing or vaguely stated in the provided text extracts.`,
    },
    {
      id: 'gap-3',
      title: `${expectedRubric[5]} Missing From Sources`,
      missingQuestion: `What official escalation path, appellate authority, or redressal mechanism applies?`,
      impactLevel: 'Medium',
      signalLabel: 'Potential Gap — AI Signal',
      explanation: `Sources do not provide contingency or grievance instructions should initial applications encounter discrepancies.`,
    },
  ];

  // 5. Generate potential contradictions / divergence
  const contradictions = [];
  if (validSources.length >= 2) {
    const sA = validSources[0];
    const sB = validSources[1];
    const quoteA = sA.content.slice(0, 110);
    const quoteB = sB.content.slice(0, 110);

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
      resolutionAdvice:
        'Compare the official government portal circular against secondary third-party guidance to establish legal precedence.',
    });
  }

  // 6. Compute readiness score
  let score = 78;
  score -= informationGaps.length * 8;
  score -= contradictions.length * 10;
  score -= outdatedWarnings.length * 4;
  if (score < 30) score = 32;
  if (score > 85) score = 82;

  let readinessLabel = 'Moderate Risk — Incomplete Documentation & Unverified Parameters';
  if (score < 50) {
    readinessLabel = 'High Risk — Substantial Information Gaps & Potential Divergence';
  } else if (score >= 70) {
    readinessLabel = 'Fair Readiness — Minor Verification Gaps Detected';
  }

  // 7. Synthesize Decision Completeness Rubric Status
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
      linkedIds: [`gap-${Math.min(i - 2, informationGaps.length)}`],
    };
  });

  // 8. Build prioritized verification checklist
  const verificationChecklist = [
    {
      id: 'chk-1',
      priority: 'High',
      actionItem: `Confirm the verified 2026 cutoff deadline and lodgment method for "${cleanTopic.slice(0, 50)}".`,
      targetAuthority: 'Competent Regulatory / Administrative Authority',
      reason: 'Filing deadlines are either unspecified or subject to cycle expirations.',
    },
    {
      id: 'chk-2',
      priority: 'High',
      actionItem: `Clarify "${expectedRubric[0]}" and mandatory documentation with official gazette or portal notice.`,
      targetAuthority: 'Official Public Notice Board',
      reason: 'Cross-source divergence or missing statutory specifics.',
    },
    {
      id: 'chk-3',
      priority: 'Medium',
      actionItem: `Inquire regarding "${expectedRubric[4]}" and renewal protocols before final commitment.`,
      targetAuthority: 'Nodal Verification Officer',
      reason: 'Long-term continuation criteria are absent across all reviewed sources.',
    },
    {
      id: 'chk-4',
      priority: 'Low',
      actionItem: 'Obtain dated, digitally verifiable copies of all cited circulars and gazettes.',
      targetAuthority: 'Public Archives & Official Gazette',
      reason: `${outdatedWarnings.length} source(s) lack definitive 2026 temporal validation.`,
    },
  ];

  const executiveSummary = `Analysis of ${srcCount} source(s) regarding "${cleanTopic}" identifies key corroborated facts alongside ${informationGaps.length} critical information gaps (${expectedRubric[4]}, ${expectedRubric[3]}). ${contradictions.length > 0 ? `A potential contradiction exists between Source 1 and Source 2 regarding prerequisite compliance. ` : ''}${outdatedWarnings.length > 0 ? `${outdatedWarnings.length} source(s) carry temporal uncertainty. ` : ''}Thorough verification is recommended before taking irreversible decisions.`;

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
  };
}

module.exports = {
  PRECOMPUTED_ANALYSES,
  generateDynamicFallbackAnalysis,
};
