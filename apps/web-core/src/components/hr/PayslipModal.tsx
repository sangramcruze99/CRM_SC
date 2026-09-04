'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Printer, CheckCircle2, ShieldCheck, DollarSign, Trash2, Receipt, Sparkles } from 'lucide-react';
import { EmployeeNode, TIER_DEFINITIONS, getTierFromLevel } from '@/lib/hrData';

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeNode | null;
  onRemoveEmployee?: (empId: string) => void;
}

export function PayslipModal({ isOpen, onClose, employee, onRemoveEmployee }: PayslipModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !employee || !mounted) return null;

  const tier = employee.tier || getTierFromLevel(employee.level);
  const tierMeta = TIER_DEFINITIONS[tier] || TIER_DEFINITIONS.TIER_C;
  const grossMonthly = employee.salary.baseMonthly + employee.salary.allowances + employee.salary.bonus;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 animate-in fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-950/99 border border-white/[0.14] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(16,185,129,0.15)] backdrop-blur-2xl space-y-6 text-white my-8 animate-in zoom-in-95 overflow-hidden">
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-emerald-500/10 blur-3xl rounded-full" />

        {/* Header */}
        <div className="flex justify-between items-start border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/25 border border-emerald-300/30">
              <Receipt size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-tight">Itemized Employee Payslip</h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase">
                  Payroll Ledger
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Period: August 2026 · Ref: PS-{employee.id.toUpperCase()}-202608
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Payslip Document Canvas */}
        <div className="bg-black/30 border border-white/[0.1] rounded-2xl p-5 space-y-4">
          {/* Company & Employee Identity */}
          <div className="flex justify-between items-start border-b border-white/[0.08] pb-3 text-xs">
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
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Department & Hierarchy</span>
              <span className="font-medium text-white">{employee.department}</span>
              <span className="text-slate-400 block">Type: {employee.employmentType}</span>
              <span
                className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold font-mono border ${tierMeta.badgeBg} ${tierMeta.badgeText} ${tierMeta.badgeBorder}`}
              >
                {tierMeta.code}: {tierMeta.title}
              </span>
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
          <div className="p-3.5 bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-transparent border border-emerald-500/40 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-extrabold text-emerald-300 tracking-wider block">
                Net Disbursed Take-Home Pay
              </span>
              <span className="text-xs text-slate-300">
                {employee.bankDetails?.payoutMethod === 'PAYPAL'
                  ? 'Instant PayPal Payout'
                  : employee.bankDetails?.payoutMethod === 'CRYPTO_VAULT'
                  ? 'On-Chain Smart Contract Payout'
                  : 'Direct Deposit / Wire to Employee Bank'}
              </span>
            </div>
            <span className="text-2xl font-mono font-extrabold text-emerald-400">
              {employee.salary.currency || '$'}{employee.salary.netMonthly.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Banking Payout & Treasury Wire Details */}
          <div className="p-3.5 bg-white/[0.02] border border-white/[0.08] rounded-xl space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <span>Direct Banking Settlement Rails</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                ACH / DUAL KHATA RECONCILED
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Disbursement Rail</span>
                <span className="text-white font-semibold">
                  {employee.bankDetails?.payoutMethod || 'DIRECT_DEPOSIT'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Beneficiary Bank / Venue</span>
                <span className="text-white font-semibold truncate block">
                  {employee.bankDetails?.bankName || 'JPMorgan Chase Private Bank'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Account / Wallet Ref</span>
                <span className="text-emerald-300 font-mono font-bold truncate block">
                  {employee.bankDetails?.accountNumberMasked ||
                    employee.bankDetails?.paypalEmail ||
                    employee.bankDetails?.cryptoAddress ||
                    '•••• 8421'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Routing / SWIFT</span>
                <span className="text-slate-300 font-mono">
                  {employee.bankDetails?.routingNumber || '021000021'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Settlement Currency</span>
                <span className="text-slate-300 font-bold">
                  {employee.bankDetails?.payoutCurrency || 'USD'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Trace Ref Hash</span>
                <span className="text-slate-400 font-mono text-[10px]">
                  TX-FED-{employee.id.slice(-6).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/[0.08]">
          {onRemoveEmployee ? (
            <button
              type="button"
              onClick={() => {
                if (confirm(`Are you sure you want to remove and offboard ${employee.firstName} ${employee.lastName} from the organization?`)) {
                  onRemoveEmployee(employee.id);
                  onClose();
                }
              }}
              className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl text-xs font-bold transition-all border border-rose-500/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Remove Employee</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-white/[0.1] transition-all cursor-pointer"
            >
              <Printer size={14} />
              <span>Print Payslip</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all cursor-pointer"
            >
              Close Viewer
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
