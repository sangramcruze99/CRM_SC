'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  DollarSign,
  TrendingUp,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  Building2,
  ArrowRight,
  GripVertical,
  Sparkles,
  LayoutGrid,
  List,
  Trash2,
  Layers,
  ChevronDown
} from 'lucide-react';
import { CreateDealModal } from '../CreateDealModal';
import { updateDealStage, deleteDeal, seedDemoDeals } from '../../app/actions';
import { useRouter } from 'next/navigation';

export interface DealItem {
  id: string;
  title: string;
  amount: number | string;
  stage: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  account?: string;
  company?: { name?: string };
  expectedClose?: string;
  probability?: number;
  createdAt?: string | Date;
}

interface DealsKanbanBoardProps {
  initialDeals: DealItem[];
}

const STAGES = [
  {
    id: 'Lead',
    title: 'Lead',
    subtitle: 'Discovery',
    badgeClass: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    probability: 20,
    accentDot: 'bg-slate-400',
  },
  {
    id: 'Meeting Scheduled',
    title: 'Meeting Scheduled',
    subtitle: 'Qualification',
    badgeClass: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    probability: 40,
    accentDot: 'bg-teal-400',
  },
  {
    id: 'Proposal',
    title: 'Proposal',
    subtitle: 'Commercial Quote',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    probability: 70,
    accentDot: 'bg-emerald-400',
  },
  {
    id: 'Contract Negotiation',
    title: 'Contract Negotiation',
    subtitle: 'Legal & Terms',
    badgeClass: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40',
    probability: 85,
    accentDot: 'bg-emerald-300',
  },
  {
    id: 'Closed Won',
    title: 'Closed Won',
    subtitle: 'Active Revenue',
    badgeClass: 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50',
    probability: 100,
    accentDot: 'bg-emerald-400 animate-pulse',
  },
];

