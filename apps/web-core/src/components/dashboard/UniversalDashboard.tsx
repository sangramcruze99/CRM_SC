// apps/web-core/src/components/dashboard/UniversalDashboard.tsx
'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  Search,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  ChevronDown,
  User,
  Users,
  Filter,
  Activity,
  ShieldCheck,
  Building,
  TrendingUp,
  FileText,
  Plus,
  RefreshCw,
  ExternalLink,
  Layers,
  Bed,
  HeartPulse,
  Stethoscope,
  Briefcase,
  Utensils,
  DollarSign,
} from 'lucide-react';
import {
  DashboardConfig,
  DashboardOperationalRecord,
  DashboardAttentionItem,
} from './dashboard.types';
import { RecordDetailDrawer } from './RecordDetailDrawer';

const ICON_MAP: Record<string, React.ElementType> = {
  Bed,
  HeartPulse,
  Calendar,
  Stethoscope,
  Users,
  ShieldCheck,
  Building,
  Briefcase,
  Clock,
  Activity,
  FileText,
  Utensils,
  DollarSign,
  CheckCircle2,
};

interface UniversalDashboardProps {
  config: DashboardConfig;
  onRoleChange?: (roleId: string) => void;
  onModeChange?: (mode: 'OPERATIONS' | 'ANALYTICS') => void;
  onAttentionAction?: (item: DashboardAttentionItem) => void;
  onRowClick?: (record: DashboardOperationalRecord) => void;
  headerSlot?: React.ReactNode;
  customModals?: React.ReactNode;
}

