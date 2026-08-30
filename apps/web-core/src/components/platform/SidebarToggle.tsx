'use client';

import React from 'react';
import { PanelLeft, PanelLeftClose, Maximize2, Minimize2 } from 'lucide-react';
import { useSidebar } from './SidebarContext';

export function SidebarToggle() {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className={`p-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer shadow-xs ${
        isCollapsed
          ? 'bg-amber-500/15 border-amber-500/30 text-amber-500 hover:bg-amber-500/25 ring-2 ring-amber-500/20'
          : 'bg-white/[0.04] dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08]'
      }`}
      title={isCollapsed ? 'Show Sidebar (⌘B / Ctrl+B)' : 'Hide Sidebar (⌘B / Ctrl+B)'}
    >
      {isCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
    </button>
  );
}

export function FullscreenToggle() {
  const { isFullscreen, toggleFullscreen } = useSidebar();

  return (
    <button
      type="button"
      onClick={toggleFullscreen}
      className="p-2 rounded-xl bg-white/[0.04] dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-all flex items-center justify-center cursor-pointer shadow-xs"
      title={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen (Full Focus Mode)'}
    >
      {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
    </button>
  );
}
