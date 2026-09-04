'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Layers, FileText, Sparkles, Database } from 'lucide-react';
import { createCustomObject } from '../../app/platform/actions';

export function CreateCustomObjectModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-xs font-bold text-slate-950 rounded-xl transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98] flex items-center space-x-1.5 border border-emerald-400/40 cursor-pointer"
      >
        <Plus size={15} />
        <span>New Custom Object</span>
      </button>

      {isOpen && mounted && createPortal(
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div className="relative bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-950/99 border border-white/[0.14] rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(16,185,129,0.15)] backdrop-blur-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 text-white my-auto">
            {/* Ambient Top Glow Line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-emerald-500/10 blur-3xl rounded-full" />

            {/* Header */}
            <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/25 border border-emerald-300/30">
                  <Database size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-white tracking-tight">Create Custom Object</h2>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase">
                      Schema Engine
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Define a new low-code relational data model with automatic UI bindings
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <form 
              action={async (formData) => {
                await createCustomObject(formData);
                setIsOpen(false);
              }} 
              className="p-6 space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Layers size={12} className="text-emerald-400" />
                  <span>Display Entity Name</span>
                </label>
                <div className="relative">
                  <Layers size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input 
                    required 
                    name="name" 
                    type="text" 
                    className="w-full pl-9.5 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium" 
                    placeholder="e.g. Company Assets" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <FileText size={12} className="text-emerald-400" />
                  <span>Schema Description</span>
                </label>
                <textarea 
                  name="description" 
                  rows={3} 
                  className="w-full p-3 bg-black/40 border border-white/[0.12] rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium resize-none" 
                  placeholder="Store asset tracking, depreciation, and assignment metadata"
                />
              </div>
              
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/[0.08]">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)} 
                  className="px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold text-slate-300 hover:text-white rounded-xl border border-white/[0.1] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-xs font-extrabold text-slate-950 rounded-xl transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98] cursor-pointer flex items-center gap-2"
                >
                  <Sparkles size={14} />
                  <span>Create Object Schema</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
