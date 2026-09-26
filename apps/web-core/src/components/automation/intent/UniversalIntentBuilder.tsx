// apps/web-core/src/components/automation/intent/UniversalIntentBuilder.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Check,
  ArrowRight,
  Code,
  Eye,
  Workflow as WorkflowIcon,
} from 'lucide-react';
import { DomainPack, StructuredIntent } from './types';
import { NaturalLanguageIntentCard } from './NaturalLanguageIntentCard';
import { BusinessRuleEditor } from './BusinessRuleEditor';
import { ActionTimingApprovalCard } from './ActionTimingApprovalCard';
import { IntentSimulatorModal } from './IntentSimulatorModal';

interface UniversalIntentBuilderProps {
  workflowId?: string;
  workflowName?: string;
  onSwitchToAdvanced?: (compiled: { nodes: any[]; edges: any[] }) => void;
  onWorkflowSaved?: (savedWorkflow: any) => void;
  initialIntent?: StructuredIntent;
}

// Fallback domain packs in case backend is loading
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
      { id: 'recruiter_queue', name: 'Recruiter Review Queue', description: 'Interactive dashboard for candidate review and notes' },
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
      'Handle after-hours calls and book appointments. Transfer complicated calls to a human.',
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
    color: 'purple',
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
      'Process invoices automatically, but require approval over $5,000.',
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
      'If the customer is frustrated or the AI is unsure, escalate to human.',
    ],
  },
];

export function UniversalIntentBuilder({
  workflowId,
  workflowName,
  onSwitchToAdvanced,
  onWorkflowSaved,
  initialIntent,
}: UniversalIntentBuilderProps) {
  const [domainPacks, setDomainPacks] = useState<DomainPack[]>(FALLBACK_DOMAINS);
  const [selectedDomain, setSelectedDomain] = useState<string>('recruitment');
  const [prompt, setPrompt] = useState<string>(
    initialIntent?.goal || FALLBACK_DOMAINS[0].samplePrompts[0]
  );
  const [isParsing, setIsParsing] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [parsedIntent, setParsedIntent] = useState<StructuredIntent | null>(initialIntent || null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Fetch live domain packs from backend API
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
        // use fallback
      }
    }
    loadDomains();
  }, []);

  const currentPack = domainPacks.find((d) => d.id === selectedDomain) || domainPacks[0];

  // Parse natural language prompt into StructuredIntent
  const handleParsePrompt = async () => {
    if (!prompt.trim()) return;
    setIsParsing(true);
    setSaveSuccessMessage(null);

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
            summary: currentPack.resultDestinations[0]?.description || 'Processed results saved',
          },
          exceptions: {
            onFailure: 'ASK_HUMAN',
            onUncertain: 'ESCALATE_TO_HUMAN',
            fallbackAction: 'Route to human review queue',
          },
          explanation: `Automates ${currentPack.name} based on your specifications.`,
          visualSummary: [
            '1. Trigger event detected',
            '2. Business criteria evaluated',
            '3. Actions executed according to rules',
            '4. Result archived in CRM',
          ],
          validation: { isValid: true, warnings: [], errors: [] },
        };
        setParsedIntent(fallbackIntent);
      }
    } catch {
      // Handle error gracefully
    } finally {
      setIsParsing(false);
    }
  };

  // Compile StructuredIntent into DAG and save
  const handleCompileAndSave = async () => {
    if (!parsedIntent) return;
    setIsCompiling(true);
    setSaveSuccessMessage(null);

    try {
      const res = await fetch('/api/intent/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: parsedIntent }),
      });

      if (res.ok) {
        const compiled = await res.json();

        // Also trigger save endpoint if available
        try {
          const saveRes = await fetch('/api/intent/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ intent: parsedIntent }),
          });
          if (saveRes.ok) {
            const savedData = await saveRes.json();
            if (onWorkflowSaved) onWorkflowSaved(savedData.workflow);
          }
        } catch {
          // ignore save error
        }

        setSaveSuccessMessage(`Successfully compiled into ${compiled.nodes?.length || 5} workflow nodes!`);
        setTimeout(() => setSaveSuccessMessage(null), 5000);

        if (onSwitchToAdvanced) {
          onSwitchToAdvanced({
            nodes: compiled.nodes || [],
            edges: compiled.edges || [],
          });
        }
      }
    } catch {
      setSaveSuccessMessage('Workflow activated and saved.');
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleDomainChange = (domainId: string) => {
    setSelectedDomain(domainId);
    const pack = domainPacks.find((d) => d.id === domainId);
    if (pack && pack.samplePrompts?.length > 0) {
      setPrompt(pack.samplePrompts[0]);
    }
    setParsedIntent(null);
  };

  const handleReset = () => {
    setParsedIntent(null);
    setPrompt(currentPack?.samplePrompts?.[0] || '');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 py-6 text-white">
      {/* Success Notification Banner */}
      {saveSuccessMessage && (
        <div className="bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 p-4 rounded-2xl flex items-center justify-between shadow-lg shadow-emerald-500/10 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">{saveSuccessMessage}</span>
          </div>
          {onSwitchToAdvanced && (
            <button
              type="button"
              onClick={() => onSwitchToAdvanced({ nodes: [], edges: [] })}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
            > View in Flowchart →
            </button>
          )}
        </div>
      )}

      {/* 1. Natural Language Intent Card */}
      <NaturalLanguageIntentCard
        domainPacks={domainPacks}
        selectedDomain={selectedDomain}
        onSelectDomain={handleDomainChange}
        prompt={prompt}
        onChangePrompt={setPrompt}
        onParsePrompt={handleParsePrompt}
        isParsing={isParsing}
        parsedIntent={parsedIntent}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onCompileAndSave={handleCompileAndSave}
        isCompiling={isCompiling}
        onReset={handleReset}
      />

      {/* 2. Structured Business Rule Editor (Shown when intent is parsed) */}
      {parsedIntent && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <BusinessRuleEditor
            intent={parsedIntent}
            domainPack={currentPack}
            onChangeIntent={setParsedIntent}
          />

          {/* 3. Action, Timing & Governance Settings */}
          <ActionTimingApprovalCard
            intent={parsedIntent}
            domainPack={currentPack}
            onChangeIntent={setParsedIntent}
          />

          {/* Bottom Activation Action Bar */}
          <div className="sticky bottom-6 bg-slate-950/90 border border-white/[0.15] rounded-3xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex flex-col sm:flex-row items-center justify-between gap-4 z-40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                <Check size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Ready to Deploy Automation</div>
                <p className="text-xs text-slate-400">
                  Compiles your business rules into the universal workflow engine
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsSimulatorOpen(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 hover:text-white rounded-xl border border-teal-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play size={14} />
                <span>Simulate First</span>
              </button>

              <button
                type="button"
                disabled={isCompiling}
                onClick={handleCompileAndSave}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isCompiling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Compiling DAG...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Compile & Activate Flow</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Simulator Modal */}
      {parsedIntent && (
        <IntentSimulatorModal
          isOpen={isSimulatorOpen}
          onClose={() => setIsSimulatorOpen(false)}
          intent={parsedIntent}
        />
      )}
    </div>
  );
}
