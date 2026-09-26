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
    <div className="space-y-6 max-w-7xl mx-auto text-white font-sans">
      <AiNavigationTabs pendingApprovalsCount={overview?.metrics?.pendingApprovals || 0} />
      <GlobalAiCommandBar />

      {/* Global Emergency Pause Banner if active */}
      {isPaused && (
        <div className="bg-amber-500/15 border border-amber-500/30 rounded-2xl px-6 py-2.5 flex items-center justify-between text-xs text-amber-300 font-mono">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-400" />
            <span className="font-semibold">
              AI Swarm is temporarily paused. Autonomous actions are on hold.
            </span>
          </div>
          <Link
            href="/ai/trust"
            className="underline font-bold text-amber-300 hover:text-amber-200"
          >
            Manage in Trust Center
          </Link>
        </div>
      )}

      {/* Top Header Cockpit Chassis */}
        <div className="botanical-glass-card rounded-3xl p-6 md:p-8 border border-white/[0.08] relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

          {/* Autonomous Status Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/[0.06] text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 font-bold tracking-wider uppercase">AI Central Mesh Active</span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-400">Enterprise Unified Telemetry</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-400">
              <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[11px]">
                vault/mesh/autonomous_coordination/
              </span>
              <span className="text-zinc-500">|</span>
              <span className="text-emerald-400 font-semibold">
                {hardwareStatus?.isLocalAvailable ? 'Local GPU Active' : 'Cloud Mesh Active'}
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                  STAGE 5.0 AUTONOMOUS CORE
                </span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
                  MULTI-AGENT SWARM CONTROLLER
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <Sparkles className="text-emerald-400" size={30} />
                AI Command Center
              </h1>
              <p className="text-xs md:text-sm text-zinc-400 max-w-3xl leading-relaxed">
                Your digital workforce: Ask anything, review recommendations, and coordinate vertical AI Sentinels across sales, finance, and customer success.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={fetchOverview}
                disabled={loadingData}
                className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] text-xs font-mono font-semibold transition-all flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw size={13} className={loadingData ? 'animate-spin text-emerald-400' : ''} />
                <span>Sync Mesh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Universal Ask AI input box */}
        <div className="botanical-glass-card rounded-2xl p-5 border border-white/[0.08] relative overflow-hidden space-y-4">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          <div className="flex items-center gap-3 bg-black/40 border border-white/[0.08] rounded-xl px-4 py-2.5 focus-within:border-emerald-500/50 transition-all">
            <Sparkles size={18} className="text-emerald-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAsk();
              }}
              placeholder="What would you like AI to handle? (e.g. Find deals that need attention today...)"
              className="flex-1 bg-transparent text-white placeholder-zinc-500 text-xs md:text-sm font-mono focus:outline-none"
            />
            <button
              onClick={() => handleAsk()}
              disabled={loadingQuery || !query.trim()}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-zinc-950 text-xs font-mono font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {loadingQuery ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  <span>Ask AI</span>
                  <Send size={12} />
                </>
              )}
            </button>
          </div>

          {/* Quick suggested chips */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs font-mono">
            <span className="text-zinc-500 text-[11px] shrink-0 uppercase tracking-wider">Quick:</span>
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
                className="px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/[0.06] whitespace-nowrap transition-all cursor-pointer text-[11px]"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* AI Response Card if query made */}
          {aiResponse && (
            <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/30 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {aiResponse.department}
                </span>
                <span className="text-[11px] font-mono text-zinc-500">Neural Response</span>
              </div>

              <p className="text-xs font-mono text-zinc-200 leading-relaxed whitespace-pre-line">
                {aiResponse.answer}
              </p>

              {aiResponse.suggestedActions && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[0.06]">
                  {aiResponse.suggestedActions.map((act: any, idx: number) => (
                    <Link
                      key={idx}
                      href={act.path || '/ai/approvals'}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold border border-emerald-500/20 transition-all"
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

        {/* Proactive "AI Today" Priorities */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-mono text-white flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Clock size={15} />
              </div>
              <span>Here's What Your AI Team Discovered Today:</span>
            </h2>
            <Link
              href="/ai/activity"
              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <span>View all activity</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {overview?.proactiveActions?.map((item: any) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl botanical-glass-card border border-white/[0.08] relative overflow-hidden flex flex-col justify-between space-y-4 group hover:border-emerald-500/30 transition-all"
              >
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-white/[0.04] text-zinc-300 border border-white/[0.06]">
                      {item.department}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        item.priority === 'HIGH'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {item.priority} PRIORITY
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-emerald-400 font-medium">
                    {item.recommendedAction}
                  </span>
                  <Link
                    href={item.requiresApproval ? '/ai/approvals' : '/deals'}
                    className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all shrink-0 ml-2"
                  >
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* My AI Team Snapshot */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-mono text-white flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Users size={15} />
              </div>
              <span>Digital Workforce Ensemble</span>
            </h2>
            <Link
              href="/ai/team"
              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <span>Manage AI Team</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                id: 'sales',
                name: 'Sales AI (Ares Sentinel)',
                icon: TrendingUp,
                role: 'Autonomous inbound pipeline & SDR qualification',
                autonomy: overview?.departments?.sales?.autonomy || 'AUTONOMOUS',
                stat: '4 opportunities reviewed today',
              },
              {
                id: 'cs',
                name: 'Customer Success AI (Athena)',
                icon: ShieldCheck,
                role: 'Health telemetry, churn defense & root-cause intervention',
                autonomy: overview?.departments?.cs?.autonomy || 'AUTONOMOUS',
                stat: '2 accounts flagged for review',
              },
              {
                id: 'finance',
                name: 'Finance AI (Midas Sentinel)',
                icon: Landmark,
                role: 'AR collections, cashflow projection & ledger audit',
                autonomy: overview?.departments?.finance?.autonomy || 'AUTONOMOUS',
                stat: '5 overdue invoices monitored',
              },
            ].map((dept) => {
              const Icon = dept.icon;
              return (
                <div
                  key={dept.id}
                  className="p-5 rounded-2xl botanical-glass-card border border-white/[0.08] relative overflow-hidden flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-all group"
                >
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Icon size={18} />
                      </div>
                      <div>
                        <h3 className="font-bold font-mono text-sm text-white group-hover:text-emerald-300 transition-colors">
                          {dept.name}
                        </h3>
                        <p className="text-xs font-mono text-zinc-400 mt-0.5">
                          {dept.role}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {dept.autonomy}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-xs font-mono text-zinc-400">{dept.stat}</span>
                    <Link
                      href={dept.id === 'sales' ? '/sales-department' : dept.id === 'cs' ? '/customer-success' : '/finance-department'}
                      className="text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      <span>Open Department</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
    </div>
  );
}
