import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Calendar,
  GitCompare,
  FileCheck,
  ListChecks,
  Loader2
} from 'lucide-react';

const ANALYSIS_STEPS = [
  {
    icon: Search,
    label: 'Ingesting and normalizing text across sources...',
    duration: 1200,
  },
  {
    icon: Calendar,
    label: 'Evaluating 2026 temporal currency and cycle dates...',
    duration: 1400,
  },
  {
    icon: GitCompare,
    label: 'Cross-examining statements for direct contradictions...',
    duration: 1600,
  },
  {
    icon: Sparkles,
    label: 'Auditing expected decision rubric for dark spots...',
    duration: 1500,
  },
  {
    icon: ListChecks,
    label: 'Synthesizing prioritized official verification checklist...',
    duration: 1300,
  },
];

export default function AnalysisLoadingOverlay({ activeModel, isVisible = true }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < ANALYSIS_STEPS.length - 1 ? prev + 1 : prev));
    }, 1500);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-indigo-200 bg-white p-6 shadow-2xl transition-colors duration-200 dark:border-indigo-900/60 dark:bg-slate-900 text-center space-y-5">
        
        {/* Glow decoration */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full bg-indigo-500/20 blur-2xl" />

        {/* Pulsing icon */}
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
          <Sparkles className="h-8 w-8 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">
            <Loader2 className="h-3 w-3 animate-spin" />
          </span>
        </div>

        {/* Headings */}
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Running GapLens AI Gap-Detection Engine
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cross-auditing sources via{' '}
            <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
              {activeModel || 'Free Tier Failover Queue'}
            </span>
          </p>
        </div>

        {/* Progressive Pipeline Steps */}
        <div className="space-y-2.5 text-left rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
          {ANALYSIS_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isFinished = currentStepIndex > idx;
            const isCurrent = currentStepIndex === idx;

            return (
              <div
                key={idx}
                className={`flex items-center space-x-2.5 text-xs transition-opacity ${
                  isFinished
                    ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                    : isCurrent
                    ? 'text-indigo-600 dark:text-indigo-300 font-bold'
                    : 'text-slate-400 dark:text-slate-600 opacity-60'
                }`}
              >
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
                    isFinished
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                      : isCurrent
                      ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 animate-pulse'
                      : 'bg-slate-200/60 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                  }`}
                >
                  {isFinished ? (
                    <FileCheck className="h-3 w-3" />
                  ) : isCurrent ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Icon className="h-3 w-3" />
                  )}
                </div>
                <span className="truncate">{step.label}</span>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          Multi-Model failover active &bull; Anti-Hallucination guardrails enforced
        </p>

      </div>
    </div>
  );
}
