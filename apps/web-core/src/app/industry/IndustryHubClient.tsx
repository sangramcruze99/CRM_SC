'use client';

import { useState } from 'react';
import { useIndustry, IndustryNiche, NICHE_CONFIGS } from '../../components/industry/IndustryContext';
import {
  Sparkles,
  CheckCircle2,
  Check,
  ArrowRight,
  Sliders,
  Layers,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { NicheFeaturePickerModal } from '../../components/industry/NicheFeaturePickerModal';
import { ALL_67_FEATURES } from '@/lib/featureCatalog';

export function IndustryHubClient() {
  const { currentNiche, setNiche, nicheConfig, allNiches, activeFeatureIds } = useIndustry();
  const [selectedPreview, setSelectedPreview] = useState<IndustryNiche>(currentNiche);
  const [alert, setAlert] = useState<string | null>(null);
  const [isFeaturePickerOpen, setIsFeaturePickerOpen] = useState(false);

  const previewConfig = NICHE_CONFIGS[selectedPreview] || nicheConfig;

  const handleActivateNiche = (nicheId: IndustryNiche) => {
    setNiche(nicheId);
    setSelectedPreview(nicheId);
    setAlert(`🎉 Activated ${NICHE_CONFIGS[nicheId].name}! Your homepage dashboard & navigation have been updated.`);
    setTimeout(() => setAlert(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Alert Banner */}
      {alert && (
        <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-amber-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-amber-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Sparkles className="text-amber-400" size={24} />
            Multi-Purpose Industry & Niche Workspace Adapter
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Turn Business OS into a specialized system for your exact industry — pick any of the 67 features and have your Home Page adapt automatically!
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsFeaturePickerOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-orange-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <Sliders size={15} />
            <span>Customize 67 Features ({activeFeatureIds.length} Active)</span>
          </button>

          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Active: {nicheConfig.shortName}</span>
          </span>
        </div>
      </div>

      {/* Grid of All Industry Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {allNiches.map((niche) => {
          const isActive = currentNiche === niche.id;
          const isSelected = selectedPreview === niche.id;

          return (
            <div
              key={niche.id}
              onClick={() => setSelectedPreview(niche.id)}
              className={`bg-white/[0.04] backdrop-blur-2xl border rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4 flex flex-col justify-between cursor-pointer transition-all ${
                isActive
                  ? 'border-amber-500/80 ring-2 ring-amber-500/20 bg-amber-500/10'
                  : isSelected
                  ? 'border-amber-400/50 bg-white/[0.06]'
                  : 'border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.06]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-white/[0.05] border border-white/[0.08] rounded-2xl shadow-2xs">
                      {niche.icon}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-white">{niche.name}</h3>
                      <span className="text-[11px] text-slate-400 font-medium">{niche.shortName}</span>
                    </div>
                  </div>

                  {isActive && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <Check size={10} /> Active
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  {niche.tagline}
                </p>

                {/* Terminology Pills */}
                <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Custom Terminology
                  </span>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 bg-white/[0.06] border border-white/[0.1] rounded-md text-[10px] font-semibold text-slate-300">
                      👥 {niche.terminology.contacts}
                    </span>
                    <span className="px-2 py-0.5 bg-white/[0.06] border border-white/[0.1] rounded-md text-[10px] font-semibold text-slate-300">
                      💼 {niche.terminology.deals}
                    </span>
                    <span className="px-2 py-0.5 bg-white/[0.06] border border-white/[0.1] rounded-md text-[10px] font-semibold text-slate-300">
                      🧾 {niche.terminology.invoices}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-medium">
                  {niche.id === currentNiche
                    ? `${activeFeatureIds.length} Features Active`
                    : `${niche.navigationSections.reduce((acc, s) => acc + s.items.length, 0)} Curated Modules`}
                </span>

                {isActive ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFeaturePickerOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Configure Features
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActivateNiche(niche.id);
                    }}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-500/20 active:scale-[0.98] cursor-pointer"
                  >
                    Activate Niche
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Niche In-Depth Breakdown Panel */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{previewConfig.icon}</span>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{previewConfig.name} — Dynamic Architecture</span>
                {currentNiche === previewConfig.id && (
                  <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-500/30">
                    CURRENTLY ACTIVE
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{previewConfig.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsFeaturePickerOpen(true)}
              className="px-3.5 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders size={14} className="text-amber-400" />
              <span>Cherry-Pick Features</span>
            </button>

            {currentNiche !== previewConfig.id && (
              <button
                onClick={() => handleActivateNiche(previewConfig.id)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-orange-500/25 cursor-pointer"
              >
                Switch Workspace to {previewConfig.shortName}
              </button>
            )}
          </div>
        </div>

        {/* Modules Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {previewConfig.navigationSections.map((sec, idx) => (
            <div key={idx} className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>{sec.sectionTitle}</span>
                <span className="text-[10px] text-slate-500 font-mono font-normal">
                  {sec.items.length} links
                </span>
              </h4>

              <div className="space-y-1.5">
                {sec.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="p-2 bg-white/[0.04] border border-white/[0.06] rounded-xl flex items-center justify-between text-xs font-medium text-slate-200"
                  >
                    <span>{item.label}</span>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                      {item.href}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Specialized Hub Direct Jump */}
        {previewConfig.id !== 'all' && previewConfig.id !== 'sme' && previewConfig.id !== 'agency' && previewConfig.id !== 'custom' && (
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">
              Want to see the specialized operational command center for this niche?
            </span>
            <Link
              href={`/industry/${previewConfig.id}`}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5"
            >
              <span>Open {previewConfig.shortName} Specialized View</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>

      {/* 67-Feature Picker Modal */}
      <NicheFeaturePickerModal
        isOpen={isFeaturePickerOpen}
        onClose={() => setIsFeaturePickerOpen(false)}
      />
    </div>
  );
}
