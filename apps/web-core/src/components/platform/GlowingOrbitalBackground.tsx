'use client';

import React from 'react';
import { useAccessibility } from './AccessibilityContext';
import { useTheme } from './ThemeContext';

export function GlowingOrbitalBackground() {
  const { isPerformanceMode } = useAccessibility();
  const { theme } = useTheme();

  if (isPerformanceMode) {
    return (
      <div className={`fixed inset-0 pointer-events-none -z-10 ${theme === 'dark' ? 'bg-[#07090e]' : 'bg-[#f1f5f9]'}`} />
    );
  }

  if (theme === 'light') {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none">
        {/* 1. Lush Light Botanical Morning Wallpaper */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
          style={{ backgroundImage: "url('/botanical-light-bg.jpg')" }}
        />

        {/* 2. Soft Alabaster Translucent Mist with Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/60 to-white/85 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(241,245,249,0.5)_100%)]" />

        {/* 3. Fresh Emerald & Mint Morning Aura Orbs */}
        <div
          className="absolute -top-[10%] right-[10%] w-[550px] h-[550px] rounded-full blur-[140px] opacity-35 animate-ambient-glow"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(52, 211, 153, 0.1) 60%, transparent 80%)',
            animationDuration: '14s',
          }}
        />
        <div
          className="absolute -bottom-[15%] left-[8%] w-[600px] h-[600px] rounded-full blur-[160px] opacity-30 animate-ambient-glow"
          style={{
            background: 'radial-gradient(circle, rgba(45, 212, 191, 0.25) 0%, rgba(20, 184, 166, 0.08) 60%, transparent 80%)',
            animationDuration: '18s',
            animationDelay: '3s',
          }}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none">
      {/* 1. Lush Dark Botanical Wallpaper Base */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
        style={{ backgroundImage: "url('/botanical-bg.jpg')" }}
      />

      {/* 2. Deep Moody Forest Overlay with Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/80 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)]" />

      {/* 3. Soft Subtle Emerald & Mint Floating Ambient Glows */}
      <div
        className="absolute -top-[10%] right-[15%] w-[650px] h-[650px] rounded-full blur-[140px] opacity-25 animate-ambient-glow"
        style={{
          background: 'radial-gradient(circle, rgba(52, 211, 153, 0.45) 0%, rgba(16, 185, 129, 0.15) 60%, transparent 80%)',
          animationDuration: '14s',
        }}
      />
      <div
        className="absolute -bottom-[15%] left-[8%] w-[600px] h-[600px] rounded-full blur-[160px] opacity-20 animate-ambient-glow"
        style={{
          background: 'radial-gradient(circle, rgba(45, 212, 191, 0.35) 0%, rgba(5, 150, 105, 0.12) 60%, transparent 80%)',
          animationDuration: '18s',
          animationDelay: '3s',
        }}
      />
    </div>
  );
}
