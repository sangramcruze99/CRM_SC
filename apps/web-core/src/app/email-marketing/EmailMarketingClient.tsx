'use client';

import React, { useState, useMemo } from 'react';
import {
  Mail,
  Send,
  Sparkles,
  Plus,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Users,
  Eye,
  MousePointerClick,
  Copy,
  Check,
  Smartphone,
  Monitor,
  Layers,
  AlertCircle,
  Settings2,
  Sliders,
  Radio,
  ShieldCheck,
  Upload,
  FileSpreadsheet,
  Filter,
  Search,
  Download,
  Flame,
  Clock,
  Zap,
  RotateCcw,
  CheckSquare,
  Square,
  AlertTriangle,
  Building,
  Target,
  ArrowRight,
  RefreshCw,
  Image as ImageIcon,
  Video,
  Quote,
  ShoppingBag,
  UserCheck,
  Minus,
  MoveUp,
  MoveDown,
  Trash2,
  Play,
  ExternalLink,
} from 'lucide-react';

export type EmailSectionType =
  | 'TEXT_ARTICLE'
  | 'IMAGE_BANNER'
  | 'VIDEO_EMBED'
  | 'PRODUCT_CARD'
  | 'CALLOUT_QUOTE'
  | 'BUTTON_CTA'
  | 'AUTHOR_SIGNATURE'
  | 'DIVIDER';

export interface EmailSection {
  id: string;
  type: EmailSectionType;
  title?: string;
  body?: string;
  imageUrl?: string;
  imageCaption?: string;
  videoUrl?: string;
  videoThumbnail?: string;
  videoTitle?: string;
  buttonText?: string;
  buttonUrl?: string;
  quoteAuthor?: string;
  quoteRole?: string;
  productPrice?: string;
  badge?: string;
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  preheader: string;
  sections: EmailSection[];
}

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  audience: string;
  recipientCount: number;
  status: 'SENT' | 'SENDING' | 'SCHEDULED' | 'DRAFT';
  sentAt?: string;
  metrics: {
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
  };
}

interface EmailEvent {
  id: string;
  recipientEmail: string;
  recipientName: string;
  company: string;
  campaignTitle: string;
  eventType: 'OPEN' | 'CLICK' | 'DELIVERED' | 'BOUNCE';
  timestamp: string;
  device: string;
  location: string;
}

export interface BulkLead {
  id: string;
  name: string;
  email: string;
  company: string;
  jobTitle: string;
  industry: 'Healthcare' | 'Real Estate' | 'Restaurant' | 'Retail' | 'Enterprise SaaS' | 'Other';
  stage: 'Cold' | 'MQL' | 'SQL' | 'Negotiation' | 'Customer';
  dealValue: number;
  region: 'North America' | 'EMEA' | 'APAC' | 'LATAM';
  score: number;
  source: 'Apollo.io' | 'ZoomInfo' | 'CSV Ingest' | 'Inbound Form' | 'LinkedIn';
  deliverability: 'VERIFIED' | 'RISKY';
}

const INITIAL_SECTIONS: EmailSection[] = [
  {
    id: 'sec_img_1',
    type: 'IMAGE_BANNER',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    imageCaption: 'Real-time telemetry and unified operations dashboard in action.',
  },
  {
    id: 'sec_txt_1',
    type: 'TEXT_ARTICLE',
    title: 'The Next Generation of Enterprise Workspace is Here',
    body: 'We are thrilled to announce the official release of Business OS 2.0. Built from the ground up for modern enterprise sales and operations teams, Business OS combines CRM pipelines, automated billing ledgers, and intelligent AI copilots into one unified surface.\n\nExplore our latest features and accelerate your team velocity today.',
  },
  {
    id: 'sec_vid_1',
    type: 'VIDEO_EMBED',
    videoTitle: 'Watch 3-Minute Walkthrough: AI Softphone & CRM Sync',
    videoThumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://youtube.com/watch?v=demo',
    badge: '▶ 3:42 Min Walkthrough',
  },
  {
    id: 'sec_quote_1',
    type: 'CALLOUT_QUOTE',
    body: 'Business OS replaced 14 fragmented SaaS subscriptions across our enterprise, cutting monthly tooling costs by $4,200 while tripling our outbound sales velocity.',
    quoteAuthor: 'Elena Rostova',
    quoteRole: 'VP of Revenue Operations, Hyperion Global',
  },
  {
    id: 'sec_prod_1',
    type: 'PRODUCT_CARD',
    title: 'Enterprise AI Telephony & WebRTC Softphone Add-on',
    body: 'Includes real-time voice speech-to-text transcription, automated call battlecards, and dual-SIM cellular modem hardware bridges.',
    productPrice: '$49 / agent / month',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80',
    buttonText: 'Add to Enterprise Subscription',
    buttonUrl: 'https://businessos.io/telephony',
  },
  {
    id: 'sec_cta_1',
    type: 'BUTTON_CTA',
    buttonText: 'Claim Your 14-Day Free Enterprise Trial',
    buttonUrl: 'https://businessos.io/signup',
  },
  {
    id: 'sec_sig_1',
    type: 'AUTHOR_SIGNATURE',
    authorName: 'Sangram Cruze',
    authorRole: 'CEO & Head of Product, Business OS',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    body: 'Need help customizing this workflow for your organization? Reply directly to this email.',
  },
];

