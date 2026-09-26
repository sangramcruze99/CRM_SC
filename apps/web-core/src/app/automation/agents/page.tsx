'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bot,
  Plus,
  Cpu,
  Activity,
  Search,
  Wrench,
  ArrowUpRight,
  Network,
} from 'lucide-react';

interface AgentCard {
  id: string;
  name: string;
  role: string;
  description: string;
  model: string;
  autonomyLevel: 'FULL_AUTONOMOUS' | 'HITL_SUPERVISED' | 'READ_ONLY';
  activeToolsCount: number;
  channels: string[];
  executionCount: number;
  successRate: number;
  isActive: boolean;
  category: 'SALES' | 'SUPPORT' | 'VOICE' | 'RECRUITMENT' | 'ECOMMERCE' | 'CONTENT' | 'BROWSER';
}

const INITIAL_AGENTS: AgentCard[] = [
  {
    id: 'agent-sales-outbound',
    name: 'Apex SDR Outbound Agent',
    role: 'Autonomous B2B Sales Representative',
    description: 'Enriches inbound leads, verifies ICP qualification, generates hyper-personalized outreach across Email & WhatsApp, and books demos.',
    model: 'groq/gemma2-9b-it',
    autonomyLevel: 'HITL_SUPERVISED',
    activeToolsCount: 7,
    channels: ['Email', 'WhatsApp', 'Calendar'],
    executionCount: 428,
    successRate: 98.6,
    isActive: true,
    category: 'SALES',
  },
  {
    id: 'agent-whatsapp-support',
    name: 'WhatsApp Support Sentinel',
    role: 'Customer Success & Triage Assistant',
    description: 'Handles 24/7 customer inquiries via WhatsApp Cloud API, retrieves answers from RAG Knowledge Vault, and escalates frustrated users.',
    model: 'groq/llama-3.3-70b-versatile',
    autonomyLevel: 'FULL_AUTONOMOUS',
    activeToolsCount: 5,
    channels: ['WhatsApp', 'CRM', 'Knowledge'],
    executionCount: 1240,
    successRate: 99.2,
    isActive: true,
    category: 'SUPPORT',
  },
  {
    id: 'agent-voice-reception',
    name: 'Aria Telephony Receptionist',
    role: 'Voice Softphone Conversational AI',
    description: 'Answers telephone calls with 320ms latency, handles business FAQs, qualifies callers, and transfers VIPs to account executives.',
    model: 'cartesia/sonic-multilingual',
    autonomyLevel: 'FULL_AUTONOMOUS',
    activeToolsCount: 3,
    channels: ['Twilio Voice', 'Calendar'],
    executionCount: 310,
    successRate: 97.4,
    isActive: true,
    category: 'VOICE',
  },
  {
    id: 'agent-hr-screening',
    name: 'Talent Scout Recruiter',
    role: 'Resume OCR & Candidate Screener',
    description: 'Ingests resumes, extracts structured skill matrices via OCR vision, scores against job descriptions, and dispatches screening tests.',
    model: 'groq/llama-3.3-70b-versatile',
    autonomyLevel: 'HITL_SUPERVISED',
    activeToolsCount: 6,
    channels: ['Email', 'Documents', 'Calendar'],
    executionCount: 520,
    successRate: 99.1,
    isActive: true,
    category: 'RECRUITMENT',
  },
  {
    id: 'agent-finance-reconciler',
    name: 'Khata Sentinel Auditor',
    role: 'Dual Khata & Invoice Autonomous Auditor',
    description: 'Scans vendor bills, verifies 3-way matching against purchase orders, and flags invoice discrepancies before payment approval.',
    model: 'groq/gemma2-9b-it',
    autonomyLevel: 'HITL_SUPERVISED',
    activeToolsCount: 4,
    channels: ['Documents', 'Dual Khata'],
    executionCount: 890,
    successRate: 99.8,
    isActive: true,
    category: 'SALES',
  },
  {
    id: 'agent-browser-crawler',
    name: 'Argus Market Intelligence Crawler',
    role: 'Autonomous Headless Web Extractor',
    description: 'Navigates competitor portals and public price catalogs using headless Playwright browsers to log market pricing intelligence.',
    model: 'groq/llama-3.3-70b-versatile',
    autonomyLevel: 'FULL_AUTONOMOUS',
    activeToolsCount: 4,
    channels: ['Playwright', 'CRM'],
    executionCount: 184,
    successRate: 96.2,
    isActive: true,
    category: 'BROWSER',
  },
];

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentCard[]>(INITIAL_AGENTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newAgentName, setNewAgentName] = useState<string>('');
  const [newAgentRole, setNewAgentRole] = useState<string>('');

  useEffect(() => {
    async function loadAgents() {
      try {
        const res = await fetch('/api/ai/agents');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped: AgentCard[] = data.map((d: any) => {
              let parsedToolsCount = 4;
              if (Array.isArray(d.tools)) {
                parsedToolsCount = d.tools.length;
              } else if (typeof d.tools === 'string') {
                try {
                  const p = JSON.parse(d.tools);
                  if (Array.isArray(p)) parsedToolsCount = p.length;
                } catch {}
              }

              return {
                id: d.id,
                name: d.name || 'Autonomous Agent',
                role: d.role || 'Specialized Agent',
                description: d.description || d.systemPrompt || 'Autonomous business agent with enterprise tools and ReAct reasoning.',
                model: d.model || (d.modelProvider && d.modelName ? `${d.modelProvider}/${d.modelName}` : 'groq/gemma2-9b-it'),
                autonomyLevel: d.autonomyLevel || 'HITL_SUPERVISED',
                activeToolsCount: parsedToolsCount,
                channels: Array.isArray(d.channels) && d.channels.length > 0 ? d.channels : ['Email', 'CRM'],
                executionCount: d.executionCount || 0,
                successRate: d.successRate || 100.0,
                isActive: d.isActive ?? true,
                category: (d.category as any) || 'SALES',
              };
            });
            setAgents((prev) => {
              const existingIds = new Set(mapped.map((m) => m.id));
              const nonDuplicatePrev = prev.filter((p) => !existingIds.has(p.id));
              return [...mapped, ...nonDuplicatePrev];
            });
          }
        }
      } catch {
        // Fallback to seed agents
      }
    }
    loadAgents();
  }, []);

  const filteredAgents = agents.filter((a) => {
    const matchesCat = selectedCategory === 'ALL' || a.category === selectedCategory;
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCreateAgent = () => {
    if (!newAgentName.trim()) return;
    const created: AgentCard = {
      id: `agent-${Date.now().toString(36)}`,
      name: newAgentName,
      role: newAgentRole || 'Custom Autonomous Specialist',
      description: 'Custom autonomous agent configured with enterprise tool access and ReAct reasoning loop.',
      model: 'groq/gemma2-9b-it',
      autonomyLevel: 'HITL_SUPERVISED',
      activeToolsCount: 4,
      channels: ['Email', 'CRM'],
      executionCount: 0,
      successRate: 100.0,
      isActive: true,
      category: 'SALES',
    };
    setAgents([created, ...agents]);
    setShowCreateModal(false);
    setNewAgentName('');
    setNewAgentRole('');
  };

  return (
    <div className="space-y-6 text-white font-sans">
      {/* Top Header Cockpit Chassis */}
      <div className="botanical-glass-card rounded-3xl p-6 md:p-8 border border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        {/* Autonomous Sentinel Pulse Status Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/[0.06] text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-bold tracking-wider uppercase">Agent Swarm Bus Active</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">ReAct Autonomous Loop</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[11px]">
              vault/automation/agents/
            </span>
            <span className="text-zinc-500">|</span>
            <span className="text-emerald-400 font-semibold">{agents.length} Agents Configured</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                STAGE 5.0 AUTONOMOUS AGENT FLEET
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
                DETERMINISTIC TOOLS &amp; RAG
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Bot className="text-emerald-400" size={30} />
              AI Agent Swarms &amp; Autonomous Runtimes
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 max-w-3xl leading-relaxed">
              Build, inspect, and supervise specialized business agents capable of multi-step reasoning, real tool execution, and tenant boundary governance.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <Link
              href="/automation/agents/tree"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] text-xs font-mono font-bold transition cursor-pointer"
            >
              <Network className="w-3.5 h-3.5 text-emerald-400" />
              <span>Swarm Tree Chart</span>
            </Link>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs transition shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-zinc-950" />
              <span>New AI Agent</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl botanical-glass-card border border-white/[0.08]">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none py-1">
          {['ALL', 'SALES', 'SUPPORT', 'VOICE', 'RECRUITMENT', 'ECOMMERCE', 'CONTENT', 'BROWSER'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                  : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search agents by role, name, tool..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/[0.08] rounded-xl pl-9 pr-3 py-1.5 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAgents.map((agent) => (
          <div
            key={agent.id}
            className="rounded-2xl botanical-glass-card border border-white/[0.08] p-5 flex flex-col justify-between hover:border-emerald-500/40 transition group relative overflow-hidden"
          >
            <div className="space-y-3">
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight group-hover:text-emerald-300 transition-colors">
                      {agent.name}
                    </h3>
                    <span className="text-[11px] font-mono text-emerald-400/80 block mt-0.5">{agent.role}</span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                    agent.autonomyLevel === 'FULL_AUTONOMOUS'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {agent.autonomyLevel === 'FULL_AUTONOMOUS' ? 'Autonomous' : 'HITL Supervised'}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">{agent.description}</p>

              {/* Model & Stats */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5 text-[11px] font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 flex items-center space-x-1.5">
                    <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                    <span>LLM Model</span>
                  </span>
                  <span className="text-zinc-300 truncate max-w-[140px]">
                    {((agent.model || 'groq/gemma2-9b-it').split('/')[1] || agent.model || 'gemma2-9b-it')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 flex items-center space-x-1.5">
                    <Wrench className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Live Tools</span>
                  </span>
                  <span className="font-bold text-zinc-300">{agent.activeToolsCount || 4} Registered Tools</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 flex items-center space-x-1.5">
                    <Activity className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Executions</span>
                  </span>
                  <span className="font-bold text-emerald-400">{agent.executionCount || 0} runs ({agent.successRate || 100}%)</span>
                </div>
              </div>

              {/* Channels Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(agent.channels || ['Email', 'CRM']).map((ch) => (
                  <span
                    key={ch}
                    className="px-2 py-0.5 rounded-md text-[10px] bg-white/[0.04] text-zinc-400 border border-white/[0.06] font-mono"
                  >
                    {ch}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <Link
                href={`/automation/agents/${agent.id}`}
                className="inline-flex items-center space-x-1.5 text-xs font-mono font-semibold text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
              >
                <span>Agent Control Studio</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href={`/automation/agents/${agent.id}?tab=playground`}
                className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 text-[11px] font-mono transition cursor-pointer"
              >
                Test Chat
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Agent Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="botanical-glass-card border border-white/[0.12] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Bot className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">Create Autonomous AI Agent</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-mono font-medium">Agent Name</label>
                <input
                  type="text"
                  placeholder="e.g. Inbound Sales SDR, Billing Dispute Resolver"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  className="w-full bg-black/40 border border-white/[0.08] rounded-xl p-2.5 text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-mono font-medium">Operational Role / Persona</label>
                <input
                  type="text"
                  placeholder="e.g. Autonomous Lead Qualification Specialist"
                  value={newAgentRole}
                  onChange={(e) => setNewAgentRole(e.target.value)}
                  className="w-full bg-black/40 border border-white/[0.08] rounded-xl p-2.5 text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-300 text-[11px] font-mono leading-relaxed">
                New agents inherit the default ReAct reasoning loop, Groq Gemma 2 9B high-throughput inference, and standard CRM tool registry access.
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-zinc-400 hover:text-white text-xs font-mono transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAgent}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs transition cursor-pointer shadow-md shadow-emerald-500/20"
              >
                Deploy Agent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
