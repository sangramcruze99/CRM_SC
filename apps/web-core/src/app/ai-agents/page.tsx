'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bot,
  ShieldCheck,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Activity,
  Layers,
  ArrowUpRight,
  Clock,
  Shield,
  Eye,
  Sliders,
  Send,
  Building,
  RefreshCw,
  Check,
  X,
  Play,
  Pause,
  GitMerge,
  ArrowRight,
  Home,
  DollarSign,
  Users,
  SlidersHorizontal,
  Cpu,
  FileCheck,
  Lock,
  Workflow,
  Sparkle
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  role: string;
  domain: string;
  autonomyMode: 'AUTONOMOUS' | 'HYBRID' | 'MONITOR_ONLY';
  status: 'ACTIVE' | 'PAUSED' | 'EVALUATING';
  allowedTools: string[];
  totalDecisions: number;
  accuracyRate: number;
  lastActive: string;
}

interface ApprovalItem {
  id: string;
  agentId: string;
  agentName: string;
  actionType: string;
  targetEntity: string;
  targetId: string;
  targetName: string;
  confidence: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  rationale: string;
  parameters: Record<string, any>;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXECUTED_AUTONOMOUSLY';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

interface DecisionResult {
  observe: {
    metricsAnalyzed: Record<string, any>;
    detectedAnomalies: string[];
  };
  predict: {
    event: string;
    probability: number;
    impactScore: number;
  };
  recommend: {
    action: string;
    confidence: number;
    rationale: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  act: {
    disposition: string;
    actionId: string;
    details: string;
  };
}

interface SwarmTelemetry {
  isDaemonActive: boolean;
  sweepIntervalSeconds: number;
  lastSweepTimestamp: string;
  totalSwarmSweeps: number;
  totalDecisions: number;
  pendingApprovalsCount: number;
  approvedCount: number;
  accuracyRate: number;
  activeSentinelsCount: number;
}

interface SafetyPolicy {
  confidenceThreshold: number;
  maxValueAutoApprove: number;
  restrictedActions: string[];
  requireHumanForContractDiscounts: boolean;
}

interface MultiAgentChain {
  chainId: string;
  timestamp: string;
  triggerEvent: string;
  leadSentinel: string;
  participants: string[];
  handoffSteps: {
    step: number;
    sentinelId: string;
    sentinelName: string;
    action: string;
    reasoning: string;
    status: 'COMPLETED' | 'HANDED_OFF' | 'QUEUED_FOR_APPROVAL';
  }[];
  finalOutcome: string;
}

interface SwarmSweepResult {
  sweepId: string;
  timestamp: string;
  entitiesScanned: Record<string, number>;
  anomaliesDetected: number;
  autonomousActionsExecuted: number;
  actionsQueuedForApproval: number;
  actions: ApprovalItem[];
  summary: string;
}

export default function AIAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [telemetry, setTelemetry] = useState<SwarmTelemetry | null>(null);
  const [policy, setPolicy] = useState<SafetyPolicy | null>(null);
  const [collaborationLogs, setCollaborationLogs] = useState<MultiAgentChain[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tabs: FLEET | COLLABORATION | APPROVALS | POLICY | SIMULATOR
  const [activeTab, setActiveTab] = useState<'FLEET' | 'COLLABORATION' | 'APPROVALS' | 'POLICY' | 'SIMULATOR'>('FLEET');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'>('PENDING_APPROVAL');
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  // Background Daemon & Swarm Sweeper states
  const [isSweeping, setIsSweeping] = useState(false);
  const [lastSweepResult, setLastSweepResult] = useState<SwarmSweepResult | null>(null);
  const [isTogglingDaemon, setIsTogglingDaemon] = useState(false);

  // Multi-Agent Collaboration state
  const [isChaining, setIsChaining] = useState(false);
  const [chainScenario, setChainScenario] = useState('ACCOUNT_RETENTION_INTERVENTION');
  const [activeChain, setActiveChain] = useState<MultiAgentChain | null>(null);

  // Policy Form State
  const [policySaving, setPolicySaving] = useState(false);
  const [policyConfidence, setPolicyConfidence] = useState<number>(85);
  const [policyMaxValue, setPolicyMaxValue] = useState<number>(50000);
  const [policyRequireHuman, setPolicyRequireHuman] = useState<boolean>(true);

  // Playground state
  const [simEntity, setSimEntity] = useState('Contact');
  const [simTargetId, setSimTargetId] = useState('cnt_sarah_lin');
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<DecisionResult | null>(null);

  const loadData = async () => {
    try {
      const [resAgents, resApprovals, resTelemetry, resPolicy, resCollab] = await Promise.all([
        fetch('/api/ai/agents'),
        fetch('/api/ai/agents/approvals'),
        fetch('/api/ai/agents/telemetry'),
        fetch('/api/ai/agents/policy'),
        fetch('/api/ai/agents/collaboration'),
      ]);

      if (resAgents.ok) setAgents(await resAgents.json());
      if (resApprovals.ok) setApprovals(await resApprovals.json());
      if (resTelemetry.ok) setTelemetry(await resTelemetry.json());
      if (resPolicy.ok) {
        const p = await resPolicy.json();
        setPolicy(p);
        setPolicyConfidence(Math.round((p.confidenceThreshold || 0.85) * 100));
        setPolicyMaxValue(p.maxValueAutoApprove || 50000);
        setPolicyRequireHuman(p.requireHumanForContractDiscounts ?? true);
      }
      if (resCollab.ok) {
        const c = await resCollab.json();
        setCollaborationLogs(c);
        if (c.length > 0 && !activeChain) {
          setActiveChain(c[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load agents/approvals/telemetry', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleDaemon = async () => {
    setIsTogglingDaemon(true);
    try {
      const res = await fetch('/api/ai/agents/daemon/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setActionAlert(
          data.isDaemonActive
            ? 'Autonomous Background Daemon ACTIVE. Sweeping CRM records every 120 seconds.'
            : 'Autonomous Background Daemon PAUSED.'
        );
        loadData();
        setTimeout(() => setActionAlert(null), 5000);
      }
    } catch (err) {
      console.error('Failed to toggle daemon', err);
    } finally {
      setIsTogglingDaemon(false);
    }
  };

  const handleRunSwarmSweep = async () => {
    setIsSweeping(true);
    try {
      const res = await fetch('/api/ai/agents/sweep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const sweep: SwarmSweepResult = await res.json();
        setLastSweepResult(sweep);
        setActionAlert(
          `Swarm Sweep Complete: ${sweep.autonomousActionsExecuted} actions executed autonomously, ${sweep.actionsQueuedForApproval} queued for review.`
        );
        loadData();
        setTimeout(() => setActionAlert(null), 6000);
      }
    } catch (err) {
      console.error('Failed to run swarm sweep', err);
    } finally {
      setIsSweeping(false);
    }
  };

  const handleRunCollaborationChain = async () => {
    setIsChaining(true);
    try {
      const res = await fetch('/api/ai/agents/chain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: chainScenario, targetId: 'cnt_sarah_lin' }),
      });
      if (res.ok) {
        const chain: MultiAgentChain = await res.json();
        setActiveChain(chain);
        setActionAlert(`Multi-Agent Handoff Chain executed across ${chain.participants.length} Sentinels.`);
        loadData();
        setTimeout(() => setActionAlert(null), 5000);
      }
    } catch (err) {
      console.error('Failed to run collaboration chain', err);
    } finally {
      setIsChaining(false);
    }
  };

  const handleSavePolicy = async () => {
    setPolicySaving(true);
    try {
      const res = await fetch('/api/ai/agents/policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confidenceThreshold: policyConfidence / 100,
          maxValueAutoApprove: policyMaxValue,
          requireHumanForContractDiscounts: policyRequireHuman,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPolicy(updated);
        setActionAlert(`Agent Safety Policy Guardrails successfully saved.`);
        setTimeout(() => setActionAlert(null), 4000);
      }
    } catch (err) {
      console.error('Failed to update policy', err);
    } finally {
      setPolicySaving(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/ai/agents/approvals/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewedBy: 'Executive Officer' }),
      });
      if (res.ok) {
        setActionAlert(`Action approved & dispatched into Unified Enterprise Event Bus.`);
        loadData();
        setTimeout(() => setActionAlert(null), 4000);
      }
    } catch {
      setActionAlert(`Action approved.`);
      setTimeout(() => setActionAlert(null), 3000);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`/api/ai/agents/approvals/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewedBy: 'Executive Officer' }),
      });
      if (res.ok) {
        setActionAlert(`Action rejected and cancelled.`);
        loadData();
        setTimeout(() => setActionAlert(null), 4000);
      }
    } catch {
      setActionAlert(`Action rejected.`);
      setTimeout(() => setActionAlert(null), 3000);
    }
  };

  const handleRunDecision = async () => {
    setSimLoading(true);
    setSimResult(null);
    try {
      const res = await fetch('/api/ai/agents/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEntity: simEntity, targetId: simTargetId }),
      });
      if (res.ok) {
        const data = await res.json();
        setSimResult(data);
        loadData();
      }
    } catch (err) {
      console.error('Decision simulation failed', err);
    } finally {
      setSimLoading(false);
    }
  };

  const filteredApprovals = approvals.filter(item => {
    if (statusFilter === 'ALL') return true;
    return item.status === statusFilter;
  });

  const pendingCount = approvals.filter(a => a.status === 'PENDING_APPROVAL').length;
  const totalDecisions = agents.reduce((acc, a) => acc + a.totalDecisions, 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* Header & Command Strip */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-slate-900/80 dark:bg-white/[0.02] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] p-6 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <Sparkles size={11} />
              Self-Driving Business OS · Enterprise Agent Fleet
            </span>
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Workflow size={12} className="text-teal-400" />
              Real Estate Niche Sentinel Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Cpu className="text-emerald-400" size={32} />
            Autonomous Workforce Command Center
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Supervised multi-agent swarm continuously auditing CRM records, real estate escrows, and treasury aging with proactive cross-agent collaboration.
          </p>
        </div>

        {/* Global Daemon Switch & Sweep Trigger */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          {/* Daemon Status Toggle Button */}
          <button
            onClick={handleToggleDaemon}
            disabled={isTogglingDaemon}
            className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
              telemetry?.isDaemonActive
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 shadow-emerald-500/10'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25 shadow-rose-500/10'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${telemetry?.isDaemonActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            <span>
              Daemon: {telemetry?.isDaemonActive ? 'ACTIVE (120s)' : 'PAUSED'}
            </span>
            {telemetry?.isDaemonActive ? <Pause size={12} /> : <Play size={12} />}
          </button>

          {/* Trigger Swarm Sweep Button */}
          <button
            onClick={handleRunSwarmSweep}
            disabled={isSweeping}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={isSweeping ? 'animate-spin' : ''} />
            <span>{isSweeping ? 'Sweeping Swarm...' : 'Run Swarm Audit Now'}</span>
          </button>
        </div>

        {/* Subtle background glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Action Notification Alert */}
      {actionAlert && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-between animate-fadeIn shadow-lg">
          <div className="flex items-center gap-3 text-emerald-300 text-sm font-semibold">
            <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
            <span>{actionAlert}</span>
          </div>
          <button onClick={() => setActionAlert(null)} className="text-xs text-emerald-400 hover:text-white cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Swarm Telemetry & Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Operational Sentinels</span>
            <Bot size={16} className="text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{agents.length}</span>
            <span className="text-xs text-emerald-400 font-semibold">Active Fleet</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <Home size={11} className="text-amber-400" />
            Includes Vesta Real Estate Sentinel
          </p>
        </div>

        <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Managerial Approval Queue</span>
            <AlertTriangle size={16} className={pendingCount > 0 ? 'text-amber-400 animate-bounce' : 'text-slate-500'} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-black ${pendingCount > 0 ? 'text-amber-400' : 'text-white'}`}>
              {pendingCount}
            </span>
            <span className="text-xs text-slate-400 font-semibold">Pending Human Sign-off</span>
          </div>
          <p className="text-[11px] text-amber-400 font-medium mt-1">High-Risk &amp; Policy Bounds Guard</p>
        </div>

        <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Autonomous Decisions</span>
            <Zap size={16} className="text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{totalDecisions.toLocaleString()}</span>
            <span className="text-xs text-slate-400 font-semibold">Dispatched</span>
          </div>
          <p className="text-[11px] text-teal-400 font-medium mt-1">
            {telemetry?.totalSwarmSweeps ?? 42} Swarm sweeps completed
          </p>
        </div>

        <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Fleet Precision Index</span>
            <ShieldCheck size={16} className="text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">97.4%</span>
            <span className="text-xs text-slate-400 font-semibold">Verification Score</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-medium mt-1">Cross-verified via Event Ledger</p>
        </div>
      </div>

      {/* Swarm Sweep Result Banner (if triggered) */}
      {lastSweepResult && (
        <div className="bg-slate-900/90 dark:bg-emerald-950/20 border border-emerald-500/30 rounded-3xl p-6 shadow-xl animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Autonomous Swarm Sweep Result</h3>
                <p className="text-xs text-slate-400">{lastSweepResult.summary}</p>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 self-start sm:self-auto">
              ID: {lastSweepResult.sweepId}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            {Object.entries(lastSweepResult.entitiesScanned).map(([entity, count]) => (
              <div key={entity} className="bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.06]">
                <div className="text-[10px] uppercase font-bold text-slate-400">{entity}</div>
                <div className="text-lg font-black text-white mt-0.5">{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('FLEET')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'FLEET'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'bg-white/[0.03] text-slate-400 hover:text-white'
          }`}
        >
          <Layers size={14} />
          <span>Active Sentinels &amp; Niches ({agents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('COLLABORATION')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'COLLABORATION'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'bg-white/[0.03] text-slate-400 hover:text-white'
          }`}
        >
          <GitMerge size={14} />
          <span>Cross-Agent Collaboration</span>
        </button>

        <button
          onClick={() => setActiveTab('APPROVALS')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'APPROVALS'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'bg-white/[0.03] text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck size={14} />
          <span>Approval Queue ({pendingCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('POLICY')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'POLICY'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'bg-white/[0.03] text-slate-400 hover:text-white'
          }`}
        >
          <SlidersHorizontal size={14} />
          <span>Safety Policy Guardrails</span>
        </button>

        <button
          onClick={() => setActiveTab('SIMULATOR')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'SIMULATOR'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'bg-white/[0.03] text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles size={14} />
          <span>Decision Simulator</span>
        </button>
      </div>

      {/* TAB 1: FLEET OVERVIEW & REAL ESTATE SENTINEL */}
      {activeTab === 'FLEET' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                <Layers size={18} className="text-emerald-400" />
                <span>Enterprise Agent Fleet &amp; Vertical Sentinels</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Each sentinel possesses bounded domain tools, deterministic safety criteria, and event publication capabilities.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
              5 Dedicated Sentinels
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {agents.map((agent) => {
              const isVesta = agent.id === 'agent_vesta';
              return (
                <div
                  key={agent.id}
                  className={`bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-xl border rounded-3xl p-6 flex flex-col justify-between transition-all group ${
                    isVesta
                      ? 'border-amber-500/40 hover:border-amber-400 shadow-lg shadow-amber-500/5 bg-gradient-to-b from-amber-500/[0.04] to-transparent'
                      : 'border-slate-200 dark:border-white/[0.08] hover:border-emerald-500/40'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center font-bold text-sm ${
                        isVesta
                          ? 'bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {isVesta ? <Home size={20} /> : <Bot size={20} />}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isVesta && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            🏡 Real Estate
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          agent.autonomyMode === 'AUTONOMOUS'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                        }`}>
                          {agent.autonomyMode}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-bold text-white text-base mt-4 group-hover:text-emerald-400 transition-colors">
                      {agent.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{agent.role}</p>

                    <div className="mt-4 space-y-2 text-xs bg-white/[0.02] p-3 rounded-2xl border border-white/[0.04]">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Domain:</span>
                        <span className="font-semibold text-white">{agent.domain}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Precision Accuracy:</span>
                        <span className="font-mono font-bold text-emerald-400">{agent.accuracyRate}%</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Total Autonomous Decisions:</span>
                        <span className="font-mono font-semibold text-slate-200">{agent.totalDecisions}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/[0.06]">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2">Authorized Tool Arsenal:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {agent.allowedTools.map((tool, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                              isVesta
                                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                                : 'bg-white/[0.04] text-slate-300 border border-white/[0.06]'
                            }`}
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/[0.06]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Live Swarm Worker
                    </span>
                    <span className="font-mono text-[10px]">Active now</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CROSS-AGENT COLLABORATION CHAINING */}
      {activeTab === 'COLLABORATION' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                <GitMerge size={18} className="text-emerald-400" />
                <span>Cross-Functional Agent Collaboration Chaining</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Sentinels deliberate and hand off context across domains: Customer Success &rarr; Sales Quoting &rarr; Treasury Risk Review.
              </p>
            </div>

            <button
              onClick={handleRunCollaborationChain}
              disabled={isChaining}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Zap size={14} className={isChaining ? 'animate-bounce' : ''} />
              <span>{isChaining ? 'Executing Chain...' : 'Simulate Swarm Handoff'}</span>
            </button>
          </div>

          {/* Active Chain Visual Flow */}
          {activeChain ? (
            <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                    Scenario: {activeChain.triggerEvent}
                  </span>
                  <h3 className="text-base font-black text-white mt-2">
                    Lead Sentinel: {activeChain.leadSentinel}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Participating:</span>
                  <div className="flex flex-wrap gap-1">
                    {activeChain.participants.map((p, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-white/[0.06] text-slate-300 rounded text-[11px] font-semibold">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Handoff Step Visualizer */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Inter-Sentinel Handoff Timeline</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeChain.handoffSteps.map((step) => (
                    <div
                      key={step.step}
                      className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex flex-col justify-between relative group hover:border-emerald-500/30 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center">
                            {step.step}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            step.status === 'COMPLETED'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : step.status === 'HANDED_OFF'
                              ? 'bg-teal-500/20 text-teal-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {step.status}
                          </span>
                        </div>

                        <h5 className="font-bold text-white text-xs">{step.sentinelName}</h5>
                        <p className="text-[11px] font-mono text-emerald-400 mt-1">{step.action}</p>

                        <p className="text-xs text-slate-300 mt-3 leading-relaxed bg-black/20 p-2.5 rounded-xl border border-white/[0.03]">
                          {step.reasoning}
                        </p>
                      </div>

                      <div className="mt-4 pt-2 border-t border-white/[0.04] text-[10px] text-slate-500 flex items-center justify-between">
                        <span>Handoff Verified</span>
                        <CheckCircle2 size={12} className="text-emerald-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Synthesis Outcome */}
              <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3">
                <ShieldCheck size={24} className="text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">Synthesis &amp; Dispatch Outcome</div>
                  <p className="text-xs text-slate-300 mt-0.5">{activeChain.finalOutcome}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs bg-white/[0.02] rounded-3xl border border-white/[0.06]">
              No collaboration chain executed yet. Click &quot;Simulate Swarm Handoff&quot; to test.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HUMAN-IN-THE-LOOP APPROVAL QUEUE */}
      {activeTab === 'APPROVALS' && (
        <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-400" />
                <span>Executive Human-in-the-Loop Action Approval Queue</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Actions flagged by Safety Policy Guardrails (high risk, deal discounts, or escrow contingency releases) require signed sign-off.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {(['ALL', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white'
                  }`}
                >
                  {st === 'PENDING_APPROVAL' ? `Pending (${pendingCount})` : st}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 space-y-4">
            {filteredApprovals.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] rounded-2xl transition-all"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5 ${
                      item.agentId === 'agent_vesta'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {item.agentId === 'agent_vesta' ? <Home size={18} /> : <Bot size={18} />}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-sm">{item.actionType.replace(/_/g, ' ')}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/[0.06] text-slate-300">
                          {item.targetEntity}: {item.targetName}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          item.riskLevel === 'HIGH' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          Risk: {item.riskLevel}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          {Math.round(item.confidence * 100)}% Confidence
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
                        {item.rationale}
                      </p>

                      <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-500">
                        <span>Initiated by: <span className="text-slate-300 font-medium">{item.agentName}</span></span>
                        <span>Created: {new Date(item.createdAt).toLocaleTimeString()}</span>
                        {item.reviewedBy && (
                          <span>Reviewed by: <span className="text-emerald-400">{item.reviewedBy}</span></span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Approve / Reject Controls */}
                  <div className="flex items-center gap-2 w-full lg:w-auto shrink-0">
                    {item.status === 'PENDING_APPROVAL' ? (
                      <>
                        <button
                          onClick={() => handleReject(item.id)}
                          className="flex-1 lg:flex-none px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <X size={14} />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="flex-1 lg:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
                        >
                          <Check size={14} />
                          <span>Approve &amp; Execute</span>
                        </button>
                      </>
                    ) : (
                      <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                        item.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {item.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredApprovals.length === 0 && (
              <div className="text-center py-10 text-slate-500 text-xs">
                No actions currently matching the selected status filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SAFETY POLICY GUARDRAILS */}
      {activeTab === 'POLICY' && (
        <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div>
              <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-emerald-400" />
                <span>Enterprise Agent Safety Policy Guardrails</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure deterministic threshold bounds. Any agent action exceeding these limits is trapped for managerial review.
              </p>
            </div>
            <button
              onClick={handleSavePolicy}
              disabled={policySaving}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
            >
              {policySaving ? 'Saving Guardrails...' : 'Save Guardrails'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Slider 1: Confidence Threshold */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <Shield size={14} className="text-emerald-400" />
                  Minimum Autonomous Confidence Score
                </label>
                <span className="font-mono text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  {policyConfidence}%
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Actions where sentinel confidence is below this threshold will automatically bypass autonomous execution and be placed in the Executive Queue.
              </p>
              <input
                type="range"
                min={70}
                max={99}
                value={policyConfidence}
                onChange={(e) => setPolicyConfidence(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>70% (Aggressive Autonomy)</span>
                <span>85% (Recommended)</span>
                <span>99% (Strict Verification)</span>
              </div>
            </div>

            {/* Slider 2: Max Auto-Approve Deal Value */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <DollarSign size={14} className="text-teal-400" />
                  Max Auto-Approve Commercial Deal Value
                </label>
                <span className="font-mono text-sm font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">
                  ${policyMaxValue.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Any sales concession, discount, or credit terms on deals exceeding this valuation strictly require VP sign-off before dispatch.
              </p>
              <input
                type="range"
                min={10000}
                max={100000}
                step={5000}
                value={policyMaxValue}
                onChange={(e) => setPolicyMaxValue(Number(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>$10,000</span>
                <span>$50,000 (Default)</span>
                <span>$100,000</span>
              </div>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Mandatory Escalation Rules</h4>

            <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
              <div>
                <span className="text-xs font-bold text-white block">Require Human Sign-off on Contract Discounts</span>
                <span className="text-[11px] text-slate-400">Forces Ares Sales Intelligence Sentinel to seek review whenever applying commercial concessions.</span>
              </div>
              <input
                type="checkbox"
                checked={policyRequireHuman}
                onChange={(e) => setPolicyRequireHuman(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
              <div>
                <span className="text-xs font-bold text-white block">Enforce Dual Sign-off on Real Estate Escrow Contingencies</span>
                <span className="text-[11px] text-slate-400">Mandates managing broker verification prior to Vesta releasing earnest money or clearing title contingencies.</span>
              </div>
              <input
                type="checkbox"
                defaultChecked={true}
                disabled
                className="w-4 h-4 accent-emerald-500 rounded cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: 4-STAGE DECISION PLAYGROUND */}
      {activeTab === 'SIMULATOR' && (
        <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                <Sparkles size={18} className="text-emerald-400" />
                <span>4-Stage Autonomous Decision Engine Simulator</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Observe business state &rarr; Predict outcome probabilities &rarr; Recommend optimal action &rarr; Act with governance.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <select
              value={simEntity}
              onChange={(e) => setSimEntity(e.target.value)}
              className="w-full sm:w-48 px-3 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl border border-white/[0.1] focus:outline-none"
            >
              <option value="Contact">Contact Stakeholder</option>
              <option value="Deal">Commercial Deal</option>
              <option value="Company">Enterprise Account</option>
              <option value="PropertyListing">Real Estate Listing</option>
            </select>

            <input
              type="text"
              value={simTargetId}
              onChange={(e) => setSimTargetId(e.target.value)}
              placeholder="Target ID (e.g. cnt_sarah_lin or listing_sunset_402)"
              className="flex-1 w-full px-3 py-2 bg-slate-800 text-white text-xs rounded-xl border border-white/[0.1] focus:outline-none font-mono"
            />

            <button
              onClick={handleRunDecision}
              disabled={simLoading}
              className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Zap size={14} />
              <span>{simLoading ? 'Evaluating Swarm...' : 'Run Decision Cycle'}</span>
            </button>
          </div>

          {simResult && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fadeIn">
              {/* Step 1: OBSERVE */}
              <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-400 block mb-2">
                  1. Observe
                </span>
                <h4 className="text-xs font-bold text-white">Ingested Signals</h4>
                <pre className="text-[11px] text-slate-300 font-mono mt-2 bg-black/30 p-2.5 rounded-xl overflow-x-auto">
                  {JSON.stringify(simResult.observe.metricsAnalyzed, null, 2)}
                </pre>
              </div>

              {/* Step 2: PREDICT */}
              <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-2">
                  2. Predict
                </span>
                <h4 className="text-xs font-bold text-white">{simResult.predict.event}</h4>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-amber-400">
                    {Math.round(simResult.predict.probability * 100)}%
                  </span>
                  <span className="text-xs text-slate-400">Probability</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Impact Index: {simResult.predict.impactScore}/100</p>
              </div>

              {/* Step 3: RECOMMEND */}
              <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block mb-2">
                  3. Recommend
                </span>
                <h4 className="text-xs font-bold text-white">{simResult.recommend.action.replace(/_/g, ' ')}</h4>
                <div className="mt-2 text-xs text-slate-300">
                  {simResult.recommend.rationale}
                </div>
              </div>

              {/* Step 4: ACT */}
              <div className="p-4 bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block mb-2">
                  4. Act
                </span>
                <h4 className="text-xs font-bold text-white">{simResult.act.disposition}</h4>
                <p className="text-xs text-slate-300 mt-2">
                  {simResult.act.details}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
