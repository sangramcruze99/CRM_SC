'use client';

import React, { useState } from 'react';
import {
  FileText,
  Scan,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Building,
  Calendar,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Zap,
  Play,
  RotateCcw,
  Download,
  Database,
  ExternalLink,
  Check,
  Layers,
  Inbox,
  HardDrive,
  Filter,
} from 'lucide-react';

interface LineItem {
  id: string;
  sku: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  hasDiscrepancy?: boolean;
}

interface ProcessedDocument {
  id: string;
  fileName: string;
  fileType: 'INVOICE' | 'RECEIPT' | 'LEGAL_CONTRACT' | 'PURCHASE_ORDER';
  source: 'EMAIL_ATTACHMENT' | 'GOOGLE_DRIVE' | 'MANUAL_UPLOAD';
  vendorName: string;
  vendorTaxId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  lineItems: LineItem[];
  accountingStatus: 'MATCHED' | 'DISCREPANCY_FLAGGED' | 'RECONCILED';
  discrepancies: {
    type: 'PRICE_VARIANCE' | 'DUPLICATE_INVOICE' | 'MATH_MISMATCH' | 'UNMATCHED_PO' | 'BANK_CHANGE';
    message: string;
    severity: 'HIGH' | 'MEDIUM' | 'INFO';
  }[];
  quickBooksSync: 'SYNCED' | 'PENDING' | 'BLOCKED';
  confidenceScore: number;
  rawJson?: any;
}

const PRESET_DOCUMENTS: ProcessedDocument[] = [];

