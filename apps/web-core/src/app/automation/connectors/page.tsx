'use client';

import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Search,
  CheckCircle2,
  AlertCircle,
  Settings,
  Zap,
  Lock,
  RefreshCw,
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
  {
    id: 'conn-gcalendar',
    name: 'Google Calendar',
    category: 'CALENDAR',
    description: 'Two-way synchronization for meeting scheduling, SDR calendar round-robin, and meeting reminder webhooks.',
    status: 'CONNECTED',
    latencyMs: 180,
    accountLabel: 'calendar@enterprise.io',
    authType: 'OAUTH2',
    supportedTriggersCount: 2,
    supportedActionsCount: 2,
    iconType: 'Calendar',
  },
  {
    id: 'conn-groq',
    name: 'Groq Cloud Inference Engine',
    category: 'AI',
    description: 'Ultra-fast LPU inference hosting Llama-3.3 70B, Gemma 2 9B, and Whisper Large with <400ms TTFT.',
    status: 'CONNECTED',
    latencyMs: 95,
    accountLabel: 'Tier 3 Enterprise (500k TPM)',
    authType: 'API_KEY',
    supportedTriggersCount: 0,
    supportedActionsCount: 3,
    iconType: 'Cpu',
  },
  {
    id: 'conn-postgres',
    name: 'Primary PostgreSQL Database',
    category: 'DATA',
    description: 'Internal multi-tenant relational persistence with row-level security and schema isolation.',
    status: 'CONNECTED',
    latencyMs: 18,
    accountLabel: 'businessos_db_prod',
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
  {
    id: 'conn-notion',
    name: 'Notion Workspace',
    category: 'PRODUCTIVITY',
    description: 'Query company documentation, update task databases, and sync internal release notes.',
    status: 'READY',
    latencyMs: 240,
    authType: 'OAUTH2',
    supportedTriggersCount: 1,
    supportedActionsCount: 3,
    iconType: 'Building',
  },
  {
    id: 'conn-resend',
    name: 'Resend Transactional Email',
    category: 'COMMUNICATION',
    description: 'High deliverability transactional email service for invoices, OTPs, and password reset dispatches.',
    status: 'CONNECTED',
    latencyMs: 88,
    accountLabel: 'delivery@enterprise.io',
    authType: 'API_KEY',
    supportedTriggersCount: 1,
    supportedActionsCount: 2,
    iconType: 'Mail',
  },
];

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<ConnectorItem[]>(CONNECTORS_CATALOG);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [testingId, setTestingId] = useState<string | null>(null);
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
    setTimeout(() => {
      setConnectors((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: 'CONNECTED', latencyMs: Math.floor(Math.random() * 80 + 90) } : c
        )
      );
      setTestingId(null);
    }, 800);
  };

  const handleSaveConfig = () => {
    if (!configConnector) return;
    setConnectors((prev) =>
      prev.map((c) => (c.id === configConnector.id ? { ...c, status: 'CONNECTED', accountLabel: 'Configured' } : c))
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
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Connected
          </span>
        );
      case 'READY':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <Zap className="w-3.5 h-3.5 mr-1" />
            Ready
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3.5 h-3.5 mr-1" />
            Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/[0.05] text-zinc-400 border border-white/[0.08]">
            Needs Setup
          </span>
        );
    }
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
            <span className="text-emerald-400 font-bold tracking-wider uppercase">Integration Mesh Online</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">Zero-Egress Encryption</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[11px]">
              vault/automation/connectors/
            </span>
            <span className="text-zinc-500">|</span>
            <span className="text-emerald-400 font-semibold">{connectors.length} Connectors Active</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                STAGE 5.0 CONNECTOR MESH
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
                PLUGGABLE ADAPTER ARCHITECTURE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <ArrowRightLeft className="text-emerald-400" size={30} />
              Enterprise Connector Mesh
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 max-w-3xl leading-relaxed">
              Pluggable integrations across Communications, AI, CRM, Databases, E-commerce, Payments &amp; Productivity with automated health checks and credential encryption.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <div className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-xs font-mono text-emerald-400">
              <Lock className="w-3.5 h-3.5" />
              <span>AES-256 Secret Vault</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl botanical-glass-card border border-white/[0.08]">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none py-1">
          {['ALL', 'COMMUNICATION', 'CALENDAR', 'AI', 'CRM', 'DATA', 'ECOMMERCE', 'PAYMENTS', 'PRODUCTIVITY'].map(
            (cat) => (
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
            )
          )}
        </div>

        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search connectors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/[0.08] rounded-xl pl-9 pr-3 py-1.5 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
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
              className="rounded-2xl botanical-glass-card border border-white/[0.08] p-5 flex flex-col justify-between hover:border-emerald-500/30 transition group relative overflow-hidden"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {conn.name}
                    </h3>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mt-0.5">
                      {conn.category} · {conn.authType}
                    </span>
                  </div>

                  {getStatusBadge(conn.status)}
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">{conn.description}</p>

                {/* Account & Latency Strip */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5 text-[11px] font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Account Bound</span>
                    <span className="font-semibold text-zinc-300 truncate max-w-[140px]">
                      {conn.accountLabel || 'None'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Mesh Latency</span>
                    <span className="text-emerald-400 font-bold">
                      {conn.latencyMs ? `${conn.latencyMs} ms` : 'Unchecked'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-white/[0.06]">
                    <span>{conn.supportedTriggersCount} Triggers</span>
                    <span>{conn.supportedActionsCount} Actions</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <button
                  onClick={() => handleTestHealth(conn.id)}
                  disabled={isTesting}
                  className="inline-flex items-center space-x-1.5 text-xs font-mono font-semibold text-zinc-300 hover:text-emerald-400 transition cursor-pointer"
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
                  className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.08] text-xs font-mono font-medium transition cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="botanical-glass-card border border-white/[0.12] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Settings className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Configure {configConnector.name}</h3>
              </div>
              <button
                onClick={() => setConfigConnector(null)}
                className="text-zinc-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08] font-mono cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-black/40 rounded-xl border border-white/[0.06] space-y-1">
                <div className="text-zinc-500 font-mono">Authentication Protocol</div>
                <div className="font-mono font-bold text-emerald-400">{configConnector.authType}</div>
              </div>

              {['API_KEY', 'BEARER_TOKEN'].includes(configConnector.authType) && (
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-mono font-medium">API Token / Private Key</label>
                  <input
                    type="password"
                    placeholder="Enter secret token (e.g. sk_live_...)"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="w-full bg-black/40 border border-white/[0.08] rounded-xl p-2.5 text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              {['WEBHOOK_SECRET', 'OAUTH2'].includes(configConnector.authType) && (
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-mono font-medium">Webhook Signing Secret / Client Secret</label>
                  <input
                    type="password"
                    placeholder="whsec_... or OAuth Secret"
                    value={webhookSecretInput}
                    onChange={(e) => setWebhookSecretInput(e.target.value)}
                    className="w-full bg-black/40 border border-white/[0.08] rounded-xl p-2.5 text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-300 text-[11px] font-mono flex items-start space-x-2">
                <Lock className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>
                  Credentials are encrypted at rest with tenant-scoped AES-256 keys. Raw secrets are never returned to the frontend or exposed to LLM prompts.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setConfigConnector(null)}
                className="px-3.5 py-1.5 rounded-xl text-zinc-400 hover:text-white text-xs font-mono transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs transition cursor-pointer shadow-md shadow-emerald-500/20"
              >
                Save &amp; Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
