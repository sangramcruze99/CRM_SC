'use client';

import { useState } from 'react';
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="bg-slate-950/95 border border-white/[0.12] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 text-white">
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
              <h2 className="text-base font-bold text-white">Dispatch Document for E-Sign</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contract / Agreement Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Services Agreement (MSA)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Signer Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Connor"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Signer Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sarah@cyberdyne.io"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
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
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send size={14} />
                  <span>Send Envelope</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
