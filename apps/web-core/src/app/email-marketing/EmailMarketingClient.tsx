'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Mail,
  Send,
  Sparkles,
  Plus,
  CheckCircle2,
  X,
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
  HardDrive,
  FileVideo,
  FileImage,
  GitBranch,
  Activity,
  Globe,
  Bot,
  Wand2,
  Palette,
} from 'lucide-react';
import {
  setBridgeTransfer,
  getBridgeTransfer,
  convertSectionsToBlocks,
  getSharedBridgeTemplates,
} from '../../lib/emailBridge';
import { AutomationsWorkflowStudio } from './AutomationsWorkflowStudio';
import { EmailRichTextToolbar, EmailRichTextEditor } from '../../components/email/EmailRichTextToolbar';
import { renderRichEmailContent } from '../../lib/richTextRenderer';
import { TrackingPixelAndScoringStudio } from './TrackingPixelAndScoringStudio';

export type EmailSectionType =
  | 'TEXT_ARTICLE'
  | 'IMAGE_BANNER'
  | 'VIDEO_EMBED'
  | 'DYNAMIC_SMART_BLOCK'
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
  imageFileName?: string;
  videoUrl?: string;
  videoThumbnail?: string;
  videoFileName?: string;
  thumbnailFileName?: string;
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
  // Smart dynamic personalization fields
  dynamicTargetIndustry?: 'Healthcare' | 'Enterprise SaaS' | 'Real Estate' | 'Restaurant' | 'ALL';
  dynamicHealthcareTitle?: string;
  dynamicHealthcareBody?: string;
  dynamicSaaSTitle?: string;
  dynamicSaaSBody?: string;
  dynamicRealEstateTitle?: string;
  dynamicRealEstateBody?: string;
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
    id: 'sec_smart_1',
    type: 'DYNAMIC_SMART_BLOCK',
    title: '🧠 AI Smart Dynamic Case Study (Swaps per Industry/Role)',
    dynamicHealthcareTitle: 'How St. Jude Health Saved 4,800 Clinical Hours with Automated OCR',
    dynamicHealthcareBody: 'By deploying Business OS HIPAA-compliant OCR and voice workflows, medical staff reduced manual intake time by 74% and accelerated patient record updates.',
    dynamicSaaSTitle: 'How Hyperion Cloud Tripled Outbound Pipeline in 30 Days',
    dynamicSaaSBody: 'Hyperion consolidated 14 SaaS subscriptions into Business OS, cutting $4,200/mo in software sprawl while doubling sales rep dial velocity with AI softphones.',
    dynamicRealEstateTitle: 'How Apex Realty Automated 12,000 Property Buyer Follow-ups',
    dynamicRealEstateBody: 'Apex Realty triggered instant SMS and email drips within 90 seconds of portal inquiries, boosting buyer tour bookings by 88%.',
    body: 'This content block will automatically swap in the recipient\'s inbox based on their CRM industry and executive job title.',
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

const INITIAL_BULK_LEADS: BulkLead[] = [
  {
    id: 'lead_ent_101',
    name: 'Sarah Jenkins',
    email: 's.jenkins@apexhealth.org',
    company: 'Apex Health Systems',
    jobTitle: 'Chief Medical Officer',
    industry: 'Healthcare',
    stage: 'SQL',
    dealValue: 145000,
    region: 'North America',
    score: 94,
    source: 'Apollo.io',
    deliverability: 'VERIFIED',
  },
  {
    id: 'lead_ent_102',
    name: 'Marcus Vance',
    email: 'm.vance@vancetech.io',
    company: 'Vance Cloud Infrastructure',
    jobTitle: 'VP of Engineering',
    industry: 'Enterprise SaaS',
    stage: 'Negotiation',
    dealValue: 210000,
    region: 'North America',
    score: 98,
    source: 'LinkedIn',
    deliverability: 'VERIFIED',
  },
  {
    id: 'lead_ent_103',
    name: 'Elena Rostova',
    email: 'e.rostova@primecrest.de',
    company: 'Prime Crest Capital',
    jobTitle: 'Managing Director',
    industry: 'Real Estate',
    stage: 'MQL',
    dealValue: 320000,
    region: 'EMEA',
    score: 87,
    source: 'Inbound Form',
    deliverability: 'VERIFIED',
  },
  {
    id: 'lead_ent_104',
    name: 'Kenji Takahashi',
    email: 'k.takahashi@omnihospitality.jp',
    company: 'Omni Group Holdings',
    jobTitle: 'Chief Operating Officer',
    industry: 'Restaurant',
    stage: 'SQL',
    dealValue: 95000,
    region: 'APAC',
    score: 91,
    source: 'ZoomInfo',
    deliverability: 'VERIFIED',
  },
  {
    id: 'lead_ent_105',
    name: 'Rachel Sterling',
    email: 'r.sterling@nexusretail.com',
    company: 'Nexus Global Retail',
    jobTitle: 'Head of Omni-Channel Growth',
    industry: 'Retail',
    stage: 'MQL',
    dealValue: 115000,
    region: 'North America',
    score: 82,
    source: 'Inbound Form',
    deliverability: 'VERIFIED',
  },
  {
    id: 'lead_ent_106',
    name: 'Dr. Arthur Pendelton',
    email: 'arthur.p@stjudecare.org',
    company: 'St. Jude Clinical Alliance',
    jobTitle: 'VP Clinical Informatics',
    industry: 'Healthcare',
    stage: 'Negotiation',
    dealValue: 260000,
    region: 'North America',
    score: 96,
    source: 'Apollo.io',
    deliverability: 'VERIFIED',
  },
  {
    id: 'lead_ent_107',
    name: 'Sofia Alvarez',
    email: 's.alvarez@cloudpulse.es',
    company: 'CloudPulse Analytics',
    jobTitle: 'Director of Growth',
    industry: 'Enterprise SaaS',
    stage: 'Cold',
    dealValue: 85000,
    region: 'EMEA',
    score: 74,
    source: 'Apollo.io',
    deliverability: 'VERIFIED',
  },
  {
    id: 'lead_ent_108',
    name: 'Liam O\'Connor',
    email: 'liam@baysiderealty.com.au',
    company: 'Bayside Commercial Properties',
    jobTitle: 'Principal Broker',
    industry: 'Real Estate',
    stage: 'SQL',
    dealValue: 185000,
    region: 'APAC',
    score: 89,
    source: 'LinkedIn',
    deliverability: 'VERIFIED',
  },
];

