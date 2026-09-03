'use client';

import React, { useState } from 'react';
import {
  Globe,
  Receipt,
  CreditCard,
  FileSignature,
  Ticket,
  Calendar,
  CheckCircle2,
  Sparkles,
  Download,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useIndustry } from '@/components/industry/IndustryContext';

export function PortalClient() {
  const { currentNiche, nicheConfig } = useIndustry();
  const [selectedTab, setSelectedTab] = useState<'invoices' | 'contracts' | 'tickets' | 'appointments'>('invoices');
  const [alert, setAlert] = useState<string | null>(null);
  const [isInvoicePaid, setIsInvoicePaid] = useState(false);
  const [isContractSigned, setIsContractSigned] = useState(false);

  const handlePayInvoice = () => {
    setIsInvoicePaid(true);
    setAlert('🎉 Payment of $14,500.00 processed via Stripe! Dual Khata ledger updated.');
    setTimeout(() => setAlert(null), 4000);
  };

  const handleSignContract = () => {
    setIsContractSigned(true);
    setAlert('✍️ Digital signature legally applied! Tamper-proof certificate generated.');
    setTimeout(() => setAlert(null), 4000);
  };

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 flex items-center justify-center text-2xl font-bold shadow-lg shadow-emerald-500/25">
            {nicheConfig.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">
                {nicheConfig.name} — Client Self-Service Portal
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Secure Magic Link Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Logged in as: <strong className="text-white">Sarah Connor</strong> (Cyberdyne Systems Corp)
            </p>
          </div>
        </div>

        {/* Portal Tab Switcher */}
        <div className="flex items-center p-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl">
          {[
            { id: 'invoices', label: 'Invoices & Pay', icon: Receipt },
            { id: 'contracts', label: 'E-Sign NDAs', icon: FileSignature },
            { id: 'tickets', label: 'Helpdesk Tickets', icon: Ticket },
            { id: 'appointments', label: 'Bookings / Schedule', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Invoices & Instant Stripe Payment */}
      {selectedTab === 'invoices' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div>
                <h3 className="font-bold text-sm text-white">Commercial Invoice #INV-2026-8891</h3>
                <span className="text-xs text-slate-400">Due: August 31, 2026 · Net 30 Terms</span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                  isInvoicePaid
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {isInvoicePaid ? 'PAID IN FULL' : 'PAYMENT DUE'}
              </span>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-3 bg-white/[0.02] rounded-xl text-slate-300">
                <span>Enterprise Dedicated Kubernetes Cloud Cluster (Q3)</span>
                <span className="font-mono font-bold text-white">$12,000.00</span>
              </div>
              <div className="flex justify-between p-3 bg-white/[0.02] rounded-xl text-slate-300">
                <span>Dual Khata Ledger & Real-Time Sync Engine Module</span>
                <span className="font-mono font-bold text-white">$2,500.00</span>
              </div>
              <div className="flex justify-between p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl font-bold text-sm">
                <span>Total Amount Due</span>
                <span className="font-mono text-emerald-400 text-base">$14,500.00 USD</span>
              </div>
            </div>

            {/* Pay with Stripe Button */}
            {!isInvoicePaid ? (
              <button
                type="button"
                onClick={handlePayInvoice}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <CreditCard size={18} />
                <span>Pay $14,500.00 via Stripe / Apple Pay</span>
              </button>
            ) : (
              <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-emerald-300 font-bold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} />
                  <span>Invoice settled on August 30, 2026. Receipt dispatched.</span>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-white/[0.1] hover:bg-white/[0.2] text-white rounded-lg cursor-pointer"
                >
                  Download Receipt
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
            <h3 className="font-bold text-sm text-white">Your Account Overview</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.06] space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Account Balance</span>
                <span className="text-xl font-mono font-bold text-white">
                  {isInvoicePaid ? '$0.00' : '$14,500.00'}
                </span>
              </div>

              <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.06] space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Dedicated Account Manager</span>
                <span className="font-bold text-white">Sophia Martinez</span>
                <span className="text-[11px] text-emerald-400 block">+1 (555) 392-8812</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: E-Sign Contracts & Agreements */}
      {selectedTab === 'contracts' && (
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <h3 className="font-bold text-sm text-white">Enterprise Master Services Agreement (MSA) & NDA</h3>
              <span className="text-xs text-slate-400">Ref: MSA-CYBERDYNE-2026</span>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                isContractSigned
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {isContractSigned ? 'SIGNED & SEALED' : 'SIGNATURE REQUIRED'}
            </span>
          </div>

          <div className="p-5 bg-slate-950/80 border border-white/[0.08] rounded-2xl text-xs text-slate-300 font-mono space-y-3 leading-relaxed">
            <p>
              THIS MASTER SERVICES AGREEMENT is entered into between Business OS Platform LLC and Cyberdyne Systems Corp.
            </p>
            <p>
              1. SCOPE OF SERVICES: Provider will deliver dedicated multi-tenant cloud partitions, Dual Khata financial ledgers, and OCR Neural Vision processing APIs with 99.99% uptime guarantee.
            </p>
            <p>
              2. CONFIDENTIALITY & GOVERNANCE: Both parties agree to SOC2 Type II and HIPAA data protection compliance standards.
            </p>
          </div>

          {!isContractSigned ? (
            <button
              type="button"
              onClick={handleSignContract}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileSignature size={18} />
              <span>Click to Digitally Sign Document (Sarah Connor)</span>
            </button>
          ) : (
            <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-emerald-300 font-bold">
              <span>Digitally signed by Sarah Connor on August 30, 2026. Audit certificate verified.</span>
              <button onClick={() => window.print()} className="px-3 py-1 bg-white/[0.1] rounded-lg text-white">
                Download PDF
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3 & 4: Tickets & Bookings placeholder preview */}
      {(selectedTab === 'tickets' || selectedTab === 'appointments') && (
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <Calendar size={24} />
          </div>
          <h3 className="font-bold text-base text-white">
            {selectedTab === 'tickets' ? 'Support Ticket Ledger' : 'Upcoming Appointments & Calendar'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            All support tickets and calendar appointments are synchronized directly with your account SLA and operations team.
          </p>
        </div>
      )}
    </div>
  );
}
