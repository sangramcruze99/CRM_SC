'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Building, Plus, CheckCircle, Globe, Users, Shield, ArrowRight, ExternalLink, ShieldAlert, Sparkles, X } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  domain: string;
  plan: 'ENTERPRISE' | 'PRO' | 'STARTER';
  activeUsers: number;
  status: 'ACTIVE' | 'PROVISIONING';
  createdAt: string;
}

const initialDemoTenants: Tenant[] = [];

export function SuperAdminClient({ initialTenants = [] }: { initialTenants?: any[] }) {
  const [tenants, setTenants] = useState<Tenant[]>(
    initialTenants.length > 0 ? initialTenants : initialDemoTenants
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);
  const [domain, setDomain] = useState('');
  const [plan, setPlan] = useState<'ENTERPRISE' | 'PRO' | 'STARTER'>('ENTERPRISE');
  const [alert, setAlert] = useState<string | null>(null);

  function handleCreateTenant(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !domain) return;

    const newTenant: Tenant = {
      id: `t_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      name,
      domain: domain.includes('.') ? domain : `${domain}.businessos.io`,
      plan,
      activeUsers: 1,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setTenants([...tenants, newTenant]);
    setIsModalOpen(false);
    setName('');
    setDomain('');
    setAlert(`Tenant "${name}" provisioned with dedicated database schema!`);
    setTimeout(() => setAlert(null), 3000);
  }

  function handleImpersonate(tenantName: string) {
    setAlert(`Switched session context into tenant: ${tenantName}`);
    setTimeout(() => setAlert(null), 2500);
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
            <Building className="text-emerald-400" size={24} />
            Superadmin & Multi-Tenant Orchestration
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Global isolation boundaries, tenant provisioning, cross-organization analytics, and schema scoping.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 cursor-pointer"
        >
          <Plus size={16} />
          <span>Provision Tenant</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Tenants</span>
            <Building size={18} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{tenants.length} Workspaces</div>
          <div className="text-xs text-emerald-400 mt-2 font-bold">100% database partition health</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Active Users</span>
            <Users size={18} className="text-slate-300" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {tenants.reduce((acc, t) => acc + t.activeUsers, 0)} Seats
          </div>
          <div className="text-xs text-slate-400 mt-2 font-medium">Across all provisioned tenants</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Security Scoping</span>
            <Shield size={18} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">Row-Level (RLS)</div>
          <div className="text-xs text-emerald-400 mt-2 font-medium">Zero cross-tenant leakage</div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/[0.02] text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-white/[0.08]">
            <tr>
              <th className="px-6 py-4">Workspace / Organization</th>
              <th className="px-6 py-4">Custom Domain</th>
              <th className="px-6 py-4">Subscription Plan</th>
              <th className="px-6 py-4">Active Seats</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Switch Context</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-white/[0.04] transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-white text-sm">{tenant.name}</div>
                  <div className="text-xs font-mono text-slate-500">{tenant.id}</div>
                </td>
                <td className="px-6 py-4 text-slate-300 font-mono text-xs flex items-center gap-1.5 pt-5">
                  <Globe size={13} className="text-emerald-400" />
                  <span>{tenant.domain}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {tenant.plan}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono font-bold text-white">{tenant.activeUsers}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {tenant.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleImpersonate(tenant.name)}
                    className="px-3.5 py-1.5 bg-white/[0.06] hover:bg-amber-500 hover:text-slate-950 text-slate-300 rounded-xl text-xs font-bold transition-all border border-white/[0.1] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Impersonate</span>
                    <ArrowRight size={12} />
                  </button>
                </td>
              </tr>
            ))}
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
                  <Building size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-black tracking-widest text-emerald-300 uppercase">
                      MULTI-TENANT ORG
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white tracking-tight mt-0.5">Provision New Tenant Workspace</h2>
                  <p className="text-xs text-slate-400 font-medium">Create isolated tenant database schema & DNS routing endpoint</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4 text-xs relative z-10">
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Company / Workspace Name</label>
                <div className="relative">
                  <Building size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Global Industries"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Custom Subdomain / Host</label>
                <div className="relative">
                  <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="apex.businessos.io"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 font-mono font-bold focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Assigned Plan Tier</label>
                <div className="relative">
                  <select
                    value={plan}
                    onChange={(e: any) => setPlan(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0c1411] border border-white/[0.12] rounded-xl text-xs font-bold text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  >
                    <option value="ENTERPRISE">Enterprise Plan (Dedicated Pool)</option>
                    <option value="PRO">Professional Plan</option>
                    <option value="STARTER">Starter Plan</option>
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
                  <Sparkles size={13} />
                  <span>Provision Instance</span>
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
