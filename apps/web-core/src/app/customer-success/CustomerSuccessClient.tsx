'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Zap,
  Bot,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Users,
  Briefcase,
  ChevronRight,
  Send,
  Calendar,
  FileText,
  RefreshCw,
  Sliders,
  Award,
  ArrowUpRight,
  Target,
  HeartPulse,
  Activity,
  AlertOctagon,
  ShieldAlert,
  HelpCircle,
  BarChart3,
  TrendingDown,
  TrendingUp,
  UserCheck,
} from 'lucide-react';

interface DepartmentOverview {
  department: string;
  name: string;
  description: string;
  architecturePillars: {
    agents: Array<{ id: string; name: string; role: string }>;
    knowledge: {
      playbook: string;
      battlecardCount: number;
      rubrics: string[];
    };
    tools: string[];
    workflows: string[];
    policies: Array<{ ruleId: string; name: string; description: string; enforcement: string; threshold?: number }>;
  };
  kpis: {
    totalAccountsMonitored: number;
    averageHealthScore: number;
    atRiskAccountsCount: number;
    churnProbabilityAvg: number;
    netRevenueRetentionRate: number;
    openEscalationsCount: number;
    proactiveInterventionsDeployed: number;
    atRiskArrTotal: number;
  };
  sentinelStatus: {
    activeSentinel: string;
    loopCadence: string;
    mode: string;
    lastEvaluationTime: string;
  };
}

