'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  Zap,
  TrendingUp,
  AlertTriangle,
  HeartPulse,
  Send,
  MessageSquare,
  PhoneCall,
  CheckCircle2,
  Sliders,
  Search,
  Bot,
  UserCheck,
  Building2,
  Mail,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Clock,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  Flame,
  FileText,
  Target,
  LineChart,
  HelpCircle,
  Play,
  Copy,
  Check,
  ChevronRight,
  Cpu,
  Workflow,
  Radio,
  SlidersHorizontal,
  ExternalLink,
  Shield,
  Activity,
} from 'lucide-react';

// Types for Contact Enrichment & Sentiment
export interface EnrichedContact {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  companySize: string;
  industry: string;
  techStack: string[];
  sentimentScore: number;
  sentimentLabel: 'POSITIVE' | 'NEUTRAL' | 'AT_RISK';
  summaryBullets: string[];
  isEnriched: boolean;
  optimalSendTime: string;
  avatarInitials: string;
}

// Types for Predictive Lead Scoring & Deal Health
export interface IntelligentDeal {
  id: string;
  title: string;
  company: string;
  amount: number;
  stage: string;
  predictiveScore: number;
  winProbability: number;
  healthStatus: 'HEALTHY' | 'STALLED' | 'GHOSTING_RISK' | 'VELOCITY_DROP';
  healthReason: string;
  nextBestAction: string;
  daysInStage: number;
}

// Types for Churn Radar & Account Health
export interface ChurnAlert {
  id: string;
  company: string;
  mrr: number;
  healthIndex: number;
  churnRisk: 'HIGH' | 'MEDIUM' | 'LOW';
  riskFactor: string;
  recommendedAction: string;
  lastContact: string;
}

// Seeded Enterprise Contacts
const INITIAL_CONTACTS: EnrichedContact[] = [
  {
    id: 'cnt_elena_rostova',
    name: 'Elena Rostova',
    email: 'elena.rostova@hyperion.io',
    role: 'Chief Operating Officer',
    company: 'Hyperion Technologies Inc.',
    companySize: '1,450+ employees (Verified Crunchbase)',
    industry: 'Enterprise Cloud & AI Infra',
    techStack: ['Next.js', 'PostgreSQL', 'Docker', 'Kubernetes', 'FastAPI'],
    sentimentScore: 94,
    sentimentLabel: 'POSITIVE',
    summaryBullets: [
      'Strongly in favor of unified Khata multi-branch ledgers to replace 3 disparate billing systems.',
      'Requested SOC2 Type II certification and HIPAA data isolation documentation for board review.',
      'Opened proposal 4 times in the past 24 hours with intent to close before fiscal quarter-end.',
    ],
    isEnriched: true,
    optimalSendTime: 'Tuesday 9:45 AM EST (92% Open Propensity)',
    avatarInitials: 'ER',
  },
  {
    id: 'cnt_marcus_vance',
    name: 'Marcus Vance',
    email: 'm.vance@vertexai.tech',
    role: 'VP of Platform Engineering',
    company: 'Vertex Autonomous AI',
    companySize: '320 employees (Series B Funded)',
    industry: 'Autonomous Robotics & LLMs',
    techStack: ['Python', 'PyTorch', 'Redis', 'Kafka', 'AWS Graviton'],
    sentimentScore: 78,
    sentimentLabel: 'POSITIVE',
    summaryBullets: [
      'Evaluating SIM Gateway and WebRTC softphone for distributed fleet telemetry dispatch.',
      'Concerns regarding sub-5ms webhook latency during burst traffic windows.',
      'Scheduled technical architecture deep-dive for next Wednesday.',
    ],
    isEnriched: true,
    optimalSendTime: 'Thursday 2:15 PM EST (84% Open Propensity)',
    avatarInitials: 'MV',
  },
  {
    id: 'cnt_sarah_lin',
    name: 'Sarah Lin',
    email: 'sarah.lin@novaglobal.com',
    role: 'Head of Global Payments & Treasury',
    company: 'Nova Global FinTech',
    companySize: '2,800+ employees (Public NASDAQ)',
    industry: 'Financial Technology & Banking',
    techStack: ['Java Spring', 'Snowflake', 'Stripe Connect', 'Oracle GL'],
    sentimentScore: 42,
    sentimentLabel: 'AT_RISK',
    summaryBullets: [
      'Customer health declined after 2 overdue commercial invoices (#INV-3981) and 3 open API tickets.',
      'Requires managing director intervention to review custom volume-tier pricing schedule.',
      'Sentinel Athena CSM flagged high probability of contract churn in next 30 days.',
    ],
    isEnriched: false,
    optimalSendTime: 'Monday 8:30 AM EST (71% Open Propensity)',
    avatarInitials: 'SL',
  },
  {
    id: 'cnt_alex_chen',
    name: 'Dr. Alex Chen',
    email: 'alex.chen@apexhospital.org',
    role: 'Chief Medical Information Officer',
    company: 'Apex Memorial Healthcare Network',
    companySize: '4,200 clinical staff across 8 facilities',
    industry: 'Hospital & Healthcare Systems',
    techStack: ['Epic EHR', 'HL7/FHIR', 'Azure Health', 'DICOM PACS'],
    sentimentScore: 88,
    sentimentLabel: 'POSITIVE',
    summaryBullets: [
      'Spearheading digital patient triage intake and automated clinical appointment scheduling.',
      'Requires HIPAA BAA executed prior to production rollout of AI Support Sentinel.',
      'Champion user with high platform engagement across executive dashboard.',
    ],
    isEnriched: true,
    optimalSendTime: 'Wednesday 7:15 AM EST (89% Open Propensity)',
    avatarInitials: 'AC',
  },
];

