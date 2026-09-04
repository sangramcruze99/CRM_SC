'use client';

import React, { useState, useEffect } from 'react';
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
  Trash2,
  Landmark,
  CreditCard,
  Wallet,
  QrCode,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { EmployeeNode, TIER_DEFINITIONS, getTierFromLevel } from '@/lib/hrData';
import { FinancialAccount, BankTransaction, FX_RATES } from '@/app/banking/BankingClient';

const DEFAULT_CORPORATE_ACCOUNTS: FinancialAccount[] = [
  {
    id: 'corp_chase_treasury',
    name: 'JPMorgan Chase Corporate Treasury',
    type: 'BANK_ACCOUNT',
    provider: 'JPMorgan Chase & Co.',
    accountNumberMasked: '•••• 8831',
    balance: 840500,
    currency: 'USD',
    status: 'PRIMARY',
    lastSynced: 'Live (Dual Khata)',
  },
  {
    id: 'corp_svb_reserve',
    name: 'Silicon Valley Bank Reserve',
    type: 'BANK_ACCOUNT',
    provider: 'First Citizens / SVB',
    accountNumberMasked: '•••• 4120',
    balance: 290000,
    currency: 'USD',
    status: 'ACTIVE',
    lastSynced: 'Live (Dual Khata)',
  },
  {
    id: 'corp_paypal_treasury',
    name: 'Corporate PayPal Treasury',
    type: 'PAYPAL',
    provider: 'PayPal Commercial',
    accountNumberMasked: 'treasury@enterprise-os.io',
    balance: 64200,
    currency: 'USD',
    status: 'ACTIVE',
    lastSynced: 'Live (Instant Wire)',
  },
];

interface SalaryPayrollHubProps {
  employees: EmployeeNode[];
  onOpenPayslip: (emp: EmployeeNode) => void;
  onRunPayrollBatch: (treasuryAccountId?: string) => void;
  onRemoveEmployee: (empId: string) => void;
  onOpenAddModal: () => void;
  onDisburseSingle?: (emp: EmployeeNode, treasuryAccountId: string) => void;
}

