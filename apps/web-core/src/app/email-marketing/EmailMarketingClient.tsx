'use client';

import { useState } from 'react';
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
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  preheader: string;
  headline: string;
  bodyText: string;
  buttonText: string;
  buttonUrl: string;
  bannerImage: string;
  brandColor: string;
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

const initialTemplates: EmailTemplate[] = [
  {
    id: 'tmpl_product_launch',
    name: '🚀 Product Launch & Feature Announcement',
    category: 'Product Updates',
    subject: 'Introducing Business OS 2.0: Real-time Telemetry & Autonomous AI',
    preheader: 'Experience sub-10ms queries, OCR document inference, and automated workflows.',
    headline: 'The Next Generation of Enterprise Workspace is Here',
    bodyText: 'We are thrilled to announce the official release of Business OS 2.0. Built from the ground up for modern enterprise sales and operations teams, Business OS combines CRM pipelines, automated billing ledgers, and intelligent AI copilots into one unified surface.\n\nExplore our latest features and accelerate your team velocity today.',
    buttonText: 'Explore Business OS 2.0',
    buttonUrl: 'https://businessos.io/demo',
    bannerImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    brandColor: '#f59e0b',
  },
  {
    id: 'tmpl_cold_outreach',
    name: '💼 B2B Cold Outreach & Partnership Pitch',
    category: 'Sales Outreach',
    subject: 'Quick question regarding {{company}} revenue operations',
    preheader: 'How top enterprises are cutting CRM latency and boosting close rates by 40%',
    headline: 'Scale {{company}}\'s Sales Velocity with Intelligent Automation',
    bodyText: 'Hi {{firstName}},\n\nI noticed {{company}} has been expanding rapidly this quarter. Many VP of Sales we speak with struggle with fragmented tools between their deal pipelines, commercial quotes, and payment reconciliations.\n\nBusiness OS brings all three together with built-in SOC2 compliance. Would you be open to a 10-minute briefing this Thursday?',
    buttonText: 'Book a 10-Min Briefing',
    buttonUrl: 'https://businessos.io/meet',
    bannerImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    brandColor: '#f97316',
  },
  {
    id: 'tmpl_newsletter',
    name: '📰 Monthly Executive Enterprise Newsletter',
    category: 'Newsletters',
    subject: 'Business OS Monthly Digest: Key Industry Insights & Benchmarks',
    preheader: 'Top revenue operations trends, customer spotlights, and platform changelog.',
    headline: 'August 2026 Executive Newsletter',
    bodyText: 'Welcome to this month\'s edition of the Business OS Executive Briefing. In this issue, we dive into the rise of autonomous AI copilots in enterprise deal negotiation, how to eliminate data siloing, and a deep dive into Acme Corp\'s 45% productivity leap.',
    buttonText: 'Read Full Briefing',
    buttonUrl: 'https://businessos.io/blog/monthly-briefing',
    bannerImage: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&auto=format&fit=crop&q=80',
    brandColor: '#eab308',
  },
  {
    id: 'tmpl_webinar',
    name: '🎟️ VIP Webinar & Live Demo Invitation',
    category: 'Events',
    subject: 'Exclusive VIP Access: Autonomous AI for B2B Operations',
    preheader: 'Join our live interactive workshop with senior enterprise architects.',
    headline: 'You Are Invited: Autonomous AI in Action',
    bodyText: 'Join us live this Thursday as our engineering leaders demonstrate live schema inference, real-time Khata ledger tracking, and automated multi-channel messaging in Business OS.\n\nSeats are strictly limited to ensure an interactive Q&A session.',
    buttonText: 'Reserve Your Seat Now',
    buttonUrl: 'https://businessos.io/webinar',
    bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
    brandColor: '#10b981',
  },
];

