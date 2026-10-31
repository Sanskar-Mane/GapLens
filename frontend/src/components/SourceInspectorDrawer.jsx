import React, { useEffect, useState } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  FileText,
  AlertTriangle,
  GitCompare,
  Clock,
  HelpCircle,
} from 'lucide-react';

function HighlightedContent({ content, quote, highlightClass }) {
  if (!content) {
    return <span className="text-zinc-400 italic">No content available for this source.</span>;
  }

  if (!quote || typeof quote !== 'string' || !quote.trim()) {
    return <span className="whitespace-pre-wrap">{content}</span>;
  }

  const cleanQuote = quote.trim();
  const lowerContent = content.toLowerCase();
  const lowerQuote = cleanQuote.toLowerCase();

  let matchIndex = lowerContent.indexOf(lowerQuote);
  let matchLength = cleanQuote.length;

  if (matchIndex === -1) {
    const words = cleanQuote.split(/\s+/).slice(0, 8).join(' ').toLowerCase();
    if (words.length > 15) {
      matchIndex = lowerContent.indexOf(words);
      if (matchIndex !== -1) {
        matchLength = words.length;
      }
    }
  }

  if (matchIndex === -1) {
    const shortWords = cleanQuote.split(/\s+/).slice(0, 5).join(' ').toLowerCase();
    if (shortWords.length > 10) {
      matchIndex = lowerContent.indexOf(shortWords);
      if (matchIndex !== -1) {
        matchLength = shortWords.length;
      }
    }
  }

  if (matchIndex === -1) {
    return <span className="whitespace-pre-wrap">{content}</span>;
  }

  const before = content.slice(0, matchIndex);
  const match = content.slice(matchIndex, matchIndex + matchLength);
  const after = content.slice(matchIndex + matchLength);

  const defaultHighlight =
    'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 px-1.5 py-0.5 rounded font-semibold border-l-4 border-zinc-900 dark:border-zinc-100 inline shadow-2xs';

  return (
    <span className="whitespace-pre-wrap leading-relaxed">
      {before}
      <mark className={highlightClass || defaultHighlight}>
        {match}
      </mark>
      {after}
    </span>
  );
}

