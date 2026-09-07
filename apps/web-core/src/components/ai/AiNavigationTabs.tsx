'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  Users,
  CheckCircle2,
  Activity,
  Workflow,
  BarChart3,
  Shield,
} from 'lucide-react';

interface TabItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
}

interface AiNavigationTabsProps {
  pendingApprovalsCount?: number;
}

export function AiNavigationTabs({ pendingApprovalsCount = 0 }: AiNavigationTabsProps) {
  const pathname = usePathname();

  const tabs: TabItem[] = [
    { label: 'Overview', href: '/ai', icon: Sparkles },
    { label: 'My AI Team', href: '/ai/team', icon: Users },
    {
      label: 'Approvals',
      href: '/ai/approvals',
      icon: CheckCircle2,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
    },
    { label: 'Activity', href: '/ai/activity', icon: Activity },
    { label: 'Automations', href: '/ai/automations', icon: Workflow },
    { label: 'Usage & Limits', href: '/ai/usage', icon: BarChart3 },
    { label: 'Trust & Privacy', href: '/ai/trust', icon: Shield },
  ];

  return (
    <div className="border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0c1411]/95 backdrop-blur-2xl sticky top-0 z-20 px-4 md:px-8 shadow-xs">
      <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 font-mono animate-pulse">
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
