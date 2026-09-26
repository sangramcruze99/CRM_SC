'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Workflow,
  ShieldAlert,
  Activity,
  Layers,
  Bot,
  Network,
  Wrench,
  ArrowRightLeft,
  LayoutDashboard,
  Plus,
} from 'lucide-react';

interface TabItem {
  label: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
  badge?: string | number;
}

export function AutomationNavigationTabs() {
  const pathname = usePathname();
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);

  useEffect(() => {
    fetch('/api/automation/approvals?status=PENDING')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) {
          setPendingApprovalsCount(data.length);
        }
      })
      .catch(() => {});
  }, []);

  const tabs: TabItem[] = [
    { label: 'Command Center', href: '/automation', icon: LayoutDashboard, exact: true },
    { label: 'Workflows', href: '/automation/workflows', icon: Workflow },
    { label: 'Templates', href: '/automation/templates', icon: Layers },
    { label: 'Executions & Logs', href: '/automation/executions', icon: Activity },
    {
      label: 'Approvals (HITL)',
      href: '/automation/approvals',
      icon: ShieldAlert,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
    },
    { label: 'AI Agents', href: '/automation/agents', icon: Bot },
    { label: 'Agent Tree', href: '/automation/agents/tree', icon: Network, exact: true },
    { label: 'Tool Registry', href: '/automation/tools', icon: Wrench },
    { label: 'Connectors', href: '/automation/connectors', icon: ArrowRightLeft },
  ];

  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] pb-3 overflow-x-auto shrink-0 w-full mb-6">
      {/* Segmented Pill Tabs */}
      <nav className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.href === '/automation/agents'
              ? pathname.startsWith('/automation/agents') && pathname !== '/automation/agents/tree'
              : tab.exact
              ? pathname === tab.href
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                  : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-zinc-950' : 'text-zinc-400'} />
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
      </nav>

      {/* Quick Action */}
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/automation/workflows/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs transition shadow-md shadow-emerald-500/20 cursor-pointer"
        >
          <Plus size={13} strokeWidth={3} />
          <span>New Workflow</span>
        </Link>
      </div>
    </div>
  );
}
