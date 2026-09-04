'use client';

import React, { useState } from 'react';
import { Mail, Phone, Building2, Calendar, Search, Filter, UserPlus, DollarSign, ArrowRight, Trash2, Layers } from 'lucide-react';
import { EmployeeNode, TIER_DEFINITIONS, getTierFromLevel } from '@/lib/hrData';

interface EmployeeRosterProps {
  employees: EmployeeNode[];
  onSelectEmployee: (emp: EmployeeNode) => void;
  onRemoveEmployee: (empId: string) => void;
  onOpenAddModal: () => void;
}

export function EmployeeRoster({ employees, onSelectEmployee, onRemoveEmployee, onOpenAddModal }: EmployeeRosterProps) {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');

  const departments = ['ALL', ...Array.from(new Set(employees.map((e) => e.department)))];

  const filtered = employees.filter((emp) => {
    const tier = emp.tier || getTierFromLevel(emp.level);
    const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;
    const matchesTier = selectedTier === 'ALL' || tier === selectedTier;
    const matchesSearch =
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      emp.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());
    return matchesDept && matchesTier && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white dark:bg-white/[0.04] p-4 rounded-3xl border border-slate-200 dark:border-white/[0.08] backdrop-blur-xl shadow-xs">
        <div className="relative w-full lg:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, role, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
          />
        </div>

        {/* Tier Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <button
            type="button"
            onClick={() => setSelectedTier('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedTier === 'ALL'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            All Tiers ({employees.length})
          </button>
          {Object.values(TIER_DEFINITIONS).map((def) => {
            const count = employees.filter((e) => e.level === def.level || e.tier === def.tier).length;
            return (
              <button
                key={def.tier}
                type="button"
                onClick={() => setSelectedTier(def.tier)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedTier === def.tier
                    ? `${def.badgeBg} ${def.badgeText} border ${def.badgeBorder} shadow-md`
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-transparent'
                }`}
              >
                <span>{def.code}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer ml-auto"
        >
          <UserPlus size={14} />
          <span>Add Member</span>
        </button>
      </div>

      {/* Department Filter Sub-bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
          Department:
        </span>
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedDept === dept
                ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 font-bold'
                : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((emp) => {
          const tier = emp.tier || getTierFromLevel(emp.level);
          const tierMeta = TIER_DEFINITIONS[tier] || TIER_DEFINITIONS.TIER_C;

          return (
            <div
              key={emp.id}
              className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl overflow-hidden hover:border-emerald-500/40 hover:shadow-xl transition-all shadow-sm dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] group flex flex-col justify-between"
            >
              <div className="p-6 flex flex-col items-center text-center border-b border-slate-200 dark:border-white/[0.06]">
                <div className="relative mb-3">
                  <img
                    src={emp.avatar}
                    alt={emp.firstName}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-white/10 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform"
                  />
                  <span
                    className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-white dark:bg-slate-950 border ${tierMeta.badgeBorder} ${tierMeta.badgeText}`}
                  >
                    {tierMeta.code}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                  {emp.firstName} {emp.lastName}
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5 line-clamp-1">{emp.jobTitle}</p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{emp.department}</span>
              </div>

              <div className="p-4 bg-slate-50/60 dark:bg-white/[0.02] flex flex-col space-y-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <div className="flex items-center space-x-2.5">
                  <Mail size={13} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
                  <span className="truncate">{emp.email}</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Phone size={13} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
                  <span>{emp.phone}</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Calendar size={13} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
                  <span>Joined {emp.startDate}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    ${emp.salary.netMonthly.toLocaleString()}/mo
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onSelectEmployee(emp)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg text-[11px] font-bold border border-slate-200 dark:border-white/[0.08] cursor-pointer"
                    >
                      Payslip
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          confirm(
                            `Are you sure you want to remove ${emp.firstName} ${emp.lastName} (${emp.jobTitle}) from the staff roster?`
                          )
                        ) {
                          onRemoveEmployee(emp.id);
                        }
                      }}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 rounded-lg border border-rose-500/20 transition-colors cursor-pointer"
                      title={`Remove ${emp.firstName} ${emp.lastName}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
