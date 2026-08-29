'use client';

import { useState } from 'react';
import {
  Share2,
  Sparkles,
  Send,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  TrendingUp,
  Users,
  Eye,
  MessageSquare,
  Repeat2,
  Heart,
  Bookmark,
  ExternalLink,
  Plus,
  Check,
  ThumbsUp,
  MoreHorizontal,
  Flame,
  Globe,
  Radio,
} from 'lucide-react';

interface SocialAccount {
  id: string;
  platform: 'facebook' | 'instagram' | 'x' | 'linkedin' | 'tiktok';
  name: string;
  handle: string;
  avatar: string;
  followers: string;
  connected: boolean;
  status: 'active' | 'syncing' | 'reauth_needed';
}

interface SocialPost {
  id: string;
  content: string;
  mediaUrl?: string;
  platforms: ('facebook' | 'instagram' | 'x' | 'linkedin')[];
  status: 'PUBLISHED' | 'SCHEDULED' | 'DRAFT';
  scheduledFor?: string;
  publishedAt?: string;
  metrics: {
    impressions: number;
    likes: number;
    shares: number;
    clicks: number;
  };
}

const initialAccounts: SocialAccount[] = [
  {
    id: 'acc_x',
    platform: 'x',
    name: 'Business OS',
    handle: '@BusinessOS',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    followers: '28.4K',
    connected: true,
    status: 'active',
  },
  {
    id: 'acc_fb',
    platform: 'facebook',
    name: 'Business OS Platform',
    handle: '@businessos.global',
    avatar: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=120&auto=format&fit=crop&q=80',
    followers: '45.1K',
    connected: true,
    status: 'active',
  },
  {
    id: 'acc_ig',
    platform: 'instagram',
    name: 'businessos.hq',
    handle: '@businessos.hq',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    followers: '19.8K',
    connected: true,
    status: 'active',
  },
  {
    id: 'acc_li',
    platform: 'linkedin',
    name: 'Business OS Enterprise Systems',
    handle: 'business-os-global',
    avatar: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=120&auto=format&fit=crop&q=80',
    followers: '62.7K',
    connected: true,
    status: 'active',
  },
  {
    id: 'acc_tt',
    platform: 'tiktok',
    name: 'Business OS Tech',
    handle: '@businessos_tech',
    avatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=120&auto=format&fit=crop&q=80',
    followers: '11.2K',
    connected: true,
    status: 'active',
  },
];

const demoPastPosts: SocialPost[] = [
  {
    id: 'sp_1',
    content: '🚀 Excited to announce our Q3 Business OS Upgrade! Real-time revenue telemetry, AI OCR schema inference, and lightning-fast sub-10ms querying are now live. Experience the future of Enterprise CRM today.',
    mediaUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    platforms: ['x', 'linkedin', 'facebook'],
    status: 'PUBLISHED',
    publishedAt: '2 hours ago',
    metrics: { impressions: 14820, likes: 942, shares: 318, clicks: 1250 },
  },
  {
    id: 'sp_2',
    content: 'Transform the way your global sales team operates. Seamless multi-currency price books, instant PDF e-signatures, and real-time Khata ledger tracking in one unified workspace. #CRM #SalesTech #EnterpriseAI',
    mediaUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    platforms: ['instagram', 'x', 'facebook'],
    status: 'PUBLISHED',
    publishedAt: 'Yesterday',
    metrics: { impressions: 8940, likes: 612, shares: 144, clicks: 780 },
  },
  {
    id: 'sp_3',
    content: 'Join our exclusive webinar this Thursday: "Scaling B2B Operations with Autonomous AI Copilots & Real-Time Deal Intelligence". Register now for free access! 🎟️✨',
    platforms: ['linkedin', 'x'],
    status: 'SCHEDULED',
    scheduledFor: 'Tomorrow, 10:00 AM EST',
    metrics: { impressions: 0, likes: 0, shares: 0, clicks: 0 },
  },
];

