/**
 * Client-Side Backup Sample Scenarios & Precomputed Analyses for GapLens
 * Problem Statement: Digital Dark Spot (Shinchan Online Hackathon 2026)
 *
 * Ensures instant 1-click loading, verifiable evidence quotes, and zero-latency
 * demonstration even if the backend is offline.
 */

export const FALLBACK_SCENARIOS = [
  {
    id: 'scholarship-2026',
    name: 'Post-Matric Scholarship Verification',
    badge: 'Education',
    category: 'Education',
    topic: 'What should I verify before applying for the State Post-Matric Scholarship?',
    flawsSummary: '4 Sources · 2 Contradictions · 1 Outdated · 1 Undated',
    testingPill: '4 Sources · 2 Conflicts · 1 Outdated · 1 Undated',
    sources: [
      {
        id: 'src-1',
        title: 'Official State Scholarship Portal Guidelines',
        sourceType: 'Official Notice',
        url: 'https://scholarships.gov.example/post-matric-2026',
        publishedDate: 'September 2026 (2026-27 Cycle)',
        content:
          'Eligibility Criteria: Applicants must be domiciled in the state and have secured at least 75% marks in the previous qualifying examination. Annual family income from all combined sources must not exceed Rs. 2,50,000. Mandatory Documents: Aadhaar Card, Previous Year Marksheet, Bank Passbook copy (Aadhaar seeded), and Income Certificate issued by the competent Tehsildar office. Note: All applications must be submitted online via the official scholarship portal.',
      },
      {
        id: 'src-2',
        title: 'EduCareer Student Guidance Blog',
        sourceType: 'Third-Party Guide',
        url: 'https://educareer-guide.example/state-scholarship-details',
        publishedDate: 'August 2026',
        content:
          'The State Post-Matric Scholarship covers undergraduate engineering and degree courses. Students with an annual family income up to Rs. 8,00,000 per annum and minimum 60% marks in previous examinations are eligible to apply. Required documents include a self-attested income declaration on a Rs. 100 stamp paper, Ration Card, Bonafide Certificate from the college principal, and Caste Validity Certificate.',
      },
      {
        id: 'src-3',
        title: 'Regional Directorate Circular Archive',
        sourceType: 'Archived Circular',
        url: 'https://dte-archive.example/circular-2023-24.pdf',
        publishedDate: 'October 2023 (2023-24 Cycle)',
        content:
          'All eligible scholarship candidates for the 2023-24 academic cycle must submit hard copies of their application form along with original verification slips to the District Nodal Officer on or before 15th November 2023. Offline physical counters will close strictly at 5:00 PM on the cutoff date.',
      },
      {
        id: 'src-4',
        title: 'Student Community Hostel Allowance FAQ',
        sourceType: 'Forum/Other',
        url: 'https://studentforum.example/scholarship-faq-allowance',
        publishedDate: '', // Deliberately undated to trigger temporal warning
        content:
          'Hostel students residing in recognized private hostels or paying guest accommodations receive an additional maintenance allowance of Rs. 1,200 per month directly into their bank accounts. Ensure you get the PG rent agreement signed by the landlord to claim this extra hostel benefit.',
      },
    ],
  },
  {
    id: 'fssai-cloud-kitchen',
    name: 'Cloud Kitchen Licensing & Compliance',
    badge: 'Business',
    category: 'Business',
    topic: 'What licenses, fire safety rules, and renewal steps are required to start a home-based cloud kitchen in Pune?',
    flawsSummary: '3 Sources · Turnover Contradiction (12L vs 20L) · Missing Fire/Shop Act NOCs · Outdated 2021 Fees',
    testingPill: '3 Sources · 1 Conflict · Missing Fire NOC · Outdated 2021',
    sources: [
      {
        id: 'src-1',
        title: 'Food Safety Authority Portal (FSSAI Registration Standard)',
        sourceType: 'Official Notice',
        url: 'https://fssai.gov.example/cloud-kitchen-standards',
        publishedDate: 'January 2026',
        content:
          'Home-based food operators, tiffin providers, and cloud kitchens having an annual turnover of up to Rs. 12 Lakhs are required to obtain only a Basic FSSAI Registration Certificate (Form A). Key requirements include identity proof, kitchen layout sketch, potable water test report, and food handler medical fitness certificate. Annual renewal must be applied 30 days prior to certificate expiry.',
      },
      {
        id: 'src-2',
        title: 'Municipal Corporation Trade Licensing Advisory (PMC)',
        sourceType: 'Third-Party Guide',
        url: 'https://pmc-trade-advisory.example/pune-cloud-kitchen-rules',
        publishedDate: 'March 2026',
        content:
          'Commercial food preparation and delivery establishments operating within Pune Municipal Corporation limits require a Municipal Health Trade License and commercial electricity meter. Any cloud kitchen with connected power load exceeding 5KW or turnover exceeding Rs. 20 Lakhs must obtain a State FSSAI License rather than Basic Registration.',
      },
      {
        id: 'src-3',
        title: 'Archived Restaurant & Cloud Kitchen Fee Schedule',
        sourceType: 'Archived Circular',
        url: 'https://urban-archive.example/pune-licensing-circular-2021.pdf',
        publishedDate: 'April 2021',
        content:
          'Under the 2021 Municipal Schedule, small food establishments pay a flat inspection fee of Rs. 1,500. Fire department NOC and effluent pollution clearance are exempt for domestic LPG cylinder users operating below 20 orders per day. Physical renewal slips must be filed at the Ward Office.',
      },
    ],
  },
  {
    id: 'overseas-edu-subsidy',
    name: 'Central Overseas Education Loan Interest Subsidy',
    badge: 'Careers',
    category: 'Careers',
    topic: 'What are the eligibility criteria, moratorium rules, and required documents for the Overseas Education Loan Interest Subsidy?',
    flawsSummary: '3 Sources · Income Conflict (4.5L vs 6.0L) · Part-Time Study Gap · Undated Bank Brochure',
    testingPill: '3 Sources · 1 Conflict · 1 Eligibility Gap · 1 Undated',
    sources: [
      {
        id: 'src-1',
        title: 'Ministry of Education Scheme Portal (CSIS Overseas Guidelines)',
        sourceType: 'Official Notice',
        url: 'https://education.gov.example/overseas-interest-subsidy-2026',
        publishedDate: 'May 2026 (2026-27 Cycle)',
        content:
          'Under the Central Scheme to Provide Interest Subsidy (CSIS) for Overseas Studies, full interest subsidy is provided during the moratorium period (course duration plus 1 year) on educational loans availed from scheduled banks. Eligibility: Annual gross parental income from all sources must not exceed Rs. 4,50,000 per annum. Applicable only for full-time Master’s and Ph.D. programs in approved foreign universities.',
      },
      {
        id: 'src-2',
        title: 'Global Education Finance Advisory Blog',
        sourceType: 'Third-Party Guide',
        url: 'https://overseas-finance-guide.example/central-subsidy-schemes',
        publishedDate: 'July 2026',
        content:
          'Students admitted to STEM and business management master’s programs abroad can claim the government interest subsidy if family income is up to Rs. 6,00,000 per annum. A self-declared income affidavit and admission offer letter from any accredited foreign institute are sufficient to initiate subsidy disbursement with partner banks.',
      },
      {
        id: 'src-3',
        title: 'Nationalized Bank Education Loan Customer Brochure',
        sourceType: 'Forum/Other',
        url: 'https://national-bank.example/overseas-loan-subsidy-faq.pdf',
        publishedDate: '', // Undated
        content:
          'Interest accrued during the moratorium period is reimbursed by the central nodal bank. Borrowers must submit annual academic progress reports and income renewal certificates to their home branch. The brochure does not state whether part-time or executive online master’s programs qualify for the interest subsidy.',
      },
    ],
  },
];

