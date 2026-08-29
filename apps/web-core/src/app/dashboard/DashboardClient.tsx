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
} from 'lucide-react';
import Link from 'next/link';
import { useIndustry } from '@/components/industry/IndustryContext';
import { NicheFeaturePickerModal } from '@/components/industry/NicheFeaturePickerModal';
import { ALL_67_FEATURES } from '@/lib/featureCatalog';

export function DashboardClient() {
  const [selectedRange, setSelectedRange] = useState('All Transaction');
  const [alert, setAlert] = useState<string | null>(null);
  const [isFeaturePickerOpen, setIsFeaturePickerOpen] = useState(false);

  const { currentNiche, nicheConfig, activeFeatureIds, isFeatureEnabled } = useIndustry();

  const handleActionClick = (actionName: string) => {
    setAlert(`⚡ Triggered ${actionName} workflow!`);
    setTimeout(() => setAlert(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Quick Alert Banner */}
      {alert && (
        <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-amber-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-amber-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Dynamic Niche Ribbon Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-white/[0.04] to-orange-500/10 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-4 px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center text-xl font-bold shadow-lg shadow-orange-500/25">
            {nicheConfig.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white leading-tight">
                {nicheConfig.name}
              </h2>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {activeFeatureIds.length} / 67 Features Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Your homepage automatically synchronizes with the features selected in your niche profile.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsFeaturePickerOpen(true)}
            className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders size={13} />
            <span>Customize Features ({activeFeatureIds.length})</span>
          </button>

          <Link
            href="/industry"
            className="px-3.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all"
          >
            Switch Niche
          </Link>
        </div>
      </div>

      {/* ========================================================= */}
      {/* DYNAMIC NICHE FEATURE MODULES (Rendered based on 67 selection) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Hospital Bed Occupancy & EHR Widget (if feat_hospital_hub active) */}
        {isFeatureEnabled('feat_hospital_hub') && (
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-rose-500/30 rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <Stethoscope size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Clinical Hub</span>
                  <h4 className="text-xs font-bold text-white">Bed Occupancy</h4>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 font-mono">
                78% Cap
              </span>
            </div>
            <div className="flex justify-between items-end pt-1">
              <div>
                <span className="text-2xl font-mono font-extrabold text-white">142</span>
                <span className="text-xs text-slate-400"> / 180 Beds</span>
              </div>
              <Link href="/industry/hospital" className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1">
                EHR Triage <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        )}

        {/* 2. Real Estate MLS Portfolio Widget (if feat_realestate_hub active) */}
        {isFeatureEnabled('feat_realestate_hub') && (
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-emerald-500/30 rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Home size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Real Estate MLS</span>
                  <h4 className="text-xs font-bold text-white">Escrow Pipeline</h4>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 font-mono">
                18 Active
              </span>
            </div>
            <div className="flex justify-between items-end pt-1">
              <div>
                <span className="text-2xl font-mono font-extrabold text-emerald-400">$24.8M</span>
                <span className="text-xs text-slate-400"> Volume</span>
              </div>
              <Link href="/industry/realestate" className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
                Showings <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        )}

        {/* 3. Restaurant POS & Floor Plan Widget (if feat_restaurant_hub active) */}
        {isFeatureEnabled('feat_restaurant_hub') && (
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <UtensilsCrossed size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">F&B Floor Plan</span>
                  <h4 className="text-xs font-bold text-white">Seated Tables</h4>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 font-mono">
                14 / 20 Tables
              </span>
            </div>
            <div className="flex justify-between items-end pt-1">
              <div>
                <span className="text-2xl font-mono font-extrabold text-amber-400">6 KOT</span>
                <span className="text-xs text-slate-400"> in Kitchen</span>
              </div>
              <Link href="/industry/restaurant" className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1">
                Floor Map <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        )}

        {/* 4. Retail POS Cashier & SKU Stock (if feat_retail_hub active) */}
        {isFeatureEnabled('feat_retail_hub') && (
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-teal-500/30 rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  <ShoppingBag size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Retail Register</span>
                  <h4 className="text-xs font-bold text-white">POS Cashier</h4>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 font-mono">
                142 Orders
              </span>
            </div>
            <div className="flex justify-between items-end pt-1">
              <div>
                <span className="text-2xl font-mono font-extrabold text-teal-400">$14,280</span>
                <span className="text-xs text-slate-400"> Today</span>
              </div>
              <Link href="/industry/retail" className="text-xs text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1">
                Barcode POS <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        )}

        {/* 5. Dual Khata Ledger Cash-Flow Tile (if feat_khata_ledger active) */}
        {isFeatureEnabled('feat_khata_ledger') && (
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Database size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dual Khata Ledger</span>
                  <h4 className="text-xs font-bold text-white">Credit Balance</h4>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 font-mono">
                Balanced
              </span>
            </div>
            <div className="flex justify-between items-end pt-1">
              <div>
                <span className="text-2xl font-mono font-extrabold text-white">$48,290.00</span>
                <span className="text-xs text-slate-400"> Receivables</span>
              </div>
              <Link href="/dashboard" className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1">
                Reconcile <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        )}

        {/* 6. Neural Vision OCR Quick Ingestion (if feat_ocr_vision_extraction active) */}
        {isFeatureEnabled('feat_ocr_vision_extraction') && (
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
                  <Scan size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Neural OCR Scanner</span>
                  <h4 className="text-xs font-bold text-white">Document Vision</h4>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 font-mono">
                98.4% Acc
              </span>
            </div>
            <div className="flex justify-between items-end pt-1">
              <div>
                <span className="text-xs text-slate-300">Drop receipt or invoice</span>
              </div>
              <Link href="/ocr-invoice" className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1">
                Scan Now <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        )}

        {/* 7. B2B Lead Prospector Quick Search (if feat_b2b_database active) */}
        {isFeatureEnabled('feat_b2b_database') && (
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  <Database size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">B2B Lead Prospector</span>
                  <h4 className="text-xs font-bold text-white">275M+ Contacts</h4>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 font-mono">
                Apollo/Zoom
              </span>
            </div>
            <div className="flex justify-between items-end pt-1">
              <div>
                <span className="text-xs text-slate-300">Bulk import verified leads</span>
              </div>
              <Link href="/lead-prospector" className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1">
                Find Leads <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        )}

        {/* 8. AI Social Media Studio (if feat_social_composer active) */}
        {isFeatureEnabled('feat_social_composer') && (
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
                  <Share2 size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Social Media Studio</span>
                  <h4 className="text-xs font-bold text-white">4-Network Sync</h4>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 font-mono">
                𝕏 · FB · IG · LI
              </span>
            </div>
            <div className="flex justify-between items-end pt-1">
              <div>
                <span className="text-xs text-slate-300">Generate viral social posts</span>
              </div>
              <Link href="/social" className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1">
                Compose <ArrowRight size={12} />
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
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.09] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-5">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Executive Operations Hub</span>
              </h1>
              <span className="text-xs text-amber-400/80 font-mono font-medium flex items-center gap-1">
                <Sparkles size={13} className="text-amber-400 animate-pulse" />
                <span>Synchronized with {nicheConfig.shortName}</span>
              </span>
            </div>

            {/* 3 Metrics Pills in Translucent Glass */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-white/[0.03] backdrop-blur-xl border border-white/[0.07] rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-slate-300">
                  <Clock size={18} />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Total Balance
                  </span>
                  <span className="font-mono font-bold text-sm text-white">$789,999.56</span>
                </div>
              </div>

              <div className="p-3.5 bg-white/[0.03] backdrop-blur-xl border border-white/[0.07] rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <DollarSign size={18} />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Earnings
                  </span>
                  <span className="font-mono font-bold text-sm text-amber-400">$968,999.56</span>
                </div>
              </div>

              <div className="p-3.5 bg-white/[0.03] backdrop-blur-xl border border-white/[0.07] rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <Receipt size={18} />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Expenses
                  </span>
                  <span className="font-mono font-bold text-sm text-slate-200">$39,999.67</span>
                </div>
              </div>
            </div>
          </div>

          {/* Glowing Dual-Curve Statistics Chart */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.09] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Statistic</h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  Top half-year Earning and Expenses source
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-400 hidden sm:flex">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Enterprise</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Investment</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Operations</span>
                </div>

                <div className="px-3 py-1 bg-white/[0.05] border border-white/[0.08] rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <span>{selectedRange}</span>
                  <ChevronDown size={12} className="text-slate-400" />
                </div>
              </div>
            </div>

            {/* Glowing Bezier Curve SVG Simulation */}
            <div className="relative pt-6 pb-2">
              <div className="absolute top-2 left-[38%] -translate-x-1/2 z-10">
                <div className="px-2.5 py-1 bg-slate-950/90 border border-amber-400/80 rounded-xl text-[10px] font-mono font-extrabold text-amber-300 shadow-xl shadow-amber-500/30 flex items-center gap-1">
                  <span>10,256,198</span>
                </div>
              </div>

              <svg className="w-full h-44 overflow-visible" viewBox="0 0 600 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="amberGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <line x1="0" y1="40" x2="600" y2="40" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                <line x1="0" y1="90" x2="600" y2="90" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                <line x1="0" y1="140" x2="600" y2="140" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />

                <path
                  d="M 0 120 Q 120 130 220 50 T 400 110 T 600 70 L 600 160 L 0 160 Z"
                  fill="url(#amberGlow)"
                />

                <path
                  d="M 0 120 Q 120 130 220 50 T 400 110 T 600 70"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3"
                  className="drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]"
                />

                <path
                  d="M 0 90 Q 140 30 250 110 T 450 60 T 600 95"
                  fill="none"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                <circle cx="220" cy="50" r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
              </svg>

              <div className="flex justify-between text-xs font-semibold text-slate-400 pt-3 border-t border-white/[0.06]">
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
            <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.09] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">My Goals</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white/[0.03] border border-white/[0.07] rounded-2xl space-y-1">
                  <span className="text-xl font-extrabold text-amber-400 font-mono">60%</span>
                  <span className="text-[11px] text-slate-400 font-medium block">Enterprise SaaS</span>
                </div>
                <div className="p-3 bg-white/[0.03] border border-white/[0.07] rounded-2xl space-y-1">
                  <span className="text-xl font-extrabold text-white font-mono">89%</span>
                  <span className="text-[11px] text-slate-400 font-medium block">Real Estate Asset</span>
                </div>
              </div>
            </div>

            {/* Business Target Savings Card with Circular Dial */}
            <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.09] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Business Target</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">Target:</span>
                  <span className="text-xs font-mono font-extrabold text-amber-400">$1,000,000.00</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Total Saved: <span className="font-mono text-white font-bold">$300,345.96</span>
                </div>
              </div>

              {/* Circular Gauge 95% */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,0.08)" strokeWidth="5" fill="transparent" />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke="#f59e0b"
                    strokeWidth="5"
                    fill="transparent"
                    strokeDasharray="163"
                    strokeDashoffset="16"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                  />
                </svg>
                <span className="absolute font-mono font-extrabold text-xs text-white">95%</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Profile, Golden Card & Transactions (4 cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* User Profile & Golden Visa Card Container */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.09] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-5">
            {/* Profile Header */}
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-slate-300 cursor-pointer hover:bg-white/[0.1]">
                <Bell size={14} />
              </div>

              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 to-orange-500 shadow-lg shadow-orange-500/20 mb-1">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/[0.08] text-amber-300 border border-white/10 uppercase tracking-widest mt-1">
                  Exclusive Card
                </span>
                <h3 className="font-bold text-sm text-white mt-1">Emmanuella Takureea</h3>
              </div>

              <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-slate-300 cursor-pointer hover:bg-white/[0.1]">
                <MoreVertical size={14} />
              </div>
            </div>

            {/* Quick Circular Action Buttons */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/[0.06]">
              {[
                { label: 'Transfer', icon: Send },
                { label: 'Receive', icon: Download },
                { label: 'Bill', icon: Receipt },
                { label: 'Top up', icon: Plus },
              ].map((btn, idx) => {
                const Icon = btn.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleActionClick(btn.label)}
                    className="flex flex-col items-center space-y-1.5 p-2 rounded-2xl hover:bg-white/[0.06] transition-all group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/[0.08] group-hover:border-amber-500/40 group-hover:bg-amber-500/10 flex items-center justify-center text-slate-300 group-hover:text-amber-400 transition-all shadow-xs">
                      <Icon size={16} />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 group-hover:text-white transition-colors">
                      {btn.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Signature Golden-Amber Visa Virtual Card */}
            <div className="relative rounded-2xl overflow-hidden p-5 bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 text-slate-950 shadow-2xl shadow-orange-500/25 space-y-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold tracking-wider uppercase">Oluwakemi</span>
                  <span className="text-[10px] opacity-80 block font-medium">Business Elite Member</span>
                </div>
                <span className="font-serif italic font-black text-2xl tracking-tighter">Visa</span>
              </div>

              <div className="flex items-end justify-between pt-2">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-75 block">Expired</span>
                  <span className="font-mono font-bold text-xs">09/27</span>
                </div>

                <div className="text-right">
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-75 block">Total Balance</span>
                  <span className="font-mono font-black text-lg">$74,330</span>
                </div>
              </div>
            </div>
          </div>

          {/* Month Transactions Feed */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.09] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <h3 className="text-sm font-bold text-white">Month Transaction</h3>
              <span className="text-[10px] text-amber-400 font-bold uppercase">Recent</span>
            </div>

            <div className="space-y-3">
              {[
                {
                  name: 'Akeem Jamiu',
                  desc: 'January Salary & Retainer',
                  date: '15.01.2026 13:30PM',
                  amount: '$2,000.99',
                  img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                },
                {
                  name: 'Cyberdyne Systems',
                  desc: 'Enterprise License Wire',
                  date: '14.01.2026 09:15AM',
                  amount: '$14,500.00',
                  img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
                },
                {
                  name: 'Apex Cloud Hosting',
                  desc: 'Dedicated Edge CDN',
                  date: '12.01.2026 18:45PM',
                  amount: '$450.00',
                  img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
                },
              ].map((tx, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] rounded-2xl flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img src={tx.img} alt={tx.name} className="w-9 h-9 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-xs text-white">{tx.name}</h4>
                      <span className="text-[10px] text-slate-400 block">{tx.date}</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl font-mono font-extrabold text-xs bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30">
                    {tx.amount}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">See all transactions</span>
              <button
                onClick={() => handleActionClick('Transactions Ledger')}
                className="w-7 h-7 rounded-full bg-white/[0.08] hover:bg-amber-500 hover:text-slate-950 text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 67-Feature Picker Modal */}
      <NicheFeaturePickerModal
        isOpen={isFeaturePickerOpen}
        onClose={() => setIsFeaturePickerOpen(false)}
      />
    </div>
  );
}
