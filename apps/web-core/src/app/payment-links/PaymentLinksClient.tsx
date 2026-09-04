'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  CreditCard,
  Plus,
  Copy,
  CheckCircle,
  QrCode,
  DollarSign,
  Zap,
  Tag,
  Sparkles,
  X,
} from 'lucide-react';

interface PaymentLink {
  id: string;
  title: string;
  amount: number;
  currency: string;
  url: string;
  paymentsCount: number;
  totalCollected: number;
  status: 'ACTIVE' | 'DISABLED';
  createdDate: string;
}

const initialDemoLinks: PaymentLink[] = [];

export function PaymentLinksClient({ initialLinks = [] }: { initialLinks?: any[] }) {
  const [links, setLinks] = useState<PaymentLink[]>(
    initialLinks.length > 0 ? initialLinks : initialDemoLinks
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [alert, setAlert] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalCollectedAll = links.reduce((acc, l) => acc + l.totalCollected, 0);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !amount) return;

    const slug = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newLink: PaymentLink = {
      id: `plink_${Math.floor(100 + Math.random() * 900)}`,
      title,
      amount: parseFloat(amount),
      currency: 'USD',
      url: `https://pay.businessos.io/l/${slug}-${amount}`,
      paymentsCount: 0,
      totalCollected: 0,
      status: 'ACTIVE',
      createdDate: new Date().toISOString().split('T')[0],
    };

    setLinks([newLink, ...links]);
    setIsModalOpen(false);
    setTitle('');
    setAmount('');
    setAlert(`Payment link for "${title}" created successfully!`);
    setTimeout(() => setAlert(null), 3000);
  }

  function copyToClipboard(url: string) {
    navigator.clipboard.writeText(url);
    setAlert(`Copied checkout link to clipboard: ${url}`);
    setTimeout(() => setAlert(null), 3000);
  }

  function handleToggleStatus(id: string) {
    setLinks(
      links.map((l) =>
        l.id === id ? { ...l, status: l.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' } : l
      )
    );
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
            <CreditCard className="text-emerald-400" size={24} />
            Instant Payment Links & QR Pay
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Generate one-click checkout links, embed QR codes on invoices, and accept wire/card settlements.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 cursor-pointer"
        >
          <Plus size={16} />
          <span>Create Payment Link</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Volume Collected</span>
            <DollarSign size={18} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            ${totalCollectedAll.toLocaleString()}
          </div>
          <div className="text-xs text-emerald-400 mt-2 font-bold">100% instant settlement via Stripe Connect</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Hosted Links</span>
            <Zap size={18} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {links.filter((l) => l.status === 'ACTIVE').length} Links
          </div>
          <div className="text-xs text-slate-400 mt-2 font-medium">Ready for distribution</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Transactions Processed</span>
            <CreditCard size={18} className="text-slate-300" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {links.reduce((acc, l) => acc + l.paymentsCount, 0)} payments
          </div>
          <div className="text-xs text-slate-400 mt-2 font-medium">Zero chargebacks</div>
        </div>
      </div>

      {/* Grid of Payment Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {links.map((link) => (
          <div
            key={link.id}
            className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] hover:border-emerald-500/40 rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4 flex flex-col justify-between transition-all group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    link.status === 'ACTIVE'
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-white/[0.08] text-slate-400 border border-white/10'
                  }`}
                >
                  ● {link.status}
                </span>
                <span className="text-[11px] text-slate-500 font-mono font-medium">{link.createdDate}</span>
              </div>

              <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                {link.title}
              </h3>

              <div className="text-2xl font-black font-mono text-emerald-400">${link.amount.toLocaleString()}</div>
            </div>

            <div className="space-y-3 pt-3 border-t border-white/[0.06]">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{link.paymentsCount} Transactions</span>
                <span className="font-bold font-mono text-white">${link.totalCollected.toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(link.url)}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  <Copy size={13} />
                  <span>Copy Link</span>
                </button>

                <button
                  onClick={() => handleToggleStatus(link.id)}
                  className="px-3 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-white/[0.1] transition-colors cursor-pointer"
                >
                  {link.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          </div>
        ))}
        {links.length === 0 && (
          <div className="col-span-full py-16 text-center text-xs font-medium text-slate-500 border-2 border-dashed border-white/[0.08] rounded-3xl">
            No instant payment checkout links created yet. Click <span className="text-emerald-400 font-bold">"Create Payment Link"</span> to generate one.
          </div>
        )}
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
                  <CreditCard size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-black tracking-widest text-emerald-300 uppercase">
                      CHECKOUT ENGINE
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white tracking-tight mt-0.5">Create Instant Checkout Link</h2>
                  <p className="text-xs text-slate-400 font-medium">Generate hosted payment page URL with live settlement</p>
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
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Payment Purpose / Title</label>
                <div className="relative">
                  <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. VIP Architecture Consultation"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Fixed Checkout Amount ($ USD)</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 font-mono font-bold focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
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
                  <Sparkles size={13} />
                  <span>Generate Link</span>
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
