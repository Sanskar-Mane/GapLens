import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Trash2,
  Sparkles,
  Loader2,
  Clock,
  FileUp,
  CalendarSearch,
  Check,
  AlertTriangle,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { extractUrlContent, scanTextMetadata } from '../services/api';

const SOURCE_TYPES = [
  'Official Notice',
  'Third-Party Guide',
  'Archived Circular',
  'News Article',
  'Forum/Other',
];

export default function SourceCard({
  source,
  index,
  totalSources,
  onUpdateSource,
  onDeleteSource,
}) {
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState(null);
  const [extractSuccess, setExtractSuccess] = useState(null);
  const [detectingDate, setDetectingDate] = useState(false);
  const [viewMode, setViewMode] = useState('markdown');
  const [temporalInfo, setTemporalInfo] = useState({
    temporalStatus: 'undated',
    detectedDate: '',
  });

  const fileInputRef = useRef(null);

  const wordCount = source.content ? source.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = source.content?.length || 0;

  // Run initial or debounced temporal detection on content/date change
  useEffect(() => {
    let active = true;
    const runScan = async () => {
      if (source.content && source.content.trim().length > 15) {
        const res = await scanTextMetadata(source.content, source.publishedDate);
        if (active) {
          setTemporalInfo({
            temporalStatus: res.temporalStatus,
            detectedDate: res.detectedDate || source.publishedDate || '',
          });
        }
      } else {
        const hasDate = Boolean(source.publishedDate && source.publishedDate.trim());
        if (active) {
          setTemporalInfo({
            temporalStatus: hasDate ? (source.publishedDate.includes('2023') || source.publishedDate.includes('2021') ? 'outdated' : 'current') : 'undated',
            detectedDate: source.publishedDate || '',
          });
        }
      }
    };
    runScan();
    return () => {
      active = false;
    };
  }, [source.content, source.publishedDate]);

  const handleFieldChange = (field, val) => {
    onUpdateSource(source.id, { [field]: val });
  };

  // Auto-Extract URL content with modular extraction engine
  const handleExtractUrl = async () => {
    if (!source.url || !source.url.trim()) {
      setExtractError('Please enter a valid URL first (e.g. https://...).');
      return;
    }

    setExtracting(true);
    setExtractError(null);
    setExtractSuccess(null);

    const result = await extractUrlContent(source.url.trim());
    setExtracting(false);

    if (result.success && (result.content || result.markdownText || result.plainText)) {
      const markdown = result.markdownText || result.content;
      const plain = result.plainText || result.content;
      onUpdateSource(source.id, {
        content: viewMode === 'plain' ? plain : markdown,
        markdownText: markdown,
        plainText: plain,
        ...(result.title && (!source.title || source.title.startsWith('Source ')) ? { title: result.title } : {}),
        ...(result.detectedDate && !source.publishedDate ? { publishedDate: result.detectedDate } : {}),
      });
      setExtractSuccess(`Extracted ${markdown.length} characters.`);
      setTimeout(() => setExtractSuccess(null), 4000);
    } else {
      setExtractError(result.error || result.message || 'Failed to extract web content.');
    }
  };

  // Local File Upload (.txt or .md)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        handleFieldChange('content', text);
        const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        if (!source.title || source.title.startsWith('Source ')) {
          handleFieldChange('title', fileNameWithoutExt);
        }
        setExtractSuccess(`Loaded file "${file.name}" (${text.length} characters)`);
        setTimeout(() => setExtractSuccess(null), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Auto-Detect Date
  const handleAutoDetectDate = async () => {
    if (!source.content) return;
    setDetectingDate(true);
    const res = await scanTextMetadata(source.content, source.publishedDate);
    setDetectingDate(false);

    if (res.detectedDate) {
      handleFieldChange('publishedDate', res.detectedDate);
      setTemporalInfo({
        temporalStatus: res.temporalStatus,
        detectedDate: res.detectedDate,
      });
      setExtractSuccess(`Detected date: ${res.detectedDate}`);
      setTimeout(() => setExtractSuccess(null), 3000);
    } else {
      setExtractError('No dates detected in text.');
      setTimeout(() => setExtractError(null), 3000);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-soft dark:bg-zinc-900/50 dark:backdrop-blur-md dark:border-white/10 dark:shadow-glass-inset transition-colors">
      
      {/* Top Bar: Source ID, Type, Date Status, Upload & Delete */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 dark:border-white/10 pb-3">
        
        {/* Source ID and Type */}
        <div className="flex items-center space-x-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-mono font-bold">
            {index + 1}
          </span>
          <span className="text-xs font-mono font-bold text-zinc-900 dark:text-white">
            {source.id || `src-${index + 1}`}
          </span>

          {/* Auto-discovered web badge */}
          {source.isAutoDiscovered && (
            <span className="inline-flex items-center space-x-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20">
              <Globe className="h-2.5 w-2.5 text-indigo-600 dark:text-indigo-400" />
              <span>Auto-Discovered Web Source</span>
            </span>
          )}

          {/* Temporal status dot badge */}
          {temporalInfo.temporalStatus === 'undated' && (
            <span className="inline-flex items-center space-x-1 rounded-full bg-zinc-100 dark:bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-zinc-700 dark:text-amber-400 border border-zinc-200/60 dark:border-amber-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>Undated</span>
            </span>
          )}

          {temporalInfo.temporalStatus === 'outdated' && (
            <span className="inline-flex items-center space-x-1 rounded-full bg-zinc-100 dark:bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-zinc-700 dark:text-rose-400 border border-zinc-200/60 dark:border-rose-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              <span>Outdated Cycle</span>
            </span>
          )}
        </div>

        {/* Type Select, File Upload, Delete Action */}
        <div className="flex items-center space-x-2">
          <select
            value={source.sourceType}
            onChange={(e) => handleFieldChange('sourceType', e.target.value)}
            className="rounded-xl border border-zinc-200/80 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-800 focus:border-zinc-900 focus:outline-hidden dark:bg-black/40 dark:border-white/10 dark:text-zinc-200 dark:focus:border-indigo-500/50"
          >
            {SOURCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Upload .txt/.md File Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.md"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Upload local .txt or .md document"
            className="inline-flex items-center space-x-1 rounded-xl border border-zinc-200/80 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-700/80 dark:border-white/10 dark:text-zinc-300 dark:hover:text-white transition-all"
          >
            <FileUp className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" />
            <span className="hidden sm:inline">Upload File</span>
          </button>

          {/* Delete Source button */}
          <button
            type="button"
            disabled={totalSources <= 2}
            onClick={() => onDeleteSource(source.id)}
            title={
              totalSources <= 2
                ? 'Minimum 2 sources required for cross-verification'
                : 'Remove this source'
            }
            className={`rounded-xl p-1.5 transition-colors ${
              totalSources <= 2
                ? 'cursor-not-allowed text-zinc-300 dark:text-zinc-700'
                : 'text-zinc-400 hover:bg-zinc-100 hover:text-rose-600 dark:hover:bg-zinc-800 dark:hover:text-rose-400'
            }`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

      </div>

      {/* Grid Inputs: Title, Date/Cycle, URL + Auto-Extract */}
      <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-12">
        
        {/* Source Title */}
        <div className="sm:col-span-5">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
            Source Title
          </label>
          <input
            type="text"
            value={source.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            placeholder="Official State Portal"
            className="w-full rounded-xl border border-zinc-200/80 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-hidden font-medium dark:bg-black/40 dark:border-white/10 dark:text-zinc-100 dark:placeholder-zinc-600 dark:focus:border-indigo-500/50 dark:focus:ring-1 dark:focus:ring-indigo-500/50 shadow-inner transition-all"
          />
        </div>

        {/* Publication Date / Cycle + Auto-Detect Button */}
        <div className="sm:col-span-3">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Date / Cycle
            </label>
            <button
              type="button"
              disabled={detectingDate || !source.content}
              onClick={handleAutoDetectDate}
              title="Auto-scan pasted content to detect dates"
              className="inline-flex items-center space-x-1 text-[10px] font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white disabled:opacity-40 transition-colors"
            >
              {detectingDate ? (
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
              ) : (
                <CalendarSearch className="h-2.5 w-2.5" />
              )}
              <span>Detect</span>
            </button>
          </div>
          <input
            type="text"
            value={source.publishedDate}
            onChange={(e) => handleFieldChange('publishedDate', e.target.value)}
            placeholder="e.g. Sept 2026, 2023, or blank"
            className="w-full rounded-xl border border-zinc-200/80 bg-zinc-50 px-3 py-2 text-xs font-mono text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-hidden dark:bg-black/40 dark:border-white/10 dark:text-zinc-100 dark:placeholder-zinc-600 dark:focus:border-indigo-500/50 dark:focus:ring-1 dark:focus:ring-indigo-500/50 shadow-inner transition-all"
          />
        </div>

        {/* URL Input + Auto-Extract Button */}
        <div className="sm:col-span-4">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
            Source URL
          </label>
          <div className="flex space-x-1.5">
            <input
              type="url"
              value={source.url}
              onChange={(e) => handleFieldChange('url', e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-zinc-200/80 bg-zinc-50 px-3 py-2 text-xs font-mono text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-hidden dark:bg-black/40 dark:border-white/10 dark:text-zinc-100 dark:placeholder-zinc-600 dark:focus:border-indigo-500/50 dark:focus:ring-1 dark:focus:ring-indigo-500/50 shadow-inner transition-all"
            />
            <button
              type="button"
              disabled={extracting || !source.url}
              onClick={handleExtractUrl}
              title="Scrape readable text automatically from this URL"
              className="inline-flex items-center space-x-1 rounded-xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-40 transition-all shrink-0 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-soft"
            >
              {extracting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              <span className="hidden md:inline">Extract</span>
            </button>
          </div>
        </div>

      </div>

      {/* Extraction Notifications */}
      {extractError && (
        <div className="mt-2.5 flex items-center space-x-2 rounded-xl bg-zinc-50 p-2 text-xs text-rose-600 border border-zinc-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>{extractError}</span>
        </div>
      )}

      {extractSuccess && (
        <div className="mt-2.5 flex items-center space-x-2 rounded-xl bg-zinc-50 p-2 text-xs text-emerald-600 border border-zinc-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
          <Check className="h-3.5 w-3.5 shrink-0" />
          <span>{extractSuccess}</span>
        </div>
      )}

      {/* Content Textarea */}
      <div className="mt-3.5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Source Text Extract (Evidence Corpus)
            </label>
            {(source.markdownText || source.plainText) && (
              <div className="inline-flex rounded-lg border border-zinc-200/80 bg-zinc-100 p-0.5 text-[10px] dark:border-white/10 dark:bg-black/40">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('markdown');
                    if (source.markdownText) handleFieldChange('content', source.markdownText);
                  }}
                  className={`rounded-md px-2 py-0.5 font-medium transition-colors ${
                    viewMode === 'markdown'
                      ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  Markdown
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('plain');
                    if (source.plainText) handleFieldChange('content', source.plainText);
                  }}
                  className={`rounded-md px-2 py-0.5 font-medium transition-colors ${
                    viewMode === 'plain'
                      ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  Plain Text
                </button>
              </div>
            )}
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            {wordCount} words &bull; {charCount} chars
          </span>
        </div>
        <textarea
          rows={4}
          value={source.content}
          onChange={(e) => handleFieldChange('content', e.target.value)}
          placeholder="Paste or extract regulatory text, guidelines, conditions, or eligibility criteria here..."
          className="w-full resize-y rounded-xl border border-zinc-200/80 bg-zinc-50 p-3 text-xs leading-relaxed text-zinc-800 placeholder-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-hidden dark:bg-black/40 dark:border-white/10 dark:text-zinc-100 dark:placeholder-zinc-600 dark:focus:border-indigo-500/50 dark:focus:ring-1 dark:focus:ring-indigo-500/50 shadow-inner transition-all font-mono"
        />
      </div>

    </div>
  );
}
