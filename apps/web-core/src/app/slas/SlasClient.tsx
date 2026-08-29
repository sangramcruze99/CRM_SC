'use client';

import { useState } from 'react';
import {
  FileCheck,
  Plus,
  Clock,
  ShieldCheck,
  Flame,
  CheckCircle,
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

const initialPolicies: SLAPolicy[] = [
  {
    id: 'sla_001',
    name: 'Mission Critical Outage (P1)',
    priority: 'CRITICAL',
    firstResponseTime: '15 mins',
    resolutionTime: '2 hours',
    coverage: '24x7',
    escalationRole: 'VP of Engineering / Lead On-Call',
    isActive: true,
  },
  {
    id: 'sla_002',
    name: 'Major Feature Impairment (P2)',
    priority: 'HIGH',
    firstResponseTime: '45 mins',
    resolutionTime: '8 hours',
    coverage: '24x7',
    escalationRole: 'Tier 3 Support Lead',
    isActive: true,
  },
  {
    id: 'sla_003',
    name: 'Standard Operational Inquiry (P3)',
    priority: 'MEDIUM',
    firstResponseTime: '4 hours',
    resolutionTime: '24 hours',
    coverage: 'Business Hours (9-5)',
    escalationRole: 'Customer Success Manager',
    isActive: true,
  },
  {
    id: 'sla_004',
    name: 'Cosmetic / Minor Enhancement (P4)',
    priority: 'LOW',
    firstResponseTime: '12 hours',
    resolutionTime: '72 hours',
    coverage: 'Business Hours (9-5)',
    escalationRole: 'Triage Specialist',
    isActive: true,
  },
];

export function SlasClient({ initialSlas = [] }: { initialSlas?: any[] }) {
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
        <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-amber-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle size={16} className="text-amber-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FileCheck className="text-amber-400" size={24} />
            Service Level Agreements (SLAs)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure incident response commitments, resolution deadlines, and automated breach escalations.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-orange-500/25 active:scale-[0.98] border border-amber-400/40 cursor-pointer"
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
          <div className="text-3xl font-extrabold text-amber-400 font-mono">8.4 mins</div>
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
            className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] hover:border-amber-500/40 rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4 flex flex-col justify-between transition-all"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    policy.priority === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                      : policy.priority === 'HIGH'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
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
                  <span className="font-mono font-bold text-sm text-amber-400">{policy.firstResponseTime}</span>
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="bg-slate-950/95 border border-white/[0.12] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 text-white">
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
              <h2 className="text-base font-bold text-white">Configure SLA Agreement</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Policy Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Enterprise Tier 1 Resolution"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="CRITICAL">Critical (P1)</option>
                    <option value="HIGH">High (P2)</option>
                    <option value="MEDIUM">Medium (P3)</option>
                    <option value="LOW">Low (P4)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Coverage</label>
                  <select
                    value={coverage}
                    onChange={(e: any) => setCoverage(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="24x7">24x7 Constant</option>
                    <option value="Business Hours (9-5)">Business Hours (9-5)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">First Response Time</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15 mins"
                    value={firstResponse}
                    onChange={(e) => setFirstResponse(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Resolution Time</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2 hours"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
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
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
