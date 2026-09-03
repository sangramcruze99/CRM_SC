'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-[#0e1613]/90 dark:bg-[#0c1411]/95 text-slate-100 rounded-3xl border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_0_1px_rgba(45,212,191,0.15)] overflow-hidden backdrop-blur-3xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-white/[0.03]">
          <Search size={18} className="text-emerald-400 shrink-0" />
          <input
            type="text"
            placeholder="Type a command, search pages, or trigger an action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent border-none outline-hidden text-sm font-medium text-white placeholder:text-slate-400 focus:ring-0"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-white/10 border border-white/15 rounded-md">
            ESC
          </kbd>
          <button
            onClick={() => setIsOpen(false)}
            className="sm:hidden p-1 text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results List Container */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No matching commands found for <span className="text-emerald-400 font-mono">"{searchQuery}"</span>
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
                      ? 'bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-emerald-500/10 border border-emerald-500/40 text-white shadow-inner'
                      : 'hover:bg-white/[0.04] text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-[0_0_10px_rgba(45,212,191,0.3)]'
                          : 'bg-white/[0.06] border-white/10 text-slate-300'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-bold block leading-tight truncate">{item.title}</span>
                      <span className="text-[11px] text-slate-400 block leading-tight truncate mt-0.5">
                        {item.subtitle}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-400 border border-white/10">
                      {item.category}
                    </span>
                    {item.shortcut && (
                      <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-emerald-400 font-bold">
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
        <div className="px-5 py-2.5 bg-white/[0.02] border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="font-mono text-[9px] px-1 bg-white/10 rounded">↑</kbd>
              <kbd className="font-mono text-[9px] px-1 bg-white/10 rounded">↓</kbd> to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono text-[9px] px-1 bg-white/10 rounded">↵</kbd> to select
            </span>
          </div>
          <span className="text-emerald-400 font-medium">Business OS Spotlight</span>
        </div>
      </div>
    </div>
  );
}
