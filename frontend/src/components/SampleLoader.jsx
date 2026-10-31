import React, { useState } from 'react';
import {
  Sparkles,
  GraduationCap,
  Store,
  Briefcase,
  Check
} from 'lucide-react';

export default function SampleLoader({ scenarios, onSelectScenario, activeScenarioId }) {
  const [copiedNotification, setCopiedNotification] = useState(null);

  const handleSelect = (scenario) => {
    onSelectScenario(scenario);
    setCopiedNotification(scenario.id);
    setTimeout(() => {
      setCopiedNotification(null);
    }, 2000);
  };

  const getCategoryTheme = (category) => {
    switch (category) {
      case 'Education':
        return {
          icon: GraduationCap,
          iconStyle: 'bg-blue-100 text-blue-700 ring-1 ring-blue-300 dark:bg-blue-950 dark:text-blue-400 dark:ring-blue-800/60',
          badgeStyle: 'text-blue-700 dark:text-blue-400',
        };
      case 'Business':
        return {
          icon: Store,
          iconStyle: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:ring-emerald-800/60',
          badgeStyle: 'text-emerald-700 dark:text-emerald-400',
        };
      case 'Careers':
      default:
        return {
          icon: Briefcase,
          iconStyle: 'bg-purple-100 text-purple-700 ring-1 ring-purple-300 dark:bg-purple-950 dark:text-purple-400 dark:ring-purple-800/60',
          badgeStyle: 'text-purple-700 dark:text-purple-400',
        };
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-white/80 p-4 shadow-sm transition-colors duration-200 dark:border-indigo-900/40 dark:bg-gradient-to-r dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900 sm:p-5">
      {/* Background glow decoration in dark mode */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        
        {/* Left explanation */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 ring-1 ring-indigo-300 dark:bg-indigo-600/30 dark:text-indigo-400 dark:ring-indigo-500/50">
              <Sparkles className="h-3 w-3" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              Quick-Load Judge Scenarios (Digital Dark Spot Cases)
            </span>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-900/60 dark:text-indigo-300 dark:ring-indigo-700/60">
              3 Enriched Test Sets
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
            Pre-seeded realistic datasets engineered with intentional cross-source gaps, conflicting thresholds, and temporal drift.
          </p>
        </div>

        {/* Right scenario buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {scenarios && scenarios.map((scenario) => {
            const isActive = activeScenarioId === scenario.id;
            const theme = getCategoryTheme(scenario.category);
            const Icon = theme.icon;

            return (
              <button
                key={scenario.id}
                onClick={() => handleSelect(scenario)}
                className={`group relative flex flex-col justify-between rounded-xl border p-3 text-left transition-all ${
                  isActive
                    ? 'border-indigo-600 bg-indigo-50/90 text-slate-900 shadow-sm ring-1 ring-indigo-500/50 dark:border-indigo-500 dark:bg-indigo-950/80 dark:text-white dark:shadow-md dark:shadow-indigo-500/20'
                    : 'border-slate-200 bg-slate-50/80 text-slate-700 hover:border-slate-300 hover:bg-white hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg mt-0.5 ${theme.iconStyle}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>

                  <div className="text-left flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5 justify-between">
                      <span className="text-xs font-bold leading-tight truncate">{scenario.name}</span>
                      {isActive && (
                        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white dark:text-slate-950">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center space-x-1 text-[10px] text-slate-500 dark:text-slate-400">
                      <span className={`font-semibold ${theme.badgeStyle}`}>{scenario.category}</span>
                      <span>&bull;</span>
                      <span>{scenario.sources?.length || 3} Sources</span>
                    </div>
                  </div>
                </div>

                {/* Testing Pill Banner */}
                <div className="mt-2.5 rounded-lg border border-slate-200 bg-white/70 px-2 py-1 text-[10px] font-mono text-slate-600 dark:border-slate-800/80 dark:bg-slate-900/60 dark:text-slate-400 truncate">
                  {scenario.testingPill || scenario.flawsSummary}
                </div>

                {copiedNotification === scenario.id && (
                  <span className="absolute -top-2 right-2 rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-bold text-white shadow-md animate-bounce">
                    Loaded!
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
