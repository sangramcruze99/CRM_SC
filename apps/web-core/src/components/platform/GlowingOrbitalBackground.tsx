'use client';

import React from 'react';
import { useAccessibility } from './AccessibilityContext';
import { useTheme } from './ThemeContext';
import { usePersonalization } from './PersonalizationContext';

export function GlowingOrbitalBackground() {
  const { isPerformanceMode } = useAccessibility();
  const { theme } = useTheme();
  const {
    wallpaperType,
    customWallpaperUrl,
    selectedPreset,
    wallpaperBlur,
    wallpaperOpacity,
    ambientGlowIntensity,
    activePalette,
  } = usePersonalization();

  if (isPerformanceMode) {
    return (
      <div className={`absolute inset-0 pointer-events-none -z-10 ${theme === 'dark' ? 'bg-[#07090e]' : 'bg-[#f1f5f9]'}`} />
    );
  }

  // Determine wallpaper image or CSS background styling
  const isCustom = wallpaperType === 'custom' && !!customWallpaperUrl;
  const wallpaperImage = isCustom ? customWallpaperUrl : selectedPreset.imageUrl;
  const cssBackground = !isCustom ? selectedPreset.cssBackground : undefined;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none bg-[#07090e]">
      {/* 1. Dynamic Wallpaper Layer (Custom PC Upload or Curated Luxury Preset) */}
      {(wallpaperImage || cssBackground) && (
        <div
          className="absolute inset-0 bg-no-repeat transition-all duration-500 will-change-transform"
          style={{
            ...(wallpaperImage
              ? { backgroundImage: `url(${wallpaperImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { background: cssBackground || '#07090e' }),
            opacity: wallpaperOpacity,
            filter: wallpaperBlur > 0 ? `blur(${wallpaperBlur}px)` : undefined,
            transform: wallpaperBlur > 0 ? 'scale(1.05)' : undefined, // prevents boundary clipping on blur
          }}
        />
      )}

      {/* 2. Glassmorphism Mist Overlay with Balanced Readability */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          theme === 'light'
            ? 'bg-gradient-to-b from-white/75 via-white/55 to-white/85'
            : 'bg-gradient-to-b from-black/50 via-black/30 to-black/65'
        } backdrop-blur-[1px]`}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_100%)]" />

      {/* 3. Floating Ambient Aura Orbs - Color-Shifted to Active UI Color Plate */}
      {ambientGlowIntensity > 0 && (
        <>
          <div
            className="absolute -top-[10%] right-[12%] w-[700px] h-[700px] rounded-full blur-[130px] animate-ambient-glow transition-all duration-700 pointer-events-none"
            style={{
              opacity: 0.55 * ambientGlowIntensity,
              background: `radial-gradient(circle, ${activePalette.glowHex} 0%, ${activePalette.secondaryGlowHex} 50%, transparent 75%)`,
              animationDuration: '14s',
            }}
          />
          <div
            className="absolute -bottom-[12%] left-[6%] w-[650px] h-[650px] rounded-full blur-[140px] animate-ambient-glow transition-all duration-700 pointer-events-none"
            style={{
              opacity: 0.45 * ambientGlowIntensity,
              background: `radial-gradient(circle, ${activePalette.secondaryGlowHex} 0%, ${activePalette.glowHex} 50%, transparent 75%)`,
              animationDuration: '18s',
              animationDelay: '3s',
            }}
          />
          <div
            className="absolute top-[40%] right-[35%] w-[500px] h-[500px] rounded-full blur-[160px] animate-ambient-glow transition-all duration-700 pointer-events-none"
            style={{
              opacity: 0.35 * ambientGlowIntensity,
              background: `radial-gradient(circle, ${activePalette.glowHex} 0%, transparent 70%)`,
              animationDuration: '22s',
              animationDelay: '5s',
            }}
          />
        </>
      )}
    </div>
  );
}
