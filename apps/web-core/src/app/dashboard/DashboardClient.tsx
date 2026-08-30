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
} from 'lucide-react';
import Link from 'next/link';
import { useIndustry } from '@/components/industry/IndustryContext';
import { NicheFeaturePickerModal } from '@/components/industry/NicheFeaturePickerModal';

export function DashboardClient() {
  const [selectedRange, setSelectedRange] = useState('All Transaction');
  const [activeChartTab, setActiveChartTab] = useState<'earning' | 'expenses' | 'profit'>('earning');
  const [alert, setAlert] = useState<string | null>(null);
  const [isFeaturePickerOpen, setIsFeaturePickerOpen] = useState(false);

  const { nicheConfig, activeFeatureIds, isFeatureEnabled } = useIndustry();

  const handleActionClick = (actionName: string) => {
    setAlert(`⚡ Triggered ${actionName} workflow!`);
    setTimeout(() => setAlert(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Quick Alert Banner */}
      {alert && (
        <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-amber-500 dark:text-amber-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Dynamic Niche Ribbon Banner (Elevated Luxe Box) */}
      <div className="luxe-box rounded-3xl p-4 sm:p-5 px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 text-slate-950 flex items-center justify-center text-xl font-bold shadow-lg shadow-orange-500/20 border border-amber-300/30">
            {nicheConfig.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                {nicheConfig.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
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
            className="px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-700 dark:text-amber-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sliders size={13} />
            <span>Customize Features ({activeFeatureIds.length})</span>
          </button>

          <Link
            href="/industry"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs font-semibold transition-all hover:scale-[1.02]"
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
                <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs flex items-center justify-center">
                  <UtensilsCrossed size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">F&B Floor Plan</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Seated Tables</h4>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                14 / 20 Tables
              </span>
            </div>
            <div className="flex justify-between items-end pt-1">
              <div>
                <span className="text-2xl font-mono font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">6 KOT</span>
                <span className="text-xs text-slate-500 dark:text-slate-400"> in Kitchen</span>
              </div>
              <Link href="/industry/restaurant" className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-500 font-bold flex items-center gap-1 transition-transform group-hover:translate-x-0.5">
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
                <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs flex items-center justify-center">
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
              <Link href="/banking" className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-500 font-bold flex items-center gap-1 transition-transform group-hover:translate-x-0.5">
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
              <span className="text-xs text-amber-700 dark:text-amber-400/90 font-mono font-medium flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                <Sparkles size={13} className="text-amber-500 dark:text-amber-400 animate-pulse" />
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
                  <span className="font-mono font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">$789,999.56</span>
                </div>
              </div>

              {/* Earnings Card */}
              <div className="luxe-inner-card rounded-2xl p-4.5 space-y-3 relative overflow-hidden group hover:border-amber-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
                    <DollarSign size={18} />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/25 flex items-center gap-0.5">
                    <ArrowUpRight size={10} /> +14.2%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                    Gross Earnings
                  </span>
                  <span className="font-mono font-extrabold text-xl text-amber-600 dark:text-amber-400 tracking-tight">$968,999.56</span>
                </div>
              </div>

              {/* Expenses Card */}
              <div className="luxe-inner-card rounded-2xl p-4.5 space-y-3 relative overflow-hidden group hover:border-orange-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-xs">
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
                  <span className="font-mono font-extrabold text-xl text-slate-900 dark:text-slate-200 tracking-tight">$39,999.67</span>
                </div>
              </div>
            </div>
          </div>

          {/* Glowing Dual-Curve Statistics Chart (Elevated Luxe Box) */}
          <div className="luxe-box rounded-3xl p-6 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/[0.06] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 size={18} className="text-amber-500 dark:text-amber-400" />
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
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    Earning
                  </button>
                  <button
                    onClick={() => setActiveChartTab('expenses')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      activeChartTab === 'expenses'
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30 shadow-xs'
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
                <div className="px-3 py-1 bg-slate-900 text-amber-300 dark:bg-slate-950/95 border border-amber-400/80 rounded-xl text-[10px] font-mono font-extrabold shadow-xl shadow-amber-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  <span>Peak: 10,256,198</span>
                </div>
              </div>

              <svg className="w-full h-48 overflow-visible" viewBox="0 0 600 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="amberChartGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.28" />
                    <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <line x1="0" y1="40" x2="600" y2="40" stroke="rgba(148,163,184,0.15)" strokeDasharray="3 3" />
                <line x1="0" y1="90" x2="600" y2="90" stroke="rgba(148,163,184,0.15)" strokeDasharray="3 3" />
                <line x1="0" y1="140" x2="600" y2="140" stroke="rgba(148,163,184,0.15)" strokeDasharray="3 3" />

                <path
                  d="M 0 120 Q 120 130 220 50 T 400 110 T 600 70 L 600 160 L 0 160 Z"
                  fill="url(#amberChartGlow)"
                />

                <path
                  d="M 0 120 Q 120 130 220 50 T 400 110 T 600 70"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3.5"
                  className="drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]"
                />

                <path
                  d="M 0 90 Q 140 30 250 110 T 450 60 T 600 95"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                <circle cx="220" cy="50" r="5.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2.5" className="shadow-lg shadow-amber-500/50" />
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
                  <Target size={14} className="text-amber-500 dark:text-amber-400" />
                  <span>Strategic Goals</span>
                </h3>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">2/2 On Track</span>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="luxe-inner-card rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400 font-mono tracking-tight">60%</span>
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  </div>
                  <span className="text-[11px] text-slate-800 dark:text-slate-300 font-bold block">Enterprise SaaS</span>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-white/[0.08] rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full w-[60%]" />
                  </div>
                </div>

                <div className="luxe-inner-card rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">89%</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[11px] text-slate-800 dark:text-slate-300 font-bold block">Real Estate Asset</span>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-white/[0.08] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[89%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Target Savings Card with Circular Dial */}
            <div className="luxe-box rounded-3xl p-5 sm:p-6 flex items-center justify-between">
              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Annual Target</span>
                <div className="space-y-0.5">
                  <div className="text-xs text-slate-600 dark:text-slate-400">Target: <span className="font-mono font-bold text-amber-600 dark:text-amber-400">$1,000,000.00</span></div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Accumulated: <span className="font-mono font-bold text-slate-900 dark:text-white">$300,345.96</span></div>
                </div>
                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                  Phase 3 Completed
                </span>
              </div>

              {/* Circular Gauge 95% */}
              <div className="relative w-18 h-18 flex items-center justify-center">
                <svg className="w-18 h-18 transform -rotate-90">
                  <circle cx="36" cy="36" r="30" stroke="rgba(148,163,184,0.2)" strokeWidth="6" fill="transparent" />
                  <circle
                    cx="36"
                    cy="36"
                    r="30"
                    stroke="#f59e0b"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray="188"
                    strokeDashoffset="18"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                  />
                </svg>
                <span className="absolute font-mono font-extrabold text-sm text-slate-900 dark:text-white">95%</span>
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
                <div className="w-15 h-15 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 to-orange-500 shadow-xl shadow-orange-500/25 mb-1.5">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 uppercase tracking-widest">
                  VIP Executive
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1">Emmanuella Takureea</h3>
              </div>

              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-colors shadow-xs">
                <MoreVertical size={14} />
              </div>
            </div>

            {/* Quick Beveled Action Tiles */}
            <div className="grid grid-cols-4 gap-2.5 pt-3 border-t border-slate-200 dark:border-white/[0.06]">
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
                    className="luxe-inner-card flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-slate-200/50 dark:hover:bg-white/[0.08] hover:border-amber-500/40 transition-all group cursor-pointer"
                  >
                    <Icon size={16} className="text-slate-700 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors mb-1.5" />
                    <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      {btn.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Signature Luxury Gold-Amber Titanium Visa Card */}
            <div className="relative rounded-2xl overflow-hidden p-5 bg-gradient-to-br from-[#d97706] via-[#ea580c] to-[#b45309] text-slate-950 shadow-2xl shadow-orange-500/25 space-y-5 border border-amber-200/40">
              {/* Metallic Card Sheen & Hologram Highlight */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-white/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-300/20 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  {/* EMV Micro Chip */}
                  <div className="w-8 h-6 rounded-md bg-gradient-to-br from-amber-200 to-amber-400 border border-amber-500/40 shadow-xs flex items-center justify-center">
                    <div className="w-4 h-3 border-y border-amber-700/40" />
                  </div>
                  <Wifi size={14} className="text-slate-950/70 rotate-90" />
                </div>
                <span className="font-serif italic font-black text-2xl tracking-tighter text-slate-950">
                  VISA
                </span>
              </div>

              {/* Card Number */}
              <div className="font-mono font-bold tracking-widest text-xs text-slate-950/90 relative z-10 pt-1">
                •••• •••• •••• 7433
              </div>

              <div className="flex items-end justify-between pt-1 relative z-10">
                <div>
                  <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-950/70 block">
                    Cardholder
                  </span>
                  <span className="font-bold text-xs text-slate-950 uppercase tracking-tight">
                    OLUWAKEMI
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-950/70 block">
                    Available Balance
                  </span>
                  <span className="font-mono font-black text-base text-slate-950">
                    $74,330.00
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Month Transactions Feed */}
          <div className="luxe-box rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Recent Transactions</h3>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono font-bold uppercase bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                Live Feed
              </span>
            </div>

            <div className="space-y-3">
              {[
                {
                  name: 'Akeem Jamiu',
                  desc: 'January Salary & Retainer',
                  date: '15.01.2026 13:30PM',
                  amount: '$2,000.99',
                  type: 'PAYROLL',
                  img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                },
                {
                  name: 'Cyberdyne Systems',
                  desc: 'Enterprise License Wire',
                  date: '14.01.2026 09:15AM',
                  amount: '$14,500.00',
                  type: 'WIRE',
                  img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
                },
                {
                  name: 'Apex Cloud Hosting',
                  desc: 'Dedicated Edge CDN',
                  date: '12.01.2026 18:45PM',
                  amount: '$450.00',
                  type: 'INVOICE',
                  img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
                },
              ].map((tx, idx) => (
                <div
                  key={idx}
                  className="p-3.5 luxe-inner-card hover:border-slate-300 dark:hover:border-white/20 rounded-2xl flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img src={tx.img} alt={tx.name} className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-white/10" />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">{tx.name}</h4>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{tx.date}</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl font-mono font-extrabold text-xs bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    {tx.amount}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">See all transactions</span>
              <button
                onClick={() => handleActionClick('Transactions Ledger')}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:bg-white/[0.06] dark:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
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
