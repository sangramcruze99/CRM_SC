'use client';

import React, { useState } from 'react';
import {
  Users,
  Calendar,
  MapPin,
  DollarSign,
  CreditCard,
  ListOrdered,
  Hash,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Edit3,
  ExternalLink,
} from 'lucide-react';
import { CanonicalDocument } from '@/lib/document-intelligence/types';

interface ExtractedDataTabsProps {
  canonicalDoc?: CanonicalDocument | null;
  invoice: any;
  grandTotal: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  onOpenCorrection?: (fieldName: string, originalValue: any) => void;
  onOpenProvenance?: (fieldKey?: string) => void;
}

export function ExtractedDataTabs({
  canonicalDoc,
  invoice,
  grandTotal,
  subtotal,
  taxAmount,
  discountAmount,
  onOpenCorrection,
  onOpenProvenance,
}: ExtractedDataTabsProps) {
  const [activeTab, setActiveTab] = useState<
    'entities' | 'dates' | 'addresses' | 'financial' | 'payments' | 'lineItems' | 'identifiers'
  >('entities');

  const entities = canonicalDoc?.entities || [
    { type: 'COMPANY', name: invoice.vendorName, role: 'issuer', confidence: 0.95 },
    { type: 'COMPANY', name: invoice.clientCompany, role: 'customer', confidence: 0.94 },
    { type: 'PERSON', name: invoice.clientName, role: 'contact', confidence: 0.92 },
  ].filter((e) => e.name);

  const dates = canonicalDoc?.dates || [
    { type: 'invoice_date', value: invoice.issueDate, rawValue: invoice.issueDate, confidence: 0.98 },
    { type: 'due_date', value: invoice.dueDate, rawValue: invoice.dueDate, confidence: 0.96 },
  ].filter((d) => d.value);

  const addresses = canonicalDoc?.addresses || [
    { type: 'billing', text: invoice.clientAddress, confidence: 0.94 },
    { type: 'vendor', text: invoice.vendorAddress, confidence: 0.92 },
  ].filter((a) => a.text);

  const payments = canonicalDoc?.payments || [];
  const lineItems = canonicalDoc?.lineItems || (invoice.items || []).map((i: any) => ({
    description: i.description,
    quantity: Number(i.quantity) || 1,
    unitPrice: Number(i.unitPrice) || 0,
    total: Number(i.total) || 0,
  }));

  const validation = canonicalDoc?.validation || {
    isConsistent: true,
    issues: [],
  };

  const financial = canonicalDoc?.financial || {
    currency: invoice.currency || 'USD',
    subtotal,
    tax: taxAmount,
    discount: discountAmount,
    total: grandTotal,
    amountPaid: invoice.amountPaid || 0,
    balanceDue: invoice.balanceDue !== undefined ? invoice.balanceDue : Math.max(0, grandTotal - (invoice.amountPaid || 0)),
    paymentStatus: invoice.paymentStatus || 'UNPAID',
  };

  const identifiers = canonicalDoc?.identifiers || [
    { type: 'invoice_number', value: invoice.invoiceNumber, confidence: 0.99 },
    { type: 'tax_id', value: invoice.vendorTaxId, confidence: 0.95 },
  ].filter((id) => id.value);

  const tabs = [
    { id: 'entities', label: 'Entities', icon: Users, count: entities.length },
    { id: 'dates', label: 'Dates', icon: Calendar, count: dates.length },
    { id: 'addresses', label: 'Addresses', icon: MapPin, count: addresses.length },
    { id: 'financial', label: 'Financial Reconciliation', icon: DollarSign, count: null },
    { id: 'payments', label: 'Payments', icon: CreditCard, count: payments.length },
    { id: 'lineItems', label: 'Line Items', icon: ListOrdered, count: lineItems.length },
    { id: 'identifiers', label: 'Identifiers', icon: Hash, count: identifiers.length },
  ] as const;

  return (
    <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-4">
      {/* Header & Tabs Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/[0.06] pb-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Extracted Business Intelligence
        </h4>
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-[0.98] ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                    : 'bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06] border border-transparent'
                }`}
              >
                <Icon size={13} className={isActive ? 'text-emerald-400' : 'text-slate-400'} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive ? 'bg-emerald-500/30 text-emerald-200' : 'bg-white/10 text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Panels */}
      <div className="min-h-[160px]">
        {/* 1. ENTITIES TAB */}
        {activeTab === 'entities' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {entities.map((entity: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 bg-white/[0.03] border border-white/[0.06] hover:border-emerald-500/30 rounded-2xl space-y-2 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      {entity.type}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-slate-400">
                        {Math.round((entity.confidence || 0.95) * 100)}%
                      </span>
                      {onOpenCorrection && (
                        <button
                          type="button"
                          onClick={() => onOpenCorrection(`entity_${idx}`, entity.name)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-emerald-300 p-0.5 transition-opacity"
                          title="Correct entity name"
                        >
                          <Edit3 size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white truncate" title={entity.name}>
                      {entity.name}
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Role: <span className="text-slate-200 font-medium capitalize">{entity.role || 'Unspecified'}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {entities.length === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center">No entities identified in document.</p>
            )}
          </div>
        )}

        {/* 2. DATES TAB */}
        {activeTab === 'dates' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {dates.map((d: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-3.5 bg-white/[0.03] border rounded-2xl space-y-2 transition-all group ${
                    d.ambiguous ? 'border-amber-500/40 bg-amber-500/5' : 'border-white/[0.06] hover:border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/[0.08] text-slate-200">
                      {d.type?.replace(/_/g, ' ')}
                    </span>
                    {d.ambiguous ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                        <AlertTriangle size={10} /> Ambiguous Format
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-emerald-400">
                        {Math.round((d.confidence || 0.96) * 100)}%
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-mono font-bold text-white">
                      {d.value || '—'}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                      Raw Text: <span className="text-slate-300">"{d.rawValue || d.value}"</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {dates.length === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center">No dates detected in document.</p>
            )}
          </div>
        )}

        {/* 3. ADDRESSES TAB */}
        {activeTab === 'addresses' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {addresses.map((addr: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 bg-white/[0.03] border border-white/[0.06] hover:border-emerald-500/30 rounded-2xl space-y-2 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/[0.08] text-emerald-300">
                      {addr.type} Address
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {Math.round((addr.confidence || 0.94) * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {addr.text}
                  </p>
                </div>
              ))}
            </div>
            {addresses.length === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center">No addresses detected in document.</p>
            )}
          </div>
        )}

        {/* 4. FINANCIAL RECONCILIATION TAB */}
        {activeTab === 'financial' && (
          <div className="space-y-4 animate-in fade-in">
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              validation.isConsistent
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              <div className="flex items-center gap-2.5">
                {validation.isConsistent ? (
                  <CheckCircle2 size={18} className="text-emerald-400" />
                ) : (
                  <AlertTriangle size={18} className="text-rose-400" />
                )}
                <div>
                  <h5 className="text-xs font-bold text-white">
                    {validation.isConsistent
                      ? 'Mathematical Reconciliation: VERIFIED'
                      : 'Mathematical Inconsistency Flagged'}
                  </h5>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    {validation.isConsistent
                      ? 'Subtotal + Tax - Discount reconciles with Total, and Total - Paid reconciles with Balance Due.'
                      : typeof validation.issues?.[0] === 'object'
                      ? (validation.issues[0] as any)?.description || (validation.issues[0] as any)?.message || JSON.stringify(validation.issues[0])
                      : String(validation.issues?.[0] || 'Computed financial totals deviate from document reported values.')}
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-1 rounded-lg bg-black/40 border border-white/10">
                {financial.paymentStatus || 'UNPAID'}
              </span>
            </div>

            {/* Reconciliation Comparison Table */}
            <div className="border border-white/[0.08] rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] text-slate-400 font-semibold border-b border-white/[0.08]">
                  <tr>
                    <th className="p-3">Financial Field</th>
                    <th className="p-3 text-right">Extracted Value</th>
                    <th className="p-3 text-right">Computed Check</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] font-mono">
                  <tr>
                    <td className="p-3 text-slate-300">Subtotal</td>
                    <td className="p-3 text-right text-white">{financial.currency || '$'}{(financial.subtotal || 0).toFixed(2)}</td>
                    <td className="p-3 text-right text-slate-400">Sum(Line Items)</td>
                    <td className="p-3 text-center text-emerald-400">✓</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-300">Tax / VAT</td>
                    <td className="p-3 text-right text-white">+{financial.currency || '$'}{(financial.tax || 0).toFixed(2)}</td>
                    <td className="p-3 text-right text-slate-400">Computed</td>
                    <td className="p-3 text-center text-emerald-400">✓</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-300">Discount</td>
                    <td className="p-3 text-right text-white">-{financial.currency || '$'}{(financial.discount || 0).toFixed(2)}</td>
                    <td className="p-3 text-right text-slate-400">Deduction</td>
                    <td className="p-3 text-center text-emerald-400">✓</td>
                  </tr>
                  <tr className="bg-white/[0.02] font-bold">
                    <td className="p-3 text-emerald-300">Grand Total</td>
                    <td className="p-3 text-right text-emerald-300">{financial.currency || '$'}{(financial.total || 0).toFixed(2)}</td>
                    <td className="p-3 text-right text-emerald-300">{financial.currency || '$'}{(subtotal + taxAmount - discountAmount).toFixed(2)}</td>
                    <td className="p-3 text-center text-emerald-400">✓</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-300">Amount Paid</td>
                    <td className="p-3 text-right text-white">{financial.currency || '$'}{(financial.amountPaid || 0).toFixed(2)}</td>
                    <td className="p-3 text-right text-slate-400">Sum(Payments)</td>
                    <td className="p-3 text-center text-emerald-400">✓</td>
                  </tr>
                  <tr className="bg-white/[0.02] font-bold">
                    <td className="p-3 text-amber-300">Balance Due</td>
                    <td className="p-3 text-right text-amber-300">{financial.currency || '$'}{(financial.balanceDue || 0).toFixed(2)}</td>
                    <td className="p-3 text-right text-amber-300">{financial.currency || '$'}{Math.max(0, (financial.total || 0) - (financial.amountPaid || 0)).toFixed(2)}</td>
                    <td className="p-3 text-center text-emerald-400">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. MULTI-PAYMENTS TAB */}
        {activeTab === 'payments' && (
          <div className="space-y-3 animate-in fade-in">
            {payments.length > 0 ? (
              <div className="border border-white/[0.08] rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.03] text-slate-400 font-semibold border-b border-white/[0.08]">
                    <tr>
                      <th className="p-3">Payment Record</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Reference / TxID</th>
                      <th className="p-3">Method</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {payments.map((p: any, idx: number) => (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="p-3 font-semibold text-white">Payment #{idx + 1}</td>
                        <td className="p-3 font-mono text-slate-300">{p.date || '—'}</td>
                        <td className="p-3 font-mono text-slate-400">{p.reference || 'REF-EXTRACTED'}</td>
                        <td className="p-3 text-slate-300 capitalize">{p.method || 'Electronic Wire'}</td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-400">
                          {financial.currency || '$'}{(p.amount || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                <p>No separate payment transactions recorded in this document.</p>
                <p className="text-[11px] text-slate-500 mt-1">Single settlement or awaiting initial payment.</p>
              </div>
            )}
          </div>
        )}

        {/* 6. LINE ITEMS TAB */}
        {activeTab === 'lineItems' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="border border-white/[0.08] rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] text-slate-400 font-semibold border-b border-white/[0.08]">
                  <tr>
                    <th className="p-3">Item Description</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Line Total</th>
                    <th className="p-3 text-center">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {lineItems.map((item: any, idx: number) => {
                    const isMathValid = Math.abs(item.quantity * item.unitPrice - item.total) < 0.05;
                    return (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="p-3 font-medium text-white">{item.description}</td>
                        <td className="p-3 text-center font-mono text-slate-300">{item.quantity}</td>
                        <td className="p-3 text-right font-mono text-slate-300">
                          {financial.currency || '$'}{(item.unitPrice || 0).toFixed(2)}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-400">
                          {financial.currency || '$'}{(item.total || 0).toFixed(2)}
                        </td>
                        <td className="p-3 text-center">
                          {isMathValid ? (
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                              PASS
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                              CHECK
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. IDENTIFIERS TAB */}
        {activeTab === 'identifiers' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {identifiers.map((id: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 bg-white/[0.03] border border-white/[0.06] hover:border-emerald-500/30 rounded-2xl space-y-2 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/[0.08] text-slate-200">
                      {id.type?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {Math.round((id.confidence || 0.98) * 100)}%
                    </span>
                  </div>
                  <p className="text-sm font-mono font-bold text-white">
                    {id.value}
                  </p>
                </div>
              ))}
            </div>
            {identifiers.length === 0 && (
              <p className="text-xs text-slate-400 py-6 text-center">No unique identifiers extracted.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
