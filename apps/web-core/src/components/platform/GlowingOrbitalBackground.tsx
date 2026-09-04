'use client';

import React from 'react';
import { useAccessibility } from './AccessibilityContext';
import { useTheme } from './ThemeContext';

export function GlowingOrbitalBackground() {
  const { isPerformanceMode } = useAccessibility();
  const { theme } = useTheme();

  if (isPerformanceMode) {
    return (
      <div className={`absolute inset-0 pointer-events-none -z-10 ${theme === 'dark' ? 'bg-[#07090e]' : 'bg-[#f1f5f9]'}`} />
    );
  }

  if (theme === 'light') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
        {/* 1. Lush Light Botanical Morning Wallpaper */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90 transition-opacity duration-700"
          style={{ backgroundImage: "url('/botanical-light-bg.jpg')" }}
        />

        {/* 2. Soft Alabaster Translucent Mist with Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/80 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(241,245,249,0.4)_100%)]" />

        {/* 3. Fresh Emerald & Mint Morning Aura Orbs */}
        <div
          className="absolute -top-[10%] right-[10%] w-[600px] h-[600px] rounded-full blur-[130px] opacity-45 animate-ambient-glow"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.45) 0%, rgba(52, 211, 153, 0.18) 60%, transparent 80%)',
            animationDuration: '14s',
          }}
        />
        <div
          className="absolute -bottom-[15%] left-[8%] w-[650px] h-[650px] rounded-full blur-[150px] opacity-40 animate-ambient-glow"
          style={{
            background: 'radial-gradient(circle, rgba(45, 212, 191, 0.35) 0%, rgba(20, 184, 166, 0.12) 60%, transparent 80%)',
            animationDuration: '18s',
            animationDelay: '3s',
          }}
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none bg-[#07090e]">
      {/* 1. Lush Dark Botanical Wallpaper Base */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-85 transition-opacity duration-700"
        style={{ backgroundImage: "url('/botanical-bg.jpg')" }}
      />

      {/* 2. Deep Moody Forest Overlay with Balanced Translucency */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/60 backdrop-blur-[1px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />

      {/* 3. Radiant Emerald & Mint Floating Ambient Aura Orbs */}
      <div
        className="absolute -top-[10%] right-[12%] w-[700px] h-[700px] rounded-full blur-[130px] opacity-50 animate-ambient-glow"
        style={{
          background: 'radial-gradient(circle, rgba(52, 211, 153, 0.55) 0%, rgba(16, 185, 129, 0.25) 50%, transparent 75%)',
          animationDuration: '14s',
        }}
      />
      <div
        className="absolute -bottom-[12%] left-[6%] w-[650px] h-[650px] rounded-full blur-[140px] opacity-40 animate-ambient-glow"
        style={{
          background: 'radial-gradient(circle, rgba(45, 212, 191, 0.45) 0%, rgba(5, 150, 105, 0.2) 50%, transparent 75%)',
          animationDuration: '18s',
          animationDelay: '3s',
        }}
      />
      <div
        className="absolute top-[40%] right-[40%] w-[500px] h-[500px] rounded-full blur-[160px] opacity-30 animate-ambient-glow"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, rgba(6, 95, 70, 0.15) 60%, transparent 80%)',
          animationDuration: '22s',
          animationDelay: '5s',
        }}
      />
    </div>
  );
}
