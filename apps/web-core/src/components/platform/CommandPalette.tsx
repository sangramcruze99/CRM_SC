'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  Search,
  Command,
  TrendingUp,
  Receipt,
  Users,
  Briefcase,
  Layers,
  Sparkles,
  Settings,
  Bot,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  Plus,
  Moon,
  Sun,
  Maximize2,
  X,
  FileText,
  Activity,
  Zap,
} from 'lucide-react';
import { useTheme } from './ThemeContext';

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'NAVIGATION' | 'ACTIONS' | 'SYSTEM' | 'AI';
  icon: React.ReactNode;
  href?: string;
  action?: () => void;
  shortcut?: string;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const commandItems: CommandItem[] = [
    // Navigation
    {
      id: 'nav-dashboard',
      title: 'Glass Cockpit & Dashboard',
      subtitle: 'Overview of business metrics, balance, and quick actions',
      category: 'NAVIGATION',
      icon: <Layers size={16} className="text-emerald-400" />,
      href: '/dashboard',
      shortcut: 'G D',
    },
    {
      id: 'nav-deals',
      title: 'Sales Pipeline & Deals',
      subtitle: 'Manage active deal stages and pipeline revenue',
      category: 'NAVIGATION',
      icon: <TrendingUp size={16} className="text-teal-400" />,
      href: '/deals',
      shortcut: 'G S',
    },
    {
      id: 'nav-invoices',
      title: 'Invoices & Commercial Billing',
      subtitle: 'Generate client invoices, view ledger, and billing statuses',
      category: 'NAVIGATION',
      icon: <Receipt size={16} className="text-emerald-400" />,
      href: '/invoices',
      shortcut: 'G I',
    },
    {
      id: 'nav-contacts',
      title: 'Contacts & Client CRM',
      subtitle: 'Search customer accounts, stakeholders, and leads',
      category: 'NAVIGATION',
      icon: <Users size={16} className="text-cyan-400" />,
      href: '/contacts',
      shortcut: 'G C',
    },
    {
      id: 'nav-banking',
      title: 'Payments & Treasury Ledger',
      subtitle: 'Bank accounts, payout transfers, and payment gateways',
      category: 'NAVIGATION',
      icon: <CreditCard size={16} className="text-emerald-400" />,
      href: '/banking',
      shortcut: 'G P',
    },
    {
      id: 'nav-projects',
      title: 'Project Kanban & Sprints',
      subtitle: 'Sprint delivery boards, milestone trackers, and tasks',
      category: 'NAVIGATION',
      icon: <Briefcase size={16} className="text-teal-400" />,
      href: '/projects',
      shortcut: 'G K',
    },
    {
      id: 'nav-forecast',
      title: 'Cash Flow & Revenue Forecast',
      subtitle: 'Financial runway, receivables, and profit analysis',
      category: 'NAVIGATION',
      icon: <Activity size={16} className="text-emerald-400" />,
      href: '/forecast',
    },
    {
      id: 'nav-tickets',
      title: 'Helpdesk & SLA Tickets',
      subtitle: 'Customer inquiries, triage queue, and SLA response',
      category: 'NAVIGATION',
      icon: <MessageSquare size={16} className="text-cyan-400" />,
      href: '/tickets',
    },
    {
      id: 'nav-ai',
      title: 'Autonomous AI Studio',
      subtitle: 'LLM agents, vector knowledge, and autonomous copilot',
      category: 'AI',
      icon: <Sparkles size={16} className="text-emerald-400" />,
      href: '/ai-studio',
      shortcut: '⌘ J',
    },
    {
      id: 'nav-automations',
      title: 'Workflow Automations',
      subtitle: 'Visual node triggers, webhooks, and background workers',
      category: 'AI',
      icon: <Zap size={16} className="text-teal-400" />,
      href: '/automations',
    },
    {
      id: 'nav-settings',
      title: 'Workspace Settings & Taxes',
      subtitle: 'Tax rates, API keys, compliance, and billing tiers',
      category: 'SYSTEM',
      icon: <Settings size={16} className="text-slate-400" />,
      href: '/settings',
      shortcut: '⌘ ,',
    },
    // Quick Actions
    {
      id: 'action-new-deal',
      title: 'Create New Deal Opportunity',
      subtitle: 'Open deals pipeline modal to add lead',
      category: 'ACTIONS',
      icon: <Plus size={16} className="text-emerald-400" />,
      action: () => router.push('/deals'),
    },
    {
      id: 'action-new-invoice',
      title: 'Issue Commercial Invoice',
      subtitle: 'Create a new client invoice draft',
      category: 'ACTIONS',
      icon: <Plus size={16} className="text-teal-400" />,
      action: () => router.push('/invoices'),
    },
    {
      id: 'action-theme-toggle',
      title: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      subtitle: 'Toggle between botanical glass dark and alabaster light theme',
      category: 'SYSTEM',
      icon: theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-indigo-400" />,
      action: () => toggleTheme(),
      shortcut: '⌘ T',
    },
  ];

  const filteredItems = commandItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = useCallback(
    (item: CommandItem) => {
      setIsOpen(false);
      setSearchQuery('');
      if (item.action) {
        item.action();
      } else if (item.href) {
        router.push(item.href);
      }
    },
    [router]
  );

  // Keyboard listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      } else if (isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
        } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
          e.preventDefault();
          handleSelect(filteredItems[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, handleSelect]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 sm:pt-28 px-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-150"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl bg-white/95 dark:bg-gradient-to-b dark:from-slate-900/95 dark:via-slate-950/98 dark:to-slate-950/99 text-slate-900 dark:text-white rounded-3xl border border-slate-200 dark:border-white/[0.14] shadow-[0_25px_70px_rgba(0,0,0,0.25),0_0_0_1px_rgba(16,185,129,0.15)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(16,185,129,0.15)] overflow-hidden backdrop-blur-2xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Specular Glow Lines */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent pointer-events-none" />
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-emerald-500/10 blur-3xl rounded-full" />

        {/* Top Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-white/[0.08] bg-slate-50/80 dark:bg-black/30 relative z-10">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Type a command, jump to page, or trigger action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent border-none outline-none text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-0"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-200/80 dark:bg-white/[0.08] border border-slate-300 dark:border-white/[0.12] rounded-lg">
            ESC
          </kbd>
          <button
            onClick={() => setIsOpen(false)}
            className="sm:hidden p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.08] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results List Container */}
        <div className="max-h-[380px] overflow-y-auto p-2.5 space-y-1 relative z-10">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs">
              No matching commands found for <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">"{searchQuery}"</span>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-emerald-500/15 dark:bg-gradient-to-r dark:from-emerald-500/20 dark:via-teal-500/15 dark:to-emerald-500/10 border border-emerald-500/40 text-slate-950 dark:text-white shadow-xs'
                      : 'hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-800 dark:text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                          : 'bg-slate-100 dark:bg-black/40 border-slate-200 dark:border-white/[0.1] text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-bold block leading-tight truncate text-slate-900 dark:text-white">{item.title}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight truncate mt-0.5 font-medium">
                        {item.subtitle}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] text-emerald-800 dark:text-emerald-300 border border-slate-200 dark:border-emerald-500/20">
                      {item.category}
                    </span>
                    {item.shortcut && (
                      <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded-lg bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/[0.14] text-emerald-700 dark:text-emerald-400 font-bold shadow-2xs">
                        {item.shortcut}
                      </kbd>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Legend */}
        <div className="px-5 py-3 bg-slate-50/80 dark:bg-black/40 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 relative z-10">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-medium">
              <kbd className="font-mono text-[9px] px-1.5 py-0.5 bg-slate-200 dark:bg-white/[0.08] border border-slate-300 dark:border-white/[0.1] rounded-md text-slate-700 dark:text-slate-300 font-bold">↑</kbd>
              <kbd className="font-mono text-[9px] px-1.5 py-0.5 bg-slate-200 dark:bg-white/[0.08] border border-slate-300 dark:border-white/[0.1] rounded-md text-slate-700 dark:text-slate-300 font-bold">↓</kbd> to navigate
            </span>
            <span className="flex items-center gap-1 font-medium">
              <kbd className="font-mono text-[9px] px-1.5 py-0.5 bg-slate-200 dark:bg-white/[0.08] border border-slate-300 dark:border-white/[0.1] rounded-md text-slate-700 dark:text-slate-300 font-bold">↵</kbd> to select
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 inline-block animate-pulse" />
            <span className="text-emerald-700 dark:text-emerald-400 font-bold text-xs">Business OS Spotlight</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
