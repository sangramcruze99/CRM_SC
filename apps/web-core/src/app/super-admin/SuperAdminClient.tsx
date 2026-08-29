'use client';

import { useState } from 'react';
import { Building, Plus, CheckCircle, Globe, Users, Shield, ArrowRight, ExternalLink, ShieldAlert } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  domain: string;
  plan: 'ENTERPRISE' | 'PRO' | 'STARTER';
  activeUsers: number;
  status: 'ACTIVE' | 'PROVISIONING';
  createdAt: string;
}

const initialDemoTenants: Tenant[] = [
  {
    id: 'default-tenant',
    name: 'Default Workspace',
    domain: 'app.businessos.io',
    plan: 'ENTERPRISE',
    activeUsers: 14,
    status: 'ACTIVE',
    createdAt: '2026-08-01',
  },
  {
    id: 't_acme_corp',
    name: 'Acme Corporation',
    domain: 'acme.businessos.io',
    plan: 'ENTERPRISE',
    activeUsers: 48,
    status: 'ACTIVE',
    createdAt: '2026-08-10',
  },
  {
    id: 't_starlight',
    name: 'Starlight Media LLC',
    domain: 'starlight.businessos.io',
    plan: 'PRO',
    activeUsers: 18,
    status: 'ACTIVE',
    createdAt: '2026-08-15',
  },
  {
    id: 't_hyperscale',
    name: 'HyperScale AI',
    domain: 'hyperscale.businessos.io',
    plan: 'ENTERPRISE',
    activeUsers: 82,
    status: 'ACTIVE',
    createdAt: '2026-08-20',
  },
];

export function SuperAdminClient({ initialTenants = [] }: { initialTenants?: any[] }) {
  const [tenants, setTenants] = useState<Tenant[]>(
    initialTenants.length > 0 ? initialTenants : initialDemoTenants
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
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
        <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-amber-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle size={16} className="text-amber-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Building className="text-amber-400" size={24} />
            Superadmin & Multi-Tenant Orchestration
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Global isolation boundaries, tenant provisioning, cross-organization analytics, and schema scoping.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-orange-500/25 active:scale-[0.98] border border-amber-400/40 cursor-pointer"
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
            <Building size={18} className="text-amber-400" />
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
                  <Globe size={13} className="text-amber-400" />
                  <span>{tenant.domain}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
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
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="bg-slate-950/95 border border-white/[0.12] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 text-white">
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
              <h2 className="text-base font-bold text-white">Provision New Tenant Workspace</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Workspace Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Global Industries"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Custom Subdomain / Host</label>
                <input
                  type="text"
                  required
                  placeholder="apex.businessos.io"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Plan Tier</label>
                <select
                  value={plan}
                  onChange={(e: any) => setPlan(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="ENTERPRISE">Enterprise Plan (Dedicated Pool)</option>
                  <option value="PRO">Professional Plan</option>
                  <option value="STARTER">Starter Plan</option>
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
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-orange-500/25 cursor-pointer"
                >
                  Provision Instance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
