'use client';

import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Sparkles,
  Database,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sliders,
  Layers,
  Activity,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  Table,
  Check,
  RefreshCw,
  Clock,
  ShieldCheck,
  Filter,
} from 'lucide-react';

interface StackConnector {
  id: string;
  name: string;
  category: 'PAYMENTS' | 'E_COMMERCE' | 'NO_CODE_DB' | 'TEAM_CHAT' | 'CRM_LEADS';
  icon: any;
  status: 'CONNECTED' | 'SYNCING' | 'ERROR';
  syncMode: 'REALTIME_WEBHOOK' | 'SCHEDULED_5MIN' | 'BIDIRECTIONAL';
  latency: string;
  recordsSyncedToday: number;
  lastSyncTime: string;
}

interface SyncFieldMapping {
  id: string;
  sourceStack: string;
  sourceField: string;
  destinationStack: string;
  destinationField: string;
  transformRule: string;
  status: 'ACTIVE' | 'PAUSED';
}

interface SyncEventLog {
  id: string;
  timestamp: string;
  source: string;
  destination: string;
  entity: string;
  action: 'CREATED' | 'UPDATED' | 'RECONCILED';
  details: string;
  status: 'SUCCESS' | 'FAILED';
}

const PRESET_CONNECTORS: StackConnector[] = [
  {
    id: 'conn_stripe',
    name: 'Stripe Billing & Payments',
    category: 'PAYMENTS',
    icon: CreditCard,
    status: 'CONNECTED',
    syncMode: 'REALTIME_WEBHOOK',
    latency: '85ms',
    recordsSyncedToday: 1420,
    lastSyncTime: 'Just now',
  },
  {
    id: 'conn_shopify',
    name: 'Shopify Store & Inventory',
    category: 'E_COMMERCE',
    icon: ShoppingBag,
    status: 'CONNECTED',
    syncMode: 'BIDIRECTIONAL',
    latency: '110ms',
    recordsSyncedToday: 890,
    lastSyncTime: '1 min ago',
  },
  {
    id: 'conn_airtable',
    name: 'Airtable Product Base',
    category: 'NO_CODE_DB',
    icon: Table,
    status: 'CONNECTED',
    syncMode: 'SCHEDULED_5MIN',
    latency: '140ms',
    recordsSyncedToday: 640,
    lastSyncTime: '3 mins ago',
  },
  {
    id: 'conn_slack',
    name: 'Slack Executive Channel',
    category: 'TEAM_CHAT',
    icon: MessageSquare,
    status: 'CONNECTED',
    syncMode: 'REALTIME_WEBHOOK',
    latency: '45ms',
    recordsSyncedToday: 310,
    lastSyncTime: 'Just now',
  },
  {
    id: 'conn_postgres',
    name: 'PostgreSQL Business OS DB',
    category: 'CRM_LEADS',
    icon: Database,
    status: 'CONNECTED',
    syncMode: 'BIDIRECTIONAL',
    latency: '12ms',
    recordsSyncedToday: 3260,
    lastSyncTime: 'Live',
  },
];

const PRESET_MAPPINGS: SyncFieldMapping[] = [
  {
    id: 'map_01',
    sourceStack: 'Stripe',
    sourceField: 'customer.email',
    destinationStack: 'Business OS CRM',
    destinationField: 'contacts.email',
    transformRule: 'Trim & Lowercase',
    status: 'ACTIVE',
  },
  {
    id: 'map_02',
    sourceStack: 'Stripe',
    sourceField: 'charge.amount_captured',
    destinationStack: 'Dual Khata Ledger',
    destinationField: 'transactions.credit_amount',
    transformRule: 'Parse Cents to USD Float (/100)',
    status: 'ACTIVE',
  },
  {
    id: 'map_03',
    sourceStack: 'Shopify',
    sourceField: 'inventory_level.available',
    destinationStack: 'Airtable & Price Books',
    destinationField: 'products.stock_quantity',
    transformRule: 'Bidirectional Number Cast',
    status: 'ACTIVE',
  },
  {
    id: 'map_04',
    sourceStack: 'Business OS CRM',
    sourceField: 'deals.status_changed(Won)',
    destinationStack: 'Slack #revenue-vip',
    destinationField: 'chat.post_message(Rich Card)',
    transformRule: 'Format Deal Won Alert Card',
    status: 'ACTIVE',
  },
];

