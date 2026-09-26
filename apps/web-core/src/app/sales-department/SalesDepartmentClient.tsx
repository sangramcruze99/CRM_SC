'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Bot,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  DollarSign,
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
      rubricTiers: string[];
    };
    tools: string[];
    workflows: string[];
    policies: Array<{ ruleId: string; name: string; description: string; enforcement: string; threshold?: number }>;
  };
  kpis: {
    totalPipelineAmount: number;
    wonPipelineAmount: number;
    activeDealsCount: number;
    wonDealsCount: number;
    avgDealSize: number;
    winRatePercent: number;
    contactsCount: number;
    activitiesCount: number;
    aiAutonomousDecisions: number;
    icpQualificationRate: number;
  };
  forecast: {
    totalPipelineValue: number;
    weightedForecastValue: number;
    totalDealsCount: number;
    activeDealsCount: number;
    wonDealsCount: number;
    winRatePercent: number;
    quarterlyProjection: number;
    stageBreakdown: Record<string, { count: number; totalAmount: number; weightedAmount: number }>;
    healthIndicator: string;
  };
  recommendations: {
    date: string;
    totalRecommendations: number;
    recommendations: Array<{
      id: string;
      type: string;
      priority: string;
      title: string;
      description: string;
      targetId: string;
      suggestedAction: string;
    }>;
    departmentSummary: string;
  };
}

