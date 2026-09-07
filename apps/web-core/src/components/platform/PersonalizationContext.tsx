'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface ColorShades {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface ColorPlate {
  id: string;
  name: string;
  primary: string;
  hover: string;
  ring: string;
  glowHex: string;
  secondaryGlowHex: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  accentGradient: string;
  shades: ColorShades;
}

export interface WallpaperPreset {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  cssBackground?: string;
  previewGradient: string;
}

export const COLOR_PLATES: ColorPlate[] = [
  {
    id: 'emerald',
    name: 'Emerald Sovereign (Default)',
    primary: '#10b981',
    hover: '#059669',
    ring: '#10b981',
    glowHex: 'rgba(16, 185, 129, 0.55)',
    secondaryGlowHex: 'rgba(52, 211, 153, 0.25)',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    badgeBorder: 'border-emerald-500/30',
    accentGradient: 'from-emerald-500 via-teal-500 to-emerald-600',
    shades: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      950: '#022c22',
    },
  },
  {
    id: 'cyan',
    name: 'Electric Cyan',
    primary: '#06b6d4',
    hover: '#0891b2',
    ring: '#06b6d4',
    glowHex: 'rgba(6, 182, 212, 0.55)',
    secondaryGlowHex: 'rgba(34, 211, 238, 0.25)',
    badgeBg: 'bg-cyan-500/15',
    badgeText: 'text-cyan-700 dark:text-cyan-300',
    badgeBorder: 'border-cyan-500/30',
    accentGradient: 'from-cyan-500 via-sky-500 to-teal-500',
    shades: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
      950: '#083344',
    },
  },
  {
    id: 'cobalt',
    name: 'Royal Cobalt',
    primary: '#3b82f6',
    hover: '#2563eb',
    ring: '#3b82f6',
    glowHex: 'rgba(59, 130, 246, 0.55)',
    secondaryGlowHex: 'rgba(96, 165, 250, 0.25)',
    badgeBg: 'bg-blue-500/15',
    badgeText: 'text-blue-700 dark:text-blue-300',
    badgeBorder: 'border-blue-500/30',
    accentGradient: 'from-blue-500 via-indigo-500 to-blue-600',
    shades: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
  },
  {
    id: 'violet',
    name: 'Amethyst Violet',
    primary: '#a855f7',
    hover: '#9333ea',
    ring: '#a855f7',
    glowHex: 'rgba(168, 85, 247, 0.55)',
    secondaryGlowHex: 'rgba(192, 132, 252, 0.25)',
    badgeBg: 'bg-purple-500/15',
    badgeText: 'text-purple-700 dark:text-purple-300',
    badgeBorder: 'border-purple-500/30',
    accentGradient: 'from-purple-500 via-violet-500 to-indigo-600',
    shades: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
      950: '#3b0764',
    },
  },
  {
    id: 'rose',
    name: 'Crimson Rose',
    primary: '#f43f5e',
    hover: '#e11d48',
    ring: '#f43f5e',
    glowHex: 'rgba(244, 63, 94, 0.55)',
    secondaryGlowHex: 'rgba(251, 113, 133, 0.25)',
    badgeBg: 'bg-rose-500/15',
    badgeText: 'text-rose-700 dark:text-rose-300',
    badgeBorder: 'border-rose-500/30',
    accentGradient: 'from-rose-500 via-pink-500 to-red-500',
    shades: {
      50: '#fff1f2',
      100: '#ffe4e6',
      200: '#fecdd3',
      300: '#fda4af',
      400: '#fb7185',
      500: '#f43f5e',
      600: '#e11d48',
      700: '#be123c',
      800: '#9f1239',
      900: '#881337',
      950: '#4c0519',
    },
  },
  {
    id: 'amber',
    name: 'Imperial Amber',
    primary: '#f59e0b',
    hover: '#d97706',
    ring: '#f59e0b',
    glowHex: 'rgba(245, 158, 11, 0.55)',
    secondaryGlowHex: 'rgba(252, 211, 77, 0.25)',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-700 dark:text-amber-300',
    badgeBorder: 'border-amber-500/30',
    accentGradient: 'from-amber-500 via-yellow-500 to-orange-500',
    shades: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
    },
  },
  {
    id: 'orange',
    name: 'Solar Flame',
    primary: '#f97316',
    hover: '#ea580c',
    ring: '#f97316',
    glowHex: 'rgba(249, 115, 22, 0.55)',
    secondaryGlowHex: 'rgba(251, 146, 60, 0.25)',
    badgeBg: 'bg-orange-500/15',
    badgeText: 'text-orange-700 dark:text-orange-300',
    badgeBorder: 'border-orange-500/30',
    accentGradient: 'from-orange-500 via-amber-500 to-red-500',
    shades: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
      950: '#431407',
    },
  },
  {
    id: 'silver',
    name: 'Titanium Platinum',
    primary: '#94a3b8',
    hover: '#64748b',
    ring: '#94a3b8',
    glowHex: 'rgba(148, 163, 184, 0.45)',
    secondaryGlowHex: 'rgba(203, 213, 225, 0.2)',
    badgeBg: 'bg-slate-500/15',
    badgeText: 'text-slate-700 dark:text-slate-300',
    badgeBorder: 'border-slate-500/30',
    accentGradient: 'from-slate-400 via-slate-500 to-zinc-600',
    shades: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
  },
];

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: 'botanical-dark',
    name: 'Botanical Obsidian',
    description: 'Lush dark botanical foliage with emerald ambience',
    imageUrl: '/botanical-bg.jpg',
    previewGradient: 'linear-gradient(135deg, #062817 0%, #0c1411 50%, #07090e 100%)',
  },
  {
    id: 'botanical-light',
    name: 'Botanical Alabaster',
    description: 'Fresh crisp daytime botanical conservatory',
    imageUrl: '/botanical-light-bg.jpg',
    previewGradient: 'linear-gradient(135deg, #e6f7ef 0%, #f1f5f9 50%, #d1fae5 100%)',
  },
  {
    id: 'cosmic-nebula',
    name: 'Deep Cosmic Nebula',
    description: 'Ultra-deep space stardust with twilight indigo depth',
    cssBackground: 'radial-gradient(ellipse at 20% 30%, #1e1b4b 0%, #0f172a 45%, #07090e 100%)',
    previewGradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #07090e 100%)',
  },
  {
    id: 'cyber-grid',
    name: 'Cyber Horizon',
    description: 'Subtle synthwave vector horizon with ambient aura',
    cssBackground: 'radial-gradient(circle at 50% 10%, rgba(6, 182, 212, 0.22) 0%, transparent 60%), linear-gradient(180deg, #07090e 0%, #020617 100%)',
    previewGradient: 'linear-gradient(135deg, #083344 0%, #0f172a 50%, #07090e 100%)',
  },
  {
    id: 'carbon-monolith',
    name: 'Carbon Monolith',
    description: 'Industrial stealth carbon mesh and brushed obsidian',
    cssBackground: 'radial-gradient(circle at top right, #1e293b 0%, #0f172a 50%, #07090e 100%)',
    previewGradient: 'linear-gradient(135deg, #334155 0%, #1e293b 50%, #0f172a 100%)',
  },
  {
    id: 'aurora-borealis',
    name: 'Atmospheric Aurora',
    description: 'Radiant polar light curtains and ethereal glow',
    cssBackground: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(139, 92, 246, 0.18) 50%, #07090e 100%)',
    previewGradient: 'linear-gradient(135deg, #064e3b 0%, #581c87 50%, #07090e 100%)',
  },
  {
    id: 'pure-dark',
    name: 'Solid Obsidian',
    description: 'Zero wallpaper texture, pure ultra-clean dark workstation',
    cssBackground: 'none',
    previewGradient: 'linear-gradient(135deg, #0f172a 0%, #07090e 100%)',
  },
];

