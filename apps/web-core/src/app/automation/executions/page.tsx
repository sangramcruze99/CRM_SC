'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Activity,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Filter,
  Search,
  ChevronRight,
  RefreshCw,
  Cpu,
  Layers,
  Terminal,
  Zap,
  ShieldAlert,
  ArrowRight,
  FileText,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Inbox,
  AlertTriangle,
  UserCheck,
  Send,
  Database,
  FileCheck,
} from 'lucide-react';
import {
  UniversalExecutionStatus,
  AgentExecutionResult,
  AgentActionRecord,
  AgentOutputRecord,
} from '@repo/core-types';

interface UnifiedExecution {
  id: string;
  source: 'WORKFLOW' | 'AGENT';
  title: string;
  agentName?: string;
  agentId?: string;
  domain?: string;
  workflowId?: string;
  status: UniversalExecutionStatus;
  outcomeCode: string;
  outcomeSummary: string;
  decisionReason?: string;
  nextStep?: string;
  startedAt: string;
  completedAt?: string;
  durationMs: number;
  tokensUsed: number;
  aiModel?: string;
  error?: string;
  triggerType: string;
  targetEntityType?: string;
  targetId?: string;
  actions: AgentActionRecord[];
  outputs: AgentOutputRecord[];
  rawResult?: AgentExecutionResult;
  rawSteps?: any[];
}

