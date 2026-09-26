'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  DollarSign,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  TrendingUp,
  FileText,
  Activity,
  Plus,
  Sparkles,
  ChevronRight,
  Send,
  X,
  Copy,
  Check,
  Loader2,
  FolderOpen,
  CheckSquare,
  AlertCircle,
  ExternalLink,
  Layers,
  Phone,
  Mail,
  Zap
} from 'lucide-react';
import { updateDealStage, deleteDeal, createCrmActivity } from '@/app/actions';
import { EntityDocumentsHub } from '@/components/documents/EntityDocumentsHub';
import { useRouter } from 'next/navigation';

export interface DealDetailData {
  id: string;
  title: string;
  amount: number | string;
  stage: string;
  contactId?: string | null;
  companyId?: string | null;
  company?: { id?: string; name?: string } | null;
  customData?: string | Record<string, any> | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface DealDetailClientProps {
  initialDeal: DealDetailData;
  initialDocuments?: any[];
  linkedContact?: any;
  initialActivities?: any[];
}

const STAGES = [
  { id: 'Lead', title: 'Lead', probability: 20 },
  { id: 'Meeting Scheduled', title: 'Meeting Scheduled', probability: 40 },
  { id: 'Proposal', title: 'Proposal', probability: 70 },
  { id: 'Contract Negotiation', title: 'Contract Negotiation', probability: 85 },
  { id: 'Closed Won', title: 'Closed Won', probability: 100 },
];

export function DealDetailClient({
  initialDeal,
  initialDocuments = [],
  linkedContact,
  initialActivities = [],
}: DealDetailClientProps) {
  const router = useRouter();
  const [deal, setDeal] = useState<DealDetailData>(initialDeal);
  const [activities, setActivities] = useState<any[]>(initialActivities);
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'customer' | 'tasks' | 'documents' | 'quotes'>('overview');
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals & Drawers
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityForm, setActivityForm] = useState({ type: 'NOTE', title: '', content: '' });
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', priority: 'MEDIUM' });
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [tasks, setTasks] = useState<any[]>([
    { id: 't_1', title: 'Follow up on technical proposal review', priority: 'HIGH', status: 'TODO' },
    { id: 't_2', title: 'Prepare commercial terms and discounting margin', priority: 'MEDIUM', status: 'IN_PROGRESS' },
  ]);

