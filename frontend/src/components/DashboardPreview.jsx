import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  GitCompare,
  CalendarClock,
  ListChecks,
  ShieldCheck,
  Eye,
  Sparkles
} from 'lucide-react';

export default function DashboardPreview({ lastAnalysisResult }) {
  const [showSimulatedData, setShowSimulatedData] = useState(false);

  return (
    <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
      
      {/* Section Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 ring-1 ring-indigo-300 dark:bg-indigo-600/30 dark:text-indigo-400 dark:ring-indigo-500/50">
              <Eye className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              3. GapLens Analytical Output Blueprint (5 Target Panels)
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Phase 0 & 1 Architecture blueprint defining the multi-faceted gap detection pipeline.
          </p>
        </div>

        {/* Toggle Sample Simulation for Judges */}
        <button
          type="button"
          onClick={() => setShowSimulatedData(!showSimulatedData)}
          className={`inline-flex items-center space-x-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
            showSimulatedData
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-300" />
          <span>{showSimulatedData ? 'Showing Blueprint Wireframe' : 'Preview Phase 3 Output Schema'}</span>
        </button>
      </div>

      {/* Mandatory Transparency Disclaimer Banner */}
      <div className="flex items-start space-x-3 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 ring-1 ring-indigo-300 dark:border-indigo-900/60 dark:bg-gradient-to-r dark:from-indigo-950/40 dark:via-slate-900 dark:to-indigo-950/40 dark:ring-indigo-500/20">
        <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300 space-y-0.5">
          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>Anti-Hallucination & Transparency Standard</span>
            <span className="rounded bg-indigo-100 dark:bg-indigo-900/80 px-1.5 py-0.2 text-[10px] text-indigo-800 dark:text-indigo-300 font-mono">
              Digital Dark Spot Rule
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            GapLens strictly distinguishes <strong className="text-emerald-700 dark:text-emerald-400">direct source facts</strong> from{' '}
            <strong className="text-amber-700 dark:text-amber-400">AI-detected gap signals</strong>. We never invent missing policies or generate phantom prerequisites. Always verify critical requirements with official authorities.
          </p>
        </div>
      </div>

      {/* 5 Expected Output Panels Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        
        {/* Panel 1: Sourced Facts */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:ring-emerald-800">
                <FileText className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Panel 1: Structured Cross-Source Summary</h3>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">Extracted & Corroborated Direct Facts</span>
              </div>
            </div>
            <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-mono text-emerald-800 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/60">
              Corroboration
            </span>
          </div>

          <div className="mt-4">
            {showSimulatedData ? (
              <div className="space-y-2 text-xs">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                  <div className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                    <span>Aadhaar & Bank Passbook Mandate</span>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">[Source 1, Source 2]</span>
                  </div>
                  <p className="mt-1 text-slate-700 dark:text-slate-300 text-[11px]">
                    All sources agree that valid government identity proof (Aadhaar) and active bank accounts in the student's name are mandatory.
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                  <div className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                    <span>Degree & Engineering Scope</span>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">[Source 1, Source 2]</span>
                  </div>
                  <p className="mt-1 text-slate-700 dark:text-slate-300 text-[11px]">
                    Post-Matric scheme coverage applies to post-secondary vocational, degree, and engineering cohorts.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center dark:border-slate-800 dark:bg-slate-950/40">
                <FileText className="h-8 w-8 text-slate-400 dark:text-slate-600 mb-2" />
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-300">Corroborated Facts Reservoir</div>
                <p className="mt-1 text-[11px] text-slate-500 max-w-xs">
                  Populates in Phase 3 by extracting facts verified across multiple input documents with explicit citation anchors.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Panel 2: Information Gaps & Unanswered Questions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700 ring-1 ring-amber-300 dark:bg-amber-950 dark:text-amber-400 dark:ring-amber-800">
                <AlertTriangle className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Panel 2: Potential Information Gaps</h3>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">Dark Spots & Unanswered Questions</span>
              </div>
            </div>
            <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-mono text-amber-800 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800/60">
              Dark Spot Radar
            </span>
          </div>

          <div className="mt-4">
            {showSimulatedData ? (
              <div className="space-y-2 text-xs">
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
                  <div className="font-semibold text-amber-800 dark:text-amber-300 flex items-center justify-between">
                    <span>Renewal & Year-2 Progression Criteria</span>
                    <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400">CRITICAL GAP</span>
                  </div>
                  <p className="mt-1 text-slate-700 dark:text-slate-300 text-[11px]">
                    None of the 3 sources mention minimum attendance percentage or CGPA required to retain the scholarship in subsequent academic years.
                  </p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
                  <div className="font-semibold text-amber-800 dark:text-amber-300 flex items-center justify-between">
                    <span>Portal Closing Cutoff Deadline</span>
                    <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400">OMITTED FACT</span>
                  </div>
                  <p className="mt-1 text-slate-700 dark:text-slate-300 text-[11px]">
                    Source 1 mentions online submission but omits the final application closing date for the 2026-27 cycle.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center dark:border-slate-800 dark:bg-slate-950/40">
                <AlertTriangle className="h-8 w-8 text-slate-400 dark:text-slate-600 mb-2" />
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-300">Dark Spot Detector</div>
                <p className="mt-1 text-[11px] text-slate-500 max-w-xs">
                  Surfaces omitted policies, hidden costs, renewal prerequisites, and unstated submission deadlines.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Panel 3: Source Contradiction & Conflict Radar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-700 ring-1 ring-rose-300 dark:bg-rose-950 dark:text-rose-400 dark:ring-rose-800">
                <GitCompare className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Panel 3: Contradiction & Conflict Radar</h3>
                <span className="text-[10px] text-rose-700 dark:text-rose-400 font-medium">Direct Cross-Source Conflicts</span>
              </div>
            </div>
            <span className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-mono text-rose-800 border border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800/60">
              Conflict Engine
            </span>
          </div>

          <div className="mt-4">
            {showSimulatedData ? (
              <div className="space-y-2 text-xs">
                <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 dark:border-rose-900/40 dark:bg-rose-950/20">
                  <div className="font-semibold text-rose-800 dark:text-rose-300">
                    Conflict: Family Income Eligibility Ceiling
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded bg-white p-2 border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                      <span className="font-mono text-indigo-700 dark:text-indigo-400 font-bold">[Source 1]:</span> Rs. 2,50,000 maximum annual income limit.
                    </div>
                    <div className="rounded bg-white p-2 border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                      <span className="font-mono text-rose-700 dark:text-rose-400 font-bold">[Source 2]:</span> Claims limit is up to Rs. 8,00,000.
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 dark:border-rose-900/40 dark:bg-rose-950/20">
                  <div className="font-semibold text-rose-800 dark:text-rose-300">
                    Conflict: Income Proof Format
                  </div>
                  <p className="mt-1 text-slate-700 dark:text-slate-300 text-[11px]">
                    Tehsildar certificate required by Official Notice vs Self-attested Rs. 100 Stamp Paper stated in third-party blog.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center dark:border-slate-800 dark:bg-slate-950/40">
                <GitCompare className="h-8 w-8 text-slate-400 dark:text-slate-600 mb-2" />
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-300">Source Conflict Matrix</div>
                <p className="mt-1 text-[11px] text-slate-500 max-w-xs">
                  Pinpoints conflicting numerical criteria, diverging eligibility thresholds, and incompatible instructions across inputs.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Panel 4: Outdated & Undated Source Warnings */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-purple-700 ring-1 ring-purple-300 dark:bg-purple-950 dark:text-purple-400 dark:ring-purple-800">
                <CalendarClock className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Panel 4: Temporal & Outdated Warnings</h3>
                <span className="text-[10px] text-purple-700 dark:text-purple-400 font-medium">Stale Cycles & Temporal Drift</span>
              </div>
            </div>
            <span className="rounded bg-purple-50 px-2 py-0.5 text-[10px] font-mono text-purple-800 border border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800/60">
              Temporal Radar
            </span>
          </div>

          <div className="mt-4">
            {showSimulatedData ? (
              <div className="space-y-2 text-xs">
                <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-3 dark:border-purple-900/40 dark:bg-purple-950/20">
                  <div className="font-semibold text-purple-800 dark:text-purple-300 flex items-center justify-between">
                    <span>Archived 2023-24 Circular Superseded</span>
                    <span className="text-[10px] font-mono text-purple-700 dark:text-purple-400">[Source 3]</span>
                  </div>
                  <p className="mt-1 text-slate-700 dark:text-slate-300 text-[11px]">
                    Source 3 mandates in-person submission to District Nodal Officer by Nov 2023. This is an outdated historical cycle superseded by 2026 digital portal workflow.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center dark:border-slate-800 dark:bg-slate-950/40">
                <CalendarClock className="h-8 w-8 text-slate-400 dark:text-slate-600 mb-2" />
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-300">Temporal Staleness Detector</div>
                <p className="mt-1 text-[11px] text-slate-500 max-w-xs">
                  Flags obsolete application windows, legacy offline procedures, and unverified undated guides.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Panel 5: Prioritized Verification Checklist (Spans full width) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300 dark:bg-indigo-950 dark:text-indigo-400 dark:ring-indigo-800">
              <ListChecks className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Panel 5: Prioritized Next-Step Verification Checklist</h3>
              <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-medium">Actionable Resolution Path</span>
            </div>
          </div>
          <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-mono text-indigo-800 border border-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800/60">
            Action Items
          </span>
        </div>

        <div className="mt-4">
          {showSimulatedData ? (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center space-x-2 text-rose-700 dark:text-rose-400 font-semibold mb-1">
                  <span className="rounded bg-rose-100 dark:bg-rose-950 px-1.5 py-0.5 text-[10px] border border-rose-300 dark:border-rose-800">Priority 1</span>
                  <span>Confirm Income Limit</span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300">
                  Verify with college nodal desk whether Rs. 2.5L is for general quota or if Rs. 8L applies to specific category exemptions.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-400 font-semibold mb-1">
                  <span className="rounded bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 text-[10px] border border-amber-300 dark:border-amber-800">Priority 2</span>
                  <span>Official Tehsildar Certificate</span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300">
                  Do not rely on the stamp paper affidavit mentioned in third-party guides; secure the digital Tehsildar certificate.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-400 font-semibold mb-1">
                  <span className="rounded bg-indigo-100 dark:bg-indigo-950 px-1.5 py-0.5 text-[10px] border border-indigo-200 dark:border-indigo-800">Priority 3</span>
                  <span>Ignore Offline 2023 Submission</span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300">
                  Submit exclusively via the 2026-27 state portal; physical nodal officer submission is deprecated.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center dark:border-slate-800 dark:bg-slate-950/40">
              <ListChecks className="h-8 w-8 text-slate-400 dark:text-slate-600 mb-2" />
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-300">Actionable Resolution Checklist</div>
              <p className="mt-1 text-[11px] text-slate-500 max-w-md">
                Translates detected information gaps and cross-source conflicts into an ordered checklist for the user to resolve before submitting applications or signing contracts.
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