export default function SourceInspectorDrawer({
  isOpen,
  onClose,
  mode = 'single',
  source = null,
  evidenceQuote = '',
  reason = 'Supporting Evidence for Verified Fact',
  reasonType = 'fact',
  sourceA = null,
  sourceB = null,
  evidenceQuoteA = '',
  evidenceQuoteB = '',
  disputedParameter = '',
  severity = '',
  resolutionAdvice = '',
  sources = [],
  gapTitle = '',
  missingQuestion = '',
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isDiff = mode === 'diff';
  const isAll = mode === 'all';

  const handleCopyQuote = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden no-print">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          className={`w-screen ${
            isDiff ? 'max-w-4xl' : 'max-w-2xl'
          } transform border-l border-zinc-200/80 bg-white shadow-2xl transition-all dark:border-zinc-800 dark:bg-zinc-900 flex flex-col`}
        >
          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
            <div className="flex items-center space-x-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                {isDiff ? (
                  <GitCompare className="h-4 w-4" />
                ) : isAll ? (
                  <HelpCircle className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                  {isDiff
                    ? 'Side-by-Side Conflict Diff'
                    : isAll
                    ? 'Cross-Source Absence Verification'
                    : 'Source Evidence Inspector'}
                </h3>
                <p className="text-[11px] text-zinc-400">
                  {isDiff
                    ? 'Compare conflicting claims in original context'
                    : isAll
                    ? 'Verifying absence of required parameters across sources'
                    : 'Trace highlighted citations directly to raw source material'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
              title="Close (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* VIEW MODE 1: DIFF */}
            {isDiff && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-850">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center space-x-1.5">
                      <GitCompare className="h-3.5 w-3.5" />
                      <span>Disputed Parameter</span>
                    </span>
                    <span className="rounded-full bg-zinc-200 dark:bg-zinc-700 px-2.5 py-0.5 text-[10px] font-bold uppercase text-zinc-800 dark:text-zinc-200">
                      {severity || 'Conflict'}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                    {disputedParameter || 'Contradictory Threshold'}
                  </h4>
                  {resolutionAdvice && (
                    <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                      <strong className="font-semibold text-zinc-900 dark:text-white">
                        Resolution Advice:{' '}
                      </strong>
                      {resolutionAdvice}
                    </div>
                  )}
                </div>

                {/* 2-Column Split */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Source A */}
                  <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-850/50 flex flex-col">
                    <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800 pb-2.5 mb-3">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                        {sourceA?.title || 'Source A'}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {sourceA?.publishedDate || 'Undated'}
                      </span>
                    </div>

                    {evidenceQuoteA && (
                      <div className="mb-3 rounded-xl border border-zinc-200 bg-white p-2.5 text-xs text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                        <span className="font-bold block text-[10px] uppercase text-zinc-500 mb-0.5">
                          Extracted Claim (Source A):
                        </span>
                        "{evidenceQuoteA}"
                      </div>
                    )}

                    <div className="flex-1 rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 max-h-96 overflow-y-auto leading-relaxed shadow-inner">
                      <HighlightedContent
                        content={sourceA?.content}
                        quote={evidenceQuoteA}
                      />
                    </div>
                  </div>

                  {/* Source B */}
                  <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-850/50 flex flex-col">
                    <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800 pb-2.5 mb-3">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                        {sourceB?.title || 'Source B'}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {sourceB?.publishedDate || 'Undated'}
                      </span>
                    </div>

                    {evidenceQuoteB && (
                      <div className="mb-3 rounded-xl border border-zinc-200 bg-white p-2.5 text-xs text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                        <span className="font-bold block text-[10px] uppercase text-zinc-500 mb-0.5">
                          Extracted Claim (Source B):
                        </span>
                        "{evidenceQuoteB}"
                      </div>
                    )}

                    <div className="flex-1 rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 max-h-96 overflow-y-auto leading-relaxed shadow-inner">
                      <HighlightedContent
                        content={sourceB?.content}
                        quote={evidenceQuoteB}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW MODE 2: ALL SOURCES ABSENCE */}
            {isAll && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-850">
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-1">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Digital Dark Spot Verification</span>
                  </div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                    {gapTitle || 'Missing Requirement'}
                  </h4>
                  <p className="mt-2 text-xs text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800 font-medium">
                    <strong className="text-zinc-900 dark:text-white">Unanswered Question: </strong>
                    {missingQuestion}
                  </p>
                  <p className="mt-2 text-[11px] text-zinc-400">
                    GapLens audited all {sources.length} submitted sources below. None provide verified regulatory instructions for this parameter.
                  </p>
                </div>

                <div className="space-y-3">
                  {sources.map((s, idx) => (
                    <div
                      key={s.id || idx}
                      className="rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-850/50"
                    >
                      <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800 pb-2 mb-2">
                        <span className="text-xs font-bold text-zinc-900 dark:text-white">
                          [{s.id || `src-${idx + 1}`}] {s.title}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {s.publishedDate || 'Undated'}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400 max-h-36 overflow-y-auto leading-relaxed bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 font-mono">
                        {s.content || '(No text recorded)'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW MODE 3: SINGLE SOURCE */}
            {!isDiff && !isAll && source && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50 p-3.5 text-xs dark:border-zinc-800 dark:bg-zinc-850">
                  <span className="font-bold block text-[11px] uppercase tracking-wider text-zinc-900 dark:text-white mb-0.5">
                    Inspection Context
                  </span>
                  <span className="text-zinc-600 dark:text-zinc-300">{reason}</span>
                </div>

                <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-850/50 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                      [{source.id || 'src'}] {source.title || 'Referenced Document'}
                    </h4>

                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 text-xs font-medium text-zinc-900 hover:underline dark:text-white"
                      >
                        <span>Open URL</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                    <span className="rounded-full bg-white dark:bg-zinc-900 px-2.5 py-0.5 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 font-medium">
                      Type: {source.sourceType || 'Document'}
                    </span>
                    <span className="rounded-full bg-white dark:bg-zinc-900 px-2.5 py-0.5 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 font-mono">
                      Date: {source.publishedDate || 'Undated'}
                    </span>
                  </div>
                </div>

                {evidenceQuote && (
                  <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50 p-3.5 dark:border-zinc-800 dark:bg-zinc-850">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center space-x-1">
                        <FileText className="h-3 w-3" />
                        <span>Exact Sourced Quote</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyQuote(evidenceQuote)}
                        className="inline-flex items-center space-x-1 text-[10px] font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                      >
                        {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        <span>{copied ? 'Copied' : 'Copy Quote'}</span>
                      </button>
                    </div>
                    <p className="text-xs font-medium italic text-zinc-800 dark:text-zinc-200 leading-relaxed">
                      "{evidenceQuote}"
                    </p>
                  </div>
                )}

                <div>
                  <h5 className="text-xs font-bold text-zinc-900 dark:text-white mb-2">
                    Raw Source Corpus
                  </h5>
                  <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 max-h-[500px] overflow-y-auto font-mono leading-relaxed shadow-inner">
                    <HighlightedContent
                      content={source.content}
                      quote={evidenceQuote}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="border-t border-zinc-100 bg-zinc-50 px-6 py-3.5 dark:border-zinc-800 dark:bg-zinc-950 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-zinc-900 px-5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-soft"
            >
              Done Inspecting
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