const initialCampaigns: EmailCampaign[] = [
  {
    id: 'cmp_1',
    name: 'Q3 Enterprise Feature Release Announcement',
    subject: 'Introducing Business OS 2.0: Real-time Telemetry & Autonomous AI',
    audience: 'All Active Enterprise Leads (2,840)',
    recipientCount: 2840,
    status: 'SENT',
    sentAt: 'Today at 09:30 AM',
    metrics: { delivered: 2824, opened: 1290, clicked: 512, bounced: 16 },
  },
  {
    id: 'cmp_2',
    name: 'Executive Webinar VIP Invitation',
    subject: 'Exclusive VIP Access: Autonomous AI for B2B Operations',
    audience: 'VP & C-Level Decision Makers (890)',
    recipientCount: 890,
    status: 'SENT',
    sentAt: 'Yesterday at 02:00 PM',
    metrics: { delivered: 886, opened: 488, clicked: 236, bounced: 4 },
  },
  {
    id: 'cmp_3',
    name: 'Annual Subscription Renewal Discount',
    subject: 'Special offer: Save 25% on your annual Business OS seat upgrade',
    audience: 'Monthly Tier Customers (420)',
    recipientCount: 420,
    status: 'SCHEDULED',
    sentAt: 'Scheduled for Tomorrow 10:00 AM',
    metrics: { delivered: 0, opened: 0, clicked: 0, bounced: 0 },
  },
];

const liveEmailEvents: EmailEvent[] = [
  {
    id: 'ev_1',
    recipientEmail: 'sarah.connor@cyberdyne.io',
    recipientName: 'Sarah Connor',
    company: 'Cyberdyne Systems Corp',
    campaignTitle: 'Q3 Enterprise Feature Release Announcement',
    eventType: 'CLICK',
    timestamp: '2 mins ago',
    device: 'Apple Mail (iOS 19)',
    location: 'San Francisco, US',
  },
  {
    id: 'ev_2',
    recipientEmail: 'michael.scott@dunder.com',
    recipientName: 'Michael Scott',
    company: 'Dunder Mifflin Inc',
    campaignTitle: 'Q3 Enterprise Feature Release Announcement',
    eventType: 'OPEN',
    timestamp: '5 mins ago',
    device: 'Chrome on macOS',
    location: 'Scranton, US',
  },
  {
    id: 'ev_3',
    recipientEmail: 'alex.rivera@nexastech.com',
    recipientName: 'Alex Rivera',
    company: 'Nexus Tech Global',
    campaignTitle: 'Executive Webinar VIP Invitation',
    eventType: 'CLICK',
    timestamp: '12 mins ago',
    device: 'Outlook 365 (Windows)',
    location: 'London, UK',
  },
  {
    id: 'ev_4',
    recipientEmail: 'elena.rostova@hyperion.de',
    recipientName: 'Elena Rostova',
    company: 'Hyperion Logistics GmbH',
    campaignTitle: 'Q3 Enterprise Feature Release Announcement',
    eventType: 'OPEN',
    timestamp: '18 mins ago',
    device: 'Safari (iPadOS)',
    location: 'Berlin, DE',
  },
];

