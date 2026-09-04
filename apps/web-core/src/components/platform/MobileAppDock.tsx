'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Layers,
  TrendingUp,
  Receipt,
  MessageSquare,
  Search,
  Users,
} from 'lucide-react';

export function MobileAppDock() {
  const pathname = usePathname();

  const dockItems = [
    { name: 'Cockpit', href: '/dashboard', icon: <Layers size={18} /> },
    { name: 'Deals', href: '/deals', icon: <TrendingUp size={18} /> },
    { name: 'Invoices', href: '/invoices', icon: <Receipt size={18} /> },
    { name: 'CRM', href: '/contacts', icon: <Users size={18} /> },
    { name: 'Chat', href: '/chat', icon: <MessageSquare size={18} /> },
  ];

  const triggerCommandPalette = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, metaKey: true }));
  };

  return (
    <div className="md:hidden fixed bottom-3 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
      <div className="flex items-center gap-1.5 p-2 bg-white/90 dark:bg-[#0c1411]/90 border border-slate-200 dark:border-white/15 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl pointer-events-auto">
        {dockItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === '/dashboard' && (pathname === '/' || pathname === '/cockpit'));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-11 h-11 rounded-full transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 shadow-[0_0_15px_rgba(45,212,191,0.5)] scale-105'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
              title={item.name}
            >
              {item.icon}
            </Link>
          );
        })}

        <div className="w-px h-6 bg-slate-300 dark:bg-white/15 mx-1" />

        <button
          type="button"
          onClick={triggerCommandPalette}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-emerald-400/30 transition-all active:scale-95 cursor-pointer shadow-xs"
          title="Spotlight Search (Cmd+K)"
        >
          <Search size={18} />
        </button>
      </div>
    </div>
  );
}
