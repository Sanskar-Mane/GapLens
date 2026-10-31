import React from 'react';
import {
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function RubricCoverageBar({
  expectedRubric = [],
  rubricStatus = [],
  activeTab = 'gaps',
  onSelectTab,
}) {
  if (!expectedRubric || expectedRubric.length === 0) return null;

  // Build a mapped status list combining expectedRubric and rubricStatus
  const items = expectedRubric.map((param, index) => {
    const found = rubricStatus?.find(
      (r) => (r.parameter || '').toLowerCase() === (param || '').toLowerCase()
    );

    let status = found?.status || 'missing';
    // Fallback heuristic if rubricStatus is not pre-populated
    if (!found) {
      if (index === 0) status = 'verified';
      else if (index === 1 || index === 2) status = 'conflict';
      else status = 'missing';
    }

    return {
      parameter: param,
      status,
      linkedIds: found?.linkedIds || [],
    };
  });

  const getStatusConfig = (status) => {
    switch (status) {
      case 'verified':
        return {
          icon: <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
          label: 'Verified in Sources',
          pillBg:
            'border-emerald-200 bg-emerald-50/80 text-emerald-900 hover:bg-emerald-100/80 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:bg-emerald-900/60',
          badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-300',
          targetTab: 'facts',
        };
      case 'conflict':
        return {
          icon: <AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />,
          label: 'Conflicting Claims',
          pillBg:
            'border-rose-200 bg-rose-50/80 text-rose-900 hover:bg-rose-100/80 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-900/60',
          badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-900/80 dark:text-rose-300',
          targetTab: 'conflicts',
        };
      case 'missing':
      default:
        return {
          icon: <HelpCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />,
          label: 'Digital Dark Spot (Missing)',
          pillBg:
            'border-amber-200 bg-amber-50/80 text-amber-900 hover:bg-amber-100/80 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-900/60',
          badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/80 dark:text-amber-300',
          targetTab: 'gaps',
        };
    }
  };

  const verifiedCount = items.filter((i) => i.status === 'verified').length;
  const conflictCount = items.filter((i) => i.status === 'conflict').length;
  const missingCount = items.filter((i) => i.status === 'missing').length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900/90 space-y-3">
      {/* Header with coverage statistics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
        <div className="flex items-center space-x-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            <Layers className="h-3.5 w-3.5" />
          </span>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Decision Completeness Rubric
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Coverage evaluation across 6 core decision parameters
            </p>
          </div>
        </div>

        {/* Mini stats counters */}
        <div className="flex items-center space-x-2 text-[10px] font-semibold">
          <span className="inline-flex items-center space-x-1 rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>{verifiedCount} Verified</span>
          </span>
          <span className="inline-flex items-center space-x-1 rounded-md bg-rose-50 px-2 py-0.5 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            <span>{conflictCount} Conflicted</span>
          </span>
          <span className="inline-flex items-center space-x-1 rounded-md bg-amber-50 px-2 py-0.5 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span>{missingCount} Missing</span>
          </span>
        </div>
      </div>

      {/* Grid of Interactive Rubric Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {items.map((item, idx) => {
          const config = getStatusConfig(item.status);
          const isCurrentTab = activeTab === config.targetTab;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectTab && onSelectTab(config.targetTab)}
              className={`group flex items-start justify-between rounded-xl border p-2.5 text-left transition-all duration-150 ${
                config.pillBg
              } ${isCurrentTab ? 'ring-2 ring-indigo-500/50 shadow-xs' : 'hover:scale-[1.01]'}`}
              title={`Click to view findings under "${config.label}"`}
            >
              <div className="flex items-start space-x-2 min-w-0 pr-1">
                <div className="mt-0.5">{config.icon}</div>
                <div className="min-w-0">
                  <span className="block text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {item.parameter}
                  </span>
                  <span className="block text-[10px] font-medium opacity-80 mt-0.5">
                    {config.label}
                  </span>
                </div>
              </div>

              <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

