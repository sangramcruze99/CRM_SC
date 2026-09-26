'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowRight,
  Download,
  Copy,
  ExternalLink,
  Bot,
  RefreshCw,
  FileText,
  FileCheck,
  Zap,
  Play,
  Layers,
} from 'lucide-react';
import {
  UniversalExecutionStatus,
  AgentExecutionResult,
} from '@repo/core-types';
import { openResultDrawer } from './ResultDrawer';
import { openAgentModal } from './ContextualAgentModal';

interface RecordAiResultsTabProps {
  entityType: 'deal' | 'contact' | 'invoice' | 'ticket' | 'project' | string;
  entityId: string;
  entityTitle?: string;
  className?: string;
}

export function RecordAiResultsTab({
  entityType,
  entityId,
  entityTitle,
  className = '',
}: RecordAiResultsTabProps) {
  const [executions, setExecutions] = useState<AgentExecutionResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const fetchExecutions = async () => {
    try {
      const res = await fetch(`/api/ai/orchestrator/executions?targetId=${encodeURIComponent(entityId)}`);
      if (res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : data.executions || [];
        const parsed: AgentExecutionResult[] = rawList
          .map((item: any) => item.parsedResult || item)
          .filter(Boolean);
        setExecutions(parsed);
      }
    } catch (err) {
      console.error('Failed to load record AI results:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
  }, [entityId, entityType]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchExecutions();
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Map entity type to primary agent
  const getPrimaryAgent = () => {
    switch (entityType.toLowerCase()) {
      case 'invoice':
      case 'payment':
        return 'midas';
      case 'deal':
      case 'opportunity':
        return 'ares';
      case 'ticket':
        return 'support';
      case 'contact':
      case 'lead':
        return 'athena';
      case 'candidate':
        return 'recruitment';
      default:
        return 'midas';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white/50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>AI Agent Results & Automated Outcomes</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                {executions.length} {executions.length === 1 ? 'Execution' : 'Executions'}
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Decisions, audit trails, and generated output files for {entityTitle || `${entityType} #${entityId}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 transition cursor-pointer"
            title="Refresh AI history"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-emerald-500' : ''} />
          </button>

          <button
            type="button"
            onClick={() => openAgentModal(getPrimaryAgent())}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer"
          >
            <Play size={12} className="fill-slate-950" />
            <span>Run {getPrimaryAgent().toUpperCase()} AI</span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl animate-pulse">
          Loading AI execution history...
        </div>
      ) : executions.length === 0 ? (
        /* Empty state */
        <div className="p-8 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-white/30 dark:bg-slate-900/30">
          <Bot size={28} className="mx-auto text-slate-400 mb-2" />
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            No AI agent executions recorded yet for this {entityType}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Trigger an automated sentinel pass or run domain AI to generate recommendations, drafts, or risk assessments.
          </p>
          <button
            type="button"
            onClick={() => openAgentModal(getPrimaryAgent())}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold transition hover:opacity-90 cursor-pointer"
          >
            <Sparkles size={13} />
            <span>Launch Sentinel Audit</span>
          </button>
        </div>
      ) : (
        /* Executions Timeline */
        <div className="space-y-3">
          {executions.map((exec) => {
            const status = (exec.outcome?.status || 'SUCCESS') as UniversalExecutionStatus;
            const isApproval = status === 'WAITING_APPROVAL' || status === 'NEEDS_REVIEW';
            const isSuccess = status === 'SUCCESS';
            const isFailed = status === 'FAILED';

            return (
              <div
                key={exec.executionId || exec.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-sm space-y-3 transition hover:border-emerald-500/30"
              >
                {/* Status & Agent Top Header */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        isSuccess
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                          : isApproval
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                          : isFailed
                          ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                          : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {isSuccess && <CheckCircle2 size={11} />}
                      {isApproval && <ShieldAlert size={11} />}
                      {isFailed && <AlertTriangle size={11} />}
                      <span>{status.replace(/_/g, ' ')}</span>
                    </span>

                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {exec.agentName || exec.agentId}
                    </span>

                    <span className="text-[10px] text-slate-400 font-mono">
                      {exec.trigger?.source || 'Automated'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock size={10} />
                      {exec.createdAt ? new Date(exec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently'}
                    </span>

                    <button
                      type="button"
                      onClick={() => openResultDrawer({ result: exec })}
                      className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 px-2 py-0.5 rounded-lg hover:bg-emerald-500/10 transition cursor-pointer"
                    >
                      <span>Inspect</span>
                      <ArrowRight size={11} />
                    </button>
                  </div>
                </div>

                {/* Outcome Summary & Rationale */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-white/5 space-y-1.5">
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    {exec.outcome?.summary || 'Automated Sentinel evaluated this record and took designated policy actions.'}
                  </p>
                  {exec.decision?.reason && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 not-italic">Decision Rationale: </span>
                      {exec.decision.reason}
                    </p>
                  )}
                </div>

                {/* Executed Actions Checklist */}
                {exec.actions && exec.actions.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Actions Taken ({exec.actions.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {exec.actions.map((act, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-300 p-2 rounded-lg bg-slate-50/70 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5"
                        >
                          <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                          <span className="truncate">{act.actionType || act.toolName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Generated Outputs & Files */}
                {exec.outputs && exec.outputs.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <FileCheck size={11} className="text-emerald-500" />
                      <span>Generated Outputs ({exec.outputs.length})</span>
                    </span>

                    <div className="space-y-1.5">
                      {exec.outputs.map((out, idx) => {
                        const contentStr = typeof out.data === 'string' ? out.data : (out.summary || JSON.stringify(out.data || {}));
                        const downloadUrl = out.documentId ? `/api/documents/${out.documentId}/download` : (out.data?.downloadUrl || out.data?.url);

                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-3 p-2 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span className="font-bold text-slate-900 dark:text-white truncate">
                                {out.title || out.type}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {contentStr && (
                                <button
                                  type="button"
                                  onClick={() => handleCopy(contentStr, `${exec.executionId}-${idx}`)}
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-white/10 text-[10px] font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 transition cursor-pointer"
                                >
                                  <Copy size={10} />
                                  <span>{copiedIndex === `${exec.executionId}-${idx}` ? 'Copied' : 'Copy'}</span>
                                </button>
                              )}

                              {downloadUrl && (
                                <a
                                  href={downloadUrl}
                                  download
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500 text-slate-950 text-[10px] font-bold hover:bg-emerald-400 transition"
                                >
                                  <Download size={10} />
                                  <span>Download</span>
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
