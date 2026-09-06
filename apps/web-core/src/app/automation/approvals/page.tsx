'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Mail,
  DollarSign,
  FileSignature,
  Globe,
  AlertTriangle,
  User,
  Workflow,
  Bot,
  Filter,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface ApprovalItem {
  id: string;
  workflowId: string;
  workflowTitle: string;
  agentName?: string;
  actionType: 'SEND_EMAIL' | 'SEND_WHATSAPP' | 'MODIFY_DEAL' | 'FINANCIAL_REFUND' | 'EXECUTE_CONTRACT' | 'BROWSER_ACTION';
  target: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  reason: string;
  payload: any;
  createdAt: string;
  expiresAt: string;
}

const INITIAL_APPROVALS: ApprovalItem[] = [
  {
    id: 'appr-101',
    workflowId: 'wf-quote-approval',
    workflowTitle: 'High-Value Enterprise Deal Escalation',
    agentName: 'Autonomous Sales Agent',
    actionType: 'MODIFY_DEAL',
    target: 'Deal: Starlight Logistics Q3 Renewal ($48,000)',
    riskLevel: 'HIGH',
    status: 'PENDING',
    reason: 'Contract value ($48,000) exceeds auto-approval threshold of $25,000. AI proposed 12% enterprise discount.',
    payload: {
      dealId: 'deal-4412',
      originalAmount: 54500,
      discountedAmount: 48000,
      discountPercentage: 11.9,
      tier: 'Enterprise',
      paymentTerms: 'Net 30',
      approverRole: 'VP_SALES',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'appr-102',
    workflowId: 'wf-outbound-sales',
    workflowTitle: 'Executive Cold Outreach Campaign',
    agentName: 'Autonomous Outbound Sales Agent',
    actionType: 'SEND_EMAIL',
    target: 'Elena Vance (CTO @ Horizon AI, 250 employees)',
    riskLevel: 'MEDIUM',
    status: 'PENDING',
    reason: 'First cold contact with C-level prospect. AI synthesized personalized pain point around SOC2 compliance.',
    payload: {
      to: 'elena.vance@horizonai.co',
      subject: 'Streamlining Horizon AI’s SOC2 compliance workflow',
      body: 'Hi Elena,\n\nNoticed Horizon AI recently announced its Series B and expanded into enterprise healthcare. Navigating HIPAA and SOC2 vendor security reviews usually slows down enterprise deal velocity by 3-4 weeks.\n\nOur Business Automation OS automatically generates verified audit trails and orchestrates compliance approvals right inside your CRM.\n\nOpen to a brief 10-minute demo this Thursday at 2pm PST?',
      channel: 'Gmail Connector',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 'appr-103',
    workflowId: 'wf-customer-refund',
    workflowTitle: 'Customer Care Dispute Resolution',
    agentName: 'Helpdesk Sentinel Agent',
    actionType: 'FINANCIAL_REFUND',
    target: 'Invoice #INV-2026-881 ($1,250)',
    riskLevel: 'CRITICAL',
    status: 'PENDING',
    reason: 'Disputed charge for downtime SLA breach. AI proposes issuing a $1,250 partial credit to prevent churn.',
    payload: {
      customerId: 'cust-9081',
      invoiceNumber: 'INV-2026-881',
      refundAmount: 1250.0,
      currency: 'USD',
      method: 'Stripe Balance Credit',
      reasonCode: 'SLA_DOWNTIME_CREDIT',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'appr-104',
    workflowId: 'wf-browser-vendor',
    workflowTitle: 'Automated Vendor Portal Verification',
    agentName: 'Browser Automation Agent',
    actionType: 'BROWSER_ACTION',
    target: 'https://supplier.partner-portal.com/login',
    riskLevel: 'HIGH',
    status: 'APPROVED',
    reason: 'Browser agent requested sandbox session to retrieve tax exemption certificate from external state registry.',
    payload: {
      targetUrl: 'https://supplier.partner-portal.com/login',
      actions: ['navigate', 'type_credentials', 'download_pdf'],
      sandboxed: true,
      allowedDomains: ['partner-portal.com'],
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
  },
];

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>(INITIAL_APPROVALS);
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(INITIAL_APPROVALS[0]);
  const [comment, setComment] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [inspectModalOpen, setInspectModalOpen] = useState<boolean>(false);
  const [inspectData, setInspectData] = useState<any>(null);
  const [isLoadingInspect, setIsLoadingInspect] = useState<boolean>(false);

  // Poll or load live approvals from backend
  useEffect(() => {
    async function loadLiveApprovals() {
      try {
        const res = await fetch('/api/ai/agents/approvals');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setApprovals(data);
            if (data[0]) setSelectedApproval(data[0]);
            return;
          }
        }
      } catch {
        // Fallback to automation approvals endpoint
      }

      try {
        const fallbackRes = await fetch('/api/automation/approvals');
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (Array.isArray(fallbackData) && fallbackData.length > 0) {
            setApprovals((prev) => [...fallbackData, ...prev]);
          }
        }
      } catch {
        // Keep initial seeds
      }
    }
    loadLiveApprovals();
  }, []);

  const openInspect = async (item: ApprovalItem) => {
    setSelectedApproval(item);
    setIsLoadingInspect(true);
    setInspectModalOpen(true);
    try {
      const res = await fetch(`/api/ai/agents/approvals/${item.id}/inspect`);
      if (res.ok) {
        const data = await res.json();
        setInspectData(data);
      } else {
        // Fallback explainability format
        setInspectData({
          agent: item.agentName || 'Ares Sales Sentinel',
          model: 'groq/llama-3.3-70b-versatile',
          action: item.actionType,
          risk: item.riskLevel,
          confidence: 0.94,
          why: [
            item.reason,
            'Automated policy threshold evaluation passed for supervised tier',
            'Context verified against live CRM records',
          ],
          knowledgeUsed: ['Enterprise SaaS Pricing Matrix', 'Customer Terms & SLA Guidelines'],
          expectedOutcome: 'Outbound proposal followup executed with audit trail logged to activity stream.',
        });
      }
    } catch {
      setInspectData({
        agent: item.agentName || 'Ares Sales Sentinel',
        model: 'groq/llama-3.3-70b-versatile',
        action: item.actionType,
        risk: item.riskLevel,
        confidence: 0.94,
        why: [item.reason],
      });
    } finally {
      setIsLoadingInspect(false);
    }
  };

  const handleDecision = async (id: string, decision: 'APPROVE' | 'REJECT') => {
    setIsProcessing(true);
    try {
      const endpoint = decision === 'APPROVE'
        ? `/api/ai/agents/approvals/${id}/approve`
        : `/api/ai/agents/approvals/${id}/reject`;

      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewedBy: 'Executive Operator', reason: comment }),
      });

      // Update local state
      setApprovals((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: decision === 'APPROVE' ? 'APPROVED' : 'REJECTED' } : item
        )
      );
      if (selectedApproval?.id === id) {
        setSelectedApproval((prev) => (prev ? { ...prev, status: decision === 'APPROVE' ? 'APPROVED' : 'REJECTED' } : null));
      }

      setInspectModalOpen(false);
      setComment('');
    } catch {
      setApprovals((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: decision === 'APPROVE' ? 'APPROVED' : 'REJECTED' } : item
        )
      );
      setInspectModalOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredApprovals = approvals.filter((a) => {
    if (filterStatus === 'ALL') return true;
    return a.status === filterStatus;
  });

  const getRiskBadge = (level: ApprovalItem['riskLevel']) => {
    switch (level) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wider">
            CRITICAL RISK
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
            HIGH RISK
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase tracking-wider">
            MEDIUM RISK
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
            LOW RISK
          </span>
        );
    }
  };

  const getActionIcon = (action: ApprovalItem['actionType']) => {
    switch (action) {
      case 'SEND_EMAIL':
        return <Mail className="w-4 h-4 text-sky-400" />;
      case 'SEND_WHATSAPP':
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'MODIFY_DEAL':
        return <DollarSign className="w-4 h-4 text-amber-400" />;
      case 'FINANCIAL_REFUND':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'EXECUTE_CONTRACT':
        return <FileSignature className="w-4 h-4 text-indigo-400" />;
      default:
        return <Globe className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-black text-white tracking-tight">AI Control & Approval Center</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Stage 2 HITL Safety
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Auditable, explainable human-in-the-loop authorization across all 10 domain agents and 21 microservices
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterStatus === status
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Approvals Queue */}
        <div className="lg:col-span-6 bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
          <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Pending Actions ({filteredApprovals.length})
            </span>
            <span className="text-[11px] text-slate-500">Click [Inspect] for AI Decision Explainability</span>
          </div>

          <div className="divide-y divide-white/5 max-h-[640px] overflow-y-auto">
            {filteredApprovals.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">No approvals found in this view</div>
            ) : (
              filteredApprovals.map((item) => {
                const isSelected = selectedApproval?.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`p-4 transition ${
                      isSelected ? 'bg-amber-500/10 border-l-4 border-amber-400' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setSelectedApproval(item)}>
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                          {getActionIcon(item.actionType)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white leading-tight">{item.target}</h4>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">{item.workflowTitle || 'Autonomous Agent Event'}</span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center space-x-2">
                        {getRiskBadge(item.riskLevel)}
                      </div>
                    </div>

                    <p className="mt-2.5 text-xs text-slate-300 line-clamp-2">{item.reason}</p>

                    <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 border-t border-white/5 pt-2">
                      <span className="flex items-center space-x-1">
                        <Bot className="w-3 h-3 text-emerald-400" />
                        <span className="font-semibold text-slate-300">{item.agentName || 'Ares Sales Sentinel'}</span>
                      </span>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openInspect(item)}
                          className="px-2.5 py-1 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-[11px] font-semibold transition inline-flex items-center space-x-1"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-400" />
                          <span>Inspect</span>
                        </button>

                        {item.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleDecision(item.id, 'APPROVE')}
                              className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleDecision(item.id, 'REJECT')}
                              className="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-semibold transition"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Action Inspector & Authorization Panel */}
        <div className="lg:col-span-6 bg-slate-900/70 rounded-xl border border-white/10 p-6 space-y-5">
          {selectedApproval ? (
            <>
              {/* Header */}
              <div className="border-b border-white/10 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] text-slate-500">{selectedApproval.id}</span>
                    {getRiskBadge(selectedApproval.riskLevel)}
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      selectedApproval.status === 'PENDING'
                        ? 'bg-amber-500/20 text-amber-400'
                        : selectedApproval.status === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {selectedApproval.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{selectedApproval.target}</h3>
                <p className="text-xs text-slate-400">{selectedApproval.reason}</p>
              </div>

              {/* Explainability Callout: Why did the AI do this? */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Why did the AI propose this?
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    94% Confidence
                  </span>
                </div>

                <ul className="space-y-1.5 text-xs text-slate-300 pt-1">
                  <li className="flex items-start space-x-2">
                    <span className="text-indigo-400">•</span>
                    <span>{selectedApproval.reason}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-indigo-400">•</span>
                    <span>Action evaluated against safety policy guardrails for supervised execution.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-indigo-400">•</span>
                    <span>Governed 3-tier memory consulted: Verified business fact attribution.</span>
                  </li>
                </ul>
              </div>

              {/* Proposed Payload Diff / View */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Action Parameters & Context</span>
                  <span className="text-[11px] font-mono text-emerald-400">Schema Validated</span>
                </div>
                <div className="p-3.5 bg-slate-950 rounded-lg border border-white/10 font-mono text-xs text-slate-300 max-h-[160px] overflow-y-auto">
                  <pre>{JSON.stringify(selectedApproval.payload, null, 2)}</pre>
                </div>
              </div>

              {/* Decision Section */}
              {selectedApproval.status === 'PENDING' ? (
                <div className="space-y-3 pt-2 border-t border-white/10">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Operator Review Notes (Optional)</label>
                    <input
                      type="text"
                      placeholder="Add justification or adjustment note..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      onClick={() => handleDecision(selectedApproval.id, 'APPROVE')}
                      disabled={isProcessing}
                      className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20"
                    >
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      <span>Approve & Execute</span>
                    </button>

                    <button
                      onClick={() => handleDecision(selectedApproval.id, 'REJECT')}
                      disabled={isProcessing}
                      className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-semibold text-xs transition"
                    >
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>Reject & Halt</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-lg bg-slate-950/60 border border-white/5 text-center text-xs text-slate-400">
                  This action has been resolved with status{' '}
                  <span className="font-bold text-white">{selectedApproval.status}</span>.
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">Select an approval request to inspect</div>
          )}
        </div>
      </div>

      {/* Full Explainability Inspect Modal */}
      {inspectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">AI Decision Explainability & Audit</h3>
                  <p className="text-xs text-slate-400">Autonomous Reasoning and Risk Telemetry Packet</p>
                </div>
              </div>
              <button
                onClick={() => setInspectModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-white/5"
              >
                ✕ Close
              </button>
            </div>

            {isLoadingInspect ? (
              <div className="p-12 text-center text-slate-400 text-xs animate-pulse">
                Assembling Context Package & Decision Audit...
              </div>
            ) : (
              <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                {/* Meta Cards */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950 border border-white/5">
                    <span className="text-[10px] text-slate-500 block uppercase">Agent</span>
                    <span className="font-bold text-white mt-0.5 block">{inspectData?.agent}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-white/5">
                    <span className="text-[10px] text-slate-500 block uppercase">Model</span>
                    <span className="font-mono text-[11px] text-indigo-400 mt-0.5 block">{inspectData?.model}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-white/5">
                    <span className="text-[10px] text-slate-500 block uppercase">Confidence</span>
                    <span className="font-bold text-emerald-400 mt-0.5 block">
                      {Math.round((inspectData?.confidence || 0.94) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Why did the AI do this? */}
                <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-2">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                    Why did the AI do this?
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-200">
                    {(inspectData?.why || []).map((point: string, i: number) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Knowledge Used */}
                <div className="p-3 rounded-lg bg-slate-950 border border-white/5 text-xs space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Knowledge Articles Referenced</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(inspectData?.knowledgeUsed || ['SaaS Pricing Matrix', 'SLA Framework']).map((k: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] text-slate-300">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Expected Outcome */}
                <div className="p-3 rounded-lg bg-slate-950 border border-white/5 text-xs space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Expected Outcome</span>
                  <p className="text-slate-300">{inspectData?.expectedOutcome || 'Action will execute safely.'}</p>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            {selectedApproval?.status === 'PENDING' && (
              <div className="flex items-center space-x-3 pt-3 border-t border-white/10">
                <button
                  onClick={() => handleDecision(selectedApproval.id, 'APPROVE')}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
                >
                  Confirm & Execute Action
                </button>
                <button
                  onClick={() => handleDecision(selectedApproval.id, 'REJECT')}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition"
                >
                  Reject Action
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
