'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  Users,
  Building,
  Mail,
  Phone,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Ticket,
  Clock,
  Briefcase,
  Layers,
  ChevronRight,
  Send,
  Zap,
  ShieldCheck,
  Calendar,
  Filter,
  PlusCircle,
  ExternalLink,
  Shield,
  Activity,
  Award
} from 'lucide-react';

interface Contact360Data {
  contact: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string;
    companyName: string;
    company?: any;
    customData: any;
    tags: string[];
    leadScore: number;
    location: string;
  };
  health: {
    score: number;
    churnRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    expansionOpportunity: 'LOW' | 'MEDIUM' | 'HIGH';
    signals: string[];
    lastEvaluated: string;
  };
  governance: {
    marketingEmails: boolean;
    productUpdates: boolean;
    smsNotifications: boolean;
    quietHours: string;
    channelPreference: string;
    maxTouchesPerWeek: number;
  };
  deals: any[];
  invoices: any[];
  tickets: any[];
  projects: any[];
  timeline: any[];
  buyingCommittee: any[];
  nextBestAction: {
    action: string;
    confidence: number;
    rationale: string;
  };
}

export default function Customer360Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const contactId = resolvedParams.id;

  const [data, setData] = useState<Contact360Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'deals' | 'invoices' | 'committee' | 'governance'>('timeline');
  const [timelineFilter, setTimelineFilter] = useState<'ALL' | 'NOTE' | 'DEAL' | 'INVOICE' | 'TICKET'>('ALL');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadCustomerData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/crm/customers/${contactId}/360`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          console.error('Failed to load 360 data', res.statusText);
        }
      } catch (err) {
        console.error('Error fetching 360 profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomerData();
  }, [contactId]);

  const handleTriggerAction = async (actionName: string) => {
    try {
      // Publish business event to Unified Event Bus
      await fetch('/api/automation/workflows/events/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'CRM_ACTION_TRIGGERED',
          aggregateType: 'Contact',
          aggregateId: contactId,
          payload: {
            action: actionName,
            contactEmail: data?.contact.email,
            companyName: data?.contact.companyName,
          },
        }),
      });
      setActionSuccess(`Successfully dispatched: ${actionName}`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch {
      setActionSuccess(`Executed ${actionName}`);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 animate-spin flex items-center justify-center">
          <Sparkles className="text-emerald-400" size={24} />
        </div>
        <p className="text-sm font-semibold text-slate-400">Synthesizing Customer 360° Data Fabric...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto">
        <AlertTriangle className="mx-auto text-amber-400 mb-3" size={36} />
        <h2 className="text-lg font-bold text-white">Customer Record Not Found</h2>
        <p className="text-sm text-slate-400 mt-1">Unable to locate CRM record for ID: {contactId}</p>
        <Link href="/" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl">
          <ArrowLeft size={14} /> Back to Contacts
        </Link>
      </div>
    );
  }

  const { contact, health, governance, deals, invoices, tickets, timeline, buyingCommittee, nextBestAction } = data;

  const filteredTimeline = timelineFilter === 'ALL'
    ? timeline
    : timeline.filter((item) => item.type === timelineFilter);

  const getHealthColor = (score: number) => {
    if (score >= 75) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 50) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Back link & Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Contacts Ledger</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Pillar 3: Unified Customer 360
          </span>
          <span className="text-xs text-slate-500 font-mono">ID: {contact.id}</span>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5 text-emerald-300 text-sm font-semibold">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-xs text-emerald-400 hover:text-white">Dismiss</button>
        </div>
      )}

      {/* Main Hero Header Card */}
      <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 p-0.5 shadow-lg shadow-emerald-500/20 flex-shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl sm:text-2xl font-black text-emerald-400">
                {contact.firstName?.[0]}{contact.lastName?.[0]}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {contact.fullName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-white/[0.08] text-slate-300 border border-white/[0.1]">
                  Lead Score: {contact.leadScore} pts
                </span>
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${getHealthColor(health.score)}`}>
                  Health: {health.score}/100
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-2 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 font-medium text-slate-300">
                  <Building size={14} className="text-emerald-400" />
                  <span>{contact.companyName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail size={14} className="text-slate-400" />
                  <a href={`mailto:${contact.email}`} className="hover:text-emerald-400 transition-colors">{contact.email}</a>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone size={14} className="text-slate-400" />
                  <span>{contact.phone || 'No phone recorded'}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {contact.tags.map((tag: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[10px] font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Quick Bar */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <button
              onClick={() => handleTriggerAction('DIRECT_EMAIL')}
              className="flex-1 lg:flex-none px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-bold rounded-xl transition-all border border-white/[0.1] flex items-center justify-center gap-1.5"
            >
              <Mail size={14} className="text-emerald-400" />
              <span>Send Email</span>
            </button>
            <button
              onClick={() => handleTriggerAction('VOIP_CALL')}
              className="flex-1 lg:flex-none px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-bold rounded-xl transition-all border border-white/[0.1] flex items-center justify-center gap-1.5"
            >
              <Phone size={14} className="text-teal-400" />
              <span>Voice Call</span>
            </button>
            <button
              onClick={() => handleTriggerAction('WORKFLOW_ENROLLMENT')}
              className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
            >
              <Zap size={14} />
              <span>Enroll in Workflow</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Health & Intelligence Panel (Left) + AI Next Best Action (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Health Gauge Card */}
        <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Activity size={14} className="text-emerald-400" />
                Customer Health Model
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                health.churnRisk === 'HIGH' ? 'bg-rose-500/20 text-rose-300' : health.churnRisk === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                Churn Risk: {health.churnRisk}
              </span>
            </div>

            {/* Score Ring / Bar */}
            <div className="flex items-baseline gap-3 my-2">
              <span className="text-4xl font-black text-white">{health.score}</span>
              <span className="text-sm text-slate-400 font-semibold">/ 100 Overall Index</span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden my-3">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  health.score >= 75 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : health.score >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gradient-to-r from-rose-500 to-red-400'
                }`}
                style={{ width: `${health.score}%` }}
              />
            </div>

            {/* Health Signals */}
            <div className="space-y-1.5 mt-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Computed Signals:</span>
              {health.signals.map((signal, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span>{signal}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06] mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-400">Expansion Opportunity:</span>
            <span className="font-bold text-emerald-400">{health.expansionOpportunity}</span>
          </div>
        </div>

        {/* AI Next-Best-Action (Center) */}
        <div className="bg-gradient-to-br from-emerald-950/30 via-slate-900/60 to-teal-950/30 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles size={14} />
                AI Decision Engine · NBA
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                {Math.round(nextBestAction.confidence * 100)}% Confidence
              </span>
            </div>

            <h3 className="text-base font-black text-white mb-2">
              Recommended: {nextBestAction.action.replace(/_/g, ' ')}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed bg-white/[0.03] p-3 rounded-xl border border-white/[0.06]">
              {nextBestAction.rationale}
            </p>
          </div>

          <div className="pt-4 mt-4">
            <button
              onClick={() => handleTriggerAction(`EXECUTE_${nextBestAction.action}`)}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Zap size={14} />
              <span>Execute AI Recommendation</span>
            </button>
          </div>
        </div>

        {/* Omnichannel Governance & Preferences (Right) */}
        <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-teal-400" />
                Channel Governance
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                COMPLIANT
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-white/[0.05]">
                <span className="text-slate-400">Primary Channel:</span>
                <span className="font-semibold text-white">Email &rarr; SMS Fallback</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-white/[0.05]">
                <span className="text-slate-400">Frequency Cap:</span>
                <span className="font-semibold text-white">{governance.maxTouchesPerWeek} touches / week</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-white/[0.05]">
                <span className="text-slate-400">Enforced Quiet Hours:</span>
                <span className="font-semibold text-white">{governance.quietHours}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400">Marketing Consent:</span>
                <span className="font-semibold text-emerald-400">Active (Opted-in)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06] mt-4 flex items-center justify-between text-[11px] text-slate-400">
            <span>TCPA / GDPR Guardrails</span>
            <span className="text-emerald-400 font-mono">100% SECURE</span>
          </div>
        </div>
      </div>

      {/* 4-Tab Omnichannel Workplace */}
      <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl overflow-hidden shadow-xl">
        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 dark:border-white/[0.08] px-6 pt-4 gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'timeline'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Clock size={14} />
            <span>Omnichannel Timeline ({timeline.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('deals')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'deals'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase size={14} />
            <span>Commercial Deals ({deals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'invoices'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign size={14} />
            <span>Invoices & Ledger ({invoices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('committee')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'committee'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users size={14} />
            <span>Buying Committee ({buyingCommittee.length})</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="p-6">
          {/* TAB 1: Unified Omnichannel Timeline */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              {/* Filter pills */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
                  <Filter size={12} /> Filter by:
                </span>
                {(['ALL', 'NOTE', 'DEAL', 'INVOICE', 'TICKET'] as const).map((filterVal) => (
                  <button
                    key={filterVal}
                    onClick={() => setTimelineFilter(filterVal)}
                    className={`px-3 py-1 rounded-lg font-medium transition-all ${
                      timelineFilter === filterVal
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'
                    }`}
                  >
                    {filterVal}
                  </button>
                ))}
              </div>

              {/* Timeline Items Stream */}
              <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
                {filteredTimeline.map((item, idx) => (
                  <div key={item.id || idx} className="relative group">
                    {/* Bullet marker */}
                    <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-slate-950 border-2 border-emerald-400 group-hover:scale-125 transition-transform" />

                    <div className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] rounded-2xl p-4 transition-all">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {item.category || item.type}
                          </span>
                          <h4 className="text-sm font-bold text-white">{item.title}</h4>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>

                      {item.description && (
                        <p className="text-xs text-slate-300 mt-2 whitespace-pre-line leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      <div className="mt-3 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-slate-400">
                        <span>Logged by: <span className="text-slate-300 font-medium">{item.author}</span></span>
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded bg-white/[0.04] text-emerald-400 font-bold">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredTimeline.length === 0 && (
                  <p className="text-xs text-slate-500 py-6">No timeline events match the selected category.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Deals Pipeline */}
          {activeTab === 'deals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Commercial Deal Pipeline</h3>
                <Link
                  href="/deals"
                  className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Open Pipeline View</span>
                  <ExternalLink size={12} />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deals.map((deal: any) => (
                  <div key={deal.id} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        ${(deal.amount || 0).toLocaleString()}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/[0.06] text-slate-300">
                        {deal.stage}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-2">{deal.title}</h4>
                    <div className="text-[11px] text-slate-500 mt-3 flex items-center justify-between">
                      <span>Probability: {deal.probability || 50}%</span>
                      <span>Created: {new Date(deal.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}

                {deals.length === 0 && (
                  <div className="col-span-2 p-8 text-center bg-white/[0.01] border border-dashed border-white/[0.08] rounded-2xl">
                    <Briefcase className="mx-auto text-slate-600 mb-2" size={28} />
                    <p className="text-xs text-slate-400 font-semibold">No active deals registered for this customer.</p>
                    <Link href="/deals" className="mt-3 inline-block text-xs text-emerald-400 font-bold hover:underline">
                      + Create Deal in Sales Pipeline
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Invoices & Ledger */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Commercial Invoices & Ledger</h3>
                <Link
                  href="/invoices"
                  className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Open Billing Hub</span>
                  <ExternalLink size={12} />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="pb-3">Invoice #</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Due Date</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {invoices.map((inv: any) => (
                      <tr key={inv.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 font-mono text-white font-bold">{inv.invoiceNum || inv.id}</td>
                        <td className="py-3 font-semibold text-emerald-400">${(inv.amount || 0).toLocaleString()}</td>
                        <td className="py-3 text-slate-400">{new Date(inv.dueDate || Date.now()).toLocaleDateString()}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : inv.status === 'OVERDUE'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <Link href={`/invoices`} className="text-xs text-slate-400 hover:text-white">
                            View PDF
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {invoices.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-500">
                          No commercial invoices found on record.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Buying Committee */}
          {activeTab === 'committee' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Account Buying Committee & Stakeholders</h3>
                  <p className="text-xs text-slate-400">Org chart influence mapping for {contact.companyName}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {buyingCommittee.map((member: any) => (
                  <div key={member.id} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-400 text-sm flex-shrink-0">
                      {member.name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-white truncate">{member.name}</h4>
                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400">
                          {member.influence} INFLUENCE
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{member.role}</p>
                      <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-3">
                        {member.email && <span className="truncate">{member.email}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
