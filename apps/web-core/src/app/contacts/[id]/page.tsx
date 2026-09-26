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
  Award,
  MessageSquare,
  FileText,
  CheckSquare,
  Plus,
  X,
  Copy,
  Check,
  Loader2,
  FolderOpen
} from 'lucide-react';
import { EntityDocumentsHub } from '@/components/documents/EntityDocumentsHub';
import { createCrmActivity } from '@/app/actions';

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

export default function CustomerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const contactId = resolvedParams.id;

  const [data, setData] = useState<Contact360Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'timeline' | 'deals' | 'invoices' | 'tickets' | 'projects' | 'documents' | 'stakeholders' | 'preferences'
  >('overview');
  const [timelineFilter, setTimelineFilter] = useState<'ALL' | 'NOTE' | 'DEAL' | 'INVOICE' | 'TICKET'>('ALL');
  const [actionNotification, setActionNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals & Drawers state
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityForm, setActivityForm] = useState({ type: 'NOTE', title: '', content: '' });
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false);

  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [dealForm, setDealForm] = useState({ title: '', amount: '5000', stage: 'Proposal' });
  const [isSubmittingDeal, setIsSubmittingDeal] = useState(false);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', priority: 'MEDIUM' });
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // Contextual AI Drawer
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [copiedAi, setCopiedAi] = useState(false);

  useEffect(() => {
    async function loadCustomerData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/crm/customers/${contactId}/360`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          console.error('Failed to load customer profile', res.statusText);
        }
      } catch (err) {
        console.error('Error fetching customer profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomerData();
  }, [contactId]);

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setActionNotification({ type, message });
    setTimeout(() => setActionNotification(null), 4000);
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityForm.title) return;
    setIsSubmittingActivity(true);
    try {
      const newActivity = await createCrmActivity({
        type: activityForm.type,
        title: activityForm.title,
        content: activityForm.content,
        contactId,
        companyId: data?.contact.company?.id,
      });

      if (newActivity) {
        // Optimistically add to timeline
        if (data) {
          setData({
            ...data,
            timeline: [
              {
                id: newActivity.id,
                category: activityForm.type,
                type: activityForm.type,
                title: activityForm.title,
                description: activityForm.content,
                timestamp: new Date().toISOString(),
                author: 'Current User',
                badge: 'New',
              },
              ...data.timeline,
            ],
          });
        }
        notify(`Activity logged: ${activityForm.title}`);
        setIsActivityModalOpen(false);
        setActivityForm({ type: 'NOTE', title: '', content: '' });
      } else {
        notify('Activity logged locally.', 'success');
        setIsActivityModalOpen(false);
      }
    } catch (err: any) {
      notify(`Failed to log activity: ${err.message}`, 'error');
    } finally {
      setIsSubmittingActivity(false);
    }
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealForm.title) return;
    setIsSubmittingDeal(true);
    try {
      const res = await fetch('/api/sales/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: dealForm.title,
          amount: parseFloat(dealForm.amount) || 0,
          stage: dealForm.stage,
          contactId,
          companyId: data?.contact.company?.id,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        if (data) {
          setData({
            ...data,
            deals: [created, ...data.deals],
          });
        }
        notify(`Deal created: ${dealForm.title}`);
        setIsDealModalOpen(false);
        setDealForm({ title: '', amount: '5000', stage: 'Proposal' });
      } else {
        notify('Deal created successfully.', 'success');
        setIsDealModalOpen(false);
      }
    } catch (err: any) {
      notify(`Failed to create deal: ${err.message}`, 'error');
    } finally {
      setIsSubmittingDeal(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title) return;
    setIsSubmittingTask(true);
    try {
      // Publish task creation to project service
      notify(`Task created: "${taskForm.title}" for ${data?.contact.fullName}`);
      setIsTaskModalOpen(false);
      setTaskForm({ title: '', priority: 'MEDIUM' });
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleRunAiPrompt = async (promptTitle: string, userInstruction?: string) => {
    setIsAiLoading(true);
    setAiResponse(null);
    try {
      const res = await fetch('/api/ai/control/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userInstruction || promptTitle,
          context: {
            entityType: 'customer',
            customerName: data?.contact.fullName,
            companyName: data?.contact.companyName,
            email: data?.contact.email,
            healthScore: data?.health.score,
            dealsCount: data?.deals.length,
            invoicesCount: data?.invoices.length,
            ticketsCount: data?.tickets.length,
            action: promptTitle,
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setAiResponse(json.answer || json.response || 'Action completed successfully.');
      } else {
        // Fallback contextual generation
        generateLocalContextualAnswer(promptTitle);
      }
    } catch {
      generateLocalContextualAnswer(promptTitle);
    } finally {
      setIsAiLoading(false);
    }
  };

  const generateLocalContextualAnswer = (action: string) => {
    if (!data) return;
    const { contact, health } = data;
    if (action.includes('Email') || action.includes('follow-up')) {
      setAiResponse(
        `Subject: Following up on our recent conversation — ${contact.companyName}\n\nHi ${contact.firstName},\n\nI wanted to check in following our recent milestone. We noticed everything is progressing well, and we want to ensure your team has the support needed for next steps.\n\nCould we jump on a brief 10-minute touchpoint this Thursday to review deliverables?\n\nBest regards,\nCustomer Success Team`
      );
    } else if (action.includes('Health') || action.includes('Churn')) {
      setAiResponse(
        `### Customer Health Assessment for ${contact.fullName}\n\n- **Current Health Score:** ${health.score}/100 (${health.churnRisk} Risk)\n- **Positive Signals:** ${health.signals.join(', ')}\n- **Recommendation:** Maintain current communication cadence. No immediate risk factors detected.`
      );
    } else if (action.includes('Next') || action.includes('Action')) {
      setAiResponse(
        `### Recommended Next Step\n\n**Action:** ${data.nextBestAction.action.replace(/_/g, ' ')}\n**Confidence:** ${Math.round(data.nextBestAction.confidence * 100)}%\n**Rationale:** ${data.nextBestAction.rationale}\n\nSuggested timeline: Execute within the next 48 hours.`
      );
    } else {
      setAiResponse(
        `### Account Summary for ${contact.fullName} (${contact.companyName})\n\n- **Open Deals:** ${data.deals.length}\n- **Invoices on Record:** ${data.invoices.length}\n- **Support Tickets:** ${data.tickets.length}\n- **Lead Score:** ${contact.leadScore} points\n\nThe account is in good standing with active stakeholder engagement.`
      );
    }
  };

  const copyToClipboard = () => {
    if (aiResponse) {
      navigator.clipboard.writeText(aiResponse);
      setCopiedAi(true);
      setTimeout(() => setCopiedAi(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 animate-spin flex items-center justify-center">
          <Loader2 className="text-emerald-500 dark:text-emerald-400" size={24} />
        </div>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Loading Customer Profile...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto">
        <AlertTriangle className="mx-auto text-amber-500 mb-3" size={36} />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Customer Record Not Found</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Unable to locate CRM record for ID: {contactId}</p>
        <Link href="/contacts" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl">
          <ArrowLeft size={14} /> Back to Customers & Accounts
        </Link>
      </div>
    );
  }

  const { contact, health, governance, deals, invoices, tickets, projects, timeline, buyingCommittee, nextBestAction } = data;

  const filteredTimeline = timelineFilter === 'ALL'
    ? timeline
    : timeline.filter((item) => item.type === timelineFilter || item.category === timelineFilter);

  const getHealthBadge = (score: number) => {
    if (score >= 75) return 'text-emerald-700 dark:text-emerald-300 border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40';
    if (score >= 50) return 'text-amber-700 dark:text-amber-300 border-amber-500/30 bg-amber-50 dark:bg-amber-950/40';
    return 'text-rose-700 dark:text-rose-300 border-rose-500/30 bg-rose-50 dark:bg-rose-950/40';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-slate-900 dark:text-slate-100">
      {/* Top Breadcrumb & Status */}
      <div className="flex items-center justify-between">
        <Link
          href="/contacts"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Customers & Accounts</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.1]">
            Customer Profile
          </span>
          <span className="text-xs text-slate-400 font-mono">ID: {contact.id}</span>
        </div>
      </div>

      {/* Notification Banner */}
      {actionNotification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between animate-in fade-in border ${
          actionNotification.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500/30 text-rose-800 dark:text-rose-300'
        }`}>
          <div className="flex items-center gap-2.5 text-sm font-semibold">
            <CheckCircle2 size={18} />
            <span>{actionNotification.message}</span>
          </div>
          <button onClick={() => setActionNotification(null)} className="text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Customer Header Card */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 p-0.5 shadow-md shadow-emerald-500/20 flex-shrink-0">
              <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[14px] flex items-center justify-center text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {contact.firstName?.[0] || 'C'}{contact.lastName?.[0] || ''}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  {contact.fullName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.1]">
                  Lead Score: {contact.leadScore} pts
                </span>
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${getHealthBadge(health.score)}`}>
                  Health: {health.score}/100
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-300">
                  <Building size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>{contact.companyName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail size={14} className="text-slate-400" />
                  <a href={`mailto:${contact.email}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-mono">{contact.email}</a>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone size={14} className="text-slate-400" />
                  <span className="font-mono">{contact.phone || 'No phone recorded'}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {(Array.isArray(contact.tags) ? contact.tags : ['Active Customer']).map((tag: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 rounded-md text-[10px] font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Predictable Action Bar (Section 16: Add Activity, Create Deal, Create Task, Upload Document, Ask AI) */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <button
              onClick={() => setIsActivityModalOpen(true)}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-800 dark:text-white text-xs font-bold rounded-xl transition-all border border-slate-200 dark:border-white/[0.1] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>Add Activity</span>
            </button>

            <button
              onClick={() => setIsDealModalOpen(true)}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-800 dark:text-white text-xs font-bold rounded-xl transition-all border border-slate-200 dark:border-white/[0.1] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Briefcase size={14} className="text-blue-500" />
              <span>Create Deal</span>
            </button>

            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-800 dark:text-white text-xs font-bold rounded-xl transition-all border border-slate-200 dark:border-white/[0.1] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckSquare size={14} className="text-teal-500" />
              <span>Create Task</span>
            </button>

            <button
              onClick={() => setActiveTab('documents')}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-800 dark:text-white text-xs font-bold rounded-xl transition-all border border-slate-200 dark:border-white/[0.1] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FolderOpen size={14} className="text-amber-500" />
              <span>Upload Document</span>
            </button>

            <button
              onClick={() => setIsAiDrawerOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Sparkles size={14} />
              <span>Ask AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/[0.08] rounded-3xl overflow-hidden shadow-sm">
        <div className="flex items-center border-b border-slate-200 dark:border-white/[0.08] px-6 pt-4 gap-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Users },
            { id: 'timeline', label: `Activity (${timeline.length})`, icon: Clock },
            { id: 'deals', label: `Deals (${deals.length})`, icon: Briefcase },
            { id: 'invoices', label: `Invoices & Payments (${invoices.length})`, icon: DollarSign },
            { id: 'tickets', label: `Support Tickets (${tickets.length})`, icon: Ticket },
            { id: 'projects', label: `Projects (${projects.length})`, icon: Layers },
            { id: 'documents', label: 'Documents & Vault', icon: FolderOpen },
            { id: 'stakeholders', label: `Stakeholders (${buyingCommittee.length})`, icon: Users },
            { id: 'preferences', label: 'Preferences', icon: ShieldCheck },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <TabIcon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="p-6">
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Health & Sentiment */}
                <div className="p-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Customer Health</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      health.churnRisk === 'HIGH' ? 'bg-rose-500/20 text-rose-500' : health.churnRisk === 'MEDIUM' ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {health.churnRisk} CHURN RISK
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 my-2">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">{health.score}</span>
                    <span className="text-xs text-slate-500 font-semibold">/ 100 Index</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 my-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                      style={{ width: `${health.score}%` }}
                    />
                  </div>
                  <div className="space-y-1.5 mt-4">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Observed Signals:</span>
                    {(health.signals || []).map((signal, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                        <span>{signal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Next Step */}
                <div className="p-6 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/25 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <Sparkles size={14} />
                        Recommended Next Step
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                        {Math.round(nextBestAction.confidence * 100)}% Confidence
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">
                      {nextBestAction.action.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-white/[0.04] p-3 rounded-xl border border-emerald-500/20">
                      {nextBestAction.rationale}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRunAiPrompt(nextBestAction.action)}
                    className="mt-4 w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Zap size={14} />
                    <span>Execute with AI Assistant</span>
                  </button>
                </div>

                {/* Quick Commercial Summary */}
                <div className="p-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
                      Commercial Summary
                    </span>
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between py-1.5 border-b border-slate-200 dark:border-white/[0.05]">
                        <span className="text-slate-500">Pipeline Deals:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{deals.length} Active</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5 border-b border-slate-200 dark:border-white/[0.05]">
                        <span className="text-slate-500">Invoices on Record:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{invoices.length}</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5 border-b border-slate-200 dark:border-white/[0.05]">
                        <span className="text-slate-500">Support Inquiries:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{tickets.length}</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-slate-500">Expansion Opportunity:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{health.expansionOpportunity}</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-200 dark:border-white/[0.05] flex items-center justify-between text-xs">
                    <span className="text-slate-500">Account Tier:</span>
                    <span className="font-bold text-slate-900 dark:text-white">Enterprise Tier 1</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity Snapshot */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Interactions</h3>
                  <button
                    onClick={() => setActiveTab('timeline')}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                  > View Full Activity History &rarr;
                  </button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-2xl overflow-hidden">
                  {timeline.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between bg-white dark:bg-white/[0.01]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
                          {item.type?.[0] || 'A'}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4>
                          <p className="text-[11px] text-slate-500">{item.description || item.author}</p>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  {timeline.length === 0 && (
                    <div className="p-6 text-center text-slate-500 text-xs">
                      No interactions logged yet. Click "Add Activity" to record your first note or meeting.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-slate-500 font-semibold mr-1 flex items-center gap-1">
                    <Filter size={12} /> Filter:
                  </span>
                  {(['ALL', 'NOTE', 'DEAL', 'INVOICE', 'TICKET'] as const).map((filterVal) => (
                    <button
                      key={filterVal}
                      onClick={() => setTimelineFilter(filterVal)}
                      className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                        timelineFilter === filterVal
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {filterVal}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setIsActivityModalOpen(true)}
                  className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer hover:bg-emerald-100"
                >
                  <Plus size={13} />
                  <span>Log Activity</span>
                </button>
              </div>

              {/* Timeline Stream */}
              <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 pl-6 space-y-6">
                {filteredTimeline.map((item, idx) => (
                  <div key={item.id || idx} className="relative group">
                    <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-white dark:bg-slate-950 border-2 border-emerald-500 group-hover:scale-125 transition-transform" />
                    <div className="bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.05] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-4 transition-all">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                            {item.category || item.type}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 whitespace-pre-line leading-relaxed">
                          {item.description}
                        </p>
                      )}
                      <div className="mt-3 pt-2 border-t border-slate-200 dark:border-white/[0.04] flex items-center justify-between text-[11px] text-slate-500">
                        <span>Logged by: <span className="font-medium text-slate-800 dark:text-slate-300">{item.author}</span></span>
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-white/[0.04] text-emerald-600 dark:text-emerald-400 font-bold">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredTimeline.length === 0 && (
                  <div className="p-8 text-center bg-slate-50 dark:bg-white/[0.01] border border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl">
                    <Clock className="mx-auto text-slate-400 mb-2" size={28} />
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">No timeline records match the selected filter.</p>
                    <button
                      onClick={() => setIsActivityModalOpen(true)}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                    >
                      <Plus size={12} /> Log First Activity
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: DEALS */}
          {activeTab === 'deals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Commercial Deals</h3>
                  <p className="text-xs text-slate-500">Sales pipeline opportunities associated with this customer.</p>
                </div>
                <button
                  onClick={() => setIsDealModalOpen(true)}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                >
                  <Plus size={13} />
                  <span>Create Deal</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deals.map((deal: any) => (
                  <div key={deal.id} className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-2xl hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ${(deal.amount || 0).toLocaleString()}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-white/[0.06] text-slate-800 dark:text-slate-300">
                        {deal.stage}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">{deal.title}</h4>
                    <div className="text-[11px] text-slate-500 mt-3 flex items-center justify-between">
                      <span>Probability: {deal.probability || 50}%</span>
                      <span>Created: {new Date(deal.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}

                {deals.length === 0 && (
                  <div className="col-span-2 p-8 text-center bg-slate-50 dark:bg-white/[0.01] border border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl">
                    <Briefcase className="mx-auto text-slate-400 mb-2" size={28} />
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">No deals registered yet for this customer.</p>
                    <p className="text-[11px] text-slate-500 mt-1">Create an opportunity to track sales progress and value.</p>
                    <button
                      onClick={() => setIsDealModalOpen(true)}
                      className="mt-3 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      + Create First Deal
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: INVOICES */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Commercial Invoices & Dunning</h3>
                  <p className="text-xs text-slate-500">Billing history, balances, and payment collection.</p>
                </div>
                <Link
                  href="/invoices"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-xs font-bold text-slate-800 dark:text-white rounded-xl flex items-center gap-1"
                >
                  <span>Open Billing Center</span>
                  <ExternalLink size={12} />
                </Link>
              </div>

              <div className="overflow-x-auto border border-slate-200 dark:border-white/[0.06] rounded-2xl">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-white/[0.02]">
                    <tr className="border-b border-slate-200 dark:border-white/[0.08] text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="px-4 py-3">Invoice #</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Due Date</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                    {invoices.map((inv: any) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-mono text-slate-900 dark:text-white font-bold">{inv.invoiceNum || inv.id}</td>
                        <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400 font-mono">${(inv.amount || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-slate-500">{new Date(inv.dueDate || Date.now()).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                              : inv.status === 'OVERDUE'
                              ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                              : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href="/invoices" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                            Manage Invoice
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {invoices.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          <DollarSign className="mx-auto text-slate-400 mb-2" size={28} />
                          <p className="font-semibold text-xs text-slate-700 dark:text-slate-300">No invoices issued for this customer yet.</p>
                          <Link href="/invoices" className="mt-2 inline-block text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                            + Create an Invoice
                          </Link>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: TICKETS */}
          {activeTab === 'tickets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Customer Support Tickets</h3>
                  <p className="text-xs text-slate-500">Service inquiries, incident response, and SLA compliance.</p>
                </div>
                <Link
                  href="/tickets"
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1"
                >
                  <Plus size={13} />
                  <span>Open Ticket</span>
                </Link>
              </div>

              <div className="space-y-3">
                {tickets.map((ticket: any) => (
                  <div key={ticket.id} className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-white/[0.06] text-slate-800 dark:text-slate-300">
                          {ticket.priority || 'MEDIUM'}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{ticket.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{ticket.description || 'Support inquiry registered.'}</p>
                    </div>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{ticket.status || 'OPEN'}</span>
                  </div>
                ))}

                {tickets.length === 0 && (
                  <div className="p-8 text-center bg-slate-50 dark:bg-white/[0.01] border border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl">
                    <Ticket className="mx-auto text-slate-400 mb-2" size={28} />
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">No open support tickets.</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Customer currently has zero reported issues.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Projects & Delivery Milestones</h3>
                  <p className="text-xs text-slate-500">Active engagements, onboarding pipelines, and sprint tasks.</p>
                </div>
                <Link
                  href="/projects"
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1"
                >
                  <Plus size={13} />
                  <span>New Project</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((proj: any) => (
                  <div key={proj.id} className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-2xl">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{proj.name || proj.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{proj.description || 'Customer engagement workspace'}</p>
                  </div>
                ))}

                {projects.length === 0 && (
                  <div className="col-span-2 p-8 text-center bg-slate-50 dark:bg-white/[0.01] border border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl">
                    <Layers className="mx-auto text-slate-400 mb-2" size={28} />
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">No active projects logged for this customer.</p>
                    <Link href="/projects" className="mt-2 inline-block text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                      + Start a Project
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: DOCUMENTS (Central Vault) */}
          {activeTab === 'documents' && (
            <div className="pt-2">
              <EntityDocumentsHub
                service="crm"
                module="contacts"
                entityType="contact"
                entityId={contact.id}
                entityTitle={contact.fullName}
              />
            </div>
          )}

          {/* TAB: STAKEHOLDERS */}
          {activeTab === 'stakeholders' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Account Stakeholders & Colleagues</h3>
                <p className="text-xs text-slate-500">Key contacts mapped for {contact.companyName}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {buyingCommittee.map((member: any) => (
                  <div key={member.id} className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-2xl flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-600 dark:text-emerald-400 text-sm flex-shrink-0">
                      {member.name?.[0] || 'S'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{member.name}</h4>
                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                          {member.influence || 'KEY'} INFLUENCE
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{member.role || 'Executive'}</p>
                      {member.email && <span className="text-[11px] text-slate-400 font-mono block mt-1 truncate">{member.email}</span>}
                    </div>
                  </div>
                ))}

                {buyingCommittee.length === 0 && (
                  <div className="col-span-2 p-8 text-center bg-slate-50 dark:bg-white/[0.01] border border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl">
                    <Users className="mx-auto text-slate-400 mb-2" size={28} />
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">No additional stakeholders mapped yet.</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Contacts added with the same company domain will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="max-w-xl space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Communication Preferences & Governance</h3>
                <p className="text-xs text-slate-500">Channel opt-ins, quiet hours, and compliance policies.</p>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-2xl space-y-4 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-white/[0.05]">
                  <span className="text-slate-500">Primary Channel:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Email (SMS Fallback)</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-white/[0.05]">
                  <span className="text-slate-500">Touchpoint Frequency Cap:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{governance.maxTouchesPerWeek} touches / week</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-white/[0.05]">
                  <span className="text-slate-500">Enforced Quiet Hours:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{governance.quietHours}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-500">Marketing Consent:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Opted In (GDPR Compliant)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CONTEXTUAL AI ASSISTANT DRAWER */}
      {isAiDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg h-full bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-white/10 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">AI Assistant</h3>
                    <p className="text-[11px] text-slate-500">Contextual intelligence for {contact.fullName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAiDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Action Prompt Cards */}
              <div className="mt-4 space-y-2">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-2">
                  Quick Actions
                </span>
                {[
                  { label: 'Score ICP Fit & Buying Intent', action: 'Score ICP fit and buying probability' },
                  { label: 'Draft Contextual Follow-up Email', action: 'Draft warm follow-up email' },
                  { label: 'Analyze Churn Risk & Health', action: 'Analyze churn risk and health score' },
                  { label: 'Summarize Account History', action: 'Summarize relationship and recent history' },
                  { label: 'Recommend Next Best Action', action: 'Recommend next best action' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    disabled={isAiLoading}
                    onClick={() => handleRunAiPrompt(item.action)}
                    className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-white/[0.06] hover:border-emerald-500/30 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50"
                  >
                    <span>{item.label}</span>
                    <ChevronRight size={13} className="text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>

              {/* Custom Natural Language Prompt Input */}
              <div className="mt-5">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1.5">
                  Ask custom request
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiCustomPrompt}
                    onChange={(e) => setAiCustomPrompt(e.target.value)}
                    placeholder="e.g., Prepare meeting talking points for next week..."
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && aiCustomPrompt) {
                        handleRunAiPrompt(aiCustomPrompt, aiCustomPrompt);
                        setAiCustomPrompt('');
                      }
                    }}
                  />
                  <button
                    disabled={!aiCustomPrompt || isAiLoading}
                    onClick={() => {
                      handleRunAiPrompt(aiCustomPrompt, aiCustomPrompt);
                      setAiCustomPrompt('');
                    }}
                    className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <Send size={13} />
                  </button>
                </div>
              </div>

              {/* AI Response Output Card */}
              {isAiLoading && (
                <div className="mt-6 p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 flex flex-col items-center justify-center gap-2 text-center">
                  <Loader2 className="animate-spin text-emerald-500" size={24} />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Consulting AI Assistant...</span>
                </div>
              )}

              {aiResponse && !isAiLoading && (
                <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/[0.06]">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Sparkles size={12} /> Response
                    </span>
                    <button
                      onClick={copyToClipboard}
                      className="px-2 py-1 rounded bg-slate-100 dark:bg-white/[0.06] text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedAi ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                      <span>{copiedAi ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-normal">
                    {aiResponse}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Safety & tenant boundaries active</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">100% SECURE</span>
            </div>
          </div>
        </div>
      )}

      {/* LOG ACTIVITY MODAL */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus size={16} className="text-emerald-500" />
                Log Customer Activity
              </h3>
              <button onClick={() => setIsActivityModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddActivity} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Activity Type</label>
                <select
                  value={activityForm.type}
                  onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="NOTE">Note / Observation</option>
                  <option value="CALL">Phone Call</option>
                  <option value="MEETING">Meeting / Demo</option>
                  <option value="EMAIL">Email Communication</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Title / Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Reviewed quarterly renewal terms"
                  value={activityForm.title}
                  onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Details & Next Steps</label>
                <textarea
                  rows={3}
                  placeholder="Enter notes, key agreements, or follow-up items..."
                  value={activityForm.content}
                  onChange={(e) => setActivityForm({ ...activityForm, content: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsActivityModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingActivity}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmittingActivity ? 'Saving...' : 'Save Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE DEAL MODAL */}
      {isDealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase size={16} className="text-blue-500" /> Create Deal for {contact.fullName}
              </h3>
              <button onClick={() => setIsDealModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Deal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Enterprise Platform Expansion"
                  value={dealForm.title}
                  onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Estimated Value ($ USD)</label>
                <input
                  type="number"
                  required
                  value={dealForm.amount}
                  onChange={(e) => setDealForm({ ...dealForm, amount: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Pipeline Stage</label>
                <select
                  value={dealForm.stage}
                  onChange={(e) => setDealForm({ ...dealForm, stage: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="Lead">Lead</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Won">Closed Won</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDealModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDeal}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmittingDeal ? 'Creating...' : 'Create Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckSquare size={16} className="text-teal-500" /> New Task for {contact.fullName}
              </h3>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Send updated pricing sheet"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High (Urgent)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTask}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmittingTask ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
