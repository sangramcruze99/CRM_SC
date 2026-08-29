import React from 'react';
import { Mail, Type, Image, Layout, BoxSelect } from 'lucide-react';

export function EmailBuilder() {
  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto text-white space-y-6">
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 px-6 flex items-center justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-2xl">
            <Mail size={20} />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-tight">Email Template Builder</h1>
            <p className="text-xs text-slate-400">Design responsive emails for your automated workflows.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] rounded-xl transition-colors cursor-pointer">
            Send Test
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all cursor-pointer">
            Save Template
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        <div className="w-64 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 flex flex-col gap-2.5 overflow-y-auto shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
           <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Content Blocks</h3>
           <div className="grid grid-cols-2 gap-2.5">
             <div className="border border-white/[0.08] bg-white/[0.02] p-3.5 rounded-2xl text-center cursor-pointer hover:border-amber-500/40 hover:bg-white/[0.05] transition-colors group">
               <Type size={20} className="mx-auto text-slate-400 group-hover:text-amber-400 mb-1" />
               <span className="text-xs font-bold text-slate-300">Text</span>
             </div>
             <div className="border border-white/[0.08] bg-white/[0.02] p-3.5 rounded-2xl text-center cursor-pointer hover:border-amber-500/40 hover:bg-white/[0.05] transition-colors group">
               <Image size={20} className="mx-auto text-slate-400 group-hover:text-amber-400 mb-1" />
               <span className="text-xs font-bold text-slate-300">Image</span>
             </div>
             <div className="border border-white/[0.08] bg-white/[0.02] p-3.5 rounded-2xl text-center cursor-pointer hover:border-amber-500/40 hover:bg-white/[0.05] transition-colors group">
               <BoxSelect size={20} className="mx-auto text-slate-400 group-hover:text-amber-400 mb-1" />
               <span className="text-xs font-bold text-slate-300">Button</span>
             </div>
             <div className="border border-white/[0.08] bg-white/[0.02] p-3.5 rounded-2xl text-center cursor-pointer hover:border-amber-500/40 hover:bg-white/[0.05] transition-colors group">
               <Layout size={20} className="mx-auto text-slate-400 group-hover:text-amber-400 mb-1" />
               <span className="text-xs font-bold text-slate-300">Divider</span>
             </div>
           </div>
        </div>

        <div className="flex-1 bg-white/[0.02] border border-white/[0.08] rounded-3xl p-8 flex justify-center overflow-y-auto">
          {/* Email Canvas Mockup */}
          <div className="w-full max-w-2xl bg-slate-900/95 shadow-2xl border border-white/[0.1] rounded-3xl min-h-[600px] flex flex-col overflow-hidden text-white">
            <div className="bg-white/[0.03] p-4 border-b border-white/[0.08] flex items-center gap-4 text-xs text-slate-400">
               <span className="font-bold text-amber-400">Subject:</span>
               <input type="text" className="bg-transparent flex-1 outline-none text-white font-medium" defaultValue="Welcome to our platform!" />
            </div>
            <div className="p-12 flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/[0.1] m-8 rounded-2xl bg-white/[0.02]">
               <Type size={32} className="text-amber-400 mb-4" />
               <p className="text-slate-400 font-medium text-xs">Drag and drop content blocks here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
