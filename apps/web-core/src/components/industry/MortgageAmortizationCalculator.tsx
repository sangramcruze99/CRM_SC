'use client';

import React, { useState } from 'react';
import { Home, DollarSign, Percent, Calendar, Calculator, Sparkles, CheckCircle2 } from 'lucide-react';

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
    <div className="bg-white/[0.04] backdrop-blur-2xl border border-emerald-500/30 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Home size={20} />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Mortgage Amortization & MLS Investment Calculator</h3>
            <span className="text-xs text-slate-400">Principal, Interest, Property Tax & Escrow Estimate</span>
          </div>
        </div>
        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs rounded-full border border-emerald-500/30">
          MLS Verified
        </span>
      </div>

      {/* Calculator Form & Output Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sliders Input */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Property Purchase Price</span>
              <span className="font-mono text-emerald-400 font-bold">${propertyPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="100000"
              max="5000000"
              step="25000"
              value={propertyPrice}
              onChange={(e) => setPropertyPrice(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Down Payment ({downPaymentPercent}%)</span>
              <span className="font-mono text-white">${downPayment.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Interest Rate (%)</label>
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
                className="w-full px-3 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Loan Term</label>
              <select
                value={loanTermYears}
                onChange={(e) => setLoanTermYears(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs font-bold text-white"
              >
                <option value={15}>15-Year Fixed</option>
                <option value={30}>30-Year Fixed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment Summary Box */}
        <div className="p-5 bg-gradient-to-tr from-emerald-500/15 via-white/[0.03] to-transparent border border-emerald-500/30 rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Estimated Monthly Mortgage Payment
            </span>
            <div className="text-3xl font-mono font-extrabold text-emerald-400 mt-1">
              ${totalMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              <span className="text-xs text-slate-400 font-normal"> / month</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs border-t border-white/[0.06] pt-3">
            <div className="flex justify-between text-slate-300">
              <span>Principal & Interest</span>
              <span className="font-mono font-bold text-white">${monthlyPrincipalAndInterest.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Property Tax Escrow</span>
              <span className="font-mono font-bold text-white">${propertyTax.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Homeowners Insurance</span>
              <span className="font-mono font-bold text-white">${homeInsurance.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
