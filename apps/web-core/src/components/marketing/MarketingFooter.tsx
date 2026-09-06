'use client';

import React from 'react';
import Link from 'next/link';

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#05070a] py-16 px-6 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
            ⚡
          </div>
          <span className="font-extrabold text-white text-sm">Business OS</span>
          <span className="text-slate-600">|</span>
          <span className="text-[11px] text-slate-500">Autonomous Enterprise CRM Engine</span>
        </div>

        {/* Operational Status Pill */}
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>ALL 21 SERVICES OPERATIONAL</span>
        </div>

        {/* Links */}
        <div className="flex items-center space-x-6 text-xs text-slate-400">
          <Link href="/login" className="hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/developer" className="hover:text-white transition-colors">
            Developer API
          </Link>
          <a href="#features" className="hover:text-white transition-colors">
            Architecture
          </a>
          <span className="text-slate-600">© 2026 Business OS. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
