import React from 'react';
import {
  Layers,
  Plus,
  FileCheck,
  CalendarClock,
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
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-soft dark:border-zinc-800 dark:bg-zinc-900 transition-colors sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
              <Layers className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
              Collected Sources ({count}/{maxSources}) — Min 2 required for cross-verification
            </h2>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Compare official notices, application portals, circulars, and secondary guidance to reveal dark spots.
          </p>
        </div>

        {/* Source Status Pills & Add Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active sources with text */}
          <div className="flex items-center space-x-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50">
            <span className={`h-1.5 w-1.5 rounded-full ${validSourcesCount >= 2 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>{validSourcesCount}/{count} with text</span>
          </div>

          {/* Undated warnings */}
          {undatedCount > 0 && (
            <div className="flex items-center space-x-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>{undatedCount} undated</span>
            </div>
          )}

          {/* Add source button in header */}
          {canAdd && (
            <button
              type="button"
              onClick={onAddSource}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all shadow-soft"
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
          className="group flex w-full items-center justify-center space-x-2 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 p-4 text-xs font-semibold text-zinc-600 hover:border-zinc-900 hover:bg-white hover:text-zinc-900 transition-all dark:bg-zinc-900/40 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-850 dark:hover:text-white"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-200 text-zinc-700 group-hover:bg-zinc-900 group-hover:text-white transition-colors dark:bg-zinc-800 dark:text-zinc-300 dark:group-hover:bg-white dark:group-hover:text-zinc-900">
            <Plus className="h-4 w-4" />
          </div>
          <span>+ Add Another Source ({count} of {maxSources} loaded)</span>
        </button>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-zinc-100 p-3 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-850 dark:text-zinc-400">
          Maximum of {maxSources} sources reached for this cross-verification session.
        </div>
      )}

    </div>
  );
}
