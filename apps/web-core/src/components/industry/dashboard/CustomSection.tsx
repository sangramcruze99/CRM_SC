'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sliders,
  Database,
  Layers,
  ArrowRight,
  ShieldCheck,
  Workflow,
} from 'lucide-react';

export function CustomSection() {
  const [recordsCount, setRecordsCount] = useState<number>(0);

  useEffect(() => {
    fetch('/api/niche/custom')
      .then((res) => res.json())
      .then((json) => {
        if (json?.data?.records && Array.isArray(json.data.records)) {
          setRecordsCount(json.data.records.length);
        }
      })
      .catch((err) => console.error('Failed to load custom section data:', err));
  }, []);

  return (
    <div className="space-y-4">
      {/* 1. Main Custom Enterprise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Spotlight Card: Dynamic Schemas & Event Bus Mesh */}
        <div className="md:col-span-12 lg:col-span-7 workstation-card p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold shadow-xs">
                <Sliders size={20} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                  Custom Platform Architecture
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Dynamic Schema Builder &amp; Microservice Mesh
                </h3>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              SCHEMA SYNCED
            </span>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-200 dark:border-white/[0.08] text-center">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Custom Records</span>
              <div className="text-xl font-mono font-extrabold text-indigo-400 mt-0.5">{recordsCount} Units</div>
              <span className="text-[10px] text-zinc-500 font-mono">Dynamic Records Active</span>
            </div>
            <div className="border-x border-slate-200 dark:border-white/[0.08]">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Event Mesh</span>
              <div className="text-xl font-mono font-extrabold text-slate-900 dark:text-white mt-0.5">Active</div>
              <span className="text-[10px] text-emerald-400 font-mono">0 Failed Dispatches</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Service Isolation</span>
              <div className="text-xl font-mono font-extrabold text-emerald-400 mt-0.5">100% Secure</div>
              <span className="text-[10px] text-emerald-400 font-mono">Tenant Partitioned</span>
            </div>
          </div>

          {/* Platform Status Bar */}
          <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-indigo-400 shrink-0" />
              <span className="text-zinc-300">Tenant Sandboxing: Strict multi-tenant row-level security enforced across all models</span>
            </div>
            <Link
              href="/industry"
              className="text-xs font-mono font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 shrink-0 transition"
            >
              <span>Workspaces</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Right 5 Cols: Developer Sub-Tiles */}
        <div className="md:col-span-12 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tile 1: Custom Schema Builder */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database size={15} className="text-indigo-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Custom Records</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                {recordsCount} Items
              </span>
            </div>
            <div>
              <span className="text-base font-mono font-black text-slate-900 dark:text-white block">Visual Entity Model</span>
              <span className="text-[10px] font-mono text-zinc-400">Zero-Migration Custom Schemas</span>
            </div>
            <Link href="/industry" className="text-xs font-mono text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1">
              <span>Dynamic Objects</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 2: Workflow Automation */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Workflow size={15} className="text-purple-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Workflow Engine</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                Active
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">Trigger · Condition · Action</span>
              <span className="text-[10px] font-mono text-zinc-500">Universal automation pipeline</span>
            </div>
            <Link href="/automation" className="text-xs font-mono text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1">
              <span>Studio Workflows</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 3: Microservice Endpoints */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={15} className="text-cyan-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Service Catalog</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Connected
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">Dynamic Feature Entitlements</span>
              <span className="text-[10px] font-mono text-zinc-500">Universal Service Catalog</span>
            </div>
            <Link href="/industry" className="text-xs font-mono text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
              <span>Service Catalog</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 4: RBAC & ABAC Security */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">RBAC / ABAC</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Enforced
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">Role &amp; Attribute Security</span>
              <span className="text-[10px] font-mono text-zinc-500">Granular tenant permission gates</span>
            </div>
            <Link href="/observability" className="text-xs font-mono text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
              <span>Security Policies</span> <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