const initialTemplates: EmailTemplate[] = [
  {
    id: 'tmpl_product_launch',
    name: '🚀 Multi-Media Product Launch & Feature Announcement',
    category: 'Product Updates',
    subject: 'Introducing Business OS 2.0: Real-time Telemetry & Autonomous AI',
    preheader: 'Experience sub-10ms queries, OCR document inference, and automated workflows.',
    sections: INITIAL_SECTIONS,
  },
  {
    id: 'tmpl_newsletter',
    name: '📰 Executive Monthly Newsletter & Video Digest',
    category: 'Newsletters',
    subject: 'Business OS Monthly Digest: Key Industry Insights & Video Breakdown',
    preheader: 'Latest B2B sales automation benchmarks, AI productivity metrics, and product changelogs.',
    sections: [
      {
        id: 'sec_nl_1',
        type: 'TEXT_ARTICLE',
        title: 'Executive Briefing: June 2026 Industry Benchmarks',
        body: 'Welcome to this month\'s edition of the Business OS Executive Briefing.\n\nIn this issue, we analyze how leading enterprise teams are deploying autonomous voice AI to reduce cold call cycle times by 65%, while maintaining human-level lead qualification accuracy.',
      },
      {
        id: 'sec_nl_vid',
        type: 'VIDEO_EMBED',
        videoTitle: 'Video: How 500+ Companies Automated Lead Qualification',
        videoThumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
        videoUrl: 'https://youtube.com/watch?v=briefing',
        badge: '▶ 5:15 Min Analysis',
      },
      {
        id: 'sec_nl_cta',
        type: 'BUTTON_CTA',
        buttonText: 'Read Full Whitepaper',
        buttonUrl: 'https://businessos.io/whitepaper',
      },
    ],
  },
];

const initialCampaigns: EmailCampaign[] = [];

const liveEmailEvents: EmailEvent[] = [];

const INITIAL_BULK_LEADS: BulkLead[] = [];