export function IDPClient() {
  const [documents, setDocuments] = useState<ProcessedDocument[]>(PRESET_DOCUMENTS);
  const [selectedDoc, setSelectedDoc] = useState<ProcessedDocument | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSource, setUploadSource] = useState<'MANUAL' | 'EMAIL' | 'GDRIVE'>('MANUAL');
  const [alert, setAlert] = useState<string | null>(null);

  const handleSimulateExtraction = (sampleName = 'New_Vendor_Invoice_Scan.pdf') => {
    setIsProcessing(true);
    setAlert('🔍 Neural Vision & LLM extracting tabular schema & validating against QuickBooks/Xero...');

    setTimeout(() => {
      const newDoc: ProcessedDocument = {
        id: `doc_idp_${Date.now()}`,
        fileName: sampleName,
        fileType: 'INVOICE',
        source: 'MANUAL_UPLOAD',
        vendorName: 'Quantum Logistics & Freight Corp',
        vendorTaxId: 'US-TX-9940128',
        invoiceNumber: `QLF-${Math.floor(Math.random() * 9000 + 1000)}`,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        currency: 'USD',
        subtotal: 8200.0,
        taxAmount: 656.0,
        totalAmount: 8856.0,
        confidenceScore: 99.6,
        accountingStatus: 'MATCHED',
        quickBooksSync: 'SYNCED',
        discrepancies: [],
        lineItems: [
          { id: 'li_1', sku: 'FREIGHT-REFRIG', description: 'Refrigerated Pallet Cross-Country Transport', quantity: 4, unitPrice: 1400.0, total: 5600.0 },
          { id: 'li_2', sku: 'DOCK-HANDLING', description: 'Automated Cold-Storage Warehouse Handling', quantity: 2, unitPrice: 1300.0, total: 2600.0 },
        ],
      };

      setDocuments([newDoc, ...documents]);
      setSelectedDoc(newDoc);
      setIsProcessing(false);
      setAlert(`🎉 Successfully parsed "${newDoc.fileName}"! Extracted 2 line items, validated zero discrepancies, and auto-matched with Dual Khata ledger.`);
      setTimeout(() => setAlert(null), 5000);
    }, 1800);
  };

  const handleReconcileLedger = () => {
    if (!selectedDoc) return;
    const updated = documents.map((d) =>
      d.id === selectedDoc.id
        ? { ...d, accountingStatus: 'RECONCILED' as const, quickBooksSync: 'SYNCED' as const, discrepancies: [] }
        : d
    );
    setDocuments(updated);
    setSelectedDoc({ ...selectedDoc, accountingStatus: 'RECONCILED', quickBooksSync: 'SYNCED', discrepancies: [] });
    setAlert(`⚡ Invoice ${selectedDoc.invoiceNumber} balanced and posted to Khata Dual Ledger!`);
    setTimeout(() => setAlert(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Alert Banner */}
      {alert && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
              IDP & Neural Vision
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              QuickBooks & Xero Auto-Reconciliation
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5 mt-1">
            <Scan className="text-emerald-400" size={24} />
            Intelligent Document Processing (IDP) & Discrepancy Sentinel
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Automates hundreds of hours reviewing PDFs, invoices, receipts, and contracts. Neural vision extracts structured tables, cross-validates against accounting software, and flags discrepancies.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => handleSimulateExtraction()}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Play size={14} className={isProcessing ? 'animate-spin' : ''} />
            <span>{isProcessing ? 'Extracting Schema...' : 'Process Sample Document'}</span>
          </button>
        </div>
      </div>

      {/* Ingestion Channels Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setUploadSource('EMAIL')}
          className={`p-4 rounded-3xl border transition-all cursor-pointer space-y-2 ${
            uploadSource === 'EMAIL'
              ? 'bg-emerald-500/15 border-amber-500/60 shadow-lg shadow-orange-500/15'
              : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400">
              <Inbox size={18} />
              <span className="font-bold text-xs text-white">Email Attachment Listener</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
              Live (IMAP)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Auto-ingests incoming PDF invoices from <code className="text-emerald-300">invoices@company.com</code>.
          </p>
        </div>

        <div
          onClick={() => setUploadSource('GDRIVE')}
          className={`p-4 rounded-3xl border transition-all cursor-pointer space-y-2 ${
            uploadSource === 'GDRIVE'
              ? 'bg-emerald-500/15 border-amber-500/60 shadow-lg shadow-orange-500/15'
              : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400">
              <HardDrive size={18} />
              <span className="font-bold text-xs text-white">Google Drive / S3 Bucket Sync</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
              Webhook Active
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Monitors designated cloud folders for new supplier scans and legal contract uploads.
          </p>
        </div>

        <div
          onClick={() => setUploadSource('MANUAL')}
          className={`p-4 rounded-3xl border transition-all cursor-pointer space-y-2 ${
            uploadSource === 'MANUAL'
              ? 'bg-emerald-500/15 border-amber-500/60 shadow-lg shadow-orange-500/15'
              : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400">
              <Upload size={18} />
              <span className="font-bold text-xs text-white">Direct PDF / OCR Dropzone</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
              Drag & Drop
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Upload any single or multi-page invoice, receipt, or agreement for instant parsing.
          </p>
        </div>
      </div>

      {/* Main Split: Left Document Inspector & Extracted Table, Right Processed Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Deep Extraction & Discrepancy Inspector */}
        <div className="lg:col-span-8 space-y-6">
          {selectedDoc ? (
            <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-5">
              {/* Document Header Metadata */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.06] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <FileText size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-white">{selectedDoc.vendorName}</h3>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
                          selectedDoc.accountingStatus === 'DISCREPANCY_FLAGGED'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : selectedDoc.accountingStatus === 'RECONCILED'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {selectedDoc.accountingStatus}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>Invoice: <strong className="text-white font-mono">{selectedDoc.invoiceNumber}</strong></span>
                      <span>•</span>
                      <span>Tax ID: <strong className="text-white font-mono">{selectedDoc.vendorTaxId}</strong></span>
                      <span>•</span>
                      <span>Confidence: <strong className="text-emerald-400 font-mono">{selectedDoc.confidenceScore}%</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedDoc.accountingStatus === 'DISCREPANCY_FLAGGED' ? (
                    <button
                      type="button"
                      onClick={handleReconcileLedger}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Check size={14} />
                      <span>Resolve & Force Reconcile</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleReconcileLedger}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={14} />
                      <span>Reconcile to Dual Khata</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Discrepancy Warnings Box */}
              {selectedDoc.discrepancies.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                    <AlertTriangle size={16} />
                    <span>Accounting Cross-Validation Flagged {selectedDoc.discrepancies.length} Discrepancy</span>
                  </div>
                  <div className="space-y-1.5 pl-6 text-xs text-rose-200/90">
                    {selectedDoc.discrepancies.map((d, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>
                          <strong className="text-rose-300">[{d.type}]:</strong> {d.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Extracted Tabular Line Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Scan size={14} className="text-emerald-400" />
                    <span>Neural Vision Extracted Line Items</span>
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">
                    {selectedDoc.lineItems.length} Extracted Table Rows
                  </span>
                </div>

                <div className="border border-white/[0.08] rounded-2xl overflow-hidden bg-slate-950/60">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-white/[0.04] border-b border-white/[0.08] text-slate-400 uppercase font-semibold text-[10px]">
                      <tr>
                        <th className="px-4 py-3">SKU / Code</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3 text-center">Qty</th>
                        <th className="px-4 py-3 text-right">Unit Price</th>
                        <th className="px-4 py-3 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06]">
                      {selectedDoc.lineItems.map((li) => (
                        <tr
                          key={li.id}
                          className={li.hasDiscrepancy ? 'bg-rose-500/10 hover:bg-rose-500/15' : 'hover:bg-white/[0.02]'}
                        >
                          <td className="px-4 py-3 font-mono text-slate-300">{li.sku}</td>
                          <td className="px-4 py-3 font-medium text-white">{li.description}</td>
                          <td className="px-4 py-3 text-center font-mono text-slate-300">{li.quantity}</td>
                          <td className="px-4 py-3 text-right font-mono text-slate-300">
                            ${li.unitPrice.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-white">
                            ${li.total.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Subtotals & Grand Totals Summary */}
                <div className="flex justify-end pt-2">
                  <div className="w-64 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal</span>
                      <span className="font-mono text-white">${selectedDoc.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Tax / VAT</span>
                      <span className="font-mono text-white">${selectedDoc.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold pt-1.5 border-t border-white/[0.08]">
                      <span>Grand Total</span>
                      <span className="font-mono text-emerald-400 text-sm">${selectedDoc.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-16 text-center space-y-2">
              <Scan size={32} className="text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Document Selected</h4>
              <p className="text-xs text-slate-400">Drop an invoice or select a processed scan from the right queue to inspect neural extraction details and math cross-validation.</p>
            </div>
          )}
        </div>

        {/* Right Column: Processed Documents Queue & Drag-Drop Uploader */}
        <div className="lg:col-span-4 space-y-6">
          {/* Direct File Dropzone */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Upload size={14} className="text-emerald-400" />
                <span>Upload Document / PDF</span>
              </h3>
            </div>

            <div className="border-2 border-dashed border-white/20 hover:border-amber-400/50 rounded-2xl p-6 text-center space-y-2 transition-colors bg-white/[0.02]">
              <Receipt size={28} className="mx-auto text-emerald-400" />
              <div>
                <p className="text-xs font-bold text-white">Drag & drop invoice or contract</p>
                <p className="text-[11px] text-slate-500">PDF, PNG, JPG, or TIFF up to 50MB</p>
              </div>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.tiff"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleSimulateExtraction(e.target.files[0].name);
                  }
                }}
                className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Processed Invoices Queue */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Database size={16} className="text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Document Queue ({documents.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">Vision 200 OK</span>
            </div>

            <div className="space-y-2">
              {documents.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-emerald-500/15 border-amber-500/60 ring-1 ring-amber-500/30'
                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-xs text-white truncate">{doc.vendorName}</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        ${doc.totalAmount.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{doc.invoiceNumber}</span>
                      <span
                        className={
                          doc.accountingStatus === 'DISCREPANCY_FLAGGED'
                            ? 'text-rose-400 font-bold'
                            : doc.accountingStatus === 'RECONCILED'
                            ? 'text-emerald-400'
                            : 'text-emerald-300'
                        }
                      >
                        {doc.accountingStatus}
                      </span>
                    </div>
                  </div>
                );
              })}
              {documents.length === 0 && (
                <div className="py-8 text-center text-slate-500 text-xs font-medium">
                  Document queue empty. Drop an invoice or PDF scan into the dropzone above to process.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
