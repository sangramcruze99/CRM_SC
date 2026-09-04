'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FileCheck,
  Plus,
  Clock,
  ShieldCheck,
  Flame,
  CheckCircle,
  X,
  Sparkles,
  Shield,
  User,
  Zap,
} from 'lucide-react';

interface SLAPolicy {
  id: string;
  name: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  firstResponseTime: string;
  resolutionTime: string;
  coverage: '24x7' | 'Business Hours (9-5)';
  escalationRole: string;
  isActive: boolean;
}

const initialPolicies: SLAPolicy[] = [];

export function SlasClient({ initialSlas = [] }: { initialSlas?: any[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [policies, setPolicies] = useState<SLAPolicy[]>(
    initialSlas.length > 0 ? initialSlas : initialPolicies
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [priority, setPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [firstResponse, setFirstResponse] = useState('');
  const [resolution, setResolution] = useState('');
  const [coverage, setCoverage] = useState<'24x7' | 'Business Hours (9-5)'>('24x7');
  const [escalationRole, setEscalationRole] = useState('');
  const [alert, setAlert] = useState<string | null>(null);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !firstResponse || !resolution) return;

    const newPolicy: SLAPolicy = {
      id: `sla_${Math.floor(100 + Math.random() * 900)}`,
      name,
      priority,
      firstResponseTime: firstResponse,
      resolutionTime: resolution,
      coverage,
      escalationRole: escalationRole || 'Technical Support Lead',
      isActive: true,
    };

    setPolicies([...policies, newPolicy]);
    setIsModalOpen(false);
    setName('');
    setFirstResponse('');
    setResolution('');
    setAlert(`SLA Policy "${name}" configured and active across dispatch engines!`);
    setTimeout(() => setAlert(null), 3000);
  }

  function handleToggle(id: string) {
    setPolicies(
      policies.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
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
            <FileCheck className="text-emerald-400" size={24} />
            Service Level Agreements (SLAs)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure incident response commitments, resolution deadlines, and automated breach escalations.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 cursor-pointer"
        >
          <Plus size={16} />
          <span>New SLA Rule</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Overall SLA Adherence</span>
            <ShieldCheck size={18} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">99.4%</div>
          <div className="text-xs text-emerald-400 mt-2 font-bold">+0.8% above contractual requirement</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">P1 First Response Time</span>
            <Flame size={18} className="text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">8.4 mins</div>
          <div className="text-xs text-slate-400 mt-2 font-medium">Under 15m commitment target</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Policy Rules</span>
            <Clock size={18} className="text-slate-300" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {policies.filter((p) => p.isActive).length} Policies
          </div>
          <div className="text-xs text-slate-400 mt-2 font-medium">Automatic dispatch enabled</div>
        </div>
      </div>

      {/* SLA Policy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {policies.map((policy) => (
          <div
            key={policy.id}
            className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] hover:border-emerald-500/40 rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4 flex flex-col justify-between transition-all"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    policy.priority === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                      : policy.priority === 'HIGH'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-white/[0.08] text-slate-300 border border-white/10'
                  }`}
                >
                  {policy.priority} Priority
                </span>
                <span className="text-[11px] font-semibold text-slate-400 font-mono">{policy.coverage}</span>
              </div>

              <h3 className="font-bold text-sm text-white">{policy.name}</h3>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    First Response
                  </span>
                  <span className="font-mono font-bold text-sm text-emerald-400">{policy.firstResponseTime}</span>
                </div>
                <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Full Resolution
                  </span>
                  <span className="font-mono font-bold text-sm text-emerald-400">{policy.resolutionTime}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Escalation: {policy.escalationRole}</span>
              <button
                onClick={() => handleToggle(policy.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  policy.isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-white/[0.06] text-slate-400 border border-white/10'
                }`}
              >
                {policy.isActive ? 'Active' : 'Disabled'}
              </button>
            </div>
          </div>
        ))}
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
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-black tracking-widest text-emerald-300 uppercase">
                    SLA POLICY ENGINE
                  </span>
                  <h2 className="text-base font-bold text-white tracking-tight mt-0.5">Configure SLA Agreement</h2>
                  <p className="text-xs text-slate-400 font-medium">Define automated response & resolution commitments</p>
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
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Policy Title</label>
                <div className="relative">
                  <FileCheck size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. VIP Enterprise Tier 1 Resolution"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Priority Tier</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                  >
                    <option value="CRITICAL">Critical (P1)</option>
                    <option value="HIGH">High (P2)</option>
                    <option value="MEDIUM">Medium (P3)</option>
                    <option value="LOW">Low (P4)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Coverage Window</label>
                  <select
                    value={coverage}
                    onChange={(e: any) => setCoverage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                  >
                    <option value="24x7">24x7 Continuous</option>
                    <option value="Business Hours (9-5)">Business Hours (9-5)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">First Response SLA</label>
                  <div className="relative">
                    <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 15 mins"
                      value={firstResponse}
                      onChange={(e) => setFirstResponse(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Resolution SLA</label>
                  <div className="relative">
                    <Zap size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2 hours"
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Escalation Role</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. Lead Support Engineer"
                    value={escalationRole}
                    onChange={(e) => setEscalationRole(e.target.value)}
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
                  <Sparkles size={13} />
                  <span>Save SLA Policy</span>
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
