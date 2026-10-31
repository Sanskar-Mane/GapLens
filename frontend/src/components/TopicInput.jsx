import React from 'react';
import {
  Tag,
  Search,
  AlertTriangle,
  GitCompare,
  CalendarClock,
  ListChecks,
  X,
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
    label: 'Missing Renewal Rules',
    icon: AlertTriangle,
    desc: 'Uncovers omitted eligibility clauses & hidden prerequisites',
  },
  {
    label: 'Cross-Source Conflicts',
    icon: GitCompare,
    desc: 'Highlights conflicting income limits, fees, or documents',
  },
  {
    label: 'Outdated Circulars',
    icon: CalendarClock,
    desc: 'Detects superseded circulars & stale submission methods',
  },
  {
    label: 'Verification Checklist',
    icon: ListChecks,
    desc: 'Actionable steps to resolve blind spots before committing',
  },
];

export default function TopicInput({
  topic,
  onTopicChange,
  category,
  onCategoryChange,
  onReset,
}) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-soft dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
      
      {/* Header section with category dropdown */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
              <Search className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
              1. Research Question / Decision Goal
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Define what high-stakes decision, application, or policy you are investigating.
          </p>
        </div>

        {/* Category Picker */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <Tag className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Category:</span>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="rounded-xl border border-zinc-200/80 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-900 focus:border-zinc-900 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
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
            className="w-full resize-none rounded-xl border border-zinc-200/80 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-hidden font-medium leading-relaxed dark:border-zinc-800 dark:bg-zinc-850 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-100 transition-all"
          />
          {topic && (
            <button
              type="button"
              onClick={() => onTopicChange('')}
              className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-md"
              title="Clear topic"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* 4 Pillars Information Banner */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {INSPECTION_PILLARS.map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <div
              key={idx}
              className="rounded-xl border border-zinc-200/60 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-850/50"
            >
              <div className="flex items-center space-x-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                  {pillar.label}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-zinc-400 dark:text-zinc-500 line-clamp-2">
                {pillar.desc}
              </p>
            </div>
          );
        })}
      </div>

    </div>
  );
}
