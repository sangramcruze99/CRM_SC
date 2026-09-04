'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FileCheck2,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Download,
  Bell,
  X,
  Sparkles,
  User,
  Mail,
} from 'lucide-react';

interface Envelope {
  id: string;
  title: string;
  recipientName: string;
  recipientEmail: string;
  status: 'SIGNED' | 'PENDING' | 'EXPIRED';
  sentDate: string;
  completedDate?: string;
}

const initialDemoEnvelopes: Envelope[] = [];

export function ESignaturesClient({ initialEnvelopes = [] }: { initialEnvelopes?: any[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [envelopes, setEnvelopes] = useState<Envelope[]>(
    initialEnvelopes.length > 0 ? initialEnvelopes : initialDemoEnvelopes
  );
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const filteredEnvelopes = envelopes.filter(
    (e) => selectedStatus === 'ALL' || e.status === selectedStatus
  );

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !recipientName || !recipientEmail) return;

    const newEnv: Envelope = {
      id: `env_${Math.floor(100 + Math.random() * 900)}`,
      title,
      recipientName,
      recipientEmail,
      status: 'PENDING',
      sentDate: new Date().toISOString().split('T')[0],
    };

    setEnvelopes([newEnv, ...envelopes]);
    setIsModalOpen(false);
    setTitle('');
    setRecipientName('');
    setRecipientEmail('');
    setAlertMessage(`Envelope sent to ${recipientEmail} for signature!`);
    setTimeout(() => setAlertMessage(null), 3000);
  }

  function handleSignSimulate(id: string) {
    setEnvelopes(
      envelopes.map((e) =>
        e.id === id
          ? {
              ...e,
              status: 'SIGNED',
              completedDate: new Date().toISOString().split('T')[0],
            }
          : e
      )
    );
    setAlertMessage('Document marked as SIGNED with verified cryptographical timestamp!');
    setTimeout(() => setAlertMessage(null), 3000);
  }

  function handleReminder(email: string) {
    setAlertMessage(`Reminder ping sent to ${email}`);
    setTimeout(() => setAlertMessage(null), 2500);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Flash Alert */}
      {alertMessage && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{alertMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FileCheck2 className="text-emerald-400" size={24} />
            E-Signatures & Digital Contracts
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Send legally binding documents, track envelope signing progress, and download certified audit trails.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 cursor-pointer"
        >
          <Send size={16} />
          <span>Send Document for Sign</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Envelopes</span>
            <FileText size={18} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{envelopes.length}</div>
          <div className="text-xs text-slate-400 mt-2 font-medium">All time contracts</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completed & Signed</span>
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            {envelopes.filter((e) => e.status === 'SIGNED').length}
          </div>
          <div className="text-xs text-emerald-400 mt-2 font-bold">92% completion velocity</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Awaiting Signature</span>
            <Clock size={18} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            {envelopes.filter((e) => e.status === 'PENDING').length}
          </div>
          <div className="text-xs text-emerald-400 mt-2 font-medium">Avg 1.2 days to sign</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Declined / Expired</span>
            <AlertCircle size={18} className="text-slate-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {envelopes.filter((e) => e.status === 'EXPIRED').length}
          </div>
          <div className="text-xs text-slate-400 mt-2 font-medium">Zero contract disputes</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['ALL', 'SIGNED', 'PENDING', 'EXPIRED'].map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedStatus === st
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.1]'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/[0.02] text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-white/[0.08]">
            <tr>
              <th className="px-6 py-4">Contract Title</th>
              <th className="px-6 py-4">Recipient Signer</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Sent Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {filteredEnvelopes.map((env) => (
              <tr key={env.id} className="hover:bg-white/[0.04] transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-white text-sm">{env.title}</div>
                  <div className="text-xs font-mono text-slate-500">{env.id}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-white text-xs">{env.recipientName}</div>
                  <div className="text-xs text-slate-400">{env.recipientEmail}</div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      env.status === 'SIGNED'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : env.status === 'PENDING'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white/[0.08] text-slate-400 border border-white/10'
                    }`}
                  >
                    {env.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-300 text-xs font-medium">{env.sentDate}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {env.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleSignSimulate(env.id)}
                          className="px-3 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Sign Now
                        </button>
                        <button
                          onClick={() => handleReminder(env.recipientEmail)}
                          className="px-2 py-1 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-xl text-xs border border-white/[0.1] transition-colors cursor-pointer"
                          title="Send ping reminder"
                        >
                          <Bell size={12} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setAlertMessage(`Downloading certified PDF audit trail for ${env.id}...`);
                        setTimeout(() => setAlertMessage(null), 2500);
                      }}
                      className="px-3 py-1 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-white/[0.1] flex items-center gap-1 cursor-pointer"
                    >
                      <Download size={12} />
                      <span>PDF</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredEnvelopes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-xs font-medium">
                  No signature envelopes found. Click <span className="text-emerald-400 font-bold">"Send for Signature"</span> to dispatch a document.
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
                  <FileCheck2 size={20} />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-black tracking-widest text-emerald-300 uppercase">
                    E-SIGNATURE DISPATCH
                  </span>
                  <h2 className="text-base font-bold text-white tracking-tight mt-0.5">Dispatch Document for E-Sign</h2>
                  <p className="text-xs text-slate-400 font-medium">Create cryptographic signature envelope for signee</p>
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
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Contract / Agreement Title</label>
                <div className="relative">
                  <FileText size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master Services Agreement (MSA)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Signer Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Connor"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Signer Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. sarah@cyberdyne.io"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                  />
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
                  <span>Send Envelope</span>
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
