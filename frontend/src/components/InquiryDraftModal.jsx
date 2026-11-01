import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Mail,
  Building2,
  FileText,
  ExternalLink,
} from 'lucide-react';

export default function InquiryDraftModal({
  isOpen,
  onClose,
  topic = '',
  item = null,
  allChecklist = [],
  informationGaps = [],
  contradictions = [],
}) {
  const [inquiryType, setInquiryType] = useState('email'); // 'email' | 'in_person'
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

  const targetAuthority = item?.targetAuthority || 'Competent Nodal Authority';
  const actionItem = item?.actionItem || 'Verification of eligibility and mandatory filing deadlines';

  const emailSubject = `Inquiry / Official Clarification Request: ${topic.slice(0, 70)} (Ref: 2026 Guidelines)`;

  const emailBody = `To,
The Nodal Officer / Public Information Helpdesk,
${targetAuthority}

Subject: ${emailSubject}

Respected Officer / Scheme Administrator,

I am writing to respectfully request official clarification regarding the statutory guidelines, eligibility limits, and procedural requirements for: "${topic}".

During our preliminary cross-verification of published guidelines, critical discrepancies and unaddressed compliance parameters were identified that require your authoritative confirmation:

1. ACTION ITEM CURRENTLY UNDER VERIFICATION:
• ${actionItem}
• Reason Flagged: ${item?.reason || 'Clarification required prior to formal filing'}

${
  contradictions.length > 0
    ? `2. CONFLICTING STATUTORY CLAIMS REQUIRING CLARIFICATION:
${contradictions
  .map(
    (c, i) =>
      `• Parameter: ${c.parameter}
   - Claim A: "${c.sourceA?.claim}" (${c.sourceA?.title})
   - Claim B: "${c.sourceB?.claim}" (${c.sourceB?.title})`
  )
  .join('\n\n')}`
    : ''
}

${
  informationGaps.length > 0
    ? `3. UNADDRESSED POLICIES / MISSING INFORMATION:
${informationGaps
  .map(
    (g, i) =>
      `• Missing Requirement: ${g.title}
   - Specific Question: ${g.missingQuestion}`
  )
  .join('\n')}`
    : ''
}

Could you please confirm the legally binding 2026 regulations, official cutoff deadlines, and mandatory documentation required?

Thank you for your assistance.

Sincerely,
Concerned Citizen / Applicant
Contact: [Your Phone / Email]
Generated via GapLens Regulatory Verification Engine (Baseline Year: 2026)`;

  const inPersonBrief = `GAPLENS IN-PERSON AUTHORITY VERIFICATION DRAFT
============================================================
TOPIC: ${topic}
TARGET AUTHORITY: ${targetAuthority}
DATE: ${new Date().toLocaleDateString()}
============================================================

KEY QUESTION TO ASK AT HELP-DESK:
"${actionItem}"

CONTEXT / WHY THIS MATTERS:
${item?.reason || 'Clarification required to prevent statutory rejections'}

SPECIFIC POINTS TO VERIFY:
${contradictions
  .slice(0, 2)
  .map((c, i) => `[ ] Conflict on "${c.parameter}": Which threshold is currently binding?`)
  .join('\n')}
${informationGaps
  .slice(0, 2)
  .map((g, i) => `[ ] Missing Parameter: "${g.missingQuestion}"`)
  .join('\n')}

DESK NOTES / OFFICER NAME:
Officer Met: ________________________
Designation: ________________________
Confirmation Received: __________________________________________________
Official Circular Number Cited: _________________________________________`;

  const activeText = inquiryType === 'email' ? emailBody : inPersonBrief;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenMailClient = () => {
    const mailto = `mailto:?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailto, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xl transition-all dark:border-white/10 dark:bg-zinc-900/90 dark:backdrop-blur-2xl dark:shadow-glass-inset z-10 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-white/5">
          <div className="flex items-center space-x-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-glow-indigo">
              <Mail className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Official Authority Inquiry Generator
              </h3>
              <p className="text-[11px] text-zinc-400">
                Pre-composed formal inquiries targeting {targetAuthority}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 rounded-xl bg-zinc-100 dark:bg-black/40 dark:border dark:border-white/10 dark:shadow-glass-inset p-1">
            <button
              type="button"
              onClick={() => setInquiryType('email')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                inquiryType === 'email'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 dark:shadow-glow-indigo shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              Formal Email Inquiry
            </button>
            <button
              type="button"
              onClick={() => setInquiryType('in_person')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                inquiryType === 'in_person'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 dark:shadow-glow-indigo shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              In-Person Desk Brief
            </button>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-zinc-400">Target: </span>
            <strong className="text-xs text-zinc-900 dark:text-white font-semibold">
              {targetAuthority}
            </strong>
          </div>
        </div>

        {/* Inquiry Text Preview */}
        <div className="relative rounded-xl border border-zinc-200/80 bg-zinc-50 p-4 dark:border-white/10 dark:bg-black/30 dark:shadow-glass-inset">
          <textarea
            readOnly
            rows={12}
            value={activeText}
            className="w-full resize-none bg-transparent font-mono text-xs leading-relaxed text-zinc-800 dark:text-zinc-200 focus:outline-hidden"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-white/5">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center space-x-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:bg-zinc-800/50 dark:hover:bg-zinc-700/80 dark:text-zinc-300 dark:hover:text-white dark:shadow-glass-inset shadow-soft transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
            </button>

            {inquiryType === 'email' && (
              <button
                type="button"
                onClick={handleOpenMailClient}
                className="inline-flex items-center space-x-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:bg-zinc-800/50 dark:hover:bg-zinc-700/80 dark:text-zinc-300 dark:hover:text-white dark:shadow-glass-inset shadow-soft transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open in Email App</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:hover:shadow-glow-indigo shadow-soft transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
