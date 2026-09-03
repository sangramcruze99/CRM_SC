'use client';

import { useState } from 'react';
import { Plus, ArrowRight, Calendar, UserCheck } from 'lucide-react';

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
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <UserCheck className="text-emerald-400" size={24} />
            Employee Onboarding Pipeline
          </h1>
          <p className="text-sm text-slate-400 mt-1">
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="bg-slate-950/95 border border-white/[0.12] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 text-white">
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
              <h2 className="text-base font-bold text-white">Add New Hire to Onboarding</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Miller"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Product Marketing Manager"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Sales">Sales</option>
                    <option value="Product">Product</option>
                    <option value="Support">Support</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. j.miller@businessos.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-xl text-xs font-semibold border border-white/[0.1] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/25 cursor-pointer"
                >
                  Start Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
