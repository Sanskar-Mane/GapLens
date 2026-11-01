import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Globe,
  ExternalLink,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers
} from 'lucide-react';
import { searchWebSources } from '../services/api';

export default function SearchSourcesModal({
  isOpen,
  onClose,
  initialQuery = '',
  onImportSource,
  canAddMore = true,
}) {
  const [query, setQuery] = useState(initialQuery);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [importedUrls, setImportedUrls] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const q = initialQuery.trim() || 'Post-Matric Scholarship guidelines';
      setQuery(q);
      handleExecuteSearch(q);
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  const handleExecuteSearch = async (searchTerm) => {
    const q = (searchTerm || query).trim();
    if (!q) return;

    setSearching(true);
    setHasSearched(true);
    const searchData = await searchWebSources(q);
    setResults(searchData);
    setSearching(false);
  };

  const handleImport = (item, shouldExtract = true) => {
    if (!canAddMore) return;
    onImportSource({
      title: item.title,
      url: item.url,
      content: item.snippet || '',
      sourceType: item.suggestedSourceType || 'Third-Party Guide',
      autoExtract: shouldExtract,
    });
    setImportedUrls((prev) => [...prev, item.url]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-zinc-200/90 bg-white shadow-2xl transition-all dark:border-white/10 dark:bg-zinc-900/90 dark:backdrop-blur-2xl dark:shadow-glass-inset sm:p-6 p-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-glow-indigo">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Permitted Web Source Search
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Discover candidate notices, guidance blogs, and circulars to feed into GapLens
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExecuteSearch(query);
            }}
            className="flex items-center space-x-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search policy circulars, scheme guidelines, or licensing portals..."
                className="w-full rounded-xl border border-zinc-200/90 bg-zinc-50 px-4 py-2.5 pl-10 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-hidden dark:border-white/10 dark:bg-black/40 dark:text-zinc-100 dark:placeholder-zinc-600 dark:focus:border-indigo-500/50 dark:focus:ring-1 dark:focus:ring-indigo-500/50 shadow-inner transition-all"
              />
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
            </div>
            <button
              type="submit"
              disabled={searching || !query.trim()}
              className="inline-flex shrink-0 items-center space-x-1.5 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white shadow-soft hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:hover:shadow-glow-indigo disabled:opacity-50 transition-all"
            >
              {searching ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Search className="h-3.5 w-3.5" />
              )}
              <span>{searching ? 'Searching...' : 'Search'}</span>
            </button>
          </form>
          {!canAddMore && (
            <div className="mt-2 text-[11px] text-amber-600 dark:text-amber-400">
              Workspace full (6 of 6 sources loaded). Remove a source to import more.
            </div>
          )}
        </div>

        {/* Results Container */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1 min-h-[220px]">
          {searching ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
              <Loader2 className="h-7 w-7 animate-spin text-zinc-900 dark:text-indigo-400 mb-2" />
              <p className="text-xs">Querying permitted portals & indexes...</p>
            </div>
          ) : results.length > 0 ? (
            results.map((item, idx) => {
              const isImported = importedUrls.includes(item.url);
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-zinc-200/70 bg-zinc-50/70 p-3.5 transition-all hover:border-zinc-300 dark:border-white/10 dark:bg-black/30 dark:shadow-glass-inset dark:hover:border-white/20"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:border dark:border-white/10 dark:text-zinc-300">
                          {item.suggestedSourceType || 'Web Source'}
                        </span>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-zinc-900 hover:text-zinc-600 dark:text-white dark:hover:text-zinc-300 inline-flex items-center gap-1"
                        >
                          <span>{item.title}</span>
                          <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
                        </a>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {item.snippet}
                      </p>
                      <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 truncate max-w-md">
                        {item.url}
                      </div>
                    </div>

                    {/* Import Buttons */}
                    <div className="shrink-0 flex flex-col gap-1.5">
                      {isImported ? (
                        <span className="inline-flex items-center space-x-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:border dark:border-emerald-500/20 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Imported</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={!canAddMore}
                          onClick={() => handleImport(item, true)}
                          className="inline-flex items-center space-x-1 rounded-lg bg-zinc-900 px-2.5 py-1.5 text-xs font-semibold text-white shadow-soft hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:hover:shadow-glow-indigo disabled:opacity-40 transition-all"
                          title="Import into workspace and automatically scrape its full text"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>+ Import as Source</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : hasSearched ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-zinc-400">
              <AlertCircle className="h-6 w-6 text-zinc-400 mb-1" />
              <p className="text-xs">No matching permitted sources found.</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Try searching with broader keywords.</p>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3">
          <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Permitted indexing protects against hallucinated URLs</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>

      </div>
    </div>
  );
}

