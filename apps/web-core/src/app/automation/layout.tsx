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

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-30 px-6 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-base tracking-tight text-white">AI Automation OS</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Engine v2.5
                </span>
              </div>
              <p className="text-xs text-slate-400">Autonomous business workflow orchestration, AI swarms & HITL controls</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <Link
              href="/automation/workflows/new"
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition shadow-md shadow-emerald-500/25"
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>New Workflow</span>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center space-x-1 mt-3.5 overflow-x-auto scrollbar-none pt-1">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
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

      {/* Main Body Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
