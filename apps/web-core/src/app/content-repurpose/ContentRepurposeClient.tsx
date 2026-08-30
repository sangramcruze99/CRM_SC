'use client';

import React, { useState } from 'react';
import {
  Share2,
  Sparkles,
  Video,
  FileText,
  Copy,
  Check,
  Calendar,
  Send,
  Play,
  CheckCircle2,
  Clock,
  Layers,
  Upload,
  Hash,
  Eye,
  Sliders,
  TrendingUp,
  MessageCircle,
} from 'lucide-react';

interface PlatformOutput {
  linkedin: string;
  twitterThread: string[];
  threadsCaption: string;
  reelsScript: {
    hook: string;
    bodyWithCues: string;
    cta: string;
  };
  newsletterSummary: string;
  hashtags: string[];
  viralQuotes: string[];
}

const SAMPLE_TRANSCRIPTS = {
  saas_automation: {
    title: 'How Autonomous Workflows Replace 40 Hours of CRM Manual Busywork',
    duration: '14 mins 32 secs (Podcast Episode #42)',
    rawText: `Most companies don't have a lead generation problem—they have a speed-to-lead problem. When a prospect fills out a contact form or sends an inbound DM, every minute that passes drops conversion by over 7%. In this episode, we break down how modern B2B businesses use multi-step autonomous pipelines. Instead of a sales rep spending 20 minutes manually researching a prospect's tech stack on LinkedIn, an LLM pipeline crawls their domain, scores priority against ICP criteria, drafts a personalized email referencing their latest funding round, and pings the rep on Slack with a 1-click send button. Similarly, with Intelligent Document Processing, reviewing PDFs and invoices shouldn't take human accountants dozens of hours. Neural vision extracts line items, validates totals against QuickBooks, and auto-posts to the ledger. If you want to scale revenue in 2026, eliminate manual glue work.`,
    output: {
      linkedin: `Most companies don't have a lead generation problem.

They have a SPEED-TO-LEAD problem. ⏱️

Every minute that passes between an inbound form submission and your first response drops conversion rates by over 7%.

Here is how high-growth B2B teams are automating the entire cycle:

1️⃣ Real-Time Web Recon: Inbound webhook triggers autonomous web crawl of the prospect's tech stack and recent announcements.
2️⃣ Priority Scoring: LLM evaluates ICP fit, buying signals, and budget authority (1-100 scale).
3️⃣ Contextual Drafting: Generates a bespoke email draft referencing specific company pain points.
4️⃣ Slack Action Card: Pings the rep with a 1-click "Approve & Send" button.

Result? Response times drop from 4 hours to under 4 seconds.

Are you still having your sales reps manually research prospect websites? Let's discuss in the comments. 👇`,
      twitterThread: [
        `1/ Most companies don't have a lead gen problem.\n\nThey have a SPEED-TO-LEAD problem.\n\nEvery minute that passes before follow-up drops conversion by 7%.\n\nHere is how top B2B teams automate the entire cycle in 4 seconds: 🧵👇`,
        `2/ When a lead submits a form:\n\n❌ Old way: Rep gets an email notification, waits 3 hours, manually checks LinkedIn, and copy-pastes a generic template.\n\n✅ 2026 way: Multi-step autonomous pipeline runs instantly.`,
        `3/ Step 1 & 2: Autonomous Recon & Scoring\n\nAn LLM crawls the prospect's company website, detects their tech stack & headcount, and scores priority (1-100) against your exact ICP.`,
        `4/ Step 3 & 4: Contextual Email & Slack Ping\n\nThe pipeline drafts a personalized email citing their recent press release and pings the account executive in Slack with a 1-click send button.`,
        `5/ The takeaway: Eliminate manual glue work.\n\nAutomate lead qualification, document processing, and data sync so your team can focus purely on closing deals.\n\nRT if your team needs this! ⚡`,
      ],
      threadsCaption: `Speed-to-lead is everything in 2026. ⚡\n\nIf you take 4 hours to follow up with an inbound lead, your competitor who replied in 4 seconds already booked the meeting.\n\nHere is the 4-step pipeline our team uses to automate research, ICP priority scoring, and email drafting before a rep even opens their laptop. 🚀\n\nSwipe to see the exact workflow architecture! ➡️`,
      reelsScript: {
        hook: `[Hook Text Overlay: "Why 90% of B2B Leads Go Cold in 5 Minutes"]\n[Visual: Fast-paced cut of slow email typing vs automated Slack alert]`,
        bodyWithCues: `[Voiceover]: "If a lead fills out your contact form and you take hours to respond, you already lost them.\n[Visual: Screen zooms into Business OS Autonomous Pipeline node graph]\nHere's what top teams do instead:\nAn autonomous agent crawls the company domain, scores their priority out of 100, drafts a personalized email, and pings the rep on Slack in 3 seconds.\n[Visual: 1-Click Send button glowing on phone screen]\nOne tap to send. Zero manual research."`,
        cta: `[Voiceover]: "Drop 'AUTOMATE' in the comments to get our full blueprint."`,
      },
      newsletterSummary: `⚡ **Executive Digest: The Death of Manual Lead Research**\n\nSpeed-to-lead dictates conversion. In this breakdown, we reveal how autonomous LLM pipelines compress a 20-minute manual SDR research workflow into a 3.7-second automated pipeline that enriches CRM data, scores ICP priority, and drafts personalized outreach with zero human friction.`,
      hashtags: ['#B2BAutomation', '#LeadGeneration', '#AIWorkflows', '#SaaSGrowth', '#SalesOps', '#BusinessOS'],
      viralQuotes: [
        '“Most companies don’t have a lead generation problem—they have a speed-to-lead problem.”',
        '“Every minute that passes between an inbound form and follow-up drops conversion by over 7%.”',
        '“Eliminate manual glue work in 2026 to scale revenue.”',
      ],
    },
  },
};

