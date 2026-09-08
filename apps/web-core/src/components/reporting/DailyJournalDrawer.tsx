'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Calendar,
  DollarSign,
  Briefcase,
  Layers,
  LifeBuoy,
  CheckSquare,
  Bot,
  Clock,
  ShieldCheck,
  Lock,
  Unlock,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  FileText,
  UserCheck,
} from 'lucide-react';

interface TimelineItem {
  id: string;
  time: string;
  timestamp: string;
  service: string;
  title: string;
  type: string;
  amount?: number;
  actor?: string;
  href?: string;
}

interface SourceReference {
  id: string;
  title?: string;
  amount?: number;
  stage?: string;
  invoiceNumber?: string;
  amountDue?: number;
  priority?: string;
  status?: string;
  name?: string;
  email?: string;
  agentId?: string;
  href: string;
}

interface DailyRecordData {
  id?: string;
  date: string;
  status: string;
  healthScore: number;
  salesMetrics?: any;
  financeMetrics?: any;
  crmMetrics?: any;
  projectMetrics?: any;
  hrMetrics?: any;
  helpdeskMetrics?: any;
  inventoryMetrics?: any;
  marketingMetrics?: any;
  aiMetrics?: any;
  sourceReferences?: {
    dealsWon?: SourceReference[];
    dealsCreated?: SourceReference[];
    payments?: SourceReference[];
    invoices?: SourceReference[];
    tickets?: SourceReference[];
    tasks?: SourceReference[];
    contacts?: SourceReference[];
    aiExecutions?: SourceReference[];
  };
}

