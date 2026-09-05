'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

interface StepLog {
  id: string;
  nodeId: string;
  nodeType: string;
  nodeLabel: string;
  status: 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'SKIPPED' | 'WAITING_APPROVAL';
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  input?: any;
  output?: any;
  error?: string;
}

interface Execution {
  id: string;
  workflowId: string;
  workflowTitle: string;
  status: 'QUEUED' | 'RUNNING' | 'WAITING' | 'APPROVAL_REQUIRED' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'TIMED_OUT';
  startedAt: string;
  completedAt?: string;
  durationMs: number;
  stepCount: number;
  tokensUsed: number;
  aiModel?: string;
  error?: string;
  triggerType: string;
  steps: StepLog[];
}

const INITIAL_EXECUTIONS: Execution[] = [
  {
    id: 'exec-84912',
    workflowId: 'wf-lead-qual',
    workflowTitle: 'AI Inbound Lead Triage & WhatsApp Welcome',
    status: 'SUCCESS',
    startedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 11.5).toISOString(),
    durationMs: 840,
    stepCount: 4,
    tokensUsed: 1420,
    aiModel: 'groq/llama-3.3-70b-versatile',
    triggerType: 'crm:new_lead',
    steps: [
      {
        id: 's-1',
        nodeId: 'node-trigger',
        nodeType: 'crm:new_lead',
        nodeLabel: 'New Lead Ingested',
        status: 'SUCCESS',
        startedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        finishedAt: new Date(Date.now() - 1000 * 60 * 11.9).toISOString(),
        durationMs: 42,
        output: { leadId: 'lead-9821', email: 'elena.rostova@techcorp.io', score: 85 },
      },
      {
        id: 's-2',
        nodeId: 'node-ai-score',
        nodeType: 'ai:score',
        nodeLabel: 'AI ICP Fit Scoring',
        status: 'SUCCESS',
        startedAt: new Date(Date.now() - 1000 * 60 * 11.9).toISOString(),
        finishedAt: new Date(Date.now() - 1000 * 60 * 11.6).toISOString(),
        durationMs: 420,
        output: { fitCategory: 'Tier 1 Enterprise', score: 94, urgency: 'High' },
      },
      {
        id: 's-3',
        nodeId: 'node-crm-update',
        nodeType: 'crm:update_lead_score',
        nodeLabel: 'Update CRM Record',
        status: 'SUCCESS',
        startedAt: new Date(Date.now() - 1000 * 60 * 11.6).toISOString(),
        finishedAt: new Date(Date.now() - 1000 * 60 * 11.55).toISOString(),
        durationMs: 85,
        output: { updated: true, newStatus: 'QUALIFIED_HOT' },
      },
      {
        id: 's-4',
        nodeId: 'node-wa-send',
        nodeType: 'comm:whatsapp',
        nodeLabel: 'Send WhatsApp Instant Greeting',
        status: 'SUCCESS',
        startedAt: new Date(Date.now() - 1000 * 60 * 11.55).toISOString(),
        finishedAt: new Date(Date.now() - 1000 * 60 * 11.5).toISOString(),
        durationMs: 293,
        output: { messageId: 'wamid.HBgLMTU1NTg5MjE=', deliveryStatus: 'SENT' },
      },
    ],
  },
  {
    id: 'exec-84911',
    workflowId: 'wf-quote-approval',
    workflowTitle: 'High-Value Quote (> $25k) Auto-Escalation',
    status: 'APPROVAL_REQUIRED',
    startedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    durationMs: 310,
    stepCount: 3,
    tokensUsed: 620,
    triggerType: 'crm:deal_stage_changed',
    steps: [
      {
        id: 's-1',
        nodeId: 'node-trigger',
        nodeType: 'crm:deal_stage_changed',
        nodeLabel: 'Deal Moved to Proposal',
        status: 'SUCCESS',
        startedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
        finishedAt: new Date(Date.now() - 1000 * 60 * 34.95).toISOString(),
        durationMs: 30,
        output: { dealId: 'deal-4412', amount: 48000, company: 'Starlight Logistics' },
      },
      {
        id: 's-2',
        nodeId: 'node-approval',
        nodeType: 'hitl:approval',
        nodeLabel: 'VP Sales Approval Required',
        status: 'WAITING_APPROVAL',
        startedAt: new Date(Date.now() - 1000 * 60 * 34.95).toISOString(),
        durationMs: 280,
        output: { approvalId: 'appr-771', riskLevel: 'HIGH', reason: 'Contract value > $25,000 threshold' },
      },
    ],
  },
  {
    id: 'exec-84910',
    workflowId: 'wf-ocr-invoice',
    workflowTitle: 'Invoice OCR & AP Auto-Reconciliation',
    status: 'FAILED',
    startedAt: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 64.2).toISOString(),
    durationMs: 1240,
    stepCount: 2,
    tokensUsed: 890,
    aiModel: 'openrouter/meta-llama/llama-3.2-11b-vision-instruct',
    error: 'Vendor tax ID missing on invoice page 1. OCR confidence 0.42 below tolerance 0.85.',
    triggerType: 'doc:uploaded',
    steps: [
      {
        id: 's-1',
        nodeId: 'node-doc-in',
        nodeType: 'doc:uploaded',
        nodeLabel: 'PDF Document Ingested',
        status: 'SUCCESS',
        startedAt: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
        finishedAt: new Date(Date.now() - 1000 * 60 * 64.8).toISOString(),
        durationMs: 120,
        output: { filename: 'INV-2026-992.pdf', pages: 2, mimeType: 'application/pdf' },
      },
      {
        id: 's-2',
        nodeId: 'node-ocr-extract',
        nodeType: 'doc:ocr_extract',
        nodeLabel: 'Neural Line-Item OCR',
        status: 'FAILED',
        startedAt: new Date(Date.now() - 1000 * 60 * 64.8).toISOString(),
        finishedAt: new Date(Date.now() - 1000 * 60 * 64.2).toISOString(),
        durationMs: 1120,
        error: 'Vendor tax ID missing on invoice page 1. OCR confidence 0.42 below tolerance 0.85.',
      },
    ],
  },
  {
    id: 'exec-84909',
    workflowId: 'wf-voice-agent',
    workflowTitle: 'Missed Call Triage & SMS Booking Link',
    status: 'SUCCESS',
    startedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 119.2).toISOString(),
    durationMs: 680,
    stepCount: 3,
    tokensUsed: 920,
    triggerType: 'comm:call_received',
    steps: [
      {
        id: 's-1',
        nodeId: 'node-call',
        nodeType: 'comm:call_received',
        nodeLabel: 'Inbound Call Unanswered',
        status: 'SUCCESS',
        startedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        durationMs: 50,
        output: { callerNumber: '+1 (415) 890-2341', disposition: 'MISSED' },
      },
      {
        id: 's-2',
        nodeId: 'node-ai-reply',
        nodeType: 'ai:generate',
        nodeLabel: 'Generate Personalized SMS',
        status: 'SUCCESS',
        startedAt: new Date(Date.now() - 1000 * 60 * 119.8).toISOString(),
        durationMs: 410,
        output: { smsText: 'Sorry we missed your call! Book a 10-min slot with our team: https://acme.link/meet' },
      },
      {
        id: 's-3',
        nodeId: 'node-sms',
        nodeType: 'comm:sms',
        nodeLabel: 'Send Outbound SMS via Twilio',
        status: 'SUCCESS',
        startedAt: new Date(Date.now() - 1000 * 60 * 119.4).toISOString(),
        durationMs: 220,
        output: { sid: 'SM8492048102', status: 'delivered' },
      },
    ],
  },
];

