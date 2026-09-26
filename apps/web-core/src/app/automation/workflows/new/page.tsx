'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  ArrowLeft,
  Workflow,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sliders,
  Eye,
  Layers,
  HelpCircle,
} from 'lucide-react';
import {
  DomainPack,
  StructuredIntent,
} from '@/components/automation/intent/types';
import { NaturalLanguageIntentCard } from '@/components/automation/intent/NaturalLanguageIntentCard';
import { BusinessRuleEditor } from '@/components/automation/intent/BusinessRuleEditor';
import { ActionTimingApprovalCard } from '@/components/automation/intent/ActionTimingApprovalCard';
import { IntentSimulatorModal } from '@/components/automation/intent/IntentSimulatorModal';
import { GuidedModeBuilder } from '@/components/automation/intent/GuidedModeBuilder';
import {
  WorkflowModeSwitcher,
  AutomationBuilderMode,
} from '@/components/automation/WorkflowModeSwitcher';
import { AutomationExplanationModal } from '@/components/automation/AutomationExplanationModal';

// Fallback domain packs
const FALLBACK_DOMAINS: DomainPack[] = [
  {
    id: 'recruitment',
    name: 'Recruitment & Talent',
    tagline: 'Automate candidate screening, resume evaluation, and interview scheduling',
    icon: 'UserCheck',
    color: 'emerald',
    fields: [
      { id: 'candidate.cgpa', name: 'Candidate → Academic → CGPA', category: 'Academic', type: 'number', operators: ['is_at_least', 'is_greater_than', 'equals'] },
      { id: 'candidate.degree', name: 'Candidate → Academic → Degree Type', category: 'Academic', type: 'string', operators: ['equals', 'contains'], options: ["Bachelor's degree", "Master's degree", 'Doctorate', 'Associate degree'] },
      { id: 'candidate.experienceYears', name: 'Candidate → Experience → Relevant Years', category: 'Experience', type: 'number', operators: ['is_at_least', 'is_greater_than', 'is_at_most'] },
      { id: 'candidate.skills', name: 'Candidate → Skills → Matching Skill List', category: 'Skills', type: 'array', operators: ['contains', 'does_not_contain'] },
    ],
    actions: [
      { id: 'screen_candidate', name: 'Screen Candidate against Profile', description: 'Run anti-bias screening and generate evidence report' },
      { id: 'request_human_review', name: 'Send to Recruiter Review Queue', description: 'Flag candidate for human partner decision' },
      { id: 'send_interview_invite', name: 'Send Interview Invitation', description: 'Email or WhatsApp calendar scheduling link' },
    ],
    resultDestinations: [
      { id: 'recruiter_queue', name: 'Recruiter Review Queue + Candidate Profile', description: 'Interactive dashboard for candidate review and notes' },
      { id: 'candidate_profile', name: 'Candidate Profile & ATS', description: 'Record screening breakdown directly in ATS' },
    ],
    templates: [],
    samplePrompts: [
      'I need a graduate with CGPA 3.00 or above, at least 2 years relevant experience, and at least 5 of these 8 skills: MS Office, Excel, Word, PowerPoint, Google Sheets, Communication, Reporting, Data Entry. Accounting software experience is preferred.',
    ],
  },
  {
    id: 'front_desk',
    name: 'AI Front Desk & Receptionist',
    tagline: 'Intelligent incoming voice calls, appointment booking, and live human transfers',
    icon: 'PhoneCall',
    color: 'sky',
    fields: [
      { id: 'call.timeOfDay', name: 'Call → Time → Window', category: 'Timing', type: 'string', operators: ['equals'], options: ['after_hours', 'business_hours', 'weekend'] },
      { id: 'call.callerIntent', name: 'Call → Caller → Intent', category: 'Intent', type: 'string', operators: ['equals', 'contains'] },
    ],
    actions: [
      { id: 'voice_receptionist', name: 'Answer Call with Business Knowledge', description: 'Voice AI receptionist responds to inquiries' },
      { id: 'book_calendar_slot', name: 'Book Appointment on Calendar', description: 'Check availability and place confirmed meeting on calendar' },
    ],
    resultDestinations: [
      { id: 'calendar_booking', name: 'Calendar Appointment + Call Audio & Transcript', description: 'Synced meeting invite and audio recording' },
    ],
    templates: [],
    samplePrompts: [
      'Handle after-hours calls and book appointments. Transfer complicated calls to a human staff member.',
    ],
  },
  {
    id: 'sales',
    name: 'Sales & Revenue Automation',
    tagline: 'Lead qualification, speed-to-lead instant messaging, and automated follow-ups',
    icon: 'TrendingUp',
    color: 'amber',
    fields: [
      { id: 'lead.score', name: 'Lead → Qualification → AI Lead Score (1-100)', category: 'Score', type: 'number', operators: ['is_at_least', 'is_greater_than'] },
      { id: 'lead.companySize', name: 'Lead → Company → Employee Count', category: 'Firmographic', type: 'number', operators: ['is_at_least', 'is_greater_than'] },
    ],
    actions: [
      { id: 'score_lead', name: 'Calculate AI Lead Score & ICP Fit', description: 'Evaluate intent and enrich firmographics' },
      { id: 'instant_outreach', name: 'Instant Outreach (WhatsApp / Email)', description: 'Send personalized introduction within 60 seconds' },
    ],
    resultDestinations: [
      { id: 'crm_deal', name: 'CRM Lead Pipeline & Account Executive Alert', description: 'Lead enriched, touchpoints recorded in timeline' },
    ],
    templates: [],
    samplePrompts: [
      'When a new lead arrives, score it. If highly interested, contact immediately. If no response after 2 days, follow up.',
    ],
  },
  {
    id: 'finance',
    name: 'Finance & Accounting Automation',
    tagline: 'Invoice processing, 3-way reconciliation, and manager approval gateways',
    icon: 'Receipt',
    color: 'amber',
    fields: [
      { id: 'invoice.amount', name: 'Invoice → Financial → Total Amount ($)', category: 'Financial', type: 'number', operators: ['is_greater_than', 'is_at_most', 'equals'] },
      { id: 'invoice.vendor', name: 'Invoice → Vendor → Company Name', category: 'Vendor', type: 'string', operators: ['equals', 'contains'] },
    ],
    actions: [
      { id: 'extract_ocr', name: 'Read & Extract Invoice Data (OCR)', description: 'Extract vendor name, line items, and totals' },
      { id: 'manager_approval', name: 'Request Finance Manager Approval', description: 'Route for interactive manager review' },
    ],
    resultDestinations: [
      { id: 'accounting_ledger', name: 'Accounting Ledger + Manager Approval Card', description: 'Extracted invoice metadata stored in ERP ledger' },
    ],
    templates: [],
    samplePrompts: [
      'Process invoices automatically, but require approval for invoices over $5,000.',
    ],
  },
  {
    id: 'support',
    name: 'Customer Support & Triage',
    tagline: 'Sentiment triage, tier-1 resolution, and instant live human agent escalation',
    icon: 'LifeBuoy',
    color: 'rose',
    fields: [
      { id: 'ticket.sentiment', name: 'Ticket → Sentiment → Customer Mood', category: 'Sentiment', type: 'string', operators: ['equals'], options: ['frustrated', 'neutral', 'satisfied'] },
      { id: 'ticket.aiConfidence', name: 'Ticket → AI → Resolution Confidence', category: 'AI', type: 'string', operators: ['equals'], options: ['high', 'unclear', 'low'] },
    ],
    actions: [
      { id: 'sentiment_analysis', name: 'Analyze Sentiment & AI Resolution Confidence', description: 'Detect customer distress or unclear resolution' },
      { id: 'escalate_human', name: 'Escalate to Live Support Agent', description: 'Page tier-2 human queue with conversation summary' },
    ],
    resultDestinations: [
      { id: 'support_ticket', name: 'Support Helpdesk Ticket + Live Agent Queue', description: 'Ticket priority elevated to URGENT' },
    ],
    templates: [],
    samplePrompts: [
      'If the customer is frustrated or the AI is unsure, escalate to human support.',
    ],
  },
];

function NewWorkflowStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const domainParam = searchParams.get('domain');

  const [mode, setMode] = useState<AutomationBuilderMode>('SIMPLE');
  const [domainPacks, setDomainPacks] = useState<DomainPack[]>(FALLBACK_DOMAINS);
  const [selectedDomain, setSelectedDomain] = useState<string>(domainParam || 'recruitment');
  const [prompt, setPrompt] = useState<string>('');
  const [isParsing, setIsParsing] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [parsedIntent, setParsedIntent] = useState<StructuredIntent | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Sync domain if query parameter updates
  useEffect(() => {
    if (domainParam) {
      setSelectedDomain(domainParam);
    }
  }, [domainParam]);

  // Load domain packs from backend API
  useEffect(() => {
    async function loadDomains() {
      try {
        const res = await fetch('/api/intent/domains');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setDomainPacks(data);
          }
        }
      } catch {
        // fallback
      }
    }
    loadDomains();
  }, []);

  // Update prompt when domain changes if empty
  useEffect(() => {
    const pack = domainPacks.find((d) => d.id === selectedDomain) || domainPacks[0];
    if (pack && !prompt.trim() && pack.samplePrompts[0]) {
      setPrompt(pack.samplePrompts[0]);
    }
  }, [selectedDomain, domainPacks]);

  const currentPack = domainPacks.find((d) => d.id === selectedDomain) || domainPacks[0];

  const handleParsePrompt = async () => {
    if (!prompt.trim()) return;
    setIsParsing(true);
    setNotification(null);

    try {
      const res = await fetch('/api/intent/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, domain: selectedDomain }),
      });

      if (res.ok) {
        const intent: StructuredIntent = await res.json();
        setParsedIntent(intent);
      } else {
        // Fallback local structured intent
        const fallbackIntent: StructuredIntent = {
          name: `${currentPack.name} Automation`,
          goal: prompt,
          domain: selectedDomain,
          domainName: currentPack.name,
          trigger: {
            type: `${selectedDomain}:trigger_default`,
            description: `When a new event occurs in ${currentPack.name}`,
            timing: 'IMMEDIATELY',
          },
          ruleGroups: [
            {
              logic: 'ALL',
              rules: currentPack.fields.slice(0, 2).map((f, i) => ({
                id: `r_${i}`,
                field: f.id,
                fieldLabel: f.name,
                operator: f.operators[0] || 'is_at_least',
                value: f.type === 'number' ? 3.0 : 'Standard',
                priority: 'REQUIRED',
              })),
            },
          ],
          actions: currentPack.actions.slice(0, 2).map((a) => ({
            id: `act_${a.id}`,
            type: a.id,
            name: a.name,
            description: a.description,
            config: {},
          })),
          timing: {
            schedule: 'Real-time processing',
            window: 'ALWAYS',
          },
          channels: ['Email', 'Internal CRM Task'],
          approvalPolicy: {
            required: selectedDomain === 'finance',
            condition: 'THRESHOLD_EXCEEDED',
            reviewerRole: 'Manager',
            thresholdAmount: 5000,
          },
          resultDestination: {
            id: currentPack.resultDestinations[0]?.id || 'default_destination',
            name: currentPack.resultDestinations[0]?.name || 'CRM System',
            summary: currentPack.resultDestinations[0]?.description || 'Record result',
          },
          exceptions: {
            onFailure: 'ASK_HUMAN',
            onUncertain: 'ESCALATE_TO_HUMAN',
          },
          explanation: `When an event occurs, evaluate criteria for ${currentPack.name} and execute actions safely.`,
          visualSummary: [
            `When event occurs in ${currentPack.name}`,
            'Evaluate business criteria and rules',
            'Route actions and notifications',
            'Record result in destination',
          ],
          validation: {
            isValid: true,
            warnings: [],
            errors: [],
          },
        };
        setParsedIntent(fallbackIntent);
      }
    } catch {
      // safe fallback
    } finally {
      setIsParsing(false);
    }
  };

  const handleCompileAndActivate = async () => {
    if (!parsedIntent) return;
    setIsCompiling(true);

    try {
      const res = await fetch('/api/intent/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: parsedIntent }),
      });

      if (res.ok) {
        const data = await res.json();
        setNotification('Automation compiled and published successfully!');
        setTimeout(() => {
          if (data.workflow?.id) {
            router.push(`/automation/workflows/${data.workflow.id}`);
          } else {
            router.push('/automation/workflows');
          }
        }, 1500);
      } else {
        setNotification('Compiled workflow with simulated activation.');
        setTimeout(() => router.push('/automation/workflows'), 1500);
      }
    } catch {
      setNotification('Workflow draft created.');
      setTimeout(() => router.push('/automation/workflows'), 1500);
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div className="space-y-6 text-white font-sans max-w-7xl mx-auto">
      {/* Alert Banner */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs shadow-xl shadow-emerald-500/20 flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header Chassis with Mode Switcher */}
      <div className="botanical-glass-card rounded-3xl p-6 md:p-8 border border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/[0.06] text-xs font-mono">
          <div className="flex items-center gap-2">
            <Link
              href="/automation/workflows"
              className="inline-flex items-center gap-1 text-zinc-400 hover:text-emerald-400 transition"
            >
              <ArrowLeft size={13} />
              <span>Back to Workflows</span>
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="text-emerald-400 font-bold tracking-wider uppercase">Universal Intent Studio</span>
          </div>

          <div className="flex items-center gap-3">
            {parsedIntent && (
              <button
                type="button"
                onClick={() => setIsExplanationOpen(true)}
                className="px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
              >
                <HelpCircle size={13} className="text-emerald-400" />
                <span>Explain this automation</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                HUMAN-FIRST INTENT LAYER
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
                ONE UNIVERSAL ENGINE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Sparkles className="text-emerald-400" size={30} />
              Create Universal Automation
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 max-w-3xl leading-relaxed">
              Users configure outcomes. The system configures workflows. Describe what you want in plain words or step through guided business criteria.
            </p>
          </div>

          {/* 3-Mode Switcher */}
          <div className="shrink-0">
            <WorkflowModeSwitcher currentMode={mode} onChangeMode={setMode} />
          </div>
        </div>
      </div>

      {/* MODE 1: SIMPLE MODE */}
      {mode === 'SIMPLE' && (
        <div className="space-y-6">
          <NaturalLanguageIntentCard
            domainPacks={domainPacks}
            selectedDomain={selectedDomain}
            onSelectDomain={setSelectedDomain}
            prompt={prompt}
            onChangePrompt={setPrompt}
            onParsePrompt={handleParsePrompt}
            isParsing={isParsing}
            parsedIntent={parsedIntent}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
            onCompileAndSave={handleCompileAndActivate}
            isCompiling={isCompiling}
            onReset={() => {
              setParsedIntent(null);
              setPrompt('');
            }}
          />

          {parsedIntent && (
            <div className="flex items-center justify-between p-4 rounded-2xl botanical-glass-card border border-white/[0.08]">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white block">Need fine-grained business rule control?</span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  Switch to Guided Mode to review the 11 business-language steps or edit thresholds.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMode('GUIDED')}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.08] text-xs font-mono font-bold transition cursor-pointer"
              >
                Open Guided Mode →
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: GUIDED MODE */}
      {mode === 'GUIDED' && (
        <div className="space-y-6">
          {parsedIntent ? (
            <GuidedModeBuilder
              intent={parsedIntent}
              domainPack={currentPack}
              onChangeIntent={setParsedIntent}
              onOpenTest={() => setIsSimulatorOpen(true)}
              onCompileAndActivate={handleCompileAndActivate}
              isCompiling={isCompiling}
              onSwitchToAdvanced={() => setMode('ADVANCED')}
            />
          ) : (
            <div className="p-12 text-center botanical-glass-card rounded-3xl border border-white/[0.08] space-y-4">
              <Sparkles className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Start by describing your automation goal</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Enter your desired business outcome in Simple Mode first, and our AI compiler will structure all 11 guided steps automatically.
              </p>
              <button
                type="button"
                onClick={() => setMode('SIMPLE')}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs cursor-pointer shadow-md shadow-emerald-500/20"
              >
                Go to Simple Mode
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: ADVANCED MODE */}
      {mode === 'ADVANCED' && (
        <div className="botanical-glass-card rounded-3xl p-8 border border-white/[0.08] space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                MODE 3: ADVANCED WORKFLOW CANVAS
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">Visual DAG Node &amp; Schema Editor</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
              {parsedIntent ? `${parsedIntent.name} Graph` : 'New Canvas'}
            </span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Advanced mode exposes low-level nodes, expressions, API payloads, tool calls, and execution logs while editing the exact same underlying workflow definition.
          </p>

          <div className="p-6 rounded-2xl bg-black/40 border border-white/[0.08] text-center space-y-4">
            <Workflow className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Launch Visual Studio Canvas</h4>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Open the full-screen visual canvas studio to customize node wiring, conditional splits, and custom code blocks.
            </p>
            <button
              type="button"
              onClick={handleCompileAndActivate}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs transition shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              Compile &amp; Open in Visual Studio Canvas
            </button>
          </div>
        </div>
      )}

      {/* Simulation Modal */}
      {parsedIntent && (
        <IntentSimulatorModal
          isOpen={isSimulatorOpen}
          onClose={() => setIsSimulatorOpen(false)}
          intent={parsedIntent}
        />
      )}

      {/* Explanation Modal */}
      {parsedIntent && (
        <AutomationExplanationModal
          isOpen={isExplanationOpen}
          onClose={() => setIsExplanationOpen(false)}
          workflowName={parsedIntent.name}
          explanation={parsedIntent.explanation}
          triggerSummary={parsedIntent.trigger.description}
          rulesSummary={(parsedIntent.ruleGroups[0]?.rules || []).map(
            (r) => `${r.fieldLabel} ${r.operator.replace(/_/g, ' ')} ${r.value} (${r.priority})`
          )}
          actionsSummary={parsedIntent.actions.map((a) => a.name)}
          approvalSummary={
            parsedIntent.approvalPolicy.required
              ? `Requires approval by ${parsedIntent.approvalPolicy.reviewerRole || 'Manager'} when ${parsedIntent.approvalPolicy.condition}`
              : 'Executes automatically with zero human friction.'
          }
          destinationSummary={parsedIntent.resultDestination.name}
        />
      )}
    </div>
  );
}

export default function NewWorkflowPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-zinc-400 font-mono text-xs">Loading Automation Studio...</div>}>
      <NewWorkflowStudioContent />
    </Suspense>
  );
}
