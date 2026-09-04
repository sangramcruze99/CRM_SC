'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Database, Scan, Zap, X, Plus, ShieldCheck } from 'lucide-react';
import { useCreditMetering } from '@/components/platform/CreditMeteringContext';

export function CreditUsageDrawer() {
  const { credits, topUpCredits, isTopUpModalOpen, setIsTopUpModalOpen } = useCreditMetering();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isTopUpModalOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsTopUpModalOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTopUpModalOpen, setIsTopUpModalOpen]);

  if (!isTopUpModalOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-xl p-4 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsTopUpModalOpen(false);
      }}
    >
      <div className="relative bg-white dark:bg-gradient-to-b dark:from-slate-900/95 dark:via-slate-950/98 dark:to-slate-950/99 border border-slate-200 dark:border-white/[0.14] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(16,185,129,0.15)] backdrop-blur-2xl space-y-5 text-slate-900 dark:text-white animate-in zoom-in-95 overflow-hidden">
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent pointer-events-none" />
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-emerald-500/10 blur-3xl rounded-full" />

        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/25 border border-emerald-300/30">
              <Zap size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Usage-Based Credit Metering</h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 uppercase">
                  Quotas
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Consumption-based quota for heavy AI & data resources</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => setIsTopUpModalOpen(false)} 
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Credit Meters Grid */}
        <div className="space-y-3.5">
          {/* Neural OCR Scans */}
          <div className="p-4 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/[0.1] rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Scan size={14} className="text-emerald-600 dark:text-emerald-400" />
                Neural OCR Document Scans
              </span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                {credits.ocrScansRemaining} / {credits.ocrScansTotal} Left
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                style={{ width: `${(credits.ocrScansRemaining / credits.ocrScansTotal) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              <span>$0.15 / scan after quota</span>
              <button
                onClick={() => topUpCredits('ocr')}
                className="px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={11} /> +100 Scans ($15)
              </button>
            </div>
          </div>

          {/* B2B Prospector Leads */}
          <div className="p-4 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/[0.1] rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Database size={14} className="text-sky-600 dark:text-sky-400" />
                B2B Lead Enrichment (Apollo/ZoomInfo)
              </span>
              <span className="font-mono font-bold text-sky-700 dark:text-sky-400">
                {credits.b2bLeadsRemaining} / {credits.b2bLeadsTotal} Left
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full"
                style={{ width: `${(credits.b2bLeadsRemaining / credits.b2bLeadsTotal) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              <span>$0.05 / lead after quota</span>
              <button
                onClick={() => topUpCredits('leads')}
                className="px-2.5 py-1 bg-sky-500/15 hover:bg-sky-500/25 text-sky-800 dark:text-sky-300 border border-sky-500/30 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={11} /> +1,000 Leads ($50)
              </button>
            </div>
          </div>

          {/* Autonomous AI Tokens */}
          <div className="p-4 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/[0.1] rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
                Autonomous AI & LLM Copilot Tokens
              </span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                {credits.aiTokensRemaining.toLocaleString()} / {credits.aiTokensTotal.toLocaleString()} Left
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                style={{ width: `${(credits.aiTokensRemaining / credits.aiTokensTotal) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              <span>$0.002 / 1k tokens</span>
              <button
                onClick={() => topUpCredits('tokens')}
                className="px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={11} /> +50k Tokens ($10)
              </button>
            </div>
          </div>
        </div>

        {/* Global Top Up Button */}
        <div className="pt-3 border-t border-slate-200 dark:border-white/[0.08] flex justify-between items-center">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Billed via Stripe on monthly settlement</span>
          <button
            onClick={() => topUpCredits('all')}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            Top Up All Bundles ($75)
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
