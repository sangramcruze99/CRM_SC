// apps/web-core/src/components/blueprint/BlueprintDynamicSection.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  ArrowRight,
  Plus,
  Clock,
  Briefcase,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  BarChart3,
  Receipt,
  Building2,
  Database,
} from 'lucide-react';
import { useBlueprint } from './BlueprintContext';

export function BlueprintDynamicSection() {
  const { effectiveBlueprint, mounted } = useBlueprint();

  if (!mounted) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="workstation-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white/[0.05] border border-white/10 shrink-0" />
              <div className="space-y-2">
                <div className="h-5 w-52 bg-white/10 rounded-md" />
                <div className="h-3 w-72 bg-white/[0.05] rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const widgets = effectiveBlueprint.dashboards || [];
  const quickActions = effectiveBlueprint.quickActions || [];
  const kpis = effectiveBlueprint.kpis || [];
  const recordTypes = effectiveBlueprint.recordTypes || [];

  return (
    <div className="space-y-4">
      {/* 1. Header Card with Live Blueprint Identity */}
      <div className="workstation-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold shadow-xs shrink-0">
              <Compass size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 suppressHydrationWarning className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {effectiveBlueprint.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  BLUEPRINT ENGINE v{effectiveBlueprint.version}.0
                </span>
                <span suppressHydrationWarning className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/[0.04] text-slate-400 border border-white/10">
                  {effectiveBlueprint.industry}
                </span>
              </div>
              <p suppressHydrationWarning className="text-xs font-mono text-zinc-500 mt-0.5">
                {effectiveBlueprint.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <Link
              href="/industry"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
            >
              <Compass size={13} />
              <span>Configure Blueprint</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Dynamic Quick Actions resolved from Blueprint */}
        {quickActions.length > 0 && (
          <div className="pt-3 border-t border-slate-200 dark:border-white/[0.06] flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold mr-1">
              Quick Actions:
            </span>
            {quickActions.map((qa) => (
              <Link
                key={qa.id}
                href={qa.href || '/dashboard'}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  qa.primary
                    ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400'
                    : 'bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/[0.08]'
                }`}
              >
                <Plus size={13} />
                <span>{qa.label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 2. Dynamically Resolved Dashboard KPI Cards */}
      {widgets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className="workstation-card p-4 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase">
                  <span>{widget.type}</span>
                  <BarChart3 size={14} className="text-emerald-400" />
                </div>
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white mt-1">
                  {widget.title}
                </h3>
                {widget.metricValue && (
                  <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-2">
                    {widget.metricValue}
                  </div>
                )}
                {widget.metricDelta && (
                  <div className="text-[10px] font-mono text-teal-400 mt-0.5">
                    {widget.metricDelta}
                  </div>
                )}
              </div>

              {widget.metricSubtext && (
                <div className="pt-2 border-t border-slate-200 dark:border-white/[0.06] text-[10px] font-mono text-zinc-500">
                  {widget.metricSubtext}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {/* 3. Dynamic Record Types Bar */}
      {recordTypes.length > 0 && (
        <div className="workstation-card p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-emerald-400" />
            <span className="text-xs font-mono font-bold text-slate-300">
              Active Blueprint Schemas:
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {recordTypes.map((rec) => (
              <Link
                key={rec.id}
                href={rec.route || '/contacts'}
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition flex items-center gap-1.5"
              >
                <span>{rec.name}</span>
                <span className="text-[10px] font-mono text-emerald-400">
                  ({rec.fields.length} fields)
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
