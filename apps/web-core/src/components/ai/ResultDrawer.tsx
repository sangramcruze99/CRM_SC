'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Zap,
  UserCheck,
  Check,
  FileCheck,
  ArrowRight,
  Terminal,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Copy,
  Download,
  Eye,
} from 'lucide-react';
import {
  UniversalExecutionStatus,
  AgentExecutionResult,
  AgentActionRecord,
  AgentOutputRecord,
} from '@repo/core-types';

export function ResultDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [execution, setExecution] = useState<AgentExecutionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [previewOutput, setPreviewOutput] = useState<AgentOutputRecord | null>(null);

  useEffect(() => {
    const handleOpen = async (e: CustomEvent<{ executionId?: string; result?: AgentExecutionResult }>) => {
      setIsOpen(true);
      setShowAdvanced(false);

      if (e.detail?.result) {
        setExecution(e.detail.result);
        return;
      }

      if (e.detail?.executionId) {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/ai/orchestrator/executions/${e.detail.executionId}`);
          if (res.ok) {
            const data = await res.json();
            setExecution(data.parsedResult || data);
          } else {
            // Fallback to automation result
            const wfRes = await fetch(`/api/automation/executions/${e.detail.executionId}/result`);
            if (wfRes.ok) {
              const wfData = await wfRes.json();
              setExecution(wfData.executionResult || wfData);
            }
          }
        } catch (err) {
          console.error('Failed to load execution detail', err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    window.addEventListener('open-result-drawer' as any, handleOpen as any);
    return () => {
      window.removeEventListener('open-result-drawer' as any, handleOpen as any);
    };
  }, []);

  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleApprove = async () => {
    if (!execution?.humanReview?.approvalRequestId) return;
    setIsApproving(true);
    try {
      await fetch(`/api/ai/orchestrator/approvals/${execution.humanReview.approvalRequestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewerId: 'current-user' }),
      });
      // Refresh execution status
      setExecution((prev) =>
        prev
          ? {
              ...prev,
              outcome: {
                ...prev.outcome,
                status: 'SUCCESS',
                summary: `${prev.outcome.summary} (Approved by supervisor)`,
              },
              humanReview: {
                ...prev.humanReview,
                status: 'APPROVED',
                required: false,
              },
            }
          : null
      );
    } catch (err) {
      console.error('Approval failed', err);
    } finally {
      setIsApproving(false);
    }
  };

  if (!isOpen) return null;

  const status = execution?.outcome?.status || 'SUCCESS';

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Container */}
      <aside className="relative w-full max-w-xl bg-slate-900 border-l border-white/10 shadow-2xl z-10 flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-250">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-start justify-between bg-slate-950/40">
          <div className="space-y-1 min-w-0 pr-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                Universal Result
              </span>
              {execution?.agentName && (
                <span className="text-xs font-semibold text-slate-300 truncate">
                  {execution.agentName}
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-white tracking-tight truncate">
              {execution?.outcome?.summary || 'Execution Result'}
            </h2>
            <p className="text-[11px] font-mono text-slate-400">
              Run: {execution?.executionId || execution?.id || 'RUN-LIVE'} • Code:{' '}
              <span className="text-emerald-400 font-semibold">{execution?.outcome?.code || 'SUCCESS'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/automation/executions"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
              title="Open Full Result Center"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
              <span className="text-xs">Loading execution result details...</span>
            </div>
          ) : execution ? (
            <>
              {/* Human-in-the-Loop Safety Gate Banner */}
              {execution.outcome?.status === 'WAITING_APPROVAL' && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
                    <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>Safety Gate: Approval Required</span>
                  </div>
                  <p className="text-xs text-amber-200/90 leading-relaxed">
                    {execution.decision?.reason || execution.outcome?.summary}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-amber-500/20">
                    <span className="text-[11px] text-amber-400">
                      High-impact action paused per safety policy.
                    </span>
                    <button
                      onClick={handleApprove}
                      disabled={isApproving}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
                    >
                      {isApproving ? 'Approving...' : 'Approve Now'}
                    </button>
                  </div>
                </div>
              )}

              {/* 1. What Happened? */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  What Happened?
                </span>
                <p className="text-xs font-medium text-white leading-relaxed">
                  {execution.outcome?.summary}
                </p>
              </div>

              {/* 2. What Triggered This? */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  What Triggered This?
                </span>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Event:</span>{' '}
                    <span className="font-mono text-cyan-300 font-semibold">{execution.trigger?.type}</span>
                  </div>
                  {execution.input?.entityType && (
                    <div>
                      <span className="text-slate-500">Target:</span>{' '}
                      <span className="font-semibold text-white">
                        {execution.input.entityType} #{execution.input.entityId}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. AI Decision & Rationale */}
              {execution.decision && (
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    AI Decision
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      {execution.decision.outcome}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Confidence: {Math.round((execution.decision.confidence || 1) * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {execution.decision.reason}
                  </p>
                </div>
              )}

              {/* 4. Actions Taken */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Actions Taken ({execution.actions?.length || 0})
                </span>
                <div className="space-y-1.5">
                  {execution.actions?.map((act, idx) => (
                    <div
                      key={act.actionId || idx}
                      className="p-2.5 rounded-lg bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                          
                        </span>
                        <div>
                          <span className="font-medium text-white">{act.toolName || act.actionType}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {act.targetService} • {act.targetEntityType}:{act.targetEntityId}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                        {act.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Outputs Produced */}
              {execution.outputs && execution.outputs.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-teal-400" />
                    Outputs Produced ({execution.outputs.length})
                  </span>
                  <div className="space-y-2">
                    {execution.outputs.map((out, idx) => (
                      <div
                        key={out.outputId || idx}
                        className="p-3 rounded-xl bg-slate-950/70 border border-white/5 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{out.title}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-teal-300">
                            {out.type}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">{out.summary}</p>

                        <div className="flex items-center gap-2 pt-1 border-t border-white/5 text-[11px]">
                          <button
                            onClick={() => handleCopyText(out.summary || JSON.stringify(out.data || {}), idx)}
                            className="flex items-center gap-1 text-slate-400 hover:text-white transition"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedIndex === idx ? 'Copied!' : 'Copy Summary'}</span>
                          </button>

                          {out.documentId ? (
                            <Link
                              href={`/documents?id=${out.documentId}`}
                              className="flex items-center gap-1 text-emerald-400 hover:underline ml-auto"
                            >
                              <Download className="w-3 h-3" />
                              <span>Open Vault File</span>
                            </Link>
                          ) : (
                            <button
                              onClick={() => setPreviewOutput(out)}
                              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition ml-auto"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Inspect Data</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. What Happens Next? */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  What Happens Next?
                </span>
                <p className="text-xs text-slate-300 font-medium">
                  {execution.outcome?.nextStep || 'Workflow execution complete.'}
                </p>
              </div>

              {/* Advanced Technical Trace Toggle */}
              <div className="pt-2 border-t border-white/10">
                <button
                  onClick={() => setShowAdvanced((prev) => !prev)}
                  className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  <span className="flex items-center gap-1.5 font-mono">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    Advanced Execution Trace
                  </span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showAdvanced && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-white/5 space-y-2 text-xs font-mono animate-in fade-in duration-150">
                    <div className="grid grid-cols-3 gap-2 text-center pb-2 border-b border-white/5">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Model</span>
                        <span className="text-white font-semibold">{execution.processing?.model || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Latency</span>
                        <span className="text-white font-semibold">{execution.processing?.durationMs || 0}ms</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Tokens</span>
                        <span className="text-white font-semibold">{execution.processing?.tokensUsed || 0}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Provider</span>
                      <span className="text-slate-300">{execution.processing?.provider || 'orchestrator'}</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-slate-500 text-xs">
              No execution details available.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-slate-950/40 flex items-center justify-between">
          <Link
            href="/automation/executions"
            onClick={() => setIsOpen(false)}
            className="text-xs text-emerald-400 hover:underline font-medium"
          >
            Open Execution History →
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </aside>

      {/* Output Data Inspection Modal */}
      {previewOutput && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">{previewOutput.title}</h3>
              <button onClick={() => setPreviewOutput(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-slate-300 max-h-60 overflow-y-auto">
              <pre>{JSON.stringify(previewOutput.data || previewOutput.summary, null, 2)}</pre>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setPreviewOutput(null)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Universal helper to open the Result Drawer from anywhere in the platform.
 */
export function openResultDrawer(
  arg?: string | { executionId?: string; result?: AgentExecutionResult },
  resultArg?: AgentExecutionResult
) {
  let executionId: string | undefined;
  let result: AgentExecutionResult | undefined;

  if (typeof arg === 'string') {
    executionId = arg;
    result = resultArg;
  } else if (arg && typeof arg === 'object') {
    executionId = arg.executionId;
    result = arg.result;
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-result-drawer', { detail: { executionId, result } }));
  }
}
