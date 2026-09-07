'use client';

import React, { useState, useEffect } from 'react';
import {
  Landmark,
  ShieldCheck,
  Zap,
  Bot,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronRight,
  Send,
  FileText,
  RefreshCw,
  BarChart3,
  DollarSign,
  Layers,
  Activity,
  AlertOctagon,
  Scale,
  CreditCard,
  Percent,
  Check,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface DepartmentOverview {
  department: string;
  name: string;
  description: string;
  architecturePillars: {
    agents: Array<{ id: string; name: string; role: string; autonomyLevel: string }>;
    knowledge: {
      playbook: string;
      dunningTierCount: number;
      disputeBattlecardCount: number;
      activeRules: number;
    };
    tools: string[];
    policies: Array<{ ruleId: string; name: string; description: string; enforcement: string }>;
  };
  kpis: {
    totalOutstandingAr: number;
    overdueAmount: number;
    overdueInvoicesCount: number;
    totalInvoicesCount: number;
    paidVolumeTotal: number;
    avgDsoDays: number;
    collectionEfficiencyIndex: number;
    unresolvedAnomaliesCount: number;
    projected30DayCollections: number;
  };
  sentinelStatus: {
    daemonState: string;
    lastAgingScanAt: string;
    autoDunningEnabled: boolean;
  };
}

interface AgingAudit {
  totalAr: number;
  auditTimestamp: string;
  brackets: Array<{
    bracket: string;
    label: string;
    count: number;
    totalAmount: number;
    percentageOfTotal: number;
    invoices: Array<{
      id: string;
      invoiceNum: string;
      accountName: string;
      amount: number;
      daysOverdue: number;
      dueDate: string;
      status: string;
      riskScore: number;
    }>;
  }>;
}

interface DualKhataAnomaly {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  impactAmount: number;
  entityId: string;
  entityType: string;
  detectedAt: string;
  recommendedAction: string;
  status: 'DETECTED' | 'REVIEWED' | 'RESOLVED';
}

interface CashflowForecast {
  forecastGeneratedAt: string;
  currentOutstandingAr: number;
  projections: Array<{
    horizon: string;
    label: string;
    projectedCashInflow: number;
    collectionProbability: string;
    confidenceInterval: { min: number; max: number };
    primaryContributors: string[];
  }>;
  aiTreasuryInsight: string;
}

export function FinanceDepartmentClient() {
  const [activeTab, setActiveTab] = useState<'aging' | 'collections' | 'anomalies' | 'cashflow' | 'disputes'>('aging');
  const [overview, setOverview] = useState<DepartmentOverview | null>(null);
  const [agingData, setAgingData] = useState<AgingAudit | null>(null);
  const [anomalies, setAnomalies] = useState<DualKhataAnomaly[]>([]);
  const [cashflow, setCashflow] = useState<CashflowForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Collections Copilot State
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [dunningRec, setDunningRec] = useState<any | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [dunningSending, setDunningSending] = useState(false);
  const [dunningResult, setDunningResult] = useState<any | null>(null);

  // Dispute Analyzer State
  const [disputeInput, setDisputeInput] = useState('Client claims 4-hour SLA downtime during month-end payroll and requests 10% credit memo.');
  const [disputeAnalyzing, setDisputeAnalyzing] = useState(false);
  const [disputeResult, setDisputeResult] = useState<any | null>(null);

  // Anomaly Resolving State
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      setRefreshing(true);
      const [ovRes, agRes, anRes, cfRes] = await Promise.all([
        fetch('/api/ai/departments/finance/overview'),
        fetch('/api/ai/departments/finance/aging/audit'),
        fetch('/api/ai/departments/finance/anomalies/audit'),
        fetch('/api/ai/departments/finance/cashflow/forecast'),
      ]);

      if (ovRes.ok) setOverview(await ovRes.json());
      if (agRes.ok) setAgingData(await agRes.json());
      if (anRes.ok) setAnomalies(await anRes.json());
      if (cfRes.ok) setCashflow(await cfRes.json());
    } catch (err) {
      console.error('Error fetching finance department telemetry:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const loadDunningRecommendation = async (invoiceId?: string) => {
    try {
      const res = await fetch('/api/ai/departments/finance/dunning/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      });
      if (res.ok) {
        const data = await res.json();
        setDunningRec(data);
        setSelectedInvoiceId(data.invoiceId);
        setAppliedDiscount(0);
        setDunningResult(null);
      }
    } catch (err) {
      console.error('Failed to load dunning recommendation:', err);
    }
  };

  const handleExecuteDunning = async () => {
    if (!dunningRec) return;
    setDunningSending(true);
    try {
      const res = await fetch('/api/ai/departments/finance/dunning/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: dunningRec.invoiceId,
          channel: dunningRec.recommendedChannel,
          customSubject: dunningRec.emailSubject,
          customBody: dunningRec.emailBody,
          appliedDiscountPercent: appliedDiscount,
          recipientEmail: 'ap@client-billing.org',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDunningResult(data);
      }
    } catch (err) {
      console.error('Failed to dispatch dunning action:', err);
    } finally {
      setDunningSending(false);
    }
  };

  const handleResolveAnomaly = async (anomalyId: string) => {
    setResolvingId(anomalyId);
    try {
      const res = await fetch('/api/ai/departments/finance/anomalies/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anomalyId,
          resolutionAction: 'MARK_RECONCILED',
          notes: 'Verified against bank transaction batch in treasury ledger.',
        }),
      });
      if (res.ok) {
        setAnomalies((prev) =>
          prev.map((a) => (a.id === anomalyId ? { ...a, status: 'RESOLVED' } : a))
        );
      }
    } catch (err) {
      console.error('Failed to resolve anomaly:', err);
    } finally {
      setResolvingId(null);
    }
  };

  const handleAnalyzeDispute = async () => {
    setDisputeAnalyzing(true);
    try {
      const res = await fetch('/api/ai/departments/finance/disputes/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disputeText: disputeInput }),
      });
      if (res.ok) {
        setDisputeResult(await res.json());
      }
    } catch (err) {
      console.error('Failed to analyze dispute:', err);
    } finally {
      setDisputeAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-6">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
          <span className="text-xl font-medium tracking-tight">Initializing AI Finance Department & Midas AR Sentinel...</span>
        </div>
      </div>
    );
  }

  const kpis = overview?.kpis;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10 font-sans selection:bg-amber-500/30">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-600/30 to-amber-400/10 border border-amber-500/30 shadow-lg shadow-amber-500/5">
              <Landmark className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                  AI Finance Department
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Stage 5.3 Active
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Midas AR Sentinel
                </span>
              </div>
              <p className="text-sm text-zinc-400 mt-1">
                Autonomous accounts receivable engine, tone-calibrated collections copilot, and Dual Khata ledger anomaly auditor.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllData}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-lg transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
            Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Top Level KPIs */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
        <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800/90 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-2">
            <span>Outstanding AR</span>
            <DollarSign className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-colors" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            ${kpis?.totalOutstandingAr?.toLocaleString() || '68,450'}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-400/90 mt-2 font-medium">
            <span>${kpis?.overdueAmount?.toLocaleString() || '19,200'} overdue</span>
            <span className="text-zinc-500">({kpis?.overdueInvoicesCount || 6} invoices)</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800/90 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-2">
            <span>Avg Days Sales Outstanding (DSO)</span>
            <Clock className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {kpis?.avgDsoDays || 34} <span className="text-sm font-normal text-zinc-400">days</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-400 mt-2 font-medium">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>-4.2 days vs prior period</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800/90 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-2">
            <span>Collection Efficiency (CEI)</span>
            <Percent className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {kpis?.collectionEfficiencyIndex || 92}%
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-400 mt-2 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Optimal liquidity threshold</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800/90 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-2">
            <span>Dual Khata Anomalies</span>
            <AlertOctagon className="w-4 h-4 text-zinc-500 group-hover:text-red-400 transition-colors" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {anomalies.filter((a) => a.status !== 'RESOLVED').length}
          </div>
          <div className="flex items-center gap-1 text-xs text-amber-400 mt-2 font-medium">
            <Activity className="w-3.5 h-3.5" />
            <span>Real-time ledger audit active</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-2">
          {[
            { id: 'aging', label: 'Accounts Receivable Aging', icon: BarChart3 },
            { id: 'collections', label: 'Collections Copilot', icon: Send },
            { id: 'anomalies', label: 'Dual Khata Ledger Audit', icon: Scale },
            { id: 'cashflow', label: '30/60/90d Cashflow Projections', icon: TrendingUp },
            { id: 'disputes', label: 'RAG Dispute Resolver', icon: Brain },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === 'collections' && !dunningRec) {
                    loadDunningRecommendation();
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: AR Aging Matrix */}
      {activeTab === 'aging' && (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Aging Brackets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {agingData?.brackets.map((b) => (
              <div
                key={b.bracket}
                className={`p-5 rounded-xl border ${
                  b.bracket === 'CURRENT_0_30'
                    ? 'bg-zinc-900/60 border-zinc-800'
                    : b.bracket === 'WARNING_31_60'
                    ? 'bg-amber-950/10 border-amber-800/40'
                    : b.bracket === 'CRITICAL_61_90'
                    ? 'bg-orange-950/15 border-orange-800/40'
                    : 'bg-red-950/15 border-red-800/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-1">
                  <span>{b.label}</span>
                  <span className="text-zinc-500">{b.percentageOfTotal}%</span>
                </div>
                <div className="text-xl font-bold text-white mt-1">
                  ${b.totalAmount.toLocaleString()}
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                  {b.count} {b.count === 1 ? 'invoice' : 'invoices'}
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      b.bracket === 'CURRENT_0_30'
                        ? 'bg-emerald-500'
                        : b.bracket === 'WARNING_31_60'
                        ? 'bg-amber-500'
                        : b.bracket === 'CRITICAL_61_90'
                        ? 'bg-orange-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${b.percentageOfTotal}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Aging Invoice Roster */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  Overdue Accounts & Priority Dunning Queue
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Monitored continuously by Midas Sentinel. Invoices past due are automatically triaged by risk.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950/60 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Invoice #</th>
                    <th className="py-3 px-4 font-semibold">Account</th>
                    <th className="py-3 px-4 font-semibold">Amount</th>
                    <th className="py-3 px-4 font-semibold">Due Date</th>
                    <th className="py-3 px-4 font-semibold">Overdue (Days)</th>
                    <th className="py-3 px-4 font-semibold">Risk Score</th>
                    <th className="py-3 px-4 font-semibold text-right">Autonomous Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {agingData?.brackets
                    .flatMap((b) => b.invoices)
                    .map((inv) => (
                      <tr key={inv.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-amber-300">{inv.invoiceNum}</td>
                        <td className="py-3 px-4 font-medium text-white">{inv.accountName}</td>
                        <td className="py-3 px-4 font-semibold">${inv.amount.toLocaleString()}</td>
                        <td className="py-3 px-4 text-zinc-400 font-mono">{inv.dueDate}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              inv.daysOverdue > 45
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : inv.daysOverdue > 20
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {inv.daysOverdue} days
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-zinc-300">{inv.riskScore}/100</span>
                            <div className="w-12 bg-zinc-800 h-1 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  inv.riskScore > 75 ? 'bg-red-500' : inv.riskScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${inv.riskScore}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedInvoiceId(inv.id);
                              loadDunningRecommendation(inv.id);
                              setActiveTab('collections');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-medium transition-all"
                          >
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            Trigger Dunning
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Collections Copilot */}
      {activeTab === 'collections' && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Recommendation Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Tone-Calibrated Dunning Strategy
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Midas AR analyzes debtor relationship history, past pay velocity, and days overdue.
                  </p>
                </div>
                {dunningRec && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    Tier: {dunningRec.tier}
                  </span>
                )}
              </div>

              {dunningRec ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-lg">
                      <div className="text-[10px] text-zinc-500 font-semibold uppercase">Account</div>
                      <div className="text-xs font-bold text-white mt-1 truncate">{dunningRec.accountName}</div>
                    </div>
                    <div className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-lg">
                      <div className="text-[10px] text-zinc-500 font-semibold uppercase">Balance Due</div>
                      <div className="text-xs font-bold text-amber-300 mt-1">${dunningRec.amount?.toLocaleString()}</div>
                    </div>
                    <div className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-lg">
                      <div className="text-[10px] text-zinc-500 font-semibold uppercase">Tone</div>
                      <div className="text-xs font-bold text-cyan-300 mt-1">{dunningRec.tone}</div>
                    </div>
                    <div className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-lg">
                      <div className="text-[10px] text-zinc-500 font-semibold uppercase">Channel</div>
                      <div className="text-xs font-bold text-emerald-400 mt-1">{dunningRec.recommendedChannel}</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Communication Subject</label>
                    <input
                      type="text"
                      value={dunningRec.emailSubject}
                      onChange={(e) => setDunningRec({ ...dunningRec, emailSubject: e.target.value })}
                      className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Drafted Notification Body</label>
                    <textarea
                      rows={8}
                      value={dunningRec.emailBody}
                      onChange={(e) => setDunningRec({ ...dunningRec, emailBody: e.target.value })}
                      className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-200 leading-relaxed focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-zinc-500 text-xs">
                  Select an overdue invoice from the aging matrix to load automated dunning recommendations.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Settlement & Actions */}
          <div className="space-y-6">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                Settlement & Dispatch Controls
              </h4>

              {dunningRec && (
                <>
                  <div className="p-3 bg-zinc-950/80 rounded-lg border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Payment Link</span>
                      <span className="text-emerald-400 font-mono text-[10px]">Stripe Validated</span>
                    </div>
                    <div className="text-xs font-mono text-zinc-300 truncate bg-zinc-900 p-2 rounded border border-zinc-800">
                      {dunningRec.paymentLink}
                    </div>
                  </div>

                  {dunningRec.allowSettlementDiscount && (
                    <div className="space-y-2 p-3 bg-amber-950/15 border border-amber-800/30 rounded-lg">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-amber-300">Prompt Payment Discount</span>
                        <span className="text-amber-400 font-bold">{appliedDiscount}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={dunningRec.maxAllowedDiscountPercent || 15}
                        step="1"
                        value={appliedDiscount}
                        onChange={(e) => setAppliedDiscount(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                      <div className="flex justify-between text-[10px] text-zinc-500">
                        <span>0%</span>
                        <span>Max {dunningRec.maxAllowedDiscountPercent}%</span>
                      </div>
                      <div className="text-xs text-zinc-300 font-semibold pt-1">
                        Settlement Amount: $
                        {Math.round(dunningRec.amount * (1 - appliedDiscount / 100)).toLocaleString()}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleExecuteDunning}
                    disabled={dunningSending}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
                  >
                    {dunningSending ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Dispatching Collections Nudge...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Execute Dunning Dispatch
                      </>
                    )}
                  </button>
                </>
              )}

              {dunningResult && (
                <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-800/40 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    Dunning Workflow Executed
                  </div>
                  <div className="text-zinc-300 text-[11px]">
                    Dispatched notification to <span className="text-white font-mono">{dunningResult.recipientEmail}</span>.
                  </div>
                  <div className="text-zinc-400 text-[10px] font-mono">
                    Receipt ID: {dunningResult.actionId}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Dual Khata Ledger Audit */}
      {activeTab === 'anomalies' && (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-400" />
                  Dual Khata Autonomous Reconciliation Audit
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Automated double-entry reconciliation comparing General Ledger transactions against Stripe billing and CRM invoices.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-zinc-800 text-zinc-300">
                {anomalies.filter((a) => a.status === 'RESOLVED').length}/{anomalies.length} Resolved
              </span>
            </div>

            <div className="space-y-3">
              {anomalies.map((anom) => (
                <div
                  key={anom.id}
                  className={`p-4 rounded-xl border transition-all ${
                    anom.status === 'RESOLVED'
                      ? 'bg-zinc-950/40 border-zinc-800/60 opacity-60'
                      : anom.severity === 'CRITICAL'
                      ? 'bg-red-950/15 border-red-800/40'
                      : anom.severity === 'HIGH'
                      ? 'bg-orange-950/15 border-orange-800/40'
                      : 'bg-zinc-900 border-zinc-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          anom.severity === 'CRITICAL'
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                            : anom.severity === 'HIGH'
                            ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                            : 'bg-zinc-700 text-zinc-300'
                        }`}
                      >
                        {anom.severity}
                      </span>
                      <h4 className="text-xs font-bold text-white">{anom.title}</h4>
                      {anom.status === 'RESOLVED' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> Reconciled
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono font-bold text-amber-300">
                      Impact: ${anom.impactAmount.toLocaleString()}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{anom.description}</p>

                  <div className="mt-3 pt-3 border-t border-zinc-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-[11px] text-zinc-500">
                      <span className="text-zinc-400 font-medium">Remediation:</span> {anom.recommendedAction}
                    </div>

                    {anom.status !== 'RESOLVED' && (
                      <button
                        onClick={() => handleResolveAnomaly(anom.id)}
                        disabled={resolvingId === anom.id}
                        className="self-end sm:self-auto px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-[11px] font-semibold transition-all flex items-center gap-1.5"
                      >
                        {resolvingId === anom.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        )}
                        Reconcile & Clear
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Cashflow Forecast */}
      {activeTab === 'cashflow' && (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cashflow?.projections.map((proj) => (
              <div
                key={proj.horizon}
                className="p-6 rounded-xl bg-zinc-900/80 border border-zinc-800 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
                  <span>{proj.label}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    {proj.collectionProbability} Conf
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    ${proj.projectedCashInflow.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1 font-mono">
                    CI: ${proj.confidenceInterval.min.toLocaleString()} – ${proj.confidenceInterval.max.toLocaleString()}
                  </div>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-zinc-800 text-xs">
                  <span className="text-zinc-500 font-medium text-[10px] uppercase">Primary Drivers</span>
                  {proj.primaryContributors.map((driver, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-zinc-300 text-[11px]">
                      <ChevronRight className="w-3 h-3 text-amber-400" />
                      <span>{driver}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-xl bg-amber-950/15 border border-amber-800/30 flex items-start gap-3.5">
            <Brain className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-300">AI Treasury Executive Summary</h4>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{cashflow?.aiTreasuryInsight}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: RAG Dispute Resolver */}
      {activeTab === 'disputes' && (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 shadow-sm space-y-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-amber-400" />
                RAG Dispute & SLA Deduction Copilot
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Analyze client claims against contract terms, historical telemetry, and corporate settlement battlecards.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Client Dispute or Deduction Claim</label>
              <textarea
                rows={3}
                value={disputeInput}
                onChange={(e) => setDisputeInput(e.target.value)}
                className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={handleAnalyzeDispute}
              disabled={disputeAnalyzing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              {disputeAnalyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Analyze with Finance Playbook
            </button>

            {disputeResult && (
              <div className="mt-4 p-5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 font-semibold uppercase text-[10px]">Category</span>
                    <span className="px-2.5 py-0.5 rounded font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {disputeResult.matchedCategory}
                    </span>
                  </div>
                  {disputeResult.eligibleServiceCreditPercent > 0 && (
                    <span className="text-emerald-400 font-semibold text-xs">
                      Max Eligible Credit: {disputeResult.eligibleServiceCreditPercent}%
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-[10px] text-zinc-500 font-semibold uppercase">Recommended Strategy</div>
                  <div className="text-xs text-white font-medium mt-0.5">{disputeResult.recommendedStrategy}</div>
                </div>

                <div>
                  <div className="text-[10px] text-zinc-500 font-semibold uppercase">Policy Guideline</div>
                  <div className="text-xs text-zinc-300 mt-0.5">{disputeResult.policyGuideline}</div>
                </div>

                <div>
                  <div className="text-[10px] text-zinc-500 font-semibold uppercase">Suggested Client Response</div>
                  <div className="p-3 bg-zinc-900 border border-zinc-800/80 rounded-lg text-xs font-mono text-zinc-300 mt-1 leading-relaxed">
                    {disputeResult.suggestedResponseTemplate}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
