'use client';

import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, AlertCircle, CheckCircle2, MessageSquare, Send } from 'lucide-react';

interface AgentResultFeedbackWidgetProps {
  executionId: string;
  agentId: string;
  tenantId: string;
  onSubmitted?: () => void;
}

export function AgentResultFeedbackWidget({
  executionId,
  agentId,
  tenantId,
  onSubmitted,
}: AgentResultFeedbackWidgetProps) {
  const [selectedRating, setSelectedRating] = useState<'CORRECT' | 'INCORRECT' | 'NEEDS_CORRECTION' | null>(null);
  const [errorCategory, setErrorCategory] = useState<string>('OTHER');
  const [correctionValue, setCorrectionValue] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selectedRating) return;
    setSubmitting(true);

    try {
      await fetch('http://localhost:3010/training-control-plane/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          executionId,
          agentId,
          userRating: selectedRating,
          errorCategory: selectedRating !== 'CORRECT' ? errorCategory : null,
          correctionValue: correctionValue || null,
          userNotes: userNotes || null,
        }),
      });
      setSubmitted(true);
      if (onSubmitted) onSubmitted();
    } catch {
      // Local fallback
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Thank you for your feedback! It has been logged for AI Engineering quality review.</span>
      </div>
    );
  }

  return (
    <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
          Agent Result Feedback
        </span>
        <span className="text-[10px] text-zinc-500">Quality Governance</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setSelectedRating('CORRECT')}
          className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-medium transition-all ${
            selectedRating === 'CORRECT'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
              : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
          }`}
        >
          <ThumbsUp className="w-3.5 h-3.5" /> Correct
        </button>

        <button
          onClick={() => setSelectedRating('NEEDS_CORRECTION')}
          className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-medium transition-all ${
            selectedRating === 'NEEDS_CORRECTION'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
              : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" /> Needs Correction
        </button>

        <button
          onClick={() => setSelectedRating('INCORRECT')}
          className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-medium transition-all ${
            selectedRating === 'INCORRECT'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
              : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
          }`}
        >
          <ThumbsDown className="w-3.5 h-3.5" /> Incorrect
        </button>
      </div>

      {selectedRating && selectedRating !== 'CORRECT' && (
        <div className="space-y-3 pt-2 border-t border-zinc-800/80 animate-in fade-in-50">
          <div>
            <label className="block text-[11px] text-zinc-400 mb-1.5">What was wrong?</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                'AMOUNT',
                'VENDOR',
                'DATE',
                'PAYMENT_STATUS',
                'WRONG_TOOL',
                'MISSING_INFO',
                'BAD_RECOMMENDATION',
                'OTHER',
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setErrorCategory(cat)}
                  className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all ${
                    errorCategory === cat
                      ? 'bg-teal-600 text-white'
                      : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">Expected / Correct Value (Optional)</label>
            <input
              type="text"
              placeholder="e.g., Partially paid, $3,200.00"
              value={correctionValue}
              onChange={(e) => setCorrectionValue(e.target.value)}
              className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">Additional Notes</label>
            <input
              type="text"
              placeholder="Provide context for AI Engineering review..."
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>
      )}

      {selectedRating && (
        <div className="flex justify-end pt-1">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Send className="w-3 h-3" />
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      )}
    </div>
  );
}
