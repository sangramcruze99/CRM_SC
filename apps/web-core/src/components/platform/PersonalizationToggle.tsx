'use client';

import React from 'react';
import { Palette } from 'lucide-react';
import { usePersonalization } from './PersonalizationContext';

export function PersonalizationToggle() {
  const { activePalette, openPersonalizationModal } = usePersonalization();

  return (
    <button
      type="button"
      onClick={openPersonalizationModal}
      className="relative h-8.5 w-8.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.09] border border-slate-200 dark:border-white/[0.08] hover:border-emerald-500/40 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-xs group shrink-0 active:scale-[0.98]"
      title={`Personalization & Themes (Active: ${activePalette.name})`}
      aria-label="Personalization and Themes"
    >
      <Palette
        size={14}
        className="group-hover:rotate-12 transition-transform duration-200"
        style={{ color: activePalette.primary }}
      />
      {/* Dynamic Active Palette Ambient Dot Indicator */}
      <span
        className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ring-1 ring-slate-950/20 dark:ring-white/20 animate-pulse"
        style={{
          backgroundColor: activePalette.primary,
          boxShadow: `0 0 6px ${activePalette.glowHex}`,
        }}
      />
    </button>
  );
}