export function CustomerSuccessClient() {
  const [activeTab, setActiveTab] = useState<'matrix' | 'churn' | 'intervention' | 'escalation' | 'ebr' | 'pillars'>('matrix');
  const [overview, setOverview] = useState<DepartmentOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Health evaluation state
  const [evaluatingHealth, setEvaluatingHealth] = useState(false);
  const [healthData, setHealthData] = useState<any | null>(null);

  // Churn diagnosis state
  const [diagnosingChurn, setDiagnosingChurn] = useState(false);
  const [churnAnalysis, setChurnAnalysis] = useState<any | null>(null);

  // Intervention execution state
  const [concessionPercent, setConcessionPercent] = useState(20);
  const [interventionTaskTitle, setInterventionTaskTitle] = useState('Athena Intervention: Deploy Senior Solutions Architect');
  const [recipientEmail, setRecipientEmail] = useState('vp-tech@apexglobal.example');
  const [executingIntervention, setExecutingIntervention] = useState(false);
  const [interventionResult, setInterventionResult] = useState<any | null>(null);

  // CSM Escalation state
  const [escalationReason, setEscalationReason] = useState('Critical stakeholder unresponsive; milestone delay risking Q4 renewal');
  const [escalating, setEscalating] = useState(false);
  const [escalationResult, setEscalationResult] = useState<any | null>(null);

  // Account scan state
  const [scanningAccounts, setScanningAccounts] = useState(false);
  const [accountScanResult, setAccountScanResult] = useState<any | null>(null);

  // EBR Dossier state
  const [generatingEbr, setGeneratingEbr] = useState(false);
  const [ebrResult, setEbrResult] = useState<any | null>(null);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/departments/cs/overview', {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load department overview`);
      const data = await res.json();
      setOverview(data);
    } catch (err: any) {
      setError(err.message || 'Could not connect to AI Customer Success Department microservice.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleEvaluateHealth = async () => {
    setEvaluatingHealth(true);
    try {
      const res = await fetch('/api/ai/departments/cs/health/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setHealthData(data);
    } catch (err: any) {
      alert(`Health evaluation failed: ${err.message}`);
    } finally {
      setEvaluatingHealth(false);
    }
  };

  const handleDiagnoseChurn = async () => {
    setDiagnosingChurn(true);
    try {
      const res = await fetch('/api/ai/departments/cs/churn/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setChurnAnalysis(data);
    } catch (err: any) {
      alert(`Churn diagnosis failed: ${err.message}`);
    } finally {
      setDiagnosingChurn(false);
    }
  };

  const handleExecuteIntervention = async () => {
    setExecutingIntervention(true);
    try {
      const res = await fetch('/api/ai/departments/cs/intervention/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
        body: JSON.stringify({
          csmTaskTitle: interventionTaskTitle,
          proposedServiceCreditPercent: concessionPercent,
          recipientEmail: recipientEmail,
        }),
      });
      const data = await res.json();
      setInterventionResult(data);
      fetchOverview();
    } catch (err: any) {
      alert(`Intervention deployment failed: ${err.message}`);
    } finally {
      setExecutingIntervention(false);
    }
  };

  const handleEscalateCsm = async () => {
    setEscalating(true);
    try {
      const res = await fetch('/api/ai/departments/cs/escalate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
        body: JSON.stringify({
          reason: escalationReason,
        }),
      });
      const data = await res.json();
      setEscalationResult(data);
      fetchOverview();
    } catch (err: any) {
      alert(`CSM escalation failed: ${err.message}`);
    } finally {
      setEscalating(false);
    }
  };

  const handleScanAllAccounts = async () => {
    setScanningAccounts(true);
    try {
      const res = await fetch('/api/ai/departments/cs/accounts/scan', {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
      });
      const data = await res.json();
      setAccountScanResult(data);
    } catch (err: any) {
      alert(`Account scan failed: ${err.message}`);
    } finally {
      setScanningAccounts(false);
    }
  };

  const handleGenerateEbr = async () => {
    setGeneratingEbr(true);
    try {
      const res = await fetch('/api/ai/departments/cs/ebr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setEbrResult(data);
    } catch (err: any) {
      alert(`EBR generation failed: ${err.message}`);
    } finally {
      setGeneratingEbr(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-slate-950 text-slate-100 p-6 md:p-8 space-y-8 font-sans">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-indigo-500/20">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5">
              <Sparkles size={12} className="text-indigo-400 animate-pulse" />
              STAGE 5.2 VERTICAL INTELLIGENCE
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              ATHENA SENTINEL + OODA RETENTION
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <ShieldCheck className="text-indigo-400" size={32} />
            AI Customer Success Department
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Proactive retention intelligence unifying Athena Sentinel, multi-dimensional health telemetry, root-cause diagnosis, automated interventions, and EBR briefings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOverview}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs font-medium text-slate-300 hover:text-white transition shadow-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-indigo-400' : ''} />
            Sync Telemetry
          </button>
          <div className="px-3.5 py-2 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-indigo-200 font-medium">Athena Sentinel: Active</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-sm flex items-center gap-3">
          <AlertOctagon size={18} className="text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Ribbons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Portfolio Health Index</span>
            <HeartPulse size={18} className="text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white flex items-baseline gap-2">
              {overview?.kpis?.averageHealthScore || 82}
              <span className="text-sm font-normal text-slate-400">/ 100</span>
            </div>
            <div className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <TrendingUp size={12} />
              Healthy Baseline across accounts
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Revenue Retention</span>
            <TrendingUp size={18} className="text-indigo-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-indigo-300">
              {overview?.kpis?.netRevenueRetentionRate || 118}%
            </div>
            <div className="text-xs text-slate-400 mt-1">Target: &gt; 110% benchmark</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">ARR at Churn Risk</span>
            <ShieldAlert size={18} className="text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-amber-300">
              ${(overview?.kpis?.atRiskArrTotal || 36000).toLocaleString()}
            </div>
            <div className="text-xs text-amber-400/90 mt-1">
              {overview?.kpis?.atRiskAccountsCount || 0} flagged accounts under monitoring
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Interventions Deployed</span>
            <Zap size={18} className="text-cyan-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-cyan-300">
              {overview?.kpis?.proactiveInterventionsDeployed || 3}
            </div>
            <div className="text-xs text-slate-400 mt-1">Pre-complaint autonomous actions</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'matrix', label: '1. Health Telemetry Matrix', icon: Activity },
          { id: 'churn', label: '2. Churn Diagnosis & Root Causes', icon: Brain },
          { id: 'intervention', label: '3. Autonomous Interventions & Policy Gate', icon: Zap },
          { id: 'escalation', label: '4. CSM P1 Escalations', icon: AlertTriangle },
          { id: 'ebr', label: '5. Executive Business Review (EBR)', icon: FileText },
          { id: 'pillars', label: 'Department Architecture & 7 Pillars', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: HEALTH TELEMETRY MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity size={20} className="text-indigo-400" />
                Multi-Dimensional Customer Health Engine
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Synthesizes Support Ticket velocity (25 pts), Project Milestone delivery (25 pts), Financial & Payment status (20 pts), and User Activity Signals (30 pts).
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleEvaluateHealth}
                disabled={evaluatingHealth}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/30"
              >
                {evaluatingHealth ? <RefreshCw size={14} className="animate-spin" /> : <HeartPulse size={14} />}
                Audit Primary Account Health
              </button>
              <button
                onClick={handleScanAllAccounts}
                disabled={scanningAccounts}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
              >
                {scanningAccounts ? <RefreshCw size={14} className="animate-spin" /> : <Bot size={14} />}
                Scan All Workspace Accounts
              </button>
            </div>
          </div>

          {healthData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/30 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono uppercase text-indigo-400">Audited Account</span>
                  <h4 className="text-xl font-black text-white mt-1">{healthData.accountName}</h4>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-4xl font-black text-emerald-400">{healthData.healthScore}</span>
                    <span className="text-sm text-slate-400">/ 100 Health Score</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      healthData.healthTier === 'EXCELLENT' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      healthData.healthTier === 'GOOD' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      healthData.healthTier === 'AT_RISK' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {healthData.healthTier}
                    </span>
                    <span className="text-xs text-slate-400">Trend: {healthData.trend}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-1">
                  <div>Open Tickets: <span className="text-white font-semibold">{healthData.openTicketsCount}</span></div>
                  <div>Critical Tickets: <span className="text-white font-semibold">{healthData.openCriticalTicketsCount}</span></div>
                  <div>Overdue Invoices: <span className="text-white font-semibold">{healthData.overdueInvoicesCount}</span></div>
                </div>
              </div>

              <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Multi-Dimensional Scoring Breakdown</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Support Ticket Quality</span>
                      <span className="text-emerald-400 font-bold">{healthData.metricsBreakdown?.supportTicketScore} / 25 pts</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(healthData.metricsBreakdown?.supportTicketScore / 25) * 100}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">Zero unresolved P1 blockers</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Project Milestone Delivery</span>
                      <span className="text-indigo-400 font-bold">{healthData.metricsBreakdown?.projectDeliveryScore} / 25 pts</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(healthData.metricsBreakdown?.projectDeliveryScore / 25) * 100}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">Milestones pacing on schedule</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Financial & Payment Status</span>
                      <span className="text-cyan-400 font-bold">{healthData.metricsBreakdown?.financialScore} / 20 pts</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${(healthData.metricsBreakdown?.financialScore / 20) * 100}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">Invoices settled within terms</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">User Activity & Engagement</span>
                      <span className="text-amber-400 font-bold">{healthData.metricsBreakdown?.engagementScore} / 30 pts</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(healthData.metricsBreakdown?.engagementScore / 30) * 100}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">Recent activity touches recorded</p>
                  </div>
                </div>

                <div className="pt-2">
                  <h5 className="text-xs font-semibold text-slate-300 mb-2">Key Diagnostic Signals Detected</h5>
                  <div className="flex flex-wrap gap-2">
                    {healthData.keySignals?.map((sig: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] text-slate-300 border border-slate-700">
                        {sig}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {accountScanResult && (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  Fleet Account Audit Results ({accountScanResult.totalAccountsScanned} Accounts Audited)
                </h4>
                <span className="text-xs text-emerald-400 font-medium">{accountScanResult.healthyAccountsCount} Healthy • {accountScanResult.atRiskAccountsCount} At-Risk</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Account</th>
                      <th className="py-2.5 px-4 font-semibold">Health Score</th>
                      <th className="py-2.5 px-4 font-semibold">Status Tier</th>
                      <th className="py-2.5 px-4 font-semibold">Trend</th>
                      <th className="py-2.5 px-4 font-semibold">Last Signal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {accountScanResult.accounts?.map((acc: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-medium text-white">{acc.accountName}</td>
                        <td className="py-3 px-4 font-bold text-emerald-400">{acc.healthScore}/100</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                            {acc.healthTier}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">{acc.trend}</td>
                        <td className="py-3 px-4 text-slate-400">{acc.keySignals?.[0] || 'Nominal'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CHURN PREDICTOR & ROOT CAUSE BATTLECARDS */}
      {activeTab === 'churn' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Brain size={20} className="text-indigo-400" />
                Proactive Churn Predictor & Root Cause Engine
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Athena Sentinel diagnoses pre-complaint churn risks against 5 battlecard domains: Onboarding Stall, Sponsor Departure, Adoption Plateau, Support Strain, and Renewal Hesitation.
              </p>
            </div>
            <button
              onClick={handleDiagnoseChurn}
              disabled={diagnosingChurn}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/30"
            >
              {diagnosingChurn ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
              Run Churn Prediction & Diagnosis
            </button>
          </div>

          {churnAnalysis ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Churn Probability</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    churnAnalysis.urgencyLevel === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                    churnAnalysis.urgencyLevel === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  }`}>
                    {churnAnalysis.urgencyLevel} URGENCY
                  </span>
                </div>
                <div className="text-4xl font-black text-amber-400">
                  {churnAnalysis.churnProbability}%
                </div>
                <p className="text-xs text-slate-400">
                  Calculated using multi-dimensional telemetry, support sentiment, and velocity delta.
                </p>

                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-300">Leading Risk Indicators</span>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    {churnAnalysis.leadingRiskIndicators?.map((ind: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-indigo-500/30 space-y-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      IDENTIFIED ROOT CAUSE
                    </span>
                    <span className="text-xs font-mono text-slate-400">{churnAnalysis.primaryRootCause}</span>
                  </div>
                  <h4 className="text-xl font-extrabold text-white mt-2">
                    {churnAnalysis.recommendedIntervention}
                  </h4>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {churnAnalysis.rootCauseDetails}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Send size={12} className="text-indigo-400" />
                      Athena Pre-Drafted Proactive Outreach Email
                    </span>
                    <span className="text-[11px] text-slate-500">Auto-Generated</span>
                  </div>
                  <div className="text-xs font-medium text-indigo-200">
                    Subject: {churnAnalysis.preDraftedEmailSubject}
                  </div>
                  <div className="text-xs text-slate-400 whitespace-pre-wrap font-sans bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                    {churnAnalysis.preDraftedEmailBody}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400">
                    Recommended CSM Next-Step: <strong className="text-slate-200">{churnAnalysis.recommendedCsmAction}</strong>
                  </span>
                  <button
                    onClick={() => {
                      setActiveTab('intervention');
                      setInterventionTaskTitle(`Intervention: ${churnAnalysis.recommendedIntervention}`);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
                  >
                    Deploy Intervention <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-500 text-sm">
              Click &quot;Run Churn Prediction &amp; Diagnosis&quot; to execute real-time telemetry analysis for primary accounts.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AUTONOMOUS INTERVENTIONS & POLICY GATE */}
      {activeTab === 'intervention' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap size={20} className="text-cyan-400" />
              Autonomous Intervention OODA Loop &amp; Concession Gate
            </h3>
            <p className="text-xs text-slate-400">
              Athena Sentinel dispatches corrective actions (creating tasks, logging timeline records, dispatching outreach).
              Retention credits and concessions greater than 15% strictly halt the execution and trigger the Human-in-the-Loop (HITL) Executive Approval Center.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Intervention Deployment Form</h4>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Intervention Task Title</label>
                <input
                  type="text"
                  value={interventionTaskTitle}
                  onChange={(e) => setInterventionTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Recipient / Stakeholder Email</label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400">Proposed Retention Service Credit Concession:</span>
                  <span className={`font-bold ${concessionPercent > 15 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {concessionPercent}% {concessionPercent > 15 && '(Triggers HITL Executive Approval)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={concessionPercent}
                  onChange={(e) => setConcessionPercent(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>0% (Autonomous)</span>
                  <span className="text-amber-400 font-semibold">15% Autonomous Threshold</span>
                  <span>50% Max</span>
                </div>
              </div>

              <button
                onClick={handleExecuteIntervention}
                disabled={executingIntervention}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                {executingIntervention ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                Deploy Autonomous Retention Intervention
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Live Execution Telemetry</h4>
                {interventionResult ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          interventionResult.status === 'QUEUED_FOR_APPROVAL'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {interventionResult.status}
                        </span>
                        <span className="text-xs text-slate-400">{interventionResult.accountName}</span>
                      </div>

                      {interventionResult.status === 'QUEUED_FOR_APPROVAL' ? (
                        <div className="text-xs text-amber-200 mt-2 space-y-1">
                          <p className="font-semibold flex items-center gap-1">
                            <AlertTriangle size={13} className="text-amber-400" />
                            HITL Policy Gate Activated:
                          </p>
                          <p className="text-slate-300">{interventionResult.reason}</p>
                          <p className="text-[11px] text-slate-500 font-mono">Approval Request ID: {interventionResult.approvalRequestId}</p>
                        </div>
                      ) : (
                        <div className="text-xs text-emerald-200 mt-2 space-y-1">
                          <p className="font-semibold flex items-center gap-1">
                            <CheckCircle2 size={13} className="text-emerald-400" />
                            Intervention Deployed Autonomously:
                          </p>
                          <p className="text-slate-300 font-mono text-[11px]">Task #{interventionResult.taskId} scheduled on CSM board.</p>
                          <p className="text-[11px] text-slate-400">Timeline activity note generated. Follow-up dispatched.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    No intervention executed in this session. Configure the parameters on the left to test the OODA loop and policy gates.
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-[11px] text-slate-400 space-y-1">
                <strong className="text-indigo-300">Policy Rule #CS_POL_02:</strong> Autonomous concessions are strictly bounded. Any service credit or discount exceeding 15% requires formal human executive sign-off in the Approval Center.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CSM P1 ESCALATIONS */}
      {activeTab === 'escalation' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-400" />
              Autonomous CSM P1 Escalation Desk
            </h3>
            <p className="text-xs text-slate-400">
              When automated interventions fail or sentiment deteriorates sharply, Athena elevates the case to human CSM leads with priority dispatch.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Escalation Justification / Trigger</label>
                <textarea
                  rows={4}
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={handleEscalateCsm}
                disabled={escalating}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2"
              >
                {escalating ? <RefreshCw size={14} className="animate-spin" /> : <AlertTriangle size={14} />}
                Trigger CSM P1 Autonomous Escalation
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Escalation Dispatch Status</h4>
              {escalationResult ? (
                <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {escalationResult.status}
                    </span>
                    <span className="text-xs text-slate-300">{escalationResult.accountName}</span>
                  </div>
                  <p className="text-xs text-slate-300">{escalationResult.message}</p>
                  <p className="text-[11px] text-slate-500 font-mono">Assigned CSM Task ID: {escalationResult.assignedTaskId}</p>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Escalation desk ready. No active emergency triggers sent.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: EXECUTIVE BUSINESS REVIEW (EBR) */}
      {activeTab === 'ebr' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText size={20} className="text-indigo-400" />
                Executive Business Review (EBR) Dossier Generator
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Generates C-suite ready retention dossiers featuring quantified platform ROI, hours saved, adoption milestones, and expansion blueprints.
              </p>
            </div>
            <button
              onClick={handleGenerateEbr}
              disabled={generatingEbr}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/30"
            >
              {generatingEbr ? <RefreshCw size={14} className="animate-spin" /> : <Award size={14} />}
              Generate EBR Briefing Dossier
            </button>
          </div>

          {ebrResult ? (
            <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/30 border border-indigo-500/30 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
                <div>
                  <span className="text-xs font-mono uppercase text-indigo-400">Quarterly Executive Briefing</span>
                  <h4 className="text-2xl font-black text-white mt-1">{ebrResult.accountName}</h4>
                  <p className="text-xs text-slate-400">{ebrResult.period}</p>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto">
                  <CheckCircle2 size={14} />
                  {ebrResult.executiveSummary}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400">Monthly Hours Saved</span>
                  <div className="text-2xl font-black text-indigo-400 mt-1">
                    {ebrResult.keySuccessMetrics?.manualHoursSavedPerMonth} hrs/mo
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400">Ticket Resolution Speed</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    {ebrResult.keySuccessMetrics?.ticketResolutionVelocityImprovement}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400">Product Adoption Rate</span>
                  <div className="text-2xl font-black text-cyan-400 mt-1">
                    {ebrResult.keySuccessMetrics?.adoptionRatePercent}%
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Key Milestones Achieved</h5>
                <ul className="space-y-2 text-xs text-slate-300">
                  {ebrResult.milestonesAchieved?.map((m: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Recommended Expansion Opportunities</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ebrResult.recommendedExpansionOpportunities?.map((exp: any, i: number) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/20 text-xs">
                      <div className="flex justify-between font-bold text-white mb-1">
                        <span>{exp.title}</span>
                        <span className="text-emerald-400">+{exp.potentialMrrLift} MRR</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{exp.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-500 text-sm">
              Click &quot;Generate EBR Briefing Dossier&quot; to formulate executive review content.
            </div>
          )}
        </div>
      )}

      {/* TAB 6: 7 PILLARS ARCHITECTURE */}
      {activeTab === 'pillars' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck size={20} className="text-indigo-400" />
              Customer Success Department: 7-Pillar Architecture
            </h3>
            <p className="text-xs text-slate-400">
              Stage 5 converts generic AI bots into deeply unified enterprise departments with 7 persistent pillars: Agents, Knowledge, Tools, Workflows, KPIs, Policies, and Memory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <Bot size={15} /> Pillar 1: Specialized Agent Ensemble
              </h4>
              <div className="space-y-2.5">
                {overview?.architecturePillars?.agents?.map((ag) => (
                  <div key={ag.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <div className="font-bold text-white">{ag.name}</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">{ag.role}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Brain size={15} /> Pillar 2: RAG Playbook &amp; Battlecards
              </h4>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div className="font-semibold text-white">{overview?.architecturePillars?.knowledge?.playbook}</div>
                <div className="text-slate-400 text-[11px]">
                  5 Churn Battlecards indexed in vector memory (Onboarding Stall, Sponsor Departure, Adoption Plateau, Support Strain, Renewal Hesitation).
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {overview?.architecturePillars?.knowledge?.rubrics?.map((r, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-900 text-[10px] text-cyan-300 border border-cyan-500/20">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Sliders size={15} /> Pillar 4 &amp; 6: Policies &amp; HITL Approval Gates
              </h4>
              <div className="space-y-2.5">
                {overview?.architecturePillars?.policies?.map((pol) => (
                  <div key={pol.ruleId} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <div className="flex justify-between font-bold text-white">
                      <span>{pol.name}</span>
                      <span className="text-[10px] text-amber-400">{pol.enforcement}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-1">{pol.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Zap size={15} /> Pillar 3 &amp; 5: Tools &amp; Autonomous Workflows
              </h4>
              <div className="space-y-2">
                <span className="text-[11px] text-slate-400 font-semibold">Allowed Microservice Tools:</span>
                <div className="flex flex-wrap gap-1.5">
                  {overview?.architecturePillars?.tools?.map((tool, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-950 text-[10px] text-emerald-300 font-mono border border-emerald-500/20">
                      {tool}
                    </span>
                  ))}
                </div>
                <div className="pt-2">
                  <span className="text-[11px] text-slate-400 font-semibold">Registered Workflows:</span>
                  <ul className="mt-1 space-y-1 text-xs text-slate-300">
                    {overview?.architecturePillars?.workflows?.map((wf, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <ChevronRight size={12} className="text-emerald-400" />
                        <span>{wf}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
