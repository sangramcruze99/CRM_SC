'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  QrCode,
  CreditCard,
  Plus,
  Copy,
  CheckCircle2,
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
  Printer,
  Smartphone,
  Volume2,
  SlidersHorizontal,
  Store,
  Clock,
  Scan,
} from 'lucide-react';
import { FX_RATES, FinancialAccount, BankTransaction } from '../banking/BankingClient';

export type QrCodeType = 'DYNAMIC_POS' | 'STATIC_COUNTER' | 'CRYPTO_VAULT' | 'INVOICE_BILL';

export interface QrPaymentItem {
  id: string;
  name: string;
  type: QrCodeType;
  amount?: number; // undefined for static "scan & enter"
  currency: string;
  destinationAccountId: string;
  destinationAccountName: string;
  destinationCurrency: string;
  targetCategory: string; // e.g. "Retail Counter", "Executive Desk", "Consulting", "Real Estate Escrow"
  paymentsCount: number;
  totalCollected: number;
  status: 'ACTIVE' | 'PAID' | 'ARCHIVED';
  createdDate: string;
  accentColor: 'emerald' | 'cyan' | 'amber' | 'violet';
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
  const amountInUSD = amount / fromRate;
  const converted = amountInUSD * toRate;
  const effectiveRate = toRate / fromRate;
  return {
    converted: Math.round(converted * 100) / 100,
    rate: Math.round(effectiveRate * 10000) / 10000,
  };
}

// Synthesize pleasant POS cash chime using Web Audio API
function playPosChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.18, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    // Upward cheerful chime chord (C6 -> E6 -> G6)
    playTone(1046.5, now, 0.15);
    playTone(1318.5, now + 0.1, 0.2);
    playTone(1567.98, now + 0.2, 0.4);
  } catch {}
}

