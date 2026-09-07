'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="h-8.5 w-8.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.09] border border-slate-200 dark:border-white/[0.08] hover:border-emerald-500/40 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-xs group shrink-0 active:scale-[0.98]"
      title={`Switch to ${theme === 'dark' ? 'Light Porcelain' : 'Dark Obsidian'} Mode`}
    >
      {theme === 'dark' ? (
        <Sun size={14} className="text-amber-500 dark:text-emerald-400 group-hover:rotate-45 transition-transform" />
      ) : (
        <Moon size={14} className="text-indigo-600 dark:text-indigo-400 group-hover:-rotate-12 transition-transform" />
      )}
    </button>
  );
}
