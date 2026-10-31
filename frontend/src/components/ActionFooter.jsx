import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Cpu,
  Loader2,
  ArrowRight
} from 'lucide-react';

export default function ActionFooter({
  topic,
  sources,
  activeModel,
  hasOpenRouterKey,
  forceOfflineDemo,
  isAnalyzing,
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

  const isFormValid = isTopicValid && hasEnoughSources;

  // Friendly short model label
  const getShortModel = (model) => {
    if (!model) return 'Llama 3.3 70B';
    const parts = model.split('/');
    return (parts[1] || model).replace(':free', ' (Free)');
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm backdrop-blur-md transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900/95 sm:p-6">
      
      {/* Top Bar: Validation Badges, Undated Warning & Active Model Badge */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        
        {/* Validation Badges */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Topic check */}
          <span
            className={`inline-flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border ${
              isTopicValid
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60'
                : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60'
            }`}
          >
            {isTopicValid ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
            )}
            <span>{isTopicValid ? 'Topic Specified' : 'Research Goal Missing'}</span>
          </span>

          {/* Sources count check */}
          <span
            className={`inline-flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border ${
              hasEnoughSources
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60'
                : 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60'
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

          {/* Undated Temporal warning badge */}
          {hasUndatedWarning && (
            <span className="inline-flex items-center space-x-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300">
              <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{undatedSources.length} Undated source — will trigger Temporal Uncertainty check</span>
            </span>
          )}

        </div>

        {/* Selected OpenRouter Model Badge */}
        <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
          <Cpu className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span>Engine:</span>
          <span className="font-mono text-indigo-700 dark:text-indigo-300 font-semibold bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
            {getShortModel(activeModel)}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
              forceOfflineDemo
                ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                : hasOpenRouterKey
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800'
            }`}
          >
            {forceOfflineDemo ? 'Demo Mode' : hasOpenRouterKey ? 'Live AI' : 'Preset'}
          </span>
        </div>

      </div>

      {/* Notice / Feedback Banner if analysis was clicked */}
      {analysisNotice && (
        <div
          className={`mt-4 rounded-xl p-3 text-xs border ${
            analysisNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
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
        
        <div className="text-xs text-slate-500 dark:text-slate-400">
          <p className="font-medium text-slate-800 dark:text-slate-300">
            Multi-Source Workspace Validated & Ready
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Cross-examines documents, flags contradictions, and exposes digital dark spots.
          </p>
        </div>

        {/* Primary CTA Trigger Button */}
        <button
          type="button"
          disabled={!isFormValid || isAnalyzing}
          onClick={onTriggerAnalysis}
          className={`inline-flex items-center justify-center space-x-2.5 rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all ${
            !isFormValid || isAnalyzing
              ? 'cursor-not-allowed bg-slate-300 text-slate-500 dark:bg-slate-800 dark:text-slate-600'
              : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-600/25 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99]'
          }`}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Cross-Examining Sources...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-indigo-200" />
              <span>Analyze Sources for Gaps & Contradictions</span>
              <ArrowRight className="h-4 w-4 text-indigo-200" />
            </>
          )}
        </button>

      </div>

    </div>
  );
}
