'use client';

import React from 'react';
import { Sparkles, Database, Scan, Zap, X, Plus, ShieldCheck } from 'lucide-react';
import { useCreditMetering } from '@/components/platform/CreditMeteringContext';

export function CreditUsageDrawer() {
  const { credits, topUpCredits, isTopUpModalOpen, setIsTopUpModalOpen } = useCreditMetering();

  if (!isTopUpModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-950/95 border border-white/[0.12] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-white animate-in zoom-in-95">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Zap size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Usage-Based Credit Metering</h2>
              <p className="text-xs text-slate-400">Consumption-based quota for heavy AI & data resources</p>
            </div>
          </div>
          <button onClick={() => setIsTopUpModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Credit Meters Grid */}
        <div className="space-y-3.5">
          {/* Neural OCR Scans */}
          <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Scan size={14} className="text-emerald-400" />
                Neural OCR Document Scans
              </span>
              <span className="font-mono font-bold text-emerald-400">
                {credits.ocrScansRemaining} / {credits.ocrScansTotal} Left
              </span>
            </div>
            <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                style={{ width: `${(credits.ocrScansRemaining / credits.ocrScansTotal) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
              <span>$0.15 / scan after quota</span>
              <button
                onClick={() => topUpCredits('ocr')}
                className="px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={11} /> +100 Scans ($15)
              </button>
            </div>
          </div>

          {/* B2B Prospector Leads */}
          <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Database size={14} className="text-sky-400" />
                B2B Lead Enrichment (Apollo/ZoomInfo)
              </span>
              <span className="font-mono font-bold text-sky-400">
                {credits.b2bLeadsRemaining} / {credits.b2bLeadsTotal} Left
              </span>
            </div>
            <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full"
                style={{ width: `${(credits.b2bLeadsRemaining / credits.b2bLeadsTotal) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
              <span>$0.05 / lead after quota</span>
              <button
                onClick={() => topUpCredits('leads')}
                className="px-2.5 py-1 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={11} /> +1,000 Leads ($50)
              </button>
            </div>
          </div>

          {/* Autonomous AI Tokens */}
          <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-400" />
                Autonomous AI & LLM Copilot Tokens
              </span>
              <span className="font-mono font-bold text-emerald-400">
                {credits.aiTokensRemaining.toLocaleString()} / {credits.aiTokensTotal.toLocaleString()} Left
              </span>
            </div>
            <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                style={{ width: `${(credits.aiTokensRemaining / credits.aiTokensTotal) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
              <span>$0.002 / 1k tokens</span>
              <button
                onClick={() => topUpCredits('tokens')}
                className="px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={11} /> +50k Tokens ($10)
              </button>
            </div>
          </div>
        </div>

        {/* Global Top Up Button */}
        <div className="pt-2 border-t border-white/[0.08] flex justify-between items-center">
          <span className="text-xs text-slate-400 font-medium">Billed via Stripe on monthly settlement</span>
          <button
            onClick={() => topUpCredits('all')}
            className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/25 cursor-pointer"
          >
            Top Up All Bundles ($75)
          </button>
        </div>
      </div>
    </div>
  );
}
