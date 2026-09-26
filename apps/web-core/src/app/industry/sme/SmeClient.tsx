// apps/web-core/src/app/industry/sme/SmeClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Building2,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Users,
  Search,
  Plus,
  CheckCircle2,
  X,
} from 'lucide-react';
import { UniversalDashboard } from '@/components/dashboard/UniversalDashboard';
import { getDashboardConfig } from '@/components/dashboard/dashboardConfig';
import { DashboardAttentionItem } from '@/components/dashboard/dashboard.types';
import { useIndustry } from '@/components/industry/IndustryContext';

interface SubscriptionRecord {
  id: string;
  account: string;
  plan: 'Growth Cloud' | 'Scale Enterprise' | 'Dedicated Cluster';
  mrr: number;
  seats: number;
  healthScore: number;
  status: 'ACTIVE' | 'TRIAL' | 'PAST_DUE';
  renewalDate: string;
  csmOwner: string;
}

export function SmeClient() {
  const { activeServiceIds } = useIndustry();
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [role, setRole] = useState('admin');
  const [mode, setMode] = useState<'OPERATIONS' | 'ANALYTICS'>('OPERATIONS');
  const [toast, setToast] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // New Subscription Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAccount, setNewAccount] = useState('');
  const [newPlan, setNewPlan] = useState<'Growth Cloud' | 'Scale Enterprise' | 'Dedicated Cluster'>('Scale Enterprise');
  const [newMrr, setNewMrr] = useState('6500');
  const [newSeats, setNewSeats] = useState('50');

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch('/api/niche/sme');
      if (res.ok) {
        const json = await res.json();
        if (json.data?.subscriptions && Array.isArray(json.data.subscriptions)) {
          setSubscriptions(
            json.data.subscriptions.map((s: any) => ({
              id: s.id,
              account: s.account || s.customerName || 'Enterprise Account',
              plan: s.plan || 'Scale Enterprise',
              mrr: Number(s.mrr || 0),
              seats: Number(s.seats || 0),
              healthScore: Number(s.healthScore || 100),
              status: s.status || 'ACTIVE',
              renewalDate: s.renewalDate || 'Upcoming',
              csmOwner: s.csmOwner || 'Account Rep',
            }))
          );
        }
        if (json.auditLogs) {
          setAuditLogs(json.auditLogs);
        }
      }
    } catch (err) {
      console.error('Failed to load SME subscriptions:', err);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchSubscriptions();
  }, []);

  const handleAddSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount) return;

    const newSub: SubscriptionRecord = {
      id: `sub_${Date.now()}`,
      account: newAccount,
      plan: newPlan,
      mrr: parseInt(newMrr) || 0,
      seats: parseInt(newSeats) || 0,
      healthScore: 100,
      status: 'ACTIVE',
      renewalDate: '2027-01-15',
      csmOwner: 'Customer Success',
    };

    setSubscriptions([newSub, ...subscriptions]);
    setIsAddModalOpen(false);
    setNewAccount('');
    setToast(`Added new subscription for ${newSub.account} ($${newSub.mrr.toLocaleString()}/mo MRR).`);
    setTimeout(() => setToast(null), 4000);
  };

  const dashboardConfig = getDashboardConfig(
    'sme',
    role,
    mode,
    {
      data: { subscriptions },
      metrics: {
        activeSubscriptionsCount: subscriptions.length,
        totalMrr: subscriptions.reduce((acc, s) => acc + s.mrr, 0),
        annualizedRunRate: subscriptions.reduce((acc, s) => acc + s.mrr, 0) * 12,
      },
      auditLogs,
    },
    {
      onGeneralAction: (actionName: string) => {
        if (actionName === 'CREATE_SUBSCRIPTION' || actionName === 'ADD_CUSTOMER') {
          setIsAddModalOpen(true);
        }
      },
    },
    activeServiceIds
  );

  return (
    <>
      <UniversalDashboard
        config={dashboardConfig}
        onRoleChange={setRole}
        onModeChange={setMode}
        onAttentionAction={(item: DashboardAttentionItem) => {
          setToast(`Attention item action: "${item.title}". Resolving billing telemetry.`);
          setTimeout(() => setToast(null), 4000);
        }}
        headerSlot={
          toast ? (
            <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>{toast}</span>
            </div>
          ) : null
        }
        customModals={
          mounted && isAddModalOpen && createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
              <div className="relative w-full max-w-md bg-slate-950 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4 text-white">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h2 className="text-base font-bold text-white">Provision New SaaS Subscription</h2>
                  <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleAddSubscription} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Company / Account Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex AI Systems"
                      value={newAccount}
                      onChange={(e) => setNewAccount(e.target.value)}
                      className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Plan Tier</label>
                      <select
                        value={newPlan}
                        onChange={(e: any) => setNewPlan(e.target.value)}
                        className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
                      >
                        <option value="Growth Cloud">Growth Cloud</option>
                        <option value="Scale Enterprise">Scale Enterprise</option>
                        <option value="Dedicated Cluster">Dedicated Cluster</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Monthly MRR ($)</label>
                      <input
                        type="number"
                        required
                        value={newMrr}
                        onChange={(e) => setNewMrr(e.target.value)}
                        className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Seat License Allocation</label>
                    <input
                      type="number"
                      required
                      value={newSeats}
                      onChange={(e) => setNewSeats(e.target.value)}
                      className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
                    />
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Provision Subscription Contract
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
          )
        }
      />
    </>
  );
}
