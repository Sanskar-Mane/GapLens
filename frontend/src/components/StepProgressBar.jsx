import React from 'react';
import { Target, Layers, Sparkles, ListChecks, CheckCircle2 } from 'lucide-react';

const STEPS = [
  {
    step: 1,
    title: 'Research Goal',
    subtitle: 'Define question & sample scenario',
    icon: Target,
  },
  {
    step: 2,
    title: 'Collect Sources',
    subtitle: 'Add URLs, extract & check dates',
    icon: Layers,
  },
  {
    step: 3,
    title: 'Gap & Conflict Analysis',
    subtitle: 'Inspect AI findings & evidence',
    icon: Sparkles,
  },
  {
    step: 4,
    title: 'Verification Checklist',
    subtitle: 'Prioritized next steps & export',
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
      className="rounded-2xl border border-slate-200 bg-white/95 p-3 sm:p-4 shadow-sm backdrop-blur-md transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900/90"
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {STEPS.map((s, index) => {
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
              className={`group relative flex items-center space-x-2.5 sm:space-x-3 rounded-xl p-2.5 sm:p-3 text-left transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-500/40'
                  : isCompleted
                  ? 'bg-slate-50 text-slate-900 hover:bg-indigo-50/70 dark:bg-slate-850 dark:text-slate-100 dark:hover:bg-slate-800/80 cursor-pointer border border-slate-200/80 dark:border-slate-800'
                  : isAccessible
                  ? 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60 cursor-pointer'
                  : 'cursor-not-allowed opacity-45 text-slate-400 dark:text-slate-600'
              }`}
            >
              {/* Step Number / Icon Badge */}
              <div
                className={`relative flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg transition-transform ${
                  isActive
                    ? 'bg-white/20 text-white ring-1 ring-white/40'
                    : isCompleted
                    ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-400 dark:ring-emerald-800'
                    : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700'
                }`}
              >
                {isCompleted && !isActive ? (
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                )}

                {/* Step number badge */}
                <span
                  className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
                    isActive
                      ? 'bg-white text-indigo-700'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {s.step}
                </span>
              </div>

              {/* Step Labels */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`text-xs font-bold truncate ${
                      isActive
                        ? 'text-white'
                        : isCompleted
                        ? 'text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                <p
                  className={`text-[10px] sm:text-[11px] truncate hidden xs:block ${
                    isActive
                      ? 'text-indigo-100'
                      : isCompleted
                      ? 'text-slate-500 dark:text-slate-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
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
