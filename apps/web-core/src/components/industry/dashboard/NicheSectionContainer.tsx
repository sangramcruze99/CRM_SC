'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  useIndustry,
  IndustryNiche,
  NICHE_CONFIGS,
} from '../IndustryContext';
import {
  Globe,
  Building2,
  Home,
  UtensilsCrossed,
  ShoppingBag,
  Briefcase,
  Palette,
  Sliders,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Layers,
  Compass,
  HardHat,
  Scale,
  Truck,
  Dumbbell,
  Wrench,
} from 'lucide-react';

import { MasterEnterpriseSection } from './MasterEnterpriseSection';
import { HospitalSection } from './HospitalSection';
import { RealEstateSection } from './RealEstateSection';
import { RestaurantSection } from './RestaurantSection';
import { RetailSection } from './RetailSection';
import { SmeSection } from './SmeSection';
import { AgencySection } from './AgencySection';
import { CustomSection } from './CustomSection';
import { BlueprintDynamicSection } from '@/components/blueprint/BlueprintDynamicSection';
import { useBlueprint } from '@/components/blueprint/BlueprintContext';
import { NICHE_TO_BLUEPRINT_CONFIGS } from '@/lib/blueprint/blueprintEngine';

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

export function NicheSectionContainer() {
  const { currentNiche, setNiche, nicheConfig, allNiches, activeFeatureIds } = useIndustry();
  const { effectiveBlueprint, selectIndustryAndType } = useBlueprint();
  const [selectedNicheTab, setSelectedNicheTab] = useState<IndustryNiche>(currentNiche);
  const [activationAlert, setActivationAlert] = useState<string | null>(null);
  const [lensMode, setLensMode] = useState<'BLUEPRINT' | 'CLASSIC'>('BLUEPRINT');

  // Sync with currentNiche when tenant context changes
  useEffect(() => {
    setSelectedNicheTab(currentNiche);
  }, [currentNiche]);

  const activeTabConfig = NICHE_CONFIGS[selectedNicheTab] || nicheConfig;
  const ActiveIcon = NICHE_ICONS[selectedNicheTab] || Globe;
  const isCurrentlyActiveTenantNiche = currentNiche === selectedNicheTab;

  const handleMakeActiveNiche = (nicheId: IndustryNiche) => {
    setNiche(nicheId);
    const bp = NICHE_TO_BLUEPRINT_CONFIGS[nicheId];
    if (bp) {
      selectIndustryAndType(bp.industry, bp.businessTypeId);
    }
    setActivationAlert(`Activated ${NICHE_CONFIGS[nicheId].name} as your primary workspace niche!`);
    setTimeout(() => setActivationAlert(null), 3500);
  };

  const renderNicheContent = () => {
    switch (selectedNicheTab) {
      case 'hospital':
        return <HospitalSection />;
      case 'realestate':
        return <RealEstateSection />;
      case 'restaurant':
        return <RestaurantSection />;
      case 'retail':
        return <RetailSection />;
      case 'sme':
        return <SmeSection />;
      case 'agency':
        return <AgencySection />;
      case 'custom':
        return <CustomSection />;
      case 'construction':
      case 'legal':
      case 'logistics':
      case 'fitness':
      case 'automotive':
        return <BlueprintDynamicSection />;
      case 'all':
      default:
        return <MasterEnterpriseSection />;
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Niche Section Header & Interactive Operational Lens Switcher */}
      <div className="workstation-card p-5 space-y-4">
        
        {/* Top Header: Active Niche Identity + Action Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold shadow-xs shrink-0">
              <ActiveIcon size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 suppressHydrationWarning className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {activeTabConfig.name}
                </h2>
                {isCurrentlyActiveTenantNiche ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    DEFAULT WORKSPACE NICHE
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-white/10">
                    OPERATIONAL LENS PREVIEW
                  </span>
                )}
              </div>
              <p suppressHydrationWarning className="text-xs font-mono text-zinc-500 mt-0.5">
                {activeTabConfig.tagline}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <div className="p-0.5 bg-zinc-900 border border-white/10 rounded-xl flex items-center gap-1">
              <button
                type="button"
                onClick={() => setLensMode('BLUEPRINT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  lensMode === 'BLUEPRINT'
                    ? 'bg-emerald-500 text-zinc-950 font-black shadow-md shadow-emerald-500/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Compass size={13} />
                <span>Blueprint View</span>
              </button>
              <button
                type="button"
                onClick={() => setLensMode('CLASSIC')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  lensMode === 'CLASSIC'
                    ? 'bg-white/10 text-white font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Layers size={13} />
                <span>Classic Lens</span>
              </button>
            </div>

            {!isCurrentlyActiveTenantNiche && (
              <button
                type="button"
                onClick={() => handleMakeActiveNiche(selectedNicheTab)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs transition shadow-md shadow-emerald-500/20 cursor-pointer active:scale-95"
              >
                Set as Default Niche
              </button>
            )}

            <Link
              href="/industry"
              className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/10 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders size={13} className="text-emerald-400" />
              <span>Blueprint Engine</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* 2. All 8 Niches Quick Tab Switcher */}
        <div className="pt-3 border-t border-slate-200 dark:border-white/[0.06] overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max pb-1">
            {allNiches.map((niche) => {
              const TabIcon = NICHE_ICONS[niche.id] || Globe;
              const isSelected = selectedNicheTab === niche.id;
              const isTenantActive = currentNiche === niche.id;

              return (
                <button
                  key={niche.id}
                  onClick={() => {
                    setSelectedNicheTab(niche.id);
                    setNiche(niche.id);
                    const bp = NICHE_TO_BLUEPRINT_CONFIGS[niche.id];
                    if (bp) {
                      selectIndustryAndType(bp.industry, bp.businessTypeId);
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                      : 'bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]'
                  }`}
                >
                  <TabIcon size={14} className={isSelected ? 'text-zinc-950' : 'text-zinc-400'} />
                  <span>{niche.shortName}</span>
                  {isTenantActive && (
                    <span
                      className={`ml-1 w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-zinc-950' : 'bg-emerald-400'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activation Alert */}
      {activationAlert && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-mono font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{activationAlert}</span>
        </div>
      )}

      {/* 3. Render Dedicated Niche Section */}
      <div className="transition-all duration-300 animate-in fade-in-50">
        {lensMode === 'BLUEPRINT' ? (
          <BlueprintDynamicSection />
        ) : (
          renderNicheContent()
        )}
      </div>
    </div>
  );
}
