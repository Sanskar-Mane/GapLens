/**
 * Pre-seeded realistic sample datasets for GapLens
 * Problem Statement: Digital Dark Spot (Shinchan Online Hackathon 2026)
 *
 * Each dataset contains deliberate, realistic information defects:
 * - Omitted mandatory conditions (e.g. renewal criteria, exact cutoff deadlines)
 * - Cross-source factual contradictions (conflicting income limits, conflicting paperwork)
 * - Outdated temporal information (superseded circulars from prior cycles)
 * - Undated sources triggering temporal uncertainty alerts
 */

const sampleScenarios = [
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

module.exports = sampleScenarios;
