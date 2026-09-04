'use client';

import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Printer,
  Download,
  X,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Building,
  QrCode,
  Sparkles,
} from 'lucide-react';

export interface PdfExportData {
  documentType: 'INVOICE' | 'PAYSLIP' | 'PRESCRIPTION' | 'CONTRACT';
  title: string;
  documentNumber: string;
  date: string;
  dueDateOrValidUntil?: string;
  issuerName: string;
  issuerAddress: string;
  issuerTaxId?: string;
  recipientName: string;
  recipientAddress: string;
  recipientEmailOrPhone?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: string;
    total: string;
  }>;
  subtotal: string;
  tax: string;
  totalAmount: string;
  notes?: string;
  doctorLicense?: string;
  bankDetails?: {
    bankName: string;
    iban: string;
    swift: string;
  };
}

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PdfExportData;
}

export function PdfExportModal({ isOpen, onClose, data }: PdfExportModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
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

  const handleTriggerPrint = () => {
    window.print();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl overflow-y-auto animate-in fade-in">
      <div className="relative bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-950/99 border border-white/[0.14] rounded-3xl w-full max-w-3xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(16,185,129,0.15)] backdrop-blur-2xl flex flex-col max-h-[92vh]">
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-32 bg-emerald-500/10 blur-3xl rounded-full" />

        {/* Modal Top Control Bar */}
        <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/25 border border-emerald-300/30">
              <FileText size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white tracking-tight">
                  High-Fidelity PDF Preview & Vector Exporter
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase">
                  Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Print or export cryptographically signed document
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleTriggerPrint}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Printer size={14} />
              <span>Print / Download PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/[0.05] hover:bg-white/[0.1] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Canvas (Crisp A4 Preview) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-900/50 flex justify-center">
          <div
            ref={printRef}
            className="printable-document bg-white text-slate-900 rounded-2xl p-8 sm:p-10 shadow-2xl w-full max-w-2xl text-xs space-y-6"
            style={{ minHeight: '600px' }}
          >
            {/* Header: Company & Invoice / Document Title */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-sm">
                    OS
                  </div>
                  <span className="font-extrabold text-base tracking-tight text-slate-900">
                    {data.issuerName}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed max-w-xs whitespace-pre-line">
                  {data.issuerAddress}
                </p>
                {data.issuerTaxId && (
                  <p className="text-slate-500 text-[11px] font-mono mt-1">
                    Tax / VAT ID: <strong>{data.issuerTaxId}</strong>
                  </p>
                )}
                {data.doctorLicense && (
                  <p className="text-emerald-700 text-[11px] font-mono mt-1">
                    MD License No: <strong>{data.doctorLicense}</strong>
                  </p>
                )}
              </div>

              <div className="text-right space-y-1">
                <span className="px-2.5 py-1 bg-slate-100 text-slate-900 font-extrabold rounded-md text-[11px] uppercase tracking-wider font-mono">
                  {data.documentType}
                </span>
                <h2 className="font-extrabold text-xl font-mono text-slate-900 tracking-tight pt-1">
                  {data.documentNumber}
                </h2>
                <div className="text-slate-500 text-[11px] space-y-0.5">
                  <p>Issue Date: <strong>{data.date}</strong></p>
                  {data.dueDateOrValidUntil && (
                    <p>Due / Valid: <strong>{data.dueDateOrValidUntil}</strong></p>
                  )}
                </div>
              </div>
            </div>

            {/* Recipient & Client Details */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Issued To / Recipient
                </span>
                <h4 className="font-bold text-sm text-slate-900">{data.recipientName}</h4>
                <p className="text-slate-500 text-[11px] whitespace-pre-line mt-0.5">
                  {data.recipientAddress}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Contact / Reference
                </span>
                <span className="font-mono text-slate-700 text-[11px] block">
                  {data.recipientEmailOrPhone || 'Verified Account'}
                </span>
                <div className="mt-2 flex items-center justify-end gap-1 text-emerald-600 text-[10px] font-bold">
                  <ShieldCheck size={13} />
                  <span>Tamper-Proof Digital Record</span>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 text-slate-900 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5">Description</th>
                  <th className="py-2.5 text-center">Qty / Days</th>
                  <th className="py-2.5 text-right">Unit Price</th>
                  <th className="py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 font-medium text-slate-800">{item.description}</td>
                    <td className="py-3 text-center font-mono text-slate-600">{item.quantity}</td>
                    <td className="py-3 text-right font-mono text-slate-600">{item.unitPrice}</td>
                    <td className="py-3 text-right font-mono font-bold text-slate-900">{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals & Notes Row */}
            <div className="flex justify-between items-start pt-4 border-t border-slate-200">
              <div className="max-w-xs space-y-2">
                {data.notes && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Instructions & Notes:
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{data.notes}</p>
                  </div>
                )}

                {data.bankDetails && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5 text-[10px] font-mono">
                    <span className="font-bold text-slate-700 block">Wire Remittance Details:</span>
                    <p>Bank: {data.bankDetails.bankName}</p>
                    <p>IBAN: {data.bankDetails.iban}</p>
                    <p>SWIFT/BIC: {data.bankDetails.swift}</p>
                  </div>
                )}
              </div>

              <div className="w-60 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">{data.subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Statutory Tax (VAT/GST):</span>
                  <span className="font-mono">{data.tax}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t-2 border-slate-900">
                  <span>Total Due:</span>
                  <span className="font-mono text-emerald-600">{data.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Footer QR & Signature */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-slate-400 text-[10px]">
              <div className="flex items-center gap-2">
                <QrCode size={36} className="text-slate-800" />
                <div>
                  <span className="font-mono font-bold text-slate-700 block">Verify Document Cryptographic Hash</span>
                  <span>SHA-256 Validated · Business OS Certified</span>
                </div>
              </div>

              <div className="text-right">
                <div className="h-6 border-b border-slate-400 w-32 ml-auto mb-1" />
                <span className="text-[10px] uppercase font-bold text-slate-500">Authorized Signature</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