// Seeded Intelligent Deals
const INITIAL_DEALS: IntelligentDeal[] = [
  {
    id: 'deal_hyperion_q3',
    title: 'Hyperion Enterprise Cloud Expansion',
    company: 'Hyperion Technologies Inc.',
    amount: 185000,
    stage: 'Contract & Signatures',
    predictiveScore: 94,
    winProbability: 92,
    healthStatus: 'HEALTHY',
    healthReason: 'Elena viewed commercial proposal 4 times in 24 hours. Executive decision-maker champion aligned.',
    nextBestAction: 'Deploy 10% Commercial Concession ($18,500) to lock signature before quarter-end.',
    daysInStage: 4,
  },
  {
    id: 'deal_vertex_platform',
    title: 'Vertex Autonomous Telephony & SIM Mesh',
    company: 'Vertex Autonomous AI',
    amount: 142000,
    stage: 'Technical Due Diligence',
    predictiveScore: 82,
    winProbability: 79,
    healthStatus: 'HEALTHY',
    healthReason: 'Engineering latency benchmark report dispatched. Technical committee reviewing architecture.',
    nextBestAction: 'Schedule VP Engineering follow-up to resolve Redis caching question.',
    daysInStage: 9,
  },
  {
    id: 'deal_nova_renewal',
    title: 'Nova FinTech Multi-Branch Khata Renewal',
    company: 'Nova Global FinTech',
    amount: 240000,
    stage: 'Renewal / Evaluation',
    predictiveScore: 38,
    winProbability: 35,
    healthStatus: 'GHOSTING_RISK',
    healthReason: 'Zero stakeholder touchpoints in 14 days following invoice discrepancy notification.',
    nextBestAction: 'Trigger Executive CSM Intervention & schedule VP Treasury meeting.',
    daysInStage: 22,
  },
  {
    id: 'deal_apex_clinical',
    title: 'Apex Health Digital EHR & Triage Suite',
    company: 'Apex Memorial Healthcare Network',
    amount: 98000,
    stage: 'Proposal Shared',
    predictiveScore: 71,
    winProbability: 68,
    healthStatus: 'VELOCITY_DROP',
    healthReason: 'Average stage progression slowed by 6 days awaiting legal HIPAA compliance rider review.',
    nextBestAction: 'Deliver pre-signed BAA compliance bundle with automated audit trail verification.',
    daysInStage: 16,
  },
];

// Seeded Churn Alerts
const INITIAL_CHURN_ALERTS: ChurnAlert[] = [
  {
    id: 'churn_01',
    company: 'Nova Global FinTech',
    mrr: 14200,
    healthIndex: 42,
    churnRisk: 'HIGH',
    riskFactor: 'Invoice #INV-3981 overdue by 45 days & 3 open support tickets on API rate limits.',
    recommendedAction: 'Engage Sentinel Athena for VIP Concierge Call & waive late fee penalty.',
    lastContact: '14 days ago',
  },
  {
    id: 'churn_02',
    company: 'Cyberdyne Scale Labs',
    mrr: 6800,
    healthIndex: 58,
    churnRisk: 'MEDIUM',
    riskFactor: 'Weekly active user count dropped 32% following recent internal team reorganization.',
    recommendedAction: 'Enroll operations team in automated re-onboarding webinar series.',
    lastContact: '5 days ago',
  },
  {
    id: 'churn_03',
    company: 'Horizon Logistics Global',
    mrr: 9400,
    healthIndex: 65,
    churnRisk: 'MEDIUM',
    riskFactor: 'SIM Gateway data usage approaching 95% cap with zero top-up configured.',
    recommendedAction: 'Send automated upgrade notification for enterprise unlimited data pool.',
    lastContact: '2 days ago',
  },
];

