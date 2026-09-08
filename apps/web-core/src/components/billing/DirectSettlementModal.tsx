'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  DollarSign,
  X,
  CheckCircle2,
  Building2,
  CreditCard,
  Landmark,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Receipt,
  FileText,
  AlertCircle,
  Clock
} from 'lucide-react';

export interface SettlementInvoiceData {
  id: string;
  invoiceNum?: string;
  amount: number | string;
  paidAmount?: number | string;
  balanceDue?: number | string;
  status: string;
  clientName?: string;
  vendorName?: string;
  dueDate?: string;
  currency?: string;
}

interface DirectSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: SettlementInvoiceData;
  onSettlementComplete: (updatedInvoice: SettlementInvoiceData, paymentRecord: any) => void;
}

export function DirectSettlementModal({
  isOpen,
  onClose,
  invoice,
  onSettlementComplete,
}: DirectSettlementModalProps) {
  const [mounted, setMounted] = useState(false);
  const [direction, setDirection] = useState<'INBOUND' | 'OUTBOUND'>('INBOUND');

  const totalAmount = Number(invoice.amount) || 0;
  const currentPaid = Number(invoice.paidAmount) || (invoice.status === 'PAID' ? totalAmount : 0);
  const currentBalance = invoice.balanceDue !== undefined && invoice.balanceDue !== null
    ? Number(invoice.balanceDue)
    : Math.max(0, Number((totalAmount - currentPaid).toFixed(2)));

  const [settleAmount, setSettleAmount] = useState<number>(currentBalance > 0 ? currentBalance : totalAmount);
  const [method, setMethod] = useState<'BANK_TRANSFER' | 'CARD' | 'ACH' | 'WIRE' | 'CHECK' | 'CASH' | 'KHATA'>('BANK_TRANSFER');
  const [bankAccount, setBankAccount] = useState<string>('acct_operating_1010');
  const [reference, setReference] = useState<string>(`SETTLE-${Date.now().toString().slice(-6)}`);
  const [notes, setNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Re-initialize default settlement amount when invoice changes
    const bal = invoice.balanceDue !== undefined && invoice.balanceDue !== null
      ? Number(invoice.balanceDue)
      : Math.max(0, Number((totalAmount - currentPaid).toFixed(2)));
    setSettleAmount(bal > 0 ? bal : totalAmount);
    setReference(`SETTLE-${Date.now().toString().slice(-6)}`);
    setError(null);
    setSuccessData(null);
  }, [invoice, totalAmount, currentPaid]);

  if (!mounted || !isOpen) return null;

  const currencySymbol = invoice.currency || '$';
  const newBalanceRemaining = Math.max(0, Number((currentBalance - settleAmount).toFixed(2)));
  const willBeFullyPaid = newBalanceRemaining <= 0.01;

  const handleExecuteSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settleAmount <= 0) {
      setError('Settlement amount must be greater than zero.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Post to Finance Service Payments Engine via API Proxy
      const paymentPayload = {
        direction,
        amount: Number(settleAmount.toFixed(2)),
        currency: currencySymbol === '$' ? 'USD' : currencySymbol,
        method: method === 'KHATA' ? 'OTHER' : method,
        payerName: direction === 'INBOUND' ? (invoice.clientName || 'Commercial Client') : 'Business OS Enterprise',
        payeeName: direction === 'OUTBOUND' ? (invoice.vendorName || invoice.clientName || 'Vendor Payee') : 'Business OS Enterprise',
        destinationReference: bankAccount,
        externalReference: reference,
        notes: notes || `${direction === 'INBOUND' ? 'AR Customer Collection' : 'AP Vendor Disbursement'} for Invoice ${invoice.invoiceNum || invoice.id}`,
        allocations: [
          {
            invoiceId: invoice.id,
            amount: Number(settleAmount.toFixed(2)),
          },
        ],
      };

      const res = await fetch('/api/finance/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
        body: JSON.stringify(paymentPayload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Failed to record payment (${res.status})`);
      }

      const paymentRecord = await res.json();

      // 2. Also ensure Invoice status in Finance service is synchronized
      const newStatus = willBeFullyPaid ? 'PAID' : 'PARTIALLY_PAID';
      const updatedPaidAmount = Number((currentPaid + settleAmount).toFixed(2));
      const updatedBalanceDue = newBalanceRemaining;

      await fetch(`/api/finance/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default-tenant',
        },
        body: JSON.stringify({
          status: newStatus,
          paidAmount: updatedPaidAmount,
          balanceDue: updatedBalanceDue,
        }),
      }).catch((patchErr) => {
        console.warn('Invoice patch fallback warning:', patchErr);
      });

      const updatedInvoice: SettlementInvoiceData = {
        ...invoice,
        status: newStatus,
        paidAmount: updatedPaidAmount,
        balanceDue: updatedBalanceDue,
      };

      setSuccessData({
        payment: paymentRecord,
        updatedInvoice,
      });

      onSettlementComplete(updatedInvoice, paymentRecord);
    } catch (err: any) {
      console.error('Direct settlement error:', err);
      setError(err.message || 'Payment settlement encountered an error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-slate-900/95 dark:bg-[#0c1411]/95 border border-emerald-500/30 rounded-3xl shadow-2xl p-6 space-y-5 text-white my-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-sm">
              <DollarSign size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Direct Bill Settlement & Payment
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono">
                  {invoice.invoiceNum || invoice.id.slice(0, 8)}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Execute an immediate outbound payment to the vendor, or record inbound money collected from the client.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success Confirmation View */}
        {successData ? (
          <div className="py-6 space-y-5 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-in zoom-in-95">
              <CheckCircle2 size={32} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xl font-black text-white">Settlement Processed Successfully!</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Transaction <span className="font-mono font-bold text-emerald-300">{successData.payment?.paymentNumber || reference}</span> has been confirmed and ledger entries have posted to your Chart of Accounts.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-left">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Settled Amount</span>
                <span className="text-base font-mono font-black text-emerald-400">
                  {currencySymbol}{settleAmount.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">New Status</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-block font-mono mt-0.5">
                  {successData.updatedInvoice?.status}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Remaining Due</span>
                <span className="text-base font-mono font-bold text-slate-300">
                  {currencySymbol}{Number(successData.updatedInvoice?.balanceDue || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
              >
                Done & Return to Invoices
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleExecuteSettlement} className="space-y-4">
            {/* Account & Counterparty Context Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs font-medium">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Counterparty</span>
                <span className="font-bold text-white truncate block">
                  {invoice.clientName || invoice.vendorName || 'Commercial Account'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Amount</span>
                <span className="font-mono font-bold text-white block">
                  {currencySymbol}{totalAmount.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Already Paid</span>
                <span className="font-mono font-bold text-emerald-400 block">
                  {currencySymbol}{currentPaid.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Balance Due</span>
                <span className={`font-mono font-black block ${currentBalance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {currencySymbol}{currentBalance.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Direction Toggle: Receive vs Pay */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                Settlement Direction
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDirection('INBOUND')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    direction === 'INBOUND'
                      ? 'bg-emerald-500/15 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                      : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05] opacity-75'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${direction === 'INBOUND' ? 'bg-emerald-500/25 text-emerald-300' : 'bg-white/[0.06] text-slate-400'}`}>
                    <ArrowDownLeft size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-white block">Receive Payment (Inbound AR)</span>
                    <span className="text-[10px] text-slate-400">Customer or client is paying this bill to us</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDirection('OUTBOUND')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    direction === 'OUTBOUND'
                      ? 'bg-sky-500/15 border-sky-500/50 shadow-md shadow-sky-500/10'
                      : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05] opacity-75'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${direction === 'OUTBOUND' ? 'bg-sky-500/25 text-sky-300' : 'bg-white/[0.06] text-slate-400'}`}>
                    <ArrowUpRight size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-white block">Pay Bill Directly (Outbound AP)</span>
                    <span className="text-[10px] text-slate-400">We are dishing out funds to settle this vendor bill</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Settlement Amount Input with Quick Preset Pills */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Amount to {direction === 'INBOUND' ? 'Receive' : 'Pay'}
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSettleAmount(currentBalance > 0 ? currentBalance : totalAmount)}
                    className="px-2 py-0.5 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold transition-all cursor-pointer"
                  >
                    Full Balance ({currencySymbol}{currentBalance > 0 ? currentBalance.toFixed(2) : totalAmount.toFixed(2)})
                  </button>
                  {currentBalance > 10 && (
                    <button
                      type="button"
                      onClick={() => setSettleAmount(Number((currentBalance / 2).toFixed(2)))}
                      className="px-2 py-0.5 rounded-md bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-slate-300 text-[10px] font-bold transition-all cursor-pointer"
                    >
                      50% Partial
                    </button>
                  )}
                </div>
              </div>

              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400 font-mono font-bold text-base">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={totalAmount * 1.5}
                  value={settleAmount === 0 ? '' : settleAmount}
                  onChange={(e) => setSettleAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-4 py-2.5 bg-black/40 border border-white/[0.15] focus:border-emerald-400 rounded-xl font-mono text-base font-extrabold text-white focus:outline-none transition-all"
                  required
                />
              </div>

              {/* Dynamic Post-Settlement Status Forecast */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>
                  Remaining Balance after payment:{' '}
                  <span className="font-mono font-bold text-white">
                    {currencySymbol}{newBalanceRemaining.toFixed(2)}
                  </span>
                </span>
                <span className={`font-bold font-mono ${willBeFullyPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {willBeFullyPaid ? '✓ Will Mark as Settled in Full' : '⚠️ Partial Payment Remaining'}
                </span>
              </div>
            </div>

            {/* Payment Rail & Source Bank Account */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                  Payment Method
                </label>
                <select
                  value={method}
                  onChange={(e: any) => setMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/[0.15] focus:border-emerald-400 rounded-xl text-xs font-bold font-mono text-white focus:outline-none cursor-pointer"
                >
                  <option value="BANK_TRANSFER" className="bg-slate-900 text-white">🏦 Bank Wire / Transfer</option>
                  <option value="CARD" className="bg-slate-900 text-white">💳 Credit / Debit Card</option>
                  <option value="ACH" className="bg-slate-900 text-white">⚡ ACH Direct Debit</option>
                  <option value="CHECK" className="bg-slate-900 text-white">📜 Commercial Cheque</option>
                  <option value="CASH" className="bg-slate-900 text-white">💵 Cash Settlement</option>
                  <option value="KHATA" className="bg-slate-900 text-white">⚖️ Khata Ledger Settlement</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                  {direction === 'INBOUND' ? 'Deposit Destination Account' : 'Paying Source Account'}
                </label>
                <select
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/[0.15] focus:border-emerald-400 rounded-xl text-xs font-bold font-mono text-white focus:outline-none cursor-pointer"
                >
                  <option value="acct_operating_1010" className="bg-slate-900 text-white">
                    Main Commercial Checking (*1010)
                  </option>
                  <option value="acct_treasury_1020" className="bg-slate-900 text-white">
                    Treasury Reserve Account (*1020)
                  </option>
                  <option value="acct_amex_2100" className="bg-slate-900 text-white">
                    Corporate Amex Line (*2100)
                  </option>
                </select>
              </div>
            </div>

            {/* Reference & Memo Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                  Reference / Transaction ID
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. WIRE-89210 or Check #449"
                  className="w-full px-3 py-2 bg-black/40 border border-white/[0.15] focus:border-emerald-400 rounded-xl text-xs font-mono text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                  Internal Memo / Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Settled directly via corporate online banking"
                  className="w-full px-3 py-2 bg-black/40 border border-white/[0.15] focus:border-emerald-400 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Double-Entry GL Ledger Insight Banner */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] space-y-1 text-slate-300">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                <ShieldCheck size={13} />
                <span>Autonomous Double-Entry Posting:</span>
              </div>
              <p className="font-mono text-[10px] text-slate-400 pl-4">
                {direction === 'INBOUND'
                  ? `Debit Cash (1010) +$${settleAmount.toFixed(2)} · Credit AR (1200) -$${settleAmount.toFixed(2)}`
                  : `Debit AP (2000) -$${settleAmount.toFixed(2)} · Credit Cash (1010) -$${settleAmount.toFixed(2)}`}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {/* Form Footer Action Buttons */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isProcessing || settleAmount <= 0}
                className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-wide shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98] ${
                  direction === 'INBOUND'
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25 border border-emerald-400/40'
                    : 'bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 shadow-sky-500/25 border border-sky-400/40'
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Executing Settlement...</span>
                  </>
                ) : (
                  <>
                    {direction === 'INBOUND' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                    <span>
                      {direction === 'INBOUND'
                        ? `Record Inbound Payment (${currencySymbol}${settleAmount.toFixed(2)})`
                        : `Execute Outbound Payment (${currencySymbol}${settleAmount.toFixed(2)})`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
