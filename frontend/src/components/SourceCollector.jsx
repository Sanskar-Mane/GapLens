import React from 'react';
import {
  Layers,
  Plus,
  FileCheck,
  CalendarClock,
  Globe,
  Loader2,
  Sparkles,
} from 'lucide-react';
import SourceCard from './SourceCard';

export default function SourceCollector({
  sources,
  onAddSource,
  onUpdateSource,
  onDeleteSource,
  onAutoDiscoverSources,
  isAutoDiscovering = false,
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

  const autoDiscoveredCount = sources.filter((s) => s.isAutoDiscovered).length;

  return (
    <div className="space-y-4">
      
      {/* Section Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-zinc-900/40 dark:backdrop-blur-xl dark:shadow-glass-inset transition-colors sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-glow-indigo">
              <Layers className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
              Collected Sources ({count}/{maxSources}) — Min 2 required for cross-verification
            </h2>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Compare official notices, application portals, circulars, and relative web guidance to reveal dark spots.
          </p>
        </div>

        {/* Source Status Pills & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active sources with text */}
          <div className="flex items-center space-x-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/60 px-3 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-white/10 dark:shadow-glass-inset">
            <span className={`h-1.5 w-1.5 rounded-full ${validSourcesCount >= 2 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>{validSourcesCount}/{count} with text</span>
          </div>

          {/* Auto-discovered indicator badge */}
          {autoDiscoveredCount > 0 && (
            <div className="flex items-center space-x-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20 dark:shadow-glass-inset">
              <Globe className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
              <span>{autoDiscoveredCount} web scraped</span>
            </div>
          )}

          {/* Undated warnings */}
          {undatedCount > 0 && (
            <div className="flex items-center space-x-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/60 px-3 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-white/10 dark:shadow-glass-inset">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>{undatedCount} undated</span>
            </div>
          )}

          {/* Autonomous Discovery Header Button */}
          {canAdd && typeof onAutoDiscoverSources === 'function' && (
            <button
              type="button"
              onClick={onAutoDiscoverSources}
              disabled={isAutoDiscovering}
              className="inline-flex items-center space-x-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20 dark:shadow-glass-inset transition-all disabled:opacity-50 cursor-pointer"
            >
              {isAutoDiscovering ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                  <span>Scanning Relative Web...</span>
                </>
              ) : (
                <>
                  <Globe className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Scan &amp; Pull Relative Websites</span>
                </>
              )}
            </button>
          )}

          {/* Add source button in header */}
          {canAdd && (
            <button
              type="button"
              onClick={onAddSource}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:hover:shadow-glow-indigo transition-all shadow-soft"
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

      {/* Bottom Add Source / Auto-Scan Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {canAdd && (
          <button
            type="button"
            onClick={onAddSource}
            className="group flex flex-1 w-full items-center justify-center space-x-2 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-white/10 bg-white/50 p-4 text-xs font-semibold text-zinc-600 hover:border-zinc-900 hover:bg-white hover:text-zinc-900 transition-all dark:bg-zinc-900/30 dark:backdrop-blur-sm dark:text-zinc-400 dark:hover:border-white/30 dark:hover:bg-zinc-850/50 dark:hover:text-white dark:shadow-glass-inset"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-200 text-zinc-700 group-hover:bg-zinc-900 group-hover:text-white transition-colors dark:bg-zinc-800/80 dark:border dark:border-white/10 dark:text-zinc-300 dark:group-hover:bg-white dark:group-hover:text-zinc-900">
              <Plus className="h-4 w-4" />
            </div>
            <span>+ Add Another Source Manually ({sources.length}/6)</span>
          </button>
        )}

        {canAdd && typeof onAutoDiscoverSources === 'function' && (
          <button
            type="button"
            onClick={onAutoDiscoverSources}
            disabled={isAutoDiscovering}
            className="group flex flex-1 w-full items-center justify-center space-x-2 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-500/30 bg-indigo-50/40 p-4 text-xs font-semibold text-indigo-700 hover:border-indigo-600 hover:bg-indigo-50 hover:text-indigo-900 transition-all dark:bg-indigo-950/20 dark:backdrop-blur-sm dark:text-indigo-300 dark:hover:border-indigo-400 dark:hover:bg-indigo-900/30 dark:hover:text-white dark:shadow-glass-inset"
          >
            {isAutoDiscovering ? (
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Globe className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            )}
            <span>
              {isAutoDiscovering
                ? 'Autonomous Relative Web Discovery in Progress...'
                : `Auto-Scrape Relative Websites for This Goal (${sources.length}/6)`}
            </span>
          </button>
        )}
      </div>

    </div>
  );
}
