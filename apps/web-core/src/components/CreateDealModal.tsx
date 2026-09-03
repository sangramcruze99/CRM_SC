'use client';

import { useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { createDeal } from '../app/actions';
import { useRouter } from 'next/navigation';

export function CreateDealModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      await createDeal(formData);
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      console.error('Failed to create deal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-xs font-bold text-slate-950 rounded-xl transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98] flex items-center space-x-1.5 border border-emerald-400/40 cursor-pointer"
      >
        <Plus size={16} />
        <span>New Deal</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950/95 border border-white/[0.12] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-white">
            <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
              <h2 className="text-base font-bold text-white">Create New Deal Opportunity</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.08] transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Deal Title</label>
                <input required name="title" type="text" className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:bg-white/[0.08]" placeholder="e.g. Enterprise License Expansion" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Deal Amount ($)</label>
                <input required name="amount" type="number" min="0" step="0.01" className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:bg-white/[0.08] font-mono" placeholder="75000" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Pipeline Stage</label>
                <select required name="stage" className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white focus:outline-none">
                  <option value="Lead" className="bg-slate-900 text-white">Lead</option>
                  <option value="Meeting Scheduled" className="bg-slate-900 text-white">Meeting Scheduled</option>
                  <option value="Proposal" className="bg-slate-900 text-white">Proposal</option>
                  <option value="Closed Won" className="bg-slate-900 text-white">Closed Won</option>
                </select>
              </div>
              
              <div className="pt-4 flex justify-end space-x-3 border-t border-white/[0.08]">
                <button type="button" disabled={isSubmitting} onClick={() => setIsOpen(false)} className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 rounded-xl border border-white/[0.1] transition-colors cursor-pointer disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-xs font-bold text-slate-950 rounded-xl transition-all shadow-lg shadow-emerald-500/25 cursor-pointer disabled:opacity-50 flex items-center gap-1.5">
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : null}
                  <span>{isSubmitting ? 'Saving...' : 'Save Opportunity'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
