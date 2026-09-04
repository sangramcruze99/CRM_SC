'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Landmark,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
  Zap,
  Globe2,
  Receipt,
  FileCheck,
  Building,
  CreditCard,
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  X,
  Check,
  ExternalLink,
  Coins,
  Repeat,
  Layers,
  Send,
  AlertCircle,
  HelpCircle,
  Building2,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';

export type FinancialAccountType =
  | 'BANK_ACCOUNT'
  | 'CARD'
  | 'PAYPAL'
  | 'STRIPE'
  | 'CRYPTO_VAULT'
  | 'CASH_DRAWER';

export interface FinancialAccount {
  id: string;
  name: string;
  type: FinancialAccountType;
  provider: string;
  accountNumberMasked: string;
  balance: number;
  currency: string;
  status: 'PRIMARY' | 'ACTIVE' | 'VERIFIED' | 'FROZEN';
  lastSynced: string;
  badge?: string;
  details?: Record<string, any>;
}

export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  accountId: string;
  accountName: string;
  amount: number;
  currency: string;
  type: 'CREDIT' | 'DEBIT';
  status: 'RECONCILED' | 'UNMATCHED';
  matchedRecord?: string;
}

const INITIAL_FINANCIAL_ACCOUNTS: FinancialAccount[] = [];

const INITIAL_BANK_FEED: BankTransaction[] = [];

export const FX_RATES: Record<string, { symbol: string; rateToUSD: number; name: string }> = {
  USD: { symbol: '$', rateToUSD: 1.0, name: 'United States Dollar' },
  EUR: { symbol: '€', rateToUSD: 0.92, name: 'Euro' },
  GBP: { symbol: '£', rateToUSD: 0.79, name: 'British Pound' },
  AED: { symbol: 'د.إ', rateToUSD: 3.67, name: 'UAE Dirham' },
  INR: { symbol: '₹', rateToUSD: 83.45, name: 'Indian Rupee' },
  JPY: { symbol: '¥', rateToUSD: 154.2, name: 'Japanese Yen' },
  SGD: { symbol: 'S$', rateToUSD: 1.35, name: 'Singapore Dollar' },
  CAD: { symbol: 'C$', rateToUSD: 1.37, name: 'Canadian Dollar' },
  CHF: { symbol: 'Fr.', rateToUSD: 0.89, name: 'Swiss Franc' },
  AUD: { symbol: 'A$', rateToUSD: 1.51, name: 'Australian Dollar' },
};

