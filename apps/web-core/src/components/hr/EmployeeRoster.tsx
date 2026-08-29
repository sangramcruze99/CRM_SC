'use client';

import React, { useState } from 'react';
import { Mail, Phone, Building2, Calendar, Search, Filter, UserPlus, DollarSign, ArrowRight } from 'lucide-react';
import { EmployeeNode } from '@/lib/hrData';

interface EmployeeRosterProps {
  employees: EmployeeNode[];
  onSelectEmployee: (emp: EmployeeNode) => void;
  onOpenAddModal: () => void;
}

export function EmployeeRoster({ employees, onSelectEmployee, onOpenAddModal }: EmployeeRosterProps) {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  const departments = ['ALL', ...Array.from(new Set(employees.map((e) => e.department)))];

  const filtered = employees.filter((emp) => {
    const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;
    const matchesSearch =
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      emp.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.04] p-4 rounded-3xl border border-white/[0.08] backdrop-blur-xl">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, role, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:bg-white/[0.08] font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedDept === dept
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-md'
                  : 'bg-white/[0.06] text-slate-300 hover:text-white'
              }`}
            >
              {dept}
            </button>
          ))}

          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md ml-auto cursor-pointer"
          >
            <UserPlus size={13} />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((emp) => (
          <div
            key={emp.id}
            className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden hover:border-amber-500/40 hover:shadow-xl transition-all shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] group flex flex-col justify-between"
          >
            <div className="p-6 flex flex-col items-center text-center border-b border-white/[0.06]">
              <div className="relative mb-3">
                <img
                  src={emp.avatar}
                  alt={emp.firstName}
                  className="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform"
                />
                <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-slate-950 border border-amber-500/50 text-amber-300">
                  L{emp.level}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                {emp.firstName} {emp.lastName}
              </h3>
              <p className="text-xs text-amber-400 font-semibold mt-0.5 line-clamp-1">{emp.jobTitle}</p>
              <span className="text-[11px] text-slate-400 font-medium">{emp.department}</span>
            </div>

            <div className="p-4 bg-white/[0.02] flex flex-col space-y-2 text-xs text-slate-300 font-medium">
              <div className="flex items-center space-x-2.5">
                <Mail size={13} className="text-slate-500 flex-shrink-0" />
                <span className="truncate">{emp.email}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone size={13} className="text-slate-500 flex-shrink-0" />
                <span>{emp.phone}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Calendar size={13} className="text-slate-500 flex-shrink-0" />
                <span>Joined {emp.startDate}</span>
              </div>

              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                <span className="font-mono font-bold text-amber-400">
                  ${emp.salary.netMonthly.toLocaleString()}/mo
                </span>
                <button
                  type="button"
                  onClick={() => onSelectEmployee(emp)}
                  className="px-2.5 py-1 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white rounded-lg text-[11px] font-bold border border-white/[0.08] cursor-pointer"
                >
                  Payslip & Structure
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