interface DailyJournalDrawerProps {
  date: string;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export function DailyJournalDrawer({
  date,
  isOpen,
  onClose,
  onRefresh,
}: DailyJournalDrawerProps) {
  const [record, setRecord] = useState<DailyRecordData | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'timeline' | 'sources'>('summary');
  const [selectedSourceType, setSelectedSourceType] = useState<string>('dealsWon');

  const fetchDailyData = async () => {
    if (!date) return;
    setLoading(true);
    try {
      const [recRes, timeRes] = await Promise.all([
        fetch(`/api/bi/journal/daily?date=${date}`),
        fetch(`/api/bi/journal/timeline?date=${date}`),
      ]);

      if (recRes.ok) {
        const recData = await recRes.json();
        setRecord(recData);
      }
      if (timeRes.ok) {
        const timeData = await timeRes.json();
        setTimeline(timeData);
      }
    } catch (err) {
      console.error('Failed to fetch daily journal record:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && date) {
      fetchDailyData();
    }
  }, [isOpen, date]);

  const handleToggleLock = async () => {
    if (!record) return;
    const nextStatus = record.status === 'LOCKED' ? 'OPEN' : 'LOCKED';
    setActionLoading(true);
    try {
      const res = await fetch('/api/bi/journal/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodType: 'DAY',
          startDate: date,
          endDate: date,
          status: nextStatus,
        }),
      });
      if (res.ok) {
        await fetchDailyData();
        onRefresh?.();
      }
    } catch (err) {
      console.error('Lock action failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecalculate = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/bi/journal/recalculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: date,
          endDate: date,
        }),
      });
      if (res.ok) {
        await fetchDailyData();
        onRefresh?.();
      }
    } catch (err) {
      console.error('Recalculate failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  const sales = record?.salesMetrics || {};
  const finance = record?.financeMetrics || {};
  const crm = record?.crmMetrics || {};
  const helpdesk = record?.helpdeskMetrics || {};
  const projects = record?.projectMetrics || {};
  const ai = record?.aiMetrics || {};
  const sources = record?.sourceReferences || {};

  return (
    <div className="fixed inset-0 z-[999] bg-slate-950/70 backdrop-blur-md flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-950 border-l border-white/[0.1] h-full overflow-y-auto shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 border-b border-white/[0.08] sticky top-0 bg-slate-950/90 backdrop-blur-xl z-20 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                Daily Business Record
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                  record?.status === 'LOCKED'
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                    : record?.status === 'FINALIZED'
                    ? 'bg-blue-500/15 border-blue-500/30 text-blue-300'
                    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                }`}
              >
                {record?.status || 'OPEN'}
              </span>
              {record?.healthScore !== undefined && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/[0.05] border border-white/[0.1] text-slate-300">
                  Health: {record.healthScore}%
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Calendar size={18} className="text-emerald-400" />
              <span>{new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Traceable journal entry backed by live domain records and immutable audit logs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRecalculate}
              disabled={actionLoading}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors border border-white/[0.06] cursor-pointer"
              title="Recalculate Day from Database"
            >
              <RefreshCw size={15} className={actionLoading ? 'animate-spin text-emerald-400' : ''} />
            </button>
            <button
              onClick={handleToggleLock}
              disabled={actionLoading}
              className={`p-2 rounded-xl transition-colors border cursor-pointer ${
                record?.status === 'LOCKED'
                  ? 'text-amber-400 hover:bg-amber-500/20 border-amber-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.08] border-white/[0.06]'
              }`}
              title={record?.status === 'LOCKED' ? 'Unlock Day' : 'Lock Day Period'}
            >
              {record?.status === 'LOCKED' ? <Lock size={15} /> : <Unlock size={15} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 pb-2 border-b border-white/[0.06]">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'summary'
                ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Business Summary
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <span>Activity Timeline</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/[0.08] text-slate-300">
              {timeline.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sources'
                ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <span>Source Drill-Down</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/[0.08] text-slate-300">
              Record Links
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
              <RefreshCw size={24} className="animate-spin text-emerald-400" />
              <p className="text-xs font-mono">Deriving daily metrics from authoritative tables...</p>
            </div>
          ) : activeTab === 'summary' ? (
            /* Tab 1: Structured Department Metrics */
            <div className="space-y-5">
              {/* Sales & Revenue Grid */}
              <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <span className="flex items-center gap-2">
                    <Briefcase size={14} className="text-emerald-400" />
                    Sales & Revenue
                  </span>
                  <Link href="/deals" className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px] font-medium lowercase">
                    view deals <ChevronRight size={12} />
                  </Link>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div className="p-3 bg-black/30 rounded-xl border border-white/[0.04]">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Revenue Won</div>
                    <div className="text-lg font-mono font-bold text-emerald-400 mt-0.5">
                      ${(sales.revenueWon || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 bg-black/30 rounded-xl border border-white/[0.04]">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Deals Won / Lost</div>
                    <div className="text-lg font-mono font-bold text-white mt-0.5">
                      {sales.dealsWon || 0} <span className="text-xs text-slate-500 font-normal">/ {sales.dealsLost || 0}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-black/30 rounded-xl border border-white/[0.04]">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">New Leads</div>
                    <div className="text-lg font-mono font-bold text-white mt-0.5">
                      {sales.newLeads || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* Finance Ledger Grid */}
              <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <span className="flex items-center gap-2">
                    <DollarSign size={14} className="text-emerald-400" />
                    Finance & Cash Flow
                  </span>
                  <Link href="/invoices" className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px] font-medium lowercase">
                    view invoices <ChevronRight size={12} />
                  </Link>
                </div>
                <div className="grid grid-cols-4 gap-3 pt-1">
                  <div className="p-3 bg-black/30 rounded-xl border border-white/[0.04]">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Invoices</div>
                    <div className="text-base font-mono font-bold text-white mt-0.5">{finance.invoicesCreated || 0}</div>
                  </div>
                  <div className="p-3 bg-black/30 rounded-xl border border-white/[0.04]">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Payments In</div>
                    <div className="text-base font-mono font-bold text-emerald-400 mt-0.5">${(finance.paymentsReceived || 0).toLocaleString()}</div>
                  </div>
                  <div className="p-3 bg-black/30 rounded-xl border border-white/[0.04]">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Expenses</div>
                    <div className="text-base font-mono font-bold text-rose-300 mt-0.5">${(finance.expenses || 0).toLocaleString()}</div>
                  </div>
                  <div className="p-3 bg-black/30 rounded-xl border border-white/[0.04]">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Net Cash Flow</div>
                    <div className="text-base font-mono font-bold text-emerald-300 mt-0.5">${(finance.netCashFlow || 0).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Support & Projects Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <LifeBuoy size={14} className="text-blue-400" />
                      Helpdesk & SLAs
                    </span>
                    <Link href="/tickets" className="text-blue-400 hover:underline text-[11px] font-medium lowercase">tickets</Link>
                  </div>
                  <div className="text-sm font-mono text-white pt-1">
                    Resolved: <span className="font-bold text-emerald-400">{helpdesk.ticketsResolved || 0}</span> / Opened: {helpdesk.ticketsOpened || 0}
                  </div>
                  <div className="text-xs text-slate-400">
                    SLA Breaches: <span className={helpdesk.slaBreaches > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>{helpdesk.slaBreaches || 0}</span>
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <CheckSquare size={14} className="text-purple-400" />
                      Projects & Tasks
                    </span>
                    <Link href="/projects" className="text-purple-400 hover:underline text-[11px] font-medium lowercase">projects</Link>
                  </div>
                  <div className="text-sm font-mono text-white pt-1">
                    Completed: <span className="font-bold text-emerald-400">{projects.tasksCompleted || 0}</span> / Created: {projects.tasksCreated || 0}
                  </div>
                  <div className="text-xs text-slate-400">
                    Overdue Tasks: <span className={projects.overdueTasks > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}>{projects.overdueTasks || 0}</span>
                  </div>
                </div>
              </div>

              {/* AI Automation Engine Metrics */}
              <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <span className="flex items-center gap-2">
                    <Bot size={14} className="text-teal-400" />
                    AI Automation & Agent Runs
                  </span>
                  <Link href="/ai/activity" className="text-teal-400 hover:underline flex items-center gap-1 text-[11px] font-medium lowercase">
                    ai console <ChevronRight size={12} />
                  </Link>
                </div>
                <div className="grid grid-cols-4 gap-3 pt-1">
                  <div className="p-3 bg-black/30 rounded-xl border border-white/[0.04]">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Total Runs</div>
                    <div className="text-base font-mono font-bold text-white mt-0.5">{ai.agentRuns || 0}</div>
                  </div>
                  <div className="p-3 bg-black/30 rounded-xl border border-white/[0.04]">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Successful</div>
                    <div className="text-base font-mono font-bold text-emerald-400 mt-0.5">{ai.successfulActions || 0}</div>
                  </div>
                  <div className="p-3 bg-black/30 rounded-xl border border-white/[0.04]">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Failed</div>
                    <div className="text-base font-mono font-bold text-rose-400 mt-0.5">{ai.failedActions || 0}</div>
                  </div>
                  <div className="p-3 bg-black/30 rounded-xl border border-white/[0.04]">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Approvals</div>
                    <div className="text-base font-mono font-bold text-amber-300 mt-0.5">{ai.humanApprovals || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'timeline' ? (
            /* Tab 2: Chronological Timeline */
            <div className="space-y-3">
              {timeline.length === 0 ? (
                <div className="py-16 text-center text-slate-500 space-y-2">
                  <Clock size={28} className="mx-auto text-slate-600" />
                  <p className="text-xs">No business events or transactions logged on this date.</p>
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/[0.08]">
                  {timeline.map((item) => (
                    <div key={item.id} className="relative group">
                      <div className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-slate-950" />
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-400">{item.time}</span>
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/[0.06] text-slate-300">
                              {item.service}
                            </span>
                            {item.amount && (
                              <span className="text-[10px] font-mono font-bold text-emerald-400">
                                +${item.amount.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-semibold text-white">{item.title}</div>
                          {item.actor && (
                            <div className="text-[10px] text-slate-400">by {item.actor}</div>
                          )}
                        </div>

                        {item.href && (
                          <Link
                            href={item.href}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors"
                            title="Open Source Record"
                          >
                            <ExternalLink size={13} />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Tab 3: Source Records Drill-Down */
            <div className="space-y-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {[
                  { key: 'dealsWon', label: 'Won Deals', count: sources.dealsWon?.length || 0 },
                  { key: 'payments', label: 'Payments', count: sources.payments?.length || 0 },
                  { key: 'invoices', label: 'Invoices', count: sources.invoices?.length || 0 },
                  { key: 'tickets', label: 'Tickets', count: sources.tickets?.length || 0 },
                  { key: 'tasks', label: 'Tasks', count: sources.tasks?.length || 0 },
                  { key: 'contacts', label: 'Contacts', count: sources.contacts?.length || 0 },
                  { key: 'aiExecutions', label: 'AI Actions', count: sources.aiExecutions?.length || 0 },
                ].map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedSourceType(cat.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      selectedSourceType === cat.key
                        ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300'
                        : 'bg-white/[0.02] border border-white/[0.06] text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="text-[10px] font-mono px-1 rounded bg-white/[0.08]">
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Source Items List */}
              <div className="space-y-2">
                {((sources as any)[selectedSourceType] || []).length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    No {selectedSourceType} records associated with this date.
                  </div>
                ) : (
                  ((sources as any)[selectedSourceType] || []).map((item: any) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] transition-all flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{item.title || item.name || item.invoiceNumber || item.agentId || item.id}</span>
                          {item.amount !== undefined && (
                            <span className="text-[11px] font-mono text-emerald-400 font-bold">
                              ${item.amount.toLocaleString()}
                            </span>
                          )}
                          {item.amountDue !== undefined && (
                            <span className="text-[11px] font-mono text-slate-300 font-bold">
                              ${item.amountDue.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                          <span>ID: {item.id}</span>
                          {item.status && <span className="text-slate-500">• {item.status}</span>}
                          {item.priority && <span className="text-slate-500">• {item.priority}</span>}
                          {item.stage && <span className="text-slate-500">• {item.stage}</span>}
                        </div>
                      </div>

                      <Link
                        href={item.href || '#'}
                        className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/[0.08]"
                      >
                        <span>Inspect Record</span>
                        <ExternalLink size={12} />
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-slate-950/90 text-slate-400 text-[11px] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-400" />
            Audit verifiable historical journal entry
          </span>
          <span className="font-mono">Period ID: {record?.id || 'live'}</span>
        </div>
      </div>
    </div>
  );
}
