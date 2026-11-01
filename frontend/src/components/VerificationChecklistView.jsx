import React, { useState, useEffect } from 'react';
import {
  Check,
  RotateCcw,
  ArrowLeft,
  ShieldCheck,
  Building2,
  AlertCircle,
  FileDown,
  Printer,
  Mail,
  Search,
  ExternalLink,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Save,
  CheckCircle2,
  Copy,
  Edit2,
} from 'lucide-react';
import InquiryDraftModal from './InquiryDraftModal';
import { patchSessionChecklist } from '../services/api';

// Status Dot Pill for Priority
function PriorityDotPill({ priority }) {
  const p = (priority || '').toLowerCase();
  let dotColor = 'bg-zinc-400';
  let darkClasses = 'dark:bg-zinc-800/60 dark:border-white/10 dark:text-zinc-200';
  if (p.includes('high') || p.includes('critical')) {
    dotColor = 'bg-rose-500';
    darkClasses = 'dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400';
  } else if (p.includes('medium')) {
    dotColor = 'bg-amber-500';
    darkClasses = 'dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400';
  } else if (p.includes('low') || p.includes('standard')) {
    dotColor = 'bg-emerald-500';
    darkClasses = 'dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400';
  }

  return (
    <span className={`inline-flex items-center space-x-1.5 rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-800 border border-zinc-200/60 whitespace-nowrap ${darkClasses}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      <span>{priority || 'Standard'}</span>
    </span>
  );
}

export default function VerificationChecklistView({
  checklist = [],
  analysis,
  topic = '',
  category = '',
  sessionId = null,
  onBackToFindings,
  onResetResearch,
}) {
  const storageKey = `gaplens_checklist_${(topic || 'default').slice(0, 30)}`;

  const [completedIds, setCompletedIds] = useState(() => {
    if (analysis?.checkedChecklistIds && Array.isArray(analysis.checkedChecklistIds)) {
      return new Set(analysis.checkedChecklistIds);
    }
    try {
      const saved = localStorage.getItem(`${storageKey}_completed`);
      if (saved) return new Set(JSON.parse(saved));
    } catch {}
    return new Set();
  });

  const [verificationNotes, setVerificationNotes] = useState(() => {
    if (analysis?.verificationNotes && typeof analysis.verificationNotes === 'object') {
      return analysis.verificationNotes;
    }
    try {
      const saved = localStorage.getItem(`${storageKey}_notes`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const [activeNoteEditId, setActiveNoteEditId] = useState(null);
  const [tempNoteText, setTempNoteText] = useState('');

  // Filtering: 'all' | 'remaining' | 'completed'
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Copy & Export state
  const [copied, setCopied] = useState(false);

  // Inquiry Modal state
  const [inquiryModalState, setInquiryModalState] = useState({
    isOpen: false,
    item: null,
  });

  // Persist completed items and notes to localStorage and backend
  useEffect(() => {
    try {
      localStorage.setItem(`${storageKey}_completed`, JSON.stringify(Array.from(completedIds)));
      localStorage.setItem(`${storageKey}_notes`, JSON.stringify(verificationNotes));
    } catch {}

    if (sessionId) {
      patchSessionChecklist(sessionId, {
        checkedIds: Array.from(completedIds),
        verificationNotes,
      });
    }
  }, [completedIds, verificationNotes, sessionId, storageKey]);

  // Baseline Readiness Score
  const baselineScore = analysis?.readinessScore || 54;

  // Calculate Weighted Progress & Dynamic Adjusted Readiness Score
  const getWeight = (priority) => {
    const p = (priority || '').toLowerCase();
    if (p.includes('high')) return 3;
    if (p.includes('medium')) return 2;
    return 1;
  };

  const totalWeight = checklist.reduce((sum, item) => sum + getWeight(item.priority), 0);
  const completedWeight = checklist
    .filter((item) => completedIds.has(item.id))
    .reduce((sum, item) => sum + getWeight(item.priority), 0);

  const totalCount = checklist.length;
  const completedCount = completedIds.size;
  const remainingCount = totalCount - completedCount;

  let adjustedScore = baselineScore;
  if (totalWeight > 0) {
    if (completedCount === totalCount) {
      adjustedScore = 100;
    } else {
      const weightRatio = completedWeight / totalWeight;
      const potentialGain = 100 - baselineScore;
      adjustedScore = Math.min(100, Math.round(baselineScore + weightRatio * potentialGain));
    }
  }

  const scoreGain = adjustedScore - baselineScore;

  // Toggle single item check
  const toggleCheck = (id) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Note handler
  const handleStartEditNote = (e, item) => {
    e.stopPropagation();
    setActiveNoteEditId(item.id);
    setTempNoteText(verificationNotes[item.id] || '');
  };

  const handleSaveNote = (e, itemId) => {
    e.stopPropagation();
    setVerificationNotes((prev) => ({
      ...prev,
      [itemId]: tempNoteText.trim(),
    }));
    setActiveNoteEditId(null);
    setTempNoteText('');
  };

  const handleCancelNote = (e) => {
    e.stopPropagation();
    setActiveNoteEditId(null);
    setTempNoteText('');
  };

  // Filter checklist items
  const filteredList = checklist.filter((item) => {
    const isDone = completedIds.has(item.id);
    if (statusFilter === 'remaining' && isDone) return false;
    if (statusFilter === 'completed' && !isDone) return false;

    if (priorityFilter !== 'all') {
      const p = (item.priority || '').toLowerCase();
      if (priorityFilter === 'high' && !p.includes('high')) return false;
      if (priorityFilter === 'medium' && !p.includes('medium')) return false;
      if (priorityFilter === 'low' && !p.includes('low')) return false;
    }
    return true;
  });

  // Generate clean Markdown Report
  const buildMarkdownReport = () => {
    const lines = [
      `# GapLens Official Verification Brief & Audit Report`,
      `**Research Goal:** ${topic}`,
      `**Category:** ${category || 'General'}`,
      `**Initial Baseline Readiness Score:** ${baselineScore}/100`,
      `**Current Verified Readiness Score:** ${adjustedScore}/100`,
      `**Checklist Completion:** ${completedCount}/${totalCount} items verified`,
      `**Audit Date:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} (2026 Baseline)`,
      ``,
      `---`,
      ``,
      `## 1. Executive Summary`,
      analysis?.executiveSummary || 'No executive summary available.',
      ``,
      `## 2. Verification Checklist & Official Inquiries`,
      ...checklist.map((item, idx) => {
        const isDone = completedIds.has(item.id);
        const checkMark = isDone ? '[x]' : '[ ]';
        const note = verificationNotes[item.id];
        return `${idx + 1}. ${checkMark} **[${item.priority} Priority]** ${item.actionItem}\n   - **Target Authority:** ${item.targetAuthority}\n   - **Flagged Due To:** ${item.reason}${note ? `\n   - **Verification Note:** "${note}"` : ''}`;
      }),
      ``,
    ];

    if (analysis?.contradictions && analysis.contradictions.length > 0) {
      lines.push(
        `## 3. Disputed Claims & Contradictions`,
        ...analysis.contradictions.map(
          (c, idx) =>
            `${idx + 1}. **${c.parameter}** (${c.severity})\n   - **Source A:** ${c.sourceA?.claim} (${c.sourceA?.title})\n   - **Source B:** ${c.sourceB?.claim} (${c.sourceB?.title})\n   - **Resolution:** ${c.resolutionAdvice}`
        ),
        ``
      );
    }

    if (analysis?.informationGaps && analysis.informationGaps.length > 0) {
      lines.push(
        `## 4. Digital Dark Spots (Missing Policy Information)`,
        ...analysis.informationGaps.map(
          (g, idx) =>
            `${idx + 1}. **${g.title}** (${g.impactLevel} Impact)\n   - **Unanswered Question:** ${g.missingQuestion}\n   - **Risk:** ${g.explanation}`
        ),
        ``
      );
    }

    lines.push(
      `---`,
      `*Generated by GapLens — Information Gap & Contradiction Detection Engine*`
    );

    return lines.join('\n');
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(buildMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadMarkdown = () => {
    const reportText = buildMarkdownReport();
    const blob = new Blob([reportText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gaplens-verification-brief-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">

      {/* 1. DYNAMIC READINESS SCORE SIMULATOR ROW */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-zinc-900/40 dark:backdrop-blur-xl dark:shadow-glass-inset">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          
          {/* Dual Score & Metrics */}
          <div className="flex items-center space-x-5">
            <div className="flex items-center space-x-3">
              <div className="flex h-16 w-16 flex-col items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-black/30 dark:shadow-glass-inset">
                <span className="text-lg font-bold text-zinc-500 dark:text-zinc-400">
                  {baselineScore}
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-400">
                  Baseline
                </span>
              </div>

              <TrendingUp className="h-4 w-4 text-zinc-400 shrink-0" />

              <div className="flex h-16 w-20 flex-col items-center justify-center rounded-xl border border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900 shadow-sm dark:shadow-glow-indigo">
                <span className="text-2xl font-black leading-none">
                  {adjustedScore}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-80 mt-0.5">
                  / 100 Ready
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-zinc-900 dark:text-white">
                  Live Readiness Recalculation
                </span>
                {scoreGain > 0 && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:border dark:border-emerald-500/20 dark:text-emerald-400 border border-emerald-200">
                    +{scoreGain} pts verified
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400">
                Checking action items updates readiness dynamically based on authority verification
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-zinc-400">Completed:</span>
            <span className="font-mono font-bold text-zinc-900 dark:text-white">
              {completedCount} / {totalCount} items
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
            <span className="font-mono text-zinc-500">
              {Math.round((completedCount / (totalCount || 1)) * 100)}%
            </span>
          </div>

        </div>

        {/* Horizontal Progress Bar */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-white/5 space-y-1.5">
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-black/40 dark:border dark:border-white/10">
            <div
              className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300 ease-out"
              style={{ width: `${adjustedScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. TABULAR CHECKLIST CARD ("Task Overview" style from reference UI) */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-soft dark:border-white/10 dark:bg-zinc-900/40 dark:backdrop-blur-xl dark:shadow-glass-inset overflow-hidden">
        
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 border-b border-zinc-100 dark:border-white/5">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              Verification Checklist Overview
            </h3>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
              Direct action items and target regulatory departments
            </p>
          </div>

          {/* Action and Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 no-print">
            {/* Status Filter Dropdown / Pills */}
            <div className="flex items-center space-x-1 rounded-lg bg-zinc-100 dark:bg-black/40 dark:border dark:border-white/10 dark:shadow-glass-inset p-0.5">
              {[
                { id: 'all', label: 'All' },
                { id: 'remaining', label: 'Remaining' },
                { id: 'completed', label: 'Completed' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                    statusFilter === tab.id
                      ? 'bg-white text-zinc-900 dark:bg-white dark:text-zinc-900 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Copy Brief Button */}
            <button
              type="button"
              onClick={handleCopyReport}
              className="inline-flex items-center space-x-1.5 rounded-lg border border-zinc-200/80 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-white/10 dark:bg-zinc-800/50 dark:hover:bg-zinc-700/80 dark:text-zinc-300 dark:hover:text-white dark:hover:shadow-glow-indigo dark:shadow-glass-inset transition-all"
              title="Copy brief"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* Export Markdown */}
            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="inline-flex items-center space-x-1.5 rounded-lg border border-zinc-200/80 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-white/10 dark:bg-zinc-800/50 dark:hover:bg-zinc-700/80 dark:text-zinc-300 dark:hover:text-white dark:hover:shadow-glow-indigo dark:shadow-glass-inset transition-all"
              title="Export report as Markdown"
            >
              <FileDown className="h-3.5 w-3.5" />
              <span>Export (.md)</span>
            </button>

            {/* Print / PDF */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 rounded-lg border border-zinc-200/80 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-white/10 dark:bg-zinc-800/50 dark:hover:bg-zinc-700/80 dark:text-zinc-300 dark:hover:text-white dark:hover:shadow-glow-indigo dark:shadow-glass-inset transition-all"
              title="Print brief"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/70 text-[11px] font-semibold text-zinc-400 dark:border-white/5 dark:bg-black/20 dark:text-zinc-400">
                <th className="py-3 px-4 w-12 text-center">Status</th>
                <th className="py-3 px-4 min-w-[280px]">Verification Action Item</th>
                <th className="py-3 px-4 min-w-[180px]">Target Authority</th>
                <th className="py-3 px-4 min-w-[200px]">Flagged Reason</th>
                <th className="py-3 px-4 w-28">Priority</th>
                <th className="py-3 px-4 w-28 text-right no-print">Inquiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
              {filteredList.map((item, idx) => {
                const isDone = completedIds.has(item.id);
                const hasNote = Boolean(verificationNotes[item.id]);
                const isEditingNote = activeNoteEditId === item.id;
                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
                  `${topic} ${item.targetAuthority} ${item.actionItem}`
                )}`;

                return (
                  <React.Fragment key={item.id || idx}>
                    <tr
                      onClick={() => toggleCheck(item.id)}
                      className={`cursor-pointer transition-colors ${
                        isDone
                          ? 'bg-zinc-50/50 dark:bg-white/[0.02] text-zinc-400 dark:text-zinc-500'
                          : 'hover:bg-zinc-50/80 dark:hover:bg-white/[0.04] text-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      {/* Checkbox column */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCheck(item.id);
                          }}
                          className={`flex h-5 w-5 mx-auto items-center justify-center rounded-md border transition-all ${
                            isDone
                              ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-900 dark:shadow-glow-indigo'
                              : 'border-zinc-300 dark:border-white/20 hover:border-zinc-900 dark:hover:border-white/60'
                          }`}
                        >
                          {isDone && <Check className="h-3 w-3 stroke-[3]" />}
                        </button>
                      </td>

                      {/* Action Item */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <p className={`font-semibold ${isDone ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-white'}`}>
                            {item.actionItem}
                          </p>
                          {hasNote && !isEditingNote && (
                            <p className="text-[11px] text-zinc-500 italic flex items-center space-x-1">
                              <MessageSquare className="h-3 w-3 shrink-0" />
                              <span>"{verificationNotes[item.id]}"</span>
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Target Authority */}
                      <td className="py-3.5 px-4 text-zinc-500 dark:text-zinc-400 font-medium">
                        {item.targetAuthority}
                      </td>

                      {/* Flagged Reason */}
                      <td className="py-3.5 px-4 text-zinc-500 dark:text-zinc-400 text-[11px]">
                        {item.reason}
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4">
                        <PriorityDotPill priority={item.priority} />
                      </td>

                      {/* Inquiry & Actions */}
                      <td className="py-3.5 px-4 text-right no-print" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleStartEditNote(e, item)}
                            className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Add or edit verification note"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <a
                            href={searchUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Search official portals"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>

                          <button
                            type="button"
                            onClick={() =>
                              setInquiryModalState({
                                isOpen: true,
                                item,
                              })
                            }
                            className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Draft Official Authority Inquiry"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Note Editor Row */}
                    {isEditingNote && (
                      <tr className="bg-zinc-50 dark:bg-black/40 dark:border-y dark:border-white/10" onClick={(e) => e.stopPropagation()}>
                        <td colSpan={6} className="p-3 px-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={tempNoteText}
                              onChange={(e) => setTempNoteText(e.target.value)}
                              placeholder="Record official verification notes (e.g. Inquired with desk, confirmed Nov 30 deadline)..."
                              className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 dark:border-white/10 dark:bg-black/50 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-zinc-900 dark:focus:ring-indigo-500/50 dark:focus:border-indigo-500/50 shadow-inner"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={handleCancelNote}
                              className="rounded-lg px-2.5 py-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleSaveNote(e, item.id)}
                              className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:hover:shadow-glow-indigo"
                            >
                              Save
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-zinc-400">
                    No verification items match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* 3. BOTTOM NAVIGATION BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-zinc-200/80 dark:border-white/10 no-print">
        <button
          type="button"
          onClick={onBackToFindings}
          className="inline-flex items-center space-x-1.5 rounded-xl border border-zinc-200/80 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:bg-zinc-800/50 dark:hover:bg-zinc-700/80 dark:text-zinc-300 dark:hover:text-white dark:shadow-glass-inset transition-colors w-full sm:w-auto justify-center"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>← Back to Dashboard Findings</span>
        </button>

        <button
          type="button"
          onClick={onResetResearch}
          className="inline-flex items-center space-x-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white shadow-soft hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:hover:shadow-glow-indigo transition-all w-full sm:w-auto justify-center"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Start New Research Question</span>
        </button>
      </div>

      {/* Official Inquiry Modal */}
      <InquiryDraftModal
        isOpen={inquiryModalState.isOpen}
        onClose={() => setInquiryModalState({ isOpen: false, item: null })}
        topic={topic}
        item={inquiryModalState.item}
        allChecklist={checklist}
        informationGaps={analysis?.informationGaps || []}
        contradictions={analysis?.contradictions || []}
      />

    </div>
  );
}
