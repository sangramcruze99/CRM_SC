'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  DollarSign,
  Users,
  TrendingUp,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Zap,
  Sparkles,
  User,
  Mail,
  Layers,
  Calendar,
  X,
} from 'lucide-react';
import { TieredPackagingModal } from '@/components/billing/TieredPackagingModal';
import { useCreditMetering } from '@/components/platform/CreditMeteringContext';

interface Subscription {
  id: string;
  customer: string;
  email: string;
  plan: 'Enterprise' | 'Pro' | 'Starter';
  amount: number;
  interval: 'monthly' | 'yearly';
  status: 'active' | 'past_due' | 'trialing';
  renewalDate: string;
}

const initialDemoSubscriptions: Subscription[] = [];

export function SubscriptionsClient({ initialSubscriptions }: { initialSubscriptions?: Subscription[] } = {}) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(
    initialSubscriptions && initialSubscriptions.length > 0 ? initialSubscriptions : initialDemoSubscriptions
  );
  const [search, setSearch] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPackagingModalOpen, setIsPackagingModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { setIsTopUpModalOpen } = useCreditMetering();

  // Form states
  const [newCustomer, setNewCustomer] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPlan, setNewPlan] = useState<'Enterprise' | 'Pro' | 'Starter'>('Enterprise');
  const [newInterval, setNewInterval] = useState<'monthly' | 'yearly'>('monthly');

  const filteredSubs = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.customer.toLowerCase().includes(search.toLowerCase()) ||
      sub.email.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = selectedPlan === 'ALL' || sub.plan === selectedPlan;
    return matchesSearch && matchesPlan;
  });

  const mrr = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((acc, curr) => acc + (curr.interval === 'yearly' ? curr.amount / 12 : curr.amount), 0);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newCustomer || !newEmail) return;

    const baseAmount = newPlan === 'Enterprise' ? 1200 : newPlan === 'Pro' ? 450 : 99;
    const finalAmount = newInterval === 'yearly' ? baseAmount * 10 : baseAmount;

    const newSub: Subscription = {
      id: `sub_${Math.floor(100000 + Math.random() * 900000)}`,
      customer: newCustomer,
      email: newEmail,
      plan: newPlan,
      amount: finalAmount,
      interval: newInterval,
      status: 'active',
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    setSubscriptions([newSub, ...subscriptions]);
    setIsModalOpen(false);
    setNewCustomer('');
    setNewEmail('');
  }

  function handleCancel(id: string) {
    setSubscriptions(
      subscriptions.map((s) => (s.id === id ? { ...s, status: 'past_due' } : s))
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-900 dark:text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <DollarSign className="text-emerald-600 dark:text-emerald-400" size={24} />
            SaaS Subscriptions & Product Editions
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage recurring tier subscriptions, usage-based add-ons, and workspace editions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsPackagingModalOpen(true)}
            className="px-3.5 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles size={14} className="text-emerald-400" />
            <span>Compare Product Suites</span>
          </button>

          <button
            type="button"
            onClick={() => setIsTopUpModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Zap size={14} className="text-emerald-400" />
            <span>Usage Metering</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 cursor-pointer"
          >
            <Plus size={16} />
            <span>New Subscription</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Monthly Recurring (MRR)</span>
            <DollarSign size={18} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">${mrr.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-xs text-emerald-400 mt-2 font-bold">
            <TrendingUp size={14} /> +14.2% vs last month
          </div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Subscribers</span>
            <Users size={18} className="text-slate-300" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {subscriptions.filter((s) => s.status === 'active').length}
          </div>
          <div className="text-xs text-slate-400 mt-2 font-medium">Across 4 workspace editions</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Trial Conversion</span>
            <Zap size={18} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">68.4%</div>
          <div className="text-xs text-emerald-400 mt-2 font-bold">+4.1% efficiency</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Net Churn Rate</span>
            <CreditCard size={18} className="text-slate-300" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">1.18%</div>
          <div className="text-xs text-slate-400 mt-2 font-medium">Well below target</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.04] p-3.5 rounded-3xl border border-white/[0.08] backdrop-blur-xl">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by customer or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:bg-white/[0.08] transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={15} className="text-slate-400 hidden sm:block" />
          {['ALL', 'Enterprise', 'Pro', 'Starter'].map((plan) => (
            <button
              key={plan}
              onClick={() => setSelectedPlan(plan)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedPlan === plan
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.1]'
              }`}
            >
              {plan}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/[0.02] text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-white/[0.08]">
            <tr>
              <th className="px-6 py-4">Customer Account</th>
              <th className="px-6 py-4">Tier Plan</th>
              <th className="px-6 py-4">Subscription Fee</th>
              <th className="px-6 py-4">Current Status</th>
              <th className="px-6 py-4">Next Renewal</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {filteredSubs.map((sub) => (
              <tr key={sub.id} className="hover:bg-white/[0.04] transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-white text-sm">{sub.customer}</div>
                  <div className="text-xs text-slate-400 font-medium">{sub.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      sub.plan === 'Enterprise'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : sub.plan === 'Pro'
                        ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                        : 'bg-white/[0.08] text-slate-300 border border-white/10'
                    }`}
                  >
                    {sub.plan}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono font-bold text-white">
                  ${sub.amount.toLocaleString()}
                  <span className="text-slate-500 text-xs font-normal">/{sub.interval}</span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      sub.status === 'active'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : sub.status === 'trialing'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {sub.status === 'active' ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <AlertTriangle size={12} />
                    )}
                    {sub.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-300 text-xs font-medium">{sub.renewalDate}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleCancel(sub.id)}
                    className="px-3.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-white/[0.1] cursor-pointer"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
            {filteredSubs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-xs font-medium">
                  No active subscriptions found. Click <span className="text-emerald-400 font-bold">"New Subscription"</span> above to provision a client plan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Subscription Modal */}
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
                  <CreditCard size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-black tracking-widest text-emerald-300 uppercase">
                      SUBSCRIPTION PROVISIONING
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white tracking-tight mt-0.5">Provision Subscription</h2>
                  <p className="text-xs text-slate-400 font-medium">Activate recurring SaaS license seat and billing schedule</p>
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
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Customer / Account Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Global Tech"
                    value={newCustomer}
                    onChange={(e) => setNewCustomer(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Billing Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. billing@apex.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Plan Tier</label>
                  <div className="relative">
                    <select
                      value={newPlan}
                      onChange={(e: any) => setNewPlan(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#0c1411] border border-white/[0.12] rounded-xl text-xs font-bold text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    >
                      <option value="Enterprise">Enterprise ($1,200/mo)</option>
                      <option value="Pro">Pro ($450/mo)</option>
                      <option value="Starter">Starter ($99/mo)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Cadence</label>
                  <div className="relative">
                    <select
                      value={newInterval}
                      onChange={(e: any) => setNewInterval(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#0c1411] border border-white/[0.12] rounded-xl text-xs font-bold text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly (Save 17%)</option>
                    </select>
                  </div>
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
                  <span>Activate Subscription</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Tiered Packaging Modal */}
      <TieredPackagingModal
        isOpen={isPackagingModalOpen}
        onClose={() => setIsPackagingModalOpen(false)}
      />
    </div>
  );
}
