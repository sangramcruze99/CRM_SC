'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  Sparkles,
  TrendingUp,
  Landmark,
  ShieldCheck,
  Zap,
  MessageSquare,
  Workflow,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Filter,
  Loader2,
} from 'lucide-react';
import { AiNavigationTabs } from '@/components/ai/AiNavigationTabs';

const DEPT_ICONS: Record<string, any> = {
  sales: TrendingUp,
  cs: ShieldCheck,
  finance: Landmark,
  support: MessageSquare,
  operations: Workflow,
  marketing: Zap,
};

export default function AiActivityPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const fetchActivities = async (dept: string) => {
    try {
      setLoading(true);
      const url =
        dept === 'all'
          ? '/api/ai/control/activity'
          : `/api/ai/control/activity?department=${dept}`;
      const res = await fetch(url);
      const data = await res.json();
      setActivities(data.activities || []);
    } catch (err) {
      console.error('Failed to load activity:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(selectedDept);
  }, [selectedDept]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white font-sans">
      <AiNavigationTabs />

      {/* Top Header Cockpit Chassis */}
      <div className="botanical-glass-card rounded-3xl p-6 md:p-8 border border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/[0.06] text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-bold tracking-wider uppercase">Activity Telemetry Stream</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">Chronological Event Ledger</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[11px]">
              vault/ai/activity_stream/
            </span>
            <span className="text-zinc-500">|</span>
            <span className="text-emerald-400 font-semibold">Live Audit: Enabled</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                AUDIT & TRACEABILITY
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
                REAL-TIME TELEMETRY
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Activity className="text-emerald-400" size={30} />
              AI Activity Feed
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 max-w-3xl leading-relaxed">
              A transparent, chronological log of everything your AI assistants discovered, analyzed, and completed.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/[0.08] rounded-2xl overflow-x-auto shrink-0">
            {['all', 'sales', 'cs', 'finance', 'support', 'operations', 'marketing'].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDept(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold capitalize transition-all cursor-pointer ${
                  selectedDept === d
                    ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {d === 'all' ? 'All Activity' : d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-400 font-mono">
          <Loader2 size={28} className="animate-spin text-emerald-400" />
          <span className="text-xs">Loading AI activity timeline...</span>
        </div>
      ) : activities.length === 0 ? (
        <div className="p-12 text-center rounded-2xl botanical-glass-card border border-white/[0.08] space-y-2">
          <Activity size={24} className="text-zinc-500 mx-auto" />
          <h3 className="text-sm font-bold font-mono text-white">
            No activity found for this department yet.
          </h3>
          <p className="text-xs font-mono text-zinc-400">
            Activities appear here as your AI assistants monitor CRM data and prepare tasks.
          </p>
        </div>
      ) : (
        <div className="relative border-l-2 border-emerald-500/30 ml-4 md:ml-6 pl-6 space-y-6">
          {activities.map((item) => {
            const Icon = DEPT_ICONS[item.departmentKey] || Sparkles;

            return (
              <div key={item.id} className="relative group">
                {/* Timeline icon node */}
                <div className="absolute -left-[35px] top-1.5 w-6 h-6 rounded-full bg-black/80 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/20">
                  <Icon size={12} />
                </div>

                <div className="botanical-glass-card rounded-2xl p-5 border border-white/[0.08] relative overflow-hidden space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs px-2.5 py-0.5 rounded-md bg-white/[0.06] text-emerald-400 border border-white/[0.08] font-mono">
                        {item.department}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                        item.status === 'COMPLETED'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {item.status === 'COMPLETED' ? 'COMPLETED' : 'NEEDS APPROVAL'}
                    </span>
                  </div>

                  {/* Action & Target */}
                  <div>
                    <h3 className="text-sm font-bold font-mono text-white">
                      {item.action}
                    </h3>
                    <p className="text-xs font-mono text-zinc-400 mt-0.5">
                      Target: <span className="font-semibold text-zinc-200">{item.target}</span>
                    </p>
                  </div>

                  {/* Structured Explanation: Why & Result */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono pt-1">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1">
                      <span className="font-bold text-zinc-500 uppercase tracking-wider text-[10px] block">
                        Why AI Acted:
                      </span>
                      <p className="text-zinc-300 leading-relaxed">
                        {item.why}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                      <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] block">
                        Outcome / Result:
                      </span>
                      <p className="text-zinc-300 leading-relaxed">
                        {item.result}
                      </p>
                    </div>
                  </div>

                  {/* If approval required, link directly */}
                  {item.requiresApproval && (
                    <div className="pt-2 flex justify-end">
                      <Link
                        href="/ai/approvals"
                        className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300"
                      >
                        Review in Approval Center <ArrowRight size={13} />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
