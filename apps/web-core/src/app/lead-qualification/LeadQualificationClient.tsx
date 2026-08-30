'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Globe,
  Bot,
  Mail,
  MessageSquare,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  Search,
  Sliders,
  Send,
  Building,
  User,
  ChevronRight,
  Clock,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Copy,
  Check,
} from 'lucide-react';

interface PipelineStep {
  id: number;
  title: string;
  subtitle: string;
  icon: any;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED';
  duration?: string;
  details?: string;
}

interface QualifiedLead {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  domain: string;
  source: string;
  priorityScore: number;
  icpFit: 'HIGH' | 'MEDIUM' | 'LOW';
  enrichmentData: {
    employees: string;
    revenue: string;
    techStack: string[];
    recentNews: string;
    industry: string;
  };
  emailDraft: {
    subject: string;
    body: string;
  };
  slackStatus: 'SENT' | 'PENDING';
  status: 'QUALIFIED' | 'CONTACTED' | 'DISQUALIFIED';
  createdAt: string;
}

const PRESET_LEADS: QualifiedLead[] = [
  {
    id: 'lead_01',
    name: 'Alexandra Wright',
    email: 'alexandra.w@novapay.io',
    role: 'VP of Global Operations',
    company: 'NovaPay Technologies',
    domain: 'novapay.io',
    source: 'Website Contact Form',
    priorityScore: 96,
    icpFit: 'HIGH',
    enrichmentData: {
      employees: '350 - 500',
      revenue: '$42M ARR',
      techStack: ['PostgreSQL', 'Stripe', 'Salesforce', 'Next.js'],
      recentNews: 'Closed $24M Series B round 2 months ago; expanding to EMEA market.',
      industry: 'FinTech & Embedded Payments',
    },
    emailDraft: {
      subject: 'Streamlining NovaPay’s EMEA expansion workflows with Business OS',
      body: `Hi Alexandra,\n\nCongratulations on NovaPay's recent Series B round and your planned expansion across EMEA! I noticed your team is scaling payment infrastructure while managing custom client onboarding flows.\n\nWe recently helped a similar FinTech automate lead qualification and billing reconciliation, reducing sales response time by 82%.\n\nWould you be open to a brief 10-minute walkthrough this Thursday to see how we could streamline NovaPay's operations?\n\nBest regards,\nSangram Cruze\nBusiness OS Team`,
    },
    slackStatus: 'SENT',
    status: 'QUALIFIED',
    createdAt: '2 mins ago',
  },
  {
    id: 'lead_02',
    name: 'Dr. Gregory Hayes',
    email: 'g.hayes@apexcarehealth.org',
    role: 'Chief Medical Information Officer',
    company: 'ApexCare Health System',
    domain: 'apexcarehealth.org',
    source: 'LinkedIn Inbound DM',
    priorityScore: 92,
    icpFit: 'HIGH',
    enrichmentData: {
      employees: '1,200+',
      revenue: '$110M Operating Budget',
      techStack: ['Epic EHR', 'Microsoft 365', 'Twilio', 'AWS HealthLake'],
      recentNews: 'Opening 3 new outpatient diagnostic centers in Q4.',
      industry: 'Hospital & Healthcare Telemetry',
    },
    emailDraft: {
      subject: 'Automating outpatient intake & EHR triage for ApexCare’s new centers',
      body: `Dr. Hayes,\n\nWith ApexCare opening 3 new diagnostic centers this quarter, patient triage speed and HIPAA-compliant intake automation will be crucial.\n\nOur system auto-extracts patient intake forms, syncs directly with EHR systems, and cuts triage delay by 65%.\n\nCould we share a 5-minute interactive preview of the clinical workflow?\n\nWarm regards,\nSangram Cruze`,
    },
    slackStatus: 'SENT',
    status: 'QUALIFIED',
    createdAt: '15 mins ago',
  },
  {
    id: 'lead_03',
    name: 'Liam Vance',
    email: 'liam@vancerealestate.com',
    role: 'Principal Broker & Managing Director',
    company: 'Vance Real Estate Partners',
    domain: 'vancerealestate.com',
    source: 'Typeform Valuation Quiz',
    priorityScore: 78,
    icpFit: 'MEDIUM',
    enrichmentData: {
      employees: '45 agents',
      revenue: '$18M Gross Commission',
      techStack: ['MLS Matrix', 'DocuSign', 'HubSpot', 'WordPress'],
      recentNews: 'Acquired boutique luxury brokerage in South Florida.',
      industry: 'Commercial & Luxury Residential MLS',
    },
    emailDraft: {
      subject: 'Accelerating luxury escrow closings for Vance Real Estate',
      body: `Hi Liam,\n\nCongrats on the recent South Florida expansion! Handling escrow document processing and split commission payroll across 45+ agents often creates friction.\n\nWe built an automated IDP pipeline that verifies purchase contracts and syncs commissions directly with payroll in under 30 seconds.\n\nLet me know if you'd like to test a sample contract run.\n\nBest,\nSangram Cruze`,
    },
    slackStatus: 'SENT',
    status: 'QUALIFIED',
    createdAt: '1 hour ago',
  },
];

