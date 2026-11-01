import React, { useState } from 'react';
import {
  Sparkles,
  GraduationCap,
  Store,
  Briefcase,
  Check,
} from 'lucide-react';

export default function SampleLoader({ scenarios, onSelectScenario, activeScenarioId }) {
  if (!scenarios || scenarios.length === 0) {
    return null;
  }

  const [copiedNotification, setCopiedNotification] = useState(null);

  const handleSelect = (scenario) => {
    onSelectScenario(scenario);
    setCopiedNotification(scenario.id);
    setTimeout(() => {
      setCopiedNotification(null);
    }, 2000);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Education':
        return GraduationCap;
      case 'Business':
        return Store;
      case 'Careers':
      default:
        return Briefcase;
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 sm:p-5 shadow-soft dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        
        {/* Left explanation */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
              <Sparkles className="h-3 w-3" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
              Pre-Configured Evaluation Scenarios
            </span>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              3 Test Sets
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-2xl">
            Pre-seeded test scenarios with intentional regulatory gaps, contradicting thresholds, and temporal drift.
          </p>
        </div>

        {/* Right scenario buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {scenarios && scenarios.map((scenario) => {
            const isActive = activeScenarioId === scenario.id;
            const Icon = getCategoryIcon(scenario.category);

            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => handleSelect(scenario)}
                className={`group relative flex flex-col justify-between rounded-xl border p-3 text-left transition-all ${
                  isActive
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900 shadow-sm'
                    : 'border-zinc-200/80 bg-zinc-50 text-zinc-700 hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-850/60 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg mt-0.5 ${
                      isActive
                        ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                        : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>

                  <div className="text-left flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5 justify-between">
                      <span className="text-xs font-bold leading-tight truncate">
                        {scenario.name}
                      </span>
                      {isActive && (
                        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-[10px] mt-0.5 line-clamp-1 ${
                        isActive ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-400 dark:text-zinc-500'
                      }`}
                    >
                      {scenario.category} &bull; {(scenario.sources || []).length} Sources
                    </p>
                  </div>
                </div>

                {copiedNotification === scenario.id && (
                  <div className="mt-2 text-[10px] font-semibold text-emerald-400">
                    Loaded Scenario
                  </div>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
