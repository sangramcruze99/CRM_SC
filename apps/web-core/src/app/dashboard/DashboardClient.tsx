'use client';

import { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  Briefcase,
  Activity,
  Sparkles,
  Bell,
  MoreVertical,
  Send,
  Download,
  Receipt,
  Plus,
  CreditCard,
  CheckCircle2,
  Clock,
  Wallet,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Stethoscope,
  Home,
  UtensilsCrossed,
  ShoppingBag,
  Scan,
  Database,
  Share2,
  Mail,
  FileSignature,
  Sliders,
  Check,
  Zap,
  Wifi,
  Target,
  BarChart3,
  Sparkle,
} from 'lucide-react';
import Link from 'next/link';
import { useIndustry } from '@/components/industry/IndustryContext';
import { NicheFeaturePickerModal } from '@/components/industry/NicheFeaturePickerModal';
import { BotanicalGlassCockpit } from '@/components/dashboard/BotanicalGlassCockpit';

interface DashboardClientProps {
  initialData?: {
    contacts?: any[];
    deals?: any[];
    invoices?: any[];
    projects?: any[];
    tickets?: any[];
    metrics?: {
      totalBalance?: number;
      grossEarnings?: number;
      monthlyExpenses?: number;
      totalDealsValue?: number;
      closedWonValue?: number;
      totalInvoicedValue?: number;
      contactsCount?: number;
      dealsCount?: number;
      invoicesCount?: number;
      projectsCount?: number;
      ticketsCount?: number;
    };
    recentActivities?: Array<{
      id: string;
      title: string;
      type: string;
      stage: string;
      amount: number;
      date: string;
      href: string;
    }>;
  };
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const [dashboardLayout, setDashboardLayout] = useState<'glass_cockpit' | 'classic_grid'>('glass_cockpit');
  const [selectedRange, setSelectedRange] = useState('All Transaction');
  const [activeChartTab, setActiveChartTab] = useState<'earning' | 'expenses' | 'profit'>('earning');
  const [alert, setAlert] = useState<string | null>(null);
  const [isFeaturePickerOpen, setIsFeaturePickerOpen] = useState(false);

  const { nicheConfig, activeFeatureIds, isFeatureEnabled } = useIndustry();

  const metrics = {
    totalBalance: initialData?.metrics?.totalBalance ?? 0,
    grossEarnings: initialData?.metrics?.grossEarnings ?? 0,
    monthlyExpenses: initialData?.metrics?.monthlyExpenses ?? 0,
    totalDealsValue: initialData?.metrics?.totalDealsValue ?? 0,
    closedWonValue: initialData?.metrics?.closedWonValue ?? 0,
    totalInvoicedValue: initialData?.metrics?.totalInvoicedValue ?? 0,
    contactsCount: initialData?.metrics?.contactsCount ?? 0,
    dealsCount: initialData?.metrics?.dealsCount ?? 0,
    invoicesCount: initialData?.metrics?.invoicesCount ?? 0,
    projectsCount: initialData?.metrics?.projectsCount ?? 0,
    ticketsCount: initialData?.metrics?.ticketsCount ?? 0,
  };

  const recentActivities = initialData?.recentActivities || [];

