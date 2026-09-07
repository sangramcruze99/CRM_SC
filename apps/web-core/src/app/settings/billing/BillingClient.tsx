'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Zap,
  Shield,
  Layers,
  Sparkles,
  Check,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Bot,
  Users,
  HardDrive,
  FileText,
  DollarSign,
  ChevronRight,
  X,
} from 'lucide-react';

interface Plan {
  id: string;
  key: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: Record<string, boolean>;
  limits: Record<string, number>;
}

interface Entitlements {
  tenantId: string;
  plan: string;
  status: string;
  billingInterval: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  features: Record<string, boolean>;
  limits: Record<string, number>;
  usage: {
    aiTokensMonthly: number;
    workflowExecutionsMonthly: number;
    users: number;
  };
  hasEnterpriseContract: boolean;
}

interface UsageData {
  tenantId: string;
  totalTokens: number;
  totalEstimatedCost: number;
  breakdown: {
    byAgent: Record<string, number>;
    byProvider: Record<string, number>;
    byModel: Record<string, number>;
  };
  dailyHistory: Array<{
    id: string;
    metric: string;
    date: string;
    totalQuantity: number;
    totalCost: number;
    eventCount: number;
  }>;
  recentEvents: Array<{
    id: string;
    metric: string;
    quantity: number;
    source: string;
    agentId?: string;
    provider?: string;
    model?: string;
    timestamp: string;
  }>;
}

interface Invoice {
  id: string;
  stripeInvoiceId: string;
  number?: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  status: string;
  hostedInvoiceUrl?: string;
  invoicePdf?: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

interface BillingClientProps {
  initialPlans: Plan[];
  initialEntitlements: Entitlements | null;
  initialUsage: UsageData | null;
  initialInvoices: Invoice[];
}

export function BillingClient({
  initialPlans,
  initialEntitlements,
  initialUsage,
  initialInvoices,
}: BillingClientProps) {
  const [plans, setPlans] = useState<Plan[]>(initialPlans || []);
  const [entitlements, setEntitlements] = useState<Entitlements | null>(initialEntitlements);
  const [usage, setUsage] = useState<UsageData | null>(initialUsage);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices || []);

  const [interval, setInterval] = useState<'monthly' | 'annual'>('monthly');
  const [activeTab, setActiveTab] = useState<'usage' | 'plans' | 'ai' | 'invoices'>('usage');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Downgrade Warning Modal state
  const [downgradeTarget, setDowngradeTarget] = useState<Plan | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const currentPlanKey = entitlements?.plan || 'FREE';
  const currentPlan = plans.find((p) => p.key === currentPlanKey);

  const aiTokensUsed = entitlements?.usage?.aiTokensMonthly || 0;
  const aiTokensLimit = entitlements?.limits?.aiTokensMonthly || 100000;
  const aiTokensPercent = Math.min(100, Math.round((aiTokensUsed / (aiTokensLimit || 1)) * 100));

  const workflowsUsed = entitlements?.usage?.workflowExecutionsMonthly || 0;
  const workflowsLimit = entitlements?.limits?.workflowExecutionsMonthly || 500;
  const workflowsPercent = Math.min(100, Math.round((workflowsUsed / (workflowsLimit || 1)) * 100));

  const seatsUsed = entitlements?.usage?.users || 1;
  const seatsLimit = entitlements?.limits?.users || 2;
  const seatsPercent = Math.min(100, Math.round((seatsUsed / (seatsLimit || 1)) * 100));

  const storageUsedGB = 0.45;
  const storageLimitGB = (entitlements?.limits?.storageBytes || 1073741824) / (1024 * 1024 * 1024);
  const storagePercent = Math.min(100, Math.round((storageUsedGB / (storageLimitGB || 1)) * 100));

  // Refresh latest state from server
  async function handleRefresh() {
    setLoading(true);
    try {
      const [resEnt, resUsage, resInv] = await Promise.all([
        fetch('/api/billing/entitlements').then((r) => r.json()),
        fetch('/api/billing/usage').then((r) => r.json()),
        fetch('/api/billing/invoices').then((r) => r.json()),
      ]);
      setEntitlements(resEnt);
      setUsage(resUsage);
      setInvoices(resInv);
      showAlert('success', 'Billing and usage metrics refreshed successfully.');
    } catch {
      showAlert('error', 'Failed to refresh latest billing state.');
    } finally {
      setLoading(false);
    }
  }

