import React, { useState } from 'react';
import {
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Sparkles,
  AlertOctagon,
  Info,
} from 'lucide-react';

export default function TransparencyLegendBar() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/70 via-white to-indigo-50/40 p-3.5 dark:border-indigo-900/60 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 shadow-xs transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
            <ShieldCheck className="h-3.5 w-3.5" />
          </span>
          <div>
            <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
              Epistemic Transparency & Evidence Legend
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Understanding the 3 confidence and verification tiers across GapLens
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center space-x-1 rounded-lg px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-100/60 dark:text-indigo-400 dark:hover:bg-indigo-950/60 transition-colors"
        >
          <span>{isExpanded ? 'Hide Details' : 'View Standards'}</span>
          {isExpanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Epistemic Tiers Grid */}
      {isExpanded && (
        <div className="mt-3.5 grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-indigo-100 dark:border-slate-800 pt-3 animate-in fade-in duration-150">
          {/* Tier 1: Sourced Information */}
          <div className="rounded-xl border border-emerald-200 bg-white p-3 dark:border-emerald-900/60 dark:bg-slate-900/90 space-y-1.5 shadow-2xs">
            <div className="flex items-center space-x-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <FileCheck2 className="h-3 w-3" />
              </span>
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                Tier 1: Sourced Evidence
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Directly extracted from user-supplied sources with traceable in-context quotes. Corroborated facts carry the highest certainty.
            </p>
          </div>

          {/* Tier 2: AI-Detected Potential Signal */}
          <div className="rounded-xl border border-amber-200 bg-white p-3 dark:border-amber-900/60 dark:bg-slate-900/90 space-y-1.5 shadow-2xs">
            <div className="flex items-center space-x-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                <Sparkles className="h-3 w-3" />
              </span>
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                Tier 2: AI Gap Signal
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Inferred dark spots and missing statutory questions. Labeled as AI signals rather than verified facts to prevent false certainty.
            </p>
          </div>

          {/* Tier 3: Source Contradiction & Temporal Risk */}
          <div className="rounded-xl border border-rose-200 bg-white p-3 dark:border-rose-900/60 dark:bg-slate-900/90 space-y-1.5 shadow-2xs">
            <div className="flex items-center space-x-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                <AlertOctagon className="h-3 w-3" />
              </span>
              <span className="text-xs font-bold text-rose-800 dark:text-rose-300">
                Tier 3: Conflict & Temporal Risk
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Direct factual divergences between two sources or outdated cycle documents. Mandates verification with designated official authorities.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

