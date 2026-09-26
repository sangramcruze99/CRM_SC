'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  FileBadge,
  Plus,
  DollarSign,
  Download,
  CheckCircle,
  Clock,
  Send,
  Building2,
  Calendar,
  Sparkles,
  X,
  FolderOpen,
  Paperclip,
} from 'lucide-react';
import { DocumentVaultPickerModal, VaultDocument } from '@/components/documents/DocumentVaultPickerModal';

interface Quote {
  id: string;
  quoteNumber: string;
  client: string;
  amount: number;
  validUntil: string;
  status: 'ACCEPTED' | 'SENT' | 'DRAFT';
  itemsCount: number;
}

const initialDemoQuotes: Quote[] = [];

export function QuotesClient({ initialQuotes = [] }: { initialQuotes?: any[] }) {
  const [quotes, setQuotes] = useState<Quote[]>(
    initialQuotes.length > 0 ? initialQuotes : initialDemoQuotes
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [client, setClient] = useState('');
  const [amount, setAmount] = useState('');
  const [validDays, setValidDays] = useState('30');
  const [alert, setAlert] = useState<string | null>(null);
  const [attachedVaultDoc, setAttachedVaultDoc] = useState<VaultDocument | null>(null);
  const [isVaultPickerOpen, setIsVaultPickerOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!client || !amount) return;

    const expiry = new Date(Date.now() + parseInt(validDays, 10) * 86400000)
      .toISOString()
      .split('T')[0];

    const newQuote: Quote = {
      id: `q_${Math.floor(100 + Math.random() * 900)}`,
      quoteNumber: `Q-2026-0${Math.floor(100 + Math.random() * 900)}`,
      client,
      amount: parseFloat(amount),
      validUntil: expiry,
      status: 'SENT',
      itemsCount: 3,
    };

    setQuotes([newQuote, ...quotes]);
    setIsModalOpen(false);
    setClient('');
    setAmount('');
    setAlert(`Quote ${newQuote.quoteNumber} created and dispatched to ${client}!`);
    setTimeout(() => setAlert(null), 3000);
  }

  function handleAccept(id: string) {
    setQuotes(
      quotes.map((q) => (q.id === id ? { ...q, status: 'ACCEPTED' } : q))
    );
    setAlert('Quote successfully accepted by enterprise client!');
    setTimeout(() => setAlert(null), 3000);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-900 dark:text-white">
      {alert && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* 1. TOP EXECUTIVE COCKPIT HEADER CHASSIS */}
      <div className="botanical-glass-card p-5 sm:p-6 rounded-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-slate-950 flex items-center justify-center text-xl font-bold shadow-lg shadow-emerald-500/20 border border-emerald-300/30 shrink-0">
              <FileBadge size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-black text-white tracking-tight">
                  Commercial Quotes & Proposals
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  REAL-TIME SYNC
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/[0.06] text-slate-300 border border-white/10">
                  {quotes.length} Active Records
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Configure formal price proposals, structure volume discount matrices, and seamlessly convert accepted quotes into commercial invoices.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setIsVaultPickerOpen(true)}
              className="px-3.5 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition-all border border-white/10 flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              <FolderOpen size={14} className="text-emerald-400" />
              <span>Attach Vault Document</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              <Plus size={15} />
              <span>+ New Proposal</span>
            </button>
          </div>
        </div>

        {/* Sentinel Automated Pulse Strip */}
        <div className="pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-2.5 py-1 rounded-lg bg-black/40 border border-emerald-500/30 flex items-center gap-2 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white">Hermes</span>
              <span className="text-[10px] text-slate-400">Omnichannel Proposal Dispatcher</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
              vault/inbound/quotes/
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1.5">
            <Sparkles size={11} />
            <span>Automated Document Verification Active</span>
          </span>
        </div>
      </div>

      {/* 2. COCKPIT TELEMETRY METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="botanical-glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">Total Quoted Value</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <DollarSign size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            ${quotes.reduce((acc, q) => acc + q.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/[0.06] text-[11px]">
            <span className="text-slate-400">Across {quotes.length} proposals</span>
            <span className="text-emerald-400 font-mono font-bold">+14.2% Pipeline</span>
          </div>
        </div>

        <div className="botanical-glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">Accepted Proposals</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
            ${quotes.filter((q) => q.status === 'ACCEPTED').reduce((acc, q) => acc + q.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/[0.06] text-[11px]">
            <span className="text-slate-400">Ready for billing conversion</span>
            <Link href="/invoices" className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors">
              <span>Convert to Invoices</span>
              <span className="text-xs">&rarr;</span>
            </Link>
          </div>
        </div>

        <div className="botanical-glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">Pending Decision</span>
            <div className="w-7 h-7 rounded-lg bg-white/[0.08] border border-white/10 flex items-center justify-center text-slate-300">
              <Clock size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            {quotes.filter((q) => q.status === 'SENT').length} <span className="text-sm font-sans font-normal text-slate-400">proposals</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/[0.06] text-[11px]">
            <span className="text-slate-400">Standard 30-Day Expiry</span>
            <span className="text-slate-300 font-mono">Hermes Sync Active</span>
          </div>
        </div>
      </div>

      {/* 3. PROPOSALS DATA TABLE CHASSIS */}
      <div className="botanical-glass-card rounded-2xl overflow-hidden border border-white/[0.08]">
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between gap-3 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase text-slate-300">Commercial Proposal Registry</span>
            <span className="px-2 py-0.2 rounded bg-emerald-500/10 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/20">
              {quotes.length} total
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-black/30 text-slate-400 text-[11px] uppercase tracking-wider font-mono font-bold border-b border-white/[0.08]">
              <tr>
                <th className="px-6 py-3.5">Proposal #</th>
                <th className="px-6 py-3.5">Client &amp; Scope</th>
                <th className="px-6 py-3.5">Total Amount</th>
                <th className="px-6 py-3.5">Validity Window</th>
                <th className="px-6 py-3.5">Lifecycle Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {quotes.map((q) => (
                <tr key={q.id} className="hover:bg-white/[0.04] transition-colors group">
                  <td className="px-6 py-4 font-mono font-bold text-emerald-300 text-xs">{q.quoteNumber}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-white text-xs">{q.client}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{q.itemsCount} bundled item(s)</div>
                  </td>
                  <td className="px-6 py-4 font-mono font-black text-white text-sm">
                    ${Number(q.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-slate-300 text-xs font-mono">{q.validUntil}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                        q.status === 'ACCEPTED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : q.status === 'SENT'
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                          : 'bg-white/[0.08] text-slate-300 border border-white/10'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${q.status === 'ACCEPTED' ? 'bg-emerald-400' : 'bg-teal-400'}`} />
                      {q.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {q.status === 'SENT' && (
                        <button
                          onClick={() => handleAccept(q.id)}
                          className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer active:scale-[0.98]"
                        >
                          Accept
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setAlert(`Exporting PDF proposal for ${q.quoteNumber}...`);
                          setTimeout(() => setAlert(null), 2500);
                        }}
                        className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-white/[0.1] flex items-center gap-1 cursor-pointer"
                      >
                        <Download size={12} />
                        <span>PDF</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {quotes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20">
                        <FileBadge size={24} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">No commercial quotes on record</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Create formal price proposals with itemized breakdowns or import terms directly from Smart Vault.
                        </p>
                      </div>
                      <div className="pt-2">
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 cursor-pointer"
                        >
                          + New Commercial Proposal
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-950/99 border border-white/[0.14] rounded-3xl p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(16,185,129,0.15)] backdrop-blur-2xl text-white space-y-5 animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Top Specular Glow Lines */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-emerald-500/10 blur-3xl rounded-full" />

            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/[0.08] relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <FileBadge size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-black tracking-widest text-emerald-300 uppercase">
                      PROPOSALS & QUOTES
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white tracking-tight mt-0.5">Create New Price Proposal</h2>
                  <p className="text-xs text-slate-400 font-medium">Build customized quote package with validity expiration</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs relative z-10">
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Client / Company Name</label>
                <div className="relative">
                  <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Tech Solutions"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Total Quoted Value ($ USD)</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="number"
                    required
                    placeholder="e.g. 25000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 font-mono font-bold focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Offer Validity Window</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    value={validDays}
                    onChange={(e) => setValidDays(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#0c1411] border border-white/[0.12] rounded-xl text-xs font-bold text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  >
                    <option value="15">15 Days</option>
                    <option value="30">30 Days (Standard)</option>
                    <option value="60">60 Days</option>
                    <option value="90">90 Days</option>
                  </select>
                </div>
              </div>

              {/* Document Vault Proposal Attachment */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Proposal Document / SOW</label>
                  <button
                    type="button"
                    onClick={() => setIsVaultPickerOpen(true)}
                    className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <FolderOpen size={12} />
                    <span>{attachedVaultDoc ? 'Change Vault File' : 'Attach from Vault'}</span>
                  </button>
                </div>

                {attachedVaultDoc ? (
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-2 animate-in fade-in">
                    <div className="flex items-center gap-2 min-w-0">
                      <Paperclip size={13} className="text-emerald-400 shrink-0" />
                      <span className="text-[11px] font-bold text-white truncate">{attachedVaultDoc.name}</span>
                      <span className="text-[10px] text-emerald-300/80 font-mono">
                        ({(attachedVaultDoc.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachedVaultDoc(null)}
                      className="text-slate-400 hover:text-rose-400 p-1 rounded-md hover:bg-white/10"
                      title="Remove attachment"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsVaultPickerOpen(true)}
                    className="w-full py-2 bg-white/[0.03] hover:bg-emerald-500/10 border border-dashed border-white/[0.12] hover:border-emerald-500/40 rounded-xl text-slate-400 hover:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FolderOpen size={13} />
                    <span>Attach Proposal PDF or SOW from Document Vault</span>
                  </button>
                )}
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3 relative z-10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black tracking-wide shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Send size={13} />
                  <span>Send Proposal</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Document Vault Selection Modal */}
      <DocumentVaultPickerModal
        isOpen={isVaultPickerOpen}
        onClose={() => setIsVaultPickerOpen(false)}
        onSelect={(doc: VaultDocument) => {
          setAttachedVaultDoc(doc);
        }}
        title="Attach Proposal from Vault"
        description="Select any SOW, contract pricing sheet, or technical proposal to attach to this client quotation."
        actionLabel="Attach to Quote"
      />
    </div>
  );
}
