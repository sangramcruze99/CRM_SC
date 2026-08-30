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
    <>
      {/* Dynamic Niche-Adapted & Role-Filtered Dark Frosted Sidebar */}
      <SidebarNav />

      {/* Glowing Cosmic Orbital Background */}
      <GlowingOrbitalBackground />

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-transparent relative z-0">
        {/* Floating Frosted Glass Topbar */}
        <header className="h-16 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between px-6 sm:px-8 bg-white/80 dark:bg-slate-950/60 backdrop-blur-2xl z-10 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
          <div className="flex items-center space-x-3 text-sm font-medium text-slate-500 dark:text-slate-400">
            <SidebarToggle />
            <div className="flex items-center">
              <span className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer font-medium">Business OS</span>
              <span className="mx-2 text-slate-400 dark:text-slate-600">/</span>
              <span className="text-slate-900 dark:text-white font-bold">Workspace</span>
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
        <div className="flex-1 overflow-auto p-6 sm:p-8">{children}</div>

        <AskAICopilot />
        <CreditUsageDrawer />
      </main>
    </>
  );
}
