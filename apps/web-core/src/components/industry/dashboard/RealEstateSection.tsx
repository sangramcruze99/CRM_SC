'use client';

import React from 'react';
import Link from 'next/link';
import {
  Home,
  DollarSign,
  Key,
  FileSignature,
  Building2,
  TrendingUp,
  Calculator,
  Calendar,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export function RealEstateSection() {
  return (
    <div className="space-y-4">
      {/* 1. Main Real Estate Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Spotlight Card: MLS Property Portfolio & Escrow Pipeline */}
        <div className="md:col-span-12 lg:col-span-7 workstation-card p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold shadow-xs">
                <Home size={20} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                  Property Portfolio Management
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Active MLS Listings &amp; Escrow Closing Pipeline
                </h3>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              PORTFOLIO ACTIVE
            </span>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-200 dark:border-white/[0.08] text-center">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Active Listings</span>
              <div className="text-xl font-mono font-extrabold text-emerald-400 mt-0.5">$48.6M</div>
              <span className="text-[10px] text-zinc-500 font-mono">34 Commercial &amp; Residential</span>
            </div>
            <div className="border-x border-slate-200 dark:border-white/[0.08]">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Escrow Pipeline</span>
              <div className="text-xl font-mono font-extrabold text-slate-900 dark:text-white mt-0.5">$6.2M</div>
              <span className="text-[10px] text-teal-400 font-mono">8 Closings in Title Audit</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Avg Days on Market</span>
              <div className="text-xl font-mono font-extrabold text-teal-400 mt-0.5">21 Days</div>
              <span className="text-[10px] text-emerald-400 font-mono">-14% vs Market Average</span>
            </div>
          </div>

          {/* Escrow Progress Bar */}
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-emerald-400 shrink-0" />
              <span className="text-zinc-300">Escrow Security: 100% of earnest deposits verified in segregated trust accounts</span>
            </div>
            <Link
              href="/industry/realestate"
              className="text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 shrink-0 transition"
            >
              <span>Explore Listings</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Right 5 Cols: Property Sub-Tiles */}
        <div className="md:col-span-12 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Tile 1: Tenant Leases & Occupancy */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key size={15} className="text-teal-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tenant Occupancy</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                96.4%
              </span>
            </div>
            <div>
              <span className="text-base font-mono font-black text-slate-900 dark:text-white block">142 Units Leased</span>
              <span className="text-[10px] font-mono text-zinc-400">4 Leases Expiring in 30 Days</span>
            </div>
            <Link href="/industry/realestate" className="text-xs font-mono text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1">
              <span>Manage Leases</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 2: Mortgage Calculator */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator size={15} className="text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Amortization Tool</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Live CPQ
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">Instant Loan Scenarios</span>
              <span className="text-[10px] font-mono text-zinc-500">P&amp;I, Escrow &amp; Tax Estimates</span>
            </div>
            <Link href="/industry/realestate" className="text-xs font-mono text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
              <span>Calculate Loan</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 3: Commission & Earnest Ledger */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign size={15} className="text-amber-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Broker Split</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Automated
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">$184,200 Commission YTD</span>
              <span className="text-[10px] font-mono text-zinc-500">Auto-split to Listing &amp; Buyer Agents</span>
            </div>
            <Link href="/banking" className="text-xs font-mono text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1">
              <span>Payout Ledger</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 4: Digital E-Signatures */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSignature size={15} className="text-cyan-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Digital Signatures</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Legal Vault
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">Purchase &amp; Sale Agreements</span>
              <span className="text-[10px] font-mono text-zinc-500">2 Pending Client E-Signatures</span>
            </div>
            <Link href="/e-signatures" className="text-xs font-mono text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
              <span>Open Signatures</span> <ArrowRight size={11} />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
