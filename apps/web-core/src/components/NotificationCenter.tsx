'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCheck,
  Check,
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  X,
  CreditCard,
  FileCheck,
  Briefcase,
  Layers,
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'APPROVAL' | 'SYSTEM' | 'BILLING' | 'CRM_DEAL' | 'ALERT';
  severity: 'INFO' | 'WARNING' | 'SUCCESS' | 'CRITICAL';
  link?: string | null;
  read: boolean;
  createdAt: string;
  metadata?: any;
}

const FALLBACK_SEEDS: NotificationItem[] = [
  {
    id: 'n_seed_1',
    title: 'Hiring Screening Approval Paused',
    message: 'Candidate Sarah Connor scored 92% match on Staff Fullstack profile. Workflow execution waiting for recruiter approval.',
    category: 'APPROVAL',
    severity: 'WARNING',
    link: '/automation',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: 'n_seed_2',
    title: 'AI Monthly Spend at 80% Threshold',
    message: 'Athena & Groq neural inference budget crossed $80.40 / $100.00. Automatic throttling guardrail enabled.',
    category: 'BILLING',
    severity: 'WARNING',
    link: '/billing',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'n_seed_3',
    title: 'High-Value Commercial Deal: Titan Industrial',
    message: 'Automated deal qualification advanced $120,000 enterprise pipeline opportunity to Negotiating stage.',
    category: 'CRM_DEAL',
    severity: 'SUCCESS',
    link: '/deals',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'n_seed_4',
    title: 'Direct Settlement Confirmed: INV-2026-089',
    message: 'Stripe wire transfer reconciled for $14,500.00 and balanced in General Ledger.',
    category: 'BILLING',
    severity: 'SUCCESS',
    link: '/invoices',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'n_seed_5',
    title: 'Universal Microservices Mesh Verified',
    message: '29 microservices registered in cluster routing mesh. Port isolation and JWT guards verified.',
    category: 'SYSTEM',
    severity: 'INFO',
    link: '/settings',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
];

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'APPROVAL' | 'BILLING' | 'CRM_DEAL' | 'SYSTEM'>('ALL');
  const [notifications, setNotifications] = useState<NotificationItem[]>(FALLBACK_SEEDS);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchLiveNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications', {
        headers: { 'x-tenant-id': 'default-tenant' },
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setNotifications(json.data);
        }
      }
    } catch {
      // Keep fallback seeds on offline dev state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveNotifications();
  }, []);

  // Dismiss on outside click or escape
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'ALL') return true;
    return n.category === activeTab;
  });

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'x-tenant-id': 'default-tenant' },
      });
    } catch {
      // optimistic update retained
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) =>
      prev.map((item) => {
        if (activeTab === 'ALL' || item.category === activeTab) {
          return { ...item, read: true };
        }
        return item;
      })
    );
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
        body: JSON.stringify({ category: activeTab !== 'ALL' ? activeTab : undefined }),
      });
    } catch {
      // optimistic
    }
  };

  const formatTimestamp = (isoDate: string) => {
    try {
      const diffMs = Date.now() - new Date(isoDate).getTime();
      const mins = Math.floor(diffMs / (1000 * 60));
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="p-1 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30"><ShieldAlert size={14} /></span>;
      case 'WARNING':
        return <span className="p-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30"><AlertTriangle size={14} /></span>;
      case 'SUCCESS':
        return <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"><CheckCircle2 size={14} /></span>;
      default:
        return <span className="p-1 rounded-md bg-sky-500/20 text-sky-400 border border-sky-500/30"><Info size={14} /></span>;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Topbar Trigger Bell Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchLiveNotifications();
        }}
        aria-label="Notifications Center"
        className={`relative p-2 rounded-xl border transition-all duration-200 flex items-center justify-center ${
          isOpen
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
            : 'bg-white/5 hover:bg-white/10 dark:bg-slate-900/40 dark:hover:bg-slate-800/60 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-white'
        }`}
      >
        <Bell size={16} className={`transition-transform ${unreadCount > 0 ? 'animate-wiggle' : ''}`} />

        {/* Dynamic Unread Pill */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40 ring-2 ring-[#07090e]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Glassmorphism Notification Drawer Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[380px] sm:w-[440px] max-w-[95vw] bg-slate-900/95 dark:bg-[#0c1411]/95 backdrop-blur-3xl border border-white/15 dark:border-emerald-500/20 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-50 overflow-hidden flex flex-col text-slate-100 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Bell size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                  Notification Center
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {unreadCount} unread
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-400">Universal system alerts & multi-channel feed</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  title="Mark all as read"
                  className="px-2 py-1 text-[11px] font-semibold text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors flex items-center gap-1"
                >
                  <CheckCheck size={12} />
                  Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Categorized Filter Tabs */}
          <div className="flex items-center gap-1 p-2 border-b border-white/10 overflow-x-auto scrollbar-none bg-black/20 text-xs">
            {(
              [
                { id: 'ALL', label: 'All', icon: Layers },
                { id: 'APPROVAL', label: 'Approvals', icon: FileCheck },
                { id: 'BILLING', label: 'Billing', icon: CreditCard },
                { id: 'CRM_DEAL', label: 'CRM', icon: Briefcase },
                { id: 'SYSTEM', label: 'System', icon: Sparkles },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const count =
                tab.id === 'ALL'
                  ? notifications.length
                  : notifications.filter((n) => n.category === tab.id).length;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-2.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap text-xs ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon size={12} />
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-emerald-400/20 text-emerald-300 font-bold' : 'bg-white/5 text-slate-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Notification List Scroll Area */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-white/5">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                  <CheckCheck size={22} />
                </div>
                <h4 className="text-sm font-semibold text-slate-200">You're all caught up!</h4>
                <p className="text-xs text-slate-500 max-w-[220px] mt-1">
                  No alerts in this category. New platform notifications will appear here.
                </p>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 transition-colors flex items-start gap-3 relative group ${
                    n.read
                      ? 'bg-transparent hover:bg-white/[0.02] opacity-75'
                      : 'bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08]'
                  }`}
                >
                  {/* Category / Severity Icon */}
                  <div className="shrink-0 mt-0.5">{getSeverityBadge(n.severity)}</div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs font-semibold truncate ${n.read ? 'text-slate-300' : 'text-white'}`}>
                        {n.title}
                      </h4>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {formatTimestamp(n.createdAt)}
                      </span>

                      {n.link && (
                        <Link
                          href={n.link}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          View Action
                          <ArrowUpRight size={11} />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Quick Action: Mark as read button */}
                  {!n.read && (
                    <button
                      type="button"
                      onClick={(e) => handleMarkAsRead(n.id, e)}
                      title="Mark as read"
                      className="absolute top-3.5 right-3 p-1 rounded-md text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/15 transition-colors opacity-70 group-hover:opacity-100"
                    >
                      <Check size={13} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-2.5 px-4 border-t border-white/10 bg-black/40 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Notifications Hub :3028
            </span>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-emerald-400 transition-colors font-medium"
            >
              Preferences →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
