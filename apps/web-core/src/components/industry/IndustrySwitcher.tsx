'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useIndustry, IndustryNiche } from './IndustryContext';
import { useBlueprint } from '@/components/blueprint/BlueprintContext';
import { NICHE_TO_BLUEPRINT_CONFIGS } from '@/lib/blueprint/blueprintEngine';
import {
  ChevronDown,
  Check,
  CheckCircle2,
  Globe,
  Stethoscope,
  Home,
  UtensilsCrossed,
  ShoppingBag,
  Building2,
  Palette,
  Layers,
  HardHat,
  Scale,
  Truck,
  Dumbbell,
  Wrench,
} from 'lucide-react';

const NICHE_ICON_MAP: Record<string, any> = {
  all: Globe,
  hospital: Stethoscope,
  realestate: Home,
  restaurant: UtensilsCrossed,
  retail: ShoppingBag,
  sme: Building2,
  agency: Palette,
  custom: Layers,
  construction: HardHat,
  legal: Scale,
  logistics: Truck,
  fitness: Dumbbell,
  automotive: Wrench,
};

export function IndustrySwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentNiche, setNiche, nicheConfig, allNiches } = useIndustry();
  const { selectIndustryAndType } = useBlueprint();
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ActiveIcon = NICHE_ICON_MAP[currentNiche] || Globe;

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectNiche = (nicheId: IndustryNiche) => {
    setNiche(nicheId);

    // 1. Immediately synchronize with the Master Blueprint Engine
    const bp = NICHE_TO_BLUEPRINT_CONFIGS[nicheId];
    if (bp) {
      selectIndustryAndType(bp.industry, bp.businessTypeId);
    }

    setIsOpen(false);
    const target = allNiches.find((n) => n.id === nicheId);
    setToast(`Switched workspace profile to ${target?.name || nicheId}!`);
    setTimeout(() => setToast(null), 3000);

    // 2. Intelligently route user to the chosen niche workspace if currently on an industry subroute
    if (pathname && (pathname.startsWith('/industry') || pathname === '/dashboard')) {
      if (nicheId === 'all') {
        router.push('/dashboard');
      } else if (nicheId === 'custom') {
        router.push('/industry');
      } else {
        router.push(`/industry/${nicheId}`);
      }
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Topbar Dropdown Pill Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-8.5 flex items-center gap-2 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.09] border border-slate-200 dark:border-white/[0.08] hover:border-emerald-500/40 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-[0.98] whitespace-nowrap"
        title={`Active Organization Niche: ${nicheConfig.name}`}
      >
        <ActiveIcon size={14} className="text-zinc-600 dark:text-zinc-300 shrink-0" />
        <span className="text-slate-900 dark:text-white font-bold text-xs truncate max-w-[125px] hidden sm:inline">
          {nicheConfig.shortName}
        </span>
        <ChevronDown size={12} className={`text-slate-400 shrink-0 ml-0.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Quick Switch Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 bg-white dark:bg-slate-900/95 backdrop-blur-xl text-slate-900 dark:text-white border border-emerald-500/40 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-2xl animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-84 sm:w-96 rounded-2xl bg-white dark:bg-slate-950/95 border border-slate-200 dark:border-white/10 shadow-2xl z-50 p-3 backdrop-blur-2xl text-slate-900 dark:text-white animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1.5 flex items-center justify-between border-b border-slate-100 dark:border-white/10 mb-2">
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
              const NicheIcon = NICHE_ICON_MAP[niche.id] || Globe;
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
                    <span className="p-2 bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] rounded-xl shadow-2xs flex items-center justify-center shrink-0">
                      <NicheIcon size={16} className="text-zinc-700 dark:text-zinc-300" />
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
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold group-hover:text-emerald-500 dark:group-hover:text-emerald-400 shrink-0">
                      Switch →
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
