import React from 'react';
import {
  Tag,
  Search,
  AlertTriangle,
  GitCompare,
  CalendarClock,
  ListChecks,
  CheckCircle2,
  X
} from 'lucide-react';

const CATEGORIES = [
  'Education',
  'Careers',
  'Public Services',
  'Research',
  'Business',
];

const INSPECTION_PILLARS = [
  {
    label: 'Missing Renewal/Hidden Rules',
    icon: AlertTriangle,
    color: 'text-amber-800 bg-amber-50 border-amber-300 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-800/60',
    desc: 'Uncovers omitted eligibility clauses & hidden prerequisites',
  },
  {
    label: 'Cross-Source Contradictions',
    icon: GitCompare,
    color: 'text-rose-800 bg-rose-50 border-rose-300 dark:text-rose-300 dark:bg-rose-950/40 dark:border-rose-800/60',
    desc: 'Highlights conflicting income limits, fees, or documents',
  },
  {
    label: 'Outdated Cycles/Dates',
    icon: CalendarClock,
    color: 'text-purple-800 bg-purple-50 border-purple-300 dark:text-purple-300 dark:bg-purple-950/40 dark:border-purple-800/60',
    desc: 'Detects superseded circulars & stale submission methods',
  },
  {
    label: 'Prioritized Verification Checklist',
    icon: ListChecks,
    color: 'text-emerald-800 bg-emerald-50 border-emerald-300 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800/60',
    desc: 'Actionable steps to resolve blind spots before committing',
  },
];

export default function TopicInput({
  topic,
  onTopicChange,
  category,
  onCategoryChange,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900/95 sm:p-6">
      
      {/* Header section with category dropdown */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 ring-1 ring-indigo-300 dark:bg-indigo-600/30 dark:text-indigo-400 dark:ring-indigo-500/50">
              <Search className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              1. Research Question / Decision Goal
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define what high-stakes decision, application, or policy you are investigating.
          </p>
        </div>

        {/* Category Picker */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <Tag className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Category:</span>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-indigo-300"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Topic Input Field */}
      <div className="mt-4">
        <div className="relative">
          <textarea
            rows={2}
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            placeholder="e.g. What should I verify before applying for the State Post-Matric Scholarship? (Or describe your licensing/academic query...)"
            className="w-full resize-none rounded-xl border border-slate-300 bg-slate-100/70 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium leading-relaxed dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-950 transition-all"
          />
          {topic && (
            <button
              onClick={() => onTopicChange('')}
              className="absolute top-3 right-3 rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              title="Clear topic"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Character count & validation indicator */}
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-1.5">
            {topic.trim().length >= 8 ? (
              <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Decision goal formulated</span>
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400">
                Enter a concise question or decision objective (at least 8 characters)
              </span>
            )}
          </div>
          <span>{topic.length} characters</span>
        </div>
      </div>

      {/* Helper chips: What GapLens cross-examines */}
      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          GapLens Automated Cross-Examination Pillars:
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {INSPECTION_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className={`flex items-start space-x-2 rounded-xl border p-2.5 transition-colors ${pillar.color}`}
              >
                <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-semibold leading-tight">{pillar.label}</div>
                  <div className="mt-0.5 text-[10px] opacity-85 leading-snug">{pillar.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
