import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Calendar,
  GitCompare,
  ListChecks,
  Loader2,
} from 'lucide-react';

const ANALYSIS_STEPS = [
  {
    icon: Search,
    label: 'Searching relative websites & scraping live regulatory text...',
  },
  {
    icon: Calendar,
    label: 'Evaluating 2026 temporal currency and cycle dates...',
  },
  {
    icon: GitCompare,
    label: 'Cross-examining statements for direct contradictions...',
  },
  {
    icon: Sparkles,
    label: 'Auditing expected decision rubric for dark spots...',
  },
  {
    icon: ListChecks,
    label: 'Synthesizing prioritized official verification checklist...',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xl transition-all dark:border-white/10 dark:bg-zinc-900/90 dark:backdrop-blur-2xl dark:shadow-glass-inset text-center space-y-5">
        
        {/* Minimal Icon */}
        <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-soft dark:shadow-glow-indigo">
          <Sparkles className="h-6 w-6 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-700 text-[9px] text-white">
            <Loader2 className="h-2.5 w-2.5 animate-spin" />
          </span>
        </div>

        {/* Headings */}
        <div className="space-y-1">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            Cross-Auditing Sources
          </h3>
          <p className="text-xs text-zinc-400">
            Evaluating regulatory corpus using{' '}
            <span className="font-mono font-semibold text-zinc-900 dark:text-white">
              {activeModel?.split('/')[1]?.replace(':free', '') || 'AI Audit Engine'}
            </span>
          </p>
        </div>

        {/* Dynamic Progress Steps */}
        <div className="space-y-2 text-left">
          {ANALYSIS_STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={idx}
                className={`flex items-center space-x-2.5 rounded-xl p-2.5 text-xs transition-all ${
                  isCurrent
                    ? 'border border-zinc-900/40 bg-zinc-100 font-semibold text-zinc-900 dark:border-white/10 dark:bg-black/40 dark:shadow-glass-inset dark:text-white'
                    : isDone
                    ? 'text-zinc-400 opacity-60'
                    : 'text-zinc-300 dark:text-zinc-600'
                }`}
              >
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
                    isCurrent
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-glow-indigo'
                      : isDone
                      ? 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800/80 dark:border dark:border-white/10 dark:text-zinc-300'
                      : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-700'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                </div>
                <span className="truncate">{s.label}</span>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-zinc-400 font-mono">
          Detecting omissions &bull; Cross-checking limits &bull; Flagging drift
        </p>
      </div>
    </div>
  );
}