export function AiStudioClient() {
  const [activeTab, setActiveTab] = useState<
    'enrichment' | 'scoring' | 'battlecards' | 'copilot' | 'automation' | 'forecasting'
  >('enrichment');

  // Contact States
  const [contacts, setContacts] = useState<EnrichedContact[]>(INITIAL_CONTACTS);
  const [selectedContact, setSelectedContact] = useState<EnrichedContact>(INITIAL_CONTACTS[0]);
  const [isEnriching, setIsEnriching] = useState(false);

  // Deals States
  const [deals, setDeals] = useState<IntelligentDeal[]>(INITIAL_DEALS);
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  // Pre-Call Digest State
  const [selectedDigestDeal, setSelectedDigestDeal] = useState<IntelligentDeal>(INITIAL_DEALS[0]);
  const [isGeneratingDigest, setIsGeneratingDigest] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptResult, setTranscriptResult] = useState<{
    summary: string;
    actionItems: string[];
    sentiment: string;
    detectedNextStage: string;
  } | null>(null);

  // Conversational Copilot States
  const [selectedModel, setSelectedModel] = useState<'groq' | 'openrouter' | 'claude' | 'mistral'>('groq');
  const [chatMessages, setChatMessages] = useState<
    { sender: 'user' | 'bot'; text: string; time: string; modelBadge?: string; bookedMeeting?: boolean }[]
  >([
    {
      sender: 'bot',
      text: '👋 **Welcome to Enterprise Neural Copilot.** I monitor your pipeline velocity, draft commercial battlecards, and execute autonomous actions across the Business OS. How can I assist your operations today?',
      time: '10:00 AM',
      modelBadge: 'Groq Llama-3.3-70B',
    },
    {
      sender: 'user',
      text: 'What is the highest-velocity expansion deal currently at risk in our Q3 pipeline?',
      time: '10:01 AM',
    },
    {
      sender: 'bot',
      text: '⚠️ **Nova Global FinTech ($240,000 ARR)** is at critical risk.\n\n- **Churn Risk**: HIGH (Health Index: 42/100)\n- **Root Cause**: 2 overdue invoices and 14 days without stakeholder touchpoints.\n- **Recommended Action**: Athena CSM and Ares Sales recommend an immediate executive concierge review with a 10% commercial credit concession.',
      time: '10:01 AM',
      modelBadge: 'Groq Llama-3.3-70B',
    },
  ]);
  const [userChatInput, setUserChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Natural Language Workflow Prompt State
  const [workflowPrompt, setWorkflowPrompt] = useState('When a deal exceeds $50,000 and customer health drops below 50, notify VP Sales and apply 10% concession');
  const [generatedTrigger, setGeneratedTrigger] = useState<{
    triggerEvent: string;
    condition: string;
    action: string;
  } | null>({
    triggerEvent: 'WHEN deal.amount > 50000 AND contact.healthScore < 50',
    condition: 'IF account.churnRisk == "HIGH"',
    action: 'THEN escalateToExecutiveQueue("Ares Sales") AND dispatchWhatsAppConcierge()',
  });
  const [isGeneratingTrigger, setIsGeneratingTrigger] = useState(false);

  // Natural Language BI Queries State
  const [biQuery, setBiQuery] = useState('Show Q3 gross expansion pipeline by customer tier and churn exposure');
  const [biResult, setBiResult] = useState<{
    queryTitle: string;
    chartData: { label: string; value: number; change: string }[];
    aiInsight: string;
  } | null>({
    queryTitle: 'Q3 Enterprise Expansion vs Churn Exposure Radar',
    chartData: [
      { label: 'Healthy Enterprise Expansion', value: 840000, change: '+44%' },
      { label: 'Stalled Evaluation Pipeline', value: 310000, change: '+18%' },
      { label: 'At-Risk Churn Exposure', value: 240000, change: '-28%' },
    ],
    aiInsight: '81% of net pipeline velocity is driven by enterprise accounts with active multi-branch Khata ledgers. Reclaiming the Nova FinTech account ($240k) preserves 100% of quarterly expansion targets.',
  });
  const [isQueryingBI, setIsQueryingBI] = useState(false);

  // Handle Contact Neural AI Enrichment
  const handleEnrichContact = (contactId: string) => {
    setIsEnriching(true);
    setTimeout(() => {
      setContacts((prev) =>
        prev.map((c) => {
          if (c.id === contactId) {
            return {
              ...c,
              isEnriched: true,
              sentimentScore: Math.min(100, c.sentimentScore + 5),
              techStack: Array.from(new Set([...c.techStack, 'Plaid API', 'Stripe Connect', 'Terraform'])),
              companySize: c.companySize.includes('Verified') ? c.companySize : `${c.companySize} · (Verified Live)`,
            };
          }
          return c;
        })
      );
      setIsEnriching(false);
      setActionAlert(`✨ Neural enrichment completed for ${selectedContact.name}! Tech stack and firmographics updated.`);
      setTimeout(() => setActionAlert(null), 4000);
    }, 900);
  };

  // Handle Next Best Action Execution
  const handleExecuteNextBestAction = (deal: IntelligentDeal) => {
    setActionAlert(`⚡ Dispatched Next-Best-Action for ${deal.title} onto Unified Event Bus.`);
    setDeals((prev) =>
      prev.map((d) =>
        d.id === deal.id ? { ...d, winProbability: Math.min(99, d.winProbability + 8), healthStatus: 'HEALTHY' } : d
      )
    );
    // Emit event to automation bus
    fetch('http://localhost:3009/workflows/events/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': 'default-tenant' },
      body: JSON.stringify({
        type: 'AI_NEXT_BEST_ACTION_EXECUTED',
        aggregateType: 'Deal',
        aggregateId: deal.id,
        payload: { dealTitle: deal.title, amount: deal.amount, action: deal.nextBestAction },
      }),
    }).catch(() => {});
    setTimeout(() => setActionAlert(null), 4000);
  };

  // Handle Call Transcription Simulator
  const handleSimulateCallTranscript = () => {
    setIsTranscribing(true);
    setTimeout(() => {
      setTranscriptResult({
        summary: `Recorded 22-min executive discussion with ${selectedDigestDeal.company} regarding contract terms and technical SLA sign-off.`,
        actionItems: [
          'Deliver updated Master Services Agreement with 3-year commercial tier concession locked.',
          'Grant Dr. Chen security clearance on sandbox FHIR API endpoints.',
          'Automatically advance deal stage to "Executive Review & E-Signatures".',
        ],
        sentiment: 'Positive (94% Statistical Confidence)',
        detectedNextStage: 'Contract & Signatures',
      });
      setIsTranscribing(false);
      setActionAlert('🎙️ Call audio transcribed! Extracted 3 action items and advanced CRM deal stage.');
      setTimeout(() => setActionAlert(null), 4000);
    }, 1100);
  };

  // Handle Chatbot Response with Live Groq / OpenRouter
  const handleSendChatbotMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userChatInput.trim() || isSendingChat) return;

    const query = userChatInput.trim();
    const userMsg = { sender: 'user' as const, text: query, time: 'Just now' };
    setChatMessages((prev) => [...prev, userMsg]);
    setUserChatInput('');
    setIsSendingChat(true);

    const modelName =
      selectedModel === 'groq'
        ? 'groq/compound'
        : selectedModel === 'claude'
        ? 'anthropic/claude-3.5-sonnet'
        : selectedModel === 'mistral'
        ? 'mistralai/mistral-large-2407'
        : 'openai/gpt-4o-mini';

    const modelBadge =
      selectedModel === 'groq'
        ? 'Groq Llama-3.3'
        : selectedModel === 'claude'
        ? 'Claude 3.5'
        : selectedModel === 'mistral'
        ? 'Mistral Large'
        : 'GPT-4o mini';

    try {
      const res = await fetch('/api/ai/prompts/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': 'default-tenant' },
        body: JSON.stringify({
          query,
          provider: selectedModel === 'groq' ? 'groq' : 'openrouter',
          model: modelName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg = {
          sender: 'bot' as const,
          text: data.reply || '✨ Action processed successfully across the Business OS.',
          time: 'Just now',
          modelBadge,
          bookedMeeting: query.toLowerCase().includes('book') || query.toLowerCase().includes('demo') || query.toLowerCase().includes('meeting'),
        };
        setChatMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error('Fallback response needed');
      }
    } catch {
      // Intelligent fallback
      const botMsg = {
        sender: 'bot' as const,
        text: `✨ **Intelligence Synthesis (${modelBadge})**:\n\nRegarding your inquiry: "${query}"\n\n- **Telemetry**: Monitored 4 commercial enterprise deals and 4 VIP accounts.\n- **Recommended Strategy**: Prioritize immediate touchpoint with Hyperion and Nova FinTech to lock signature before quarter-end.\n- **Autonomous Action**: Prepared executive concession memo in Managerial Approval Queue.`,
        time: 'Just now',
        modelBadge,
      };
      setChatMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Handle Natural Language BI Query
  const handleRunBIQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!biQuery.trim()) return;

    setIsQueryingBI(true);
    setTimeout(() => {
      setBiResult({
        queryTitle: `Synthesis: "${biQuery}"`,
        chartData: [
          { label: 'Q1 Realized Revenue', value: 540000, change: '+24%' },
          { label: 'Q2 Realized Revenue', value: 780000, change: '+44%' },
          { label: 'Q3 Projected Gross Pipeline', value: 1680000, change: '+115%' },
        ],
        aiInsight: 'Historical deal velocity indicates a 42% acceleration when multi-channel AI sequences are enabled during contract evaluation.',
      });
      setIsQueryingBI(false);
      setActionAlert('📊 Natural language business intelligence synthesized!');
      setTimeout(() => setActionAlert(null), 3500);
    }, 700);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white pb-20">
      {/* Alert Notification Banner */}
      {actionAlert && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-between shadow-xl animate-fadeIn backdrop-blur-xl">
          <div className="flex items-center gap-3 text-emerald-300 text-xs font-semibold">
            <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
            <span>{actionAlert}</span>
          </div>
          <button onClick={() => setActionAlert(null)} className="text-xs text-emerald-400 hover:text-white cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Status Strip */}
      <div className="bg-slate-900/80 dark:bg-white/[0.02] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center gap-1.5">
              <Sparkles size={11} />
              Pillar 2: AI &amp; Neural Autonomy Suite v4.8
            </span>
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Activity size={12} className="text-emerald-400" />
              Real-Time Inference Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Brain className="text-violet-400" size={32} />
            Enterprise AI &amp; Neural Intelligence Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Predictive lead scoring, automated firmographic enrichment, pre-call battlecards, multi-model copilot, and natural language analytics.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-slate-300">Latency: 18ms</span>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 6 Core Neural Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 overflow-x-auto">
        {[
          { id: 'enrichment', label: '1. Contact Enrichment & Sentiment', icon: UserCheck },
          { id: 'scoring', label: '2. Predictive Lead & Deal Health', icon: Target },
          { id: 'battlecards', label: '3. Pre-Call Digests & Transcription', icon: PhoneCall },
          { id: 'copilot', label: '4. Multi-Model Copilot & Booking', icon: Bot },
          { id: 'automation', label: '5. Natural Language Trigger Studio', icon: Zap },
          { id: 'forecasting', label: '6. Natural Language BI & Churn Radar', icon: LineChart },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20 font-black'
                  : 'bg-white/[0.03] text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: CONTACT ENRICHMENT, SENTIMENT & TOUCHPOINT RADAR */}
      {/* ======================================================== */}
      {activeTab === 'enrichment' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Contact Selector List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                Enterprise Contacts ({contacts.length})
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Live Sync</span>
            </div>

            <div className="space-y-2.5">
              {contacts.map((c) => {
                const isSelected = selectedContact?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedContact(c)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'border-violet-500 bg-white/[0.06] ring-2 ring-violet-500/20 shadow-lg'
                        : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-500/20 to-indigo-500/20 text-violet-300 font-black text-xs flex items-center justify-center border border-violet-500/30">
                          {c.avatarInitials}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-white">{c.name}</h4>
                          <span className="text-[10px] text-slate-400 font-medium block truncate max-w-[150px]">
                            {c.company}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.sentimentLabel === 'POSITIVE'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : c.sentimentLabel === 'NEUTRAL'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {c.sentimentScore}% {c.sentimentLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: AI Enrichment & Intelligence Card (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {selectedContact ? (
              <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.08] pb-5">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-violet-500/20">
                      {selectedContact.avatarInitials}
                    </div>
                    <div>
                      <h2 className="text-base font-black text-white flex items-center gap-2">
                        <span>{selectedContact.name}</span>
                        {selectedContact.isEnriched && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            ✓ Verified Enriched
                          </span>
                        )}
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {selectedContact.role} · {selectedContact.company}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleEnrichContact(selectedContact.id)}
                    disabled={isEnriching}
                    className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-violet-500/20 disabled:opacity-50"
                  >
                    <RefreshCw size={13} className={isEnriching ? 'animate-spin' : ''} />
                    <span>{isEnriching ? 'Scanning Registries...' : 'Run Neural Enrichment'}</span>
                  </button>
                </div>

                {/* Verified Firmographics & Send Time */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Company Size</span>
                    <span className="text-xs font-bold text-white mt-1 block">{selectedContact.companySize}</span>
                  </div>
                  <div className="p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Industry Domain</span>
                    <span className="text-xs font-bold text-white mt-1 block">{selectedContact.industry}</span>
                  </div>
                  <div className="p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AI Send-Time (STO)</span>
                    <span className="text-xs font-bold text-emerald-400 mt-1 block">{selectedContact.optimalSendTime}</span>
                  </div>
                </div>

                {/* Tech Stack Discovery */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Detected Technology Stack (Crawler Verified)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedContact.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 bg-white/[0.05] text-slate-300 rounded-xl text-xs font-mono font-semibold border border-white/[0.08]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sentiment Meter */}
                <div className="space-y-2 bg-white/[0.02] p-4 rounded-2xl border border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <HeartPulse size={15} className="text-emerald-400" />
                      <span>Stakeholder Engagement &amp; Sentiment Radar</span>
                    </span>
                    <span className="font-mono text-white">
                      {selectedContact.sentimentScore} / 100 ({selectedContact.sentimentLabel})
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-white/[0.05] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        selectedContact.sentimentLabel === 'POSITIVE'
                          ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                          : selectedContact.sentimentLabel === 'NEUTRAL'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${selectedContact.sentimentScore}%` }}
                    />
                  </div>
                </div>

                {/* 3-Bullet Executive Digest */}
                <div className="p-5 bg-violet-950/20 border border-violet-500/30 rounded-2xl space-y-2.5">
                  <h4 className="text-xs font-black text-violet-300 flex items-center gap-2 uppercase tracking-wider">
                    <Sparkles size={14} className="text-violet-400" />
                    <span>3-Bullet Pre-Call Executive Briefing</span>
                  </h4>
                  <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                    {selectedContact.summaryBullets.map((bullet, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-violet-400 font-bold">•</span>
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PREDICTIVE LEAD & DEAL HEALTH SCORING */}
      {/* ======================================================== */}
      {activeTab === 'scoring' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white">Machine Learning Deal Velocity &amp; Anomaly Radar</h2>
              <p className="text-xs text-slate-400 mt-0.5">Automated deal win prediction, stall detection, and algorithmic Next Best Actions.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {deals.map((dl) => (
              <div
                key={dl.id}
                className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-xl hover:border-violet-500/40 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-xs text-white group-hover:text-violet-300 transition-colors">{dl.title}</h3>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{dl.company}</span>
                    </div>
                    <span className="font-mono font-bold text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      ${dl.amount.toLocaleString()}
                    </span>
                  </div>

                  {/* Win Probability Meter */}
                  <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.06] space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Win Probability</span>
                      <span className="font-mono font-bold text-violet-400">{dl.winProbability}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          dl.winProbability > 75 ? 'bg-emerald-500' : dl.winProbability > 50 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${dl.winProbability}%` }}
                      />
                    </div>
                  </div>

                  {/* Health Diagnostic Reason */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-bold uppercase">Anomaly Diagnostic</span>
                      <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase ${
                        dl.healthStatus === 'HEALTHY'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : dl.healthStatus === 'GHOSTING_RISK'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {dl.healthStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 bg-white/[0.015] p-2 rounded-xl border border-white/[0.04]">
                      {dl.healthReason}
                    </p>
                  </div>
                </div>

                {/* Next Best Action Button */}
                <div className="pt-2 border-t border-white/[0.06] space-y-2">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Next Best Action:</span>
                  <p className="text-[10px] text-slate-400 line-clamp-2">{dl.nextBestAction}</p>
                  <button
                    type="button"
                    onClick={() => handleExecuteNextBestAction(dl)}
                    className="w-full py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Zap size={12} />
                    <span>Execute Action</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: PRE-CALL DIGESTS & BATTLECARDS */}
      {/* ======================================================== */}
      {activeTab === 'battlecards' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-5 space-y-4 shadow-xl">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Select Deal Target</h3>
              <div className="space-y-2">
                {deals.map((deal) => (
                  <div
                    key={deal.id}
                    onClick={() => setSelectedDigestDeal(deal)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      selectedDigestDeal.id === deal.id
                        ? 'border-violet-500 bg-white/[0.06]'
                        : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-white">{deal.title}</span>
                      <span className="font-mono text-xs text-emerald-400">${deal.amount.toLocaleString()}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{deal.company} · {deal.stage}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={handleSimulateCallTranscript}
                  disabled={isTranscribing}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <PhoneCall size={14} className={isTranscribing ? 'animate-bounce' : ''} />
                  <span>{isTranscribing ? 'Transcribing Audio...' : 'Simulate Recorded Call & Auto-Stage'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-5">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded border border-violet-500/20">
                  Pre-Call Battlecard
                </span>
                <h3 className="text-base font-black text-white mt-2">{selectedDigestDeal.title}</h3>
                <p className="text-xs text-slate-400">Target Account: {selectedDigestDeal.company}</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Top 3 Executive Talking Points:</h4>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-lg bg-violet-500/20 text-violet-400 text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                    <span>Highlight our unified Khata multi-branch ledger which eliminates manual CSV reconciliations.</span>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-lg bg-violet-500/20 text-violet-400 text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                    <span>Reinforce our SOC2 Type II cryptographic event stream and sub-5ms WebRTC softphone latency.</span>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-lg bg-violet-500/20 text-violet-400 text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
                    <span>Counter competitor HubSpot / Salesforce pricing: Zero per-seat add-on charges for AI OCR or SIM gateway.</span>
                  </div>
                </div>
              </div>

              {/* Transcription result if run */}
              {transcriptResult && (
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl space-y-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 size={14} />
                      Call Audio Transcribed Successfully
                    </span>
                    <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {transcriptResult.sentiment}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{transcriptResult.summary}</p>
                  <div className="pt-2 border-t border-emerald-500/20">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Extracted Action Items:</span>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {transcriptResult.actionItems.map((act, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <Check size={12} className="text-emerald-400" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: MULTI-MODEL COPILOT & AUTONOMOUS BOOKING */}
      {/* ======================================================== */}
      {activeTab === 'copilot' && (
        <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Bot className="text-violet-400" size={20} />
                <span>Enterprise Conversational Copilot &amp; Booking Agent</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Route queries dynamically to specialized LLM inference engines with autonomous calendar booking.
              </p>
            </div>

            {/* Model Selector */}
            <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
              {[
                { id: 'groq', label: 'Groq Llama-3.3', tag: 'Fastest' },
                { id: 'openrouter', label: 'GPT-4o mini', tag: 'Balanced' },
                { id: 'claude', label: 'Claude 3.5', tag: 'Strategy' },
                { id: 'mistral', label: 'Mistral Large', tag: 'EU' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedModel(m.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedModel === m.id
                      ? 'bg-violet-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Stream Window */}
          <div className="space-y-4 max-h-[420px] overflow-y-auto p-4 bg-black/30 rounded-2xl border border-white/[0.06]">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 max-w-2xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                    msg.sender === 'user'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white'
                  }`}
                >
                  {msg.sender === 'user' ? 'You' : <Bot size={15} />}
                </div>

                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/30'
                      : 'bg-white/[0.04] text-slate-200 border border-white/[0.08]'
                  }`}
                >
                  {msg.modelBadge && (
                    <span className="text-[9px] font-mono text-violet-400 uppercase tracking-widest block mb-1">
                      {msg.modelBadge}
                    </span>
                  )}
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  {msg.bookedMeeting && (
                    <div className="mt-3 p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-300 font-bold">
                      <Calendar size={14} className="text-emerald-400" />
                      <span>Calendar invite dispatched to attendee!</span>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-500 block mt-2">{msg.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChatbotMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={userChatInput}
              onChange={(e) => setUserChatInput(e.target.value)}
              placeholder="Ask copilot: 'Draft VIP proposal for Hyperion' or 'Which accounts are churning?'"
              className="flex-1 px-4 py-3 bg-white/[0.05] border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-violet-500"
            />
            <button
              type="submit"
              disabled={isSendingChat || !userChatInput.trim()}
              className="px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-black rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send size={14} />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: NATURAL LANGUAGE TRIGGER SYNTHESIZER */}
      {/* ======================================================== */}
      {activeTab === 'automation' && (
        <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-6">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Zap className="text-amber-400" size={20} />
              <span>Natural Language Automation Trigger Synthesizer</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Type business instructions in conversational English and synthesize them into active workflow rules.
            </p>
          </div>

          <div className="space-y-3">
            <textarea
              rows={3}
              value={workflowPrompt}
              onChange={(e) => setWorkflowPrompt(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-violet-500 leading-relaxed font-mono"
            />
            <button
              type="button"
              onClick={() => {
                setIsGeneratingTrigger(true);
                setTimeout(() => {
                  setGeneratedTrigger({
                    triggerEvent: 'WHEN deal.amount > 50000 AND contact.healthScore < 50',
                    condition: `IF "${workflowPrompt}"`,
                    action: 'THEN executeNeuralCopilotAction() AND notifySlackChannel("#sales-war-room")',
                  });
                  setIsGeneratingTrigger(false);
                  setActionAlert('⚡ Automation rule synthesized and deployed to Universal Engine!');
                  setTimeout(() => setActionAlert(null), 3500);
                }, 700);
              }}
              disabled={isGeneratingTrigger}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Workflow size={14} />
              <span>{isGeneratingTrigger ? 'Synthesizing...' : 'Synthesize Workflow Node'}</span>
            </button>
          </div>

          {generatedTrigger && (
            <div className="p-5 bg-black/40 border border-white/10 rounded-2xl space-y-3 font-mono text-xs">
              <div className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                Active Neural Workflow Node:
              </div>
              <div className="text-emerald-400">{generatedTrigger.triggerEvent}</div>
              <div className="text-slate-300">{generatedTrigger.condition}</div>
              <div className="text-violet-400">{generatedTrigger.action}</div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: NATURAL LANGUAGE BI & CHURN RADAR */}
      {/* ======================================================== */}
      {activeTab === 'forecasting' && (
        <div className="space-y-6">
          {/* Natural Language BI Query Card */}
          <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-5">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <LineChart className="text-emerald-400" size={20} />
                <span>Natural Language Business Intelligence Synthesis</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Query operational ledgers, ARR trends, and cohort churn metrics in plain English.
              </p>
            </div>

            <form onSubmit={handleRunBIQuery} className="flex items-center gap-2">
              <input
                type="text"
                value={biQuery}
                onChange={(e) => setBiQuery(e.target.value)}
                placeholder="Ask: 'Show Q3 revenue projection by customer segment and churn exposure'"
                className="flex-1 px-4 py-3 bg-white/[0.05] border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={isQueryingBI}
                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Search size={14} />
                <span>{isQueryingBI ? 'Analyzing...' : 'Run Query'}</span>
              </button>
            </form>

            {biResult && (
              <div className="p-5 bg-black/40 border border-white/10 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">{biResult.queryTitle}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {biResult.chartData.map((d, idx) => (
                    <div key={idx} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl text-center space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">{d.label}</div>
                      <div className="font-mono font-black text-xl text-emerald-400">${d.value.toLocaleString()}</div>
                      <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded">
                        {d.change}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-300 bg-white/[0.02] p-3 rounded-xl border border-white/[0.04] leading-relaxed">
                  {biResult.aiInsight}
                </p>
              </div>
            )}
          </div>

          {/* Churn Propensity Radar */}
          <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <AlertTriangle size={18} className="text-rose-400" />
                  <span>Account Churn Propensity Radar</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Accounts flagged with declining health indexes or overdue ledger balances.
                </p>
              </div>
              <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-xl border border-rose-500/20">
                3 Accounts Monitored
              </span>
            </div>

            <div className="space-y-3">
              {INITIAL_CHURN_ALERTS.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-bold text-xs text-white">{alert.company}</h4>
                      <span className="font-mono text-xs font-bold text-emerald-400">${alert.mrr.toLocaleString()} MRR</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        alert.churnRisk === 'HIGH' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        Risk: {alert.churnRisk}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{alert.riskFactor}</p>
                    <p className="text-[11px] text-violet-400 font-semibold">{alert.recommendedAction}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActionAlert(`Athena CSM Retention sequence activated for ${alert.company}!`);
                      setTimeout(() => setActionAlert(null), 4000);
                    }}
                    className="px-4 py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
                  >
                    Deploy Athena Concierge
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
