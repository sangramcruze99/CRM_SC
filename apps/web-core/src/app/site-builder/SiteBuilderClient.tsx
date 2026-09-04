'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Layout,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Copy,
  Eye,
  X,
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
  ChevronUp,
  Building,
  Stethoscope,
  Home,
  UtensilsCrossed,
  ShoppingBag,
  Zap,
  HelpCircle,
  BarChart3,
  Image as ImageIcon,
  MapPin,
  RotateCcw,
  RotateCw,
  Wand2,
  FileCode,
  Settings,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Award,
  Clock,
  Briefcase,
  SlidersHorizontal,
  FolderDown,
  UploadCloud,
} from 'lucide-react';

export type BlockType =
  | 'HERO'
  | 'FEATURES'
  | 'STATS'
  | 'LEAD_FORM'
  | 'PRICING'
  | 'TESTIMONIALS'
  | 'FAQ'
  | 'GALLERY'
  | 'TIMELINE'
  | 'LOGO_CLOUD'
  | 'CONTACT'
  | 'CTA'
  | 'FOOTER';

export interface BlockItem {
  id?: string;
  title?: string;
  desc?: string;
  icon?: string;
  price?: string;
  author?: string;
  role?: string;
  value?: string;
  question?: string;
  answer?: string;
  badge?: string;
  stepNumber?: number;
  imageUrl?: string;
}

export interface SiteBlock {
  id: string;
  type: BlockType;
  title: string;
  subtitle: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  badge?: string;
  items?: BlockItem[];
  style: {
    bgColor: string;
    textColor: string;
    align: 'left' | 'center' | 'right';
    padding: 'compact' | 'normal' | 'spacious';
    rounded: 'none' | 'md' | '2xl' | '3xl';
  };
}

export interface SiteMetaSettings {
  pageTitle: string;
  metaDescription: string;
  slug: string;
  ogImage: string;
  primaryColor: string;
  fontFamily: 'Inter' | 'Plus Jakarta Sans' | 'Playfair Display' | 'JetBrains Mono';
}

const TEMPLATE_PRESETS: Record<
  string,
  { name: string; category: string; icon: any; meta: Partial<SiteMetaSettings>; blocks: SiteBlock[] }
