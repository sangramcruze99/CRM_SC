'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, AlertTriangle, CheckCircle2, X, Lock, FileText, ArrowRight, Sparkles } from 'lucide-react';

interface FinancialGuardrailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  actionDetails: {
    title: string;
    entityName: string;
    totalAmount: number;
    confidenceScore: number; // e.g. 98.6
    lineItems: Array<{ desc: string; qty: number; unitPrice: number; total: number }>;
    aiInferenceNotes: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  };
}

export function FinancialGuardrailsModal({
  isOpen,
  onClose,
  onApprove,
  actionDetails,
}: FinancialGuardrailsModalProps) {
  const [signedBy, setSignedBy] = useState('admin@gmail.com (Super Admin)');
  const [complianceConfirmed, setComplianceConfirmed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-950/99 border border-white/[0.14] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(16,185,129,0.15)] backdrop-blur-2xl space-y-5 text-white animate-in zoom-in-95 overflow-hidden">
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-emerald-500/10 blur-3xl rounded-full" />

        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/25 border border-emerald-300/30">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-tight">
                  Financial AI Guardrails Verification
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase">
                  SOC2 Ledger
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">High-value transactional approval and audit trail</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Confidence & Risk Level Banner */}
        <div className="flex items-center justify-between p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Neural Confidence Score
            </span>
            <div className="text-xl font-mono font-extrabold text-emerald-400">
              {actionDetails.confidenceScore}% Validated
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Compliance Risk
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
              {actionDetails.riskLevel} RISK
            </span>
          </div>
        </div>

        {/* Financial Action Item Summary */}
        <div className="bg-black/40 border border-white/[0.1] rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-start text-xs border-b border-white/[0.06] pb-2">
            <span className="text-slate-400">Target Entity:</span>
            <span className="font-bold text-white">{actionDetails.entityName}</span>
          </div>

          <div className="flex justify-between items-start text-xs border-b border-white/[0.06] pb-2">
            <span className="text-slate-400">Proposed Amount:</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              ${actionDetails.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Inferred Line Items ({actionDetails.lineItems.length}):
            </span>
            {actionDetails.lineItems.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-[11px] text-slate-300">
                <span>• {item.desc} (x{item.qty})</span>
                <span className="font-mono text-white">${item.total.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 italic pt-1 border-t border-white/[0.06]">
            AI Notes: "{actionDetails.aiInferenceNotes}"
          </p>
        </div>

        {/* Compliance Sign-Off Checkbox */}
        <div className="flex items-start gap-3 p-3.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
          <input
            type="checkbox"
            id="complianceCheck"
            checked={complianceConfirmed}
            onChange={(e) => setComplianceConfirmed(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-white/20 bg-black/40 text-emerald-500 focus:ring-emerald-400 cursor-pointer"
          />
          <label htmlFor="complianceCheck" className="text-xs text-slate-300 cursor-pointer leading-relaxed">
            I confirm that I have reviewed the itemized calculation and approve committing this transaction to the immutable SOC2 audit ledger.
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-white/[0.1] transition-all cursor-pointer"
          >
            Reject / Revise
          </button>
          <button
            type="button"
            disabled={!complianceConfirmed}
            onClick={() => {
              onApprove();
              onClose();
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <CheckCircle2 size={14} />
            <span>Approve & Commit Transaction</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
