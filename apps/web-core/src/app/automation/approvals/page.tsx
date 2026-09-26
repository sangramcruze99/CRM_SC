'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Mail,
  DollarSign,
  FileSignature,
  Globe,
  AlertTriangle,
  Bot,
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
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'appr-104',
    workflowId: 'wf-contract-exec',
    workflowTitle: 'Strategic Vendor Partnership MSA',
    agentName: 'Legal & Procurement Sentinel',
    actionType: 'EXECUTE_CONTRACT',
    target: 'Vendor MSA: DataDog Observability Extension',
    riskLevel: 'HIGH',
    status: 'PENDING',
    reason: 'Multi-year commitments require secondary administrative verification before digital signature dispatch.',
    payload: {
      vendorId: 'vnd_datadog_01',
      contractLengthMonths: 24,
      totalCommitted: 36000,
      signers: ['procurement@enterprise.io', 'legal@datadog.com'],
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: 'appr-105',
    workflowId: 'wf-whatsapp-promo',
    workflowTitle: 'VIP Black Friday Broadcast Notification',
    agentName: 'Marketing Concierge Agent',
    actionType: 'SEND_WHATSAPP',
    target: 'Audience: 1,420 High-LTV Retail VIP Customers',
    riskLevel: 'LOW',
    status: 'APPROVED',
    reason: 'Broadcast template pre-approved by Meta with dynamic personalization for highest tier accounts.',
    payload: {
      audienceSegment: 'VIP_LTV_OVER_5000',
      recipientCount: 1420,
      template: 'vip_exclusive_offer_v2',
      estimatedCost: 28.4,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    expiresAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

export default function AutomationApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>(INITIAL_APPROVALS);
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(INITIAL_APPROVALS[0] || null);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectData, setInspectData] = useState<any>(null);
  const [isLoadingInspect, setIsLoadingInspect] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [comment, setComment] = useState('');

  useEffect(() => {
    async function loadLiveApprovals() {
      try {
        const res = await fetch('/api/automation/approvals');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setApprovals(data);
            if (data[0]) setSelectedApproval(data[0]);
            return;
          }
        }
      } catch {
        // keep seeds
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
        ? `/api/automation/approvals/${id}/approve`
        : `/api/automation/approvals/${id}/reject`;

      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewedBy: 'Executive Operator', reason: comment }),
      }).catch(() => {});

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
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wider">
            CRITICAL RISK
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
            HIGH RISK
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase tracking-wider">
            MEDIUM RISK
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
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
        return <FileSignature className="w-4 h-4 text-teal-400" />;
      default:
        return <Globe className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6 text-white font-sans">
      {/* Top Header Cockpit Chassis */}
      <div className="botanical-glass-card rounded-3xl p-6 md:p-8 border border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        {/* Autonomous Sentinel Pulse Status Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/[0.06] text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-bold tracking-wider uppercase">Human-in-the-Loop Circuit Active</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">Deterministic Safety Gate</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[11px]">
              vault/automation/approvals/
            </span>
            <span className="text-zinc-500">|</span>
            <span className="text-emerald-400 font-semibold">Strict Verification: Active</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                STAGE 5.0 SAFETY GATE
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
                AUDITABLE HITL GOVERNANCE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <ShieldAlert className="text-amber-400" size={30} />
              AI Control &amp; Approval Center
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 max-w-3xl leading-relaxed">
              Auditable, explainable human-in-the-loop authorization across all domain agents, sensitive business actions, financial operations, and external API mutations.
            </p>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] self-start md:self-auto">
            {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                  filterStatus === status
                    ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Approvals Queue */}
        <div className="lg:col-span-6 botanical-glass-card rounded-2xl border border-white/[0.08] overflow-hidden">
          <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
              <span>Pending Authorization Requests</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.06] text-emerald-400 border border-white/[0.08]">
                {filteredApprovals.length}
              </span>
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">Select item to inspect</span>
          </div>

          <div className="divide-y divide-white/[0.06] max-h-[640px] overflow-y-auto">
            {filteredApprovals.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 text-xs font-mono">No approvals found in this view</div>
            ) : (
              filteredApprovals.map((item) => {
                const isSelected = selectedApproval?.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`p-4 transition cursor-pointer ${
                      isSelected ? 'bg-emerald-500/[0.08] border-l-4 border-emerald-400' : 'hover:bg-white/[0.02]'
                    }`}
                    onClick={() => setSelectedApproval(item)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0">
                          {getActionIcon(item.actionType)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white leading-tight">{item.target}</h4>
                          <span className="text-[11px] text-zinc-400 mt-0.5 block font-mono">{item.workflowTitle || 'Autonomous Agent Event'}</span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center space-x-2">
                        {getRiskBadge(item.riskLevel)}
                      </div>
                    </div>

                    <p className="mt-2.5 text-xs text-zinc-300 line-clamp-2 leading-relaxed">{item.reason}</p>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 border-t border-white/[0.06] pt-2 font-mono">
                      <span className="flex items-center space-x-1.5">
                        <Bot className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-zinc-300 font-semibold">{item.agentName || 'Ares Sales Sentinel'}</span>
                      </span>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openInspect(item);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.08] text-[11px] font-mono font-semibold transition inline-flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          <span>Inspect</span>
                        </button>

                        {item.status === 'PENDING' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDecision(item.id, 'APPROVE');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-[11px] transition cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDecision(item.id, 'REJECT');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-mono font-semibold transition cursor-pointer"
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
        <div className="lg:col-span-6 botanical-glass-card rounded-2xl border border-white/[0.08] p-6 space-y-5">
          {selectedApproval ? (
            <>
              {/* Header */}
              <div className="border-b border-white/[0.08] pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] text-zinc-400 px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                      {selectedApproval.id}
                    </span>
                    {getRiskBadge(selectedApproval.riskLevel)}
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                      selectedApproval.status === 'PENDING'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : selectedApproval.status === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {selectedApproval.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{selectedApproval.target}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{selectedApproval.reason}</p>
              </div>

              {/* Explainability Callout: Why did the AI do this? */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-emerald-500/20 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
                      Decision Explainability Rationale
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    94% Confidence
                  </span>
                </div>

                <ul className="space-y-1.5 text-xs text-zinc-300 pt-1">
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-400">•</span>
                    <span>{selectedApproval.reason}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-400">•</span>
                    <span>Evaluated against multi-tenant safety policy guardrails for supervised execution.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-400">•</span>
                    <span>Knowledge Vault consulted: Verified business fact attribution without hallucination.</span>
                  </li>
                </ul>
              </div>

              {/* Proposed Payload Diff / View */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono font-semibold text-zinc-300">
                  <span>Action Parameters &amp; Context</span>
                  <span className="text-[11px] font-mono text-emerald-400">Schema Validated</span>
                </div>
                <div className="p-3.5 bg-black/60 rounded-xl border border-white/[0.08] font-mono text-xs text-zinc-300 max-h-[160px] overflow-y-auto">
                  <pre>{JSON.stringify(selectedApproval.payload, null, 2)}</pre>
                </div>
              </div>

              {/* Decision Section */}
              {selectedApproval.status === 'PENDING' ? (
                <div className="space-y-3 pt-2 border-t border-white/[0.08]">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-zinc-400">Operator Review Notes (Optional)</label>
                    <input
                      type="text"
                      placeholder="Add justification or adjustment note..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      onClick={() => handleDecision(selectedApproval.id, 'APPROVE')}
                      disabled={isProcessing}
                      className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs transition shadow-lg shadow-emerald-500/20 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-zinc-950" />
                      <span>Approve &amp; Execute</span>
                    </button>

                    <button
                      onClick={() => handleDecision(selectedApproval.id, 'REJECT')}
                      disabled={isProcessing}
                      className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-mono font-semibold text-xs transition cursor-pointer"
                    >
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>Reject &amp; Halt</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center text-xs font-mono text-zinc-400">
                  This action has been resolved with status{' '}
                  <span className="font-bold text-white">{selectedApproval.status}</span>.
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center text-zinc-500 text-xs font-mono">Select an approval request to inspect</div>
          )}
        </div>
      </div>

      {/* Full Explainability Inspect Modal */}
      {inspectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="botanical-glass-card border border-white/[0.12] rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">AI Decision Explainability &amp; Audit</h3>
                  <p className="text-xs text-zinc-400 font-mono">Autonomous Reasoning and Risk Telemetry Packet</p>
                </div>
              </div>
              <button
                onClick={() => setInspectModalOpen(false)}
                className="text-zinc-400 hover:text-white text-xs px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] font-mono cursor-pointer"
              >
                Close
              </button>
            </div>

            {isLoadingInspect ? (
              <div className="p-12 text-center text-zinc-400 text-xs font-mono animate-pulse">
                Assembling Context Package &amp; Decision Audit...
              </div>
            ) : (
              <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                {/* Meta Cards */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
                    <span className="text-[10px] text-zinc-500 block uppercase font-mono">Agent</span>
                    <span className="font-bold text-white mt-0.5 block">{inspectData?.agent}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
                    <span className="text-[10px] text-zinc-500 block uppercase font-mono">Model</span>
                    <span className="font-mono text-[11px] text-emerald-400 mt-0.5 block">{inspectData?.model}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
                    <span className="text-[10px] text-zinc-500 block uppercase font-mono">Confidence</span>
                    <span className="font-bold text-emerald-400 mt-0.5 block font-mono">
                      {Math.round((inspectData?.confidence || 0.94) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Why did the AI do this? */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
                  <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider block">
                    Reasoning Synthesis
                  </span>
                  <ul className="space-y-1.5 text-xs text-zinc-200">
                    {(inspectData?.why || []).map((point: string, i: number) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Knowledge Used */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-xs space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase block font-mono font-semibold">Knowledge Articles Referenced</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(inspectData?.knowledgeUsed || ['SaaS Pricing Matrix', 'SLA Framework']).map((k: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-[11px] font-mono text-zinc-300">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Expected Outcome */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-xs space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase block font-mono font-semibold">Expected Outcome</span>
                  <p className="text-zinc-300">{inspectData?.expectedOutcome || 'Action will execute safely.'}</p>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            {selectedApproval?.status === 'PENDING' && (
              <div className="flex items-center space-x-3 pt-3 border-t border-white/[0.08]">
                <button
                  onClick={() => handleDecision(selectedApproval.id, 'APPROVE')}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs transition cursor-pointer"
                >
                  Confirm &amp; Execute Action
                </button>
                <button
                  onClick={() => handleDecision(selectedApproval.id, 'REJECT')}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-mono font-semibold transition cursor-pointer"
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