export default function ExecutionsPage() {
  const [executions, setExecutions] = useState<UnifiedExecution[]>([]);
  const [selectedExec, setSelectedExec] = useState<UnifiedExecution | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTION_REQUIRED' | 'REVIEW' | 'COMPLETED' | 'FAILED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchAllExecutions = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch workflow executions from Automation engine
      const wfPromise = fetch('/api/automation/executions/all')
        .then((res) => (res.ok ? res.json() : []))
        .catch(() => []);

      // 2. Fetch AI agent executions from AI Orchestrator
      const agentPromise = fetch('/api/ai/orchestrator/executions')
        .then((res) => (res.ok ? res.json() : []))
        .catch(() => []);

      const [wfData, agentData] = await Promise.all([wfPromise, agentPromise]);

      const unified: UnifiedExecution[] = [];

      // Process Workflow Executions
      if (Array.isArray(wfData)) {
        wfData.forEach((w: any) => {
          let execResult: AgentExecutionResult | null = null;
          if (w.executionResult) {
            execResult = w.executionResult;
          } else if (w.outputData) {
            try {
              const parsed = JSON.parse(w.outputData);
              execResult = parsed._result || parsed.executionResult || null;
            } catch {}
          }

          let actions: AgentActionRecord[] = execResult?.actions || [];
          let outputs: AgentOutputRecord[] = execResult?.outputs || [];

          // Map legacy workflow steps if actions were empty
          if (actions.length === 0 && Array.isArray(w.steps)) {
            actions = w.steps.map((s: any, idx: number) => ({
              actionId: s.id || `step_${idx}`,
              actionType: s.nodeType || 'step',
              toolName: s.nodeTitle || s.nodeType,
              targetService: 'automation',
              targetEntityType: 'WORKFLOW',
              targetEntityId: w.workflowId,
              status: s.status === 'SUCCESS' ? 'SUCCESS' : s.status === 'FAILED' ? 'FAILED' : 'QUEUED',
              startedAt: s.createdAt || w.startedAt,
              durationMs: s.durationMs || 0,
              error: s.error,
            }));
          }

          const status: UniversalExecutionStatus =
            w.status === 'SUCCESS' ? 'SUCCESS' :
            w.status === 'FAILED' ? 'FAILED' :
            w.status === 'APPROVAL_REQUIRED' || w.status === 'WAITING_APPROVAL' ? 'WAITING_APPROVAL' :
            w.status === 'RUNNING' ? 'PROCESSING' : 'PROCESSING';

          unified.push({
            id: w.id,
            source: 'WORKFLOW',
            title: w.workflow?.title || w.workflowId || 'Workflow Execution',
            workflowId: w.workflowId,
            status,
            outcomeCode: execResult?.outcome.code || (status === 'SUCCESS' ? 'WORKFLOW_COMPLETED' : status),
            outcomeSummary: execResult?.outcome.summary || (status === 'SUCCESS' ? 'Workflow executed successfully.' : w.error || 'Workflow execution completed.'),
            decisionReason: execResult?.decision?.reason,
            nextStep: execResult?.outcome.nextStep || 'Workflow execution complete.',
            startedAt: w.startedAt || w.createdAt,
            completedAt: w.completedAt,
            durationMs: w.durationMs || 0,
            tokensUsed: w.tokensUsed || 0,
            aiModel: 'Workflow DAG Engine',
            error: w.error,
            triggerType: w.triggerType || 'STUDIO_TRIGGER',
            actions,
            outputs,
            rawResult: execResult || undefined,
            rawSteps: w.steps,
          });
        });
      }

      // Process Autonomous AI Agent Executions
      if (Array.isArray(agentData)) {
        agentData.forEach((a: any) => {
          const res: AgentExecutionResult | null = a.parsedResult || null;
          const status = (a.status as UniversalExecutionStatus) || 'SUCCESS';

          unified.push({
            id: a.id,
            source: 'AGENT',
            title: `${a.agent?.name || a.agentId}: ${a.outcomeSummary || a.triggerEvent}`,
            agentName: a.agent?.name || a.agentId,
            agentId: a.agentId,
            domain: a.agent?.domain,
            status,
            outcomeCode: a.outcomeCode || res?.outcome.code || 'AGENT_COMPLETED',
            outcomeSummary: a.outcomeSummary || res?.outcome.summary || 'Agent operations executed autonomously.',
            decisionReason: a.decisionReason || res?.decision?.reason,
            nextStep: res?.outcome.nextStep || (status === 'WAITING_APPROVAL' ? 'Review in AI Approval Center' : 'Follow up complete.'),
            startedAt: a.createdAt,
            completedAt: a.completedAt,
            durationMs: a.latencyMs || 0,
            tokensUsed: a.tokensUsed || 0,
            aiModel: res?.processing?.model || 'hybrid/multi-engine',
            error: res?.error,
            triggerType: a.triggerEvent || 'BUSINESS_EVENT',
            targetEntityType: a.targetEntityType,
            targetId: a.targetId,
            actions: a.actions || res?.actions || [],
            outputs: a.outputs || res?.outputs || [],
            rawResult: res || undefined,
          });
        });
      }

      // Sort newest first
      unified.sort((x, y) => new Date(y.startedAt).getTime() - new Date(x.startedAt).getTime());
      setExecutions(unified);
      if (unified.length > 0 && !selectedExec) {
        setSelectedExec(unified[0]);
      }
    } catch (err) {
      console.error('Failed to fetch execution records', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllExecutions();
  }, []);

  // Filter based on Tab + Search Query
  const filteredExecutions = useMemo(() => {
    return executions.filter((exec) => {
      // Tab matching
      let matchesTab = true;
      if (activeTab === 'ACTION_REQUIRED') {
        matchesTab = exec.status === 'WAITING_APPROVAL' || exec.status === 'NEEDS_REVIEW' || exec.status === 'ESCALATED';
      } else if (activeTab === 'REVIEW') {
        matchesTab = exec.status === 'NEEDS_REVIEW' || exec.status === 'ESCALATED' || Boolean(exec.rawResult?.humanReview?.required);
      } else if (activeTab === 'COMPLETED') {
        matchesTab = exec.status === 'SUCCESS' || exec.status === 'NO_ACTION_REQUIRED';
      } else if (activeTab === 'FAILED') {
        matchesTab = exec.status === 'FAILED' || exec.status === 'BLOCKED';
      }

      // Search matching
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        exec.title.toLowerCase().includes(query) ||
        exec.id.toLowerCase().includes(query) ||
        exec.outcomeSummary.toLowerCase().includes(query) ||
        exec.outcomeCode.toLowerCase().includes(query) ||
        (exec.agentName && exec.agentName.toLowerCase().includes(query)) ||
        (exec.targetEntityType && exec.targetEntityType.toLowerCase().includes(query)) ||
        (exec.targetId && exec.targetId.toLowerCase().includes(query));

      return matchesTab && matchesSearch;
    });
  }, [executions, activeTab, searchQuery]);

  // Handle retry
  const handleRetryExecution = async (exec: UnifiedExecution) => {
    setIsRetrying(true);
    try {
      if (exec.source === 'WORKFLOW') {
        await fetch(`/api/automation/executions/${exec.id}/retry`, { method: 'POST' });
      } else {
        await fetch('/api/ai/orchestrator/trigger-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: exec.triggerType,
            payload: { id: exec.targetId, targetEntity: exec.targetEntityType },
          }),
        });
      }
      await fetchAllExecutions();
    } catch (err) {
      console.error('Retry failed', err);
    } finally {
      setIsRetrying(false);
    }
  };

  // Handle Approval quick action
  const handleQuickApprove = async (approvalId: string) => {
    setApprovingId(approvalId);
    try {
      await fetch(`/api/ai/orchestrator/approvals/${approvalId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewerId: 'current-user' }),
      });
      await fetchAllExecutions();
    } catch (err) {
      console.error('Approval failed', err);
    } finally {
      setApprovingId(null);
    }
  };

  // Human-Friendly Status Badges
  const renderStatusBadge = (status: UniversalExecutionStatus) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            COMPLETED
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            FAILED
          </span>
        );
      case 'WAITING_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            ACTION REQUIRED
          </span>
        );
      case 'NEEDS_REVIEW':
      case 'ESCALATED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-300 border border-orange-500/30">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
            REVIEW
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            PROCESSING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-300 border border-slate-500/30">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white font-sans">
      {/* Top Header Cockpit Chassis */}
      <div className="botanical-glass-card rounded-3xl p-6 md:p-8 border border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/[0.06] text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-bold tracking-wider uppercase">Reasoning Swarm Bus Active</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">Universal Contract Telemetry</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[11px]">
              engine/executions/universal_ledger/
            </span>
            <span className="text-zinc-500">|</span>
            <span className="text-emerald-400 font-semibold">Audit Trail: Verified</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                UNIVERSAL EXECUTION GRAPH
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
                HITL SAFETY GATE ACTIVE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Activity className="text-emerald-400" size={30} />
              AI & Automation Result Center
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 max-w-3xl leading-relaxed">
              Consistent tracking from trigger to decision, business entity update, and immutable audit trail across all autonomous workflows and AI agents.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={fetchAllExecutions}
              disabled={isLoading}
              className="px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white rounded-xl text-xs font-mono font-semibold border border-white/[0.08] transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-zinc-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span>REFRESH</span>
            </button>

            <Link
              href="/automation/approvals"
              className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold transition-all shadow-md flex items-center gap-2"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>SAFETY GATE APPROVALS</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Needs Attention / Inbox Tabs */}
      <div className="botanical-glass-card flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl border border-white/[0.08]">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-white/[0.03] rounded-xl border border-white/[0.06]">
          {[
            { id: 'ALL', label: 'All Results', count: executions.length },
            { id: 'ACTION_REQUIRED', label: 'Action Required', count: executions.filter(e => e.status === 'WAITING_APPROVAL').length, color: 'text-amber-400' },
            { id: 'REVIEW', label: 'Review', count: executions.filter(e => e.status === 'NEEDS_REVIEW' || e.status === 'ESCALATED').length, color: 'text-orange-400' },
            { id: 'COMPLETED', label: 'Completed', count: executions.filter(e => e.status === 'SUCCESS' || e.status === 'NO_ACTION_REQUIRED').length, color: 'text-emerald-400' },
            { id: 'FAILED', label: 'Failed', count: executions.filter(e => e.status === 'FAILED').length, color: 'text-rose-400' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${isActive ? 'bg-zinc-950/30 text-zinc-950 font-bold' : tab.color || 'text-zinc-400'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by entity, agent, summary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* Main Split: Execution Feed on Left, Human-Friendly Result Detail on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Execution Feed */}
        <div className="lg:col-span-5 botanical-glass-card rounded-2xl border border-white/[0.08] overflow-hidden flex flex-col max-h-[750px]">
          <div className="p-3.5 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
            <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
              Executions ({filteredExecutions.length})
            </span>
            <span className="text-[11px] font-mono text-zinc-500">Select to inspect</span>
          </div>

          <div className="divide-y divide-white/[0.05] overflow-y-auto flex-1">
            {filteredExecutions.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 text-xs font-mono">
                No executions found for this view
              </div>
            ) : (
              filteredExecutions.map((exec) => {
                const isSelected = selectedExec?.id === exec.id;
                return (
                  <div
                    key={exec.id}
                    onClick={() => setSelectedExec(exec)}
                    className={`p-4 flex items-start justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-500/10 border-l-4 border-emerald-400'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0 pr-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white truncate max-w-[220px]">
                          {exec.agentName || exec.title}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-zinc-400">
                          {exec.source}
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {exec.outcomeSummary}
                      </p>

                      <div className="flex items-center gap-3 text-[10px] text-zinc-500 pt-1 font-mono">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {new Date(exec.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>•</span>
                        <span>{exec.actions.length} action(s)</span>
                        <span>•</span>
                        <span>{exec.durationMs}ms</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-2">
                      {renderStatusBadge(exec.status)}
                      <ChevronRight className={`w-4 h-4 transition ${isSelected ? 'text-emerald-400' : 'text-zinc-600'}`} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Human-Friendly Universal Result Detail Inspector */}
        <div className="lg:col-span-7 botanical-glass-card rounded-2xl border border-white/[0.08] p-6 space-y-6 overflow-y-auto max-h-[750px] relative">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          {selectedExec ? (
            <>
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/[0.06] pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                      {selectedExec.source === 'AGENT' ? 'AI Domain Agent Result' : 'Workflow Graph Result'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">ID: {selectedExec.id}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">
                    {selectedExec.agentName ? `${selectedExec.agentName}` : selectedExec.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    Outcome Code: <span className="text-emerald-400 font-semibold">{selectedExec.outcomeCode}</span>
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {renderStatusBadge(selectedExec.status)}
                  <button
                    onClick={() => handleRetryExecution(selectedExec)}
                    disabled={isRetrying}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 text-xs font-medium transition"
                  >
                    <RotateCcw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
                    <span>{isRetrying ? 'Retrying...' : 'Re-run'}</span>
                  </button>
                </div>
              </div>

              {/* Human Review Required Banner (Safety Gate) */}
              {selectedExec.status === 'WAITING_APPROVAL' && (
                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
                    <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>Human Approval Required</span>
                  </div>
                  <p className="text-xs text-amber-200/90 leading-relaxed">
                    {selectedExec.decisionReason || selectedExec.outcomeSummary}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-amber-500/20">
                    <span className="text-[11px] text-amber-400 font-medium">
                      Action paused to satisfy Human-in-the-Loop policy gate.
                    </span>
                    {selectedExec.rawResult?.humanReview?.approvalRequestId ? (
                      <button
                        onClick={() => handleQuickApprove(selectedExec.rawResult!.humanReview!.approvalRequestId!)}
                        disabled={approvingId === selectedExec.rawResult.humanReview.approvalRequestId}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-mono font-bold transition shadow-sm"
                      >
                        {approvingId === selectedExec.rawResult.humanReview.approvalRequestId ? 'Approving...' : 'Approve Action'}
                      </button>
                    ) : (
                      <Link
                        href="/automation/approvals"
                        className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-mono font-bold transition"
                      >
                        Open in Approvals Center
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* 1. What Happened? (Result Summary) */}
              <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  What Happened?
                </span>
                <p className="text-sm font-medium text-white leading-relaxed">
                  {selectedExec.outcomeSummary}
                </p>
              </div>

              {/* 2. What Triggered This? (Input Context) */}
              <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  What Triggered This?
                </span>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div>
                    <span className="text-zinc-500">Trigger Event:</span>{' '}
                    <span className="text-emerald-400 font-semibold">{selectedExec.triggerType}</span>
                  </div>
                  {selectedExec.targetEntityType && (
                    <div>
                      <span className="text-zinc-500">Target Entity:</span>{' '}
                      <span className="font-semibold text-white">
                        {selectedExec.targetEntityType} #{selectedExec.targetId}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. AI Decision Rationale */}
              {selectedExec.decisionReason && (
                <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    AI Decision & Rationale
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                    {selectedExec.decisionReason}
                  </p>
                </div>
              )}

              {/* 4. Actions Taken */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Actions Taken ({selectedExec.actions.length})
                </span>
                {selectedExec.actions.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic font-mono">No external actions were required for this run.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedExec.actions.map((act, idx) => (
                      <div
                        key={act.actionId || idx}
                        className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold">
                            ✓
                          </span>
                          <div>
                            <span className="text-xs font-semibold text-white block">
                              {act.toolName || act.actionType}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              {act.targetService} • {act.targetEntityType}:{act.targetEntityId}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {act.durationMs !== undefined && (
                            <span className="text-[10px] font-mono text-zinc-500">{act.durationMs}ms</span>
                          )}
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {act.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Outputs Produced */}
              {selectedExec.outputs.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    Outputs Produced ({selectedExec.outputs.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedExec.outputs.map((out, idx) => (
                      <div
                        key={out.outputId || idx}
                        className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white truncate">{out.title}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-emerald-400 border border-white/[0.06]">
                            {out.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-2">{out.summary}</p>
                        {out.documentId && (
                          <Link
                            href={`/documents?id=${out.documentId}`}
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline pt-1 font-mono"
                          >
                            <span>Open in Document Vault</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. What Happens Next? */}
              <div className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                  What Happens Next?
                </span>
                <p className="text-xs text-zinc-300 font-medium">
                  {selectedExec.nextStep}
                </p>
              </div>

              {/* Advanced Technical Details Collapsible (For Admins / Engineers) */}
              <div className="border-t border-white/[0.08] pt-4">
                <button
                  onClick={() => setShowAdvanced((prev) => !prev)}
                  className="flex items-center justify-between w-full text-xs font-mono text-zinc-400 hover:text-white transition"
                >
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    Advanced Execution Trace & System Metrics
                  </span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAdvanced && (
                  <div className="mt-4 space-y-4 animate-in fade-in duration-150">
                    <div className="grid grid-cols-4 gap-2 text-center p-3 rounded-xl bg-black/40 border border-white/[0.06] text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase block">Model</span>
                        <span className="text-white font-semibold">{selectedExec.aiModel || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase block">Duration</span>
                        <span className="text-white font-semibold">{selectedExec.durationMs}ms</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase block">Tokens</span>
                        <span className="text-white font-semibold">{selectedExec.tokensUsed || 0}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase block">Actions</span>
                        <span className="text-white font-semibold">{selectedExec.actions.length}</span>
                      </div>
                    </div>

                    {selectedExec.rawSteps && selectedExec.rawSteps.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-zinc-400 block font-mono">
                          Raw DAG Node Execution Logs
                        </span>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {selectedExec.rawSteps.map((step: any, idx: number) => (
                            <div key={idx} className="p-2 rounded bg-black/50 font-mono text-[10px] text-zinc-300 border border-white/[0.06] flex items-center justify-between">
                              <span>[{step.stepIndex || idx}] {step.nodeTitle || step.nodeType}</span>
                              <span className="text-emerald-400">{step.status} ({step.durationMs || 0}ms)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-16 text-center text-zinc-500 text-xs font-mono">
              Select an execution from the feed to view the complete result breakdown
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

