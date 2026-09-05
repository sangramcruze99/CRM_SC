'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Workflow,
  Sparkles,
  ShieldAlert,
  Activity,
  Layers,
  Bot,
  Wrench,
  ArrowRightLeft,
  LayoutDashboard,
} from 'lucide-react';

const NAV_TABS = [
  { href: '/automation', label: 'Command Center', icon: LayoutDashboard, exact: true },
  { href: '/automation/workflows', label: 'Workflows', icon: Workflow },
  { href: '/automation/templates', label: 'Templates', icon: Layers },
  { href: '/automation/executions', label: 'Executions & Logs', icon: Activity },
  { href: '/automation/approvals', label: 'Approvals (HITL)', icon: ShieldAlert },
  { href: '/automation/agents', label: 'AI Agents', icon: Bot },
  { href: '/automation/tools', label: 'Tool Registry', icon: Wrench },
  { href: '/automation/connectors', label: 'Connectors', icon: ArrowRightLeft },
];

export default function AutomationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWorkflowCanvas = pathname?.includes('/automation/workflows/') && pathname !== '/automation/workflows';

  // When inside visual workflow studio canvas, render full-screen workspace without duplicate marketing header
  if (isWorkflowCanvas) {
    return <div className="h-full w-full bg-slate-950 text-slate-100 overflow-hidden flex flex-col">{children}</div>;
  }

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Header: Cleanly anchored, not floating or collapsing */}
      <header className="border-b border-white/10 bg-slate-900/95 backdrop-blur-xl shrink-0 px-6 py-3 shadow-md z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black shrink-0">
              <Sparkles className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-sm tracking-tight text-white">AI Automation OS</h1>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Engine v2.5
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Autonomous business workflow orchestration, AI swarms &amp; HITL controls</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <Link
              href="/automation/workflows/new"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20"
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>New Workflow</span>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center space-x-1 mt-2.5 overflow-x-auto scrollbar-none">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Main Body Content: Dedicated single scrollable viewport */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
    </div>
  );
}
