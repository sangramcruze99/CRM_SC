'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Palette,
  CheckCircle2,
  Clock,
  ArrowRight,
  Briefcase,
  Users,
} from 'lucide-react';
import { DataSourceRegistry } from '@/components/dashboard/DataSourceRegistry';

export function AgencySection() {
  const [data, setData] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>({
    activeSprintsCount: 0,
    totalRetainerValue: 0,
    inReviewDeliverables: 0,
  });

  useEffect(() => {
    fetch('/api/niche/agency')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setData(json.data);
        if (json.metrics) setMetrics(json.metrics);
      })
      .catch((err) => console.error('Failed to load agency section data:', err));
  }, []);

  const sprintsCount = metrics.activeSprintsCount || 0;
  const retainersValue = metrics.totalRetainerValue || 0;
  const reviewCount = metrics.inReviewDeliverables || 0;

  return (
    <div className="space-y-4">
      {/* 1. Main Agency Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Spotlight Card: Client Retainers & Deliverables Sprints */}
        <div className="md:col-span-12 lg:col-span-7 workstation-card p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-pink-500/10 border border-fuchsia-500/30 text-fuchsia-400 flex items-center justify-center font-bold shadow-xs">
                <Palette size={20} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                  Creative Studio &amp; Campaign Operations
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Active Client Sprints &amp; Deliverables Pipeline
                </h3>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30">
              STUDIO ACTIVE
            </span>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-200 dark:border-white/[0.08] text-center">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Monthly Retainers</span>
              <div className="text-xl font-mono font-extrabold text-fuchsia-400 mt-0.5">
                {DataSourceRegistry.formatCurrency(retainersValue)}
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Contracted Retainers</span>
            </div>
            <div className="border-x border-slate-200 dark:border-white/[0.08]">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Active Deliverables</span>
              <div className="text-xl font-mono font-extrabold text-slate-900 dark:text-white mt-0.5">
                {sprintsCount} Sprints
              </div>
              <span className="text-[10px] text-teal-400 font-mono">{sprintsCount > 0 ? 'Production milestones' : 'No active sprints'}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">In Client Review</span>
              <div className="text-xl font-mono font-extrabold text-teal-400 mt-0.5">{reviewCount} Assets</div>
              <span className="text-[10px] text-emerald-400 font-mono">{reviewCount > 0 ? 'Awaiting sign-off' : 'Reviews cleared'}</span>
            </div>
          </div>

          {/* Agency Sprint Progress Bar */}
          <div className="p-3 rounded-xl bg-fuchsia-950/20 border border-fuchsia-500/20 flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-fuchsia-400 shrink-0" />
              <span className="text-zinc-300">
                {reviewCount > 0 
                  ? `Review Desk: ${reviewCount} creative asset(s) awaiting client stakeholder approval` 
                  : 'Studio Velocity: Creative deliverable sprint board ready'}
              </span>
            </div>
            <Link
              href="/industry/agency"
              className="text-xs font-mono font-bold text-fuchsia-400 hover:text-fuchsia-300 flex items-center gap-1 shrink-0 transition"
            >
              <span>Explore Sprints</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Right 5 Cols: Agency Sub-Tiles */}
        <div className="md:col-span-12 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tile 1: Active Sprints */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase size={15} className="text-fuchsia-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Active Sprints</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30">
                {sprintsCount} Active
              </span>
            </div>
            <div>
              <span className="text-base font-mono font-black text-slate-900 dark:text-white block">{sprintsCount} Deliverables</span>
              <span className="text-[10px] font-mono text-zinc-400">Tracked in agency sprint board</span>
            </div>
            <Link href="/industry/agency" className="text-xs font-mono text-fuchsia-400 hover:text-fuchsia-300 font-bold flex items-center gap-1">
              <span>View Sprints</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 2: Monthly Retainers */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-pink-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Retainer Value</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-pink-500/15 text-pink-300 border border-pink-500/30">
                Monthly
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">{DataSourceRegistry.formatCurrency(retainersValue)} Retainers</span>
              <span className="text-[10px] font-mono text-zinc-500">Contracted creative value</span>
            </div>
            <Link href="/industry/agency" className="text-xs font-mono text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1">
              <span>Retainers</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 3: Client Sign-Offs */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={15} className="text-cyan-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Approvals Desk</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                {reviewCount} Pending
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">{reviewCount > 0 ? `${reviewCount} Awaiting Review` : 'All Approved'}</span>
              <span className="text-[10px] font-mono text-zinc-500">Client portal approval queue</span>
            </div>
            <Link href="/industry/agency" className="text-xs font-mono text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
              <span>Review Portal</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 4: Studio Quality Check */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">QA Standards</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Verified
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">Design System Aligned</span>
              <span className="text-[10px] font-mono text-zinc-500">Zero asset defect rate</span>
            </div>
            <Link href="/observability" className="text-xs font-mono text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
              <span>Studio Logs</span> <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
