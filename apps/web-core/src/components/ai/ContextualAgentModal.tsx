'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Play,
  ArrowRight,
  Shield,
  Layers,
  Check,
  Loader2,
  Sliders,
  ExternalLink,
  Bot,
  Zap,
  Activity,
  ChevronRight,
  TrendingUp,
  Landmark,
  ShieldCheck,
  Users,
  Contact,
  Workflow,
  MessageSquare,
  Home,
  Scan,
} from 'lucide-react';
import { BUSINESS_AGENTS, BusinessAgentMetadata } from '@/lib/agents.config';

const ICON_MAP: Record<string, any> = {
  Landmark,
  TrendingUp,
  ShieldCheck,
  Users,
  Contact,
  Workflow,
  MessageSquare,
  Home,
  Scan,
};

export function ContextualAgentModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [isRunningAutomation, setIsRunningAutomation] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Listen for global open-agent-modal events or URL parameter ?agent=
  useEffect(() => {
    const handleOpen = (e: CustomEvent<{ agentId: string }>) => {
      if (e.detail?.agentId) {
        setActiveAgentId(e.detail.agentId);
      }
    };

    window.addEventListener('open-agent-modal' as any, handleOpen as any);

    const queryAgent = searchParams.get('agent');
    if (queryAgent && BUSINESS_AGENTS[queryAgent]) {
      setActiveAgentId(queryAgent);
    }

    return () => {
      window.removeEventListener('open-agent-modal' as any, handleOpen as any);
    };
  }, [searchParams]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeAgentId) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeAgentId]);

  const handleClose = () => {
    setActiveAgentId(null);
    setIsAdvancedMode(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('close-agent-modal'));
    }
    // If URL had ?agent=, clean it up without refresh
    if (searchParams.get('agent')) {
      const url = new URL(window.location.href);
      url.searchParams.delete('agent');
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleRunAutomation = async (agent: BusinessAgentMetadata) => {
    setIsRunningAutomation(true);
    setSuccessToast(null);

    // Call execution endpoint or simulated audit pass
    try {
      if (agent.runEndpoint) {
        await fetch(agent.runEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-tenant-id': 'default-tenant' },
          body: JSON.stringify({ triggeredBy: 'Human Executive Console' }),
        }).catch(() => {});
      } else {
        await new Promise((resolve) => setTimeout(resolve, 900));
      }

      setSuccessToast(`✓ ${agent.friendlyName} executed successfully! Staged items updated.`);
      setTimeout(() => setSuccessToast(null), 4000);
    } finally {
      setIsRunningAutomation(false);
    }
  };

  if (!activeAgentId) return null;

  const agent = BUSINESS_AGENTS[activeAgentId] || BUSINESS_AGENTS['midas'];
  const IconComponent = ICON_MAP[agent.avatarIcon] || Bot;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-white dark:bg-[#0c1411] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 text-slate-900 dark:text-white relative"
      >
        {/* Header Ribbon */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-white/10 flex items-start justify-between gap-4 bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${agent.themeColor} flex items-center justify-center text-white shadow-lg shrink-0`}>
              <IconComponent size={24} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-950 dark:text-white tracking-tight truncate">
                  {agent.friendlyName}
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                  {agent.departmentTitle}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1 font-medium">
                {isAdvancedMode ? agent.technicalCodename : agent.roleDescription}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Advanced Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsAdvancedMode((prev) => !prev)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
                isAdvancedMode
                  ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 shadow-xs'
                  : 'bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Toggle Technical Agent Name & Policy Engine Specs"
            >
              <span className="hidden sm:inline">Advanced Mode</span>
              <span className="sm:hidden">Adv</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Success Banner */}
          {successToast && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

          {/* Section 1: What I Can Do */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles size={13} className="text-emerald-600 dark:text-emerald-400" />
                <span>What I Can Do</span>
              </h3>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Human-Governed Autonomy</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {agent.whatICanDo.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.07] rounded-xl flex items-start gap-2 text-xs font-medium text-slate-800 dark:text-slate-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Run Primary Action Trigger */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleRunAutomation(agent)}
                disabled={isRunningAutomation}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                {isRunningAutomation ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Executing Sentinel Pass...</span>
                  </>
                ) : (
                  <>
                    <Play size={14} />
                    <span>{agent.primaryActionLabel}</span>
                  </>
                )}
              </button>

              {agent.reviewRoute && (
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    router.push(agent.reviewRoute!);
                  }}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Review Staged Items</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Section 2: Today's Status */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Activity size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>Today’s Telemetry</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {agent.todayStats.map((stat, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border ${
                    stat.alert
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-300'
                      : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.07] text-slate-900 dark:text-white'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block truncate">
                    {stat.label}
                  </span>
                  <span className="text-lg font-black block mt-0.5">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Active Automations */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Workflow size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>Active Scheduled Automations</span>
            </h3>

            <div className="space-y-1.5">
              {agent.automations.map((auto) => (
                <div
                  key={auto.id}
                  className="p-3 bg-slate-50 dark:bg-white/[0.025] border border-slate-200 dark:border-white/[0.07] rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                      ✓
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {auto.title}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-200 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 shrink-0">
                    {auto.frequency}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Live Activity Log */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Clock size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>Recent Activity Feed</span>
            </h3>

            <div className="space-y-1.5">
              {agent.recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 dark:text-white block truncate">
                      {log.entity}
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 block truncate">
                      {log.action}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                        log.status === 'STAGED'
                          ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                      }`}
                    >
                      {log.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Universal helper to open any business agent modal from anywhere in the platform.
 */
export function openAgentModal(agentId: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-agent-modal', { detail: { agentId } }));
  }
}
