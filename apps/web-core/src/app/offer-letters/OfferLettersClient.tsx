'use client';

import { useState } from 'react';
import { Plus, Download, CheckCircle, Clock, Send, Award } from 'lucide-react';

interface OfferLetter {
  id: string;
  candidateName: string;
  candidateEmail: string;
  role: string;
  department: string;
  baseSalary: number;
  equity: string;
  status: 'ACCEPTED' | 'PENDING_REVIEW' | 'DRAFT';
  expiryDate: string;
}

const initialDemoOffers: OfferLetter[] = [
  {
    id: 'off_901',
    candidateName: 'Alexander Wright',
    candidateEmail: 'a.wright@gmail.com',
    role: 'Staff Infrastructure Engineer',
    department: 'Engineering',
    baseSalary: 185000,
    equity: '0.15%',
    status: 'ACCEPTED',
    expiryDate: '2026-08-20',
  },
  {
    id: 'off_902',
    candidateName: 'Sophia Martinez',
    candidateEmail: 's.martinez@outlook.com',
    role: 'Enterprise Account Executive',
    department: 'Sales',
    baseSalary: 140000,
    equity: '0.08%',
    status: 'PENDING_REVIEW',
    expiryDate: '2026-09-05',
  },
  {
    id: 'off_903',
    candidateName: 'Liam Zhang',
    candidateEmail: 'liam.z@designhub.io',
    role: 'Lead UI/UX Designer',
    department: 'Product',
    baseSalary: 160000,
    equity: '0.10%',
    status: 'ACCEPTED',
    expiryDate: '2026-08-28',
  },
];

export function OfferLettersClient({ initialOffers = [] }: { initialOffers?: any[] }) {
  const [offers, setOffers] = useState<OfferLetter[]>(
    initialOffers.length > 0 ? initialOffers : initialDemoOffers
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [baseSalary, setBaseSalary] = useState('');
  const [equity, setEquity] = useState('0.05%');
  const [alert, setAlert] = useState<string | null>(null);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!candidateName || !candidateEmail || !role || !baseSalary) return;

    const newOffer: OfferLetter = {
      id: `off_${Math.floor(100 + Math.random() * 900)}`,
      candidateName,
      candidateEmail,
      role,
      department,
      baseSalary: parseFloat(baseSalary),
      equity: equity || 'N/A',
      status: 'PENDING_REVIEW',
      expiryDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    };

    setOffers([newOffer, ...offers]);
    setIsModalOpen(false);
    setCandidateName('');
    setCandidateEmail('');
    setRole('');
    setBaseSalary('');
    setAlert(`Formal employment offer generated & dispatched to ${candidateEmail}!`);
    setTimeout(() => setAlert(null), 3000);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {alert && (
        <div className="p-3.5 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-amber-300 text-xs font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
          <CheckCircle size={16} className="text-amber-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Award className="text-amber-400" size={24} />
            Executive Offer Letters & Compensation
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Generate customized compensation packages, equity grants, and digital offer signoff workflows.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-orange-500/25 active:scale-[0.98] border border-amber-400/40 cursor-pointer"
        >
          <Plus size={16} />
          <span>Generate Offer Letter</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/[0.02] text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-white/[0.08]">
            <tr>
              <th className="px-6 py-4">Candidate & Role</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Base Compensation</th>
              <th className="px-6 py-4">Equity Grant</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {offers.map((off) => (
              <tr key={off.id} className="hover:bg-white/[0.04] transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-white text-sm">{off.candidateName}</div>
                  <div className="text-xs text-amber-400 font-semibold">{off.role}</div>
                  <div className="text-[11px] text-slate-400 font-medium">{off.candidateEmail}</div>
                </td>
                <td className="px-6 py-4 text-slate-300 text-xs font-medium">{off.department}</td>
                <td className="px-6 py-4 font-mono font-extrabold text-white">
                  ${off.baseSalary.toLocaleString()} / yr
                </td>
                <td className="px-6 py-4 font-mono text-amber-400 text-xs font-bold">{off.equity}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      off.status === 'ACCEPTED'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {off.status === 'ACCEPTED' ? <CheckCircle size={12} /> : <Clock size={12} />}
                    {off.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => {
                      setAlert(`Downloading official offer letter package for ${off.candidateName}...`);
                      setTimeout(() => setAlert(null), 2500);
                    }}
                    className="px-3.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-white/[0.1] inline-flex items-center gap-1 ml-auto cursor-pointer"
                  >
                    <Download size={12} />
                    <span>PDF</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="bg-slate-950/95 border border-white/[0.12] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 text-white">
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
              <h2 className="text-base font-bold text-white">Generate Official Offer Letter</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Candidate Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rachel Foster"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Candidate Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rachel.foster@gmail.com"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Product Manager"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
                  />
                </div>

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
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Annual Base Salary ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 150000"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Equity Option (%)</label>
                  <input
                    type="text"
                    placeholder="e.g. 0.10%"
                    value={equity}
                    onChange={(e) => setEquity(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none font-mono"
                  />
                </div>
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
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-orange-500/25 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send size={14} />
                  <span>Send Offer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
