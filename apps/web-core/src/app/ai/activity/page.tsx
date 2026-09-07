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
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#080d0b] flex flex-col">
      <AiNavigationTabs />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight flex items-center gap-2.5">
              <Activity size={28} className="text-emerald-500" />
              AI Activity Feed
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              A transparent, chronological log of everything your AI assistants discovered, analyzed, and completed.
            </p>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl overflow-x-auto">
            {['all', 'sales', 'cs', 'finance', 'support', 'operations', 'marketing'].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDept(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  selectedDept === d
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {d === 'all' ? 'All Activity' : d}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 size={28} className="animate-spin text-emerald-500" />
            <span className="text-xs font-medium">Loading AI activity timeline...</span>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 space-y-2">
            <Activity size={24} className="text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No activity found for this department yet.
            </h3>
            <p className="text-xs text-slate-500">
              Activities appear here as your AI assistants monitor CRM data and prepare tasks.
            </p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 dark:border-white/10 ml-4 md:ml-6 pl-6 space-y-6">
            {activities.map((item) => {
              const Icon = DEPT_ICONS[item.departmentKey] || Sparkles;

              return (
                <div key={item.id} className="relative group">
                  {/* Timeline icon node */}
                  <div className="absolute -left-[35px] top-1.5 w-6 h-6 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900">
                    <Icon size={12} />
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-3 hover:border-slate-300 dark:hover:border-white/20 transition-all">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 font-mono">
                          {item.department}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
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
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {item.status === 'COMPLETED' ? 'COMPLETED' : 'NEEDS APPROVAL'}
                      </span>
                    </div>

                    {/* Action & Target */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.action}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Target: <span className="font-semibold">{item.target}</span>
                      </p>
                    </div>

                    {/* Structured Explanation: Why & Result */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-1">
                        <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                          Why AI Acted:
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {item.why}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-500/20 space-y-1">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider text-[10px] block">
                          Outcome / Result:
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {item.result}
                        </p>
                      </div>
                    </div>

                    {/* If approval required, link directly */}
                    {item.requiresApproval && (
                      <div className="pt-2 flex justify-end">
                        <Link
                          href="/ai/approvals"
                          className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
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
      </main>
    </div>
  );
}
