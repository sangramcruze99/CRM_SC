'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Database,
  Users,
  ShieldCheck,
  Bot,
  Layers,
} from 'lucide-react';

export function MasterEnterpriseSection() {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [recordsCount, setRecordsCount] = useState<number>(0);

  useEffect(() => {
    fetch('/api/niche/all')
      .then((res) => res.json())
      .then((json) => {
        if (json.auditLogs && Array.isArray(json.auditLogs)) {
          setAuditLogs(json.auditLogs);
        }
        if (json.data?.records && Array.isArray(json.data.records)) {
          setRecordsCount(json.data.records.length);
        }
      })
      .catch((err) => console.error('Failed to load enterprise section data:', err));
  }, []);

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
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Operating Divisions</span>
              <div className="text-xl font-mono font-extrabold text-emerald-500 dark:text-emerald-400 mt-0.5">8 Niches</div>
              <span className="text-[10px] text-zinc-500 font-mono">Healthcare, Retail, Tech</span>
            </div>
            <div className="border-x border-slate-200 dark:border-white/[0.08]">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Enterprise Records</span>
              <div className="text-xl font-mono font-extrabold text-slate-900 dark:text-white mt-0.5">{recordsCount} Items</div>
              <span className="text-[10px] text-emerald-400 font-mono">Mesh Synced</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Audit Trail</span>
              <div className="text-xl font-mono font-extrabold text-teal-400 mt-0.5">{auditLogs.length} Events</div>
              <span className="text-[10px] text-zinc-500 font-mono">Immutable Stream</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-mono text-zinc-500">
              Live telemetry aggregated across all connected enterprise business units
            </span>
            <Link
              href="/observability"
              className="text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
            >
              <span>Inspect Audit Logs</span>
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
              <span className="text-base font-mono font-black text-slate-900 dark:text-white block">Active</span>
              <span className="text-[10px] font-mono text-zinc-400">Receivables Ledger Synced</span>
            </div>
            <Link href="/banking" className="text-xs font-mono text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
              <span>Reconcile Accounts</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 2: AI Sentinels Roster */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot size={15} className="text-teal-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">AI Fleet</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                5 Sentinels
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">Autonomous Teammates</span>
              <span className="text-[10px] font-mono text-zinc-500">Continuous dropzone ingestion</span>
            </div>
            <Link href="/ai-agents" className="text-xs font-mono text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1">
              <span>Fleet Manager</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 3: SOC2 & Compliance Gate */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-blue-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Security &amp; SOC2</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                Passing
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">Zero Critical Flags</span>
              <span className="text-[10px] font-mono text-zinc-500">Immutable Hash Chains</span>
            </div>
            <Link href="/observability" className="text-xs font-mono text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1">
              <span>Security Hub</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 4: Workspace Architecture */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={15} className="text-cyan-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Service Architecture</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Universal
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">Microservices Connected</span>
              <span className="text-[10px] font-mono text-zinc-500">Isolated Tenant Tenancy</span>
            </div>
            <Link href="/industry" className="text-xs font-mono text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
              <span>Niche Switcher</span> <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
