'use client';

import { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Check,
  ArrowRight,
  Sliders,
  Layers,
  Zap,
  Search,
  Building2,
  Filter,
  Eye,
  Info,
  Workflow,
  Receipt,
  Users,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Compass,
} from 'lucide-react';
import Link from 'next/link';
import { useIndustry, IndustryNiche, NicheIcon } from '../../components/industry/IndustryContext';
import { NICHE_CONFIGURATIONS_2, NicheConfiguration2 } from '@/lib/industry/nicheRegistry2';
import {
  UNIVERSAL_SERVICE_CATALOG,
  UniversalService,
  getServicesForNiche,
} from '@/lib/services/serviceCatalog';
import { WorkspaceActivationWizardModal } from '../../components/industry/WorkspaceActivationWizardModal';
import { ServiceDetailModal } from '../../components/industry/ServiceDetailModal';
import { NicheFeaturePickerModal } from '../../components/industry/NicheFeaturePickerModal';
import { NichePreviewModal } from '../../components/industry/NichePreviewModal';
import { BlueprintWorkspaceHub } from '@/components/blueprint/BlueprintWorkspaceHub';

export function IndustryHubClient() {
  const {
    currentNiche,
    activateWorkspace,
    nicheConfig2,
    allNiches2,
    activeServiceIds,
    enableService,
    disableService,
    isServiceEnabled,
  } = useIndustry();

  const [selectedNicheId, setSelectedNicheId] = useState<IndustryNiche>(currentNiche);
  const [activeMode, setActiveMode] = useState<'BLUEPRINT_ENGINE' | 'CLASSIC_NICHES'>('BLUEPRINT_ENGINE');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'SERVICES' | 'PREVIEW' | 'COMPARE'>('SERVICES');
  const [serviceExplorerCat, setServiceExplorerCat] = useState<string>('ALL');

  // Modals state
  const [wizardNicheId, setWizardNicheId] = useState<IndustryNiche | null>(null);
  const [previewNicheId, setPreviewNicheId] = useState<IndustryNiche | null>(null);
  const [inspectedService, setInspectedService] = useState<UniversalService | null>(null);
  const [isFeaturePickerOpen, setIsFeaturePickerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const selectedNicheConfig = NICHE_CONFIGURATIONS_2[selectedNicheId] || NICHE_CONFIGURATIONS_2.all;
  const availableServices = getServicesForNiche(selectedNicheId);

  // Filter niches
  const filteredNiches = allNiches2.filter((niche) => {
    const matchesSearch =
      niche.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      niche.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      niche.recommendedFor.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'ALL' ||
      (categoryFilter === 'HEALTHCARE' && niche.id === 'hospital') ||
      (categoryFilter === 'REAL_ESTATE' && niche.id === 'realestate') ||
      (categoryFilter === 'HOSPITALITY' && niche.id === 'restaurant') ||
      (categoryFilter === 'RETAIL' && niche.id === 'retail') ||
      (categoryFilter === 'SAAS' && niche.id === 'sme') ||
      (categoryFilter === 'AGENCY' && niche.id === 'agency') ||
      (categoryFilter === 'CONSTRUCTION' && niche.id === 'construction') ||
      (categoryFilter === 'LEGAL' && niche.id === 'legal') ||
      (categoryFilter === 'LOGISTICS' && niche.id === 'logistics') ||
      (categoryFilter === 'FITNESS' && niche.id === 'fitness') ||
      (categoryFilter === 'AUTOMOTIVE' && niche.id === 'automotive') ||
      (categoryFilter === 'ENTERPRISE' && (niche.id === 'all' || niche.id === 'custom'));

    return matchesSearch && matchesCategory;
  });

  // Filter services in explorer
  const filteredServices = availableServices.filter((srv) => {
    if (serviceExplorerCat === 'ALL') return true;
    if (serviceExplorerCat === 'CORE') return selectedNicheConfig.coreServiceIds.includes(srv.id);
    if (serviceExplorerCat === 'RECOMMENDED') return selectedNicheConfig.recommendedServiceIds.includes(srv.id);
    if (serviceExplorerCat === 'OPTIONAL') return selectedNicheConfig.optionalServiceIds.includes(srv.id);
    return srv.category === serviceExplorerCat;
  });

  const handleInstantActivate = (nicheId: IndustryNiche) => {
    activateWorkspace(nicheId);
    setToast(`Activated ${NICHE_CONFIGURATIONS_2[nicheId].name}! Your workspace has adapted.`);
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-white p-4 sm:p-6 lg:p-8 animate-in fade-in">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-950/95 border border-emerald-500/50 text-white rounded-2xl shadow-2xl flex items-center gap-2.5 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span className="text-xs font-bold">{toast}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Universal Service System 2.0
            </span>
            <span className="text-xs text-slate-400">· Multi-Tenant Operating Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/25 border border-emerald-300/30">
              <Compass size={22} />
            </div>
            <span>Industry Operating Workspaces</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
            Choose the operating system that fits your business. When activated, services, navigation hierarchy, records, forms, and workflows automatically adapt to your industry.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="p-1 bg-black/40 border border-white/[0.12] rounded-xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveMode('BLUEPRINT_ENGINE')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'BLUEPRINT_ENGINE'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 font-black shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Compass size={14} />
              <span>Blueprint Engine (New)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('CLASSIC_NICHES')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'CLASSIC_NICHES'
                  ? 'bg-white/10 text-white font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers size={14} />
              <span>Classic Industry Niches</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsFeaturePickerOpen(true)}
            className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.12] rounded-xl text-xs font-bold text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders size={14} className="text-emerald-400" />
            <span>Legacy 67-Feature Matrix</span>
          </button>

          <div className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-2 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active: {nicheConfig2.shortName}</span>
          </div>
        </div>
      </div>

      {/* Mode View Switcher */}
      {activeMode === 'BLUEPRINT_ENGINE' ? (
        <BlueprintWorkspaceHub />
      ) : (
        <>
          {/* Filter and Search Bar */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search workspaces (e.g. 'Hospital', 'Real Estate', 'Retail POS', 'SaaS', 'Clinic')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 font-medium"
            />
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'ALL', label: `All (${allNiches2.length})` },
              { id: 'HEALTHCARE', label: 'Healthcare' },
              { id: 'REAL_ESTATE', label: 'Real Estate' },
              { id: 'HOSPITALITY', label: 'Restaurant' },
              { id: 'RETAIL', label: 'Retail & POS' },
              { id: 'CONSTRUCTION', label: 'Construction' },
              { id: 'LEGAL', label: 'Legal & Law' },
              { id: 'LOGISTICS', label: 'Logistics' },
              { id: 'FITNESS', label: 'Fitness' },
              { id: 'AUTOMOTIVE', label: 'Auto Repair' },
              { id: 'SAAS', label: 'SaaS & Tech' },
              { id: 'AGENCY', label: 'Creative Agency' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  categoryFilter === cat.id
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.08]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 8 Niche Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredNiches.map((niche) => {
          const isActive = currentNiche === niche.id;
          const isSelected = selectedNicheId === niche.id;

          return (
            <div
              key={niche.id}
              onClick={() => setSelectedNicheId(niche.id)}
              className={`group relative rounded-3xl p-5 transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-b from-emerald-950/50 via-slate-900/90 to-slate-950/95 border-2 border-emerald-500/70 shadow-[0_0_30px_rgba(16,185,129,0.22)]'
                  : isSelected
                  ? 'bg-gradient-to-b from-slate-800/60 to-slate-900/80 border border-emerald-400/50 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
                  : 'bg-gradient-to-b from-white/[0.04] to-black/[0.4] hover:from-white/[0.07] hover:to-black/[0.5] border border-white/[0.08] hover:border-emerald-500/30 shadow-lg'
              }`}
            >
              {isActive && (
                <div className="absolute -top-px left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
              )}

              <div className="space-y-3.5">
                {/* Header: Icon, Badge & Title */}
                <div className="flex items-start justify-between gap-2">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner group-hover:scale-105 transition-transform shrink-0">
                    <NicheIcon niche={niche.id} size={20} className="text-emerald-400" />
                  </div>

                  {isActive ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500">
                      {niche.coreServiceIds.length + niche.recommendedServiceIds.length} Services
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-white tracking-tight leading-snug">
                    {niche.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {niche.tagline}
                  </p>
                </div>

                {/* Core Services Badges */}
                <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400/90 font-bold block">
                    Core Capabilities
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {niche.coreServiceIds.slice(0, 3).map((sId) => {
                      const srv = UNIVERSAL_SERVICE_CATALOG[sId];
                      return (
                        <span
                          key={sId}
                          className="px-2 py-0.5 bg-black/40 border border-white/[0.06] rounded-md text-[10px] font-medium text-slate-300 truncate max-w-[170px]"
                        >
                          {srv?.name || sId}
                        </span>
                      );
                    })}
                    {niche.coreServiceIds.length > 3 && (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono text-slate-500">
                        +{niche.coreServiceIds.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3.5 mt-3.5 border-t border-white/[0.06] flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewNicheId(niche.id);
                    }}
                    className="text-[11px] text-slate-400 hover:text-emerald-400 font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Eye size={12} />
                    <span>Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNicheId(niche.id);
                      setActiveTab('SERVICES');
                    }}
                    className="text-[11px] text-slate-400 hover:text-emerald-400 font-bold transition-colors"
                  >
                    Explore →
                  </button>
                </div>

                {isActive ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setWizardNicheId(niche.id);
                    }}
                    className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Configure
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setWizardNicheId(niche.id);
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
                  >
                    Activate
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* In-Depth Service Explorer & Workspace Preview Panel */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-950 border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent pointer-events-none" />

        {/* Panel Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-inner shrink-0 text-emerald-400">
              <NicheIcon niche={selectedNicheConfig.id} size={22} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2.5">
                <span>{selectedNicheConfig.name} — Operating Architecture</span>
                {currentNiche === selectedNicheConfig.id && (
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider rounded-full border border-emerald-400/40">
                    ACTIVE WORKSPACE
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{selectedNicheConfig.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* View Mode Tabs */}
            <div className="p-1 bg-black/40 border border-white/[0.08] rounded-xl flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('SERVICES')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'SERVICES'
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Service Catalog
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('PREVIEW')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'PREVIEW'
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Workspace Preview
              </button>
            </div>

            <button
              type="button"
              onClick={() => setWizardNicheId(selectedNicheConfig.id)}
              className="px-5 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-black transition-all shadow-lg shadow-emerald-500/25 active:scale-95 cursor-pointer"
            >
              {currentNiche === selectedNicheConfig.id ? 'Reconfigure Workspace' : 'Launch Activation Wizard'}
            </button>
          </div>
        </div>

        {/* TAB 1: SERVICE CATALOG EXPLORER */}
        {activeTab === 'SERVICES' && (
          <div className="space-y-4">
            {/* Category Sub-Filters */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'ALL', label: 'All Services' },
                  { id: 'CORE', label: 'Core Services' },
                  { id: 'RECOMMENDED', label: 'Recommended' },
                  { id: 'OPTIONAL', label: 'Optional Business' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setServiceExplorerCat(f.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      serviceExplorerCat === f.id
                        ? 'bg-white/10 text-white font-bold border border-white/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <span className="text-xs text-slate-400 font-mono">
                {filteredServices.length} Services available for {selectedNicheConfig.shortName}
              </span>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredServices.map((srv) => {
                const isEnabled = isServiceEnabled(srv.id);
                const isCore = selectedNicheConfig.coreServiceIds.includes(srv.id);
                const isRec = selectedNicheConfig.recommendedServiceIds.includes(srv.id);

                return (
                  <div
                    key={srv.id}
                    className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-white leading-snug">{srv.name}</h4>
                        </div>

                        {isCore ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                            CORE
                          </span>
                        ) : isRec ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 shrink-0">
                            RECOMMENDED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-white/5 text-slate-400 border border-white/10 shrink-0">
                            OPTIONAL
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                        {srv.shortDesc}
                      </p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {srv.records.map((r) => (
                          <span
                            key={r}
                            className="px-1.5 py-0.2 bg-white/[0.04] border border-white/[0.06] rounded text-[9px] font-mono text-slate-300"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setInspectedService(srv)}
                        className="text-[11px] text-emerald-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Info size={12} />
                        <span>Inspect Service</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {isCore ? (
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <Check size={11} /> Always On
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => (isEnabled ? disableService(srv.id) : enableService(srv.id))}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                              isEnabled
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-white/[0.05] text-slate-400 hover:text-white border border-white/[0.1]'
                            }`}
                          >
                            {isEnabled ? 'Enabled' : 'Enable'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: WORKSPACE PREVIEW */}
        {activeTab === 'PREVIEW' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Terminology & Metrics Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-black/40 border border-white/[0.08] rounded-2xl space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                  Industry Terminology Map
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Contacts:</span>
                    <span className="font-bold text-white">{selectedNicheConfig.terminology.contacts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Deals:</span>
                    <span className="font-bold text-white">{selectedNicheConfig.terminology.deals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Invoices:</span>
                    <span className="font-bold text-white">{selectedNicheConfig.terminology.invoices}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Projects:</span>
                    <span className="font-bold text-white">{selectedNicheConfig.terminology.projects}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-black/40 border border-white/[0.08] rounded-2xl space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold block">
                  Primary Dashboard KPIs
                </span>
                <div className="space-y-1.5 text-xs">
                  {selectedNicheConfig.dashboardKpis.map((kpi) => (
                    <div key={kpi.id} className="flex justify-between items-center">
                      <span className="text-slate-400 truncate max-w-[150px]">{kpi.label}</span>
                      <span className="font-mono font-bold text-emerald-400">{kpi.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-black/40 border border-white/[0.08] rounded-2xl space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold block">
                  Designated AI Persona
                </span>
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-white">{selectedNicheConfig.aiPersona.name}</div>
                  <div className="text-purple-300 font-medium">{selectedNicheConfig.aiPersona.role}</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                    {selectedNicheConfig.aiPersona.promptContext}
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Jump to Specialized View */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-slate-400">
                Want to test the dedicated operational screen for {selectedNicheConfig.shortName}?
              </span>
              <Link
                href={`/industry/${selectedNicheConfig.id === 'all' ? 'hospital' : selectedNicheConfig.id}`}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5"
              >
                <span>Launch {selectedNicheConfig.shortName} Live View</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>
      </>
      )}

      {/* Guided 5-Step Activation Wizard Modal */}
      {wizardNicheId && (
        <WorkspaceActivationWizardModal
          nicheId={wizardNicheId}
          isOpen={Boolean(wizardNicheId)}
          onClose={() => setWizardNicheId(null)}
        />
      )}

      {/* Deep Service Detail Modal */}
      {inspectedService && (
        <ServiceDetailModal
          service={inspectedService}
          isOpen={Boolean(inspectedService)}
          onClose={() => setInspectedService(null)}
          isEnabled={isServiceEnabled(inspectedService.id)}
          onToggle={(sId) => (isServiceEnabled(sId) ? disableService(sId) : enableService(sId))}
        />
      )}

      {/* Legacy 67-Feature Modal */}
      <NicheFeaturePickerModal
        isOpen={isFeaturePickerOpen}
        onClose={() => setIsFeaturePickerOpen(false)}
      />

      {/* Live Niche Sandbox Preview Modal */}
      {previewNicheId && (
        <NichePreviewModal
          isOpen={Boolean(previewNicheId)}
          onClose={() => setPreviewNicheId(null)}
          nicheId={previewNicheId}
          onActivate={handleInstantActivate}
        />
      )}
    </div>
  );
}