export function DealsKanbanBoard({ initialDeals }: DealsKanbanBoardProps) {
  const [deals, setDeals] = useState<DealItem[]>(initialDeals);
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Filter deals based on search query
  const filteredDeals = deals.filter((deal) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const titleMatch = deal.title?.toLowerCase().includes(query);
    const companyMatch = (deal.company?.name || deal.account || '').toLowerCase().includes(query);
    const amountMatch = String(deal.amount).includes(query);
    return titleMatch || companyMatch || amountMatch;
  });

  // Calculate telemetry
  const totalPipelineValue = deals.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
  const closedWonValue = deals
    .filter((d) => d.stage === 'Closed Won')
    .reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
  const weightedForecast = deals.reduce((acc, d) => {
    const stageObj = STAGES.find((s) => s.title === d.stage);
    const prob = stageObj ? stageObj.probability / 100 : 0.3;
    return acc + (Number(d.amount) || 0) * prob;
  }, 0);
  const winRate = deals.length > 0 ? Math.round((deals.filter((d) => d.stage === 'Closed Won').length / deals.length) * 100) : 0;

  // Handle Drag and Drop
  const handleStageDrop = async (dealId: string, newStage: string) => {
    setDragOverStage(null);
    setDraggedDealId(null);

    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage === newStage) return;

    const previousStage = deal.stage;

    // 1. Instant Optimistic UI Update
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d))
    );

    setAlert({
      message: `✨ Opportunity "${deal.title}" moved to "${newStage}"`,
      type: 'success',
    });
    setTimeout(() => setAlert(null), 3000);

    // 2. Persist to Backend Microservice
    startTransition(async () => {
      try {
        await updateDealStage(dealId, newStage);
      } catch (err) {
        console.error('Failed to update deal stage on server:', err);
        setDeals((prev) =>
          prev.map((d) => (d.id === dealId ? { ...d, stage: previousStage } : d))
        );
        setAlert({
          message: 'Failed to update opportunity stage. Reverted changes.',
          type: 'info',
        });
      }
    });
  };

  // Seed sample enterprise deals for instant interactive demo
  const handleSeedDeals = () => {
    startTransition(async () => {
      setAlert({
        message: '⚡ Seeding enterprise opportunities into Sales microservice...',
        type: 'info',
      });
      await seedDemoDeals();
      router.refresh();
      setTimeout(() => {
        setAlert({
          message: '✅ Populated live enterprise pipeline!',
          type: 'success',
        });
        setTimeout(() => setAlert(null), 3000);
      }, 800);
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete opportunity "${title}"?`)) return;
    setDeals((prev) => prev.filter((d) => d.id !== id));
    startTransition(async () => {
      await deleteDeal(id);
    });
  };

  return (
    <div className="w-full h-full flex flex-col space-y-3.5 text-slate-900 dark:text-white">
      {/* Toast Alert Banner */}
      {alert && (
        <div className="p-2.5 px-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-700 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between gap-3 shadow-xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{alert.message}</span>
          </div>
          <button
            onClick={() => setAlert(null)}
            className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:text-slate-900 dark:hover:text-white underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. COMPACT EXECUTIVE COMMAND & TELEMETRY STRIP (One Line) */}
      {/* ========================================================= */}
      <div className="botanical-glass-card p-3 px-4 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3.5 shrink-0">
        {/* Title & Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20 border border-emerald-300/30">
            <Briefcase size={16} />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Deals Pipeline</h1>
            <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              {deals.length} Active
            </span>
          </div>
        </div>

        {/* Inline Compact Telemetry Badges */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="px-3 py-1 botanical-glass-inset rounded-xl flex items-center gap-2 border border-slate-200 dark:border-white/[0.08]">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono">Volume</span>
            <span className="font-mono font-black text-slate-900 dark:text-white">${(totalPipelineValue / 1000).toFixed(0)}k</span>
          </div>

          <div className="px-3 py-1 botanical-glass-inset rounded-xl flex items-center gap-2 border border-slate-200 dark:border-white/[0.08]">
            <span className="text-[10px] text-teal-600 dark:text-teal-400 uppercase font-mono">Weighted</span>
            <span className="font-mono font-black text-teal-700 dark:text-teal-300">${(weightedForecast / 1000).toFixed(0)}k</span>
          </div>

          <div className="px-3 py-1 botanical-glass-inset rounded-xl flex items-center gap-2 border border-slate-200 dark:border-white/[0.08]">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-mono">Won</span>
            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">${(closedWonValue / 1000).toFixed(0)}k</span>
          </div>

          <div className="px-3 py-1 botanical-glass-inset rounded-xl flex items-center gap-2 border border-slate-200 dark:border-white/[0.08]">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono">Win Rate</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{winRate}%</span>
          </div>
        </div>

        {/* Search, Mode Switcher & Actions */}
        <div className="flex items-center gap-2 w-full xl:w-auto justify-between xl:justify-end flex-wrap">
          {/* Quick Search Input */}
          <div className="relative w-44 sm:w-52">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter deals..."
              className="w-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 rounded-full pl-8 pr-3 py-1 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {deals.length === 0 && (
            <button
              onClick={handleSeedDeals}
              disabled={isPending}
              className="px-3 py-1.5 botanical-pill hover:border-emerald-500/50 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
              title="Seed 8 Demo Opportunities"
            >
              <Sparkles size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>Seed Deals</span>
            </button>
          )}

          {/* Kanban / List Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/[0.06] p-0.5 rounded-full border border-slate-200 dark:border-white/10">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                viewMode === 'kanban' ? 'botanical-pill-active text-slate-950' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid size={13} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                viewMode === 'list' ? 'botanical-pill-active text-slate-950' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Table List View"
            >
              <List size={13} />
            </button>
          </div>

          <CreateDealModal />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. TUCKED SINGLE-VIEWPORT 5-COLUMN KANBAN BOARD           */}
      {/* ========================================================= */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full flex-1 min-h-0 items-start">
          {STAGES.map((stage) => {
            const stageDeals = filteredDeals.filter((d) => d.stage === stage.title);
            const stageTotal = stageDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
            const isTargetOver = dragOverStage === stage.title;

            return (
              <div
                key={stage.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverStage !== stage.title) {
                    setDragOverStage(stage.title);
                  }
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDragOverStage(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const dealId = e.dataTransfer.getData('text/plain') || draggedDealId;
                  if (dealId) {
                    handleStageDrop(dealId, stage.title);
                  }
                }}
                className={`flex flex-col rounded-2xl transition-all duration-200 min-w-0 w-full ${
                  isTargetOver
                    ? 'ring-2 ring-emerald-400/80 bg-emerald-500/[0.08] shadow-[0_0_24px_rgba(16,185,129,0.25)]'
                    : ''
                }`}
              >
                {/* Stage Header */}
                <div className="botanical-glass-card p-2.5 mb-2 border-b border-slate-200 dark:border-white/[0.08] space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${stage.accentDot}`} />
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate" title={stage.title}>
                        {stage.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-white/[0.08] text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-white/10 shrink-0">
                      {stageDeals.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>${(stageTotal / 1000).toFixed(0)}k</span>
                    <span className="text-emerald-600 dark:text-emerald-400/80">{stage.probability}% prob</span>
                  </div>
                </div>

                {/* Drop Container with Independent Smooth Scrollbar */}
                <div
                  className={`flex-1 flex flex-col gap-2.5 p-2 rounded-2xl h-[calc(100vh-215px)] min-h-[420px] max-h-[calc(100vh-215px)] overflow-y-auto transition-all duration-200 scrollbar-thin ${
                    isTargetOver
                      ? 'border-2 border-dashed border-emerald-400/60 bg-emerald-50 dark:bg-emerald-950/20'
                      : 'botanical-glass-inset border border-slate-200 dark:border-white/[0.06]'
                  }`}
                >
                  {stageDeals.map((item) => {
                    const isBeingDragged = draggedDealId === item.id;

                    return (
                      <div
                        key={item.id}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', item.id);
                          e.dataTransfer.effectAllowed = 'move';
                          setDraggedDealId(item.id);
                        }}
                        onDragEnd={() => {
                          setDraggedDealId(null);
                          setDragOverStage(null);
                        }}
                        className={`group relative botanical-glass-card p-3 rounded-xl border transition-all duration-200 cursor-grab active:cursor-grabbing hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-white/[0.08] ${
                          isBeingDragged
                            ? 'opacity-40 scale-95 border-emerald-400 ring-2 ring-emerald-400/50 rotate-1'
                            : 'border-slate-200 dark:border-white/10 shadow-sm dark:shadow-md dark:shadow-black/30'
                        }`}
                      >
                        {/* Card Top: Account & Priority */}
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors min-w-0 pr-1">
                            <GripVertical size={12} className="opacity-50 group-hover:opacity-100 shrink-0" />
                            <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                              {item.company?.name || item.account || 'Enterprise'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {item.stage === 'Closed Won' ? (
                              <span className="px-1 py-0.2 rounded text-[8px] font-mono font-black bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40">
                                WON
                              </span>
                            ) : (
                              <span className="px-1 py-0.2 rounded text-[8px] font-mono font-bold bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                                {stage.probability}%
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item.id, item.title);
                              }}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-0.5 rounded transition-opacity cursor-pointer"
                              title="Delete Deal"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>

                        {/* Deal Title */}
                        <Link
                          href={`/deals/${item.id}`}
                          className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors line-clamp-2 leading-snug block mb-2"
                        >
                          {item.title}
                        </Link>

                        {/* Card Bottom: Amount & Stage Selector */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/[0.08]">
                          <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
                            ${Number(item.amount).toLocaleString()}
                          </span>

                          <select
                            value={item.stage}
                            onChange={(e) => handleStageDrop(item.id, e.target.value)}
                            className="text-[9px] font-bold bg-slate-50 dark:bg-[#0c1411] text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {STAGES.map((s) => (
                              <option key={s.id} value={s.title}>
                                → {s.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty Stage Drop Hint */}
                  {stageDeals.length === 0 && (
                    <div
                      className={`flex-1 border border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center transition-colors ${
                        isTargetOver
                          ? 'border-emerald-400 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      <Layers size={18} className="mb-1.5 opacity-40" />
                      <span className="text-[11px] font-semibold block">
                        {isTargetOver ? 'Drop here' : 'No deals'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. TABLE / LIST ALTERNATIVE VIEW                          */}
      {/* ========================================================= */}
      {viewMode === 'list' && (
        <div className="botanical-glass-card overflow-hidden flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-white/[0.04] border-b border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Opportunity</th>
                  <th className="py-2.5 px-4">Account / Client</th>
                  <th className="py-2.5 px-4">Stage</th>
                  <th className="py-2.5 px-4 text-right">Valuation ($)</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                {filteredDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors group">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      <Link href={`/deals/${deal.id}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                        {deal.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {deal.company?.name || deal.account || 'Enterprise Client'}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={deal.stage}
                        onChange={(e) => handleStageDrop(deal.id, e.target.value)}
                        className="text-xs font-bold bg-slate-50 dark:bg-[#0c1411] text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                      >
                        {STAGES.map((s) => (
                          <option key={s.id} value={s.title}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                      ${Number(deal.amount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(deal.id, deal.title)}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                        title="Delete Deal"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
