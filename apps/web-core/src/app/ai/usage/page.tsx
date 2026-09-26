'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  DollarSign,
  Sparkles,
  Zap,
  Sliders,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Cpu,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { AiNavigationTabs } from '@/components/ai/AiNavigationTabs';

export default function AiUsagePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fetchUsage = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/ai/control/usage');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to load usage:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  const handleQualityChange = async (quality: 'fast' | 'balanced' | 'best') => {
    setUpdating(true);
    try {
      await fetch('/api/ai/control/usage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quality }),
      });
      setData((prev: any) => ({ ...prev, quality }));
    } finally {
      setUpdating(false);
    }
  };

  const handlePolicyChange = async (onLimitReached: string) => {
    setUpdating(true);
    try {
      await fetch('/api/ai/control/usage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onLimitReached }),
      });
      setData((prev: any) => ({ ...prev, onLimitReached }));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white font-sans">
      <AiNavigationTabs />

      {/* Top Header Cockpit Chassis */}
      <div className="botanical-glass-card rounded-3xl p-6 md:p-8 border border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/[0.06] text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-bold tracking-wider uppercase">Metered Credit Guard Active</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">Hard-Cap Spending Envelope</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[11px]">
              vault/billing/credit_meter/
            </span>
            <span className="text-zinc-500">|</span>
            <span className="text-emerald-400 font-semibold">Overage Protection: Enabled</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                BUDGET & TOKEN TELEMETRY
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
                REAL-TIME METERING
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <BarChart3 className="text-emerald-400" size={30} />
              AI Usage & Budget Controls
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 max-w-3xl leading-relaxed">
              Predictable, transparent AI spending without complicated token math. Enforce hard-stop policy caps and response quality tiers.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-400 font-mono">
          <Loader2 size={28} className="animate-spin text-emerald-400" />
          <span className="text-xs">Loading spending and usage metrics...</span>
        </div>
      ) : (
        <>
          {/* Main Monthly Allowance Progress Card */}
          <div className="botanical-glass-card rounded-2xl p-6 md:p-8 border border-white/[0.08] relative overflow-hidden space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                  Monthly AI Allowance (September 2026)
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-white font-mono">
                    ${data?.amountUsed?.toFixed(2)}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">
                    of ${data?.monthlyAllowance?.toFixed(2)} included
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs font-mono text-zinc-400">Estimated remaining:</span>
                <div className="text-lg font-bold text-emerald-400 font-mono">
                  ${data?.amountRemaining?.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="w-full h-3 bg-black/40 border border-white/[0.06] rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-sm shadow-emerald-500/50"
                  style={{ width: `${data?.percentUsed}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                <span>0%</span>
                <span className="text-emerald-400 font-bold">{data?.percentUsed}% used</span>
                <span>100% (${data?.monthlyAllowance})</span>
              </div>
            </div>

            {/* Department breakdown */}
            <div className="pt-4 border-t border-white/[0.06] space-y-3">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                Usage by AI Assistant:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {data?.breakdown?.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between"
                  >
                    <span className="text-xs font-mono font-semibold text-zinc-300">
                      {item.department}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      ${item.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quality & Speed Selector */}
          <div className="botanical-glass-card rounded-2xl p-6 border border-white/[0.08] relative overflow-hidden space-y-4">
            <div>
              <h2 className="text-base font-bold font-mono text-white">
                AI Quality & Response Speed
              </h2>
              <p className="text-xs font-mono text-zinc-400 mt-0.5">
                Choose how your assistants balance execution speed against deep analytical reasoning.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  key: 'fast',
                  title: 'Fast',
                  desc: 'Ultra-low latency for quick replies and routine classifications.',
                  detail: 'High-speed LPUs',
                },
                {
                  key: 'balanced',
                  title: 'Balanced (Recommended)',
                  desc: 'Optimal combination of intelligent reasoning and fast turnaround.',
                  detail: 'Multi-modal Flash',
                },
                {
                  key: 'best',
                  title: 'Best Quality',
                  desc: 'Maximum depth for complex contract analysis, legal, and deep financial forecasting.',
                  detail: 'High-reasoning cluster',
                },
              ].map((q) => {
                const isSelected = data?.quality === q.key;
                return (
                  <button
                    key={q.key}
                    onClick={() => handleQualityChange(q.key as any)}
                    disabled={updating}
                    className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                        : 'bg-black/40 border-white/[0.08] hover:border-white/[0.15]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-white">
                        {q.title}
                      </span>
                      {isSelected && <CheckCircle2 size={16} className="text-emerald-400" />}
                    </div>
                    <p className="text-xs font-mono text-zinc-400 mt-1 leading-relaxed">
                      {q.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Spending Limit Policy */}
          <div className="botanical-glass-card rounded-2xl p-6 border border-white/[0.08] relative overflow-hidden space-y-4">
            <div>
              <h2 className="text-base font-bold font-mono text-white">
                When Monthly Spending Limit is Reached:
              </h2>
              <p className="text-xs font-mono text-zinc-400 mt-0.5">
                Set safety rules so your monthly bill never has unexpected overages.
              </p>
            </div>

            <div className="space-y-2">
              {[
                {
                  key: 'ask_me',
                  label: 'Ask me for approval before continuing',
                  desc: 'AI will pause autonomous actions until you authorize additional usage.',
                },
                {
                  key: 'stop_ai',
                  label: 'Stop AI until next billing cycle',
                  desc: 'AI assistants will halt until the 1st of next month.',
                },
                {
                  key: 'continue_usage',
                  label: 'Continue with standard metered usage',
                  desc: 'Keep AI running with pay-as-you-go rates for uninterrupted business operations.',
                },
              ].map((rule) => (
                <label
                  key={rule.key}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    data?.onLimitReached === rule.key
                      ? 'bg-emerald-500/15 border-emerald-500/40 shadow-sm'
                      : 'bg-black/40 border-white/[0.08] hover:border-white/[0.15]'
                  }`}
                >
                  <input
                    type="radio"
                    name="limitPolicy"
                    checked={data?.onLimitReached === rule.key}
                    onChange={() => handlePolicyChange(rule.key)}
                    className="mt-1 h-4 w-4 accent-emerald-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-mono font-bold text-white block">
                      {rule.label}
                    </span>
                    <span className="text-xs font-mono text-zinc-400 block mt-0.5">
                      {rule.desc}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Progressive Disclosure: Developer & Token Details */}
          <div className="pt-2">
            <button
              onClick={() => setShowAdvanced((p) => !p)}
              className="text-xs font-mono text-zinc-400 hover:text-emerald-400 underline cursor-pointer"
            >
              {showAdvanced ? 'Hide technical token telemetry' : 'Show technical token telemetry (for engineers)'}
            </button>

            {showAdvanced && data?.advanced && (
              <div className="mt-3 p-4 rounded-xl botanical-glass-card border border-white/[0.08] text-xs font-mono space-y-2 animate-in fade-in duration-150">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Cumulative Tokens:</span>
                  <span className="font-bold text-white">
                    {data.advanced.totalTokens?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Active Routing Providers:</span>
                  <span className="font-bold text-emerald-400">
                    {data.advanced.activeProviders?.join(', ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Avg Roundtrip Latency:</span>
                  <span className="font-bold text-white">
                    {data.advanced.averageLatencyMs} ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total Metered Invocations:</span>
                  <span className="font-bold text-white">
                    {data.advanced.meteredModelCalls}
                  </span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
