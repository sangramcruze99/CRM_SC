'use client';

import React from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Clock,
  DollarSign,
  CheckCircle2,
  TrendingUp,
  Users,
  FileText,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

export function SmeSection() {
  return (
    <div className="space-y-4">
      {/* 1. Main SME Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Spotlight Card: Retainer Utilization & Billable Hours */}
        <div className="md:col-span-12 lg:col-span-7 workstation-card p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold shadow-xs">
                <Briefcase size={20} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                  Professional Services &amp; Consulting
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Client Retainers &amp; Billable Realization
                </h3>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              92.4% REALIZATION
            </span>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-200 dark:border-white/[0.08] text-center">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Monthly Retainers</span>
              <div className="text-xl font-mono font-extrabold text-emerald-400 mt-0.5">$84,500/mo</div>
              <span className="text-[10px] text-zinc-500 font-mono">18 Active Client Retainers</span>
            </div>
            <div className="border-x border-slate-200 dark:border-white/[0.08]">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Billable Hours</span>
              <div className="text-xl font-mono font-extrabold text-slate-900 dark:text-white mt-0.5">342 hrs</div>
              <span className="text-[10px] text-teal-400 font-mono">78% Retainer Burn Rate</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Unbilled WIP</span>
              <div className="text-xl font-mono font-extrabold text-amber-400 mt-0.5">$18,400.00</div>
              <span className="text-[10px] text-zinc-500 font-mono">Ready for End-of-Month Bill</span>
            </div>
          </div>

          {/* Retainer Health Bar */}
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-emerald-400 shrink-0" />
              <span className="text-zinc-300">Contract Integrity: 0 retainer hour overruns · Scope compliance auto-verified</span>
            </div>
            <Link
              href="/invoices"
              className="text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 shrink-0 transition"
            >
              <span>Generate Invoices</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Right 5 Cols: SME Sub-Tiles */}
        <div className="md:col-span-12 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Tile 1: Dual Khata Invoicing */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-teal-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Commercial Billing</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                Net 30
              </span>
            </div>
            <div>
              <span className="text-base font-mono font-black text-slate-900 dark:text-white block">$42,900 Collected</span>
              <span className="text-[10px] font-mono text-zinc-400">14 Invoices Settled this Cycle</span>
            </div>
            <Link href="/invoices" className="text-xs font-mono text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1">
              <span>View Invoices</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 2: Project Milestones */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Milestones</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                12 Active
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">Deliverables on Schedule</span>
              <span className="text-[10px] font-mono text-zinc-500">2 Client Sign-Offs Pending</span>
            </div>
            <Link href="/projects" className="text-xs font-mono text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
              <span>Sprint Board</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 3: Client Accounts 360 */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={15} className="text-cyan-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Client Portfolio</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Key Accounts
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">28 Corporate Clients</span>
              <span className="text-[10px] font-mono text-zinc-500">Unified Communications &amp; SLAs</span>
            </div>
            <Link href="/contacts" className="text-xs font-mono text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
              <span>Client Directory</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 4: Instant Settlement Links */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign size={15} className="text-amber-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Instant Payment</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Stripe Direct
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">Payment Link Portal</span>
              <span className="text-[10px] font-mono text-zinc-500">Fast Wire &amp; Credit Card Capture</span>
            </div>
            <Link href="/payment-links" className="text-xs font-mono text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1">
              <span>Create Link</span> <ArrowRight size={11} />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
