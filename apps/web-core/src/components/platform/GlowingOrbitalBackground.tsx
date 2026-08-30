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
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none bg-[#f1f5f9]">
        {/* Soft Porcelain Morning Glow */}
        <div
          className="absolute -top-[10%] right-[10%] w-[550px] h-[550px] rounded-full blur-[140px] opacity-25 animate-ambient-glow"
          style={{
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, rgba(217, 119, 6, 0.1) 60%, transparent 80%)',
            animationDuration: '14s',
          }}
        />
        <div
          className="absolute -bottom-[15%] left-[8%] w-[600px] h-[600px] rounded-full blur-[160px] opacity-20 animate-ambient-glow"
          style={{
            background: 'radial-gradient(circle, rgba(234, 88, 12, 0.25) 0%, rgba(180, 83, 9, 0.08) 60%, transparent 80%)',
            animationDuration: '18s',
            animationDelay: '3s',
          }}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none bg-[#07090e]">
      {/* 1. Deep Luxury Obsidian Base */}
      <div className="absolute inset-0 bg-[#07090e]" />

      {/* 2. Soft, Subtle Warm Amber Floating Glow (Top-Right) */}
      <div
        className="absolute -top-[10%] right-[10%] w-[550px] h-[550px] rounded-full blur-[140px] opacity-15 animate-ambient-glow"
        style={{
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.7) 0%, rgba(217, 119, 6, 0.2) 60%, transparent 80%)',
          animationDuration: '14s',
        }}
      />

      {/* 3. Soft, Subtle Dark Bronze/Orange Floating Glow (Bottom-Left) */}
      <div
        className="absolute -bottom-[15%] left-[8%] w-[600px] h-[600px] rounded-full blur-[160px] opacity-12 animate-ambient-glow"
        style={{
          background: 'radial-gradient(circle, rgba(234, 88, 12, 0.6) 0%, rgba(180, 83, 9, 0.15) 60%, transparent 80%)',
          animationDuration: '18s',
          animationDelay: '3s',
        }}
      />
    </div>
  );
}
