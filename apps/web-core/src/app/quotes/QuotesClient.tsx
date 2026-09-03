'use client';

import { useState } from 'react';
import {
  FileBadge,
  Plus,
  DollarSign,
  Download,
  CheckCircle,
  Clock,
  Send,
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
  const [client, setClient] = useState('');
  const [amount, setAmount] = useState('');
  const [validDays, setValidDays] = useState('30');
  const [alert, setAlert] = useState<string | null>(null);

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
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {alert && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FileBadge className="text-emerald-400" size={24} />
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
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="bg-slate-950/95 border border-white/[0.12] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 text-white">
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
              <h2 className="text-base font-bold text-white">Create New Price Proposal</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Client / Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Tech Solutions"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Total Quoted Value ($ USD)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 25000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Offer Validity Window</label>
                <select
                  value={validDays}
                  onChange={(e) => setValidDays(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="15">15 Days</option>
                  <option value="30">30 Days (Standard)</option>
                  <option value="60">60 Days</option>
                  <option value="90">90 Days</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-xl text-xs font-semibold border border-white/[0.1] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send size={14} />
                  <span>Send Proposal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