export function SalaryPayrollHub({
  employees,
  onOpenPayslip,
  onRunPayrollBatch,
  onRemoveEmployee,
  onOpenAddModal,
  onDisburseSingle,
}: SalaryPayrollHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedTier, setSelectedTier] = useState('ALL');

  // Corporate Treasury State
  const [corporateAccounts, setCorporateAccounts] = useState<FinancialAccount[]>(DEFAULT_CORPORATE_ACCOUNTS);
  const [selectedTreasuryId, setSelectedTreasuryId] = useState<string>('');

  useEffect(() => {
    const loadAccounts = () => {
      try {
        const stored = localStorage.getItem('enterprise_financial_accounts');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCorporateAccounts(parsed);
            return;
          }
        }
        setCorporateAccounts(DEFAULT_CORPORATE_ACCOUNTS);
      } catch (e) {
        setCorporateAccounts(DEFAULT_CORPORATE_ACCOUNTS);
      }
    };
    loadAccounts();
    window.addEventListener('enterprise_finance_updated', loadAccounts);
    window.addEventListener('storage', loadAccounts);
    return () => {
      window.removeEventListener('enterprise_finance_updated', loadAccounts);
      window.removeEventListener('storage', loadAccounts);
    };
  }, []);

  useEffect(() => {
    if (corporateAccounts.length > 0 && !selectedTreasuryId) {
      setSelectedTreasuryId(corporateAccounts[0].id);
    }
  }, [corporateAccounts, selectedTreasuryId]);

  const activeTreasury = corporateAccounts.find((a) => a.id === selectedTreasuryId) || corporateAccounts[0];

  // Compute payroll summary statistics
  const totalMonthlyNet = employees.reduce((acc, curr) => acc + curr.salary.netMonthly, 0);
  const totalGross = employees.reduce(
    (acc, curr) => acc + curr.salary.baseMonthly + curr.salary.allowances + curr.salary.bonus,
    0
  );
  const totalTaxes = employees.reduce((acc, curr) => acc + curr.salary.taxDeductions, 0);
  const pendingCount = employees.filter((e) => e.salary.paymentStatus !== 'PAID').length;

  const hasSufficientTreasury = activeTreasury ? activeTreasury.balance >= totalMonthlyNet : true;

  const departments = ['ALL', ...Array.from(new Set(employees.map((e) => e.department)))];

  const filteredEmployees = employees.filter((e) => {
    const tier = e.tier || getTierFromLevel(e.level);
    const matchesDept = selectedDept === 'ALL' || e.department === selectedDept;
    const matchesTier = selectedTier === 'ALL' || tier === selectedTier;
    const matchesSearch =
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesTier && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Corporate Treasury Disbursement Hub */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="text-emerald-600 dark:text-emerald-400" size={20} />
              <span>Salary Structure &amp; 4-Tier Corporate Payroll Hub</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
              Treasury Connected
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Automated compensation calculations, statutory tax deductions, and Khata ledger reconciliation across Tiers A–D.
          </p>
        </div>

        {/* Corporate Treasury Selector & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Treasury Source Selector */}
          <div className="flex items-center gap-2 p-1.5 bg-black/40 border border-white/10 rounded-2xl">
            <Landmark size={15} className="text-emerald-400 ml-2 flex-shrink-0" />
            <select
              value={selectedTreasuryId}
              onChange={(e) => setSelectedTreasuryId(e.target.value)}
              className="bg-transparent text-xs text-white font-medium focus:outline-none pr-3 cursor-pointer max-w-[220px] truncate"
            >
              {corporateAccounts.map((acc) => (
                <option key={acc.id} value={acc.id} className="bg-slate-900 text-white">
                  {acc.name} ({FX_RATES[acc.currency]?.symbol || '$'}{acc.balance.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenAddModal}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/[0.1] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Staff</span>
            </button>

            <button
              type="button"
              onClick={() => onRunPayrollBatch(selectedTreasuryId)}
              disabled={!hasSufficientTreasury && employees.length > 0}
              className={`px-4 py-2 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98] ${
                hasSufficientTreasury
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/25'
                  : 'bg-amber-500 text-slate-950 opacity-80 cursor-not-allowed'
              }`}
            >
              <Zap size={14} />
              <span>
                {hasSufficientTreasury
                  ? `Disburse Batch Run ($${totalMonthlyNet.toLocaleString()})`
                  : 'Insufficient Treasury Balance'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Monthly Payroll */}
        <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Monthly Payroll</span>
            <DollarSign size={16} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
            ${totalMonthlyNet.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">Net Disbursed Take-Home</div>
        </div>

        {/* Gross Total */}
        <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Gross Total Compensation</span>
            <Building size={16} className="text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white">
            ${totalGross.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">Base + Allowances + Bonus</div>
        </div>

        {/* Tax Deductions */}
        <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Statutory Deductions</span>
            <Receipt size={16} className="text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-rose-600 dark:text-rose-300">
            -${totalTaxes.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">PAYE & Social Security</div>
        </div>

        {/* Payroll Run Status */}
        <div className="bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Payrun Status</span>
            <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
            {pendingCount === 0 ? 'All Settled' : `${pendingCount} Pending`}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">August 2026 Batch</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white dark:bg-white/[0.04] p-3.5 rounded-3xl border border-slate-200 dark:border-white/[0.08] backdrop-blur-xl shadow-xs">
        <div className="relative w-full lg:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by employee name or job title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:bg-white/[0.08] font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <button
            type="button"
            onClick={() => setSelectedTier('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedTier === 'ALL'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-white/[0.06] text-slate-300 hover:text-white'
            }`}
          >
            All Tiers
          </button>
          {Object.values(TIER_DEFINITIONS).map((def) => (
            <button
              key={def.tier}
              onClick={() => setSelectedTier(def.tier)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedTier === def.tier
                  ? `${def.badgeBg} ${def.badgeText} border ${def.badgeBorder} font-bold shadow-md`
                  : 'bg-white/[0.06] text-slate-300 hover:text-white'
              }`}
            >
              {def.code}
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
                <th className="px-6 py-4">4-Tier Level</th>
                <th className="px-6 py-4">Receiving Bank &amp; Rail</th>
                <th className="px-6 py-4">Base Salary</th>
                <th className="px-6 py-4">Allowances &amp; Bonus</th>
                <th className="px-6 py-4">Deductions</th>
                <th className="px-6 py-4">Net Monthly Payout</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filteredEmployees.map((emp) => {
                const tier = emp.tier || getTierFromLevel(emp.level);
                const tierMeta = TIER_DEFINITIONS[tier] || TIER_DEFINITIONS.TIER_C;

                return (
                  <tr key={emp.id} className="hover:bg-white/[0.04] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={emp.avatar} alt={emp.firstName} className="w-9 h-9 rounded-xl object-cover" />
                        <div>
                          <span className="font-bold text-white text-sm block group-hover:text-emerald-300 transition-colors">
                            {emp.firstName} {emp.lastName}
                          </span>
                          <span className="text-[11px] text-slate-400">{emp.jobTitle}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${tierMeta.badgeBg} ${tierMeta.badgeText} ${tierMeta.badgeBorder}`}
                      >
                        {tierMeta.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Landmark size={13} className="text-emerald-400 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-white block text-xs truncate max-w-[140px]">
                            {emp.bankDetails?.bankName || 'JPMorgan Chase'}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-300">
                            {emp.bankDetails?.accountNumberMasked || '•••• 8421'} ({emp.bankDetails?.payoutMethod || 'DIRECT_DEPOSIT'})
                          </span>
                        </div>
                      </div>
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
                    <td className="px-6 py-4 font-mono font-extrabold text-sm text-emerald-400">
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
                      <div className="flex items-center justify-end gap-2">
                        {emp.salary.paymentStatus !== 'PAID' && onDisburseSingle && (
                          <button
                            type="button"
                            onClick={() => onDisburseSingle(emp, selectedTreasuryId)}
                            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black transition-all shadow-sm flex items-center gap-1 cursor-pointer active:scale-95"
                            title="Execute individual wire from Corporate Treasury"
                          >
                            <Zap size={11} />
                            <span>Pay</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onOpenPayslip(emp)}
                          className="px-3 py-1.5 bg-white/[0.06] hover:bg-emerald-500 hover:text-slate-950 text-slate-300 rounded-xl text-xs font-bold transition-all border border-white/[0.1] cursor-pointer"
                        >
                          Payslip
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              confirm(
                                `Are you sure you want to remove ${emp.firstName} ${emp.lastName} (${emp.jobTitle}) from payroll ledger?`
                              )
                            ) {
                              onRemoveEmployee(emp.id);
                            }
                          }}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg border border-rose-500/20 transition-colors cursor-pointer"
                          title={`Remove ${emp.firstName} ${emp.lastName}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
