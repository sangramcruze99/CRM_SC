'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { createContact } from '../app/actions';

export function CreateContactModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-xs font-bold text-slate-950 rounded-xl transition-all shadow-lg shadow-orange-500/25 active:scale-[0.98] flex items-center space-x-1.5 border border-amber-400/40 cursor-pointer"
      >
        <Plus size={16} />
        <span>Add Contact</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950/95 border border-white/[0.12] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-white">
            <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
              <h2 className="text-base font-bold text-white">Create New Contact</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.08] transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>
            
            <form 
              action={async (formData) => {
                await createContact(formData);
                setIsOpen(false);
              }} 
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">First Name</label>
                  <input required name="firstName" type="text" className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:bg-white/[0.08]" placeholder="Jane" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Last Name</label>
                  <input required name="lastName" type="text" className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:bg-white/[0.08]" placeholder="Doe" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Email</label>
                <input name="email" type="email" className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:bg-white/[0.08]" placeholder="jane@example.com" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Phone</label>
                <input name="phone" type="tel" className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:bg-white/[0.08]" placeholder="+1 (555) 000-0000" />
              </div>
              
              <div className="pt-4 flex justify-end space-x-3 border-t border-white/[0.08]">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 rounded-xl border border-white/[0.1] transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-xs font-bold text-slate-950 rounded-xl transition-all shadow-lg shadow-orange-500/25 cursor-pointer">
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
