'use client';

import React from 'react';
import {
  FileText,
  Building2,
  User,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Edit3,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { CanonicalDocument } from '@/lib/document-intelligence/types';

interface DocumentSummaryCardProps {
  canonicalDoc?: CanonicalDocument | null;
  invoice: {
    invoiceNumber: string;
    vendorName: string;
    clientCompany: string;
    clientName: string;
    issueDate: string;
    dueDate: string;
    currency: string;
    confidenceScore: number;
  };
  grandTotal: number;
  paidAmount?: number;
  balanceDue?: number;
  paymentStatus?: string;
  requiresReview?: boolean;
  reviewReasons?: string[];
  onOpenProvenance?: () => void;
  onOpenCorrection?: (fieldName?: string, originalValue?: any) => void;
}

export function DocumentSummaryCard({
  canonicalDoc,
  invoice,
  grandTotal,
  paidAmount = 0,
  balanceDue,
  paymentStatus = 'UNPAID',
  requiresReview = false,
  reviewReasons = [],
  onOpenProvenance,
  onOpenCorrection,
}: DocumentSummaryCardProps) {
  const docType = (canonicalDoc?.document?.type || 'invoice').toUpperCase().replace(/_/g, ' ');
  const docConfidence = Math.round(
    ((canonicalDoc?.document?.confidence || invoice.confidenceScore / 100 || 0.95) * 100)
  );
  const actualBalance = balanceDue !== undefined ? balanceDue : Math.max(0, grandTotal - paidAmount);

  // Status badge styling
  const getStatusBadge = (status: string) => {
    const s = (status || 'UNKNOWN').toUpperCase();
    if (s.includes('PAID') && !s.includes('PARTIAL')) {
      return {
        bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
        label: 'PAID',
      };
    }
    if (s.includes('PARTIAL')) {
      return {
        bg: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
        label: 'PARTIALLY PAID',
      };
    }
    if (s.includes('OVERDUE')) {
      return {
        bg: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
        label: 'OVERDUE',
      };
    }
    if (s.includes('CREDIT')) {
      return {
        bg: 'bg-purple-500/15 text-purple-300 border-purple-500/40',
        label: 'CREDIT / SURPLUS',
      };
    }
    if (s.includes('REFUND')) {
      return {
        bg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40',
        label: 'REFUNDED',
      };
    }
    return {
      bg: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
      label: s || 'UNPAID / DUE',
    };
  };

  const statusBadge = getStatusBadge(paymentStatus);

  return (
    <div className="space-y-4">
      {/* Human Review Banner (Section 16 requirement) */}
      {requiresReview && (
        <div className="p-4 bg-gradient-to-r from-amber-500/20 via-rose-500/15 to-amber-500/20 border border-amber-500/50 rounded-2xl shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400 shrink-0">
                <ShieldAlert size={22} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-200 flex items-center gap-2">
                  Human Review Recommended
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/40">
                    Action Required
                  </span>
                </h4>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  The document intelligence engine flagged specific validation checks for human sign-off before committing.
                </p>
                {reviewReasons.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {reviewReasons.map((reason, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-500/40 text-amber-300"
                      >
                        ⚠️ {reason.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {onOpenCorrection && (
              <button
                type="button"
                onClick={() => onOpenCorrection()}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 size={13} />
                <span>Resolve Review</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Enterprise Document Summary Card (Section 31 requirement) */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.09] rounded-3xl p-5 sm:p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400">
              <FileText size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Document Summary
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {docType}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${statusBadge.bg}`}>
                  {statusBadge.label}
                </span>
              </div>
              <p className="text-sm font-bold text-white mt-0.5">
                {invoice.invoiceNumber || 'DOC-UNASSIGNED'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {/* Overall Confidence Gauge */}
            <div className="px-3 py-1 bg-white/[0.05] border border-white/[0.1] rounded-xl text-right">
              <span className="text-[10px] text-slate-400 block font-medium">Confidence</span>
              <span className="text-xs font-mono font-bold text-emerald-300">
                {docConfidence}%
              </span>
            </div>

            {/* Provenance Inspector Button (Section 32) */}
            {onOpenProvenance && (
              <button
                type="button"
                onClick={onOpenProvenance}
                className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white border border-white/[0.1] rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="View extraction provenance and validation audit"
              >
                <HelpCircle size={14} className="text-teal-400" />
                <span>Why This Value?</span>
              </button>
            )}

            {/* Quick Correction Button */}
            {onOpenCorrection && (
              <button
                type="button"
                onClick={() => onOpenCorrection()}
                className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white border border-white/[0.1] rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Correct extracted values"
              >
                <Edit3 size={13} className="text-amber-400" />
                <span>Correct</span>
              </button>
            )}
          </div>
        </div>

        {/* Core Field Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* Issuer / Vendor */}
          <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
              <Building2 size={11} className="text-slate-400" />
              Issuer
            </span>
            <p className="text-xs font-bold text-white truncate" title={invoice.vendorName || 'Unknown'}>
              {invoice.vendorName || '—'}
            </p>
          </div>

          {/* Customer / Client */}
          <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
              <User size={11} className="text-slate-400" />
              Customer
            </span>
            <p className="text-xs font-bold text-white truncate" title={invoice.clientCompany || invoice.clientName || 'Unknown'}>
              {invoice.clientCompany || invoice.clientName || '—'}
            </p>
          </div>

          {/* Invoice Date */}
          <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
              <Calendar size={11} className="text-slate-400" />
              Invoice Date
            </span>
            <p className="text-xs font-mono font-semibold text-slate-200">
              {invoice.issueDate || '—'}
            </p>
          </div>

          {/* Due Date */}
          <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
              <Calendar size={11} className="text-slate-400" />
              Due Date
            </span>
            <p className="text-xs font-mono font-semibold text-slate-200">
              {invoice.dueDate || '—'}
            </p>
          </div>

          {/* Total Amount */}
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1 mb-1">
              <DollarSign size={11} />
              Total
            </span>
            <p className="text-sm font-mono font-extrabold text-emerald-300">
              {invoice.currency}{grandTotal.toFixed(2)}
            </p>
          </div>

          {/* Paid Amount */}
          <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
              <CheckCircle2 size={11} className="text-slate-400" />
              Paid
            </span>
            <p className="text-xs font-mono font-bold text-white">
              {invoice.currency}{paidAmount.toFixed(2)}
            </p>
          </div>

          {/* Balance Due */}
          <div className={`p-3 rounded-2xl border ${
            actualBalance > 0
              ? 'bg-amber-500/10 border-amber-500/25 text-amber-300'
              : 'bg-white/[0.02] border-white/[0.06] text-slate-300'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider block mb-1">
              Balance Due
            </span>
            <p className="text-xs font-mono font-bold">
              {invoice.currency}{actualBalance.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
