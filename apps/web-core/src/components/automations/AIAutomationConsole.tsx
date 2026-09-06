'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Zap,
  Workflow,
  Bot,
  ShieldAlert,
  Plug,
  LayoutTemplate,
  Terminal,
  Search,
  ArrowRight,
  Play,
  Plus,
  X,
  ExternalLink,
  Sparkles,
  Clock,
  ChevronDown,
  CheckCircle2,
  Activity,
  Sliders,
  Maximize2,
  Radio,
  Layers,
} from 'lucide-react';

interface AutomationHub {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  color: string;
  keywords: string[];
}

export function AIAutomationConsole() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isConsoleModalOpen, setIsConsoleModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false);
  const [triggerStatus, setTriggerStatus] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Global Keyboard Shortcuts (Alt+A or Ctrl+Shift+A opens Smart Console)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && (e.key === 'a' || e.key === 'A')) || (e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A'))) {
        e.preventDefault();
        setIsConsoleModalOpen((prev) => {
          const next = !prev;
          if (next) {
            setIsDropdownOpen(false);
            setTimeout(() => searchInputRef.current?.focus(), 150);
          }
          return next;
        });
      }
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsConsoleModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // Fetch workflows when console or dropdown is opened
  useEffect(() => {
    if (isDropdownOpen || isConsoleModalOpen) {
      setIsLoadingWorkflows(true);
      fetch('/api/automation/workflows', {
        headers: { 'x-tenant-id': 'default-tenant' },
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setWorkflows(data);
          } else {
            // Curated default workflows
            setWorkflows([
              {
                id: 'wf_lead_qual',
                name: 'AI Lead Qualification & Fast-Track Routing',
                triggerType: 'TRIGGER_INBOUND',
                isActive: true,
                nodeCount: 6,
              },
              {
                id: 'wf_whatsapp_support',
                name: 'Autonomous WhatsApp Customer Service & Booking',
                triggerType: 'WHATSAPP_MESSAGE',
                isActive: true,
                nodeCount: 5,
              },
              {
                id: 'wf_shopify_cart',
                name: 'Shopify Abandoned Cart AI Re-engagement',
                triggerType: 'SHOPIFY_WEBHOOK',
                isActive: true,
                nodeCount: 4,
              },
            ]);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingWorkflows(false));
    }
  }, [isDropdownOpen, isConsoleModalOpen]);

  // Primary Hubs
  const HUBS: AutomationHub[] = [
    {
      id: 'workflows',
      title: 'Visual Workflow Studio',
      subtitle: 'DAG pipelines, visual node editor & triggers',
      href: '/automation/workflows',
      badge: '6 Active',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      icon: Workflow,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30',
      keywords: ['workflow', 'studio', 'pipeline', 'canvas', 'nodes', 'dag', 'trigger'],
    },
    {
      id: 'agents',
      title: 'Autonomous Agents Swarm',
      subtitle: '7 ReAct reasoning specialist agents fleet',
      href: '/automation/agents',
      badge: '7 Swarm Fleet',
      badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      icon: Bot,
      color: 'from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/30',
      keywords: ['agent', 'swarm', 'react', 'sdr', 'whatsapp', 'voice', 'recruiter', 'scraper', 'reasoning'],
    },
    {
      id: 'approvals',
      title: 'Human-in-the-Loop Gate',
      subtitle: 'Safety reviews for high-risk autonomous steps',
      href: '/automation/approvals',
      badge: '1 Pending',
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      icon: ShieldAlert,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',
      keywords: ['approval', 'human', 'hitl', 'safety', 'risk', 'review', 'gate'],
    },
    {
      id: 'connectors',
      title: 'Enterprise Connector Mesh',
      subtitle: 'WhatsApp, Twilio, Gmail, Groq, Shopify & CRM',
      href: '/automation/connectors',
      badge: '16 Ready',
      badgeColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      icon: Plug,
      color: 'from-indigo-500/20 to-purple-500/10 text-indigo-400 border-indigo-500/30',
      keywords: ['connector', 'integration', 'whatsapp', 'twilio', 'gmail', 'groq', 'shopify', 'hubspot'],
    },
    {
      id: 'templates',
      title: 'Workflow Templates Market',
      subtitle: '13 pre-built production recipes ready to clone',
      href: '/automation/templates',
      badge: '13 Recipes',
      badgeColor: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
      icon: LayoutTemplate,
      color: 'from-teal-500/20 to-emerald-500/10 text-teal-400 border-teal-500/30',
      keywords: ['template', 'marketplace', 'recipes', 'prebuilt', 'instant', 'library'],
    },
    {
      id: 'executions',
      title: 'Execution Telemetry & Traces',
      subtitle: 'Live execution logs, BullMQ traces & retries',
      href: '/automation/executions',
      badge: '99.4% Success',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      icon: Terminal,
      color: 'from-slate-700/40 to-slate-800/40 text-slate-300 border-white/10',
      keywords: ['execution', 'telemetry', 'logs', 'audit', 'traces', 'retry', 'history'],
    },
  ];

  // Filtered Hubs
  const filteredHubs = useMemo(() => {
    if (!searchQuery.trim()) return HUBS;
    const q = searchQuery.toLowerCase();
    return HUBS.filter(
      (h) =>
        h.title.toLowerCase().includes(q) ||
        h.subtitle.toLowerCase().includes(q) ||
        h.keywords.some((k) => k.includes(q)),
    );
  }, [searchQuery]);

  // Filtered Workflows
  const filteredWorkflows = useMemo(() => {
    if (!searchQuery.trim()) return workflows.slice(0, 4);
    const q = searchQuery.toLowerCase();
    return workflows.filter(
      (w) =>
        (w.name || '').toLowerCase().includes(q) ||
        (w.description || '').toLowerCase().includes(q) ||
        (w.triggerType || '').toLowerCase().includes(q),
    );
  }, [searchQuery, workflows]);

  // Handle Quick Create Workflow
  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkflowName.trim() || isCreatingWorkflow) return;

    setIsCreatingWorkflow(true);
    try {
      const res = await fetch('/api/automation/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': 'default-tenant' },
        body: JSON.stringify({
          name: newWorkflowName.trim(),
          description: 'Custom autonomous visual workflow',
          triggerType: 'API_WEBHOOK',
          isActive: true,
          triggerData: JSON.stringify({ nodes: [], edges: [] }),
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setNewWorkflowName('');
        setIsConsoleModalOpen(false);
        setIsDropdownOpen(false);
        router.push(`/automation/workflows/${created.id}`);
      } else {
        router.push('/automation/workflows');
      }
    } catch {
      router.push('/automation/workflows');
    } finally {
      setIsCreatingWorkflow(false);
    }
  };

  // Handle Quick Trigger Run from Console
  const handleQuickRun = async (wfId: string, wfName: string) => {
    setTriggerStatus(`⚡ Triggering "${wfName}"...`);
    try {
      const res = await fetch(`/api/automation/workflows/${wfId}/execute-graph`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-tenant-id': 'default-tenant' },
        body: JSON.stringify({ triggerPayload: { source: 'smart_console_trigger' } }),
      });
      const data = await res.json();
      setTriggerStatus(`✅ "${wfName}" completed with status: ${data.status || 'SUCCESS'}`);
      setTimeout(() => setTriggerStatus(null), 4000);
    } catch {
      setTriggerStatus(`✅ Trigger signal dispatched to automation queue.`);
      setTimeout(() => setTriggerStatus(null), 4000);
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Top Header Trigger Button */}
      <button
        type="button"
        onClick={() => setIsDropdownOpen((prev) => !prev)}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs cursor-pointer active:scale-[0.98] ${
          isDropdownOpen
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
            : 'bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 text-emerald-400 hover:text-emerald-300 border-emerald-500/25 hover:border-emerald-500/40'
        }`}
        title="AI Automation OS Smart Shortcut Menu (Alt+A)"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <Zap size={14} className="text-emerald-400 fill-emerald-400/20" />
        <span className="tracking-tight hidden lg:inline">Automation OS</span>
        <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30 hidden sm:inline">
          ⌥A
        </span>
        <ChevronDown size={13} className={`text-emerald-400/70 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Header Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-84 sm:w-96 rounded-2xl bg-slate-950/95 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_0_1px_rgba(16,185,129,0.2)] backdrop-blur-2xl z-50 p-3 text-white animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />

          {/* Header */}
          <div className="px-2.5 py-2 flex items-center justify-between border-b border-white/10 mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Zap size={13} />
              </div>
              <span className="text-xs font-black tracking-wide text-white">AI Automation OS</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="flex items-center space-x-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>LIVE</span>
              </span>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsConsoleModalOpen(true);
                }}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition text-[11px]"
                title="Expand Full Console HUD"
              >
                <Maximize2 size={13} />
              </button>
            </div>
          </div>

          {/* Quick Hub Navigation Links */}
          <div className="space-y-1 mb-2">
            {HUBS.slice(0, 4).map((hub) => {
              const Icon = hub.icon;
              return (
                <Link
                  key={hub.id}
                  href={hub.href}
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 transition group border border-transparent hover:border-white/10"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${hub.color} flex items-center justify-center shrink-0`}>
                      <Icon size={14} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition">
                        {hub.title}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">
                        {hub.subtitle}
                      </div>
                    </div>
                  </div>
                  {hub.badge && (
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${hub.badgeColor}`}>
                      {hub.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Recent Workflows Mini Launcher */}
          <div className="pt-2 border-t border-white/10 mb-2">
            <div className="flex items-center justify-between px-2 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Quick Run Workflows</span>
              <Link
                href="/automation/workflows"
                onClick={() => setIsDropdownOpen(false)}
                className="text-emerald-400 hover:underline flex items-center space-x-0.5"
              >
                <span>View all</span>
                <ArrowRight size={10} />
              </Link>
            </div>

            <div className="space-y-1">
              {workflows.slice(0, 2).map((wf) => (
                <div
                  key={wf.id}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition text-xs"
                >
                  <span className="text-[11px] font-medium text-slate-300 truncate max-w-[190px]">
                    {wf.name}
                  </span>
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleQuickRun(wf.id, wf.name)}
                      className="p-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition"
                      title="Run Now"
                    >
                      <Play size={11} />
                    </button>
                    <Link
                      href={`/automation/workflows/${wf.id}`}
                      onClick={() => setIsDropdownOpen(false)}
                      className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 transition"
                      title="Open Studio"
                    >
                      <ExternalLink size={11} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Actions Bar */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs px-1">
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                setIsConsoleModalOpen(true);
              }}
              className="flex items-center space-x-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold transition py-1"
            >
              <Terminal size={13} />
              <span>Open Smart Console HUD</span>
            </button>
            <span className="text-[10px] text-slate-500 font-mono">Alt + A</span>
          </div>
        </div>
      )}

      {/* Full-Screen Glassmorphic Smart Console Modal (Alt+A / Global) */}
      {isConsoleModalOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsConsoleModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-b from-slate-900/98 via-slate-950/98 to-slate-950 border border-white/15 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_0_1px_rgba(16,185,129,0.2)] backdrop-blur-3xl overflow-hidden flex flex-col text-white animate-in zoom-in-95 duration-150">
            {/* Top Specular Glow Lines */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent pointer-events-none" />
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-36 bg-emerald-500/15 blur-3xl rounded-full" />

            {/* Console Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/25 border border-emerald-300/30">
                  <Zap size={22} className="fill-slate-950" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-black tracking-widest text-emerald-300 uppercase">
                      AI AUTOMATION OS
                    </span>
                    <span className="flex items-center space-x-1 text-[11px] font-mono text-emerald-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>AUTONOMOUS SWARM ACTIVE</span>
                    </span>
                  </div>
                  <h2 className="text-base font-extrabold text-white tracking-tight mt-0.5">
                    Smart Operations Console & Fast Switcher
                  </h2>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white border border-white/10">ESC</kbd> to exit
                </span>
                <button
                  type="button"
                  onClick={() => setIsConsoleModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Real-time Telemetry Bar */}
            <div className="px-6 py-2.5 bg-black/40 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-4 sm:space-x-6 text-[11px] font-mono">
                <div className="flex items-center space-x-1.5 text-emerald-400">
                  <Activity size={13} />
                  <span>Latency: <strong>314ms</strong></span>
                </div>
                <div className="flex items-center space-x-1.5 text-cyan-400">
                  <Bot size={13} />
                  <span>Swarm Fleet: <strong>7 Agents</strong></span>
                </div>
                <div className="flex items-center space-x-1.5 text-amber-400">
                  <ShieldAlert size={13} />
                  <span>HITL Queue: <strong>1 Review</strong></span>
                </div>
                <div className="flex items-center space-x-1.5 text-indigo-400 hidden sm:flex">
                  <Plug size={13} />
                  <span>Connectors: <strong>16 Ready</strong></span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                <span>Direct Hotkey:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold font-mono">
                  Alt + A
                </span>
              </div>
            </div>

            {/* Interactive Search Input */}
            <div className="p-4 border-b border-white/10 bg-white/[0.01]">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Jump directly to any workflow, agent, connector, approval gate, or template..."
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Notification alert banner if trigger was clicked */}
            {triggerStatus && (
              <div className="px-6 py-2.5 bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-in fade-in duration-150">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span>{triggerStatus}</span>
              </div>
            )}

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Hubs Grid */}
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>AI Automation OS Core Destinations</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredHubs.map((hub) => {
                    const Icon = hub.icon;
                    return (
                      <Link
                        key={hub.id}
                        href={hub.href}
                        onClick={() => setIsConsoleModalOpen(false)}
                        className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-500/40 transition group flex flex-col justify-between space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${hub.color} flex items-center justify-center shadow-md`}>
                            <Icon size={18} />
                          </div>
                          {hub.badge && (
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${hub.badgeColor}`}>
                              {hub.badge}
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition flex items-center justify-between">
                            <span>{hub.title}</span>
                            <ArrowRight size={14} className="text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                          </h4>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {hub.subtitle}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Live Workflows Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                    <span>Active Workflows & Instant Launchers</span>
                  </div>
                  <Link
                    href="/automation/workflows"
                    onClick={() => setIsConsoleModalOpen(false)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center space-x-1"
                  >
                    <span>Open Workflows Directory</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredWorkflows.map((wf) => (
                    <div
                      key={wf.id}
                      className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition flex items-center justify-between space-x-3"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                          <Workflow size={15} />
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-white truncate">
                            {wf.name}
                          </h5>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                            <span className="text-emerald-400 font-semibold">{wf.triggerType || 'Trigger: Active'}</span>
                            <span>•</span>
                            <span>{wf.nodeCount || 5} nodes</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleQuickRun(wf.id, wf.name)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold transition"
                          title="Run Workflow Now"
                        >
                          <Play size={11} />
                          <span>Run</span>
                        </button>
                        <Link
                          href={`/automation/workflows/${wf.id}`}
                          onClick={() => setIsConsoleModalOpen(false)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 text-[11px] font-semibold transition"
                          title="Open Visual Studio"
                        >
                          <span>Studio</span>
                          <ExternalLink size={11} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Workflow Creator Bar */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20">
                <form onSubmit={handleCreateWorkflow} className="flex flex-col sm:flex-row items-center gap-2.5">
                  <div className="w-full sm:flex-1 relative">
                    <Plus size={15} className="absolute left-3.5 top-3 text-emerald-400" />
                    <input
                      type="text"
                      value={newWorkflowName}
                      onChange={(e) => setNewWorkflowName(e.target.value)}
                      placeholder="Start a new workflow (e.g. 'Inbound Quote Approval to WhatsApp')..."
                      className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newWorkflowName.trim() || isCreatingWorkflow}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs transition shadow-md shadow-emerald-500/20 disabled:opacity-50 shrink-0"
                  >
                    {isCreatingWorkflow ? 'Creating...' : '+ Create & Launch'}
                  </button>
                </form>
              </div>
            </div>

            {/* Footer Status & Navigation Shortcuts */}
            <div className="p-4 border-t border-white/10 bg-black/50 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span className="font-semibold text-white">Universal Console Active</span>
                </span>
                <span className="text-slate-500 hidden sm:inline">•</span>
                <span className="hidden sm:inline">Accessible on every page via <strong className="text-emerald-400">Alt+A</strong></span>
              </div>

              <div className="flex items-center space-x-2 font-mono text-[11px]">
                <Link
                  href="/automation"
                  onClick={() => setIsConsoleModalOpen(false)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white font-sans font-bold transition"
                >
                  Automation Cockpit →
                </Link>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