const STORAGE_KEY = 'business_os_personalization_v2';

interface PersonalizationState {
  wallpaperType: 'preset' | 'custom';
  customWallpaperUrl: string | null;
  customWallpaperName: string | null;
  selectedPresetId: string;
  wallpaperBlur: number; // 0 to 32
  wallpaperOpacity: number; // 0.1 to 1.0
  ambientGlowIntensity: number; // 0 to 1.0
  activePaletteId: string;
}

const DEFAULT_STATE: PersonalizationState = {
  wallpaperType: 'preset',
  customWallpaperUrl: null,
  customWallpaperName: null,
  selectedPresetId: 'botanical-dark',
  wallpaperBlur: 0,
  wallpaperOpacity: 0.85,
  ambientGlowIntensity: 0.85,
  activePaletteId: 'emerald',
};

interface PersonalizationContextType extends PersonalizationState {
  activePalette: ColorPlate;
  selectedPreset: WallpaperPreset;
  colorPalettes: ColorPlate[];
  presets: WallpaperPreset[];
  isPersonalizationModalOpen: boolean;
  openPersonalizationModal: () => void;
  closePersonalizationModal: () => void;
  setWallpaperType: (type: 'preset' | 'custom') => void;
  uploadCustomWallpaper: (file: File) => Promise<boolean>;
  removeCustomWallpaper: () => void;
  setSelectedPreset: (presetId: string) => void;
  setWallpaperBlur: (blur: number) => void;
  setWallpaperOpacity: (opacity: number) => void;
  setAmbientGlowIntensity: (intensity: number) => void;
  setColorPalette: (paletteId: string) => void;
  resetToDefaults: () => void;
}

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

