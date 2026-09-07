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
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#080d0b] flex flex-col">
      <AiNavigationTabs />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 size={28} className="text-emerald-500" />
            AI Usage & Budget Controls
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Predictable, transparent AI spending without complicated token math.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 size={28} className="animate-spin text-emerald-500" />
            <span className="text-xs font-medium">Loading spending and usage metrics...</span>
          </div>
        ) : (
          <>
            {/* Main Monthly Allowance Progress Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Monthly AI Allowance (September 2026)
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                      ${data?.amountUsed?.toFixed(2)}
                    </span>
                    <span className="text-sm text-slate-500 font-medium">
                      of ${data?.monthlyAllowance?.toFixed(2)} included
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-400">Estimated remaining:</span>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    ${data?.amountRemaining?.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="w-full h-3.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${data?.percentUsed}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                  <span>0%</span>
                  <span>{data?.percentUsed}% used</span>
                  <span>100% (${data?.monthlyAllowance})</span>
                </div>
              </div>

              {/* Department breakdown */}
              <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Usage by AI Assistant:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {data?.breakdown?.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex items-center justify-between"
                    >
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {item.department}
                      </span>
                      <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                        ${item.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quality & Speed Selector */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  AI Quality & Response Speed
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Choose how your assistants balance execution speed against deep analytical reasoning.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  {
                    key: 'fast',
                    title: '⚡ Fast',
                    desc: 'Ultra-low latency for quick replies and routine classifications.',
                    detail: 'High-speed LPUs',
                  },
                  {
                    key: 'balanced',
                    title: '⚖️ Balanced (Recommended)',
                    desc: 'Optimal combination of intelligent reasoning and fast turnaround.',
                    detail: 'Multi-modal Flash',
                  },
                  {
                    key: 'best',
                    title: '🧠 Best Quality',
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
                      className={`p-4 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/30 dark:bg-emerald-950/20'
                          : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {q.title}
                        </span>
                        {isSelected && <CheckCircle2 size={16} className="text-emerald-600" />}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {q.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Spending Limit Policy */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  When Monthly Spending Limit is Reached:
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
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
                        ? 'bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-950/20'
                        : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="limitPolicy"
                      checked={data?.onLimitReached === rule.key}
                      onChange={() => handlePolicyChange(rule.key)}
                      className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white block">
                        {rule.label}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
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
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
              >
                {showAdvanced ? 'Hide technical token telemetry' : 'Show technical token telemetry (for engineers)'}
              </button>

              {showAdvanced && data?.advanced && (
                <div className="mt-3 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-xs font-mono space-y-2 animate-in fade-in duration-150">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cumulative Tokens:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {data.advanced.totalTokens?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Active Routing Providers:</span>
                    <span className="font-bold text-emerald-600">
                      {data.advanced.activeProviders?.join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Avg Roundtrip Latency:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {data.advanced.averageLatencyMs} ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Metered Invocations:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {data.advanced.meteredModelCalls}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
