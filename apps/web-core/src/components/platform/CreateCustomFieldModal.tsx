'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { createCustomField } from '../../app/platform/actions';

export function CreateCustomFieldModal({ customObjectId }: { customObjectId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-xs font-bold text-slate-950 rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center space-x-1.5 cursor-pointer"
      >
        <Plus size={15} />
        <span>Add Field</span>
      </button>
    );
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-xs font-bold text-slate-950 rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center space-x-1.5 cursor-pointer"
      >
        <Plus size={15} />
        <span>Add Field</span>
      </button>

      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-950/95 border border-slate-200 dark:border-white/[0.12] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden text-slate-900 dark:text-white animate-in fade-in zoom-in-95">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
            <h2 className="text-base font-bold">Add Custom Schema Field</h2>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
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
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Field Name</label>
              <input required name="name" type="text" className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500" placeholder="e.g. License Plate" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Field Type</label>
              <select required name="fieldType" className="w-full text-xs">
                <option value="TEXT">Text</option>
                <option value="NUMBER">Number</option>
                <option value="BOOLEAN">Checkbox (Yes/No)</option>
                <option value="DATE">Date</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input type="checkbox" id="isRequired" name="isRequired" value="true" className="rounded border-slate-300 dark:border-white/20 text-emerald-500 focus:ring-emerald-500" />
              <label htmlFor="isRequired" className="text-xs font-medium text-slate-700 dark:text-slate-300">Required Field</label>
            </div>
            
            <div className="pt-4 flex justify-end space-x-2.5">
              <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-xl transition-colors cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-xs font-bold text-slate-950 rounded-xl transition-all shadow-md shadow-emerald-500/25 cursor-pointer">
                Add Field
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
