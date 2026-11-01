import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Cpu,
  Loader2,
  ArrowRight,
  Globe,
} from 'lucide-react';

export default function ActionFooter({
  topic,
  sources,
  activeModel,
  hasOpenRouterKey,
  hasGeminiKey,
  forceOfflineDemo,
  isAnalyzing,
  autoDiscoverWeb = true,
  onToggleAutoDiscover,
  onTriggerAnalysis,
  analysisNotice,
}) {
  const isTopicValid = Boolean(topic && topic.trim().length >= 8);
  const validSources = sources.filter(
    (s) => s.content && s.content.trim().length >= 10
  );
  const hasEnoughSources = validSources.length >= 2;
  const undatedSources = validSources.filter(
    (s) => !s.publishedDate || !s.publishedDate.trim()
  );
  const hasUndatedWarning = undatedSources.length > 0;

  // Relax 2-source manual lock when autoDiscoverWeb is active
  const isFormValid = isTopicValid && (hasEnoughSources || autoDiscoverWeb);
  const hasKey = Boolean(hasGeminiKey || hasOpenRouterKey);

  // Friendly short model label from .env
  const getShortModel = (model) => {
    if (!model) return 'Configured Model (.env)';
    const parts = model.split('/');
    const rawName = (parts.length > 1 ? parts.slice(1).join('/') : parts[0]).replace(/:free$/i, '');
    const cleanName = rawName
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return `${cleanName}${model.includes(':free') ? ' (Free)' : ''}`;
  };

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm backdrop-blur-md transition-colors duration-200 dark:bg-zinc-900/60 dark:backdrop-blur-xl dark:border-white/10 dark:shadow-glass-inset sm:p-6">
      
      {/* Top Bar: Validation Badges, Undated Warning & Active Model Badge */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-zinc-200/80 dark:border-white/10 pb-4">
        
        {/* Validation Badges */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Topic check */}
          <span
            className={`inline-flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border ${
              isTopicValid
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400'
            }`}
          >
            {isTopicValid ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
            )}
            <span>{isTopicValid ? 'Topic Specified' : 'Research Goal Missing'}</span>
          </span>

          {/* Sources count / auto-discovery check */}
          {validSources.length < 2 && autoDiscoverWeb ? (
            <span className="inline-flex items-center space-x-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-800 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:shadow-glass-inset">
              <Globe className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
              <span>Auto-Web Discovery Active (Will scan &amp; scrape relative websites automatically)</span>
            </span>
          ) : (
            <span
              className={`inline-flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border ${
                hasEnoughSources
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'
                  : 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400'
              }`}
            >
              {hasEnoughSources ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              )}
              <span>
                {validSources.length} of 2 required sources loaded
              </span>
            </span>
          )}

          {/* Undated Temporal warning badge */}
          {hasUndatedWarning && (
            <span className="inline-flex items-center space-x-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400">
              <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{undatedSources.length} Undated source — will trigger Temporal Uncertainty check</span>
            </span>
          )}

        </div>

        {/* Right Controls: Auto-Scan Switch & Selected AI Model Badge */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Interactive Auto-Scan Relative Websites Switch */}
          {typeof onToggleAutoDiscover === 'function' && (
            <button
              type="button"
              onClick={() => onToggleAutoDiscover(!autoDiscoverWeb)}
              className={`inline-flex items-center space-x-2 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                autoDiscoverWeb
                  ? 'bg-indigo-50 text-indigo-900 border-indigo-300 dark:bg-indigo-950/50 dark:border-indigo-500/30 dark:text-indigo-300 dark:shadow-glow-indigo'
                  : 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800/60 dark:border-white/10 dark:text-zinc-400'
              }`}
            >
              <Globe className={`h-3.5 w-3.5 ${autoDiscoverWeb ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'}`} />
              <span>Auto-Scan Relative Websites</span>
              <span
                className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  autoDiscoverWeb ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    autoDiscoverWeb ? 'translate-x-3' : 'translate-x-0'
                  }`}
                />
              </span>
            </button>
          )}

          {/* Model Badge */}
          <div className="flex items-center space-x-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Cpu className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Engine:</span>
            <span className="font-mono text-indigo-700 dark:text-indigo-300 font-semibold bg-zinc-100 dark:bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-200/80 dark:border-white/10">
              {getShortModel(activeModel)}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                forceOfflineDemo
                  ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400'
                  : hasKey
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'
                  : 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400'
              }`}
            >
              {forceOfflineDemo ? 'Demo Mode' : hasKey ? 'Live AI' : 'Preset'}
            </span>
          </div>

        </div>

      </div>

      {/* Notice / Feedback Banner if analysis was clicked */}
      {analysisNotice && (
        <div
          className={`mt-4 rounded-xl p-3 text-xs border ${
            analysisNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'
              : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400'
          }`}
        >
          <div className="flex items-start space-x-2">
            {analysisNotice.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            )}
            <div>
              <div className="font-semibold">{analysisNotice.title}</div>
              <div className="mt-0.5 text-[11px] opacity-90">{analysisNotice.message}</div>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          <p className="font-medium text-zinc-800 dark:text-zinc-200">
            Multi-Source Workspace Validated &amp; Ready
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            Cross-examines user sources and auto-discovered relative websites to expose digital dark spots.
          </p>
        </div>

        {/* Primary CTA Trigger Button */}
        <button
          type="button"
          disabled={!isFormValid || isAnalyzing}
          onClick={onTriggerAnalysis}
          className={`inline-flex items-center justify-center space-x-2.5 rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all ${
            !isFormValid || isAnalyzing
              ? 'cursor-not-allowed bg-zinc-300 text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-600'
              : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-600/25 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99] dark:shadow-glow-indigo dark:ring-1 dark:ring-indigo-500/50'
          }`}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>
                {validSources.length < 2 && autoDiscoverWeb
                  ? 'Auto-Discovering Web & Cross-Examining...'
                  : 'Cross-Examining Sources...'}
              </span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-indigo-200" />
              <span>
                {validSources.length < 2 && autoDiscoverWeb
                  ? 'Auto-Discover Web & Analyze Gaps'
                  : 'Analyze Sources for Gaps & Contradictions'}
              </span>
              <ArrowRight className="h-4 w-4 text-indigo-200" />
            </>
          )}
        </button>

      </div>

    </div>
  );
}