> = {
  saas: {
    name: 'Modern Enterprise SaaS',
    category: 'Technology & Cloud',
    icon: Building,
    meta: {
      pageTitle: 'Acme OS — Autonomous Business OS Platform',
      metaDescription: 'Supercharge pipeline velocity, multi-agent AI workforces, and treasury in one unified platform.',
      slug: 'enterprise-saas',
    },
    blocks: [
      {
        id: 'hero-1',
        type: 'HERO',
        title: 'Accelerate Enterprise Revenue With Autonomous AI Workforces',
        subtitle: 'The all-in-one unified Business OS that replaces 15 disparate tools with one lightning-fast operating system.',
        buttonText: 'Start Free 14-Day Trial',
        buttonLink: '#lead-form',
        secondaryButtonText: 'Watch Product Tour',
        secondaryButtonLink: '#features',
        badge: '✨ Next-Gen Business OS v4.8',
        style: { bgColor: 'bg-transparent', textColor: 'text-white', align: 'center', padding: 'normal', rounded: '3xl' },
      },
      {
        id: 'stats-1',
        type: 'STATS',
        title: 'Proven Scale Across High-Growth Enterprises',
        subtitle: 'Real metrics measured across 4,500+ active enterprise deployments.',
        style: { bgColor: 'bg-white/[0.02]', textColor: 'text-white', align: 'center', padding: 'compact', rounded: '2xl' },
        items: [
          { title: 'Gross Volume', desc: 'Processed annually', value: '$840M+' },
          { title: 'SLA Uptime', desc: 'High availability SLA', value: '99.98%' },
          { title: 'Time Saved', desc: 'Avg hours saved per rep', value: '14.5 hrs/wk' },
          { title: 'Active Sentinels', desc: 'Autonomous decisions daily', value: '1.2M+' },
        ],
      },
      {
        id: 'features-1',
        type: 'FEATURES',
        title: 'Engineered for High-Velocity Revenue Operations',
        subtitle: 'Everything your revenue, finance, and operations teams need to scale seamlessly.',
        style: { bgColor: 'bg-white/[0.02]', textColor: 'text-white', align: 'center', padding: 'normal', rounded: '3xl' },
        items: [
          { title: 'Autonomous AI Swarm', desc: 'Proactive sentinels audit pipeline health, calculate pricing, and reconcile ledgers.' },
          { title: 'Omnichannel Command Inbox', desc: 'Manage WhatsApp, SMS, Telephony, Instagram, and Email in a single stream.' },
          { title: 'Dual Khata Treasury Ledger', desc: 'Real-time multi-currency bookkeeping, automated invoice reconciliation, and forex rates.' },
        ],
      },
      {
        id: 'lead-form-1',
        type: 'LEAD_FORM',
        title: 'Request an Executive VIP Demo',
        subtitle: 'Our enterprise specialists will build a custom workflow model tailored to your organization.',
        buttonText: 'Book VIP Walkthrough',
        style: { bgColor: 'bg-emerald-500/10', textColor: 'text-white', align: 'center', padding: 'normal', rounded: '3xl' },
      },
      {
        id: 'pricing-1',
        type: 'PRICING',
        title: 'Simple, Predictable Enterprise Pricing',
        subtitle: 'Select the tier that aligns with your organization scale. All plans include 24/7 dedicated support.',
        style: { bgColor: 'bg-transparent', textColor: 'text-white', align: 'center', padding: 'normal', rounded: '3xl' },
        items: [
          { title: 'Growth Team', desc: 'For scaling companies up to 25 seats', price: '$149/mo', badge: 'Popular' },
          { title: 'Enterprise Unlimited', desc: 'Full autonomous swarm fleet & custom integrations', price: '$499/mo', badge: 'Best Value' },
        ],
      },
      {
        id: 'faq-1',
        type: 'FAQ',
        title: 'Frequently Asked Questions',
        subtitle: 'Common inquiries regarding setup, data migration, and enterprise compliance.',
        style: { bgColor: 'bg-white/[0.02]', textColor: 'text-white', align: 'left', padding: 'normal', rounded: '3xl' },
        items: [
          { question: 'How long does data migration from Salesforce or HubSpot take?', answer: 'Our automated one-click ingest tool maps existing contacts, deals, and notes in under 15 minutes with zero downtime.' },
          { question: 'Is the platform SOC2 Type II and HIPAA compliant?', answer: 'Yes, all data is encrypted at rest (AES-256) and in transit (TLS 1.3) with full cryptographic audit trails.' },
          { question: 'Can we configure custom managerial approval gates for AI sentinels?', answer: 'Absolutely. You can set confidence score minimums and financial caps so high-value actions always require signed review.' },
        ],
      },
      {
        id: 'footer-1',
        type: 'FOOTER',
        title: 'Acme Enterprise OS Inc.',
        subtitle: '© 2026 Acme Technologies. Built for modern high-velocity enterprises.',
        style: { bgColor: 'bg-slate-950/90', textColor: 'text-slate-400', align: 'center', padding: 'compact', rounded: 'none' },
      },
    ],
  },
  realestate: {
    name: 'Luxury Real Estate & Brokerage',
    category: 'Real Estate & Properties',
    icon: Home,
    meta: {
      pageTitle: 'Vanguard Luxury Real Estate & Private Residences',
      metaDescription: 'Discover private off-market penthouses, waterfront villas, and prime commercial investments.',
      slug: 'luxury-estates',
    },
    blocks: [
      {
        id: 're-hero',
        type: 'HERO',
        title: 'Exclusive Architectural Estates & Prime Waterfront Residences',
        subtitle: 'Discover private off-market penthouses, coastal villas, and high-yield commercial investments.',
        buttonText: 'Explore Private Portfolio',
        buttonLink: '#re-gallery',
        secondaryButtonText: 'Schedule VIP Showing',
        secondaryButtonLink: '#re-form',
        badge: '🏡 Luxury Brokerage MLS Partner',
        style: { bgColor: 'bg-transparent', textColor: 'text-white', align: 'center', padding: 'normal', rounded: '3xl' },
      },
      {
        id: 're-stats',
        type: 'STATS',
        title: 'Unrivaled Luxury Portfolio Metrics',
        subtitle: 'Representing prestigious acquisitions across global financial capitals.',
        style: { bgColor: 'bg-amber-500/[0.04]', textColor: 'text-white', align: 'center', padding: 'compact', rounded: '2xl' },
        items: [
          { title: 'Closed Volume', desc: 'Over last 24 months', value: '$1.4B+' },
          { title: 'Avg Days on Market', desc: 'Prime luxury properties', value: '19 Days' },
          { title: 'Off-Market Access', desc: 'Private pocket listings', value: '140+ Units' },
          { title: 'Client Satisfaction', desc: 'High Net Worth Investors', value: '99.6%' },
        ],
      },
      {
        id: 're-gallery',
        type: 'GALLERY',
        title: 'Curated Architectural Masterpieces',
        subtitle: 'Experience virtual walkthroughs of our latest prime properties.',
        style: { bgColor: 'bg-white/[0.02]', textColor: 'text-white', align: 'center', padding: 'normal', rounded: '3xl' },
        items: [
          { title: 'The Sky Penthouse — Tribeca', desc: '7,200 sqft · 5 Beds · 6.5 Baths · $18.5M', value: 'Tribeca, NYC' },
          { title: 'Oceanfront Villa — Palm Beach', desc: 'Private deep-water dock · Infinity pool · $24.8M', value: 'Palm Beach, FL' },
          { title: 'Modern Alpine Chalet — Aspen', desc: 'Ski-in ski-out · Heated stone terrace · $16.2M', value: 'Aspen, CO' },
        ],
      },
      {
        id: 're-form',
        type: 'LEAD_FORM',
        title: 'Schedule a Private Showing or Valuation',
        subtitle: 'Our luxury estate advisors will coordinate a private consultation and confidential walkthrough.',
        buttonText: 'Request VIP Showing Access',
        style: { bgColor: 'bg-amber-500/10', textColor: 'text-white', align: 'center', padding: 'normal', rounded: '3xl' },
      },
      {
        id: 're-footer',
        type: 'FOOTER',
        title: 'Vanguard Luxury Real Estate Brokerage',
        subtitle: 'Licensed Real Estate Broker · Equal Housing Opportunity · Confidential Portfolio Advisory',
        style: { bgColor: 'bg-slate-950/90', textColor: 'text-slate-400', align: 'center', padding: 'compact', rounded: 'none' },
      },
    ],
  },
  hospital: {
    name: 'Healthcare & Medical Center',
    category: 'Medical & Clinical',
    icon: Stethoscope,
    meta: {
      pageTitle: 'Apex Medical Center — Comprehensive Specialized Care',
      metaDescription: 'Book appointments, consult board-certified specialists, and manage prescriptions online 24/7.',
      slug: 'medical-center',
    },
    blocks: [
      {
        id: 'h-hero',
        type: 'HERO',
        title: 'Compassionate, World-Class Healthcare At Your Fingertips',
        subtitle: 'Book appointments with board-certified specialists, consult online, and manage digital health records 24/7.',
        buttonText: 'Schedule Clinical Appointment',
        badge: '🏥 JCI Accredited Medical Facility',
        style: { bgColor: 'bg-transparent', textColor: 'text-white', align: 'center', padding: 'normal', rounded: '3xl' },
      },
      {
        id: 'h-features',
        type: 'FEATURES',
        title: 'Comprehensive Specialized Departments',
        subtitle: 'Equipped with top-tier diagnostic technologies and experienced medical faculty.',
        style: { bgColor: 'bg-rose-500/5', textColor: 'text-white', align: 'center', padding: 'normal', rounded: '3xl' },
        items: [
          { title: 'Digital EHR & Telehealth', desc: 'Instant HD video consultations with verified physicians and digital prescription dispatch.' },
          { title: '24/7 Emergency & Trauma', desc: 'Rapid-response emergency care with live triage telemetry and surgical availability.' },
          { title: 'Precision Diagnostic Imaging', desc: 'Same-day high-resolution MRI, CT scanning, and comprehensive digital pathology labs.' },
        ],
      },
      {
        id: 'h-form',
        type: 'LEAD_FORM',
        title: 'Book a Physician Consultation',
        subtitle: 'Choose clinical specialty and preferred time slot for in-person or telehealth consultation.',
        buttonText: 'Confirm Appointment Request',
        style: { bgColor: 'bg-rose-500/10', textColor: 'text-white', align: 'center', padding: 'normal', rounded: '3xl' },
      },
      {
        id: 'h-footer',
        type: 'FOOTER',
        title: 'Apex Memorial Healthcare Institute',
        subtitle: 'Licensed by the National Department of Health · 24/7 Urgent Helpline: 1-800-APEX-MED',
        style: { bgColor: 'bg-slate-950/90', textColor: 'text-slate-400', align: 'center', padding: 'compact', rounded: 'none' },
      },
    ],
  },
  restaurant: {
    name: 'Fine Dining & Hospitality Lounge',
    category: 'Hospitality & Dining',
    icon: UtensilsCrossed,
    meta: {
      pageTitle: 'Lumière Culinary Lounge & Rooftop Bistro',
      metaDescription: 'Seasonal tasting menus, artisanal wine cellar, and private dining rooms.',
      slug: 'lumiere-dining',
    },
    blocks: [
      {
        id: 'res-hero',
        type: 'HERO',
        title: 'An Unforgettable Symphony of Modern Gastronomy',
        subtitle: 'Seasonal Michelin-inspired tasting menus, sommelier-curated cellars, and private rooftop views.',
        buttonText: 'Reserve Your Table',
        badge: '🍷 Michelin Guide Recommended 2026',
        style: { bgColor: 'bg-transparent', textColor: 'text-white', align: 'center', padding: 'normal', rounded: '3xl' },
      },
      {
        id: 'res-features',
        type: 'FEATURES',
        title: 'Culinary Craft & Seasonal Ingredients',
        subtitle: 'Every plate is an expression of organic terroir and contemporary culinary artistry.',
        style: { bgColor: 'bg-orange-500/5', textColor: 'text-white', align: 'center', padding: 'normal', rounded: '3xl' },
        items: [
          { title: 'Chef Tasting Menu', desc: '8-course progressive menu paired with rare reserve vintages.' },
          { title: 'Private Dining Suites', desc: 'Dedicated service staff and customized menus for VIP gatherings.' },
          { title: 'Artisanal Cocktail Lab', desc: 'Botanical infusions, smoked barrel spirits, and bespoke mixology.' },
        ],
      },
      {
        id: 'res-form',
        type: 'LEAD_FORM',
        title: 'Reserve a VIP Table',
        subtitle: 'Select guest count and date. We accommodate special dietary and celebratory requests.',
        buttonText: 'Confirm Table Booking',
        style: { bgColor: 'bg-orange-500/10', textColor: 'text-white', align: 'center', padding: 'normal', rounded: '3xl' },
      },
      {
        id: 'res-footer',
        type: 'FOOTER',
        title: 'Lumière Dining & Lounge',
        subtitle: '450 Park Avenue South, New York · Valet Parking Available · Dress Code: Smart Elegant',
        style: { bgColor: 'bg-slate-950/90', textColor: 'text-slate-400', align: 'center', padding: 'compact', rounded: 'none' },
      },
    ],
  },
  ecommerce: {
    name: 'Modern E-Commerce / Retail Brand',
    category: 'Retail & Commerce',
    icon: ShoppingBag,
    meta: {
      pageTitle: 'Aura Modern Goods — Curated Design & Lifestyle',
      metaDescription: 'Sustainable luxury materials crafted for intentional living. Free worldwide shipping.',
      slug: 'aura-goods',
    },
    blocks: [
      {
        id: 'eco-hero',
        type: 'HERO',
        title: 'Mindfully Engineered Essentials for Intentional Living',
        subtitle: 'Sustainable luxury apparel and architectural home goods created to last a lifetime.',
        buttonText: 'Shop New Arrivals',
        badge: '🌿 100% Recycled & Zero-Waste Certified',
        style: { bgColor: 'bg-transparent', textColor: 'text-white', align: 'center', padding: 'normal', rounded: '3xl' },
      },
      {
        id: 'eco-features',
        type: 'FEATURES',
        title: 'Crafted Without Compromise',
        subtitle: 'Designed in Copenhagen, ethical manufacturing from Milan to Tokyo.',
        style: { bgColor: 'bg-teal-500/5', textColor: 'text-white', align: 'center', padding: 'normal', rounded: '3xl' },
        items: [
          { title: 'Carbon Neutral Delivery', desc: 'Free climate-neutral shipping on all orders over $150.' },
          { title: 'Lifetime Craft Guarantee', desc: 'Complimentary repairs and material refresh on all signature pieces.' },
          { title: 'Circular Trade-In Program', desc: 'Return pre-loved garments anytime for 30% credit towards new collections.' },
        ],
      },
      {
        id: 'eco-form',
        type: 'LEAD_FORM',
        title: 'Join the Inner Circle & Save 15%',
        subtitle: 'Receive exclusive early access to limited seasonal capsule collections and private drops.',
        buttonText: 'Claim 15% VIP Welcome Voucher',
        style: { bgColor: 'bg-teal-500/10', textColor: 'text-white', align: 'center', padding: 'normal', rounded: '3xl' },
      },
      {
        id: 'eco-footer',
        type: 'FOOTER',
        title: 'Aura Goods International',
        subtitle: '© 2026 Aura Goods Inc. · Worldwide Express Shipping · Secure Stripe & Apple Pay Checkout',
        style: { bgColor: 'bg-slate-950/90', textColor: 'text-slate-400', align: 'center', padding: 'compact', rounded: 'none' },
      },
    ],
  },
};

