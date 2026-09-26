'use client';

import React from 'react';
import Link from 'next/link';
import {
  Palette,
  TrendingUp,
  Megaphone,
  Video,
  Layers,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Share2,
} from 'lucide-react';

export function AgencySection() {
  return (
    <div className="space-y-4">
      {/* 1. Main Agency Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Spotlight Card: Campaign Portfolio & Media ROAS */}
        <div className="md:col-span-12 lg:col-span-7 workstation-card p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold shadow-xs">
                <Palette size={20} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                  Digital Agency &amp; Media Studio
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Active Client Campaigns &amp; Blended ROAS
                </h3>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              16 CAMPAIGNS LIVE
            </span>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-200 dark:border-white/[0.08] text-center">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Monthly Ad Spend</span>
              <div className="text-xl font-mono font-extrabold text-cyan-400 mt-0.5">$184,500</div>
              <span className="text-[10px] text-zinc-500 font-mono">Meta, Google &amp; TikTok</span>
            </div>
            <div className="border-x border-slate-200 dark:border-white/[0.08]">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Blended ROAS</span>
              <div className="text-xl font-mono font-extrabold text-emerald-400 mt-0.5">4.62x</div>
              <span className="text-[10px] text-emerald-400 font-mono">+$852k Attributed Rev</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Creative Velocity</span>
              <div className="text-xl font-mono font-extrabold text-teal-400 mt-0.5">24 Assets/wk</div>
              <span className="text-[10px] text-zinc-500 font-mono">Video, Copy &amp; Landers</span>
            </div>
          </div>

          {/* ROAS Optimization Bar */}
          <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-cyan-400 shrink-0" />
              <span className="text-zinc-300">AI Creative Loop: 14 Ad variants auto-generated &amp; A/B tested on live audiences</span>
            </div>
            <Link
              href="/social"
              className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 shrink-0 transition"
            >
              <span>Social Studio</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Right 5 Cols: Agency Sub-Tiles */}
        <div className="md:col-span-12 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Tile 1: Visual Email Builder */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone size={15} className="text-cyan-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Email Sprints</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Ready
              </span>
            </div>
            <div>
              <span className="text-base font-mono font-black text-slate-900 dark:text-white block">8 Client Broadcasts</span>
              <span className="text-[10px] font-mono text-zinc-400">42.8% Average Open Rate</span>
            </div>
            <Link href="/email-marketing" className="text-xs font-mono text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
              <span>Email Studio</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 2: Video & Creative Pipeline */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video size={15} className="text-teal-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Video Creative</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                In Review
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">6 Short-Form Hooks</span>
              <span className="text-[10px] font-mono text-zinc-500">Auto-scripted &amp; Storyboarded</span>
            </div>
            <Link href="/documents" className="text-xs font-mono text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1">
              <span>Asset Vault</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 3: Social Media Automation */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 size={15} className="text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Social Dispatch</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Scheduled
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">48 Posts Queued</span>
              <span className="text-[10px] font-mono text-zinc-500">LinkedIn · X · Instagram · Meta</span>
            </div>
            <Link href="/social" className="text-xs font-mono text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
              <span>Social Calendar</span> <ArrowRight size={11} />
            </Link>
          </div>

          {/* Tile 4: Landing Page Studio */}
          <div className="workstation-card p-4 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={15} className="text-blue-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Landing Pages</h4>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                12 Live
              </span>
            </div>
            <div>
              <span className="text-xs font-mono text-zinc-300 block">High-Conversion Landers</span>
              <span className="text-[10px] font-mono text-zinc-500">Avg 6.4% Opt-In Conversion</span>
            </div>
            <Link href="/site-builder" className="text-xs font-mono text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1">
              <span>Site Builder</span> <ArrowRight size={11} />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
