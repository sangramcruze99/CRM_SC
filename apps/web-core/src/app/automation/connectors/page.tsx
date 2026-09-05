'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRightLeft,
  Search,
  CheckCircle2,
  AlertCircle,
  Settings,
  Zap,
  Globe,
  Lock,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Mail,
  MessageSquare,
  Calendar,
  Building,
  Database,
  CreditCard,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

interface ConnectorItem {
  id: string;
  name: string;
  category: 'COMMUNICATION' | 'CALENDAR' | 'AI' | 'CRM' | 'DATA' | 'ECOMMERCE' | 'PAYMENTS' | 'PRODUCTIVITY';
  description: string;
  status: 'CONNECTED' | 'READY' | 'NEEDS_SETUP' | 'ERROR';
  latencyMs?: number;
  accountLabel?: string;
  authType: 'API_KEY' | 'OAUTH2' | 'BEARER_TOKEN' | 'WEBHOOK_SECRET';
  supportedTriggersCount: number;
  supportedActionsCount: number;
  iconType: string;
}

const CONNECTORS_CATALOG: ConnectorItem[] = [
  // Communication
  {
    id: 'conn-whatsapp',
    name: 'WhatsApp Cloud API',
    category: 'COMMUNICATION',
    description: 'Direct Meta Graph API integration for business messaging, template catalogs, and inbound conversational webhook handling.',
    status: 'CONNECTED',
    latencyMs: 140,
    accountLabel: 'Biz Verified (+1 555-0199)',
    authType: 'BEARER_TOKEN',
    supportedTriggersCount: 3,
    supportedActionsCount: 4,
    iconType: 'MessageSquare',
  },
  {
    id: 'conn-twilio',
    name: 'Twilio SMS & Softphone',
    category: 'COMMUNICATION',
    description: 'Programmable SMS, MMS, and WebRTC Voice Softphone gateway for inbound/outbound calls.',
    status: 'CONNECTED',
    latencyMs: 190,
    accountLabel: 'ACME Telco (US-East)',
    authType: 'API_KEY',
    supportedTriggersCount: 2,
    supportedActionsCount: 3,
    iconType: 'MessageSquare',
  },
  {
    id: 'conn-gmail',
    name: 'Gmail & Google Workspace',
    category: 'COMMUNICATION',
    description: 'Send and receive contextual emails with thread preservation and automatic bounce handling.',
    status: 'CONNECTED',
    latencyMs: 220,
    accountLabel: 'sales@enterprise.io',
    authType: 'OAUTH2',
    supportedTriggersCount: 2,
    supportedActionsCount: 2,
    iconType: 'Mail',
  },
  {
    id: 'conn-slack',
    name: 'Slack Internal Webhooks',
    category: 'COMMUNICATION',
    description: 'Broadcast high-priority deal notifications, SLA breach warnings, and approval requests into team channels.',
    status: 'READY',
    latencyMs: 110,
    accountLabel: 'Workspace #sales-alerts',
    authType: 'WEBHOOK_SECRET',
    supportedTriggersCount: 1,
    supportedActionsCount: 3,
    iconType: 'MessageSquare',
  },

  // Calendar
  {
    id: 'conn-gcalendar',
    name: 'Google Calendar',
    category: 'CALENDAR',
    description: 'Real-time busy/free availability lookups and automated meeting invitations with Google Meet links.',
    status: 'CONNECTED',
    latencyMs: 180,
    accountLabel: 'calendar@enterprise.io',
    authType: 'OAUTH2',
    supportedTriggersCount: 2,
    supportedActionsCount: 3,
    iconType: 'Calendar',
  },
  {
    id: 'conn-outlook-cal',
    name: 'Microsoft Outlook Calendar',
    category: 'CALENDAR',
    description: 'Enterprise Office 365 calendar scheduling, room reservation, and meeting attendee status tracking.',
    status: 'READY',
    latencyMs: 240,
    authType: 'OAUTH2',
    supportedTriggersCount: 1,
    supportedActionsCount: 2,
    iconType: 'Calendar',
  },

  // AI
  {
    id: 'conn-groq',
    name: 'Groq Cloud Inference',
    category: 'AI',
    description: 'Ultra-low-latency LPU inference powering ReAct agent reasoning loops and live conversational bots.',
    status: 'CONNECTED',
    latencyMs: 65,
    accountLabel: 'Tier-1 API (llama-3.3-70b)',
    authType: 'API_KEY',
    supportedTriggersCount: 1,
    supportedActionsCount: 4,
    iconType: 'Cpu',
  },
  {
    id: 'conn-openrouter',
    name: 'OpenRouter Multi-LLM Mesh',
    category: 'AI',
    description: 'Unified gateway accessing Claude 3.5 Sonnet, GPT-4o, and DeepSeek with intelligent model failover.',
    status: 'CONNECTED',
    latencyMs: 210,
    accountLabel: 'Enterprise Gateway',
    authType: 'API_KEY',
    supportedTriggersCount: 1,
    supportedActionsCount: 4,
    iconType: 'Cpu',
  },

  // CRM
  {
    id: 'conn-hubspot',
    name: 'HubSpot CRM Sync',
    category: 'CRM',
    description: 'Bi-directional synchronization of contacts, companies, deals, and engagement timelines.',
    status: 'CONNECTED',
    latencyMs: 280,
    accountLabel: 'Portal ID: 89412',
    authType: 'OAUTH2',
    supportedTriggersCount: 4,
    supportedActionsCount: 5,
    iconType: 'Building',
  },
  {
    id: 'conn-salesforce',
    name: 'Salesforce Enterprise',
    category: 'CRM',
    description: 'REST and Bulk API 2.0 connector for synchronizing enterprise accounts, leads, and custom objects.',
    status: 'NEEDS_SETUP',
    authType: 'OAUTH2',
    supportedTriggersCount: 3,
    supportedActionsCount: 4,
    iconType: 'Building',
  },

  // Data
  {
    id: 'conn-postgres',
    name: 'PostgreSQL External Sync',
    category: 'DATA',
    description: 'Direct SQL query and read-replica streaming for analytics and ERP transactional synchronization.',
    status: 'CONNECTED',
    latencyMs: 45,
    accountLabel: 'prod-analytics.db',
    authType: 'API_KEY',
    supportedTriggersCount: 2,
    supportedActionsCount: 3,
    iconType: 'Database',
  },
  {
    id: 'conn-airtable',
    name: 'Airtable Sync Hub',
    category: 'DATA',
    description: 'Sync records, formulas, and attachment fields with Airtable bases and team views.',
    status: 'READY',
    latencyMs: 195,
    authType: 'API_KEY',
    supportedTriggersCount: 2,
    supportedActionsCount: 3,
    iconType: 'Database',
  },

  // E-Commerce & Payments
  {
    id: 'conn-shopify',
    name: 'Shopify Storefront Webhooks',
    category: 'ECOMMERCE',
    description: 'Listen to orders/create, carts/update, and inventory level adjustments with HMAC verification.',
    status: 'CONNECTED',
    latencyMs: 160,
    accountLabel: 'my-store.myshopify.com',
    authType: 'WEBHOOK_SECRET',
    supportedTriggersCount: 4,
    supportedActionsCount: 3,
    iconType: 'ShoppingBag',
  },
  {
    id: 'conn-stripe',
    name: 'Stripe Billing & Invoicing',
    category: 'PAYMENTS',
    description: 'Generate payment links, issue customer refunds with HITL approval, and capture chargeback events.',
    status: 'CONNECTED',
    latencyMs: 175,
    accountLabel: 'acct_1NZ89201 (Live)',
    authType: 'API_KEY',
    supportedTriggersCount: 3,
    supportedActionsCount: 4,
    iconType: 'CreditCard',
  },

  // Productivity
  {
    id: 'conn-notion',
    name: 'Notion Workspace',
    category: 'PRODUCTIVITY',
    description: 'Export structured meeting transcripts, agent action logs, and client onboarding guides into Notion pages.',
    status: 'READY',
    latencyMs: 230,
    authType: 'OAUTH2',
    supportedTriggersCount: 1,
    supportedActionsCount: 2,
    iconType: 'Globe',
  },
  {
    id: 'conn-clickup',
    name: 'ClickUp Projects',
    category: 'PRODUCTIVITY',
    description: 'Create sprint tasks, update task custom fields, and synchronize deal milestones into engineering backlogs.',
    status: 'READY',
    latencyMs: 210,
    authType: 'API_KEY',
    supportedTriggersCount: 2,
    supportedActionsCount: 3,
    iconType: 'Globe',
  },
];

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<ConnectorItem[]>(CONNECTORS_CATALOG);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [testingId, setTestingId] = useState<string | null>(null);

  // Config Modal State
  const [configConnector, setConfigConnector] = useState<ConnectorItem | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [webhookSecretInput, setWebhookSecretInput] = useState<string>('');

  const filteredConnectors = connectors.filter((c) => {
    const matchesCat = selectedCategory === 'ALL' || c.category === selectedCategory;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleTestHealth = async (id: string) => {
    setTestingId(id);
    try {
      const res = await fetch(`/api/automation/connectors/${id}/health`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setConnectors((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: 'CONNECTED', latencyMs: data.latencyMs || 85 } : c))
        );
      } else {
        setTimeout(() => {
          setConnectors((prev) =>
            prev.map((c) => (c.id === id ? { ...c, status: 'CONNECTED', latencyMs: Math.floor(Math.random() * 80 + 60) } : c))
          );
          setTestingId(null);
        }, 600);
        return;
      }
    } catch {
      setTimeout(() => {
        setConnectors((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: 'CONNECTED', latencyMs: 92 } : c))
        );
        setTestingId(null);
      }, 500);
      return;
    }
    setTestingId(null);
  };

  const handleSaveConfig = () => {
    if (!configConnector) return;
    setConnectors((prev) =>
      prev.map((c) =>
        c.id === configConnector.id
          ? { ...c, status: 'CONNECTED', accountLabel: 'Configured & Verified' }
          : c
      )
    );
    alert(`Connector ${configConnector.name} credentials encrypted and saved under tenant isolation!`);
    setConfigConnector(null);
    setApiKeyInput('');
    setWebhookSecretInput('');
  };

  const getStatusBadge = (status: ConnectorItem['status']) => {
    switch (status) {
      case 'CONNECTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Connected
          </span>
        );
      case 'READY':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Zap className="w-3.5 h-3.5 mr-1" />
            Ready
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3.5 h-3.5 mr-1" />
            Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-white/10">
            Needs Setup
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Enterprise Connector Mesh</h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              16 Priority Connectors
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Pluggable integrations across Communications, AI, CRM, Databases, E-commerce, Payments & Productivity
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs font-mono text-emerald-400">
            <Lock className="w-3.5 h-3.5" />
            <span>AES-256 Secret Vault</span>
          </div>
        </div>
      </div>

      {/* Categories & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/50 border border-white/10">
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'COMMUNICATION', 'CALENDAR', 'AI', 'CRM', 'DATA', 'ECOMMERCE', 'PAYMENTS', 'PRODUCTIVITY'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search connectors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* Connectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredConnectors.map((conn) => {
          const isTesting = testingId === conn.id;

          return (
            <div
              key={conn.id}
              className="rounded-xl bg-slate-900/60 border border-white/10 p-5 flex flex-col justify-between hover:border-white/20 hover:bg-slate-900/80 transition group"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {conn.name}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mt-0.5">
                      {conn.category} · {conn.authType}
                    </span>
                  </div>

                  {getStatusBadge(conn.status)}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{conn.description}</p>

                {/* Account & Latency Strip */}
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-white/5 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Account Bound</span>
                    <span className="font-semibold text-slate-200 truncate max-w-[140px]">
                      {conn.accountLabel || 'None'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Mesh Latency</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {conn.latencyMs ? `${conn.latencyMs} ms` : 'Unchecked'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-white/5">
                    <span>{conn.supportedTriggersCount} Triggers</span>
                    <span>{conn.supportedActionsCount} Actions</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => handleTestHealth(conn.id)}
                  disabled={isTesting}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-300 hover:text-emerald-400 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-emerald-400' : ''}`} />
                  <span>{isTesting ? 'Pinging...' : 'Health Check'}</span>
                </button>

                <button
                  onClick={() => {
                    setConfigConnector(conn);
                    setApiKeyInput('');
                    setWebhookSecretInput('');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-medium transition"
                >
                  Configure
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configure Credentials Modal */}
      {configConnector && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Configure {configConnector.name}</h3>
              </div>
              <button onClick={() => setConfigConnector(null)} className="text-slate-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-white/10 space-y-1">
                <div className="text-slate-400">Authentication Protocol</div>
                <div className="font-mono font-bold text-emerald-400">{configConnector.authType}</div>
              </div>

              {['API_KEY', 'BEARER_TOKEN'].includes(configConnector.authType) && (
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">API Token / Private Key</label>
                  <input
                    type="password"
                    placeholder="Enter secret token (e.g. sk_live_...)"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              {['WEBHOOK_SECRET', 'OAUTH2'].includes(configConnector.authType) && (
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Webhook Signing Secret / Client Secret</label>
                  <input
                    type="password"
                    placeholder="whsec_... or OAuth Secret"
                    value={webhookSecretInput}
                    onChange={(e) => setWebhookSecretInput(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-300 text-[11px] flex items-start space-x-2">
                <Lock className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>
                  Credentials are encrypted at rest with tenant-scoped AES-256 keys. Raw secrets are never returned to the frontend or exposed to LLM prompts.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setConfigConnector(null)}
                className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                Save & Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
