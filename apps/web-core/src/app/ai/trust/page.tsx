'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Pause,
  Play,
  FileText,
  Building,
  UploadCloud,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { AiNavigationTabs } from '@/components/ai/AiNavigationTabs';

export default function AiTrustPage() {
  const [isPaused, setIsPaused] = useState(false);
  const [loadingPause, setLoadingPause] = useState(false);
  const [pauseModalOpen, setPauseModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/ai/control/pause')
      .then((res) => res.json())
      .then((data) => setIsPaused(Boolean(data.isPaused)))
      .catch(() => {});
  }, []);

  const handleTogglePause = async (newPauseState: boolean) => {
    setLoadingPause(true);
    try {
      const res = await fetch('/api/ai/control/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pause: newPauseState }),
      });
      const data = await res.json();
      setIsPaused(Boolean(data.isPaused));
      setPauseModalOpen(false);
    } finally {
      setLoadingPause(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#080d0b] flex flex-col">
      <AiNavigationTabs />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight flex items-center gap-2.5">
            <Shield size={28} className="text-emerald-500" />
            AI Trust & Security Center
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Understand the boundaries, data protection, and emergency stop controls for your digital employees.
          </p>
        </div>

        {/* Global Emergency Pause Control Card */}
        <div
          className={`border rounded-2xl p-6 md:p-7 transition-all ${
            isPaused
              ? 'bg-amber-500/10 border-amber-500/40'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  isPaused
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {isPaused ? <Pause size={24} /> : <Play size={24} />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Emergency AI Control: {isPaused ? 'PAUSED' : 'ACTIVE'}
                  </h2>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                      isPaused
                        ? 'bg-amber-500/20 text-amber-900 dark:text-amber-300'
                        : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {isPaused ? 'STANDBY' : 'RUNNING SAFELY'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                  {isPaused
                    ? 'All autonomous AI workflows are paused. No new customer messages will be sent and no automated updates will run.'
                    : 'Your AI assistants are actively monitoring data and operating within their configured autonomy levels.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (isPaused) {
                  handleTogglePause(false);
                } else {
                  setPauseModalOpen(true);
                }
              }}
              disabled={loadingPause}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isPaused
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 border border-rose-500/30'
              }`}
            >
              {loadingPause ? (
                <Loader2 size={16} className="animate-spin mx-auto" />
              ) : isPaused ? (
                'Resume AI Team'
              ) : (
                'Pause All AI'
              )}
            </button>
          </div>
        </div>

        {/* Clear Human-Readable Boundaries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* What AI can do */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
              <CheckCircle2 size={18} />
              <span>What AI is Allowed to Access & Do:</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Read authorized CRM records, pipelines, contacts, and invoices.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Identify inactive deals, past-due invoices, and churn warning signs.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Prepare personalized draft emails and check-in notes for your team.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Create follow-up tasks and calendar reminders for account owners.</span>
              </li>
            </ul>
          </div>

          {/* When AI requires your approval */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
              <AlertTriangle size={18} />
              <span>When AI Must Ask for Human Approval:</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">⚠</span>
                <span>Sending sensitive emails to high-value executive prospects.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">⚠</span>
                <span>Applying discounts or modifying commercial deal values.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">⚠</span>
                <span>Sending formal past-due invoice collection notices.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">⚠</span>
                <span>Modifying client subscription contracts or charging cards.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Data Protection & Privacy */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <Lock size={18} className="text-emerald-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Data Privacy & Enterprise Isolation
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Strict Tenant Isolation
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Your business data is strictly partitioned. No other organization can access or query your context.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Zero AI Model Training
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Your conversations, customer notes, and commercial deals are never used to train external foundational models.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Comprehensive Audit Trail
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Every action taken by your digital assistants is logged with exact reasoning in your activity feed.
              </p>
            </div>
          </div>
        </div>

        {/* Simple Business Knowledge & Memory Manager */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText size={18} className="text-emerald-500" />
                What AI Knows About Your Business
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Information your assistants reference when preparing messages and answering questions.
              </p>
            </div>

            <button
              onClick={() => alert('Document upload modal will open. Documents are automatically indexed.')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shrink-0 shadow-sm"
            >
              <UploadCloud size={14} /> Add Business Info
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Documents:</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">24 files</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Websites:</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">3 sources</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Company Policies:</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">12 policies</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">FAQs & Answers:</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">48 items</span>
            </div>
          </div>
        </div>
      </main>

      {/* Emergency Pause Confirmation Modal */}
      {pauseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 mx-auto flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Pause Your AI Team?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your AI assistants will immediately stop starting new autonomous actions. Any ongoing background tasks will finish safely.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                onClick={() => setPauseModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={() => handleTogglePause(true)}
                disabled={loadingPause}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md"
              >
                {loadingPause ? <Loader2 size={14} className="animate-spin" /> : 'Yes, Pause AI'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