export function ContentRepurposeClient() {
  const [activeTab, setActiveTab] = useState<'linkedin' | 'twitter' | 'threads' | 'reels' | 'newsletter'>('linkedin');
  const [selectedPreset] = useState(SAMPLE_TRANSCRIPTS.saas_automation);
  const [rawContent, setRawContent] = useState(SAMPLE_TRANSCRIPTS.saas_automation.rawText);
  const [output, setOutput] = useState<PlatformOutput>(SAMPLE_TRANSCRIPTS.saas_automation.output);
  const [isGenerating, setIsGenerating] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleRepurposeContent = () => {
    setIsGenerating(true);
    setAlert('✨ AI transcribing, chunking viral insights, and generating 5 platform-tailored formats...');

    setTimeout(() => {
      setIsGenerating(false);
      setAlert('🎉 Repurposing complete! Created LinkedIn post, 5-tweet thread, Threads caption, Reels script & Newsletter digest.');
      setTimeout(() => setAlert(null), 4500);
    }, 1500);
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleScheduleQueue = (platform: string) => {
    setAlert(`📅 Scheduled ${platform} content to Multi-Channel Queue for optimal engagement window!`);
    setTimeout(() => setAlert(null), 3500);
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
              Omnichannel Creator Engine
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              1 Input ➔ 5 Formats
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5 mt-1">
            <Share2 className="text-amber-400" size={24} />
            Repurposing & Multi-Platform Content Pipeline Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload a single long-form video, podcast, or blog draft. The pipeline automatically transcribes, extracts short viral clips, generates trending hashtags, crafts platform-specific captions, and queues them for publishing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleRepurposeContent}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-orange-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles size={14} className={isGenerating ? 'animate-spin' : ''} />
            <span>{isGenerating ? 'Synthesizing Pipeline...' : 'Generate 5 Platform Formats'}</span>
          </button>
        </div>
      </div>

      {/* Main Split: Left Ingestion Hub, Right Platform Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Video/Audio/Blog Ingestion */}
        <div className="lg:col-span-5 space-y-6">
          {/* Source Dropzone Card */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Video size={16} className="text-amber-400" />
                <span>Source Media / Text Ingestion</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-400">Whisper AI Ready</span>
            </div>

            <div className="border-2 border-dashed border-white/20 hover:border-amber-400/50 rounded-2xl p-6 text-center space-y-2 transition-colors bg-white/[0.02]">
              <Upload size={26} className="mx-auto text-amber-400" />
              <div>
                <p className="text-xs font-bold text-white">Upload Long-Form Video or Audio</p>
                <p className="text-[11px] text-slate-500">MP4, MOV, MP3, WAV up to 500MB</p>
              </div>
              <input
                type="file"
                accept="video/*,audio/*"
                onChange={() => handleRepurposeContent()}
                className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
              />
            </div>

            {/* Raw Transcript / Blog Textarea */}
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-bold text-slate-400">
                Or Paste Long-Form Article / Podcast Transcript:
              </label>
              <textarea
                rows={6}
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                className="w-full p-3 bg-white/[0.05] border border-white/[0.1] rounded-2xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:bg-white/[0.08] font-sans leading-relaxed resize-none"
              />
            </div>

            {/* Extracted Viral Soundbites */}
            <div className="space-y-2 pt-2 border-t border-white/[0.06]">
              <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp size={13} />
                <span>Extracted Viral Soundbites</span>
              </h4>
              <div className="space-y-1.5">
                {output.viralQuotes.map((q, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-300 italic flex items-start justify-between gap-2"
                  >
                    <span>{q}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(q, `quote_${i}`)}
                      className="text-slate-400 hover:text-amber-400 shrink-0 cursor-pointer"
                    >
                      {copiedKey === `quote_${i}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Hashtags */}
            <div className="space-y-2 pt-2 border-t border-white/[0.06]">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Hash size={13} className="text-amber-400" />
                <span>Optimized Trending Hashtags</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {output.hashtags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-lg text-[11px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Platform-Specific Output Tabs & Previews */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-5">
            {/* Platform Selector Tabs */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'linkedin', label: '💼 LinkedIn Post' },
                  { id: 'twitter', label: '𝕏 5-Tweet Thread' },
                  { id: 'threads', label: '🧵 Threads / IG' },
                  { id: 'reels', label: '🎬 Shorts / Reels Script' },
                  { id: 'newsletter', label: '✉️ Newsletter' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                        : 'bg-white/[0.06] text-slate-300 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Tab Content */}
            {activeTab === 'linkedin' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">Format: Thought-Leadership Post</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyText(output.linkedin, 'linkedin')}
                      className="px-3 py-1 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-lg text-xs font-semibold border border-white/[0.08] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'linkedin' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiedKey === 'linkedin' ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScheduleQueue('LinkedIn')}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1"
                    >
                      <Calendar size={12} />
                      <span>Queue to LinkedIn</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/[0.08] text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                  {output.linkedin}
                </div>
              </div>
            )}

            {activeTab === 'twitter' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">Format: 5-Part Thread + Hook</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyText(output.twitterThread.join('\n\n---\n\n'), 'twitter')}
                      className="px-3 py-1 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-lg text-xs font-semibold border border-white/[0.08] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'twitter' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiedKey === 'twitter' ? 'Copied All' : 'Copy All'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScheduleQueue('𝕏 (Twitter)')}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1"
                    >
                      <Calendar size={12} />
                      <span>Schedule Thread</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {output.twitterThread.map((tweet, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/[0.08] text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans space-y-2"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pb-1 border-b border-white/[0.04]">
                        <span>Tweet #{idx + 1} of {output.twitterThread.length}</span>
                        <span>{tweet.length} / 280 chars</span>
                      </div>
                      <p>{tweet}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'threads' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">Format: Conversational Caption</span>
                  <button
                    type="button"
                    onClick={() => handleScheduleQueue('Threads & Instagram')}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1"
                  >
                    <Calendar size={12} />
                    <span>Queue Post</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/[0.08] text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                  {output.threadsCaption}
                </div>
              </div>
            )}

            {activeTab === 'reels' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">Format: 30-60s Script with Visual Cues</span>
                  <button
                    type="button"
                    onClick={() => handleCopyText(`${output.reelsScript.hook}\n\n${output.reelsScript.bodyWithCues}\n\n${output.reelsScript.cta}`, 'reels')}
                    className="px-3 py-1 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-lg text-xs font-semibold border border-white/[0.08] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'reels' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>Copy Script</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/[0.08] space-y-3 text-xs text-slate-200 leading-relaxed font-sans">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
                    <span className="font-bold text-[10px] uppercase block mb-0.5">Opening Hook:</span>
                    {output.reelsScript.hook}
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                    <span className="font-bold text-[10px] text-slate-400 uppercase block">Script & Director Cues:</span>
                    <p className="whitespace-pre-line">{output.reelsScript.bodyWithCues}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200">
                    <span className="font-bold text-[10px] uppercase block mb-0.5">Call to Action:</span>
                    {output.reelsScript.cta}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'newsletter' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">Format: Executive Digest</span>
                  <button
                    type="button"
                    onClick={() => handleScheduleQueue('Email Newsletter')}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1"
                  >
                    <Send size={12} />
                    <span>Send via Email Marketing</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/[0.08] text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                  {output.newsletterSummary}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
