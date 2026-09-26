'use client';

import React, { useState } from 'react';
import {
  X,
  Compass,
  CheckCircle2,
  ArrowRight,
  Layers,
  Sparkles,
  Building2,
  Home,
  UtensilsCrossed,
  ShoppingBag,
  Briefcase,
  Palette,
  Sliders,
  Globe,
  Database,
  Shield,
  Activity,
  DollarSign,
  Users,
  Clock,
  Eye,
  HardHat,
  Scale,
  Truck,
  Dumbbell,
  Wrench,
} from 'lucide-react';
import { IndustryNiche, NICHE_CONFIGS } from './IndustryContext';
import { NICHE_CONFIGURATIONS_2 } from '@/lib/industry/nicheRegistry2';
import { BUSINESS_TYPE_TEMPLATES } from '@/lib/blueprint/blueprintTemplates';
import { NICHE_TO_BLUEPRINT_CONFIGS } from '@/lib/blueprint/blueprintEngine';
import { UNIVERSAL_SERVICE_CATALOG } from '@/lib/services/serviceCatalog';

interface NichePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  nicheId: IndustryNiche;
  onActivate: (nicheId: IndustryNiche) => void;
}

const NICHE_ICONS: Record<IndustryNiche, React.ElementType> = {
  all: Globe,
  hospital: Building2,
  realestate: Home,
  restaurant: UtensilsCrossed,
  retail: ShoppingBag,
  sme: Briefcase,
  agency: Palette,
  custom: Sliders,
  construction: HardHat,
  legal: Scale,
  logistics: Truck,
  fitness: Dumbbell,
  automotive: Wrench,
};

export function NichePreviewModal({
  isOpen,
  onClose,
  nicheId,
  onActivate,
}: NichePreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TERMINOLOGY' | 'RECORDS' | 'SERVICES'>('OVERVIEW');

  if (!isOpen) return null;

  const classicConfig = NICHE_CONFIGS[nicheId] || NICHE_CONFIGS.all;
  const config2 = NICHE_CONFIGURATIONS_2[nicheId] || NICHE_CONFIGURATIONS_2.all;
  const bpMapping = NICHE_TO_BLUEPRINT_CONFIGS[nicheId];
  const template = bpMapping ? BUSINESS_TYPE_TEMPLATES[bpMapping.businessTypeId] : null;
  const NicheIconComponent = NICHE_ICONS[nicheId] || Globe;

  const terminology = template?.terminology || {
    contacts: classicConfig.terminology.contacts,
    deals: classicConfig.terminology.deals,
    invoices: classicConfig.terminology.invoices,
    projects: classicConfig.terminology.projects,
    records: (classicConfig.terminology as any)?.records || 'Records',
  };

  const widgets = template?.dashboardWidgets || [];
  const recordTypes = template?.recordTypes || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Gradient Ribbon */}
        <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500" />

        {/* Modal Header */}
        <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg">
              <NicheIconComponent size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white tracking-tight">
                  {config2?.name || classicConfig.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  LIVE BLUEPRINT PREVIEW
                </span>
                {template && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/[0.06] text-slate-300">
                    {template.industry}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {config2?.tagline || (classicConfig as any).tagline || classicConfig.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-white/[0.08] flex items-center gap-4 overflow-x-auto">
          {[
            { id: 'OVERVIEW', label: 'Dashboard & Metrics', icon: Activity },
            { id: 'TERMINOLOGY', label: 'Active Terminology', icon: Compass },
            { id: 'RECORDS', label: `Record Schemas (${recordTypes.length})`, icon: Database },
            { id: 'SERVICES', label: `Connected Services (${config2?.coreServiceIds?.length || 4})`, icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Simulated KPI Grid */}
              <div>
                <span className="text-xs font-mono uppercase text-slate-400 font-bold block mb-3">
                  Simulated Operating Cockpit Metrics:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {widgets.length > 0 ? (
                    widgets.map((w) => (
                      <div
                        key={w.id}
                        className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2 hover:border-emerald-500/30 transition"
                      >
                        <span className="text-[11px] font-mono text-slate-400 line-clamp-1">{w.title}</span>
                        <div className="text-lg font-black text-white tracking-tight">{w.metricValue || '$48,200'}</div>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                          <CheckCircle2 size={12} />
                          <span>{w.metricDelta || 'Real-time telemetry'}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-4 p-4 rounded-xl bg-white/[0.02] text-xs font-mono text-slate-400 text-center">
                      Configuring dynamic KPI stream for this blueprint...
                    </div>
                  )}
                </div>
              </div>

              {/* Recommended For & Ideal Operating Profile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                    <Sparkles size={14} />
                    <span>Recommended Operations Profile</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {config2?.recommendedFor?.map((rec, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{rec}</span>
                      </li>
                    )) || <li>Turnkey multi-department enterprise</li>}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase text-sky-400 flex items-center gap-1.5">
                    <Shield size={14} />
                    <span>Agent & Automation Readiness</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Once activated, all 10 Business Agents immediately inherit this niche's custom terminology, authoritative compliance rules, and verified tool boundaries.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'TERMINOLOGY' && (
            <div className="space-y-4">
              <span className="text-xs font-mono uppercase text-slate-400 font-bold block">
                How Core Business OS Concepts Adapt in this Niche:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(terminology).map(([key, val]) => (
                  <div
                    key={key}
                    className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">
                        System Concept ({key})
                      </span>
                      <span className="text-xs font-bold text-emerald-400">{String(val)}</span>
                    </div>
                    <ArrowRight size={14} className="text-slate-600" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'RECORDS' && (
            <div className="space-y-4">
              <span className="text-xs font-mono uppercase text-slate-400 font-bold block">
                Specialized Database Record Types & Pipelines:
              </span>
              {recordTypes.length > 0 ? (
                <div className="space-y-3">
                  {recordTypes.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white">{rec.name}</h4>
                          <p className="text-xs text-slate-400">{rec.description}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          {rec.category || 'Operations'}
                        </span>
                      </div>

                      {/* Fields preview */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">
                          Configured Fields:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {rec.fields.map((f) => (
                            <span
                              key={f.id}
                              className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/[0.04] text-slate-300 border border-white/10"
                            >
                              {f.label} ({f.type})
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Statuses preview */}
                      {rec.statuses && rec.statuses.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-slate-500 uppercase block">
                            Pipeline Stages:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {rec.statuses.map((st) => (
                              <span
                                key={st.id}
                                className="px-2 py-0.5 rounded-md text-[10px] font-mono text-white"
                                style={{ backgroundColor: `${st.color}25`, border: `1px solid ${st.color}50` }}
                              >
                                {st.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center text-xs font-mono text-slate-400">
                  Custom record builder active for this configuration.
                </div>
              )}
            </div>
          )}

          {activeTab === 'SERVICES' && (
            <div className="space-y-4">
              <span className="text-xs font-mono uppercase text-slate-400 font-bold block">
                Turnkey Connected Capabilities:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(config2?.coreServiceIds || []).map((srvId) => {
                  const srv = UNIVERSAL_SERVICE_CATALOG[srvId];
                  return (
                    <div
                      key={srvId}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white">
                          {srv?.name || srvId}
                        </span>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {srv?.description || 'Active core service capability'}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        CORE
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/[0.08] bg-white/[0.01] flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-400 hover:text-white transition cursor-pointer"
          >
            Close Preview
          </button>

          <button
            onClick={() => {
              onActivate(nicheId);
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 text-xs font-mono font-bold transition shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <CheckCircle2 size={16} />
            <span>Activate {config2?.name || classicConfig.name}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
