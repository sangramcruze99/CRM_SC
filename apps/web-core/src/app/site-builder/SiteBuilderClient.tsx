'use client';

import React, { useState } from 'react';
import {
  Layout,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Copy,
  Eye,
  Smartphone,
  Tablet,
  Monitor,
  Code2,
  Sparkles,
  CheckCircle2,
  Layers,
  Palette,
  Globe,
  Sliders,
  Share2,
  ArrowRight,
  ShieldCheck,
  Check,
  Send,
  Star,
  ExternalLink,
  ChevronDown,
  Building,
  Stethoscope,
  Home,
  UtensilsCrossed,
  ShoppingBag,
  Zap,
} from 'lucide-react';

export type BlockType =
  | 'HERO'
  | 'FEATURES'
  | 'LEAD_FORM'
  | 'PRICING'
  | 'TESTIMONIALS'
  | 'CTA'
  | 'FOOTER';

export interface SiteBlock {
  id: string;
  type: BlockType;
  title: string;
  subtitle: string;
  buttonText?: string;
  buttonLink?: string;
  badge?: string;
  items?: Array<{
    title: string;
    desc: string;
    icon?: string;
    price?: string;
    author?: string;
    role?: string;
  }>;
  style: {
    bgColor: string;
    textColor: string;
    align: 'left' | 'center' | 'right';
  };
}

