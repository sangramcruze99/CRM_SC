'use client';

import React from 'react';
import { X, Download, Printer, CheckCircle2, ShieldCheck, DollarSign } from 'lucide-react';
import { EmployeeNode } from '@/lib/hrData';

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeNode | null;
}

export function PayslipModal({ isOpen, onClose, employee }: PayslipModalProps) {
  if (!isOpen || !employee) return null;

  const grossMonthly = employee.salary.baseMonthly + employee.salary.allowances + employee.salary.bonus;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in overflow-y-auto">
      <div className="bg-slate-950/95 border border-white/[0.14] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 text-white my-8 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <DollarSign size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Itemized Employee Payslip</h2>
              <p className="text-xs text-slate-400">
                Period: August 2026 · Ref: PS-{employee.id.toUpperCase()}-202608
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Payslip Document Canvas */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 space-y-4">
          {/* Company & Employee Identity */}
          <div className="flex justify-between items-start border-b border-white/[0.06] pb-3 text-xs">
            <div>
              <span className="font-extrabold text-white text-sm block">Business OS Platform</span>
              <span className="text-slate-400">Enterprise HR & Payroll Ledger</span>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                STATUS: {employee.salary.paymentStatus}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">Paid: {employee.salary.lastPayDate}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Employee Details</span>
              <span className="font-bold text-white text-sm">{employee.firstName} {employee.lastName}</span>
              <span className="text-slate-400 block">{employee.jobTitle}</span>
              <span className="text-slate-500 text-[11px] font-mono">ID: {employee.id}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Department & Role</span>
              <span className="font-medium text-white">{employee.department}</span>
              <span className="text-slate-400 block">Type: {employee.employmentType}</span>
              <span className="text-emerald-400 text-[11px] font-semibold">Hierarchy Level {employee.level}</span>
            </div>
          </div>

          {/* Earnings & Deductions Tables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/[0.06] text-xs">
            {/* Earnings */}
            <div className="space-y-1.5 p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 block mb-1">
                Gross Earnings
              </span>
              <div className="flex justify-between text-slate-300">
                <span>Basic Salary</span>
                <span className="font-mono font-semibold">${employee.salary.baseMonthly.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Allowances</span>
                <span className="font-mono font-semibold">+${employee.salary.allowances.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Performance Bonus</span>
                <span className="font-mono font-semibold">+${employee.salary.bonus.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-white pt-1 border-t border-white/[0.06]">
                <span>Total Gross</span>
                <span className="font-mono">${grossMonthly.toLocaleString()}</span>
              </div>
            </div>

            {/* Deductions */}
            <div className="space-y-1.5 p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400 block mb-1">
                Statutory Deductions
              </span>
              <div className="flex justify-between text-slate-300">
                <span>Income Tax (PAYE)</span>
                <span className="font-mono font-semibold">-${(employee.salary.taxDeductions * 0.75).toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Social Security / PF</span>
                <span className="font-mono font-semibold">-${(employee.salary.taxDeductions * 0.25).toFixed(0)}</span>
              </div>
              <div className="flex justify-between font-bold text-rose-300 pt-1 border-t border-white/[0.06]">
                <span>Total Deductions</span>
                <span className="font-mono">-${employee.salary.taxDeductions.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Net Take-Home Pay Box */}
          <div className="p-3.5 bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-transparent border border-emerald-500/40 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-extrabold text-emerald-300 tracking-wider block">
                Net Disbursed Take-Home Pay
              </span>
              <span className="text-xs text-slate-300">Direct Wire to Employee Bank Account</span>
            </div>
            <span className="text-2xl font-mono font-extrabold text-emerald-400">
              ${employee.salary.netMonthly.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-white/[0.1] cursor-pointer"
          >
            <Printer size={14} />
            <span>Print Payslip</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
