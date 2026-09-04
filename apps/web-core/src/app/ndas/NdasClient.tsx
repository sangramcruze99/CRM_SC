'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Download, CheckCircle, Clock, FileText, Send, Lock, X, Sparkles, Building, Mail, FileCheck } from 'lucide-react';

interface NDA {
  id: string;
  counterparty: string;
  signeeEmail: string;
  type: 'Mutual' | 'Unilateral' | 'Vendor';
  status: 'EXECUTED' | 'OUT_FOR_SIGNATURE' | 'DRAFT';
  effectiveDate: string;
}

const initialDemoNDAs: NDA[] = [];

export function NdasClient({ initialNdas = [] }: { initialNdas?: any[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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
    <div className="space-y-6 max-w-7xl mx-auto text-slate-900 dark:text-white">
      {alert && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
          <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Lock className="text-emerald-600 dark:text-emerald-400" size={24} />
            Non-Disclosure Agreements (NDAs)
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Automated legal confidentiality agreements, mutual NDA workflows, and expiration tracking.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 cursor-pointer"
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
                  <FileText size={16} className="text-emerald-400" />
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
                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
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
            {ndas.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-xs font-medium">
                  No agreements drafted yet. Click <span className="text-emerald-400 font-bold">"Draft New NDA"</span> above to prepare your first confidentiality contract.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Remodeled Luxury Glass Portal Modal */}
      {isModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-950/99 border border-white/[0.14] rounded-3xl p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(16,185,129,0.15)] backdrop-blur-2xl text-white space-y-5 animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Top Specular Flare */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-emerald-500/10 blur-3xl rounded-full" />

            {/* Header with category badge */}
            <div className="flex items-start justify-between pb-4 border-b border-white/[0.08] relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <Lock size={20} />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-black tracking-widest text-emerald-300 uppercase">
                    LEGAL ENVELOPE ENGINE
                  </span>
                  <h2 className="text-base font-bold text-white tracking-tight mt-0.5">Generate NDA Agreement</h2>
                  <p className="text-xs text-slate-400 font-medium">Non-disclosure & trade secret confidentiality dispatch</p>
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
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Counterparty Entity</label>
                <div className="relative">
                  <Building size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Horizon Analytics Corp"
                    value={counterparty}
                    onChange={(e) => setCounterparty(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Authorized Signee Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. legal@horizon.com"
                    value={signeeEmail}
                    onChange={(e) => setSigneeEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Agreement Structure</label>
                <div className="relative">
                  <FileCheck size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                  >
                    <option value="Mutual">Mutual / Two-Way Non-Disclosure (Standard)</option>
                    <option value="Unilateral">Unilateral (One-Way Confidentiality)</option>
                    <option value="Vendor">Vendor Confidentiality & IP Addendum</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black tracking-wide shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Send size={13} />
                  <span>Send for Signature</span>
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
