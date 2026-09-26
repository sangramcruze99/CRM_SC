'use client';

import React from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  TrendingUp,
  Database,
  Scan,
  Users,
  ShieldCheck,
  DollarSign,
  Workflow,
  Sparkles,
  Bot,
  ExternalLink,
  Layers,
} from 'lucide-react';

export function MasterEnterpriseSection() {
  return (
    <div className="space-y-4">
      {/* 1. Main Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Spotlight Hero Card: Conglomerate Throughput */}
        <div className="md:col-span-12 lg:col-span-7 workstation-card p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold shadow-xs">
                <Activity size={20} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                  Conglomerate Operations
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Cross-Department Revenue &amp; Capital Pipeline
                </h3>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              SYNCHRONIZED
            </span>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-200 dark:border-white/[0.08] text-center">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Active Pipeline</span>
              <div className="text-xl font-mono font-extrabold text-emerald-500 dark:text-emerald-400 mt-0.5">$24.8M</div>
              <span className="text-[10px] text-zinc-500 font-mono">18 Enterprise Closings</span>
            </div>
            <div className="border-x border-slate-200 dark:border-white/[0.08]">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Treasury Audited</span>
              <div className="text-xl font-mono font-extrabold text-slate-900 dark:text-white mt-0.5">$1.42M</div>
              <span className="text-[10px] text-emerald-400 font-mono">0 Fraud Escapes</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Autonomous Yield</span>
              <div className="text-xl font-mono font-extrabold text-teal-400 mt-0.5">$248.5k/mo</div>
              <span className="text-[10px] text-zinc-500 font-mono">1,420 hrs saved</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-mono text-zinc-500">
              Live telemetry aggregated across all 67 modular enterprise microservices
            </span>
            <Link
              href="/automation/agents/tree"
              className="text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
            >
              <span>Inspect Swarm Tree</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Right 5 Cols: Quick Mission Critical Micro-Tiles */}
        <div className="md:col-span-12 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Tile 1: Dual Khata Reconciler */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database size={15} className="text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Dual Khata Ledger</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Balanced
              </span>
            </div>
            <div>
              <span className="text-base font-mono font-black text-slate-900 dark:text-white block">$148,290.00</span>
              <span className="text-[10px] font-mono text-zinc-400">Total Receivables In Flight</span>
            </div>
            <Link href="/banking" className="text-xs font-mono text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
              <span>Reconcile Accounts</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 2: Neural OCR Engine */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scan size={15} className="text-teal-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Neural OCR IDP</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                99.4% Acc
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">Instant Line Extraction</span>
              <span className="text-[10px] font-mono text-zinc-500">Invoices &amp; Legal PDFs</span>
            </div>
            <Link href="/ocr-invoice" className="text-xs font-mono text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1">
              <span>Scan Document</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 3: AI Lead Prospector */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={15} className="text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">B2B Prospector</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                275M+
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">Verified B2B Decision Makers</span>
              <span className="text-[10px] font-mono text-zinc-500">Autonomous Outbound Cadence</span>
            </div>
            <Link href="/lead-prospector" className="text-xs font-mono text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
              <span>Find Prospects</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 4: Automation Mesh */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Workflow size={15} className="text-cyan-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Workflow Mesh</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                20 Active
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">Event-Driven Automation</span>
              <span className="text-[10px] font-mono text-zinc-500">Zero-Code Intent Studio</span>
            </div>
            <Link href="/automation/workflows" className="text-xs font-mono text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
              <span>View Library</span> <ArrowRight size={11} />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