  const handleActionClick = (actionName: string) => {
    setAlert(`⚡ Triggered ${actionName} workflow!`);
    setTimeout(() => setAlert(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Quick Alert Banner */}
      {alert && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Top Layout Switcher Pill */}
      <div className="flex items-center justify-between gap-3 bg-white/[0.04] backdrop-blur-2xl border border-white/10 p-2 px-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-emerald-400" />
          <span className="text-xs font-bold text-white">Theme Presentation</span>
        </div>
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setDashboardLayout('glass_cockpit')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              dashboardLayout === 'glass_cockpit'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🌿 Botanical Glass Cockpit
          </button>
          <button
            type="button"
            onClick={() => setDashboardLayout('classic_grid')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              dashboardLayout === 'classic_grid'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🏢 Modular CRM Grid
          </button>
        </div>
      </div>

      {/* Render Botanical Glass Cockpit View */}
      {dashboardLayout === 'glass_cockpit' && <BotanicalGlassCockpit metrics={metrics} />}

      {/* Render Classic Modular CRM Grid View */}
      {dashboardLayout === 'classic_grid' && (
        <div className="space-y-6">
          {/* Dynamic Niche Ribbon Banner (Elevated Luxe Box) */}
          <div className="luxe-box rounded-3xl p-4 sm:p-5 px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-slate-950 flex items-center justify-center text-xl font-bold shadow-lg shadow-emerald-500/20 border border-emerald-300/30">
            {nicheConfig.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                {nicheConfig.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {activeFeatureIds.length} / 67 Features Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Your homepage automatically synchronizes with the features selected in your niche profile.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsFeaturePickerOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sliders size={13} />
            <span>Customize Features ({activeFeatureIds.length})</span>
          </button>

          <Link
            href="/industry"
            className="px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all hover:scale-[1.02]"
          >
            Switch Niche
          </Link>
        </div>
      </div>

      {/* ========================================================= */}
      {/* DYNAMIC NICHE FEATURE MODULES (Elevated Beveled Boxes) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Hospital Bed Occupancy & EHR Widget */}
        {isFeatureEnabled('feat_hospital_hub') && (
          <div className="luxe-box luxe-box-hover rounded-3xl p-5 space-y-3.5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-rose-500/20 to-rose-500/5 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-xs flex items-center justify-center">
                  <Stethoscope size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Clinical Hub</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Bed Occupancy</h4>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-400" />
                78% Cap
              </span>
            </div>
            <div className="flex justify-between items-end pt-1">
              <div>
                <span className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white tracking-tight">142</span>
                <span className="text-xs text-slate-500 dark:text-slate-400"> / 180 Beds</span>
              </div>
              <Link href="/industry/hospital" className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-500 font-bold flex items-center gap-1 transition-transform group-hover:translate-x-0.5">
                <span>EHR Triage</span> <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        )}

        {/* 2. Real Estate MLS Portfolio Widget */}
        {isFeatureEnabled('feat_realestate_hub') && (
          <div className="luxe-box luxe-box-hover rounded-3xl p-5 space-y-3.5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs flex items-center justify-center">
                  <Home size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Real Estate MLS</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Escrow Pipeline</h4>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                18 Active
              </span>
            </div>
            <div className="flex justify-between items-end pt-1">
              <div>
                <span className="text-2xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">$24.8M</span>
                <span className="text-xs text-slate-500 dark:text-slate-400"> Volume</span>
              </div>
              <Link href="/industry/realestate" className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-bold flex items-center gap-1 transition-transform group-hover:translate-x-0.5">
                <span>Showings</span> <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        )}

        {/* 3. Restaurant POS & Floor Plan Widget */}
        {isFeatureEnabled('feat_restaurant_hub') && (
          <div className="luxe-box luxe-box-hover rounded-3xl p-5 space-y-3.5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-amber-500/20 to-amber-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs flex items-center justify-center">
                  <UtensilsCrossed size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">F&B Floor Plan</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Seated Tables</h4>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-amber-700 dark:text-emerald-300 border border-emerald-500/30 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                14 / 20 Tables
              </span>
            </div>
            <div className="flex justify-between items-end pt-1">
              <div>
                <span className="text-2xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">6 KOT</span>
                <span className="text-xs text-slate-500 dark:text-slate-400"> in Kitchen</span>
              </div>
              <Link href="/industry/restaurant" className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-bold flex items-center gap-1 transition-transform group-hover:translate-x-0.5">
                <span>Floor Map</span> <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        )}

        {/* 4. Retail POS Cashier & SKU Stock */}
        {isFeatureEnabled('feat_retail_hub') && (
          <div className="luxe-box luxe-box-hover rounded-3xl p-5 space-y-3.5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-teal-500/20 to-teal-500/5 text-teal-600 dark:text-teal-400 border border-teal-500/30 shadow-xs flex items-center justify-center">
                  <ShoppingBag size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Retail Register</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">POS Cashier</h4>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/15 text-teal-600 dark:text-teal-300 border border-teal-500/30 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400" />
                142 Orders
              </span>
            </div>
            <div className="flex justify-between items-end pt-1">
              <div>
                <span className="text-2xl font-mono font-extrabold text-teal-600 dark:text-teal-400 tracking-tight">$14,280</span>
                <span className="text-xs text-slate-500 dark:text-slate-400"> Today</span>
              </div>
              <Link href="/industry/retail" className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-500 font-bold flex items-center gap-1 transition-transform group-hover:translate-x-0.5">
                <span>Barcode POS</span> <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        )}

        {/* 5. Dual Khata Ledger Cash-Flow Tile */}
        {isFeatureEnabled('feat_khata_ledger') && (
          <div className="luxe-box luxe-box-hover rounded-3xl p-5 space-y-3.5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-amber-500/20 to-amber-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs flex items-center justify-center">
                  <Database size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dual Khata Ledger</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Credit Balance</h4>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                Balanced
              </span>
            </div>
            <div className="flex justify-between items-end pt-1">
              <div>
                <span className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white tracking-tight">$48,290.00</span>
                <span className="text-xs text-slate-500 dark:text-slate-400"> Receivables</span>
              </div>
              <Link href="/banking" className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-bold flex items-center gap-1 transition-transform group-hover:translate-x-0.5">
                <span>Reconcile</span> <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        )}

        {/* 6. Neural Vision OCR Quick Ingestion */}
        {isFeatureEnabled('feat_ocr_vision_extraction') && (
          <div className="luxe-box luxe-box-hover rounded-3xl p-5 space-y-3.5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-sky-500/20 to-sky-500/5 text-sky-600 dark:text-sky-400 border border-sky-500/30 shadow-xs flex items-center justify-center">
                  <Scan size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Neural OCR Scanner</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Document Vision</h4>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-600 dark:text-sky-300 border border-sky-500/30 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-sky-400" />
                98.4% Acc
              </span>
            </div>
            <div className="flex justify-between items-end pt-1">
              <div>
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Drop receipt or invoice</span>
              </div>
              <Link href="/ocr-invoice" className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-500 font-bold flex items-center gap-1 transition-transform group-hover:translate-x-0.5">
                <span>Scan Now</span> <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        )}

        {/* 7. B2B Lead Prospector Quick Search */}
        {isFeatureEnabled('feat_b2b_database') && (
          <div className="luxe-box luxe-box-hover rounded-3xl p-5 space-y-3.5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-indigo-500/20 to-indigo-500/5 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 shadow-xs flex items-center justify-center">
                  <Database size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">B2B Lead Prospector</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">275M+ Contacts</h4>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 font-mono">
                Apollo/Zoom
              </span>
            </div>
            <div className="flex justify-between items-end pt-1">
              <div>
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Bulk import verified leads</span>
              </div>
              <Link href="/lead-prospector" className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-bold flex items-center gap-1 transition-transform group-hover:translate-x-0.5">
                <span>Find Leads</span> <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        )}

        {/* 8. AI Social Media Studio */}
        {isFeatureEnabled('feat_social_composer') && (
          <div className="luxe-box luxe-box-hover rounded-3xl p-5 space-y-3.5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-purple-500/20 to-purple-500/5 text-purple-600 dark:text-purple-400 border border-purple-500/30 shadow-xs flex items-center justify-center">
                  <Share2 size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Social Media Studio</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">4-Network Sync</h4>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30 font-mono">
                𝕏 · FB · IG · LI
              </span>
            </div>
            <div className="flex justify-between items-end pt-1">
              <div>
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Generate viral social posts</span>
              </div>
              <Link href="/social" className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-500 font-bold flex items-center gap-1 transition-transform group-hover:translate-x-0.5">
                <span>Compose</span> <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Main Glassmorphic Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Main Dashboard, Stats Curve & Goals (8 cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* Top Header & 3-Pill Balance Glass Card */}
          <div className="luxe-box rounded-3xl p-6 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/[0.06] pb-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Executive Operations Hub</span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time consolidated treasury, gross earnings & statutory burn</p>
              </div>
              <span className="text-xs text-amber-700 dark:text-emerald-400/90 font-mono font-medium flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                <Sparkles size={13} className="text-emerald-500 dark:text-emerald-400 animate-pulse" />
                <span>Live Sync Active</span>
              </span>
            </div>

            {/* 3 Metrics Pills in Beveled Glass */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total Balance Card */}
              <div className="luxe-inner-card rounded-2xl p-4.5 space-y-3 relative overflow-hidden group hover:border-slate-300 dark:hover:border-white/20 transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-xs">
                    <Wallet size={18} />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/25 flex items-center gap-0.5">
                    <ArrowUpRight size={10} /> +8.4%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                    Total Balance
                  </span>
                  <span className="font-mono font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">
                    ${metrics.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Earnings Card */}
              <div className="luxe-inner-card rounded-2xl p-4.5 space-y-3 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
                    <DollarSign size={18} />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/25 flex items-center gap-0.5">
                    <ArrowUpRight size={10} /> +14.2%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                    Gross Earnings
                  </span>
                  <span className="font-mono font-extrabold text-xl text-emerald-600 dark:text-emerald-400 tracking-tight">
                    ${metrics.grossEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Expenses Card */}
              <div className="luxe-inner-card rounded-2xl p-4.5 space-y-3 relative overflow-hidden group hover:border-teal-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-xs">
                    <Receipt size={18} />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.05] px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/[0.08]">
                    Burn 4.1%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                    Monthly Expenses
                  </span>
                  <span className="font-mono font-extrabold text-xl text-slate-900 dark:text-slate-200 tracking-tight">
                    ${metrics.monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Glowing Dual-Curve Statistics Chart (Elevated Luxe Box) */}
          <div className="luxe-box rounded-3xl p-6 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/[0.06] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 size={18} className="text-emerald-500 dark:text-emerald-400" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Performance Statistics</h3>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Top half-year revenue trajectories & operations variance
                </span>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl text-[11px] font-semibold">
                  <button
                    onClick={() => setActiveChartTab('earning')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      activeChartTab === 'earning'
                        ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/30 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    Earning
                  </button>
                  <button
                    onClick={() => setActiveChartTab('expenses')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      activeChartTab === 'expenses'
                        ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/30 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    Expenses
                  </button>
                </div>

                <div className="px-3 py-1.5 bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-colors">
                  <span>{selectedRange}</span>
                  <ChevronDown size={12} className="text-slate-500 dark:text-slate-400" />
                </div>
              </div>
            </div>

            {/* Glowing Bezier Curve SVG Simulation */}
            <div className="relative pt-6 pb-2">
              <div className="absolute top-1 left-[38%] -translate-x-1/2 z-10">
                <div className="px-3 py-1 bg-slate-900 text-emerald-300 dark:bg-slate-950/95 border border-emerald-400/80 rounded-xl text-[10px] font-mono font-extrabold shadow-xl shadow-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Gross: ${(metrics.grossEarnings || 0).toLocaleString()}</span>
                </div>
              </div>

              <svg className="w-full h-48 overflow-visible" viewBox="0 0 600 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="emeraldChartGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
                    <stop offset="60%" stopColor="#10b981" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <line x1="0" y1="40" x2="600" y2="40" stroke="rgba(148,163,184,0.15)" strokeDasharray="3 3" />
                <line x1="0" y1="90" x2="600" y2="90" stroke="rgba(148,163,184,0.15)" strokeDasharray="3 3" />
                <line x1="0" y1="140" x2="600" y2="140" stroke="rgba(148,163,184,0.15)" strokeDasharray="3 3" />

                <path
                  d="M 0 120 Q 120 130 220 50 T 400 110 T 600 70 L 600 160 L 0 160 Z"
                  fill="url(#emeraldChartGlow)"
                />

                <path
                  d="M 0 120 Q 120 130 220 50 T 400 110 T 600 70"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  className="drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]"
                />

                <path
                  d="M 0 90 Q 140 30 250 110 T 450 60 T 600 95"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                <circle cx="220" cy="50" r="5.5" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" className="shadow-lg shadow-emerald-500/50" />
              </svg>

              <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 pt-3.5 border-t border-slate-200 dark:border-white/[0.06]">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
              </div>
            </div>
          </div>

          {/* Goals & Business Target Savings Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* My Goals Card */}
            <div className="luxe-box rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Target size={14} className="text-emerald-500 dark:text-emerald-400" />
                  <span>Pipeline & Billing Goals</span>
                </h3>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">Live Status</span>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="luxe-inner-card rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                      {metrics.dealsCount}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[11px] text-slate-800 dark:text-slate-300 font-bold block">Deals in Pipeline</span>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-white/[0.08] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[70%]" />
                  </div>
                </div>

                <div className="luxe-inner-card rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-extrabold text-teal-600 dark:text-teal-400 font-mono tracking-tight">
                      {metrics.invoicesCount}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                  </div>
                  <span className="text-[11px] text-slate-800 dark:text-slate-300 font-bold block">Invoices Raised</span>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-white/[0.08] rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full w-[85%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Target Savings Card with Circular Dial */}
            <div className="luxe-box rounded-3xl p-5 sm:p-6 flex items-center justify-between">
              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Target Goal</span>
                <div className="space-y-0.5">
                  <div className="text-xs text-slate-600 dark:text-slate-400">Target: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">$1,000,000.00</span></div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Balance: <span className="font-mono font-bold text-slate-900 dark:text-white">${metrics.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
                </div>
                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25">
                  Live Operations
                </span>
              </div>

              {/* Circular Gauge */}
              <div className="relative w-18 h-18 flex items-center justify-center">
                <svg className="w-18 h-18 transform -rotate-90">
                  <circle cx="36" cy="36" r="30" stroke="rgba(148,163,184,0.2)" strokeWidth="6" fill="transparent" />
                  <circle
                    cx="36"
                    cy="36"
                    r="30"
                    stroke="#10b981"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray="188"
                    strokeDashoffset="28"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                  />
                </svg>
                <span className="absolute font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                  {metrics.grossEarnings > 0 ? `${Math.min(100, Math.round((metrics.totalBalance / 1000000) * 100))}%` : '0%'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Profile, Golden Card & Transactions (4 cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* User Profile & Golden Titanium Visa Card Container */}
          <div className="luxe-box rounded-3xl p-6 sm:p-7 space-y-5">
            {/* Profile Header */}
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-colors shadow-xs">
                <Bell size={14} />
              </div>

              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-xl shadow-emerald-500/25 mb-1.5 ring-2 ring-emerald-400/40">
                  SC
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 uppercase tracking-widest">
                  VIP Superadmin
                </span>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">Sangram Cruze</h3>
                <span className="text-[11px] text-slate-500 font-medium">admin@gmail.com</span>
              </div>

              <Link
                href="/developer"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-colors shadow-xs"
                title="Account Settings & API"
              >
                <MoreVertical size={14} />
              </Link>
            </div>

            {/* Quick Beveled Action Tiles */}
            <div className="grid grid-cols-4 gap-2.5 pt-3 border-t border-slate-200 dark:border-white/[0.06]">
              {[
                { label: 'Transfer', icon: Send, href: '/banking' },
                { label: 'Receive', icon: Download, href: '/deals' },
                { label: 'Bill', icon: Receipt, href: '/invoices' },
                { label: 'Top up', icon: Plus, href: '/super-admin' },
              ].map((btn, idx) => {
                const Icon = btn.icon;
                return (
                  <Link
                    key={idx}
                    href={btn.href}
                    className="luxe-inner-card flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-slate-200/50 dark:hover:bg-white/[0.08] hover:border-emerald-500/40 transition-all group cursor-pointer"
                  >
                    <Icon size={16} className="text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-1.5" />
                    <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      {btn.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Signature Luxury Emerald-Teal Titanium Visa Card */}
            <div className="relative rounded-2xl overflow-hidden p-5 bg-gradient-to-br from-[#065f46] via-[#047857] to-[#0f766e] text-white shadow-2xl shadow-emerald-500/25 space-y-5 border border-emerald-400/30">
              {/* Metallic Card Sheen & Hologram Highlight */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-white/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-300/20 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  {/* EMV Micro Chip */}
                  <div className="w-8 h-6 rounded-md bg-gradient-to-br from-emerald-200 to-emerald-400 border border-emerald-500/40 shadow-xs flex items-center justify-center">
                    <div className="w-4 h-3 border-y border-emerald-700/40" />
                  </div>
                  <Wifi size={14} className="text-white/80 rotate-90" />
                </div>
                <span className="font-serif italic font-black text-2xl tracking-tighter text-white">
                  VISA
                </span>
              </div>

              {/* Card Number */}
              <div className="font-mono font-bold tracking-widest text-xs text-emerald-100 relative z-10 pt-1">
                •••• •••• •••• 7433
              </div>

              <div className="flex items-end justify-between pt-1 relative z-10">
                <div>
                  <span className="text-[8px] font-extrabold uppercase tracking-widest text-emerald-200/80 block">
                    Cardholder
                  </span>
                  <span className="font-bold text-xs text-white uppercase tracking-tight">
                    SANGRAM CRUZE
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[8px] font-extrabold uppercase tracking-widest text-emerald-200/80 block">
                    Available Balance
                  </span>
                  <span className="font-mono font-black text-base text-white">
                    ${metrics.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Real Backend Live Activity / Transactions Feed */}
          <div className="luxe-box rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Live Activity & Transactions</h3>
              <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-mono font-bold uppercase bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Live Feed
              </span>
            </div>

            <div className="space-y-2.5">
              {recentActivities.map((act, idx) => (
                <Link
                  key={act.id || idx}
                  href={act.href || '/dashboard'}
                  className="p-3.5 luxe-inner-card hover:border-emerald-500/40 rounded-2xl flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      {act.type === 'DEAL' ? <Briefcase size={15} /> : <Receipt size={15} />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {act.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-white/[0.06] font-mono font-semibold">{act.stage}</span>
                        <span>•</span>
                        <span>{act.date}</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl font-mono font-extrabold text-xs bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                    ${act.amount.toLocaleString()}
                  </span>
                </Link>
              ))}

              {recentActivities.length === 0 && (
                <div className="p-6 text-center space-y-3 rounded-2xl bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
                    <Sparkles size={18} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">No live transactions yet</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Create your first deal or commercial invoice to see real-time activity here.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <Link
                      href="/deals"
                      className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20 hover:scale-105 transition-all"
                    >
                      + New Deal
                    </Link>
                    <Link
                      href="/invoices"
                      className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 border border-white/10 rounded-xl text-xs font-semibold"
                    >
                      + New Invoice
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
              <Link href="/banking" className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-500 font-medium transition-colors">
                View Dual Khata Ledger →
              </Link>
              <Link
                href="/banking"
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-emerald-500 hover:text-slate-950 text-slate-700 dark:bg-white/[0.06] dark:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
              >
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
      )}

      {/* 67-Feature Picker Modal */}
      <NicheFeaturePickerModal
        isOpen={isFeaturePickerOpen}
        onClose={() => setIsFeaturePickerOpen(false)}
      />
    </div>
  );
}
