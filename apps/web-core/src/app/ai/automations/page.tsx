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
    <div className="space-y-6 max-w-7xl mx-auto text-white font-sans">
      <AiNavigationTabs />

      {/* Top Header Cockpit Chassis */}
      <div className="botanical-glass-card rounded-3xl p-6 md:p-8 border border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/[0.06] text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-bold tracking-wider uppercase">Rules & Goals Engine Active</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">Autonomous Trigger Reactor</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[11px]">
              vault/ai/automation_rules/
            </span>
            <span className="text-zinc-500">|</span>
            <span className="text-emerald-400 font-semibold">Event Bus: Synchronized</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                NATURAL INTENT RULES
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
                STAGE 5.0 EVENT REACTOR
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Workflow className="text-emerald-400" size={30} />
              AI Automations & Goals
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 max-w-3xl leading-relaxed">
              Describe what you want to automate in plain English, or activate one-click business templates.
            </p>
          </div>
        </div>
      </div>

      {/* Conversational Automation Generator */}
      <section className="botanical-glass-card rounded-2xl p-6 border border-white/[0.08] relative overflow-hidden space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-emerald-400" />
          <h2 className="text-sm font-bold font-mono text-white">
            Describe an automation in your own words
          </h2>
        </div>

        <div className="flex items-start gap-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. When a new lead signs up on my website, check their company industry, score their importance, and notify me if they are a high-value fit..."
            rows={3}
            className="flex-1 p-3.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
            <span className="font-semibold text-zinc-500">Example:</span>
            <button
              onClick={() =>
                setPrompt(
                  'When a customer stops logging in for 2 weeks, send them a helpful check-in email.'
                )
              }
              className="underline hover:text-emerald-400 cursor-pointer"
            >
              Inactivity check-in
            </button>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 text-xs font-mono font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            {generating ? (
              <Loader2 size={15} className="animate-spin" />
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
          <div className="mt-4 p-5 rounded-xl bg-black/60 border border-emerald-500/30 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                Proposed Automation Flow
              </span>
              <span className="text-xs font-mono text-zinc-400">Ready to activate</span>
            </div>

            {/* Visual Stages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {generatedFlow.steps.map((step: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1 shadow-sm"
                >
                  <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono">
                    {step.stage}
                  </span>
                  <p className="text-xs font-mono text-zinc-200 leading-snug">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => alert('Test run simulated successfully with sample lead.')}
                className="px-4 py-2 rounded-xl text-xs font-mono text-zinc-300 hover:text-white bg-white/[0.04] border border-white/[0.06] cursor-pointer"
              >
                Run Test
              </button>
              <button
                onClick={() => {
                  alert('Automation enabled successfully!');
                  setGeneratedFlow(null);
                  setPrompt('');
                }}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-mono font-bold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 cursor-pointer"
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
            <h2 className="text-base font-bold font-mono text-white flex items-center gap-2">
              <Layers size={18} className="text-emerald-400" />
              Popular Business Automation Templates
            </h2>
            <p className="text-xs font-mono text-zinc-400">
              Pre-configured playbooks tested across high-growth companies.
            </p>
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-black/40 border border-white/[0.08] rounded-2xl">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === cat
                    ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
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
              className="botanical-glass-card rounded-2xl p-5 border border-white/[0.08] relative overflow-hidden flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400 border border-white/[0.08]">
                    {tpl.category}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      tpl.enabled
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/[0.04] text-zinc-500 border border-white/[0.06]'
                    }`}
                  >
                    {tpl.enabled ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                <h3 className="text-sm font-bold font-mono text-white">
                  {tpl.title}
                </h3>
                <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                  {tpl.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] space-y-2 text-xs font-mono">
                <div className="text-[11px] text-zinc-400 space-y-1">
                  <div>
                    <span className="font-semibold text-zinc-200">Trigger:</span>{' '}
                    {tpl.trigger}
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-200">Action:</span>{' '}
                    {tpl.action}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => toggleTemplate(tpl.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      tpl.enabled
                        ? 'bg-white/[0.06] text-zinc-300 hover:bg-rose-500/15 hover:text-rose-400 border border-white/[0.08]'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-md shadow-emerald-500/20'
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
    </div>
  );
}
