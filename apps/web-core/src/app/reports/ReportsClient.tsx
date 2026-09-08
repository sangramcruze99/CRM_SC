'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  Activity,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  PieChart,
  BarChart3,
  CheckCircle,
  Sparkles,
  X,
  FileText,
  Layers,
  ChevronLeft,
  ChevronRight,
  Lock,
  Unlock,
  RefreshCw,
  Briefcase,
  LifeBuoy,
  CheckSquare,
  Bot,
  Users,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { BusinessJournalCalendar } from '@/components/reporting/BusinessJournalCalendar';
import { DailyJournalDrawer } from '@/components/reporting/DailyJournalDrawer';
import { PeriodComparisonView } from '@/components/reporting/PeriodComparisonView';
import { DocumentVaultReportsView } from '@/components/reporting/DocumentVaultReportsView';

export function ReportsClient() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Time-based Period Navigation State
  const [periodType, setPeriodType] = useState<'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR'>('MONTH');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'journal' | 'comparisons' | 'vault'>('overview');

  // Period Data State
  const [periodData, setPeriodData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Daily Journal Drawer State
  const [journalDrawerDate, setJournalDrawerDate] = useState<string | null>(null);

  // Report Generation Modal State
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportFormat, setReportFormat] = useState<'PDF' | 'EXCEL' | 'CSV'>('PDF');

  // Compute periodKey from selectedDate and periodType
  const getPeriodKey = () => {
    if (periodType === 'DAY' || periodType === 'WEEK') return selectedDate;
    if (periodType === 'MONTH') return selectedDate.substring(0, 7);
    if (periodType === 'QUARTER') {
      const [y, mStr] = selectedDate.split('-');
      const m = parseInt(mStr, 10);
      const q = Math.ceil(m / 3);
      return `${y}-Q${q}`;
    }
    return selectedDate.substring(0, 4); // YEAR
  };

  const periodKey = getPeriodKey();

  const fetchPeriodData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bi/journal/period?type=${periodType}&key=${periodKey}`);
      if (res.ok) {
        const data = await res.json();
        setPeriodData(data);
      }
    } catch (err) {
      console.error('Failed to load period reporting data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriodData();
  }, [periodType, periodKey]);

  // Navigate Period (Previous / Next)
  const handleNavigatePeriod = (direction: 'prev' | 'next') => {
    const factor = direction === 'next' ? 1 : -1;
    const cur = new Date(`${selectedDate}T00:00:00Z`);

    if (periodType === 'DAY') {
      cur.setUTCDate(cur.getUTCDate() + factor);
    } else if (periodType === 'WEEK') {
      cur.setUTCDate(cur.getUTCDate() + factor * 7);
    } else if (periodType === 'MONTH') {
      cur.setUTCMonth(cur.getUTCMonth() + factor);
    } else if (periodType === 'QUARTER') {
      cur.setUTCMonth(cur.getUTCMonth() + factor * 3);
    } else {
      cur.setUTCFullYear(cur.getUTCFullYear() + factor);
    }

    setSelectedDate(cur.toISOString().split('T')[0]);
  };

  // Lock / Finalize Period
  const handleLockPeriod = async () => {
    if (!periodData) return;
    const nextStatus = periodData.isLocked ? 'OPEN' : 'LOCKED';
    setActionLoading(true);
    try {
      const res = await fetch('/api/bi/journal/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodType,
          startDate: periodData.startDate?.split('T')[0],
          endDate: periodData.endDate?.split('T')[0],
          status: nextStatus,
        }),
      });
      if (res.ok) {
        setNotification(`Period status changed to ${nextStatus}.`);
        setTimeout(() => setNotification(null), 3000);
        await fetchPeriodData();
      }
    } catch (err) {
      console.error('Lock period failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Recalculate / Rebuild Period
  const handleRecalculatePeriod = async () => {
    if (!periodData) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/bi/journal/recalculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: periodData.startDate?.split('T')[0],
          endDate: periodData.endDate?.split('T')[0],
        }),
      });
      if (res.ok) {
        setNotification(`Period recalculated from live production tables.`);
        setTimeout(() => setNotification(null), 3000);
        await fetchPeriodData();
      }
    } catch (err) {
      console.error('Recalculation failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Generate Official Report Snapshot
  const handleGenerateOfficialReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodData) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/bi/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: reportTitle || `${periodData.title} Official Snapshot`,
          periodType,
          startDate: periodData.startDate,
          endDate: periodData.endDate,
          format: reportFormat,
        }),
      });

      if (res.ok) {
        const report = await res.json();
        setIsGenerateModalOpen(false);
        setReportTitle('');
        setNotification(`Report "${report.title}" created & archived in Document Vault!`);
        setTimeout(() => setNotification(null), 4000);
        if (activeTab === 'vault') {
          // Trigger refresh if currently on vault tab
          await fetchPeriodData();
        }
      }
    } catch (err) {
      console.error('Generate report failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const sales = periodData?.sales || {};
  const finance = periodData?.finance || {};
  const crm = periodData?.crm || {};
  const helpdesk = periodData?.helpdesk || {};
  const projects = periodData?.projects || {};
  const hr = periodData?.hr || {};
  const ai = periodData?.ai || {};
  const childBreakdown = periodData?.childBreakdown || [];
  const maxRevenue = Math.max(1, ...childBreakdown.map((c: any) => c.revenue || 0));

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-900 dark:text-white pb-12">
      {/* Top Status Notification */}
      {notification && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-xl animate-in fade-in">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Header & Unified Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold uppercase tracking-wider">
              ENTERPRISE BUSINESS REPORTING
            </span>
            {periodData?.status && (
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider border ${
                  periodData.status === 'LOCKED'
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                    : periodData.status === 'FINALIZED'
                    ? 'bg-blue-500/15 border-blue-500/30 text-blue-300'
                    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                }`}
              >
                {periodData.status} • v{periodData.version || 1}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1 flex items-center gap-2.5">
            <Activity className="text-emerald-400" size={28} />
            <span>{periodData?.title || 'Business Performance & Daily Journal'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Time-based business intelligence directly connected to CRM, Sales, Finance, Projects, Support, and AI records.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
          <button
            onClick={handleRecalculatePeriod}
            disabled={actionLoading}
            className="px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-white/[0.08] flex items-center gap-1.5 cursor-pointer"
            title="Recalculate Period from Live Data"
          >
            <RefreshCw size={13} className={actionLoading ? 'animate-spin text-emerald-400' : ''} />
            <span>Rebuild Aggregates</span>
          </button>
          <button
            onClick={handleLockPeriod}
            disabled={actionLoading}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 cursor-pointer ${
              periodData?.isLocked
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-white/[0.04] text-slate-300 border-white/[0.08] hover:bg-white/[0.08] hover:text-white'
            }`}
            title={periodData?.isLocked ? 'Unlock Period' : 'Lock Period'}
          >
            {periodData?.isLocked ? <Lock size={13} /> : <Unlock size={13} />}
            <span>{periodData?.isLocked ? 'Locked' : 'Lock Period'}</span>
          </button>
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 cursor-pointer"
          >
            <Sparkles size={14} />
            <span>Official Report</span>
          </button>
        </div>
      </div>

      {/* Time-Based Period Selector Bar */}
      <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        {/* Hierarchy Period Switcher: DAY -> WEEK -> MONTH -> QUARTER -> YEAR */}
        <div className="flex items-center gap-1 bg-black/40 border border-white/[0.06] p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {(['DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setPeriodType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                periodType === type
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {type === 'DAY'
                ? 'Today'
                : type === 'WEEK'
                ? 'This Week'
                : type === 'MONTH'
                ? 'This Month'
                : type === 'QUARTER'
                ? 'This Quarter'
                : 'This Year'}
            </button>
          ))}
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNavigatePeriod('prev')}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer border border-white/[0.04]"
            title="Previous Period"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 border border-white/[0.08] rounded-xl text-xs font-mono font-bold text-white">
            <Calendar size={13} className="text-emerald-400" />
            <span>{periodKey}</span>
          </div>
          <button
            onClick={() => handleNavigatePeriod('next')}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer border border-white/[0.04]"
            title="Next Period"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-emerald-500/15 border border-emerald-400/40 text-emerald-300'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <BarChart3 size={15} />
          <span>Executive Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('journal')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'journal'
              ? 'bg-emerald-500/15 border border-emerald-400/40 text-emerald-300'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Calendar size={15} />
          <span>Daily Business Journal</span>
        </button>
        <button
          onClick={() => setActiveTab('comparisons')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'comparisons'
              ? 'bg-emerald-500/15 border border-emerald-400/40 text-emerald-300'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <TrendingUp size={15} />
          <span>Period Comparisons</span>
        </button>
        <button
          onClick={() => setActiveTab('vault')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'vault'
              ? 'bg-emerald-500/15 border border-emerald-400/40 text-emerald-300'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <FileText size={15} />
          <span>Document Vault Archive</span>
        </button>
      </div>

      {/* TAB CONTENT 1: EXECUTIVE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Grounded AI Executive Summary Card */}
          {periodData?.executiveSummary && (
            <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-slate-900 border border-emerald-500/20 backdrop-blur-xl space-y-2 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>Executive Summary (Grounded Analysis)</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                {periodData.executiveSummary}
              </p>
            </div>
          )}

          {/* Real Authoritative Department KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Revenue Won & Payments In */}
            <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Payments Received</span>
                <DollarSign size={18} className="text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                ${(finance.paymentsReceived || sales.revenueWon || 0).toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
                <span>Revenue won: ${(sales.revenueWon || 0).toLocaleString()}</span>
                <Link href="/invoices" className="text-emerald-400 hover:underline flex items-center gap-0.5">
                  finance <ExternalLink size={10} />
                </Link>
              </div>
            </div>

            {/* KPI 2: Deals Closed Won */}
            <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Deals Closed Won</span>
                <Briefcase size={18} className="text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-white font-mono">
                {sales.dealsWon || 0}
              </div>
              <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
                <span>Win rate: {sales.winRatePercent || 0}%</span>
                <Link href="/deals" className="text-amber-400 hover:underline flex items-center gap-0.5">
                  deals <ExternalLink size={10} />
                </Link>
              </div>
            </div>

            {/* KPI 3: Helpdesk & SLAs */}
            <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Tickets Resolved</span>
                <LifeBuoy size={18} className="text-blue-400" />
              </div>
              <div className="text-3xl font-extrabold text-white font-mono">
                {helpdesk.ticketsResolved || 0}
              </div>
              <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
                <span className={helpdesk.slaBreaches > 0 ? 'text-rose-400 font-bold' : ''}>
                  SLA breaches: {helpdesk.slaBreaches || 0}
                </span>
                <Link href="/tickets" className="text-blue-400 hover:underline flex items-center gap-0.5">
                  helpdesk <ExternalLink size={10} />
                </Link>
              </div>
            </div>

            {/* KPI 4: Autonomous AI Engine */}
            <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">AI Agent Actions</span>
                <Bot size={18} className="text-teal-400" />
              </div>
              <div className="text-3xl font-extrabold text-teal-400 font-mono">
                {ai.agentRuns || 0}
              </div>
              <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
                <span>Success: {ai.successfulActions || 0}</span>
                <Link href="/ai/activity" className="text-teal-400 hover:underline flex items-center gap-0.5">
                  activity <ExternalLink size={10} />
                </Link>
              </div>
            </div>
          </div>

          {/* Real Dynamic Visual Chart from Actual Breakdown */}
          {childBreakdown.length > 0 && (
            <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 size={16} className="text-emerald-400" />
                    <span>Real Daily Distribution ({childBreakdown.length} reporting intervals)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live payments received & daily business health score
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-400 font-mono">
                  Peak: ${maxRevenue.toLocaleString()}
                </span>
              </div>

              {/* Dynamic Bar Chart based strictly on live data */}
              <div className="flex items-end gap-2 h-44 pt-4 border-b border-white/[0.06] pb-2 overflow-x-auto">
                {childBreakdown.map((bar: any) => {
                  const dayStr = bar.date?.split('-')[2] || bar.date;
                  const heightPercent = maxRevenue > 0 ? Math.max(8, Math.round((bar.revenue / maxRevenue) * 100)) : 8;

                  return (
                    <button
                      key={bar.date}
                      onClick={() => setJournalDrawerDate(bar.date)}
                      className="flex-1 min-w-[32px] flex flex-col items-center gap-2 h-full justify-end group cursor-pointer"
                      title={`Inspect ${bar.date}: $${(bar.revenue || 0).toLocaleString()}`}
                    >
                      <span className="text-[10px] font-mono text-slate-400 group-hover:text-emerald-400 transition-colors">
                        {bar.revenue > 0 ? `$${bar.revenue.toLocaleString()}` : ''}
                      </span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-lg transition-all border-t ${
                          bar.revenue > 0
                            ? 'bg-gradient-to-t from-emerald-500/20 to-emerald-500/80 border-emerald-400 group-hover:to-emerald-400'
                            : 'bg-white/[0.04] border-white/[0.1] group-hover:bg-white/[0.08]'
                        }`}
                      />
                      <span className="text-[10px] text-slate-400 group-hover:text-white font-mono">
                        {dayStr}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Department Breakdown Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Sales Matrix */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase">
                <span className="flex items-center gap-2">
                  <Briefcase size={15} className="text-amber-400" />
                  Sales Department
                </span>
                <Link href="/deals" className="text-amber-400 hover:underline text-[11px] font-medium lowercase">
                  view deals →
                </Link>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Total Deals Created</span>
                  <span className="font-mono font-bold text-white">{sales.dealsCreated || 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Deals Closed Won</span>
                  <span className="font-mono font-bold text-emerald-400">{sales.dealsWon || 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Deals Closed Lost</span>
                  <span className="font-mono font-bold text-rose-400">{sales.dealsLost || 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Total Pipeline Value</span>
                  <span className="font-mono font-bold text-white">${(sales.pipelineValue || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Finance Matrix */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase">
                <span className="flex items-center gap-2">
                  <DollarSign size={15} className="text-emerald-400" />
                  Finance & Ledger
                </span>
                <Link href="/invoices" className="text-emerald-400 hover:underline text-[11px] font-medium lowercase">
                  view ledger →
                </Link>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Invoices Issued</span>
                  <span className="font-mono font-bold text-white">{finance.invoicesCreated || 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Operating Expenses</span>
                  <span className="font-mono font-bold text-rose-300">${(finance.expenses || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Bills Created</span>
                  <span className="font-mono font-bold text-white">{finance.billsCreated || 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Net Cash Flow</span>
                  <span className="font-mono font-bold text-emerald-300">${(finance.netCashFlow || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Project & Support Matrix */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase">
                <span className="flex items-center gap-2">
                  <CheckSquare size={15} className="text-purple-400" />
                  Projects & Support
                </span>
                <Link href="/projects" className="text-purple-400 hover:underline text-[11px] font-medium lowercase">
                  view projects →
                </Link>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Tasks Completed</span>
                  <span className="font-mono font-bold text-emerald-400">{projects.tasksCompleted || 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Overdue Tasks</span>
                  <span className="font-mono font-bold text-amber-400">{projects.overdueTasks || 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Support Tickets Resolved</span>
                  <span className="font-mono font-bold text-blue-400">{helpdesk.ticketsResolved || 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">SLA Breaches</span>
                  <span className="font-mono font-bold text-rose-400">{helpdesk.slaBreaches || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: DAILY BUSINESS JOURNAL (CALENDAR) */}
      {activeTab === 'journal' && (
        <div className="space-y-6">
          <BusinessJournalCalendar
            selectedDate={journalDrawerDate || undefined}
            onSelectDate={(d) => setJournalDrawerDate(d)}
          />
        </div>
      )}

      {/* TAB CONTENT 3: PERIOD COMPARISONS */}
      {activeTab === 'comparisons' && (
        <PeriodComparisonView
          periodType={periodType}
          periodKey={periodKey}
          comparisons={periodData?.comparisons || {}}
          anomalies={periodData?.anomalies || []}
          executiveSummary={periodData?.executiveSummary}
        />
      )}

      {/* TAB CONTENT 4: DOCUMENT VAULT ARCHIVE */}
      {activeTab === 'vault' && (
        <DocumentVaultReportsView
          onGenerateClick={() => setIsGenerateModalOpen(true)}
        />
      )}

      {/* Slide-out Daily Journal Drawer */}
      {journalDrawerDate && (
        <DailyJournalDrawer
          date={journalDrawerDate}
          isOpen={!!journalDrawerDate}
          onClose={() => setJournalDrawerDate(null)}
          onRefresh={fetchPeriodData}
        />
      )}

      {/* Official Report Generation Modal */}
      {isGenerateModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-950/99 border border-white/[0.14] rounded-3xl p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(16,185,129,0.15)] backdrop-blur-2xl text-white space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <FileText size={20} />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-black tracking-widest text-emerald-300 uppercase">
                    CENTRAL DOCUMENT VAULT
                  </span>
                  <h2 className="text-base font-bold text-white tracking-tight mt-0.5">Generate Official Snapshot</h2>
                  <p className="text-xs text-slate-400 font-medium">Freezes period metrics into an immutable Document Vault report</p>
                </div>
              </div>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleGenerateOfficialReport} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Report Title</label>
                <input
                  type="text"
                  required
                  placeholder={`e.g. ${periodData?.title || 'Q3'} Official Executive Report`}
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Coverage Window</label>
                <div className="px-3.5 py-2.5 bg-black/30 border border-white/[0.06] rounded-xl text-slate-300 font-mono text-xs">
                  {periodData?.startDate?.split('T')[0]} to {periodData?.endDate?.split('T')[0]} ({periodType})
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Export Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['PDF', 'EXCEL', 'CSV'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setReportFormat(fmt)}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        reportFormat === fmt
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                          : 'bg-black/30 border-white/[0.08] text-slate-400 hover:text-white'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black tracking-wide shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles size={13} />
                  <span>{actionLoading ? 'Archiving to Vault...' : 'Freeze & Archive'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
