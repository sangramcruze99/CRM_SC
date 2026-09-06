'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'motion/react';
import { Sparkles, ArrowRight, Play, CheckCircle2, TrendingUp, Users, DollarSign, Bot, ShieldCheck } from 'lucide-react';
import { MagneticButton } from './MagneticButton';

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Framer-style scroll transformation
  const scale = useTransform(scrollYProgress, [0, 0.6], [0.88, 1.0]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0.75, 1.0]);
  const blurValue = useTransform(scrollYProgress, [0, 0.5], [8, 0]);
  const y = useTransform(scrollYProgress, [0, 0.6], [60, 0]);
  const filter = useTransform(blurValue, (v) => `blur(${v}px)`);

  return (
    <section
      ref={containerRef}
      className="relative pt-32 sm:pt-40 pb-24 overflow-hidden flex flex-col items-center justify-center text-center px-6"
    >
      {/* Background Ambience & Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[400px] h-[250px] bg-teal-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* 1. Category Pill */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] text-[11px] font-mono font-medium text-slate-300 mb-8 backdrop-blur-xl shadow-inner"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-emerald-400 font-bold uppercase tracking-wider">Business OS</span>
        <span className="text-slate-500">•</span>
        <span className="tracking-wide">CRM • SALES • SUPPORT • FINANCE • AI</span>
      </motion.div>

      {/* 2. Main Cinematic Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white max-w-5xl leading-[1.04] font-sans"
      >
        Run your business. <br />
        <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
          Automatically.
        </span>
      </motion.h1>

      {/* 3. Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal"
      >
        The unified operating system replacing 10 fragmented SaaS tools. Connect customer pipelines, BullMQ background automations, and autonomous AI workers on a single PostgreSQL backbone.
      </motion.p>

      {/* 4. Magnetic CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto"
      >
        <MagneticButton strength={0.25} className="w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl text-sm font-black bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center space-x-2 active:scale-98"
          >
            <span>Start Free Sandbox</span>
            <ArrowRight size={16} />
          </Link>
        </MagneticButton>

        <MagneticButton strength={0.25} className="w-full sm:w-auto">
          <a
            href="#agent-flow"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-sm font-semibold bg-white/[0.05] hover:bg-white/[0.09] text-slate-200 border border-white/[0.1] transition-all flex items-center justify-center space-x-2 backdrop-blur-xl active:scale-98"
          >
            <Play size={14} className="text-emerald-400 fill-emerald-400" />
            <span>Watch Live Demo</span>
          </a>
        </MagneticButton>
      </motion.div>

      {/* 5. Live Product Preview with Framer-like Scroll Scaling */}
      <motion.div
        style={{ scale, opacity, filter, y }}
        className="mt-16 sm:mt-24 w-full max-w-6xl mx-auto rounded-3xl p-1.5 sm:p-2 bg-gradient-to-b from-white/[0.15] via-white/[0.04] to-transparent shadow-[0_20px_80px_rgba(0,0,0,0.8)] border border-white/[0.12] transition-all"
      >
        {/* Browser / App Frame */}
        <div className="w-full rounded-[22px] bg-[#0c1411]/95 border border-white/[0.08] overflow-hidden text-left flex flex-col backdrop-blur-3xl">
          {/* Top Window Bar */}
          <div className="px-4 py-3 bg-black/40 border-b border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-3 text-[11px] font-mono text-slate-500 hidden sm:inline">workspace.business-os.cloud</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono text-emerald-400 font-bold">21 Microservices Online</span>
            </div>
          </div>

          {/* CRM Dashboard Canvas */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* KPI Metric Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Active Deals</span>
                  <DollarSign size={14} className="text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white font-mono">$240,000</div>
                <div className="text-[11px] text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                  <TrendingUp size={11} /> +18.4% this month
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Qualified Leads</span>
                  <Users size={14} className="text-teal-400" />
                </div>
                <div className="text-2xl font-black text-white font-mono">1,284</div>
                <div className="text-[11px] text-teal-400 font-semibold mt-0.5">+47 today via Apollo</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Automated Tasks</span>
                  <CheckCircle2 size={14} className="text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white font-mono">1,482</div>
                <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">BullMQ Zero Latency</div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center justify-between text-emerald-400 text-xs mb-1 font-bold">
                  <span>Autonomous Sentinel</span>
                  <Bot size={14} />
                </div>
                <div className="text-sm font-bold text-white leading-tight">Sales Agent Active</div>
                <div className="text-[11px] text-emerald-300 mt-1 font-mono">Formulating Deal Follow-ups</div>
              </div>
            </div>

            {/* Pipeline Cards & Live AI Execution Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Deal Card 1 */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-300">
                    STAGE: PROPOSAL
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-400">$25,000</span>
                </div>
                <div className="font-bold text-sm text-white">Acme Corp — Enterprise License</div>
                <div className="text-xs text-slate-400 mt-1">Lead: Sarah Lin (VP Engineering)</div>
                <div className="mt-3 pt-3 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-slate-500">
                  <span>Activity: 2h ago</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Sparkles size={11} /> Win Prob: 82%
                  </span>
                </div>
              </div>

              {/* Deal Card 2 */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-300">
                    STAGE: NEGOTIATION
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-400">$18,500</span>
                </div>
                <div className="font-bold text-sm text-white">TechFlow — Annual Platform Tier</div>
                <div className="text-xs text-slate-400 mt-1">Lead: Marcus Vance (COO)</div>
                <div className="mt-3 pt-3 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-slate-500">
                  <span>Activity: 10m ago</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Sparkles size={11} /> Win Prob: 94%
                  </span>
                </div>
              </div>

              {/* Live Autonomous Agent Sentinel Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold mb-1">
                    <Sparkles size={14} className="animate-spin" />
                    <span>AUTONOMOUS AGENT ACTIVE</span>
                  </div>
                  <div className="text-xs font-semibold text-white mt-1">
                    "Identified stalled proposal for Acme Corp ($25k). Generated follow-up email and review task."
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-emerald-500/20 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-emerald-300">Awaiting 1-Click Human Approval</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 font-black text-[10px]">
                    APPROVED
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
