'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  CreditCard,
  Plus,
  Copy,
  CheckCircle2,
  QrCode,
  DollarSign,
  Zap,
  Tag,
  Sparkles,
  X,
  ExternalLink,
  Globe2,
  Landmark,
  Wallet,
  Coins,
  ArrowRight,
  Repeat,
  ArrowUpRight,
  ShieldCheck,
  Check,
  Share2,
  FileText,
  Layers,
  Search,
  Filter,
  AlertCircle,
  Building,
  Receipt,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { FX_RATES, FinancialAccount, BankTransaction } from '../banking/BankingClient';

export interface PaymentLink {
  id: string;
  title: string;
  amount: number;
  currency: string;
  destinationAccountId: string;
  destinationAccountName: string;
  destinationCurrency: string;
  settlementAmountEst: number;
  fxRateUsed: number;
  allowedMethods: ('CARD' | 'WIRE' | 'PAYPAL' | 'CRYPTO')[];
  url: string;
  paymentsCount: number;
  totalCollected: number;
  status: 'ACTIVE' | 'PAID' | 'DISABLED';
  createdDate: string;
  customerNote?: string;
}

const DEFAULT_FALLBACK_ACCOUNTS: FinancialAccount[] = [
  {
    id: 'acc_jpmorgan_checking',
    name: 'JPMorgan Chase Operating Checking',
    type: 'BANK_ACCOUNT',
    provider: 'JPMorgan Chase & Co.',
    accountNumberMasked: '•••• 4091',
    balance: 485240.56,
    currency: 'USD',
    status: 'PRIMARY',
    lastSynced: 'Live Open-Banking',
    badge: 'Primary Operating',
  },
  {
    id: 'acc_paypal_biz',
    name: 'PayPal Global Merchant Enterprise',
    type: 'PAYPAL',
    provider: 'PayPal Holdings Inc.',
    accountNumberMasked: 'merchant-settle@businessos.io',
    balance: 32450.8,
    currency: 'USD',
    status: 'VERIFIED',
    lastSynced: 'Instant Payout Ready',
    badge: 'Merchant Gateway',
  },
  {
    id: 'acc_crypto_usdc',
    name: 'USDC Corporate Multi-Sig Reserve',
    type: 'CRYPTO_VAULT',
    provider: 'Gnosis Safe · Ethereum Mainnet',
    accountNumberMasked: '0x71C8...39A1',
    balance: 50000.0,
    currency: 'USDC',
    status: 'VERIFIED',
    lastSynced: 'On-Chain Verified',
    badge: 'Treasury Vault',
  },
];

// Helper to convert currencies using the live FX_RATES table
export function convertCurrency(
  amount: number,
  fromCurr: string,
  toCurr: string
): { converted: number; rate: number } {
  const fromRate = FX_RATES[fromCurr]?.rateToUSD || 1.0;
  const toRate = FX_RATES[toCurr]?.rateToUSD || 1.0;
  // Convert from origin to USD, then USD to target
  const amountInUSD = amount / fromRate;
  const converted = amountInUSD * toRate;
  const effectiveRate = toRate / fromRate;
  return {
    converted: Math.round(converted * 100) / 100,
    rate: Math.round(effectiveRate * 10000) / 10000,
  };
}