// High-speed client-side canvas compressor to keep custom PC images under ~250KB
function compressImage(file: File): Promise<{ dataUrl: string; name: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ dataUrl: e.target?.result as string, name: file.name });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve({ dataUrl, name: file.name });
      };
      img.onerror = () => reject(new Error('Failed to load image file'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file from disk'));
    reader.readAsDataURL(file);
  });
}

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16);
  if (isNaN(bigint)) return '16, 185, 129';
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}

function applyPaletteToCSS(palette: ColorPlate) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // 1. Generic Tokens
  root.style.setProperty('--primary', palette.primary);
  root.style.setProperty('--primary-rgb', hexToRgb(palette.primary));
  root.style.setProperty('--ring', palette.ring);
  root.style.setProperty('--accent-glow', palette.glowHex);
  root.style.setProperty('--accent-hover', palette.hover);

  // 2. Full Palette Spectrum (--palette-* and --color-emerald-*)
  (Object.entries(palette.shades) as [string, string][]).forEach(([shade, hex]) => {
    const rgb = hexToRgb(hex);
    root.style.setProperty(`--palette-${shade}`, hex);
    root.style.setProperty(`--palette-${shade}-rgb`, rgb);
    root.style.setProperty(`--color-emerald-${shade}`, hex);
    root.style.setProperty(`--color-emerald-${shade}-rgb`, rgb);
  });

  // 3. Teal Bridge (used across multi-stop gradients like "from-emerald-500 via-teal-500 to-emerald-600")
  root.style.setProperty('--color-teal-300', palette.shades[300]);
  root.style.setProperty('--color-teal-400', palette.shades[400]);
  root.style.setProperty('--color-teal-500', palette.shades[500]);
  root.style.setProperty('--color-teal-600', palette.shades[600]);
  root.style.setProperty('--color-teal-300-rgb', hexToRgb(palette.shades[300]));
  root.style.setProperty('--color-teal-400-rgb', hexToRgb(palette.shades[400]));
  root.style.setProperty('--color-teal-500-rgb', hexToRgb(palette.shades[500]));
  root.style.setProperty('--color-teal-600-rgb', hexToRgb(palette.shades[600]));
}

