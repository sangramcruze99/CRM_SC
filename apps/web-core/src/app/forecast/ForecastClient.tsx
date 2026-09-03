'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Presentation,
  Download,
  Sparkles,
  CheckCircle2,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Users,
  Building,
  ArrowUpRight,
  Layers,
} from 'lucide-react';

export function ForecastClient() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [forecastScenario, setForecastScenario] = useState<'conservative' | 'base' | 'hypergrowth'>('base');
  const [alert, setAlert] = useState<string | null>(null);

  const scenarioMultiplier =
    forecastScenario === 'conservative' ? 1.25 : forecastScenario === 'base' ? 1.65 : 2.4;

  const currentARR = 1200000;
  const projectedARR = currentARR * scenarioMultiplier;
  const projectedMonthly = projectedARR / 12;

  const slides = [
    {
      title: 'Slide 01: Executive Summary & ARR Milestones',
      subtitle: 'Q3 2026 Fiscal Performance Review',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-white/[0.04] border border-white/[0.08] rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Current ARR</span>
              <span className="text-xl font-mono font-extrabold text-emerald-400">$1.20M</span>
              <span className="text-[10px] text-emerald-400 block mt-1">+48% QoQ Growth</span>
            </div>
            <div className="p-4 bg-white/[0.04] border border-white/[0.08] rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Net Retention Rate (NDR)</span>
              <span className="text-xl font-mono font-extrabold text-white">128%</span>
              <span className="text-[10px] text-slate-400 block mt-1">Top-Decile SaaS</span>
            </div>
            <div className="p-4 bg-white/[0.04] border border-white/[0.08] rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Cash Runway</span>
              <span className="text-xl font-mono font-extrabold text-emerald-400">28 Months</span>
              <span className="text-[10px] text-slate-400 block mt-1">Cash-Flow Positive</span>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/[0.06]">
            <strong>Strategic Summary:</strong> Multi-tenancy modularization and 67-feature niche adaptations expanded total addressable market by 3.8x. Average contract value (ACV) grew from $8.5k to $24.8k with OCR vision and Dual Khata ledger adoption.
          </p>
        </div>
      ),
    },
    {
      title: 'Slide 02: 12-Month Financial Revenue Projections',
      subtitle: 'Predictive Scenario Modeling',
      content: (
        <div className="space-y-4">
          <div className="p-5 bg-gradient-to-r from-amber-500/15 via-white/[0.04] to-transparent border border-emerald-500/30 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                12-Month Projected ARR ({forecastScenario.toUpperCase()})
              </span>
              <div className="text-3xl font-mono font-extrabold text-white mt-0.5">
                ${(projectedARR / 1000000).toFixed(2)}M ARR
              </div>
            </div>
            <span className="font-mono font-bold text-xs text-emerald-400 bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/30">
              ${(projectedMonthly / 1000).toFixed(0)}k MRR
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <span className="text-[10px] text-slate-400 block">Gross Profit Margin</span>
              <span className="font-mono font-bold text-white text-base">84.2%</span>
            </div>
            <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <span className="text-[10px] text-slate-400 block">Customer Acquisition Cost (CAC)</span>
              <span className="font-mono font-bold text-white text-base">$1,420</span>
            </div>
            <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <span className="text-[10px] text-slate-400 block">LTV / CAC Ratio</span>
              <span className="font-mono font-bold text-emerald-400 text-base">7.8x</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Slide 03: Dual Khata Cash-Flow & Unit Economics',
      subtitle: 'Balance Sheet & Receivables Reconciliations',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Receivables & Cash Flow</span>
              <div className="flex justify-between text-slate-300">
                <span>Total Receivables Outstanding</span>
                <span className="font-mono font-bold text-white">$48,290.00</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Days Sales Outstanding (DSO)</span>
                <span className="font-mono font-bold text-emerald-400">18.4 Days</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Bad Debt Provision</span>
                <span className="font-mono font-bold text-white">&lt;0.5%</span>
              </div>
            </div>

            <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Operating Leverage</span>
              <div className="flex justify-between text-slate-300">
                <span>Monthly Burn Rate</span>
                <span className="font-mono font-bold text-white">$32,000.00</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Monthly Organic Inflows</span>
                <span className="font-mono font-bold text-emerald-400">$100,000.00</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Net Free Cash Flow Margin</span>
                <span className="font-mono font-bold text-emerald-400">+68%</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Slide 04: Headcount, Talent & Department Head Allocations',
      subtitle: 'Organizational Pipeline Capacity',
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-white/[0.04] border border-white/[0.08] rounded-xl">
              <span className="text-xl font-mono font-extrabold text-white">24</span>
              <span className="text-[10px] text-slate-400 block mt-1">Current Headcount</span>
            </div>
            <div className="p-3 bg-white/[0.04] border border-white/[0.08] rounded-xl">
              <span className="text-xl font-mono font-extrabold text-emerald-400">$72.4k</span>
              <span className="text-[10px] text-slate-400 block mt-1">Monthly Payroll</span>
            </div>
            <div className="p-3 bg-white/[0.04] border border-white/[0.08] rounded-xl">
              <span className="text-xl font-mono font-extrabold text-sky-400">+8</span>
              <span className="text-[10px] text-slate-400 block mt-1">H2 Planned Hires</span>
            </div>
            <div className="p-3 bg-white/[0.04] border border-white/[0.08] rounded-xl">
              <span className="text-xl font-mono font-extrabold text-emerald-400">96.8%</span>
              <span className="text-[10px] text-slate-400 block mt-1">Talent Retention</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handleExportDeck = () => {
    window.print();
    setAlert('📊 Boardroom Presentation Slide Deck exported to PDF.');
    setTimeout(() => setAlert(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Alert Banner */}
      {alert && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Presentation className="text-emerald-400" size={24} />
            Executive Boardroom Deck & 12-Month Financial Forecast
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Generative AI pitch presentation builder, predictive scenario modeling, and ARR trajectory forecasts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Scenario Selector */}
          <div className="flex items-center p-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-xs font-bold">
            {(['conservative', 'base', 'hypergrowth'] as const).map((sc) => (
              <button
                key={sc}
                onClick={() => setForecastScenario(sc)}
                className={`px-3 py-1.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer ${
                  forecastScenario === sc
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sc}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportDeck}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={14} />
            <span>Export Slide Deck (PDF)</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Slide Deck Canvas */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-6 min-h-[420px] flex flex-col justify-between">
        {/* Slide Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
              BOARDROOM PRESENTATION DECK
            </span>
            <h2 className="text-lg font-bold text-white mt-0.5">{slides[currentSlide].title}</h2>
            <span className="text-xs text-slate-400">{slides[currentSlide].subtitle}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-400">
              Slide {currentSlide + 1} of {slides.length}
            </span>
          </div>
        </div>

        {/* Slide Body Content */}
        <div className="py-2 flex-1">{slides[currentSlide].content}</div>

        {/* Slide Navigation Controls */}
        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
          <button
            type="button"
            disabled={currentSlide === 0}
            onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
            className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] disabled:opacity-30 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft size={14} />
            <span>Previous Slide</span>
          </button>

          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${
                  currentSlide === i ? 'bg-amber-400 w-6' : 'bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            disabled={currentSlide === slides.length - 1}
            onClick={() => setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1))}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 shadow-md cursor-pointer disabled:opacity-30"
          >
            <span>Next Slide</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
