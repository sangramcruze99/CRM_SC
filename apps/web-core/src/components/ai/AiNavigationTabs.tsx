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
    <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 overflow-x-auto shrink-0 w-full mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition cursor-pointer ${
              isActive
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
            }`}
          >
            <Icon size={14} />
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                  isActive
                    ? 'bg-zinc-950 text-emerald-400'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
