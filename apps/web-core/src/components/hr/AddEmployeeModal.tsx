'use client';

import React, { useState } from 'react';
import { X, UserPlus, DollarSign, Building, Sparkles } from 'lucide-react';
import { EmployeeNode } from '@/lib/hrData';
import { useIndustry } from '@/components/industry/IndustryContext';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee: (emp: EmployeeNode) => void;
  existingEmployees: EmployeeNode[];
}

export function AddEmployeeModal({
  isOpen,
  onClose,
  onAddEmployee,
  existingEmployees,
}: AddEmployeeModalProps) {
  const { currentNiche } = useIndustry();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('Operations');
  const [level, setLevel] = useState<number>(3); // Default to 3: Clerk/Staff
  const [managerId, setManagerId] = useState<string>(
    existingEmployees.find((e) => e.level < 3)?.id || ''
  );
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [employmentType, setEmploymentType] = useState<'Full-Time' | 'Part-Time' | 'Contractor'>('Full-Time');
  const [baseMonthly, setBaseMonthly] = useState<number>(4500);
  const [allowances, setAllowances] = useState<number>(500);
  const [bonus, setBonus] = useState<number>(300);
  const [taxDeductions, setTaxDeductions] = useState<number>(850);

  if (!isOpen) return null;

  const netMonthly = Math.max(0, baseMonthly + allowances + bonus - taxDeductions);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !jobTitle) return;

    const newEmp: EmployeeNode = {
      id: `emp_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
      firstName,
      lastName,
      jobTitle,
      department,
      level,
      managerId: level === 0 ? null : managerId || null,
      email: email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@businessos.io`,
      phone: phone || '+1 (555) 000-1122',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      startDate: new Date().toISOString().split('T')[0],
      employmentType,
      salary: {
        baseMonthly,
        allowances,
        bonus,
        taxDeductions,
        netMonthly,
        currency: '$',
        paymentStatus: 'PAID',
        lastPayDate: new Date().toISOString().split('T')[0],
      },
      niche: currentNiche,
    };

    onAddEmployee(newEmp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in overflow-y-auto">
      <div className="bg-slate-950/95 border border-white/[0.14] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 text-white my-8 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Add New Employee & Salary Structure</h2>
              <p className="text-xs text-slate-400">
                Define profile credentials, reporting hierarchy branch, and compensation breakdown.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">First Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Rachel"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Green"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Job Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Billing Clerk / Medical Specialist"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
              <input
                type="text"
                required
                placeholder="e.g. Sales, Clinical, Kitchen, POS"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:bg-white/[0.08]"
              />
            </div>
          </div>

          {/* Org Hierarchy Pipeline Level & Manager */}
          <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
              Organizational Tree Hierarchy (Pipeline Position)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hierarchy Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value={0}>Level 0: CEO / Executive Director</option>
                  <option value={1}>Level 1: VP / Department Manager</option>
                  <option value={2}>Level 2: Team Lead / Supervisor</option>
                  <option value={3}>Level 3: Clerk / Staff / Associate</option>
                </select>
              </div>

              {level > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Reports To (Direct Manager)
                  </label>
                  <select
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none"
                  >
                    {existingEmployees
                      .filter((e) => e.level < level)
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.firstName} {m.lastName} ({m.jobTitle})
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Salary Structure & Compensation */}
          <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                Salary Structure & Deductions
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                Net Pay: ${netMonthly.toLocaleString()}/mo
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Base Monthly ($)</label>
                <input
                  type="number"
                  value={baseMonthly}
                  onChange={(e) => setBaseMonthly(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-lg text-xs font-mono font-bold text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Allowances ($)</label>
                <input
                  type="number"
                  value={allowances}
                  onChange={(e) => setAllowances(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-lg text-xs font-mono font-bold text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Bonus ($)</label>
                <input
                  type="number"
                  value={bonus}
                  onChange={(e) => setBonus(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-lg text-xs font-mono font-bold text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-rose-400 mb-1">Tax / PF Deductions ($)</label>
                <input
                  type="number"
                  value={taxDeductions}
                  onChange={(e) => setTaxDeductions(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white/[0.05] border border-rose-500/30 rounded-lg text-xs font-mono font-bold text-rose-300 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 rounded-xl text-xs font-semibold border border-white/[0.1] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
            >
              Add to Organization & Payroll
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