export function PersonalizationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersonalizationState>(DEFAULT_STATE);
  const [isPersonalizationModalOpen, setIsPersonalizationModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const openPersonalizationModal = useCallback(() => setIsPersonalizationModalOpen(true), []);
  const closePersonalizationModal = useCallback(() => setIsPersonalizationModalOpen(false), []);

  // Load saved personalization preferences on mount
  useEffect(() => {
    setMounted(true);
    try {
      const savedRaw = localStorage.getItem(STORAGE_KEY);
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        setState((prev) => ({
          ...prev,
          ...parsed,
        }));

        // Apply loaded palette to CSS variables
        const activePal = COLOR_PLATES.find((p) => p.id === parsed.activePaletteId) || COLOR_PLATES[0];
        applyPaletteToCSS(activePal);
      } else {
        applyPaletteToCSS(COLOR_PLATES[0]);
      }
    } catch (err) {
      console.warn('Could not load personalization state from localStorage:', err);
    }
  }, []);

  // Save changes to localStorage
  const saveState = useCallback((updater: (prev: PersonalizationState) => PersonalizationState) => {
    setState((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.warn('Failed to save personalization state to localStorage:', err);
      }
      return next;
    });
  }, []);

  const setWallpaperType = useCallback((type: 'preset' | 'custom') => {
    saveState((prev) => ({ ...prev, wallpaperType: type }));
  }, [saveState]);

  const uploadCustomWallpaper = useCallback(async (file: File): Promise<boolean> => {
    try {
      const { dataUrl, name } = await compressImage(file);
      saveState((prev) => ({
        ...prev,
        wallpaperType: 'custom',
        customWallpaperUrl: dataUrl,
        customWallpaperName: name,
      }));
      return true;
    } catch (err) {
      console.error('Error processing custom wallpaper upload:', err);
      return false;
    }
  }, [saveState]);

  const removeCustomWallpaper = useCallback(() => {
    saveState((prev) => ({
      ...prev,
      wallpaperType: 'preset',
      customWallpaperUrl: null,
      customWallpaperName: null,
    }));
  }, [saveState]);

  const setSelectedPreset = useCallback((presetId: string) => {
    saveState((prev) => ({
      ...prev,
      wallpaperType: 'preset',
      selectedPresetId: presetId,
    }));
  }, [saveState]);

  const setWallpaperBlur = useCallback((blur: number) => {
    saveState((prev) => ({ ...prev, wallpaperBlur: Math.max(0, Math.min(32, blur)) }));
  }, [saveState]);

  const setWallpaperOpacity = useCallback((opacity: number) => {
    saveState((prev) => ({ ...prev, wallpaperOpacity: Math.max(0.1, Math.min(1, opacity)) }));
  }, [saveState]);

  const setAmbientGlowIntensity = useCallback((intensity: number) => {
    saveState((prev) => ({ ...prev, ambientGlowIntensity: Math.max(0, Math.min(1, intensity)) }));
  }, [saveState]);

  const setColorPalette = useCallback((paletteId: string) => {
    const pal = COLOR_PLATES.find((p) => p.id === paletteId) || COLOR_PLATES[0];
    applyPaletteToCSS(pal);
    saveState((prev) => ({ ...prev, activePaletteId: paletteId }));
  }, [saveState]);

  const resetToDefaults = useCallback(() => {
    applyPaletteToCSS(COLOR_PLATES[0]);
    saveState(() => DEFAULT_STATE);
  }, [saveState]);

  const activePalette = COLOR_PLATES.find((p) => p.id === state.activePaletteId) || COLOR_PLATES[0];
  const selectedPreset = WALLPAPER_PRESETS.find((p) => p.id === state.selectedPresetId) || WALLPAPER_PRESETS[0];

  return (
    <PersonalizationContext.Provider
      value={{
        ...state,
        activePalette,
        selectedPreset,
        colorPalettes: COLOR_PLATES,
        presets: WALLPAPER_PRESETS,
        isPersonalizationModalOpen,
        openPersonalizationModal,
        closePersonalizationModal,
        setWallpaperType,
        uploadCustomWallpaper,
        removeCustomWallpaper,
        setSelectedPreset,
        setWallpaperBlur,
        setWallpaperOpacity,
        setAmbientGlowIntensity,
        setColorPalette,
        resetToDefaults,
      }}
    >
      {children}
    </PersonalizationContext.Provider>
  );
}

export function usePersonalization() {
  const ctx = useContext(PersonalizationContext);
  if (!ctx) {
    throw new Error('usePersonalization must be used within PersonalizationProvider');
  }
  return ctx;
}
