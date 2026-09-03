'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { createPromptTemplate } from '../../../app/platform/ai/actions';

export function CreatePromptModal() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-amber-400 hover:to-orange-400 text-xs font-bold text-slate-950 rounded-xl transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98] flex items-center space-x-1.5 border border-emerald-400/40 cursor-pointer"
      >
        <Plus size={15} />
        <span>New Prompt</span>
      </button>
    );
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-amber-400 hover:to-orange-400 text-xs font-bold text-slate-950 rounded-xl transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98] flex items-center space-x-1.5 border border-emerald-400/40 cursor-pointer"
      >
        <Plus size={15} />
        <span>New Prompt</span>
      </button>

      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-slate-950/95 border border-white/[0.12] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-white">
          <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
            <h2 className="text-base font-bold text-white">Create Prompt Template</h2>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
              <X size={18} />
            </button>
          </div>
          
          <form 
            action={async (formData) => {
              await createPromptTemplate(formData);
              setIsOpen(false);
            }} 
            className="p-6 space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Template Name</label>
              <input required name="name" type="text" className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:bg-white/[0.08]" placeholder="e.g. Sales Email Generator" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">AI Model</label>
              <select required name="model" className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none">
                <option value="gpt-4o" className="bg-slate-900 text-white">GPT-4o</option>
                <option value="gpt-4-turbo" className="bg-slate-900 text-white">GPT-4 Turbo</option>
                <option value="claude-3-opus" className="bg-slate-900 text-white">Claude 3 Opus</option>
                <option value="claude-3-sonnet" className="bg-slate-900 text-white">Claude 3 Sonnet</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex justify-between">
                <span>System Prompt</span>
                <span className="text-[11px] text-emerald-400 font-mono">Use {'{{variable}}'} for tokens</span>
              </label>
              <textarea required name="prompt" rows={5} className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:bg-white/[0.08] font-mono" placeholder="Write a persuasive sales email to {{contact_name}} about {{deal_name}}..."></textarea>
            </div>
            
            <div className="pt-4 flex justify-end space-x-3 border-t border-white/[0.08]">
              <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 rounded-xl border border-white/[0.1] transition-colors cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-xs font-bold text-slate-950 rounded-xl transition-all shadow-lg shadow-emerald-500/25 cursor-pointer">
                Save Template
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