export function LeadQualificationClient() {
  const [leads, setLeads] = useState<QualifiedLead[]>(PRESET_LEADS);
  const [selectedLead, setSelectedLead] = useState<QualifiedLead>(PRESET_LEADS[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [alert, setAlert] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Form for custom simulation
  const [customDomain, setCustomDomain] = useState('cloudscale.ai');
  const [customName, setCustomName] = useState('David Miller');
  const [customEmail, setCustomEmail] = useState('david@cloudscale.ai');
  const [customSource, setCustomSource] = useState('Website Contact Form');

  // Pipeline execution nodes
  const [steps, setSteps] = useState<PipelineStep[]>([
    {
      id: 1,
      title: 'Inbound Webhook Trigger',
      subtitle: 'Ingest form payload & DM metadata',
      icon: Zap,
      status: 'COMPLETED',
      duration: '0.1s',
      details: 'Payload validated: JSON schema 200 OK',
    },
    {
      id: 2,
      title: 'Web & Tech Reconnaissance',
      subtitle: 'Neural crawl & company registry enrichment',
      icon: Globe,
      status: 'COMPLETED',
      duration: '1.2s',
      details: 'Extracted tech stack, employee count, and recent press releases',
    },
    {
      id: 3,
      title: 'CRM Profile Sync',
      subtitle: 'Update contacts, company & activity timeline',
      icon: Database,
      status: 'COMPLETED',
      duration: '0.4s',
      details: 'Created Contact #8491 & linked Company record',
    },
    {
      id: 4,
      title: 'LLM Priority Scoring',
      subtitle: 'Evaluate ICP fit, budget authority & buying signals',
      icon: Bot,
      status: 'COMPLETED',
      duration: '0.8s',
      details: 'Score calculated: 96/100 (Tier 1 High Value)',
    },
    {
      id: 5,
      title: 'Personalized Email Drafter',
      subtitle: 'Synthesize custom icebreaker & value prop',
      icon: Mail,
      status: 'COMPLETED',
      duration: '1.1s',
      details: 'Generated 3-paragraph contextual outreach draft',
    },
    {
      id: 6,
      title: 'Sales Rep Slack Alert',
      subtitle: 'Push interactive actionable notification card',
      icon: MessageSquare,
      status: 'COMPLETED',
      duration: '0.2s',
      details: 'Dispatched to #sales-leads-vip with one-click actions',
    },
  ]);

  const handleRunSimulation = (leadData?: Partial<QualifiedLead>) => {
    setIsSimulating(true);
    setSimulationProgress(0);
    setAlert('🚀 Running 6-step autonomous lead qualification & outreach pipeline...');

    // Reset step statuses
    setSteps((prev) => prev.map((s) => ({ ...s, status: 'PENDING' })));

    const targetLead: QualifiedLead = {
      id: `lead_${Date.now()}`,
      name: leadData?.name || customName,
      email: leadData?.email || customEmail,
      role: 'Chief Technology Officer',
      company: customDomain.replace(/\.[a-z]+$/i, '').toUpperCase() + ' Corp',
      domain: leadData?.domain || customDomain,
      source: leadData?.source || customSource,
      priorityScore: Math.floor(Math.random() * 15) + 85,
      icpFit: 'HIGH',
      enrichmentData: {
        employees: '150 - 300',
        revenue: '$22M ARR',
        techStack: ['PostgreSQL', 'Docker', 'Kubernetes', 'Stripe', 'Next.js'],
        recentNews: 'Launched AI infrastructure suite and expanding sales team.',
        industry: 'Cloud Infrastructure & Enterprise SaaS',
      },
      emailDraft: {
        subject: `Accelerating ${customDomain}'s sales operations & pipeline velocity`,
        body: `Hi ${leadData?.name?.split(' ')[0] || customName.split(' ')[0]},\n\nI noticed ${customDomain} recently scaled its AI infrastructure and is growing its developer ecosystem.\n\nWe specialize in automating high-demand sales and document operations for high-growth tech teams, reducing manual cycle times by over 75%.\n\nWould you have 10 minutes next Tuesday for a rapid live workflow demo?\n\nBest regards,\nSangram Cruze\nBusiness OS`,
      },
      slackStatus: 'SENT',
      status: 'QUALIFIED',
      createdAt: 'Just now',
    };

    steps.forEach((_, idx) => {
      setTimeout(() => {
        setSteps((prev) =>
          prev.map((s, i) => {
            if (i < idx) return { ...s, status: 'COMPLETED' };
            if (i === idx) return { ...s, status: 'RUNNING' };
            return s;
          })
        );
        setSimulationProgress(Math.round(((idx + 1) / steps.length) * 100));

        if (idx === steps.length - 1) {
          setTimeout(() => {
            setSteps((prev) => prev.map((s) => ({ ...s, status: 'COMPLETED' })));
            setIsSimulating(false);
            setLeads((prev) => [targetLead, ...prev]);
            setSelectedLead(targetLead);
            setAlert(`🎉 Lead ${targetLead.name} (${targetLead.company}) qualified with Priority Score ${targetLead.priorityScore}/100! Email drafted & Slack alert sent.`);
            setTimeout(() => setAlert(null), 5000);
          }, 600);
        }
      }, idx * 700);
    });
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(
      `Subject: ${selectedLead.emailDraft.subject}\n\n${selectedLead.emailDraft.body}`
    );
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Alert Banner */}
      {alert && (
        <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-amber-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
              Highest Commercial Demand
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Autonomous Pipeline
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5 mt-1">
            <Zap className="text-amber-400" size={24} />
            Multi-Step Lead Qualification & Outreach Automation
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Eliminates lost clients from slow follow-ups. Automatically researches company websites, enriches CRM records, scores priority via LLMs, drafts personalized emails, and alerts reps in Slack.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={isSimulating}
            onClick={() => handleRunSimulation()}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-orange-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Play size={14} className={isSimulating ? 'animate-spin' : ''} />
            <span>{isSimulating ? `Running Pipeline (${simulationProgress}%)...` : 'Simulate Inbound Lead'}</span>
          </button>
        </div>
      </div>

      {/* 6-Stage Visual Automation Architecture Canvas */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Autonomous Execution Architecture
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">
            Average Cycle: 3.7 seconds (Zero Human Effort)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          {steps.map((step, idx) => {
            const IconComp = step.icon;
            const isDone = step.status === 'COMPLETED';
            const isRun = step.status === 'RUNNING';

            return (
              <div
                key={step.id}
                className={`p-3.5 rounded-2xl border transition-all space-y-2 relative ${
                  isDone
                    ? 'bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/20'
                    : isRun
                    ? 'bg-amber-500/15 border-amber-500/60 ring-2 ring-amber-500/40 animate-pulse'
                    : 'bg-white/[0.02] border-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="w-5 h-5 rounded-lg bg-white/[0.08] text-amber-300 flex items-center justify-center text-[10px] font-bold font-mono">
                    0{idx + 1}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isDone ? 'bg-emerald-400 shadow-xs shadow-emerald-400' : isRun ? 'bg-amber-400 animate-ping' : 'bg-slate-600'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <IconComp size={16} className={isDone ? 'text-emerald-400' : isRun ? 'text-amber-400' : 'text-slate-400'} />
                  <h4 className="font-bold text-xs text-white leading-tight">{step.title}</h4>
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed">{step.subtitle}</p>

                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span>{step.duration || 'Queue'}</span>
                  <span className={isDone ? 'text-emerald-300 font-bold' : isRun ? 'text-amber-300 font-bold' : ''}>
                    {step.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Workspace: Left = Live Lead Inspector & Outputs, Right = Inbound Queue & Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Deep Dive on Selected Lead */}
        <div className="lg:col-span-7 space-y-6">
          {/* Priority Score & Enrichment Card */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-base shadow-lg">
                  {selectedLead.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{selectedLead.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {selectedLead.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <Building size={12} />
                    <span>{selectedLead.company}</span>
                    <span>•</span>
                    <Globe size={12} />
                    <span className="text-amber-400 font-mono">{selectedLead.domain}</span>
                  </div>
                </div>
              </div>

              {/* Priority Gauge */}
              <div className="text-right">
                <div className="text-2xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">
                  {selectedLead.priorityScore}/100
                </div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  🔥 Tier-1 VIP Priority
                </span>
              </div>
            </div>

            {/* Enriched Firmographic Data Grid */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Automated Company Website & Registry Recon
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] text-slate-500 block font-semibold">Headcount</span>
                  <span className="font-bold text-white">{selectedLead.enrichmentData.employees}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] text-slate-500 block font-semibold">Revenue Band</span>
                  <span className="font-bold text-emerald-300">{selectedLead.enrichmentData.revenue}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] text-slate-500 block font-semibold">Vertical</span>
                  <span className="font-bold text-white truncate block">{selectedLead.enrichmentData.industry}</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                <span className="text-[10px] text-slate-500 block font-semibold">Detected Tech Stack</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLead.enrichmentData.techStack.map((tech, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-white/[0.06] text-slate-300 border border-white/[0.08]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed">
                <span className="font-bold block text-amber-300 text-[10px] uppercase tracking-wider mb-0.5">
                  ⚡ Recent Intel / Buying Trigger:
                </span>
                {selectedLead.enrichmentData.recentNews}
              </div>
            </div>

            {/* Generated Personalized Email Draft */}
            <div className="space-y-2 pt-2 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail size={15} className="text-amber-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    LLM-Drafted Personalized Email
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="px-2.5 py-1 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-white/[0.08] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedEmail ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedEmail ? 'Copied' : 'Copy Draft'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/[0.08] space-y-3 font-sans text-xs">
                <div className="text-[11px] text-slate-400 font-mono pb-2 border-b border-white/[0.06] flex items-center justify-between">
                  <span>To: {selectedLead.email}</span>
                  <span className="text-amber-400">Status: Ready for 1-Click Send</span>
                </div>
                <div className="font-bold text-white text-xs">{selectedLead.emailDraft.subject}</div>
                <div className="text-slate-300 whitespace-pre-line leading-relaxed text-[11px]">
                  {selectedLead.emailDraft.body}
                </div>
              </div>
            </div>

            {/* Simulated Slack Rep Notification Card */}
            <div className="space-y-2 pt-2 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <MessageSquare size={15} className="text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Real-Time Slack Rep Alert Preview (#sales-leads-vip)
                </h4>
              </div>

              <div className="p-4 rounded-2xl bg-[#1A1D21] border border-white/[0.1] space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-[10px]">
                      ⚡
                    </div>
                    <span className="font-bold text-white">Business OS Lead Sentinel</span>
                    <span className="text-[10px] text-slate-400 font-mono">APP • Just now</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300">
                    VIP Inbound
                  </span>
                </div>

                <div className="border-l-2 border-amber-500 pl-3 space-y-1.5 text-slate-300 text-[11px]">
                  <p className="font-bold text-white">
                    🔥 New Qualified Lead: {selectedLead.name} ({selectedLead.role})
                  </p>
                  <p>
                    🏢 <strong>Company:</strong> {selectedLead.company} ({selectedLead.domain}) · <strong>Score:</strong> {selectedLead.priorityScore}/100
                  </p>
                  <p className="text-slate-400">
                    💡 <strong>Summary:</strong> {selectedLead.enrichmentData.recentNews}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAlert(`✉️ Dispatched personalized email to ${selectedLead.email} via Postmark!`);
                      setTimeout(() => setAlert(null), 3000);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-colors shadow-xs"
                  >
                    ✓ Approve & Send Email
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAlert(`📅 Generated instant calendar invite for ${selectedLead.name}!`);
                      setTimeout(() => setAlert(null), 3000);
                    }}
                    className="px-3 py-1.5 bg-white/[0.08] hover:bg-white/[0.12] text-slate-200 rounded-lg text-[11px] font-bold border border-white/10 cursor-pointer transition-colors"
                  >
                    📅 Book Meeting
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAlert(`🔄 Regenerating email draft with higher technical angle...`);
                      setTimeout(() => setAlert(null), 2500);
                    }}
                    className="px-3 py-1.5 bg-white/[0.08] hover:bg-white/[0.12] text-slate-200 rounded-lg text-[11px] font-bold border border-white/10 cursor-pointer transition-colors"
                  >
                    🔄 Re-Angle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Inbound Lead Queue & Custom Trigger Simulator */}
        <div className="lg:col-span-5 space-y-6">
          {/* Inbound Simulator Sandbox */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Test Inbound Webhook Trigger
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">POST /api/automation/lead-intake</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Prospect Company Domain
                </label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="e.g., stripe.com, healthline.com"
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Inbound Channel Source
                </label>
                <select
                  value={customSource}
                  onChange={(e) => setCustomSource(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="Website Contact Form">Website Contact Form</option>
                  <option value="LinkedIn Inbound DM">LinkedIn Inbound DM</option>
                  <option value="Typeform Pricing Quiz">Typeform Pricing Quiz</option>
                  <option value="Calendly Pre-Screen">Calendly Pre-Screen</option>
                </select>
              </div>

              <button
                type="button"
                disabled={isSimulating}
                onClick={() => handleRunSimulation()}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-orange-500/25 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-transform active:scale-[0.99]"
              >
                <Zap size={14} />
                <span>Trigger Live Automation Pipeline</span>
              </button>
            </div>
          </div>

          {/* Qualified Leads Ledger Queue */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Database size={16} className="text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Automated Lead Ingestion Queue ({leads.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">100% Enriched</span>
            </div>

            <div className="space-y-2">
              {leads.map((lead) => {
                const isSelected = selectedLead.id === lead.id;
                return (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/30'
                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-xs text-white truncate">{lead.name}</span>
                        <span className="text-[10px] text-slate-400 truncate">({lead.company})</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300">
                        {lead.priorityScore} pts
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Source: {lead.source}</span>
                      <span>{lead.createdAt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
