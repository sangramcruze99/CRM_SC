'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Command,
  Maximize2,
  Minimize2,
  Sparkles,
  Download,
  CheckCircle2,
  Wifi,
  Laptop,
} from 'lucide-react';
import { usePathname } from 'next/navigation';

export function NativeAppTitlebar() {
  const pathname = usePathname();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [latency, setLatency] = useState(14);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setInstallPrompt(null);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Open Command Palette via custom event or synthetic keyboard event
  const triggerCommandPalette = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, metaKey: true }));
  };

  const formatBreadcrumb = (path: string) => {
    if (path === '/' || path === '/dashboard' || path === '/cockpit') return 'Cockpit & Overview';
    const clean = path.replace('/', '').replace(/-/g, ' ');
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  };

  return (
    <div className="h-9 px-3.5 bg-slate-100 dark:bg-[#060908] border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between select-none text-xs text-slate-600 dark:text-slate-400 z-50 shrink-0">
      {/* Left: macOS Native Window Beads & App Badge */}
      <div className="flex items-center gap-3">
        {/* Window Beads */}
        <div className="flex items-center gap-1.5 group cursor-pointer" onClick={toggleFullscreen}>
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80 group-hover:bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.4)] transition-colors" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80 group-hover:bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.4)] transition-colors" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 group-hover:bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)] transition-colors" />
        </div>

        <div className="h-3 w-px bg-slate-300 dark:bg-white/10" />

        {/* App Title & Current Breadcrumb */}
        <div className="flex items-center gap-1.5 font-semibold text-[11px]">
          <span className="text-slate-900 dark:text-white font-bold tracking-tight">Business OS</span>
          <span className="text-slate-400 dark:text-slate-600">/</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-bold truncate max-w-[140px] sm:max-w-none">
            {formatBreadcrumb(pathname)}
          </span>
        </div>
      </div>

      {/* Center: Command Palette Trigger Pill */}
      <button
        type="button"
        onClick={triggerCommandPalette}
        className="hidden md:flex items-center gap-2 px-3 py-1 bg-white hover:bg-slate-50 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 hover:border-emerald-500/30 rounded-full text-[11px] text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-all cursor-pointer shadow-xs"
      >
        <Search size={11} className="text-emerald-600 dark:text-emerald-400" />
        <span className="font-medium">Search or jump to...</span>
        <kbd className="font-mono text-[9px] px-1.5 py-0.2 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/15 rounded text-emerald-700 dark:text-emerald-300 font-bold">
          Ctrl + K
        </kbd>
      </button>

      {/* Right: Live Mesh Status, PWA Install & Window Toggles */}
      <div className="flex items-center gap-2.5 text-[11px]">
        {/* Service Mesh Status Ping */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="hidden sm:inline">22/22 Services Online</span>
          <span className="sm:hidden">22 Live</span>
        </div>

        {/* PWA Install Button (if browser supports install) */}
        {installPrompt && !isInstalled && (
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex items-center gap-1 px-2.5 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 rounded-full font-bold text-[10px] hover:opacity-90 transition-all cursor-pointer shadow-xs"
          >
            <Download size={10} />
            <span>Install App</span>
          </button>
        )}

        {/* Fullscreen Button */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Native Fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
        </button>
      </div>
    </div>
  );
}
