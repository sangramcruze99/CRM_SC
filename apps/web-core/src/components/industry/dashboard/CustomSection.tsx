'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sliders,
  Code2,
  Database,
  Network,
  Cpu,
  Layers,
  Lock,
  Workflow,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export function CustomSection() {
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
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Custom Objects</span>
              <div className="text-xl font-mono font-extrabold text-indigo-400 mt-0.5">14 Entities</div>
              <span className="text-[10px] text-zinc-500 font-mono">68 Dynamic Fields Active</span>
            </div>
            <div className="border-x border-slate-200 dark:border-white/[0.08]">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Event Bus Throughput</span>
              <div className="text-xl font-mono font-extrabold text-slate-900 dark:text-white mt-0.5">42.5k /min</div>
              <span className="text-[10px] text-emerald-400 font-mono">0 Failed Dispatches</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Microservices</span>
              <div className="text-xl font-mono font-extrabold text-emerald-400 mt-0.5">23 / 23</div>
              <span className="text-[10px] text-emerald-400 font-mono">100% Online · 24ms Latency</span>
            </div>
          </div>

          {/* Platform Status Bar */}
          <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-indigo-400 shrink-0" />
              <span className="text-zinc-300">Tenant Sandboxing: Strict multi-tenant row-level security enforced across all models</span>
            </div>
            <Link
              href="/platform/schema"
              className="text-xs font-mono font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 shrink-0 transition"
            >
              <span>Schema Studio</span>
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
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Custom Objects</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Studio
              </span>
            </div>
            <div>
              <span className="text-base font-mono font-black text-slate-900 dark:text-white block">Visual Entity Builder</span>
              <span className="text-[10px] font-mono text-zinc-400">Zero-Migration Custom Schemas</span>
            </div>
            <Link href="/platform/schema" className="text-xs font-mono text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1">
              <span>Edit Schemas</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 2: Developer APIs & Keys */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 size={15} className="text-teal-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Developer API</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                REST / RPC
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">Bearer Token &amp; API Keys</span>
              <span className="text-[10px] font-mono text-zinc-500">Fine-grained RBAC Permissions</span>
            </div>
            <Link href="/observability" className="text-xs font-mono text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1">
              <span>View API Keys</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 3: Cross-Service Sync Mesh */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network size={15} className="text-cyan-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Data Sync Mesh</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Kafka / EventBus
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">Bi-Directional ETL Pipelines</span>
              <span className="text-[10px] font-mono text-zinc-500">Real-time database replication</span>
            </div>
            <Link href="/data-sync" className="text-xs font-mono text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
              <span>Sync Mesh</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 4: Custom Automation Triggers */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Workflow size={15} className="text-purple-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Webhooks</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                Payload Ingest
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">Instant Webhook Ingestion</span>
              <span className="text-[10px] font-mono text-zinc-500">Auto-routes to Intent Builder</span>
            </div>
            <Link href="/automations" className="text-xs font-mono text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1">
              <span>Webhook Rules</span> <ArrowRight size={11} />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
