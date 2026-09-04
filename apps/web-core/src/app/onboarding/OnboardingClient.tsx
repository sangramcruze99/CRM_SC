'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, ArrowRight, Calendar, UserCheck, X, Sparkles, User, Briefcase, Mail, Building } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  startDate: string;
  stage: 'OFFER_ACCEPTED' | 'BACKGROUND_CHECK' | 'IT_PROVISIONING' | 'ORIENTATION' | 'COMPLETED';
}

const initialDemoCandidates: Candidate[] = [];

const STAGE_ORDER: Candidate['stage'][] = [
  'OFFER_ACCEPTED',
  'BACKGROUND_CHECK',
  'IT_PROVISIONING',
  'ORIENTATION',
  'COMPLETED',
];

const STAGE_LABELS: Record<Candidate['stage'], string> = {
  OFFER_ACCEPTED: '1. Offer Accepted',
  BACKGROUND_CHECK: '2. Background Check',
  IT_PROVISIONING: '3. IT Setup',
  ORIENTATION: '4. Orientation',
  COMPLETED: '5. Completed',
};

export function OnboardingClient({ initialCandidates = [] }: { initialCandidates?: any[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [candidates, setCandidates] = useState<Candidate[]>(
    initialCandidates.length > 0 ? initialCandidates : initialDemoCandidates
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [email, setEmail] = useState('');
  const [startDate, setStartDate] = useState('');

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !role || !email) return;

    const newCandidate: Candidate = {
      id: `onb_${Math.floor(100 + Math.random() * 900)}`,
      name,
      role,
      department,
      email,
      startDate: startDate || '2026-09-15',
      stage: 'OFFER_ACCEPTED',
    };

    setCandidates([newCandidate, ...candidates]);
    setIsModalOpen(false);
    setName('');
    setRole('');
    setEmail('');
  }

  function advanceStage(id: string) {
    setCandidates(
      candidates.map((c) => {
        if (c.id !== id) return c;
        const currentIdx = STAGE_ORDER.indexOf(c.stage);
        const nextStage = STAGE_ORDER[Math.min(currentIdx + 1, STAGE_ORDER.length - 1)];
        return { ...c, stage: nextStage };
      })
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <UserCheck className="text-emerald-600 dark:text-emerald-400" size={24} />
            Employee Onboarding Pipeline
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Track incoming hires from signed offer letters through IT equipment provisioning and Day 1 orientation.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 cursor-pointer"
        >
          <Plus size={16} />
          <span>Add New Hire</span>
        </button>
      </div>

      {/* Pipeline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {STAGE_ORDER.slice(0, 4).map((stage) => {
          const inStage = candidates.filter((c) => c.stage === stage);
          return (
            <div key={stage} className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-4 space-y-3 flex flex-col shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
              <div className="flex justify-between items-center pb-2 border-b border-white/[0.08]">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {STAGE_LABELS[stage]}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-2xs">
                  {inStage.length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {inStage.length === 0 ? (
                  <div className="py-8 text-center text-xs font-medium text-slate-500 border-2 border-dashed border-white/[0.08] rounded-2xl">No candidates in this stage</div>
                ) : (
                  inStage.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl space-y-3 hover:border-emerald-500/40 transition-all shadow-xs"
                    >
                      <div>
                        <h4 className="font-bold text-white text-sm">{c.name}</h4>
                        <p className="text-xs text-emerald-400 font-semibold mt-0.5">{c.role}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{c.department}</p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2.5 border-t border-white/[0.06] font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-slate-500" /> {c.startDate}
                        </span>
                        <button
                          onClick={() => advanceStage(c.id)}
                          className="px-2.5 py-1 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 border border-white/[0.1] cursor-pointer"
                        >
                          <span>Advance</span>
                          <ArrowRight size={10} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Remodeled Luxury Glass Portal Modal */}
      {isModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-950/99 border border-white/[0.14] rounded-3xl p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(16,185,129,0.15)] backdrop-blur-2xl text-white space-y-5 animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Top Specular Flare */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-emerald-500/10 blur-3xl rounded-full" />

            {/* Header with category badge */}
            <div className="flex items-start justify-between pb-4 border-b border-white/[0.08] relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <UserCheck size={20} />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-black tracking-widest text-emerald-300 uppercase">
                    TALENT ONBOARDING PIPELINE
                  </span>
                  <h2 className="text-base font-bold text-white tracking-tight mt-0.5">Add New Hire to Onboarding</h2>
                  <p className="text-xs text-slate-400 font-medium">Provision employee journey, hardware, and orientations</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs relative z-10">
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Miller"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Role Title</label>
                <div className="relative">
                  <Briefcase size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lead Product Marketing Manager"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Department</label>
                  <div className="relative">
                    <Building size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Sales">Sales</option>
                      <option value="Product">Product</option>
                      <option value="Support">Support</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Target Start Date</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Work Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. j.miller@businessos.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black tracking-wide shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles size={13} />
                  <span>Start Onboarding</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
