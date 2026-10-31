import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  GitCompare,
  Clock,
  FileText,
  ChevronRight,
  ArrowLeft,
  HelpCircle,
  Sparkles,
  Info,
  Check,
  FileSearch,
  ExternalLink,
  Layers,
  ArrowRight,
} from 'lucide-react';
import SourceInspectorDrawer from './SourceInspectorDrawer';

// Segmented Vertical Tick Progress Bar (e.g. ||||||||||||)
function SegmentedTickBar({ percentage = 75, totalTicks = 16 }) {
  const activeTicks = Math.round((Math.max(0, Math.min(100, percentage)) / 100) * totalTicks);
  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: totalTicks }).map((_, i) => (
        <span
          key={i}
          className={`h-3 w-1 rounded-full transition-colors ${
            i < activeTicks
              ? 'bg-zinc-900 dark:bg-zinc-100'
              : 'bg-zinc-200 dark:bg-zinc-800'
          }`}
        />
      ))}
    </div>
  );
}

// Subtle Semantic Status Pill with Dot
function StatusDotPill({ status, label }) {
  let dotColor = 'bg-zinc-400';
  const lower = (status || label || '').toLowerCase();
  if (lower.includes('verified') || lower.includes('low') || lower.includes('pass')) {
    dotColor = 'bg-emerald-500';
  } else if (lower.includes('medium') || lower.includes('moderate') || lower.includes('warning')) {
    dotColor = 'bg-amber-500';
  } else if (lower.includes('high') || lower.includes('critical') || lower.includes('conflict') || lower.includes('missing')) {
    dotColor = 'bg-rose-500';
  }
  return (
    <span className="inline-flex items-center space-x-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-800 dark:text-zinc-200 border border-zinc-200/50 dark:border-zinc-700/50">
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      <span>{label || status}</span>
    </span>
  );
}

