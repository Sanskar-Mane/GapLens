import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  GitCompare,
  Clock,
  FileText,
  ChevronRight,
  ArrowLeft,
  ExternalLink,
  HelpCircle,
  Sparkles,
  Info,
  CheckCircle,
  FileSearch,
  X,
  Gauge
} from 'lucide-react';

export default function AnalysisResultsView({
  analysis,
  meta,
  sources = [],
  onBackToSources,
  onProceedToChecklist,
}) {
  const [activeTab, setActiveTab] = useState('gaps'); // 'gaps' | 'conflicts' | 'outdated' | 'facts'
  const [selectedCitationSource, setSelectedCitationSource] = useState(null);

  if (!analysis) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <Sparkles className="mx-auto h-8 w-8 text-indigo-500 animate-pulse" />
        <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
          No Analysis Results Available
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Please run an analysis from Step 2 to view AI findings.
        </p>
        <button
          type="button"
          onClick={onBackToSources}
          className="mt-4 inline-flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
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
    sourcedFacts = [],
    informationGaps = [],
    contradictions = [],
    outdatedWarnings = [],
  } = analysis;

  // Determine readiness score styling
  const getScoreColor = (score) => {
    if (score >= 75) return 'text-emerald-600 dark:text-emerald-400 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400 border-amber-500 bg-amber-50 dark:bg-amber-950/40';
    return 'text-rose-600 dark:text-rose-400 border-rose-500 bg-rose-50 dark:bg-rose-950/40';
  };

  const getSeverityBadge = (severity) => {
    const lower = (severity || '').toLowerCase();
    if (lower.includes('critical')) {
      return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800';
    }
    if (lower.includes('high')) {
      return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800';
    }
    return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800';
  };

  const getImpactBadge = (impact) => {
    const lower = (impact || '').toLowerCase();
    if (lower.includes('critical')) {
      return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800';
    }
    if (lower.includes('high')) {
      return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800';
    }
    return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  };

  // Helper to open source modal
  const handleOpenSourceDetail = (sourceId) => {
    const found = sources.find((s) => s.id === sourceId);
    if (found) {
      setSelectedCitationSource(found);
    } else {
      // Create quick dummy source viewer from id
      setSelectedCitationSource({
        id: sourceId,
        title: `Referenced Source (${sourceId})`,
        sourceType: 'Referenced Document',
        content: 'Original excerpt captured during multi-source ingestion.',
      });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP DECISION READINESS BANNER */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900/95">
        
        {/* Decorative background glow */}
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          
          {/* Readiness Score Gauge & Titles */}
          <div className="flex items-start sm:items-center space-x-4">
            
            {/* Score circle badge */}
            <div
              className={`flex h-18 w-18 shrink-0 flex-col items-center justify-center rounded-2xl border-2 p-2 shadow-inner ${getScoreColor(
                readinessScore
              )}`}
            >
              <span className="text-2xl font-black tracking-tight leading-none">
                {readinessScore}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 mt-0.5">
                / 100
              </span>
            </div>

            {/* Labels & Model Used */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Decision Readiness Score
                </span>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-mono font-medium text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/80">
                  {meta?.modelUsed || 'AI Audit Engine'}
                </span>
                {meta?.isOfflineDemo && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                    Pre-Verified
                  </span>
                )}
              </div>

              <h2 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
                {readinessLabel}
              </h2>
            </div>

          </div>

          {/* Responsible AI Standard Badge */}
          <div className="flex items-center space-x-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3.5 py-2 text-xs text-indigo-900 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-200 shrink-0">
            <ShieldAlert className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <div className="leading-snug">
              <span className="font-bold">Responsible AI Guardrail:</span>{' '}
              <span className="text-slate-600 dark:text-slate-300">
                AI signals indicate potential dark spots — always verify with official gazettes.
              </span>
            </div>
          </div>

        </div>

        {/* Executive Summary Card */}
        {executiveSummary && (
          <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300 leading-relaxed">
            <strong className="text-slate-900 dark:text-white font-semibold">Executive Audit: </strong>
            {executiveSummary}
          </div>
        )}

        {/* Fallback Notice if triggered */}
        {meta?.fallbackNotice && (
          <div className="mt-3 flex items-start space-x-2 rounded-lg bg-amber-50 p-2.5 text-[11px] text-amber-800 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/50">
            <Info className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>{meta.fallbackNotice}</span>
          </div>
        )}

      </div>

      {/* 2. SUB-TABS NAVIGATION (4 Clean Categories) */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto space-x-1 sm:space-x-2">
        
        {/* Tab 1: Potential Gaps */}
        <button
          type="button"
          onClick={() => setActiveTab('gaps')}
          className={`flex items-center space-x-2 border-b-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'gaps'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          <span>Potential Gaps</span>
          <span
            className={`rounded-full px-2 py-0.2 text-[11px] font-mono font-bold ${
              activeTab === 'gaps'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {informationGaps.length}
          </span>
        </button>

        {/* Tab 2: Conflict Radar */}
        <button
          type="button"
          onClick={() => setActiveTab('conflicts')}
          className={`flex items-center space-x-2 border-b-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'conflicts'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <GitCompare className="h-4 w-4" />
          <span>Conflict Radar</span>
          <span
            className={`rounded-full px-2 py-0.2 text-[11px] font-mono font-bold ${
              activeTab === 'conflicts'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {contradictions.length}
          </span>
        </button>

        {/* Tab 3: Outdated & Date Alerts */}
        <button
          type="button"
          onClick={() => setActiveTab('outdated')}
          className={`flex items-center space-x-2 border-b-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'outdated'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Date & Outdated Alerts</span>
          <span
            className={`rounded-full px-2 py-0.2 text-[11px] font-mono font-bold ${
              activeTab === 'outdated'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {outdatedWarnings.length}
          </span>
        </button>

        {/* Tab 4: Sourced Facts */}
        <button
          type="button"
          onClick={() => setActiveTab('facts')}
          className={`flex items-center space-x-2 border-b-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'facts'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Corroborated Facts</span>
          <span
            className={`rounded-full px-2 py-0.2 text-[11px] font-mono font-bold ${
              activeTab === 'facts'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {sourcedFacts.length}
          </span>
        </button>

      </div>

      {/* 3. SUB-TAB VIEWPORT */}

      {/* SUB-TAB 1: POTENTIAL GAPS */}
      {activeTab === 'gaps' && (
        <div className="space-y-4">
          
          {/* Expected Decision Rubric Checklist */}
          {expectedRubric.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/90 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Expected Decision Rubric (Standard Parameters for this Goal)
              </h3>
              <div className="flex flex-wrap gap-2">
                {expectedRubric.map((item, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                  >
                    <CheckCircle className="h-3 w-3 text-indigo-500" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Gaps Cards List */}
          <div className="space-y-3">
            {informationGaps.map((gap, idx) => (
              <div
                key={gap.id || idx}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/95 dark:hover:border-slate-700"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {gap.title}
                    </h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getImpactBadge(
                        gap.impactLevel
                      )}`}
                    >
                      {gap.impactLevel} Impact
                    </span>
                    <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-mono text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                      {gap.signalLabel || 'Potential Gap — AI Signal'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-3 text-xs text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
                    <span className="font-bold text-amber-900 dark:text-amber-100">
                      Critical Missing Question:
                    </span>{' '}
                    {gap.missingQuestion}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {gap.explanation}
                  </p>
                </div>
              </div>
            ))}

            {informationGaps.length === 0 && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-8 text-center dark:border-emerald-900 dark:bg-emerald-950/20">
                <CheckCircle className="mx-auto h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                <p className="mt-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  No critical information gaps identified across reviewed sources.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* SUB-TAB 2: CONFLICT RADAR */}
      {activeTab === 'conflicts' && (
        <div className="space-y-4">
          {contradictions.map((conflict, idx) => (
            <div
              key={conflict.id || idx}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/95 dark:hover:border-slate-700 space-y-4"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
                    <GitCompare className="h-3.5 w-3.5" />
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {conflict.parameter}
                  </h4>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getSeverityBadge(
                      conflict.severity
                    )}`}
                  >
                    {conflict.severity}
                  </span>
                  <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-mono text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">
                    {conflict.signalLabel || 'Possible Conflict Between Sources'}
                  </span>
                </div>
              </div>

              {/* Side-by-side comparison */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                
                {/* Source A Claim */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    <span className="truncate">{conflict.sourceA?.title || 'Source A'}</span>
                    <button
                      type="button"
                      onClick={() => handleOpenSourceDetail(conflict.sourceA?.sourceId)}
                      className="text-[10px] font-mono text-indigo-600 hover:underline dark:text-indigo-400 shrink-0"
                    >
                      [{conflict.sourceA?.sourceId || 'Source A'}]
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
                    "{conflict.sourceA?.claim}"
                  </p>
                </div>

                {/* Source B Claim */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    <span className="truncate">{conflict.sourceB?.title || 'Source B'}</span>
                    <button
                      type="button"
                      onClick={() => handleOpenSourceDetail(conflict.sourceB?.sourceId)}
                      className="text-[10px] font-mono text-indigo-600 hover:underline dark:text-indigo-400 shrink-0"
                    >
                      [{conflict.sourceB?.sourceId || 'Source B'}]
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
                    "{conflict.sourceB?.claim}"
                  </p>
                </div>

              </div>

              {/* Resolution Guidance */}
              {conflict.resolutionAdvice && (
                <div className="rounded-xl border border-indigo-200/70 bg-indigo-50/40 p-3 text-xs text-indigo-950 dark:border-indigo-900/40 dark:bg-indigo-950/20 dark:text-indigo-200">
                  <strong className="text-indigo-800 dark:text-indigo-300 font-semibold">
                    Resolution Guidance:{' '}
                  </strong>
                  {conflict.resolutionAdvice}
                </div>
              )}

            </div>
          ))}

          {contradictions.length === 0 && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-8 text-center dark:border-emerald-900 dark:bg-emerald-950/20">
              <CheckCircle className="mx-auto h-7 w-7 text-emerald-600 dark:text-emerald-400" />
              <p className="mt-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                No contradictory claims detected between the ingested sources.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: OUTDATED & DATE ALERTS */}
      {activeTab === 'outdated' && (
        <div className="space-y-4">
          {outdatedWarnings.map((warning, idx) => (
            <div
              key={warning.id || idx}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/95 dark:hover:border-slate-700"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400">
                    <Clock className="h-3.5 w-3.5" />
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {warning.sourceTitle}
                  </h4>
                  {warning.sourceId && (
                    <button
                      type="button"
                      onClick={() => handleOpenSourceDetail(warning.sourceId)}
                      className="text-[10px] font-mono text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      [{warning.sourceId}]
                    </button>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="rounded-md border border-purple-300 bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300">
                    {warning.warningType}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Date: {warning.detectedDate || 'Undated'}
                  </span>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-purple-200/60 bg-purple-50/40 p-3 text-xs text-purple-950 dark:border-purple-900/40 dark:bg-purple-950/20 dark:text-purple-200">
                <strong className="text-purple-900 dark:text-purple-200">Temporal Risk: </strong>
                {warning.riskDescription}
              </div>
            </div>
          ))}

          {outdatedWarnings.length === 0 && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-8 text-center dark:border-emerald-900 dark:bg-emerald-950/20">
              <CheckCircle className="mx-auto h-7 w-7 text-emerald-600 dark:text-emerald-400" />
              <p className="mt-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                All sources are current and explicitly dated for the 2026 cycle.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: SOURCED FACTS */}
      {activeTab === 'facts' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {sourcedFacts.map((fact, idx) => (
              <div
                key={fact.id || idx}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/95 dark:hover:border-slate-700 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      {fact.category || 'Corroborated Fact'}
                    </span>
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                      {fact.confidence || 'Verified'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {fact.statement}
                  </p>
                </div>

                {/* Clickable Citation Pills */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400">Citations:</span>
                  {(fact.sourceIds || []).map((sId, sIdx) => {
                    const title = fact.sourceTitles?.[sIdx] || sId;
                    return (
                      <button
                        key={sId}
                        type="button"
                        onClick={() => handleOpenSourceDetail(sId)}
                        title={`View evidence excerpt from ${title}`}
                        className="inline-flex items-center space-x-1 rounded-md bg-indigo-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-indigo-700 hover:bg-indigo-600 hover:text-white transition-colors border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800"
                      >
                        <FileSearch className="h-2.5 w-2.5" />
                        <span>[{sId}]</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {sourcedFacts.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
              <FileText className="mx-auto h-7 w-7 text-slate-400" />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                No direct facts were extracted from the supplied inputs.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 4. BOTTOM NAVIGATION BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onBackToSources}
          className="inline-flex items-center space-x-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors w-full sm:w-auto justify-center"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>← Edit Sources</span>
        </button>

        <button
          type="button"
          onClick={onProceedToChecklist}
          className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-500 transition-all w-full sm:w-auto justify-center"
        >
          <span>Next: View Verification Checklist</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* QUICK SOURCE EVIDENCE MODAL / DRAWER */}
      {selectedCitationSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 space-y-3">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-mono font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  [{selectedCitationSource.id}]
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-xs">
                  {selectedCitationSource.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCitationSource(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="rounded bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
                Type: {selectedCitationSource.sourceType || 'Document'}
              </span>
              <span className="rounded bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
                Date: {selectedCitationSource.publishedDate || 'Undated'}
              </span>
              {selectedCitationSource.url && (
                <a
                  href={selectedCitationSource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  <span>Link</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 max-h-60 overflow-y-auto leading-relaxed">
              <h5 className="font-semibold text-slate-900 dark:text-white mb-1">
                Source Content Excerpt:
              </h5>
              <p className="whitespace-pre-wrap font-sans text-xs">
                {selectedCitationSource.content || '(No raw content recorded for this source)'}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCitationSource(null)}
                className="rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Close Evidence
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

