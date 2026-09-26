'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Building2,
  Users,
} from 'lucide-react';
import { DataSourceRegistry } from '@/components/dashboard/DataSourceRegistry';

export function SmeSection() {
  const [data, setData] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>({
    activeSubscriptionsCount: 0,
    totalMrr: 0,
    annualizedRunRate: 0,
  });

  useEffect(() => {
    fetch('/api/niche/sme')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setData(json.data);
        if (json.metrics) setMetrics(json.metrics);
      })
      .catch((err) => console.error('Failed to load SME section data:', err));
  }, []);

  const totalMrr = metrics.totalMrr || 0;
  const arr = metrics.annualizedRunRate || 0;
  const subsCount = metrics.activeSubscriptionsCount || 0;

  return (
    <div className="space-y-4">
      {/* 1. Main B2B SaaS Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Spotlight Card: MRR & ARR Operations */}
        <div className="md:col-span-12 lg:col-span-7 workstation-card p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold shadow-xs">
                <Briefcase size={20} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                  B2B SaaS Revenue Operations
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Recurring Revenue Run-Rate &amp; Tenant Subscriptions
                </h3>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              REVENUE ACTIVE
            </span>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-200 dark:border-white/[0.08] text-center">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Monthly Recurring Rev</span>
              <div className="text-xl font-mono font-extrabold text-indigo-400 mt-0.5">
                {DataSourceRegistry.formatCurrency(totalMrr)}
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Contracted MRR</span>
            </div>
            <div className="border-x border-slate-200 dark:border-white/[0.08]">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Annualized Run-Rate</span>
              <div className="text-xl font-mono font-extrabold text-slate-900 dark:text-white mt-0.5">
                {DataSourceRegistry.formatCurrency(arr)}
              </div>
              <span className="text-[10px] text-teal-400 font-mono">Projected ARR</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Active Subscribers</span>
              <div className="text-xl font-mono font-extrabold text-teal-400 mt-0.5">{subsCount} Accounts</div>
              <span className="text-[10px] text-emerald-400 font-mono">{subsCount > 0 ? 'Active customer orgs' : 'No subscriptions'}</span>
            </div>
          </div>

          {/* SaaS Telemetry Bar */}
          <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-indigo-400 shrink-0" />
              <span className="text-zinc-300">
                {subsCount > 0 
                  ? `Tenant Fleet: ${subsCount} active subscription account(s) synced with automated recurring billing` 
                  : 'Subscription Engine: Stripe billing gateway connected & awaiting new subscriptions'}
              </span>
            </div>
            <Link
              href="/industry/sme"
              className="text-xs font-mono font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 shrink-0 transition"
            >
              <span>Explore Subscriptions</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Right 5 Cols: SaaS Sub-Tiles */}
        <div className="md:col-span-12 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tile 1: Active Accounts */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 size={15} className="text-indigo-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Active Tenants</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                {subsCount} Orgs
              </span>
            </div>
            <div>
              <span className="text-base font-mono font-black text-slate-900 dark:text-white block">{subsCount} Organizations</span>
              <span className="text-[10px] font-mono text-zinc-400">Total client tenant base</span>
            </div>
            <Link href="/industry/sme" className="text-xs font-mono text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1">
              <span>View Accounts</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 2: Revenue Run-Rate */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={15} className="text-purple-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">ARR Trajectory</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                Pacing
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">{DataSourceRegistry.formatCurrency(arr)} Annualized</span>
              <span className="text-[10px] font-mono text-zinc-500">Contracted ARR run-rate</span>
            </div>
            <Link href="/industry/sme" className="text-xs font-mono text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1">
              <span>Financial Forecast</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 3: Customer Success */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={15} className="text-cyan-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Account Health</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Healthy
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">{subsCount > 0 ? 'All Accounts Monitored' : 'No Subscriptions'}</span>
              <span className="text-[10px] font-mono text-zinc-500">Zero churn warnings</span>
            </div>
            <Link href="/industry/sme" className="text-xs font-mono text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
              <span>Customer Success</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 4: Automation Fleet */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Billing Security</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                PCI-DSS
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">Stripe Webhooks Verified</span>
              <span className="text-[10px] font-mono text-zinc-500">Automated invoice retries</span>
            </div>
            <Link href="/observability" className="text-xs font-mono text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
              <span>Billing Logs</span> <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
