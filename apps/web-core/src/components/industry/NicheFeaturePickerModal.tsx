'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  CheckCircle2,
  X,
  Search,
  Filter,
  Check,
  RotateCcw,
  Layers,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useIndustry } from './IndustryContext';
import { ALL_67_FEATURES, FEATURE_CATEGORIES, FeatureItem } from '@/lib/featureCatalog';

interface NicheFeaturePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NicheFeaturePickerModal({ isOpen, onClose }: NicheFeaturePickerModalProps) {
  const { currentNiche, nicheConfig, activeFeatureIds, toggleFeature, setNicheFeatures, resetToNicheDefaults } = useIndustry();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<number | 'ALL'>('ALL');
  const [alert, setAlert] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const filteredFeatures = ALL_67_FEATURES.filter((feat) => {
    const matchesCat = selectedCat === 'ALL' || feat.category === selectedCat;
    const matchesSearch =
      feat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feat.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feat.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSelectAllCategory = (catId: number) => {
    const catFeatureIds = ALL_67_FEATURES.filter((f) => f.category === catId).map((f) => f.id);
    const updated = Array.from(new Set([...activeFeatureIds, ...catFeatureIds]));
    setNicheFeatures(updated);
    setAlert(`Enabled all features in ${FEATURE_CATEGORIES.find((c) => c.id === catId)?.name}!`);
    setTimeout(() => setAlert(null), 2500);
  };

  const handleSelectAll67 = () => {
    setNicheFeatures(ALL_67_FEATURES.map((f) => f.id));
    setAlert('✨ Enabled all 67 platform features for this workspace!');
    setTimeout(() => setAlert(null), 2500);
  };

  const handleClearAll = () => {
    setNicheFeatures(['feat_contacts', 'feat_global_search', 'feat_industry_switcher']);
    setAlert('Cleared all optional features (kept basic core navigation).');
    setTimeout(() => setAlert(null), 2500);
  };

  const handleResetDefaults = () => {
    resetToNicheDefaults();
    setAlert(`Reset to default curated features for ${nicheConfig.name}!`);
    setTimeout(() => setAlert(null), 2500);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 animate-in fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-950/99 border border-white/[0.14] rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(16,185,129,0.15)] backdrop-blur-2xl space-y-6 text-white my-8 animate-in zoom-in-95 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-32 bg-emerald-500/10 blur-3xl rounded-full" />

        {/* Header */}
        <div className="flex justify-between items-start border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/25 border border-emerald-300/30 text-xl">
              {nicheConfig.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white tracking-tight">
                  Customize Features for {nicheConfig.shortName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-extrabold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {activeFeatureIds.length} / 67 Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Toggle any of the 67 features across all 12 categories. Changes automatically update your navigation & workspace in real time
              </p>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Alert notification */}
        {alert && (
          <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-extrabold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} />
            <span>{alert}</span>
          </div>
        )}

        {/* Toolbar: Search, Category Filters, Quick Bulk Actions */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search across all 67 features (e.g., 'OCR', 'Bed Occupancy', 'Khata', 'Social')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9.5 pr-4 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 font-medium"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleSelectAll67}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-md shadow-emerald-500/25 active:scale-[0.98] transition-all cursor-pointer"
              >
                Select All 67
              </button>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-3.5 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.1] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Reset Defaults</span>
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3.5 py-2 bg-white/[0.06] hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/[0.1] rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCat('ALL')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCat === 'ALL'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.08]'
              }`}
            >
              All 12 Categories ({ALL_67_FEATURES.length})
            </button>
            {FEATURE_CATEGORIES.map((cat) => {
              const count = ALL_67_FEATURES.filter((f) => f.category === cat.id).length;
              const activeCount = ALL_67_FEATURES.filter(
                (f) => f.category === cat.id && activeFeatureIds.includes(f.id)
              ).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCat(cat.id)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedCat === cat.id
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.08]'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span className={`text-[10px] font-mono ${selectedCat === cat.id ? 'text-slate-950 font-bold' : 'text-slate-500'}`}>
                    ({activeCount}/{count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredFeatures.map((feat) => {
              const isEnabled = activeFeatureIds.includes(feat.id);

              return (
                <div
                  key={feat.id}
                  onClick={() => toggleFeature(feat.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 select-none ${
                    isEnabled
                      ? 'bg-gradient-to-tr from-emerald-500/15 via-white/[0.04] to-transparent border-emerald-500/50 shadow-md shadow-emerald-500/10'
                      : 'bg-white/[0.02] border-white/[0.06] opacity-60 hover:opacity-100 hover:border-white/[0.15]'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0 ${
                            isEnabled
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                              : 'bg-white/[0.05] border-white/20 text-transparent'
                          }`}
                        >
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span className={`text-xs font-bold block truncate ${isEnabled ? 'text-white' : 'text-slate-300'}`}>
                          {feat.name}
                        </span>
                        {feat.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                            {feat.badge}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-7 line-clamp-2 leading-relaxed">
                      {feat.shortDesc}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-slate-500 pl-7">
                    <span className="truncate max-w-[150px]">{feat.categoryName}</span>
                    <span className="font-mono text-emerald-400/80">{feat.route}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            <span className="font-bold text-white">{activeFeatureIds.length} features active</span> for{' '}
            <span className="text-emerald-400 font-semibold">{nicheConfig.name}</span>. Homepage widgets will reflect these selections immediately.
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 size={15} />
            <span>Apply & Update Homepage</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
