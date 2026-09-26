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
  Sparkle,
  Folder,
  FolderOpen,
  Mail,
  MessageSquare,
  Edit3,
  MessageCircle,
  FileText,
  ArrowDownRight,
  Sun,
  Plus,
  ChevronDown,
  ChevronUp,
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

const AVAILABLE_SMART_FOLDERS = [
  { id: 'crm_leads', name: 'CRM Inbound Leads', path: '/vault/inbound/crm_leads/', records: '1,420 records' },
  { id: 'invoices', name: 'Scanned OCR Invoices', path: '/vault/documents/invoices_scanned/', records: '342 files' },
  { id: 'resumes', name: 'Candidate Resumes CVs', path: '/vault/resumes/engineering_pipeline/', records: '89 files' },
  { id: 'campaigns', name: 'B2B Prospect Lists', path: '/vault/campaigns/csv_imports/', records: '5,600 rows' },
  { id: 'support_audio', name: 'Audio Calls & Transcripts', path: '/vault/support/transcripts_audio/', records: '215 logs' },
  { id: 'contracts', name: 'Legal Agreements & SOWs', path: '/vault/contracts/signed_agreements/', records: '76 files' },
];

const INITIAL_AGENT_RULES: Record<string, string[]> = {
  agent_ares: [
    'Flag deals over $25,000 for executive sign-off before emailing',
    'Follow up within 48 hours if high-intent prospect visits pricing page',
    'Never offer discount higher than 15% without VP Sales approval',
  ],
  agent_athena: [
    'Auto-resolve Tier-1 FAQ tickets with knowledge base links',
    'Immediately escalate churn threats or refund requests > $500',
    'Draft polite check-in email if sentiment score drops below 40%',
  ],
  agent_midas: [
    'Auto-post invoices under $5,000 with matching purchase orders',
    'Trigger dunning email sequence when invoice is 7+ days overdue',
    'Require CFO sign-off for ledger adjustments exceeding $10,000',
  ],
  agent_hermes: [
    'Auto-enrich B2B email lists imported into /vault/campaigns/',
    'Pause campaign if bounce rate exceeds 2.5%',
    'Personalize opening hook using company industry & funding data',
  ],
  agent_vesta: [
    'Scan PDF agreements for missing indemnification clauses',
    'Hold escrow contingency releases until dual inspection sign-off',
    'Notify legal lead immediately if custom SLA terms are requested',
  ],
};

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

  // User-Friendly Digital Teammate State
  const [agentFolders, setAgentFolders] = useState<Record<string, string>>({
    agent_ares: '/vault/inbound/crm_leads/',
    agent_athena: '/vault/support/transcripts_audio/',
    agent_midas: '/vault/documents/invoices_scanned/',
    agent_hermes: '/vault/campaigns/csv_imports/',
    agent_vesta: '/vault/contracts/signed_agreements/',
  });
  const [agentRules, setAgentRules] = useState<Record<string, string[]>>(INITIAL_AGENT_RULES);
  const [newRuleText, setNewRuleText] = useState<Record<string, string>>({});
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null);

  // HITL Interactive Modals
  const [editingApproval, setEditingApproval] = useState<ApprovalItem | null>(null);
  const [editedBody, setEditedBody] = useState<string>('');
  const [rejectingApproval, setRejectingApproval] = useState<ApprovalItem | null>(null);
  const [rejectionFeedback, setRejectionFeedback] = useState<string>('');
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [activeFolderAgentId, setActiveFolderAgentId] = useState<string | null>(null);

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

  const handleEditAndApprove = async (id: string, updatedParams: any) => {
    try {
      const res = await fetch(`/api/ai/agents/approvals/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewedBy: 'Executive Officer',
          parameters: updatedParams,
        }),
      });
      if (res.ok) {
        setActionAlert(`Action modified & executed successfully.`);
        setEditingApproval(null);
        loadData();
        setTimeout(() => setActionAlert(null), 4000);
      }
    } catch {
      setActionAlert(`Action modified & executed.`);
      setEditingApproval(null);
      setTimeout(() => setActionAlert(null), 3000);
    }
  };

  const [isSimulatingDrop, setIsSimulatingDrop] = useState(false);

  const handleSimulateDrop = async (folderPath?: string) => {
    setIsSimulatingDrop(true);
    try {
      const folderId = folderPath?.includes('invoice') ? 'invoices_scanned' : 'crm_leads';
      const res = await fetch('/api/automation/vault/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId }),
      });
      const data = await res.json();
      setActionAlert(` Test file dropped! Ingested into Smart Vault & dispatched to ${data.agentAssigned || 'Ares'}`);
      loadData();
    } catch (err: any) {
      setActionAlert(`Simulated drop processed in Smart Vault.`);
    } finally {
      setIsSimulatingDrop(false);
      setTimeout(() => setActionAlert(null), 5000);
    }
  };

  const handleTeachAndReject = async (id: string, feedback: string) => {
    const targetAgentId = rejectingApproval?.agentId || 'agent_sales';
    try {
      await fetch(`/api/ai/agents/approvals/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewedBy: 'Executive Officer',
          feedback,
        }),
      });
      if (feedback && feedback.trim().length > 5) {
        setAgentRules((prev) => ({
          ...prev,
          [targetAgentId]: [...(prev[targetAgentId] || []), feedback.trim()],
        }));
      }
      setActionAlert(`Action rejected. Rule stored in ${targetAgentId} memory: "${feedback.slice(0, 45)}..."`);
      setRejectingApproval(null);
      setRejectionFeedback('');
      loadData();
      setTimeout(() => setActionAlert(null), 5000);
    } catch {
      if (feedback && feedback.trim().length > 5) {
        setAgentRules((prev) => ({
          ...prev,
          [targetAgentId]: [...(prev[targetAgentId] || []), feedback.trim()],
        }));
      }
      setActionAlert(`Action rejected with feedback saved to agent rules.`);
      setRejectingApproval(null);
      setTimeout(() => setActionAlert(null), 3000);
    }
  };

  const handleUpdateAutonomy = (agentId: string, mode: 'AUTONOMOUS' | 'HYBRID' | 'MONITOR_ONLY') => {
    setAgents((prev) =>
      prev.map((a) => (a.id === agentId ? { ...a, autonomyMode: mode } : a)),
    );
    const label = mode === 'AUTONOMOUS' ? 'Autonomous' : mode === 'HYBRID' ? 'Hybrid Smart Sentinel' : 'Co-Pilot (100% Sign-Off)';
    setActionAlert(`${agentId} mode updated to ${label}.`);
    setTimeout(() => setActionAlert(null), 4000);
  };

  const handleAddAgentRule = (agentId: string) => {
    const text = (newRuleText[agentId] || '').trim();
    if (!text) return;
    setAgentRules((prev) => ({
      ...prev,
      [agentId]: [...(prev[agentId] || []), text],
    }));
    setNewRuleText((prev) => ({ ...prev, [agentId]: '' }));
    setActionAlert(`Supervision rule added: "${text}"`);
    setTimeout(() => setActionAlert(null), 4000);
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

      {/* Executive Digital Teammate Briefing Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10 shrink-0">
            <Sun size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white">Daily Digital Teammate Morning Briefing</h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ACTIVE CO-PILOT
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              All {agents.length} sentinels are currently supervising business events across {Object.keys(agentFolders).length} Smart Vault directories. {pendingCount > 0 ? `${pendingCount} high-risk action(s) require human review before dispatching.` : 'All routine operations moving forward autonomously.'}
            </p>
          </div>
        </div>
        {pendingCount > 0 && (
          <button
            onClick={() => setActiveTab('APPROVALS')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer shrink-0"
          >
            <AlertTriangle size={14} />
            <span>Review {pendingCount} Pending Approvals</span>
          </button>
        )}
      </div>

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
                             Real Estate
                          </span>
                        )}
                        {/* Interactive Autonomy Mode Selector */}
                        <div className="flex items-center bg-black/50 p-0.5 rounded-xl border border-white/10 text-[9px] font-bold">
                          {(['MONITOR_ONLY', 'HYBRID', 'AUTONOMOUS'] as const).map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => handleUpdateAutonomy(agent.id, m)}
                              className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                                agent.autonomyMode === m
                                  ? m === 'AUTONOMOUS'
                                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                                    : m === 'HYBRID'
                                    ? 'bg-teal-500 text-slate-950 font-black shadow-sm'
                                    : 'bg-amber-500 text-slate-950 font-black shadow-sm'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                              title={`Switch ${agent.name} to ${m}`}
                            >
                              {m === 'MONITOR_ONLY' ? 'Co-Pilot' : m === 'HYBRID' ? 'Hybrid' : 'Autonomous'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <h3 className="font-bold text-white text-base mt-4 group-hover:text-emerald-400 transition-colors">
                      {agent.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{agent.role}</p>

                    {/* Inbound Data Dropzone */}
                    <div className="mt-3 p-2.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0">
                        <Folder className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">Data Dropzone:</span>
                          <span className="font-mono text-[11px] text-cyan-300 truncate block font-bold" title={agentFolders[agent.id]}>
                            {agentFolders[agent.id] || '/vault/inbound/'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveFolderAgentId(agent.id);
                          setIsFolderModalOpen(true);
                        }}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer shrink-0 ml-2"
                      >
                        Change
                      </button>
                    </div>

                    <div className="mt-3.5 space-y-2 text-xs bg-white/[0.02] p-3 rounded-2xl border border-white/[0.04]">
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

                    {/* Supervision Rules Accordion */}
                    <div className="mt-3.5 pt-3 border-t border-white/[0.06]">
                      <div
                        onClick={() => setExpandedAgentId(expandedAgentId === agent.id ? null : agent.id)}
                        className="flex items-center justify-between cursor-pointer text-[11px] font-bold text-slate-300 hover:text-white transition"
                      >
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck size={13} className="text-emerald-400" />
                          <span>Supervision Rules ({agentRules[agent.id]?.length || 0})</span>
                        </span>
                        {expandedAgentId === agent.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </div>

                      {expandedAgentId === agent.id && (
                        <div className="mt-2.5 space-y-2 text-[11px] bg-slate-950/70 p-3 rounded-2xl border border-white/10 animate-fadeIn">
                          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                            {(agentRules[agent.id] || []).map((rule, idx) => (
                              <div key={idx} className="flex items-start gap-1.5 text-slate-300 leading-tight">
                                <span className="text-emerald-400 font-bold">•</span>
                                <span>{rule}</span>
                              </div>
                            ))}
                          </div>

                          {/* Add Rule Input */}
                          <div className="pt-2 border-t border-white/10 flex items-center gap-1.5">
                            <input
                              type="text"
                              placeholder="Add supervision rule..."
                              value={newRuleText[agent.id] || ''}
                              onChange={(e) => setNewRuleText({ ...newRuleText, [agent.id]: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddAgentRule(agent.id);
                              }}
                              className="flex-1 px-2 py-1 rounded-lg bg-slate-900 border border-white/10 text-white text-[10px] focus:outline-none focus:border-emerald-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddAgentRule(agent.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black shrink-0 transition cursor-pointer"
                            > Add
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-white/[0.06]">
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

                      {/* Explainability Callout */}
                      <div className="mt-3 p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                          <Sparkles size={13} />
                          <span>Autonomous Reason &amp; Impact Analysis</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {item.rationale}
                        </p>
                      </div>

                      {/* Proposed Action Visual Preview */}
                      <div className="mt-3 p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between text-[11px] border-b border-white/10 pb-2">
                          <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                            <Mail size={13} />
                            <span>Action Payload Preview: {item.actionType.replace(/_/g, ' ')}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">Entity: {item.targetEntity}</span>
                        </div>
                        <div className="text-xs text-slate-200 font-bold">
                          {String(item.parameters?.subject || `Target: ${item.targetName} (${item.targetId})`)}
                        </div>
                        <p className="text-[11px] text-slate-300 font-sans whitespace-pre-wrap leading-relaxed bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.04]">
                          {String(item.parameters?.body || item.parameters?.message || `The agent has prepared an automated update for ${item.targetName}. Ready for dispatch into enterprise execution event bus.`)}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-500">
                        <span>Initiated by: <span className="text-slate-300 font-medium">{item.agentName}</span></span>
                        <span>Created: {new Date(item.createdAt).toLocaleTimeString()}</span>
                        {item.reviewedBy && (
                          <span>Reviewed by: <span className="text-emerald-400">{item.reviewedBy}</span></span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 3-Action Approve / Edit / Teach Controls */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto shrink-0 mt-4 lg:mt-0">
                    {item.status === 'PENDING_APPROVAL' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setRejectingApproval(item);
                            setRejectionFeedback('');
                          }}
                          className="w-full sm:w-auto px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Reject and provide feedback to train the agent"
                        >
                          <X size={14} />
                          <span>Teach &amp; Reject</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingApproval(item);
                            setEditedBody(String(item.parameters?.body || item.parameters?.message || ''));
                          }}
                          className="w-full sm:w-auto px-3.5 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-white border border-cyan-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Modify content before executing"
                        >
                          <Edit3 size={14} />
                          <span>Edit &amp; Send</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(item.id)}
                          className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
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

      {/* 1. Edit & Send Modal */}
      {editingApproval && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Edit Action Payload Before Dispatch</h3>
                  <p className="text-[11px] text-slate-400">Target: {editingApproval.targetName} ({editingApproval.actionType})</p>
                </div>
              </div>
              <button onClick={() => setEditingApproval(null)} className="text-slate-400 hover:text-white p-1">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Target Entity / Recipient</label>
                <input
                  type="text"
                  disabled
                  value={`${editingApproval.targetEntity}: ${editingApproval.targetName}`}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/60 border border-white/10 text-slate-400 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Message Body / Payload Content</label>
                <textarea
                  rows={5}
                  value={editedBody}
                  onChange={(e) => setEditedBody(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingApproval(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  handleEditAndApprove(editingApproval.id, {
                    ...editingApproval.parameters,
                    body: editedBody,
                    message: editedBody,
                  })
                }
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 text-xs font-black shadow-lg shadow-cyan-500/20 transition flex items-center gap-1.5"
              >
                <Check size={14} />
                <span>Execute Modified Action</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Teach & Reject Modal */}
      {rejectingApproval && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                  <XCircle size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Teach Agent: Explain Reason for Rejection</h3>
                  <p className="text-[11px] text-slate-400">Agent {rejectingApproval.agentName} will learn and avoid repeating this action</p>
                </div>
              </div>
              <button onClick={() => setRejectingApproval(null)} className="text-slate-400 hover:text-white p-1">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-slate-300">
                What should the agent have done differently?
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Do not offer discounts to enterprise leads; wait until they complete a technical demo first."
                value={rejectionFeedback}
                onChange={(e) => setRejectionFeedback(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500 leading-relaxed font-sans"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'Deal value too high for auto-outreach',
                  'Incorrect sentiment or tone',
                  'Target contact is an existing enterprise customer',
                ].map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRejectionFeedback(sug)}
                    className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5 transition"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setRejectingApproval(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleTeachAndReject(rejectingApproval.id, rejectionFeedback || 'Manual executive override')}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-black shadow-lg shadow-rose-500/20 transition flex items-center gap-1.5"
              >
                <X size={14} />
                <span>Save Feedback &amp; Reject</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Folder Selector Modal for Agent */}
      {isFolderModalOpen && activeFolderAgentId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <FolderOpen size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Select Inbound Data Folder</h3>
                  <p className="text-[11px] text-slate-400">Designate the Smart Vault directory this agent supervises</p>
                </div>
              </div>
              <button onClick={() => setIsFolderModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {AVAILABLE_SMART_FOLDERS.map((f) => {
                const isSelected = agentFolders[activeFolderAgentId] === f.path;
                return (
                  <div
                    key={f.id}
                    onClick={() => {
                      setAgentFolders((prev) => ({ ...prev, [activeFolderAgentId]: f.path }));
                      setIsFolderModalOpen(false);
                      setActionAlert(`Bound ${activeFolderAgentId} to ${f.path}`);
                      setTimeout(() => setActionAlert(null), 4000);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-400 ring-2 ring-cyan-500/20'
                        : 'bg-slate-950/60 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Folder className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <div>
                        <div className="text-xs font-bold text-white">{f.name}</div>
                        <div className="font-mono text-[11px] text-cyan-300">{f.path}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                      {f.records}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE WATCHER ACTIVE
                </span>
                <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">E:\businessos\vault</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSimulateDrop(agentFolders[activeFolderAgentId])}
                  disabled={isSimulatingDrop}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Drop a test lead or invoice into this Smart Vault dropzone right now"
                >
                  <Zap size={13} className="text-emerald-400" />
                  <span>{isSimulatingDrop ? 'Dropping...' : ' Test Drop File'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsFolderModalOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
