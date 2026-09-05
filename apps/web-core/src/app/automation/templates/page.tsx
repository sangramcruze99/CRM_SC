'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Layers,
  Sparkles,
  Search,
  ArrowRight,
  Download,
  Zap,
  CheckCircle2,
  Tag,
  Star,
  Copy,
} from 'lucide-react';

const PRESET_TEMPLATES = [
  {
    id: 'tmpl_ai_lead_qual',
    name: 'AI Lead Qualification & Fast-Track Routing',
    description: 'Enriches inbound leads with Apollo-style data, calculates ICP score with Groq, assigns owner, and alerts sales Slack.',
    category: 'Sales',
    author: 'Business OS Enterprise',
    version: '1.2.0',
    usageCount: 540,
    rating: 4.9,
    integrations: ['CRM', 'Slack', 'Groq AI'],
  },
  {
    id: 'tmpl_whatsapp_sales',
    name: 'WhatsApp Autonomous Sales Concierge',
    description: 'Engages inbound WhatsApp prospects, answers pricing queries, and books meetings directly on Google Calendar.',
    category: 'WhatsApp',
    author: 'Business OS Enterprise',
    version: '2.0.0',
    usageCount: 820,
    rating: 5.0,
    integrations: ['WhatsApp Cloud', 'Calendar', 'CRM'],
  },
  {
    id: 'tmpl_missed_call_recovery',
    name: 'Missed Call Rapid AI Recovery',
    description: 'Detects unanswered customer calls and dispatches instant SMS and WhatsApp follow-up with calendar slot.',
    category: 'Voice',
    author: 'Business OS Telephony',
    version: '1.1.0',
    usageCount: 310,
    rating: 4.8,
    integrations: ['Twilio Voice', 'SMS', 'WhatsApp'],
  },
  {
    id: 'tmpl_invoice_processing',
    name: 'Autonomous OCR Invoice & Dual Khata Reconciler',
    description: 'Neural vision scans vendor invoices, checks CFO approval gate if > $1,000, and posts to Dual Khata ledger.',
    category: 'Finance',
    author: 'Business OS Finance Ops',
    version: '1.5.0',
    usageCount: 690,
    rating: 4.9,
    integrations: ['Documents', 'OCR', 'Dual Khata'],
  },
  {
    id: 'tmpl_recruitment_screening',
    name: 'Autonomous Recruitment Resume Screener & Scheduler',
    description: 'Parses incoming candidate resumes via OCR, scores against job description, and schedules interviews.',
    category: 'HR',
    author: 'Business OS People Ops',
    version: '1.0.0',
    usageCount: 420,
    rating: 4.7,
    integrations: ['HR', 'Documents', 'Calendar'],
  },
  {
    id: 'tmpl_abandoned_cart_recovery',
    name: 'Shopify Abandoned Cart Omnichannel Recovery',
    description: 'Recovers lost e-commerce revenue by sending sequence across WhatsApp, Email, and dynamic discount links.',
    category: 'Ecommerce',
    author: 'Business OS Commerce',
    version: '1.3.0',
    usageCount: 780,
    rating: 4.9,
    integrations: ['Shopify', 'WhatsApp', 'Resend'],
  },
  {
    id: 'tmpl_content_autopilot',
    name: 'Autonomous Content Optimization & Repurposing Loop',
    description: 'Analyzes engagement metrics, repurposes top-performing threads into 5 formats, and schedules broadcasts.',
    category: 'Content',
    author: 'Business OS Social Growth',
    version: '2.1.0',
    usageCount: 510,
    rating: 4.8,
    integrations: ['AI Engine', 'Social Studio', 'Memory'],
  },
  {
    id: 'tmpl_voice_receptionist',
    name: 'AI Voice Receptionist & Smart Triage',
    description: 'Answers telephone calls, provides business hours & pricing FAQs, and transfers VIPs to account reps.',
    category: 'Voice',
    author: 'Business OS Telephony',
    version: '1.4.0',
    usageCount: 390,
    rating: 4.8,
    integrations: ['Twilio', 'Whisper STT', 'CRM'],
  },
  {
    id: 'tmpl_browser_extraction',
    name: 'Sandboxed Browser Competitor & Pricing Scraper',
    description: 'Executes sandboxed browser sessions to extract competitor pricing tables and inject into CRM pricebooks.',
    category: 'Browser',
    author: 'Business OS Research',
    version: '1.0.0',
    usageCount: 260,
    rating: 4.6,
    integrations: ['Browser Sandbox', 'CRM'],
  },
];

const CATEGORIES = ['ALL', 'Sales', 'WhatsApp', 'Voice', 'Finance', 'HR', 'Ecommerce', 'Content', 'Browser'];

export default function TemplatesMarketplacePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState<any[]>(PRESET_TEMPLATES);
  const [installingId, setInstallingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/automation/templates')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTemplates(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleInstallTemplate = async (templateId: string) => {
    setInstallingId(templateId);
    try {
      const res = await fetch(`/api/automation/templates/${templateId}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const cloned = await res.json();
        router.push(`/automation/workflows/${cloned.id}`);
      } else {
        router.push(`/automation/workflows/${templateId}`);
      }
    } catch {
      router.push(`/automation/workflows/${templateId}`);
    }
  };

  const filteredTemplates = templates.filter((t) => {
    const matchesCat = selectedCategory === 'ALL' || t.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const CATEGORY_BADGES: Record<string, string> = {
    Sales: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    WhatsApp: 'bg-green-500/15 text-green-400 border-green-500/30',
    Voice: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    Finance: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    HR: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    Ecommerce: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    Content: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
    Browser: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 pb-28">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>Workflow Template Marketplace</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {templates.length} Available
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pre-built enterprise automations with one-click installation into your workspace
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-900/80 p-2.5 rounded-2xl border border-white/10 backdrop-blur-xl shadow-lg">
        {/* Category Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-full sm:w-64 transition"
          />
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredTemplates.map((t) => {
          const badgeStyle = CATEGORY_BADGES[t.category] || 'bg-white/5 text-slate-300 border-white/10';

          return (
            <div
              key={t.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-emerald-500/40 hover:bg-slate-900/95 transition-all shadow-xl backdrop-blur-xl flex flex-col justify-between space-y-4 group min-h-[250px]"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${badgeStyle}`}>
                    {t.category}
                  </span>
                  <div className="flex items-center space-x-1 text-amber-400 text-xs font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{t.rating || 4.9}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-white group-hover:text-emerald-300 transition line-clamp-2 min-h-[40px] leading-snug">
                    {t.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1.5 line-clamp-3 leading-relaxed min-h-[54px]">
                    {t.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(t.integrations || t.requiredIntegrations || []).map((intName: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-white/5 text-slate-300 border border-white/10"
                    >
                      {intName}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div className="text-[11px] text-slate-400 font-medium">
                  <span>{t.usageCount || 100}+ installs</span>
                </div>

                <button
                  onClick={() => handleInstallTemplate(t.id)}
                  disabled={installingId === t.id}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-md shadow-emerald-500/20 disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{installingId === t.id ? 'Opening...' : 'Install'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
