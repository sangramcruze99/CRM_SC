'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Users,
  ChevronDown,
  ChevronRight,
  UserPlus,
  ArrowRight,
  DollarSign,
  Briefcase,
  Sparkles,
  ShieldCheck,
  Building,
  Edit2,
  CheckCircle2,
  Trash2,
  RotateCcw,
  Layers,
  Network,
  Cpu,
  HeartHandshake,
  Landmark,
  CreditCard,
  Wallet,
  QrCode,
  Zap,
  AlertCircle,
  X,
  Printer,
  Check,
  Smartphone,
} from 'lucide-react';
import { EmployeeNode, EmployeeTier, TIER_DEFINITIONS, getTierFromLevel } from '@/lib/hrData';
import { FinancialAccount, BankTransaction, FX_RATES } from '@/app/banking/BankingClient';
import { useIndustry } from '@/components/industry/IndustryContext';

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

interface OrgHierarchyTreeProps {
  employees: EmployeeNode[];
  onSelectEmployee: (emp: EmployeeNode) => void;
  onReassignManager: (empId: string, newManagerId: string | null) => void;
  onRemoveEmployee: (empId: string) => void;
  onOpenAddModal: () => void;
  onResetNicheEmployees?: () => void;
  onUpdateEmployee?: (emp: EmployeeNode) => void;
}

