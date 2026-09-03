'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Settings,
  Download,
  Plus,
  Check,
  X,
  Sparkles,
  DollarSign,
  TrendingUp,
  CreditCard,
  Layers,
  Calendar as CalendarIcon,
  Users,
  Grid,
  Maximize2,
  Paperclip,
  CheckCircle2,
} from 'lucide-react';

interface BotanicalGlassCockpitProps {
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
}

export function BotanicalGlassCockpit({ metrics }: BotanicalGlassCockpitProps) {
  const pathname = usePathname();
  const [activeCategory, setActiveCategory] = useState('Software');
  const [selectedDate, setSelectedDate] = useState(17);
  const [selectedPlan, setSelectedPlan] = useState<'Professional' | 'Organization' | 'Enterprise'>('Enterprise');
  const [selectedFunding, setSelectedFunding] = useState<'Venmo' | 'Wise' | 'PayPal'>('Wise');
  const [userCount, setUserCount] = useState(5);
  const [unsplashActive, setUnsplashActive] = useState(true);
  const [dropboxActive, setDropboxActive] = useState(true);
  const [alert, setAlert] = useState<string | null>(null);

  const planRates = {
    Professional: 35,
    Organization: 55,
    Enterprise: 75,
  };

  const calculatedTotal = userCount * planRates[selectedPlan];

  const handleExecutePayment = () => {
    setAlert(`⚡ Executed payment of $${calculatedTotal} via ${selectedFunding} for ${userCount} users (${selectedPlan} Plan)!`);
    setTimeout(() => setAlert(null), 4000);
  };

  const categories = ['All', 'Salary', 'Taxes', 'Software', 'Promotion', 'Rent', 'Clearing'];

  const displayBalance = metrics?.totalBalance !== undefined
    ? metrics.totalBalance.toLocaleString()
    : '990,815';

  const displayProfits = metrics?.closedWonValue !== undefined
    ? metrics.closedWonValue.toLocaleString()
    : '170,520';

  const displayPayments = metrics?.totalInvoicedValue !== undefined
    ? metrics.totalInvoicedValue.toLocaleString()
    : '64,520';

  return (
    <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-500">
      {/* Alert Banner */}
      {alert && (
        <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-xl animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{alert}</span>
        </div>
      )}

      {/* Main Glass Chassis Container */}
      <div className="botanical-glass-chassis p-6 sm:p-8 space-y-6 text-white relative overflow-hidden">
        {/* Soft Inner Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Top Navbar Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          {/* Logo Glyph */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-white text-base tracking-tighter shadow-inner">
              db
            </div>
          </div>

          {/* Pill Navigation Bar */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { name: 'Dashboard', href: '/dashboard' },
              { name: 'Taxes', href: '/taxes' },
              { name: 'Invoicing', href: '/invoices' },
              { name: 'Reports', href: '/reports' },
              { name: 'Payment', href: '/banking' },
              { name: 'Cash Flow', href: '/forecast' },
              { name: 'Projects', href: '/projects' },
            ].map((item) => {
              const isActive =
                pathname === item.href ||
                (item.name === 'Dashboard' &&
                  (pathname === '/' || pathname === '/dashboard' || pathname === '/cockpit'));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer inline-flex items-center justify-center ${
                    isActive
                      ? 'botanical-pill-active shadow-[0_0_12px_rgba(45,212,191,0.3)]'
                      : 'botanical-pill hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* User Profile Card */}
          <div className="flex items-center gap-3 bg-white/[0.06] border border-white/10 rounded-full py-1 px-3.5 shadow-inner">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center text-[10px] font-extrabold text-slate-950 border border-emerald-400/50">
              SC
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-white block leading-tight">Sangram Cruze</span>
              <span className="text-[10px] text-emerald-400 block leading-tight font-mono">Superadmin</span>
            </div>
            <Link
              href="/settings"
              className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Workspace Settings"
            >
              <Settings size={14} />
            </Link>
          </div>
        </div>

        {/* Hero Section: Automatic Payment Title & Key Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Title & Donut Meter */}
          <div className="lg:col-span-4 flex items-center gap-5">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-none">
              Automatic<br />Payment
            </h1>

            {/* Circular Donut Meter */}
            <div className="relative w-16 h-16 rounded-full border-4 border-white/10 flex items-center justify-center shadow-inner">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="3.5"
                  strokeDasharray="4 2"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#2dd4bf"
                  strokeWidth="3.5"
                  strokeDasharray="18 100"
                  strokeLinecap="round"
                  className="filter drop-shadow-[0_0_8px_rgba(45,212,191,0.8)]"
                />
              </svg>
              <span className="absolute font-bold text-sm text-white font-mono flex items-start">
                11<span className="text-[9px] text-emerald-400">%</span>
              </span>
            </div>
          </div>

          {/* High-Level Stat Counters */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-slate-400 block">Overall balance</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-start">
                {displayBalance}<span className="text-xs font-bold text-emerald-400 mt-1 ml-0.5">$</span>
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-slate-400 block">Monthly profits</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-start">
                {displayProfits}<span className="text-xs font-bold text-emerald-400 mt-1 ml-0.5">$</span>
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-slate-400 block">Monthly payments</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-start">
                {displayPayments}<span className="text-xs font-bold text-emerald-400 mt-1 ml-0.5">$</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter Pills & Utility Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => {
              const isSelected = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'botanical-pill-active'
                      : 'botanical-pill'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setAlert('Added new category tag filter');
                setTimeout(() => setAlert(null), 2500);
              }}
              className="w-7 h-7 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <Plus size={13} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setAlert('Exporting report snapshot...');
                setTimeout(() => setAlert(null), 2500);
              }}
              className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Download Report"
            >
              <Download size={13} />
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Category Settings"
            >
              <Settings size={13} />
            </button>
          </div>
        </div>

        {/* Team Avatar Stack & Milestone Track */}
        <div className="botanical-glass-inset p-3 px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-rose-500 text-white flex items-center justify-center font-black text-xs shadow-md">
              P
            </div>
            {/* Avatars */}
            <div className="flex items-center -space-x-2">
              {[
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
              ].map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt="Team member"
                  className="w-7 h-7 rounded-full object-cover border-2 border-[#121a17]"
                />
              ))}
              <div className="w-7 h-7 rounded-full bg-white/10 border-2 border-[#121a17] flex items-center justify-center text-slate-300 text-[10px] font-bold">
                +
              </div>
            </div>
          </div>

          {/* Timeline Node Scrubber Line */}
          <div className="flex-1 max-w-md mx-4 hidden md:flex items-center">
            <div className="w-full h-1 bg-white/15 rounded-full relative flex items-center justify-between">
              <div className="w-2.5 h-2.5 rounded-full bg-white ring-2 ring-white/30" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-400/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/50" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="w-7 h-7 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] flex items-center justify-center text-slate-400 hover:text-white">
              <Grid size={12} />
            </button>
            <button className="w-7 h-7 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] flex items-center justify-center text-slate-400 hover:text-white">
              <Maximize2 size={12} />
            </button>
          </div>
        </div>

        {/* 3-Column Glass Body Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Column 1: Date of Payment Calendar (4 cols) */}
          <div className="lg:col-span-4 botanical-glass-card p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                <span>Date of payment</span>
                <span className="text-[10px] text-emerald-400 font-mono">Aug 2026</span>
              </div>

              {/* Calendar Grid 1..30 */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-medium text-slate-400">
                {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                  const isDaySelected = selectedDate === day;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDate(day)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer font-mono ${
                        isDaySelected
                          ? 'bg-white text-slate-950 font-bold shadow-md shadow-white/20 ring-2 ring-white/40'
                          : 'hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Summary Coordinates */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/[0.08]">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Payment details</span>
                <span className="text-sm font-extrabold text-white font-mono flex items-start">
                  {selectedDate}th<span className="text-[10px] text-slate-400 font-normal ml-1 mt-0.5">/ month</span>
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Number users</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-extrabold text-white font-mono">{userCount}</span>
                  <button
                    type="button"
                    onClick={() => setUserCount((prev) => Math.max(1, prev - 1))}
                    className="w-4 h-4 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserCount((prev) => prev + 1)}
                    className="w-4 h-4 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Payment Plan & Funding Source Selector (4 cols) */}
          <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
            {/* Payment Plan Card */}
            <div className="botanical-glass-card p-5 space-y-3">
              <span className="text-xs text-slate-300 font-semibold block">Payment plan</span>

              <div className="grid grid-cols-2 gap-2">
                {(['Professional', 'Organization', 'Enterprise'] as const).map((plan) => {
                  const isPlanActive = selectedPlan === plan;
                  return (
                    <button
                      key={plan}
                      type="button"
                      onClick={() => setSelectedPlan(plan)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        plan === 'Enterprise' ? 'col-span-2' : ''
                      } ${
                        isPlanActive
                          ? 'botanical-pill-active'
                          : 'botanical-pill'
                      }`}
                    >
                      {plan}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 flex items-baseline gap-1">
                <span className="text-2xl font-black text-white font-mono tracking-tight">{planRates[selectedPlan]}</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">$</span>
                <span className="text-[11px] text-slate-400 ml-1">/ personal user</span>
              </div>
            </div>

            {/* Pay From Card (Volume Bars) */}
            <div className="botanical-glass-card p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                <span>Pay from</span>
                <span className="text-[10px] text-emerald-400 font-mono">3 Accounts Linked</span>
              </div>

              <div className="grid grid-cols-3 gap-2 items-end pt-2">
                {/* Venmo */}
                <div
                  onClick={() => setSelectedFunding('Venmo')}
                  className={`p-2.5 rounded-2xl text-center space-y-1 cursor-pointer transition-all ${
                    selectedFunding === 'Venmo'
                      ? 'bg-white/20 border border-white/30 shadow-inner'
                      : 'bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08]'
                  }`}
                >
                  <span className="text-[9px] font-mono text-slate-400 block">18,718$</span>
                  <div className="h-6 w-full bg-white/10 rounded-lg flex items-center justify-center">
                    <div className="w-1.5 h-3 bg-slate-400 rounded-full" />
                  </div>
                  <span className="text-[10px] font-bold text-white block">Venmo</span>
                </div>

                {/* Wise */}
                <div
                  onClick={() => setSelectedFunding('Wise')}
                  className={`p-2.5 rounded-2xl text-center space-y-1 cursor-pointer transition-all ${
                    selectedFunding === 'Wise'
                      ? 'bg-white/20 border border-white/30 shadow-inner'
                      : 'bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08]'
                  }`}
                >
                  <span className="text-[9px] font-mono text-emerald-300 font-bold block">34,311$</span>
                  <div className="h-10 w-full bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/30">
                    <div className="w-1.5 h-6 bg-emerald-400 rounded-full shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                  </div>
                  <span className="text-[10px] font-bold text-white block">Wise</span>
                </div>

                {/* PayPal */}
                <div
                  onClick={() => setSelectedFunding('PayPal')}
                  className={`p-2.5 rounded-2xl text-center space-y-1 cursor-pointer transition-all ${
                    selectedFunding === 'PayPal'
                      ? 'bg-white/20 border border-white/30 shadow-inner'
                      : 'bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08]'
                  }`}
                >
                  <span className="text-[9px] font-mono text-slate-400 block">110,090$</span>
                  <div className="h-14 w-full bg-white/10 rounded-lg flex items-center justify-center">
                    <div className="w-1.5 h-9 bg-slate-300 rounded-full" />
                  </div>
                  <span className="text-[10px] font-bold text-white block">PayPal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Connected Integration Services (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Unsplash Images Card */}
            <div className="botanical-glass-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center font-bold text-xs text-white">
                    📷
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Unsplash Images</h4>
                    <span className="text-[10px] text-slate-400">Monthly, every 17th</span>
                  </div>
                </div>
                <button className="p-1 text-slate-400 hover:text-white cursor-pointer">
                  <Paperclip size={13} />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <div className="text-xl font-extrabold text-white font-mono flex items-start">
                  200<span className="text-xs font-bold text-emerald-400 mt-0.5 ml-0.5">$</span>
                </div>

                <div className="flex items-center gap-1 bg-white/[0.06] p-1 rounded-full border border-white/10">
                  <button
                    type="button"
                    onClick={() => setUnsplashActive(false)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all cursor-pointer ${
                      !unsplashActive ? 'bg-white/20 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <X size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnsplashActive(true)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all cursor-pointer ${
                      unsplashActive ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Check size={11} />
                  </button>
                </div>
              </div>
            </div>

            {/* Dropbox Storage Card */}
            <div className="botanical-glass-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center font-bold text-xs text-sky-400">
                    📦
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Dropbox Storage</h4>
                    <span className="text-[10px] text-slate-400">Annually, January 3</span>
                  </div>
                </div>
                <button className="p-1 text-slate-400 hover:text-white cursor-pointer">
                  <Paperclip size={13} />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <div className="text-xl font-extrabold text-white font-mono flex items-start">
                  2999<span className="text-xs font-bold text-emerald-400 mt-0.5 ml-0.5">$</span>
                </div>

                <div className="flex items-center gap-1 bg-white/[0.06] p-1 rounded-full border border-white/10">
                  <button
                    type="button"
                    onClick={() => setDropboxActive(false)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all cursor-pointer ${
                      !dropboxActive ? 'bg-white/20 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <X size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDropboxActive(true)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all cursor-pointer ${
                      dropboxActive ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Check size={11} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Execution Bar */}
        <div className="botanical-glass-inset p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Payment amount</span>
              <div className="text-lg font-black text-emerald-400 font-mono flex items-baseline">
                {calculatedTotal}<span className="text-xs font-bold ml-0.5">$</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Payment method</span>
              <span className="text-sm font-bold text-white block">{selectedFunding}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExecutePayment}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs rounded-full shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <Check size={14} className="stroke-[3]" />
            <span>Confirm & Execute Automatic Payment</span>
          </button>
        </div>
      </div>
    </div>
  );
}
