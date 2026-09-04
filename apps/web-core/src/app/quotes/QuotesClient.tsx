'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
} from 'lucide-react';

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

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileBadge className="text-emerald-600 dark:text-emerald-400" size={24} />
            Commercial Quotes & Proposals
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Build formal price proposals, set discount tiers, and convert accepted quotes into invoices.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 cursor-pointer"
        >
          <Plus size={16} />
          <span>New Quote</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Quoted Value</span>
            <DollarSign size={18} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            ${quotes.reduce((acc, q) => acc + q.amount, 0).toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-2 font-medium">Across {quotes.length} active proposals</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Accepted Proposals</span>
            <CheckCircle size={18} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            ${quotes.filter((q) => q.status === 'ACCEPTED').reduce((acc, q) => acc + q.amount, 0).toLocaleString()}
          </div>
          <div className="text-xs text-emerald-400 mt-2 font-bold">Ready for billing conversion</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Decision</span>
            <Clock size={18} className="text-slate-300" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {quotes.filter((q) => q.status === 'SENT').length} quotes
          </div>
          <div className="text-xs text-slate-400 mt-2 font-medium">Avg 7 days until expiry</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/[0.02] text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-white/[0.08]">
            <tr>
              <th className="px-6 py-4">Quote #</th>
              <th className="px-6 py-4">Client / Account</th>
              <th className="px-6 py-4">Total Amount</th>
              <th className="px-6 py-4">Validity Window</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {quotes.map((q) => (
              <tr key={q.id} className="hover:bg-white/[0.04] transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-emerald-300">{q.quoteNumber}</td>
                <td className="px-6 py-4">
                  <div className="font-bold text-white text-sm">{q.client}</div>
                  <div className="text-xs text-slate-400 font-medium">{q.itemsCount} bundled items</div>
                </td>
                <td className="px-6 py-4 font-mono font-extrabold text-white">
                  ${q.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-slate-300 text-xs font-medium">{q.validUntil}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      q.status === 'ACCEPTED'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : q.status === 'SENT'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white/[0.08] text-slate-300 border border-white/10'
                    }`}
                  >
                    {q.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {q.status === 'SENT' && (
                      <button
                        onClick={() => handleAccept(q.id)}
                        className="px-3 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Accept
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setAlert(`Exporting PDF proposal for ${q.quoteNumber}...`);
                        setTimeout(() => setAlert(null), 2500);
                      }}
                      className="px-3 py-1 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-white/[0.1] flex items-center gap-1 cursor-pointer"
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
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-xs font-medium">
                  No proposals created yet. Click <span className="text-emerald-400 font-bold">"New Quote"</span> above to generate a client quotation.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
    </div>
  );
}