export function OrgHierarchyTree({
  employees,
  onSelectEmployee,
  onReassignManager,
  onRemoveEmployee,
  onOpenAddModal,
  onResetNicheEmployees,
  onUpdateEmployee,
}: OrgHierarchyTreeProps) {
  const { nicheConfig } = useIndustry();
  const [viewMode, setViewMode] = useState<'tree' | 'matrix'>('matrix');
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [editingManagerFor, setEditingManagerFor] = useState<string | null>(null);

  // Bank & Payment State
  const [mounted, setMounted] = useState(false);
  const [corporateAccounts, setCorporateAccounts] = useState<FinancialAccount[]>(DEFAULT_CORPORATE_ACCOUNTS);
  const [disburseEmployeeTarget, setDisburseEmployeeTarget] = useState<EmployeeNode | null>(null);
  const [selectedCorpAccountId, setSelectedCorpAccountId] = useState<string>('');
  const [disburseFeedback, setDisburseFeedback] = useState<string | null>(null);
  const [qrEmployeeTarget, setQrEmployeeTarget] = useState<EmployeeNode | null>(null);
  const [simulatedTipAmount, setSimulatedTipAmount] = useState<number>(50);
  const [qrFeedback, setQrFeedback] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
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
    if (corporateAccounts.length > 0 && !selectedCorpAccountId) {
      setSelectedCorpAccountId(corporateAccounts[0].id);
    }
  }, [corporateAccounts, selectedCorpAccountId]);

  const toggleCollapse = (id: string) => {
    setCollapsedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Group employees by manager for tree view
  const getDirectReports = (managerId: string | null) => {
    return employees.filter((e) => e.managerId === managerId);
  };

  const rootEmployees = getDirectReports(null);

  // Group employees by 4 Tiers for Matrix view
  const tierAEmployees = employees.filter((e) => e.level === 0 || e.tier === 'TIER_A');
  const tierBEmployees = employees.filter((e) => e.level === 1 || e.tier === 'TIER_B');
  const tierCEmployees = employees.filter((e) => e.level === 2 || e.tier === 'TIER_C');
  const tierDEmployees = employees.filter((e) => e.level === 3 || e.tier === 'TIER_D');

  const getTierMeta = (emp: EmployeeNode) => {
    const tier = emp.tier || getTierFromLevel(emp.level);
    return TIER_DEFINITIONS[tier] || TIER_DEFINITIONS.TIER_C;
  };

  const handleExecuteDisbursement = (emp: EmployeeNode) => {
    const corpAcc = corporateAccounts.find((a) => a.id === selectedCorpAccountId) || corporateAccounts[0];
    if (!corpAcc) return;

    // Currency FX rate computation
    const empCurrency = emp.bankDetails?.payoutCurrency || 'USD';
    const corpCurrency = corpAcc.currency || 'USD';
    const empRate = FX_RATES[empCurrency]?.rateToUSD || 1.0;
    const corpRate = FX_RATES[corpCurrency]?.rateToUSD || 1.0;
    const debitAmountInCorpCurr = (emp.salary.netMonthly / empRate) * corpRate;

    if (corpAcc.balance < debitAmountInCorpCurr) {
      setDisburseFeedback(
        `⚠️ Insufficient treasury balance in ${corpAcc.name}. Available: ${corpAcc.currency} ${corpAcc.balance.toLocaleString()}, Needed: ${corpAcc.currency} ${Math.round(debitAmountInCorpCurr).toLocaleString()}`
      );
      return;
    }

    // 1. Debit corporate account in enterprise_financial_accounts
    const updatedAccounts = corporateAccounts.map((acc) => {
      if (acc.id === corpAcc.id) {
        return {
          ...acc,
          balance: Math.max(0, acc.balance - debitAmountInCorpCurr),
          lastSynced: 'Just now (Salary Disbursed)',
        };
      }
      return acc;
    });
    setCorporateAccounts(updatedAccounts);
    try {
      localStorage.setItem('enterprise_financial_accounts', JSON.stringify(updatedAccounts));
    } catch (e) {}

    // 2. Append DEBIT transaction to enterprise_bank_transactions
    const txId = `tx_sal_${Date.now()}`;
    const newTx: BankTransaction = {
      id: txId,
      date: 'Just now (Automated Payout)',
      description: `Salary Disbursement: ${emp.firstName} ${emp.lastName} (${emp.jobTitle})`,
      accountId: corpAcc.id,
      accountName: corpAcc.name,
      amount: Math.round(debitAmountInCorpCurr * 100) / 100,
      currency: corpAcc.currency,
      type: 'DEBIT',
      status: 'RECONCILED',
      matchedRecord: `Dual Khata Payroll · Emp #${emp.id} (${emp.department})`,
    };

    try {
      const storedTx = localStorage.getItem('enterprise_bank_transactions');
      const parsedTx = storedTx ? JSON.parse(storedTx) : [];
      const updatedTx = [newTx, ...(Array.isArray(parsedTx) ? parsedTx : [])];
      localStorage.setItem('enterprise_bank_transactions', JSON.stringify(updatedTx));
    } catch (e) {}

    // 3. Dispatch cross-module event
    window.dispatchEvent(new Event('enterprise_finance_updated'));

    // 4. Update employee node
    const updatedEmployee: EmployeeNode = {
      ...emp,
      salary: {
        ...emp.salary,
        paymentStatus: 'PAID',
        lastPayDate: new Date().toISOString().split('T')[0],
      },
      bankDetails: {
        ...(emp.bankDetails || {
          bankName: 'JPMorgan Chase Private Bank',
          accountNumberMasked: '•••• 8421',
          routingNumber: '021000021',
          payoutCurrency: 'USD',
          payoutMethod: 'DIRECT_DEPOSIT',
        }),
        disbursementHistory: [
          {
            id: `disb_${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            amount: emp.salary.netMonthly,
            currency: empCurrency,
            corporateAccountId: corpAcc.id,
            corporateAccountName: corpAcc.name,
            payoutMethod: emp.bankDetails?.payoutMethod || 'DIRECT_DEPOSIT',
            txHashOrRef: `TX-WIRE-${Math.floor(100000 + Math.random() * 900000)}`,
            status: 'COMPLETED',
          },
          ...(emp.bankDetails?.disbursementHistory || []),
        ],
      },
    };

    if (onUpdateEmployee) {
      onUpdateEmployee(updatedEmployee);
    }

    setDisburseFeedback(
      `🎉 Wire transfer of ${FX_RATES[empCurrency]?.symbol || '$'}${emp.salary.netMonthly.toLocaleString()} successfully executed from ${corpAcc.name}! Status: PAID.`
    );
    setTimeout(() => {
      setDisburseFeedback(null);
      setDisburseEmployeeTarget(null);
    }, 2000);
  };

  const handleSimulateQrPayment = (emp: EmployeeNode) => {
    const tip = simulatedTipAmount || 50;
    const empCurrency = emp.bankDetails?.payoutCurrency || 'USD';
    const symbol = FX_RATES[empCurrency]?.symbol || '$';

    const currentTips = emp.paymentQr?.totalTipsOrCommissions || 0;
    const updatedQr = {
      qrId: emp.paymentQr?.qrId || `qr_${emp.id}`,
      purpose: emp.paymentQr?.purpose || 'TIPS_GRATUITY',
      totalTipsOrCommissions: currentTips + tip,
      lastPaymentReceived: `Just now (${symbol}${tip})`,
    };

    const updatedEmployee: EmployeeNode = {
      ...emp,
      paymentQr: updatedQr,
    };

    const corpAcc = corporateAccounts[0];
    if (corpAcc) {
      const newTx: BankTransaction = {
        id: `tx_tip_${Date.now()}`,
        date: 'Just now (QR Scan)',
        description: `Employee QR Inflow (${emp.firstName} ${emp.lastName} - ${updatedQr.purpose})`,
        accountId: corpAcc.id,
        accountName: corpAcc.name,
        amount: tip,
        currency: empCurrency,
        type: 'CREDIT',
        status: 'RECONCILED',
        matchedRecord: `Dual Khata Employee QR #${emp.id}`,
      };
      try {
        const storedTx = localStorage.getItem('enterprise_bank_transactions');
        const parsedTx = storedTx ? JSON.parse(storedTx) : [];
        const updatedTx = [newTx, ...(Array.isArray(parsedTx) ? parsedTx : [])];
        localStorage.setItem('enterprise_bank_transactions', JSON.stringify(updatedTx));
        window.dispatchEvent(new Event('enterprise_finance_updated'));
      } catch (e) {}
    }

    if (onUpdateEmployee) {
      onUpdateEmployee(updatedEmployee);
    }

    setQrFeedback(`🎉 Received ${symbol}${tip} via Employee QR! Recorded in Khata ledger.`);
    setTimeout(() => setQrFeedback(null), 3000);
  };

  const renderEmployeeCard = (emp: EmployeeNode, isCompact = false) => {
    const directReports = getDirectReports(emp.id);
    const isCollapsed = collapsedNodes[emp.id];
    const hasReports = directReports.length > 0;
    const tierMeta = getTierMeta(emp);

    return (
      <div
        key={emp.id}
        className={`p-4 rounded-3xl border transition-all shadow-xl backdrop-blur-2xl relative group bg-white/[0.04] dark:bg-slate-900/80 ${
          emp.level === 0
            ? 'border-amber-500/60 ring-2 ring-amber-500/20 shadow-amber-500/15'
            : emp.level === 1
            ? 'border-sky-500/40 ring-1 ring-sky-500/20 hover:border-sky-400/60'
            : emp.level === 2
            ? 'border-emerald-500/40 ring-1 ring-emerald-500/20 hover:border-emerald-400/60'
            : 'border-purple-500/40 ring-1 ring-purple-500/20 hover:border-purple-400/60'
        } ${isCompact ? 'w-64 sm:w-72' : 'w-72 sm:w-80'}`}
      >
        {/* Tier Badge Pill & Salary + Quick Remove Action */}
        <div className="flex items-center justify-between mb-2">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border font-mono ${tierMeta.badgeBg} ${tierMeta.badgeText} ${tierMeta.badgeBorder}`}
          >
            {tierMeta.code}: {tierMeta.title}
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono font-bold text-emerald-400">
              ${emp.salary.netMonthly.toLocaleString()}/mo
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (
                  confirm(
                    `Are you sure you want to remove ${emp.firstName} ${emp.lastName} (${emp.jobTitle}) from the organization tree?`
                  )
                ) {
                  onRemoveEmployee(emp.id);
                }
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title={`Remove ${emp.firstName} ${emp.lastName}`}
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex items-center gap-3">
          <img
            src={emp.avatar}
            alt={emp.firstName}
            className="w-11 h-11 rounded-2xl object-cover border border-white/10 shadow-md flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-white truncate group-hover:text-emerald-300 transition-colors">
              {emp.firstName} {emp.lastName}
            </h4>
            <p className="text-[11px] text-emerald-400/90 font-medium truncate">{emp.jobTitle}</p>
            <span className="text-[10px] text-slate-400 block truncate">{emp.department}</span>
          </div>
        </div>

        {/* Bank Details & Payout Rail Badge */}
        <div className="mt-2.5 px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/[0.08] flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1.5 truncate text-slate-300">
            <Landmark size={11} className="text-emerald-400 flex-shrink-0" />
            <span className="truncate font-semibold">
              {emp.bankDetails?.bankName || 'Direct Deposit'}
            </span>
          </div>
          <span className="font-mono text-emerald-300 font-bold ml-1.5 flex-shrink-0">
            {emp.bankDetails?.accountNumberMasked || '•••• 8421'}
          </span>
        </div>

        {/* Salary Payment Status Strip & 1-Click Pay */}
        <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px]">
          {emp.salary.paymentStatus === 'PAID' ? (
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <CheckCircle2 size={11} className="text-emerald-400" />
              <span>Paid ({emp.salary.lastPayDate || 'Aug 2026'})</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-400 font-bold animate-pulse">
              <AlertCircle size={11} />
              <span>Pending Disbursal</span>
            </span>
          )}

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setQrEmployeeTarget(emp);
              }}
              className="p-1 text-slate-300 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-md border border-white/10 transition-colors cursor-pointer"
              title="Employee Payment QR Standee"
            >
              <QrCode size={11} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDisburseEmployeeTarget(emp);
              }}
              className="px-2 py-0.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-md text-[10px] shadow-sm transition-all cursor-pointer flex items-center gap-1 active:scale-95"
              title="Disburse Monthly Salary from Corporate Treasury"
            >
              <Zap size={10} />
              <span>{emp.salary.paymentStatus === 'PAID' ? 'Re-Pay' : 'Disburse'}</span>
            </button>
          </div>
        </div>

        {/* Quick Actions & Reporting Line Editor */}
        <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => onSelectEmployee(emp)}
            className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Payslip</span>
            <ArrowRight size={11} />
          </button>

          {/* Re-assign Manager Trigger */}
          {emp.level > 0 && (
            <div className="relative">
              {editingManagerFor === emp.id ? (
                <select
                  defaultValue={emp.managerId || ''}
                  onChange={(e) => {
                    onReassignManager(emp.id, e.target.value || null);
                    setEditingManagerFor(null);
                  }}
                  onBlur={() => setEditingManagerFor(null)}
                  autoFocus
                  className="px-2 py-1 bg-slate-900 border border-amber-500 rounded-lg text-[10px] text-white focus:outline-none"
                >
                  <option value="">Executive Leadership</option>
                  {employees
                    .filter((m) => m.id !== emp.id && m.level < emp.level)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        Mgr: {m.firstName} ({m.jobTitle})
                      </option>
                    ))}
                </select>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingManagerFor(emp.id)}
                  className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.08]"
                >
                  <Edit2 size={10} />
                  <span>Change Mgr</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Expand / Collapse Sub-Tree Toggle (Tree View Only) */}
        {hasReports && viewMode === 'tree' && (
          <button
            type="button"
            onClick={() => toggleCollapse(emp.id)}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer z-10"
            title={isCollapsed ? 'Expand Direct Reports' : 'Collapse Direct Reports'}
          >
            {isCollapsed ? <ChevronDown size={13} /> : <ChevronRight size={13} className="rotate-90" />}
          </button>
        )}
      </div>
    );
  };

  const renderTreeNode = (emp: EmployeeNode) => {
    const directReports = getDirectReports(emp.id);
    const isCollapsed = collapsedNodes[emp.id];
    const hasReports = directReports.length > 0;

    return (
      <div key={emp.id} className="flex flex-col items-center space-y-3 relative">
        {renderEmployeeCard(emp)}

        {/* Child Subtree Nodes */}
        {hasReports && !isCollapsed && (
          <div className="pt-6 relative flex flex-col items-center">
            {/* Top Connector Line */}
            <div className="w-0.5 h-6 bg-gradient-to-b from-amber-500/40 to-white/15 -mt-6" />

            {/* Horizontal Branch Bar */}
            {directReports.length > 1 && (
              <div
                className="h-0.5 bg-white/15 mb-6"
                style={{
                  width: `${Math.min(900, (directReports.length - 1) * 320)}px`,
                }}
              />
            )}

            {/* Sub-Tree Cards Container */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 items-start">
              {directReports.map((report) => renderTreeNode(report))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-5 shadow-sm dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {nicheConfig.name} — 4-Tier Organizational Pipeline
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
              {employees.length} Staff Members
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Structured 4-Tier hierarchy: <span className="text-amber-600 dark:text-amber-300 font-semibold">Tier A (Upper Mgmt)</span> ➔{' '}
            <span className="text-sky-600 dark:text-sky-300 font-semibold">Tier B (Middle Mgmt)</span> ➔{' '}
            <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Tier C (Operations)</span> &{' '}
            <span className="text-purple-700 dark:text-purple-300 font-semibold">Tier D (Support)</span>.
          </p>
        </div>

        {/* View Toggle & Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] rounded-2xl">
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'matrix'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Layers size={13} />
              <span>4-Tier Matrix</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'tree'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Network size={13} />
              <span>Reporting Tree</span>
            </button>
          </div>

          {onResetNicheEmployees && (
            <button
              type="button"
              onClick={() => {
                if (
                  confirm(
                    `Reset employee roster to full ${nicheConfig.shortName} 4-tier default hierarchy template?`
                  )
                ) {
                  onResetNicheEmployees();
                }
              }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/[0.08] transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Reset to default template for this niche"
            >
              <RotateCcw size={13} />
              <span className="hidden sm:inline">Reset Preset</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
          >
            <UserPlus size={14} />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* 4-Tier Key Mapping Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.values(TIER_DEFINITIONS).map((def) => {
          const count = employees.filter((e) => e.level === def.level || e.tier === def.tier).length;
          return (
            <div
              key={def.tier}
              className={`p-3.5 rounded-2xl border bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] shadow-xs backdrop-blur-xl ${def.badgeBorder} flex items-center justify-between`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase ${def.badgeBg} ${def.badgeText} border ${def.badgeBorder}`}
                  >
                    {def.code}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{def.title}</h4>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{def.subtitle}</p>
              </div>
              <span className="text-sm font-mono font-bold text-emerald-700 dark:text-emerald-400 px-2 py-1 bg-slate-100 dark:bg-white/[0.04] rounded-lg border border-slate-200 dark:border-white/[0.06]">
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Visual Hierarchy Canvas */}
      {employees.length === 0 ? (
        <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] rounded-3xl p-12 text-center shadow-xs">
          <Users className="mx-auto text-slate-400 dark:text-slate-600 mb-3" size={44} />
          <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">No Team Members in Hierarchy</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 max-w-sm mx-auto">
            Load the default 4-tier template or add your first Upper Management executive.
          </p>
          <div className="flex items-center justify-center gap-3">
            {onResetNicheEmployees && (
              <button
                type="button"
                onClick={onResetNicheEmployees}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs border border-slate-200 dark:border-white/[0.1] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw size={13} />
                <span>Load {nicheConfig.shortName} Template</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenAddModal}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-500/25 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <UserPlus size={13} />
              <span>Add First Employee</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'matrix' ? (
        /* =========================================================================
           4-TIER KEY MAPPING ARCHITECTURE MATRIX VIEW
           [ TIER A: UPPER MANAGEMENT ]
                      │
           [ TIER B: MIDDLE MANAGEMENT ]
                      │
               ┌──────┴──────┐
           [ TIER C ]    [ TIER D ]
           ========================================================================= */
        <div className="space-y-8 bg-white/[0.02] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-inner overflow-x-auto">
          {/* TIER A: UPPER MANAGEMENT */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-extrabold uppercase tracking-wider font-mono shadow-lg shadow-amber-500/10">
              <span>👑 [ TIER A: UPPER MANAGEMENT ]</span>
              <span className="text-[10px] text-amber-400/80 font-normal">
                (CEO, CFO, CTO, Managing Directors)
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-5">
              {tierAEmployees.map((emp) => renderEmployeeCard(emp, true))}
            </div>
          </div>

          {/* Central Vertical Connector Line */}
          <div className="flex justify-center -my-3">
            <div className="w-0.5 h-10 bg-gradient-to-b from-amber-500 to-sky-500" />
          </div>

          {/* TIER B: MIDDLE MANAGEMENT */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-sky-500/15 border border-sky-500/40 text-sky-300 text-xs font-extrabold uppercase tracking-wider font-mono shadow-lg shadow-sky-500/10">
              <span>👔 [ TIER B: MIDDLE MANAGEMENT ]</span>
              <span className="text-[10px] text-sky-400/80 font-normal">
                (General Managers, Department Leads, Supervisors)
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-5">
              {tierBEmployees.map((emp) => renderEmployeeCard(emp, true))}
            </div>
          </div>

          {/* Fork Connector (Branching bus line to Tier C & Tier D) */}
          <div className="flex flex-col items-center -my-3">
            <div className="w-0.5 h-6 bg-gradient-to-b from-sky-500 to-emerald-500" />
            <div className="w-full max-w-2xl h-0.5 bg-gradient-to-r from-emerald-500 via-white/20 to-purple-500" />
            <div className="w-full max-w-2xl flex justify-between px-24">
              <div className="w-0.5 h-6 bg-emerald-500" />
              <div className="w-0.5 h-6 bg-purple-500" />
            </div>
          </div>

          {/* SPLIT ROW: TIER C (OPERATIONS) & TIER D (SUPPORT) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start pt-2">
            {/* TIER C: OPERATIONS */}
            <div className="p-5 rounded-3xl bg-emerald-500/[0.03] border border-emerald-500/25 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-4 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold uppercase tracking-wider font-mono shadow-md">
                <span>⚙️ [ TIER C: OPERATIONS ]</span>
                <span className="text-[10px] text-emerald-400/80 font-normal">
                  ({tierCEmployees.length} Staff)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-4 text-center">
                Associates, Specialists, Technicians, Engineers, Doctors, Cooks
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full justify-items-center">
                {tierCEmployees.map((emp) => renderEmployeeCard(emp, true))}
              </div>
            </div>

            {/* TIER D: SUPPORT STAFF */}
            <div className="p-5 rounded-3xl bg-purple-500/[0.03] border border-purple-500/25 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-4 px-3.5 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/40 text-purple-300 text-xs font-extrabold uppercase tracking-wider font-mono shadow-md">
                <span>🛠️ [ TIER D: SUPPORT ]</span>
                <span className="text-[10px] text-purple-400/80 font-normal">
                  ({tierDEmployees.length} Staff)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-4 text-center">
                Clerks, Janitors, Maintenance, Sanitation, Porters, Receptionists
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full justify-items-center">
                {tierDEmployees.map((emp) => renderEmployeeCard(emp, true))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
           ORGANIZATIONAL REPORTING PIPELINE TREE VIEW
           ========================================================================= */
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-3xl p-8 overflow-x-auto min-h-[500px] flex justify-center items-center shadow-inner">
          <div className="flex flex-col items-center space-y-8 min-w-max">
            {rootEmployees.map((root) => renderTreeNode(root))}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: 1-CLICK SALARY DISBURSEMENT FROM CORPORATE TREASURY
          ========================================================================= */}
      {disburseEmployeeTarget && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-950 border border-white/15 rounded-3xl p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_0_1px_rgba(16,185,129,0.2)] text-white space-y-5 overflow-hidden">
            {/* Top Glow Accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/25">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Disburse Salary Wire</h3>
                  <p className="text-xs text-slate-400">Direct corporate treasury debit with automated Khata reconciliation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDisburseEmployeeTarget(null);
                  setDisburseFeedback(null);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Feedback Alert Banner */}
            {disburseFeedback && (
              <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                disburseFeedback.includes('⚠️')
                  ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                  : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              }`}>
                <span>{disburseFeedback}</span>
              </div>
            )}

            {/* Employee Payout Destination Profile */}
            <div className="p-3.5 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center gap-3">
              <img
                src={disburseEmployeeTarget.avatar}
                alt={disburseEmployeeTarget.firstName}
                className="w-12 h-12 rounded-xl object-cover border border-white/10"
              />
              <div className="flex-1 min-w-0 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm truncate">
                    {disburseEmployeeTarget.firstName} {disburseEmployeeTarget.lastName}
                  </h4>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    ${disburseEmployeeTarget.salary.netMonthly.toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-400 truncate">{disburseEmployeeTarget.jobTitle} · {disburseEmployeeTarget.department}</p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-emerald-300 font-mono">
                  <span>{disburseEmployeeTarget.bankDetails?.bankName || 'JPMorgan Chase'}</span>
                  <span>({disburseEmployeeTarget.bankDetails?.accountNumberMasked || '•••• 8421'})</span>
                </div>
              </div>
            </div>

            {/* Corporate Disbursing Treasury Selector */}
            <div className="space-y-1.5 text-xs">
              <label className="block text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <Landmark size={12} className="text-emerald-400" />
                <span>Disbursing Corporate Treasury Account</span>
              </label>
              <select
                value={selectedCorpAccountId}
                onChange={(e) => setSelectedCorpAccountId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 font-medium cursor-pointer"
              >
                {corporateAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} — Balance: {FX_RATES[acc.currency]?.symbol || '$'}{acc.balance.toLocaleString()} {acc.currency}
                  </option>
                ))}
              </select>
            </div>

            {/* Settlement Summary Strip */}
            <div className="p-3 bg-black/40 border border-white/[0.08] rounded-xl space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Gross Compensation</span>
                <span className="font-mono text-slate-200">
                  ${(disburseEmployeeTarget.salary.baseMonthly + disburseEmployeeTarget.salary.allowances + disburseEmployeeTarget.salary.bonus).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Statutory Deductions (PAYE/PF)</span>
                <span className="font-mono text-rose-400">-${disburseEmployeeTarget.salary.taxDeductions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white font-bold pt-1 border-t border-white/10">
                <span>Net Outflow Wire</span>
                <span className="font-mono text-emerald-400 text-xs">
                  ${disburseEmployeeTarget.salary.netMonthly.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setDisburseEmployeeTarget(null);
                  setDisburseFeedback(null);
                }}
                className="px-4 py-2 bg-white/[0.05] hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleExecuteDisbursement(disburseEmployeeTarget)}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <Zap size={14} />
                <span>Confirm &amp; Disburse Wire</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* =========================================================================
          MODAL 2: PERSONAL EMPLOYEE PAYMENT QR STANDEE & SIMULATOR
          ========================================================================= */}
      {qrEmployeeTarget && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-950 border border-white/15 rounded-3xl p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_0_1px_rgba(16,185,129,0.2)] text-white space-y-4 text-center overflow-hidden">
            {/* Top Glow Accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-left">
                <QrCode size={18} className="text-emerald-400" />
                <div>
                  <h3 className="text-sm font-black text-white">Employee Payment QR Standee</h3>
                  <p className="text-[11px] text-slate-400">Direct client tips, retainer &amp; commission terminal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setQrEmployeeTarget(null);
                  setQrFeedback(null);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Feedback Banner */}
            {qrFeedback && (
              <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                <CheckCircle2 size={14} />
                <span>{qrFeedback}</span>
              </div>
            )}

            {/* Acrylic Countertop Standee Mockup */}
            <div className="p-5 bg-gradient-to-b from-white to-slate-100 rounded-3xl text-slate-950 shadow-2xl border-4 border-slate-900 space-y-3">
              {/* Standee Header */}
              <div className="flex flex-col items-center">
                <img
                  src={qrEmployeeTarget.avatar}
                  alt={qrEmployeeTarget.firstName}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-900 shadow-md mb-1.5"
                />
                <h4 className="font-extrabold text-sm tracking-tight">
                  {qrEmployeeTarget.firstName} {qrEmployeeTarget.lastName}
                </h4>
                <p className="text-[11px] font-semibold text-emerald-700">{qrEmployeeTarget.jobTitle}</p>
                <span className="text-[9px] text-slate-500 uppercase font-mono font-bold tracking-wider">
                  {nicheConfig.name} Staff Member
                </span>
              </div>

              {/* High-Contrast SVG QR Matrix */}
              <div className="w-44 h-44 mx-auto p-3 bg-white rounded-2xl border-2 border-slate-900 shadow-inner flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <rect width="100" height="100" fill="#ffffff" />
                  {/* Outer Position Finders */}
                  <rect x="8" y="8" width="28" height="28" fill="#0f172a" />
                  <rect x="12" y="12" width="20" height="20" fill="#ffffff" />
                  <rect x="16" y="16" width="12" height="12" fill="#0f172a" />
                  <rect x="64" y="8" width="28" height="28" fill="#0f172a" />
                  <rect x="68" y="12" width="20" height="20" fill="#ffffff" />
                  <rect x="72" y="16" width="12" height="12" fill="#0f172a" />
                  <rect x="8" y="64" width="28" height="28" fill="#0f172a" />
                  <rect x="12" y="68" width="20" height="20" fill="#ffffff" />
                  <rect x="16" y="72" width="12" height="12" fill="#0f172a" />
                  {/* Pattern Elements */}
                  <rect x="42" y="12" width="8" height="8" fill="#0f172a" />
                  <rect x="54" y="12" width="6" height="6" fill="#0f172a" />
                  <rect x="42" y="24" width="8" height="8" fill="#0f172a" />
                  <rect x="12" y="44" width="8" height="8" fill="#0f172a" />
                  <rect x="44" y="44" width="12" height="12" fill="#10b981" rx="2" />
                  <rect x="64" y="44" width="8" height="8" fill="#0f172a" />
                  <rect x="80" y="44" width="8" height="8" fill="#0f172a" />
                  <rect x="44" y="64" width="8" height="8" fill="#0f172a" />
                  <rect x="64" y="64" width="8" height="8" fill="#0f172a" />
                  <rect x="74" y="78" width="8" height="8" fill="#0f172a" />
                </svg>
              </div>

              {/* QR Purpose & Receiving Bank Notice */}
              <div className="text-[11px] space-y-0.5">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {qrEmployeeTarget.paymentQr?.purpose || 'TIPS & GRATUITY'}
                </span>
                <p className="text-[10px] text-slate-500 font-medium">
                  Direct settlement to {qrEmployeeTarget.bankDetails?.bankName || 'JPMorgan Chase'} ({qrEmployeeTarget.bankDetails?.accountNumberMasked || '•••• 8421'})
                </p>
              </div>

              {/* Total Tips Collected Badge */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700 px-2">
                <span>Total Received:</span>
                <span className="font-mono text-emerald-600 font-black">
                  ${(qrEmployeeTarget.paymentQr?.totalTipsOrCommissions || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Interactive Simulation: Pay Tip / Commission */}
            <div className="p-3 bg-white/[0.04] border border-white/10 rounded-2xl space-y-2 text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Simulate Client Camera Scan &amp; Direct Pay
              </span>
              <div className="flex items-center gap-2">
                {[20, 50, 100, 200].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setSimulatedTipAmount(amt)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      simulatedTipAmount === amt
                        ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                        : 'bg-black/40 text-slate-300 hover:text-white border border-white/10'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleSimulateQrPayment(qrEmployeeTarget)}
                className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Smartphone size={13} />
                <span>Process ${simulatedTipAmount} Payment to Employee</span>
              </button>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 bg-white/[0.06] hover:bg-white/10 text-white rounded-xl text-xs font-bold border border-white/10 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer size={13} />
                <span>Print Standee</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setQrEmployeeTarget(null);
                  setQrFeedback(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
