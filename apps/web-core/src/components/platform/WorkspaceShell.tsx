'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarNav } from '../SidebarNav';
import { GlobalSearch } from '../GlobalSearch';
import { AskAICopilot } from '../AskAICopilot';
import { UserNav } from '../UserNav';
import { IndustrySwitcher } from '../industry/IndustrySwitcher';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { PersonalizationToggle } from './PersonalizationToggle';
import { PersonalizationModal } from './PersonalizationModal';
import { usePersonalization } from './PersonalizationContext';
import { SidebarToggle } from './SidebarToggle';
import { CreditUsageDrawer } from '../billing/CreditUsageDrawer';
import { GlowingOrbitalBackground } from './GlowingOrbitalBackground';

import { NativeAppTitlebar } from './NativeAppTitlebar';
import { CommandPalette } from './CommandPalette';
import { MobileAppDock } from './MobileAppDock';
import { AIAutomationConsole } from '../automations/AIAutomationConsole';
import { AgentApprovalsWidget } from './AgentApprovalsWidget';
import { DocumentVaultTopBarWidget } from './DocumentVaultTopBarWidget';
import { ContextualAgentModal } from '../ai/ContextualAgentModal';
import { useIndustry } from '../industry/IndustryContext';
import { resolveBreadcrumbs } from '@/lib/navigation.config';

const AUTH_ROUTES = ['/login', '/register'];

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { nicheConfig } = useIndustry();
  const { isPersonalizationModalOpen, closePersonalizationModal } = usePersonalization();
  const isAuthPage = AUTH_ROUTES.includes(pathname);
  const isMarketingPage = pathname === '/';
  const breadcrumb = resolveBreadcrumbs(pathname, nicheConfig);

  // If on Landing Homepage, render clean full-screen layout without internal CRM sidebar
  if (isMarketingPage) {
    return <>{children}</>;
  }

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
    <div className="flex flex-col h-screen h-[100dvh] w-screen max-w-full overflow-hidden bg-[#07090e] relative">
      {/* Native Desktop Window Header Bar */}
      <NativeAppTitlebar />

      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* Dynamic Niche-Adapted & Role-Filtered Dark Frosted Sidebar */}
        <SidebarNav />

        {/* Glowing Cosmic Orbital Background */}
        <GlowingOrbitalBackground />

        {/* Main Workspace Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-transparent relative z-10 min-h-0">
          {/* Floating Frosted Glass Topbar */}
          <header className="h-14 border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-4 sm:px-6 bg-white/85 dark:bg-[#0c1411]/75 backdrop-blur-3xl z-20 shadow-xs dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)] shrink-0 gap-3">
            {/* Zone 1: Context & Dynamic Breadcrumb */}
            <div className="flex items-center space-x-2.5 text-sm font-medium text-slate-700 dark:text-slate-400 shrink-0">
              <SidebarToggle />
              <div className="flex items-center text-xs sm:text-sm">
                <Link
                  href={breadcrumb.domainHref || "/dashboard"}
                  title="Go to Executive Dashboard"
                  className="text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors font-bold truncate max-w-[120px] sm:max-w-none"
                >
                  {breadcrumb.domainTitle}
                </Link>
                {breadcrumb.pageTitle && (
                  <>
                    <span className="mx-1.5 sm:mx-2 text-slate-400 dark:text-slate-600">/</span>
                    <span
                      className="text-slate-900 dark:text-white font-extrabold truncate max-w-[140px] sm:max-w-none"
                      title={breadcrumb.pageTitle}
                    >
                      {breadcrumb.pageTitle}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Zone 2: Spotlight Omnibox Search */}
            <div className="hidden md:flex items-center justify-center flex-1 max-w-xs lg:max-w-md mx-2">
              <GlobalSearch />
            </div>

            {/* Zone 3: Workstations, Preferences & Account */}
            <div className="flex items-center space-x-2 shrink-0">
              {/* Workstation Quick Hubs */}
              <div className="flex items-center space-x-1.5">
                <IndustrySwitcher />
                <AgentApprovalsWidget />
                <AIAutomationConsole />
                <DocumentVaultTopBarWidget />
              </div>

              <div className="h-5 w-px bg-slate-200 dark:bg-white/10 mx-0.5 hidden sm:block" />

              {/* Segmented Preferences Cluster */}
              <div className="flex items-center space-x-1">
                <ThemeToggle />
                <PersonalizationToggle />
                <LanguageSwitcher />
              </div>

              <div className="h-5 w-px bg-slate-200 dark:bg-white/10 mx-0.5" />

              {/* Account & Metered Credits */}
              <UserNav />
            </div>
          </header>

          {/* Main View Container */}
          {(() => {
            const isAutomationRoute = pathname?.startsWith('/automation');
            const isAiRoute = pathname?.startsWith('/ai');
            const isSiteBuilderRoute = pathname?.startsWith('/site-builder');
            const isFullBleedRoute = isAiRoute || isSiteBuilderRoute;

            if (isAutomationRoute) {
              return (
                <div className="flex-1 min-h-0 h-full flex flex-col overflow-hidden p-0 relative">
                  {children}
                </div>
              );
            }

            if (isFullBleedRoute) {
              return (
                <div className="flex-1 min-h-0 overflow-auto p-0 pb-16 relative">
                  {children}
                </div>
              );
            }

            return (
              <div className="flex-1 min-h-0 overflow-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
                {children}
              </div>
            );
          })()}

          <AskAICopilot />
          <CreditUsageDrawer />
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K / Cmd+K) */}
      <CommandPalette />

      {/* Contextual Human-Centered AI Agent Modal */}
      <ContextualAgentModal />

      {/* Mobile/Tablet Floating App Dock */}
      <MobileAppDock />

      {/* Appearance & Personalization Settings Modal */}
      <PersonalizationModal
        isOpen={isPersonalizationModalOpen}
        onClose={closePersonalizationModal}
      />
    </div>
  );
}