const TEMPLATE_PRESETS: Record<string, { name: string; icon: any; blocks: SiteBlock[] }> = {
  saas: {
    name: 'Modern Enterprise SaaS',
    icon: Building,
    blocks: [
      {
        id: 'hero-1',
        type: 'HERO',
        title: 'Accelerate Your Enterprise Revenue With Autonomous AI',
        subtitle: 'The all-in-one unified Business OS that replaces 15 disparate tools with one lightning-fast platform.',
        buttonText: 'Start Free 14-Day Trial',
        buttonLink: '#lead-form',
        badge: '✨ Next-Gen Business OS v4.8',
        style: { bgColor: 'bg-transparent', textColor: 'text-white', align: 'center' },
      },
      {
        id: 'features-1',
        type: 'FEATURES',
        title: 'Engineered for High-Velocity Growth',
        subtitle: 'Everything your revenue and operations teams need to scale seamlessly.',
        style: { bgColor: 'bg-white/[0.02]', textColor: 'text-white', align: 'center' },
        items: [
          { title: 'AI Voice Softphone', desc: 'Integrated WebRTC dialer with live speech-to-text battlecards and CRM sync.' },
          { title: 'Unified Omnichannel Inbox', desc: 'Manage WhatsApp, SMS, Instagram, Messenger, and Email in a single stream.' },
          { title: 'Dual Khata Ledger & Forex', desc: 'Real-time multi-currency bookkeeping and automated Plaid bank reconciliation.' },
        ],
      },
      {
        id: 'lead-form-1',
        type: 'LEAD_FORM',
        title: 'Request an Executive VIP Demo',
        subtitle: 'Our enterprise specialists will build a custom workflow model for your company.',
        buttonText: 'Book VIP Walkthrough',
        style: { bgColor: 'bg-amber-500/10', textColor: 'text-white', align: 'center' },
      },
      {
        id: 'testimonials-1',
        type: 'TESTIMONIALS',
        title: 'Trusted by 4,500+ Industry Leaders',
        subtitle: 'See how companies achieved a 340% increase in pipeline conversion.',
        style: { bgColor: 'bg-transparent', textColor: 'text-white', align: 'center' },
        items: [
          { title: 'Game-Changer for Our Sales Team', desc: 'Replacing our legacy CRM reduced onboarding time from weeks to 20 minutes.', author: 'Sarah Jenkins', role: 'VP Revenue, Apex Scale' },
          { title: 'Unmatched All-In-One Power', desc: 'From invoices to SIM gateway and lead prospecting, everything works seamlessly.', author: 'Marcus Vance', role: 'Founder, CloudFlow' },
        ],
      },
      {
        id: 'footer-1',
        type: 'FOOTER',
        title: 'Acme Enterprise OS',
        subtitle: '© 2026 Acme Global Technologies Inc. All rights reserved.',
        style: { bgColor: 'bg-slate-950/80', textColor: 'text-slate-400', align: 'center' },
      },
    ],
  },
  hospital: {
    name: 'Healthcare & Medical Clinic',
    icon: Stethoscope,
    blocks: [
      {
        id: 'h-hero',
        type: 'HERO',
        title: 'Compassionate, World-Class Healthcare At Your Fingertips',
        subtitle: 'Book appointments, consult board-certified specialists, and manage prescriptions online 24/7.',
        buttonText: 'Schedule Clinical Appointment',
        badge: '🏥 JCI Accredited Hospital',
        style: { bgColor: 'bg-transparent', textColor: 'text-white', align: 'center' },
      },
      {
        id: 'h-features',
        type: 'FEATURES',
        title: 'Comprehensive Specialized Care',
        subtitle: 'Modern medical facilities and top diagnostic technologies for you and your family.',
        style: { bgColor: 'bg-rose-500/5', textColor: 'text-white', align: 'center' },
        items: [
          { title: 'Digital EHR & Telemedicine', desc: 'Instant video consultations with verified physicians and digital prescriptions.' },
          { title: '24/7 Emergency & ICU Care', desc: 'Rapid-response trauma center with live triage telemetry and bed tracking.' },
          { title: 'Comprehensive Diagnostic Lab', desc: 'Same-day pathology, high-res MRI, and automated digital health reports.' },
        ],
      },
      {
        id: 'h-form',
        type: 'LEAD_FORM',
        title: 'Book a Doctor Consultation',
        subtitle: 'Select your clinical department and preferred time slot.',
        buttonText: 'Confirm Booking Request',
        style: { bgColor: 'bg-rose-500/10', textColor: 'text-white', align: 'center' },
      },
      {
        id: 'h-footer',
        type: 'FOOTER',
        title: 'Apex Memorial Hospital',
        subtitle: 'Licensed by the National Department of Health · 24/7 Emergency Helpline: 1-800-MED-CARE',
        style: { bgColor: 'bg-slate-950/80', textColor: 'text-slate-400', align: 'center' },
      },
    ],
  },
  realestate: {
    name: 'Luxury Real Estate Showcase',
    icon: Home,
    blocks: [
      {
        id: 're-hero',
        type: 'HERO',
        title: 'Exclusive Architectural Estates & Prime Residences',
        subtitle: 'Discover private off-market penthouses, waterfront villas, and prime commercial investments.',
        buttonText: 'Explore Private Portfolio',
        badge: '🏡 Luxury Brokerage MLS Partner',
        style: { bgColor: 'bg-transparent', textColor: 'text-white', align: 'center' },
      },
      {
        id: 're-features',
        type: 'FEATURES',
        title: 'Curated Property Highlights',
        subtitle: 'Explore our latest luxury acquisitions with virtual 3D tours.',
        style: { bgColor: 'bg-emerald-500/5', textColor: 'text-white', align: 'center' },
        items: [
          { title: 'The Sky Penthouse — Tribeca', desc: '5 Beds · 6.5 Baths · 7,200 sqft with 360° skyline wraparound terrace. ($14.8M)' },
          { title: 'Oceanfront Villa — Palm Beach', desc: 'Private beach access, infinity pool, and dock with deep-water yacht mooring. ($22.5M)' },
          { title: 'Modern Alpine Chalet — Aspen', desc: 'Ski-in ski-out estate with heated driveways, wine cellar, and wellness spa. ($18.2M)' },
        ],
      },
      {
        id: 're-form',
        type: 'LEAD_FORM',
        title: 'Schedule a Private VIP Showing',
        subtitle: 'Our luxury estate advisors will arrange a discreet private showing.',
        buttonText: 'Request Showing Access',
        style: { bgColor: 'bg-emerald-500/10', textColor: 'text-white', align: 'center' },
      },
      {
        id: 're-footer',
        type: 'FOOTER',
        title: 'Vanguard Luxury Real Estate Group',
        subtitle: 'Licensed Real Estate Brokerage · Equal Housing Opportunity',
        style: { bgColor: 'bg-slate-950/80', textColor: 'text-slate-400', align: 'center' },
      },
    ],
  },
};