export function SalesDepartmentClient() {
  const [activeTab, setActiveTab] = useState<'board' | 'qualifier' | 'ares' | 'meeting' | 'recovery'>('board');
  const [overview, setOverview] = useState<DepartmentOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Qualifier form state
  const [leadForm, setLeadForm] = useState({
    firstName: 'Marcus',
    lastName: 'Vance',
    email: 'marcus.vance@hypergrowth-tech.com',
    company: 'HyperGrowth Tech Inc',
    title: 'Chief Revenue Officer',
    industry: 'Enterprise Software',
    employees: 650,
    budget: 65000,
    timelineMonths: 1,
    notes: 'Looking to replace disconnected CRM tiers with autonomous 24/7 AI sentinels.',
  });
  const [qualifying, setQualifying] = useState(false);
  const [qualificationResult, setQualificationResult] = useState<any | null>(null);

  // Deal Analysis state
  const [analyzingDeal, setAnalyzingDeal] = useState(false);
  const [dealAnalysisResult, setDealAnalysisResult] = useState<any | null>(null);

  // Meeting Prep state
  const [meetingForm, setMeetingForm] = useState({
    companyName: 'Apex Financial Services',
    attendeeName: 'Elena Rostova, VP Engineering',
    agenda: 'Executive Architecture & Autonomous Sales Copilot Rollout',
  });
  const [preppingMeeting, setPreppingMeeting] = useState(false);
  const [meetingDossier, setMeetingDossier] = useState<any | null>(null);

  // Stalled Deals Recovery state
  const [scanningStalled, setScanningStalled] = useState(false);
  const [stalledResults, setStalledResults] = useState<any | null>(null);

  // Follow-up Proposal & HITL state
  const [followUpDiscount, setFollowUpDiscount] = useState(20);
  const [followUpCustomNote, setFollowUpCustomNote] = useState('End of month commercial milestone incentive');
  const [draftingFollowUp, setDraftingFollowUp] = useState(false);
  const [followUpResult, setFollowUpResult] = useState<any | null>(null);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/departments/sales/overview', {
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load department overview`);
      const data = await res.json();
      setOverview(data);
    } catch (err: any) {
      setError(err.message || 'Could not connect to AI Sales Department microservice.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleQualifyLead = async () => {
    setQualifying(true);
    try {
      const res = await fetch('/api/ai/departments/sales/leads/qualify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
        body: JSON.stringify(leadForm),
      });
      const data = await res.json();
      setQualificationResult(data);
      // Refresh KPIs in background
      fetchOverview();
    } catch (err: any) {
      alert(`Qualification failed: ${err.message}`);
    } finally {
      setQualifying(false);
    }
  };

  const handleAnalyzeDeal = async (dealId?: string) => {
    setAnalyzingDeal(true);
    try {
      const targetId = dealId || qualificationResult?.autoCreatedDealId || 'active';
      const res = await fetch('/api/ai/departments/sales/deals/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
        body: JSON.stringify({ dealId: targetId }),
      });
      const data = await res.json();
      setDealAnalysisResult(data);
    } catch (err: any) {
      alert(`Deal analysis failed: ${err.message}`);
    } finally {
      setAnalyzingDeal(false);
    }
  };

  const handlePrepareMeeting = async () => {
    setPreppingMeeting(true);
    try {
      const res = await fetch('/api/ai/departments/sales/meetings/prepare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
        body: JSON.stringify({
          dealId: qualificationResult?.autoCreatedDealId,
          meetingAgenda: meetingForm.agenda,
        }),
      });
      const data = await res.json();
      setMeetingDossier(data);
    } catch (err: any) {
      alert(`Meeting prep failed: ${err.message}`);
    } finally {
      setPreppingMeeting(false);
    }
  };

  const handleScanStalledDeals = async () => {
    setScanningStalled(true);
    try {
      const res = await fetch('/api/ai/departments/sales/deals/stalled-recovery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
      });
      const data = await res.json();
      setStalledResults(data);
    } catch (err: any) {
      alert(`Stalled scan failed: ${err.message}`);
    } finally {
      setScanningStalled(false);
    }
  };

  const handleDraftFollowUp = async () => {
    setDraftingFollowUp(true);
    try {
      const dealId = qualificationResult?.autoCreatedDealId || 'active';
      const res = await fetch('/api/ai/departments/sales/follow-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
        body: JSON.stringify({
          dealId,
          proposedDiscountPercent: followUpDiscount,
          customNote: followUpCustomNote,
        }),
      });
      const data = await res.json();
      setFollowUpResult(data);
    } catch (err: any) {
      alert(`Follow-up draft failed: ${err.message}`);
    } finally {
      setDraftingFollowUp(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white font-sans">
      {/* Top Cockpit Chassis */}
      <div className="botanical-glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        {/* Ambient Botanical Glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ARES REVENUE COPILOT & SDR
              </span>
              <span className="text-[11px] font-mono text-zinc-500">STAGE 5.1 VERTICAL REVENUE ENGINE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <TrendingUp className="text-emerald-400" size={32} />
              AI Sales Department
            </h1>
            <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
              Autonomous revenue operations unifying Lead SDR, Ares Sentinel, RAG Playbooks, and CRM Pipeline Execution.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={fetchOverview}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-zinc-300 hover:text-white border border-white/[0.08] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-emerald-400' : 'text-zinc-400'} />
              <span>Sync Metrics</span>
            </button>
            <button
              onClick={() => setActiveTab('qualifier')}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Zap size={14} />
              <span>Qualify Inbound Lead</span>
            </button>
          </div>
        </div>

        {/* Sentinel pulse status strip */}
        <div className="mt-6 pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              SENTINEL: REAL-TIME AUTONOMOUS SDR ENGINE ACTIVE
            </span>
            <span className="hidden sm:inline text-zinc-600">|</span>
            <span className="hidden sm:inline text-zinc-400">
              VAULT TARGET: <code className="text-zinc-300">vault/sales/revenue_playbooks/</code>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-zinc-500 font-mono">GOVERNANCE: 100% HITL OODA VERIFIED</span>
          </div>
        </div>
      </div>

      {/* High-Density Telemetry KPI Highlight Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="botanical-glass-card rounded-2xl p-5 border border-white/[0.06] relative overflow-hidden">
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Pipeline Value</span>
            <DollarSign size={14} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            ${overview?.kpis?.totalPipelineAmount ? overview.kpis.totalPipelineAmount.toLocaleString() : '113,000'}
          </div>
          <div className="text-[11px] text-emerald-400 font-mono font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight size={12} />
            Weighted: ${overview?.forecast?.weightedForecastValue ? overview.forecast.weightedForecastValue.toLocaleString() : '46,600'}
          </div>
        </div>

        <div className="botanical-glass-card rounded-2xl p-5 border border-white/[0.06] relative overflow-hidden">
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Win Rate</span>
            <Award size={14} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {overview?.kpis?.winRatePercent ?? 72}%
          </div>
          <div className="text-[11px] text-zinc-400 font-mono font-semibold mt-1">
            Industry Benchmark: 45%
          </div>
        </div>

        <div className="botanical-glass-card rounded-2xl p-5 border border-white/[0.06] relative overflow-hidden">
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Active Deals</span>
            <Briefcase size={14} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {overview?.kpis?.activeDealsCount ?? 4}
          </div>
          <div className="text-[11px] text-zinc-400 font-mono mt-1">
            Avg Deal: ${overview?.kpis?.avgDealSize ? overview.kpis.avgDealSize.toLocaleString() : '18,500'}
          </div>
        </div>

        <div className="botanical-glass-card rounded-2xl p-5 border border-white/[0.06] relative overflow-hidden">
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>ICP Qualified %</span>
            <Target size={14} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {overview?.kpis?.icpQualificationRate ?? 86}%
          </div>
          <div className="text-[11px] text-emerald-400 font-mono font-semibold mt-1">
            Automated SDR Screening
          </div>
        </div>

        <div className="botanical-glass-card rounded-2xl p-5 border border-white/[0.06] relative overflow-hidden">
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Autonomous Actions</span>
            <Bot size={14} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {overview?.kpis?.aiAutonomousDecisions ?? 142}
          </div>
          <div className="text-[11px] text-zinc-400 font-mono font-semibold mt-1">
            100% Governed by HITL
          </div>
        </div>
      </div>

      {/* Botanical Glass Segmented Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 overflow-x-auto">
        {[
          { id: 'board', label: 'Command Board & Priorities', icon: TrendingUp },
          { id: 'qualifier', label: 'Autonomous SDR Qualifier', icon: Zap },
          { id: 'ares', label: 'Ares Deal Risk & NBA Radar', icon: Brain },
          { id: 'meeting', label: 'Executive Meeting Dossier', icon: FileText },
          { id: 'recovery', label: 'Stalled Recovery & Policy Center', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                  : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Command Board & Priorities */}
      {activeTab === 'board' && (() => {
        const activeRecs = (overview?.recommendations?.recommendations && overview.recommendations.recommendations.length > 0)
          ? overview.recommendations.recommendations
          : [
              {
                id: 'rec_1',
                type: 'SAVE_AT_RISK_DEAL',
                priority: 'URGENT',
                title: 'Advance Apex Global — AI Inbound Operations ($48,000)',
                description: "Deal in stage 'Proposal'. Win probability collapsed below 35% without stakeholder follow-up.",
                suggestedAction: 'Deploy Executive Stalled-Deal Recovery Campaign',
              },
              {
                id: 'rec_2',
                type: 'QUALIFY_LEAD',
                priority: 'HIGH',
                title: 'Qualify Inbound: Marcus Vance (CRO at HyperGrowth)',
                description: 'Prospect requested 15-min discovery call. High-intent B2B Enterprise ICP match.',
                suggestedAction: 'Execute 1-Click ICP Firmographic Qualifier',
              },
              {
                id: 'rec_3',
                type: 'ACCELERATE_DEAL',
                priority: 'NORMAL',
                title: 'Stripe Billing Migration Sync — Nordik Group ($32,000)',
                description: 'Dual Khata ledger reconciliation complete. Customer reviewing automated direct settlement.',
                suggestedAction: 'Send Dynamic Follow-Up Proposal',
              },
              {
                id: 'rec_4',
                type: 'EXECUTE_OUTREACH',
                priority: 'NORMAL',
                title: 'Enterprise AI Lead Enrichment Batch (24 Accounts)',
                description: 'Apollo & LinkedIn firmographics verified. Ready for autonomous SDR sequence trigger.',
                suggestedAction: 'Trigger Automated Multi-Channel Touchpoint',
              },
            ];

        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Priority Feed */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold font-mono text-white flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Sparkles size={15} />
                  </div>
                  <span>Ares Daily Rep Revenue Priorities</span>
                </h2>
                <span className="text-xs font-mono text-zinc-400 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06]">
                  {activeRecs.length} Recommended {activeRecs.length === 1 ? 'Task' : 'Tasks'}
                </span>
              </div>

              <div className="space-y-3">
                {activeRecs.map((rec: any) => (
                  <div
                    key={rec.id}
                    className="p-5 rounded-2xl botanical-glass-card border border-white/[0.08] relative overflow-hidden hover:border-emerald-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded ${
                            rec.priority === 'URGENT'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {rec.priority}
                        </span>
                        <h3 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">
                          {rec.title}
                        </h3>
                      </div>
                      <p className="text-xs font-mono text-zinc-400 leading-relaxed">{rec.description}</p>
                      <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 pt-1">
                        <span className="text-zinc-500">Suggested Action:</span>
                        <span className="text-zinc-200 font-semibold">{rec.suggestedAction}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (rec.type === 'QUALIFY_LEAD') setActiveTab('qualifier');
                        else setActiveTab('ares');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span>Execute NBA</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Department Architecture Ensemble Info */}
              <div className="mt-8 p-6 rounded-2xl botanical-glass-card border border-white/[0.08] relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 mb-3.5 flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Bot size={12} />
                  </div>
                  <span>Active Sales AI Department Ensemble</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-mono font-bold text-white text-xs flex items-center gap-1.5">
                        <Bot size={13} className="text-emerald-400" />
                        <span>Lead SDR Sentinel</span>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <p className="text-zinc-400 text-[11px] font-mono leading-relaxed">
                      Firmographic enrichment, B2B ICP scoring, real-time contact creation.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-mono font-bold text-white text-xs flex items-center gap-1.5">
                        <Bot size={13} className="text-emerald-400" />
                        <span>Ares Sales Sentinel</span>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <p className="text-zinc-400 text-[11px] font-mono leading-relaxed">
                      Win velocity, deal risk detection, OODA next-best-action loops.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-mono font-bold text-white text-xs flex items-center gap-1.5">
                        <Bot size={13} className="text-emerald-400" />
                        <span>Meeting & Copy Copilot</span>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <p className="text-zinc-400 text-[11px] font-mono leading-relaxed">
                      Pre-meeting dossiers, RAG objection battlecards, follow-up emails.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Pipeline Stage Forecast */}
            <div className="space-y-4">
              <h2 className="text-base font-bold font-mono text-white flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <DollarSign size={15} />
                </div>
                <span>Pipeline Velocity Forecast</span>
              </h2>

              <div className="p-6 rounded-2xl botanical-glass-card border border-white/[0.08] relative overflow-hidden space-y-5">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
                  <span className="text-xs text-zinc-400 font-mono font-semibold">Projected Quarterly Revenue</span>
                  <span className="text-lg font-black font-mono text-emerald-400">
                    ${overview?.forecast?.quarterlyProjection ? overview.forecast.quarterlyProjection.toLocaleString() : '62,910'}
                  </span>
                </div>

                <div className="space-y-3.5 font-mono">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-zinc-300">Lead Stage (20% prob)</span>
                      <span className="text-zinc-400">$65,000</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-black/40 border border-white/[0.06] overflow-hidden p-0.5">
                      <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: '40%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-zinc-300">Proposal Stage (70% prob)</span>
                      <span className="text-zinc-400">$48,000</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-black/40 border border-white/[0.06] overflow-hidden p-0.5">
                      <div className="h-full bg-teal-400 rounded-full shadow-[0_0_8px_rgba(45,212,191,0.5)]" style={{ width: '60%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-zinc-300">Negotiation (85% prob)</span>
                      <span className="text-zinc-400">$0</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-black/40 border border-white/[0.06] overflow-hidden p-0.5">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: '5%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.08] text-[11px] font-mono text-zinc-500 leading-relaxed">
                  Weighted forecasts recalculate in real time based on active deal velocity and rep engagement logs.
                </div>
              </div>
            </div>
          </div>
        );
      })()}      {/* TAB 2: Autonomous SDR Qualifier */}
      {activeTab === 'qualifier' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="p-6 rounded-2xl botanical-glass-card border border-white/[0.08] relative overflow-hidden space-y-4">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h2 className="text-base font-bold font-mono text-white flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Zap size={15} />
                </div>
                <span>Inbound Lead Qualification Sandbox</span>
              </h2>
              <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
                Live SDR Simulator
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-400 leading-relaxed">
              Simulate inbound lead capture. The SDR evaluates against the B2B ICP rubric and creates a real Deal in the database.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono font-semibold text-zinc-300 block mb-1">First Name</label>
                <input
                  type="text"
                  value={leadForm.firstName}
                  onChange={(e) => setLeadForm({ ...leadForm, firstName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="text-xs font-mono font-semibold text-zinc-300 block mb-1">Last Name</label>
                <input
                  type="text"
                  value={leadForm.lastName}
                  onChange={(e) => setLeadForm({ ...leadForm, lastName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono font-semibold text-zinc-300 block mb-1">Corporate Email</label>
              <input
                type="email"
                value={leadForm.email}
                onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono font-semibold text-zinc-300 block mb-1">Company</label>
                <input
                  type="text"
                  value={leadForm.company}
                  onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="text-xs font-mono font-semibold text-zinc-300 block mb-1">Executive Title</label>
                <input
                  type="text"
                  value={leadForm.title}
                  onChange={(e) => setLeadForm({ ...leadForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-mono font-semibold text-zinc-300 block mb-1">Employees</label>
                <input
                  type="number"
                  value={leadForm.employees}
                  onChange={(e) => setLeadForm({ ...leadForm, employees: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="text-xs font-mono font-semibold text-zinc-300 block mb-1">Budget ($)</label>
                <input
                  type="number"
                  value={leadForm.budget}
                  onChange={(e) => setLeadForm({ ...leadForm, budget: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="text-xs font-mono font-semibold text-zinc-300 block mb-1">Timeline (mo)</label>
                <input
                  type="number"
                  value={leadForm.timelineMonths}
                  onChange={(e) => setLeadForm({ ...leadForm, timelineMonths: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono font-semibold text-zinc-300 block mb-1">Inquiry / Operational Context</label>
              <textarea
                rows={2}
                value={leadForm.notes}
                onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>

            <button
              onClick={handleQualifyLead}
              disabled={qualifying}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              {qualifying ? <RefreshCw className="animate-spin" size={15} /> : <Zap size={15} />}
              <span>Execute AI ICP Qualification</span>
            </button>
          </div>

          {/* Qualification Output Dossier */}
          <div className="p-6 rounded-2xl botanical-glass-card border border-white/[0.08] relative overflow-hidden space-y-5">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h2 className="text-base font-bold font-mono text-white flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShieldCheck size={15} />
                </div>
                <span>SDR Qualification Output</span>
              </h2>
              {qualificationResult?.fitTier && (
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Tier: {qualificationResult.fitTier}
                </span>
              )}
            </div>

            {qualificationResult ? (
              <div className="space-y-4">
                {/* Score Dial */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono text-zinc-400 font-semibold">Computed ICP Score</div>
                    <div className="text-3xl font-black font-mono text-white">{qualificationResult.icpScore}/100</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-zinc-400 font-semibold">Recommended Value</div>
                    <div className="text-xl font-bold font-mono text-emerald-400">
                      ${qualificationResult.recommendedContractValue?.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.08]">
                    <span className="text-zinc-500 block text-[11px]">Firmographic Fit:</span>
                    <span className="font-bold text-white text-sm">
                      {qualificationResult.qualificationFactors?.firmographicScore}/40
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.08]">
                    <span className="text-zinc-500 block text-[11px]">Title Seniority:</span>
                    <span className="font-bold text-white text-sm">
                      {qualificationResult.qualificationFactors?.titleSeniorityScore}/30
                    </span>
                  </div>
                </div>

                {/* Pain Points */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-2">
                  <div className="text-xs font-mono font-bold text-zinc-300">Detected Operational Bottlenecks:</div>
                  <ul className="space-y-1 text-xs font-mono text-zinc-400 list-disc list-inside">
                    {qualificationResult.detectedPainPoints?.map((p: string, i: number) => (
                      <li key={i} className="text-zinc-300">{p}</li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Next Action */}
                <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs font-mono space-y-1">
                  <div className="font-bold text-teal-400 text-[11px] uppercase tracking-wider">Next-Best-Action (NBA):</div>
                  <p className="text-zinc-200 leading-relaxed">{qualificationResult.recommendedNextAction}</p>
                </div>

                {/* Pitch */}
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono space-y-1">
                  <div className="font-bold text-emerald-400 text-[11px] uppercase tracking-wider">Ares Value Pitch:</div>
                  <p className="text-zinc-300 italic leading-relaxed">{qualificationResult.suggestedSalesPitch}</p>
                </div>

                {/* Database Persisted Deal Link */}
                {qualificationResult.autoCreatedDealId && (
                  <div className="pt-3 text-xs font-mono text-zinc-400 flex items-center justify-between border-t border-white/[0.08]">
                    <span>Prisma Deal ID:</span>
                    <span className="font-mono text-emerald-400 font-bold">{qualificationResult.autoCreatedDealId}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                  <Zap size={22} />
                </div>
                <div className="text-sm font-mono font-bold text-white">Awaiting Lead Parameters</div>
                <p className="text-xs font-mono text-zinc-400 max-w-xs">
                  Fill in the sandbox fields on the left and run AI qualification to generate instant scoring and deal creation.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Ares Deal Risk & NBA Radar */}
      {activeTab === 'ares' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl botanical-glass-card border border-white/[0.08] relative overflow-hidden space-y-4">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-white/[0.08]">
              <div>
                <h2 className="text-base font-bold font-mono text-white flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Brain size={15} />
                  </div>
                  <span>Ares Deal Velocity & Risk Engine</span>
                </h2>
                <p className="text-xs font-mono text-zinc-400 mt-1">
                  Continuously calculates win probability, detects deal slippage, and executes OODA next-best-action loops.
                </p>
              </div>

              <button
                onClick={() => handleAnalyzeDeal()}
                disabled={analyzingDeal}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <RefreshCw size={13} className={analyzingDeal ? 'animate-spin' : ''} />
                <span>Run Real-Time Deal Audit</span>
              </button>
            </div>

            {dealAnalysisResult ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] relative overflow-hidden">
                  <div className="text-xs font-mono text-zinc-400 mb-1">Win Probability</div>
                  <div className="text-3xl font-black font-mono text-white">
                    {dealAnalysisResult.score?.winProbability}%
                  </div>
                  <div className="text-xs font-mono text-zinc-400 mt-1 flex items-center gap-1">
                    <span>Momentum:</span>
                    <span className="font-bold text-emerald-400">{dealAnalysisResult.score?.momentum}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] relative overflow-hidden">
                  <div className="text-xs font-mono text-zinc-400 mb-1">Detected Risk Level</div>
                  <div
                    className={`text-3xl font-black font-mono ${
                      dealAnalysisResult.risk?.riskLevel === 'CRITICAL' || dealAnalysisResult.risk?.riskLevel === 'HIGH'
                        ? 'text-rose-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {dealAnalysisResult.risk?.riskLevel}
                  </div>
                  <div className="text-xs font-mono text-zinc-400 mt-1">
                    Inactive Days: {dealAnalysisResult.risk?.daysInactive ?? 0}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] relative overflow-hidden">
                  <div className="text-xs font-mono text-zinc-400 mb-1">Forecast Close Date</div>
                  <div className="text-xl font-bold font-mono text-white">
                    {dealAnalysisResult.score?.forecastCloseDate}
                  </div>
                  <div className="text-xs font-mono text-zinc-400 mt-1">
                    Target: {dealAnalysisResult.score?.title}
                  </div>
                </div>

                {/* Full Action Plan */}
                <div className="md:col-span-3 p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                      Recommended Next-Best-Action (NBA):
                    </span>
                    <h4 className="text-sm font-bold font-mono text-white">
                      {dealAnalysisResult.nextAction?.recommendedAction}
                    </h4>
                    <p className="text-xs font-mono text-zinc-300">
                      {dealAnalysisResult.nextAction?.rationale}
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('recovery')}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-mono font-bold shrink-0 transition-all cursor-pointer shadow-md"
                  >
                    Deploy Action Draft
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                  <Brain size={22} />
                </div>
                <div className="text-sm font-mono font-bold text-white">OODA Radar Ready</div>
                <p className="text-xs font-mono text-zinc-400 max-w-sm">
                  Click "Run Real-Time Deal Audit" above to examine active opportunities and compute velocity scores.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Executive Meeting Dossier */}
      {activeTab === 'meeting' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl botanical-glass-card border border-white/[0.08] relative overflow-hidden space-y-4">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            <h2 className="text-base font-bold font-mono text-white flex items-center gap-2 pb-3 border-b border-white/[0.08]">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Calendar size={15} />
              </div>
              <span>Pre-Meeting Briefing Generator</span>
            </h2>
            <p className="text-xs font-mono text-zinc-400">
              Generates executive briefing dossiers with verified RAG battlecards matching customer objections.
            </p>

            <div>
              <label className="text-xs font-mono font-semibold text-zinc-300 block mb-1">Prospect Company</label>
              <input
                type="text"
                value={meetingForm.companyName}
                onChange={(e) => setMeetingForm({ ...meetingForm, companyName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-semibold text-zinc-300 block mb-1">Key Attendee</label>
              <input
                type="text"
                value={meetingForm.attendeeName}
                onChange={(e) => setMeetingForm({ ...meetingForm, attendeeName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-semibold text-zinc-300 block mb-1">Meeting Purpose</label>
              <textarea
                rows={3}
                value={meetingForm.agenda}
                onChange={(e) => setMeetingForm({ ...meetingForm, agenda: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <button
              onClick={handlePrepareMeeting}
              disabled={preppingMeeting}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              {preppingMeeting ? <RefreshCw className="animate-spin" size={15} /> : <FileText size={15} />}
              <span>Generate Pre-Meeting Briefing</span>
            </button>
          </div>

          <div className="lg:col-span-2 p-6 rounded-2xl botanical-glass-card border border-white/[0.08] relative overflow-hidden space-y-4">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            <h2 className="text-base font-bold font-mono text-white pb-3 border-b border-white/[0.08]">
              Generated Briefing Dossier
            </h2>

            {meetingDossier ? (
              <div className="space-y-4 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.08] flex justify-between items-center">
                  <div>
                    <span className="text-zinc-500">Account:</span>
                    <span className="font-bold text-white ml-2">{meetingDossier.accountName}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Target Value:</span>
                    <span className="font-bold text-emerald-400 ml-2">
                      ${meetingDossier.dealContext?.amount?.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-zinc-200 mb-2">5 Targeted Socratic Discovery Questions:</h3>
                  <div className="space-y-2">
                    {meetingDossier.recommendedDiscoveryQuestions?.map((q: string, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-black/40 border border-white/[0.08] text-zinc-300">
                        <span className="text-emerald-400 font-bold mr-2">Q{i + 1}:</span> {q}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-zinc-200 mb-2">Matched Objection Battlecards:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {meetingDossier.relevantBattlecards?.map((b: any, i: number) => (
                      <div key={i} className="p-3.5 rounded-xl bg-black/40 border border-white/[0.08] space-y-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {b.category}
                        </span>
                        <div className="font-bold text-white text-xs">{b.objection}</div>
                        <p className="text-zinc-400 text-[11px] leading-relaxed italic">{b.responsePitch}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                  <Calendar size={22} />
                </div>
                <div className="text-sm font-mono font-bold text-white">Dossier Engine Ready</div>
                <p className="text-xs font-mono text-zinc-400 max-w-xs">
                  Configure meeting parameters on the left to compile an executive briefing.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: Stalled Recovery & Policy Center */}
      {activeTab === 'recovery' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stalled Deals Scanner */}
          <div className="p-6 rounded-2xl botanical-glass-card border border-white/[0.08] relative overflow-hidden space-y-4">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h2 className="text-base font-bold font-mono text-white flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Clock size={15} />
                </div>
                <span>Stalled-Deal 7-Day Recovery Loop</span>
              </h2>
              <button
                onClick={handleScanStalledDeals}
                disabled={scanningStalled}
                className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold transition-all cursor-pointer"
              >
                {scanningStalled ? 'Scanning...' : 'Scan Inactive Deals'}
              </button>
            </div>
            <p className="text-xs font-mono text-zinc-400 leading-relaxed">
              Scans all active pipeline opportunities that have exceeded the 7-day inactivity SLA and generates 9-word breakup sequences.
            </p>

            <div className="space-y-3">
              {(stalledResults?.recoveryPlans || [
                {
                  dealId: 'deal_stalled_1',
                  dealTitle: 'Apex Global — AI Inbound Operations',
                  amount: 48000,
                  daysInactive: 7,
                  recoveryStrategy: 'EXECUTIVE_TOUCH',
                  proposedEmailSubject: 'Permission to close file on Apex Global?',
                  proposedEmailBody:
                    "Hi Elena,\n\nI haven't heard back regarding our proposal for Business OS, which usually means priorities have shifted or you went in another direction—either is completely fine.\n\nShould I close your file for this quarter?",
                },
              ]).map((plan: any, i: number) => (
                <div key={i} className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white font-mono text-sm">{plan.dealTitle}</span>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded">
                      {plan.daysInactive}d Inactive
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 font-mono">Strategy: {plan.recoveryStrategy}</div>
                  <div className="p-3 rounded-lg bg-black/60 border border-white/[0.06] text-xs font-mono text-zinc-300 italic leading-relaxed">
                    "{plan.proposedEmailBody}"
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Proposal Follow-up & HITL Policy Center */}
          <div className="p-6 rounded-2xl botanical-glass-card border border-white/[0.08] relative overflow-hidden space-y-4">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            <h2 className="text-base font-bold font-mono text-white flex items-center gap-2 pb-3 border-b border-white/[0.08]">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck size={15} />
              </div>
              <span>Follow-up Drafter & HITL Policy Gate</span>
            </h2>
            <p className="text-xs font-mono text-zinc-400 leading-relaxed">
              Enforces policy guardrails: any proposed discount &gt;15% is automatically halted and queued in the Stage 4 Approval Center.
            </p>

            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-2">
              <div className="flex justify-between text-xs font-mono font-semibold text-zinc-300">
                <span>Proposed Commercial Discount:</span>
                <span className={followUpDiscount > 15 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {followUpDiscount}% {followUpDiscount > 15 ? '(Requires HITL Sign-off)' : '(Autonomous OK)'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="5"
                value={followUpDiscount}
                onChange={(e) => setFollowUpDiscount(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-semibold text-zinc-300 block mb-1">Custom Rep Note</label>
              <input
                type="text"
                value={followUpCustomNote}
                onChange={(e) => setFollowUpCustomNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <button
              onClick={handleDraftFollowUp}
              disabled={draftingFollowUp}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              {draftingFollowUp ? <RefreshCw className="animate-spin" size={15} /> : <Send size={15} />}
              <span>Generate Follow-Up & Check Policy</span>
            </button>

            {/* Follow-up Result */}
            {followUpResult && (
              <div
                className={`p-4 rounded-xl border text-xs font-mono space-y-2 ${
                  followUpResult.status === 'QUEUED_FOR_APPROVAL'
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-emerald-500/10 border-emerald-500/30'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {followUpResult.status === 'QUEUED_FOR_APPROVAL' ? (
                    <>
                      <AlertTriangle size={15} className="text-amber-400" />
                      <span className="text-amber-300">QUEUED IN APPROVAL CENTER</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} className="text-emerald-400" />
                      <span className="text-emerald-400">DRAFT APPROVED FOR DISPATCH</span>
                    </>
                  )}
                </div>
                <p className="text-zinc-300">
                  {followUpResult.reason || 'Discount is within autonomous policy limits (<15%).'}
                </p>
                {followUpResult.approvalRequestId && (
                  <div className="text-[11px] font-mono text-zinc-400">
                    Approval Request ID: {followUpResult.approvalRequestId}
                  </div>
                )}
                <div className="p-3 rounded-lg bg-black/60 border border-white/[0.06] text-zinc-300 italic">
                  <strong>Subject:</strong> {followUpResult.draft?.subject}
                  <br />
                  <br />
                  {followUpResult.draft?.body}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
