'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  UserPlus,
  DollarSign,
  Building,
  Sparkles,
  User,
  Briefcase,
  Layers,
  ShieldCheck,
  Mail,
  Phone,
  Landmark,
  CreditCard,
  Wallet,
  QrCode,
  Coins,
} from 'lucide-react';
import { EmployeeNode, getTierFromLevel, TIER_DEFINITIONS, EmployeePayoutMethod } from '@/lib/hrData';
import { FX_RATES } from '@/app/banking/BankingClient';
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
  const { currentNiche, nicheConfig } = useIndustry();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('Operations');
  const [level, setLevel] = useState<number>(2); // Default to Tier C: Operations
  const [managerId, setManagerId] = useState<string>(
    existingEmployees.find((e) => e.level < 2)?.id || ''
  );
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [employmentType, setEmploymentType] = useState<'Full-Time' | 'Part-Time' | 'Contractor'>('Full-Time');
  const [baseMonthly, setBaseMonthly] = useState<number>(5500);
  const [allowances, setAllowances] = useState<number>(600);
  const [bonus, setBonus] = useState<number>(500);
  const [taxDeductions, setTaxDeductions] = useState<number>(1100);

  // Bank & Payment System State
  const [payoutMethod, setPayoutMethod] = useState<EmployeePayoutMethod>('DIRECT_DEPOSIT');
  const [bankName, setBankName] = useState('JPMorgan Chase Private Bank');
  const [accountNumber, setAccountNumber] = useState('8920194821');
  const [routingNumber, setRoutingNumber] = useState('021000021');
  const [payoutCurrency, setPayoutCurrency] = useState('USD');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [qrPurpose, setQrPurpose] = useState<'CONSULTING_FEE' | 'TIPS_GRATUITY' | 'SALES_COMMISSION' | 'DIRECT_RETAINER'>('TIPS_GRATUITY');

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

  if (!isOpen || !mounted) return null;

  const netMonthly = Math.max(0, baseMonthly + allowances + bonus - taxDeductions);
  const tier = getTierFromLevel(level);
  const tierMeta = TIER_DEFINITIONS[tier];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !jobTitle) return;

    const newEmp: EmployeeNode = {
      id: `emp_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
      firstName,
      lastName,
      jobTitle,
      department,
      tier,
      level,
      managerId: level === 0 ? null : managerId || null,
      email: email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${currentNiche === 'all' ? 'enterprise-master' : currentNiche + '-os'}.io`,
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
        currency: FX_RATES[payoutCurrency]?.symbol || '$',
        paymentStatus: 'PAID',
        lastPayDate: new Date().toISOString().split('T')[0],
      },
      bankDetails: {
        bankName:
          payoutMethod === 'PAYPAL'
            ? 'PayPal Global Payouts'
            : payoutMethod === 'CRYPTO_VAULT'
            ? 'Web3 Multi-Chain Vault'
            : bankName || 'JPMorgan Chase Private Bank',
        accountNumberMasked: accountNumber ? `•••• ${accountNumber.slice(-4)}` : '•••• 8421',
        routingNumber: routingNumber || '021000021',
        payoutCurrency,
        payoutMethod,
        paypalEmail: payoutMethod === 'PAYPAL' ? (paypalEmail || email) : undefined,
        cryptoAddress: payoutMethod === 'CRYPTO_VAULT' ? (cryptoAddress || '0x71C...a49B') : undefined,
        disbursementHistory: [
          {
            id: `disb_init_${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            amount: netMonthly,
            currency: payoutCurrency,
            corporateAccountId: 'acc_primary_treasury',
            corporateAccountName: 'Corporate Operating Treasury',
            payoutMethod,
            txHashOrRef: `TX-WIRE-${Math.floor(100000 + Math.random() * 900000)}`,
            status: 'COMPLETED',
          },
        ],
      },
      paymentQr: {
        qrId: `qr_emp_${Date.now().toString().slice(-6)}`,
        purpose: qrPurpose,
        totalTipsOrCommissions: 0,
        lastPaymentReceived: 'Ready for scanning',
      },
      niche: currentNiche,
    };

    onAddEmployee(newEmp);
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 animate-in fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-950/99 border border-white/[0.14] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(16,185,129,0.15)] backdrop-blur-2xl space-y-6 text-white my-8 animate-in zoom-in-95 overflow-hidden">
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-emerald-500/10 blur-3xl rounded-full" />

        {/* Header */}
        <div className="flex justify-between items-start border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/25 border border-emerald-300/30">
              <UserPlus size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white tracking-tight">Add Employee to 4-Tier Organization</h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase">
                  HR & Payroll
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Position member in {nicheConfig.shortName} hierarchy (Tier A ➔ Tier B ➔ Tier C / Tier D)
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <User size={12} className="text-emerald-400" />
                <span>First Name</span>
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rachel"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full pl-9.5 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <User size={12} className="text-emerald-400" />
                <span>Last Name</span>
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Green"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full pl-9.5 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Briefcase size={12} className="text-emerald-400" />
                <span>Job Title</span>
              </label>
              <div className="relative">
                <Briefcase size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Software Architect / Senior Surgeon"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full pl-9.5 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Building size={12} className="text-emerald-400" />
                <span>Department</span>
              </label>
              <div className="relative">
                <Building size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Operations, Clinical, Engineering"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-9.5 pr-3.5 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* Org Hierarchy Pipeline Level & Manager */}
          <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Layers size={13} />
                <span>4-Tier Key Mapping & Hierarchy Position</span>
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase font-mono ${tierMeta.badgeBg} ${tierMeta.badgeText} border ${tierMeta.badgeBorder}`}
              >
                {tierMeta.code}: {tierMeta.title}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Assigned Tier & Level
                </label>
                <select
                  value={level}
                  onChange={(e) => {
                    const newLvl = Number(e.target.value);
                    setLevel(newLvl);
                    const potentialMgr = existingEmployees.find((emp) => emp.level < newLvl);
                    if (potentialMgr) setManagerId(potentialMgr.id);
                  }}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-white/[0.12] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium appearance-none cursor-pointer"
                >
                  <option value={0}>[TIER A: UPPER MANAGEMENT] (CEO, CFO, CTO, Managing Directors)</option>
                  <option value={1}>[TIER B: MIDDLE MANAGEMENT] (General Managers, Department Leads)</option>
                  <option value={2}>[TIER C: OPERATIONS] (Specialists, Technicians, Associates)</option>
                  <option value={3}>[TIER D: SUPPORT STAFF] (Clerks, Janitors, Maintenance)</option>
                </select>
              </div>

              {level > 0 && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Reports To (Direct Manager)
                  </label>
                  <select
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-white/[0.12] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium appearance-none cursor-pointer"
                  >
                    <option value="">Executive Leadership</option>
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
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <DollarSign size={13} />
                <span>Salary Structure & Statutory Deductions</span>
              </span>
              <span className="text-xs font-mono font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                Net Monthly: ${netMonthly.toLocaleString()}/mo
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Base Monthly ($)</label>
                <input
                  type="number"
                  value={baseMonthly}
                  onChange={(e) => setBaseMonthly(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-black/40 border border-white/[0.12] rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Allowances ($)</label>
                <input
                  type="number"
                  value={allowances}
                  onChange={(e) => setAllowances(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-black/40 border border-white/[0.12] rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Bonus ($)</label>
                <input
                  type="number"
                  value={bonus}
                  onChange={(e) => setBonus(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-black/40 border border-white/[0.12] rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] text-rose-400 mb-1">Tax Deductions ($)</label>
                <input
                  type="number"
                  value={taxDeductions}
                  onChange={(e) => setTaxDeductions(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-black/40 border border-rose-500/30 rounded-xl text-xs font-mono font-bold text-rose-300 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>
          </div>

          {/* Bank & Payment System Configuration */}
          <div className="p-4 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/30 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Landmark size={14} />
                <span>Employee Bank Payout Rail & Payment QR</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Treasury Connected
              </span>
            </div>

            {/* Payout Rail Switcher */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1.5">
                Designated Disbursement Rail
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'DIRECT_DEPOSIT', label: 'Direct Deposit', desc: 'ACH Standard' },
                  { id: 'WIRE', label: 'Bank Wire', desc: 'SWIFT / Fedwire' },
                  { id: 'PAYPAL', label: 'PayPal Global', desc: 'Instant Payout' },
                  { id: 'CRYPTO_VAULT', label: 'Crypto Vault', desc: 'USDC / ETH' },
                ].map((rail) => {
                  const isSelected = payoutMethod === rail.id;
                  return (
                    <button
                      key={rail.id}
                      type="button"
                      onClick={() => setPayoutMethod(rail.id as EmployeePayoutMethod)}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 font-black border-emerald-400 shadow-md'
                          : 'bg-black/40 border-white/10 text-slate-300 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <span className="block text-xs font-bold">{rail.label}</span>
                      <span className={`text-[9px] block ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                        {rail.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rail-Specific Fields */}
            {(payoutMethod === 'DIRECT_DEPOSIT' || payoutMethod === 'WIRE') && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Receiving Bank</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JPMorgan Chase"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/[0.12] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Account Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 8920194821"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/[0.12] rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Routing / SWIFT</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 021000021"
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/[0.12] rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            )}

            {payoutMethod === 'PAYPAL' && (
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-slate-400">Recipient PayPal Email</label>
                <input
                  type="email"
                  required
                  placeholder="employee.payout@paypal.com"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/[0.12] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>
            )}

            {payoutMethod === 'CRYPTO_VAULT' && (
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-slate-400">
                  Web3 EVM Wallet / ENS Destination Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="0x71C...a49B or employee.eth"
                  value={cryptoAddress}
                  onChange={(e) => setCryptoAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/[0.12] rounded-xl text-xs font-mono text-emerald-300 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>
            )}

            {/* Currency & QR Code Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/[0.08]">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-slate-400">Preferred Payout Currency</label>
                <select
                  value={payoutCurrency}
                  onChange={(e) => setPayoutCurrency(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/[0.12] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 cursor-pointer"
                >
                  {Object.entries(FX_RATES).map(([code, meta]) => (
                    <option key={code} value={code}>
                      {code} ({meta.symbol}) - {meta.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <QrCode size={11} className="text-emerald-400" />
                  <span>Personal Employee QR Purpose</span>
                </label>
                <select
                  value={qrPurpose}
                  onChange={(e) => setQrPurpose(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/[0.12] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 cursor-pointer"
                >
                  <option value="TIPS_GRATUITY">Tips &amp; Gratuity Standee</option>
                  <option value="CONSULTING_FEE">Consulting Fee / Direct Billing</option>
                  <option value="SALES_COMMISSION">Sales Commission Payout</option>
                  <option value="DIRECT_RETAINER">Direct Retainer Settlement</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold text-slate-300 hover:text-white rounded-xl border border-white/[0.1] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles size={14} />
              <span>Add to Organization & Payroll</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
