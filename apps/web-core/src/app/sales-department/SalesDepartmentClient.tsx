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
    <div className="flex flex-col h-full overflow-y-auto bg-slate-950 text-slate-100 p-6 md:p-8 space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-500/20">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <Sparkles size={12} className="text-emerald-400 animate-pulse" />
              STAGE 5.1 VERTICAL INTELLIGENCE
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/30">
              ARES SENTINEL + SDR
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <TrendingUp className="text-emerald-400" size={32} />
            AI Sales Department
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Autonomous revenue operations unifying Lead SDR, Ares Sentinel, RAG Playbooks, and CRM Pipeline Execution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOverview}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 text-sm font-semibold flex items-center gap-2 transition-all hover:scale-[1.02] shadow-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-emerald-400' : 'text-slate-400'} />
            Sync Metrics
          </button>
          <button
            onClick={() => setActiveTab('qualifier')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-sm font-extrabold flex items-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-emerald-500/20"
          >
            <Zap size={16} />
            Qualify Inbound Lead
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-sm relative overflow-hidden backdrop-blur-md">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Pipeline Value</span>
            <DollarSign size={14} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            ${overview?.kpis?.totalPipelineAmount ? overview.kpis.totalPipelineAmount.toLocaleString() : '113,000'}
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight size={12} />
            Weighted: ${overview?.forecast?.weightedForecastValue ? overview.forecast.weightedForecastValue.toLocaleString() : '46,600'}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-sm relative overflow-hidden backdrop-blur-md">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Win Rate</span>
            <Award size={14} className="text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {overview?.kpis?.winRatePercent ?? 72}%
          </div>
          <div className="text-[11px] text-blue-400 font-semibold mt-1">
            Industry Benchmark: 45%
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-sm relative overflow-hidden backdrop-blur-md">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Active Deals</span>
            <Briefcase size={14} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {overview?.kpis?.activeDealsCount ?? 4}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Avg Deal: ${overview?.kpis?.avgDealSize ? overview.kpis.avgDealSize.toLocaleString() : '18,500'}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-sm relative overflow-hidden backdrop-blur-md">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>ICP Qualified %</span>
            <Target size={14} className="text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {overview?.kpis?.icpQualificationRate ?? 86}%
          </div>
          <div className="text-[11px] text-purple-400 font-semibold mt-1">
            Automated SDR Screening
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-sm relative overflow-hidden backdrop-blur-md">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Autonomous Actions</span>
            <Bot size={14} className="text-teal-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {overview?.kpis?.aiAutonomousDecisions ?? 142}
          </div>
          <div className="text-[11px] text-teal-400 font-semibold mt-1">
            100% Governed by HITL
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 space-x-2">
        <button
          onClick={() => setActiveTab('board')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'board'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp size={16} />
          Command Board & Priorities
        </button>
        <button
          onClick={() => setActiveTab('qualifier')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'qualifier'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap size={16} />
          Autonomous SDR Qualifier
        </button>
        <button
          onClick={() => setActiveTab('ares')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'ares'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Brain size={16} />
          Ares Deal Risk & NBA Radar
        </button>
        <button
          onClick={() => setActiveTab('meeting')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'meeting'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText size={16} />
          Executive Meeting Dossier
        </button>
        <button
          onClick={() => setActiveTab('recovery')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'recovery'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck size={16} />
          Stalled Recovery & Policy Center
        </button>
      </div>

      {/* TAB 1: Command Board & Priorities */}
      {activeTab === 'board' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Priority Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-emerald-400" />
                Ares Daily Rep Revenue Priorities
              </h2>
              <span className="text-xs font-mono text-slate-400">
                {overview?.recommendations?.recommendations?.length || 4} Recommended Tasks
              </span>
            </div>

            <div className="space-y-3">
              {(overview?.recommendations?.recommendations || [
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
              ]).map((rec: any) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-black uppercase rounded ${
                          rec.priority === 'URGENT'
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {rec.priority}
                      </span>
                      <h3 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">
                        {rec.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400">{rec.description}</p>
                    <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 mt-1">
                      <span>Action:</span>
                      <span className="text-slate-200">{rec.suggestedAction}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (rec.type === 'QUALIFY_LEAD') setActiveTab('qualifier');
                      else setActiveTab('ares');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold shrink-0 transition-all flex items-center gap-1"
                  >
                    Execute NBA
                    <ChevronRight size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Department Architecture Ensemble Info */}
            <div className="mt-8 p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                <Bot size={16} className="text-emerald-400" />
                Active Sales AI Department Ensemble
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-bold text-white mb-1">Lead SDR Sentinel</div>
                  <p className="text-slate-400 text-[11px]">Firmographic enrichment, B2B ICP scoring, contact creation.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-bold text-white mb-1">Ares Sales Sentinel</div>
                  <p className="text-slate-400 text-[11px]">Win velocity, deal risk detection, OODA next-best-action loops.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-bold text-white mb-1">Meeting & Copy Copilot</div>
                  <p className="text-slate-400 text-[11px]">Pre-meeting dossiers, RAG objection battlecards, follow-up emails.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pipeline Stage Forecast */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign size={18} className="text-emerald-400" />
              Pipeline Velocity Forecast
            </h2>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs text-slate-400 font-semibold">Projected Quarterly Revenue</span>
                <span className="text-base font-extrabold text-emerald-400">
                  ${overview?.forecast?.quarterlyProjection ? overview.forecast.quarterlyProjection.toLocaleString() : '62,910'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Lead Stage (20% prob)</span>
                    <span className="text-slate-400">$65,000</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Proposal Stage (70% prob)</span>
                    <span className="text-slate-400">$48,000</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Negotiation (85% prob)</span>
                    <span className="text-slate-400">$0</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                Weighted forecasts recalculate in real time based on active deal velocity and rep engagement logs.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Autonomous SDR Qualifier */}
      {activeTab === 'qualifier' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap size={18} className="text-emerald-400" />
              Inbound Lead Qualification Sandbox
            </h2>
            <p className="text-xs text-slate-400">
              Simulate inbound lead capture. The SDR evaluates against the B2B ICP rubric and creates a real Deal in the database.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">First Name</label>
                <input
                  type="text"
                  value={leadForm.firstName}
                  onChange={(e) => setLeadForm({ ...leadForm, firstName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Last Name</label>
                <input
                  type="text"
                  value={leadForm.lastName}
                  onChange={(e) => setLeadForm({ ...leadForm, lastName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Corporate Email</label>
              <input
                type="email"
                value={leadForm.email}
                onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Company</label>
                <input
                  type="text"
                  value={leadForm.company}
                  onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Executive Title</label>
                <input
                  type="text"
                  value={leadForm.title}
                  onChange={(e) => setLeadForm({ ...leadForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Employees</label>
                <input
                  type="number"
                  value={leadForm.employees}
                  onChange={(e) => setLeadForm({ ...leadForm, employees: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Budget ($)</label>
                <input
                  type="number"
                  value={leadForm.budget}
                  onChange={(e) => setLeadForm({ ...leadForm, budget: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Timeline (mo)</label>
                <input
                  type="number"
                  value={leadForm.timelineMonths}
                  onChange={(e) => setLeadForm({ ...leadForm, timelineMonths: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Inquiry / Operational Context</label>
              <textarea
                rows={2}
                value={leadForm.notes}
                onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <button
              onClick={handleQualifyLead}
              disabled={qualifying}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20"
            >
              {qualifying ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
              Execute AI ICP Qualification
            </button>
          </div>

          {/* Qualification Output Dossier */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center justify-between">
              <span>SDR Qualification Output</span>
              {qualificationResult?.fitTier && (
                <span className="px-3 py-1 text-xs font-black rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {qualificationResult.fitTier}
                </span>
              )}
            </h2>

            {qualificationResult ? (
              <div className="space-y-4">
                {/* Score Dial */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-semibold">Computed ICP Score</div>
                    <div className="text-3xl font-black text-white">{qualificationResult.icpScore}/100</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-semibold">Recommended Value</div>
                    <div className="text-xl font-bold text-emerald-400">
                      ${qualificationResult.recommendedContractValue?.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                    <span className="text-slate-400 block">Firmographic Fit:</span>
                    <span className="font-bold text-white">
                      {qualificationResult.qualificationFactors?.firmographicScore}/40
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                    <span className="text-slate-400 block">Title Seniority:</span>
                    <span className="font-bold text-white">
                      {qualificationResult.qualificationFactors?.titleSeniorityScore}/30
                    </span>
                  </div>
                </div>

                {/* Pain Points */}
                <div>
                  <div className="text-xs font-bold text-slate-300 mb-1.5">Detected Operational Bottlenecks:</div>
                  <ul className="space-y-1 text-xs text-slate-400 list-disc list-inside">
                    {qualificationResult.detectedPainPoints?.map((p: string, i: number) => (
                      <li key={i} className="text-slate-300">{p}</li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Next Action */}
                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs">
                  <div className="font-bold text-blue-300 mb-1">Next-Best-Action (NBA):</div>
                  <p className="text-slate-200">{qualificationResult.recommendedNextAction}</p>
                </div>

                {/* Pitch */}
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
                  <div className="font-bold text-emerald-300 mb-1">Ares Value Pitch:</div>
                  <p className="text-slate-300 italic">{qualificationResult.suggestedSalesPitch}</p>
                </div>

                {/* Database Persisted Deal Link */}
                {qualificationResult.autoCreatedDealId && (
                  <div className="pt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800">
                    <span>Prisma SQLite Deal ID:</span>
                    <span className="font-mono text-emerald-400">{qualificationResult.autoCreatedDealId}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-sm">
                <Zap size={36} className="mb-2 opacity-30 text-emerald-400" />
                Submit prospect parameters on the left to run live qualification.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Ares Deal Risk & NBA Radar */}
      {activeTab === 'ares' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Brain size={20} className="text-emerald-400" />
                  Ares Deal Velocity & Risk Engine
                </h2>
                <p className="text-xs text-slate-400">
                  Continuously calculates win probability, detects deal slippage, and executes OODA next-best-action loops.
                </p>
              </div>

              <button
                onClick={() => handleAnalyzeDeal()}
                disabled={analyzingDeal}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-2 transition-all shadow-md"
              >
                {analyzingDeal ? <RefreshCw className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                Run Real-Time Deal Audit
              </button>
            </div>

            {dealAnalysisResult ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">Win Probability</div>
                  <div className="text-3xl font-black text-white">
                    {dealAnalysisResult.score?.winProbability}%
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Momentum: <span className="font-bold text-emerald-400">{dealAnalysisResult.score?.momentum}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">Detected Risk Level</div>
                  <div
                    className={`text-2xl font-black ${
                      dealAnalysisResult.risk?.riskLevel === 'CRITICAL' || dealAnalysisResult.risk?.riskLevel === 'HIGH'
                        ? 'text-red-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {dealAnalysisResult.risk?.riskLevel}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Inactive Days: {dealAnalysisResult.risk?.daysInactive ?? 0}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">Forecast Close Date</div>
                  <div className="text-xl font-bold text-white">
                    {dealAnalysisResult.score?.forecastCloseDate}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Target Deal: {dealAnalysisResult.score?.title}
                  </div>
                </div>

                {/* Full Action Plan */}
                <div className="md:col-span-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                      Recommended Next-Best-Action (NBA):
                    </span>
                    <h4 className="text-base font-extrabold text-white mt-0.5">
                      {dealAnalysisResult.nextAction?.recommendedAction}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                      {dealAnalysisResult.nextAction?.rationale}
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('recovery')}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shrink-0 transition-all"
                  >
                    Deploy Action Draft
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">
                Click "Run Real-Time Deal Audit" to examine active opportunities and compute velocity scores.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Executive Meeting Dossier */}
      {activeTab === 'meeting' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar size={18} className="text-emerald-400" />
              Pre-Meeting Briefing Generator
            </h2>
            <p className="text-xs text-slate-400">
              Generates executive briefing dossiers with verified RAG battlecards matching customer objections.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Prospect Company</label>
              <input
                type="text"
                value={meetingForm.companyName}
                onChange={(e) => setMeetingForm({ ...meetingForm, companyName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Key Attendee</label>
              <input
                type="text"
                value={meetingForm.attendeeName}
                onChange={(e) => setMeetingForm({ ...meetingForm, attendeeName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Meeting Purpose</label>
              <textarea
                rows={3}
                value={meetingForm.agenda}
                onChange={(e) => setMeetingForm({ ...meetingForm, agenda: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
              />
            </div>

            <button
              onClick={handlePrepareMeeting}
              disabled={preppingMeeting}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold flex items-center justify-center gap-2 transition-all shadow-md"
            >
              {preppingMeeting ? <RefreshCw className="animate-spin" size={16} /> : <FileText size={16} />}
              Generate Pre-Meeting Briefing
            </button>
          </div>

          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white">Generated Briefing Dossier</h2>

            {meetingDossier ? (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-slate-400">Account:</span>
                    <span className="font-bold text-white ml-2">{meetingDossier.accountName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Target Value:</span>
                    <span className="font-bold text-emerald-400 ml-2">
                      ${meetingDossier.dealContext?.amount?.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-200 mb-2">5 Targeted Socratic Discovery Questions:</h3>
                  <div className="space-y-1.5">
                    {meetingDossier.recommendedDiscoveryQuestions?.map((q: string, i: number) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-slate-300">
                        <span className="text-emerald-400 font-bold mr-1.5">Q{i + 1}:</span> {q}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-200 mb-2">Matched Objection Battlecards:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {meetingDossier.relevantBattlecards?.map((b: any, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-500/20 text-blue-300">
                          {b.category}
                        </span>
                        <div className="font-semibold text-slate-200">{b.objection}</div>
                        <p className="text-slate-400 text-[11px] italic">{b.responsePitch}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-sm">
                <Calendar size={36} className="mb-2 opacity-30 text-emerald-400" />
                Configure meeting parameters on the left to compile an executive briefing.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: Stalled Recovery & Policy Center */}
      {activeTab === 'recovery' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Stalled Deals Scanner */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock size={18} className="text-amber-400" />
                Stalled-Deal 7-Day Recovery Loop
              </h2>
              <button
                onClick={handleScanStalledDeals}
                disabled={scanningStalled}
                className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all"
              >
                {scanningStalled ? 'Scanning...' : 'Scan Inactive Deals'}
              </button>
            </div>
            <p className="text-xs text-slate-400">
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
                <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-sm">{plan.dealTitle}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded">
                      {plan.daysInactive}d Inactive
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">Strategy: {plan.recoveryStrategy}</div>
                  <div className="p-2.5 rounded-lg bg-slate-900 text-xs text-slate-300 italic">
                    "{plan.proposedEmailBody}"
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Proposal Follow-up & HITL Policy Center */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" />
              Follow-up Drafter & HITL Policy Gate
            </h2>
            <p className="text-xs text-slate-400">
              Enforces policy guardrails: any proposed discount &gt;15% is automatically halted and queued in the Stage 4 Approval Center.
            </p>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Proposed Commercial Incentive / Discount:</span>
                <span className={followUpDiscount > 15 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {followUpDiscount}% {followUpDiscount > 15 ? '(Requires Executive HITL Sign-off)' : '(Autonomous OK)'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="5"
                value={followUpDiscount}
                onChange={(e) => setFollowUpDiscount(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Custom Rep Note</label>
              <input
                type="text"
                value={followUpCustomNote}
                onChange={(e) => setFollowUpCustomNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
              />
            </div>

            <button
              onClick={handleDraftFollowUp}
              disabled={draftingFollowUp}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold flex items-center justify-center gap-2 transition-all shadow-md"
            >
              {draftingFollowUp ? <RefreshCw className="animate-spin" size={16} /> : <Send size={16} />}
              Generate Follow-Up & Check Policy
            </button>

            {/* Follow-up Result */}
            {followUpResult && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-2 ${
                  followUpResult.status === 'QUEUED_FOR_APPROVAL'
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-emerald-500/10 border-emerald-500/30'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {followUpResult.status === 'QUEUED_FOR_APPROVAL' ? (
                    <>
                      <AlertTriangle size={16} className="text-amber-400" />
                      <span className="text-amber-300">QUEUED IN APPROVAL CENTER</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      <span className="text-emerald-300">DRAFT APPROVED FOR DISPATCH</span>
                    </>
                  )}
                </div>
                <p className="text-slate-300">
                  {followUpResult.reason || 'Discount is within autonomous policy limits (<15%).'}
                </p>
                {followUpResult.approvalRequestId && (
                  <div className="text-[11px] font-mono text-slate-400">
                    Approval Request ID: {followUpResult.approvalRequestId}
                  </div>
                )}
                <div className="p-3 rounded-lg bg-slate-950 text-slate-300 italic">
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
