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
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-3.5 dark:border-white/10 dark:bg-zinc-900/40 dark:backdrop-blur-xl dark:shadow-glass-inset shadow-soft transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-glow-indigo shadow-xs">
            <ShieldCheck className="h-3.5 w-3.5" />
          </span>
          <div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
              Epistemic Transparency & Evidence Legend
            </h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Understanding the 3 confidence and verification tiers across GapLens
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center space-x-1 rounded-lg px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
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
        <div className="mt-3.5 grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-zinc-100 dark:border-white/5 pt-3 animate-in fade-in duration-150">
          {/* Tier 1: Sourced Information */}
          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-3 dark:border-white/10 dark:bg-black/30 dark:shadow-glass-inset space-y-1.5">
            <div className="flex items-center space-x-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-200 text-zinc-800 dark:bg-emerald-500/10 dark:border dark:border-emerald-500/20 dark:text-emerald-400 dark:shadow-glow-emerald">
                <FileCheck2 className="h-3 w-3" />
              </span>
              <span className="text-xs font-bold text-zinc-900 dark:text-white">
                Tier 1: Sourced Evidence
              </span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Directly extracted from user-supplied sources with traceable in-context quotes. Corroborated facts carry the highest certainty.
            </p>
          </div>

          {/* Tier 2: AI-Detected Potential Signal */}
          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-3 dark:border-white/10 dark:bg-black/30 dark:shadow-glass-inset space-y-1.5">
            <div className="flex items-center space-x-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-200 text-zinc-800 dark:bg-amber-500/10 dark:border dark:border-amber-500/20 dark:text-amber-400 dark:shadow-glow-amber">
                <Sparkles className="h-3 w-3" />
              </span>
              <span className="text-xs font-bold text-zinc-900 dark:text-white">
                Tier 2: AI Gap Signal
              </span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Inferred dark spots and missing statutory questions. Labeled as AI signals rather than verified facts to prevent false certainty.
            </p>
          </div>

          {/* Tier 3: Source Contradiction & Temporal Risk */}
          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-3 dark:border-white/10 dark:bg-black/30 dark:shadow-glass-inset space-y-1.5">
            <div className="flex items-center space-x-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-200 text-zinc-800 dark:bg-rose-500/10 dark:border dark:border-rose-500/20 dark:text-rose-400 dark:shadow-glow-rose">
                <AlertOctagon className="h-3 w-3" />
              </span>
              <span className="text-xs font-bold text-zinc-900 dark:text-white">
                Tier 3: Conflict & Temporal Risk
              </span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Direct factual divergences between two sources or outdated cycle documents. Mandates verification with designated official authorities.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