const samplePrompts = [
  'Announce our new AI Deal Pipeline assistant with 10x closing velocity',
  'Post about our SOC2 Type II compliance certification and enterprise grade security',
  'Customer success spotlight on Acme Corp increasing team productivity by 45%',
  'Special limited-time promotional discount for annual enterprise seat upgrades',
];

export function SocialMediaClient() {
  const [activeTab, setActiveTab] = useState<'generator' | 'analytics' | 'accounts' | 'scheduled'>('generator');
  const [accounts, setAccounts] = useState<SocialAccount[]>(initialAccounts);
  const [posts, setPosts] = useState<SocialPost[]>(demoPastPosts);

  // Generator Form States
  const [selectedPlatforms, setSelectedPlatforms] = useState<('facebook' | 'instagram' | 'x' | 'linkedin')[]>([
    'x',
    'facebook',
    'instagram',
    'linkedin',
  ]);
  const [topicPrompt, setTopicPrompt] = useState('');
  const [tone, setTone] = useState<'professional' | 'viral' | 'casual' | 'fomo' | 'educational'>('viral');
  const [generatedContent, setGeneratedContent] = useState(
    '⚡ Supercharge your enterprise revenue operations with Business OS. Automated multi-channel pipelines, instant billing ledgers, and intelligent AI copilot assistance — built for high-growth modern teams.\n\n👉 Discover the platform today: https://businessos.io\n\n#CRM #BusinessOS #EnterpriseSaaS #Productivity #AI'
  );
  const [mediaUrl, setMediaUrl] = useState<string>(
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80'
  );
  const [previewPlatform, setPreviewPlatform] = useState<'x' | 'facebook' | 'instagram' | 'linkedin'>('x');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // AI Generator Function
  const handleAIGenerate = () => {
    setIsGenerating(true);
    setAlert(null);

    setTimeout(() => {
      let copy = '';
      const hashtags = '#BusinessOS #EnterpriseTech #CRM #SalesVelocity #AIInnovation';

      if (tone === 'viral') {
        copy = `🚀 Why are 500+ top enterprises ditching legacy CRM systems?\n\nBecause speed wins deals. With Business OS:\n✅ Instant sub-10ms querying & live deal telemetry\n✅ Neural vision OCR invoice & document parsing\n✅ Built-in automated team WhatsApp & email actions\n\nStop losing revenue to slow workflows. Upgrade your workspace now 👇\n🔗 https://businessos.io\n\n${hashtags}`;
      } else if (tone === 'professional') {
        copy = `We are proud to present Business OS: the unified enterprise workspace integrating CRM pipelines, commercial invoicing, SLA management, and SOC2-compliant data isolation.\n\nDesigned for modern enterprise teams that demand security, velocity, and seamless multi-tenant orchestration.\n\nExplore our architectural capabilities: https://businessos.io\n\n${hashtags}`;
      } else if (tone === 'fomo') {
        copy = `⏳ Don't get left behind while your competitors close deals 3x faster.\n\nBusiness OS brings real-time deal Kanban boards, automated quote generation, and instant Stripe payment links right to your fingertip.\n\n🔥 Secure your enterprise deployment tier today before Q3 slots close:\n👉 https://businessos.io\n\n${hashtags}`;
      } else if (tone === 'educational') {
        copy = `💡 3 High-Impact Strategies to Scale B2B Sales in 2026:\n\n1. Centralize your Khata ledger & revenue data\n2. Automate lead follow-ups with intelligent AI prompts\n3. Enforce cryptographic e-signature envelopes for contracts\n\nSee how Business OS implements all three in minutes:\n🔗 https://businessos.io\n\n${hashtags}`;
      } else {
        copy = `Just dropped a huge update to Business OS! 🎉 Work faster with our clean gradient interface, instant custom object builder, and multi-channel team chat. Check it out and let us know what you think!\n\n👉 https://businessos.io\n\n${hashtags}`;
      }

      if (topicPrompt.trim()) {
        copy = `✨ Focused on "${topicPrompt}":\n\n` + copy;
      }

      setGeneratedContent(copy);
      setIsGenerating(false);
      setAlert('AI Post generated tailored for high engagement!');
      setTimeout(() => setAlert(null), 3000);
    }, 900);
  };

  // Toggle platform selection
  const togglePlatform = (p: 'facebook' | 'instagram' | 'x' | 'linkedin') => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((item) => item !== p));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  // Direct Publish Action
  const handlePublishNow = () => {
    if (!generatedContent.trim() || selectedPlatforms.length === 0) return;
    setIsPublishing(true);

    setTimeout(() => {
      const newPost: SocialPost = {
        id: `sp_${Date.now()}`,
        content: generatedContent,
        mediaUrl: mediaUrl || undefined,
        platforms: [...selectedPlatforms],
        status: 'PUBLISHED',
        publishedAt: 'Just now',
        metrics: {
          impressions: Math.floor(Math.random() * 200) + 50,
          likes: Math.floor(Math.random() * 30) + 5,
          shares: Math.floor(Math.random() * 10) + 1,
          clicks: Math.floor(Math.random() * 40) + 8,
        },
      };

      setPosts([newPost, ...posts]);
      setIsPublishing(false);
      setAlert(`🎉 Post successfully published to ${selectedPlatforms.map((p) => p.toUpperCase()).join(', ')}!`);
      setTimeout(() => setAlert(null), 4000);
    }, 1200);
  };

  // Schedule Post Action
  const handleSchedulePost = () => {
    if (!generatedContent.trim() || !scheduleDateTime) return;

    const newPost: SocialPost = {
      id: `sp_${Date.now()}`,
      content: generatedContent,
      mediaUrl: mediaUrl || undefined,
      platforms: [...selectedPlatforms],
      status: 'SCHEDULED',
      scheduledFor: new Date(scheduleDateTime).toLocaleString(),
      metrics: { impressions: 0, likes: 0, shares: 0, clicks: 0 },
    };

    setPosts([newPost, ...posts]);
    setIsScheduleOpen(false);
    setScheduleDateTime('');
    setAlert(`📅 Post scheduled for ${newPost.scheduledFor} across ${selectedPlatforms.length} networks!`);
    setTimeout(() => setAlert(null), 4000);
  };

  // Toggle Account Connection
  const toggleAccountConnect = (id: string) => {
    setAccounts(
      accounts.map((acc) => {
        if (acc.id === id) {
          const nextState = !acc.connected;
          return {
            ...acc,
            connected: nextState,
            status: nextState ? 'active' : 'syncing',
          };
        }
        return acc;
      })
    );
  };

  // Platform styling helpers
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'x':
        return <span className="font-extrabold font-mono text-sm text-white">𝕏</span>;
      case 'facebook':
        return <span className="font-bold text-sm text-blue-400">f</span>;
      case 'instagram':
        return <span className="font-bold text-sm text-pink-400">📷</span>;
      case 'linkedin':
        return <span className="font-bold text-sm text-sky-400">in</span>;
      case 'tiktok':
        return <span className="font-bold text-sm text-white">🎵</span>;
      default:
        return <Globe size={14} className="text-amber-400" />;
    }
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
            <Share2 className="text-amber-400" size={24} />
            Social Media Hub & AI Post Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Generate, preview, schedule, and publish high-converting content across Facebook, Instagram, X (Twitter), LinkedIn, and TikTok.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'generator'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.1] border border-white/[0.1]'
            }`}
          >
            <Sparkles size={14} />
            <span>AI Post Studio</span>
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'scheduled'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.1] border border-white/[0.1]'
            }`}
          >
            <Calendar size={14} />
            <span>Post Queue ({posts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.1] border border-white/[0.1]'
            }`}
          >
            <TrendingUp size={14} />
            <span>Engagement Telemetry</span>
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'accounts'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.1] border border-white/[0.1]'
            }`}
          >
            <Radio size={14} />
            <span>Connected Channels ({accounts.filter((a) => a.connected).length})</span>
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Post Generator Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Target Networks Selector */}
            <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Target Social Channels
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  {selectedPlatforms.length} networks active
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'x', label: '𝕏 / Twitter', color: 'border-white/20 text-white bg-white/[0.06]' },
                  { id: 'facebook', label: 'Facebook Page', color: 'border-blue-500/40 text-blue-300 bg-blue-500/10' },
                  { id: 'instagram', label: 'Instagram Feed', color: 'border-pink-500/40 text-pink-300 bg-pink-500/10' },
                  { id: 'linkedin', label: 'LinkedIn Org', color: 'border-sky-500/40 text-sky-300 bg-sky-500/10' },
                ].map((item) => {
                  const isSelected = selectedPlatforms.includes(item.id as any);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => togglePlatform(item.id as any)}
                      className={`px-3 py-2.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? `${item.color} shadow-xs ring-2 ring-amber-500/30`
                          : 'border-white/[0.08] bg-white/[0.02] text-slate-500 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isSelected ? (
                        <Check size={14} className="text-amber-400" />
                      ) : (
                        <Plus size={14} className="text-slate-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Generator Controls */}
            <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-400" />
                    <span>Campaign Topic or Goal Prompt</span>
                  </label>
                  <span className="text-[11px] text-amber-400 font-semibold cursor-pointer hover:underline" onClick={() => setTopicPrompt(samplePrompts[Math.floor(Math.random() * samplePrompts.length)])}>
                    🎲 Try Random Prompt
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Announce our enterprise CRM release with automated OCR..."
                  value={topicPrompt}
                  onChange={(e) => setTopicPrompt(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:bg-white/[0.08] font-medium"
                />
              </div>

              {/* Tone Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
                  Brand Voice & Tone
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'viral', label: '🔥 Viral & Hooky' },
                    { id: 'professional', label: '💼 Enterprise Authority' },
                    { id: 'fomo', label: '⚡ Urgent & FOMO' },
                    { id: 'educational', label: '📚 Educational Tips' },
                    { id: 'casual', label: '✨ Friendly & Casual' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTone(t.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        tone === t.id
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                          : 'bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.1]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Post Content Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Generated Copy & Hashtags
                  </label>
                  <span className="text-[11px] font-mono text-slate-400 font-medium">
                    {generatedContent.length} chars (X limit: 280 / IG: 2,200)
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08] font-medium leading-relaxed"
                  placeholder="Write or generate your post copy..."
                />
              </div>

              {/* Media URL / Asset */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-amber-400" />
                  <span>Attach Image or Video Preview URL</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setMediaUrl('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80')}
                    className="px-3 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-xl text-xs font-semibold border border-white/[0.1] cursor-pointer"
                  >
                    Sample Asset
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleAIGenerate}
                  disabled={isGenerating}
                  className="px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <Sparkles size={14} className={isGenerating ? 'animate-spin' : ''} />
                  <span>{isGenerating ? 'Generating with Neural AI...' : 'Re-Generate AI Copy'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsScheduleOpen(!isScheduleOpen)}
                    className="px-3.5 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.1] rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Calendar size={14} />
                    <span>Schedule</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePublishNow}
                    disabled={isPublishing}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-orange-500/25 active:scale-[0.98] border border-amber-400/40 cursor-pointer disabled:opacity-50"
                  >
                    <Send size={14} />
                    <span>{isPublishing ? 'Transmitting to APIs...' : `Publish Now to ${selectedPlatforms.length} Networks`}</span>
                  </button>
                </div>
              </div>

              {/* Schedule Datetime Form Collapse */}
              {isScheduleOpen && (
                <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white">Set Auto-Publish Timestamp</label>
                    <span className="text-[11px] text-slate-400">Timezone: UTC / Local Sync</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="datetime-local"
                      value={scheduleDateTime}
                      onChange={(e) => setScheduleDateTime(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleSchedulePost}
                      disabled={!scheduleDateTime}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 font-bold rounded-xl text-xs shadow-md cursor-pointer"
                    >
                      Confirm Schedule
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Mockup Simulator (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Live Channel Mockup
                  </span>
                </div>

                {/* Preview Switcher */}
                <div className="flex items-center gap-1 bg-white/[0.06] p-1 rounded-xl">
                  {(['x', 'facebook', 'instagram', 'linkedin'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPreviewPlatform(p)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                        previewPlatform === p
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-2xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {p === 'x' ? '𝕏' : p === 'facebook' ? 'FB' : p === 'instagram' ? 'IG' : 'IN'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 𝕏 (Twitter) Mockup Preview */}
              {previewPlatform === 'x' && (
                <div className="border border-white/[0.08] rounded-2xl p-4 bg-white/[0.02] shadow-2xs space-y-3 font-sans">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-bold text-sm shadow-xs">
                        B
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-xs text-white">Business OS</span>
                          <span className="text-amber-400 text-xs">✓</span>
                        </div>
                        <span className="text-[11px] text-slate-400">@BusinessOS · 1m</span>
                      </div>
                    </div>
                    <span className="font-mono text-slate-400 text-xs">𝕏</span>
                  </div>

                  <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {generatedContent}
                  </p>

                  {mediaUrl && (
                    <div className="rounded-xl overflow-hidden border border-white/[0.08] max-h-52 bg-white/[0.02]">
                      <img src={mediaUrl} alt="Post Attachment" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-400 text-xs pt-2 border-t border-white/[0.08] font-medium">
                    <div className="flex items-center gap-1 hover:text-amber-400 cursor-pointer">
                      <MessageSquare size={13} /> <span>18</span>
                    </div>
                    <div className="flex items-center gap-1 hover:text-emerald-400 cursor-pointer">
                      <Repeat2 size={13} /> <span>42</span>
                    </div>
                    <div className="flex items-center gap-1 hover:text-rose-400 cursor-pointer">
                      <Heart size={13} /> <span>219</span>
                    </div>
                    <div className="flex items-center gap-1 hover:text-sky-400 cursor-pointer">
                      <Bookmark size={13} /> <span>34</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Facebook Mockup Preview */}
              {previewPlatform === 'facebook' && (
                <div className="border border-white/[0.08] rounded-2xl p-4 bg-white/[0.02] shadow-2xs space-y-3 font-sans">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                        f
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-xs text-white">Business OS Platform</span>
                          <span className="text-blue-400 text-xs">✓</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Just now · 🌍 Public</span>
                      </div>
                    </div>
                    <MoreHorizontal size={16} className="text-slate-400" />
                  </div>

                  <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {generatedContent}
                  </p>

                  {mediaUrl && (
                    <div className="rounded-xl overflow-hidden border border-white/[0.08] max-h-52 bg-white/[0.02]">
                      <img src={mediaUrl} alt="FB Post Media" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 py-1 border-b border-white/[0.08] font-medium">
                    <div className="flex items-center gap-1">
                      <span className="p-0.5 bg-blue-600 text-white rounded-full text-[9px]">👍</span>
                      <span>148 people</span>
                    </div>
                    <span>26 Comments · 14 Shares</span>
                  </div>

                  <div className="grid grid-cols-3 text-center text-xs text-slate-300 font-bold pt-1">
                    <button className="flex items-center justify-center gap-1.5 py-1.5 hover:bg-white/[0.06] rounded-lg cursor-pointer">
                      <ThumbsUp size={14} /> <span>Like</span>
                    </button>
                    <button className="flex items-center justify-center gap-1.5 py-1.5 hover:bg-white/[0.06] rounded-lg cursor-pointer">
                      <MessageSquare size={14} /> <span>Comment</span>
                    </button>
                    <button className="flex items-center justify-center gap-1.5 py-1.5 hover:bg-white/[0.06] rounded-lg cursor-pointer">
                      <Share2 size={14} /> <span>Share</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Instagram Mockup Preview */}
              {previewPlatform === 'instagram' && (
                <div className="border border-white/[0.08] rounded-2xl p-4 bg-white/[0.02] shadow-2xs space-y-3 font-sans">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2px]">
                        <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center font-bold text-xs text-amber-400">
                          BO
                        </div>
                      </div>
                      <div>
                        <span className="font-bold text-xs text-white block">businessos.hq</span>
                        <span className="text-[10px] text-slate-400 block">Sponsored</span>
                      </div>
                    </div>
                    <MoreHorizontal size={16} className="text-slate-400" />
                  </div>

                  {mediaUrl ? (
                    <div className="rounded-xl overflow-hidden max-h-56 bg-white/[0.02] border border-white/[0.08]">
                      <img src={mediaUrl} alt="Instagram Media" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-44 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-center text-slate-500 text-xs">
                      No Media Attached
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-400">
                    <div className="flex items-center gap-3">
                      <Heart size={16} className="hover:text-rose-400 cursor-pointer" />
                      <MessageSquare size={16} className="hover:text-amber-400 cursor-pointer" />
                      <Send size={16} className="hover:text-amber-400 cursor-pointer" />
                    </div>
                    <Bookmark size={16} className="hover:text-white cursor-pointer" />
                  </div>

                  <div className="text-xs space-y-1">
                    <span className="font-bold text-white">624 likes</span>
                    <p className="text-slate-300 line-clamp-3">
                      <span className="font-bold text-white mr-1.5">businessos.hq</span>
                      {generatedContent}
                    </p>
                    <span className="text-[10px] text-slate-500 uppercase">View all 38 comments</span>
                  </div>
                </div>
              )}

              {/* LinkedIn Mockup Preview */}
              {previewPlatform === 'linkedin' && (
                <div className="border border-white/[0.08] rounded-2xl p-4 bg-white/[0.02] shadow-2xs space-y-3 font-sans">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-sky-700 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                        in
                      </div>
                      <div>
                        <span className="font-bold text-xs text-white block">Business OS Enterprise Systems</span>
                        <span className="text-[10px] text-slate-400 block">62,700 followers · Promoted</span>
                      </div>
                    </div>
                    <MoreHorizontal size={16} className="text-slate-400" />
                  </div>

                  <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {generatedContent}
                  </p>

                  {mediaUrl && (
                    <div className="rounded-xl overflow-hidden border border-white/[0.08] max-h-52 bg-white/[0.02]">
                      <img src={mediaUrl} alt="LinkedIn Post Media" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/[0.08] font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sky-400">👍</span>
                      <span className="text-emerald-400">👏</span>
                      <span>384 reactions</span>
                    </div>
                    <span>49 comments · 18 reposts</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Queue Tab */}
      {activeTab === 'scheduled' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Live Post Queue & Broadcast History</h2>
            <button
              onClick={() => setActiveTab('generator')}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Compose New Post</span>
            </button>
          </div>

          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/[0.02] text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-white/[0.08]">
                <tr>
                  <th className="px-6 py-4">Content Excerpt</th>
                  <th className="px-6 py-4">Target Networks</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4 text-right">Impressions / Reach</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {posts.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.04] transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-xs font-semibold text-white line-clamp-2 max-w-md">
                        {p.content}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {p.platforms.map((platform) => (
                          <span
                            key={platform}
                            className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-slate-300 text-[11px] font-bold uppercase"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          p.status === 'PUBLISHED'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                      {p.publishedAt || p.scheduledFor}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-xs font-bold text-white">
                      {p.metrics.impressions > 0 ? `${p.metrics.impressions.toLocaleString()} views` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Impressions</span>
                <Eye size={18} className="text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-white font-mono">148,290</div>
              <div className="text-xs text-emerald-400 mt-2 font-bold flex items-center gap-1">
                <TrendingUp size={13} /> +34.8% vs last 30 days
              </div>
            </div>

            <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Link Clicks</span>
                <ExternalLink size={18} className="text-sky-400" />
              </div>
              <div className="text-3xl font-extrabold text-white font-mono">12,480</div>
              <div className="text-xs text-emerald-400 mt-2 font-bold flex items-center gap-1">
                <TrendingUp size={13} /> 8.4% Average CTR
              </div>
            </div>

            <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Engaged Audience</span>
                <Users size={18} className="text-purple-400" />
              </div>
              <div className="text-3xl font-extrabold text-white font-mono">167.2K</div>
              <div className="text-xs text-purple-300 mt-2 font-bold">Across 5 connected networks</div>
            </div>

            <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">AI Virality Index</span>
                <Flame size={18} className="text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-amber-400 font-mono">94 / 100</div>
              <div className="text-xs text-slate-400 mt-2 font-medium">Top 5% SaaS engagement tier</div>
            </div>
          </div>

          {/* Platform Performance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Network Engagement Breakdown
              </h3>
              <div className="space-y-3 font-medium">
                {[
                  { name: '𝕏 / Twitter', percent: 42, color: 'bg-amber-500', count: '62,280 views' },
                  { name: 'LinkedIn Org', percent: 34, color: 'bg-sky-500', count: '50,410 views' },
                  { name: 'Facebook Page', percent: 14, color: 'bg-blue-500', count: '20,760 views' },
                  { name: 'Instagram Feed', percent: 10, color: 'bg-pink-500', count: '14,840 views' },
                ].map((item) => (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-white font-bold">{item.name}</span>
                      <span className="text-slate-400 font-mono">{item.count} ({item.percent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Top Converting Content Topics
              </h3>
              <div className="space-y-3 font-medium">
                {[
                  { topic: 'AI Schema Inference & OCR Demos', rate: '14.2% CTR', leads: '48 Leads' },
                  { topic: 'Real-time Khata Billing Ledgers', rate: '11.8% CTR', leads: '34 Leads' },
                  { topic: 'SOC2 Security & Multi-Tenant JWT', rate: '9.4% CTR', leads: '29 Leads' },
                  { topic: 'Quarterly Feature Release Notes', rate: '7.9% CTR', leads: '18 Leads' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-xs">
                    <div>
                      <span className="font-bold text-white block">{item.topic}</span>
                      <span className="text-amber-400 text-[11px] font-semibold">{item.leads} generated</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-xl border border-emerald-500/30">
                      {item.rate}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connected Accounts Tab */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Connected Social Media Channels</h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage OAuth credentials and live publishing token sync states.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 bg-white/[0.06] flex items-center justify-center text-xl">
                        {getPlatformIcon(acc.platform)}
                      </div>
                      <div>
                        <h3 className="font-bold text-xs text-white">{acc.name}</h3>
                        <span className="text-[11px] text-slate-400 font-mono">{acc.handle}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        acc.connected
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-white/[0.06] text-slate-400 border border-white/10'
                      }`}
                    >
                      {acc.connected ? 'ACTIVE' : 'DISCONNECTED'}
                    </span>
                  </div>

                  <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/[0.06] flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Follower Reach</span>
                    <span className="font-bold text-white font-mono">{acc.followers}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    OAuth 2.0 / Token OK
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleAccountConnect(acc.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                      acc.connected
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold border-amber-400/40'
                    }`}
                  >
                    {acc.connected ? 'Disconnect' : 'Connect Channel'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
