'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AutomationNavigationTabs } from '@/components/automation/AutomationNavigationTabs';

export default function AutomationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWorkflowCanvas = pathname?.startsWith('/automation/workflows/') && pathname !== '/automation/workflows/new';

  // In visual canvas studio, render full-bleed without outer layout padding or navigation tabs
  if (isWorkflowCanvas) {
    return (
      <div className="h-full w-full bg-[#060B08] text-slate-100 overflow-hidden flex flex-col flex-1 min-h-0">
        {children}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans w-full">
      <AutomationNavigationTabs />
      {children}
    </div>
  );
}
