'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Layers, Tag, Sparkles, Database, Check } from 'lucide-react';
import { createCustomField } from '../../app/platform/actions';

export function CreateCustomFieldModal({ customObjectId }: { customObjectId: string }) {
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
        className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-xs font-bold text-slate-950 rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center space-x-1.5 cursor-pointer"
      >
        <Plus size={15} />
        <span>Add Field</span>
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
                  <Tag size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-white tracking-tight">Add Custom Schema Field</h2>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase">
                      Attributes
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Attach dynamic property definitions to this object schema
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
                await createCustomField(formData);
                setIsOpen(false);
              }} 
              className="p-6 space-y-4"
            >
              <input type="hidden" name="customObjectId" value={customObjectId} />
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Tag size={12} className="text-emerald-400" />
                  <span>Field Name</span>
                </label>
                <div className="relative">
                  <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input 
                    required 
                    name="name" 
                    type="text" 
                    className="w-full pl-9.5 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium" 
                    placeholder="e.g. License Plate / Serial Number" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Layers size={12} className="text-emerald-400" />
                  <span>Field Type</span>
                </label>
                <div className="relative">
                  <Layers size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select 
                    required 
                    name="fieldType" 
                    className="w-full pl-9.5 pr-3.5 py-2.5 bg-slate-900 border border-white/[0.12] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium appearance-none cursor-pointer"
                  >
                    <option value="TEXT" className="bg-slate-900 text-white">Text (Single / Multi-line string)</option>
                    <option value="NUMBER" className="bg-slate-900 text-white">Number (Integer / Decimal)</option>
                    <option value="BOOLEAN" className="bg-slate-900 text-white">Checkbox (True / False Flag)</option>
                    <option value="DATE" className="bg-slate-900 text-white">Date / Timestamp</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    id="isRequired" 
                    name="isRequired" 
                    value="true" 
                    className="w-4 h-4 rounded border-white/20 bg-black/40 text-emerald-500 focus:ring-emerald-400 cursor-pointer" 
                  />
                  <div>
                    <label htmlFor="isRequired" className="text-xs font-bold text-white cursor-pointer block">
                      Enforce Mandatory Validation
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Block entity submissions if this property is left empty
                    </span>
                  </div>
                </div>
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
                  <span>Add Field</span>
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
