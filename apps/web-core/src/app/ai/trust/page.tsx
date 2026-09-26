'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  Lock,
  Pause,
  Play,
  FileText,
  UploadCloud,
  CheckCircle2,
  Loader2,
  Server,
  KeyRound,
  FileCheck,
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
    <div className="space-y-6 max-w-7xl mx-auto text-white font-sans">
      <AiNavigationTabs />

      {/* Top Header Cockpit Chassis */}
      <div className="botanical-glass-card rounded-3xl p-6 md:p-8 border border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/[0.06] text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isPaused ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
            </span>
            <span className={`${isPaused ? 'text-amber-400' : 'text-emerald-400'} font-bold tracking-wider uppercase`}>
              {isPaused ? 'CIRCUIT BREAKER: TRIPPED (ALL WORKFLOWS HALTED)' : 'AUTONOMOUS GOVERNANCE & AUDIT ENGINE: ACTIVE'}
            </span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">Zero Model Training Guarantee</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[11px]">
              sec/enclave/tenant_isolation/
            </span>
            <span className="text-zinc-500">|</span>
            <span className="text-emerald-400 font-semibold">Audit Logs: SHA-256 Verifiable</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                COMPLIANCE & GUARDRAILS
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
                SOC2 / GDPR COMPLIANT
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Shield className="text-emerald-400" size={30} />
              AI Trust & Security Center
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 max-w-3xl leading-relaxed">
              Understand the operational boundaries, tenant isolation protocols, and emergency kill switches protecting your company data.
            </p>
          </div>
        </div>
      </div>

      {/* Global Emergency Pause Control Card */}
      <div
        className={`botanical-glass-card rounded-2xl p-6 md:p-7 border relative overflow-hidden transition-all ${
          isPaused
            ? 'border-amber-500/40 bg-amber-950/20 shadow-lg shadow-amber-950/40'
            : 'border-white/[0.08]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                isPaused
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow-md shadow-amber-500/30'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}
            >
              {isPaused ? <Pause size={24} /> : <Play size={24} />}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Emergency AI Execution Control:{' '}
                  <span className={isPaused ? 'text-amber-400' : 'text-emerald-400'}>
                    {isPaused ? 'PAUSED' : 'ONLINE & RUNNING'}
                  </span>
                </h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono uppercase tracking-wider border ${
                    isPaused
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {isPaused ? 'STANDBY' : 'RUNNING SAFELY'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
                {isPaused
                  ? 'All autonomous AI workflows are paused. No external customer messages will be dispatched and no background automation jobs will run until resumed.'
                  : 'Your AI assistants are actively monitoring data, preparing drafts, and strictly operating within assigned autonomy thresholds.'}
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
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 font-mono tracking-wider ${
              isPaused
                ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/25 border border-emerald-400'
                : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40'
            }`}
          >
            {loadingPause ? (
              <Loader2 size={16} className="animate-spin mx-auto" />
            ) : isPaused ? (
              'RESUME AI TEAM'
            ) : (
              'PAUSE ALL AI'
            )}
          </button>
        </div>
      </div>

      {/* Clear Human-Readable Boundaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* What AI can do */}
        <div className="botanical-glass-card rounded-2xl p-6 border border-white/[0.08] relative overflow-hidden space-y-4">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent pointer-events-none" />
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm tracking-wide">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span>Permitted Actions & Read Access</span>
          </div>
          <ul className="space-y-3 text-xs text-zinc-300 leading-relaxed">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
              <span>Read authorized CRM records, pipelines, contacts, and invoices.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
              <span>Identify inactive deals, past-due invoices, and churn warning signs across accounts.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
              <span>Prepare personalized draft emails, summary briefs, and check-in notes for human staff.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
              <span>Create follow-up tasks and calendar reminders for account executives and managers.</span>
            </li>
          </ul>
        </div>

        {/* When AI requires your approval */}
        <div className="botanical-glass-card rounded-2xl p-6 border border-white/[0.08] relative overflow-hidden space-y-4">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent pointer-events-none" />
          <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm tracking-wide">
            <AlertTriangle size={18} className="text-amber-400" />
            <span>Strict Human-In-The-Loop Approval Gates</span>
          </div>
          <ul className="space-y-3 text-xs text-zinc-300 leading-relaxed">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
              <span>Sending sensitive cold emails to high-value enterprise prospects.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
              <span>Applying discounts, concession terms, or modifying commercial deal values.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
              <span>Dispatching formal past-due invoice collection notices to client billing desks.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
              <span>Modifying client subscription contracts, canceling tiers, or charging saved cards.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Data Protection & Privacy */}
      <div className="botanical-glass-card rounded-2xl p-6 md:p-7 border border-white/[0.08] relative overflow-hidden space-y-5">
        <div className="flex items-center gap-2.5">
          <Lock size={18} className="text-emerald-400" />
          <h2 className="text-base font-bold text-white tracking-tight">
            Data Privacy & Enterprise Isolation
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold">
              <Server size={14} /> Strict Tenant Isolation
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your business data is logically and cryptographically partitioned. No other organization can access or query your context.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold">
              <KeyRound size={14} /> Zero AI Model Training
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your conversations, customer notes, and commercial deals are never used to train external foundational AI models.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold">
              <FileCheck size={14} /> Immutable Audit Trail
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every action taken by your digital assistants is logged with exact reasoning, confidence score, and prompt telemetry.
            </p>
          </div>
        </div>
      </div>

      {/* Simple Business Knowledge & Memory Manager */}
      <div className="botanical-glass-card rounded-2xl p-6 md:p-7 border border-white/[0.08] relative overflow-hidden space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText size={18} className="text-emerald-400" />
              What AI Knows About Your Business
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Knowledge base files, playbooks, and company policies referenced by your assistants during inference.
            </p>
          </div>

          <button
            onClick={() => alert('Document upload modal will open. Documents are automatically indexed.')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-mono tracking-wider bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors shrink-0 shadow-lg shadow-emerald-500/20"
          >
            <UploadCloud size={14} /> ADD BUSINESS INFO
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <span className="text-zinc-500 block text-[10px] uppercase font-mono font-semibold">Indexed Documents</span>
            <span className="text-sm font-bold text-white font-mono mt-1 block">24 files</span>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <span className="text-zinc-500 block text-[10px] uppercase font-mono font-semibold">Synced Websites</span>
            <span className="text-sm font-bold text-white font-mono mt-1 block">3 sources</span>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <span className="text-zinc-500 block text-[10px] uppercase font-mono font-semibold">Company Policies</span>
            <span className="text-sm font-bold text-white font-mono mt-1 block">12 policies</span>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <span className="text-zinc-500 block text-[10px] uppercase font-mono font-semibold">FAQs & Rules</span>
            <span className="text-sm font-bold text-white font-mono mt-1 block">48 items</span>
          </div>
        </div>
      </div>

      {/* Emergency Pause Confirmation Modal */}
      {pauseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="botanical-glass-card border border-white/[0.12] rounded-3xl max-w-md w-full shadow-2xl p-7 space-y-5 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Pause Your Entire AI Team?
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Your AI assistants will immediately stop dispatching autonomous actions and pause active watchers. Any running transactions will complete safely.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setPauseModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-mono text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={() => handleTogglePause(true)}
                disabled={loadingPause}
                className="px-5 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/30 transition-all"
              >
                {loadingPause ? <Loader2 size={14} className="animate-spin" /> : 'YES, PAUSE AI'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