export function BankingClient() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [accounts, setAccounts] = useState<FinancialAccount[]>(INITIAL_FINANCIAL_ACCOUNTS);
  const [bankFeed, setBankFeed] = useState<BankTransaction[]>(INITIAL_BANK_FEED);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('ALL');

  // Hydrate from shared localStorage and listen to updates (e.g. from Payment Links settlements)
  useEffect(() => {
    const loadSharedFinance = () => {
      try {
        const storedAccs = localStorage.getItem('enterprise_financial_accounts');
        if (storedAccs) {
          const parsed = JSON.parse(storedAccs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAccounts(parsed);
          }
        }
        const storedFeed = localStorage.getItem('enterprise_bank_transactions');
        if (storedFeed) {
          const parsed = JSON.parse(storedFeed);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setBankFeed(parsed);
          }
        }
      } catch (e) {
        console.error('Failed loading shared finance state', e);
      }
    };

    loadSharedFinance();
    window.addEventListener('enterprise_finance_updated', loadSharedFinance);
    window.addEventListener('storage', loadSharedFinance);
    return () => {
      window.removeEventListener('enterprise_finance_updated', loadSharedFinance);
      window.removeEventListener('storage', loadSharedFinance);
    };
  }, []);
  
  // Forex Calculator state
  const [calcAmount, setCalcAmount] = useState<number>(1000);
  const [baseCurrency, setBaseCurrency] = useState('USD');

  // Modals & Drawers
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);

  // New Financial Account Form State
  const [newAccType, setNewAccType] = useState<FinancialAccountType>('BANK_ACCOUNT');
  const [newAccName, setNewAccName] = useState('');
  const [newAccProvider, setNewAccProvider] = useState('');
  const [newAccNumber, setNewAccNumber] = useState('');
  const [newAccCurrency, setNewAccCurrency] = useState('USD');
  const [newAccBalance, setNewAccBalance] = useState<number>(0);
  const [newAccRouting, setNewAccRouting] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('12/28');
  const [newCardCvv, setNewCardCvv] = useState('891');
  const [newCardBrand, setNewCardBrand] = useState('Visa Corporate');
  const [newPaypalEmail, setNewPaypalEmail] = useState('');

  // Internal Transfer State
  const [transferFromId, setTransferFromId] = useState('');
  const [transferToId, setTransferToId] = useState('');
  const [transferAmount, setTransferAmount] = useState<number>(1000);
  const [transferNote, setTransferNote] = useState('');

  // Keep transfer selectors in sync with accounts
  useEffect(() => {
    if (accounts.length > 0 && (!transferFromId || !accounts.some((a) => a.id === transferFromId))) {
      setTransferFromId(accounts[0].id);
    }
    if (accounts.length > 1 && (!transferToId || !accounts.some((a) => a.id === transferToId))) {
      const nextAcc = accounts.find((a) => a.id !== transferFromId) || accounts[1];
      setTransferToId(nextAcc.id);
    }
  }, [accounts, transferFromId, transferToId]);

  const handleOpenTransferModal = () => {
    if (accounts.length < 2) {
      setAlert('⚠️ You need at least 2 connected financial structures to execute internal transfers. Connect another account or card first.');
      setTimeout(() => setAlert(null), 4000);
      return;
    }
    setIsTransferModalOpen(true);
  };

  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let masked = '•••• 0000';
    let providerName = newAccProvider;

    if (newAccType === 'CARD') {
      const cleanNum = newAccNumber.replace(/\s+/g, '');
      const last4 = cleanNum.slice(-4) || '5521';
      masked = `•••• ${last4}`;
      providerName = newAccProvider || `${newCardBrand}`;
    } else if (newAccType === 'PAYPAL') {
      masked = newPaypalEmail || 'merchant@company.com';
      providerName = 'PayPal Enterprise';
    } else if (newAccType === 'CRYPTO_VAULT') {
      const raw = newAccNumber.trim();
      masked = raw.length > 10 ? `${raw.slice(0, 6)}...${raw.slice(-4)}` : '0xVault...';
      providerName = newAccProvider || 'Corporate Treasury Vault';
    } else {
      const cleanNum = newAccNumber.replace(/\s+/g, '');
      masked = `•••• ${cleanNum.slice(-4) || '9912'}`;
      providerName = newAccProvider || 'Commercial Bank';
    }

    const newAccount: FinancialAccount = {
      id: `acc_${Date.now()}`,
      name: newAccName || `${providerName} Account`,
      type: newAccType,
      provider: providerName,
      accountNumberMasked: masked,
      balance: Number(newAccBalance) || 0,
      currency: newAccCurrency,
      status: 'VERIFIED',
      lastSynced: 'Just now',
      badge: newAccType === 'CARD' ? 'Corporate Card' : newAccType === 'PAYPAL' ? 'Instant Settlement' : 'Connected',
    };

    const updatedAccs = [newAccount, ...accounts];
    setAccounts(updatedAccs);
    try {
      localStorage.setItem('enterprise_financial_accounts', JSON.stringify(updatedAccs));
      window.dispatchEvent(new Event('enterprise_finance_updated'));
    } catch {}

    setIsAddAccountModalOpen(false);
    setAlert(`🎉 Successfully connected new ${newAccType.replace('_', ' ')}: ${newAccount.name}!`);

    // Reset Form
    setNewAccName('');
    setNewAccProvider('');
    setNewAccNumber('');
    setNewPaypalEmail('');
    setNewAccBalance(0);

    setTimeout(() => setAlert(null), 4000);
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferFromId === transferToId) {
      setAlert('⚠️ Source and destination accounts cannot be the same.');
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    const fromAcc = accounts.find((a) => a.id === transferFromId);
    const toAcc = accounts.find((a) => a.id === transferToId);

    if (!fromAcc || !toAcc) return;

    if (fromAcc.balance < transferAmount) {
      setAlert(`⚠️ Insufficient balance in ${fromAcc.name}. Available: $${fromAcc.balance.toLocaleString()}`);
      setTimeout(() => setAlert(null), 3500);
      return;
    }

    // Update balances
    const updatedAccs = accounts.map((a) => {
      if (a.id === transferFromId) return { ...a, balance: a.balance - transferAmount };
      if (a.id === transferToId) return { ...a, balance: a.balance + transferAmount };
      return a;
    });
    setAccounts(updatedAccs);
    try {
      localStorage.setItem('enterprise_financial_accounts', JSON.stringify(updatedAccs));
    } catch {}

    // Insert new transaction record
    const newTx: BankTransaction = {
      id: `tx_${Date.now()}`,
      date: 'Just now',
      description: `Internal Transfer: ${fromAcc.name} → ${toAcc.name} (${transferNote})`,
      accountId: toAcc.id,
      accountName: toAcc.name,
      amount: transferAmount,
      currency: fromAcc.currency,
      type: 'CREDIT',
      status: 'RECONCILED',
      matchedRecord: 'Dual Khata Treasury Rebalance',
    };

    const updatedFeed = [newTx, ...bankFeed];
    setBankFeed(updatedFeed);
    try {
      localStorage.setItem('enterprise_bank_transactions', JSON.stringify(updatedFeed));
      window.dispatchEvent(new Event('enterprise_finance_updated'));
    } catch {}

    setIsTransferModalOpen(false);
    setAlert(`💸 Transferred $${transferAmount.toLocaleString()} from ${fromAcc.name} to ${toAcc.name}!`);
    setTimeout(() => setAlert(null), 4000);
  };

  const handleReconcileAll = () => {
    const updated = bankFeed.map((tx) => ({ ...tx, status: 'RECONCILED' as const }));
    setBankFeed(updated);
    try {
      localStorage.setItem('enterprise_bank_transactions', JSON.stringify(updated));
      window.dispatchEvent(new Event('enterprise_finance_updated'));
    } catch {}
    setAlert('🎉 All open transactions successfully matched and reconciled with Dual Khata ledger!');
    setTimeout(() => setAlert(null), 4000);
  };

  const handleReconcileSingle = (id: string) => {
    const updated = bankFeed.map((tx) => (tx.id === id ? { ...tx, status: 'RECONCILED' as const } : tx));
    setBankFeed(updated);
    try {
      localStorage.setItem('enterprise_bank_transactions', JSON.stringify(updated));
      window.dispatchEvent(new Event('enterprise_finance_updated'));
    } catch {}
    setAlert('⚡ Transaction matched and balanced with company Khata ledger.');
    setTimeout(() => setAlert(null), 3000);
  };

  const filteredFeed = bankFeed.filter((tx) => {
    if (selectedAccountId === 'ALL') return true;
    return tx.accountId === selectedAccountId;
  });

  const totalTreasuryUSD = accounts.reduce((acc, a) => {
    const rate = FX_RATES[a.currency]?.rateToUSD || 1.0;
    return acc + a.balance / rate;
  }, 0);

  const unmatchedCount = bankFeed.filter((tx) => tx.status === 'UNMATCHED').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white pb-20">
      {/* Alert Banner */}
      {alert && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span>{alert}</span>
          </div>
          <button onClick={() => setAlert(null)} className="text-emerald-400 hover:text-white text-xs cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Command Strip */}
      <div className="bg-slate-900/80 dark:bg-white/[0.02] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <Sparkles size={11} />
              Pillar 3: Financials, Banking &amp; Multi-Currency Dual Khata
            </span>
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <ShieldCheck size={13} className="text-emerald-400" />
              SOC2 Encrypted &amp; Plaid Verified
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Landmark className="text-emerald-400" size={32} />
            Treasury, Bank Accounts &amp; Forex Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Manage corporate bank accounts, credit cards, PayPal merchants, and multi-currency ledgers with automated reconciliation.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap relative z-10">
          {/* Internal Transfer Button */}
          <button
            type="button"
            onClick={handleOpenTransferModal}
            className="px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-white font-bold rounded-2xl text-xs border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Repeat size={14} className="text-emerald-400" />
            <span>Transfer Funds</span>
          </button>

          {/* Add Financial Structure Button */}
          <button
            type="button"
            onClick={() => setIsAddAccountModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus size={15} />
            <span>Add Card / Bank / PayPal</span>
          </button>

          {/* Reconcile All Button */}
          <button
            type="button"
            onClick={() => {
              if (bankFeed.length === 0) {
                setAlert('ℹ️ No transactions available to reconcile yet. Connect an account or transfer funds to generate records.');
                setTimeout(() => setAlert(null), 4000);
                return;
              }
              handleReconcileAll();
            }}
            className="px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold rounded-2xl text-xs border border-emerald-500/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Zap size={14} />
            <span>Auto-Reconcile ({unmatchedCount})</span>
          </button>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Consolidated Treasury</span>
            <DollarSign size={16} className="text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
              ${totalTreasuryUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">
              {accounts.length === 0
                ? 'No accounts connected'
                : `Across ${accounts.length} connected instrument${accounts.length > 1 ? 's' : ''}`}
            </span>
          </p>
        </div>

        <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Reconciliation Status</span>
            <ShieldCheck size={16} className="text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {bankFeed.length === 0 ? '0 Records' : unmatchedCount === 0 ? '100% Balanced' : `${unmatchedCount} Unmatched`}
            </span>
          </div>
          <p className="text-[11px] text-teal-400 font-medium mt-1">
            {bankFeed.length === 0 ? 'Awaiting Account Activity' : 'Dual Khata Ledger Synchronized'}
          </p>
        </div>

        <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Global Currency Rates</span>
            <Globe2 size={16} className="text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">10 Forex Currencies</span>
          </div>
          <p className="text-[11px] text-sky-400 font-medium mt-1">USD, EUR, GBP, AED, INR, JPY, SGD...</p>
        </div>

        <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Connected Structures</span>
            <Wallet size={16} className="text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">{accounts.length} Active</span>
          </div>
          <p className="text-[11px] text-amber-400 font-medium mt-1">Banks, Cards, PayPal &amp; Crypto</p>
        </div>
      </div>

      {/* SECTION 1: CONNECTED FINANCIAL ACCOUNTS & INSTRUMENTS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
              <Wallet size={18} className="text-emerald-400" />
              <span>Connected Financial Structures &amp; Accounts</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live corporate liquidity, credit limits, and merchant balance pools.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddAccountModalOpen(true)}
            className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-emerald-400 hover:text-emerald-300 font-bold rounded-xl text-xs border border-emerald-500/30 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Plus size={13} />
            <span>Connect Account</span>
          </button>
        </div>

        {accounts.length === 0 ? (
          <div className="bg-slate-900/40 dark:bg-white/[0.02] border border-dashed border-slate-700 dark:border-white/10 rounded-3xl p-10 sm:p-14 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-xl">
              <Wallet size={30} />
            </div>
            <h3 className="text-lg font-black text-white">No Financial Structures Connected</h3>
            <p className="text-xs text-slate-400 max-w-md mt-1.5 mb-6">
              Connect your corporate checking accounts, executive credit cards, PayPal merchant accounts, or crypto treasury vaults to begin tracking live liquidity and dual khata reconciliation.
            </p>
            <button
              type="button"
              onClick={() => setIsAddAccountModalOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus size={15} />
              <span>Connect First Financial Structure</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {accounts.map((acc) => {
              const isCard = acc.type === 'CARD';
              const isPaypal = acc.type === 'PAYPAL';
              const isCrypto = acc.type === 'CRYPTO_VAULT';
              const isStripe = acc.type === 'STRIPE';

              return (
                <div
                  key={acc.id}
                  className={`bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-xl border rounded-3xl p-5 flex flex-col justify-between transition-all group ${
                    acc.status === 'PRIMARY'
                      ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10 bg-gradient-to-b from-emerald-500/[0.04] to-transparent'
                      : isPaypal
                      ? 'border-sky-500/30 hover:border-sky-400'
                      : isCard
                      ? 'border-amber-500/30 hover:border-amber-400'
                      : 'border-slate-200 dark:border-white/[0.08] hover:border-emerald-500/40'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={`w-11 h-11 rounded-2xl border flex items-center justify-center font-bold text-sm ${
                          isCard
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : isPaypal
                            ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                            : isCrypto
                            ? 'bg-violet-500/20 text-violet-400 border-violet-500/30'
                            : isStripe
                            ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {isCard ? (
                          <CreditCard size={20} />
                        ) : isPaypal ? (
                          <span className="font-black text-base">P</span>
                        ) : isCrypto ? (
                          <Coins size={20} />
                        ) : isStripe ? (
                          <Zap size={20} />
                        ) : (
                          <Landmark size={20} />
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {acc.badge && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              acc.status === 'PRIMARY'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-white/[0.06] text-slate-300 border border-white/[0.1]'
                            }`}
                          >
                            {acc.badge}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-white/[0.04] text-slate-400">
                          {acc.currency}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-bold text-white text-sm mt-3.5 group-hover:text-emerald-400 transition-colors">
                      {acc.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{acc.provider}</p>

                    <div className="mt-4 p-3 bg-white/[0.02] border border-white/[0.05] rounded-2xl space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                        {isCard ? 'Current Card Spend' : 'Available Liquidity'}
                      </span>
                      <div className="font-mono font-black text-2xl text-white">
                        {acc.currency === 'USD' || acc.currency === 'USDC' ? '$' : acc.currency === 'EUR' ? '€' : ''}
                        {acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        <span className="text-xs font-normal text-slate-400 ml-1.5">{acc.currency}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono">{acc.accountNumberMasked}</span>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {acc.lastSynced}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: MULTI-CURRENCY REAL-TIME FOREX CONVERTER */}
      <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <Globe2 size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Multi-Currency Real-Time Forex Calculator</h3>
              <p className="text-xs text-slate-400">ECB, Federal Reserve &amp; Bank of England reference conversion matrix.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Base Amount ($ USD):</span>
            <input
              type="number"
              value={calcAmount}
              onChange={(e) => setCalcAmount(Number(e.target.value))}
              className="w-32 px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
          {Object.entries(FX_RATES).map(([code, info]) => {
            const converted = (calcAmount * info.rateToUSD).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            });
            return (
              <div
                key={code}
                className="p-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] rounded-2xl text-center space-y-1 transition-all"
              >
                <span className="text-[10px] font-black text-slate-400 uppercase">{code} ({info.symbol})</span>
                <div className="font-mono font-extrabold text-sm text-white">
                  {info.symbol}{converted}
                </div>
                <span className="text-[9px] text-slate-500 block truncate">{info.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: LIVE OPEN-BANKING TRANSACTION FEED & RECONCILER */}
      <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Receipt size={18} className="text-emerald-400" />
              <span>Live Multi-Account Transaction Feed &amp; Dual Khata Reconciler</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live ingest across JPMorgan, SVB, Amex, and PayPal matching against commercial invoices and ledgers.
            </p>
          </div>

          {/* Account Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Account:</span>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-xl border border-white/10 focus:outline-none"
            >
              <option value="ALL">All Financial Structures ({accounts.length})</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.currency})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-white/[0.02] text-slate-400 uppercase font-semibold tracking-wider border-b border-white/[0.06]">
              <tr>
                <th className="px-6 py-4">Date &amp; Account</th>
                <th className="px-6 py-4">Transaction Details</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Matched CRM / Khata Ledger</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredFeed.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-white block">{tx.date}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{tx.accountName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-white text-xs block">{tx.description}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`font-mono font-black text-sm ${
                        tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.type === 'CREDIT' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                      <Receipt size={13} className="text-emerald-400 flex-shrink-0" />
                      <span>{tx.matchedRecord || 'Unallocated Inflow'}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        tx.status === 'RECONCILED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {tx.status === 'UNMATCHED' ? (
                      <button
                        type="button"
                        onClick={() => handleReconcileSingle(tx.id)}
                        className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-emerald-500/20"
                      >
                        Match &amp; Reconcile
                      </button>
                    ) : (
                      <span className="text-emerald-400 font-semibold text-xs flex items-center justify-end gap-1">
                        <CheckCircle2 size={13} /> Reconciled
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredFeed.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-500">
                        <Receipt size={22} />
                      </div>
                      <p className="text-sm font-bold text-white mt-1">No Transactions Recorded</p>
                      <p className="text-xs text-slate-400 text-center">
                        {accounts.length === 0
                          ? 'Connect a financial structure above to start logging and reconciling transactions.'
                          : 'Transactions will appear here automatically when accounts sync or when transfers are executed.'}
                      </p>
                      {accounts.length === 0 && (
                        <button
                          type="button"
                          onClick={() => setIsAddAccountModalOpen(true)}
                          className="mt-3 px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <Plus size={13} />
                          <span>Add Structure</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD FINANCIAL STRUCTURE (CARDS, BANK ACCOUNTS, PAYPAL, CRYPTO) */}
      {isAddAccountModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-slate-950 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_0_1px_rgba(16,185,129,0.2)] text-white space-y-5 overflow-y-auto max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-black">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Connect Financial Structure</h3>
                  <p className="text-xs text-slate-400">Add Cards, Bank Accounts, PayPal, or Crypto Vaults</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddAccountModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Type Switcher Tabs */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-white/[0.04] border border-white/10 rounded-2xl">
              {[
                { id: 'BANK_ACCOUNT', label: 'Bank Account', icon: Landmark },
                { id: 'CARD', label: 'Card', icon: CreditCard },
                { id: 'PAYPAL', label: 'PayPal', icon: Wallet },
                { id: 'CRYPTO_VAULT', label: 'Crypto Vault', icon: Coins },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = newAccType === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setNewAccType(tab.id as any)}
                    className={`py-2 px-1 text-[11px] font-bold rounded-xl transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Form */}
            <form onSubmit={handleAddAccountSubmit} className="space-y-4 text-xs">
              {/* Common Account Name */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Account / Structure Label
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    newAccType === 'CARD'
                      ? 'e.g. Corporate Amex Gold Executive'
                      : newAccType === 'PAYPAL'
                      ? 'e.g. PayPal Primary Business'
                      : newAccType === 'CRYPTO_VAULT'
                      ? 'e.g. Treasury USDC Liquidity Vault'
                      : 'e.g. Silicon Valley Bank Operating'
                  }
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Bank Account Fields */}
              {newAccType === 'BANK_ACCOUNT' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Bank Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. JPMorgan Chase"
                        value={newAccProvider}
                        onChange={(e) => setNewAccProvider(e.target.value)}
                        className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Currency</label>
                      <select
                        value={newAccCurrency}
                        onChange={(e) => setNewAccCurrency(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                      >
                        {Object.keys(FX_RATES).map((curr) => (
                          <option key={curr} value={curr}>
                            {curr} ({FX_RATES[curr].symbol})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Account Number / IBAN</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 1092847192"
                        value={newAccNumber}
                        onChange={(e) => setNewAccNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Routing Number / BIC</label>
                      <input
                        type="text"
                        placeholder="e.g. 021000021"
                        value={newAccRouting}
                        onChange={(e) => setNewAccRouting(e.target.value)}
                        className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Credit / Debit Card Fields */}
              {newAccType === 'CARD' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Card Brand / Type</label>
                      <select
                        value={newCardBrand}
                        onChange={(e) => setNewCardBrand(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                      >
                        <option value="Visa Corporate">Visa Corporate</option>
                        <option value="Mastercard World Elite">Mastercard World Elite</option>
                        <option value="American Express Platinum">American Express Platinum</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Card Currency</label>
                      <select
                        value={newAccCurrency}
                        onChange={(e) => setNewAccCurrency(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">16-Digit Card Number</label>
                    <input
                      type="text"
                      required
                      placeholder="4000 1234 5678 9010"
                      value={newAccNumber}
                      onChange={(e) => setNewAccNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Expiry Date (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="12/28"
                        value={newCardExpiry}
                        onChange={(e) => setNewCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">CVV Security Code</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        value={newCardCvv}
                        onChange={(e) => setNewCardCvv(e.target.value)}
                        className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* PayPal Fields */}
              {newAccType === 'PAYPAL' && (
                <>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">PayPal Business Email</label>
                    <input
                      type="email"
                      required
                      placeholder="payments@company.com"
                      value={newPaypalEmail}
                      onChange={(e) => setNewPaypalEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Primary Settlement Currency</label>
                    <select
                      value={newAccCurrency}
                      onChange={(e) => setNewAccCurrency(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="AUD">AUD (A$)</option>
                      <option value="CAD">CAD (C$)</option>
                    </select>
                  </div>
                </>
              )}

              {/* Crypto Vault Fields */}
              {newAccType === 'CRYPTO_VAULT' && (
                <>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Public Wallet / Safe Address</label>
                    <input
                      type="text"
                      required
                      placeholder="0x71C836643F37711fa49229..."
                      value={newAccNumber}
                      onChange={(e) => setNewAccNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Network</label>
                      <select
                        value={newAccProvider}
                        onChange={(e) => setNewAccProvider(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                      >
                        <option value="Ethereum Mainnet">Ethereum Mainnet</option>
                        <option value="Polygon PoS">Polygon PoS</option>
                        <option value="Arbitrum One">Arbitrum One</option>
                        <option value="Solana">Solana</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Asset Symbol</label>
                      <select
                        value={newAccCurrency}
                        onChange={(e) => setNewAccCurrency(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                      >
                        <option value="USDC">USDC (USD Coin)</option>
                        <option value="USDT">USDT (Tether)</option>
                        <option value="ETH">ETH (Ethereum)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Initial / Opening Balance */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Starting Verified Balance ({newAccCurrency})
                </label>
                <input
                  type="number"
                  required
                  value={newAccBalance}
                  onChange={(e) => setNewAccBalance(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAccountModalOpen(false)}
                  className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  Connect &amp; Verify Structure
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: INTERNAL LIQUIDITY TRANSFER */}
      {isTransferModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-950 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_0_1px_rgba(16,185,129,0.2)] text-white space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-emerald-500 flex items-center justify-center text-slate-950 font-black">
                  <Repeat size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Internal Liquidity Transfer</h3>
                  <p className="text-xs text-slate-400">Move capital between connected banking &amp; payment structures</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {accounts.length < 2 ? (
              <div className="py-6 px-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                  <AlertCircle size={24} />
                </div>
                <h4 className="text-sm font-bold text-white">At Least Two Accounts Required</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  To execute internal liquidity transfers, you need at least two connected financial structures (e.g. Bank Account + Corporate Card or PayPal).
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsTransferModalOpen(false);
                      setIsAddAccountModalOpen(true);
                    }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs cursor-pointer shadow-md shadow-emerald-500/20 transition-all"
                  >
                    Connect Structure
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleExecuteTransfer} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Transfer From (Debit)</label>
                  <select
                    value={transferFromId}
                    onChange={(e) => setTransferFromId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} — Balance: ${a.balance.toLocaleString()} {a.currency}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Transfer To (Credit)</label>
                  <select
                    value={transferToId}
                    onChange={(e) => setTransferToId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.currency})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Transfer Amount ($ USD)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs font-mono font-bold text-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Internal Reference Note</label>
                  <input
                    type="text"
                    value={transferNote}
                    onChange={(e) => setTransferNote(e.target.value)}
                    placeholder="e.g. Card payment settlement or treasury sweep"
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTransferModalOpen(false)}
                    className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    Execute Immediate Transfer
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