const INITIAL_LOGS: SyncEventLog[] = [];

export function DataSyncClient() {
  const [connectors, setConnectors] = useState<StackConnector[]>(PRESET_CONNECTORS);
  const [mappings, setMappings] = useState<SyncFieldMapping[]>(PRESET_MAPPINGS);
  const [logs, setLogs] = useState<SyncEventLog[]>(INITIAL_LOGS);
  const [conflictPolicy, setConflictPolicy] = useState<'SOURCE_WINS' | 'TARGET_WINS' | 'LATEST_TIMESTAMP'>('LATEST_TIMESTAMP');
  const [isSyncing, setIsSyncing] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);

  const handleTriggerManualSync = () => {
    setIsSyncing(true);
    setAlert(' Executing bidirectional sync across Stripe, Shopify, Airtable, Slack, and Business OS...');

    setTimeout(() => {
      setIsSyncing(false);
      const newLog: SyncEventLog = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        source: 'Bidirectional Stack Engine',
        destination: 'All Connected Dashboards',
        entity: 'Global Inventory & Transaction Mesh',
        action: 'RECONCILED',
        details: 'Reconciled 184 records across 5 disparate software stacks with 0 conflict errors.',
        status: 'SUCCESS',
      };
      setLogs([newLog, ...logs]);
      setAlert(' Bidirectional Data Sync Complete! 184 records updated instantly across all team dashboards.');
      setTimeout(() => setAlert(null), 4500);
    }, 1600);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white font-sans">
      {/* Alert Banner */}
      {alert && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{alert}</span>
        </div>
      )}

      {/* Top Header Cockpit Chassis */}
      <div className="botanical-glass-card rounded-3xl p-6 md:p-8 border border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/[0.06] text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-bold tracking-wider uppercase">Stage 5.0 Integration Mesh</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">Bidirectional Multi-Stack Sync</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[11px]">
              mesh/connectors/active/
            </span>
            <span className="text-zinc-500">|</span>
            <span className="text-emerald-400 font-semibold">Conflict Rule: Auto-Reconcile</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                CROSS-SERVICE DATA MESH
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
                ZERO-COLLISION RECONCILIATION
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <ArrowRightLeft className="text-emerald-400" size={30} />
              Cross-Service Data Mesh & Stack Sync
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 max-w-3xl leading-relaxed">
              Eliminates software silos. Seamlessly syncs inventory, client statuses, and transaction metrics in real-time across Stripe, Shopify, Airtable, Slack, and your CRM without human data entry.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              type="button"
              disabled={isSyncing}
              onClick={handleTriggerManualSync}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs font-mono tracking-wider shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'SYNCING STACK MESH...' : 'SYNC ALL STACKS NOW'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Telemetry KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="botanical-glass-card rounded-2xl p-5 border border-white/[0.08] relative overflow-hidden space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-mono font-bold tracking-wider block">
            Records Synced Today
          </span>
          <div className="text-2xl font-black font-mono text-white">6,520</div>
          <span className="text-[10px] text-emerald-400 font-mono">↑ 18% vs yesterday</span>
        </div>

        <div className="botanical-glass-card rounded-2xl p-5 border border-white/[0.08] relative overflow-hidden space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-mono font-bold tracking-wider block">
            Sync Success Rate
          </span>
          <div className="text-2xl font-black font-mono text-emerald-400">99.98%</div>
          <span className="text-[10px] text-zinc-400 font-mono">0 Sync Collisions</span>
        </div>

        <div className="botanical-glass-card rounded-2xl p-5 border border-white/[0.08] relative overflow-hidden space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-mono font-bold tracking-wider block">
            Average Mesh Latency
          </span>
          <div className="text-2xl font-black font-mono text-emerald-400">62ms</div>
          <span className="text-[10px] text-emerald-400 font-mono">Sub-100ms Target</span>
        </div>

        <div className="botanical-glass-card rounded-2xl p-5 border border-white/[0.08] relative overflow-hidden space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-mono font-bold tracking-wider block">
            Active Stack Connectors
          </span>
          <div className="text-2xl font-black font-mono text-white">5 Live</div>
          <span className="text-[10px] text-zinc-400 font-mono">All Webhooks Healthy</span>
        </div>
      </div>

      {/* Connected Software Stacks Mesh Cards */}
      <div className="botanical-glass-card rounded-3xl p-6 md:p-8 border border-white/[0.08] relative overflow-hidden space-y-5">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Connected Enterprise Software Stack Grid
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400">Auto-Reconnection Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {connectors.map((conn) => {
            const IconComp = conn.icon;
            return (
              <div
                key={conn.id}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <IconComp size={16} />
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400" />
                </div>

                <div>
                  <h4 className="font-bold text-xs text-white leading-tight">{conn.name}</h4>
                  <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">{conn.syncMode}</span>
                </div>

                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                  <span>Latency: <strong className="text-white">{conn.latency}</strong></span>
                  <span className="text-emerald-400 font-bold">{conn.recordsSyncedToday} syncs</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Split: Left Field Mapping Editor, Right Real-Time Event Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Field Mapping Editor & Conflict Policies */}
        <div className="lg:col-span-7 space-y-6">
          <div className="botanical-glass-card rounded-3xl p-6 md:p-8 border border-white/[0.08] relative overflow-hidden space-y-5">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-emerald-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Bidirectional Schema & Field Mapping Rules
                </h3>
              </div>

              {/* Conflict Policy Selector */}
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-zinc-400 text-[10px] uppercase font-bold">Conflict Rule:</span>
                <select
                  value={conflictPolicy}
                  onChange={(e) => setConflictPolicy(e.target.value as any)}
                  className="px-2.5 py-1 bg-black/40 border border-white/[0.1] rounded-lg text-[11px] text-emerald-400 font-bold font-mono focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="LATEST_TIMESTAMP">Latest Timestamp Wins</option>
                  <option value="SOURCE_WINS">Source System Wins</option>
                  <option value="TARGET_WINS">CRM Ledger Wins</option>
                </select>
              </div>
            </div>

            {/* Mappings Table */}
            <div className="space-y-3">
              {mappings.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-mono flex-wrap">
                      <span className="font-bold text-emerald-400">{m.sourceStack}</span>
                      <span className="text-zinc-500">({m.sourceField})</span>
                      <ArrowRightLeft size={12} className="text-zinc-400" />
                      <span className="font-bold text-emerald-400">{m.destinationStack}</span>
                      <span className="text-zinc-500">({m.destinationField})</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono">
                      Transform: <code className="text-zinc-300 bg-white/[0.04] px-1.5 py-0.5 rounded">{m.transformRule}</code>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Sync Event Audit Stream */}
        <div className="lg:col-span-5 space-y-6">
          <div className="botanical-glass-card rounded-3xl p-6 md:p-8 border border-white/[0.08] relative overflow-hidden space-y-4">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-emerald-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Live Stack Sync Audit Stream
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-400">Stream: Active</span>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 font-mono text-xs">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-emerald-400 font-bold">
                      {log.source} ➔ {log.destination}
                    </span>
                    <span className="text-zinc-500">{log.timestamp}</span>
                  </div>

                  <div className="font-bold text-white text-[11px]">{log.entity}</div>
                  <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">{log.details}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-[9px]">
                    <span className="text-emerald-400 font-bold">✓ {log.action}</span>
                    <span className="text-zinc-500">{log.status}</span>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="py-16 text-center text-zinc-500 text-xs font-medium">
                  Sync stream active. Webhook events and bidirectional updates will log here in real-time.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