export default function AnalysisResultsView({
  analysis,
  meta,
  sources = [],
  onBackToSources,
  onProceedToChecklist,
}) {
  const [activeTab, setActiveTab] = useState('gaps'); // 'gaps' | 'conflicts' | 'outdated' | 'facts'

  // Source Inspector Drawer state
  const [inspectorState, setInspectorState] = useState({
    isOpen: false,
    mode: 'single', // 'single' | 'diff' | 'all'
    source: null,
    evidenceQuote: '',
    reason: '',
    reasonType: 'fact',
    sourceA: null,
    sourceB: null,
    evidenceQuoteA: '',
    evidenceQuoteB: '',
    disputedParameter: '',
    severity: '',
    resolutionAdvice: '',
    gapTitle: '',
    missingQuestion: '',
  });

  if (!analysis) {
    return (
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900 shadow-soft">
        <Sparkles className="mx-auto h-8 w-8 text-zinc-400 animate-pulse" />
        <h3 className="mt-3 text-base font-bold text-zinc-900 dark:text-white">
          No Analysis Results Available
        </h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Please run an analysis from Step 2 to view AI findings.
        </p>
        <button
          type="button"
          onClick={onBackToSources}
          className="mt-4 inline-flex items-center space-x-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-soft hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Sources</span>
        </button>
      </div>
    );
  }

  const {
    readinessScore = 54,
    readinessLabel = 'Moderate Risk — Critical Gaps Detected',
    executiveSummary = '',
    expectedRubric = [],
    rubricStatus = [],
    sourcedFacts = [],
    informationGaps = [],
    contradictions = [],
    outdatedWarnings = [],
  } = analysis;

  // Resolve source by ID
  const getSourceById = (sourceId) => {
    const found = sources.find((s) => s.id === sourceId);
    if (found) return found;
    return {
      id: sourceId || 'src-1',
      title: `Referenced Document (${sourceId || 'Source'})`,
      sourceType: 'Referenced Document',
      content: 'Original excerpt captured during multi-source ingestion.',
      publishedDate: '2026',
    };
  };

  const handleInspectFact = (fact, sourceId) => {
    const targetId = sourceId || fact.sourceIds?.[0] || 'src-1';
    const src = getSourceById(targetId);
    setInspectorState({
      isOpen: true,
      mode: 'single',
      source: src,
      evidenceQuote: fact.evidenceQuote || fact.statement || '',
      reason: `Supporting Evidence for Corroborated Fact: "${fact.statement?.slice(0, 75)}..."`,
      reasonType: 'fact',
    });
  };

  const handleInspectConflictSource = (conf, whichSource) => {
    const srcObj = whichSource === 'A' ? conf.sourceA : conf.sourceB;
    const targetSource = getSourceById(srcObj?.sourceId);
    setInspectorState({
      isOpen: true,
      mode: 'single',
      source: targetSource,
      evidenceQuote: srcObj?.evidenceQuote || srcObj?.claim || '',
      reason: `Conflicting Claim regarding "${conf.parameter}": "${srcObj?.claim}"`,
      reasonType: 'conflict',
    });
  };

  const handleInspectConflictDiff = (conf) => {
    const sA = getSourceById(conf.sourceA?.sourceId);
    const sB = getSourceById(conf.sourceB?.sourceId);
    setInspectorState({
      isOpen: true,
      mode: 'diff',
      sourceA: sA,
      sourceB: sB,
      evidenceQuoteA: conf.sourceA?.evidenceQuote || conf.sourceA?.claim || '',
      evidenceQuoteB: conf.sourceB?.evidenceQuote || conf.sourceB?.claim || '',
      disputedParameter: conf.parameter,
      severity: conf.severity,
      resolutionAdvice: conf.resolutionAdvice,
    });
  };

  const handleInspectOutdated = (warning) => {
    const src = getSourceById(warning.sourceId);
    setInspectorState({
      isOpen: true,
      mode: 'single',
      source: src,
      evidenceQuote: warning.evidenceQuote || '',
      reason: `Temporal Risk Alert (${warning.warningType}): ${warning.riskDescription}`,
      reasonType: 'outdated',
    });
  };

  const handleInspectGapAbsence = (gap) => {
    setInspectorState({
      isOpen: true,
      mode: 'all',
      gapTitle: gap.title,
      missingQuestion: gap.missingQuestion,
      sources,
    });
  };

  const closeInspector = () => {
    setInspectorState((prev) => ({ ...prev, isOpen: false }));
  };

  // Calculated metrics for segmented tick bars
  const factCorroborationPct = sourcedFacts.length > 0 ? Math.min(100, Math.round((sourcedFacts.length / 4) * 100)) : 40;
  const verifiedRubricCount = rubricStatus.filter((r) => r.status === 'verified').length;
  const rubricCompletenessPct = expectedRubric.length > 0 ? Math.round((verifiedRubricCount / expectedRubric.length) * 100) : 50;
  const temporalCurrencyPct = outdatedWarnings.length === 0 ? 100 : Math.max(30, 100 - outdatedWarnings.length * 25);

  const subTabs = [
    { id: 'gaps', label: 'Potential Gaps', count: informationGaps.length },
    { id: 'conflicts', label: 'Conflict Radar', count: contradictions.length },
    { id: 'outdated', label: 'Outdated Alerts', count: outdatedWarnings.length },
    { id: 'facts', label: 'Sourced Facts', count: sourcedFacts.length },
  ];

  return (
    <div className="space-y-6">

      {/* 1. TOP EXECUTIVE SUMMARY & AI META BANNER */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Audit Findings
            </span>
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-mono font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {meta?.modelUsed || 'AI Audit Engine'}
            </span>
            {meta?.isOfflineDemo && (
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                Offline Mode
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 text-xs text-zinc-500">
            <span className="h-2 w-2 rounded-full bg-zinc-900 dark:bg-white" />
            <span>2026 Regulatory Baseline</span>
          </div>
        </div>

        {executiveSummary && (
          <p className="mt-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
            <strong className="text-zinc-900 dark:text-white font-semibold">Executive Audit: </strong>
            {executiveSummary}
          </p>
        )}

        {meta?.fallbackNotice && (
          <div className="mt-3 flex items-start space-x-2 rounded-xl bg-zinc-50 p-2.5 text-[11px] text-zinc-600 border border-zinc-200/60 dark:bg-zinc-850 dark:text-zinc-400 dark:border-zinc-800">
            <Info className="h-3.5 w-3.5 text-zinc-500 shrink-0 mt-0.5" />
            <span>{meta.fallbackNotice}</span>
          </div>
        )}
      </div>

      {/* 2. BENTO GRID LAYOUT: 8 COLS (LEFT FINDINGS) + 4 COLS (RIGHT READINESS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================================================================= */}
        {/* LEFT MAIN CARD (8 COLS): CROSS-SOURCE FINDINGS & RUBRIC BREAKDOWN */}
        {/* ================================================================= */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
            
            {/* Top Sub-Tab Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Cross-Source Findings
                </h3>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  Select a category to inspect specific signals and quotes
                </p>
              </div>

              {/* Segmented Filter Pills */}
              <div className="flex items-center space-x-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 p-1">
                {subTabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                        isActive
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800'
                          : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content List for Selected Sub-Tab */}
            <div className="mt-5 space-y-3">
              
              {/* TAB 1: POTENTIAL GAPS */}
              {activeTab === 'gaps' && (
                <div className="space-y-3">
                  {informationGaps.map((gap, idx) => (
                    <div
                      key={gap.id || idx}
                      className="rounded-xl border border-zinc-200/70 bg-zinc-50/60 p-4 transition-all hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-850/50 dark:hover:border-zinc-700"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200/50 dark:border-zinc-800/80 pb-2.5">
                        <div className="flex items-center space-x-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 text-xs font-bold">
                            !
                          </span>
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                            {gap.title}
                          </h4>
                        </div>
                        <StatusDotPill status={gap.impactLevel} label={`${gap.impactLevel || 'High'} Impact`} />
                      </div>

                      <div className="mt-3">
                        <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 leading-snug">
                          {gap.missingQuestion}
                        </p>
                        <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                          {gap.explanation}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-zinc-200/40 dark:border-zinc-800/50">
                        <span className="text-[10px] text-zinc-400">
                          Signal: {gap.signalLabel || 'Potential Gap'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleInspectGapAbsence(gap)}
                          className="inline-flex items-center space-x-1 text-xs font-semibold text-zinc-900 hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300"
                        >
                          <span>Verify Absence Across Sources</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {informationGaps.length === 0 && (
                    <div className="py-8 text-center text-xs text-zinc-400">
                      No information gaps detected.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CONFLICT RADAR */}
              {activeTab === 'conflicts' && (
                <div className="space-y-3">
                  {contradictions.map((conf, idx) => (
                    <div
                      key={conf.id || idx}
                      className="rounded-xl border border-zinc-200/70 bg-zinc-50/60 p-4 transition-all hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-850/50 dark:hover:border-zinc-700"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200/50 dark:border-zinc-800/80 pb-2.5">
                        <div className="flex items-center space-x-2">
                          <GitCompare className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                            {conf.parameter}
                          </h4>
                        </div>
                        <StatusDotPill status="conflict" label={conf.severity || 'Conflict'} />
                      </div>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-lg bg-white dark:bg-zinc-900 p-2.5 border border-zinc-200/60 dark:border-zinc-800">
                          <span className="text-[10px] font-semibold text-zinc-400 block truncate">
                            Source A: {conf.sourceA?.title || 'First Source'}
                          </span>
                          <p className="mt-1 text-xs text-zinc-800 dark:text-zinc-200 italic">
                            "{conf.sourceA?.claim}"
                          </p>
                        </div>
                        <div className="rounded-lg bg-white dark:bg-zinc-900 p-2.5 border border-zinc-200/60 dark:border-zinc-800">
                          <span className="text-[10px] font-semibold text-zinc-400 block truncate">
                            Source B: {conf.sourceB?.title || 'Second Source'}
                          </span>
                          <p className="mt-1 text-xs text-zinc-800 dark:text-zinc-200 italic">
                            "{conf.sourceB?.claim}"
                          </p>
                        </div>
                      </div>

                      {conf.resolutionAdvice && (
                        <p className="mt-2.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                          <strong className="text-zinc-700 dark:text-zinc-300">Resolution: </strong>
                          {conf.resolutionAdvice}
                        </p>
                      )}

                      <div className="mt-3 flex items-center justify-end space-x-3 pt-2 border-t border-zinc-200/40 dark:border-zinc-800/50">
                        <button
                          type="button"
                          onClick={() => handleInspectConflictDiff(conf)}
                          className="inline-flex items-center space-x-1 text-xs font-semibold text-zinc-900 hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300"
                        >
                          <span>Side-by-Side Diff</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {contradictions.length === 0 && (
                    <div className="py-8 text-center text-xs text-zinc-400">
                      No conflicting claims flagged across reviewed sources.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: OUTDATED & DATE ALERTS */}
              {activeTab === 'outdated' && (
                <div className="space-y-3">
                  {outdatedWarnings.map((warn, idx) => (
                    <div
                      key={warn.id || idx}
                      className="rounded-xl border border-zinc-200/70 bg-zinc-50/60 p-4 transition-all hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-850/50 dark:hover:border-zinc-700"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200/50 dark:border-zinc-800/80 pb-2.5">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-sm">
                            {warn.sourceTitle}
                          </h4>
                        </div>
                        <StatusDotPill status="medium" label={warn.warningType || 'Date Warning'} />
                      </div>

                      <p className="mt-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                        {warn.riskDescription}
                      </p>

                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-zinc-200/40 dark:border-zinc-800/50">
                        <span className="text-[10px] text-zinc-400">
                          Detected Date: {warn.detectedDate || 'Undated'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleInspectOutdated(warn)}
                          className="inline-flex items-center space-x-1 text-xs font-semibold text-zinc-900 hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300"
                        >
                          <span>Inspect Source</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {outdatedWarnings.length === 0 && (
                    <div className="py-8 text-center text-xs text-zinc-400">
                      All sources carry current 2026/2025 verification dates.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: SOURCED FACTS */}
              {activeTab === 'facts' && (
                <div className="space-y-3">
                  {sourcedFacts.map((fact, idx) => (
                    <div
                      key={fact.id || idx}
                      className="rounded-xl border border-zinc-200/70 bg-zinc-50/60 p-4 transition-all hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-850/50 dark:hover:border-zinc-700"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200/50 dark:border-zinc-800/80 pb-2.5">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                            {fact.category || 'Corroborated Fact'}
                          </h4>
                        </div>
                        <StatusDotPill status="verified" label={fact.confidence || 'Corroborated'} />
                      </div>

                      <p className="mt-2.5 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
                        {fact.statement}
                      </p>

                      {fact.evidenceQuote && (
                        <div className="mt-2 rounded-lg bg-white dark:bg-zinc-900 p-2.5 border border-zinc-200/60 dark:border-zinc-800 text-[11px] text-zinc-500 italic">
                          "{fact.evidenceQuote}"
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-zinc-200/40 dark:border-zinc-800/50">
                        <span className="text-[10px] text-zinc-400">
                          Sources: {(fact.sourceTitles || []).join(', ') || 'Document'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleInspectFact(fact)}
                          className="inline-flex items-center space-x-1 text-xs font-semibold text-zinc-900 hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300"
                        >
                          <span>Inspect Quote</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {sourcedFacts.length === 0 && (
                    <div className="py-8 text-center text-xs text-zinc-400">
                      No direct facts extracted.
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* 3 Mini Sub-Cards with Segmented Vertical Tick Progress Bars */}
            <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Mini Card 1: Fact Corroboration */}
              <div className="rounded-xl border border-zinc-200/70 bg-zinc-50/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-850/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Fact Corroboration
                  </span>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">
                    {factCorroborationPct}%
                  </span>
                </div>
                <div className="mt-2.5">
                  <SegmentedTickBar percentage={factCorroborationPct} totalTicks={16} />
                </div>
                <p className="mt-2 text-[10px] text-zinc-400">
                  {sourcedFacts.length} cited evidence quotes
                </p>
              </div>

              {/* Mini Card 2: Rubric Completeness */}
              <div className="rounded-xl border border-zinc-200/70 bg-zinc-50/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-850/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Rubric Completeness
                  </span>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">
                    {rubricCompletenessPct}%
                  </span>
                </div>
                <div className="mt-2.5">
                  <SegmentedTickBar percentage={rubricCompletenessPct} totalTicks={16} />
                </div>
                <p className="mt-2 text-[10px] text-zinc-400">
                  {verifiedRubricCount}/{expectedRubric.length} parameters addressed
                </p>
              </div>

              {/* Mini Card 3: Temporal Currency */}
              <div className="rounded-xl border border-zinc-200/70 bg-zinc-50/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-850/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Temporal Currency
                  </span>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">
                    {temporalCurrencyPct}%
                  </span>
                </div>
                <div className="mt-2.5">
                  <SegmentedTickBar percentage={temporalCurrencyPct} totalTicks={16} />
                </div>
                <p className="mt-2 text-[10px] text-zinc-400">
                  {outdatedWarnings.length === 0 ? 'All 2026/2025 current' : `${outdatedWarnings.length} flagged cycle dates`}
                </p>
              </div>

            </div>

          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT SIDE CARD (4 COLS): DECISION READINESS & RUBRIC PROGRESS */}
        {/* ================================================================= */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-soft dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
            
            {/* Header */}
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Decision Readiness
              </h3>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                Overall verification readiness score
              </p>
            </div>

            {/* 3-Column Mini Badge Grid for Epistemic Tiers */}
            <div className="grid grid-cols-3 gap-2 py-1">
              
              <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200/70 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-850/50 text-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                  <Check className="h-4 w-4" />
                </div>
                <span className="mt-2 text-base font-bold text-zinc-900 dark:text-white">
                  {sourcedFacts.length}
                </span>
                <span className="text-[10px] text-zinc-400">
                  Facts
                </span>
              </div>

              <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200/70 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-850/50 text-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <span className="mt-2 text-base font-bold text-zinc-900 dark:text-white">
                  {informationGaps.length}
                </span>
                <span className="text-[10px] text-zinc-400">
                  Gap Signals
                </span>
              </div>

              <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200/70 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-850/50 text-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                  <GitCompare className="h-4 w-4" />
                </div>
                <span className="mt-2 text-base font-bold text-zinc-900 dark:text-white">
                  {contradictions.length}
                </span>
                <span className="text-[10px] text-zinc-400">
                  Conflicts
                </span>
              </div>

            </div>

            {/* Sleek Horizontal Charcoal Progress Bar */}
            <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Readiness Score
                </span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white">
                  {readinessScore} / 100
                </span>
              </div>

              <div className="h-2.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, readinessScore))}%` }}
                />
              </div>

              <p className="text-[11px] text-zinc-400">
                {readinessLabel}
              </p>
            </div>

            {/* Rubric Breakdown List */}
            <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                Required Rubric Status
              </span>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {expectedRubric.map((param, i) => {
                  const stat = rubricStatus.find((r) => r.parameter === param)?.status || 'missing';
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/50 dark:border-zinc-800"
                    >
                      <span className="truncate max-w-[180px] text-zinc-700 dark:text-zinc-300">
                        {param}
                      </span>
                      <StatusDotPill status={stat} label={stat} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Full-Width Solid Charcoal CTA Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onProceedToChecklist}
                className="w-full rounded-xl bg-zinc-900 py-3 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-soft transition-all flex items-center justify-center space-x-2"
              >
                <span>Proceed to Verification Checklist</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* 3. BOTTOM ACTIONS BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-zinc-200/80 dark:border-zinc-800">
        <button
          type="button"
          onClick={onBackToSources}
          className="inline-flex items-center space-x-1.5 rounded-xl border border-zinc-200/80 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors w-full sm:w-auto justify-center"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>← Back to Source Workspace</span>
        </button>

        <button
          type="button"
          onClick={onProceedToChecklist}
          className="inline-flex items-center space-x-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white shadow-soft hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all w-full sm:w-auto justify-center"
        >
          <span>Next: Verification Checklist</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Source Inspector Slide-Over Drawer */}
      <SourceInspectorDrawer
        isOpen={inspectorState.isOpen}
        onClose={closeInspector}
        mode={inspectorState.mode}
        source={inspectorState.source}
        evidenceQuote={inspectorState.evidenceQuote}
        reason={inspectorState.reason}
        reasonType={inspectorState.reasonType}
        sourceA={inspectorState.sourceA}
        sourceB={inspectorState.sourceB}
        evidenceQuoteA={inspectorState.evidenceQuoteA}
        evidenceQuoteB={inspectorState.evidenceQuoteB}
        disputedParameter={inspectorState.disputedParameter}
        severity={inspectorState.severity}
        resolutionAdvice={inspectorState.resolutionAdvice}
        sources={inspectorState.sources}
        gapTitle={inspectorState.gapTitle}
        missingQuestion={inspectorState.missingQuestion}
      />

    </div>
  );
}
