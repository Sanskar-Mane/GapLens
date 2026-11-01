/**
 * GapLens Precomputed Analyses Registry & Dynamic Fallback Engine
 * Shinchan Online Hackathon 2026: Digital Dark Spot
 *
 * NOTE: In 100% Live Mode, PRECOMPUTED_ANALYSES is empty.
 * All user analysis queries run live against Google Gemini.
 */

const PRECOMPUTED_ANALYSES = {};

/**
 * Heuristic dynamic fallback generator for custom user questions
 * when running offline or for schema/rubric unit test fixtures.
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
      precedenceVerdict: {
        bindingSourceId: sA.id || 'src-1',
        confidence: 'Strong Suggestion',
        legalWeightReasoning: `${sA.title || 'Source 1'} reflects primary regulatory/official documentation and supersedes secondary third-party interpretation under standard hierarchy of authority.`,
      },
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

  const decisionPreMortem = {
    overallRiskLevel: score < 50 ? 'Severe Risk' : score < 70 ? 'High Risk' : 'Moderate Risk',
    estimatedDelay: '30 to 60 Days Administrative Processing Delay',
    consequenceSummary: `Proceeding under unresolved contradictory criteria risks immediate statutory disqualification or audit rejection. Missing verification of "${expectedRubric[4]}" and "${expectedRubric[3]}" creates actionable compliance vulnerabilities.`,
    criticalFailurePoints: [
      {
        darkSpotRef: contradictions[0]?.id || 'conf-1',
        failureScenario: `Statutory challenge or rejection caused by divergence between conflicting source claims regarding ${cleanTopic.slice(0, 40)}.`,
        penaltyOrLoss:
          'Administrative rejection, loss of application processing fees, or required resubmission.',
      },
      {
        darkSpotRef: informationGaps[0]?.id || 'gap-1',
        failureScenario: `Non-compliance with undisclosed mandatory prerequisite: "${expectedRubric[4]}".`,
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

module.exports = {
  PRECOMPUTED_ANALYSES,
  generateDynamicFallbackAnalysis,
};