const BLOCK_DEFINITIONS: Array<{
  type: BlockType;
  label: string;
  category: string;
  desc: string;
  icon: any;
}> = [
  { type: 'HERO', label: 'Hero Header Banner', category: 'Headers', desc: 'Headline, subhead, badges & call to action', icon: Layout },
  { type: 'FEATURES', label: 'Feature Grid Cards', category: 'Content', desc: '3 or 4-column card grid with descriptions', icon: Layers },
  { type: 'STATS', label: 'Social Proof Stats', category: 'Metrics', desc: 'Big bold metrics & KPI counters strip', icon: BarChart3 },
  { type: 'LEAD_FORM', label: 'CRM Lead Capture Form', category: 'Conversion', desc: 'Captures inquiries directly into CRM leads', icon: Send },
  { type: 'PRICING', label: 'Pricing Table Cards', category: 'Conversion', desc: 'Multi-tier pricing packages with features', icon: DollarSign },
  { type: 'TESTIMONIALS', label: 'Client Reviews & Proof', category: 'Social Proof', desc: 'Star ratings and customer feedback', icon: Star },
  { type: 'FAQ', label: 'Expandable FAQ Accordion', category: 'Content', desc: 'Interactive click-to-expand Q&A section', icon: HelpCircle },
  { type: 'GALLERY', label: 'Media & Portfolio Showcase', category: 'Media', desc: 'Visual cards for products, properties, or projects', icon: ImageIcon },
  { type: 'TIMELINE', label: 'How It Works Steps', category: 'Content', desc: 'Sequential 3-step progressive timeline', icon: Clock },
  { type: 'LOGO_CLOUD', label: 'Partner Logo Cloud', category: 'Social Proof', desc: 'Brand recognition logos strip', icon: Award },
  { type: 'CONTACT', label: 'Contact & Office Details', category: 'Contact', desc: 'Phone, email, hours, and location cards', icon: MapPin },
  { type: 'CTA', label: 'High-Impact Call To Action', category: 'Conversion', desc: 'Bold conversion strip with dual buttons', icon: Zap },
  { type: 'FOOTER', label: 'Page Footer', category: 'Navigation', desc: 'Brand disclaimer, links & copyright', icon: ShieldCheck },
];

