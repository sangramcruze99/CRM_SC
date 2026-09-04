'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  Filter,
  Search,
  Download,
  Flame,
  Clock,
  Zap,
  RotateCcw,
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
  Calendar,
  Star,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Code,
  ShieldCheck,
  Tag,
  ThumbsUp,
  FileText,
  User,
  Share2,
  ChevronRight,
  HelpCircle,
  Inbox,
  FolderOpen,
  FileEdit,
  SendHorizontal,
  Archive,
  MoreVertical,
  CheckCircle,
  Upload,
  HardDrive,
  Link as LinkIcon,
  FileVideo,
  FileImage,
  GitBranch,
} from 'lucide-react';
import {
  setBridgeTransfer,
  getBridgeTransfer,
  clearBridgeTransfer,
  convertBlocksToSections,
  convertSectionsToBlocks,
  saveSharedBridgeTemplate,
} from '../../lib/emailBridge';
import { EmailRichTextToolbar, EmailRichTextEditor } from '../email/EmailRichTextToolbar';
import { renderRichEmailContent } from '../../lib/richTextRenderer';

export type EmailBlockType =
  | 'HEADER'
  | 'TEXT'
  | 'IMAGE_BANNER'
  | 'BUTTON_CTA'
  | 'PRODUCT_CARD'
  | 'TESTIMONIAL'
  | 'METRIC_STAT'
  | 'MEETING_SCHEDULER'
  | 'VIDEO_PREVIEW'
  | 'SALES_SIGNATURE'
  | 'DIVIDER'
  | 'SOCIAL_FOOTER';

export interface EmailBlock {
  id: string;
  type: EmailBlockType;
  title?: string;
  body?: string;
  imageUrl?: string;
  imageCaption?: string;
  imageFileName?: string;
  videoUrl?: string;
  videoThumbnail?: string;
  videoFileName?: string;
  thumbnailFileName?: string;
  buttonText?: string;
  buttonUrl?: string;
  buttonColor?: string;
  quoteAuthor?: string;
  quoteRole?: string;
  quoteCompany?: string;
  quoteAvatar?: string;
  rating?: number;
  productPrice?: string;
  productOriginalPrice?: string;
  productBadge?: string;
  productFeatures?: string[];
  metricNumber?: string;
  metricLabel?: string;
  metricChange?: string;
  repName?: string;
  repTitle?: string;
  repAvatar?: string;
  repPhone?: string;
  repEmail?: string;
  repCalendarLink?: string;
  meetingDuration?: string;
  align?: 'left' | 'center' | 'right';
  badge?: string;
}

export interface SampleLead {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  jobTitle: string;
  industry: string;
  dealValue: string;
  senderName: string;
  senderTitle: string;
  senderCompany: string;
  calendarLink: string;
}

export interface CustomTemplate {
  id: string;
  name: string;
  category: 'Sales' | 'Marketing' | 'Customer Success' | 'Onboarding';
  badge: string;
  subject: string;
  preheader: string;
  blocks: EmailBlock[];
  updatedAt: string;
  usageCount: number;
}

export interface EmailDraft {
  id: string;
  name: string;
  subject: string;
  preheader: string;
  recipientAudience: string;
  blocks: EmailBlock[];
  updatedAt: string;
  deliverabilityScore: number;
}

export interface SentEmailRecord {
  id: string;
  subject: string;
  recipientCount: number;
  audience: string;
  sentAt: string;
  status: 'DELIVERED' | 'SENDING' | 'SCHEDULED';
  openRate: number;
  clickRate: number;
  bounceRate: number;
  blocks: EmailBlock[];
}

const SAMPLE_LEADS: SampleLead[] = [
  {
    id: 'lead_1',
    firstName: 'Sarah',
    lastName: 'Connor',
    company: 'Acme Robotics',
    jobTitle: 'VP of Operations',
    industry: 'Manufacturing & Tech',
    dealValue: '$48,000',
    senderName: 'Marcus Vance',
    senderTitle: 'Enterprise Account Director',
    senderCompany: 'Business OS',
    calendarLink: 'https://cal.com/marcus-vance/15min',
  },
  {
    id: 'lead_2',
    firstName: 'Alex',
    lastName: 'Chen',
    company: 'Stripeflow AI',
    jobTitle: 'Chief Technology Officer',
    industry: 'Financial SaaS',
    dealValue: '$72,000',
    senderName: 'Elena Rostova',
    senderTitle: 'Head of Growth Solutions',
    senderCompany: 'Business OS',
    calendarLink: 'https://cal.com/elena-rostova/strategy',
  },
  {
    id: 'lead_3',
    firstName: 'David',
    lastName: 'Kowalski',
    company: 'Apex Retail Brands',
    jobTitle: 'Head of E-Commerce',
    industry: 'Omnichannel Commerce',
    dealValue: '$34,500',
    senderName: 'Jordan Reed',
    senderTitle: 'Sales Partnerships Lead',
    senderCompany: 'Business OS',
    calendarLink: 'https://cal.com/jordan-reed/demo',
  },
];

