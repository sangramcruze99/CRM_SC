'use client';

import { useState } from 'react';
import {
  CreditCard,
  Plus,
  Copy,
  CheckCircle,
  QrCode,
  DollarSign,
  Zap,
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

const initialDemoLinks: PaymentLink[] = [
  {
    id: 'plink_771',
    title: 'Enterprise Onboarding & Kickoff Retainer',
    amount: 5000,
    currency: 'USD',
    url: 'https://pay.businessos.io/l/kickoff-retainer-5000',
    paymentsCount: 12,
    totalCollected: 60000,
    status: 'ACTIVE',
    createdDate: '2026-08-10',
  },
  {
    id: 'plink_772',
    title: 'Q3 Product Consultation & Strategy Workshop',
    amount: 1500,
    currency: 'USD',
    url: 'https://pay.businessos.io/l/strategy-workshop-1500',
    paymentsCount: 8,
    totalCollected: 12000,
    status: 'ACTIVE',
    createdDate: '2026-08-18',
  },
  {
    id: 'plink_773',
    title: 'AI Engine Dedicated Model Training Voucher',
    amount: 2500,
    currency: 'USD',
    url: 'https://pay.businessos.io/l/ai-training-voucher-2500',
    paymentsCount: 4,
    totalCollected: 10000,
    status: 'ACTIVE',
    createdDate: '2026-08-22',
  },
];

export function PaymentLinksClient({ initialLinks = [] }: { initialLinks?: any[] }) {
  const [links, setLinks] = useState<PaymentLink[]>(
    initialLinks.length > 0 ? initialLinks : initialDemoLinks
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [alert, setAlert] = useState<string | null>(null);

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
        <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-amber-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle size={16} className="text-amber-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <CreditCard className="text-amber-400" size={24} />
            Instant Payment Links & QR Pay
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Generate one-click checkout links, embed QR codes on invoices, and accept wire/card settlements.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-orange-500/25 active:scale-[0.98] border border-amber-400/40 cursor-pointer"
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
            <Zap size={18} className="text-amber-400" />
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
            className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] hover:border-amber-500/40 rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4 flex flex-col justify-between transition-all group"
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

              <h3 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                {link.title}
              </h3>

              <div className="text-2xl font-black font-mono text-amber-400">${link.amount.toLocaleString()}</div>
            </div>

            <div className="space-y-3 pt-3 border-t border-white/[0.06]">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{link.paymentsCount} Transactions</span>
                <span className="font-bold font-mono text-white">${link.totalCollected.toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(link.url)}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-orange-500/20 cursor-pointer"
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
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="bg-slate-950/95 border border-white/[0.12] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 text-white">
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
              <h2 className="text-base font-bold text-white">Create Instant Checkout Link</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Purpose / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Architecture Consultation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Fixed Checkout Amount ($ USD)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none font-mono"
                />
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
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-orange-500/25 cursor-pointer"
                >
                  Generate Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
