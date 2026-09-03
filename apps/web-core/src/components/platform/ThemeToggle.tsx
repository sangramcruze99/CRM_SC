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
      className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-300 hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-xs group"
      title={`Switch to ${theme === 'dark' ? 'Light Porcelain' : 'Dark Obsidian'} Mode`}
    >
      {theme === 'dark' ? (
        <Sun size={15} className="text-emerald-400 group-hover:rotate-45 transition-transform" />
      ) : (
        <Moon size={15} className="text-indigo-400 group-hover:-rotate-12 transition-transform" />
      )}
    </button>
  );
}
