'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Workflow,
  Sparkles,
  ShieldAlert,
  Activity,
  ArrowRight,
  Bot,
  Zap,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Network,
} from 'lucide-react';

export default function AutomationOverviewPage() {
  const [stats, setStats] = useState({
    activeWorkflows: 0,
    totalExecutions: 0,
    pendingApprovals: 0,
    connectedIntegrations: 0,
    healthRate: '100%',
  });

  const [recentExecutions, setRecentExecutions] = useState<any[]>([]);
  const [activeAgents, setActiveAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLiveStats = async () => {
    setLoading(true);
    try {
      const [execRes, apprRes, agentRes, wfRes, mktRes] = await Promise.all([
        fetch('/api/automation/workflows/executions/all?limit=10').catch(() => null),
        fetch('/api/automation/approvals?status=PENDING').catch(() => null),
        fetch('/api/ai/agents').catch(() => null),
        fetch('/api/automation/workflows').catch(() => null),
        fetch('/api/marketplace/items').catch(() => null),
      ]);

      let totalExecs = 0;
      let successCount = 0;

      if (execRes?.ok) {
        const execs = await execRes.json();
        if (Array.isArray(execs)) {
          setRecentExecutions(execs);
          totalExecs = execs.length;
          successCount = execs.filter((e: any) => e.status === 'SUCCESS' || e.status === 'COMPLETED').length;
        }
      }

      let activeWfCount = 0;
      if (wfRes?.ok) {
        const wfs = await wfRes.json();
        if (Array.isArray(wfs)) {
          activeWfCount = wfs.filter((w: any) => w.isActive || w.status === 'ACTIVE').length;
        }
      }

      let pendingApprCount = 0;
      if (apprRes?.ok) {
        const apprs = await apprRes.json();
        if (Array.isArray(apprs)) {
          pendingApprCount = apprs.length;
        }
      }

      if (agentRes?.ok) {
        const agents = await agentRes.json();
        if (Array.isArray(agents)) {
          setActiveAgents(agents);
        }
      }

      let integrationsCount = 0;
      if (mktRes?.ok) {
        const items = await mktRes.json();
        if (Array.isArray(items)) {
          integrationsCount = items.length;
        }
      }

      const calculatedHealth = totalExecs > 0 ? `${Math.round((successCount / totalExecs) * 100)}%` : '100%';

      setStats({
        activeWorkflows: activeWfCount,
        totalExecutions: totalExecs,
        pendingApprovals: pendingApprCount,
        connectedIntegrations: integrationsCount,
        healthRate: calculatedHealth,
      });
    } catch {
      // safe fallback with zero values
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveStats();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header Cockpit Chassis */}
      <div className="botanical-glass-card rounded-3xl p-6 md:p-8 border border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        {/* Autonomous Sentinel Pulse Status Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/[0.06] text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-bold tracking-wider uppercase">Orchestration Swarm Active</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">Autonomous Execution Bus</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[11px]">
              vault/automation/workflow_engines/
            </span>
            <span className="text-zinc-500">|</span>
            <span className="text-emerald-400 font-semibold">HITL Circuit: Active</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                STAGE 5.0 VERTICAL INTELLIGENCE
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
                EVENT-DRIVEN SWARM ORCHESTRATION
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Workflow className="text-emerald-400" size={30} />
              Automation Command Center
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 max-w-3xl leading-relaxed">
              AI agents orchestrate sales pipelines, customer triage, financial ledgers, and external integrations in real time with human-in-the-loop safety gates.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <Link
              href="/automation/templates"
              className="px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white rounded-xl text-xs font-mono font-semibold border border-white/[0.08] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Layers size={14} />
              <span>Explore Templates</span>
            </Link>
            <Link
              href="/automation/workflows/new"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-mono font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Launch Intent Studio</span>
            </Link>
          </div>
        </div>
      </div>

      {/* High-Density Telemetry KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="botanical-glass-card rounded-2xl p-5 border border-white/[0.06] relative overflow-hidden flex flex-col justify-between">
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Workflows</span>
            <Workflow size={14} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white mt-1">{stats.activeWorkflows}</div>
          <div className="text-[11px] text-emerald-400 font-mono mt-1">Live event-driven</div>
        </div>

        <div className="botanical-glass-card rounded-2xl p-5 border border-white/[0.06] relative overflow-hidden flex flex-col justify-between">
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Executions</span>
            <Activity size={14} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white mt-1">{stats.totalExecutions}</div>
          <div className="text-[11px] text-teal-400 font-mono mt-1">Sub-second telemetry</div>
        </div>

        <div className="botanical-glass-card rounded-2xl p-5 border border-white/[0.06] relative overflow-hidden flex flex-col justify-between">
          <div className="text-xs font-mono text-amber-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Pending HITL</span>
            <ShieldAlert size={14} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-300 mt-1">{stats.pendingApprovals}</div>
          <Link href="/automation/approvals" className="text-[11px] text-amber-400 font-mono hover:underline mt-1 flex items-center gap-1 font-semibold">
            <span>Review Gate</span>
            <ArrowRight size={11} />
          </Link>
        </div>

        <div className="botanical-glass-card rounded-2xl p-5 border border-white/[0.06] relative overflow-hidden flex flex-col justify-between">
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Active Sentinels</span>
            <Bot size={14} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white mt-1">{activeAgents.length}</div>
          <div className="text-[11px] text-zinc-400 font-mono mt-1">Groq & OpenRouter</div>
        </div>

        <div className="botanical-glass-card rounded-2xl p-5 border border-white/[0.06] relative overflow-hidden flex flex-col justify-between">
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>System Health</span>
            <CheckCircle2 size={14} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-1">{stats.healthRate}</div>
          <div className="text-[11px] text-zinc-400 font-mono mt-1">Circuit breakers active</div>
        </div>
      </div>

      {/* Two Column Layout: Recent Executions & Active Agents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Execution Telemetry */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-mono text-white flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Activity size={15} />
              </div>
              <span>Live Execution Feed</span>
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchLiveStats}
                className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition cursor-pointer"
                title="Refresh feed"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              </button>
              <Link
                href="/automation/executions"
                className="text-xs font-mono text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                <span>View all logs</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          <div className="botanical-glass-card rounded-2xl border border-white/[0.08] divide-y divide-white/[0.06] overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            {recentExecutions.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-zinc-400">
                No executions recorded yet. Run a test execution from Workflow Studio or trigger a business event to view live telemetry.
              </div>
            ) : (
              recentExecutions.map((exec) => (
                <div key={exec.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        exec.status === 'SUCCESS'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : exec.status === 'APPROVAL_REQUIRED'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {exec.status === 'SUCCESS' ? (
                        <CheckCircle2 size={16} />
                      ) : exec.status === 'APPROVAL_REQUIRED' ? (
                        <ShieldAlert size={16} />
                      ) : (
                        <AlertTriangle size={16} />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold text-white">{exec.workflowName || 'Workflow Execution'}</div>
                      <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2 mt-0.5">
                        <span>{exec.trigger || 'Trigger: API'}</span>
                        <span>•</span>
                        <span>{exec.duration || '240ms'}</span>
                        {exec.tokens && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-400">{exec.tokens} tokens</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        exec.status === 'SUCCESS'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : exec.status === 'APPROVAL_REQUIRED'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {exec.status}
                    </span>
                    <Link
                      href={`/automation/executions`}
                      className="text-zinc-400 hover:text-white p-1 rounded transition"
                    >
                      <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Autonomous Agent Sentinel Swarms */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-mono text-white flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Bot size={15} />
              </div>
              <span>Active AI Sentinels</span>
            </h2>
            <div className="flex items-center gap-3">
              <Link
                href="/automation/agents/tree"
                className="text-xs font-mono text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 transition cursor-pointer"
              >
                <Network size={13} />
                <span>Swarm Tree</span>
              </Link>
              <Link
                href="/automation/agents"
                className="text-xs font-mono text-zinc-400 hover:text-zinc-200 font-semibold flex items-center gap-1 transition"
              >
                <span>Manage swarm</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          <div className="botanical-glass-card rounded-2xl border border-white/[0.08] divide-y divide-white/[0.06] overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            {activeAgents.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-zinc-400">
                No autonomous sentinels registered yet. Configure agents in the Agent Registry.
              </div>
            ) : (
              activeAgents.map((agent, i) => (
                <div key={i} className="p-4 hover:bg-white/[0.02] transition">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-mono font-bold text-white">{agent.name}</div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {agent.autonomyMode || agent.status || 'AUTONOMOUS'}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-zinc-400 mt-1">{agent.role || agent.domain}</div>
                  <div className="text-[11px] font-mono text-zinc-500 mt-1.5 flex items-center justify-between">
                    <span>Model: {agent.model || 'Groq / Llama-3-70B'}</span>
                    <span className="text-emerald-400 font-semibold">{agent.totalDecisions || agent.decisionsToday || 0} runs</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
