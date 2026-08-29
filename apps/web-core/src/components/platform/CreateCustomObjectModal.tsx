'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { createCustomObject } from '../../app/platform/actions';

export function CreateCustomObjectModal() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-xs font-bold text-slate-950 rounded-xl transition-all shadow-lg shadow-orange-500/25 active:scale-[0.98] flex items-center space-x-1.5 border border-amber-400/40 cursor-pointer"
      >
        <Plus size={15} />
        <span>New Custom Object</span>
      </button>
    );
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-xs font-bold text-slate-950 rounded-xl transition-all shadow-lg shadow-orange-500/25 active:scale-[0.98] flex items-center space-x-1.5 border border-amber-400/40 cursor-pointer"
      >
        <Plus size={15} />
        <span>New Custom Object</span>
      </button>

      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-slate-950/95 border border-white/[0.12] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-white">
          <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
            <h2 className="text-base font-bold text-white">Create Custom Object Schema</h2>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
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
              <label className="text-xs font-semibold text-slate-300">Display Entity Name</label>
              <input required name="name" type="text" className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:bg-white/[0.08] font-medium" placeholder="e.g. Company Assets" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Schema Description</label>
              <textarea name="description" rows={3} className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:bg-white/[0.08] font-medium" placeholder="Store asset tracking and assignment metadata"></textarea>
            </div>
            
            <div className="pt-4 flex justify-end space-x-3 border-t border-white/[0.08]">
              <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 rounded-xl border border-white/[0.1] transition-colors cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-xs font-bold text-slate-950 rounded-xl transition-all shadow-lg shadow-orange-500/25 cursor-pointer">
                Create Object
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