export function SiteBuilderClient() {
  const [blocks, setBlocks] = useState<SiteBlock[]>(TEMPLATE_PRESETS.saas.blocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(blocks[0].id);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) || null;

  const handleAddBlock = (type: BlockType) => {
    const newId = `${type.toLowerCase()}-${Date.now()}`;
    let newBlock: SiteBlock;

    switch (type) {
      case 'HERO':
        newBlock = {
          id: newId,
          type: 'HERO',
          title: 'Capture Attention with a Bold Headline',
          subtitle: 'Describe the core value proposition and benefits for your visitors.',
          buttonText: 'Get Started Now',
          badge: '⭐ New Announcement',
          style: { bgColor: 'bg-transparent', textColor: 'text-white', align: 'center' },
        };
        break;
      case 'FEATURES':
        newBlock = {
          id: newId,
          type: 'FEATURES',
          title: 'Core Features & Benefits',
          subtitle: 'Explain how your solution solves real problems.',
          style: { bgColor: 'bg-white/[0.02]', textColor: 'text-white', align: 'center' },
          items: [
            { title: 'Feature One', desc: 'Describe the unique advantage of this capability.' },
            { title: 'Feature Two', desc: 'Explain how this saves time and increases profit.' },
            { title: 'Feature Three', desc: 'Highlight the security and reliability of the platform.' },
          ],
        };
        break;
      case 'LEAD_FORM':
        newBlock = {
          id: newId,
          type: 'LEAD_FORM',
          title: 'Get in Touch with Our Team',
          subtitle: 'Fill out this brief form and we will reach out within 15 minutes.',
          buttonText: 'Submit Inquiry',
          style: { bgColor: 'bg-amber-500/10', textColor: 'text-white', align: 'center' },
        };
        break;
      case 'PRICING':
        newBlock = {
          id: newId,
          type: 'PRICING',
          title: 'Transparent, Simple Pricing',
          subtitle: 'Choose the plan that fits your business scale.',
          style: { bgColor: 'bg-transparent', textColor: 'text-white', align: 'center' },
          items: [
            { title: 'Starter Tier', desc: 'For growing teams & single offices', price: '$49/mo' },
            { title: 'Enterprise Pro', desc: 'Full AI capabilities and custom domain', price: '$199/mo' },
          ],
        };
        break;
      case 'TESTIMONIALS':
        newBlock = {
          id: newId,
          type: 'TESTIMONIALS',
          title: 'What Our Clients Say',
          subtitle: 'Real reviews from verified customers.',
          style: { bgColor: 'bg-transparent', textColor: 'text-white', align: 'center' },
          items: [
            { title: 'Exceptional Service', desc: 'Transformed our client engagement and boosted revenue.', author: 'Alex Morgan', role: 'CEO, Horizon Inc' },
          ],
        };
        break;
      case 'CTA':
        newBlock = {
          id: newId,
          type: 'CTA',
          title: 'Ready to Transform Your Business?',
          subtitle: 'Join over 10,000+ businesses running on Business OS today.',
          buttonText: 'Launch Your Workspace',
          style: { bgColor: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20', textColor: 'text-white', align: 'center' },
        };
        break;
      case 'FOOTER':
        newBlock = {
          id: newId,
          type: 'FOOTER',
          title: 'Company Brand Name',
          subtitle: '© 2026 Company Inc. All rights reserved.',
          style: { bgColor: 'bg-slate-950/80', textColor: 'text-slate-400', align: 'center' },
        };
        break;
    }

    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newId);
    setAlert(`Added ${type} block to canvas!`);
    setTimeout(() => setAlert(null), 2500);
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

  const handleDeleteBlock = (id: string) => {
    if (blocks.length <= 1) {
      setAlert('You must have at least one block on the page.');
      setTimeout(() => setAlert(null), 2500);
      return;
    }
    const filtered = blocks.filter((b) => b.id !== id);
    setBlocks(filtered);
    setSelectedBlockId(filtered[0]?.id || null);
  };

  const handleDuplicateBlock = (block: SiteBlock) => {
    const duplicated: SiteBlock = {
      ...block,
      id: `${block.type.toLowerCase()}-${Date.now()}`,
      title: `${block.title} (Copy)`,
    };
    setBlocks([...blocks, duplicated]);
    setSelectedBlockId(duplicated.id);
  };

  const handleUpdateBlockField = (field: keyof SiteBlock, value: any) => {
    if (!selectedBlockId) return;
    setBlocks(
      blocks.map((b) => (b.id === selectedBlockId ? { ...b, [field]: value } : b))
    );
  };

  const handleLoadTemplate = (key: string) => {
    const tpl = TEMPLATE_PRESETS[key];
    if (tpl) {
      setBlocks(tpl.blocks);
      setSelectedBlockId(tpl.blocks[0]?.id || null);
      setAlert(`Loaded template: ${tpl.name}!`);
      setTimeout(() => setAlert(null), 3000);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto text-white">
      {/* Alert Notification */}
      {alert && (
        <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-amber-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-amber-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Top Header & Viewport Switcher Toolbar */}
      <div className="luxe-box rounded-3xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-orange-500/25">
            <Layout size={20} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Visual Drag-and-Drop Website & Funnel Studio</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                No-Code Builder
              </span>
            </h1>
            <p className="text-xs text-slate-400">Build high-converting landing pages, booking funnels, and niche websites.</p>
          </div>
        </div>

        {/* Viewport & Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Responsive Viewport Buttons */}
          <div className="flex items-center p-1 bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-400">
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewport === 'desktop' ? 'bg-amber-500/20 text-amber-300' : 'hover:text-white'}`}
              title="Desktop View (100%)"
            >
              <Monitor size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewport('tablet')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewport === 'tablet' ? 'bg-amber-500/20 text-amber-300' : 'hover:text-white'}`}
              title="Tablet View (768px)"
            >
              <Tablet size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewport === 'mobile' ? 'bg-amber-500/20 text-amber-300' : 'hover:text-white'}`}
              title="Mobile View (375px)"
            >
              <Smartphone size={15} />
            </button>
          </div>

          {/* Preset Templates Dropdown */}
          <div className="relative group">
            <button
              type="button"
              className="px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-slate-300 hover:text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={13} className="text-amber-400" />
              <span>Niche Templates</span>
              <ChevronDown size={12} />
            </button>

            <div className="absolute right-0 mt-1 w-56 bg-[#0f1422] border border-white/15 rounded-2xl p-1.5 shadow-2xl backdrop-blur-2xl z-50 hidden group-hover:block animate-in fade-in">
              {Object.entries(TEMPLATE_PRESETS).map(([key, tpl]) => {
                const Icon = tpl.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleLoadTemplate(key)}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-300 hover:bg-amber-500/20 hover:text-amber-300 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Icon size={14} className="text-amber-400" />
                    <span>{tpl.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview & Publish */}
          <button
            type="button"
            onClick={() => setIsPreviewModalOpen(true)}
            className="px-3.5 py-1.5 bg-white/[0.08] hover:bg-white/[0.14] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 border border-white/[0.1] cursor-pointer"
          >
            <Eye size={13} />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAlert('🚀 Website published live to edge CDN (https://crm.acmeglobal.io)!');
              setTimeout(() => setAlert(null), 3500);
            }}
            className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-orange-500/25 cursor-pointer active:scale-95"
          >
            <Globe size={13} />
            <span>Publish Live</span>
          </button>
        </div>
      </div>

      {/* Main Builder Grid: Left Palette (3 cols), Center Visual Canvas (6 cols), Right Inspector (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* 1. LEFT PALETTE: Block Library (3 cols) */}
        <div className="lg:col-span-3 space-y-3.5">
          <div className="luxe-box rounded-3xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <Layers size={13} className="text-amber-400" />
                <span>Component Blocks</span>
              </span>
              <span className="text-[10px] font-mono text-amber-400">Click to Add</span>
            </div>

            <div className="space-y-2">
              {[
                { type: 'HERO' as BlockType, label: 'Hero Header Banner', desc: 'Headline, subhead & CTA' },
                { type: 'FEATURES' as BlockType, label: '3-Card Feature Grid', desc: 'Highlight core advantages' },
                { type: 'LEAD_FORM' as BlockType, label: 'CRM Lead Capture Form', desc: 'Syncs to contacts & deals' },
                { type: 'PRICING' as BlockType, label: 'Pricing Table Cards', desc: 'Multi-tier pricing packages' },
                { type: 'TESTIMONIALS' as BlockType, label: 'Client Reviews', desc: 'Social proof and ratings' },
                { type: 'CTA' as BlockType, label: 'Call to Action Banner', desc: 'High-converting conversion block' },
                { type: 'FOOTER' as BlockType, label: 'Page Footer', desc: 'Copyright & navigation' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => handleAddBlock(item.type)}
                  className="w-full p-2.5 rounded-2xl luxe-inner-card hover:border-amber-500/40 hover:bg-white/[0.08] text-left transition-all group cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors block">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                  </div>
                  <div className="w-6 h-6 rounded-lg bg-white/[0.05] group-hover:bg-amber-500 group-hover:text-slate-950 flex items-center justify-center text-slate-400 transition-colors">
                    <Plus size={13} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. CENTER CANVAS: Live Drag-and-Drop Visual Stage (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div
            className={`mx-auto transition-all duration-300 ${
              viewport === 'mobile' ? 'max-w-xs' : viewport === 'tablet' ? 'max-w-lg' : 'w-full'
            }`}
          >
            <div className="luxe-box rounded-3xl p-4 sm:p-6 space-y-4 min-h-[500px] border border-white/10 bg-slate-950/90 shadow-2xl">
              {blocks.map((block, index) => {
                const isSelected = block.id === selectedBlockId;

                return (
                  <div
                    key={block.id}
                    onClick={() => setSelectedBlockId(block.id)}
                    className={`relative rounded-2xl p-5 sm:p-6 transition-all border cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 ring-2 ring-amber-500/20 bg-white/[0.03]'
                        : 'border-white/[0.06] hover:border-white/20 bg-white/[0.015]'
                    } ${block.style.bgColor}`}
                  >
                    {/* Floating Block Controls */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-80 hover:opacity-100 bg-slate-900/90 border border-white/10 rounded-xl p-1 shadow-lg backdrop-blur-md z-10">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveBlock(index, 'up');
                        }}
                        disabled={index === 0}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <MoveUp size={12} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveBlock(index, 'down');
                        }}
                        disabled={index === blocks.length - 1}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <MoveDown size={12} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateBlock(block);
                        }}
                        className="p-1 text-slate-400 hover:text-amber-400 cursor-pointer"
                        title="Duplicate"
                      >
                        <Copy size={12} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBlock(block.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {/* Block Content Renderer */}
                    {block.type === 'HERO' && (
                      <div className={`space-y-3 ${block.style.align === 'center' ? 'text-center' : 'text-left'}`}>
                        {block.badge && (
                          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            {block.badge}
                          </span>
                        )}
                        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
                          {block.title}
                        </h2>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                          {block.subtitle}
                        </p>
                        {block.buttonText && (
                          <div className="pt-2">
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-orange-500/20">
                              <span>{block.buttonText}</span>
                              <ArrowRight size={13} />
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {block.type === 'FEATURES' && (
                      <div className="space-y-4">
                        <div className={block.style.align === 'center' ? 'text-center' : 'text-left'}>
                          <h3 className="text-base font-bold text-white">{block.title}</h3>
                          <p className="text-xs text-slate-400">{block.subtitle}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                          {block.items?.map((feat, idx) => (
                            <div key={idx} className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl space-y-1.5">
                              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                                {idx + 1}
                              </div>
                              <h4 className="font-bold text-xs text-white">{feat.title}</h4>
                              <p className="text-[10px] text-slate-400 leading-relaxed">{feat.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {block.type === 'LEAD_FORM' && (
                      <div className="space-y-4 max-w-sm mx-auto text-center">
                        <div>
                          <h3 className="text-base font-bold text-white">{block.title}</h3>
                          <p className="text-xs text-slate-400">{block.subtitle}</p>
                        </div>
                        <div className="space-y-2.5">
                          <input
                            type="text"
                            placeholder="Full Name"
                            disabled
                            className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-slate-300 placeholder:text-slate-500"
                          />
                          <input
                            type="email"
                            placeholder="Work Email"
                            disabled
                            className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-slate-300 placeholder:text-slate-500"
                          />
                          <input
                            type="tel"
                            placeholder="Phone / WhatsApp"
                            disabled
                            className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-slate-300 placeholder:text-slate-500"
                          />
                          <button
                            type="button"
                            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-orange-500/20"
                          >
                            {block.buttonText || 'Submit'}
                          </button>
                        </div>
                      </div>
                    )}

                    {block.type === 'PRICING' && (
                      <div className="space-y-4">
                        <div className="text-center">
                          <h3 className="text-base font-bold text-white">{block.title}</h3>
                          <p className="text-xs text-slate-400">{block.subtitle}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          {block.items?.map((p, idx) => (
                            <div key={idx} className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl space-y-2 text-center">
                              <h4 className="font-bold text-xs text-white">{p.title}</h4>
                              <div className="font-mono font-extrabold text-lg text-amber-400">{p.price}</div>
                              <p className="text-[10px] text-slate-400">{p.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {block.type === 'TESTIMONIALS' && (
                      <div className="space-y-4">
                        <div className="text-center">
                          <h3 className="text-base font-bold text-white">{block.title}</h3>
                          <p className="text-xs text-slate-400">{block.subtitle}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          {block.items?.map((t, idx) => (
                            <div key={idx} className="p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-1.5">
                              <div className="flex text-amber-400 gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={11} fill="#f59e0b" />
                                ))}
                              </div>
                              <p className="text-xs text-slate-300 italic">"{t.desc}"</p>
                              <div className="pt-1">
                                <span className="font-bold text-xs text-white block">{t.author}</span>
                                <span className="text-[10px] text-slate-400">{t.role}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {block.type === 'CTA' && (
                      <div className="text-center space-y-2.5 py-3">
                        <h3 className="text-base font-extrabold text-white">{block.title}</h3>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">{block.subtitle}</p>
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg">
                          <span>{block.buttonText}</span>
                        </span>
                      </div>
                    )}

                    {block.type === 'FOOTER' && (
                      <div className="text-center space-y-1 py-2 text-[10px] text-slate-400">
                        <span className="font-bold text-white block">{block.title}</span>
                        <p>{block.subtitle}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. RIGHT INSPECTOR: Live Block Editor (3 cols) */}
        <div className="lg:col-span-3 space-y-3.5">
          <div className="luxe-box rounded-3xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <Sliders size={13} className="text-amber-400" />
                <span>Block Properties</span>
              </span>
              {selectedBlock && (
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                  {selectedBlock.type}
                </span>
              )}
            </div>

            {selectedBlock ? (
              <div className="space-y-3.5 text-xs">
                {/* Title Input */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Headline / Title
                  </label>
                  <input
                    type="text"
                    value={selectedBlock.title}
                    onChange={(e) => handleUpdateBlockField('title', e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                  />
                </div>

                {/* Subtitle Input */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Subtitle / Description
                  </label>
                  <textarea
                    rows={3}
                    value={selectedBlock.subtitle}
                    onChange={(e) => handleUpdateBlockField('subtitle', e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                  />
                </div>

                {/* Button Text (if applicable) */}
                {selectedBlock.buttonText !== undefined && (
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Call to Action Button Text
                    </label>
                    <input
                      type="text"
                      value={selectedBlock.buttonText}
                      onChange={(e) => handleUpdateBlockField('buttonText', e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                    />
                  </div>
                )}

                {/* Badge (if applicable) */}
                {selectedBlock.badge !== undefined && (
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Header Badge Pill
                    </label>
                    <input
                      type="text"
                      value={selectedBlock.badge}
                      onChange={(e) => handleUpdateBlockField('badge', e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                    />
                  </div>
                )}

                {/* Text Alignment */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Text Alignment
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        key={align}
                        type="button"
                        onClick={() =>
                          handleUpdateBlockField('style', { ...selectedBlock.style, align })
                        }
                        className={`py-1.5 rounded-xl border text-[11px] font-semibold uppercase cursor-pointer ${
                          selectedBlock.style.align === align
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-white/[0.03] text-slate-400 border-white/[0.06]'
                        }`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                Click any block on the canvas to edit its text and style properties.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Live Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in">
          <div className="bg-[#0b0f19] border border-white/15 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-8 space-y-8">
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-4">
              <span className="font-bold text-sm text-white">Full-Screen Website Preview</span>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-3 py-1 bg-white/[0.08] hover:bg-white/[0.15] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Preview
              </button>
            </div>

            <div className="space-y-6">
              {blocks.map((block) => (
                <div key={block.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <h3 className="font-extrabold text-xl text-white">{block.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{block.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
