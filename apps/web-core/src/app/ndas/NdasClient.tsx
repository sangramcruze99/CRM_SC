'use client';

import { useState } from 'react';
import { Plus, Download, CheckCircle, Clock, FileText, Send, Lock } from 'lucide-react';

interface NDA {
  id: string;
  counterparty: string;
  signeeEmail: string;
  type: 'Mutual' | 'Unilateral' | 'Vendor';
  status: 'EXECUTED' | 'OUT_FOR_SIGNATURE' | 'DRAFT';
  effectiveDate: string;
}

const initialDemoNDAs: NDA[] = [
  {
    id: 'nda_501',
    counterparty: 'HyperScale AI Partners Ltd',
    signeeEmail: 'legal@hyperscale.ai',
    type: 'Mutual',
    status: 'EXECUTED',
    effectiveDate: '2026-08-14',
  },
  {
    id: 'nda_502',
    counterparty: 'Apex Cloud Systems Inc',
    signeeEmail: 'counsel@apexcloud.io',
    type: 'Mutual',
    status: 'OUT_FOR_SIGNATURE',
    effectiveDate: '2026-08-25',
  },
  {
    id: 'nda_503',
    counterparty: 'Vanguard Security Labs',
    signeeEmail: 'security@vanguard.tech',
    type: 'Vendor',
    status: 'EXECUTED',
    effectiveDate: '2026-07-28',
  },
];

export function NdasClient({ initialNdas = [] }: { initialNdas?: any[] }) {
  const [ndas, setNdas] = useState<NDA[]>(
    initialNdas.length > 0 ? initialNdas : initialDemoNDAs
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [counterparty, setCounterparty] = useState('');
  const [signeeEmail, setSigneeEmail] = useState('');
  const [type, setType] = useState<'Mutual' | 'Unilateral' | 'Vendor'>('Mutual');
  const [alert, setAlert] = useState<string | null>(null);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!counterparty || !signeeEmail) return;

    const newNda: NDA = {
      id: `nda_${Math.floor(100 + Math.random() * 900)}`,
      counterparty,
      signeeEmail,
      type,
      status: 'OUT_FOR_SIGNATURE',
      effectiveDate: new Date().toISOString().split('T')[0],
    };

    setNdas([newNda, ...ndas]);
    setIsModalOpen(false);
    setCounterparty('');
    setSigneeEmail('');
    setAlert(`NDA envelope generated and dispatched to ${signeeEmail}!`);
    setTimeout(() => setAlert(null), 3000);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {alert && (
        <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-amber-300 text-xs font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
          <CheckCircle size={16} className="text-amber-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Lock className="text-amber-400" size={24} />
            Non-Disclosure Agreements (NDAs)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Automated legal confidentiality agreements, mutual NDA workflows, and expiration tracking.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-orange-500/25 active:scale-[0.98] border border-amber-400/40 cursor-pointer"
        >
          <Plus size={16} />
          <span>New NDA Agreement</span>
        </button>
      </div>

      {/* NDAs Table */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/[0.02] text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-white/[0.08]">
            <tr>
              <th className="px-6 py-4">Counterparty / Partner</th>
              <th className="px-6 py-4">Signee Email</th>
              <th className="px-6 py-4">Agreement Type</th>
              <th className="px-6 py-4">Effective Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {ndas.map((n) => (
              <tr key={n.id} className="hover:bg-white/[0.04] transition-colors">
                <td className="px-6 py-4 font-bold text-white flex items-center gap-2 text-sm">
                  <FileText size={16} className="text-amber-400" />
                  <span>{n.counterparty}</span>
                </td>
                <td className="px-6 py-4 text-slate-300 text-xs font-medium">{n.signeeEmail}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/[0.08] text-slate-300 border border-white/10">
                    {n.type} NDA
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400 text-xs font-medium">{n.effectiveDate}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      n.status === 'EXECUTED'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {n.status === 'EXECUTED' ? <CheckCircle size={12} /> : <Clock size={12} />}
                    {n.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => {
                      setAlert(`Downloading certified PDF for ${n.counterparty}...`);
                      setTimeout(() => setAlert(null), 2500);
                    }}
                    className="px-3.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-white/[0.1] inline-flex items-center gap-1 ml-auto cursor-pointer"
                  >
                    <Download size={12} />
                    <span>PDF</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="bg-slate-950/95 border border-white/[0.12] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 text-white">
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
              <h2 className="text-base font-bold text-white">Generate NDA Agreement</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Counterparty Entity</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Horizon Analytics Corp"
                  value={counterparty}
                  onChange={(e) => setCounterparty(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Authorized Signee Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. legal@horizon.com"
                  value={signeeEmail}
                  onChange={(e) => setSigneeEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Agreement Structure</label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="Mutual">Mutual / Two-Way NDA</option>
                  <option value="Unilateral">Unilateral (One-Way)</option>
                  <option value="Vendor">Vendor Confidentiality Addendum</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-xl text-xs font-semibold border border-white/[0.1] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-orange-500/25 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send size={14} />
                  <span>Send for Signature</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