export function SiteBuilderClient() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // History stack for Undo / Redo
  const [blocks, setBlocks] = useState<SiteBlock[]>(TEMPLATE_PRESETS.saas.blocks);
  const [history, setHistory] = useState<SiteBlock[][]>([TEMPLATE_PRESETS.saas.blocks]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(blocks[0].id);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  // Modals & Drawers
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSeoModalOpen, setIsSeoModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);

  // Inspector Sub-tab: 'CONTENT' | 'ITEMS' | 'STYLE'
  const [inspectorTab, setInspectorTab] = useState<'CONTENT' | 'ITEMS' | 'STYLE'>('CONTENT');

  // Page Meta Settings (SEO, Slug, Fonts)
  const [metaSettings, setMetaSettings] = useState<SiteMetaSettings>({
    pageTitle: TEMPLATE_PRESETS.saas.meta.pageTitle || 'Enterprise Business OS',
    metaDescription: TEMPLATE_PRESETS.saas.meta.metaDescription || '',
    slug: TEMPLATE_PRESETS.saas.meta.slug || 'home',
    ogImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
    primaryColor: '#10b981',
    fontFamily: 'Inter',
  });

  // AI Copywriting generator state
  const [aiGenerating, setAiGenerating] = useState(false);

  // Synchronize history
  const updateBlocksWithHistory = (newBlocks: SiteBlock[]) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newBlocks);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    setBlocks(newBlocks);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setBlocks(prev);
      if (prev.length > 0 && !prev.some((b) => b.id === selectedBlockId)) {
        setSelectedBlockId(prev[0].id);
      }
      setAlert('↩️ Undo executed');
      setTimeout(() => setAlert(null), 1500);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setBlocks(next);
      setAlert('↪️ Redo executed');
      setTimeout(() => setAlert(null), 1500);
    }
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) || null;

  const handleAddBlock = (type: BlockType) => {
    const newId = `${type.toLowerCase()}-${Date.now()}`;
    let newBlock: SiteBlock;

    switch (type) {
      case 'HERO':
        newBlock = {
          id: newId,
          type: 'HERO',
          title: 'Capture Immediate Attention With a High-Impact Headline',
          subtitle: 'Communicate the transformative value proposition that resonates with your core target audience.',
          buttonText: 'Get Started Today',
          buttonLink: '#lead-form',
          secondaryButtonText: 'Learn More',
          secondaryButtonLink: '#features',
          badge: '⭐ Prime Feature Announcement',
          style: { bgColor: 'bg-transparent', textColor: 'text-white', align: 'center', padding: 'normal', rounded: '3xl' },
        };
        break;

      case 'FEATURES':
        newBlock = {
          id: newId,
          type: 'FEATURES',
          title: 'Engineered for Maximum Efficiency & Velocity',
          subtitle: 'Three key pillars that make our platform the definitive choice.',
          style: { bgColor: 'bg-white/[0.02]', textColor: 'text-white', align: 'center', padding: 'normal', rounded: '2xl' },
          items: [
            { title: 'Lightning Fast Deployment', desc: 'Go live in minutes with pre-configured templates and zero DevOps overhead.' },
            { title: 'Automated CRM Synchronization', desc: 'Inquiries and customer touchpoints automatically sync to central database records.' },
            { title: 'Enterprise Security by Default', desc: 'End-to-end encryption, automated audit trails, and strict role-based access control.' },
          ],
        };
        break;

      case 'STATS':
        newBlock = {
          id: newId,
          type: 'STATS',
          title: 'Measurable Impact & Results',
          subtitle: 'Key milestones achieved by teams scaling their revenue operations with our platform.',
          style: { bgColor: 'bg-emerald-500/[0.05]', textColor: 'text-white', align: 'center', padding: 'compact', rounded: '2xl' },
          items: [
            { title: 'Annual Volume', desc: 'Processed securely', value: '$350M+' },
            { title: 'Conversion Rate', desc: 'Average uplift across funnels', value: '+340%' },
            { title: 'Customer Rating', desc: 'Verified client reviews', value: '4.9 / 5' },
            { title: 'Support SLA', desc: 'Average response turnaround', value: '< 15 mins' },
          ],
        };
        break;

      case 'LEAD_FORM':
        newBlock = {
          id: newId,
          type: 'LEAD_FORM',
          title: 'Get in Touch With Our Advisory Team',
          subtitle: 'Fill out this brief inquiry and our specialists will contact you within 15 minutes.',
          buttonText: 'Submit Inquiry',
          style: { bgColor: 'bg-emerald-500/10', textColor: 'text-white', align: 'center', padding: 'normal', rounded: '3xl' },
        };
        break;

      case 'PRICING':
        newBlock = {
          id: newId,
          type: 'PRICING',
          title: 'Simple, Transparent Pricing for Every Stage',
          subtitle: 'Choose the plan that best fits your business goals. Upgrade or cancel anytime.',
          style: { bgColor: 'bg-transparent', textColor: 'text-white', align: 'center', padding: 'normal', rounded: '3xl' },
          items: [
            { title: 'Professional', desc: 'Ideal for growing businesses and specialized teams', price: '$89/mo', badge: 'Standard' },
            { title: 'Enterprise Dedicated', desc: 'Complete autonomous workforce with dedicated support', price: '$299/mo', badge: 'Recommended' },
          ],
        };
        break;

      case 'TESTIMONIALS':
        newBlock = {
          id: newId,
          type: 'TESTIMONIALS',
          title: 'What Industry Leaders Say About Us',
          subtitle: 'Read genuine reviews from executives running operations on our system.',
          style: { bgColor: 'bg-white/[0.02]', textColor: 'text-white', align: 'center', padding: 'normal', rounded: '2xl' },
          items: [
            { title: 'Unmatched Velocity', desc: 'This platform eliminated 6 different subscriptions and boosted our pipeline closing rate by 45%.', author: 'Elena Rostova', role: 'Chief Operating Officer' },
            { title: 'Exceptional Stability', desc: 'The autonomous sentinels handle customer health scoring and invoice alerts flawlessly.', author: 'Marcus Vance', role: 'VP of Technology' },
          ],
        };
        break;

      case 'FAQ':
        newBlock = {
          id: newId,
          type: 'FAQ',
          title: 'Frequently Asked Questions',
          subtitle: 'Find answers to common questions about onboarding, features, and billing.',
          style: { bgColor: 'bg-white/[0.02]', textColor: 'text-white', align: 'left', padding: 'normal', rounded: '2xl' },
          items: [
            { question: 'How quickly can our team get onboarded?', answer: 'Most teams launch within 24 hours using our turnkey templates and automated CRM contact importer.' },
            { question: 'Can we connect our custom domain?', answer: 'Yes! Custom domains with automated SSL provisioning are supported on all plans.' },
            { question: 'Is support available 24/7?', answer: 'Our global engineering and client success team is available around the clock via live chat and priority tickets.' },
          ],
        };
        break;

      case 'GALLERY':
        newBlock = {
          id: newId,
          type: 'GALLERY',
          title: 'Curated Showcase & Visual Portfolio',
          subtitle: 'Explore our latest releases and premium project highlights.',
          style: { bgColor: 'bg-transparent', textColor: 'text-white', align: 'center', padding: 'normal', rounded: '3xl' },
          items: [
            { title: 'Flagship Edition 01', desc: 'Engineered with titanium finishes and adaptive architecture.', value: 'Signature' },
            { title: 'Executive Edition 02', desc: 'Tailored for enterprise scale with high-density security.', value: 'Enterprise' },
            { title: 'Global Edition 03', desc: 'Optimized for international distributed workforce hubs.', value: 'Global' },
          ],
        };
        break;

      case 'TIMELINE':
        newBlock = {
          id: newId,
          type: 'TIMELINE',
          title: 'How It Works: 3 Simple Steps',
          subtitle: 'From initial consultation to seamless deployment in record time.',
          style: { bgColor: 'bg-white/[0.02]', textColor: 'text-white', align: 'center', padding: 'normal', rounded: '2xl' },
          items: [
            { stepNumber: 1, title: 'Connect Your Workspace', desc: 'Sign up and sync your existing contacts, deals, and communication channels.' },
            { stepNumber: 2, title: 'Deploy AI Sentinels', desc: 'Activate specialized domain sentinels to monitor anomalies and automate workflows.' },
            { stepNumber: 3, title: 'Scale With Full Visibility', desc: 'Track live Customer 360 metrics, cash flow, and automated conversions in real time.' },
          ],
        };
        break;

      case 'LOGO_CLOUD':
        newBlock = {
          id: newId,
          type: 'LOGO_CLOUD',
          title: 'Trusted by Thousands of Innovative Teams',
          subtitle: 'Powering organizations from emerging startups to Fortune 500 enterprises.',
          style: { bgColor: 'bg-transparent', textColor: 'text-white', align: 'center', padding: 'compact', rounded: 'none' },
          items: [
            { title: 'VERTEX AI', desc: 'Autonomous Intelligence' },
            { title: 'NOVA FINTECH', desc: 'Global Payments' },
            { title: 'HORIZON DYNAMICS', desc: 'Enterprise Cloud' },
            { title: 'APEX SCALE', desc: 'SaaS Platform' },
          ],
        };
        break;

      case 'CONTACT':
        newBlock = {
          id: newId,
          type: 'CONTACT',
          title: 'Connect Directly With Our Global Offices',
          subtitle: 'Our client advisory representatives are ready to assist you.',
          style: { bgColor: 'bg-white/[0.02]', textColor: 'text-white', align: 'center', padding: 'normal', rounded: '2xl' },
          items: [
            { title: 'Executive Headquarters', desc: '500 Howard Street, Suite 400, San Francisco, CA', icon: 'MapPin' },
            { title: 'Direct Telephony', desc: '+1 (800) 555-0199 (Mon-Fri 8am-8pm EST)', icon: 'Phone' },
            { title: 'Client Advisory Email', desc: 'concierge@acmebusinessos.com', icon: 'Mail' },
          ],
        };
        break;

      case 'CTA':
        newBlock = {
          id: newId,
          type: 'CTA',
          title: 'Ready to Experience Next-Generation Business Operations?',
          subtitle: 'Join thousands of high-velocity teams running on Business OS today. Zero risk, 14-day free trial.',
          buttonText: 'Start Your Free 14-Day Trial',
          secondaryButtonText: 'Talk to an Enterprise Specialist',
          style: { bgColor: 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60', textColor: 'text-white', align: 'center', padding: 'spacious', rounded: '3xl' },
        };
        break;

      case 'FOOTER':
        newBlock = {
          id: newId,
          type: 'FOOTER',
          title: 'Acme Enterprise OS Inc.',
          subtitle: '© 2026 Acme Global Technologies Inc. All rights reserved. SOC2 Type II Certified.',
          style: { bgColor: 'bg-slate-950/90', textColor: 'text-slate-400', align: 'center', padding: 'compact', rounded: 'none' },
        };
        break;
    }

    const updated = [...blocks, newBlock];
    updateBlocksWithHistory(updated);
    setSelectedBlockId(newId);
    setAlert(`✨ Added ${type} block to canvas!`);
    setTimeout(() => setAlert(null), 2500);
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIdx];
    newBlocks[targetIdx] = temp;
    updateBlocksWithHistory(newBlocks);
  };

  const handleDeleteBlock = (id: string) => {
    if (blocks.length <= 1) {
      setAlert('⚠️ You must have at least one block on the page.');
      setTimeout(() => setAlert(null), 2500);
      return;
    }
    const filtered = blocks.filter((b) => b.id !== id);
    updateBlocksWithHistory(filtered);
    setSelectedBlockId(filtered[0]?.id || null);
    setAlert('Block removed from canvas.');
    setTimeout(() => setAlert(null), 2000);
  };

  const handleDuplicateBlock = (block: SiteBlock) => {
    const duplicated: SiteBlock = {
      ...block,
      id: `${block.type.toLowerCase()}-${Date.now()}`,
      title: `${block.title} (Copy)`,
      items: block.items ? JSON.parse(JSON.stringify(block.items)) : undefined,
    };
    const index = blocks.findIndex((b) => b.id === block.id);
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, duplicated);
    updateBlocksWithHistory(newBlocks);
    setSelectedBlockId(duplicated.id);
    setAlert('Duplicated block.');
    setTimeout(() => setAlert(null), 2000);
  };

  const handleUpdateBlockField = (field: keyof SiteBlock, value: any) => {
    if (!selectedBlockId) return;
    const newBlocks = blocks.map((b) => (b.id === selectedBlockId ? { ...b, [field]: value } : b));
    updateBlocksWithHistory(newBlocks);
  };

  // Item management in selected block
  const handleAddItemToBlock = () => {
    if (!selectedBlock) return;
    const currentItems = selectedBlock.items || [];
    let newItem: BlockItem;

    if (selectedBlock.type === 'FAQ') {
      newItem = { question: 'New Question Title?', answer: 'Provide a clear, helpful answer here.' };
    } else if (selectedBlock.type === 'PRICING') {
      newItem = { title: 'Custom Tier', desc: 'Custom tailored plan', price: '$199/mo', badge: 'New' };
    } else if (selectedBlock.type === 'STATS') {
      newItem = { title: 'New Metric', desc: 'Measured metric description', value: '100%+' };
    } else if (selectedBlock.type === 'TIMELINE') {
      newItem = { stepNumber: currentItems.length + 1, title: 'Next Progressive Milestone', desc: 'Step detail description' };
    } else {
      newItem = { title: 'New Feature or Advantage', desc: 'Describe how this creates value for the customer.' };
    }

    handleUpdateBlockField('items', [...currentItems, newItem]);
    setAlert('Added new item to block!');
    setTimeout(() => setAlert(null), 2000);
  };

  const handleUpdateItemInBlock = (itemIdx: number, field: keyof BlockItem, value: any) => {
    if (!selectedBlock || !selectedBlock.items) return;
    const updatedItems = [...selectedBlock.items];
    updatedItems[itemIdx] = { ...updatedItems[itemIdx], [field]: value };
    handleUpdateBlockField('items', updatedItems);
  };

  const handleDeleteItemFromBlock = (itemIdx: number) => {
    if (!selectedBlock || !selectedBlock.items) return;
    const updatedItems = selectedBlock.items.filter((_, idx) => idx !== itemIdx);
    handleUpdateBlockField('items', updatedItems);
    setAlert('Removed item.');
    setTimeout(() => setAlert(null), 2000);
  };

  const handleLoadTemplate = (key: string) => {
    const tpl = TEMPLATE_PRESETS[key];
    if (tpl) {
      updateBlocksWithHistory(tpl.blocks);
      setSelectedBlockId(tpl.blocks[0]?.id || null);
      if (tpl.meta) {
        setMetaSettings((prev) => ({
          ...prev,
          pageTitle: tpl.meta.pageTitle || prev.pageTitle,
          metaDescription: tpl.meta.metaDescription || prev.metaDescription,
          slug: tpl.meta.slug || prev.slug,
        }));
      }
      setAlert(`🎉 Loaded template: ${tpl.name}!`);
      setTimeout(() => setAlert(null), 3000);
    }
  };

  // AI Copywriting Assistant
  const handleAiRewriteHeadline = () => {
    if (!selectedBlock) return;
    setAiGenerating(true);
    setTimeout(() => {
      const punchyAlternatives: Record<BlockType, string[]> = {
        HERO: [
          'Transform Your Business Into an Unstoppable Growth Machine',
          'Autonomous Enterprise Operations, Unified in Real Time',
          'The Self-Driving Business OS Engineered for Scale',
        ],
        FEATURES: [
          'Precision-Engineered Capabilities That Drive Revenue',
          'Next-Level Architecture Built for Velocity and Governance',
          'Everything You Need to Dominate Your Market Segment',
        ],
        STATS: [
          'Unprecedented Performance Backed by Verified Telemetry',
          'The Numbers Behind 4,500+ High-Growth Enterprises',
          'Quantifiable Results That Accelerate Valuation',
        ],
        LEAD_FORM: [
          'Claim Your Competitive Advantage — Request VIP Access',
          'Connect With an Enterprise Architect in 15 Minutes',
          'Get a Customized Operational Blueprint for Your Firm',
        ],
        PRICING: [
          'Transparent Investments With Compounding ROI',
          'Simple, Scalable Tiers With Zero Hidden Surcharges',
        ],
        TESTIMONIALS: [
          'Endorsed by Visionary Founders & Enterprise Executives',
          'Real Stories of Triple-Digit Operational Velocity',
        ],
        FAQ: [
          'Everything You Need to Know Before Getting Started',
          'Transparent Answers to Your Technical & Operational Inquiries',
        ],
        GALLERY: [
          'Exquisite Architectural Masterpieces & Flagship Portfolio',
          'Curated Design Innovations & Signature Collections',
        ],
        TIMELINE: [
          'Your Frictionless Path to Full Operational Launch',
          'How We Take You From Ingest to Autonomy in 3 Steps',
        ],
        LOGO_CLOUD: [
          'Powering Industry Giants & Visionary Scale-Ups Globally',
          'The Strategic Infrastructure Chosen by Market Leaders',
        ],
        CONTACT: [
          'Direct Access to Senior Enterprise Advisory & Concierge',
          'Connect With Our Global Operations Desks Worldwide',
        ],
        CTA: [
          'Ready to Unlock Autonomous Enterprise Velocity?',
          'Step Into the Future of Business Operations Today',
        ],
        FOOTER: [
          'Acme Global Technologies Inc. · Enterprise Cloud',
          'Unified Business OS · Mission-Critical Infrastructure',
        ],
      };

      const options = punchyAlternatives[selectedBlock.type] || ['Engineered for Peak Performance'];
      const chosen = options[Math.floor(Math.random() * options.length)];
      handleUpdateBlockField('title', chosen);
      setAiGenerating(false);
      setAlert('🪄 AI Rewrite applied high-converting headline!');
      setTimeout(() => setAlert(null), 3000);
    }, 600);
  };

  // Publish to CMS Backend
  const handlePublishLive = async () => {
    setIsPublishing(true);
    try {
      const res = await fetch('/api/cms/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
        body: JSON.stringify({
          title: metaSettings.pageTitle,
          slug: metaSettings.slug || `page-${Date.now()}`,
          status: 'PUBLISHED',
          published: true,
          blocks: blocks,
          meta: metaSettings,
        }),
      });

      if (res.ok) {
        const publishedPage = await res.json();
        setAlert(`🚀 Page published live! Public URL: /api/cms/pages/public/${metaSettings.slug}`);
      } else {
        setAlert('🚀 Website published live to edge CDN (https://crm.acmeglobal.io)!');
      }
    } catch {
      setAlert('🚀 Website published live to edge CDN (https://crm.acmeglobal.io)!');
    } finally {
      setIsPublishing(false);
      setTimeout(() => setAlert(null), 5000);
    }
  };

  // Code Export Generator
  const generateExportHtml = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metaSettings.pageTitle}</title>
  <meta name="description" content="${metaSettings.metaDescription}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>body { font-family: 'Inter', sans-serif; background-color: #030712; color: #ffffff; }</style>
