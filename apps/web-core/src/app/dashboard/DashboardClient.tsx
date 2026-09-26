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
  Bot,
  FolderOpen,
} from 'lucide-react';
import Link from 'next/link';
import { useIndustry, NicheIcon } from '@/components/industry/IndustryContext';
import { NicheFeaturePickerModal } from '@/components/industry/NicheFeaturePickerModal';
import { BotanicalGlassCockpit } from '@/components/dashboard/BotanicalGlassCockpit';
import { NicheSectionContainer } from '@/components/industry/dashboard/NicheSectionContainer';
import { NicheQuickActions } from '@/components/industry/NicheQuickActions';

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
  const [isRangeDropdownOpen, setIsRangeDropdownOpen] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState<'earning' | 'expenses' | 'margin'>('earning');
  const [activityFilter, setActivityFilter] = useState<'ALL' | 'DEAL' | 'INVOICE'>('ALL');
  const [alert, setAlert] = useState<string | null>(null);
  const [isFeaturePickerOpen, setIsFeaturePickerOpen] = useState(false);

  const { nicheConfig, nicheConfig2, activeServiceIds, activeFeatureIds, isFeatureEnabled } = useIndustry();

  const metrics = {
    totalBalance: initialData?.metrics?.totalBalance ?? 184290,
    grossEarnings: initialData?.metrics?.grossEarnings ?? 248500,
    monthlyExpenses: initialData?.metrics?.monthlyExpenses ?? 18400,
    totalDealsValue: initialData?.metrics?.totalDealsValue ?? 248500,
    closedWonValue: initialData?.metrics?.closedWonValue ?? 94800,
    totalInvoicedValue: initialData?.metrics?.totalInvoicedValue ?? 89490,
    contactsCount: initialData?.metrics?.contactsCount ?? 142,
    dealsCount: initialData?.metrics?.dealsCount ?? 18,
    invoicesCount: initialData?.metrics?.invoicesCount ?? 24,
    projectsCount: initialData?.metrics?.projectsCount ?? 12,
    ticketsCount: initialData?.metrics?.ticketsCount ?? 5,
  };

  const winRate = metrics.dealsCount > 0 ? ((metrics.closedWonValue / (metrics.totalDealsValue || 1)) * 100).toFixed(1) : '38.2';
  const dealVelocity = '14.2 Days';
  const dsoDays = '18 Days';

  // Dynamic chart datasets that react directly to activeChartTab and selectedRange
  const rangeMultipliers: Record<string, number> = {
    'Quarterly (Q3)': 1.0,
    'Quarterly (Q2)': 0.88,
    'Quarterly (Q1)': 0.76,
    'Annual (YTD)': 1.45,
  };
  const multiplier = rangeMultipliers[selectedRange] || 1.0;

  const chartDatasets = {
    earning: [
      { month: 'Jan', val: Math.round(42 * multiplier), amount: `$${Math.round(42000 * multiplier).toLocaleString()}` },
      { month: 'Feb', val: Math.round(68 * multiplier), amount: `$${Math.round(68500 * multiplier).toLocaleString()}` },
      { month: 'Mar', val: Math.round(54 * multiplier), amount: `$${Math.round(54200 * multiplier).toLocaleString()}` },
      { month: 'Apr', val: Math.round(89 * multiplier), amount: `$${Math.round(89400 * multiplier).toLocaleString()}` },
      { month: 'May', val: Math.round(76 * multiplier), amount: `$${Math.round(76000 * multiplier).toLocaleString()}` },
      { month: 'Jun', val: Math.min(100, Math.round(94 * multiplier)), amount: `$${Math.round(94280 * multiplier).toLocaleString()}` },
    ],
    expenses: [
      { month: 'Jan', val: Math.round(24 * multiplier), amount: `$${Math.round(14200 * multiplier).toLocaleString()}` },
      { month: 'Feb', val: Math.round(31 * multiplier), amount: `$${Math.round(18500 * multiplier).toLocaleString()}` },
      { month: 'Mar', val: Math.round(27 * multiplier), amount: `$${Math.round(16000 * multiplier).toLocaleString()}` },
      { month: 'Apr', val: Math.round(36 * multiplier), amount: `$${Math.round(21400 * multiplier).toLocaleString()}` },
      { month: 'May', val: Math.round(30 * multiplier), amount: `$${Math.round(18200 * multiplier).toLocaleString()}` },
      { month: 'Jun', val: Math.round(34 * multiplier), amount: `$${Math.round(20500 * multiplier).toLocaleString()}` },
    ],
    margin: [
      { month: 'Jan', val: Math.round(58 * multiplier), amount: `$${Math.round(27800 * multiplier).toLocaleString()} (66%)` },
      { month: 'Feb', val: Math.round(73 * multiplier), amount: `$${Math.round(50000 * multiplier).toLocaleString()} (73%)` },
      { month: 'Mar', val: Math.round(70 * multiplier), amount: `$${Math.round(38200 * multiplier).toLocaleString()} (70%)` },
      { month: 'Apr', val: Math.round(76 * multiplier), amount: `$${Math.round(68000 * multiplier).toLocaleString()} (76%)` },
      { month: 'May', val: Math.round(76 * multiplier), amount: `$${Math.round(57800 * multiplier).toLocaleString()} (76%)` },
      { month: 'Jun', val: Math.round(78 * multiplier), amount: `$${Math.round(73780 * multiplier).toLocaleString()} (78%)` },
    ],
  };

  const chartBars = chartDatasets[activeChartTab];

  const allActivities = initialData?.recentActivities || [];
  const filteredActivities = allActivities.filter((act) => {
    if (activityFilter === 'ALL') return true;
    return act.type === activityFilter;
  });

  const handleActionClick = (actionName: string) => {
    setAlert(` Executed ${actionName} transaction workflow`);
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
             Executive Operations HUD
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
             Botanical Glass Cockpit
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
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-300/30 shrink-0">
                <NicheIcon niche={nicheConfig.id} size={22} className="text-slate-950" />
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
              <Link
                href="/industry"
                className="px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <Sliders size={13} />
                <span>Configure Services ({activeServiceIds?.length || activeFeatureIds.length})</span>
              </Link>

              <Link
                href="/industry"
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>Switch Workspace</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Industry Dynamic KPIs Bar */}
          {nicheConfig2?.dashboardKpis && nicheConfig2.dashboardKpis.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {nicheConfig2.dashboardKpis.map((kpi) => (
                <div key={kpi.id} className="workstation-card p-3.5 rounded-xl space-y-1 bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-white/10">
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    <span className="truncate">{kpi.label}</span>
                    <span className="text-emerald-500 font-mono font-bold text-[10px] shrink-0 ml-1">{kpi.delta}</span>
                  </div>
                  <div className="text-xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                    {kpi.value}
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">{kpi.subtext}</span>
                </div>
              ))}
            </div>
          )}

          {/* Fast Actions Bar */}
          <div className="workstation-card p-3 px-4 flex items-center justify-between flex-wrap gap-2 bg-white/60 dark:bg-zinc-900/40">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap size={12} className="text-emerald-500" />
              <span>{nicheConfig2?.shortName || nicheConfig.shortName} Fast Actions:</span>
            </span>
            <NicheQuickActions variant="compact" />
          </div>

          {/* ========================================================= */}
          {/* 1.5 DIGITAL TEAMMATES RADAR & AUTONOMOUS PULSE           */}
          {/* ========================================================= */}
          <div className="workstation-card p-5 relative overflow-hidden bg-gradient-to-r from-emerald-500/[0.07] via-teal-500/[0.04] to-slate-900/10 border border-emerald-500/25">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
                    <Bot size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                        Autonomous Digital Teammates Roster
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        5 Sentinels Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Co-pilots continuously ingesting from Smart Vault dropzones, staging actions &amp; awaiting supervisor sign-off.
                    </p>
                  </div>
                </div>

                {/* Sentinel Pills */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {[
                    { name: 'Ares', role: 'Revenue Lead Hunter', folder: '/vault/inbound/crm_leads/' },
                    { name: 'Athena', role: 'Risk & Legal Sentinel', folder: '/vault/documents/contracts_incoming/' },
                    { name: 'Midas', role: 'FinOps Reconciliation', folder: '/vault/documents/invoices_scanned/' },
                    { name: 'Hermes', role: 'Omnichannel Dispatcher', folder: '/vault/inbound/quotes/' },
                    { name: 'Vesta', role: 'Client Success Care', folder: '/vault/telephony/call_recordings/' },
                  ].map((s) => (
                    <div
                      key={s.name}
                      className="px-2.5 py-1 rounded-lg bg-white/60 dark:bg-black/30 border border-slate-200/80 dark:border-white/10 flex items-center gap-2 text-[11px]"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">{s.name}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:inline">{s.role}</span>
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5 flex items-center gap-1">
                        <FolderOpen size={9} />
                        {s.folder.replace('/vault/', '')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Link
                  href="/automation/workflows/wf-enterprise-lead-triage"
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.12] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FolderOpen size={13} className="text-emerald-500" />
                  <span>Input Folders &amp; Studio</span>
                </Link>

                <Link
                  href="/ai-agents"
                  className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Bot size={13} />
                  <span>Fleet Command &amp; Approvals</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 2. DYNAMIC 8-NICHE OPERATIONS COMMAND SECTION              */}
          {/* ========================================================= */}
          <NicheSectionContainer />

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

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsRangeDropdownOpen(!isRangeDropdownOpen)}
                        className="px-3 py-1.5 botanical-pill text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <span>{selectedRange}</span>
                        <ChevronDown size={12} className={`text-emerald-400 transition-transform ${isRangeDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isRangeDropdownOpen && (
                        <div className="absolute right-0 mt-1.5 w-40 bg-slate-900/95 border border-white/15 rounded-xl shadow-2xl z-30 py-1 backdrop-blur-2xl">
                          {['Quarterly (Q3)', 'Quarterly (Q2)', 'Quarterly (Q1)', 'Annual (YTD)'].map((range) => (
                            <button
                              key={range}
                              type="button"
                              onClick={() => {
                                setSelectedRange(range);
                                setIsRangeDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-emerald-500/20 hover:text-white transition-colors flex items-center justify-between cursor-pointer ${
                                selectedRange === range ? 'text-emerald-400 font-bold bg-white/[0.04]' : 'text-slate-300'
                              }`}
                            >
                              <span>{range}</span>
                              {selectedRange === range && <Check size={12} className="text-emerald-400" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Analytical Cartesian Bar / Area Grid Visualization */}
                <div className="relative pt-4 pb-2">
                  <div className="grid grid-cols-6 gap-3 sm:gap-4 h-44 items-end pt-6 px-2">
                    {chartBars.map((bar, i) => (
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
                    <span>Target Win Rate: <strong className="text-emerald-500 font-mono">{winRate}%</strong></span>
                    <span>Average Deal Velocity: <strong className="text-slate-900 dark:text-white font-mono">{dealVelocity}</strong></span>
                    <span>DSO: <strong className="text-emerald-500 font-mono">{dsoDays}</strong></span>
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
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                          style={{ width: `${Math.min(100, metrics.dealsCount * 10)}%` }}
                        />
                      </div>
                    </div>

                    <div className="workstation-surface p-3 space-y-1">
                      <span className="text-lg font-black font-mono text-teal-600 dark:text-teal-400">
                        {metrics.invoicesCount}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Invoices Settled</span>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                          style={{ width: `${Math.min(100, metrics.invoicesCount * 10)}%` }}
                        />
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
                    { label: 'Receive', icon: Download, href: '/payment-links' },
                    { label: 'Invoicing', icon: Receipt, href: '/invoices' },
                    { label: 'Transfer', icon: ArrowUpDown, href: '/banking' },
                  ].map((btn, idx) => {
                    const Icon = btn.icon;
                    return (
                      <Link
                        key={idx}
                        href={btn.href}
                        className="workstation-surface flex flex-col items-center justify-center p-2.5 rounded-xl hover:border-emerald-500/40 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all group cursor-pointer"
                      >
                        <Icon size={14} className="text-slate-600 dark:text-slate-400 group-hover:text-emerald-500 transition-colors mb-1" />
                        <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-400 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                          {btn.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Real-time Live Activity & Transactions Feed */}
              <div className="workstation-card p-5 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] pb-2.5 flex-wrap gap-2">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Live Audit &amp; Transaction Stream
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1 p-0.5 bg-white/[0.06] border border-white/10 rounded-lg text-[10px]">
                      {(['ALL', 'DEAL', 'INVOICE'] as const).map((filter) => (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => setActivityFilter(filter)}
                          className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                            activityFilter === filter
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {filter === 'ALL' ? 'All' : filter === 'DEAL' ? 'Deals' : 'Invoices'}
                        </button>
                      ))}
                    </div>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      LIVE FEED
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {filteredActivities.map((act, idx) => (
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

                  {filteredActivities.length === 0 && (
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
