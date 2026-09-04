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
  Building2,
  Cpu,
  Layers,
  Landmark,
  ArrowUpDown,
  RefreshCw,
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
  const [dashboardLayout, setDashboardLayout] = useState<'glass_cockpit' | 'classic_grid'>('classic_grid');
  const [selectedRange, setSelectedRange] = useState('Quarterly (Q3)');
  const [activeChartTab, setActiveChartTab] = useState<'earning' | 'expenses' | 'margin'>('earning');
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
    setAlert(`⚡ Executed ${actionName} transaction workflow`);
    setTimeout(() => setAlert(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Quick Alert Banner */}
      {alert && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          <span>{alert}</span>
        </div>
      )}

      {/* Top Layout & Mode Switcher Bar */}
      <div className="flex items-center justify-between gap-3 botanical-glass-card p-3 px-5">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-emerald-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Workspace Mode
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/[0.06] p-1 rounded-full border border-white/10">
          <button
            type="button"
            onClick={() => setDashboardLayout('classic_grid')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              dashboardLayout === 'classic_grid'
                ? 'botanical-pill-active'
                : 'botanical-pill'
            }`}
          >
            🏢 Executive Operations HUD
          </button>
          <button
            type="button"
            onClick={() => setDashboardLayout('glass_cockpit')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              dashboardLayout === 'glass_cockpit'
                ? 'botanical-pill-active'
                : 'botanical-pill'
            }`}
          >
            🌿 Botanical Glass Cockpit
          </button>
        </div>
      </div>

      {/* Render Botanical Glass Cockpit View */}
      {dashboardLayout === 'glass_cockpit' && <BotanicalGlassCockpit metrics={metrics} />}

      {/* Render Executive Operations HUD */}
      {dashboardLayout === 'classic_grid' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* ========================================================= */}
          {/* 1. EXECUTIVE NICHE PROFILE & FEATURE MATRIX HEADER         */}
          {/* ========================================================= */}
          <div className="workstation-card p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-slate-950 flex items-center justify-center text-xl font-bold shadow-lg shadow-emerald-500/20 border border-emerald-300/30 shrink-0">
                {nicheConfig.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                    {nicheConfig.name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {activeFeatureIds.length} Active Modules
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Unified enterprise dashboard synchronized with your organizational niche schema.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => setIsFeaturePickerOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <Sliders size={13} />
                <span>Configure Matrix ({activeFeatureIds.length})</span>
              </button>

              <Link
                href="/industry"
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>Switch Niche</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 2. DYNAMIC OPERATIONS BENTO MATRIX (Asymmetric Layout)     */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Spotlight Hero Operation Card (Span 6) */}
            <div className="md:col-span-12 lg:col-span-6 workstation-card p-5 space-y-4 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-xs">
                    <Activity size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Primary Operational Throughput
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {nicheConfig.shortName} Live Pipeline
                    </h3>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                  REAL-TIME SYNC
                </span>
              </div>

              {/* Central Operational Metric Display */}
              <div className="grid grid-cols-2 gap-4 py-2.5 border-y border-slate-200 dark:border-white/[0.06]">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
                    Active Volume & Assets
                  </span>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight mt-0.5">
                    $24.8M <span className="text-xs text-emerald-500 font-bold">+18.4%</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">18 Active Closings in Flight</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
                    Operational Capacity
                  </span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight mt-0.5">
                    78.2% <span className="text-xs text-teal-500 font-bold">Optimal</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">142 / 180 Units Allocated</span>
                </div>
              </div>

              {/* Bottom Quick Jump Action */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Direct telemetry from {nicheConfig.shortName} microservice engine
                </span>
                <Link
                  href="/deals"
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center gap-1"
                >
                  <span>Launch Module</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* 4 Compact Telemetry Tiles (Span 6 Grid) */}
            <div className="md:col-span-12 lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tile 1: Dual Khata Ledger */}
              <div className="workstation-card p-4 space-y-2.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database size={15} className="text-emerald-500 dark:text-emerald-400" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Dual Khata Ledger</h4>
                  </div>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                    Balanced
                  </span>
                </div>
                <div>
                  <span className="text-lg font-mono font-black text-slate-900 dark:text-white block">$48,290.00</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Receivables Ledger</span>
                </div>
                <Link href="/banking" className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-bold flex items-center gap-1">
                  <span>Reconcile</span> <ArrowRight size={11} />
                </Link>
              </div>

              {/* Tile 2: Neural OCR Pipeline */}
              <div className="workstation-card p-4 space-y-2.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scan size={15} className="text-teal-500 dark:text-teal-400" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Neural OCR</h4>
                  </div>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-teal-500/15 text-teal-600 dark:text-teal-300 border border-teal-500/30">
                    98.4% Acc
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium block">Document Vision Engine</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Zero-touch line extraction</span>
                </div>
                <Link href="/ocr-invoice" className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-500 font-bold flex items-center gap-1">
                  <span>Scan Document</span> <ArrowRight size={11} />
                </Link>
              </div>

              {/* Tile 3: B2B Lead Prospector */}
              <div className="workstation-card p-4 space-y-2.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={15} className="text-emerald-500 dark:text-emerald-400" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Lead Engine</h4>
                  </div>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                    275M+
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium block">Apollo / Zoom Integration</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Verified B2B Decision Makers</span>
                </div>
                <Link href="/lead-prospector" className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-bold flex items-center gap-1">
                  <span>Query Leads</span> <ArrowRight size={11} />
                </Link>
              </div>

              {/* Tile 4: Multi-Network Social Distribution */}
              <div className="workstation-card p-4 space-y-2.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Share2 size={15} className="text-teal-500 dark:text-teal-400" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Social Studio</h4>
                  </div>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-teal-500/15 text-teal-600 dark:text-teal-300 border border-teal-500/30">
                    4-Network
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium block">Automated Social Sync</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">𝕏 · LinkedIn · IG · FB</span>
                </div>
                <Link href="/social" className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-500 font-bold flex items-center gap-1">
                  <span>Compose Post</span> <ArrowRight size={11} />
                </Link>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 3. MAIN DASHBOARD: FINANCIAL TELEMETRY & OPERATIONS CONSOLE */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Main Telemetry, Matrix Ribbon & Goals (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Executive Treasury Matrix Ribbon */}
              <div className="workstation-card p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/[0.06] pb-3.5">
                  <div>
                    <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                      <Landmark size={17} className="text-emerald-500 dark:text-emerald-400" />
                      <span>Corporate Treasury & Capital Efficiency</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Real-time consolidated balance, gross inflows & burn velocity
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>AUTOMATED AUDIT ACTIVE</span>
                  </span>
                </div>

                {/* 3 High-Density Treasury Metric Panels */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Metric 1 */}
                  <div className="workstation-surface p-4 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      <span>Total Treasury Balance</span>
                      <span className="text-emerald-500 font-mono font-bold flex items-center text-[10px]">
                        <ArrowUpRight size={11} /> +8.4%
                      </span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                      ${metrics.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <span className="text-[10px] text-slate-400 block">Available liquidity</span>
                  </div>

                  {/* Metric 2 */}
                  <div className="workstation-surface p-4 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      <span>Gross Billings (MTD)</span>
                      <span className="text-emerald-500 font-mono font-bold flex items-center text-[10px]">
                        <ArrowUpRight size={11} /> +14.2%
                      </span>
                    </div>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                      ${metrics.grossEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <span className="text-[10px] text-slate-400 block">Recognized revenue</span>
                  </div>

                  {/* Metric 3 */}
                  <div className="workstation-surface p-4 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      <span>Operational Burn</span>
                      <span className="text-slate-500 font-mono font-semibold text-[10px]">
                        4.1% MoM
                      </span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                      ${metrics.monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <span className="text-[10px] text-slate-400 block">Direct OpEx & Payroll</span>
                  </div>
                </div>
              </div>

              {/* Performance Analytics Telemetry Panel */}
              <div className="workstation-card p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/[0.06] pb-3.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <BarChart3 size={17} className="text-emerald-500 dark:text-emerald-400" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                        Revenue Trajectory & Deal Velocity
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Comparative multi-quarter run-rate and conversion metrics
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1 p-1 bg-white/[0.06] border border-white/10 rounded-full text-xs">
                      <button
                        onClick={() => setActiveChartTab('earning')}
                        className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          activeChartTab === 'earning'
                            ? 'botanical-pill-active'
                            : 'botanical-pill'
                        }`}
                      >
                        Revenue
                      </button>
                      <button
                        onClick={() => setActiveChartTab('expenses')}
                        className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          activeChartTab === 'expenses'
                            ? 'botanical-pill-active'
                            : 'botanical-pill'
                        }`}
                      >
                        Expenses
                      </button>
                      <button
                        onClick={() => setActiveChartTab('margin')}
                        className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          activeChartTab === 'margin'
                            ? 'botanical-pill-active'
                            : 'botanical-pill'
                        }`}
                      >
                        Net Margin
                      </button>
                    </div>

                    <div className="px-3 py-1.5 botanical-pill text-xs flex items-center gap-1 cursor-pointer">
                      <span>{selectedRange}</span>
                      <ChevronDown size={12} className="text-emerald-400" />
                    </div>
                  </div>
                </div>

                {/* Analytical Cartesian Bar / Area Grid Visualization */}
                <div className="relative pt-4 pb-2">
                  <div className="grid grid-cols-6 gap-3 sm:gap-4 h-44 items-end pt-6 px-2">
                    {[
                      { month: 'Jan', val: 42, target: 50, amount: '$42,000' },
                      { month: 'Feb', val: 68, target: 60, amount: '$68,500' },
                      { month: 'Mar', val: 54, target: 70, amount: '$54,200' },
                      { month: 'Apr', val: 89, target: 80, amount: '$89,400' },
                      { month: 'May', val: 76, target: 85, amount: '$76,000' },
                      { month: 'Jun', val: 94, target: 90, amount: '$94,280' },
                    ].map((bar, i) => (
                      <div key={bar.month} className="flex flex-col items-center gap-2 group relative">
                        {/* Hover Telemetry Card */}
                        <div className="absolute -top-10 bg-slate-900 text-emerald-300 text-[10px] font-mono px-2.5 py-1 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 border border-emerald-500/30">
                          {bar.amount} ({bar.val}%)
                        </div>

                        {/* Bar Pillar */}
                        <div className="w-full bg-slate-100 dark:bg-white/[0.04] rounded-t-lg h-36 flex items-end p-1">
                          <div
                            className={`w-full rounded-t transition-all duration-500 ${
                              i === 5
                                ? 'bg-gradient-to-t from-emerald-600 via-teal-500 to-emerald-400 shadow-md shadow-emerald-500/30'
                                : 'bg-slate-300 dark:bg-emerald-500/20 group-hover:bg-emerald-500/50'
                            }`}
                            style={{ height: `${bar.val}%` }}
                          />
                        </div>

                        <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                          {bar.month}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 pt-3.5 border-t border-slate-200 dark:border-white/[0.06] mt-2">
                    <span>Target Win Rate: <strong className="text-emerald-500 font-mono">68.4%</strong></span>
                    <span>Average Deal Velocity: <strong className="text-slate-900 dark:text-white font-mono">14.2 Days</strong></span>
                    <span>DSO: <strong className="text-emerald-500 font-mono">18 Days</strong></span>
                  </div>
                </div>
              </div>

              {/* Goals & Pipeline Milestones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pipeline Milestones */}
                <div className="workstation-card p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] pb-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Target size={14} className="text-emerald-400" />
                      <span>Commercial Conversion Goals</span>
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-500 font-bold">Active</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="workstation-surface p-3 space-y-1">
                      <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                        {metrics.dealsCount}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Deals in Stage</span>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-[72%]" />
                      </div>
                    </div>

                    <div className="workstation-surface p-3 space-y-1">
                      <span className="text-lg font-black font-mono text-teal-600 dark:text-teal-400">
                        {metrics.invoicesCount}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Invoices Settled</span>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full w-[88%]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Target ARR Milestone */}
                <div className="workstation-card p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
                      Annual Target Run-Rate
                    </span>
                    <div className="text-base font-black text-slate-900 dark:text-white font-mono">
                      $1,000,000.00
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold block">
                      Current: ${(metrics.totalBalance).toLocaleString()}
                    </span>
                  </div>

                  {/* Circular Progress Gauge */}
                  <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                    <svg className="w-14 h-14 -rotate-90">
                      <circle cx="28" cy="28" r="22" stroke="rgba(148,163,184,0.2)" strokeWidth="4" fill="transparent" />
                      <circle
                        cx="28"
                        cy="28"
                        r="22"
                        stroke="#10b981"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray="138"
                        strokeDashoffset="32"
                        strokeLinecap="round"
                        className="drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                      />
                    </svg>
                    <span className="absolute font-mono font-black text-xs text-slate-900 dark:text-white">
                      {metrics.grossEarnings > 0 ? `${Math.min(100, Math.round((metrics.totalBalance / 1000000) * 100))}%` : '0%'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Corporate Treasury & Live Feed Console (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Corporate Treasury Vault Account Panel */}
              <div className="workstation-card p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-emerald-500 dark:text-emerald-400" />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Corporate Treasury Vault
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                    FDIC INSURED
                  </span>
                </div>

                {/* Operating Account Summary Box */}
                <div className="workstation-surface p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Primary USD Settlement</span>
                    <span className="font-mono text-[10px] text-slate-400">•••• 8829</span>
                  </div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                    ${metrics.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/[0.06] text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    <span>Routing: 021000021</span>
                    <span className="text-emerald-500 font-bold">● Active</span>
                  </div>
                </div>

                {/* Quick Corporate Action Buttons */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[
                    { label: 'Disburse', icon: Send, href: '/banking' },
                    { label: 'Receive', icon: Download, href: '/deals' },
                    { label: 'Invoicing', icon: Receipt, href: '/invoices' },
                    { label: 'Transfer', icon: ArrowUpDown, href: '/super-admin' },
                  ].map((btn, idx) => {
                    const Icon = btn.icon;
                    return (
                      <Link
                        key={idx}
                        href={btn.href}
                        className="workstation-surface flex flex-col items-center justify-center p-2.5 rounded-xl hover:border-emerald-500/40 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all group cursor-pointer"
                      >
                        <Icon size={14} className="text-slate-600 dark:text-slate-400 group-hover:text-emerald-500 transition-colors mb-1" />
                        <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                          {btn.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Real-time Live Activity & Transactions Feed */}
              <div className="workstation-card p-5 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] pb-2.5">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Live Audit & Transaction Stream
                  </h3>
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    LIVE FEED
                  </span>
                </div>

                <div className="space-y-2">
                  {recentActivities.map((act, idx) => (
                    <Link
                      key={act.id || idx}
                      href={act.href || '/dashboard'}
                      className="p-2.5 workstation-surface hover:border-emerald-500/40 rounded-xl flex items-center justify-between transition-all group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                          {act.type === 'DEAL' ? <Briefcase size={14} /> : <Receipt size={14} />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-emerald-500 transition-colors">
                            {act.title}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            <span>{act.stage}</span>
                            <span>•</span>
                            <span>{act.date}</span>
                          </div>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-lg font-mono font-bold text-xs bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                        ${act.amount.toLocaleString()}
                      </span>
                    </Link>
                  ))}

                  {recentActivities.length === 0 && (
                    <div className="p-5 text-center space-y-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">No activity records logged</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Transactions and deal milestones will stream live here.
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <Link
                          href="/deals"
                          className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20 cursor-pointer"
                        >
                          + New Deal
                        </Link>
                        <Link
                          href="/invoices"
                          className="px-3 py-1.5 btn-secondary text-xs"
                        >
                          + New Invoice
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
                  <Link href="/banking" className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-500 font-medium transition-colors">
                    Open Dual Khata Ledger →
                  </Link>
                  <Link
                    href="/banking"
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-500 hover:text-slate-950 text-slate-700 dark:bg-white/[0.06] dark:text-white transition-colors cursor-pointer"
                  >
                    <ArrowRight size={12} />
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
