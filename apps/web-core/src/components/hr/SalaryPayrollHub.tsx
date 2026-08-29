'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Download,
  Search,
  Filter,
  Plus,
  Zap,
  ShieldCheck,
  Building,
  ArrowUpRight,
} from 'lucide-react';
import { EmployeeNode } from '@/lib/hrData';

interface SalaryPayrollHubProps {
  employees: EmployeeNode[];
  onOpenPayslip: (emp: EmployeeNode) => void;
  onRunPayrollBatch: () => void;
  onOpenAddModal: () => void;
}

export function SalaryPayrollHub({
  employees,
  onOpenPayslip,
  onRunPayrollBatch,
  onOpenAddModal,
}: SalaryPayrollHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Compute payroll summary statistics
  const totalMonthlyNet = employees.reduce((acc, curr) => acc + curr.salary.netMonthly, 0);
  const totalGross = employees.reduce(
    (acc, curr) => acc + curr.salary.baseMonthly + curr.salary.allowances + curr.salary.bonus,
    0
  );
  const totalTaxes = employees.reduce((acc, curr) => acc + curr.salary.taxDeductions, 0);
  const pendingCount = employees.filter((e) => e.salary.paymentStatus !== 'PAID').length;

  const departments = ['ALL', ...Array.from(new Set(employees.map((e) => e.department)))];

  const filteredEmployees = employees.filter((e) => {
    const matchesDept = selectedDept === 'ALL' || e.department === selectedDept;
    const matchesSearch =
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & 1-Click Payroll Batch Runner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <DollarSign className="text-amber-400" size={20} />
            <span>Salary Structure & Monthly Payroll Disbursement Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated compensation calculations, statutory tax deductions, and Khata ledger reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-3.5 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-white/[0.1] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Salary Record</span>
          </button>

          <button
            type="button"
            onClick={onRunPayrollBatch}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-orange-500/25 transition-all flex items-center gap-1.5 active:scale-[0.98] cursor-pointer"
          >
            <Zap size={14} />
            <span>Disburse Payroll Run (${totalMonthlyNet.toLocaleString()})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Monthly Payroll */}
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Monthly Payroll</span>
            <DollarSign size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-amber-400">
            ${totalMonthlyNet.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Net Disbursed Take-Home</div>
        </div>

        {/* Gross Total */}
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Gross Total Compensation</span>
            <Building size={16} className="text-sky-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-white">
            ${totalGross.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Base + Allowances + Bonus</div>
        </div>

        {/* Tax Deductions */}
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Statutory Deductions</span>
            <Receipt size={16} className="text-rose-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-rose-300">
            -${totalTaxes.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">PAYE & Social Security</div>
        </div>

        {/* Payroll Run Status */}
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Payrun Status</span>
            <ShieldCheck size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-emerald-400">
            {pendingCount === 0 ? 'All Settled' : `${pendingCount} Pending`}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">August 2026 Batch</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.04] p-3.5 rounded-3xl border border-white/[0.08] backdrop-blur-xl">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by employee name or job title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:bg-white/[0.08] font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter size={14} className="text-slate-400 hidden sm:block" />
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedDept === dept
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-md shadow-orange-500/20'
                  : 'bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.1]'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Salary Table */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-white/[0.02] text-slate-400 uppercase tracking-wider font-semibold border-b border-white/[0.08]">
              <tr>
                <th className="px-6 py-4">Employee & Position</th>
                <th className="px-6 py-4">Level</th>
                <th className="px-6 py-4">Base Salary</th>
                <th className="px-6 py-4">Allowances & Bonus</th>
                <th className="px-6 py-4">Deductions</th>
                <th className="px-6 py-4">Net Monthly Payout</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-white/[0.04] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={emp.avatar} alt={emp.firstName} className="w-9 h-9 rounded-xl object-cover" />
                      <div>
                        <span className="font-bold text-white text-sm block group-hover:text-amber-300 transition-colors">
                          {emp.firstName} {emp.lastName}
                        </span>
                        <span className="text-[11px] text-slate-400">{emp.jobTitle}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-white/[0.08] text-amber-300 border border-white/10">
                      L{emp.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono font-semibold text-white">
                    ${emp.salary.baseMonthly.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-300">
                    +${(emp.salary.allowances + emp.salary.bonus).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-mono text-rose-300">
                    -${emp.salary.taxDeductions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-mono font-extrabold text-sm text-amber-400">
                    ${emp.salary.netMonthly.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        emp.salary.paymentStatus === 'PAID'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : emp.salary.paymentStatus === 'PROCESSING'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {emp.salary.paymentStatus === 'PAID' && <CheckCircle2 size={11} />}
                      {emp.salary.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => onOpenPayslip(emp)}
                      className="px-3 py-1.5 bg-white/[0.06] hover:bg-amber-500 hover:text-slate-950 text-slate-300 rounded-xl text-xs font-bold transition-all border border-white/[0.1] cursor-pointer"
                    >
                      Generate Payslip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