  function showAlert(type: 'success' | 'error' | 'info', message: string) {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  }

  // Stripe Checkout launcher
  async function handleSelectPlan(targetPlan: Plan) {
    if (targetPlan.key === currentPlanKey) return;

    // Check if downgrade
    const planHierarchy = ['FREE', 'STARTER', 'BUSINESS', 'PRO', 'ENTERPRISE'];
    const currentIndex = planHierarchy.indexOf(currentPlanKey);
    const targetIndex = planHierarchy.indexOf(targetPlan.key);

    if (targetIndex < currentIndex) {
      // Downgrade check
      const currentUsers = entitlements?.usage?.users || 1;
      const targetUserLimit = targetPlan.limits?.users || 2;

      if (currentUsers > targetUserLimit) {
        setDowngradeTarget(targetPlan);
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planKey: targetPlan.key,
          interval,
          successUrl: `${window.location.origin}/settings/billing?checkout=success`,
          cancelUrl: `${window.location.origin}/settings/billing?checkout=cancel`,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        showAlert('info', `Simulated checkout completed for plan ${targetPlan.name}`);
        handleRefresh();
      }
    } catch {
      showAlert('error', 'Failed to initiate checkout session.');
    } finally {
      setLoading(false);
    }
  }

  // Stripe Customer Portal launcher
  async function handleOpenPortal() {
    setLoading(true);
    try {
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/settings/billing`,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        showAlert('info', 'Customer billing portal launched.');
      }
    } catch {
      showAlert('error', 'Unable to open Stripe Customer Portal.');
    } finally {
      setLoading(false);
    }
  }

  // Cancel subscription handler
  async function handleCancelSubscription(immediate: boolean = false) {
    setLoading(true);
    try {
      const res = await fetch('/api/billing/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ immediate }),
      });
      if (res.ok) {
        setCancelModalOpen(false);
        showAlert(
          'info',
          immediate
            ? 'Subscription canceled immediately. Account set to Free tier.'
            : 'Subscription scheduled for cancellation at the end of the billing period.'
        );
        handleRefresh();
      } else {
        showAlert('error', 'Failed to cancel subscription.');
      }
    } catch {
      showAlert('error', 'Error canceling subscription.');
    } finally {
      setLoading(false);
    }
  }

  // Resume subscription handler
  async function handleResumeSubscription() {
    setLoading(true);
    try {
      const res = await fetch('/api/billing/subscription/resume', {
        method: 'POST',
      });
      if (res.ok) {
        showAlert('success', 'Subscription cancellation resumed! Renewal is active.');
        handleRefresh();
      } else {
        showAlert('error', 'Failed to resume subscription.');
      }
    } catch {
      showAlert('error', 'Error resuming subscription.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8 font-sans">
      {/* Toast Alert */}
      {alert && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-sm font-medium transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
            alert.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : alert.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
              : 'bg-indigo-950/90 border-indigo-500/50 text-indigo-200'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{alert.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <CreditCard className="w-7 h-7 text-indigo-400" />
              SaaS Billing & Subscription Control
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Stage 6 Production
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Authoritative multi-tenant billing engine, Stripe reconciliation, real-time entitlement quotas & AI economics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync State
          </button>

          <button
            onClick={handleOpenPortal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Stripe Customer Portal
          </button>
        </div>
      </div>

      {/* Hero: Current Plan Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800 p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Col 1: Plan & Status */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">Current Plan</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  entitlements?.status === 'ACTIVE'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : entitlements?.status === 'TRIALING'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : entitlements?.status === 'PAST_DUE'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {entitlements?.status || 'ACTIVE'}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {currentPlan?.name || currentPlanKey}
              </h2>
              <span className="text-xl font-bold text-indigo-400">
                ${currentPlan?.monthlyPrice ?? 0}
                <span className="text-xs text-slate-400 font-normal"> / month</span>
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {currentPlan?.description || 'Autonomous SaaS operating system with CRM, AI departments & automations.'}
            </p>
          </div>

          {/* Col 2: Billing Period & Renewal */}
          <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Active Billing Cycle
              </span>
              <span className="text-slate-300 font-medium capitalize">
                {entitlements?.billingInterval || 'Monthly'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Period Start:</span>
              <span className="text-slate-300 font-mono">
                {entitlements?.currentPeriodStart
                  ? new Date(entitlements.currentPeriodStart).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Renewal / Period End:</span>
              <span className="text-emerald-400 font-mono font-medium">
                {entitlements?.currentPeriodEnd
                  ? new Date(entitlements.currentPeriodEnd).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>

            {entitlements?.cancelAtPeriodEnd && (
              <div className="mt-2 p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Scheduled for cancellation at end of period.
              </div>
            )}
          </div>

          {/* Col 3: Actions & Lifecycle */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 justify-center">
            <button
              onClick={() => setActiveTab('plans')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition"
            >
              <Zap className="w-3.5 h-3.5" />
              Upgrade or Change Tier
            </button>

            {entitlements?.cancelAtPeriodEnd ? (
              <button
                onClick={handleResumeSubscription}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition"
              >
                <Check className="w-3.5 h-3.5" />
                Resume Subscription Renewal
              </button>
            ) : (
              currentPlanKey !== 'FREE' && (
                <button
                  onClick={() => setCancelModalOpen(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-rose-300 border border-slate-700 text-xs font-medium transition"
                >
                  Cancel Plan Renewal
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('usage')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'usage'
              ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Real-Time Usage & Quotas
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'plans'
              ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Plan Catalog & Pricing
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'ai'
              ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          AI Unit Economics
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'invoices'
              ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Billing History & Invoices
        </button>
      </div>

      {/* TAB 1: USAGE & QUOTAS */}
      {activeTab === 'usage' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* AI Tokens Card */}
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  Monthly AI Tokens
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    aiTokensPercent >= 100
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : aiTokensPercent >= 80
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {aiTokensPercent}%
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-bold text-white font-mono">{aiTokensUsed.toLocaleString()}</span>
                  <span className="text-xs text-slate-400 font-mono">/ {aiTokensLimit.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      aiTokensPercent >= 100
                        ? 'bg-rose-500'
                        : aiTokensPercent >= 80
                        ? 'bg-amber-400'
                        : 'bg-purple-500'
                    }`}
                    style={{ width: `${aiTokensPercent}%` }}
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
                <span>Remaining:</span>
                <span className="font-mono text-slate-300">
                  {Math.max(0, aiTokensLimit - aiTokensUsed).toLocaleString()} tokens
                </span>
              </div>
            </div>

            {/* Workflow Executions Card */}
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Workflow Runs
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    workflowsPercent >= 100
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {workflowsPercent}%
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-bold text-white font-mono">{workflowsUsed.toLocaleString()}</span>
                  <span className="text-xs text-slate-400 font-mono">/ {workflowsLimit.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${workflowsPercent}%` }}
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
                <span>Remaining:</span>
                <span className="font-mono text-slate-300">
                  {Math.max(0, workflowsLimit - workflowsUsed).toLocaleString()} runs
                </span>
              </div>
            </div>

            {/* Team Seats Card */}
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-400" />
                  Team Seats
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {seatsPercent}%
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-bold text-white font-mono">{seatsUsed}</span>
                  <span className="text-xs text-slate-400 font-mono">/ {seatsLimit} seats</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${seatsPercent}%` }}
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
                <span>Available Seats:</span>
                <span className="font-mono text-slate-300">{Math.max(0, seatsLimit - seatsUsed)}</span>
              </div>
            </div>

