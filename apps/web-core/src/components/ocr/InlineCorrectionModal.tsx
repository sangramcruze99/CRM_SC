'use client';

import React, { useState, useEffect } from 'react';
import { X, Edit3, Check, AlertCircle, BookmarkPlus } from 'lucide-react';

interface InlineCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId?: string;
  documentType?: string;
  initialFieldName?: string;
  initialOriginalValue?: any;
  onSavedCorrection: (fieldName: string, correctedValue: any) => void;
}

export function InlineCorrectionModal({
  isOpen,
  onClose,
  documentId = 'DOC-CURRENT',
  documentType = 'invoice',
  initialFieldName = 'paidAmount',
  initialOriginalValue = '',
  onSavedCorrection,
}: InlineCorrectionModalProps) {
  const [fieldName, setFieldName] = useState(initialFieldName);
  const [originalValue, setOriginalValue] = useState(String(initialOriginalValue ?? ''));
  const [correctedValue, setCorrectedValue] = useState(String(initialOriginalValue ?? ''));
  const [reason, setReason] = useState('OCR_MISREAD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialFieldName) setFieldName(initialFieldName);
    if (initialOriginalValue !== undefined) {
      setOriginalValue(String(initialOriginalValue));
      setCorrectedValue(String(initialOriginalValue));
    }
  }, [initialFieldName, initialOriginalValue, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-correction',
          documentId,
          documentType,
          fieldName,
          originalValue,
          correctedValue,
          originalConfidence: 0.85,
          reason,
        }),
      });

      if (res.ok) {
        setStatusMessage('✅ Correction saved to continuous learning evaluation dataset.');
        onSavedCorrection(fieldName, correctedValue);
        setTimeout(() => {
          setIsSubmitting(false);
          onClose();
        }, 1200);
      } else {
        throw new Error('Failed to save correction');
      }
    } catch (err: any) {
      console.error('Correction submission error:', err);
      setStatusMessage('⚠️ Could not save correction. Please check connection.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/40 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-400">
              <Edit3 size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Human Verification & Correction</h3>
              <p className="text-[11px] text-slate-400">Records ground-truth for engine quality benchmarking.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {statusMessage && (
          <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-semibold">
            {statusMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Field to Correct
            </label>
            <input
              type="text"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              placeholder="e.g. paidAmount, vendorName, total"
              className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Extracted (Original) Value
            </label>
            <input
              type="text"
              value={originalValue}
              onChange={(e) => setOriginalValue(e.target.value)}
              className="w-full px-3 py-2 bg-white/[0.02] border border-white/[0.08] rounded-xl text-slate-400 font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-300 mb-1">
              Correct Ground Truth Value
            </label>
            <input
              type="text"
              value={correctedValue}
              onChange={(e) => setCorrectedValue(e.target.value)}
              placeholder="Enter true value..."
              className="w-full px-3 py-2 bg-white/[0.08] border border-amber-500/50 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Correction Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-white/[0.1] rounded-xl text-slate-200 focus:outline-none"
            >
              <option value="OCR_MISREAD">OCR Optical Misread / Character Confusion</option>
              <option value="SEMANTIC_MISCLASSIFICATION">Semantic Field Misclassification</option>
              <option value="DATE_AMBIGUITY">Date Day/Month Ambiguity</option>
              <option value="AMOUNT_CONFUSION">Amount / Balance Due Confusion</option>
              <option value="ENTITY_ROLE_SWAP">Issuer vs Customer Role Swap</option>
              <option value="OTHER">Other Manual Adjustment</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-xl font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
            >
              <BookmarkPlus size={14} />
              <span>{isSubmitting ? 'Saving...' : 'Commit Correction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
