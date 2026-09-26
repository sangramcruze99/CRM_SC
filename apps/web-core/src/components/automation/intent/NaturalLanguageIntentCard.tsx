// apps/web-core/src/components/automation/intent/NaturalLanguageIntentCard.tsx
'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Cpu,
  Layers,
  Sliders,
  Play,
  Check,
} from 'lucide-react';
import { DomainPack, StructuredIntent } from './types';

interface NaturalLanguageIntentCardProps {
  domainPacks: DomainPack[];
  selectedDomain: string;
  onSelectDomain: (domainId: string) => void;
  prompt: string;
  onChangePrompt: (prompt: string) => void;
  onParsePrompt: () => void;
  isParsing: boolean;
  parsedIntent: StructuredIntent | null;
  onOpenSimulator: () => void;
  onCompileAndSave: () => void;
  isCompiling: boolean;
  onReset: () => void;
}

export function NaturalLanguageIntentCard({
  domainPacks,
  selectedDomain,
  onSelectDomain,
  prompt,
  onChangePrompt,
  onParsePrompt,
  isParsing,
  parsedIntent,
  onOpenSimulator,
  onCompileAndSave,
  isCompiling,
  onReset,
}: NaturalLanguageIntentCardProps) {
  const currentPack = domainPacks.find((d) => d.id === selectedDomain) || domainPacks[0];

  return (
    <div className="space-y-6">
      {/* 1. Natural Language Input Card */}
      <div className="relative bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-950/99 border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />
        <div className="pointer-events-none absolute -top-24 right-10 w-72 h-36 bg-emerald-500/10 blur-3xl rounded-full" />

        {/* Header with Domain Badges */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-700 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 border border-emerald-300/30">
              <Sparkles size={20} className="text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white tracking-tight">Human-Friendly Automation Studio</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  Intent Layer
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Describe the business outcome you want in plain words. The system handles the node wiring and workflow graph.
              </p>
            </div>
          </div>

          {/* Quick Domain Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {domainPacks.map((pack) => {
              const isSelected = pack.id === selectedDomain;
              return (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => onSelectDomain(pack.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 font-bold scale-[1.02]'
                      : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]'
                  }`}
                >
                  <span>{pack.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Text Input Area */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span>Describe What You Want to Automate</span>
              <span className="text-emerald-400">*</span>
            </label>
            <span className="text-[11px] text-slate-500 font-medium">
              No developer variables or JSON syntax needed
            </span>
          </div>

          <div className="relative group">
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => onChangePrompt(e.target.value)}
              placeholder={`Example: "${currentPack?.samplePrompts?.[0] || 'Describe rules, timing, actions, and approvals...'}"`}
              className="w-full bg-slate-900/70 border border-white/[0.12] focus:border-emerald-500/80 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all resize-y shadow-inner"
            />
            <div className="absolute bottom-3 right-3 text-[10px] text-slate-500 font-mono">
              {prompt.length} chars
            </div>
          </div>

          {/* Sample Prompt Helpers */}
          {currentPack?.samplePrompts && currentPack.samplePrompts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Lightbulb size={13} className="text-amber-400" />
                <span className="font-semibold text-slate-300">Try an example for {currentPack.name}:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentPack.samplePrompts.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onChangePrompt(sample)}
                    className="text-left text-xs bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-white/[0.06] hover:border-emerald-500/40 transition-all cursor-pointer flex items-center gap-2 group"
                  >
                    <span className="text-emerald-400 font-mono text-[10px] group-hover:scale-110 transition-transform"></span>
                    <span className="truncate max-w-sm sm:max-w-md">{sample}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              {parsedIntent && (
                <button
                  type="button"
                  onClick={onReset}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-xl border border-white/[0.06] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Start Fresh</span>
                </button>
              )}
            </div>

            <button
              type="button"
              disabled={isParsing || !prompt.trim()}
              onClick={onParsePrompt}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
            >
              {isParsing ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Understanding Requirements...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Understand & Structure Rules</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Review Card: "Here's What I Understood" */}
      {parsedIntent && (
        <div className="relative bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-[0_15px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Here is What I Understood</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {parsedIntent.domainName}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 italic">
                  "{parsedIntent.goal}"
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenSimulator}
                className="px-3.5 py-2 bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 hover:text-white rounded-xl border border-teal-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-teal-500/10"
              >
                <Play size={13} />
                <span>Simulate Flow</span>
              </button>

              <button
                type="button"
                disabled={isCompiling}
                onClick={onCompileAndSave}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isCompiling ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Compiling DAG...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Approve & Activate</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Visual Step Timeline */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-5 gap-3">
            {parsedIntent.visualSummary?.map((stepText, idx) => (
              <div
                key={idx}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3.5 flex flex-col justify-between hover:border-emerald-500/30 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-[10px] font-mono uppercase text-slate-500 group-hover:text-emerald-400 transition-colors">
                    Stage {idx + 1}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  {stepText.replace(/^\d+\.\s*/, '')}
                </p>
              </div>
            ))}
          </div>

          {/* Result Destination & Human Policy Indicator */}
          <div className="mt-5 pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-slate-500">Destination:</span>
              <span className="font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                {parsedIntent.resultDestination.name}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="text-slate-500">Human Approval:</span>
                <span className={`font-semibold px-2 py-0.5 rounded-md ${
                  parsedIntent.approvalPolicy.required
                    ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                    : 'text-slate-400 bg-white/[0.04]'
                }`}>
                  {parsedIntent.approvalPolicy.required
                    ? `Required (${parsedIntent.approvalPolicy.reviewerRole || 'Manager'})`
                    : 'Not Required (Automated)'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="text-slate-500">Fallback:</span>
                <span className="text-slate-300 font-medium">
                  {parsedIntent.exceptions.onUncertain === 'ESCALATE_TO_HUMAN' ? 'Escalate to Staff' : 'Ask for Info'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
