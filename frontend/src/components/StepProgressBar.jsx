import React from 'react';
import { Target, Layers, Sparkles, ListChecks, Check } from 'lucide-react';

const STEPS = [
  {
    step: 1,
    title: 'Research Goal',
    subtitle: 'Define query & category',
    icon: Target,
  },
  {
    step: 2,
    title: 'Source Workspace',
    subtitle: 'Extract text & verify dates',
    icon: Layers,
  },
  {
    step: 3,
    title: 'Gap & Conflict Dashboard',
    subtitle: 'Inspect dark spots & contradictions',
    icon: Sparkles,
  },
  {
    step: 4,
    title: 'Verification Checklist',
    subtitle: 'Action items & official inquiry',
    icon: ListChecks,
  },
];

export default function StepProgressBar({
  currentStep,
  onStepClick,
  hasAnalysis = false,
  sourcesCount = 0,
}) {
  return (
    <nav
      aria-label="Wizard Steps Progress"
      className="rounded-2xl border border-zinc-200/80 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900 shadow-soft"
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const isActive = currentStep === s.step;
          const isCompleted = currentStep > s.step || (s.step <= 2 && hasAnalysis);
          const isAccessible =
            s.step === 1 ||
            s.step === 2 ||
            (s.step === 3 && hasAnalysis) ||
            (s.step === 4 && hasAnalysis);

          return (
            <button
              key={s.step}
              type="button"
              disabled={!isAccessible}
              onClick={() => isAccessible && onStepClick(s.step)}
              className={`group relative flex items-center space-x-3 rounded-xl p-3 text-left transition-all ${
                isActive
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                  : isCompleted
                  ? 'bg-zinc-50 text-zinc-900 hover:bg-zinc-100 dark:bg-zinc-850 dark:text-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800 cursor-pointer'
                  : isAccessible
                  ? 'bg-transparent text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/60 cursor-pointer'
                  : 'cursor-not-allowed opacity-40 text-zinc-400 dark:text-zinc-600'
              }`}
            >
              {/* Step Icon Badge */}
              <div
                className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform ${
                  isActive
                    ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                    : isCompleted
                    ? 'bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200'
                    : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
                }`}
              >
                {isCompleted && !isActive ? (
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>

              {/* Step Labels */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider opacity-60">
                    Step {s.step}
                  </span>
                  {s.step === 2 && sourcesCount > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[9px] font-mono font-bold ${
                        isActive
                          ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                          : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200'
                      }`}
                    >
                      {sourcesCount}
                    </span>
                  )}
                </div>
                <p className="truncate text-xs font-bold mt-0.5">
                  {s.title}
                </p>
                <p className="hidden lg:block truncate text-[10px] opacity-70">
                  {s.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