export function UniversalDashboard({
  config,
  onRoleChange,
  onModeChange,
  onAttentionAction,
  onRowClick,
  headerSlot,
  customModals,
}: UniversalDashboardProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRecord, setSelectedRecord] = useState<DashboardOperationalRecord | null>(null);
  const [timeContext, setTimeContext] = useState<'today' | 'week' | 'month'>('today');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // Filter records by search and status
  const filteredRecords = config.records.filter((rec) => {
    const matchesSearch =
      rec.primaryText.toLowerCase().includes(search.toLowerCase()) ||
      rec.secondaryText.toLowerCase().includes(search.toLowerCase()) ||
      rec.groupText.toLowerCase().includes(search.toLowerCase()) ||
      rec.ownerText.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ||
      rec.priority === statusFilter ||
      rec.status.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const handleRecordClick = (record: DashboardOperationalRecord) => {
    setSelectedRecord(record);
    if (onRowClick) onRowClick(record);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white animate-in fade-in pb-12">
      {/* ============================================================== */}
      {/* ZONE A: PAGE HEADER                                            */}
      {/* ============================================================== */}
      <div className="border-b border-white/[0.08] pb-5 space-y-4">
        {/* Breadcrumb & Workspace Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Workspaces</span>
            <span className="text-slate-600">/</span>
            <span className="text-emerald-400 font-bold">{config.businessType}</span>
            <span className="text-slate-600">/</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              {config.categoryBadge}
            </span>
          </div>

          {/* Role Switcher & Mode Toggle */}
          <div className="flex items-center gap-2">
            {/* Time Context */}
            <div className="bg-white/[0.04] border border-white/[0.08] p-0.5 rounded-lg flex items-center text-[11px] font-semibold">
              <button
                onClick={() => setTimeContext('today')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  timeContext === 'today' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setTimeContext('week')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  timeContext === 'week' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setTimeContext('month')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  timeContext === 'month' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                This Month
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="bg-white/[0.04] border border-white/[0.08] p-0.5 rounded-lg flex items-center text-[11px] font-semibold">
              <button
                onClick={() => onModeChange && onModeChange('OPERATIONS')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  config.mode === 'OPERATIONS' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                Operations
              </button>
              <button
                onClick={() => onModeChange && onModeChange('ANALYTICS')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  config.mode === 'ANALYTICS' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                Analytics
              </button>
            </div>

            {/* Role Dropdown */}
            {config.availableRoles && config.availableRoles.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] rounded-lg text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <User size={13} className="text-emerald-400" />
                  <span>{config.availableRoles.find((r) => r.id === config.currentRole)?.label || 'View as Role'}</span>
                  <ChevronDown size={13} className="text-slate-400" />
                </button>

                {isRoleDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-40 py-1 backdrop-blur-xl animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-500 border-b border-white/5">
                      Switch Role Perspective
                    </div>
                    {config.availableRoles.map((role) => (
                      <button
                        key={role.id}
                        onClick={() => {
                          if (onRoleChange) onRoleChange(role.id);
                          setIsRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer ${
                          role.id === config.currentRole ? 'text-emerald-300 font-bold bg-emerald-500/10' : 'text-slate-300'
                        }`}
                      >
                        <span>{role.label}</span>
                        {role.id === config.currentRole && <CheckCircle2 size={13} className="text-emerald-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Title, Description & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>{config.title}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
              {config.subtitle}
            </p>
          </div>

          {/* Quick Actions Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {config.quickActions.map((qa) => (
              <button
                key={qa.id}
                onClick={qa.onClick}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  qa.primary
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 border border-emerald-400/40 shadow-emerald-500/20'
                    : 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/10'
                }`}
              >
                <span>{qa.label}</span>
              </button>
            ))}
          </div>
        </div>

        {headerSlot}
      </div>

      {/* ============================================================== */}
      {/* ZONE B: CRITICAL / NEEDS ATTENTION AREA                        */}
      {/* (Only renders when there are active items requiring attention)  */}
      {/* ============================================================== */}
      {config.attentionItems && config.attentionItems.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            <span className="flex items-center gap-1.5 text-amber-400">
              <AlertTriangle size={15} />
              <span>Needs Your Attention Right Now ({config.attentionItems.length})</span>
            </span>
            <span className="text-[11px] text-slate-500 lowercase font-mono">prioritized by business impact</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {config.attentionItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  item.severity === 'CRITICAL'
                    ? 'bg-rose-500/[0.08] hover:bg-rose-500/[0.12] border-rose-500/30'
                    : item.severity === 'HIGH'
                    ? 'bg-amber-500/[0.07] hover:bg-amber-500/[0.1] border-amber-500/30'
                    : 'bg-sky-500/[0.05] hover:bg-sky-500/[0.08] border-sky-500/20'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                        item.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                          : item.severity === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      }`}
                    >
                      {item.severity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock size={11} />
                      <span>{item.timeAgo}</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-xs text-white leading-tight">{item.title}</h3>
                  <p className="text-[11px] text-slate-300 leading-snug">{item.reason}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[10px]">
                  <span className="text-slate-400 truncate max-w-[170px]">{item.owner}</span>
                  <button
                    onClick={() => {
                      if (onAttentionAction) onAttentionAction(item);
                      if (item.onAction) item.onAction(item);
                    }}
                    className={`font-bold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      item.severity === 'CRITICAL'
                        ? 'bg-rose-500/30 hover:bg-rose-500 text-rose-200 hover:text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {item.actionLabel} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ZONE C: TODAY'S OPERATIONS PULSE                               */}
      {/* ============================================================== */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-1">
          <Activity size={14} className="text-emerald-400" />
          <span>Today's Operational Pulse</span>
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {config.todayMetrics.map((tm) => {
            const IconComponent = tm.iconName ? ICON_MAP[tm.iconName] || Activity : Activity;
            return (
              <div
                key={tm.id}
                className="p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {tm.label}
                  </span>
                  <div className="text-lg font-black text-white font-mono">{tm.value}</div>
                  <span className="text-[10px] text-slate-400 block">{tm.subtext}</span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-emerald-400">
                  <IconComponent size={16} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* ZONE D: PRIMARY BUSINESS KPIs (Strict max 4)                    */}
      {/* ============================================================== */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          <span className="flex items-center gap-1.5">
            <TrendingUp size={14} className="text-emerald-400" />
            <span>Primary Business Performance KPIs</span>
          </span>
          <span className="text-[10px] font-mono text-emerald-400 lowercase">verified live metrics</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {config.primaryKpis.slice(0, 4).map((kpi) => (
            <div
              key={kpi.id}
              className="p-5 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] rounded-3xl transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  {kpi.label}
                </span>
                <div className="text-3xl font-extrabold text-white font-mono mt-1 tracking-tight">
                  {kpi.value}
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400">{kpi.delta}</span>
                <span className="text-[11px] text-slate-400 font-medium truncate max-w-[130px]">{kpi.subtext}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* ZONE E & F: MAIN OPERATIONS WORK QUEUE & TIMELINE               */}
      {/* 8 Columns Main Operational Surface + 4 Columns Timeline         */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Operational Table (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span>{config.mainOperationTitle}</span>
                <span className="text-xs font-mono font-normal text-slate-400">({filteredRecords.length})</span>
              </h2>
              <p className="text-[11px] text-slate-400">{config.mainOperationSubtitle}</p>
            </div>

            {/* Contextual Search */}
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder={config.searchPlaceholder || 'Search records...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:bg-white/[0.08]"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.02] text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-white/[0.08]">
                  <tr>
                    <th className="px-5 py-3.5">Record & Primary Info</th>
                    <th className="px-4 py-3.5">Team & Attending Lead</th>
                    <th className="px-4 py-3.5">Priority</th>
                    <th className="px-4 py-3.5">Location</th>
                    <th className="px-4 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {filteredRecords.map((rec, idx) => (
                    <tr
                      key={`${rec.id}-${idx}`}
                      onClick={() => handleRecordClick(rec)}
                      className="hover:bg-white/[0.05] transition-colors cursor-pointer group"
                    >
                      {/* 1. Primary Text (Bold) + Secondary (Subtle) */}
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-white group-hover:text-emerald-300 transition-colors text-xs">
                          {rec.primaryText}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {rec.secondaryText}
                        </div>
                      </td>

                      {/* 2. Group & Owner */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-200 text-xs">{rec.groupText}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{rec.ownerText}</div>
                      </td>

                      {/* 3. Priority Badge */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rec.priority === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                              : rec.priority === 'URGENT' || rec.priority === 'HIGH'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {rec.priority}
                        </span>
                      </td>

                      {/* 4. Location */}
                      <td className="px-4 py-3.5 text-slate-300 font-medium">
                        {rec.location}
                      </td>

                      {/* 5. Status Badge */}
                      <td className="px-4 py-3.5 text-right">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold inline-flex items-center gap-1 ${
                            rec.statusVariant === 'success'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : rec.statusVariant === 'warning'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : rec.statusVariant === 'danger'
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              : 'bg-white/5 text-slate-300 border border-white/10'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {filteredRecords.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500 text-xs font-medium">
                        No records match the current filter or search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Side Operational Timeline (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="px-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock size={15} className="text-emerald-400" />
                <span>{config.timelineTitle}</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 lowercase">live sync</span>
            </h2>
            {config.timelineSubtitle && (
              <p className="text-[11px] text-slate-400 mt-0.5">{config.timelineSubtitle}</p>
            )}
          </div>

          <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-4 space-y-2.5 shadow-2xl">
            {config.timelineItems.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="p-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] rounded-2xl transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white truncate max-w-[160px]">{item.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-emerald-300 border border-white/10">
                    {item.time}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">{item.subtitle}</p>
                <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-[10px] text-slate-400">
                  <span>{item.owner}</span>
                  <span
                    className={`font-bold ${
                      item.statusVariant === 'success' ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}

            {config.timelineItems.length === 0 && (
              <div className="py-8 text-center text-slate-500 text-xs">
                No scheduled timeline items for today.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ZONE G & H: SECONDARY OPERATIONS & RECENT AUDIT ACTIVITY       */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Secondary Operations Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Secondary Operational Status
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {config.secondaryCards.map((sc) => (
              <div
                key={sc.id}
                className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl space-y-1.5"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                  {sc.title}
                </span>
                <div className="text-base font-bold text-white font-mono">{sc.value}</div>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">{sc.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Chronological Activity (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between px-1">
            <span>Recent Chronological Activity</span>
            <span className="text-[10px] font-mono text-slate-500 lowercase">audit verified</span>
          </h2>

          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-3.5 space-y-2">
            {config.recentActivity.slice(0, 4).map((act, idx) => (
              <div
                key={`${act.id}-${idx}`}
                className="flex items-start justify-between gap-3 text-xs pb-2 border-b border-white/[0.04] last:border-b-0 last:pb-0"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-white text-[11px]">{act.title}</div>
                  <p className="text-[10px] text-slate-400 leading-snug">{act.description}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                  {act.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide-over Detail Drawer */}
      <RecordDetailDrawer
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onAction={(action, rec) => {
          setSelectedRecord(null);
        }}
      />

      {customModals}
    </div>
  );
}
