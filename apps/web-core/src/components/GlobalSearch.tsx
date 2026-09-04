"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Briefcase,
  Users,
  Ticket,
  Contact,
  Folder,
  Loader2,
  Sparkles,
  Scan,
  Database,
  Receipt,
  FileSignature,
  DollarSign,
  ArrowRight,
  Terminal,
  Zap,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRoleWorkspace, WorkspaceRole } from "./platform/RoleWorkspaceContext";

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'COMMAND' | 'PAGE' | 'RECORD';
  url?: string;
  action?: () => void;
  icon: any;
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { setRole } = useRoleWorkspace();

  useEffect(() => {
    setMounted(true);
  }, []);

  const QUICK_COMMANDS: CommandItem[] = [
    {
      id: 'cmd-ocr',
      title: 'Scan Invoice with Neural OCR',
      subtitle: 'Upload or capture physical document & extract line items',
      type: 'COMMAND',
      url: '/ocr-invoice',
      icon: Scan,
    },
    {
      id: 'cmd-leads',
      title: 'Open B2B Lead Prospector',
      subtitle: 'Search & import Apollo/ZoomInfo leads to CRM',
      type: 'COMMAND',
      url: '/lead-prospector',
      icon: Database,
    },
    {
      id: 'cmd-sales-role',
      title: 'Switch to Sales & Growth Workspace',
      subtitle: 'Filter navigation for deals, contacts & outbound marketing',
      type: 'COMMAND',
      action: () => setRole('sales'),
      icon: Briefcase,
    },
    {
      id: 'cmd-finance-role',
      title: 'Switch to Finance & Legal Operations',
      subtitle: 'Filter navigation for Khata ledger, invoices & NDAs',
      type: 'COMMAND',
      action: () => setRole('finance'),
      icon: Receipt,
    },
    {
      id: 'cmd-admin-role',
      title: 'Switch to Developer & Platform Admin',
      subtitle: 'Filter navigation for schema builder, RBAC & API keys',
      type: 'COMMAND',
      action: () => setRole('admin'),
      icon: Terminal,
    },
    {
      id: 'cmd-all-role',
      title: 'Switch to Enterprise All-in-One',
      subtitle: 'Unrestricted view of all 67 platform features',
      type: 'COMMAND',
      action: () => setRole('all'),
      icon: Sparkles,
    },
    {
      id: 'page-dashboard',
      title: 'Executive Revenue Dashboard',
      subtitle: 'Dual-curve cash-flow charts and ARR metrics',
      type: 'PAGE',
      url: '/dashboard',
      icon: DollarSign,
    },
    {
      id: 'page-invoices',
      title: 'Billing & Commercial Invoices',
      subtitle: 'PDF invoice generator and payment statuses',
      type: 'PAGE',
      url: '/invoices',
      icon: Receipt,
    },
    {
      id: 'page-deals',
      title: 'Deals Pipeline & Next Best Action',
      subtitle: 'Kanban stages and predictive deal scoring',
      type: 'PAGE',
      url: '/deals',
      icon: Briefcase,
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => {
          const next = !prev;
          if (next) setTimeout(() => inputRef.current?.focus(), 100);
          return next;
        });
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter commands and search items
  const filteredCommands = query
    ? QUICK_COMMANDS.filter(
        (c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : QUICK_COMMANDS;

  const totalItems = filteredCommands.length + results.length;

  const handleKeyDownNav = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, totalItems));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalItems) % Math.max(1, totalItems));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex < filteredCommands.length) {
        const item = filteredCommands[selectedIndex];
        if (item.action) {
          item.action();
          setIsOpen(false);
        } else if (item.url) {
          router.push(item.url);
          setIsOpen(false);
        }
      }
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="flex items-center space-x-2.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-xl text-xs font-semibold transition-all border border-slate-200 dark:border-white/[0.1] shadow-xs cursor-pointer active:scale-[0.98]"
      >
        <Search size={14} className="text-emerald-600 dark:text-emerald-400" />
        <span>Command Palette...</span>
        <span className="text-[10px] font-mono font-bold bg-slate-200 dark:bg-white/[0.08] text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-md border border-slate-300 dark:border-white/10 ml-2 shadow-2xs">⌘K</span>
      </button>

      {isOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-slate-950/40 dark:bg-slate-950/80 backdrop-blur-xl flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-xl bg-white/95 dark:bg-gradient-to-b dark:from-slate-900/95 dark:via-slate-950/98 dark:to-slate-950/99 backdrop-blur-2xl border border-slate-200/90 dark:border-white/[0.14] rounded-3xl shadow-[0_25px_70px_rgba(15,23,42,0.15),0_0_0_1px_rgba(16,185,129,0.15)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(16,185,129,0.15)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Specular Glow Lines */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-emerald-500/10 blur-3xl rounded-full" />

            {/* Search Input Bar */}
            <div className="p-4 border-b border-slate-200 dark:border-white/[0.08] flex items-center space-x-3 bg-slate-50/50 dark:bg-black/30 relative z-10">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <Search size={16} />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDownNav}
                placeholder="Type a command (e.g. 'scan', 'sales', 'deals', 'khata')..."
                className="flex-1 bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-sm font-medium"
              />
              {isLoading && <Loader2 size={16} className="text-emerald-500 dark:text-emerald-400 animate-spin" />}
              <span className="text-[10px] bg-slate-100 dark:bg-white/[0.08] px-2 py-0.5 rounded-lg text-slate-600 dark:text-slate-400 font-mono border border-slate-200 dark:border-white/[0.1]">
                ↑↓ to navigate · ↵ select
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.08] cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
            
            {/* Command & Quick Actions List */}
            <div className="max-h-[380px] overflow-y-auto p-2.5 space-y-1 relative z-10">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-3 py-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Suggested Actions & Navigation</span>
              </div>

              {filteredCommands.map((cmd, idx) => {
                const Icon = cmd.icon;
                const isSelected = selectedIndex === idx;

                return (
                  <div
                    key={cmd.id}
                    onClick={() => {
                      if (cmd.action) {
                        cmd.action();
                        setIsOpen(false);
                      } else if (cmd.url) {
                        router.push(cmd.url);
                        setIsOpen(false);
                      }
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/15 dark:bg-gradient-to-r dark:from-emerald-500/20 dark:via-teal-500/15 dark:to-emerald-500/10 border border-emerald-500/40 text-slate-900 dark:text-white shadow-xs'
                        : 'hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className={`p-2 rounded-xl border transition-all ${
                        isSelected ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-800 dark:text-emerald-300 shadow-xs' : 'bg-slate-100 dark:bg-black/40 border-slate-200 dark:border-white/[0.1] text-slate-500 dark:text-slate-400'
                      }`}>
                        <Icon size={16} />
                      </div>
                      <div className="truncate">
                        <span className={`text-xs font-bold block truncate ${isSelected ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-900 dark:text-white'}`}>
                          {cmd.title}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate font-medium">{cmd.subtitle}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="text-[9px] uppercase font-mono font-black px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] text-emerald-800 dark:text-emerald-300 border border-slate-200 dark:border-emerald-500/20">
                        {cmd.type}
                      </span>
                      <ArrowRight size={13} className={isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'} />
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Footer */}
            <div className="p-3 border-t border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-black/40 flex justify-between items-center text-xs relative z-10">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 inline-block animate-pulse" />
                <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Command Engine Active</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">ESC or click outside to dismiss</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
