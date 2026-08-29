'use client';

import { useState } from 'react';
import { LogOut, User, Shield, Building2, ChevronDown, Zap, Gauge, Sparkles, Sliders } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAccessibility } from './platform/AccessibilityContext';
import { useCreditMetering } from './platform/CreditMeteringContext';
import { TieredPackagingModal } from './billing/TieredPackagingModal';

export function UserNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPackagingModalOpen, setIsPackagingModalOpen] = useState(false);
  const router = useRouter();

  const { isPerformanceMode, toggleMode } = useAccessibility();
  const { credits, setIsTopUpModalOpen } = useCreditMetering();

  async function handleLogout() {
    // Clear access_token cookie
    document.cookie = 'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center gap-2.5">
        {/* Credits Meter Quick Pill */}
        <button
          type="button"
          onClick={() => setIsTopUpModalOpen(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-xl text-xs font-mono font-bold text-amber-300 transition-all cursor-pointer shadow-xs"
          title="Click to view & top up metered AI / OCR credits"
        >
          <Zap size={13} className="text-amber-400" />
          <span>{credits.ocrScansRemaining} OCR · {credits.b2bLeadsRemaining} Leads</span>
        </button>

        {/* User Profile Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-3 p-1.5 px-2.5 rounded-xl hover:bg-white/[0.06] transition-all text-left focus:outline-none border border-transparent hover:border-white/10 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-xs font-extrabold text-slate-950 shadow-md shadow-orange-500/20 ring-2 ring-white/20">
              SC
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-white leading-tight">Sangram Cruze</div>
              <div className="text-[11px] text-slate-400 font-medium leading-tight">admin@gmail.com</div>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden md:block" />
          </button>

          {isOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-950/95 backdrop-blur-2xl border border-white/[0.12] shadow-2xl z-50 py-2 divide-y divide-white/[0.08] animate-in fade-in zoom-in-95 duration-150 text-white">
                <div className="px-4 py-3">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Superadmin</p>
                  <p className="text-sm font-bold text-white truncate">admin@gmail.com</p>
                  <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <Shield size={10} /> SUPERADMIN
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.08] text-slate-300 border border-white/10 flex items-center gap-1">
                      <Building2 size={10} /> Default Tenant
                    </span>
                  </div>
                </div>

                {/* Performance Mode / High Contrast Switcher */}
                <div className="px-4 py-2.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gauge size={14} className="text-amber-400" />
                      <span className="text-xs font-semibold text-slate-300">Performance Mode</span>
                    </div>
                    <button
                      type="button"
                      onClick={toggleMode}
                      className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                        isPerformanceMode ? 'bg-amber-500 justify-end' : 'bg-white/20 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-slate-950 shadow-md" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {isPerformanceMode ? '⚡ GPU-lite solid obsidian (WCAG AAA)' : '✨ Luxury glassmorphism blurs'}
                  </p>
                </div>

                {/* Packaging & Metering Actions */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setIsPackagingModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles size={14} className="text-amber-400" />
                      <span>Product Editions & Plans</span>
                    </span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">
                      4 Tiers
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setIsTopUpModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Zap size={14} className="text-sky-400" />
                      <span>Credit Usage & Top-Up</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {credits.ocrScansRemaining} Left
                    </span>
                  </button>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      router.push('/developer');
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
                  >
                    <User size={15} />
                    <span>Account & Developer API</span>
                  </button>
                </div>

                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tiered Packaging Matrix Modal */}
      <TieredPackagingModal
        isOpen={isPackagingModalOpen}
        onClose={() => setIsPackagingModalOpen(false)}
      />
    </>
  );
}
