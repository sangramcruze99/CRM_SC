'use client';

import React from 'react';
import { Users, TrendingUp, Zap, Bot, CreditCard, Layers } from 'lucide-react';

interface FeatureCard {
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  metric: string;
  metricLabel: string;
  icon: React.ReactNode;
}

const FEATURES: FeatureCard[] = [
  {
    title: 'CRM & Customer 360',
    subtitle: 'Know every customer.',
    badge: 'CRM ENGINE',
    description: 'Unified timelines, dynamic custom attributes, Apollo lead imports, and full commercial communication histories.',
    metric: '100%',
    metricLabel: 'Customer Context',
    icon: <Users className="text-emerald-400" size={20} />,
  },
  {
    title: 'Sales & Deal Pipeline',
    subtitle: 'Close more deals.',
    badge: 'SALES ENGINE',
    description: 'Visual stages with automated probability forecasting, deal stall detection, and stage-gate validation.',
    metric: '+34%',
    metricLabel: 'Pipeline Velocity',
    icon: <TrendingUp className="text-teal-400" size={20} />,
  },
  {
    title: 'Event-Driven Workflows',
    subtitle: 'Stop doing repetitive work.',
    badge: 'BULLMQ + REDIS',
    description: 'Automated background execution with conditional branches, Resend email dispatches, and multi-step webhooks.',
    metric: '<50ms',
    metricLabel: 'Dispatch Latency',
    icon: <Zap className="text-emerald-400" size={20} />,
  },
  {
    title: 'Autonomous AI Agents',
    subtitle: 'Deploy intelligent workers.',
    badge: 'AI ENGINE',
    description: 'Specialized agents with tool-calling capabilities to triage leads, resolve support tickets, and draft proposals.',
    metric: '5 Agents',
    metricLabel: 'Active Sentinels',
    icon: <Bot className="text-teal-400" size={20} />,
  },
  {
    title: 'Finance & Invoicing',
    subtitle: 'From deal to payment.',
    badge: 'FINANCE ENGINE',
    description: 'Instant Stripe payment links, automated tax calculation, recurring subscriptions, and dunning workflows.',
    metric: '0 Days',
    metricLabel: 'Invoice Delay',
    icon: <CreditCard className="text-emerald-400" size={20} />,
  },
];

export function HorizontalFeatureShowcase() {
  return (
    <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.1] text-[11px] font-mono text-slate-300 mb-4">
          <Layers size={12} className="text-emerald-400" />
          <span>ALL-IN-ONE BUSINESS PLATFORM</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          One platform. Every workflow.
        </h2>
        <p className="mt-4 text-slate-400 text-sm sm:text-base">
          Engineered as 21 microservices unified into a single responsive workstation.
        </p>
      </div>

      {/* Horizontal Scroll Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((feat, idx) => (
          <div
            key={idx}
            className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.08] hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group shadow-xl"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  {feat.badge}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white tracking-tight">{feat.title}</h3>
              <div className="text-xs font-semibold text-emerald-400/90 mt-0.5">{feat.subtitle}</div>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">{feat.description}</p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-baseline justify-between">
              <span className="text-xs text-slate-500 font-medium">{feat.metricLabel}</span>
              <span className="text-lg font-black font-mono text-white group-hover:text-emerald-400 transition-colors">
                {feat.metric}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