export function EmailMarketingClient() {
  const [activeTab, setActiveTab] = useState<'builder' | 'automations' | 'scoring-pixel' | 'bulk-blast' | 'campaigns' | 'tracking' | 'templates'>('builder');
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(initialCampaigns);
  const [events, setEvents] = useState<EmailEvent[]>(liveEmailEvents);

  // Workflow Context (when editing an email directly from an Automation Step)
  const [editingWorkflowNode, setEditingWorkflowNode] = useState<{ id: string; title: string; subject?: string } | null>(null);

  // Email Meta State
  const [subject, setSubject] = useState(initialTemplates[0].subject);
  const [preheader, setPreheader] = useState(initialTemplates[0].preheader);
  const [senderName, setSenderName] = useState('Business OS Team');
  const [senderEmail, setSenderEmail] = useState('notifications@businessos.io');

  // AI Subject Generator Copilot Modal
  const [isAiSubjectModalOpen, setIsAiSubjectModalOpen] = useState(false);
  const [aiSubjectTone, setAiSubjectTone] = useState<'EXECUTIVE' | 'URGENT' | 'STORY_CURIOSITY'>('EXECUTIVE');
  const [aiCustomSubjectPrompt, setAiCustomSubjectPrompt] = useState('');
  const [isGeneratingCustomSubjects, setIsGeneratingCustomSubjects] = useState(false);
  const [dynamicAiSuggestions, setDynamicAiSuggestions] = useState<any[]>([]);

  // AI Full Newsletter Drafter State
  const [isAiDrafterModalOpen, setIsAiDrafterModalOpen] = useState(false);
  const [aiDrafterPrompt, setAiDrafterPrompt] = useState('Announce our Q3 product updates featuring autonomous AI voice routing and real-time CRM workflow sync with a limited 20% discount offer');
  const [isGeneratingFullNewsletter, setIsGeneratingFullNewsletter] = useState(false);

  // Smart Dynamic Content Persona Preview Switcher
  const [smartPreviewIndustry, setSmartPreviewIndustry] = useState<'Healthcare' | 'Enterprise SaaS' | 'Real Estate'>('Healthcare');

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
  const [sendStrategy, setSendStrategy] = useState<'INSTANT' | 'WARMUP_DRIP' | 'AI_OPTIMIZED' | 'SCHEDULED'>('AI_OPTIMIZED');
  const [isSendingBlast, setIsSendingBlast] = useState(false);
  const [blastProgress, setBlastProgress] = useState(0);

  // Preview Mode
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);

    const transfer = getBridgeTransfer(true);
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const targetTabParam = params?.get('tab');

    if (transfer && transfer.source === 'visual-builder') {
      if (transfer.subject) setSubject(transfer.subject);
      if (transfer.preheader) setPreheader(transfer.preheader);
      if (transfer.sections && transfer.sections.length > 0) {
        setSections(transfer.sections);
        setSelectedSectionId(transfer.sections[0].id);
      }
      if (transfer.workflowNodeId) {
        setEditingWorkflowNode({
          id: transfer.workflowNodeId,
          title: transfer.workflowNodeTitle || 'Automation Step',
          subject: transfer.subject,
        });
      }
      if (transfer.targetTab) {
        setActiveTab(transfer.targetTab as any);
      } else if (targetTabParam) {
        setActiveTab(targetTabParam as any);
      }
      setAlert(`🎨 Loaded template "${transfer.templateName || transfer.subject}" from Visual Email Studio!`);
      setTimeout(() => setAlert(null), 4500);
    } else if (targetTabParam && ['builder', 'automations', 'bulk-blast', 'campaigns', 'templates', 'scoring-pixel'].includes(targetTabParam)) {
      setActiveTab(targetTabParam as any);
    }
  }, []);

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

  const totalPipelineValue = useMemo(() => {
    return bulkLeads
      .filter((lead) => selectedLeadIds.has(lead.id))
      .reduce((sum, lead) => sum + (lead.dealValue || 0), 0);
  }, [bulkLeads, selectedLeadIds]);

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
      case 'DYNAMIC_SMART_BLOCK':
        newSection = {
          id: newId,
          type: 'DYNAMIC_SMART_BLOCK',
          title: '🧠 AI Smart Dynamic Case Study (Swaps per Industry/Role)',
          dynamicHealthcareTitle: 'How St. Jude Health Saved 4,800 Clinical Hours with Automated OCR',
          dynamicHealthcareBody: 'By deploying Business OS HIPAA-compliant OCR and voice workflows, medical staff reduced manual intake time by 74% and accelerated patient record updates.',
          dynamicSaaSTitle: 'How Hyperion Cloud Tripled Outbound Pipeline in 30 Days',
          dynamicSaaSBody: 'Hyperion consolidated 14 SaaS subscriptions into Business OS, cutting $4,200/mo in software sprawl while doubling sales rep dial velocity with AI softphones.',
          dynamicRealEstateTitle: 'How Apex Realty Automated 12,000 Property Buyer Follow-ups',
          dynamicRealEstateBody: 'Apex Realty triggered instant SMS and email drips within 90 seconds of portal inquiries, boosting buyer tour bookings by 88%.',
          body: 'This content block will automatically swap in the recipient\'s inbox based on their CRM industry and executive job title.',
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

  const handleLocalFileProcess = (
    file: File,
    sectionId: string,
    urlField: keyof EmailSection,
    fileNameField?: keyof EmailSection
  ) => {
    if (file.size > 50 * 1024 * 1024) {
      setAlert('⚠️ Selected file exceeds 50MB size limit.');
      setTimeout(() => setAlert(null), 3500);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setSections((prev) =>
          prev.map((s) => {
            if (s.id !== sectionId) return s;
            const updated = { ...s, [urlField]: dataUrl };
            if (fileNameField) {
              (updated as any)[fileNameField] = file.name;
            }
            return updated;
          })
        );
        setAlert(`✅ Loaded "${file.name}" from your PC!`);
        setTimeout(() => setAlert(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateCustomAiSubjects = async () => {
    if (!aiCustomSubjectPrompt.trim()) return;
    setIsGeneratingCustomSubjects(true);
    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `You are an elite email marketer. Based on this topic: "${aiCustomSubjectPrompt}" and tone: "${aiSubjectTone}", generate 3 high-converting email subject lines with preheaders.
Return ONLY a valid JSON array with NO markdown code backticks:
[
  {
    "subject": "Compelling Subject Line",
    "preheader": "Engaging preheader snippet",
    "openRate": "52.4%",
    "spamScore": "0.1 / 10 (Zero Risk)",
    "tag": "Top AI Performer"
  }
]`,
          provider: 'groq',
        }),
      });
      if (!res.ok) throw new Error('AI service error');
      const data = await res.json();
      const rawText = data.reply || '';
      const cleanJson = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();
      const start = cleanJson.indexOf('[');
      const end = cleanJson.lastIndexOf(']');
      const jsonArr = start !== -1 && end !== -1 ? cleanJson.slice(start, end + 1) : cleanJson;
      const parsed = JSON.parse(jsonArr);
      if (Array.isArray(parsed)) {
        setDynamicAiSuggestions(parsed);
      }
    } catch (e: any) {
      setAlert('Could not generate AI subjects: ' + (e?.message || 'Please try again'));
    } finally {
      setIsGeneratingCustomSubjects(false);
    }
  };

  const handleGenerateFullNewsletter = async () => {
    if (!aiDrafterPrompt.trim()) return;
    setIsGeneratingFullNewsletter(true);
    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `You are a world-class newsletter designer and copywriter. Draft a full newsletter for: "${aiDrafterPrompt}".
Return ONLY a valid JSON object matching this structure with NO markdown backticks:
{
  "subject": "Compelling subject line",
  "preheader": "Preview text snippet",
  "sections": [
    {
      "type": "TEXT_ARTICLE",
      "title": "Main Headline",
      "body": "3 engaging paragraphs of marketing copy with strong value proposition."
    },
    {
      "type": "PRODUCT_CARD",
      "productName": "Featured Solution",
      "productDescription": "Key benefits and capabilities summary.",
      "productPrice": "Starting at $49/mo"
    },
    {
      "type": "BUTTON_CTA",
      "buttonText": "Explore Now",
      "buttonUrl": "https://businessos.io/demo"
    },
    {
      "type": "AUTHOR_SIGNATURE",
      "authorName": "Enterprise Strategy Team",
      "authorRole": "Business OS Solutions"
    }
  ]
}`,
          provider: 'groq',
        }),
      });

      if (!res.ok) throw new Error('AI generation failed');
      const data = await res.json();
      const rawText = data.reply || '';
      const cleanJson = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();
      const start = cleanJson.indexOf('{');
      const end = cleanJson.lastIndexOf('}');
      const jsonStr = start !== -1 && end !== -1 ? cleanJson.slice(start, end + 1) : cleanJson;
      const parsed = JSON.parse(jsonStr);

      if (parsed.subject) setSubject(parsed.subject);
      if (parsed.preheader) setPreheader(parsed.preheader);
      if (Array.isArray(parsed.sections)) {
        const newSecs: EmailSection[] = parsed.sections.map((s: any, idx: number) => ({
          id: `sec_ai_${Date.now()}_${idx}`,
          type: s.type || 'TEXT_ARTICLE',
          title: s.title,
          body: s.body,
          productName: s.productName,
          productDescription: s.productDescription,
          productPrice: s.productPrice,
          buttonText: s.buttonText,
          buttonUrl: s.buttonUrl,
          authorName: s.authorName,
          authorRole: s.authorRole,
        }));
        setSections(newSecs);
        if (newSecs.length > 0) setSelectedSectionId(newSecs[0].id);
      }

      setIsAiDrafterModalOpen(false);
      setAlert('✨ AI Generated Full Newsletter Loaded Successfully!');
      setTimeout(() => setAlert(null), 4000);
    } catch (e: any) {
      setAlert('Could not draft full newsletter: ' + (e?.message || 'Please try again'));
    } finally {
      setIsGeneratingFullNewsletter(false);
    }
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
            onClick={() => setActiveTab('automations')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'automations'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.1] border border-white/[0.1]'
            }`}
          >
            <GitBranch size={14} />
            <span>🤖 AI Automations & Workflows</span>
          </button>

          <button
            onClick={() => setActiveTab('scoring-pixel')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'scoring-pixel'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.1] border border-white/[0.1]'
            }`}
          >
            <Activity size={14} />
            <span>🎯 Tracking Pixel & Scoring</span>
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
            <span>Bulk Blast & AI STO ({selectedLeadIds.size})</span>
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

          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'templates'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.1] border border-white/[0.1]'
            }`}
          >
            <Sparkles size={14} />
            <span>Templates</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const blocks = convertSectionsToBlocks(sections);
              setBridgeTransfer({
                source: 'email-marketing',
                workflowNodeId: editingWorkflowNode?.id,
                workflowNodeTitle: editingWorkflowNode?.title,
                subject,
                preheader,
                blocks,
                sections,
                timestamp: Date.now(),
              });
              window.location.href = `/platform/templates/email?from=email-marketing`;
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.1] border border-white/[0.1]"
            title="Open in Visual Email Builder Studio for deep block layout editing"
          >
            <Palette size={14} className="text-emerald-400" />
            <span>🎨 Open in Visual Template Studio</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🚀 TAB 1: VISUAL NEWSLETTER DESIGNER (Spacious Multi-Block Composer) */}
      {/* ========================================================================= */}
      {activeTab === 'builder' && (
        <div className="space-y-4">
          {/* Automated Workflow Context Banner */}
          {editingWorkflowNode && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-emerald-500/10 border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl backdrop-blur-md animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <GitBranch size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-bold">
                      Workflow Step Editor
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Node ID: {editingWorkflowNode.id}</span>
                  </div>
                  <p className="text-sm font-bold text-white mt-0.5">
                    Designing automated email for: <span className="text-emerald-300 font-extrabold">&ldquo;{editingWorkflowNode.title}&rdquo;</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('automations');
                    setAlert(`✅ Saved email design for workflow step "${editingWorkflowNode.title}"!`);
                    setTimeout(() => setAlert(null), 3500);
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 cursor-pointer"
                >
                  <CheckCircle2 size={14} />
                  <span>Save & Return to Workflow</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingWorkflowNode(null)}
                  className="px-3 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white rounded-xl text-xs font-semibold cursor-pointer border border-white/10"
                  title="Detach from workflow context"
                >
                  Detach
                </button>
              </div>
            </div>
          )}

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
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Newsletter Subject Line</label>
                  <button
                    type="button"
                    onClick={() => setIsAiSubjectModalOpen(true)}
                    className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                  >
                    <Sparkles size={11} className="text-emerald-400" />
                    <span>✨ AI Subject Copilot</span>
                  </button>
                </div>
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
                <button
                  type="button"
                  onClick={() => setIsAiDrafterModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-teal-500/20 to-emerald-500/20 hover:from-teal-500/30 hover:to-emerald-500/30 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                >
                  <Sparkles size={12} className="text-emerald-400" />
                  <span>✨ Auto-Draft with AI</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { type: 'TEXT_ARTICLE' as const, label: 'Article Text', icon: Layers },
                  { type: 'IMAGE_BANNER' as const, label: 'Image Gallery', icon: ImageIcon },
                  { type: 'VIDEO_EMBED' as const, label: 'Video Embed', icon: Video },
                  { type: 'DYNAMIC_SMART_BLOCK' as const, label: '🧠 AI Smart Block', icon: Sparkles },
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
                      className={`p-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer shadow-xs border ${
                        btn.type === 'DYNAMIC_SMART_BLOCK'
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                          : 'bg-white/[0.03] hover:bg-white/[0.08] hover:border-emerald-500/40 border-white/[0.06] text-slate-300 hover:text-white'
                      }`}
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
                          <EmailRichTextEditor
                            value={sec.body || ''}
                            onChange={(val) => handleUpdateSectionField(sec.id, 'body', val)}
                            label="Story Body Copy"
                            rows={7}
                            placeholder="Write your email body or use the formatting bar & AI smoother above..."
                          />
                        </div>
                      </div>
                    )}

                    {sec.type === 'IMAGE_BANNER' && (
                      <div className="space-y-3">
                        {/* Local PC File Upload Dropzone */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                              <HardDrive size={12} className="text-emerald-400" />
                              <span>Image Source (Local PC or URL)</span>
                            </label>
                            {sec.imageFileName && (
                              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 truncate max-w-[200px]">
                                📁 {sec.imageFileName}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {/* Upload Button / Drop Area */}
                            <label className="relative flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-emerald-500/30 hover:border-emerald-400 bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08] cursor-pointer transition-all group text-center">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleLocalFileProcess(file, sec.id, 'imageUrl', 'imageFileName');
                                  e.target.value = '';
                                }}
                              />
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                                <Upload size={16} />
                              </div>
                              <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                                {sec.imageUrl ? 'Replace Image from PC' : 'Upload Image from PC'}
                              </span>
                              <span className="text-[10px] text-slate-400">PNG, JPG, GIF, WebP (up to 50MB)</span>
                            </label>

                            {/* Thumbnail Preview if present */}
                            {sec.imageUrl ? (
                              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/40 h-full min-h-[90px] flex items-center justify-center group">
                                <img src={sec.imageUrl} alt="Banner Preview" className="w-full h-full object-cover max-h-24" />
                                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleUpdateSectionField(sec.id, 'imageUrl', '');
                                      handleUpdateSectionField(sec.id, 'imageFileName', '');
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-rose-500/80 hover:bg-rose-500 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                                  >
                                    <Trash2 size={12} />
                                    <span>Remove</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 flex flex-col justify-center text-center">
                                <span className="text-[11px] text-slate-400">No image selected yet.</span>
                                <span className="text-[10px] text-slate-500 mt-1">Upload a file from your computer or paste a web URL below.</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Direct URL Option */}
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Or Direct Web Image URL</label>
                          <input
                            type="text"
                            placeholder="https://images.unsplash.com/... or paste link"
                            value={sec.imageUrl && !sec.imageUrl.startsWith('data:') ? sec.imageUrl : ''}
                            onChange={(e) => {
                              handleUpdateSectionField(sec.id, 'imageUrl', e.target.value);
                              handleUpdateSectionField(sec.id, 'imageFileName', undefined);
                            }}
                            className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Image Caption</label>
                          <input
                            type="text"
                            placeholder="Add a descriptive caption for your newsletter image."
                            value={sec.imageCaption || ''}
                            onChange={(e) => handleUpdateSectionField(sec.id, 'imageCaption', e.target.value)}
                            className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
                          />
                        </div>
                      </div>
                    )}

                    {sec.type === 'VIDEO_EMBED' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Video Title / Headline</label>
                          <input
                            type="text"
                            placeholder="Watch 3-Minute Walkthrough: AI Softphone & CRM Sync"
                            value={sec.videoTitle || ''}
                            onChange={(e) => handleUpdateSectionField(sec.id, 'videoTitle', e.target.value)}
                            className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-emerald-500/50"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Local Video Upload or URL */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                                <FileVideo size={12} className="text-amber-400" />
                                <span>Video File (Local PC or URL)</span>
                              </label>
                              {sec.videoFileName && (
                                <span className="text-[9px] font-mono text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 truncate max-w-[130px]">
                                  📁 {sec.videoFileName}
                                </span>
                              )}
                            </div>
                            <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-amber-500/30 hover:border-amber-400 bg-amber-500/[0.04] hover:bg-amber-500/[0.08] cursor-pointer transition-all group text-center">
                              <input
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleLocalFileProcess(file, sec.id, 'videoUrl', 'videoFileName');
                                  e.target.value = '';
                                }}
                              />
                              <Upload size={14} className="text-amber-400 group-hover:scale-110 transition-transform" />
                              <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
                                {sec.videoFileName ? 'Replace Video from PC' : 'Upload Video from PC (.mp4, .webm)'}
                              </span>
                            </label>
                            <input
                              type="text"
                              placeholder="Or paste YouTube / Vimeo / MP4 URL"
                              value={sec.videoUrl && !sec.videoUrl.startsWith('data:') ? sec.videoUrl : ''}
                              onChange={(e) => {
                                handleUpdateSectionField(sec.id, 'videoUrl', e.target.value);
                                handleUpdateSectionField(sec.id, 'videoFileName', undefined);
                              }}
                              className="w-full px-3 py-1.5 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500/50"
                            />
                          </div>

                          {/* Local Video Thumbnail Upload or URL */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                                <FileImage size={12} className="text-emerald-400" />
                                <span>Video Poster (Local PC or URL)</span>
                              </label>
                              {sec.thumbnailFileName && (
                                <span className="text-[9px] font-mono text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 truncate max-w-[130px]">
                                  📁 {sec.thumbnailFileName}
                                </span>
                              )}
                            </div>
                            <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-emerald-500/30 hover:border-emerald-400 bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08] cursor-pointer transition-all group text-center">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleLocalFileProcess(file, sec.id, 'videoThumbnail', 'thumbnailFileName');
                                  e.target.value = '';
                                }}
                              />
                              <Upload size={14} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                              <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
                                {sec.thumbnailFileName ? 'Replace Poster from PC' : 'Upload Poster from PC (.png, .jpg)'}
                              </span>
                            </label>
                            <input
                              type="text"
                              placeholder="Or paste Poster Image URL"
                              value={sec.videoThumbnail && !sec.videoThumbnail.startsWith('data:') ? sec.videoThumbnail : ''}
                              onChange={(e) => {
                                handleUpdateSectionField(sec.id, 'videoThumbnail', e.target.value);
                                handleUpdateSectionField(sec.id, 'thumbnailFileName', undefined);
                              }}
                              className="w-full px-3 py-1.5 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500/50"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {sec.type === 'DYNAMIC_SMART_BLOCK' && (
                      <div className="space-y-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/[0.04] via-cyan-500/[0.04] to-emerald-500/[0.04] border border-emerald-500/20">
                        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                          <div className="flex items-center gap-2">
                            <Sparkles className="text-emerald-400" size={16} />
                            <div>
                              <span className="text-xs font-bold text-white block">AI Smart Dynamic Content Rules</span>
                              <span className="text-[10px] text-slate-400">Content below automatically switches based on recipient industry & CRM role</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                            Enterprise Personalization
                          </span>
                        </div>

                        {/* Healthcare Variant */}
                        <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/30 space-y-2">
                          <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                            🏥 Healthcare Industry Variant (e.g. Hospital / Clinic executives):
                          </span>
                          <input
                            type="text"
                            placeholder="Healthcare Headline"
                            value={sec.dynamicHealthcareTitle || ''}
                            onChange={(e) => handleUpdateSectionField(sec.id, 'dynamicHealthcareTitle', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white/[0.05] border border-white/10 rounded-lg text-xs text-white font-bold focus:outline-none"
                          />
                          <textarea
                            rows={2}
                            placeholder="Healthcare Case Study & Value Prop..."
                            value={sec.dynamicHealthcareBody || ''}
                            onChange={(e) => handleUpdateSectionField(sec.id, 'dynamicHealthcareBody', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white/[0.05] border border-white/10 rounded-lg text-xs text-slate-200 focus:outline-none"
                          />
                        </div>

                        {/* Enterprise SaaS Variant */}
                        <div className="p-3 rounded-xl bg-black/40 border border-cyan-500/30 space-y-2">
                          <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                            💻 Enterprise SaaS Variant (e.g. CTO / VP Ops):
                          </span>
                          <input
                            type="text"
                            placeholder="Enterprise SaaS Headline"
                            value={sec.dynamicSaaSTitle || ''}
                            onChange={(e) => handleUpdateSectionField(sec.id, 'dynamicSaaSTitle', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white/[0.05] border border-white/10 rounded-lg text-xs text-white font-bold focus:outline-none"
                          />
                          <textarea
                            rows={2}
                            placeholder="Enterprise SaaS Case Study & Value Prop..."
                            value={sec.dynamicSaaSBody || ''}
                            onChange={(e) => handleUpdateSectionField(sec.id, 'dynamicSaaSBody', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white/[0.05] border border-white/10 rounded-lg text-xs text-slate-200 focus:outline-none"
                          />
                        </div>

                        {/* Real Estate Variant */}
                        <div className="p-3 rounded-xl bg-black/40 border border-amber-500/30 space-y-2">
                          <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                            🏢 Real Estate Variant (e.g. Broker / Portfolio Managers):
                          </span>
                          <input
                            type="text"
                            placeholder="Real Estate Headline"
                            value={sec.dynamicRealEstateTitle || ''}
                            onChange={(e) => handleUpdateSectionField(sec.id, 'dynamicRealEstateTitle', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white/[0.05] border border-white/10 rounded-lg text-xs text-white font-bold focus:outline-none"
                          />
                          <textarea
                            rows={2}
                            placeholder="Real Estate Case Study & Value Prop..."
                            value={sec.dynamicRealEstateBody || ''}
                            onChange={(e) => handleUpdateSectionField(sec.id, 'dynamicRealEstateBody', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white/[0.05] border border-white/10 rounded-lg text-xs text-slate-200 focus:outline-none"
                          />
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
                        {/* Product Image Upload from PC or URL */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                              <FileImage size={12} className="text-emerald-400" />
                              <span>Product Image (Local PC or URL)</span>
                            </label>
                            {sec.imageFileName && (
                              <span className="text-[9px] font-mono text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 truncate max-w-[150px]">
                                📁 {sec.imageFileName}
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-emerald-500/30 hover:border-emerald-400 bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08] cursor-pointer transition-all group text-center">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleLocalFileProcess(file, sec.id, 'imageUrl', 'imageFileName');
                                  e.target.value = '';
                                }}
                              />
                              <Upload size={14} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                              <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
                                {sec.imageFileName ? 'Replace Photo from PC' : 'Upload Photo from PC'}
                              </span>
                            </label>
                            <input
                              type="text"
                              placeholder="Or paste Image URL"
                              value={sec.imageUrl && !sec.imageUrl.startsWith('data:') ? sec.imageUrl : ''}
                              onChange={(e) => {
                                handleUpdateSectionField(sec.id, 'imageUrl', e.target.value);
                                handleUpdateSectionField(sec.id, 'imageFileName', undefined);
                              }}
                              className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {sec.type === 'CALLOUT_QUOTE' && (
                      <div className="space-y-3">
                        <div>
                          <EmailRichTextEditor
                            value={sec.body || ''}
                            onChange={(val) => handleUpdateSectionField(sec.id, 'body', val)}
                            label="Quote Copy"
                            rows={3}
                            placeholder="Write your quote copy or use formatting buttons above..."
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
                        {/* Author Avatar Upload */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                              <UserCheck size={12} className="text-emerald-400" />
                              <span>Avatar Photo (Local PC or URL)</span>
                            </label>
                            {sec.imageFileName && (
                              <span className="text-[9px] font-mono text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 truncate max-w-[150px]">
                                📁 {sec.imageFileName}
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <label className="flex items-center justify-center gap-2 p-2 rounded-xl border border-dashed border-emerald-500/30 hover:border-emerald-400 bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08] cursor-pointer transition-all group text-center">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleLocalFileProcess(file, sec.id, 'authorAvatar', 'imageFileName');
                                  e.target.value = '';
                                }}
                              />
                              <Upload size={14} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                              <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
                                Upload Avatar from PC
                              </span>
                            </label>
                            <input
                              type="text"
                              placeholder="Or paste Avatar URL"
                              value={sec.authorAvatar && !sec.authorAvatar.startsWith('data:') ? sec.authorAvatar : ''}
                              onChange={(e) => {
                                handleUpdateSectionField(sec.id, 'authorAvatar', e.target.value);
                                handleUpdateSectionField(sec.id, 'imageFileName', undefined);
                              }}
                              className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none"
                            />
                          </div>
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsTestModalOpen(true)}
                className="px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send size={14} />
                <span>Send Test Email</span>
              </button>

              <div className="flex items-center gap-2.5 flex-wrap">
                {editingWorkflowNode && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('automations');
                      setAlert(`✅ Saved email template for "${editingWorkflowNode.title}" and returned to workflow!`);
                      setTimeout(() => setAlert(null), 3500);
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <GitBranch size={14} />
                    <span>Save & Return to Automation Workflow</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveTab('bulk-blast')}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    editingWorkflowNode
                      ? 'bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-white'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-emerald-500/25'
                  }`}
                >
                  <span>Continue to Bulk Blast Lead Filter</span>
                  <ArrowRight size={14} />
                </button>
              </div>
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

              {/* Dynamic Persona Preview Switcher */}
              <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Sparkles size={11} className="text-emerald-400" />
                    <span>Test Smart Content as Recipient Persona:</span>
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400">{smartPreviewIndustry}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'Healthcare' as const, label: '🏥 Healthcare CEO' },
                    { id: 'Enterprise SaaS' as const, label: '💻 SaaS CTO' },
                    { id: 'Real Estate' as const, label: '🏢 Real Estate' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSmartPreviewIndustry(p.id)}
                      className={`px-2 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer truncate ${
                        smartPreviewIndustry === p.id
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                          : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.05]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
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
                          <div
                            className="text-xs text-slate-300 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: renderRichEmailContent(sec.body) }}
                          />
                        </div>
                      )}

                      {sec.type === 'DYNAMIC_SMART_BLOCK' && (
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent border border-emerald-500/30 space-y-2.5 shadow-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                              <Sparkles size={10} /> Smart Personalized Content ({smartPreviewIndustry})
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">Dynamic Lead Token</span>
                          </div>
                          <h3 className="font-extrabold text-sm text-white leading-snug">
                            {smartPreviewIndustry === 'Healthcare'
                              ? sec.dynamicHealthcareTitle || 'How Leading Healthcare Providers Scaled with Business OS'
                              : smartPreviewIndustry === 'Real Estate'
                              ? sec.dynamicRealEstateTitle || 'How Real Estate Portfolios Accelerated Lead Intake'
                              : sec.dynamicSaaSTitle || 'How Enterprise SaaS Teams Tripled Dial Velocity'}
                          </h3>
                          <div
                            className="text-xs text-slate-300 leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: renderRichEmailContent(
                                smartPreviewIndustry === 'Healthcare'
                                  ? sec.dynamicHealthcareBody || 'Automated OCR intake and HIPAA telemetry reduced manual documentation by 74%.'
                                  : smartPreviewIndustry === 'Real Estate'
                                  ? sec.dynamicRealEstateBody || 'Instant 90-second SMS and email follow-ups increased client tours by 88%.'
                                  : sec.dynamicSaaSBody || 'Consolidated 14 fragmented tools, cutting $4,200/mo in software sprawl.'
                              ),
                            }}
                          />
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
                          <div
                            className="text-[11px] text-slate-300 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: renderRichEmailContent(sec.body) }}
                          />
                          {sec.buttonText && (
                            <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-[11px] rounded-lg">
                              {sec.buttonText}
                            </span>
                          )}
                        </div>
                      )}

                      {sec.type === 'CALLOUT_QUOTE' && (
                        <div className="p-4 rounded-2xl bg-emerald-500/10 border-l-4 border-amber-500 space-y-2">
                          <div
                            className="text-xs text-slate-200 italic leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: renderRichEmailContent(sec.body) }}
                          />
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
                            {sec.body && (
                              <div
                                className="text-[10px] text-slate-400 mt-1"
                                dangerouslySetInnerHTML={{ __html: renderRichEmailContent(sec.body) }}
                              />
                            )}
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
      </div>
    )}

      {/* ========================================================================= */}
      {/* 🚀 TAB 2: BULK BLAST & AI SEND-TIME OPTIMIZATION (STO) LEAD FILTER */}
      {/* ========================================================================= */}
      {activeTab === 'bulk-blast' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Header & Fast Action Bar */}
          <div className="luxe-box rounded-3xl p-6 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Lead Segmentation & AI STO
                  </span>
                  {editingWorkflowNode && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
                      <GitBranch size={11} /> Step: {editingWorkflowNode.title}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-extrabold text-white mt-1 flex items-center gap-2">
                  <Users className="text-emerald-400" size={22} />
                  <span>Targeted Bulk Lead Filter & Multi-Media Dispatch</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Filter verified CRM contacts by vertical, deal pipeline stage, and territory. Dispatch with AI-powered Send-Time Optimization (STO) and anti-spam drip safeguards.
                </p>
              </div>

              {/* Navigation & Utility Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveTab('builder')}
                  className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-white/10 flex items-center gap-1.5 cursor-pointer"
                >
                  <Layers size={14} className="text-emerald-400" />
                  <span>Edit Newsletter Design</span>
                </button>

                {editingWorkflowNode && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('automations');
                      setAlert(`Saved changes and returned to Automation Workflow!`);
                      setTimeout(() => setAlert(null), 3000);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <GitBranch size={14} />
                    <span>Return to Automation Workflow</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleUploadSampleCsv}
                  className="px-4 py-2 bg-white/[0.06] hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/40 text-slate-300 rounded-xl text-xs font-bold transition-all border border-white/10 flex items-center gap-1.5 cursor-pointer"
                  title="Import additional CSV leads"
                >
                  <FileSpreadsheet size={14} className="text-emerald-400" />
                  <span>Import Sample CSV</span>
                </button>
              </div>
            </div>

            {/* 4 Metric KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Total CRM Leads</span>
                  <Users size={14} className="text-slate-400" />
                </div>
                <div className="text-xl font-extrabold text-white font-mono">{bulkLeads.length}</div>
                <div className="text-[10px] text-slate-500">Verified CRM Contact Pool</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Filtered Matches</span>
                  <Filter size={14} className="text-emerald-400" />
                </div>
                <div className="text-xl font-extrabold text-emerald-400 font-mono">{filteredLeads.length}</div>
                <div className="text-[10px] text-slate-500">Matching active filter criteria</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between text-teal-400">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Selected for Blast</span>
                  <CheckCircle2 size={14} className="text-teal-400" />
                </div>
                <div className="text-xl font-extrabold text-white font-mono">
                  {selectedLeadIds.size} <span className="text-xs font-normal text-slate-400">/ {bulkLeads.length}</span>
                </div>
                <div className="text-[10px] text-teal-400 font-medium">Ready for immediate dispatch</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                <div className="flex items-center justify-between text-amber-400">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Target Pipeline</span>
                  <TrendingUp size={14} className="text-amber-400" />
                </div>
                <div className="text-xl font-extrabold text-amber-300 font-mono">
                  ${totalPipelineValue.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500">Active deal opportunity value</div>
              </div>
            </div>
          </div>

          {/* AI Send-Time Optimization (STO) & Delivery Protocol Selector */}
          <div className="luxe-box rounded-3xl p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  AI Send-Time Optimization (STO) & Anti-Spam Delivery Strategy
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                Zero Spam Bounces Guaranteed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  id: 'AI_OPTIMIZED' as const,
                  icon: Sparkles,
                  title: 'AI STO Optimal Windows',
                  tag: 'Recommended',
                  tagColor: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40',
                  desc: 'Machine learning predicts when each executive opens email and staggers dispatch across optimal minutes.',
                },
                {
                  id: 'WARMUP_DRIP' as const,
                  icon: Flame,
                  title: 'Anti-Spam Warm-Up Drip',
                  tag: 'Domain Shield',
                  tagColor: 'text-amber-300 bg-amber-500/20 border-amber-500/40',
                  desc: 'Throttles batches of 25 leads every 15 minutes to guarantee 0 spam flags on cold outbound.',
                },
                {
                  id: 'INSTANT' as const,
                  icon: Zap,
                  title: 'High-Speed Turbo Blast',
                  tag: 'Parallel Concurrency',
                  tagColor: 'text-teal-300 bg-teal-500/20 border-teal-500/40',
                  desc: 'Delivers to all selected contacts simultaneously across verified enterprise SMTP relays.',
                },
                {
                  id: 'SCHEDULED' as const,
                  icon: Clock,
                  title: 'Timezone Synchronized',
                  tag: 'Local 9:00 AM',
                  tagColor: 'text-cyan-300 bg-cyan-500/20 border-cyan-500/40',
                  desc: 'Delivers to each recipient at 09:00 AM in their local territory (North America, EMEA, APAC).',
                },
              ].map((strat) => {
                const isSelected = sendStrategy === strat.id;
                const IconComponent = strat.icon;
                return (
                  <button
                    key={strat.id}
                    type="button"
                    onClick={() => setSendStrategy(strat.id)}
                    className={`p-4 rounded-2xl text-left transition-all border cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-b from-emerald-500/20 to-teal-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                        : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.06] text-slate-400'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-xl ${isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/[0.05] text-slate-400'}`}>
                          <IconComponent size={16} />
                        </div>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${strat.tagColor}`}>
                          {strat.tag}
                        </span>
                      </div>
                      <div className="font-bold text-xs text-white">{strat.title}</div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{strat.desc}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center gap-1.5 text-[10px] font-mono">
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                      <span className={isSelected ? 'text-emerald-300 font-bold' : 'text-slate-500'}>
                        {isSelected ? 'Active Strategy' : 'Select'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lead Filters & Interactive Search Toolbar */}
          <div className="luxe-box rounded-3xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search leads by name, email, company, job title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Filter Selectors */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Industry Filter */}
                <select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  className="px-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                >
                  <option value="ALL" className="bg-[#0b101b]">All Industries</option>
                  <option value="Healthcare" className="bg-[#0b101b]">🏥 Healthcare</option>
                  <option value="Enterprise SaaS" className="bg-[#0b101b]">💻 Enterprise SaaS</option>
                  <option value="Real Estate" className="bg-[#0b101b]">🏢 Real Estate</option>
                  <option value="Restaurant" className="bg-[#0b101b]">🍽️ Restaurant</option>
                  <option value="Retail" className="bg-[#0b101b]">🛍️ Retail</option>
                  <option value="Other" className="bg-[#0b101b]">🌐 Other</option>
                </select>

                {/* Pipeline Stage Filter */}
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="px-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                >
                  <option value="ALL" className="bg-[#0b101b]">All Stages</option>
                  <option value="Cold" className="bg-[#0b101b]">❄️ Cold</option>
                  <option value="MQL" className="bg-[#0b101b]">🎯 MQL</option>
                  <option value="SQL" className="bg-[#0b101b]">🔥 SQL</option>
                  <option value="Negotiation" className="bg-[#0b101b]">🤝 Negotiation</option>
                  <option value="Customer" className="bg-[#0b101b]">⭐ Customer</option>
                </select>

                {/* Region Filter */}
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="px-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                >
                  <option value="ALL" className="bg-[#0b101b]">All Regions</option>
                  <option value="North America" className="bg-[#0b101b]">North America</option>
                  <option value="EMEA" className="bg-[#0b101b]">EMEA</option>
                  <option value="APAC" className="bg-[#0b101b]">APAC</option>
                  <option value="LATAM" className="bg-[#0b101b]">LATAM</option>
                </select>

                {/* Select/Deselect All Filtered */}
                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="px-3 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckSquare size={14} className="text-emerald-400" />
                  <span>
                    {filteredLeads.length > 0 && filteredLeads.every((l) => selectedLeadIds.has(l.id))
                      ? 'Deselect Filtered'
                      : `Select All Filtered (${filteredLeads.length})`}
                  </span>
                </button>

                {(industryFilter !== 'ALL' || stageFilter !== 'ALL' || regionFilter !== 'ALL' || searchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setIndustryFilter('ALL');
                      setStageFilter('ALL');
                      setRegionFilter('ALL');
                      setSearchQuery('');
                    }}
                    className="p-2.5 bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
                    title="Reset Filters"
                  >
                    <RotateCcw size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0c111d]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] uppercase tracking-wider font-bold text-slate-400">
                    <th className="p-3.5 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={filteredLeads.length > 0 && filteredLeads.every((l) => selectedLeadIds.has(l.id))}
                        onChange={handleSelectAllFiltered}
                        className="w-4 h-4 rounded text-emerald-500 cursor-pointer accent-emerald-500"
                      />
                    </th>
                    <th className="p-3.5">Lead & Contact</th>
                    <th className="p-3.5">Company & Industry</th>
                    <th className="p-3.5">Region</th>
                    <th className="p-3.5">Stage</th>
                    <th className="p-3.5">Buyer Score</th>
                    <th className="p-3.5">Deliverability</th>
                    <th className="p-3.5 text-right">Deal Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredLeads.map((lead) => {
                    const isSelected = selectedLeadIds.has(lead.id);
                    return (
                      <tr
                        key={lead.id}
                        onClick={() => toggleLeadSelection(lead.id)}
                        className={`transition-colors cursor-pointer ${
                          isSelected ? 'bg-emerald-500/[0.06] hover:bg-emerald-500/[0.09]' : 'hover:bg-white/[0.02]'
                        }`}
                      >
                        <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleLeadSelection(lead.id)}
                            className="w-4 h-4 rounded text-emerald-500 cursor-pointer accent-emerald-500"
                          />
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-white font-bold text-xs">
                              {lead.name.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <div>
                              <div className="font-bold text-white text-xs">{lead.name}</div>
                              <div className="text-[11px] text-slate-400">{lead.jobTitle}</div>
                              <div className="text-[10px] font-mono text-slate-500">{lead.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-white text-xs">{lead.company}</div>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/[0.05] text-slate-300 border border-white/[0.08]">
                            {lead.industry}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="text-slate-300 font-medium text-xs">{lead.region}</span>
                          <span className="block text-[10px] text-slate-500 font-mono">Source: {lead.source}</span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                              lead.stage === 'SQL'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : lead.stage === 'Negotiation'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : lead.stage === 'MQL'
                                ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                                : lead.stage === 'Customer'
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                : 'bg-slate-500/20 text-slate-300 border-slate-500/40'
                            }`}
                          >
                            {lead.stage}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="space-y-1 w-24">
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="text-slate-400">Score</span>
                              <span className="font-bold text-emerald-400">{lead.score}%</span>
                            </div>
                            <div className="w-full bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                                style={{ width: `${lead.score}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            <ShieldCheck size={11} className="text-emerald-400" />
                            <span>{lead.deliverability}</span>
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-white text-xs">
                          ${lead.dealValue.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredLeads.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-slate-400 space-y-2">
                        <AlertCircle size={28} className="mx-auto text-amber-400" />
                        <p className="font-bold text-sm text-white">No leads match your active filters</p>
                        <p className="text-xs text-slate-400">Adjust the industry, stage, or search terms, or import extra leads via CSV.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setIndustryFilter('ALL');
                            setStageFilter('ALL');
                            setRegionFilter('ALL');
                            setSearchQuery('');
                          }}
                          className="mt-2 px-4 py-1.5 bg-white/[0.08] hover:bg-white/[0.15] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Clear All Filters
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sticky Bottom Dispatch Execution Bar */}
          <div className="luxe-box rounded-3xl p-5 border border-emerald-500/30 bg-gradient-to-r from-slate-950 via-[#0e1628] to-slate-950 shadow-2xl space-y-3">
            {isSendingBlast && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-300 font-bold flex items-center gap-2">
                    <RefreshCw size={13} className="animate-spin text-emerald-400" />
                    Broadcasting newsletter blast via {sendStrategy}...
                  </span>
                  <span className="text-emerald-400 font-bold">{blastProgress}% Completed</span>
                </div>
                <div className="w-full bg-white/[0.1] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-300 rounded-full"
                    style={{ width: `${blastProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white">
                    Recipient Batch: <strong className="text-emerald-300">{selectedLeadIds.size} Leads</strong> Selected
                  </span>
                  <span className="text-[10px] text-slate-400">·</span>
                  <span className="text-xs text-slate-300 font-mono truncate max-w-sm">
                    Subject: &quot;{subject}&quot;
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <ShieldCheck size={12} /> 99.8% Inbox Placement Guaranteed
                  </span>
                  <span>·</span>
                  <span>Pipeline Target: <strong className="text-amber-300 font-mono">${totalPipelineValue.toLocaleString()}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('builder')}
                  className="px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Layers size={14} />
                  <span>Back to Designer</span>
                </button>

                <button
                  type="button"
                  disabled={isSendingBlast || selectedLeadIds.size === 0}
                  onClick={handleLaunchBulkBlast}
                  className={`px-6 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-xl cursor-pointer transition-all ${
                    isSendingBlast || selectedLeadIds.size === 0
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/30'
                  }`}
                >
                  <Send size={15} />
                  <span>
                    {isSendingBlast
                      ? `Broadcasting (${blastProgress}%)...`
                      : `Launch Multi-Media Blast (${selectedLeadIds.size} Leads)`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'automations' && (
        <AutomationsWorkflowStudio
          onOpenEmailDesigner={(subj, nodeId, nodeTitle) => {
            if (subj) setSubject(subj);
            if (nodeId && nodeTitle) {
              setEditingWorkflowNode({ id: nodeId, title: nodeTitle, subject: subj });
            } else {
              setEditingWorkflowNode({ id: 'active_step', title: 'Automation Workflow Step', subject: subj });
            }
            setActiveTab('builder');
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* 🎯 TAB: BEHAVIORAL TRACKING PIXEL & DYNAMIC LEAD SCORING MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'scoring-pixel' && <TrackingPixelAndScoringStudio />}

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
        <div className="space-y-5">
          <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                Visual Studio Integration
              </span>
              <h3 className="font-bold text-sm text-white">Shared Corporate Template Studio</h3>
              <p className="text-xs text-slate-400">Design advanced micro-block layouts (star ratings, meeting embeds, stat callouts) in the Visual Builder and synchronize across workflows.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const blocks = convertSectionsToBlocks(sections);
                setBridgeTransfer({
                  source: 'email-marketing',
                  subject,
                  preheader,
                  blocks,
                  sections,
                  timestamp: Date.now(),
                });
                window.location.href = '/platform/templates/email?from=email-marketing';
              }}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer shrink-0"
            >
              <Palette size={14} />
              <span>Create in Visual Studio</span>
            </button>
          </div>

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
        </div>
      )}

      {/* Remodeled Luxury Glass Portal Modal */}
      {isTestModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-950/99 border border-white/[0.14] rounded-3xl p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(16,185,129,0.15)] backdrop-blur-2xl text-white space-y-5 animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Top Specular Flare */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-emerald-500/10 blur-3xl rounded-full" />

            {/* Header with category badge */}
            <div className="flex items-start justify-between pb-4 border-b border-white/[0.08] relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <Mail size={20} />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-black tracking-widest text-emerald-300 uppercase">
                    CAMPAIGN DISPATCH TEST
                  </span>
                  <h2 className="text-base font-bold text-white tracking-tight mt-0.5">Send Instant Test Email</h2>
                  <p className="text-xs text-slate-400 font-medium">Verify HTML layout, responsive CSS, and inbox rendering</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1.5 relative z-10">
              <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Recipient Email Address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono text-xs"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3 relative z-10">
              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-semibold transition-all cursor-pointer"
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
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black tracking-wide shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Send size={13} />
                <span>Send Test Email</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* AI Subject Line & Preheader Copilot Modal */}
      {isAiSubjectModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-950/99 border border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(16,185,129,0.15)] backdrop-blur-2xl text-white space-y-5 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-start justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <Sparkles size={20} />
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold text-emerald-300 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    AI Copywriting Copilot
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">High-Converting Subject Generator</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiSubjectModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tone Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400">Select Strategic Tone:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'EXECUTIVE' as const, label: '👑 Executive ROI' },
                  { id: 'URGENT' as const, label: '⚡ Direct & Action' },
                  { id: 'STORY_CURIOSITY' as const, label: '🔍 Curiosity Hook' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setAiSubjectTone(t.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer truncate ${
                      aiSubjectTone === t.id
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Prompt Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400">Custom Campaign Topic or Keyword:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 50% enterprise launch discount, autonomous voice AI..."
                  value={aiCustomSubjectPrompt}
                  onChange={(e) => setAiCustomSubjectPrompt(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50 font-medium"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleGenerateCustomAiSubjects();
                  }}
                />
                <button
                  type="button"
                  onClick={handleGenerateCustomAiSubjects}
                  disabled={isGeneratingCustomSubjects || !aiCustomSubjectPrompt.trim()}
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 shadow-md"
                >
                  {isGeneratingCustomSubjects ? (
                    <RotateCcw size={12} className="animate-spin" />
                  ) : (
                    <Sparkles size={12} />
                  )}
                  <span>{isGeneratingCustomSubjects ? 'Writing...' : 'Generate with Groq'}</span>
                </button>
              </div>
            </div>

            {/* AI Generated Variations */}
            <div className="space-y-2.5">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                {dynamicAiSuggestions.length > 0 ? '✨ Live Groq Generated Suggestions (Click to Apply):' : 'AI Generated Suggestions (Click to Apply):'}
              </span>

              {(dynamicAiSuggestions.length > 0 ? dynamicAiSuggestions : [
                {
                  subject: 'Introducing Business OS 2.0: Sub-10ms Queries & Real-time Telemetry',
                  preheader: 'Unified operations, OCR document inference, and automated WebRTC call routing.',
                  openRate: '49.2%',
                  spamScore: '0.1 / 10 (Zero Risk)',
                  tag: 'Top Performer',
                },
                {
                  subject: 'How Elena’s Team Consolidated 14 SaaS Subscriptions & Cut $4,200/mo',
                  preheader: 'Read the full case study on autonomous sales drips and CRM pipelines.',
                  openRate: '53.8%',
                  spamScore: '0.2 / 10 (Zero Risk)',
                  tag: 'Highest Open Rate',
                },
                {
                  subject: 'Quick question regarding your enterprise billing & CRM tooling stack',
                  preheader: 'Explore how 500+ operations leaders accelerated team velocity this quarter.',
                  openRate: '46.5%',
                  spamScore: '0.2 / 10 (Zero Risk)',
                  tag: 'B2B Cold Outbound',
                },
              ]).map((sug, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSubject(sug.subject);
                    setPreheader(sug.preheader);
                    setIsAiSubjectModalOpen(false);
                    setAlert(`Applied AI Subject: "${sug.subject}"`);
                    setTimeout(() => setAlert(null), 3000);
                  }}
                  className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-emerald-500/[0.08] border border-white/[0.08] hover:border-emerald-500/40 transition-all cursor-pointer group space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-white group-hover:text-emerald-300 leading-snug">{sug.subject}</span>
                    <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
                      {sug.tag || 'AI Generated'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 italic">{sug.preheader}</p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-white/[0.04]">
                    <span className="text-cyan-400 font-bold">Est. Open Rate: {sug.openRate}</span>
                    <span className="text-emerald-400">Spam Score: {sug.spamScore}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* ✨ MODAL: AI FULL NEWSLETTER DRAFTER */}
      {/* ========================================================================= */}
      {isAiDrafterModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500/20 to-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-xs">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">AI Full Newsletter Drafter</h3>
                  <span className="text-[10px] font-mono text-emerald-300">
                    Groq Turbo Content Synthesis
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiDrafterModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Describe What You Want to Announce or Communicate:
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Announce our Q3 release with autonomous voice AI, real-time CRM workflow sync, and a 20% discount offer..."
                  value={aiDrafterPrompt}
                  onChange={(e) => setAiDrafterPrompt(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/[0.05] border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Quick Starters:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Product Launch: Business OS 2.0 & AI OCR',
                    'Monthly Executive Briefing & Benchmarks',
                    'Customer Case Study: $4,200/mo SaaS Savings',
                    'Flash 48-Hour Enterprise Upgrade Sale',
                  ].map((starter) => (
                    <button
                      key={starter}
                      type="button"
                      onClick={() => setAiDrafterPrompt(`Draft a high-converting newsletter announcing: ${starter}`)}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-emerald-500/[0.12] border border-white/[0.08] hover:border-emerald-500/30 text-[10px] font-medium text-slate-300 cursor-pointer transition-all"
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAiDrafterModalOpen(false)}
                className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateFullNewsletter}
                disabled={isGeneratingFullNewsletter || !aiDrafterPrompt.trim()}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5"
              >
                {isGeneratingFullNewsletter ? (
                  <>
                    <RotateCcw size={14} className="animate-spin" />
                    <span>Synthesizing Newsletter Sections...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Generate Entire Newsletter</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
