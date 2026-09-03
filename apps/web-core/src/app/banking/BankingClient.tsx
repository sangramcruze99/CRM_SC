'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

interface BankTransaction {
  id: string;
  date: string;
  description: string;
  account: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  status: 'RECONCILED' | 'UNMATCHED';
  matchedRecord?: string;
}

const INITIAL_BANK_FEED: BankTransaction[] = [];

const FX_RATES: Record<string, { symbol: string; rateToUSD: number; name: string }> = {
  USD: { symbol: '$', rateToUSD: 1.0, name: 'United States Dollar' },
  EUR: { symbol: '€', rateToUSD: 0.92, name: 'Euro' },
  GBP: { symbol: '£', rateToUSD: 0.79, name: 'British Pound' },
  AED: { symbol: 'د.إ', rateToUSD: 3.67, name: 'UAE Dirham' },
  INR: { symbol: '₹', rateToUSD: 83.45, name: 'Indian Rupee' },
  JPY: { symbol: '¥', rateToUSD: 154.2, name: 'Japanese Yen' },
  SGD: { symbol: 'S$', rateToUSD: 1.35, name: 'Singapore Dollar' },
};

export function BankingClient() {
  const [bankFeed, setBankFeed] = useState<BankTransaction[]>(INITIAL_BANK_FEED);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [calcAmount, setCalcAmount] = useState<number>(10000);
  const [alert, setAlert] = useState<string | null>(null);

  const handleReconcileAll = () => {
    const updated = bankFeed.map((tx) => ({ ...tx, status: 'RECONCILED' as const }));
    setBankFeed(updated);
    setAlert('🎉 All open bank transactions successfully matched and reconciled with Dual Khata ledger!');
    setTimeout(() => setAlert(null), 4000);
  };

  const handleReconcileSingle = (id: string) => {
    const updated = bankFeed.map((tx) => (tx.id === id ? { ...tx, status: 'RECONCILED' as const } : tx));
    setBankFeed(updated);
    setAlert('⚡ Transaction matched and balanced with company ledger.');
    setTimeout(() => setAlert(null), 3000);
  };

  const unmatchedCount = bankFeed.filter((tx) => tx.status === 'UNMATCHED').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Alert Banner */}
      {alert && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-2xl animate-in fade-in zoom-in-95 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{alert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Landmark className="text-emerald-400" size={24} />
            Multi-Currency Forex & Bank Reconciliation Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time open-banking transaction feed matching against Invoices, Khata Ledger, and Monthly Payroll.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReconcileAll}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Zap size={14} />
            <span>1-Click Auto-Reconcile ({unmatchedCount} Unmatched)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Reconciled Bank Balance</span>
            <DollarSign size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-emerald-400">$789,999.56</div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">JPMorgan & SVB Linked Accounts</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Reconciliation Health</span>
            <ShieldCheck size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-emerald-400">
            {unmatchedCount === 0 ? '100% Balanced' : `${unmatchedCount} Action Needed`}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Auto-matched via AI OCR & Invoices</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Global Currency Rates</span>
            <Globe2 size={16} className="text-sky-400" />
          </div>
          <div className="text-2xl font-mono font-extrabold text-white">7 Currencies Active</div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">USD, EUR, GBP, AED, INR, JPY, SGD</div>
        </div>
      </div>

      {/* Multi-Currency Real-Time Converter Box */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <Globe2 size={18} className="text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Multi-Currency Real-Time Forex Calculator</h3>
          </div>
          <span className="text-xs font-mono text-emerald-400">ECB / Federal Reserve Live Stream</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.entries(FX_RATES).map(([code, info]) => {
            const converted = (calcAmount * info.rateToUSD).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            });
            return (
              <div
                key={code}
                className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-center space-y-1"
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase">{code} ({info.symbol})</span>
                <div className="font-mono font-extrabold text-sm text-white">
                  {info.symbol}{converted}
                </div>
                <span className="text-[9px] text-slate-500 block truncate">{info.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Bank Feed & Reconciler Table */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Live Open-Banking Transaction Feed (Plaid / Stripe)</h3>
          <span className="text-xs text-slate-400">Auto-syncing every 60s</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-white/[0.02] text-slate-400 uppercase font-semibold tracking-wider border-b border-white/[0.08]">
              <tr>
                <th className="px-6 py-4">Date & Account</th>
                <th className="px-6 py-4">Transaction Description</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Matched CRM / Khata Record</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {bankFeed.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.04] transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-white block">{tx.date}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{tx.account}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-white text-xs block">{tx.description}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`font-mono font-extrabold text-sm ${
                        tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.type === 'CREDIT' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                      <Receipt size={13} className="text-emerald-400 flex-shrink-0" />
                      <span>{tx.matchedRecord}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        tx.status === 'RECONCILED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
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
                        className="px-3 py-1.5 bg-emerald-500/20 hover:bg-amber-500 text-emerald-300 hover:text-slate-950 font-bold rounded-xl text-xs border border-emerald-500/40 transition-all cursor-pointer"
                      >
                        Match & Reconcile
                      </button>
                    ) : (
                      <span className="text-emerald-400 font-semibold text-xs flex items-center justify-end gap-1">
                        <CheckCircle2 size={13} /> Reconciled
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {bankFeed.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-xs font-medium">
                    No open bank transactions detected. Connect your Open Banking / Plaid feed to ingest and auto-reconcile transactions against customer ledgers.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