export function EmailMarketingClient() {
  const [activeTab, setActiveTab] = useState<'builder' | 'bulk-blast' | 'campaigns' | 'tracking' | 'templates'>('builder');
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(initialCampaigns);
  const [events, setEvents] = useState<EmailEvent[]>(liveEmailEvents);

  // Email Meta State
  const [subject, setSubject] = useState(initialTemplates[0].subject);
  const [preheader, setPreheader] = useState(initialTemplates[0].preheader);
  const [senderName, setSenderName] = useState('Business OS Team');
  const [senderEmail, setSenderEmail] = useState('notifications@businessos.io');

  // Rich Multi-Block Email Sections
  const [sections, setSections] = useState<EmailSection[]>(INITIAL_SECTIONS);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(sections[0].id);

  // Bulk Email Leads State
  const [bulkLeads, setBulkLeads] = useState<BulkLead[]>(INITIAL_BULK_LEADS);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set(INITIAL_BULK_LEADS.map((l) => l.id)));
  const [industryFilter, setIndustryFilter] = useState('ALL');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sendStrategy, setSendStrategy] = useState<'INSTANT' | 'WARMUP_DRIP' | 'SCHEDULED'>('WARMUP_DRIP');
  const [isSendingBlast, setIsSendingBlast] = useState(false);
  const [blastProgress, setBlastProgress] = useState(0);

  // Preview Mode
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('admin@gmail.com');
  const [alert, setAlert] = useState<string | null>(null);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return bulkLeads.filter((lead) => {
      const matchIndustry = industryFilter === 'ALL' || lead.industry === industryFilter;
      const matchStage = stageFilter === 'ALL' || lead.stage === stageFilter;
      const matchRegion = regionFilter === 'ALL' || lead.region === regionFilter;
      const matchSearch =
        !searchQuery ||
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchIndustry && matchStage && matchRegion && matchSearch;
    });
  }, [bulkLeads, industryFilter, stageFilter, regionFilter, searchQuery]);

  const toggleLeadSelection = (id: string) => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    const allFilteredSelected = filteredLeads.every((l) => selectedLeadIds.has(l.id));
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filteredLeads.forEach((l) => next.delete(l.id));
      } else {
        filteredLeads.forEach((l) => next.add(l.id));
      }
      return next;
    });
  };

  const handleUploadSampleCsv = () => {
    const extraLeads: BulkLead[] = [
      { id: `lead_csv_${Date.now()}_1`, name: 'David Vance', email: 'd.vance@vancetech.io', company: 'Vance Data Systems', jobTitle: 'CTO', industry: 'Enterprise SaaS', stage: 'MQL', dealValue: 95000, region: 'North America', score: 88, source: 'CSV Ingest', deliverability: 'VERIFIED' },
      { id: `lead_csv_${Date.now()}_2`, name: 'Camilla Rossi', email: 'c.rossi@rossihospitality.it', company: 'Rossi Luxury Hotels', jobTitle: 'CEO', industry: 'Restaurant', stage: 'SQL', dealValue: 180000, region: 'EMEA', score: 92, source: 'CSV Ingest', deliverability: 'VERIFIED' },
      { id: `lead_csv_${Date.now()}_3`, name: 'Dr. Kevin Zhang', email: 'kzhang@pacifichealth.sg', company: 'Pacific Medical Group', jobTitle: 'Director', industry: 'Healthcare', stage: 'Negotiation', dealValue: 310000, region: 'APAC', score: 97, source: 'CSV Ingest', deliverability: 'VERIFIED' },
    ];
    setBulkLeads((prev) => [...extraLeads, ...prev]);
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      extraLeads.forEach((l) => next.add(l.id));
      return next;
    });
    setAlert(`📥 Parsed and ingested 3 verified leads from CSV file!`);
    setTimeout(() => setAlert(null), 3500);
  };

  // Section Block Operations
  const handleAddSection = (type: EmailSectionType) => {
    const newId = `sec_${Date.now()}`;
    let newSection: EmailSection;

    switch (type) {
      case 'TEXT_ARTICLE':
        newSection = {
          id: newId,
          type: 'TEXT_ARTICLE',
          title: 'New Article Headline',
          body: 'Write your rich newsletter story, industry analysis, or team update here. Use merge tags like {{firstName}} for personalization.',
        };
        break;
      case 'IMAGE_BANNER':
        newSection = {
          id: newId,
          type: 'IMAGE_BANNER',
          imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
          imageCaption: 'Add a descriptive caption for your newsletter image.',
        };
        break;
      case 'VIDEO_EMBED':
        newSection = {
          id: newId,
          type: 'VIDEO_EMBED',
          videoTitle: 'Watch: Product Demo & Tutorial',
          videoThumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
          videoUrl: 'https://youtube.com/watch?v=demo',
          badge: '▶ Watch Video',
        };
        break;
      case 'PRODUCT_CARD':
        newSection = {
          id: newId,
          type: 'PRODUCT_CARD',
          title: 'Special Offer / Product Spotlight',
          body: 'Highlight product specifications, limited-time discounts, or feature enhancements.',
          productPrice: '$99 / month',
          imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80',
          buttonText: 'View Product Details',
          buttonUrl: 'https://businessos.io/product',
        };
        break;
      case 'CALLOUT_QUOTE':
        newSection = {
          id: newId,
          type: 'CALLOUT_QUOTE',
          body: 'Include a high-impact customer testimonial, executive quote, or key takeaway from your report.',
          quoteAuthor: 'Customer Name',
          quoteRole: 'CEO / VP of Operations',
        };
        break;
      case 'BUTTON_CTA':
        newSection = {
          id: newId,
          type: 'BUTTON_CTA',
          buttonText: 'Click Here to Take Action',
          buttonUrl: 'https://businessos.io',
        };
        break;
      case 'AUTHOR_SIGNATURE':
        newSection = {
          id: newId,
          type: 'AUTHOR_SIGNATURE',
          authorName: senderName,
          authorRole: 'Head of Growth, Business OS',
          authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          body: 'Warm regards,\nHave questions? Reply directly to this email.',
        };
        break;
      case 'DIVIDER':
        newSection = {
          id: newId,
          type: 'DIVIDER',
        };
        break;
    }

    setSections([...sections, newSection]);
    setSelectedSectionId(newId);
    setAlert(`Added ${type.replace('_', ' ')} block to newsletter!`);
    setTimeout(() => setAlert(null), 2500);
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIdx];
    newSections[targetIdx] = temp;
    setSections(newSections);
  };

  const handleDeleteSection = (id: string) => {
    if (sections.length <= 1) {
      setAlert('You must keep at least one block in the email.');
      setTimeout(() => setAlert(null), 2500);
      return;
    }
    const filtered = sections.filter((s) => s.id !== id);
    setSections(filtered);
    setSelectedSectionId(filtered[0]?.id || null);
  };

  const handleUpdateSectionField = (id: string, field: keyof EmailSection, value: any) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  // Launch Bulk Email Blast
  const handleLaunchBulkBlast = () => {
    const selectedCount = selectedLeadIds.size;
    if (selectedCount === 0) {
      setAlert('Please select at least one recipient lead to broadcast.');
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    setIsSendingBlast(true);
    setBlastProgress(15);

    setTimeout(() => setBlastProgress(45), 600);
    setTimeout(() => setBlastProgress(80), 1200);
    setTimeout(() => {
      setBlastProgress(100);
      setIsSendingBlast(false);

      const newCamp: EmailCampaign = {
        id: `cmp_${Date.now()}`,
        name: `Newsletter Broadcast (${selectedCount} Leads) · ${subject.slice(0, 30)}...`,
        subject,
        audience: `${selectedCount} Targeted Leads (${sendStrategy === 'WARMUP_DRIP' ? 'Anti-Spam Warm-Up' : 'High-Speed Blast'})`,
        recipientCount: selectedCount,
        status: 'SENT',
        sentAt: 'Just now',
        metrics: {
          delivered: selectedCount,
          opened: Math.floor(selectedCount * 0.48),
          clicked: Math.floor(selectedCount * 0.22),
          bounced: 0,
        },
      };

      setCampaigns([newCamp, ...campaigns]);
      setActiveTab('campaigns');
      setAlert(`🚀 Multi-Media Newsletter Blast dispatched to ${selectedCount} recipients with 0 spam flags!`);
      setTimeout(() => setAlert(null), 4000);
    }, 1800);
  };

  const loadTemplate = (tmpl: EmailTemplate) => {
    setSubject(tmpl.subject);
    setPreheader(tmpl.preheader);
    setSections(tmpl.sections);
    setSelectedSectionId(tmpl.sections[0]?.id || null);
    setActiveTab('builder');
    setAlert(`Template "${tmpl.name}" loaded into Visual Newsletter Builder!`);
    setTimeout(() => setAlert(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Alert Banner */}
      {alert && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Mail className="text-emerald-400" size={24} />
            Rich Media Newsletter & Bulk Email Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Build multi-block newsletters with videos, images, quotes, and product cards, segment lead batches, and broadcast with anti-spam protection.
          </p>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'builder'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.1] border border-white/[0.1]'
            }`}
          >
            <Layers size={14} />
            <span>Newsletter Designer ({sections.length} Blocks)</span>
          </button>

          <button
            onClick={() => setActiveTab('bulk-blast')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'bulk-blast'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.1] border border-white/[0.1]'
            }`}
          >
            <Users size={14} />
            <span>Bulk Blast & Lead Filter ({selectedLeadIds.size})</span>
          </button>

          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'campaigns'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.1] border border-white/[0.1]'
            }`}
          >
            <Send size={14} />
            <span>Campaigns ({campaigns.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'tracking'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.1] border border-white/[0.1]'
            }`}
          >
            <BarChart3 size={14} />
            <span>Live Telemetry</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🚀 TAB 1: VISUAL NEWSLETTER DESIGNER (Spacious Multi-Block Composer) */}
      {/* ========================================================================= */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Big Spacious Block Composer (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Meta & Subject Section */}
            <div className="luxe-box rounded-3xl p-5 space-y-3.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Settings2 size={14} className="text-emerald-400" />
                <span>Newsletter Subject & Sender Configuration</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Sender Name</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Sender Email</label>
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Newsletter Subject Line</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Preview Preheader Snippet</label>
                <input
                  type="text"
                  value={preheader}
                  onChange={(e) => setPreheader(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-slate-300 focus:outline-none"
                />
              </div>
            </div>

            {/* Component Insertion Palette Toolbar */}
            <div className="luxe-box rounded-3xl p-4 space-y-2.5">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Plus size={13} className="text-emerald-400" />
                  <span>Insert Newsletter Content Block</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400">Click to Append</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { type: 'TEXT_ARTICLE' as const, label: 'Article Text', icon: Layers },
                  { type: 'IMAGE_BANNER' as const, label: 'Image Gallery', icon: ImageIcon },
                  { type: 'VIDEO_EMBED' as const, label: 'Video Embed', icon: Video },
                  { type: 'PRODUCT_CARD' as const, label: 'Product Card', icon: ShoppingBag },
                  { type: 'CALLOUT_QUOTE' as const, label: 'Quote Box', icon: Quote },
                  { type: 'BUTTON_CTA' as const, label: 'CTA Button', icon: Zap },
                  { type: 'AUTHOR_SIGNATURE' as const, label: 'Author Sign-off', icon: UserCheck },
                  { type: 'DIVIDER' as const, label: 'Divider Line', icon: Minus },
                ].map((btn) => {
                  const Icon = btn.icon;
                  return (
                    <button
                      key={btn.type}
                      type="button"
                      onClick={() => handleAddSection(btn.type)}
                      className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] hover:border-emerald-500/40 border border-white/[0.06] flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer shadow-xs"
                    >
                      <Icon size={14} className="text-emerald-400 shrink-0" />
                      <span className="truncate">{btn.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BIG SPACIOUS SECTION BLOCKS COMPOSER */}
            <div className="space-y-4">
              {sections.map((sec, index) => {
                const isSelected = sec.id === selectedSectionId;

                return (
                  <div
                    key={sec.id}
                    onClick={() => setSelectedSectionId(sec.id)}
                    className={`luxe-box rounded-3xl p-5 space-y-3.5 transition-all border ${
                      isSelected
                        ? 'border-amber-500 ring-2 ring-emerald-500/20 bg-white/[0.04]'
                        : 'border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    {/* Section Header with Re-order & Delete Controls */}
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          {sec.type.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveSection(index, 'up');
                          }}
                          disabled={index === 0}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <MoveUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveSection(index, 'down');
                          }}
                          disabled={index === sections.length - 1}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <MoveDown size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSection(sec.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer ml-1"
                          title="Delete Block"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Section Form Fields */}
                    {sec.type === 'TEXT_ARTICLE' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Headline / Subtitle</label>
                          <input
                            type="text"
                            value={sec.title || ''}
                            onChange={(e) => handleUpdateSectionField(sec.id, 'title', e.target.value)}
                            className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white font-bold focus:outline-none"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] uppercase font-bold text-slate-400">Story Body Copy (Big Box)</label>
                            <div className="flex gap-1 text-[10px] font-mono text-emerald-300">
                              <button
                                type="button"
                                onClick={() => handleUpdateSectionField(sec.id, 'body', `${sec.body || ''} {{firstName}}`)}
                                className="px-1.5 py-0.5 rounded bg-white/[0.06] hover:bg-white/[0.1] cursor-pointer"
                              >
                                + firstName
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateSectionField(sec.id, 'body', `${sec.body || ''} {{company}}`)}
                                className="px-1.5 py-0.5 rounded bg-white/[0.06] hover:bg-white/[0.1] cursor-pointer"
                              >
                                + company
                              </button>
                            </div>
                          </div>
                          <textarea
                            rows={7}
                            value={sec.body || ''}
                            onChange={(e) => handleUpdateSectionField(sec.id, 'body', e.target.value)}
                            className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-slate-200 leading-relaxed focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {sec.type === 'IMAGE_BANNER' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Image URL</label>
                          <input
                            type="text"
                            value={sec.imageUrl || ''}
                            onChange={(e) => handleUpdateSectionField(sec.id, 'imageUrl', e.target.value)}
                            className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Image Caption</label>
                          <input
                            type="text"
                            value={sec.imageCaption || ''}
                            onChange={(e) => handleUpdateSectionField(sec.id, 'imageCaption', e.target.value)}
                            className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-slate-300 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {sec.type === 'VIDEO_EMBED' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Video Title</label>
                          <input
                            type="text"
                            value={sec.videoTitle || ''}
                            onChange={(e) => handleUpdateSectionField(sec.id, 'videoTitle', e.target.value)}
                            className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white font-bold focus:outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Video Destination URL</label>
                            <input
                              type="text"
                              value={sec.videoUrl || ''}
                              onChange={(e) => handleUpdateSectionField(sec.id, 'videoUrl', e.target.value)}
                              className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Video Thumbnail Poster URL</label>
                            <input
                              type="text"
                              value={sec.videoThumbnail || ''}
                              onChange={(e) => handleUpdateSectionField(sec.id, 'videoThumbnail', e.target.value)}
                              className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {sec.type === 'PRODUCT_CARD' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Product Title</label>
                            <input
                              type="text"
                              value={sec.title || ''}
                              onChange={(e) => handleUpdateSectionField(sec.id, 'title', e.target.value)}
                              className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white font-bold focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Price / Special Tag</label>
                            <input
                              type="text"
                              value={sec.productPrice || ''}
                              onChange={(e) => handleUpdateSectionField(sec.id, 'productPrice', e.target.value)}
                              className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-emerald-400 font-mono font-bold focus:outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Product Feature Description</label>
                          <textarea
                            rows={3}
                            value={sec.body || ''}
                            onChange={(e) => handleUpdateSectionField(sec.id, 'body', e.target.value)}
                            className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {sec.type === 'CALLOUT_QUOTE' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Quote Copy</label>
                          <textarea
                            rows={3}
                            value={sec.body || ''}
                            onChange={(e) => handleUpdateSectionField(sec.id, 'body', e.target.value)}
                            className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none italic"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Quote Author</label>
                            <input
                              type="text"
                              value={sec.quoteAuthor || ''}
                              onChange={(e) => handleUpdateSectionField(sec.id, 'quoteAuthor', e.target.value)}
                              className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white font-bold focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Author Role & Company</label>
                            <input
                              type="text"
                              value={sec.quoteRole || ''}
                              onChange={(e) => handleUpdateSectionField(sec.id, 'quoteRole', e.target.value)}
                              className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-slate-300 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {sec.type === 'BUTTON_CTA' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Button CTA Text</label>
                          <input
                            type="text"
                            value={sec.buttonText || ''}
                            onChange={(e) => handleUpdateSectionField(sec.id, 'buttonText', e.target.value)}
                            className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white font-bold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Destination URL</label>
                          <input
                            type="text"
                            value={sec.buttonUrl || ''}
                            onChange={(e) => handleUpdateSectionField(sec.id, 'buttonUrl', e.target.value)}
                            className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {sec.type === 'AUTHOR_SIGNATURE' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Author Name</label>
                            <input
                              type="text"
                              value={sec.authorName || ''}
                              onChange={(e) => handleUpdateSectionField(sec.id, 'authorName', e.target.value)}
                              className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white font-bold focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Author Title</label>
                            <input
                              type="text"
                              value={sec.authorRole || ''}
                              onChange={(e) => handleUpdateSectionField(sec.id, 'authorRole', e.target.value)}
                              className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-slate-300 focus:outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Sign-off Message</label>
                          <input
                            type="text"
                            value={sec.body || ''}
                            onChange={(e) => handleUpdateSectionField(sec.id, 'body', e.target.value)}
                            className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-slate-300 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {sec.type === 'DIVIDER' && (
                      <div className="text-center py-2">
                        <div className="h-px bg-white/15 w-full" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Action Controls */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsTestModalOpen(true)}
                className="px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send size={14} />
                <span>Send Test Email</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('bulk-blast')}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer"
              >
                <span>Continue to Bulk Blast Lead Filter</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Right Column: Live Interactive Full-Length Newsletter Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="luxe-box rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Newsletter Preview</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewMode('desktop')}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'desktop' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'}`}
                    title="Desktop Preview"
                  >
                    <Monitor size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('mobile')}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'mobile' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'}`}
                    title="Mobile Preview"
                  >
                    <Smartphone size={15} />
                  </button>
                </div>
              </div>

              {/* Rendered HTML Container */}
              <div
                className={`mx-auto rounded-2xl border border-white/10 overflow-hidden bg-[#0d121f] shadow-2xl text-xs transition-all ${
                  viewMode === 'mobile' ? 'max-w-xs' : 'w-full'
                }`}
              >
                {/* Email Client Header Bar */}
                <div className="p-3.5 bg-white/[0.03] border-b border-white/[0.06] space-y-1">
                  <div className="text-[11px] text-slate-400">From: <strong className="text-white">{senderName}</strong> &lt;{senderEmail}&gt;</div>
                  <div className="text-xs font-bold text-white">{subject}</div>
                  <div className="text-[10px] text-slate-400 truncate">{preheader}</div>
                </div>

                {/* Newsletter Body Preview Canvas */}
                <div className="p-5 sm:p-6 space-y-5">
                  {sections.map((sec) => (
                    <div key={sec.id}>
                      {sec.type === 'IMAGE_BANNER' && sec.imageUrl && (
                        <div className="space-y-1">
                          <img src={sec.imageUrl} alt="Newsletter Banner" className="w-full h-40 object-cover rounded-xl border border-white/[0.08]" />
                          {sec.imageCaption && (
                            <span className="text-[10px] text-slate-400 text-center block italic">{sec.imageCaption}</span>
                          )}
                        </div>
                      )}

                      {sec.type === 'TEXT_ARTICLE' && (
                        <div className="space-y-2">
                          {sec.title && <h3 className="font-extrabold text-base text-white leading-snug">{sec.title}</h3>}
                          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{sec.body}</p>
                        </div>
                      )}

                      {sec.type === 'VIDEO_EMBED' && (
                        <div className="relative rounded-2xl overflow-hidden border border-white/15 group cursor-pointer">
                          <img
                            src={sec.videoThumbnail || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800'}
                            alt="Video Thumbnail"
                            className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-2xl shadow-orange-500/50 group-hover:scale-110 transition-transform">
                              <Play size={20} fill="#020617" />
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent flex items-center justify-between">
                            <span className="font-bold text-xs text-white truncate max-w-[200px]">{sec.videoTitle}</span>
                            <span className="px-2 py-0.5 bg-black/60 rounded text-[9px] font-mono text-emerald-300">{sec.badge || 'Watch'}</span>
                          </div>
                        </div>
                      )}

                      {sec.type === 'PRODUCT_CARD' && (
                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                          {sec.imageUrl && (
                            <img src={sec.imageUrl} alt="Product" className="w-full h-28 object-cover rounded-xl border border-white/10" />
                          )}
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-xs text-white">{sec.title}</h4>
                            <span className="font-mono font-extrabold text-emerald-400 text-xs">{sec.productPrice}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">{sec.body}</p>
                          {sec.buttonText && (
                            <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-[11px] rounded-lg">
                              {sec.buttonText}
                            </span>
                          )}
                        </div>
                      )}

                      {sec.type === 'CALLOUT_QUOTE' && (
                        <div className="p-4 rounded-2xl bg-emerald-500/10 border-l-4 border-amber-500 space-y-2">
                          <p className="text-xs text-slate-200 italic leading-relaxed">"{sec.body}"</p>
                          {(sec.quoteAuthor || sec.quoteRole) && (
                            <div className="text-[11px]">
                              <strong className="text-emerald-400 block">{sec.quoteAuthor}</strong>
                              <span className="text-slate-400">{sec.quoteRole}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {sec.type === 'BUTTON_CTA' && sec.buttonText && (
                        <div className="text-center pt-2">
                          <span className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/25">
                            {sec.buttonText}
                          </span>
                        </div>
                      )}

                      {sec.type === 'AUTHOR_SIGNATURE' && (
                        <div className="pt-3 border-t border-white/[0.08] flex items-center gap-3">
                          {sec.authorAvatar && (
                            <img src={sec.authorAvatar} alt="Author" className="w-10 h-10 rounded-full object-cover border border-emerald-500/40" />
                          )}
                          <div>
                            <span className="font-bold text-xs text-white block">{sec.authorName}</span>
                            <span className="text-[10px] text-slate-400 block">{sec.authorRole}</span>
                            {sec.body && <p className="text-[10px] text-slate-400 mt-1">{sec.body}</p>}
                          </div>
                        </div>
                      )}

                      {sec.type === 'DIVIDER' && (
                        <div className="py-2">
                          <div className="h-px bg-white/10" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="p-4 bg-black/40 border-t border-white/[0.06] text-center text-[10px] text-slate-500">
                  <p>© 2026 Business OS Enterprise · Unsubscribe Preferences</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((camp) => (
              <div key={camp.id} className="luxe-box rounded-3xl p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">{camp.audience}</span>
                    <h3 className="font-bold text-sm text-white mt-0.5">{camp.name}</h3>
                    <p className="text-xs text-slate-400 italic mt-0.5">"{camp.subject}"</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {camp.status}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/[0.06] text-center">
                  <div className="p-2 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                    <span className="text-[10px] text-slate-400 block">Sent</span>
                    <span className="font-mono font-bold text-xs text-white">{camp.recipientCount.toLocaleString()}</span>
                  </div>
                  <div className="p-2 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                    <span className="text-[10px] text-slate-400 block">Opens</span>
                    <span className="font-mono font-bold text-xs text-emerald-400">{camp.metrics.opened.toLocaleString()}</span>
                  </div>
                  <div className="p-2 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                    <span className="text-[10px] text-slate-400 block">Clicks</span>
                    <span className="font-mono font-bold text-xs text-emerald-400">{camp.metrics.clicked.toLocaleString()}</span>
                  </div>
                  <div className="p-2 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                    <span className="text-[10px] text-slate-400 block">Bounce</span>
                    <span className="font-mono font-bold text-xs text-slate-400">{camp.metrics.bounced}</span>
                  </div>
                </div>
              </div>
            ))}
            {campaigns.length === 0 && (
              <div className="col-span-2 py-16 text-center text-slate-500 text-xs font-medium border border-white/[0.06] rounded-3xl bg-white/[0.02]">
                No email campaigns broadcasted yet. Compose and send a campaign in the <span className="text-emerald-400 font-bold">"Newsletter Designer"</span> or <span className="text-emerald-400 font-bold">"Bulk Blast"</span> tabs.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live Telemetry Tab */}
      {activeTab === 'tracking' && (
        <div className="luxe-box rounded-3xl p-5 space-y-4">
          <h3 className="font-bold text-sm text-white">Live Open & Click Telemetry Feed</h3>
          <div className="space-y-2.5">
            {events.map((ev) => (
              <div key={ev.id} className="p-3.5 luxe-inner-card rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-white">{ev.recipientName}</span>
                  <span className="text-[11px] text-slate-400 block">{ev.company} · {ev.recipientEmail}</span>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    ev.eventType === 'CLICK' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {ev.eventType}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{ev.timestamp}</span>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div className="py-16 text-center text-slate-500 text-xs font-medium">
                Live recipient telemetry will stream in real-time as email subscribers open emails and click embedded CTA links.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {initialTemplates.map((tmpl) => (
            <div key={tmpl.id} className="luxe-box rounded-3xl p-5 space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400">{tmpl.category}</span>
                <h3 className="font-bold text-sm text-white mt-1">{tmpl.name}</h3>
                <p className="text-xs text-slate-400 italic mt-0.5">"{tmpl.subject}"</p>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                  <Layers size={13} className="text-emerald-400" />
                  <span>{tmpl.sections.length} Modular Content Blocks</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => loadTemplate(tmpl)}
                className="w-full py-2.5 bg-white/[0.06] hover:bg-amber-500 hover:text-slate-950 text-white font-bold rounded-xl text-xs transition-all border border-white/[0.08] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={13} />
                <span>Load Into Newsletter Designer</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Test Email Modal */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="bg-slate-950/95 border border-white/[0.12] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in">
            <h3 className="font-bold text-sm text-white">Send Instant Test Email</h3>
            <input
              type="email"
              value={testEmailAddress}
              onChange={(e) => setTestEmailAddress(e.target.value)}
              className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none font-mono"
            />
            <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                className="px-3 py-1.5 bg-white/[0.06] text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsTestModalOpen(false);
                  setAlert(`📨 Test email sent to ${testEmailAddress}!`);
                  setTimeout(() => setAlert(null), 3000);
                }}
                className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl text-xs"
              >
                Send Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
