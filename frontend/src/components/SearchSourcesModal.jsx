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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 sm:p-6 p-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200 dark:bg-indigo-950 dark:text-indigo-400 dark:ring-indigo-800">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Permitted Web Source Search
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Discover candidate notices, guidance blogs, and circulars to feed into GapLens
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
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
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 pl-10 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-950"
              />
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            </div>
            <button
              type="submit"
              disabled={searching || !query.trim()}
              className="inline-flex shrink-0 items-center space-x-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              {searching ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
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
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 className="h-7 w-7 animate-spin text-indigo-600 dark:text-indigo-400 mb-2" />
              <p className="text-xs">Querying permitted portals & indexes...</p>
            </div>
          ) : results.length > 0 ? (
            results.map((item, idx) => {
              const isImported = importedUrls.includes(item.url);
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/70 dark:hover:border-slate-700"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          {item.suggestedSourceType || 'Web Source'}
                        </span>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400 inline-flex items-center gap-1"
                        >
                          <span>{item.title}</span>
                          <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
                        </a>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.snippet}
                      </p>
                      <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate max-w-md">
                        {item.url}
                      </div>
                    </div>

                    {/* Import Buttons */}
                    <div className="shrink-0 flex flex-col gap-1.5">
                      {isImported ? (
                        <span className="inline-flex items-center space-x-1 rounded-lg bg-emerald-100 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Imported</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={!canAddMore}
                          onClick={() => handleImport(item, true)}
                          className="inline-flex items-center space-x-1 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-40 transition-colors"
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
            <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
              <AlertCircle className="h-6 w-6 text-slate-400 mb-1" />
              <p className="text-xs">No matching permitted sources found.</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Try searching with broader keywords.</p>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-3">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <span>Permitted indexing protects against hallucinated URLs</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

