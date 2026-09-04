'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FilePlus, X, BookOpen, FileText, Sparkles, Database } from 'lucide-react';
import { createKnowledgeDocument } from '../../../app/platform/ai/actions';

export function CreateKnowledgeModal() {
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
        className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition-all border border-white/[0.1] shadow-xs flex items-center space-x-2 active:scale-[0.98] cursor-pointer"
      >
        <FilePlus size={15} />
        <span>Add Document</span>
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
                  <BookOpen size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-white tracking-tight">Add Knowledge Document</h2>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase">
                      Vector RAG
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ingest corporate manuals, sales playbooks, and SOPs into neural search
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
                await createKnowledgeDocument(formData);
                setIsOpen(false);
              }} 
              className="p-6 space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <BookOpen size={12} className="text-emerald-400" />
                  <span>Document Title</span>
                </label>
                <div className="relative">
                  <BookOpen size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input 
                    required 
                    name="title" 
                    type="text" 
                    className="w-full pl-9.5 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium" 
                    placeholder="e.g. Q3 Sales Objection Handling Playbook" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <FileText size={12} className="text-emerald-400" />
                    <span>Document Corpus</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    Auto-chunked into 1536-dim vector embeddings
                  </span>
                </div>
                <textarea 
                  required 
                  name="content" 
                  rows={7} 
                  className="w-full p-3 bg-black/40 border border-white/[0.12] rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans leading-relaxed resize-none" 
                  placeholder="Paste or type markdown documentation, policy guidelines, or pricing specs here..."
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
                  <span>Save & Index Document</span>
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
