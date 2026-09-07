'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Landmark,
  ShieldCheck,
  Zap,
  HelpCircle,
  FileText,
  AlertTriangle,
  Loader2,
  Edit3,
  Check,
  X,
  Sliders,
} from 'lucide-react';
import { AiNavigationTabs } from '@/components/ai/AiNavigationTabs';

interface ApprovalItem {
  id: string;
  department: string;
  departmentKey: string;
  actionTitle: string;
  targetEntity: string;
  targetId?: string;
  previewText: string;
  whyReason: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  technicalDetails?: {
    agentCodename?: string;
    confidence?: number;
    policyRule?: string;
    executionId?: string;
  };
}

const INITIAL_APPROVALS: ApprovalItem[] = [
  {
    id: 'app_deal_acme',
    department: 'Sales AI',
    departmentKey: 'sales',
    actionTitle: 'Send executive check-in message to Acme Corp',
    targetEntity: 'Acme Corp ($42,000 Opportunity)',
    targetId: 'deal_4920',
    previewText:
      'Hi John, hope your week is off to a great start. Following up on our security discussion from last week—let me know if you need any additional compliance documentation before the board review on Thursday.',
    whyReason:
      'This opportunity has had no recorded communications for 11 days and is valued at $42,000. Based on your standard sales playbook, a progress check-in is recommended.',
    riskLevel: 'MEDIUM',
    createdAt: '10 min ago',
    technicalDetails: {
      agentCodename: 'Ares SDR Sentinel',
      confidence: 0.94,
      policyRule: 'HITL_PROPOSAL_INACTIVITY_CHECK',
      executionId: 'exec_wf_89410_sales',
    },
  },
  {
    id: 'app_inv_1084',
    department: 'Finance AI',
    departmentKey: 'finance',
    actionTitle: 'Send friendly payment reminder for Invoice #1084',
    targetEntity: 'Stark Industries ($6,200 Past Due)',
    targetId: 'inv_1084',
    previewText:
      'Dear Stark Industries Accounts Payable team, this is a quick courtesy reminder regarding invoice #1084 for $6,200, which reached its due date 7 days ago. Please let us know when we can expect settlement.',
    whyReason:
      'Payment terms exceeded by 7 days. Customer has good historical credit rating, so a gentle first reminder is calibrated.',
    riskLevel: 'LOW',
    createdAt: '25 min ago',
    technicalDetails: {
      agentCodename: 'Midas AR Sentinel',
      confidence: 0.98,
      policyRule: 'HITL_COLLECTIONS_TIER_1',
      executionId: 'exec_wf_89411_finance',
    },
  },
  {
    id: 'app_cs_globex',
    department: 'Customer Success AI',
    departmentKey: 'cs',
    actionTitle: 'Schedule executive relationship check-in with Globex',
    targetEntity: 'Globex Logistics (Annual SaaS Contract)',
    targetId: 'account_globex',
    previewText:
      'Hello Elena, I noticed your team’s weekly usage dipped recently. I’d love to schedule a brief 15-minute sync to ensure you’re getting full value from your current tier and assist with any workflow blockers.',
    whyReason:
      'Account active seats declined by 35% over the past two weeks, indicating potential onboarding roadblocks.',
    riskLevel: 'MEDIUM',
    createdAt: '1 hour ago',
    technicalDetails: {
      agentCodename: 'Athena Retention Sentinel',
      confidence: 0.91,
      policyRule: 'HITL_CHURN_DEFENSE_PROACTIVE',
      executionId: 'exec_wf_89412_cs',
    },
  },
];