export function QrPaymentsClient() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Shared Banking State
  const [connectedAccounts, setConnectedAccounts] = useState<FinancialAccount[]>([]);
  const [qrItems, setQrItems] = useState<QrPaymentItem[]>([]);
  
  // Navigation tabs: 'CODES' | 'POS_TERMINAL' | 'FEED'
  const [activeTab, setActiveTab] = useState<'CODES' | 'POS_TERMINAL' | 'FEED'>('CODES');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | QrCodeType>('ALL');

  // Modals & Drawers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activePrintQr, setActivePrintQr] = useState<QrPaymentItem | null>(null);
  const [activeScanSimulator, setActiveScanSimulator] = useState<QrPaymentItem | null>(null);
  const [scanSimStep, setScanSimStep] = useState<'VIEW' | 'AUTHORIZE' | 'SETTLED'>('VIEW');
  const [customSimAmount, setCustomSimAmount] = useState<number>(100);
  const [selectedPayRail, setSelectedPayRail] = useState<'APPLE_PAY' | 'CARD' | 'INSTANT_ACH' | 'CRYPTO'>('APPLE_PAY');
  const [customerName, setCustomerName] = useState('Sarah Lin');
  const [alert, setAlert] = useState<string | null>(null);

  // POS Quick Terminal State
  const [posAmount, setPosAmount] = useState<string>('75.00');
  const [posCurrency, setPosCurrency] = useState('USD');
  const [posDestinationId, setPosDestinationId] = useState('');
  const [posGeneratedCode, setPosGeneratedCode] = useState<QrPaymentItem | null>(null);

  // Form State for Creating New QR Station
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<QrCodeType>('STATIC_COUNTER');
  const [formAmount, setFormAmount] = useState<number>(150);
  const [formCurrency, setFormCurrency] = useState('USD');
  const [formDestinationId, setFormDestinationId] = useState('');
  const [formCategory, setFormCategory] = useState('Front Desk & Checkout Standee');
  const [formAccent, setFormAccent] = useState<'emerald' | 'cyan' | 'amber' | 'violet'>('emerald');
  const [formNote, setFormNote] = useState('');

  // Hydrate accounts from Banking shared storage
  useEffect(() => {
    const loadSharedFinance = () => {
      try {
        const storedAccs = localStorage.getItem('enterprise_financial_accounts');
        if (storedAccs) {
          const parsed = JSON.parse(storedAccs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setConnectedAccounts(parsed);
            if (!formDestinationId) setFormDestinationId(parsed[0].id);
            if (!posDestinationId) setPosDestinationId(parsed[0].id);
            return;
          }
        }
        setConnectedAccounts(DEFAULT_FALLBACK_ACCOUNTS);
        if (!formDestinationId) setFormDestinationId(DEFAULT_FALLBACK_ACCOUNTS[0].id);
        if (!posDestinationId) setPosDestinationId(DEFAULT_FALLBACK_ACCOUNTS[0].id);
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
  }, [formDestinationId, posDestinationId]);

  // Hydrate QR Items from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('enterprise_qr_payment_codes');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setQrItems(parsed);
          return;
        }
      }
    } catch {}
  }, []);

  const persistQrItems = (items: QrPaymentItem[]) => {
    setQrItems(items);
    try {
      localStorage.setItem('enterprise_qr_payment_codes', JSON.stringify(items));
    } catch {}
  };

  const selectedDestAccount =
    connectedAccounts.find((a) => a.id === formDestinationId) || connectedAccounts[0] || DEFAULT_FALLBACK_ACCOUNTS[0];

  // Handle Create New QR
  const handleCreateQr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    const newQr: QrPaymentItem = {
      id: `qr_${Date.now().toString().slice(-6)}`,
      name: formName,
      type: formType,
      amount: formType === 'STATIC_COUNTER' ? undefined : Number(formAmount),
      currency: formCurrency,
      destinationAccountId: selectedDestAccount.id,
      destinationAccountName: selectedDestAccount.name,
      destinationCurrency: selectedDestAccount.currency,
      targetCategory: formCategory,
      paymentsCount: 0,
      totalCollected: 0,
      status: 'ACTIVE',
      createdDate: new Date().toISOString().split('T')[0],
      accentColor: formAccent,
      customerNote: formNote,
    };

    const updated = [newQr, ...qrItems];
    persistQrItems(updated);
    setIsCreateModalOpen(false);

    // Reset
    setFormName('');
    setFormAmount(150);
    setFormNote('');
    setAlert(`🎉 QR Payment code "${newQr.name}" generated with direct settlement to ${selectedDestAccount.name}!`);
    setTimeout(() => setAlert(null), 4000);
  };

  // Generate dynamic QR in POS Terminal view
  const handleGeneratePosQr = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(posAmount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const destAcc =
      connectedAccounts.find((a) => a.id === posDestinationId) || connectedAccounts[0] || DEFAULT_FALLBACK_ACCOUNTS[0];

    const posItem: QrPaymentItem = {
      id: `pos_${Date.now().toString().slice(-6)}`,
      name: `Point-of-Sale Checkout #${Date.now().toString().slice(-4)}`,
      type: 'DYNAMIC_POS',
      amount: numAmount,
      currency: posCurrency,
      destinationAccountId: destAcc.id,
      destinationAccountName: destAcc.name,
      destinationCurrency: destAcc.currency,
      targetCategory: 'In-Store POS Terminal',
      paymentsCount: 0,
      totalCollected: 0,
      status: 'ACTIVE',
      createdDate: new Date().toISOString().split('T')[0],
      accentColor: 'emerald',
      customerNote: 'Immediate POS counter scan & settle',
    };

    setPosGeneratedCode(posItem);
    const updated = [posItem, ...qrItems];
    persistQrItems(updated);
    playPosChime();
  };

  // Open Scan & Pay Simulator
  const handleOpenScanSimulator = (qr: QrPaymentItem) => {
    setActiveScanSimulator(qr);
    setScanSimStep('VIEW');
    setCustomSimAmount(qr.amount || 100);
    setSelectedPayRail('APPLE_PAY');
  };

  // Execute Simulated Scan Payment & Credit Banking Treasury
  const handleConfirmScanPayment = () => {
    if (!activeScanSimulator) return;

    const payAmount = activeScanSimulator.amount || customSimAmount || 100;
    const destAcc =
      connectedAccounts.find((a) => a.id === activeScanSimulator.destinationAccountId) ||
      connectedAccounts[0] ||
      DEFAULT_FALLBACK_ACCOUNTS[0];

    const settlement = convertCurrency(payAmount, activeScanSimulator.currency, destAcc.currency);

    // 1. Create Banking Transaction
    const newTx: BankTransaction = {
      id: `tx_qr_${Date.now()}`,
      date: 'Just now (QR Pay)',
      description: `QR Code Scan Inflow: ${activeScanSimulator.name} [${payAmount} ${activeScanSimulator.currency}]`,
      accountId: destAcc.id,
      accountName: destAcc.name,
      amount: settlement.converted,
      currency: destAcc.currency,
      type: 'CREDIT',
      status: 'RECONCILED',
      matchedRecord: `Dual Khata Settled · QR #${activeScanSimulator.id} (${customerName})`,
    };

    // 2. Update shared banking accounts
    try {
      let currentAccs = [...connectedAccounts];
      const storedAccs = localStorage.getItem('enterprise_financial_accounts');
      if (storedAccs) {
        try {
          currentAccs = JSON.parse(storedAccs);
        } catch {}
      }
      const updatedAccs = currentAccs.map((acc) => {
        if (acc.id === destAcc.id) {
          return {
            ...acc,
            balance: Math.round((acc.balance + settlement.converted) * 100) / 100,
            lastSynced: 'Just now (Instant QR Settlement)',
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
      const updatedFeed = [newTx, ...currentFeed];
      localStorage.setItem('enterprise_bank_transactions', JSON.stringify(updatedFeed));

      window.dispatchEvent(new Event('enterprise_finance_updated'));
    } catch (e) {
      console.error('Failed updating banking from QR payment', e);
    }

    // 3. Update QR Item
    const updatedQrItems = qrItems.map((item) => {
      if (item.id === activeScanSimulator.id) {
        return {
          ...item,
          paymentsCount: item.paymentsCount + 1,
          totalCollected: item.totalCollected + payAmount,
          status: item.type === 'DYNAMIC_POS' ? ('PAID' as const) : item.status,
        };
      }
      return item;
    });
    persistQrItems(updatedQrItems);

    // Play audible cash chime
    playPosChime();

    setScanSimStep('SETTLED');
  };

  // Metrics
  const totalVolumeUSD = qrItems.reduce((acc, q) => {
    const rate = FX_RATES[q.currency]?.rateToUSD || 1.0;
    return acc + q.totalCollected / rate;
  }, 0);

  const totalScans = qrItems.reduce((acc, q) => acc + q.paymentsCount, 0);

  const filteredQrItems = qrItems.filter((q) => {
    if (typeFilter !== 'ALL' && q.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        q.name.toLowerCase().includes(query) ||
        q.targetCategory.toLowerCase().includes(query) ||
        q.destinationAccountName.toLowerCase().includes(query) ||
        q.id.toLowerCase().includes(query)
      );
    }
    return true;
  });

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
              Pillar 20: In-Store QR Standee, POS Terminal &amp; Multi-Currency Pay
            </span>
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Landmark size={13} className="text-emerald-400" />
              Direct Bank Settlement
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <QrCode className="text-emerald-400" size={32} />
            QR Code Payment Systems &amp; POS
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Deploy dynamic Point-of-Sale checkout QR codes, printable countertop standees, and Web3 crypto payment codes. Customers scan with any mobile camera, settling instantaneously into your connected bank accounts.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap relative z-10">
          <Link
            href="/payment-links"
            className="px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-white font-bold rounded-2xl text-xs border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Zap size={14} className="text-emerald-400" />
            <span>Payment Links</span>
          </Link>

          <Link
            href="/banking"
            className="px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-white font-bold rounded-2xl text-xs border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Landmark size={14} className="text-emerald-400" />
            <span>Bank Treasury</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus size={16} />
            <span>Create QR Payment Code</span>
          </button>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI METRIC STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total QR Volume Settled</span>
            <DollarSign size={16} className="text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
              ${totalVolumeUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">
              {totalScans === 0 ? 'Awaiting customer scans' : `${totalScans} verified scan payments`}
            </span>
          </p>
        </div>

        <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Active QR Stations</span>
            <Store size={16} className="text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {qrItems.filter((q) => q.status === 'ACTIVE').length} Deployed
            </span>
          </div>
          <p className="text-[11px] text-teal-400 font-medium mt-1">Counter Standees &amp; Dynamic POS</p>
        </div>

        <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Settlement Routing</span>
            <Landmark size={16} className="text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {connectedAccounts.length} Connected
            </span>
          </div>
          <p className="text-[11px] text-sky-400 font-medium mt-1">Auto-credited into Treasury</p>
        </div>

        <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Instant Mobile Wallets</span>
            <Smartphone size={16} className="text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">Zero App Install</span>
          </div>
          <p className="text-[11px] text-amber-400 font-medium mt-1">Apple Pay, Google Pay, FedNow &amp; Web3</p>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-1">
        {[
          { id: 'CODES', label: 'QR Stations & Standees', icon: QrCode, badge: qrItems.length },
          { id: 'POS_TERMINAL', label: 'Point-of-Sale Quick Terminal', icon: Smartphone, badge: 'Live POS' },
          { id: 'FEED', label: 'In-Store Scan Audit Feed', icon: Receipt, badge: `${totalScans} Scans` },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black bg-white/[0.08]">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: QR STATIONS & CODES GRID */}
      {activeTab === 'CODES' && (
        <div className="space-y-4">
          {/* Filter / Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/40 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search QR codes by station name, location, or destination bank..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-800 border border-white/10 text-white text-xs font-semibold rounded-xl focus:outline-none"
              >
                <option value="ALL">All QR Station Types</option>
                <option value="STATIC_COUNTER">Counter Standee (Scan &amp; Enter)</option>
                <option value="DYNAMIC_POS">Dynamic POS (Fixed Amount)</option>
                <option value="CRYPTO_VAULT">Crypto Multi-Sig Safe</option>
                <option value="INVOICE_BILL">Invoice &amp; Bill Slip</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredQrItems.map((qr) => {
              const symbol = FX_RATES[qr.currency]?.symbol || '$';
              return (
                <div
                  key={qr.id}
                  className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] hover:border-emerald-500/40 rounded-3xl p-5 flex flex-col justify-between transition-all group shadow-xl relative overflow-hidden"
                >
                  <div>
                    {/* Top Row */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                        <Scan size={11} />
                        {qr.type.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono font-medium">{qr.createdDate}</span>
                    </div>

                    {/* QR Code Graphic Card Preview */}
                    <div className="my-4 p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl flex items-center gap-4">
                      {/* Interactive Mini QR SVG */}
                      <div className="p-2.5 bg-white rounded-xl shadow-md flex-shrink-0 cursor-pointer group-hover:scale-105 transition-transform" onClick={() => setActivePrintQr(qr)}>
                        <svg viewBox="0 0 100 100" width="70" height="70">
                          <rect width="100" height="100" fill="#ffffff" />
                          <rect x="8" y="8" width="28" height="28" fill="#0f172a" />
                          <rect x="12" y="12" width="20" height="20" fill="#ffffff" />
                          <rect x="16" y="16" width="12" height="12" fill="#0f172a" />
                          <rect x="64" y="8" width="28" height="28" fill="#0f172a" />
                          <rect x="68" y="12" width="20" height="20" fill="#ffffff" />
                          <rect x="72" y="16" width="12" height="12" fill="#0f172a" />
                          <rect x="8" y="64" width="28" height="28" fill="#0f172a" />
                          <rect x="12" y="68" width="20" height="20" fill="#ffffff" />
                          <rect x="16" y="72" width="12" height="12" fill="#0f172a" />
                          <rect x="42" y="12" width="8" height="8" fill="#0f172a" />
                          <rect x="42" y="24" width="8" height="8" fill="#0f172a" />
                          <rect x="12" y="44" width="8" height="8" fill="#0f172a" />
                          <rect x="44" y="44" width="12" height="12" fill="#10b981" rx="2" />
                          <rect x="64" y="44" width="8" height="8" fill="#0f172a" />
                          <rect x="44" y="64" width="8" height="8" fill="#0f172a" />
                          <rect x="64" y="64" width="8" height="8" fill="#0f172a" />
                          <rect x="74" y="78" width="8" height="8" fill="#0f172a" />
                        </svg>
                      </div>

                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                          Station Location
                        </span>
                        <h3 className="font-bold text-white text-sm truncate mt-0.5">{qr.name}</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">{qr.targetCategory}</p>

                        <div className="mt-2 text-xs font-mono font-bold text-emerald-400">
                          {qr.amount !== undefined ? (
                            <span>{symbol}{qr.amount.toLocaleString()} {qr.currency}</span>
                          ) : (
                            <span className="text-teal-300">Customer Defined Amount</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Settlement Account */}
                    <div className="flex items-center gap-2 p-2.5 bg-black/30 border border-white/[0.05] rounded-xl text-xs">
                      <Landmark size={14} className="text-emerald-400 flex-shrink-0" />
                      <div className="truncate">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Settlement Destination</span>
                        <span className="font-semibold text-white truncate block text-[11px]">
                          {qr.destinationAccountName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Strip */}
                  <div className="mt-4 pt-3 border-t border-white/[0.08] space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{qr.paymentsCount} Total Scans</span>
                      <span className="font-bold font-mono text-emerald-400">
                        {symbol}{qr.totalCollected.toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setActivePrintQr(qr)}
                        className="px-3 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-white/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Printer size={13} />
                        <span>Print Standee</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenScanSimulator(qr)}
                        className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                      >
                        <Smartphone size={13} />
                        <span>Scan &amp; Pay</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredQrItems.length === 0 && (
              <div className="col-span-full py-16 px-6 text-center bg-slate-900/40 dark:bg-white/[0.02] border border-dashed border-slate-700 dark:border-white/10 rounded-3xl flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-xl">
                  <QrCode size={30} />
                </div>
                <h3 className="text-lg font-black text-white">No QR Stations Deployed</h3>
                <p className="text-xs text-slate-400 max-w-md mt-1.5 mb-6">
                  Create a printable countertop standee for your reception desk or an instant point-of-sale checkout code. Payments clear directly into your connected treasury bank accounts.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Plus size={16} />
                  <span>Create First QR Station</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: POINT-OF-SALE QUICK REGISTER TERMINAL */}
      {activeTab === 'POS_TERMINAL' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Register Keypad */}
          <div className="lg:col-span-6 bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Smartphone size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">POS Register Terminal</h3>
                  <p className="text-xs text-slate-400">Punch in charge amount to generate instant customer-facing QR</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                LIVE
              </span>
            </div>

            <form onSubmit={handleGeneratePosQr} className="space-y-4">
              {/* Display Box */}
              <div className="p-4 bg-black/60 border border-white/15 rounded-2xl text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Due Amount</span>
                <div className="flex items-baseline justify-end gap-2">
                  <span className="text-2xl font-mono text-emerald-400">{FX_RATES[posCurrency]?.symbol}</span>
                  <input
                    type="text"
                    required
                    value={posAmount}
                    onChange={(e) => setPosAmount(e.target.value)}
                    className="bg-transparent text-4xl sm:text-5xl font-black font-mono text-white text-right focus:outline-none w-full"
                  />
                </div>
              </div>

              {/* Quick Currency & Account Select */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Currency</label>
                  <select
                    value={posCurrency}
                    onChange={(e) => setPosCurrency(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none"
                  >
                    {Object.keys(FX_RATES).map((curr) => (
                      <option key={curr} value={curr}>
                        {curr} ({FX_RATES[curr].symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Settlement Bank</label>
                  <select
                    value={posDestinationId}
                    onChange={(e) => setPosDestinationId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none truncate"
                  >
                    {connectedAccounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.currency})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preset Quick Buttons */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {['25.00', '50.00', '100.00', '250.00', '500.00', '1000.00', '2500.00', '5000.00'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPosAmount(val)}
                    className="py-2.5 px-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl text-xs font-mono font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    ${parseFloat(val).toLocaleString()}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <QrCode size={18} />
                <span>Generate Customer Scan QR</span>
              </button>
            </form>
          </div>

          {/* Right Customer-Facing Standee Display */}
          <div className="lg:col-span-6 bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-xl border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl relative overflow-hidden">
            <div className="space-y-1">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-block">
                CUSTOMER FACING DISPLAY
              </span>
              <h3 className="text-xl font-black text-white">Scan with Camera to Pay</h3>
              <p className="text-xs text-slate-400">Supports Apple Pay, Google Pay, Bank Wire &amp; Web3 Wallets</p>
            </div>

            {/* Main Interactive QR Card */}
            <div className="p-6 bg-white rounded-3xl max-w-[260px] mx-auto shadow-2xl shadow-emerald-500/10 space-y-3">
              <svg viewBox="0 0 100 100" width="180" height="180" className="mx-auto">
                <rect width="100" height="100" fill="#ffffff" />
                <rect x="8" y="8" width="28" height="28" fill="#0f172a" />
                <rect x="12" y="12" width="20" height="20" fill="#ffffff" />
                <rect x="16" y="16" width="12" height="12" fill="#0f172a" />
                <rect x="64" y="8" width="28" height="28" fill="#0f172a" />
                <rect x="68" y="12" width="20" height="20" fill="#ffffff" />
                <rect x="72" y="16" width="12" height="12" fill="#0f172a" />
                <rect x="8" y="64" width="28" height="28" fill="#0f172a" />
                <rect x="12" y="68" width="20" height="20" fill="#ffffff" />
                <rect x="16" y="72" width="12" height="12" fill="#0f172a" />
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

              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Due</span>
                <span className="text-2xl font-black font-mono text-slate-900">
                  {FX_RATES[posCurrency]?.symbol}
                  {parseFloat(posAmount || '0').toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {posGeneratedCode && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenScanSimulator(posGeneratedCode)}
                  className="px-6 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 mx-auto cursor-pointer transition-all"
                >
                  <Smartphone size={15} />
                  <span>Simulate Customer Scan &amp; Pay</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: IN-STORE SCAN AUDIT FEED */}
      {activeTab === 'FEED' && (
        <div className="bg-slate-900/60 dark:bg-white/[0.03] backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-3xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Receipt size={18} className="text-emerald-400" />
                <span>Real-Time QR Settlement Audit Stream</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every scanned payment writes directly into the Banking Dual Khata ledger.
              </p>
            </div>
            <Link
              href="/banking"
              className="px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] text-emerald-400 rounded-xl text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5"
            >
              <Landmark size={13} />
              <span>Open Banking Reconciler</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-white/[0.02] text-slate-400 uppercase font-semibold tracking-wider border-b border-white/[0.06]">
                <tr>
                  <th className="px-6 py-4">QR Station</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Destination Bank</th>
                  <th className="px-6 py-4">Scans Processed</th>
                  <th className="px-6 py-4">Total Collected</th>
                  <th className="px-6 py-4">Khata Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {qrItems.map((qr) => (
                  <tr key={qr.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-white block">{qr.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">#{qr.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/[0.05] text-slate-300">
                        {qr.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-medium block truncate max-w-[180px]">
                        {qr.destinationAccountName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{qr.destinationCurrency}</span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-white">{qr.paymentsCount} scans</td>
                    <td className="px-6 py-4 font-mono font-black text-emerald-400">
                      {FX_RATES[qr.currency]?.symbol}
                      {qr.totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        RECONCILED
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenScanSimulator(qr)}
                        className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold border border-emerald-500/40 cursor-pointer"
                      >
                        Test Scan
                      </button>
                    </td>
                  </tr>
                ))}
                {qrItems.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      No QR scan transactions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE NEW QR PAYMENT CODE */}
      {isCreateModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-slate-950 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_0_1px_rgba(16,185,129,0.2)] text-white space-y-5 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-black">
                  <QrCode size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Create QR Payment Code</h3>
                  <p className="text-xs text-slate-400">Standees, Dynamic POS, and Countertop Scan Stations</p>
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

            <form onSubmit={handleCreateQr} className="space-y-4 text-xs">
              {/* Type Switcher */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                  Station / QR Mode
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'STATIC_COUNTER', label: 'Standee QR', desc: 'Scan & Enter' },
                    { id: 'DYNAMIC_POS', label: 'Fixed Amount', desc: 'Exact Charge' },
                    { id: 'CRYPTO_VAULT', label: 'Crypto Safe', desc: 'USDC On-Chain' },
                    { id: 'INVOICE_BILL', label: 'Invoice QR', desc: 'Bill Attachment' },
                  ].map((t) => {
                    const isSelected = formType === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setFormType(t.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 font-black border-emerald-400 shadow-md'
                            : 'bg-white/[0.04] border-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        <span className="block text-xs font-bold">{t.label}</span>
                        <span className={`text-[9px] block ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                          {t.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Station Name */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Station Name / Label
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reception Desk Acrylic Standee #1"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Location Category */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Physical Placement / Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Front Counter, Table 4, VIP Lounge, Conference Booth"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              {/* Amount if dynamic */}
              {formType !== 'STATIC_COUNTER' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Fixed Amount</label>
                    <input
                      type="number"
                      min={1}
                      step="any"
                      required
                      value={formAmount}
                      onChange={(e) => setFormAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs font-mono font-bold text-emerald-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Currency</label>
                    <select
                      value={formCurrency}
                      onChange={(e) => setFormCurrency(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none"
                    >
                      {Object.keys(FX_RATES).map((c) => (
                        <option key={c} value={c}>
                          {c} ({FX_RATES[c].symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Destination Bank Structure */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Landmark size={12} className="text-emerald-400" />
                    <span>Destination Bank Structure (Treasury Settlement)</span>
                  </label>
                  <Link
                    href="/banking"
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    + Add New Account
                  </Link>
                </div>
                <select
                  value={formDestinationId}
                  onChange={(e) => setFormDestinationId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none"
                >
                  {connectedAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.currency}) — Balance: ${a.balance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Note */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Internal Memo (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Real estate escrow deposit station"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  className="w-full px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

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
                  <span>Generate QR Code</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: PRINTABLE COUNTER STANDEE POSTER */}
      {activePrintQr && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white text-slate-900 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
            {/* Close */}
            <button
              type="button"
              onClick={() => setActivePrintQr(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Acrylic Standee Printable Card */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black uppercase tracking-wider">
                <Sparkles size={13} />
                <span>OFFICIAL PAYMENT STANDEE</span>
              </div>
              <h2 className="text-2xl font-black text-slate-950 tracking-tight">{activePrintQr.name}</h2>
              <p className="text-xs text-slate-500">{activePrintQr.targetCategory}</p>
            </div>

            {/* High Contrast QR Code */}
            <div className="p-4 bg-slate-50 border-2 border-slate-900 rounded-3xl inline-block shadow-lg">
              <svg viewBox="0 0 100 100" width="200" height="200" className="mx-auto">
                <rect width="100" height="100" fill="#ffffff" />
                <rect x="8" y="8" width="28" height="28" fill="#0f172a" />
                <rect x="12" y="12" width="20" height="20" fill="#ffffff" />
                <rect x="16" y="16" width="12" height="12" fill="#0f172a" />
                <rect x="64" y="8" width="28" height="28" fill="#0f172a" />
                <rect x="68" y="12" width="20" height="20" fill="#ffffff" />
                <rect x="72" y="16" width="12" height="12" fill="#0f172a" />
                <rect x="8" y="64" width="28" height="28" fill="#0f172a" />
                <rect x="12" y="68" width="20" height="20" fill="#ffffff" />
                <rect x="16" y="72" width="12" height="12" fill="#0f172a" />
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

            {/* Instructions */}
            <div className="space-y-1">
              <p className="text-sm font-black text-slate-900">Scan with phone camera</p>
              <p className="text-xs text-slate-500">
                {activePrintQr.amount
                  ? `Pay ${FX_RATES[activePrintQr.currency]?.symbol}${activePrintQr.amount.toLocaleString()} ${activePrintQr.currency}`
                  : 'Enter custom amount & pay instantly'}
              </p>
            </div>

            {/* Badges Strip */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-center gap-3 text-[10px] font-bold text-slate-600">
              <span className="px-2 py-0.5 rounded bg-slate-100">Apple Pay</span>
              <span className="px-2 py-0.5 rounded bg-slate-100">Google Pay</span>
              <span className="px-2 py-0.5 rounded bg-slate-100">Visa / MC</span>
              <span className="px-2 py-0.5 rounded bg-slate-100">Web3</span>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Printer size={15} />
                <span>Print Counter Standee</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 3: INTERACTIVE CUSTOMER SCAN & PAY SIMULATOR */}
      {activeScanSimulator && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-white/20 rounded-3xl p-6 sm:p-7 shadow-2xl text-white space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Smartphone size={18} className="text-emerald-400" />
                <span className="text-xs font-bold text-white">Mobile Camera Scanner View</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveScanSimulator(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* SCANNER VIEW */}
            {scanSimStep === 'VIEW' && (
              <div className="space-y-4">
                {/* Simulated Phone Camera Viewfinder */}
                <div className="relative p-6 bg-black rounded-2xl border border-white/15 text-center overflow-hidden">
                  <div className="w-40 h-40 border-2 border-emerald-400 rounded-2xl mx-auto relative flex items-center justify-center">
                    <span className="w-4 h-4 border-t-2 border-l-2 border-emerald-400 absolute top-0 left-0" />
                    <span className="w-4 h-4 border-t-2 border-r-2 border-emerald-400 absolute top-0 right-0" />
                    <span className="w-4 h-4 border-b-2 border-l-2 border-emerald-400 absolute bottom-0 left-0" />
                    <span className="w-4 h-4 border-b-2 border-r-2 border-emerald-400 absolute bottom-0 right-0" />
                    {/* Laser Scanner Bar */}
                    <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse" />
                  </div>
                  <p className="text-[11px] text-emerald-400 font-mono mt-3">
                    QR Code Verified: {activeScanSimulator.name}
                  </p>
                </div>

                {/* Amount Confirmation */}
                <div className="p-3.5 bg-white/[0.04] border border-white/10 rounded-2xl space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Details</span>
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-white text-sm">{activeScanSimulator.name}</span>
                    <span className="font-mono font-black text-xl text-emerald-400">
                      {FX_RATES[activeScanSimulator.currency]?.symbol}
                      {activeScanSimulator.amount !== undefined ? (
                        activeScanSimulator.amount.toLocaleString()
                      ) : (
                        <input
                          type="number"
                          min={1}
                          value={customSimAmount}
                          onChange={(e) => setCustomSimAmount(Number(e.target.value))}
                          className="w-24 px-2 py-0.5 bg-black/60 border border-white/20 rounded font-mono text-emerald-400 text-right"
                        />
                      )}
                      {' '}{activeScanSimulator.currency}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Direct Wire to: <span className="text-white font-semibold">{activeScanSimulator.destinationAccountName}</span>
                  </p>
                </div>

                {/* Method Switcher */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                    Choose Mobile Pay Rail
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'APPLE_PAY', label: 'Apple Pay / Google Pay' },
                      { id: 'CARD', label: 'Credit / Debit Card' },
                      { id: 'INSTANT_ACH', label: 'FedNow / Direct Bank' },
                      { id: 'CRYPTO', label: 'USDC Web3 Pay' },
                    ].map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedPayRail(r.id as any)}
                        className={`p-2 rounded-xl border font-bold text-left transition-all cursor-pointer ${
                          selectedPayRail === r.id
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                            : 'bg-white/[0.04] border-white/10 text-slate-300'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmScanPayment}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-500/25 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <CheckCircle2 size={16} />
                  <span>Authorize &amp; Pay Instant QR</span>
                </button>
              </div>
            )}

            {/* CONFIRMED SETTLEMENT VIEW */}
            {scanSimStep === 'SETTLED' && (
              <div className="py-4 text-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white">QR Payment Settled!</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Audible cash chime triggered &amp; Treasury credited.</p>
                </div>

                <div className="p-4 bg-emerald-500/[0.08] border border-emerald-500/30 rounded-2xl text-left text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Credited Bank Account:</span>
                    <span className="font-bold text-white">{activeScanSimulator.destinationAccountName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Settled Amount:</span>
                    <span className="font-mono font-black text-emerald-400 text-sm">
                      +{FX_RATES[activeScanSimulator.currency]?.symbol}
                      {(activeScanSimulator.amount || customSimAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}{' '}
                      {activeScanSimulator.currency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Dual Khata Status:</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      RECONCILED
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-center gap-3">
                  <Link
                    href="/banking"
                    onClick={() => setActiveScanSimulator(null)}
                    className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <Landmark size={14} />
                    <span>View in Bank Treasury</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setActiveScanSimulator(null)}
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
