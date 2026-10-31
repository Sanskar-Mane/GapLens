import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Trash2,
  Sparkles,
  Loader2,
  Clock,
  FileUp,
  CalendarSearch,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { extractUrlContent, scanTextMetadata } from '../services/api';

const SOURCE_TYPES = [
  'Official Notice',
  'Third-Party Guide',
  'Archived Circular',
  'News Article',
  'Forum/Other',
];

const SOURCE_TYPE_COLORS = {
  'Official Notice': 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
  'Third-Party Guide': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60',
  'Archived Circular': 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60',
  'News Article': 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
  'Forum/Other': 'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
};

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

  // 1. Auto-Extract URL content with Jina AI / Cheerio / Firewall guard
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

    if (result.success && result.content) {
      onUpdateSource(source.id, {
        content: result.content,
        title: source.title || result.title || 'Extracted Web Article',
        publishedDate: source.publishedDate || result.detectedDate || '',
      });
      setTemporalInfo({
        temporalStatus: result.temporalStatus || 'current',
        detectedDate: result.detectedDate || '',
      });
      setExtractSuccess(
        `Scraped ${result.wordCount || result.content.length} words via ${result.extractedVia || 'Extraction Engine'}!`
      );
    } else {
      setExtractError(
        result.error ||
          'Extraction failed. The target site may be protected by a bot firewall (Cloudflare) or require authentication. Please copy and paste the snippet directly.'
      );
    }

    setTimeout(() => {
      setExtractSuccess(null);
    }, 6000);
  };

  // 2. Auto-Detect Date from Text button action
  const handleAutoDetectDate = async () => {
    if (!source.content || source.content.trim().length < 10) {
      setExtractError('Please paste content first to scan for dates or academic cycles.');
      setTimeout(() => setExtractError(null), 3000);
      return;
    }

    setDetectingDate(true);
    const meta = await scanTextMetadata(source.content, source.publishedDate);
    setDetectingDate(false);

    if (meta.detectedDate) {
      onUpdateSource(source.id, { publishedDate: meta.detectedDate });
      setTemporalInfo({
        temporalStatus: meta.temporalStatus,
        detectedDate: meta.detectedDate,
      });
      setExtractSuccess(`Auto-detected: "${meta.detectedDate}"`);
      setTimeout(() => setExtractSuccess(null), 3000);
    } else {
      setExtractError('No explicit dates or academic cycles found in the content snippet.');
      setTimeout(() => setExtractError(null), 4000);
    }
  };

  // 3. Upload .txt/.md local file
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        const derivedTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const scan = await scanTextMetadata(text);
        onUpdateSource(source.id, {
          content: text,
          title: source.title || derivedTitle,
          publishedDate: source.publishedDate || scan.detectedDate || '',
        });
        setExtractSuccess(`Loaded file "${file.name}" (${text.length} chars)!`);
        setTimeout(() => setExtractSuccess(null), 4000);
      }
    };
    reader.readAsText(file);
    // Reset file input value so user can upload same file if needed
    e.target.value = '';
  };

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/95 dark:hover:border-slate-700">
      
      {/* Top Bar: Source Badge ([Source 1]), Type Selector, Upload Button, and Delete */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        
        {/* Source Badge */}
        <div className="flex items-center space-x-2">
          <span className="rounded-lg bg-indigo-50 px-2.5 py-1 font-mono text-xs font-bold text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:ring-indigo-800">
            [Source {index + 1}]
          </span>
          <span
            className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${
              SOURCE_TYPE_COLORS[source.sourceType] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {source.sourceType}
          </span>
        </div>

        {/* Action icons & buttons */}
        <div className="flex items-center space-x-2">
          
          {/* Source Type Selector */}
          <select
            value={source.sourceType}
            onChange={(e) => handleFieldChange('sourceType', e.target.value)}
            className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
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
            className="inline-flex items-center space-x-1 rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750 transition-colors shadow-xs"
          >
            <FileUp className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Upload .txt/.md</span>
          </button>

          {/* Delete Source button (disabled when only 2 sources remain) */}
          <button
            type="button"
            disabled={totalSources <= 2}
            onClick={() => onDeleteSource(source.id)}
            title={
              totalSources <= 2
                ? 'Minimum 2 sources required for cross-verification'
                : 'Remove this source'
            }
            className={`rounded-lg p-1.5 transition-colors ${
              totalSources <= 2
                ? 'cursor-not-allowed text-slate-300 dark:text-slate-700'
                : 'text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400'
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
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Source Title
          </label>
          <input
            type="text"
            value={source.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            placeholder="Official State Portal"
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-600 dark:focus:bg-slate-950"
          />
        </div>

        {/* Publication Date / Cycle + Auto-Detect Button */}
        <div className="sm:col-span-3">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Date / Cycle
            </label>
            <button
              type="button"
              disabled={detectingDate || !source.content}
              onClick={handleAutoDetectDate}
              title="Auto-scan pasted content to detect dates and cycles"
              className="inline-flex items-center space-x-1 text-[10px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 disabled:opacity-40 transition-colors"
            >
              {detectingDate ? (
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
              ) : (
                <CalendarSearch className="h-2.5 w-2.5" />
              )}
              <span>Auto-Detect</span>
            </button>
          </div>
          <input
            type="text"
            value={source.publishedDate}
            onChange={(e) => handleFieldChange('publishedDate', e.target.value)}
            placeholder="Sept 2026, 2023-24, or blank"
            className={`w-full rounded-lg border px-3 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 dark:text-slate-100 dark:placeholder-slate-600 ${
              !source.publishedDate || !source.publishedDate.trim()
                ? 'border-amber-300 bg-amber-50/70 focus:border-amber-500 focus:ring-amber-500 dark:border-amber-700/60 dark:bg-amber-950/20'
                : 'border-slate-300 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950'
            }`}
          />
        </div>

        {/* URL Input + Auto-Extract Button */}
        <div className="sm:col-span-4">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Source URL
          </label>
          <div className="flex space-x-1.5">
            <input
              type="url"
              value={source.url}
              onChange={(e) => handleFieldChange('url', e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-600"
            />
            <button
              type="button"
              disabled={extracting || !source.url}
              onClick={handleExtractUrl}
              title="Scrape readable text automatically from this URL"
              className="inline-flex shrink-0 items-center space-x-1 rounded-lg border border-indigo-300 bg-indigo-50 px-2.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-600 hover:text-white disabled:opacity-40 transition-colors shadow-sm dark:border-indigo-700/60 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900"
            >
              {extracting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600 dark:text-indigo-300" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              )}
              <span className="hidden lg:inline">{extracting ? 'Extracting...' : 'Auto-Extract URL'}</span>
              <span className="lg:hidden">{extracting ? '...' : 'Extract'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Extraction Feedback Banners */}
      {extractSuccess && (
        <div className="mt-2.5 flex items-center space-x-2 rounded-lg border border-emerald-300 bg-emerald-50 p-2 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{extractSuccess}</span>
        </div>
      )}

      {extractError && (
        <div className="mt-2.5 flex items-start space-x-2 rounded-lg border border-rose-300 bg-rose-50 p-2.5 text-xs text-rose-800 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
          <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          <div>
            <div className="font-semibold">URL Extraction Guard:</div>
            <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">{extractError}</p>
          </div>
        </div>
      )}

      {/* Raw Text Content Textarea */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1">
            <FileText className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Raw Text / Content Excerpt</span>
          </label>
          <div className="flex items-center space-x-3 text-[10px] text-slate-500 font-mono">
            <span>{charCount} characters</span>
            {source.content && (
              <button
                type="button"
                onClick={() => handleFieldChange('content', '')}
                className="text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors font-sans"
                title="Clear content"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <textarea
          rows={4}
          value={source.content}
          onChange={(e) => handleFieldChange('content', e.target.value)}
          placeholder="Paste official portal text, eligibility notices, circular clauses, or third-party blog excerpts here..."
          className="w-full resize-y rounded-xl border border-slate-300 bg-slate-100/70 p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono leading-relaxed dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:placeholder-slate-600 dark:focus:bg-slate-950"
        />
      </div>

      {/* Auto-Detect Date & Quality Bar */}
      <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        
        {/* Word count pill */}
        <div className="flex items-center space-x-2">
          <span
            className={`inline-flex items-center space-x-1 rounded-md px-2 py-0.5 text-[11px] font-mono font-semibold border ${
              wordCount >= 15
                ? 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                : 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
            }`}
          >
            <span>{wordCount} words</span>
            <span>{wordCount >= 15 ? '· Ready' : '· Needs >15 words'}</span>
          </span>
        </div>

        {/* Temporal Status Badge */}
        <div>
          {temporalInfo.temporalStatus === 'current' ? (
            <span className="inline-flex items-center space-x-1 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              <span>2025/2026 Cycle Detected</span>
              {temporalInfo.detectedDate && (
                <span className="font-mono opacity-80">({temporalInfo.detectedDate})</span>
              )}
            </span>
          ) : temporalInfo.temporalStatus === 'outdated' ? (
            <span className="inline-flex items-center space-x-1 rounded-md border border-purple-300 bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-800 dark:border-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
              <Clock className="h-3 w-3 text-purple-600 dark:text-purple-400" />
              <span>Outdated Year Detected: {temporalInfo.detectedDate || '2023 or earlier'}</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300">
              <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
              <span>Undated Source — Will Flag Temporal Risk</span>
            </span>
          )}
        </div>

      </div>

    </div>
  );
}
