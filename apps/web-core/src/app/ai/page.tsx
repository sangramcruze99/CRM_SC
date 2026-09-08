'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  ArrowRight,
  TrendingUp,
  Landmark,
  ShieldCheck,
  Zap,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Handshake,
  Eye,
  Loader2,
  RefreshCw,
  Sliders,
  Send,
  Bell,
  Play,
  Pause,
} from 'lucide-react';
import { AiNavigationTabs } from '@/components/ai/AiNavigationTabs';
import { GlobalAiCommandBar } from '@/components/ai/GlobalAiCommandBar';

export default function AiCommandCenterPage() {
  const [overview, setOverview] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  const [hardwareStatus, setHardwareStatus] = useState<any>(null);

  const fetchHardwareStatus = async () => {
    try {
      const res = await fetch('/api/ocr?action=engine-status');
      if (res.ok) {
        const data = await res.json();
        setHardwareStatus(data);
      }
    } catch {
      setHardwareStatus({ isLocalAvailable: false });
    }
  };

  const fetchOverview = async () => {
    try {
      setLoadingData(true);
      const res = await fetch('/api/ai/control/overview');
      const data = await res.json();
      setOverview(data);
    } catch (err) {
      console.error('Failed to load AI overview:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchHardwareStatus();
  }, []);

  const handleAsk = async (text?: string) => {
    const q = text || query;
    if (!q.trim()) return;

    setLoadingQuery(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/ai/control/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      setAiResponse(data);
    } catch {
      setAiResponse({
        department: 'AI Assistant',
        answer: 'I encountered an issue connecting to the AI mesh. Please try again.',
      });
    } finally {
      setLoadingQuery(false);
    }
  };

  const isPaused = overview?.metrics?.isGlobalPaused;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#080d0b] flex flex-col">
      <AiNavigationTabs pendingApprovalsCount={overview?.metrics?.pendingApprovals || 0} />
      <GlobalAiCommandBar />

      {/* Global Emergency Pause Banner if active */}
      {isPaused && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-6 py-2.5 flex items-center justify-between text-xs text-amber-900 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-600" />
            <span className="font-semibold">
              AI Team is temporarily paused. Autonomous actions are on hold.
            </span>
          </div>
          <Link
            href="/ai/trust"
            className="underline font-bold hover:text-amber-800 dark:hover:text-amber-200"
          >
            Manage in Trust Center
          </Link>
        </div>
      )}

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 space-y-8">
        {/* Hero Section: Good Morning & Universal Prompt */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20">
                  ✨
                </span>
                AI Command Center
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Your digital workforce: Ask anything, review recommendations, and let AI assist your business.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  hardwareStatus?.isLocalAvailable
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                }`}
                title={
                  hardwareStatus?.isLocalAvailable
                    ? `Running on local GPU (${hardwareStatus?.gpuName || 'GTX 1060 6GB'}) with zero API costs`
                    : 'Local engine offline. Cascading to cloud API fallback.'
                }
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    hardwareStatus?.isLocalAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                {hardwareStatus?.isLocalAvailable ? (
                  <span>Local GPU Active ({hardwareStatus?.gpuName || 'GTX 1060 6GB'})</span>
                ) : (
                  <span>Cloud Fallback Active</span>
                )}
              </div>

              <button
                onClick={fetchOverview}
                disabled={loadingData}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm transition-colors"
                title="Refresh AI Data"
              >
                <RefreshCw size={16} className={loadingData ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Universal Ask AI input box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 md:p-5 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-3">
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="text-emerald-500 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAsk();
                }}
                placeholder="What would you like AI to handle? (e.g. Find deals that need attention today...)"
                className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-sm md:text-base focus:outline-none"
              />
              <button
                onClick={() => handleAsk()}
                disabled={loadingQuery || !query.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs md:text-sm font-semibold shadow-md shadow-emerald-500/20 transition-all shrink-0"
              >
                {loadingQuery ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <span>Ask AI</span>
                    <Send size={14} />
                  </>
                )}
              </button>
            </div>

            {/* Quick suggested chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 text-xs text-slate-500 scrollbar-none">
              <span className="font-semibold text-slate-400 shrink-0">Try:</span>
              {[
                'Find deals that need my attention today',
                'Show me unpaid invoices',
                'Find customers who might churn',
                'Give me my daily briefing',
                'Automate website lead follow-ups',
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(suggestion);
                    handleAsk(suggestion);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 whitespace-nowrap transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* AI Response Card if query made */}
            {aiResponse && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-mono">
                      {aiResponse.department}
                    </span>
                    <span className="text-xs text-slate-500">AI Response</span>
                  </div>
                </div>

                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {aiResponse.answer}
                </p>

                {aiResponse.suggestedActions && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {aiResponse.suggestedActions.map((act: any, idx: number) => (
                      <Link
                        key={idx}
                        href={act.path || '/ai/approvals'}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-500/20 transition-colors"
                      >
                        <span>{act.label}</span>
                        <ArrowRight size={12} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Proactive "AI Today" Priorities */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock size={16} className="text-amber-500" />
              Here's What Your AI Team Discovered Today:
            </h2>
            <Link
              href="/ai/activity"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              View all activity <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {overview?.proactiveActions?.map((item: any) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-mono">
                      {item.department}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        item.priority === 'HIGH'
                          ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {item.priority} PRIORITY
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                    {item.recommendedAction}
                  </span>
                  <Link
                    href={item.requiresApproval ? '/ai/approvals' : '/deals'}
                    className="p-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 transition-colors shrink-0 ml-2"
                  >
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* My AI Team Snapshot */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users size={16} className="text-emerald-500" />
                My AI Team (Digital Employees)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Specialized digital assistants handling your day-to-day operations.
              </p>
            </div>
            <Link
              href="/ai/team"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              Manage AI Team <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                id: 'sales',
                name: 'Sales AI',
                icon: TrendingUp,
                color: 'from-amber-500 to-orange-600',
                role: 'Helps close deals & follow up',
                autonomy: overview?.departments?.sales?.autonomy || 'ASSIST',
                stat: '4 opportunities reviewed today',
              },
              {
                id: 'cs',
                name: 'Customer Success AI',
                icon: ShieldCheck,
                color: 'from-emerald-500 to-teal-600',
                role: 'Monitors satisfaction & churn',
                autonomy: overview?.departments?.cs?.autonomy || 'ASSIST',
                stat: '2 accounts flagged for review',
              },
              {
                id: 'finance',
                name: 'Finance AI',
                icon: Landmark,
                color: 'from-blue-500 to-indigo-600',
                role: 'Tracks invoices & overdue cash',
                autonomy: overview?.departments?.finance?.autonomy || 'ASSIST',
                stat: '5 overdue invoices monitored',
              },
            ].map((dept) => {
              const Icon = dept.icon;
              return (
                <div
                  key={dept.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${dept.color} flex items-center justify-center text-white shadow-md`}
                      >
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {dept.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {dept.role}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                        dept.autonomy === 'AUTOPILOT'
                          ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300'
                          : dept.autonomy === 'ASSIST'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      {dept.autonomy}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <span className="text-xs text-slate-500">{dept.stat}</span>
                    <Link
                      href="/ai/team"
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      Open <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
