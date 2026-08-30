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

const INITIAL_LOGS: SyncEventLog[] = [
  {
    id: 'log_1',
    timestamp: '10:42:01 AM',
    source: 'Stripe',
    destination: 'Dual Khata Ledger',
    entity: 'Invoice #ch_3Pq942 ($1,850.00)',
    action: 'RECONCILED',
    details: 'Synced customer payment status to Paid; updated Cash-Flow ledger.',
    status: 'SUCCESS',
  },
  {
    id: 'log_2',
    timestamp: '10:41:48 AM',
    source: 'Shopify',
    destination: 'Airtable / Price Books',
    entity: 'SKU #SURG-STEEL-TRAY',
    action: 'UPDATED',
    details: 'Stock inventory count updated from 42 to 41 across all retail channels.',
    status: 'SUCCESS',
  },
  {
    id: 'log_3',
    timestamp: '10:40:12 AM',
    source: 'Business OS CRM',
    destination: 'Slack #revenue-vip',
    entity: 'Deal Won: NovaPay ($42,000.00)',
    action: 'CREATED',
    details: 'Dispatched automated commission notification & customer onboarding trigger.',
    status: 'SUCCESS',
  },
];

export function DataSyncClient() {
  const [connectors, setConnectors] = useState<StackConnector[]>(PRESET_CONNECTORS);
  const [mappings, setMappings] = useState<SyncFieldMapping[]>(PRESET_MAPPINGS);
  const [logs, setLogs] = useState<SyncEventLog[]>(INITIAL_LOGS);
  const [conflictPolicy, setConflictPolicy] = useState<'SOURCE_WINS' | 'TARGET_WINS' | 'LATEST_TIMESTAMP'>('LATEST_TIMESTAMP');
  const [isSyncing, setIsSyncing] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);

  const handleTriggerManualSync = () => {
    setIsSyncing(true);
    setAlert('⚡ Executing bidirectional sync across Stripe, Shopify, Airtable, Slack, and Business OS...');

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
      setAlert('🎉 Bidirectional Data Sync Complete! 184 records updated instantly across all team dashboards.');
      setTimeout(() => setAlert(null), 4500);
    }, 1600);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Alert Banner */}
      {alert && (
        <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-amber-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
              Operational Automation
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Bidirectional Multi-Stack Mesh
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5 mt-1">
            <ArrowRightLeft className="text-amber-400" size={24} />
            Operational "Data Sync" & Disparate Stack Tooling Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Eliminates disparate software silos. Seamlessly syncs inventory, client statuses, and transaction metrics in real-time across Stripe, Shopify, Airtable, Slack, and your CRM without human data entry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={isSyncing}
            onClick={handleTriggerManualSync}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-orange-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Syncing Stack Mesh...' : 'Sync All Stacks Now'}</span>
          </button>
        </div>
      </div>

      {/* Telemetry KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
            Records Synced Today
          </span>
          <div className="text-2xl font-extrabold font-mono text-white">6,520</div>
          <span className="text-[10px] text-emerald-400 font-mono">↑ 18% vs yesterday</span>
        </div>

        <div className="p-4 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
            Sync Success Rate
          </span>
          <div className="text-2xl font-extrabold font-mono text-emerald-400">99.98%</div>
          <span className="text-[10px] text-slate-400 font-mono">0 Sync Collisions</span>
        </div>

        <div className="p-4 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
            Average Mesh Latency
          </span>
          <div className="text-2xl font-extrabold font-mono text-amber-400">62ms</div>
          <span className="text-[10px] text-emerald-400 font-mono">Sub-100ms Target</span>
        </div>

        <div className="p-4 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
            Active Stack Connectors
          </span>
          <div className="text-2xl font-extrabold font-mono text-white">5 Live</div>
          <span className="text-[10px] text-slate-400 font-mono">All Webhooks Healthy</span>
        </div>
      </div>

      {/* Connected Software Stacks Mesh Cards */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Connected Enterprise Software Stack Grid
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">Auto-Reconnection Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {connectors.map((conn) => {
            const IconComp = conn.icon;
            return (
              <div
                key={conn.id}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <IconComp size={16} />
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400" />
                </div>

                <div>
                  <h4 className="font-bold text-xs text-white leading-tight">{conn.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{conn.syncMode}</span>
                </div>

                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Latency: <strong className="text-white">{conn.latency}</strong></span>
                  <span className="text-emerald-400">{conn.recordsSyncedToday} syncs</span>
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
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Bidirectional Schema & Field Mapping Rules
                </h3>
              </div>

              {/* Conflict Policy Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold font-mono">Conflict Rule:</span>
                <select
                  value={conflictPolicy}
                  onChange={(e) => setConflictPolicy(e.target.value as any)}
                  className="px-2 py-1 bg-white/[0.06] border border-white/[0.1] rounded-lg text-[10px] text-amber-300 font-bold font-mono focus:outline-none"
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
                  className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-amber-400">{m.sourceStack}</span>
                      <span className="text-slate-500">({m.sourceField})</span>
                      <ArrowRightLeft size={12} className="text-slate-400" />
                      <span className="font-bold text-emerald-400">{m.destinationStack}</span>
                      <span className="text-slate-500">({m.destinationField})</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Transform: <code className="text-slate-300">{m.transformRule}</code>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Sync Event Audit Stream */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Stack Sync Audit Stream
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">Stream: Active</span>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 font-mono text-xs">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-slate-950/80 border border-white/[0.06] space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-amber-400 font-bold">
                      {log.source} ➔ {log.destination}
                    </span>
                    <span className="text-slate-500">{log.timestamp}</span>
                  </div>

                  <div className="font-bold text-white text-[11px]">{log.entity}</div>
                  <p className="text-[10px] text-slate-400 font-sans leading-relaxed">{log.details}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-[9px]">
                    <span className="text-emerald-400 font-bold">✓ {log.action}</span>
                    <span className="text-slate-500">{log.status}</span>
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