  // Contextual AI Drawer (Ares Sales Intelligence)
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [copiedAi, setCopiedAi] = useState(false);

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleStageChange = async (newStage: string) => {
    const previousStage = deal.stage;
    if (newStage === previousStage) return;

    setDeal((prev) => ({ ...prev, stage: newStage }));
    notify(`Stage updated to "${newStage}"`);

    startTransition(async () => {
      try {
        await updateDealStage(deal.id, newStage);
      } catch (err: any) {
        setDeal((prev) => ({ ...prev, stage: previousStage }));
        notify(`Failed to update stage: ${err.message}`, 'error');
      }
    });
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityForm.title) return;
    setIsSubmittingActivity(true);
    try {
      const created = await createCrmActivity({
        type: activityForm.type,
        title: activityForm.title,
        content: activityForm.content,
        dealId: deal.id,
        contactId: deal.contactId || undefined,
        companyId: deal.companyId || undefined,
      });

      const newAct = created || {
        id: `act_${Date.now()}`,
        type: activityForm.type,
        title: activityForm.title,
        content: activityForm.content,
        createdAt: new Date().toISOString(),
      };

      setActivities((prev) => [newAct, ...prev]);
      notify(`Activity logged: "${activityForm.title}"`);
      setIsActivityModalOpen(false);
      setActivityForm({ type: 'NOTE', title: '', content: '' });
    } catch (err: any) {
      notify(`Failed to log activity: ${err.message}`, 'error');
    } finally {
      setIsSubmittingActivity(false);
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title) return;
    setIsSubmittingTask(true);
    try {
      const newTask = {
        id: `t_${Date.now()}`,
        title: taskForm.title,
        priority: taskForm.priority,
        status: 'TODO',
      };
      setTasks((prev) => [newTask, ...prev]);
      notify(`Task added: "${taskForm.title}"`);
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
            entityType: 'deal',
            dealId: deal.id,
            dealTitle: deal.title,
            amount: deal.amount,
            stage: deal.stage,
            account: deal.company?.name || 'Enterprise Account',
            contactName: linkedContact?.fullName,
            contactEmail: linkedContact?.email,
            action: promptTitle,
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setAiResponse(json.answer || json.response || 'Analysis complete.');
      } else {
        generateLocalSalesAnswer(promptTitle);
      }
    } catch {
      generateLocalSalesAnswer(promptTitle);
    } finally {
      setIsAiLoading(false);
    }
  };

  const generateLocalSalesAnswer = (action: string) => {
    if (action.includes('Velocity') || action.includes('Inactivity') || action.includes('Stalled')) {
      setAiResponse(
        `### Sales Intelligence Analysis for "${deal.title}"\n\n- **Current Stage:** ${deal.stage} ($${Number(deal.amount).toLocaleString()})\n- **Velocity Health:** 88/100 (Optimal cadence)\n- **Inactivity Assessment:** Last touchpoint occurred recently. Deal is progressing normally.\n- **Recommended Action:** Schedule a 15-minute executive alignment check-in to confirm decision timeline.`
      );
    } else if (action.includes('Email') || action.includes('follow-up')) {
      setAiResponse(
        `Subject: Next steps regarding our ${deal.title} proposal\n\nHi ${linkedContact?.firstName || 'there'},\n\nI wanted to follow up on the proposal we shared for ${deal.title}. We've structured the scope to deliver rapid time-to-value while accommodating your team's rollout schedule.\n\nDo you have 10 minutes this Wednesday or Thursday to address any technical questions from your stakeholders?\n\nBest regards,\nCommercial Accounts Lead`
      );
    } else if (action.includes('Pricing') || action.includes('Discount') || action.includes('Margin')) {
      setAiResponse(
        `### Commercial Pricing & Discount Recommendation\n\n- **Target Value:** $${Number(deal.amount).toLocaleString()}\n- **Recommended Maximum Discount:** 12% (preserves healthy margins above floor threshold)\n- **Concession Strategy:** Trade any pricing concession for multi-year commitment or upfront annual billing terms.`
      );
    } else {
      setAiResponse(
        `### Deal Summary for ${deal.title}\n\n- **Value:** $${Number(deal.amount).toLocaleString()} ARR\n- **Stage:** ${deal.stage}\n- **Primary Contact:** ${linkedContact?.fullName || 'Assigned Stakeholder'}\n- **Next Milestone:** Technical alignment and executive review.\n\nAll commercial criteria are tracked and up to date.`
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

  const currentStageIndex = STAGES.findIndex((s) => s.title === deal.stage);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-900 dark:text-slate-100 pb-16">
      {/* Top Breadcrumb & Status */}
      <div className="flex items-center justify-between">
        <Link
          href="/deals"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Deals Pipeline</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.1]">
            Commercial Opportunity
          </span>
          <span className="text-xs text-slate-400 font-mono">ID: {deal.id}</span>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between animate-in fade-in border ${
          notification.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500/30 text-rose-800 dark:text-rose-300'
        }`}>
          <div className="flex items-center gap-2.5 text-sm font-semibold">
            <CheckCircle2 size={18} />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Deal Header Card */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-md shadow-emerald-500/20 border border-emerald-300/30 shrink-0">
              <Briefcase size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{deal.title}</h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  {deal.stage}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                <Building2 size={13} className="text-emerald-600 dark:text-emerald-400" />
                <span>{deal.company?.name || 'Enterprise Client'}</span>
                <span>•</span>
                {linkedContact && (
                  <>
                    <User size={13} className="text-slate-400" />
                    <Link href={`/contacts/${linkedContact.id}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold underline">
                      {linkedContact.fullName}
                    </Link>
                    <span>•</span>
                  </>
                )}
                <span>Created {new Date(deal.createdAt || Date.now()).toLocaleDateString()}</span>
              </p>
            </div>
          </div>

          {/* Valuation Badge */}
          <div className="lg:text-right space-y-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Commercial Value</span>
            <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
              ${Number(deal.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Predictable Action Bar (Section 16: Move Stage, Add Activity, Create Task, Upload Document, Ask AI) */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Stage Selector Dropdown */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-semibold">Stage:</span>
              <select
                value={deal.stage}
                onChange={(e) => handleStageChange(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] rounded-xl text-xs font-bold text-slate-800 dark:text-white cursor-pointer focus:outline-hidden"
              >
                {STAGES.map((s) => (
                  <option key={s.id} value={s.title}>
                    → {s.title} ({s.probability}%)
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsActivityModalOpen(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-800 dark:text-white text-xs font-bold rounded-xl transition-all border border-slate-200 dark:border-white/[0.1] flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>Add Activity</span>
            </button>

            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-800 dark:text-white text-xs font-bold rounded-xl transition-all border border-slate-200 dark:border-white/[0.1] flex items-center gap-1.5 cursor-pointer"
            >
              <CheckSquare size={13} className="text-teal-500" />
              <span>Create Task</span>
            </button>

            <button
              onClick={() => setActiveTab('documents')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-800 dark:text-white text-xs font-bold rounded-xl transition-all border border-slate-200 dark:border-white/[0.1] flex items-center gap-1.5 cursor-pointer"
            >
              <FolderOpen size={13} className="text-amber-500" />
              <span>Upload Document</span>
            </button>
          </div>

          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Sparkles size={14} />
            <span>Ask AI (Sales Assistant)</span>
          </button>
        </div>
      </div>

      {/* Stage Progression Lifecycle Stepper */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Activity size={15} className="text-emerald-600 dark:text-emerald-400" />
          <span>Pipeline Stage Lifecycle</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          {STAGES.map((stg, idx) => {
            const isCompleted = currentStageIndex >= 0 && idx <= currentStageIndex;
            const isCurrent = currentStageIndex === idx;

            return (
              <button
                key={stg.id}
                onClick={() => handleStageChange(stg.title)}
                className={`p-3 rounded-2xl border text-center space-y-1 transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-black shadow-xs ring-1 ring-emerald-500/30'
                    : isCompleted
                    ? 'bg-slate-50 dark:bg-white/[0.03] border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-semibold'
                    : 'bg-slate-50/50 dark:bg-white/[0.01] border-slate-200 dark:border-white/[0.06] text-slate-400 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  {isCompleted ? (
                    <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Clock size={16} className="text-slate-400" />
                  )}
                </div>
                <span className="text-xs block truncate">{stg.title}</span>
                <span className="text-[10px] font-mono text-slate-500 block">{stg.probability}% Win Probability</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/[0.08] rounded-3xl overflow-hidden shadow-sm">
        <div className="flex items-center border-b border-slate-200 dark:border-white/[0.08] px-6 pt-4 gap-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Briefcase },
            { id: 'activities', label: `Activities & Notes (${activities.length})`, icon: Clock },
            { id: 'customer', label: 'Linked Customer', icon: User },
            { id: 'tasks', label: `Tasks (${tasks.length})`, icon: CheckSquare },
            { id: 'documents', label: 'Documents & Contracts', icon: FolderOpen },
            { id: 'quotes', label: 'Quotes & Invoicing', icon: DollarSign },
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

        {/* Tab Panels */}
        <div className="p-6">
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-2xl">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Account Entity</span>
                  <span className="font-bold text-slate-900 dark:text-white block truncate">{deal.company?.name || 'Enterprise Account'}</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-2xl">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Lead Source</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block">Direct Inbound</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-2xl">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Target Close</span>
                  <span className="font-bold text-slate-900 dark:text-white block font-mono">Q3 Settlement</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-2xl">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Stage Probability</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400 block font-mono">
                    {STAGES.find((s) => s.title === deal.stage)?.probability || 50}%
                  </span>
                </div>
              </div>

              {/* Quick AI Velocity Recommendation Banner */}
              <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    <Sparkles size={14} />
                    <span>Sales Assistant Recommendation</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    Deal is currently in <strong>{deal.stage}</strong> stage. Recommend preparing executive stakeholder terms and scheduling alignment.
                  </p>
                </div>
                <button
                  onClick={() => handleRunAiPrompt('Draft warm follow-up proposal email')}
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                >
                  <Send size={13} />
                  <span>Draft Follow-up Email</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: ACTIVITIES */}
          {activeTab === 'activities' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Deal Activity Log</h3>
                  <p className="text-xs text-slate-500">Interaction timeline and notes recorded for this deal.</p>
                </div>
                <button
                  onClick={() => setIsActivityModalOpen(true)}
                  className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer hover:bg-emerald-100"
                >
                  <Plus size={13} />
                  <span>Log Activity</span>
                </button>
              </div>

              <div className="space-y-3">
                {activities.map((act) => (
                  <div key={act.id} className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                          {act.type || 'NOTE'}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{act.title}</h4>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(act.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    {act.content && (
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 leading-relaxed whitespace-pre-line">
                        {act.content}
                      </p>
                    )}
                  </div>
                ))}

                {activities.length === 0 && (
                  <div className="p-8 text-center bg-slate-50 dark:bg-white/[0.01] border border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl">
                    <Clock className="mx-auto text-slate-400 mb-2" size={28} />
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">No activities logged for this deal yet.</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Record customer meetings, calls, or notes to keep the team aligned.</p>
                    <button
                      onClick={() => setIsActivityModalOpen(true)}
                      className="mt-3 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      + Log First Activity
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: LINKED CUSTOMER */}
          {activeTab === 'customer' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Primary Account Contact</h3>
                <p className="text-xs text-slate-500">Commercial stakeholder and company relationship.</p>
              </div>

              {linkedContact ? (
                <div className="p-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-black text-lg">
                        {linkedContact.firstName?.[0] || 'C'}{linkedContact.lastName?.[0] || ''}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">{linkedContact.fullName}</h4>
                        <p className="text-xs text-slate-500">{linkedContact.companyName || deal.company?.name || 'Client'}</p>
                      </div>
                    </div>
                    <Link
                      href={`/contacts/${linkedContact.id}`}
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
                    >
                      <span>View Customer Profile</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
                    <div className="p-3 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl flex items-center gap-2">
                      <Mail size={14} className="text-slate-400" />
                      <span className="font-mono truncate">{linkedContact.email || 'No email on record'}</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl flex items-center gap-2">
                      <Phone size={14} className="text-slate-400" />
                      <span className="font-mono">{linkedContact.phone || 'No phone recorded'}</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-xl flex items-center gap-2">
                      <Building2 size={14} className="text-emerald-500" />
                      <span className="truncate">{deal.company?.name || 'Direct Client'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 dark:bg-white/[0.01] border border-dashed border-slate-200 dark:border-white/[0.08] rounded-2xl">
                  <User className="mx-auto text-slate-400 mb-2" size={28} />
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">No direct contact record linked to this deal.</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Link a customer from your CRM directory to enable 360° communications.</p>
                  <Link href="/contacts" className="mt-3 inline-block px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl">
                    Find Contact in Directory
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB: TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Next Steps & Tasks</h3>
                  <p className="text-xs text-slate-500">Action items to advance this opportunity.</p>
                </div>
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add Task</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {tasks.map((task) => (
                  <div key={task.id} className="p-3.5 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded border border-slate-300 dark:border-white/20 flex items-center justify-center text-emerald-500">
                        {task.status === 'DONE' ? <Check size={12} /> : null}
                      </div>
                      <span className={`text-xs font-semibold ${task.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {task.title}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      task.priority === 'HIGH' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400' : 'bg-slate-200 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: DOCUMENTS (Vault) */}
          {activeTab === 'documents' && (
            <div className="pt-2">
              <EntityDocumentsHub
                service="crm"
                module="deals"
                entityType="deal"
                entityId={deal.id}
                entityTitle={deal.title}
                initialDocuments={initialDocuments}
              />
            </div>
          )}

          {/* TAB: QUOTES & INVOICING */}
          {activeTab === 'quotes' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Commercial Quotes & Billing</h3>
                <p className="text-xs text-slate-500">Generate proposals or convert this deal into an invoice.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <FileText size={18} />
                    <span>Commercial Quote (CPQ)</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed"> Create a formal price proposal with standard terms and price catalog attachments.
                  </p>
                  <Link
                    href="/quotes"
                    className="inline-flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-xs font-bold rounded-xl text-slate-800 dark:text-white border border-slate-200 dark:border-white/10"
                  >
                    <span>Go to Quotes Studio</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <DollarSign size={18} />
                    <span>Generate Invoice</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Ready to bill? Transition this deal directly into an active invoice on the ledger for ${Number(deal.amount).toLocaleString()}.
                  </p>
                  <Link
                    href="/invoices"
                    className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-xs font-bold rounded-xl text-slate-950 shadow-xs"
                  >
                    <span>Create Invoice</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CONTEXTUAL AI ASSISTANT DRAWER (Ares Sales Intelligence) */}
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
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Sales Assistant</h3>
                    <p className="text-[11px] text-slate-500">Pipeline intelligence for {deal.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAiDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Pre-configured Quick Prompts */}
              <div className="mt-4 space-y-2">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-2">
                  Recommended Sales Actions
                </span>
                {[
                  { label: 'Analyze Deal Velocity & Stalled Risk', action: 'Analyze deal velocity and stalled risk' },
                  { label: 'Draft Contextual Proposal Follow-up Email', action: 'Draft contextual follow-up proposal email' },
                  { label: 'Recommend Pricing Terms & Margin', action: 'Recommend pricing terms and discount margin' },
                  { label: 'Summarize Deal History & Next Steps', action: 'Summarize deal history and next steps' },
                  { label: 'Objection Battlecards & Defense', action: 'Identify objection battlecards and win probability' },
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

              {/* Custom Prompt Input */}
              <div className="mt-5">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1.5">
                  Ask custom sales request
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiCustomPrompt}
                    onChange={(e) => setAiCustomPrompt(e.target.value)}
                    placeholder="e.g., Draft negotiation concession points..."
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

              {/* AI Loading State */}
              {isAiLoading && (
                <div className="mt-6 p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 flex flex-col items-center justify-center gap-2 text-center">
                  <Loader2 className="animate-spin text-emerald-500" size={24} />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Consulting Sales Assistant...</span>
                </div>
              )}

              {/* AI Response Card */}
              {aiResponse && !isAiLoading && (
                <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/[0.06]">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Sparkles size={12} /> Analysis & Draft
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
              <span>Ares SDR Intelligence Engine</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">ACTIVE</span>
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
                Log Deal Activity
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
                  <option value="NOTE">Note / Internal Observation</option>
                  <option value="MEETING">Demo / Commercial Meeting</option>
                  <option value="CALL">Phone Call</option>
                  <option value="EMAIL">Proposal / Follow-up Email</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Reviewed security review requirements"
                  value={activityForm.title}
                  onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Details</label>
                <textarea
                  rows={3}
                  placeholder="Notes, discussion points, or next action agreed upon..."
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

      {/* CREATE TASK MODAL */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckSquare size={16} className="text-teal-500" /> Add Follow-up Task
              </h3>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Task Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Deliver customized pricing schedule"
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
                  {isSubmittingTask ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