export function PaymentLinksClient({ initialLinks = [] }: { initialLinks?: any[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Shared Banking State
  const [connectedAccounts, setConnectedAccounts] = useState<FinancialAccount[]>([]);
  const [links, setLinks] = useState<PaymentLink[]>([]);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PAID' | 'DISABLED'>('ALL');
  const [currencyFilter, setCurrencyFilter] = useState<string>('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeQrLink, setActiveQrLink] = useState<PaymentLink | null>(null);
  const [activeCheckoutLink, setActiveCheckoutLink] = useState<PaymentLink | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'SELECT_METHOD' | 'PAYING' | 'CONFIRMED'>('SELECT_METHOD');
  const [selectedPayMethod, setSelectedPayMethod] = useState<'CARD' | 'WIRE' | 'PAYPAL' | 'CRYPTO'>('CARD');
  const [payerName, setPayerName] = useState('Elena Rostova');
  const [payerEmail, setPayerEmail] = useState('elena.rostova@hyperion.tech');
  const [paidTxRecord, setPaidTxRecord] = useState<BankTransaction | null>(null);

  // Form State for New Payment Link
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState<number>(2500);
  const [formCurrency, setFormCurrency] = useState('USD');
  const [formDestinationId, setFormDestinationId] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formAllowedMethods, setFormAllowedMethods] = useState<('CARD' | 'WIRE' | 'PAYPAL' | 'CRYPTO')[]>([
    'CARD',
    'WIRE',
    'PAYPAL',
  ]);

  const [alert, setAlert] = useState<string | null>(null);

  // Hydrate accounts from Banking shared storage
  useEffect(() => {
    const loadSharedFinance = () => {
      try {
        const storedAccs = localStorage.getItem('enterprise_financial_accounts');
        if (storedAccs) {
          const parsed = JSON.parse(storedAccs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setConnectedAccounts(parsed);
            if (!formDestinationId) {
              setFormDestinationId(parsed[0].id);
            }
            return;
          }
        }
        // Fallback to default enterprise accounts if none connected
        setConnectedAccounts(DEFAULT_FALLBACK_ACCOUNTS);
        if (!formDestinationId) {
          setFormDestinationId(DEFAULT_FALLBACK_ACCOUNTS[0].id);
        }
      } catch (e) {
        setConnectedAccounts(DEFAULT_FALLBACK_ACCOUNTS);
      }
    };

    loadSharedFinance();
    window.addEventListener('enterprise_finance_updated', loadSharedFinance);
    window.addEventListener('storage', loadSharedFinance);
    return () => {
      window.removeEventListener('enterprise_finance_updated', loadSharedFinance);
      window.removeEventListener('storage', loadSharedFinance);
    };
  }, [formDestinationId]);

  // Hydrate payment links
  useEffect(() => {
    try {
      const storedLinks = localStorage.getItem('enterprise_payment_links');
      if (storedLinks) {
        const parsed = JSON.parse(storedLinks);
        if (Array.isArray(parsed)) {
          setLinks(parsed);
          return;
        }
      }
    } catch {}

    if (initialLinks && initialLinks.length > 0) {
      setLinks(initialLinks);
    }
  }, [initialLinks]);

  const persistLinks = (newLinks: PaymentLink[]) => {
    setLinks(newLinks);
    try {
      localStorage.setItem('enterprise_payment_links', JSON.stringify(newLinks));
    } catch {}
  };

  // Live FX Calculation for Modal
  const selectedDestAccount =
    connectedAccounts.find((a) => a.id === formDestinationId) || connectedAccounts[0] || DEFAULT_FALLBACK_ACCOUNTS[0];
  const targetCurrency = selectedDestAccount?.currency || 'USD';
  const liveConversion = convertCurrency(formAmount || 0, formCurrency, targetCurrency);

  // Create Link Handler
  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formAmount) return;

    const slug = formTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
    const linkId = `plink_${Date.now().toString().slice(-6)}`;
    
    const newPaymentLink: PaymentLink = {
      id: linkId,
      title: formTitle,
      amount: Number(formAmount),
      currency: formCurrency,
      destinationAccountId: selectedDestAccount.id,
      destinationAccountName: selectedDestAccount.name,
      destinationCurrency: targetCurrency,
      settlementAmountEst: liveConversion.converted,
      fxRateUsed: liveConversion.rate,
      allowedMethods: formAllowedMethods.length > 0 ? formAllowedMethods : ['CARD', 'WIRE'],
      url: `https://pay.businessos.io/checkout/${linkId}-${slug}`,
      paymentsCount: 0,
      totalCollected: 0,
      status: 'ACTIVE',
      createdDate: new Date().toISOString().split('T')[0],
      customerNote: formNote,
    };

    const updated = [newPaymentLink, ...links];
    persistLinks(updated);
    setIsCreateModalOpen(false);

    // Reset Form
    setFormTitle('');
    setFormAmount(2500);
    setFormNote('');
    setAlert(`🎉 Payment link "${newPaymentLink.title}" created with instant settlement to ${selectedDestAccount.name}!`);
    setTimeout(() => setAlert(null), 4000);
  };

  // Copy link
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setAlert(`📋 Checkout link copied to clipboard: ${url}`);
    setTimeout(() => setAlert(null), 3000);
  };

  // Toggle status
  const handleToggleStatus = (id: string) => {
    const updated = links.map((l) =>
      l.id === id
        ? { ...l, status: l.status === 'ACTIVE' ? ('DISABLED' as const) : ('ACTIVE' as const) }
        : l
    );
    persistLinks(updated);
  };

  // Open Checkout Simulator
  const handleOpenCheckoutSimulator = (link: PaymentLink) => {
    setActiveCheckoutLink(link);
    setCheckoutStep('SELECT_METHOD');
    setSelectedPayMethod(link.allowedMethods[0] || 'CARD');
  };

  // Execute Simulated Payment & Sync With Banking
  const handleExecutePaymentSimulation = () => {
    if (!activeCheckoutLink) return;

    setCheckoutStep('PAYING');

    setTimeout(() => {
      // 1. Calculate settlement in destination bank currency
      const destAcc =
        connectedAccounts.find((a) => a.id === activeCheckoutLink.destinationAccountId) ||
        connectedAccounts[0] ||
        DEFAULT_FALLBACK_ACCOUNTS[0];

      const settlement = convertCurrency(activeCheckoutLink.amount, activeCheckoutLink.currency, destAcc.currency);

      // 2. Create Inflow Transaction for Banking
      const newBankTx: BankTransaction = {
        id: `tx_pay_${Date.now()}`,
        date: 'Just now (Checkout)',
        description: `Payment Link Settlement: ${activeCheckoutLink.title} [${activeCheckoutLink.amount} ${activeCheckoutLink.currency}]`,
        accountId: destAcc.id,
        accountName: destAcc.name,
        amount: settlement.converted,
        currency: destAcc.currency,
        type: 'CREDIT',
        status: 'RECONCILED',
        matchedRecord: `Dual Khata Settled · Link #${activeCheckoutLink.id} (${payerName})`,
      };

      // 3. Update Bank Accounts & Feed in shared localStorage
      try {
        let currentAccounts: FinancialAccount[] = [...connectedAccounts];
        const storedAccs = localStorage.getItem('enterprise_financial_accounts');
        if (storedAccs) {
          try {
            currentAccounts = JSON.parse(storedAccs);
          } catch {}
        }

        const updatedAccs = currentAccounts.map((acc) => {
          if (acc.id === destAcc.id) {
            return {
              ...acc,
              balance: Math.round((acc.balance + settlement.converted) * 100) / 100,
              lastSynced: 'Just now (Payment Link Settlement)',
            };
          }
          return acc;
        });

        localStorage.setItem('enterprise_financial_accounts', JSON.stringify(updatedAccs));
        setConnectedAccounts(updatedAccs);

        let currentFeed: BankTransaction[] = [];
        const storedFeed = localStorage.getItem('enterprise_bank_transactions');
        if (storedFeed) {
          try {
            currentFeed = JSON.parse(storedFeed);
          } catch {}
        }
        const updatedFeed = [newBankTx, ...currentFeed];
        localStorage.setItem('enterprise_bank_transactions', JSON.stringify(updatedFeed));

        // Notify Banking tab / components
        window.dispatchEvent(new Event('enterprise_finance_updated'));
      } catch (err) {
        console.error('Failed syncing payment to banking ledger', err);
      }

      // 4. Update Payment Link Status & Metrics
      const updatedLinks = links.map((l) => {
        if (l.id === activeCheckoutLink.id) {
          return {
            ...l,
            paymentsCount: l.paymentsCount + 1,
            totalCollected: l.totalCollected + l.amount,
            status: 'PAID' as const,
          };
        }
        return l;
      });
      persistLinks(updatedLinks);

      setPaidTxRecord(newBankTx);
      setCheckoutStep('CONFIRMED');
    }, 1200);
  };

  // Filtered List
  const filteredLinks = links.filter((l) => {
    if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;
    if (currencyFilter !== 'ALL' && l.currency !== currencyFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        l.title.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q) ||
        l.destinationAccountName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalCollectedUSD = links.reduce((acc, l) => {
    const rate = FX_RATES[l.currency]?.rateToUSD || 1.0;
    return acc + l.totalCollected / rate;
  }, 0);

  const totalPaymentsCount = links.reduce((acc, l) => acc + l.paymentsCount, 0);

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
              Pillar 19: Global Checkout, Payment Links &amp; Bank Settlement
            </span>
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Landmark size={13} className="text-emerald-400" />
              Direct Treasury Routing Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <CreditCard className="text-emerald-400" size={30} />
            Payment Links &amp; Forex Checkout
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Create instant checkout links in 10 global currencies. Payments convert in real-time and settle directly into your connected bank accounts, corporate cards, or PayPal merchant vaults.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap relative z-10">
          <Link
            href="/banking"
            className="px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-white font-bold rounded-2xl text-xs border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Landmark size={14} className="text-emerald-400" />
            <span>Manage Bank Accounts ({connectedAccounts.length})</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus size={16} />
            <span>Create Payment Link</span>
          </button>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* LIVE FOREX CONVERSION RIBBON */}
      <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center">
            <Globe2 size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Live Forex Settlement Matrix</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </h4>
            <p className="text-[11px] text-slate-400">Institutional Mid-Market Rates · Zero Hidden FX Spread</p>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-[11px] font-mono">
          {Object.entries(FX_RATES)
            .slice(1, 7)
            .map(([code, item]) => (
              <div
                key={code}
                className="px-2.5 py-1 bg-white/[0.04] border border-white/[0.06] rounded-xl flex items-center gap-1.5 whitespace-nowrap"
              >
                <span className="text-slate-400 font-bold">{code}/USD</span>
                <span className="text-emerald-400 font-black">
                  {item.rateToUSD < 1
                    ? (1 / item.rateToUSD).toFixed(3)
                    : item.rateToUSD.toFixed(2)}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* KPI METRIC STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Volume Collected</span>
            <DollarSign size={16} className="text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
              ${totalCollectedUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">
              {totalPaymentsCount === 0 ? 'Awaiting customer payments' : `${totalPaymentsCount} successful settlements`}
            </span>
          </p>
        </div>

        <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Active Checkout Links</span>
            <Zap size={16} className="text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {links.filter((l) => l.status === 'ACTIVE').length} Active
            </span>
          </div>
          <p className="text-[11px] text-teal-400 font-medium mt-1">Ready for distribution</p>
        </div>

        <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Destination Bank Accounts</span>
            <Landmark size={16} className="text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {connectedAccounts.length} Connected
            </span>
          </div>
          <p className="text-[11px] text-sky-400 font-medium mt-1">JPMorgan, PayPal, Stripe, Vaults</p>
        </div>

        <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Dual Khata Reconciliation</span>
            <ShieldCheck size={16} className="text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">100% Automated</span>
          </div>
          <p className="text-[11px] text-amber-400 font-medium mt-1">Instant ledger balance sync</p>
        </div>
      </div>

      {/* CONTROLS & FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/40 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search payment links by purpose, code, or destination bank..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-800 border border-white/10 text-white text-xs font-semibold rounded-xl focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PAID">Paid / Completed</option>
            <option value="DISABLED">Disabled</option>
          </select>

          <span className="text-xs text-slate-400 font-medium ml-2">Currency:</span>
          <select
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-white/10 text-white text-xs font-semibold rounded-xl focus:outline-none"
          >
            <option value="ALL">All Currencies</option>
            {Object.keys(FX_RATES).map((curr) => (
              <option key={curr} value={curr}>
                {curr} ({FX_RATES[curr].symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PAYMENT LINKS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLinks.map((link) => {
          const destSymbol = FX_RATES[link.destinationCurrency]?.symbol || '$';
          const chargeSymbol = FX_RATES[link.currency]?.symbol || '$';

          return (
            <div
              key={link.id}
              className={`bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-xl border rounded-3xl p-5 flex flex-col justify-between transition-all group relative overflow-hidden ${
                link.status === 'ACTIVE'
                  ? 'border-slate-200 dark:border-white/[0.08] hover:border-emerald-500/40 shadow-xl'
                  : link.status === 'PAID'
                  ? 'border-emerald-500/30 bg-gradient-to-b from-emerald-500/[0.03] to-transparent'
                  : 'border-white/[0.05] opacity-60'
              }`}
            >
              <div>
                {/* Status & Date */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                      link.status === 'ACTIVE'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : link.status === 'PAID'
                        ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                        : 'bg-white/[0.06] text-slate-400 border border-white/10'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        link.status === 'ACTIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
                      }`}
                    />
                    {link.status}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono font-medium">{link.createdDate}</span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-white text-base mt-3 group-hover:text-emerald-300 transition-colors">
                  {link.title}
                </h3>
                {link.customerNote && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{link.customerNote}</p>
                )}

                {/* Amount & Forex Info */}
                <div className="mt-4 p-3.5 bg-white/[0.02] border border-white/[0.06] rounded-2xl space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Charge Amount
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">{link.currency}</span>
                  </div>

                  <div className="font-mono font-black text-2xl text-white">
                    {chargeSymbol}
                    {link.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>

                  {/* Forex Settlement Conversion */}
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Repeat size={12} className="text-teal-400" />
                      <span>Bank Settles:</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      ≈ {destSymbol}
                      {link.settlementAmountEst.toLocaleString(undefined, { minimumFractionDigits: 2 })}{' '}
                      {link.destinationCurrency}
                    </span>
                  </div>
                </div>

                {/* Destination Financial Structure */}
                <div className="mt-3.5 flex items-center gap-2 p-2.5 bg-black/30 border border-white/[0.05] rounded-xl text-xs">
                  <Landmark size={15} className="text-emerald-400 flex-shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Destination Account</span>
                    <span className="font-semibold text-white truncate block text-[11px]">
                      {link.destinationAccountName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-4 border-t border-white/[0.08] space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{link.paymentsCount} Payments</span>
                  <span className="font-bold font-mono text-emerald-400">
                    {chargeSymbol}
                    {link.totalCollected.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {/* Copy Link */}
                  <button
                    type="button"
                    onClick={() => copyToClipboard(link.url)}
                    className="px-2.5 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-white/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    title="Copy Hosted Link"
                  >
                    <Copy size={13} />
                    <span>Copy</span>
                  </button>

                  {/* QR Code */}
                  <button
                    type="button"
                    onClick={() => setActiveQrLink(link)}
                    className="px-2.5 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-white/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    title="View QR Code"
                  >
                    <QrCode size={13} />
                    <span>QR</span>
                  </button>

                  {/* Checkout Simulator / Pay */}
                  <button
                    type="button"
                    onClick={() => handleOpenCheckoutSimulator(link)}
                    className="px-2.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                    title="Client Checkout Simulation"
                  >
                    <Eye size={13} />
                    <span>Pay</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {filteredLinks.length === 0 && (
          <div className="col-span-full py-16 px-6 text-center bg-slate-900/40 dark:bg-white/[0.02] border border-dashed border-slate-700 dark:border-white/10 rounded-3xl flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-xl">
              <CreditCard size={30} />
            </div>
            <h3 className="text-lg font-black text-white">No Payment Links Found</h3>
            <p className="text-xs text-slate-400 max-w-md mt-1.5 mb-6">
              Generate custom payment links in EUR, USD, GBP, or AED. Direct incoming settlements to your corporate checking accounts, PayPal merchant, or USDC vaults with automated Dual Khata reconciliation.
            </p>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus size={16} />
              <span>Create First Payment Link</span>
            </button>
          </div>
        )}
      </div>

      {/* MODAL 1: CREATE PAYMENT LINK (CONNECTED TO BANK & FOREX) */}
      {isCreateModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-slate-950 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_0_1px_rgba(16,185,129,0.2)] text-white space-y-5 overflow-y-auto max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-black">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Generate Payment Link</h3>
                  <p className="text-xs text-slate-400">Multi-Currency Checkout &amp; Direct Bank Settlement</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLink} className="space-y-4 text-xs">
              {/* Purpose / Title */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Payment Purpose / Agreement Title
                </label>
                <div className="relative">
                  <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Q3 Architecture Retainer Agreement"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Amount & Currency Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Charge Amount
                  </label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      required
                      min={1}
                      step="any"
                      placeholder="e.g. 5000"
                      value={formAmount}
                      onChange={(e) => setFormAmount(Number(e.target.value))}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Customer Currency
                  </label>
                  <select
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none"
                  >
                    {Object.keys(FX_RATES).map((code) => (
                      <option key={code} value={code}>
                        {code} ({FX_RATES[code].symbol}) — {FX_RATES[code].name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DESTINATION SETTLEMENT ACCOUNT (CONNECTED TO BANKING) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Landmark size={12} className="text-emerald-400" />
                    <span>Destination Settlement Structure (Bank / Forex Routing)</span>
                  </label>
                  <Link
                    href="/banking"
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    + Add New Account
                  </Link>
                </div>
                <select
                  value={formDestinationId}
                  onChange={(e) => setFormDestinationId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none"
                >
                  {connectedAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.provider}) — Balance: ${acc.balance.toLocaleString()} {acc.currency}
                    </option>
                  ))}
                </select>
              </div>

              {/* LIVE FOREX CONVERSION CALCULATION BANNER */}
              <div className="p-3.5 bg-emerald-500/[0.08] border border-emerald-500/30 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <Repeat size={14} className="text-emerald-400" />
                    <span>Live Forex Conversion Preview</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/20 rounded-full text-emerald-200">
                    Direct Wire Rate
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-emerald-500/20">
                  <div>
                    <span className="text-slate-400 block">Customer Pays:</span>
                    <span className="font-mono font-bold text-white">
                      {FX_RATES[formCurrency]?.symbol}
                      {formAmount.toLocaleString()} {formCurrency}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Est. Bank Inflow:</span>
                    <span className="font-mono font-black text-emerald-400 text-sm">
                      {FX_RATES[targetCurrency]?.symbol}
                      {liveConversion.converted.toLocaleString()} {targetCurrency}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Exchange Rate: 1 {formCurrency} = {liveConversion.rate} {targetCurrency}</span>
                  <span className="text-emerald-300 font-semibold">Zero Forex Slippage Guarantee</span>
                </div>
              </div>

              {/* Allowed Payment Methods */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                  Allowed Checkout Methods
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'CARD', label: 'Credit Card', icon: CreditCard },
                    { id: 'WIRE', label: 'ACH / Wire', icon: Landmark },
                    { id: 'PAYPAL', label: 'PayPal', icon: Wallet },
                    { id: 'CRYPTO', label: 'Crypto (USDC)', icon: Coins },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isChecked = formAllowedMethods.includes(m.id as any);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            if (formAllowedMethods.length > 1) {
                              setFormAllowedMethods(formAllowedMethods.filter((item) => item !== m.id));
                            }
                          } else {
                            setFormAllowedMethods([...formAllowedMethods, m.id as any]);
                          }
                        }}
                        className={`p-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                            : 'bg-white/[0.02] border-white/10 text-slate-400'
                        }`}
                      >
                        <Icon size={13} />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customer Reference Note */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Reference Note / Invoice Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Linked to Invoice #INV-2026-09"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-500/25 cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles size={14} />
                  <span>Generate Link &amp; Bank Route</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: QR CODE PAY DRAWER */}
      {activeQrLink && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-slate-950 border border-white/15 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1.5">
                <QrCode size={15} />
                Instant Mobile Scan &amp; Pay
              </span>
              <button
                type="button"
                onClick={() => setActiveQrLink(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-white text-base">{activeQrLink.title}</h3>
              <p className="text-xs text-emerald-400 font-mono font-bold">
                {FX_RATES[activeQrLink.currency]?.symbol}
                {activeQrLink.amount.toLocaleString()} {activeQrLink.currency}
              </p>
            </div>

            {/* Generated SVG QR Code representation */}
            <div className="p-4 bg-white rounded-2xl inline-block shadow-inner">
              <svg viewBox="0 0 100 100" width="160" height="160" className="mx-auto">
                <rect width="100" height="100" fill="#ffffff" />
                {/* Top-Left Corner Block */}
                <rect x="10" y="10" width="25" height="25" fill="#0f172a" />
                <rect x="14" y="14" width="17" height="17" fill="#ffffff" />
                <rect x="18" y="18" width="9" height="9" fill="#0f172a" />
                {/* Top-Right Corner Block */}
                <rect x="65" y="10" width="25" height="25" fill="#0f172a" />
                <rect x="69" y="14" width="17" height="17" fill="#ffffff" />
                <rect x="73" y="18" width="9" height="9" fill="#0f172a" />
                {/* Bottom-Left Corner Block */}
                <rect x="10" y="65" width="25" height="25" fill="#0f172a" />
                <rect x="14" y="69" width="17" height="17" fill="#ffffff" />
                <rect x="18" y="73" width="9" height="9" fill="#0f172a" />
                {/* Data Grid Simulation */}
                <rect x="42" y="12" width="6" height="6" fill="#0f172a" />
                <rect x="52" y="12" width="6" height="6" fill="#0f172a" />
                <rect x="42" y="24" width="6" height="6" fill="#0f172a" />
                <rect x="52" y="24" width="6" height="6" fill="#0f172a" />
                <rect x="12" y="44" width="6" height="6" fill="#0f172a" />
                <rect x="24" y="44" width="6" height="6" fill="#0f172a" />
                <rect x="44" y="44" width="12" height="12" fill="#10b981" rx="2" />
                <rect x="64" y="44" width="6" height="6" fill="#0f172a" />
                <rect x="80" y="44" width="6" height="6" fill="#0f172a" />
                <rect x="44" y="64" width="6" height="6" fill="#0f172a" />
                <rect x="64" y="64" width="6" height="6" fill="#0f172a" />
                <rect x="80" y="64" width="6" height="6" fill="#0f172a" />
                <rect x="44" y="78" width="6" height="6" fill="#0f172a" />
                <rect x="64" y="78" width="6" height="6" fill="#0f172a" />
                <rect x="74" y="78" width="6" height="6" fill="#0f172a" />
              </svg>
            </div>

            <p className="text-[11px] text-slate-400">
              Point your smartphone camera to scan &amp; pay via Apple Pay, Google Pay, or Web3 Wallet.
            </p>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => copyToClipboard(activeQrLink.url)}
                className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Copy size={13} />
                <span>Copy URL</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveQrLink(null)}
                className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 3: HOSTED CHECKOUT SIMULATION & DIRECT BANK SETTLEMENT */}
      {activeCheckoutLink && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_0_1px_rgba(16,185,129,0.3)] text-white space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                    Enterprise Checkout Gateway
                  </span>
                  <span className="text-xs text-slate-400 font-mono">256-Bit TLS Encrypted Settlement</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveCheckoutLink(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* ORDER SUMMARY */}
            <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{activeCheckoutLink.title}</h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">Link #{activeCheckoutLink.id}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-xl text-emerald-400">
                    {FX_RATES[activeCheckoutLink.currency]?.symbol}
                    {activeCheckoutLink.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    {activeCheckoutLink.currency}
                  </span>
                </div>
              </div>

              {/* Forex Routing Detail */}
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
                <span>Receiving Bank:</span>
                <span className="font-semibold text-white truncate max-w-[200px]">
                  {activeCheckoutLink.destinationAccountName}
                </span>
              </div>
            </div>

            {/* STEP 1: METHOD SELECTION & PAYER DETAILS */}
            {checkoutStep === 'SELECT_METHOD' && (
              <div className="space-y-4 text-xs">
                {/* Method selector */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'CARD', label: 'Credit Card', icon: CreditCard },
                      { id: 'WIRE', label: 'ACH / Wire', icon: Landmark },
                      { id: 'PAYPAL', label: 'PayPal', icon: Wallet },
                      { id: 'CRYPTO', label: 'USDC Vault', icon: Coins },
                    ].map((m) => {
                      const Icon = m.icon;
                      const isSelected = selectedPayMethod === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedPayMethod(m.id as any)}
                          className={`p-2.5 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-lg shadow-emerald-500/20'
                              : 'bg-white/[0.04] border-white/10 text-slate-300 hover:text-white'
                          }`}
                        >
                          <Icon size={16} />
                          <span>{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Payer Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Payer Full Name</label>
                    <input
                      type="text"
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Receipt Email</label>
                    <input
                      type="email"
                      value={payerEmail}
                      onChange={(e) => setPayerEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Mock Card Form if Card selected */}
                {selectedPayMethod === 'CARD' && (
                  <div className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Card Details</span>
                      <div className="flex gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-bold">VISA</span>
                        <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-bold">MASTERCARD</span>
                      </div>
                    </div>
                    <input
                      type="text"
                      readOnly
                      value="•••• •••• •••• 4242"
                      className="w-full px-3 py-1.5 bg-white/[0.05] border border-white/10 rounded-lg text-xs font-mono text-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        readOnly
                        value="12 / 28"
                        className="w-full px-3 py-1.5 bg-white/[0.05] border border-white/10 rounded-lg text-xs font-mono text-slate-300"
                      />
                      <input
                        type="password"
                        readOnly
                        value="•••"
                        className="w-full px-3 py-1.5 bg-white/[0.05] border border-white/10 rounded-lg text-xs font-mono text-slate-300"
                      />
                    </div>
                  </div>
                )}

                {/* Wire Transfer Details */}
                {selectedPayMethod === 'WIRE' && (
                  <div className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-1.5 text-[11px]">
                    <span className="text-emerald-400 font-bold block">Instant Automated Wire / ACH Routing</span>
                    <p className="text-slate-400">
                      Funds will clear immediately and credit directly to{' '}
                      <span className="text-white font-bold">{activeCheckoutLink.destinationAccountName}</span>.
                    </p>
                  </div>
                )}

                {/* PayPal Details */}
                {selectedPayMethod === 'PAYPAL' && (
                  <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-xl space-y-1 text-[11px] text-sky-300">
                    <span className="font-bold block">PayPal One-Click Merchant Settlement</span>
                    <p className="text-slate-400 text-[10px]">Instant capture and auto-payout readiness.</p>
                  </div>
                )}

                {/* Crypto Details */}
                {selectedPayMethod === 'CRYPTO' && (
                  <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded-xl space-y-1 text-[11px] text-violet-300">
                    <span className="font-bold block">USDC / USDT Multi-Sig Treasury Inflow</span>
                    <p className="text-slate-400 text-[10px]">Smart contract settlement verified on-chain.</p>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveCheckoutLink(null)}
                    className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecutePaymentSimulation}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-500/25 cursor-pointer flex items-center gap-2 active:scale-95"
                  >
                    <CheckCircle2 size={16} />
                    <span>Authorize &amp; Settle Payment</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: PROCESSING ANIMATION */}
            {checkoutStep === 'PAYING' && (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full border-4 border-emerald-500/30 border-t-emerald-400 animate-spin mx-auto" />
                <h4 className="text-base font-bold text-white">Settling with Bank &amp; Forex Clearinghouse...</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Authorizing transaction, executing mid-market FX conversion, and writing dual khata ledger credits.
                </p>
              </div>
            )}

            {/* STEP 3: CONFIRMED RECEIPT & BANK INFLOW */}
            {checkoutStep === 'CONFIRMED' && (
              <div className="py-4 text-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white">Payment Confirmed &amp; Bank Credited!</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Receipt issued to <span className="text-white font-semibold">{payerEmail}</span>
                  </p>
                </div>

                {/* Settle Details */}
                <div className="p-4 bg-emerald-500/[0.08] border border-emerald-500/30 rounded-2xl text-left text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Settled Account:</span>
                    <span className="font-bold text-white">{activeCheckoutLink.destinationAccountName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Net Treasury Inflow:</span>
                    <span className="font-mono font-black text-emerald-400 text-sm">
                      +{FX_RATES[activeCheckoutLink.destinationCurrency]?.symbol}
                      {activeCheckoutLink.settlementAmountEst.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}{' '}
                      {activeCheckoutLink.destinationCurrency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Dual Khata Status:</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      RECONCILED
                    </span>
                  </div>
                  {paidTxRecord && (
                    <div className="pt-2 border-t border-emerald-500/20 text-[10px] font-mono text-slate-400 truncate">
                      Tx ID: {paidTxRecord.id}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-center gap-3">
                  <Link
                    href="/banking"
                    onClick={() => setActiveCheckoutLink(null)}
                    className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <Landmark size={14} />
                    <span>View in Bank Treasury</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setActiveCheckoutLink(null)}
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs cursor-pointer shadow-md"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