export default function AiApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>(INITIAL_APPROVALS);
  const [filterDept, setFilterDept] = useState<string>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [selectedTechModal, setSelectedTechModal] = useState<ApprovalItem | null>(null);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await fetch(`/api/automation/approvals/${id}/approve`, { method: 'POST' }).catch(() => {});
      setApprovals((prev) => prev.filter((item) => item.id !== id));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      await fetch(`/api/automation/approvals/${id}/reject`, { method: 'POST' }).catch(() => {});
      setApprovals((prev) => prev.filter((item) => item.id !== id));
    } finally {
      setProcessingId(null);
    }
  };

  const handleSaveEdit = (id: string) => {
    setApprovals((prev) =>
      prev.map((item) => (item.id === id ? { ...item, previewText: editText } : item))
    );
    setEditingId(null);
  };

  const filteredApprovals =
    filterDept === 'all'
      ? approvals
      : approvals.filter((a) => a.departmentKey === filterDept);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#080d0b] flex flex-col">
      <AiNavigationTabs pendingApprovalsCount={approvals.length} />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight flex items-center gap-2.5">
              <CheckCircle2 size={28} className="text-emerald-500" />
              Human Approval Center
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Your AI team staged these actions for your review. You remain in complete control of customer communications and changes.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl overflow-x-auto">
            {['all', 'sales', 'finance', 'cs'].map((dept) => (
              <button
                key={dept}
                onClick={() => setFilterDept(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filterDept === dept
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {dept === 'all' ? 'All Approvals' : `${dept.toUpperCase()} AI`}
              </button>
            ))}
          </div>
        </div>

        {/* Approvals list */}
        {filteredApprovals.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              All Caught Up!
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your AI team has no pending actions waiting for review. You will be notified when an assistant stages a new recommendation.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApprovals.map((item) => {
              const isBusy = processingId === item.id;
              const isEditing = editingId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 md:p-6 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-white/20 transition-all"
                >
                  {/* Title & Department header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-mono">
                          {item.department}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock size={12} /> {item.createdAt}
                        </span>
                      </div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        {item.actionTitle}
                      </h2>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Target: {item.targetEntity}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono shrink-0 ${
                        item.riskLevel === 'HIGH'
                          ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                          : item.riskLevel === 'MEDIUM'
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                          : 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      {item.riskLevel} IMPACT
                    </span>
                  </div>

                  {/* Proposed Content Preview / Edit box */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold uppercase tracking-wider text-[10px]">
                        Proposed Action / Message Preview:
                      </span>
                      {!isEditing && (
                        <button
                          onClick={() => {
                            setEditingId(item.id);
                            setEditText(item.previewText);
                          }}
                          className="flex items-center gap-1 text-emerald-600 hover:underline"
                        >
                          <Edit3 size={12} /> Edit before sending
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={4}
                          className="w-full p-3 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 rounded text-xs text-slate-600 hover:bg-slate-200 dark:hover:bg-white/10"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="px-3 py-1 rounded text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed whitespace-pre-line">
                        "{item.previewText}"
                      </p>
                    )}
                  </div>

                  {/* Why did AI do this? */}
                  <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/15 border border-amber-500/20 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
                    <HelpCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-bold text-amber-900 dark:text-amber-200 block mb-0.5">
                        Why did AI prepare this?
                      </span>
                      <span>{item.whyReason}</span>
                    </div>
                  </div>

                  {/* Actions & Progressive Disclosure */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <button
                      onClick={() => setSelectedTechModal(item)}
                      className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline text-left"
                    >
                      View technical reasoning details
                    </button>

                    <div className="flex items-center gap-2.5 self-end">
                      <button
                        onClick={() => handleReject(item.id)}
                        disabled={isBusy}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                      >
                        <XCircle size={15} /> Reject
                      </button>

                      <button
                        onClick={() => handleApprove(item.id)}
                        disabled={isBusy}
                        className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 shadow-md shadow-emerald-500/20 transition-all"
                      >
                        {isBusy ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 size={15} /> Approve & Execute
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Progressive Disclosure Modal for Power Users / Engineers */}
        {selectedTechModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders size={16} className="text-emerald-500" /> Technical Reasoning Manifest
                </h3>
                <button
                  onClick={() => setSelectedTechModal(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500">Agent Codename:</span>
                  <span className="text-slate-900 dark:text-white font-semibold">
                    {selectedTechModal.technicalDetails?.agentCodename}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500">Inference Confidence:</span>
                  <span className="text-emerald-600 font-bold">
                    {(Number(selectedTechModal.technicalDetails?.confidence || 0) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500">Governing Policy:</span>
                  <span className="text-slate-900 dark:text-white">
                    {selectedTechModal.technicalDetails?.policyRule}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500">Execution Trace ID:</span>
                  <span className="text-slate-900 dark:text-white truncate max-w-[180px]">
                    {selectedTechModal.technicalDetails?.executionId}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedTechModal(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
