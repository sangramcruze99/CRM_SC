'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { MagneticButton } from './MagneticButton';

export function PricingSection() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/[0.06]">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400 mb-4">
          <ShieldCheck size={12} />
          <span>TRANSPARENT VALUE</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Kill SaaS Fragmentation.
        </h2>
        <p className="mt-4 text-slate-400 text-sm sm:text-base">
          Stop paying $345/user/month across 6 disconnected tools. One unified operating system.
        </p>

        {/* Annual / Monthly Toggle */}
        <div className="mt-8 inline-flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
          <button
            onClick={() => setAnnual(false)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !annual ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              annual ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Annual</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-black/20">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Tier 1: Starter */}
        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Sandbox Tier</div>
            <h3 className="text-2xl font-black text-white mt-1">Starter</h3>
            <p className="text-xs text-slate-400 mt-2">For founders and boutique agencies exploring autonomous pipelines.</p>

            <div className="mt-6 mb-6">
              <span className="text-4xl font-black text-white font-mono">$0</span>
              <span className="text-xs text-slate-500 ml-1">/ forever free</span>
            </div>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-400" />
                <span>Core CRM &amp; Sales Pipeline</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-400" />
                <span>Up to 1,000 Contacts &amp; Leads</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-400" />
                <span>Basic BullMQ Event Automations</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-400" />
                <span>Community Support</span>
              </li>
            </ul>
          </div>

          <Link
            href="/dashboard"
            className="mt-8 w-full py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-white text-xs font-bold text-center border border-white/[0.1] transition-all block"
          >
            Launch Free Sandbox
          </Link>
        </div>

        {/* Tier 2: Growth (Featured) */}
        <div className="p-8 rounded-3xl bg-gradient-to-b from-emerald-500/10 via-white/[0.03] to-transparent border border-emerald-500/40 relative flex flex-col justify-between shadow-[0_0_50px_rgba(16,185,129,0.15)]">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-emerald-500 text-slate-950 shadow-md">
            Most Popular
          </div>

          <div>
            <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">Autonomous Engine</div>
            <h3 className="text-2xl font-black text-white mt-1">Growth OS</h3>
            <p className="text-xs text-slate-300 mt-2">Complete business operations with specialized AI agents and invoicing.</p>

            <div className="mt-6 mb-6">
              <span className="text-4xl font-black text-white font-mono">{annual ? '$39' : '$49'}</span>
              <span className="text-xs text-slate-400 ml-1">/ seat / month</span>
            </div>

            <ul className="space-y-3 text-xs text-slate-200">
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-400" />
                <span>All 21 Backend Microservices</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-400" />
                <span>Specialized AI Agents (Sales, Support, Finance)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-400" />
                <span>Unlimited BullMQ Background Queues</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-400" />
                <span>Invoices, Dynamic Payment Links &amp; Stripe</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-400" />
                <span>Real-Time Socket.io Team Chat &amp; Helpdesk</span>
              </li>
            </ul>
          </div>

          <MagneticButton strength={0.2} className="w-full mt-8">
            <Link
              href="/dashboard"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black text-center shadow-lg transition-all flex items-center justify-center gap-1.5"
            >
              <span>Get Started with Growth</span>
              <ArrowRight size={13} />
            </Link>
          </MagneticButton>
        </div>

        {/* Tier 3: Enterprise */}
        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Enterprise Scale</div>
            <h3 className="text-2xl font-black text-white mt-1">Enterprise</h3>
            <p className="text-xs text-slate-400 mt-2">Dedicated multi-tenant isolation, custom SLAs, and on-prem deployment.</p>

            <div className="mt-6 mb-6">
              <span className="text-4xl font-black text-white font-mono">{annual ? '$159' : '$199'}</span>
              <span className="text-xs text-slate-500 ml-1">/ seat / month</span>
            </div>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-400" />
                <span>Dedicated PostgreSQL &amp; Redis Instances</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-400" />
                <span>Custom Domain &amp; White-Label Branding</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-400" />
                <span>Custom Autonomous Agent Prompt Training</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-400" />
                <span>99.99% Guaranteed Uptime SLA</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-emerald-400" />
                <span>Dedicated Solutions Architect</span>
              </li>
            </ul>
          </div>

          <Link
            href="/dashboard"
            className="mt-8 w-full py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-white text-xs font-bold text-center border border-white/[0.1] transition-all block"
          >
            Contact Enterprise Sales
          </Link>
        </div>
      </div>
    </section>
  );
}