const PRESET_BANNERS = [
  { label: 'Analytics Dashboard', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80' },
  { label: 'Team Collaboration', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80' },
  { label: 'Modern Office Work', url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop&q=80' },
  { label: 'Tech Growth & Chart', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80' },
];

const INITIAL_TEMPLATES: CustomTemplate[] = [
  {
    id: 'b2b_cold_outreach',
    name: '🎯 B2B Cold Sales Outreach',
    category: 'Sales',
    badge: '🔥 Highest Reply (34%)',
    subject: "Quick question regarding {{company}}'s workflow, {{firstName}}",
    preheader: "Noticed your team's recent expansion in {{industry}} — have a quick idea.",
    updatedAt: '2 hours ago',
    usageCount: 142,
    blocks: [
      {
        id: 'blk_sales_1',
        type: 'TEXT',
        title: 'Hi {{firstName}},',
        body: 'I noticed {{company}} is scaling operations in {{industry}} this quarter.\n\nMost VP leaders we speak with mention spending 15+ hours a week juggling disjointed spreadsheets, legacy CRM records, and billing tools. We built a unified workspace that automates 70% of those repetitive syncs.',
        align: 'left',
      },
      {
        id: 'blk_stat_1',
        type: 'METRIC_STAT',
        metricNumber: '3.4x',
        metricLabel: 'Faster Deal Velocity & Zero Manual Data Entry',
        metricChange: 'Verified across 450+ B2B enterprises',
      },
      {
        id: 'blk_sales_2',
        type: 'TEXT',
        body: 'Would you be open to a 10-minute coffee chat next Tuesday to see if this could save {{company}} 12+ hours per rep each week?',
        align: 'left',
      },
      {
        id: 'blk_meeting_1',
        type: 'MEETING_SCHEDULER',
        title: 'Schedule 10-Min Intro with {{senderName}}',
        body: 'Pick a slot on my live calendar that works best for you:',
        buttonText: '👉 Choose 10-Min Timeslot',
        buttonUrl: '{{calendarLink}}',
        meetingDuration: '10 mins • No commitment',
      },
      {
        id: 'blk_sig_1',
        type: 'SALES_SIGNATURE',
        repName: '{{senderName}}',
        repTitle: '{{senderTitle}}',
        repAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        repEmail: 'marcus.vance@businessos.io',
        repPhone: '+1 (555) 234-5678',
        repCalendarLink: '{{calendarLink}}',
        body: "P.S. If you are not the right person for {{company}}'s operational tools, who would you recommend I connect with?",
      },
      {
        id: 'blk_foot_1',
        type: 'SOCIAL_FOOTER',
      },
    ],
  },
  {
    id: 'product_announcement',
    name: '🚀 Product Launch & Feature Drop',
    category: 'Marketing',
    badge: '🌟 High Engagement',
    subject: 'Introducing Business OS 2.0: Unified Workspace for Modern Teams',
    preheader: 'Explore live telemetry, automated workflows, and instant CRM synchronization.',
    updatedAt: '1 day ago',
    usageCount: 89,
    blocks: [
      {
        id: 'blk_hdr_1',
        type: 'HEADER',
        title: 'BUSINESS OS',
        body: 'Special Product Announcement • Summer Edition',
      },
      {
        id: 'blk_banner_1',
        type: 'IMAGE_BANNER',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
        imageCaption: 'Real-time telemetry, automated pipelines, and intelligent AI copilots in one unified dashboard.',
      },
      {
        id: 'blk_txt_prod',
        type: 'TEXT',
        title: 'The Next Generation of Enterprise Software is Here',
        body: 'We are thrilled to unveil our biggest release yet. Designed specifically for fast-growing sales and operations teams, Business OS 2.0 brings together pipelines, smart automations, and deep BI analytics with zero integration headache.',
        align: 'left',
      },
      {
        id: 'blk_vid_1',
        type: 'VIDEO_PREVIEW',
        title: 'Watch 2-Minute Feature Walkthrough',
        body: 'See how modern revenue teams automate 80% of daily pipeline tasks with sub-10ms response times.',
        videoThumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
        videoUrl: 'https://youtube.com/watch?v=demo',
        badge: '▶ 2:15 Min Walkthrough',
      },
      {
        id: 'blk_cta_1',
        type: 'BUTTON_CTA',
        buttonText: 'Explore Business OS 2.0 Free for 14 Days',
        buttonUrl: 'https://businessos.io/signup',
      },
      {
        id: 'blk_quote_1',
        type: 'TESTIMONIAL',
        body: '"Business OS replaced 6 fragmented tools across our organization, cutting operational overhead by $3,800/mo while doubling outbound velocity."',
        quoteAuthor: 'Elena Rostova',
        quoteRole: 'VP of Revenue Operations',
        quoteCompany: 'Hyperion Global',
        quoteAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        rating: 5,
      },
      {
        id: 'blk_foot_2',
        type: 'SOCIAL_FOOTER',
      },
    ],
  },
  {
    id: 'promo_discount',
    name: '🏷️ Flash Sale & Limited-Time Promo',
    category: 'Marketing',
    badge: '💰 High Conversion',
    subject: 'Exclusive: 30% Off Annual Enterprise Plans for {{company}}',
    preheader: 'Lock in your discounted rate before Friday midnight.',
    updatedAt: '3 days ago',
    usageCount: 64,
    blocks: [
      {
        id: 'blk_hdr_promo',
        type: 'HEADER',
        title: 'FLASH SALE • 72 HOURS ONLY',
        body: 'VIP Upgrade Offer for {{firstName}} & the team at {{company}}',
      },
      {
        id: 'blk_prod_1',
        type: 'PRODUCT_CARD',
        title: 'Business OS Enterprise Suite',
        body: 'Full access to 21 microservices, unlimited seats, custom AI copilot models, automated invoice billing, and 24/7 dedicated support.',
        productPrice: '$69/mo',
        productOriginalPrice: '$99/mo',
        productBadge: 'SAVE 30% TODAY',
        productFeatures: [
          'Unlimited CRM & Pipeline Records',
          'AI Copilot & Document OCR Ingestion',
          'Automated Email & SMS Marketing Sequences',
          'Dedicated Customer Success Manager',
        ],
        imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&auto=format&fit=crop&q=80',
        buttonText: 'Claim 30% Discount (Use Code: FLASH30)',
        buttonUrl: 'https://businessos.io/checkout?promo=FLASH30',
      },
      {
        id: 'blk_txt_urgency',
        type: 'TEXT',
        body: '⚠️ **Note:** This special pricing tier expires this Friday at 11:59 PM EST. After that, licenses return to standard rates.',
        align: 'center',
      },
      {
        id: 'blk_foot_3',
        type: 'SOCIAL_FOOTER',
      },
    ],
  },
];

const INITIAL_DRAFTS: EmailDraft[] = [
  {
    id: 'draft_1',
    name: 'Executive SDR Follow-Up Q3',
    subject: "Following up on Tuesday's demo, {{firstName}}",
    preheader: 'Included the custom pricing sheet and ROI calculator for {{company}}.',
    recipientAudience: 'MQL Enterprise Leads (38 Contacts)',
    updatedAt: '12 mins ago',
    deliverabilityScore: 96,
    blocks: INITIAL_TEMPLATES[0].blocks,
  },
  {
    id: 'draft_2',
    name: 'End-of-Month VIP Discount Blast',
    subject: 'Last chance: 25% Off Q3 Business OS Licenses',
    preheader: 'Offer valid through midnight tomorrow.',
    recipientAudience: 'Inbound Trial Users (124 Contacts)',
    updatedAt: '1 hour ago',
    deliverabilityScore: 92,
    blocks: INITIAL_TEMPLATES[2].blocks,
  },
];

const INITIAL_SENT_BOX: SentEmailRecord[] = [
  {
    id: 'sent_1',
    subject: "Quick question regarding {{company}}'s workflow, {{firstName}}",
    recipientCount: 450,
    audience: 'Tier-1 SaaS VPs (North America)',
    sentAt: 'Today at 09:30 AM',
    status: 'DELIVERED',
    openRate: 68.4,
    clickRate: 24.1,
    bounceRate: 0.4,
    blocks: INITIAL_TEMPLATES[0].blocks,
  },
  {
    id: 'sent_2',
    subject: 'Introducing Business OS 2.0: Unified Workspace for Modern Teams',
    recipientCount: 1280,
    audience: 'All Registered Enterprise Contacts',
    sentAt: 'Yesterday at 02:15 PM',
    status: 'DELIVERED',
    openRate: 74.2,
    clickRate: 31.8,
    bounceRate: 0.1,
    blocks: INITIAL_TEMPLATES[1].blocks,
  },
];

const PALETTES = [
  { name: 'Emerald Growth', primary: '#10b981', hover: '#059669', bgLight: '#ecfdf5', textDark: '#064e3b' },
  { name: 'Royal Indigo', primary: '#6366f1', hover: '#4f46e5', bgLight: '#eef2ff', textDark: '#312e81' },
  { name: 'Sky Blue', primary: '#0ea5e9', hover: '#0284c7', bgLight: '#f0f9ff', textDark: '#0c4a6e' },
  { name: 'Violet Luxe', primary: '#8b5cf6', hover: '#7c3aed', bgLight: '#f5f3ff', textDark: '#4c1d95' },
  { name: 'Amber Sunset', primary: '#f59e0b', hover: '#d97706', bgLight: '#fffbeb', textDark: '#78350f' },
  { name: 'Rose Impact', primary: '#f43f5e', hover: '#e11d48', bgLight: '#fff1f2', textDark: '#881337' },
];

export function EmailBuilder() {
  // Main Mode Switcher
  const [mainView, setMainView] = useState<'builder' | 'templates' | 'drafts' | 'sent'>('builder');

  // Builder States
  const [subject, setSubject] = useState(INITIAL_TEMPLATES[0].subject);
  const [preheader, setPreheader] = useState(INITIAL_TEMPLATES[0].preheader);
  const [blocks, setBlocks] = useState<EmailBlock[]>(INITIAL_TEMPLATES[0].blocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(INITIAL_TEMPLATES[0].blocks[0]?.id || null);
  const [currentDraftName, setCurrentDraftName] = useState('Untitled Email Campaign');
  
  // Customization & Viewports
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedLeadId, setSelectedLeadId] = useState<string>('lead_1');
  const [activePalette, setActivePalette] = useState(PALETTES[0]);
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [activeTab, setActiveTab] = useState<'blocks' | 'templates' | 'styles' | 'ai'>('blocks');

  // Image & Video Settings Tab Mode (Upload vs Web URL)
  const [imageSourceMode, setImageSourceMode] = useState<'upload' | 'url'>('upload');
  const [videoSourceMode, setVideoSourceMode] = useState<'upload' | 'url'>('upload');

  // File Input References for local PC upload
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const productImgInputRef = useRef<HTMLInputElement>(null);
  const repAvatarInputRef = useRef<HTMLInputElement>(null);

  // Collections State
  const [templates, setTemplates] = useState<CustomTemplate[]>(INITIAL_TEMPLATES);
  const [drafts, setDrafts] = useState<EmailDraft[]>(INITIAL_DRAFTS);
  const [sentBox, setSentBox] = useState<SentEmailRecord[]>(INITIAL_SENT_BOX);

  // Filters & Search
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Notifications
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isSendTestModalOpen, setIsSendTestModalOpen] = useState(false);
  const [isSaveDraftModalOpen, setIsSaveDraftModalOpen] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('sales.team@yourcompany.com');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  // Workflow Bridge Context (when launched from / linked to an Email Marketing sequence)
  const [workflowBridgeContext, setWorkflowBridgeContext] = useState<{
    nodeId?: string;
    nodeTitle?: string;
    source?: string;
  } | null>(null);
  const [isExportBridgeModalOpen, setIsExportBridgeModalOpen] = useState(false);

  useEffect(() => {
    // Check if there is an active bridge transfer arriving from Email Marketing or Automations
    const transfer = getBridgeTransfer();
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const fromQuery = params?.get('from');
    const nodeTitleQuery = params?.get('nodeTitle');
    const nodeIdQuery = params?.get('nodeId');

    if (transfer && (transfer.source === 'automations' || transfer.source === 'email-marketing' || transfer.workflowNodeId)) {
      setWorkflowBridgeContext({
        nodeId: transfer.workflowNodeId,
        nodeTitle: transfer.workflowNodeTitle || 'Automation Step',
        source: transfer.source,
      });
      if (transfer.subject) setSubject(transfer.subject);
      if (transfer.preheader) setPreheader(transfer.preheader);
      if (transfer.blocks && transfer.blocks.length > 0) {
        setBlocks(transfer.blocks);
        setSelectedBlockId(transfer.blocks[0].id);
      } else if (transfer.sections && transfer.sections.length > 0) {
        const converted = convertSectionsToBlocks(transfer.sections);
        setBlocks(converted);
        setSelectedBlockId(converted[0]?.id || null);
      }
      showToast(`🔗 Linked to Workflow Step: "${transfer.workflowNodeTitle || 'Automation Step'}"`);
    } else if (fromQuery === 'automations' || nodeIdQuery) {
      setWorkflowBridgeContext({
        nodeId: nodeIdQuery || undefined,
        nodeTitle: nodeTitleQuery || 'Automation Step',
        source: 'automations',
      });
      showToast(`🔗 Linked to Workflow Step: "${nodeTitleQuery || 'Automation Step'}"`);
    }
  }, []);

  const handleExportToEmailMarketing = (targetTab: 'builder' | 'automations' | 'bulk-blast') => {
    const sections = convertBlocksToSections(blocks);
    setBridgeTransfer({
      source: 'visual-builder',
      targetTab,
      workflowNodeId: workflowBridgeContext?.nodeId,
      workflowNodeTitle: workflowBridgeContext?.nodeTitle,
      subject,
      preheader,
      sections,
      blocks,
      timestamp: Date.now(),
    });

    saveSharedBridgeTemplate({
      id: `tmpl_${Date.now()}`,
      name: currentDraftName || subject || 'Exported Studio Template',
      category: targetTab === 'automations' ? 'Automations' : 'Marketing',
      badge: '🎨 From Studio',
      subject,
      preheader,
      sections,
      blocks,
      updatedAt: 'Just now',
    });

    setIsExportBridgeModalOpen(false);
    showToast(`🚀 Transferring to Email Marketing (${targetTab})...`);
    window.location.href = `/email-marketing?tab=${targetTab}&source=bridge`;
  };

  const handleSaveAndReturnToWorkflow = () => {
    handleExportToEmailMarketing('automations');
  };

  const activeLead = useMemo(() => {
    return SAMPLE_LEADS.find((l) => l.id === selectedLeadId) || SAMPLE_LEADS[0];
  }, [selectedLeadId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper for reading local file from PC
  const processLocalFile = (file: File, callback: (dataUrl: string, fileName: string) => void) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      showToast('File size is too large (max 50MB).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        callback(e.target.result as string, file.name);
        showToast(`📁 Loaded "${file.name}" from PC!`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Replace personalization tags
  const renderTextWithLeadData = (rawText?: string) => {
    if (!rawText) return '';
    return rawText
      .replace(/\{\{firstName\}\}/g, activeLead.firstName)
      .replace(/\{\{lastName\}\}/g, activeLead.lastName)
      .replace(/\{\{company\}\}/g, activeLead.company)
      .replace(/\{\{jobTitle\}\}/g, activeLead.jobTitle)
      .replace(/\{\{industry\}\}/g, activeLead.industry)
      .replace(/\{\{dealValue\}\}/g, activeLead.dealValue)
      .replace(/\{\{senderName\}\}/g, activeLead.senderName)
      .replace(/\{\{senderTitle\}\}/g, activeLead.senderTitle)
      .replace(/\{\{senderCompany\}\}/g, activeLead.senderCompany)
      .replace(/\{\{calendarLink\}\}/g, activeLead.calendarLink);
  };

  // Block Actions
  const handleAddBlock = (type: EmailBlockType) => {
    const newId = `blk_${Date.now()}`;
    let newBlock: EmailBlock = { id: newId, type };

    switch (type) {
      case 'HEADER':
        newBlock = {
          id: newId,
          type: 'HEADER',
          title: 'BUSINESS OS',
          body: 'Executive Update & Insights',
        };
        break;
      case 'TEXT':
        newBlock = {
          id: newId,
          type: 'TEXT',
          title: 'Hi {{firstName}},',
          body: "Here is a quick update regarding your team's growth strategy at {{company}}.\n\nLet me know if you would like to discuss next steps.",
          align: 'left',
        };
        break;
      case 'IMAGE_BANNER':
        newBlock = {
          id: newId,
          type: 'IMAGE_BANNER',
          imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
          imageCaption: 'Real-time telemetry and unified operations dashboard in action.',
          imageFileName: 'dashboard_telemetry.png',
        };
        break;
      case 'BUTTON_CTA':
        newBlock = {
          id: newId,
          type: 'BUTTON_CTA',
          buttonText: 'Schedule Quick 10-Min Demo',
          buttonUrl: '{{calendarLink}}',
        };
        break;
      case 'PRODUCT_CARD':
        newBlock = {
          id: newId,
          type: 'PRODUCT_CARD',
          title: 'Special Offer / Product Spotlight',
          body: 'Unlock unlimited CRM access, automated sequences, and intelligent sales battlecards for your entire team.',
          productPrice: '$79/mo',
          productOriginalPrice: '$120/mo',
          productBadge: 'LIMITED TIME DEAL',
          imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80',
          buttonText: 'Claim Your Special Offer',
          buttonUrl: 'https://businessos.io/offers',
        };
        break;
      case 'TESTIMONIAL':
        newBlock = {
          id: newId,
          type: 'TESTIMONIAL',
          body: '"Switching to this workflow cut our manual data entry time by 80% and boosted our outbound pipeline dramatically in the first month."',
          quoteAuthor: 'Elena Rostova',
          quoteRole: 'VP of Operations',
          quoteCompany: 'Hyperion Global',
          quoteAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          rating: 5,
        };
        break;
      case 'METRIC_STAT':
        newBlock = {
          id: newId,
          type: 'METRIC_STAT',
          metricNumber: '3.8x',
          metricLabel: 'Increase in Qualified Reply Rates',
          metricChange: 'Verified across 1,200+ marketing and sales campaigns',
        };
        break;
      case 'MEETING_SCHEDULER':
        newBlock = {
          id: newId,
          type: 'MEETING_SCHEDULER',
          title: 'Book a 15-Minute Intro Call',
          body: 'Directly reserve time on my schedule for a tailored walkthrough:',
          buttonText: '👉 View Available Timeslots',
          buttonUrl: '{{calendarLink}}',
          meetingDuration: '15 mins • Live Screen Share',
        };
        break;
      case 'VIDEO_PREVIEW':
        newBlock = {
          id: newId,
          type: 'VIDEO_PREVIEW',
          title: 'Watch 2-Minute Product Demo',
          body: 'See how marketing and sales teams build fast pipelines without complex setup.',
          videoThumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
          videoUrl: 'https://youtube.com/watch?v=demo',
          videoFileName: 'product_walkthrough_demo.mp4',
          badge: '▶ 2:00 Min Demo',
        };
        break;
      case 'SALES_SIGNATURE':
        newBlock = {
          id: newId,
          type: 'SALES_SIGNATURE',
          repName: '{{senderName}}',
          repTitle: '{{senderTitle}}',
          repAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          repEmail: 'sales@businessos.io',
          repPhone: '+1 (555) 019-2834',
          repCalendarLink: '{{calendarLink}}',
          body: 'Have any questions? Reply directly to this email.',
        };
        break;
      case 'DIVIDER':
        newBlock = { id: newId, type: 'DIVIDER' };
        break;
      case 'SOCIAL_FOOTER':
        newBlock = { id: newId, type: 'SOCIAL_FOOTER' };
        break;
    }

    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newId);
    showToast(`Added ${type.replace('_', ' ')} block!`);
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIdx];
    newBlocks[targetIdx] = temp;
    setBlocks(newBlocks);
  };

  const handleDuplicateBlock = (block: EmailBlock, index: number) => {
    const newBlock = { ...block, id: `blk_${Date.now()}` };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
    setSelectedBlockId(newBlock.id);
    showToast('Block duplicated!');
  };

  const handleDeleteBlock = (id: string) => {
    if (blocks.length <= 1) {
      showToast('You must keep at least one block in your email.');
      return;
    }
    const filtered = blocks.filter((b) => b.id !== id);
    setBlocks(filtered);
    setSelectedBlockId(filtered[0]?.id || null);
    showToast('Block removed');
  };

  const handleUpdateBlock = (id: string, updates: Partial<EmailBlock>) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  // Load Template / Draft into Builder
  const handleLoadTemplate = (template: CustomTemplate) => {
    setSubject(template.subject);
    setPreheader(template.preheader);
    setBlocks(template.blocks);
    setCurrentDraftName(template.name);
    setSelectedBlockId(template.blocks[0]?.id || null);
    setMainView('builder');
    showToast(`Loaded template: "${template.name}" into builder!`);
  };

  const handleLoadDraft = (draft: EmailDraft) => {
    setSubject(draft.subject);
    setPreheader(draft.preheader);
    setBlocks(draft.blocks);
    setCurrentDraftName(draft.name);
    setSelectedBlockId(draft.blocks[0]?.id || null);
    setMainView('builder');
    showToast(`Resumed draft: "${draft.name}"!`);
  };

  // Save Current as Draft
  const handleSaveDraft = () => {
    const newDraft: EmailDraft = {
      id: `draft_${Date.now()}`,
      name: currentDraftName || 'Untitled Draft Campaign',
      subject: subject || 'Untitled Subject',
      preheader: preheader || '',
      recipientAudience: 'Selected CRM Leads',
      blocks,
      updatedAt: 'Just now',
      deliverabilityScore: deliverabilityAudit.score,
    };
    setDrafts([newDraft, ...drafts]);
    setIsSaveDraftModalOpen(false);
    showToast('Draft successfully saved to Drafts Box!');
  };

  // Save Current as Template
  const handleSaveAsTemplate = () => {
    const newTmpl: CustomTemplate = {
      id: `tmpl_${Date.now()}`,
      name: currentDraftName || 'Custom Saved Template',
      category: 'Sales',
      badge: '✨ Custom Saved',
      subject,
      preheader,
      blocks,
      updatedAt: 'Just now',
      usageCount: 1,
    };
    setTemplates([newTmpl, ...templates]);
    showToast('Saved as new reusable Template!');
  };

  // Deliverability and Spam Score calculation
  const deliverabilityAudit = useMemo(() => {
    let score = 98;
    const alerts: string[] = [];
    const lowerSub = subject.toLowerCase();

    if (!subject.trim()) {
      score -= 30;
      alerts.push('Missing subject line');
    }
    if (lowerSub.includes('free') || lowerSub.includes('$$$') || lowerSub.includes('guarantee') || lowerSub.includes('100%')) {
      score -= 8;
      alerts.push('Subject contains potential spam trigger words');
    }
    if (subject.length > 65) {
      score -= 5;
      alerts.push('Subject exceeds recommended length (65 chars)');
    }
    if (!blocks.some((b) => b.type === 'SOCIAL_FOOTER')) {
      score -= 10;
      alerts.push('Missing CAN-SPAM unsubscribe footer');
    }

    return {
      score: Math.max(score, 10),
      status: score >= 90 ? 'Excellent' : score >= 75 ? 'Good' : 'Needs Polish',
      color: score >= 90 ? 'text-emerald-500' : score >= 75 ? 'text-amber-500' : 'text-rose-500',
      alerts,
    };
  }, [subject, blocks]);

  // Generate responsive HTML string for export/clipboard
  const generateExportHtml = () => {
    const renderedSubject = renderTextWithLeadData(subject);
    const renderedPreheader = renderTextWithLeadData(preheader);

    const blockHtmlItems = blocks.map((b) => {
      switch (b.type) {
        case 'HEADER':
          return `
            <tr>
              <td style="padding: 24px 32px 12px 32px; text-align: center; border-bottom: 1px solid #f1f5f9;">
                <div style="font-size: 14px; font-weight: 800; letter-spacing: 0.1em; color: ${activePalette.primary}; text-transform: uppercase;">
                  ${renderTextWithLeadData(b.title)}
                </div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
                  ${renderRichEmailContent(renderTextWithLeadData(b.body))}
                </div>
              </td>
            </tr>`;
        case 'TEXT':
          return `
            <tr>
              <td style="padding: 24px 32px; font-family: sans-serif; color: #1e293b; line-height: 1.6; text-align: ${b.align || 'left'};">
                ${b.title ? `<h2 style="font-size: 18px; font-weight: 700; margin: 0 0 12px 0; color: #0f172a;">${renderTextWithLeadData(b.title)}</h2>` : ''}
                <div style="font-size: 15px; color: #334155; line-height: 1.6;">
                  ${renderRichEmailContent(renderTextWithLeadData(b.body))}
                </div>
              </td>
            </tr>`;
        case 'IMAGE_BANNER':
          return `
            <tr>
              <td style="padding: 16px 32px; text-align: center;">
                <img src="${b.imageUrl}" alt="Email Banner" style="width: 100%; max-width: 540px; height: auto; border-radius: 12px; display: block; margin: 0 auto;" />
                ${b.imageCaption ? `<div style="font-size: 12px; color: #64748b; margin-top: 8px; font-style: italic;">${renderTextWithLeadData(b.imageCaption)}</div>` : ''}
              </td>
            </tr>`;
        case 'BUTTON_CTA':
          return `
            <tr>
              <td style="padding: 20px 32px; text-align: center;">
                <table align="center" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="border-radius: 8px; background-color: ${activePalette.primary};">
                      <a href="${renderTextWithLeadData(b.buttonUrl || '#')}" target="_blank" style="font-size: 15px; font-family: sans-serif; font-weight: bold; color: #ffffff; text-decoration: none; display: inline-block; padding: 14px 28px; border-radius: 8px;">
                        ${renderTextWithLeadData(b.buttonText || 'Click Here')}
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`;
        case 'METRIC_STAT':
          return `
            <tr>
              <td style="padding: 16px 32px;">
                <div style="background-color: ${activePalette.bgLight}; border: 1px solid ${activePalette.primary}33; border-radius: 12px; padding: 20px; text-align: center;">
                  <div style="font-size: 32px; font-weight: 800; color: ${activePalette.primary}; margin-bottom: 4px;">
                    ${renderTextWithLeadData(b.metricNumber)}
                  </div>
                  <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
                    ${renderTextWithLeadData(b.metricLabel)}
                  </div>
                  <div style="font-size: 12px; color: #64748b;">
                    ${renderTextWithLeadData(b.metricChange)}
                  </div>
                </div>
              </td>
            </tr>`;
        case 'TESTIMONIAL':
          return `
            <tr>
              <td style="padding: 16px 32px;">
                <div style="background-color: #f8fafc; border-left: 4px solid ${activePalette.primary}; border-radius: 0 12px 12px 0; padding: 18px 22px;">
                  <div style="font-size: 14px; font-style: italic; color: #334155; line-height: 1.5; margin-bottom: 12px;">
                    ${renderRichEmailContent(renderTextWithLeadData(b.body))}
                  </div>
                  <div style="font-size: 13px; font-weight: bold; color: #0f172a;">
                    ${renderTextWithLeadData(b.quoteAuthor)} • <span style="font-weight: normal; color: #64748b;">${renderTextWithLeadData(b.quoteRole)}, ${renderTextWithLeadData(b.quoteCompany)}</span>
                  </div>
                </div>
              </td>
            </tr>`;
        case 'PRODUCT_CARD':
          return `
            <tr>
              <td style="padding: 16px 32px;">
                <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
                  ${b.imageUrl ? `<img src="${b.imageUrl}" style="width: 100%; height: 180px; object-fit: cover; display: block;" />` : ''}
                  <div style="padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <h3 style="font-size: 16px; font-weight: bold; margin: 0; color: #0f172a;">${renderTextWithLeadData(b.title)}</h3>
                      <span style="background: ${activePalette.primary}; color: #ffffff; font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 6px;">${b.productBadge || 'OFFER'}</span>
                    </div>
                    <div style="font-size: 13px; color: #475569; margin: 0 0 16px 0; line-height: 1.5;">${renderRichEmailContent(renderTextWithLeadData(b.body))}</div>
                    <div style="text-align: center;">
                      <a href="${renderTextWithLeadData(b.buttonUrl || '#')}" style="display: inline-block; background: ${activePalette.primary}; color: #fff; font-size: 14px; font-weight: bold; padding: 10px 20px; border-radius: 6px; text-decoration: none;">
                        ${renderTextWithLeadData(b.buttonText || 'Learn More')} — ${b.productPrice}
                      </a>
                    </div>
                  </div>
                </div>
              </td>
            </tr>`;
        case 'MEETING_SCHEDULER':
          return `
            <tr>
              <td style="padding: 16px 32px;">
                <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; background-color: #f8fafc; text-align: center;">
                  <h3 style="font-size: 15px; font-weight: bold; margin: 0 0 6px 0; color: #0f172a;">${renderTextWithLeadData(b.title)}</h3>
                  <div style="font-size: 13px; color: #64748b; margin: 0 0 14px 0;">${renderRichEmailContent(renderTextWithLeadData(b.body))}</div>
                  <a href="${renderTextWithLeadData(b.buttonUrl || '#')}" style="display: inline-block; background-color: ${activePalette.primary}; color: #ffffff; font-size: 14px; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
                    ${renderTextWithLeadData(b.buttonText || 'Pick a Timeslot')}
                  </a>
                  <div style="font-size: 11px; color: #94a3b8; margin-top: 8px;">${b.meetingDuration || '15 mins'}</div>
                </div>
              </td>
            </tr>`;
        case 'VIDEO_PREVIEW':
          return `
            <tr>
              <td style="padding: 16px 32px; text-align: center;">
                <a href="${b.videoUrl || '#'}" target="_blank" style="text-decoration: none; display: block; position: relative;">
                  <img src="${b.videoThumbnail}" style="width: 100%; max-width: 540px; border-radius: 12px; display: block; margin: 0 auto;" />
                  <div style="font-size: 14px; font-weight: bold; color: #0f172a; margin-top: 10px;">${renderTextWithLeadData(b.title)}</div>
                </a>
              </td>
            </tr>`;
        case 'SALES_SIGNATURE':
          return `
            <tr>
              <td style="padding: 24px 32px; border-top: 1px solid #f1f5f9;">
                <table border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    ${b.repAvatar ? `<td style="vertical-align: top; padding-right: 16px;"><img src="${b.repAvatar}" style="width: 48px; height: 48px; border-radius: 24px; display: block;" /></td>` : ''}
                    <td style="vertical-align: top; font-family: sans-serif;">
                      <div style="font-size: 14px; font-weight: bold; color: #0f172a;">${renderTextWithLeadData(b.repName)}</div>
                      <div style="font-size: 12px; color: #64748b; margin-top: 2px;">${renderTextWithLeadData(b.repTitle)}</div>
                      <div style="font-size: 12px; color: ${activePalette.primary}; margin-top: 4px;">
                        ${b.repEmail ? renderTextWithLeadData(b.repEmail) : ''} ${b.repPhone ? `• ${b.repPhone}` : ''}
                      </div>
                    </td>
                  </tr>
                </table>
                ${b.body ? `<div style="font-size: 12px; color: #64748b; margin-top: 12px; font-style: italic;">${renderTextWithLeadData(b.body)}</div>` : ''}
              </td>
            </tr>`;
        case 'DIVIDER':
          return `
            <tr>
              <td style="padding: 12px 32px;">
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 0;" />
              </td>
            </tr>`;
        case 'SOCIAL_FOOTER':
          return `
            <tr>
              <td style="padding: 24px 32px; background-color: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0; font-family: sans-serif; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                <div style="margin-bottom: 8px;">
                  Sent with <strong>Business OS</strong> • 100 Enterprise Way, Suite 400, San Francisco, CA 94105
                </div>
                <div>
                  You are receiving this email because you are a registered contact of {{company}}.<br />
                  <a href="https://businessos.io/unsubscribe" style="color: #64748b; text-decoration: underline;">Unsubscribe</a> • <a href="https://businessos.io/preferences" style="color: #64748b; text-decoration: underline;">Manage Email Preferences</a>
                </div>
              </td>
            </tr>`;
        default:
          return '';
      }
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${renderedSubject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    table { border-collapse: collapse; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f1f5f9;">
  <div style="display: none; max-height: 0px; overflow: hidden;">
    ${renderedPreheader}
  </div>

  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
    ${blockHtmlItems}
  </table>
</body>
</html>`;
  };

  const handleCopyHtml = () => {
    const html = generateExportHtml();
    navigator.clipboard.writeText(html);
    showToast('Clean HTML copied to clipboard!');
  };

  // AI Assistant simulation
  const handleAiAction = (actionType: string) => {
    setAiGenerating(true);
    setTimeout(() => {
      setAiGenerating(false);
      if (actionType === 'subject') {
        setSubject(`Quick insight on {{company}}'s outbound velocity, {{firstName}}`);
        setPreheader('Found 3 quick optimizations for your operational pipeline.');
        showToast('AI updated Subject & Preheader!');
      } else if (actionType === 'punchy') {
        const textBlock = blocks.find((b) => b.type === 'TEXT');
        if (textBlock) {
          handleUpdateBlock(textBlock.id, {
            body: "{{firstName}} — saw {{company}}'s rapid growth in {{industry}}.\n\nMost teams lose 15+ hours/week to fragmented tools. Business OS unifies your CRM, billing, and outreach so you can close deals 3x faster.\n\nWorth a 5-min intro this Thursday?",
          });
          showToast('Refined copy for maximum sales reply rate!');
        }
      } else if (actionType === 'promo') {
        setSubject(`⚡ 48-Hour Priority Access for {{firstName}} @ {{company}}`);
        showToast('Generated urgency-focused subject line!');
      }
      setIsAiModalOpen(false);
    }, 700);
  };

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchCat = templateCategoryFilter === 'ALL' || t.category.toUpperCase() === templateCategoryFilter;
      const matchSearch =
        !searchQuery ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [templates, templateCategoryFilter, searchQuery]);

  const selectedBlock = useMemo(() => {
    return blocks.find((b) => b.id === selectedBlockId) || null;
  }, [blocks, selectedBlockId]);

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 antialiased overflow-hidden select-none font-sans">
      {/* Hidden File Inputs for PC File Upload */}
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && selectedBlock) {
            processLocalFile(file, (dataUrl, fileName) => {
              handleUpdateBlock(selectedBlock.id, {
                imageUrl: dataUrl,
                imageFileName: fileName,
              });
            });
          }
        }}
      />
      <input
        type="file"
        ref={videoInputRef}
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && selectedBlock) {
            processLocalFile(file, (dataUrl, fileName) => {
              handleUpdateBlock(selectedBlock.id, {
                videoUrl: dataUrl,
                videoFileName: fileName,
                title: fileName.replace(/\.[^/.]+$/, ''),
              });
            });
          }
        }}
      />
      <input
        type="file"
        ref={thumbnailInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && selectedBlock) {
            processLocalFile(file, (dataUrl, fileName) => {
              handleUpdateBlock(selectedBlock.id, {
                videoThumbnail: dataUrl,
                thumbnailFileName: fileName,
              });
            });
          }
        }}
      />
      <input
        type="file"
        ref={productImgInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && selectedBlock) {
            processLocalFile(file, (dataUrl) => {
              handleUpdateBlock(selectedBlock.id, {
                imageUrl: dataUrl,
              });
            });
          }
        }}
      />
      <input
        type="file"
        ref={repAvatarInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && selectedBlock) {
            processLocalFile(file, (dataUrl) => {
              handleUpdateBlock(selectedBlock.id, {
                repAvatar: dataUrl,
              });
            });
          }
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar with Main Suite Navigation */}
      <header className="h-16 px-6 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl text-emerald-400">
            <Mail size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-bold text-white text-base tracking-tight">Email Studio & Marketing Suite</h1>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-md border border-emerald-500/20">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400">Design, organize templates, drafts, and track sent campaigns</p>
          </div>
        </div>

        {/* Mode Selector Tabs (Visual Builder / Templates / Drafts / Sent Box) */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-2xl p-1 shadow-inner">
          <button
            onClick={() => setMainView('builder')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mainView === 'builder'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles size={14} />
            <span>Visual Builder</span>
          </button>

          <button
            onClick={() => setMainView('templates')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mainView === 'templates'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FolderOpen size={14} />
            <span>Templates ({templates.length})</span>
          </button>

          <button
            onClick={() => setMainView('drafts')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mainView === 'drafts'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileEdit size={14} />
            <span>Drafts ({drafts.length})</span>
          </button>

          <button
            onClick={() => setMainView('sent')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mainView === 'sent'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <SendHorizontal size={14} />
            <span>Sent Box ({sentBox.length})</span>
          </button>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5">
          {mainView === 'builder' && (
            <>
              <button
                onClick={() => setIsSaveDraftModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <FileEdit size={14} />
                <span>Save Draft</span>
              </button>

              <button
                onClick={handleSaveAsTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <Tag size={14} />
                <span>Save As Template</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExportBridgeModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                title="Bridge this email template directly into Email Marketing, Automations, or Bulk Blast"
              >
                <GitBranch size={14} className="text-emerald-400" />
                <span>Send to Email Marketing</span>
              </button>

              <button
                onClick={() => setIsSendTestModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Send size={14} />
                <span>Send / Broadcast</span>
              </button>
            </>
          )}

          {mainView !== 'builder' && (
            <button
              onClick={() => setMainView('builder')}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Plus size={14} />
              <span>Open Visual Builder</span>
            </button>
          )}
        </div>
      </header>

      {/* Workflow Bridge Banner (if linked to an active workflow step) */}
      {workflowBridgeContext && (
        <div className="px-6 py-2.5 bg-gradient-to-r from-emerald-950/90 via-teal-950/80 to-slate-900 border-b border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shrink-0 shadow-lg">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
              Live Automation Bridge
            </span>
            <span className="text-slate-300">
              Designing template for workflow step: <strong className="text-white">&ldquo;{workflowBridgeContext.nodeTitle}&rdquo;</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSaveAndReturnToWorkflow}
              className="flex-1 sm:flex-none px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/25 cursor-pointer"
            >
              <CheckCircle2 size={13} />
              <span>Save & Return to Automation Workflow</span>
            </button>
            <button
              type="button"
              onClick={() => {
                clearBridgeTransfer();
                setWorkflowBridgeContext(null);
                showToast('Detached from workflow context.');
              }}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl text-xs cursor-pointer border border-white/10"
              title="Detach from workflow context"
            >
              Detach
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🚀 VIEW 1: VISUAL BUILDER */}
      {/* ========================================================================= */}
      {mainView === 'builder' && (
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT PANEL: Blocks, Starter Templates & Themes */}
          <aside className="w-80 bg-slate-950/70 border-r border-slate-800 flex flex-col shrink-0 overflow-hidden">
            {/* Tab Navigation */}
            <div className="grid grid-cols-4 p-2 bg-slate-900/90 border-b border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('blocks')}
                className={`py-2 text-center font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'blocks'
                    ? 'bg-slate-800 text-emerald-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Blocks
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`py-2 text-center font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'templates'
                    ? 'bg-slate-800 text-emerald-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Library
              </button>
              <button
                onClick={() => setActiveTab('styles')}
                className={`py-2 text-center font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'styles'
                    ? 'bg-slate-800 text-emerald-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Theme
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`py-2 text-center font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'ai'
                    ? 'bg-slate-800 text-purple-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                AI Boost
              </button>
            </div>

            {/* Tab 1: Blocks Library */}
            {activeTab === 'blocks' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                    Media & Visual Content
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAddBlock('IMAGE_BANNER')}
                      className="flex flex-col items-center justify-center p-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-center transition-all group cursor-pointer"
                    >
                      <ImageIcon size={18} className="text-slate-400 group-hover:text-emerald-400 mb-1.5 transition-colors" />
                      <span className="text-xs font-semibold text-slate-300 group-hover:text-white">Image Banner</span>
                      <span className="text-[10px] text-emerald-400 mt-0.5">PC Upload</span>
                    </button>

                    <button
                      onClick={() => handleAddBlock('VIDEO_PREVIEW')}
                      className="flex flex-col items-center justify-center p-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-center transition-all group cursor-pointer"
                    >
                      <Video size={18} className="text-slate-400 group-hover:text-emerald-400 mb-1.5 transition-colors" />
                      <span className="text-xs font-semibold text-slate-300 group-hover:text-white">Video Embed</span>
                      <span className="text-[10px] text-emerald-400 mt-0.5">PC Upload</span>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                    Sales Outreach Blocks
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAddBlock('TEXT')}
                      className="flex flex-col items-center justify-center p-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-center transition-all group cursor-pointer"
                    >
                      <FileText size={18} className="text-slate-400 group-hover:text-emerald-400 mb-1.5 transition-colors" />
                      <span className="text-xs font-semibold text-slate-300 group-hover:text-white">Headline / Text</span>
                    </button>

                    <button
                      onClick={() => handleAddBlock('MEETING_SCHEDULER')}
                      className="flex flex-col items-center justify-center p-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-center transition-all group cursor-pointer"
                    >
                      <Calendar size={18} className="text-slate-400 group-hover:text-emerald-400 mb-1.5 transition-colors" />
                      <span className="text-xs font-semibold text-slate-300 group-hover:text-white">Meeting Booker</span>
                    </button>

                    <button
                      onClick={() => handleAddBlock('METRIC_STAT')}
                      className="flex flex-col items-center justify-center p-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-center transition-all group cursor-pointer"
                    >
                      <TrendingUp size={18} className="text-slate-400 group-hover:text-emerald-400 mb-1.5 transition-colors" />
                      <span className="text-xs font-semibold text-slate-300 group-hover:text-white">Key Metric Stat</span>
                    </button>

                    <button
                      onClick={() => handleAddBlock('SALES_SIGNATURE')}
                      className="flex flex-col items-center justify-center p-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-center transition-all group cursor-pointer"
                    >
                      <UserCheck size={18} className="text-slate-400 group-hover:text-emerald-400 mb-1.5 transition-colors" />
                      <span className="text-xs font-semibold text-slate-300 group-hover:text-white">Rep Signature</span>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                    Marketing & Conversion
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAddBlock('BUTTON_CTA')}
                      className="flex flex-col items-center justify-center p-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-center transition-all group cursor-pointer"
                    >
                      <MousePointerClick size={18} className="text-slate-400 group-hover:text-emerald-400 mb-1.5 transition-colors" />
                      <span className="text-xs font-semibold text-slate-300 group-hover:text-white">Action CTA Button</span>
                    </button>

                    <button
                      onClick={() => handleAddBlock('PRODUCT_CARD')}
                      className="flex flex-col items-center justify-center p-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-center transition-all group cursor-pointer"
                    >
                      <ShoppingBag size={18} className="text-slate-400 group-hover:text-emerald-400 mb-1.5 transition-colors" />
                      <span className="text-xs font-semibold text-slate-300 group-hover:text-white">Product / Deal</span>
                    </button>

                    <button
                      onClick={() => handleAddBlock('TESTIMONIAL')}
                      className="flex flex-col items-center justify-center p-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-center transition-all group cursor-pointer"
                    >
                      <Quote size={18} className="text-slate-400 group-hover:text-emerald-400 mb-1.5 transition-colors" />
                      <span className="text-xs font-semibold text-slate-300 group-hover:text-white">Customer Quote</span>
                    </button>

                    <button
                      onClick={() => handleAddBlock('HEADER')}
                      className="flex flex-col items-center justify-center p-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-center transition-all group cursor-pointer"
                    >
                      <Tag size={18} className="text-slate-400 group-hover:text-emerald-400 mb-1.5 transition-colors" />
                      <span className="text-xs font-semibold text-slate-300 group-hover:text-white">Logo Header</span>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                    Layout & Compliance
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAddBlock('DIVIDER')}
                      className="flex flex-col items-center justify-center p-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-center transition-all group cursor-pointer"
                    >
                      <Minus size={18} className="text-slate-400 group-hover:text-emerald-400 mb-1.5 transition-colors" />
                      <span className="text-xs font-semibold text-slate-300 group-hover:text-white">Divider</span>
                    </button>

                    <button
                      onClick={() => handleAddBlock('SOCIAL_FOOTER')}
                      className="flex flex-col items-center justify-center p-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-center transition-all group cursor-pointer"
                    >
                      <ShieldCheck size={18} className="text-slate-400 group-hover:text-emerald-400 mb-1.5 transition-colors" />
                      <span className="text-xs font-semibold text-slate-300 group-hover:text-white">Legal Footer</span>
                    </button>
                  </div>
                </div>

                {/* Quick Merge Tags Reference */}
                <div className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-300">💡 1-Click Merge Tags</span>
                    <span className="text-[10px] text-slate-500">Auto-filled</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['{{firstName}}', '{{company}}', '{{jobTitle}}', '{{industry}}', '{{senderName}}', '{{calendarLink}}'].map(
                      (tag) => (
                        <button
                          key={tag}
                          onClick={() => {
                            navigator.clipboard.writeText(tag);
                            showToast(`Copied ${tag} tag!`);
                          }}
                          className="px-2 py-1 bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-300 text-[11px] font-mono rounded-lg border border-slate-700/60 transition-colors cursor-pointer"
                        >
                          {tag}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Templates Quick Loader */}
            {activeTab === 'templates' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="text-xs text-slate-400 mb-2">
                  Click any template to instantly load it into the builder:
                </div>
                {templates.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => handleLoadTemplate(tmpl)}
                    className="p-3.5 rounded-2xl border bg-slate-900/60 border-slate-800 hover:border-emerald-500 hover:bg-slate-900 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                        {tmpl.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full font-semibold">
                        {tmpl.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{tmpl.subject}</p>
                    <div className="mt-2.5 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-400 font-semibold">{tmpl.badge}</span>
                      <span className="text-slate-400 font-medium flex items-center gap-1 group-hover:text-emerald-400">
                        Load <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Style & Theme Customizer */}
            {activeTab === 'styles' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2.5">Primary Brand Accent</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PALETTES.map((p) => (
                      <button
                        key={p.name}
                        onClick={() => {
                          setActivePalette(p);
                          showToast(`Theme changed to ${p.name}`);
                        }}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          activePalette.name === p.name
                            ? 'bg-slate-800 border-emerald-500'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: p.primary }} />
                        <span className="text-[11px] font-semibold text-slate-200 truncate">{p.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2.5">Typography Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'sans', label: 'Clean Sans' },
                      { id: 'serif', label: 'Classic Serif' },
                      { id: 'mono', label: 'Modern Tech' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setFontFamily(f.id as any)}
                        className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                          fontFamily === f.id
                            ? 'bg-slate-800 border-emerald-500 text-emerald-400'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Deliverability & Spam Score Card */}
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={16} className={deliverabilityAudit.color} />
                      <span className="text-xs font-bold text-white">Deliverability Score</span>
                    </div>
                    <span className={`text-xs font-extrabold ${deliverabilityAudit.color}`}>
                      {deliverabilityAudit.score}/100
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-3">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${deliverabilityAudit.score}%` }}
                    />
                  </div>
                  {deliverabilityAudit.alerts.length > 0 ? (
                    <div className="space-y-1">
                      {deliverabilityAudit.alerts.map((alt, idx) => (
                        <div key={idx} className="text-[11px] text-amber-400 flex items-center gap-1">
                          <AlertCircle size={11} className="shrink-0" />
                          <span>{alt}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={11} />
                      <span>Clean subject & compliant footer detected. Ready to send!</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 4: AI Copywriter Boost */}
            {activeTab === 'ai' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="p-3.5 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-2xl">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-xs mb-1">
                    <Sparkles size={14} className="text-purple-400" />
                    <span>AI Email Optimizer</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Enhance response rates and polish your pitch with pre-tuned marketing & sales prompts.
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handleAiAction('punchy')}
                    disabled={aiGenerating}
                    className="w-full p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 rounded-xl text-left transition-all group cursor-pointer"
                  >
                    <div className="text-xs font-bold text-white group-hover:text-purple-300 flex items-center justify-between">
                      <span>⚡ Make It Punchy & Concise</span>
                      <ArrowRight size={13} className="text-slate-500 group-hover:text-purple-400" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Shortens sentences and removes fluff to boost replies.</p>
                  </button>

                  <button
                    onClick={() => handleAiAction('subject')}
                    disabled={aiGenerating}
                    className="w-full p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 rounded-xl text-left transition-all group cursor-pointer"
                  >
                    <div className="text-xs font-bold text-white group-hover:text-purple-300 flex items-center justify-between">
                      <span>🎯 Optimize Subject Line</span>
                      <ArrowRight size={13} className="text-slate-500 group-hover:text-purple-400" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Generates curiosity-driven B2B subject formulas.</p>
                  </button>

                  <button
                    onClick={() => handleAiAction('promo')}
                    disabled={aiGenerating}
                    className="w-full p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 rounded-xl text-left transition-all group cursor-pointer"
                  >
                    <div className="text-xs font-bold text-white group-hover:text-purple-300 flex items-center justify-between">
                      <span>🔥 Add Scarcity & FOMO</span>
                      <ArrowRight size={13} className="text-slate-500 group-hover:text-purple-400" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Adds urgency cues for flash sales and limited offers.</p>
                  </button>
                </div>
              </div>
            )}
          </aside>

          {/* CENTER PANEL: Live Interactive Canvas */}
          <main className="flex-1 bg-slate-900/50 overflow-y-auto p-6 flex flex-col items-center justify-start">
            {/* Viewport and Lead Switcher Toolbar */}
            <div className="w-full max-w-[620px] mb-4 flex items-center justify-between">
              {/* Device Mode */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
                <button
                  onClick={() => setViewport('desktop')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    viewport === 'desktop' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Monitor size={13} />
                  <span>Desktop</span>
                </button>
                <button
                  onClick={() => setViewport('mobile')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    viewport === 'mobile' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone size={13} />
                  <span>Mobile</span>
                </button>
              </div>

              {/* Lead Personalization Switcher */}
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
                <User size={13} className="text-emerald-400" />
                <span className="text-[11px] text-slate-400 font-medium">Test As:</span>
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="bg-transparent text-xs text-white font-semibold outline-none cursor-pointer border-none p-0 pr-2"
                >
                  {SAMPLE_LEADS.map((l) => (
                    <option key={l.id} value={l.id} className="bg-slate-900 text-white">
                      {l.firstName} {l.lastName} ({l.company})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Copy HTML */}
              <button
                onClick={handleCopyHtml}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-medium cursor-pointer"
              >
                <Code size={13} />
                <span>HTML</span>
              </button>
            </div>

            {/* Email Canvas Frame */}
            <div
              className={`w-full transition-all duration-300 ${
                viewport === 'mobile' ? 'max-w-[390px]' : 'max-w-[620px]'
              }`}
            >
              {/* Subject Line & Preheader Inputs */}
              <div className="bg-slate-950 border border-slate-800 rounded-t-3xl p-4 space-y-2.5 shadow-xl">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-emerald-400 w-16 shrink-0">Subject:</span>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter email subject line..."
                    className="flex-1 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none font-medium transition-colors"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-16 shrink-0">Preheader:</span>
                  <input
                    type="text"
                    value={preheader}
                    onChange={(e) => setPreheader(e.target.value)}
                    placeholder="Preview text shown in inbox snippet..."
                    className="flex-1 bg-slate-900 border border-slate-800 focus:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none font-normal transition-colors"
                  />
                </div>
              </div>

              {/* Email Body Canvas */}
              <div className="bg-white text-slate-900 rounded-b-3xl shadow-2xl border-x border-b border-slate-800 overflow-hidden min-h-[500px] flex flex-col">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between text-[11px] text-slate-500 font-sans">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="ml-2 font-semibold text-slate-700">
                      To: {activeLead.firstName} {activeLead.lastName} &lt;{activeLead.firstName.toLowerCase()}@{activeLead.company.toLowerCase().replace(/\s+/g, '')}.com&gt;
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Live Render</span>
                </div>

                {/* Blocks Container */}
                <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4">
                  {blocks.map((block, index) => {
                    const isSelected = selectedBlockId === block.id;

                    return (
                      <div
                        key={block.id}
                        onClick={() => setSelectedBlockId(block.id)}
                        className={`relative group rounded-2xl transition-all cursor-pointer ${
                          isSelected
                            ? 'ring-2 ring-emerald-500 bg-emerald-500/[0.02] shadow-xs'
                            : 'hover:ring-1 hover:ring-slate-300'
                        }`}
                      >
                        {/* Hover Action Toolbar */}
                        <div
                          className={`absolute -top-3.5 right-3 z-30 flex items-center gap-1 px-2 py-1 bg-slate-900 text-white rounded-lg shadow-lg text-[10px] transition-opacity ${
                            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                            {block.type.replace('_', ' ')}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveBlock(index, 'up');
                            }}
                            disabled={index === 0}
                            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                            title="Move Up"
                          >
                            <MoveUp size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveBlock(index, 'down');
                            }}
                            disabled={index === blocks.length - 1}
                            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                            title="Move Down"
                          >
                            <MoveDown size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateBlock(block, index);
                            }}
                            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white cursor-pointer"
                            title="Duplicate"
                          >
                            <Copy size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBlock(block.id);
                            }}
                            className="p-1 hover:bg-rose-900/60 rounded text-rose-400 hover:text-rose-200 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        {/* Block Previews */}
                        <div className="p-3 sm:p-4">
                          {block.type === 'HEADER' && (
                            <div className="text-center py-2 border-b border-slate-100">
                              <div
                                className="text-base font-extrabold tracking-wider uppercase"
                                style={{ color: activePalette.primary }}
                              >
                                {renderTextWithLeadData(block.title)}
                              </div>
                              <div
                                className="text-xs text-slate-500 mt-0.5"
                                dangerouslySetInnerHTML={{ __html: renderRichEmailContent(renderTextWithLeadData(block.body)) }}
                              />
                            </div>
                          )}

                          {block.type === 'TEXT' && (
                            <div className={`text-${block.align || 'left'} space-y-1.5`}>
                              {block.title && (
                                <h2 className="text-base font-bold text-slate-900">
                                  {renderTextWithLeadData(block.title)}
                                </h2>
                              )}
                              <div
                                className="text-sm text-slate-700 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: renderRichEmailContent(renderTextWithLeadData(block.body)) }}
                              />
                            </div>
                          )}

                          {block.type === 'IMAGE_BANNER' && (
                            <div className="text-center group/img relative">
                              <img
                                src={block.imageUrl}
                                alt="Banner"
                                className="w-full max-h-[260px] object-cover rounded-xl shadow-xs"
                              />
                              {/* Overlay Quick Upload from PC button */}
                              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center gap-2 rounded-xl transition-opacity">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    imageInputRef.current?.click();
                                  }}
                                  className="px-3 py-1.5 bg-white text-slate-900 text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5 hover:bg-slate-100 cursor-pointer"
                                >
                                  <HardDrive size={13} className="text-emerald-600" />
                                  <span>Change / Upload from PC</span>
                                </button>
                              </div>
                              {block.imageCaption && (
                                <p className="text-xs text-slate-500 mt-2 italic">
                                  {renderTextWithLeadData(block.imageCaption)}
                                </p>
                              )}
                            </div>
                          )}

                          {block.type === 'BUTTON_CTA' && (
                            <div className="text-center py-2">
                              <button
                                style={{ backgroundColor: activePalette.primary }}
                                className="px-6 py-3 text-white font-bold text-sm rounded-xl shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
                              >
                                {renderTextWithLeadData(block.buttonText)}
                              </button>
                            </div>
                          )}

                          {block.type === 'METRIC_STAT' && (
                            <div
                              style={{ backgroundColor: activePalette.bgLight, borderColor: `${activePalette.primary}40` }}
                              className="p-5 rounded-2xl border text-center"
                            >
                              <div
                                style={{ color: activePalette.primary }}
                                className="text-3xl sm:text-4xl font-black mb-1 tracking-tight"
                              >
                                {renderTextWithLeadData(block.metricNumber)}
                              </div>
                              <div className="text-sm font-bold text-slate-900">
                                {renderTextWithLeadData(block.metricLabel)}
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                {renderTextWithLeadData(block.metricChange)}
                              </div>
                            </div>
                          )}

                          {block.type === 'TESTIMONIAL' && (
                            <div
                              style={{ borderLeftColor: activePalette.primary }}
                              className="p-4 bg-slate-50 rounded-r-2xl border-l-4 space-y-2"
                            >
                              <div className="flex gap-1 text-amber-400">
                                {[...Array(block.rating || 5)].map((_, i) => (
                                  <Star key={i} size={14} className="fill-amber-400" />
                                ))}
                              </div>
                              <div
                                className="text-xs sm:text-sm italic text-slate-700 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: renderRichEmailContent(renderTextWithLeadData(block.body)) }}
                              />
                              <div className="flex items-center gap-2.5 pt-1">
                                {block.quoteAvatar && (
                                  <img
                                    src={block.quoteAvatar}
                                    alt="Author"
                                    className="w-7 h-7 rounded-full object-cover"
                                  />
                                )}
                                <div>
                                  <span className="text-xs font-bold text-slate-900">
                                    {renderTextWithLeadData(block.quoteAuthor)}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {' '}• {renderTextWithLeadData(block.quoteRole)}, {renderTextWithLeadData(block.quoteCompany)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {block.type === 'PRODUCT_CARD' && (
                            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                              {block.imageUrl && (
                                <img
                                  src={block.imageUrl}
                                  alt="Product"
                                  className="w-full h-44 object-cover"
                                />
                              )}
                              <div className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-bold text-base text-slate-900">
                                    {renderTextWithLeadData(block.title)}
                                  </h3>
                                  <span
                                    style={{ backgroundColor: activePalette.primary }}
                                    className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
                                  >
                                    {block.productBadge || 'PROMO'}
                                  </span>
                                </div>
                                <div
                                  className="text-xs text-slate-600 leading-relaxed"
                                  dangerouslySetInnerHTML={{ __html: renderRichEmailContent(renderTextWithLeadData(block.body)) }}
                                />
                                {block.productFeatures && block.productFeatures.length > 0 && (
                                  <div className="space-y-1 py-1">
                                    {block.productFeatures.map((f, fi) => (
                                      <div key={fi} className="flex items-center gap-1.5 text-xs text-slate-700">
                                        <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                                        <span>{f}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div className="pt-2 flex items-center justify-between">
                                  <div>
                                    <span className="text-base font-extrabold text-slate-900">{block.productPrice}</span>
                                    {block.productOriginalPrice && (
                                      <span className="text-xs text-slate-400 line-through ml-1.5">
                                        {block.productOriginalPrice}
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    style={{ backgroundColor: activePalette.primary }}
                                    className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs"
                                  >
                                    {renderTextWithLeadData(block.buttonText)}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {block.type === 'MEETING_SCHEDULER' && (
                            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-3">
                              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                                <Calendar size={20} />
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                  {renderTextWithLeadData(block.title)}
                                </h3>
                                <div
                                  className="text-xs text-slate-500 mt-0.5"
                                  dangerouslySetInnerHTML={{ __html: renderRichEmailContent(renderTextWithLeadData(block.body)) }}
                                />
                              </div>
                              <button
                                style={{ backgroundColor: activePalette.primary }}
                                className="px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-sm hover:scale-[1.02] transition-transform"
                              >
                                {renderTextWithLeadData(block.buttonText)}
                              </button>
                              <div className="text-[11px] text-slate-400">{block.meetingDuration}</div>
                            </div>
                          )}

                          {block.type === 'VIDEO_PREVIEW' && (
                            <div className="text-center space-y-2 group/vid relative">
                              <div className="relative rounded-2xl overflow-hidden shadow-sm group">
                                <img
                                  src={block.videoThumbnail}
                                  alt="Video preview"
                                  className="w-full h-44 object-cover"
                                />
                                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center group-hover:bg-slate-900/25 transition-colors">
                                  <div className="w-12 h-12 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                    <Play size={20} className="fill-slate-900 ml-0.5" />
                                  </div>
                                </div>
                                <span className="absolute bottom-2 right-2 bg-slate-950/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                  {block.badge || '▶ Video'}
                                </span>
                              </div>
                              <div className="text-xs font-bold text-slate-900">
                                {renderTextWithLeadData(block.title)}
                              </div>
                              {block.videoFileName && (
                                <div className="text-[10px] text-emerald-600 flex items-center justify-center gap-1">
                                  <HardDrive size={11} />
                                  <span>Local File: {block.videoFileName}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {block.type === 'SALES_SIGNATURE' && (
                            <div className="pt-3 border-t border-slate-100 space-y-3">
                              <div className="flex items-center gap-3">
                                {block.repAvatar && (
                                  <img
                                    src={block.repAvatar}
                                    alt="Sales Rep"
                                    className="w-11 h-11 rounded-full object-cover border border-slate-200"
                                  />
                                )}
                                <div>
                                  <div className="text-xs font-bold text-slate-900">
                                    {renderTextWithLeadData(block.repName)}
                                  </div>
                                  <div className="text-[11px] text-slate-500">
                                    {renderTextWithLeadData(block.repTitle)} • {renderTextWithLeadData(activeLead.senderCompany)}
                                  </div>
                                  <div className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                                    {renderTextWithLeadData(block.repEmail)} • {renderTextWithLeadData(block.repPhone)}
                                  </div>
                                </div>
                              </div>
                              {block.body && (
                                <div
                                  className="text-xs text-slate-500 italic"
                                  dangerouslySetInnerHTML={{ __html: renderRichEmailContent(renderTextWithLeadData(block.body)) }}
                                />
                              )}
                            </div>
                          )}

                          {block.type === 'DIVIDER' && (
                            <div className="py-2">
                              <hr className="border-slate-200" />
                            </div>
                          )}

                          {block.type === 'SOCIAL_FOOTER' && (
                            <div className="bg-slate-50 p-4 rounded-xl text-center text-[10px] text-slate-400 space-y-1">
                              <div>Sent by <strong>Business OS</strong> • 100 Enterprise Way, San Francisco, CA</div>
                              <div>
                                You received this email because you are a registered contact of {activeLead.company}.{' '}
                                <span className="underline cursor-pointer">Unsubscribe</span> •{' '}
                                <span className="underline cursor-pointer">Email Preferences</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </main>

          {/* RIGHT PANEL: Block Settings with Local PC Upload */}
          <aside className="w-80 bg-slate-950/70 border-l border-slate-800 flex flex-col shrink-0 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Settings2 size={16} className="text-emerald-400" />
                <span className="font-bold text-xs text-white uppercase tracking-wider">
                  {selectedBlock ? `${selectedBlock.type.replace('_', ' ')} Settings` : 'Block Settings'}
                </span>
              </div>
            </div>

            {selectedBlock ? (
              <div className="space-y-4">
                {/* IMAGE_BANNER SETTINGS (Upload from PC or URL) */}
                {selectedBlock.type === 'IMAGE_BANNER' && (
                  <div className="space-y-3.5">
                    {/* Source Mode Switcher */}
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
                      <button
                        type="button"
                        onClick={() => setImageSourceMode('upload')}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          imageSourceMode === 'upload'
                            ? 'bg-slate-800 text-emerald-400 shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <HardDrive size={13} />
                        <span>Upload from PC</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageSourceMode('url')}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          imageSourceMode === 'url'
                            ? 'bg-slate-800 text-emerald-400 shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <LinkIcon size={13} />
                        <span>Web URL</span>
                      </button>
                    </div>

                    {imageSourceMode === 'upload' ? (
                      <div className="space-y-2">
                        {/* Drag and drop / Click upload dropzone */}
                        <div
                          onClick={() => imageInputRef.current?.click()}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files?.[0];
                            if (file) {
                              processLocalFile(file, (dataUrl, fileName) => {
                                handleUpdateBlock(selectedBlock.id, {
                                  imageUrl: dataUrl,
                                  imageFileName: fileName,
                                });
                              });
                            }
                          }}
                          className="p-5 border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl bg-slate-900/80 hover:bg-slate-900 text-center cursor-pointer transition-all group"
                        >
                          <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-400 mx-auto flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <Upload size={18} />
                          </div>
                          <div className="text-xs font-bold text-white group-hover:text-emerald-400">
                            Click to browse from PC
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">
                            or drag and drop JPG, PNG, WEBP, GIF up to 50MB
                          </p>
                        </div>

                        {selectedBlock.imageFileName && (
                          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-300">
                            <div className="flex items-center gap-2 truncate">
                              <FileImage size={14} className="text-emerald-400 shrink-0" />
                              <span className="truncate">{selectedBlock.imageFileName}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => imageInputRef.current?.click()}
                              className="text-[10px] text-emerald-400 hover:underline font-bold shrink-0"
                            >
                              Replace
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 block">Image Web URL</label>
                        <input
                          type="text"
                          value={selectedBlock.imageUrl || ''}
                          onChange={(e) => handleUpdateBlock(selectedBlock.id, { imageUrl: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                    )}

                    {/* Presets Quick Picker */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Preset Banner Photos</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {PRESET_BANNERS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              handleUpdateBlock(selectedBlock.id, {
                                imageUrl: preset.url,
                                imageFileName: `${preset.label.toLowerCase().replace(/\s+/g, '_')}.jpg`,
                              });
                              showToast(`Applied preset: ${preset.label}`);
                            }}
                            className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-left text-[10px] font-semibold text-slate-300 hover:text-white truncate transition-colors cursor-pointer"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">Image Caption / Alt Text</label>
                      <input
                        type="text"
                        value={selectedBlock.imageCaption || ''}
                        onChange={(e) => handleUpdateBlock(selectedBlock.id, { imageCaption: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                        placeholder="Optional image caption..."
                      />
                    </div>
                  </div>
                )}

                {/* VIDEO_PREVIEW SETTINGS (Local Video/Thumbnail Upload or URL) */}
                {selectedBlock.type === 'VIDEO_PREVIEW' && (
                  <div className="space-y-3.5">
                    {/* Source Mode Switcher */}
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
                      <button
                        type="button"
                        onClick={() => setVideoSourceMode('upload')}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          videoSourceMode === 'upload'
                            ? 'bg-slate-800 text-emerald-400 shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <HardDrive size={13} />
                        <span>Upload Video from PC</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoSourceMode('url')}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          videoSourceMode === 'url'
                            ? 'bg-slate-800 text-emerald-400 shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <LinkIcon size={13} />
                        <span>Video URL</span>
                      </button>
                    </div>

                    {videoSourceMode === 'upload' ? (
                      <div className="space-y-2">
                        <div
                          onClick={() => videoInputRef.current?.click()}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files?.[0];
                            if (file) {
                              processLocalFile(file, (dataUrl, fileName) => {
                                handleUpdateBlock(selectedBlock.id, {
                                  videoUrl: dataUrl,
                                  videoFileName: fileName,
                                  title: fileName.replace(/\.[^/.]+$/, ''),
                                });
                              });
                            }
                          }}
                          className="p-5 border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl bg-slate-900/80 hover:bg-slate-900 text-center cursor-pointer transition-all group"
                        >
                          <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-400 mx-auto flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <FileVideo size={18} />
                          </div>
                          <div className="text-xs font-bold text-white group-hover:text-emerald-400">
                            Upload Local Video (.mp4, .webm)
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Browse PC or drag video file
                          </p>
                        </div>

                        {selectedBlock.videoFileName && (
                          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-300">
                            <div className="flex items-center gap-2 truncate">
                              <FileVideo size={14} className="text-emerald-400 shrink-0" />
                              <span className="truncate">{selectedBlock.videoFileName}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => videoInputRef.current?.click()}
                              className="text-[10px] text-emerald-400 hover:underline font-bold shrink-0"
                            >
                              Replace
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 block">Video Web URL (YouTube, Vimeo, Loom)</label>
                        <input
                          type="text"
                          value={selectedBlock.videoUrl || ''}
                          onChange={(e) => handleUpdateBlock(selectedBlock.id, { videoUrl: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                          placeholder="https://youtube.com/watch?v=..."
                        />
                      </div>
                    )}

                    {/* Upload Custom Video Thumbnail from PC */}
                    <div className="space-y-2 pt-1 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-400">Video Poster / Thumbnail</label>
                        <button
                          type="button"
                          onClick={() => thumbnailInputRef.current?.click()}
                          className="text-[10px] text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <HardDrive size={11} />
                          <span>Upload Thumbnail from PC</span>
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={selectedBlock.videoThumbnail || ''}
                          onChange={(e) => handleUpdateBlock(selectedBlock.id, { videoThumbnail: e.target.value })}
                          className="flex-1 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                          placeholder="Thumbnail URL or upload from PC..."
                        />
                        <button
                          type="button"
                          onClick={() => thumbnailInputRef.current?.click()}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold shrink-0 border border-slate-700 cursor-pointer"
                        >
                          Upload
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">Video Title</label>
                      <input
                        type="text"
                        value={selectedBlock.title || ''}
                        onChange={(e) => handleUpdateBlock(selectedBlock.id, { title: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">Duration Badge</label>
                      <input
                        type="text"
                        value={selectedBlock.badge || ''}
                        onChange={(e) => handleUpdateBlock(selectedBlock.id, { badge: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                        placeholder="e.g. ▶ 2:30 Min Demo"
                      />
                    </div>
                  </div>
                )}

                {/* Common Title & Content Fields for text-based blocks */}
                {selectedBlock.type !== 'IMAGE_BANNER' && selectedBlock.type !== 'VIDEO_PREVIEW' && selectedBlock.title !== undefined && (
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">Heading / Title</label>
                    <input
                      type="text"
                      value={selectedBlock.title || ''}
                      onChange={(e) => handleUpdateBlock(selectedBlock.id, { title: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                )}

                {selectedBlock.type !== 'IMAGE_BANNER' && selectedBlock.type !== 'VIDEO_PREVIEW' && selectedBlock.body !== undefined && (
                  <div>
                    <EmailRichTextEditor
                      value={selectedBlock.body || ''}
                      onChange={(val) => handleUpdateBlock(selectedBlock.id, { body: val })}
                      onAlignChange={(al) => handleUpdateBlock(selectedBlock.id, { align: al })}
                      label="Content / Body"
                      placeholder="Write your email body or click toolbar buttons above to format & smooth..."
                    />
                  </div>
                )}

                {/* Button CTA settings */}
                {selectedBlock.type === 'BUTTON_CTA' && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1.5">Button Label</label>
                      <input
                        type="text"
                        value={selectedBlock.buttonText || ''}
                        onChange={(e) => handleUpdateBlock(selectedBlock.id, { buttonText: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1.5">Destination URL / Link</label>
                      <input
                        type="text"
                        value={selectedBlock.buttonUrl || ''}
                        onChange={(e) => handleUpdateBlock(selectedBlock.id, { buttonUrl: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>
                  </>
                )}

                {/* Metric Stat settings */}
                {selectedBlock.type === 'METRIC_STAT' && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1.5">Metric Number / Stat</label>
                      <input
                        type="text"
                        value={selectedBlock.metricNumber || ''}
                        onChange={(e) => handleUpdateBlock(selectedBlock.id, { metricNumber: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-bold text-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1.5">Metric Label</label>
                      <input
                        type="text"
                        value={selectedBlock.metricLabel || ''}
                        onChange={(e) => handleUpdateBlock(selectedBlock.id, { metricLabel: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>
                  </>
                )}

                {/* Product Card settings with PC Upload */}
                {selectedBlock.type === 'PRODUCT_CARD' && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-400">Product Image</label>
                        <button
                          type="button"
                          onClick={() => productImgInputRef.current?.click()}
                          className="text-[10px] text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <HardDrive size={11} />
                          <span>Upload from PC</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={selectedBlock.imageUrl || ''}
                        onChange={(e) => handleUpdateBlock(selectedBlock.id, { imageUrl: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                        placeholder="Image URL or upload from PC..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold text-slate-400 block mb-1.5">Price</label>
                        <input
                          type="text"
                          value={selectedBlock.productPrice || ''}
                          onChange={(e) => handleUpdateBlock(selectedBlock.id, { productPrice: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 block mb-1.5">Badge</label>
                        <input
                          type="text"
                          value={selectedBlock.productBadge || ''}
                          onChange={(e) => handleUpdateBlock(selectedBlock.id, { productBadge: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Sales Signature Rep Avatar PC Upload */}
                {selectedBlock.type === 'SALES_SIGNATURE' && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-400">Rep Headshot Avatar</label>
                        <button
                          type="button"
                          onClick={() => repAvatarInputRef.current?.click()}
                          className="text-[10px] text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <HardDrive size={11} />
                          <span>Upload from PC</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={selectedBlock.repAvatar || ''}
                        onChange={(e) => handleUpdateBlock(selectedBlock.id, { repAvatar: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                        placeholder="Avatar photo URL or upload from PC..."
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1.5">Rep Name</label>
                      <input
                        type="text"
                        value={selectedBlock.repName || ''}
                        onChange={(e) => handleUpdateBlock(selectedBlock.id, { repName: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>
                  </>
                )}

                {selectedBlock.align !== undefined && (
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">Text Alignment</label>
                    <div className="flex gap-2">
                      {(['left', 'center', 'right'] as const).map((al) => (
                        <button
                          key={al}
                          onClick={() => handleUpdateBlock(selectedBlock.id, { align: al })}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border capitalize transition-colors cursor-pointer ${
                            selectedBlock.align === al
                              ? 'bg-slate-800 border-emerald-500 text-emerald-400'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {al}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                Select any block in the canvas to adjust its properties.
              </div>
            )}
          </aside>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🚀 VIEW 2: TEMPLATES LIBRARY */}
      {/* ========================================================================= */}
      {mainView === 'templates' && (
        <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Email Template Library</h2>
              <p className="text-xs text-slate-400">Pre-built and custom templates for sales outreach, marketing, and onboarding</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <button
                onClick={() => {
                  setBlocks([
                    { id: 'blk_txt_new', type: 'TEXT', title: 'Hi {{firstName}},', body: 'Type your email content here...', align: 'left' },
                    { id: 'blk_btn_new', type: 'BUTTON_CTA', buttonText: 'Take Action', buttonUrl: 'https://businessos.io' },
                    { id: 'blk_foot_new', type: 'SOCIAL_FOOTER' },
                  ]);
                  setSubject('New Custom Email Subject');
                  setPreheader('Preview snippet...');
                  setMainView('builder');
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
              >
                <Plus size={14} />
                <span>Blank Template</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['ALL', 'SALES', 'MARKETING', 'ONBOARDING'].map((cat) => (
              <button
                key={cat}
                onClick={() => setTemplateCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  templateCategoryFilter === cat
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-xs'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat === 'ALL' ? 'All Categories' : cat}
              </button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between hover:border-slate-700 hover:shadow-xl transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-emerald-500/20">
                      {tmpl.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Used {tmpl.usageCount} times</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {tmpl.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{tmpl.subject}</p>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
                    <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles size={12} />
                      <span>{tmpl.badge}</span>
                    </div>
                    <div className="text-slate-400 truncate">Preheader: {tmpl.preheader}</div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">{tmpl.updatedAt}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const sections = convertBlocksToSections(tmpl.blocks);
                        setBridgeTransfer({
                          source: 'visual-builder',
                          targetTab: 'automations',
                          templateId: tmpl.id,
                          templateName: tmpl.name,
                          subject: tmpl.subject,
                          preheader: tmpl.preheader,
                          sections,
                          blocks: tmpl.blocks,
                          timestamp: Date.now(),
                        });
                        window.location.href = `/email-marketing?tab=automations&source=bridge`;
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/40 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      title="Send this template into an Automation Workflow"
                    >
                      <GitBranch size={13} className="text-emerald-400" />
                      <span>Use in Automation</span>
                    </button>

                    <button
                      onClick={() => handleLoadTemplate(tmpl)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      <FileEdit size={13} />
                      <span>Edit in Builder</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🚀 VIEW 3: DRAFTS BOX */}
      {/* ========================================================================= */}
      {mainView === 'drafts' && (
        <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Saved Email Drafts</h2>
              <p className="text-xs text-slate-400">Continue editing your in-progress email campaigns</p>
            </div>
            <button
              onClick={() => {
                setBlocks(INITIAL_TEMPLATES[0].blocks);
                setSubject('New Draft Campaign');
                setMainView('builder');
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Create New Draft</span>
            </button>
          </div>

          <div className="space-y-3">
            {drafts.map((d) => (
              <div
                key={d.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-3 bg-slate-800 rounded-xl text-emerald-400 shrink-0">
                    <FileEdit size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-white truncate">{d.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium shrink-0">
                        {d.blocks.length} blocks
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">Subject: {d.subject}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                      <span>Audience: {d.recipientAudience}</span>
                      <span>•</span>
                      <span>Last saved: {d.updatedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Health Score</div>
                    <div className="text-xs font-bold text-emerald-400">{d.deliverabilityScore}/100</div>
                  </div>

                  <button
                    onClick={() => handleLoadDraft(d)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 hover:border-emerald-400 transition-all cursor-pointer"
                  >
                    <span>Resume</span>
                    <ArrowRight size={13} />
                  </button>

                  <button
                    onClick={() => {
                      setDrafts(drafts.filter((item) => item.id !== d.id));
                      showToast('Draft deleted.');
                    }}
                    className="p-2 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🚀 VIEW 4: SENT BOX / BROADCAST OUTBOX */}
      {/* ========================================================================= */}
      {mainView === 'sent' && (
        <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Sent Email Campaigns & Outbox</h2>
              <p className="text-xs text-slate-400">Review delivered broadcasts, real-time open rates, and CTR</p>
            </div>
          </div>

          {/* Quick Metrics Header */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <div className="text-[11px] font-bold uppercase text-slate-400">Total Emails Sent</div>
              <div className="text-2xl font-black text-white mt-1">3,240</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">+18% this month</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <div className="text-[11px] font-bold uppercase text-slate-400">Avg. Open Rate</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">68.3%</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Benchmark: 28.5%</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <div className="text-[11px] font-bold uppercase text-slate-400">Avg. Click Rate</div>
              <div className="text-2xl font-black text-sky-400 mt-1">26.8%</div>
              <div className="text-[10px] text-slate-400 mt-0.5">High reply intent</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <div className="text-[11px] font-bold uppercase text-slate-400">Avg. Bounce Rate</div>
              <div className="text-2xl font-black text-slate-200 mt-1">0.4%</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">Clean deliverability</div>
            </div>
          </div>

          {/* Sent Campaigns Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Campaign Subject & Audience</span>
              <span>Performance Telemetry</span>
            </div>

            <div className="divide-y divide-slate-800">
              {sentBox.map((s) => (
                <div
                  key={s.id}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl shrink-0">
                      <SendHorizontal size={16} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-white truncate">{s.subject}</h4>
                      <div className="flex items-center gap-2.5 text-[11px] text-slate-400 mt-0.5">
                        <span className="text-emerald-400 font-semibold">{s.recipientCount} Recipients</span>
                        <span>•</span>
                        <span>{s.audience}</span>
                        <span>•</span>
                        <span>{s.sentAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-center">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Opens</div>
                      <div className="text-xs font-extrabold text-emerald-400">{s.openRate}%</div>
                    </div>

                    <div className="text-center">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Clicks</div>
                      <div className="text-xs font-extrabold text-sky-400">{s.clickRate}%</div>
                    </div>

                    <div className="text-center">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Status</div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {s.status}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSubject(s.subject);
                        setBlocks(s.blocks);
                        setMainView('builder');
                        showToast('Loaded sent campaign into builder as new draft!');
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
                    >
                      Reuse
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Send Test Email */}
      {isSendTestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <Send size={18} />
                </div>
                <h3 className="font-bold text-base text-white">Send Test / Blast</h3>
              </div>
              <button
                onClick={() => setIsSendTestModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Verify rendering, spam filters, and deliverability in your actual email client (Gmail, Apple Mail, Outlook).
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Recipient Email Address</label>
              <input
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-medium"
                placeholder="you@company.com"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                onClick={() => setIsSendTestModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const newSentRecord: SentEmailRecord = {
                    id: `sent_${Date.now()}`,
                    subject,
                    recipientCount: 1,
                    audience: `Test Send (${testEmailAddress})`,
                    sentAt: 'Just now',
                    status: 'DELIVERED',
                    openRate: 100,
                    clickRate: 50,
                    bounceRate: 0,
                    blocks,
                  };
                  setSentBox([newSentRecord, ...sentBox]);
                  setIsSendTestModalOpen(false);
                  showToast(`Test email sent to ${testEmailAddress} and logged in Sent Box!`);
                }}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-slate-950 rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Send Test Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Save Draft Modal */}
      {isSaveDraftModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <FileEdit size={18} />
                </div>
                <h3 className="font-bold text-base text-white">Save In-Progress Draft</h3>
              </div>
              <button
                onClick={() => setIsSaveDraftModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Draft Campaign Name</label>
              <input
                type="text"
                value={currentDraftName}
                onChange={(e) => setCurrentDraftName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none font-medium"
                placeholder="e.g. Q3 Sales Followup Pitch"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                onClick={() => setIsSaveDraftModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDraft}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-slate-950 rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Save to Drafts Box
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: AI Copywriter Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
                  <Sparkles size={18} />
                </div>
                <h3 className="font-bold text-base text-white">AI Sales & Marketing Assistant</h3>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Choose an optimization preset to boost your email performance in one click:
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => handleAiAction('punchy')}
                className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 rounded-2xl text-left transition-all group cursor-pointer"
              >
                <div className="text-xs font-bold text-white group-hover:text-purple-300 flex items-center gap-1.5">
                  <Flame size={14} className="text-amber-400" />
                  <span>High-Reply Pitch</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Refactor copy into concise, value-packed B2B pitch.</p>
              </button>

              <button
                onClick={() => handleAiAction('subject')}
                className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 rounded-2xl text-left transition-all group cursor-pointer"
              >
                <div className="text-xs font-bold text-white group-hover:text-purple-300 flex items-center gap-1.5">
                  <Target size={14} className="text-emerald-400" />
                  <span>Subject Line Formulas</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Generate high open-rate subject lines with merge tags.</p>
              </button>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-300">Or enter custom instructions for AI</label>
              <textarea
                rows={3}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Make this email sound friendly and invite them to an exclusive VIP dinner at SaaStr..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl p-3 text-xs text-white outline-none resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAiAction('punchy')}
                disabled={aiGenerating}
                className="px-5 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-xs font-bold text-white rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles size={14} />
                <span>{aiGenerating ? 'Optimizing...' : 'Generate with AI'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Bridge Export to Email Marketing Modal */}
      {isExportBridgeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-400">
                  <GitBranch size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Bridge to Email Marketing Suite</h3>
                  <p className="text-xs text-slate-400">Where would you like to use this email design?</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExportBridgeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleExportToEmailMarketing('automations')}
                className="w-full p-4 rounded-2xl bg-white/[0.03] hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/40 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white group-hover:text-emerald-300 flex items-center gap-2">
                    <GitBranch size={16} className="text-emerald-400" />
                    <span>🤖 Use in Automation Workflow Studio</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                    Automations
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Insert into multi-step customer journeys with behavioral triggers, delays, lead scoring, and CRM tasks.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleExportToEmailMarketing('bulk-blast')}
                className="w-full p-4 rounded-2xl bg-white/[0.03] hover:bg-teal-500/10 border border-white/10 hover:border-teal-500/40 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white group-hover:text-teal-300 flex items-center gap-2">
                    <Users size={16} className="text-teal-400" />
                    <span>🎯 Use in Bulk Blast Lead Filter</span>
                  </span>
                  <span className="text-[10px] font-mono text-teal-400 bg-teal-500/20 px-2 py-0.5 rounded-full font-bold">
                    AI STO
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Segment CRM contacts by industry, deal stage, and territory, and broadcast with AI Send-Time Optimization.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleExportToEmailMarketing('builder')}
                className="w-full p-4 rounded-2xl bg-white/[0.03] hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/40 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white group-hover:text-cyan-300 flex items-center gap-2">
                    <Layers size={16} className="text-cyan-400" />
                    <span>📰 Open in Campaign Newsletter Studio</span>
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded-full font-bold">
                    Campaigns
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Open inside Email Marketing newsletter composer with dynamic industry case-studies and mobile previews.
                </p>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsExportBridgeModalOpen(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