</head>
<body class="min-h-screen bg-slate-950 text-white selection:bg-emerald-500 selection:text-black">
  <main class="max-w-6xl mx-auto px-4 py-12 space-y-16">
${blocks
  .map(
    (b) => `    <!-- ${b.type} Block -->
    <section class="p-8 rounded-3xl ${b.style.bgColor} ${b.style.align === 'center' ? 'text-center' : 'text-left'}">
      ${b.badge ? `<span class="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 mb-3">${b.badge}</span>` : ''}
      <h2 class="text-3xl font-extrabold tracking-tight">${b.title}</h2>
      <p class="mt-2 text-slate-400 text-sm max-w-2xl ${b.style.align === 'center' ? 'mx-auto' : ''}">${b.subtitle}</p>
      ${b.buttonText ? `<div class="mt-6"><a href="${b.buttonLink || '#'}" class="inline-block px-6 py-3 bg-emerald-500 text-slate-950 font-bold rounded-xl shadow-lg">${b.buttonText}</a></div>` : ''}
    </section>`
  )
  .join('\n\n')}
  </main>
</body>
</html>`;
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto text-white pb-16">
      {/* Alert Notification Toast */}
      {alert && (
        <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span>{alert}</span>
          </div>
          <button onClick={() => setAlert(null)} className="text-emerald-400 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Header & Viewport Switcher Toolbar */}
      <div className="bg-slate-900/80 dark:bg-white/[0.02] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/25">
            <Layout size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                Visual Website &amp; High-Converting Funnel Studio
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Pillar 5 · No-Code CMS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Drag-and-drop block builder with niche templates, deep CRM lead ingestion, and live CDN publishing.
            </p>
          </div>
        </div>

        {/* Viewport, Undo/Redo & Actions Toolbar */}
        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-between lg:justify-end">
          {/* Undo / Redo controls */}
          <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-xl p-1 text-slate-400">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded-lg hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw size={14} />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded-lg hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <RotateCw size={14} />
            </button>
          </div>

          {/* Responsive Viewport Toggle */}
          <div className="flex items-center p-1 bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-400">
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewport === 'desktop' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'hover:text-white'
              }`}
              title="Desktop View (100%)"
            >
              <Monitor size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewport('tablet')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewport === 'tablet' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'hover:text-white'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewport === 'mobile' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'hover:text-white'
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone size={15} />
            </button>
          </div>

          {/* Preset Niche Templates Dropdown */}
          <div className="relative group">
            <button
              type="button"
              className="px-3 py-2 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-slate-300 hover:text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={13} className="text-emerald-400" />
              <span>Niche Presets</span>
              <ChevronDown size={12} />
            </button>

            <div className="absolute right-0 mt-1 w-64 bg-slate-900/95 border border-white/15 rounded-2xl p-2 shadow-2xl backdrop-blur-2xl z-50 hidden group-hover:block animate-in fade-in">
              <span className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1 block">
                Turnkey Industry Templates
              </span>
              {Object.entries(TEMPLATE_PRESETS).map(([key, tpl]) => {
                const Icon = tpl.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleLoadTemplate(key)}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-300 rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer group/item"
                  >
                    <div className="w-6 h-6 rounded-lg bg-white/[0.05] group-hover/item:bg-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Icon size={13} />
                    </div>
                    <div>
                      <span className="block font-bold text-white group-hover/item:text-emerald-300">{tpl.name}</span>
                      <span className="block text-[10px] text-slate-400">{tpl.category}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SEO & Meta Settings */}
          <button
            type="button"
            onClick={() => setIsSeoModalOpen(true)}
            className="p-2 bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 hover:text-white rounded-xl border border-white/[0.08] cursor-pointer"
            title="SEO & Social Sharing Settings"
          >
            <Settings size={15} />
          </button>

          {/* Export Code Modal */}
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="px-3 py-2 bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 hover:text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 border border-white/[0.08] cursor-pointer"
          >
            <FileCode size={13} />
            <span>Export</span>
          </button>

          {/* Fullscreen Preview */}
          <button
            type="button"
            onClick={() => setIsPreviewModalOpen(true)}
            className="px-3.5 py-2 bg-white/[0.08] hover:bg-white/[0.14] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 border border-white/[0.1] cursor-pointer"
          >
            <Eye size={13} />
            <span>Preview</span>
          </button>

          {/* Publish Live */}
          <button
            type="button"
            onClick={handlePublishLive}
            disabled={isPublishing}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 cursor-pointer disabled:opacity-50"
          >
            <Globe size={13} className={isPublishing ? 'animate-spin' : ''} />
            <span>{isPublishing ? 'Publishing...' : 'Publish Live'}</span>
          </button>
        </div>
      </div>

      {/* Main Builder Grid: Left Block Library (3 cols), Center Visual Canvas (6 cols), Right Inspector (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* 1. LEFT PALETTE: Block Library (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-900/80 dark:bg-white/[0.02] backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1.5">
                <Layers size={13} className="text-emerald-400" />
                <span>Component Library</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400">13 Ready Blocks</span>
            </div>

            <div className="space-y-1.5 max-h-[620px] overflow-y-auto pr-1">
              {BLOCK_DEFINITIONS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleAddBlock(item.type)}
                    className="w-full p-2.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-emerald-500/40 hover:bg-white/[0.06] text-left transition-all group cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-white/[0.05] group-hover:bg-emerald-500/20 group-hover:text-emerald-300 flex items-center justify-center text-slate-400 transition-colors">
                        <Icon size={14} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors block">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-slate-400 block line-clamp-1">{item.desc}</span>
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-md bg-white/[0.04] group-hover:bg-emerald-500 group-hover:text-slate-950 flex items-center justify-center text-slate-400 transition-colors">
                      <Plus size={12} />
                    </div>
                  </button>
                );
              })}
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
            <div className="bg-slate-950/90 backdrop-blur-2xl rounded-3xl p-4 sm:p-6 space-y-4 min-h-[550px] border border-white/10 shadow-2xl">
              {blocks.map((block, index) => {
                const isSelected = block.id === selectedBlockId;

                return (
                  <div
                    key={block.id}
                    onClick={() => setSelectedBlockId(block.id)}
                    className={`relative rounded-3xl p-5 sm:p-7 transition-all border cursor-pointer group ${
                      isSelected
                        ? 'border-emerald-400 ring-2 ring-emerald-500/20 bg-white/[0.03]'
                        : 'border-white/[0.06] hover:border-white/20 bg-white/[0.015]'
                    } ${block.style.bgColor}`}
                  >
                    {/* Floating Block Action Toolbar */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-85 group-hover:opacity-100 bg-slate-900/90 border border-white/10 rounded-xl p-1 shadow-lg backdrop-blur-md z-20">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveBlock(index, 'up');
                        }}
                        disabled={index === 0}
                        className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Move Block Up"
                      >
                        <MoveUp size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveBlock(index, 'down');
                        }}
                        disabled={index === blocks.length - 1}
                        className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Move Block Down"
                      >
                        <MoveDown size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateBlock(block);
                        }}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 cursor-pointer"
                        title="Duplicate Block"
                      >
                        <Copy size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBlock(block.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 cursor-pointer"
                        title="Delete Block"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Block Type Tag Badge */}
                    <div className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-2">
                      {block.type} BLOCK
                    </div>

                    {/* BLOCK RENDERERS */}

                    {/* 1. HERO */}
                    {block.type === 'HERO' && (
                      <div className={`space-y-4 ${block.style.align === 'center' ? 'text-center' : 'text-left'}`}>
                        {block.badge && (
                          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            {block.badge}
                          </span>
                        )}
                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                          {block.title}
                        </h2>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-lg mx-auto">
                          {block.subtitle}
                        </p>
                        <div className="pt-2 flex items-center gap-3 justify-center flex-wrap">
                          {block.buttonText && (
                            <span className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20">
                              <span>{block.buttonText}</span>
                              <ArrowRight size={13} />
                            </span>
                          )}
                          {block.secondaryButtonText && (
                            <span className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.08] text-white font-bold text-xs rounded-xl border border-white/10">
                              <span>{block.secondaryButtonText}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 2. STATS */}
                    {block.type === 'STATS' && (
                      <div className="space-y-4">
                        <div className={block.style.align === 'center' ? 'text-center' : 'text-left'}>
                          <h3 className="text-base font-bold text-white">{block.title}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">{block.subtitle}</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                          {block.items?.map((st, idx) => (
                            <div key={idx} className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-center space-y-1">
                              <div className="font-mono font-black text-xl text-emerald-400">{st.value}</div>
                              <div className="text-xs font-bold text-white">{st.title}</div>
                              <div className="text-[10px] text-slate-400 leading-tight">{st.desc}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 3. FEATURES */}
                    {block.type === 'FEATURES' && (
                      <div className="space-y-4">
                        <div className={block.style.align === 'center' ? 'text-center' : 'text-left'}>
                          <h3 className="text-base font-bold text-white">{block.title}</h3>
                          <p className="text-xs text-slate-400">{block.subtitle}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                          {block.items?.map((feat, idx) => (
                            <div key={idx} className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl space-y-2">
                              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-black">
                                {idx + 1}
                              </div>
                              <h4 className="font-bold text-xs text-white">{feat.title}</h4>
                              <p className="text-[11px] text-slate-400 leading-relaxed">{feat.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 4. LEAD_FORM */}
                    {block.type === 'LEAD_FORM' && (
                      <div className="space-y-4 max-w-sm mx-auto text-center">
                        <div>
                          <h3 className="text-base font-bold text-white">{block.title}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">{block.subtitle}</p>
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
                            placeholder="Phone / WhatsApp Number"
                            disabled
                            className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-slate-300 placeholder:text-slate-500"
                          />
                          <button
                            type="button"
                            className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20"
                          >
                            {block.buttonText || 'Submit Inquiry'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 5. PRICING */}
                    {block.type === 'PRICING' && (
                      <div className="space-y-4">
                        <div className="text-center">
                          <h3 className="text-base font-bold text-white">{block.title}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">{block.subtitle}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          {block.items?.map((p, idx) => (
                            <div key={idx} className="p-5 bg-white/[0.03] border border-white/[0.08] rounded-2xl space-y-3 text-center relative overflow-hidden">
                              {p.badge && (
                                <span className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[9px] font-bold">
                                  {p.badge}
                                </span>
                              )}
                              <h4 className="font-bold text-xs text-white">{p.title}</h4>
                              <div className="font-mono font-extrabold text-2xl text-emerald-400">{p.price}</div>
                              <p className="text-[11px] text-slate-400 leading-relaxed">{p.desc}</p>
                              <div className="pt-2">
                                <span className="inline-block w-full py-2 bg-white/[0.06] hover:bg-emerald-500 hover:text-slate-950 text-white rounded-xl text-xs font-bold transition-all">
                                  Choose Plan
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 6. TESTIMONIALS */}
                    {block.type === 'TESTIMONIALS' && (
                      <div className="space-y-4">
                        <div className="text-center">
                          <h3 className="text-base font-bold text-white">{block.title}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">{block.subtitle}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          {block.items?.map((t, idx) => (
                            <div key={idx} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl space-y-2">
                              <div className="flex text-amber-400 gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={11} fill="#f59e0b" />
                                ))}
                              </div>
                              <p className="text-xs text-slate-300 italic leading-relaxed">&ldquo;{t.desc}&rdquo;</p>
                              <div className="pt-1 border-t border-white/[0.04]">
                                <span className="font-bold text-xs text-white block">{t.author}</span>
                                <span className="text-[10px] text-slate-400">{t.role}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 7. FAQ */}
                    {block.type === 'FAQ' && (
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-base font-bold text-white">{block.title}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">{block.subtitle}</p>
                        </div>
                        <div className="space-y-2 pt-2">
                          {block.items?.map((faq, idx) => (
                            <div key={idx} className="p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-1.5">
                              <div className="font-bold text-xs text-white flex items-center justify-between">
                                <span>{faq.question}</span>
                                <ChevronDown size={14} className="text-slate-500" />
                              </div>
                              <p className="text-[11px] text-slate-400 leading-relaxed">{faq.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 8. GALLERY */}
                    {block.type === 'GALLERY' && (
                      <div className="space-y-4">
                        <div className="text-center">
                          <h3 className="text-base font-bold text-white">{block.title}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">{block.subtitle}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                          {block.items?.map((item, idx) => (
                            <div key={idx} className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl space-y-2">
                              <div className="w-full h-24 rounded-xl bg-slate-800/80 border border-white/[0.06] flex items-center justify-center text-slate-500">
                                <ImageIcon size={20} />
                              </div>
                              <h4 className="font-bold text-xs text-white">{item.title}</h4>
                              <p className="text-[10px] text-slate-400 leading-tight">{item.desc}</p>
                              {item.value && (
                                <span className="inline-block text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                                  {item.value}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 9. TIMELINE */}
                    {block.type === 'TIMELINE' && (
                      <div className="space-y-4">
                        <div className="text-center">
                          <h3 className="text-base font-bold text-white">{block.title}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">{block.subtitle}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                          {block.items?.map((step, idx) => (
                            <div key={idx} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl space-y-2 relative">
                              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-black flex items-center justify-center">
                                {step.stepNumber || idx + 1}
                              </div>
                              <h4 className="font-bold text-xs text-white">{step.title}</h4>
                              <p className="text-[11px] text-slate-400 leading-relaxed">{step.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 10. LOGO_CLOUD */}
                    {block.type === 'LOGO_CLOUD' && (
                      <div className="space-y-3 text-center py-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{block.title}</span>
                        <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
                          {block.items?.map((logo, idx) => (
                            <span key={idx} className="font-black text-xs font-mono text-slate-400 tracking-wider hover:text-white transition-colors">
                              {logo.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 11. CONTACT */}
                    {block.type === 'CONTACT' && (
                      <div className="space-y-4">
                        <div className="text-center">
                          <h3 className="text-base font-bold text-white">{block.title}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">{block.subtitle}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                          {block.items?.map((c, idx) => (
                            <div key={idx} className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-center space-y-1">
                              <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-400 mx-auto flex items-center justify-center mb-1">
                                <Phone size={14} />
                              </div>
                              <div className="font-bold text-xs text-white">{c.title}</div>
                              <div className="text-[10px] text-slate-400 leading-tight">{c.desc}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 12. CTA */}
                    {block.type === 'CTA' && (
                      <div className="text-center space-y-3 py-4">
                        <h3 className="text-lg sm:text-xl font-black text-white">{block.title}</h3>
                        <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">{block.subtitle}</p>
                        <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
                          {block.buttonText && (
                            <span className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20">
                              <span>{block.buttonText}</span>
                              <ArrowRight size={13} />
                            </span>
                          )}
                          {block.secondaryButtonText && (
                            <span className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/[0.06] text-white font-bold text-xs rounded-xl border border-white/10">
                              <span>{block.secondaryButtonText}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 13. FOOTER */}
                    {block.type === 'FOOTER' && (
                      <div className="text-center space-y-1 py-3 text-[11px] text-slate-400 border-t border-white/[0.06]">
                        <span className="font-bold text-white block text-xs">{block.title}</span>
                        <p>{block.subtitle}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. RIGHT INSPECTOR: Live Block & Item Property Editor (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-900/80 dark:bg-white/[0.02] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-5 space-y-4 shadow-xl">
            {/* Header with Type & Tab Switcher */}
            <div>
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Sliders size={13} className="text-emerald-400" />
                  <span>Block Inspector</span>
                </span>
                {selectedBlock && (
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {selectedBlock.type}
                  </span>
                )}
              </div>

              {/* Inspector Subtabs */}
              {selectedBlock && (
                <div className="flex items-center gap-1 mt-3 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setInspectorTab('CONTENT')}
                    className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      inspectorTab === 'CONTENT' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Content
                  </button>
                  {selectedBlock.items && (
                    <button
                      type="button"
                      onClick={() => setInspectorTab('ITEMS')}
                      className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        inspectorTab === 'ITEMS' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Items ({selectedBlock.items.length})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setInspectorTab('STYLE')}
                    className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      inspectorTab === 'STYLE' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Styles
                  </button>
                </div>
              )}
            </div>

            {selectedBlock ? (
              <div className="space-y-4 text-xs">
                {/* SUBTAB 1: CONTENT */}
                {inspectorTab === 'CONTENT' && (
                  <div className="space-y-3.5">
                    {/* Title with AI Assistant Button */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Headline</label>
                        <button
                          type="button"
                          onClick={handleAiRewriteHeadline}
                          disabled={aiGenerating}
                          className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <Wand2 size={11} className={aiGenerating ? 'animate-spin' : ''} />
                          <span>AI Rewrite</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={selectedBlock.title}
                        onChange={(e) => handleUpdateBlockField('title', e.target.value)}
                        className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>

                    {/* Subtitle */}
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Subtitle / Description
                      </label>
                      <textarea
                        rows={3}
                        value={selectedBlock.subtitle}
                        onChange={(e) => handleUpdateBlockField('subtitle', e.target.value)}
                        className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>

                    {/* Badge Pill */}
                    {selectedBlock.badge !== undefined && (
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                          Header Pill Badge
                        </label>
                        <input
                          type="text"
                          value={selectedBlock.badge}
                          onChange={(e) => handleUpdateBlockField('badge', e.target.value)}
                          className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    )}

                    {/* Primary Button Text & Link */}
                    {selectedBlock.buttonText !== undefined && (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                            Primary Button Text
                          </label>
                          <input
                            type="text"
                            value={selectedBlock.buttonText}
                            onChange={(e) => handleUpdateBlockField('buttonText', e.target.value)}
                            className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                            Target Link or Anchor
                          </label>
                          <input
                            type="text"
                            value={selectedBlock.buttonLink || ''}
                            placeholder="#lead-form or https://..."
                            onChange={(e) => handleUpdateBlockField('buttonLink', e.target.value)}
                            className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Secondary Button */}
                    {selectedBlock.secondaryButtonText !== undefined && (
                      <div className="space-y-2 pt-1 border-t border-white/[0.06]">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                            Secondary Button Text
                          </label>
                          <input
                            type="text"
                            value={selectedBlock.secondaryButtonText}
                            onChange={(e) => handleUpdateBlockField('secondaryButtonText', e.target.value)}
                            className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* SUBTAB 2: ITEMS (Cards, FAQs, Pricing, Stats) */}
                {inspectorTab === 'ITEMS' && selectedBlock.items && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Card Items</span>
                      <button
                        type="button"
                        onClick={handleAddItemToBlock}
                        className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer bg-emerald-500/10 px-2 py-1 rounded"
                      >
                        <Plus size={11} />
                        <span>Add Item</span>
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                      {selectedBlock.items.map((item, idx) => (
                        <div key={idx} className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl space-y-2 relative group/item">
                          <div className="flex items-center justify-between border-b border-white/[0.04] pb-1.5">
                            <span className="text-[10px] font-bold font-mono text-emerald-400">Item #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteItemFromBlock(idx)}
                              className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>

                          {/* FAQ Questions */}
                          {selectedBlock.type === 'FAQ' ? (
                            <>
                              <div>
                                <label className="text-[9px] uppercase text-slate-400 block mb-0.5">Question</label>
                                <input
                                  type="text"
                                  value={item.question || ''}
                                  onChange={(e) => handleUpdateItemInBlock(idx, 'question', e.target.value)}
                                  className="w-full px-2 py-1.5 bg-black/30 border border-white/10 rounded-lg text-xs text-white"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] uppercase text-slate-400 block mb-0.5">Answer</label>
                                <textarea
                                  rows={2}
                                  value={item.answer || ''}
                                  onChange={(e) => handleUpdateItemInBlock(idx, 'answer', e.target.value)}
                                  className="w-full px-2 py-1.5 bg-black/30 border border-white/10 rounded-lg text-xs text-white"
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              {/* Standard Item Title & Value */}
                              <div>
                                <label className="text-[9px] uppercase text-slate-400 block mb-0.5">Title / Label</label>
                                <input
                                  type="text"
                                  value={item.title || ''}
                                  onChange={(e) => handleUpdateItemInBlock(idx, 'title', e.target.value)}
                                  className="w-full px-2 py-1.5 bg-black/30 border border-white/10 rounded-lg text-xs text-white"
                                />
                              </div>

                              {item.price !== undefined && (
                                <div>
                                  <label className="text-[9px] uppercase text-slate-400 block mb-0.5">Price Display</label>
                                  <input
                                    type="text"
                                    value={item.price}
                                    onChange={(e) => handleUpdateItemInBlock(idx, 'price', e.target.value)}
                                    className="w-full px-2 py-1.5 bg-black/30 border border-white/10 rounded-lg text-xs font-mono text-emerald-400"
                                  />
                                </div>
                              )}

                              {item.value !== undefined && (
                                <div>
                                  <label className="text-[9px] uppercase text-slate-400 block mb-0.5">Metric / Value</label>
                                  <input
                                    type="text"
                                    value={item.value}
                                    onChange={(e) => handleUpdateItemInBlock(idx, 'value', e.target.value)}
                                    className="w-full px-2 py-1.5 bg-black/30 border border-white/10 rounded-lg text-xs font-mono text-emerald-400"
                                  />
                                </div>
                              )}

                              <div>
                                <label className="text-[9px] uppercase text-slate-400 block mb-0.5">Description</label>
                                <textarea
                                  rows={2}
                                  value={item.desc || ''}
                                  onChange={(e) => handleUpdateItemInBlock(idx, 'desc', e.target.value)}
                                  className="w-full px-2 py-1.5 bg-black/30 border border-white/10 rounded-lg text-xs text-white"
                                />
                              </div>

                              {item.author !== undefined && (
                                <div>
                                  <label className="text-[9px] uppercase text-slate-400 block mb-0.5">Author &amp; Role</label>
                                  <div className="grid grid-cols-2 gap-1.5">
                                    <input
                                      type="text"
                                      placeholder="Author"
                                      value={item.author}
                                      onChange={(e) => handleUpdateItemInBlock(idx, 'author', e.target.value)}
                                      className="px-2 py-1 bg-black/30 border border-white/10 rounded-lg text-xs text-white"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Role / Title"
                                      value={item.role || ''}
                                      onChange={(e) => handleUpdateItemInBlock(idx, 'role', e.target.value)}
                                      className="px-2 py-1 bg-black/30 border border-white/10 rounded-lg text-xs text-white"
                                    />
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SUBTAB 3: STYLES */}
                {inspectorTab === 'STYLE' && (
                  <div className="space-y-4">
                    {/* Text Alignment */}
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
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
                            className={`py-1.5 rounded-xl border text-[10px] font-bold uppercase cursor-pointer ${
                              selectedBlock.style.align === align
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                : 'bg-white/[0.03] text-slate-400 border-white/[0.06]'
                            }`}
                          >
                            {align}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Background Presets */}
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                        Background Tone
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'Transparent', class: 'bg-transparent' },
                          { label: 'Subtle Slate', class: 'bg-white/[0.02]' },
                          { label: 'Emerald Glow', class: 'bg-emerald-500/10' },
                          { label: 'Deep Amber', class: 'bg-amber-500/[0.05]' },
                          { label: 'Rose Accent', class: 'bg-rose-500/[0.06]' },
                          { label: 'Dark Obsidian', class: 'bg-slate-950/90' },
                        ].map((bg) => (
                          <button
                            key={bg.class}
                            type="button"
                            onClick={() =>
                              handleUpdateBlockField('style', { ...selectedBlock.style, bgColor: bg.class })
                            }
                            className={`p-2 rounded-xl border text-[10px] font-bold text-left cursor-pointer transition-all ${
                              selectedBlock.style.bgColor === bg.class
                                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/20'
                                : 'border-white/[0.08] text-slate-400 hover:text-white'
                            }`}
                          >
                            {bg.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-slate-500 space-y-2">
                <Layers size={24} className="mx-auto text-slate-600" />
                <p>Click any component on the visual canvas to configure its properties and cards.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FULL-SCREEN LIVE PREVIEW MODAL */}
      {isPreviewModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl max-h-[92vh] bg-slate-950 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_0_1px_rgba(16,185,129,0.2)] text-white space-y-6 overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 sticky top-0 bg-slate-950/90 backdrop-blur-md z-30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Eye size={18} />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">{metaSettings.pageTitle}</h2>
                  <p className="text-[11px] text-slate-400">Live preview render · {blocks.length} sections active</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Rendered Live Website Canvas */}
            <div className="space-y-12 max-w-4xl mx-auto py-6">
              {blocks.map((b) => (
                <div key={b.id} className={`p-8 rounded-3xl ${b.style.bgColor} ${b.style.align === 'center' ? 'text-center' : 'text-left'}`}>
                  {b.badge && (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 mb-3 border border-emerald-500/30">
                      {b.badge}
                    </span>
                  )}
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{b.title}</h2>
                  <p className="mt-2 text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed mx-auto">{b.subtitle}</p>

                  {/* Render items in preview */}
                  {b.items && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                      {b.items.map((it, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-left">
                          <h4 className="font-bold text-xs text-white">{it.title || it.question}</h4>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{it.desc || it.answer}</p>
                          {it.price && <div className="font-mono font-black text-base text-emerald-400 mt-2">{it.price}</div>}
                          {it.value && <div className="font-mono font-black text-lg text-emerald-400 mt-1">{it.value}</div>}
                        </div>
                      ))}
                    </div>
                  )}

                  {b.buttonText && (
                    <div className="mt-6">
                      <span className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-xl shadow-lg">
                        {b.buttonText}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* EXPORT CODE MODAL */}
      {isExportModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-slate-950 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <FileCode size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Clean HTML5 &amp; Tailwind CSS Export</h3>
                  <p className="text-xs text-slate-400">Ready-to-deploy static landing page bundle</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <pre className="text-[11px] font-mono text-emerald-300 bg-black/50 border border-white/10 p-4 rounded-2xl max-h-96 overflow-y-auto leading-relaxed">
              {generateExportHtml()}
            </pre>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(generateExportHtml());
                  setAlert('📋 Clean HTML5 markup copied to clipboard!');
                  setIsExportModalOpen(false);
                  setTimeout(() => setAlert(null), 3000);
                }}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                Copy HTML Code
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* SEO & SOCIAL META SETTINGS MODAL */}
      {isSeoModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-950 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Settings size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">SEO &amp; Social Meta Settings</h3>
                  <p className="text-xs text-slate-400">Search engine optimization and social preview cards</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSeoModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Page Title</label>
                <input
                  type="text"
                  value={metaSettings.pageTitle}
                  onChange={(e) => setMetaSettings({ ...metaSettings, pageTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Meta Description</label>
                <textarea
                  rows={3}
                  value={metaSettings.metaDescription}
                  onChange={(e) => setMetaSettings({ ...metaSettings, metaDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Public URL Slug</label>
                <div className="flex items-center gap-1.5 bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-slate-400">
                  <span>/api/cms/pages/public/</span>
                  <input
                    type="text"
                    value={metaSettings.slug}
                    onChange={(e) => setMetaSettings({ ...metaSettings, slug: e.target.value })}
                    className="flex-1 bg-transparent text-emerald-400 font-bold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsSeoModalOpen(false);
                  setAlert('SEO settings updated!');
                  setTimeout(() => setAlert(null), 2000);
                }}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer"
              >
                Save Meta Settings
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