export function EmailMarketingClient() {
  const [activeTab, setActiveTab] = useState<'builder' | 'campaigns' | 'tracking' | 'templates'>('builder');
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(initialCampaigns);
  const [events, setEvents] = useState<EmailEvent[]>(liveEmailEvents);

  // Email Builder State
  const [subject, setSubject] = useState(initialTemplates[0].subject);
  const [preheader, setPreheader] = useState(initialTemplates[0].preheader);
  const [headline, setHeadline] = useState(initialTemplates[0].headline);
  const [bodyText, setBodyText] = useState(initialTemplates[0].bodyText);
  const [buttonText, setButtonText] = useState(initialTemplates[0].buttonText);
  const [buttonUrl, setButtonUrl] = useState(initialTemplates[0].buttonUrl);
  const [bannerImage, setBannerImage] = useState(initialTemplates[0].bannerImage);
  const [brandColor, setBrandColor] = useState(initialTemplates[0].brandColor);
  const [senderName, setSenderName] = useState('Business OS Team');
  const [senderEmail, setSenderEmail] = useState('notifications@businessos.io');

  // Preview Mode: desktop vs mobile
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isCopiedHtml, setIsCopiedHtml] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('admin@gmail.com');
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignAudience, setNewCampaignAudience] = useState('All Enterprise Contacts (2,840)');
  const [alert, setAlert] = useState<string | null>(null);

  // Load Template Function
  const loadTemplate = (tmpl: EmailTemplate) => {
    setSubject(tmpl.subject);
    setPreheader(tmpl.preheader);
    setHeadline(tmpl.headline);
    setBodyText(tmpl.bodyText);
    setButtonText(tmpl.buttonText);
    setButtonUrl(tmpl.buttonUrl);
    setBannerImage(tmpl.bannerImage);
    setBrandColor(tmpl.brandColor);
    setActiveTab('builder');
    setAlert(`Template "${tmpl.name}" loaded into the Visual Builder!`);
    setTimeout(() => setAlert(null), 3000);
  };

  // Insert Merge Tag
  const insertMergeTag = (tag: string) => {
    setBodyText((prev) => `${prev} ${tag}`);
  };

  // Generate Clean HTML Export
  const generateExportHtml = () => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #07090e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <div style="max-width: 600px; margin: 30px auto; background: #0f1422; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 8px 32px rgba(0,0,0,0.4);">
    <div style="background: #0f1422; padding: 20px 32px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center;">
      <h2 style="margin: 0; font-size: 18px; font-weight: bold; color: #ffffff;">Business OS</h2>
    </div>
    ${bannerImage ? `<img src="${bannerImage}" alt="Banner" style="width: 100%; height: auto; display: block; max-height: 240px; object-fit: cover;" />` : ''}
    <div style="padding: 32px;">
      <h1 style="font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 16px; line-height: 1.3;">${headline}</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin-bottom: 24px; white-space: pre-wrap;">${bodyText}</p>
      ${buttonText ? `<a href="${buttonUrl}" style="display: inline-block; background: linear-gradient(to right, #f59e0b, #f97316); color: #020617; padding: 12px 28px; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 12px rgba(245,158,11,0.25);">${buttonText}</a>` : ''}
    </div>
    <div style="background: #090d16; padding: 20px 32px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 11px; color: #64748b; text-align: center; line-height: 1.5;">
      <p style="margin: 0 0 8px 0;">Sent by ${senderName} (${senderEmail})</p>
      <p style="margin: 0;">100 Montgomery St, Suite 1400, San Francisco, CA · <a href="{{unsubscribeUrl}}" style="color: #f59e0b; text-decoration: underline;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;
  };

  const copyHtmlToClipboard = () => {
    navigator.clipboard.writeText(generateExportHtml());
    setIsCopiedHtml(true);
    setTimeout(() => setIsCopiedHtml(false), 2000);
  };

  const handleSendTestEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestModalOpen(false);
    setAlert(`📨 Test email dispatched to ${testEmailAddress}! Check your inbox.`);
    setTimeout(() => setAlert(null), 3500);
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName) return;

    const count = newCampaignAudience.includes('2,840') ? 2840 : newCampaignAudience.includes('890') ? 890 : 450;
    const newCamp: EmailCampaign = {
      id: `cmp_${Date.now()}`,
      name: newCampaignName,
      subject,
      audience: newCampaignAudience,
      recipientCount: count,
      status: 'SENT',
      sentAt: 'Just now',
      metrics: {
        delivered: count,
        opened: Math.floor(count * 0.45),
        clicked: Math.floor(count * 0.18),
        bounced: 2,
      },
    };

    setCampaigns([newCamp, ...campaigns]);
    setIsNewCampaignModalOpen(false);
    setNewCampaignName('');
    setActiveTab('campaigns');
    setAlert(`🚀 Campaign "${newCamp.name}" broadcasted to ${count.toLocaleString()} recipients!`);
    setTimeout(() => setAlert(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Alert Banner */}
      {alert && (
        <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-amber-300 text-xs font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
          <CheckCircle2 size={16} className="text-amber-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Mail className="text-amber-400" size={24} />
            Email Marketing Suite & Visual Email Builder
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Build responsive HTML email campaigns, manage audience segmentation, and monitor real-time open/click telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'builder'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.1] border border-white/[0.1]'
            }`}
          >
            <Layers size={14} />
            <span>Visual Email Builder</span>
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'campaigns'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
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
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.1] border border-white/[0.1]'
            }`}
          >
            <BarChart3 size={14} />
            <span>Telemetry & Live Opens</span>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'templates'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.1] border border-white/[0.1]'
            }`}
          >
            <Sparkles size={14} />
            <span>Templates ({initialTemplates.length})</span>
          </button>
        </div>
      </div>

      {/* Visual Email Builder Tab */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form & Block Controls (6 cols) */}
          <div className="lg:col-span-6 space-y-5">
            {/* Sender & Subject Setup */}
            <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Settings2 size={14} className="text-amber-400" />
                <span>Campaign Metadata & Headers</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Sender Name</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08] font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Sender Email</label>
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08] font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Subject Line</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08] font-semibold"
                  placeholder="e.g. Accelerate your enterprise sales velocity..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Preview Preheader</label>
                <input
                  type="text"
                  value={preheader}
                  onChange={(e) => setPreheader(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08] font-medium"
                  placeholder="Brief summary shown in inbox list before opening"
                />
              </div>
            </div>

            {/* Email Canvas Blocks */}
            <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Sliders size={14} className="text-amber-400" />
                <span>Body Content & Call to Action</span>
              </h2>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Banner Image URL</label>
                <input
                  type="text"
                  value={bannerImage}
                  onChange={(e) => setBannerImage(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08] font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Primary Headline (H1)</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08] font-bold"
                />
              </div>

              {/* Dynamic Personalization Merge Tags */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-semibold text-slate-400">
                    Insert Personalization Merge Tags
                  </label>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['{{firstName}}', '{{lastName}}', '{{company}}', '{{dealValue}}', '{{dealStage}}'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => insertMergeTag(tag)}
                      className="px-2.5 py-1 bg-white/[0.06] hover:bg-amber-500/15 hover:text-amber-300 border border-white/[0.1] text-slate-300 text-[11px] font-mono font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Body Paragraphs</label>
                <textarea
                  rows={6}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08] font-medium leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08] font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Button Action URL</label>
                  <input
                    type="text"
                    value={buttonUrl}
                    onChange={(e) => setButtonUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08] font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={copyHtmlToClipboard}
                  className="px-3.5 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.1] rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  {isCopiedHtml ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{isCopiedHtml ? 'HTML Copied!' : 'Export Raw HTML'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTestModalOpen(true)}
                    className="px-3.5 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border border-white/[0.1] cursor-pointer"
                  >
                    <Send size={13} />
                    <span>Send Test</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsNewCampaignModalOpen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-orange-500/25 active:scale-[0.98] border border-amber-400/40 cursor-pointer"
                  >
                    <Send size={13} />
                    <span>Launch Campaign</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Visual Email Preview (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Interactive Live Render
                  </span>
                </div>

                {/* Viewport Switcher */}
                <div className="flex items-center gap-1 bg-white/[0.06] p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setViewMode('desktop')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      viewMode === 'desktop'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-2xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Monitor size={13} />
                    <span>Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('mobile')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      viewMode === 'mobile'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-2xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone size={13} />
                    <span>Mobile</span>
                  </button>
                </div>
              </div>

              {/* Rendered Email Container */}
              <div className="flex justify-center p-3 bg-white/[0.02] rounded-2xl border border-white/[0.08] overflow-hidden">
                <div
                  className={`bg-slate-950/80 rounded-2xl shadow-sm border border-white/[0.1] overflow-hidden transition-all duration-300 ${
                    viewMode === 'mobile' ? 'w-[320px] text-xs' : 'w-full'
                  }`}
                >
                  {/* Email Header */}
                  <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-lg flex items-center justify-center text-slate-950 font-bold text-xs">
                        B
                      </div>
                      <span className="font-bold text-xs text-white">Business OS</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Verified TLS</span>
                  </div>

                  {/* Banner Image */}
                  {bannerImage && (
                    <div className="max-h-48 overflow-hidden bg-white/[0.02] border-b border-white/[0.08]">
                      <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-6 space-y-4 font-sans text-white">
                    <h1 className="text-base font-bold text-white leading-snug">
                      {headline}
                    </h1>
                    <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {bodyText}
                    </p>

                    {buttonText && (
                      <div className="pt-2">
                        <a
                          href={buttonUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-orange-500/25 hover:opacity-90 transition-opacity"
                        >
                          {buttonText} →
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Email Footer */}
                  <div className="p-4 bg-white/[0.02] border-t border-white/[0.08] text-[10px] text-slate-400 text-center space-y-1 font-medium">
                    <p>Sent by {senderName} ({senderEmail})</p>
                    <p>100 Montgomery St, Suite 1400, San Francisco, CA · <span className="text-amber-400 cursor-pointer underline">Unsubscribe</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns Ledger Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Active & Dispatched Email Campaigns</h2>
            <button
              onClick={() => setIsNewCampaignModalOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Create Campaign</span>
            </button>
          </div>

          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/[0.02] text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-white/[0.08]">
                <tr>
                  <th className="px-6 py-4">Campaign Title & Subject</th>
                  <th className="px-6 py-4">Audience Segment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Delivered</th>
                  <th className="px-6 py-4">Open Rate</th>
                  <th className="px-6 py-4 text-right">Click Rate (CTR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {campaigns.map((c) => {
                  const openRate = c.metrics.delivered > 0 ? ((c.metrics.opened / c.metrics.delivered) * 100).toFixed(1) : '0.0';
                  const clickRate = c.metrics.delivered > 0 ? ((c.metrics.clicked / c.metrics.delivered) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={c.id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-xs text-white">{c.name}</div>
                        <div className="text-[11px] text-slate-400 font-medium truncate max-w-sm">{c.subject}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-amber-400">
                        {c.audience}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            c.status === 'SENT'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-white">
                        {c.metrics.delivered.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white">{openRate}%</span>
                          <div className="w-16 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${Math.min(100, Number(openRate))}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30">
                          {clickRate}% CTR
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Real-time Email Telemetry Tab */}
      {activeTab === 'tracking' && (
        <div className="space-y-6">
          {/* Key KPI Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Overall Delivery Rate</span>
                <ShieldCheck size={18} className="text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-400 font-mono">99.4%</div>
              <div className="text-xs text-slate-400 mt-2 font-medium">3,710 / 3,730 Dispatched</div>
            </div>

            <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Average Open Rate</span>
                <Eye size={18} className="text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-white font-mono">44.8%</div>
              <div className="text-xs text-emerald-400 mt-2 font-bold flex items-center gap-1">
                <TrendingUp size={13} /> +12.4% vs B2B industry average
              </div>
            </div>

            <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Click-Through Rate (CTR)</span>
                <MousePointerClick size={18} className="text-sky-400" />
              </div>
              <div className="text-3xl font-extrabold text-sky-400 font-mono">18.6%</div>
              <div className="text-xs text-slate-400 mt-2 font-medium">748 unique link clicks</div>
            </div>

            <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Bounce & Unsub Rate</span>
                <AlertCircle size={18} className="text-slate-400" />
              </div>
              <div className="text-3xl font-extrabold text-white font-mono">0.4%</div>
              <div className="text-xs text-emerald-400 mt-2 font-bold">100% Reputation Score</div>
            </div>
          </div>

          {/* Live Open / Click Event Stream */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-3">
            <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Radio size={15} className="text-emerald-400 animate-pulse" />
                <span>Live Real-Time Email Event Stream</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Telemetry connected via SendGrid / Resend Webhook</span>
            </div>

            <table className="w-full text-sm text-left">
              <thead className="bg-white/[0.02] text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-white/[0.08]">
                <tr>
                  <th className="px-6 py-3.5">Recipient</th>
                  <th className="px-6 py-3.5">Campaign</th>
                  <th className="px-6 py-3.5">Interaction Event</th>
                  <th className="px-6 py-3.5">Device & Client</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-white/[0.04] transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="font-bold text-xs text-white">{ev.recipientName}</div>
                      <div className="text-[11px] font-mono text-slate-400">{ev.recipientEmail}</div>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-300 font-medium">
                      {ev.campaignTitle}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          ev.eventType === 'CLICK'
                            ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {ev.eventType === 'CLICK' ? '🔗 Link Clicked' : '👀 Email Opened'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-300 font-medium">
                      {ev.device}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-300 font-medium">
                      {ev.location}
                    </td>
                    <td className="px-6 py-3.5 text-right text-xs text-slate-400 font-medium">
                      {ev.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Templates Catalog Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Pre-Built High-Converting Email Templates</h2>
              <p className="text-xs text-slate-400 mt-0.5">Click any template to load into the Visual Email Builder instantly.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {initialTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4 flex flex-col justify-between hover:border-amber-500/40 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {tmpl.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">Fully Responsive</span>
                  </div>

                  <h3 className="font-bold text-sm text-white">{tmpl.name}</h3>

                  <div className="rounded-2xl overflow-hidden max-h-36 bg-white/[0.02] border border-white/[0.08]">
                    <img src={tmpl.bannerImage} alt={tmpl.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/[0.06] space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subject</span>
                    <p className="text-xs font-semibold text-white">{tmpl.subject}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => loadTemplate(tmpl)}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-[0.98] cursor-pointer"
                >
                  <Layers size={14} />
                  <span>Customize in Visual Builder</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Send Test Email Modal */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="bg-slate-950/95 border border-white/[0.12] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 text-white">
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
              <h2 className="text-base font-bold text-white">Send Test Email</h2>
              <button onClick={() => setIsTestModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSendTestEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Test Inbox</label>
                <input
                  type="email"
                  required
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08] font-mono"
                />
              </div>

              <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/[0.06] text-xs text-slate-300 space-y-1">
                <span className="font-bold text-white block">Preview Details:</span>
                <p>Subject: {subject}</p>
                <p className="text-[11px] text-slate-400">Sender: {senderName} &lt;{senderEmail}&gt;</p>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-xl text-xs font-semibold border border-white/[0.1] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-orange-500/25 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send size={13} />
                  <span>Send Test Email</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Campaign Modal */}
      {isNewCampaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="bg-slate-950/95 border border-white/[0.12] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 text-white">
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
              <h2 className="text-base font-bold text-white">Broadcast Email Campaign</h2>
              <button onClick={() => setIsNewCampaignModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Executive Webinar Blast"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Audience Segment</label>
                <select
                  value={newCampaignAudience}
                  onChange={(e) => setNewCampaignAudience(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none font-medium"
                >
                  <option value="All Enterprise Contacts (2,840)">All Enterprise Contacts (2,840)</option>
                  <option value="VP & C-Level Decision Makers (890)">VP & C-Level Decision Makers (890)</option>
                  <option value="Active Subscription Customers (450)">Active Subscription Customers (450)</option>
                  <option value="High-Value Deals in Negotiation (120)">High-Value Deals in Negotiation (120)</option>
                </select>
              </div>

              <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-2xl text-xs text-amber-300 space-y-1">
                <span className="font-bold block">Current Template Subject:</span>
                <p className="italic">"{subject}"</p>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsNewCampaignModalOpen(false)}
                  className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-xl text-xs font-semibold border border-white/[0.1] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-orange-500/25 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send size={13} />
                  <span>Broadcast Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
