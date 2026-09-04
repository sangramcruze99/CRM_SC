'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarNav } from '../SidebarNav';
import { GlobalSearch } from '../GlobalSearch';
import { AskAICopilot } from '../AskAICopilot';
import { UserNav } from '../UserNav';
import { IndustrySwitcher } from '../industry/IndustrySwitcher';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { SidebarToggle, FullscreenToggle } from './SidebarToggle';
import { CreditUsageDrawer } from '../billing/CreditUsageDrawer';
import { GlowingOrbitalBackground } from './GlowingOrbitalBackground';

import { NativeAppTitlebar } from './NativeAppTitlebar';
import { CommandPalette } from './CommandPalette';
import { MobileAppDock } from './MobileAppDock';

const AUTH_ROUTES = ['/login', '/register'];

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.includes(pathname);

  // If on Login or Register auth pages, render pure full-screen layout with zero sidebars
  if (isAuthPage) {
    return (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {/* Ambient Glowing Background */}
        <GlowingOrbitalBackground />

        {/* Top-right theme & language switcher for auth page */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>

        {/* Full-screen auth container */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          {children}
        </div>
      </div>
    );
  }

  // Authenticated workspace view with full SidebarNav, Topbar, AI Copilot, and Metering
  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-transparent relative">
      {/* Native Desktop Window Header Bar */}
      <NativeAppTitlebar />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Dynamic Niche-Adapted & Role-Filtered Dark Frosted Sidebar */}
        <SidebarNav />

        {/* Glowing Cosmic Orbital Background */}
        <GlowingOrbitalBackground />

        {/* Main Workspace Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-transparent relative z-10">
          {/* Floating Frosted Glass Topbar */}
          <header className="h-14 border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-5 sm:px-8 bg-white/85 dark:bg-[#0c1411]/75 backdrop-blur-3xl z-20 shadow-xs dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)] shrink-0">
            <div className="flex items-center space-x-3 text-sm font-medium text-slate-700 dark:text-slate-400">
              <SidebarToggle />
              <div className="flex items-center">
                <span className="text-slate-700 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer font-bold">Business OS</span>
                <span className="mx-2 text-slate-400 dark:text-slate-600">/</span>
                <span className="text-slate-900 dark:text-white font-extrabold">Workspace</span>
              </div>
            </div>
            <div className="flex items-center space-x-2.5">
              <FullscreenToggle />
              <ThemeToggle />
              <LanguageSwitcher />
              <IndustrySwitcher />
              <GlobalSearch />
              <div className="h-5 w-px bg-slate-300 dark:bg-white/10" />
              <UserNav />
            </div>
          </header>

          {/* Main View Container */}
          <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">{children}</div>

          <AskAICopilot />
          <CreditUsageDrawer />
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K / Cmd+K) */}
      <CommandPalette />

      {/* Mobile/Tablet Floating App Dock */}
      <MobileAppDock />
    </div>
  );
}