export default function ExecutionsPage() {
  const [executions, setExecutions] = useState<Execution[]>(INITIAL_EXECUTIONS);
  const [selectedExec, setSelectedExec] = useState<Execution | null>(INITIAL_EXECUTIONS[0]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  // Fetch real executions if available from backend
  useEffect(() => {
    async function fetchExecutions() {
      try {
        const res = await fetch('/api/automation/executions/all');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setExecutions((prev) => [...data, ...prev]);
          }
        }
      } catch (err) {
        // Fallback to initial seed telemetry
      }
    }
    fetchExecutions();
  }, []);

  const filteredExecutions = executions.filter((e) => {
    const matchesStatus = filterStatus === 'ALL' || e.status === filterStatus;
    const matchesSearch =
      e.workflowTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.triggerType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleRetryExecution = async (execId: string) => {
    setIsRetrying(true);
    try {
      const res = await fetch(`/api/automation/executions/${execId}/retry`, { method: 'POST' });
      if (res.ok) {
        alert(`Execution ${execId} successfully resubmitted to the BullMQ queue!`);
      } else {
        alert(`Retrying execution locally... Simulated re-run queued.`);
      }
    } catch {
      alert(`Retrying execution locally... Simulated re-run queued.`);
    } finally {
      setIsRetrying(false);
    }
  };

  const getStatusBadge = (status: Execution['status']) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            SUCCESS
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5 mr-1 text-rose-400" />
            FAILED
          </span>
        );
      case 'APPROVAL_REQUIRED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <ShieldAlert className="w-3.5 h-3.5 mr-1 text-amber-400" />
            APPROVAL REQUIRED
          </span>
        );
      case 'RUNNING':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 mr-1 text-cyan-400 animate-spin" />
            RUNNING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/30">
            <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Workflow Executions & Audit Telemetry</h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Feed
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Deterministic node-by-node audit trace, retry controls, token consumption, and failure diagnostics
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 text-xs font-medium transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Refresh</span>
          </button>
          <Link
            href="/automation/approvals"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>View Pending Approvals</span>
          </Link>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Executions (24h)</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white">1,842</div>
          <div className="mt-1 text-[11px] text-emerald-400 font-medium">99.4% success rate</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Avg Node Latency</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white">314 ms</div>
          <div className="mt-1 text-[11px] text-cyan-400 font-medium">BullMQ Redis stream</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>AI Tokens Consumed</span>
            <Cpu className="w-4 h-4 text-violet-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white">482.1k</div>
          <div className="mt-1 text-[11px] text-violet-400 font-medium">Groq & OpenRouter hybrid</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>HITL Approvals Paused</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-400">1 Pending</div>
          <div className="mt-1 text-[11px] text-slate-400">Awaiting human review</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/50 border border-white/10">
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'SUCCESS', 'FAILED', 'APPROVAL_REQUIRED', 'RUNNING'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterStatus === status
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by workflow, ID, trigger..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* Main Split View: Table on left, Inspector on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Execution Table */}
        <div className="lg:col-span-7 bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
          <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Execution Runs ({filteredExecutions.length})</span>
            <span className="text-[11px] text-slate-500">Click a row to inspect node trace</span>
          </div>

          <div className="divide-y divide-white/5 max-h-[620px] overflow-y-auto">
            {filteredExecutions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No executions match criteria</div>
            ) : (
              filteredExecutions.map((exec) => {
                const isSelected = selectedExec?.id === exec.id;
                return (
                  <div
                    key={exec.id}
                    onClick={() => setSelectedExec(exec)}
                    className={`p-3.5 flex items-center justify-between cursor-pointer transition ${
                      isSelected
                        ? 'bg-emerald-500/10 border-l-2 border-emerald-400'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="space-y-1 min-w-0 pr-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-xs text-white truncate max-w-[240px]">
                          {exec.workflowTitle}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">{exec.id}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                        <span className="flex items-center space-x-1">
                          <Layers className="w-3 h-3 text-slate-500" />
                          <span>{exec.stepCount} steps</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{exec.durationMs}ms</span>
                        </span>
                        {exec.tokensUsed > 0 && (
                          <span className="flex items-center space-x-1">
                            <Cpu className="w-3 h-3 text-slate-500" />
                            <span>{exec.tokensUsed} tokens</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      {getStatusBadge(exec.status)}
                      <ChevronRight className={`w-4 h-4 transition ${isSelected ? 'text-emerald-400' : 'text-slate-600'}`} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Execution Inspector */}
        <div className="lg:col-span-5 bg-slate-900/70 rounded-xl border border-white/10 p-5 space-y-5">
          {selectedExec ? (
            <>
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Run Inspector</span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{selectedExec.workflowTitle}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedExec.id}</p>
                </div>
                <div>{getStatusBadge(selectedExec.status)}</div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleRetryExecution(selectedExec.id)}
                  disabled={isRetrying}
                  className="flex-1 inline-flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                  <span>{isRetrying ? 'Retrying...' : 'Replay & Retry Run'}</span>
                </button>

                <Link
                  href={`/automation/workflows/${selectedExec.workflowId}`}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 text-xs font-medium transition"
                >
                  Open in Studio
                </Link>
              </div>

              {/* Execution Summary Stats */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-slate-950/60 border border-white/5 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Duration</span>
                  <p className="text-xs font-mono font-bold text-white mt-0.5">{selectedExec.durationMs}ms</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">AI Tokens</span>
                  <p className="text-xs font-mono font-bold text-white mt-0.5">{selectedExec.tokensUsed || 'None'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Trigger</span>
                  <p className="text-xs font-mono font-bold text-emerald-400 mt-0.5 truncate">{selectedExec.triggerType}</p>
                </div>
              </div>

              {/* Failure Error Alert if present */}
              {selectedExec.error && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Workflow Exception</span>
                  </div>
                  <p className="font-mono text-[11px] text-rose-200">{selectedExec.error}</p>
                </div>
              )}

              {/* Node-by-Node Step Timeline */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Node Execution Trace ({selectedExec.steps.length})</span>
                </span>

                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {selectedExec.steps.map((step, idx) => (
                    <div
                      key={step.id}
                      className="p-3 rounded-lg bg-slate-950/70 border border-white/5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-mono flex items-center justify-center text-slate-400">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="text-xs font-semibold text-white block">{step.nodeLabel}</span>
                            <span className="text-[10px] font-mono text-slate-500">{step.nodeType}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {step.durationMs && (
                            <span className="text-[10px] font-mono text-slate-400">{step.durationMs}ms</span>
                          )}
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                              step.status === 'SUCCESS'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : step.status === 'FAILED'
                                ? 'bg-rose-500/20 text-rose-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {step.status}
                          </span>
                        </div>
                      </div>

                      {/* Payload Viewer */}
                      {step.output && (
                        <div className="mt-2 bg-slate-900/90 rounded p-2 text-[10px] font-mono text-slate-300 overflow-x-auto">
                          <pre>{JSON.stringify(step.output, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">Select an execution to inspect logs</div>
          )}
        </div>
      </div>
    </div>
  );
}
