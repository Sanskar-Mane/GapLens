import React from 'react';
import {
  Layers,
  Plus,
  FileCheck,
  CalendarClock
} from 'lucide-react';
import SourceCard from './SourceCard';

export default function SourceCollector({
  sources,
  onAddSource,
  onUpdateSource,
  onDeleteSource,
}) {
  const maxSources = 6;
  const count = sources.length;
  const canAdd = count < maxSources;

  const validSourcesCount = sources.filter(
    (s) => s.content && s.content.trim().length >= 10
  ).length;

  const undatedCount = sources.filter(
    (s) => !s.publishedDate || !s.publishedDate.trim()
  ).length;

  return (
    <div className="space-y-4">
      
      {/* Section Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900/90 sm:flex-row sm:items-center sm:justify-between sm:p-5 shadow-sm">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 ring-1 ring-indigo-300 dark:bg-indigo-600/30 dark:text-indigo-400 dark:ring-indigo-500/50">
              <Layers className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Collected Sources ({count}/{maxSources}) — Minimum 2 required for cross-verification
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Compare official notices, application portals, third-party blogs, and circulars to reveal information dark spots.
          </p>
        </div>

        {/* Source Status Pills & Add Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active sources with content */}
          <div className="flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-950">
            <FileCheck
              className={`h-3.5 w-3.5 ${
                validSourcesCount >= 2 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              }`}
            />
            <span className="text-slate-700 dark:text-slate-300">
              <strong className={validSourcesCount >= 2 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                {validSourcesCount}
              </strong>
              /{count} with text
            </span>
          </div>

          {/* Undated warnings */}
          {undatedCount > 0 && (
            <div className="flex items-center space-x-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300">
              <CalendarClock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>{undatedCount} undated</span>
            </div>
          )}

          {/* Add source button in header */}
          {canAdd && (
            <button
              type="button"
              onClick={onAddSource}
              className="inline-flex items-center space-x-1.5 rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all shadow-sm dark:border-indigo-600/60 dark:bg-indigo-600/20 dark:text-indigo-300 dark:hover:bg-indigo-600 dark:hover:text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Add Source</span>
            </button>
          )}
        </div>
      </div>

      {/* Render Individual Source Cards */}
      <div className="space-y-4">
        {sources.map((source, index) => (
          <SourceCard
            key={source.id}
            source={source}
            index={index}
            totalSources={sources.length}
            onUpdateSource={onUpdateSource}
            onDeleteSource={onDeleteSource}
          />
        ))}
      </div>

      {/* Bottom Add Source Button */}
      {canAdd ? (
        <button
          type="button"
          onClick={onAddSource}
          className="group flex w-full items-center justify-center space-x-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white/60 p-4 text-xs font-semibold text-slate-600 hover:border-indigo-500 hover:bg-indigo-50/50 hover:text-indigo-700 transition-all dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:border-indigo-600/60 dark:hover:bg-indigo-950/20 dark:hover:text-indigo-300"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-200 text-slate-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors dark:bg-slate-800 dark:text-slate-300">
            <Plus className="h-4 w-4" />
          </div>
          <span>+ Add Another Source ({count} of {maxSources} loaded)</span>
        </button>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-100 p-3 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
          Maximum of {maxSources} sources reached for this cross-verification session.
        </div>
      )}

    </div>
  );
}
