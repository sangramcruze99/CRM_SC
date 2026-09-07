'use client';

import React, { useState } from 'react';
import {
  Workflow,
  Sparkles,
  Send,
  ArrowRight,
  TrendingUp,
  Landmark,
  ShieldCheck,
  Zap,
  MessageSquare,
  CheckCircle2,
  Play,
  Check,
  Layers,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { AiNavigationTabs } from '@/components/ai/AiNavigationTabs';

interface AutomationTemplate {
  id: string;
  category: 'Sales' | 'Support' | 'Finance' | 'Customer Success' | 'Operations';
  title: string;
  description: string;
  trigger: string;
  action: string;
  enabled: boolean;
}

const TEMPLATES: AutomationTemplate[] = [
  {
    id: 'tpl_stalled_deals',
    category: 'Sales',
    title: 'Recover Stalled Opportunities',
    description: 'Watches open deals. If no activity for 7 days, AI prepares a personalized check-in email.',
    trigger: 'Opportunity inactive for 7+ days',
    action: 'Draft follow-up email & create reminder task',
    enabled: true,
  },
  {
    id: 'tpl_hot_leads',
    category: 'Sales',
    title: 'Instant High-Intent Lead Alert',
    description: 'When a new contact downloads a whitepaper or requests a demo, scores fit and alerts rep immediately.',
    trigger: 'New high-score lead captured',
    action: 'Notify sales owner & stage introductory email',
    enabled: true,
  },
  {
    id: 'tpl_overdue_invoices',
    category: 'Finance',
    title: 'Polite Overdue Invoice Follow-Up',
    description: 'When an invoice exceeds payment terms by 5 days, prepares a tone-calibrated payment notice.',
    trigger: 'Invoice status changes to overdue',
    action: 'Prepare payment reminder draft in Approval Center',
    enabled: true,
  },
  {
    id: 'tpl_churn_defense',
    category: 'Customer Success',
    title: 'Proactive Churn Risk Alert',
    description: 'Detects sudden drops in user activity and flags the account before contract renewal.',
    trigger: 'Account weekly active usage drops >30%',
    action: 'Notify customer success manager & schedule health check',
    enabled: true,
  },
  {
    id: 'tpl_deal_project_handoff',
    category: 'Operations',
    title: 'Deal-to-Onboarding Auto-Handoff',
    description: 'When a deal is marked Closed-Won, automatically sets up a new onboarding project and task checklist.',
    trigger: 'Deal moved to Closed-Won',
    action: 'Create customer onboarding project & assign team lead',
    enabled: false,
  },
  {
    id: 'tpl_urgent_ticket',
    category: 'Support',
    title: 'Escalate Unhappy Customers',
    description: 'Scans support tickets for frustrated sentiment or urgent production blockers and escalates to on-call.',
    trigger: 'High-urgency or negative sentiment ticket received',
    action: 'Ping senior support engineer via Slack & flag ticket',
    enabled: false,
  },
];

export default function AiAutomationsPage() {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedFlow, setGeneratedFlow] = useState<any | null>(null);
  const [templates, setTemplates] = useState<AutomationTemplate[]>(TEMPLATES);
  const [activeTab, setActiveTab] = useState<string>('All');

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setGeneratedFlow(null);

    setTimeout(() => {
      setGeneratedFlow({
        title: 'Custom AI Automation',
        description: prompt,
        steps: [
          { stage: '1. When', text: 'Event occurs (as described in your prompt)' },
          { stage: '2. AI Decision', text: 'AI evaluates rules, filters relevance, and verifies safety' },
          { stage: '3. Action', text: 'Prepares action for approval or completes task on autopilot' },
        ],
      });
      setGenerating(false);
    }, 800);
  };

  const toggleTemplate = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    );
  };

  const categories = ['All', 'Sales', 'Finance', 'Customer Success', 'Operations', 'Support'];
  const filteredTemplates =
    activeTab === 'All'
      ? templates
      : templates.filter((t) => t.category === activeTab);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#080d0b] flex flex-col">
      <AiNavigationTabs />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight flex items-center gap-2.5">
            <Workflow size={28} className="text-emerald-500" />
            AI Automations & Goals
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Describe what you want to automate in plain English, or activate one-click business templates.
          </p>
        </div>

        {/* Conversational Automation Generator */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-emerald-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Describe an automation in your own words
            </h2>
          </div>

          <div className="flex items-start gap-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. When a new lead signs up on my website, check their company industry, score their importance, and notify me if they are a high-value fit..."
              rows={3}
              className="flex-1 p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold">Example:</span>
              <button
                onClick={() =>
                  setPrompt(
                    'When a customer stops logging in for 2 weeks, send them a helpful check-in email.'
                  )
                }
                className="underline hover:text-emerald-600"
              >
                Inactivity check-in
              </button>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
            >
              {generating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <span>Create Automation</span>
                  <Sparkles size={14} />
                </>
              )}
            </button>
          </div>

          {/* Generated flow preview */}
          {generatedFlow && (
            <div className="mt-4 p-5 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 font-mono">
                  ✨ Proposed Automation Flow
                </span>
                <span className="text-xs text-slate-500">Ready to activate</span>
              </div>

              {/* Visual Stages */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {generatedFlow.steps.map((step: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 space-y-1 relative shadow-sm"
                  >
                    <span className="text-[10px] font-bold text-emerald-600 uppercase font-mono">
                      {step.stage}
                    </span>
                    <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-snug">
                      {step.text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => alert('Test run simulated successfully with sample lead.')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 transition-colors"
                >
                  Run Test
                </button>
                <button
                  onClick={() => {
                    alert('Automation enabled successfully!');
                    setGeneratedFlow(null);
                    setPrompt('');
                  }}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md shadow-emerald-500/20 transition-all"
                >
                  <CheckCircle2 size={14} /> Enable Automation
                </button>
              </div>
            </div>
          )}
        </section>

        {/* 1-Click Templates */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers size={18} className="text-emerald-500" />
                Popular Business Automation Templates
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pre-configured playbooks tested across high-growth companies.
              </p>
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1 overflow-x-auto p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === cat
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-white/20 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                      {tpl.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tpl.enabled
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-400'
                      }`}
                    >
                      {tpl.enabled ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {tpl.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-2 text-xs">
                  <div className="text-[11px] text-slate-500 space-y-1">
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Trigger:</span>{' '}
                      {tpl.trigger}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Action:</span>{' '}
                      {tpl.action}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => toggleTemplate(tpl.id)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        tpl.enabled
                          ? 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-rose-500/10 hover:text-rose-600'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                      }`}
                    >
                      {tpl.enabled ? 'Disable Automation' : 'Enable Template'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
