'use client';

import React, { useState } from 'react';
import { Home, DollarSign, Percent, Calendar, Calculator, Sparkles, CheckCircle2, Building, ShieldCheck } from 'lucide-react';

export function MortgageAmortizationCalculator() {
  const [propertyPrice, setPropertyPrice] = useState<number>(850000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [loanTermYears, setLoanTermYears] = useState<number>(30);

  const downPayment = (propertyPrice * downPaymentPercent) / 100;
  const loanAmount = propertyPrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = loanTermYears * 12;

  const monthlyPrincipalAndInterest =
    monthlyRate > 0
      ? (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
      : loanAmount / totalMonths;

  const propertyTax = (propertyPrice * 0.012) / 12;
  const homeInsurance = (propertyPrice * 0.005) / 12;
  const totalMonthly = monthlyPrincipalAndInterest + propertyTax + homeInsurance;

  return (
    <div className="relative bg-white/95 dark:bg-gradient-to-b dark:from-slate-900/95 dark:via-slate-950/98 dark:to-slate-950/99 border border-slate-200 dark:border-white/[0.14] rounded-3xl p-6 sm:p-7 shadow-xl dark:shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(16,185,129,0.15)] backdrop-blur-2xl space-y-6 text-slate-900 dark:text-white overflow-hidden">
      {/* Top Specular Glow Lines */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-emerald-500/10 blur-3xl rounded-full" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-5 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Home size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-black tracking-widest text-emerald-700 dark:text-emerald-300 uppercase">
                REAL ESTATE MLS
              </span>
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white tracking-tight mt-0.5">
              Mortgage Amortization & MLS Investment Calculator
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Principal, Interest, Property Tax & Escrow Estimate</span>
          </div>
        </div>
        <span className="px-3 py-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono font-black text-xs rounded-xl border border-emerald-500/30 shadow-2xs">
          MLS Verified
        </span>
      </div>

      {/* Calculator Form & Output Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* Sliders Input */}
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/[0.1] rounded-2xl space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300">Property Purchase Price</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-sm">${propertyPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="100000"
              max="5000000"
              step="25000"
              value={propertyPrice}
              onChange={(e) => setPropertyPrice(Number(e.target.value))}
              className="w-full accent-emerald-500 dark:accent-emerald-400 cursor-pointer"
            />
          </div>

          <div className="p-4 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/[0.1] rounded-2xl space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300">Down Payment ({downPaymentPercent}%)</span>
              <span className="font-mono text-slate-900 dark:text-white font-bold text-sm">${downPayment.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="w-full accent-emerald-500 dark:accent-emerald-400 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-slate-400">Interest Rate (%)</label>
              <div className="relative">
                <Percent size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="number"
                  step="0.1"
                  placeholder="6.5"
                  value={interestRate === 0 ? '' : interestRate}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    let raw = e.target.value;
                    if (raw.length > 1 && raw.startsWith('0') && !raw.startsWith('0.')) {
                      raw = raw.replace(/^0+/, '');
                    }
                    setInterestRate(raw === '' ? 0 : parseFloat(raw) || 0);
                  }}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/[0.12] rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-slate-400">Loan Term</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={loanTermYears}
                  onChange={(e) => setLoanTermYears(Number(e.target.value))}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#0e1613] border border-slate-200 dark:border-white/[0.12] rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                >
                  <option value={15}>15-Year Fixed</option>
                  <option value={30}>30-Year Fixed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary Box */}
        <div className="p-5 bg-gradient-to-br from-emerald-500/10 via-slate-50 to-slate-100 dark:from-emerald-500/15 dark:via-black/40 dark:to-black/60 border border-emerald-500/30 rounded-2xl space-y-4 flex flex-col justify-between shadow-md dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-700 dark:text-emerald-300 block">
                Estimated Monthly Mortgage Payment
              </span>
            </div>
            <div className="text-3xl font-mono font-black text-emerald-600 dark:text-emerald-400 mt-2">
              ${totalMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              <span className="text-xs text-slate-500 dark:text-slate-400 font-normal"> / month</span>
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-slate-200 dark:border-white/[0.08] pt-3">
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span className="font-medium">Principal & Interest</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">${monthlyPrincipalAndInterest.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span className="font-medium">Property Tax Escrow (Annualized)</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">${propertyTax.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span className="font-medium">Homeowners Insurance Escrow</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">${homeInsurance.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
