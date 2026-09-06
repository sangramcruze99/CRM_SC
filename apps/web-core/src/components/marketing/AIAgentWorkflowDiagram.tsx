'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bot, Search, BrainCircuit, CheckCircle2, ArrowDown, Send, Sparkles } from 'lucide-react';

export function AIAgentWorkflowDiagram() {
  const [activeStep, setActiveStep] = useState(3);

  return (
    <section id="agent-flow" className="py-24 px-6 max-w-5xl mx-auto text-center">
      {/* Eyebrow badge */}
      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400 mb-4">
        <Sparkles size={12} />
        <span>INTELLIGENCE IN ACTION</span>
      </div>

      <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
        AI that does the actual work.
      </h2>
      <p className="mt-4 text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
        Not a conversational toy. Specialized autonomous agents with controlled access to your CRM tools and data.
      </p>

      {/* Visual Execution Diagram Container */}
      <div className="mt-14 p-6 sm:p-10 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-3xl relative overflow-hidden shadow-2xl">
        {/* Step 1: Natural Language Prompt */}
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-black/60 border border-emerald-500/30 text-left shadow-lg">
          <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Executive Natural Language Command
          </div>
          <div className="text-sm font-semibold text-white font-mono flex items-center justify-between">
            <span>"Find leads uncontacted in 7 days, prioritize them, and draft follow-ups."</span>
            <span className="text-xs text-slate-500">↵</span>
          </div>
        </div>

        {/* Down Arrow Connector */}
        <div className="my-5 flex flex-col items-center justify-center text-emerald-400/80">
          <ArrowDown size={20} className="animate-bounce" />
        </div>

        {/* Step 2: Autonomous Agent Core */}
        <div className="inline-flex items-center space-x-3 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-white font-bold text-xs font-mono shadow-[0_0_25px_rgba(16,185,129,0.25)]">
          <Bot size={16} className="text-emerald-400" />
          <span>AUTONOMOUS SALES AGENT RUNTIME</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black">
            REASONING
          </span>
        </div>

        {/* Down Connector */}
        <div className="my-5 flex flex-col items-center justify-center text-emerald-400/80">
          <ArrowDown size={20} />
        </div>

        {/* Step 3: 3-Branch Parallel Tool Execution */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
          {/* Branch 1: Search CRM */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] relative overflow-hidden">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 mb-1">
              <Search size={14} />
              <span>1. Search CRM Leads</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Scanned 1,284 contacts via PostgreSQL index. Filtered 47 leads uncontacted &gt; 7 days.
            </p>
            <div className="mt-2 text-[10px] font-mono text-emerald-300 font-semibold">
              ✓ 47 Records Isolated
            </div>
          </div>

          {/* Branch 2: Analyze & Vector RAG */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] relative overflow-hidden">
            <div className="flex items-center space-x-2 text-xs font-bold text-teal-400 mb-1">
              <BrainCircuit size={14} />
              <span>2. Analyze & Vector RAG</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Grounded against tenant pricing docs and past closed-won communications.
            </p>
            <div className="mt-2 text-[10px] font-mono text-teal-300 font-semibold">
              ✓ ICP Score Evaluated
            </div>
          </div>

          {/* Branch 3: Action Formation */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] relative overflow-hidden">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 mb-1">
              <Send size={14} />
              <span>3. Queue Actions</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Drafted 12 customized proposal emails and created follow-up tasks in BullMQ.
            </p>
            <div className="mt-2 text-[10px] font-mono text-emerald-300 font-semibold">
              ✓ Awaiting 1-Click Approval
            </div>
          </div>
        </div>

        {/* Down Connector */}
        <div className="my-6 flex flex-col items-center justify-center text-emerald-400/80">
          <ArrowDown size={20} />
        </div>

        {/* Step 4: Final Outcome Pill */}
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center shadow-lg">
          <div className="text-emerald-400 font-black text-sm sm:text-base flex items-center justify-center gap-2">
            <CheckCircle2 size={18} />
            <span>Done. 47 leads prioritized. 12 follow-ups created.</span>
          </div>
          <p className="text-[11px] text-emerald-300/80 mt-1 font-mono">
            Zero repetitive clicking. Total execution time: 1.4 seconds.
          </p>
        </div>
      </div>
    </section>
  );
}
