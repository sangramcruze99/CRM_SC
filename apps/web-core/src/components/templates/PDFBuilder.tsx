'use client';

import React, { useState } from 'react';
import { FileText, Save, Settings, Download, Printer } from 'lucide-react';

export function PDFBuilder() {
  const [title, setTitle] = useState('Invoice #INV-2024-001');
  const [content, setContent] = useState('This is a dynamically generated PDF document. You can inject variables like {{deal.amount}} directly into these templates.');

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto text-white space-y-6">
      {/* Top Navigation */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 px-6 flex items-center justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <div className="flex items-center gap-3">
          <FileText size={20} className="text-emerald-400" />
          <div>
            <h1 className="font-bold text-white leading-tight">PDF Template Builder</h1>
            <p className="text-xs text-slate-400">Design dynamic documents</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] rounded-xl transition-colors flex items-center gap-2 cursor-pointer">
            <Download size={14} /> Download Sample
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer">
            <Save size={14} /> Save Template
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Settings Sidebar */}
        <div className="w-80 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 overflow-y-auto shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center gap-2 mb-6 text-white font-bold text-sm">
            <Settings size={18} className="text-emerald-400" /> Template Properties
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Template Name</label>
              <input 
                type="text" 
                defaultValue="Standard Invoice"
                className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08] transition-all font-medium"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Document Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08] transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Document Content</label>
              <textarea 
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08] transition-all resize-none leading-relaxed"
              />
            </div>

            <div className="pt-4 border-t border-white/[0.08]">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Available Variables</h3>
               <div className="flex flex-wrap gap-2">
                 <span className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-mono cursor-pointer hover:bg-emerald-500/25">{`{{record.id}}`}</span>
                 <span className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-mono cursor-pointer hover:bg-emerald-500/25">{`{{record.createdAt}}`}</span>
                 <span className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-mono cursor-pointer hover:bg-emerald-500/25">{`{{tenant.name}}`}</span>
               </div>
            </div>
          </div>
        </div>

        {/* PDF Live Preview */}
        <div className="flex-1 bg-white/[0.02] border border-white/[0.08] rounded-3xl p-8 flex flex-col items-center overflow-y-auto">
           <div className="w-full max-w-3xl flex flex-col gap-4">
             <div className="flex items-center justify-between">
               <h3 className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wider"><Printer size={16} className="text-emerald-400" /> Live HTML Preview (A4)</h3>
             </div>
             {/* A4 Paper Mockup */}
             <div className="bg-slate-900 shadow-2xl aspect-[1/1.414] w-full p-12 flex flex-col text-white border border-white/[0.1] rounded-2xl">
                <h1 className="text-2xl font-bold uppercase text-center mb-8 border-b-2 border-white/20 pb-4 text-emerald-400">{title}</h1>
                <p className="text-sm leading-relaxed text-slate-300 flex-1 whitespace-pre-wrap">{content}</p>
                <div className="mt-8 pt-4 border-t-2 border-white/20 text-center text-xs text-slate-500">
                  Generated by Business OS
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
