'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bot,
  Plus,
  Play,
  Settings,
  Cpu,
  ShieldCheck,
  Zap,
  Activity,
  MessageSquare,
  Phone,
  Search,
  CheckCircle2,
  Sparkles,
  Layers,
  Wrench,
  Globe,
  ArrowUpRight,
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
    model: 'groq/llama-3.3-70b-versatile',
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
    model: 'openrouter/anthropic/claude-3.5-sonnet',
    autonomyLevel: 'FULL_AUTONOMOUS',
    activeToolsCount: 5,
    channels: ['WhatsApp'],
    executionCount: 1290,
    successRate: 99.4,
    isActive: true,
    category: 'SUPPORT',
  },
  {
    id: 'agent-voice-receptionist',
    name: 'AI Voice Receptionist & Qualifier',
    role: 'Real-time Phone Operator',
    description: 'Answers inbound calls through WebRTC/Twilio, conducts real-time speech qualification, captures caller intent, and schedules callback slots.',
    model: 'groq/llama-3.1-8b-instant',
    autonomyLevel: 'FULL_AUTONOMOUS',
    activeToolsCount: 4,
    channels: ['Voice Softphone'],
    executionCount: 312,
    successRate: 97.2,
    isActive: true,
    category: 'VOICE',
  },
  {
    id: 'agent-recruitment-screener',
    name: 'Talent Scout Screener',
    role: 'Recruitment & Candidate Matcher',
    description: 'Ingests inbound resumes, parses skills & experience via IDP, evaluates fit against active job specs, and updates HR candidate profiles.',
    model: 'groq/llama-3.3-70b-versatile',
    autonomyLevel: 'HITL_SUPERVISED',
    activeToolsCount: 4,
    channels: ['HR Portal', 'Email'],
    executionCount: 164,
    successRate: 100.0,
    isActive: true,
    category: 'RECRUITMENT',
  },
  {
    id: 'agent-ecommerce-guard',
    name: 'Shopify Inventory & Cart Recoverer',
    role: 'Autonomous E-Commerce Operator',
    description: 'Monitors real-time order streams, handles abandoned cart recovery sequences via WhatsApp, and flags low-stock anomalies.',
    model: 'groq/llama-3.1-8b-instant',
    autonomyLevel: 'FULL_AUTONOMOUS',
    activeToolsCount: 6,
    channels: ['Shopify', 'WhatsApp', 'Email'],
    executionCount: 580,
    successRate: 99.1,
    isActive: true,
    category: 'ECOMMERCE',
  },
  {
    id: 'agent-content-loop',
    name: 'Continuous Content Strategist',
    role: 'Autonomous Content Marketer',
    description: 'Analyzes engagement metrics from published social posts, identifies high-resonance topics, and synthesizes high-performing variations.',
    model: 'openrouter/meta-llama/llama-3.3-70b-instruct',
    autonomyLevel: 'HITL_SUPERVISED',
    activeToolsCount: 5,
    channels: ['LinkedIn', 'Twitter/X', 'Blog'],
    executionCount: 92,
    successRate: 100.0,
    isActive: true,
    category: 'CONTENT',
  },
  {
    id: 'agent-browser-scout',
    name: 'Sandboxed Web Extractor',
    role: 'Autonomous Browser Agent',
    description: 'Navigates external portals without public APIs, downloads supplier compliance docs, and extracts unstructured HTML data.',
    model: 'openrouter/openai/gpt-4o-mini',
    autonomyLevel: 'HITL_SUPERVISED',
    activeToolsCount: 3,
    channels: ['Headless Chromium'],
    executionCount: 75,
    successRate: 96.0,
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
                model: d.model || (d.modelProvider && d.modelName ? `${d.modelProvider}/${d.modelName}` : 'groq/llama-3.3-70b-versatile'),
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
      model: 'groq/llama-3.3-70b-versatile',
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white tracking-tight">AI Agent Swarms & Autonomous Runtimes</h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ReAct Engine
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Build, inspect, and supervise specialized business agents capable of multi-step reasoning and real tool execution
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/25"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>New AI Agent</span>
        </button>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/50 border border-white/10">
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'SALES', 'SUPPORT', 'VOICE', 'RECRUITMENT', 'ECOMMERCE', 'CONTENT', 'BROWSER'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search agents by role, name, tool..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAgents.map((agent) => (
          <div
            key={agent.id}
            className="rounded-xl bg-slate-900/60 border border-white/10 p-5 flex flex-col justify-between hover:border-emerald-500/40 hover:bg-slate-900/80 transition group"
          >
            <div className="space-y-3">
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight group-hover:text-emerald-300 transition-colors">
                      {agent.name}
                    </h3>
                    <span className="text-[11px] font-medium text-emerald-400/80 block mt-0.5">{agent.role}</span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    agent.autonomyLevel === 'FULL_AUTONOMOUS'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {agent.autonomyLevel === 'FULL_AUTONOMOUS' ? 'Autonomous' : 'HITL Supervised'}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{agent.description}</p>

              {/* Model & Stats */}
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-white/5 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Cpu className="w-3.5 h-3.5 text-slate-500" />
                    <span>LLM Model</span>
                  </span>
                  <span className="font-mono text-slate-200 truncate max-w-[140px]">
                    {((agent.model || 'groq/llama-3.3').split('/')[1] || agent.model || 'llama-3.3')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Wrench className="w-3.5 h-3.5 text-slate-500" />
                    <span>Live Tools</span>
                  </span>
                  <span className="font-bold text-slate-200">{agent.activeToolsCount || 4} Registered Tools</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Activity className="w-3.5 h-3.5 text-slate-500" />
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
                    className="px-2 py-0.5 rounded-md text-[10px] bg-white/5 text-slate-400 border border-white/5 font-medium"
                  >
                    {ch}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
              <Link
                href={`/automation/agents/${agent.id}`}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
              >
                <span>Agent Control Studio</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href={`/automation/agents/${agent.id}?tab=playground`}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition"
              >
                Test Chat
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Agent Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Create Autonomous AI Agent</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Agent Name</label>
                <input
                  type="text"
                  placeholder="e.g. Inbound Sales SDR, Billing Dispute Resolver"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Operational Role / Persona</label>
                <input
                  type="text"
                  placeholder="e.g. Autonomous Lead Qualification Specialist"
                  value={newAgentRole}
                  onChange={(e) => setNewAgentRole(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-300 text-[11px] leading-relaxed">
                New agents inherit the default ReAct reasoning loop, Groq Llama 3.3 high-throughput inference, and standard CRM tool registry access.
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAgent}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
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