export const FALLBACK_ANALYSES = {
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
      { parameter: 'Eligibility & Minimum Marks', status: 'verified', linkedIds: ['fact-1'] },
      { parameter: 'Family Income Limit', status: 'conflict', linkedIds: ['conf-1'] },
      { parameter: 'Required Documents List', status: 'conflict', linkedIds: ['conf-2', 'fact-2'] },
      { parameter: 'Application Mode & Portal', status: 'conflict', linkedIds: ['conf-3', 'fact-1'] },
      { parameter: 'Current Submission Deadline', status: 'missing', linkedIds: ['gap-2', 'time-1'] },
      { parameter: 'Annual Renewal & Attendance Policy', status: 'missing', linkedIds: ['gap-1'] },
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
        precedenceVerdict: {
          bindingSourceId: 'src-1',
          confidence: 'Definitive Precedence',
          legalWeightReasoning:
            'Tier 2 Official Portal Guidelines strictly override Tier 3 EduCareer blog claims. The statutory Rs. 2,50,000 ceiling is legally enforceable; reliance on the unverified Rs. 8,00,000 limit will lead to instant disqualification.',
        },
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
        precedenceVerdict: {
          bindingSourceId: 'src-1',
          confidence: 'Definitive Precedence',
          legalWeightReasoning:
            'Official government regulations mandate revenue department (Tehsildar) certification over informal Tier 3 self-attested affidavits. Stamp paper declarations are non-compliant under current statutory rules.',
        },
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
        precedenceVerdict: {
          bindingSourceId: 'src-1',
          confidence: 'Definitive Precedence',
          legalWeightReasoning:
            'Current 2026 guidelines mandate centralized online submission, superseding archived 2023 physical lodgment circulars under standard temporal administrative doctrine.',
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
    decisionPreMortem: {
      overallRiskLevel: 'Severe Risk',
      estimatedDelay: '45 to 90 Days Lodgment Rejection / Appeal Window',
      consequenceSummary:
        'Submitting based on unresolved contradictory criteria will trigger immediate application rejection by the District Nodal Officer during scrutiny due to submitting an unverified stamp-paper affidavit instead of a digital Tehsildar certificate, accompanied by permanent forfeiture of the 2026 scholarship disbursement.',
      criticalFailurePoints: [
        {
          darkSpotRef: 'conf-2',
          failureScenario:
            'Immediate rejection during document verification round if applying with a Rs. 100 self-affidavit instead of the mandated Tehsildar digital certificate.',
          penaltyOrLoss:
            'Statutory application dismissal, zero grace period for re-upload, loss of full tuition fee reimbursement (approx Rs. 65,000 to Rs. 1,20,000).',
        },
        {
          darkSpotRef: 'gap-1',
          failureScenario:
            'Mid-course revocation of scholarship funding in Year 2 due to unfulfilled minimum 75% attendance or undisclosed CGPA threshold.',
          penaltyOrLoss:
            'Unexpected personal liability for subsequent year college fees and clawback of disbursed hostel stipends.',
        },
        {
          darkSpotRef: 'conf-1',
          failureScenario:
            'Submitting under Rs. 8.0 Lakh income ceiling when actual family income exceeds the strict Rs. 2.5 Lakh statutory ceiling.',
          penaltyOrLoss:
            'Disqualification for fraudulent declaration and blacklisting across state scholarship portals.',
        },
      ],
    },
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
      { parameter: 'Turnover Threshold & FSSAI Category', status: 'conflict', linkedIds: ['conf-1', 'fact-1'] },
      { parameter: 'Potable Water & Health Fitness Test', status: 'verified', linkedIds: ['fact-1'] },
      { parameter: 'Municipal Health Trade License (PMC)', status: 'verified', linkedIds: ['fact-2'] },
      { parameter: 'Fire Safety NOC & Commercial LPG Rules', status: 'missing', linkedIds: ['gap-1', 'conf-2', 'time-1'] },
      { parameter: 'Shop & Establishment Act Registration', status: 'missing', linkedIds: ['gap-2'] },
      { parameter: 'Annual Renewal Window & Penalties', status: 'verified', linkedIds: ['fact-3'] },
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
        precedenceVerdict: {
          bindingSourceId: 'src-1',
          confidence: 'Definitive Precedence',
          legalWeightReasoning:
            'Tier 1 Central FSSAI statutory regulations override municipal guidance (Tier 2/3). The Rs. 12 Lakh ceiling for basic registration is national law; operating above Rs. 12 Lakh without a State License is an offense under Food Safety Act Section 31.',
        },
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
        precedenceVerdict: {
          bindingSourceId: 'src-2',
          confidence: 'Definitive Precedence',
          legalWeightReasoning:
            'Municipal Health Trade Regulations and current 2026 commercial safety rules supersede archived 2021 municipal fee schedules. Domestic LPG exemptions are nullified under updated fire safety bylaws.',
        },
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
    decisionPreMortem: {
      overallRiskLevel: 'Severe Risk',
      estimatedDelay: '30 to 60 Days Operational Sealing & Inspection Delay',
      consequenceSummary:
        'Launching a delivery kitchen relying on domestic LPG or unverified turnover thresholds risks immediate municipal sealing, disconnection of commercial aggregator onboarding, and statutory fines under Section 31 of the Food Safety & Standards Act.',
      criticalFailurePoints: [
        {
          darkSpotRef: 'gap-1',
          failureScenario:
            'Surprise municipal inspection flags commercial cooking on domestic LPG cylinders without Fire Department NOC.',
          penaltyOrLoss:
            'Immediate kitchen sealing, criminal notice, and compounding fines up to Rs. 2,00,000 under Fire Prevention and Safety Act.',
        },
        {
          darkSpotRef: 'conf-1',
          failureScenario:
            'Operating with Basic FSSAI Registration after surpassing Rs. 12 Lakh turnover under the false belief that PMC permits up to Rs. 20 Lakh.',
          penaltyOrLoss:
            'Penalty up to Rs. 5,00,000 and imprisonment up to 6 months for operating without mandatory State License under FSSAI Section 31.',
        },
        {
          darkSpotRef: 'gap-2',
          failureScenario:
            'Food delivery aggregators (Swiggy/Zomato) suspend merchant account due to missing Maharashtra Shop & Establishment Act (Gumasta) certificate.',
          penaltyOrLoss:
            'Complete operational standstill, de-listing from delivery platforms, and loss of commercial revenue.',
        },
      ],
    },
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
      { parameter: 'Parental Income Ceiling', status: 'conflict', linkedIds: ['conf-1'] },
      { parameter: 'Approved Foreign University & Degree Types', status: 'verified', linkedIds: ['fact-2'] },
      { parameter: 'Eligible Study Modes (Full-Time vs Hybrid/Online)', status: 'missing', linkedIds: ['gap-1'] },
      { parameter: 'Moratorium Period & Subsidy Disbursal', status: 'verified', linkedIds: ['fact-1'] },
      { parameter: 'Mandatory Income Proof & Tehsildar Document', status: 'conflict', linkedIds: ['conf-2'] },
      { parameter: 'Annual Progress Report & Bank Renewal Procedure', status: 'verified', linkedIds: ['fact-3', 'gap-3', 'time-1'] },
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
        precedenceVerdict: {
          bindingSourceId: 'src-1',
          confidence: 'Definitive Precedence',
          legalWeightReasoning:
            'Tier 1 Ministry of Education Central CSIS statutory guidelines override secondary education advisory blogs (Tier 3). The Rs. 4.50 Lakh income threshold is strict; students applying under the Rs. 6.0 Lakh figure are rejected by Canara Bank nodal audit.',
        },
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
        precedenceVerdict: {
          bindingSourceId: 'src-1',
          confidence: 'Definitive Precedence',
          legalWeightReasoning:
            'Statutory government subsidy rules mandate authorized revenue officer (Tehsildar / SDM) digital income certification. Self-attested affidavits are routinely rejected by nationalized lending institutions.',
        },
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
    decisionPreMortem: {
      overallRiskLevel: 'High Risk',
      estimatedDelay: '60 to 90 Days Subsidy Disbursal Halt & Audit Scrutiny',
      consequenceSummary:
        'Enrolling in an overseas master’s program without verified full-time accreditation or declaring income above the strict Rs. 4.5 Lakh ceiling causes immediate disqualification from the central interest subsidy, forcing the student to pay compound loan interest out-of-pocket.',
      criticalFailurePoints: [
        {
          darkSpotRef: 'gap-1',
          failureScenario:
            'Enrolling in a foreign master’s program that utilizes hybrid or online coursework, only to discover CSIS covers strictly full-time on-campus degrees.',
          penaltyOrLoss:
            'Retroactive subsidy cancellation, resulting in unbudgeted personal interest liabilities of Rs. 3,50,000 to Rs. 8,00,000 over course duration.',
        },
        {
          darkSpotRef: 'conf-1',
          failureScenario:
            'Applying for bank subsidy approval based on the Rs. 6.0 Lakh blog ceiling when actual family income is Rs. 5.2 Lakh.',
          penaltyOrLoss:
            'Nodal scheme rejection by Canara Bank, permanent loss of interest waiver, and accumulation of standard commercial loan interest rates.',
        },
        {
          darkSpotRef: 'gap-3',
          failureScenario:
            'Failing to submit annual academic marksheet and income continuation certificate to the home loan branch before the undisclosed annual cutoff date.',
          penaltyOrLoss:
            'Permanent stoppage of interest subsidy during the moratorium period.',
        },
      ],
    },
  },
};
