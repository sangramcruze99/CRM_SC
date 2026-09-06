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
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-slate-900/60 border border-emerald-500/20 p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-10 -top-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Zap className="w-3.5 h-3.5" />
              <span>Full Autonomous AI Business OS Active</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Automation Command Center
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              AI agents orchestrate sales pipelines, customer triage, financial ledgers, and external integrations in real time with human-in-the-loop safety gates.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/automation/workflows/new"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/25"
            >
              <Workflow className="w-4 h-4" />
              <span>Launch Studio</span>
            </Link>
            <Link
              href="/automation/templates"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold text-sm transition border border-white/10"
            >
              <Layers className="w-4 h-4" />
              <span>Explore Templates</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-lg">
          <div className="text-xs text-slate-400 font-medium">Active Workflows</div>
          <div className="text-2xl font-bold text-white mt-1.5">{stats.activeWorkflows}</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
            <span>Live event-driven</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-lg">
          <div className="text-xs text-slate-400 font-medium">Executions (24h)</div>
          <div className="text-2xl font-bold text-white mt-1.5">{stats.totalExecutions}</div>
          <div className="text-[11px] text-teal-400 mt-1">Sub-second telemetry</div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-amber-500/30 backdrop-blur-lg relative overflow-hidden">
          <div className="text-xs text-amber-400 font-semibold">Pending Approvals</div>
          <div className="text-2xl font-bold text-amber-300 mt-1.5">{stats.pendingApprovals}</div>
          <Link href="/automation/approvals" className="text-[11px] text-amber-400 hover:underline mt-1 flex items-center space-x-1 font-medium">
            <span>Review in HITL Center</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-lg">
          <div className="text-xs text-slate-400 font-medium">Active Swarm Agents</div>
          <div className="text-2xl font-bold text-cyan-300 mt-1.5">{activeAgents.length}</div>
          <div className="text-[11px] text-cyan-400 mt-1">Groq & OpenRouter</div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-lg">
          <div className="text-xs text-slate-400 font-medium">System Health Rate</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1.5">{stats.healthRate}</div>
          <div className="text-[11px] text-slate-400 mt-1">Circuit breakers active</div>
        </div>
      </div>

      {/* Two Column Layout: Recent Executions & Active Agents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Live Execution Telemetry */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Live Execution Feed</h3>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchLiveStats}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                title="Refresh feed"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <Link
                href="/automation/executions"
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1"
              >
                <span>View all logs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/60 divide-y divide-white/5 backdrop-blur-lg overflow-hidden">
            {recentExecutions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No executions recorded yet. Run a test execution from Workflow Studio or trigger a business event to view live telemetry.
              </div>
            ) : (
              recentExecutions.map((exec) => (
                <div key={exec.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition">
                  <div className="flex items-center space-x-3.5">
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
                        <CheckCircle2 className="w-4 h-4" />
                      ) : exec.status === 'APPROVAL_REQUIRED' ? (
                        <ShieldAlert className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{exec.workflowName || 'Workflow Execution'}</div>
                      <div className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                        <span>{exec.trigger || 'Trigger: API'}</span>
                        <span>•</span>
                        <span>{exec.duration || '240ms'}</span>
                        {exec.tokens && (
                          <>
                            <span>•</span>
                            <span className="text-cyan-400">{exec.tokens} tokens</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        exec.status === 'SUCCESS'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : exec.status === 'APPROVAL_REQUIRED'
                          ? 'bg-amber-500/15 text-amber-300'
                          : 'bg-rose-500/15 text-rose-300'
                      }`}
                    >
                      {exec.status}
                    </span>
                    <Link
                      href={`/automation/executions`}
                      className="text-slate-400 hover:text-white p-1 rounded transition"
                    >
                      <ArrowUpRight className="w-4 h-4" />
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
            <div className="flex items-center space-x-2.5">
              <Bot className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">Active AI Sentinels</h3>
            </div>
            <Link
              href="/automation/agents"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
            >
              <span>Manage swarm</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/60 divide-y divide-white/5 backdrop-blur-lg overflow-hidden">
            {activeAgents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No autonomous sentinels registered yet. Configure agents in the Agent Registry.
              </div>
            ) : (
              activeAgents.map((agent, i) => (
                <div key={i} className="p-4 hover:bg-white/[0.02] transition">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-white">{agent.name}</div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      {agent.autonomyMode || agent.status || 'AUTONOMOUS'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{agent.role || agent.domain}</div>
                  <div className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
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
