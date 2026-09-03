'use client';

import { useState } from 'react';
import { useIndustry, IndustryNiche } from './IndustryContext';
import {
  Sparkles,
  ChevronDown,
  Check,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import Link from 'next/link';

export function IndustrySwitcher() {
  const { currentNiche, setNiche, nicheConfig, allNiches } = useIndustry();
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleSelectNiche = (nicheId: IndustryNiche) => {
    setNiche(nicheId);
    setIsOpen(false);
    const target = allNiches.find((n) => n.id === nicheId);
    setToast(`Switched workspace profile to ${target?.name || nicheId}!`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="relative">
      {/* Topbar Dropdown Pill Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] rounded-xl text-xs font-semibold transition-all shadow-xs hover:border-emerald-500/40 cursor-pointer active:scale-[0.98]"
      >
        <span className="text-sm">{nicheConfig.icon}</span>
        <div className="text-left hidden sm:block">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block -mb-0.5">
            Active Niche
          </span>
          <span className="text-white font-bold text-xs">{nicheConfig.shortName}</span>
        </div>
        <ChevronDown size={13} className="text-slate-400 ml-0.5" />
      </button>

      {/* Quick Switch Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 bg-slate-900/95 backdrop-blur-xl text-white border border-emerald-500/40 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-2xl animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Floating Popover Dropdown (anchored to button) */}
      {isOpen && (
        <>
          {/* Transparent Backdrop for click-outside */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-950/95 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.12] shadow-2xl z-50 p-3 space-y-2 animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-slate-200 dark:border-white/[0.08]">
              <div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Select Business Niche
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">Workspace Adaptation Profiles</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {allNiches.length} Available
              </span>
            </div>

            {/* List of Niches */}
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {allNiches.map((niche) => {
                const isActive = currentNiche === niche.id;
                return (
                  <div
                    key={niche.id}
                    onClick={() => handleSelectNiche(niche.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isActive
                        ? 'border-emerald-500/60 bg-emerald-500/15 shadow-2xs text-slate-950 dark:text-white'
                        : 'border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.15] text-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl p-1.5 bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] rounded-xl shadow-2xs">
                        {niche.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{niche.name}</h4>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium truncate">
                          {niche.tagline}
                        </p>
                      </div>
                    </div>

                    {isActive ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950 flex items-center gap-1 shrink-0">
                        <Check size={10} /> Active
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold group-hover:text-emerald-400 shrink-0">
                        Switch →
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer Link to Studio */}
            <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between px-2 text-xs">
              <Link
                href="/industry"
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <Sliders size={12} />
                <span>Open Full Niche Profile Studio</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
