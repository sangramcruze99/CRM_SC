'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Check, X, Sparkles, Mail, CheckCircle2, ChevronDown } from 'lucide-react';

interface ProposedAction {
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
}

export function AgentApprovalsWidget() {
  const [approvals, setApprovals] = useState<ProposedAction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchApprovals = async () => {
    try {
      const res = await fetch('http://localhost:3010/agents/approvals', {
        headers: { 'x-tenant-id': 'default-tenant' },
      });
      if (res.ok) {
        const data = await res.json();
        setApprovals(data || []);
      }
    } catch {
      // Offline fallback
    }
  };

  useEffect(() => {
    fetchApprovals();
    const interval = setInterval(fetchApprovals, 10000);
    return () => clearInterval(interval);
  }, []);

  const pendingItems = approvals.filter((a) => a.status === 'PENDING_APPROVAL');

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`http://localhost:3010/agents/approvals/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
        body: JSON.stringify({ reviewedBy: 'Workspace Executive' }),
      });
      if (res.ok) {
        setApprovals((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: 'APPROVED' } : item))
        );
      }
    } catch (err: any) {
      console.error('Failed to approve action', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`http://localhost:3010/agents/approvals/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
        body: JSON.stringify({ reviewedBy: 'Workspace Executive' }),
      });
      if (res.ok) {
        setApprovals((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: 'REJECTED' } : item))
        );
      }
    } catch (err: any) {
      console.error('Failed to reject action', err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="relative">
      {/* Topbar Action Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-8.5 flex items-center space-x-1.5 px-2.5 rounded-xl text-xs font-bold transition-all border shadow-xs cursor-pointer whitespace-nowrap active:scale-[0.98] ${
          pendingItems.length > 0
            ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border-amber-500/40 animate-pulse'
            : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.09] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/[0.08] hover:border-emerald-500/40'
        }`}
        title="Autonomous Agent Approvals & Staged Actions"
      >
        <ShieldAlert size={14} className={pendingItems.length > 0 ? 'text-amber-500 shrink-0' : 'text-slate-400 shrink-0'} />
        <span className="hidden xl:inline">Agent Actions</span>
        {pendingItems.length > 0 && (
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 font-mono">
            {pendingItems.length}
          </span>
        )}
        <ChevronDown size={12} className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Review Flyout */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-white dark:bg-[#0c1411] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-2xl">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles size={15} className="text-emerald-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Human-In-The-Loop Approval Queue
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto p-3 space-y-2.5">
            {pendingItems.length === 0 ? (
              <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-2 opacity-80" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">All Agent Actions Clear</p>
                <p className="text-[11px] mt-1 text-slate-400">Autonomous sentinels operating within safe policy thresholds.</p>
              </div>
            ) : (
              pendingItems.map((action) => (
                <div
                  key={action.id}
                  className="p-3 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Sparkles size={12} />
                      {action.agentName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      {action.riskLevel} RISK
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-snug">
                    {action.rationale}
                  </p>

                  {/* Action Preview */}
                  {action.actionType === 'send_email' && (
                    <div className="p-2 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-lg text-[11px] space-y-1 font-mono">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <Mail size={12} />
                        <span>To: {action.parameters?.to || 'Recipient'}</span>
                      </div>
                      <div className="text-slate-900 dark:text-slate-200 font-sans font-bold">
                        {action.parameters?.subject || 'Executive Proposal Review'}
                      </div>
                    </div>
                  )}

                  {action.actionType === 'create_crm_task' && (
                    <div className="p-2 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-lg text-[11px] text-slate-700 dark:text-slate-300">
                      <span className="font-bold">Task:</span> {action.parameters?.title}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <button
                      onClick={() => handleReject(action.id)}
                      disabled={processingId === action.id}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors flex items-center gap-1"
                    >
                      <X size={12} />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApprove(action.id)}
                      disabled={processingId === action.id}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all shadow-sm flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                    >
                      <Check size={12} />
                      <span>{processingId === action.id ? 'Executing...' : 'Approve & Execute'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