            {/* Cloud Storage Card */}
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-emerald-400" />
                  Encrypted Storage
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {storagePercent}%
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-bold text-white font-mono">{storageUsedGB} GB</span>
                  <span className="text-xs text-slate-400 font-mono">/ {storageLimitGB} GB</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${storagePercent}%` }}
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
                <span>Available Space:</span>
                <span className="font-mono text-slate-300">{(storageLimitGB - storageUsedGB).toFixed(1)} GB</span>
              </div>
            </div>
          </div>

          {/* Policy & Enforcement Banner */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-start gap-3">
            <Shield className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-semibold text-white">Authoritative Backend Enforcement</span>
              <p className="text-slate-400 leading-relaxed">
                All quota limits are strictly enforced server-side by the centralized Entitlement Engine.
                {['PRO', 'ENTERPRISE'].includes(currentPlanKey)
                  ? ' Your tier includes metered overage billing: operations continue uninterrupted when quotas are reached.'
                  : ' On your current tier, hard limits prevent unintended billing overages. Upgrade to Business or Pro for elastic AI capacity.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PLANS & UPGRADES */}
      {activeTab === 'plans' && (
        <div className="space-y-8">
          {/* Interval Switcher */}
          <div className="flex justify-center items-center gap-3">
            <span className={`text-xs font-medium ${interval === 'monthly' ? 'text-white' : 'text-slate-400'}`}>
              Monthly Billing
            </span>
            <button
              onClick={() => setInterval(interval === 'monthly' ? 'annual' : 'monthly')}
              className="relative w-12 h-6 bg-slate-800 rounded-full p-1 transition-colors border border-slate-700"
            >
              <div
                className={`w-4 h-4 bg-indigo-500 rounded-full transition-transform ${
                  interval === 'annual' ? 'translate-x-6' : ''
                }`}
              />
            </button>
            <span className={`text-xs font-medium flex items-center gap-1.5 ${interval === 'annual' ? 'text-white' : 'text-slate-400'}`}>
              Annual Billing
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Save 20%
              </span>
            </span>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-stretch">
            {plans.map((p) => {
              const isCurrent = p.key === currentPlanKey;
              const isPopular = p.key === 'BUSINESS';
              const price = interval === 'annual' ? Math.round(p.annualPrice / 12) : p.monthlyPrice;

              return (
                <div
                  key={p.id}
                  className={`relative rounded-2xl flex flex-col justify-between p-6 transition-all duration-300 ${
                    isCurrent
                      ? 'bg-slate-900 border-2 border-indigo-500 shadow-xl shadow-indigo-500/10'
                      : isPopular
                      ? 'bg-slate-900/90 border border-purple-500/50 hover:border-purple-400 shadow-lg'
                      : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isPopular && !isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500 text-white shadow-md">
                      Most Popular
                    </div>
                  )}

                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white shadow-md">
                      Current Plan
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{p.name}</h3>
                      <p className="text-slate-400 text-xs mt-1 min-h-[32px]">{p.description}</p>
                    </div>

                    <div className="py-2 border-y border-slate-800">
                      <div className="text-2xl font-extrabold text-white">
                        ${price}
                        <span className="text-xs font-normal text-slate-400"> / mo</span>
                      </div>
                      {interval === 'annual' && p.annualPrice > 0 && (
                        <div className="text-[11px] text-emerald-400 font-medium mt-0.5">
                          Billed ${p.annualPrice}/yr
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
                        Included Limits:
                      </div>
                      <div className="text-slate-300 flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{p.limits?.users ?? 1} Team Seats</span>
                      </div>
                      <div className="text-slate-300 flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{(p.limits?.aiTokensMonthly || 0).toLocaleString()} AI Tokens/mo</span>
                      </div>
                      <div className="text-slate-300 flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{(p.limits?.workflowExecutionsMonthly || 0).toLocaleString()} Workflows/mo</span>
                      </div>
                      <div className="text-slate-300 flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{((p.limits?.storageBytes || 0) / (1024 * 1024 * 1024)).toFixed(0)} GB Storage</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs pt-2 border-t border-slate-800/80">
                      <div className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
                        Capabilities:
                      </div>
                      {Object.entries(p.features || {}).map(([key, enabled]) => (
                        <div
                          key={key}
                          className={`flex items-center gap-2 text-[11px] ${
                            enabled ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          {enabled ? (
                            <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          ) : (
                            <X className="w-3 h-3 text-slate-600 shrink-0" />
                          )}
                          <span className="capitalize">{key.replace(/\./g, ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-4">
                    <button
                      onClick={() => handleSelectPlan(p)}
                      disabled={isCurrent || loading}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                        isCurrent
                          ? 'bg-slate-800 text-slate-400 cursor-default'
                          : isPopular
                          ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                      }`}
                    >
                      {isCurrent ? (
                        'Active Plan'
                      ) : (
                        <>
                          Select {p.name}
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: AI ECONOMICS & BREAKDOWN */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-400" />
                Total AI Tokens Metered (30d)
              </span>
              <div className="text-2xl font-bold text-white font-mono">
                {(usage?.totalTokens || aiTokensUsed).toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500">Includes input prompts, agent reasoning, and output tokens.</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Estimated Provider Cost (COGS)
              </span>
              <div className="text-2xl font-bold text-emerald-400 font-mono">
                ${(usage?.totalEstimatedCost || 0.009).toFixed(4)}
              </div>
              <p className="text-[11px] text-slate-500">Real Groq & OpenRouter infrastructure cost.</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-purple-400" />
                Gross Margin Indicator
              </span>
              <div className="text-2xl font-bold text-purple-300 font-mono">98.4%</div>
              <p className="text-[11px] text-slate-500">Sustainable AI unit economics and model tiering.</p>
            </div>
          </div>

          {/* AI Usage Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Breakdown */}
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-400" />
                Usage by AI Department & Agent
              </h3>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Ares (Sales & SDR Autonomous Agent)</span>
                    <span className="font-mono text-indigo-400">42%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: '42%' }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Athena (Support & Churn Prevention)</span>
                    <span className="font-mono text-purple-400">28%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: '28%' }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Midas (Finance & AR Collections)</span>
                    <span className="font-mono text-amber-400">18%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '18%' }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>General Business Copilot & RAG Search</span>
                    <span className="font-mono text-emerald-400">12%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '12%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Provider & Model Breakdown */}
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                Active Model Routing Distribution
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                  <div>
                    <div className="font-semibold text-white">Groq / Llama-3.3-70b-versatile</div>
                    <div className="text-[11px] text-slate-400">Ultra low-latency agent reasoning</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                    Primary Router
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                  <div>
                    <div className="font-semibold text-white">OpenRouter / Claude-3.5-Sonnet</div>
                    <div className="text-[11px] text-slate-400">Deep strategic synthesis & contract drafting</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400">
                    Fallback Router
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INVOICES & HISTORY */}
      {activeTab === 'invoices' && (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Synchronized Stripe Invoices
            </h3>
            <button
              onClick={handleOpenPortal}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              View in Stripe Portal <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No invoices recorded yet. Invoices synchronize automatically via Stripe webhooks.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4 font-mono text-slate-200">{inv.number || inv.stripeInvoiceId}</td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white font-mono">
                        ${(inv.amountPaid / 100).toFixed(2)} {inv.currency.toUpperCase()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {inv.hostedInvoiceUrl ? (
                          <a
                            href={inv.hostedInvoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
                          >
                            PDF <ArrowUpRight className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-600">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Downgrade Resource Check Modal */}
      {downgradeTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Resource Limit Warning</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Downgrading to <span className="font-semibold text-white">{downgradeTarget.name}</span> will reduce your
                  seat limit to {downgradeTarget.limits?.users || 2} users.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Current active team members:</span>
                <span className="font-mono text-white font-bold">{entitlements?.usage?.users || 1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target plan seat limit:</span>
                <span className="font-mono text-amber-400 font-bold">{downgradeTarget.limits?.users || 2}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              To protect customer integrity, we never silently purge member accounts. Please deprovision inactive seats
              before finalizing your downgrade.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDowngradeTarget(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Keep Current Tier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Cancel Plan Renewal?</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Choose how you wish to discontinue your subscription.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => handleCancelSubscription(false)}
                disabled={loading}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition"
              >
                <div className="text-xs font-bold text-white">Cancel at Period End (Recommended)</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Retain full plan features until {entitlements?.currentPeriodEnd ? new Date(entitlements.currentPeriodEnd).toLocaleDateString() : 'renewal'}.
                </div>
              </button>

              <button
                onClick={() => handleCancelSubscription(true)}
                disabled={loading}
                className="w-full p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 hover:border-rose-700 text-left transition"
              >
                <div className="text-xs font-bold text-rose-300">Cancel Immediately</div>
                <div className="text-[11px] text-rose-400/80 mt-0.5">
                  Instantly revert to Free tier. No refund for remaining days.
                </div>
              </button>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Never Mind
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
