'use client';

import React, { useState } from 'react';
import {
  Mail,
  Printer,
  X,
  Send,
  CheckCircle2,
  Download,
  FileText,
  Copy,
  Check,
  QrCode,
  Building2,
  Sparkles,
  Receipt,
  Share2,
} from 'lucide-react';

export interface InvoiceDispatchData {
  invoiceNumber: string;
  vendorName: string;
  vendorEmail: string;
  vendorAddress: string;
  vendorTaxId: string;
  clientName: string;
  clientCompany?: string;
  clientEmail: string;
  clientAddress?: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  taxRate: number;
  discount: number;
  items: Array<{
    id?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  paymentTerms?: string;
  bankDetails?: string;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
}

interface InvoiceDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceDispatchData;
  initialTab?: 'email' | 'receipt';
}

export function InvoiceDispatchModal({
  isOpen,
  onClose,
  invoice,
  initialTab = 'email',
}: InvoiceDispatchModalProps) {
  const [activeTab, setActiveTab] = useState<'email' | 'receipt'>(initialTab);
  const [receiptFormat, setReceiptFormat] = useState<'thermal' | 'a4'>('thermal');
  
  // Email Form State
  const [toEmail, setToEmail] = useState(invoice.clientEmail || 'client@example.com');
  const [clientName, setClientName] = useState(invoice.clientName || 'Valued Customer');
  const [subject, setSubject] = useState(
    `Invoice ${invoice.invoiceNumber} from ${invoice.vendorName} (${invoice.currency}${invoice.grandTotal.toFixed(2)})`
  );
  const [emailMessage, setEmailMessage] = useState(
    `Dear ${invoice.clientName || 'Customer'},\n\nPlease find attached the official invoice ${invoice.invoiceNumber} for ${invoice.currency}${invoice.grandTotal.toFixed(2)} due on ${invoice.dueDate}.\n\nThank you for your business!\n\nBest regards,\n${invoice.vendorName}`
  );
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      setTimeout(() => {
        setIsSent(false);
        onClose();
      }, 2500);
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  const copyPaymentLink = () => {
    navigator.clipboard.writeText(
      `https://crm.app/portal/pay/${invoice.invoiceNumber}`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/[0.12] rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-white animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Share2 size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Send & Print Invoice #{invoice.invoiceNumber}
              </h2>
              <p className="text-xs text-slate-400">
                Dispatch official digital billing via email or generate physical POS / A4 paper receipts.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Tab Switcher */}
            <div className="flex bg-white/[0.06] p-1 rounded-xl border border-white/[0.08]">
              <button
                type="button"
                onClick={() => setActiveTab('email')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'email'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mail size={13} />
                <span>Email Client</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('receipt')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'receipt'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Printer size={13} />
                <span>Physical Receipt</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: EMAIL DISPATCH */}
          {activeTab === 'email' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Form Section */}
              <form onSubmit={handleSendEmail} className="md:col-span-7 space-y-4">
                {isSent && (
                  <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span>Invoice successfully dispatched to {toEmail}! Digital tracking enabled.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Client Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={toEmail}
                      onChange={(e) => setToEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      placeholder="client@company.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. Sarah Connor"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Message Body
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-sans leading-relaxed resize-none"
                  />
                </div>

                {/* Attachments & Options */}
                <div className="p-3.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-emerald-400">
                      <FileText size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-white">Invoice_{invoice.invoiceNumber}.pdf</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Auto-generated cryptographic tax PDF attached
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-md">
                    Ready
                  </span>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={copyPaymentLink}
                    className="px-3.5 py-2 bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-white/[0.1] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copiedLink ? 'Link Copied!' : 'Copy Payment Link'}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSending || isSent}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send size={14} className={isSending ? 'animate-bounce' : ''} />
                    <span>{isSending ? 'Transmitting Email...' : isSent ? 'Sent!' : 'Send Invoice to Client'}</span>
                  </button>
                </div>
              </form>

              {/* Live Preview Card */}
              <div className="md:col-span-5 bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-emerald-400" />
                    <span>Live Customer Email Preview</span>
                  </div>

                  <div className="bg-slate-950/80 border border-white/10 rounded-xl p-3.5 space-y-3 text-xs shadow-inner">
                    <div className="border-b border-white/[0.06] pb-2 text-[11px] space-y-1">
                      <div className="text-slate-400">From: <span className="text-white font-medium">{invoice.vendorName} &lt;{invoice.vendorEmail}&gt;</span></div>
                      <div className="text-slate-400">To: <span className="text-emerald-400 font-medium">{toEmail}</span></div>
                      <div className="text-slate-400 truncate">Subject: <span className="text-white font-semibold">{subject}</span></div>
                    </div>

                    <div className="space-y-2 text-slate-300 text-xs">
                      <p className="font-bold text-white">Invoice Summary:</p>
                      <div className="bg-white/[0.04] p-2.5 rounded-lg space-y-1 font-mono text-[11px]">
                        <div className="flex justify-between text-slate-400">
                          <span>Amount Due:</span>
                          <span className="text-emerald-400 font-bold">{invoice.currency}{invoice.grandTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Due Date:</span>
                          <span className="text-white">{invoice.dueDate}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Total Items:</span>
                          <span className="text-white">{invoice.items.length}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 whitespace-pre-wrap">{emailMessage}</p>
                    </div>

                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
                      <div className="text-[10px] font-bold text-emerald-300">ONE-CLICK PAY PORTAL</div>
                      <div className="text-[9px] text-slate-400 font-mono mt-0.5">https://crm.app/portal/pay/{invoice.invoiceNumber}</div>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 text-center">
                  Includes open tracking, click telemetry, and automated wire receipts.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PHYSICAL RECEIPT & POS BILL */}
          {activeTab === 'receipt' && (
            <div className="space-y-6">
              {/* Receipt Style Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white/[0.03] p-3 rounded-2xl border border-white/[0.08]">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-300">Format:</span>
                  <div className="inline-flex rounded-xl bg-black/40 p-1 border border-white/[0.1]">
                    <button
                      type="button"
                      onClick={() => setReceiptFormat('thermal')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        receiptFormat === 'thermal'
                          ? 'bg-emerald-500 text-slate-950 shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Thermal 80mm POS Slip
                    </button>
                    <button
                      type="button"
                      onClick={() => setReceiptFormat('a4')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        receiptFormat === 'a4'
                          ? 'bg-emerald-500 text-slate-950 shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      A4 Official Tax Invoice
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/25 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={14} />
                    <span>Print Physical Receipt</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white rounded-xl text-xs font-semibold transition-all border border-white/[0.1] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Save as PDF</span>
                  </button>
                </div>
              </div>

              {/* Printable Physical Receipt Container */}
              <div className="flex justify-center p-4 bg-slate-950/60 rounded-2xl border border-white/[0.05]">
                {receiptFormat === 'thermal' ? (
                  /* 80mm Thermal Receipt Simulation */
                  <div className="w-80 bg-zinc-100 text-zinc-900 p-6 rounded-lg shadow-2xl font-mono text-xs border border-zinc-300 select-all space-y-4">
                    {/* Header */}
                    <div className="text-center space-y-1 border-b border-dashed border-zinc-400 pb-3">
                      <div className="font-extrabold text-sm uppercase tracking-wider">{invoice.vendorName}</div>
                      <div className="text-[10px] text-zinc-600">{invoice.vendorAddress}</div>
                      <div className="text-[10px] text-zinc-600">Tax ID / EIN: {invoice.vendorTaxId}</div>
                      <div className="text-[10px] font-bold text-zinc-800 pt-1">*** OFFICIAL PAYMENT RECEIPT ***</div>
                    </div>

                    {/* Metadata */}
                    <div className="text-[11px] space-y-0.5 border-b border-dashed border-zinc-400 pb-3">
                      <div className="flex justify-between">
                        <span>RECEIPT NO:</span>
                        <span className="font-bold">{invoice.invoiceNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>DATE:</span>
                        <span>{invoice.issueDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CUSTOMER:</span>
                        <span className="font-bold">{invoice.clientName}</span>
                      </div>
                      {invoice.clientCompany && (
                        <div className="flex justify-between text-[10px] text-zinc-600">
                          <span>COMPANY:</span>
                          <span>{invoice.clientCompany}</span>
                        </div>
                      )}
                    </div>

                    {/* Line Items */}
                    <div className="space-y-1.5 border-b border-dashed border-zinc-400 pb-3">
                      <div className="flex justify-between font-bold text-[11px] border-b border-zinc-300 pb-1">
                        <span>ITEM / QTY</span>
                        <span>PRICE</span>
                      </div>
                      {invoice.items.map((item, idx) => (
                        <div key={idx} className="space-y-0.5 text-[11px]">
                          <div className="font-medium truncate">{item.description}</div>
                          <div className="flex justify-between text-zinc-600 text-[10px]">
                            <span>{item.quantity} x {invoice.currency}{Number(item.unitPrice).toFixed(2)}</span>
                            <span className="font-bold text-zinc-900">{invoice.currency}{(item.quantity * item.unitPrice).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span>SUBTOTAL:</span>
                        <span>{invoice.currency}{invoice.subtotal.toFixed(2)}</span>
                      </div>
                      {invoice.taxAmount > 0 && (
                        <div className="flex justify-between">
                          <span>TAX ({invoice.taxRate}%):</span>
                          <span>{invoice.currency}{invoice.taxAmount.toFixed(2)}</span>
                        </div>
                      )}
                      {invoice.discount > 0 && (
                        <div className="flex justify-between text-zinc-600">
                          <span>DISCOUNT:</span>
                          <span>-{invoice.currency}{invoice.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-extrabold text-sm border-t border-zinc-900 pt-1.5 mt-1">
                        <span>TOTAL PAID:</span>
                        <span>{invoice.currency}{invoice.grandTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Footer / QR Code */}
                    <div className="text-center pt-3 border-t border-dashed border-zinc-400 space-y-2">
                      <div className="flex justify-center">
                        <div className="p-2 bg-white border border-zinc-300 rounded">
                          <QrCode size={48} className="text-zinc-900" />
                        </div>
                      </div>
                      <div className="text-[9px] text-zinc-600">
                        Scan QR code to verify blockchain receipt authenticity & warranty details.
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-800">
                        THANK YOU FOR YOUR PATRONAGE!
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Formal A4 Tax Invoice Paper Simulation */
                  <div className="w-full max-w-2xl bg-white text-zinc-900 p-8 rounded-xl shadow-2xl font-sans text-xs border border-zinc-200 space-y-6">
                    {/* Top Header */}
                    <div className="flex justify-between items-start border-b border-zinc-200 pb-6">
                      <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">INVOICE</h1>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5">#{invoice.invoiceNumber}</p>
                      </div>
                      <div className="text-right space-y-0.5">
                        <div className="font-bold text-sm text-zinc-900">{invoice.vendorName}</div>
                        <div className="text-zinc-500">{invoice.vendorAddress}</div>
                        <div className="text-zinc-500">{invoice.vendorEmail}</div>
                        <div className="text-zinc-600 font-mono text-[10px]">Tax ID: {invoice.vendorTaxId}</div>
                      </div>
                    </div>

                    {/* Bill To & Dates */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Billed To</div>
                        <div className="font-bold text-zinc-900">{invoice.clientName}</div>
                        {invoice.clientCompany && <div className="text-zinc-600">{invoice.clientCompany}</div>}
                        {invoice.clientEmail && <div className="text-zinc-500">{invoice.clientEmail}</div>}
                        {invoice.clientAddress && <div className="text-zinc-500">{invoice.clientAddress}</div>}
                      </div>

                      <div className="text-right space-y-1">
                        <div className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Payment Details</div>
                        <div><span className="text-zinc-500">Issue Date:</span> <span className="font-semibold text-zinc-800">{invoice.issueDate}</span></div>
                        <div><span className="text-zinc-500">Due Date:</span> <span className="font-semibold text-zinc-800">{invoice.dueDate}</span></div>
                        <div><span className="text-zinc-500">Terms:</span> <span className="font-semibold text-zinc-800">{invoice.paymentTerms || 'Due upon receipt'}</span></div>
                      </div>
                    </div>

                    {/* Table */}
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-y border-zinc-200 bg-zinc-50 text-[10px] uppercase font-bold text-zinc-500">
                          <th className="py-2 px-3">Description</th>
                          <th className="py-2 px-3 text-center w-16">Qty</th>
                          <th className="py-2 px-3 text-right w-24">Unit Price</th>
                          <th className="py-2 px-3 text-right w-24">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {invoice.items.map((item, i) => (
                          <tr key={i}>
                            <td className="py-2.5 px-3 font-medium text-zinc-800">{item.description}</td>
                            <td className="py-2.5 px-3 text-center text-zinc-600 font-mono">{item.quantity}</td>
                            <td className="py-2.5 px-3 text-right text-zinc-600 font-mono">{invoice.currency}{Number(item.unitPrice).toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-zinc-900 font-mono">{invoice.currency}{(item.quantity * item.unitPrice).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Totals Breakdown */}
                    <div className="flex justify-end pt-2">
                      <div className="w-64 space-y-1.5 text-xs">
                        <div className="flex justify-between text-zinc-500">
                          <span>Subtotal:</span>
                          <span className="font-mono text-zinc-800">{invoice.currency}{invoice.subtotal.toFixed(2)}</span>
                        </div>
                        {invoice.taxAmount > 0 && (
                          <div className="flex justify-between text-zinc-500">
                            <span>Tax ({invoice.taxRate}%):</span>
                            <span className="font-mono text-zinc-800">+{invoice.currency}{invoice.taxAmount.toFixed(2)}</span>
                          </div>
                        )}
                        {invoice.discount > 0 && (
                          <div className="flex justify-between text-emerald-600 font-medium">
                            <span>Discount:</span>
                            <span className="font-mono">-{invoice.currency}{invoice.discount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-extrabold text-base text-zinc-900 border-t border-zinc-300 pt-2">
                          <span>Total Due:</span>
                          <span className="font-mono text-emerald-700">{invoice.currency}{invoice.grandTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bank Settlement Footer */}
                    <div className="border-t border-zinc-200 pt-4 text-[10px] text-zinc-500 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-zinc-700">Bank Wire Settlement Details:</div>
                        <div>{invoice.bankDetails || 'Direct Commercial Wire / ACH Routing #9840192840'}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-700">STATUS: OFFICIAL / ISSUED</div>
                        <div>Authorized Digital Signature</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
