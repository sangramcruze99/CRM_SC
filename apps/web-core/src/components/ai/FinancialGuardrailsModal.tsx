'use client';

import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, X, Lock, FileText, ArrowRight } from 'lucide-react';

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-950/95 border border-white/[0.12] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-white animate-in zoom-in-95">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              Financial AI Guardrails Verification
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
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
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
              {actionDetails.riskLevel} RISK
            </span>
          </div>
        </div>

        {/* Financial Action Item Summary */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 space-y-3">
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
        <div className="flex items-start gap-2.5 p-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <input
            type="checkbox"
            id="complianceCheck"
            checked={complianceConfirmed}
            onChange={(e) => setComplianceConfirmed(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-emerald-400 cursor-pointer"
          />
          <label htmlFor="complianceCheck" className="text-xs text-slate-300 cursor-pointer">
            I confirm that I have reviewed the itemized calculation and approve committing this transaction to the immutable SOC2 audit ledger.
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2.5 pt-2 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-xl text-xs font-semibold border border-white/[0.1] cursor-pointer"
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
            className="px-5 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <CheckCircle2 size={14} />
            <span>Approve & Commit Transaction</span>
          </button>
        </div>
      </div>
    </div>
  );
}
