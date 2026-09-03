'use client';

import { useState } from 'react';
import { FilePlus, X } from 'lucide-react';
import { createKnowledgeDocument } from '../../../app/platform/ai/actions';

export function CreateKnowledgeModal() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition-all border border-white/[0.1] shadow-xs flex items-center space-x-2 active:scale-[0.98] cursor-pointer"
      >
        <FilePlus size={15} />
        <span>Add Document</span>
      </button>
    );
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition-all border border-white/[0.1] shadow-xs flex items-center space-x-2 active:scale-[0.98] cursor-pointer"
      >
        <FilePlus size={15} />
        <span>Add Document</span>
      </button>

      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-slate-950/95 border border-white/[0.12] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-white">
          <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
            <h2 className="text-base font-bold text-white">Add Knowledge Base Document</h2>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
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
              <label className="text-xs font-semibold text-slate-300">Document Title</label>
              <input required name="title" type="text" className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:bg-white/[0.08] font-medium" placeholder="e.g. Q3 Sales Playbook" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex justify-between">
                <span>Content</span>
                <span className="text-[11px] text-slate-400">Raw text for vector embeddings</span>
              </label>
              <textarea required name="content" rows={8} className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:bg-white/[0.08] font-sans" placeholder="Paste document content here..."></textarea>
            </div>
            
            <div className="pt-4 flex justify-end space-x-3 border-t border-white/[0.08]">
              <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 rounded-xl border border-white/[0.1] transition-colors cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-xs font-bold text-slate-950 rounded-xl transition-all shadow-lg shadow-emerald-500/25 cursor-pointer">
                Save & Embed
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
