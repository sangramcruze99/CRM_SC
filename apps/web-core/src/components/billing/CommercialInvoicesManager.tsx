'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  Receipt,
  FileText,
  Plus,
  Search,
  Scan,
  CheckCircle2,
  Clock,
  Building2,
  Mail,
  Printer,
  Trash2,
  Sparkles,
  Download,
  AlertCircle,
  Calendar,
  Layers,
  Check,
  X,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { InvoiceDispatchModal } from './InvoiceDispatchModal';
import { createInvoice, updateInvoiceStatus, deleteInvoice, seedDemoInvoices } from '../../app/actions';
import { useRouter } from 'next/navigation';

export interface InvoiceItem {
  id: string;
  invoiceNum?: string;
  amount: number | string;
  status: 'PAID' | 'SENT' | 'OVERDUE' | 'DRAFT' | string;
  dueDate?: string;
  createdAt?: string | Date;
  clientName?: string;
  clientEmail?: string;
  vendorName?: string;
  items?: any[];
}

interface CommercialInvoicesManagerProps {
  initialInvoices: InvoiceItem[];
}

export function CommercialInvoicesManager({ initialInvoices }: CommercialInvoicesManagerProps) {
  const [invoices, setInvoices] = useState<InvoiceItem[]>(initialInvoices);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'SENT' | 'OVERDUE' | 'DRAFT'>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [dispatchTab, setDispatchTab] = useState<'email' | 'receipt'>('email');
  const [mounted, setMounted] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    // Status filter
    if (statusFilter !== 'ALL' && inv.status !== statusFilter) return false;
    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const numMatch = (inv.invoiceNum || inv.id || '').toLowerCase().includes(q);
    const clientMatch = (inv.clientName || '').toLowerCase().includes(q);
    const amountMatch = String(inv.amount).includes(q);
    return numMatch || clientMatch || amountMatch;
  });

  // Calculate Metrics
  const totalOutstanding = invoices
    .filter((i) => i.status !== 'PAID')
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  const totalPaid = invoices
    .filter((i) => i.status === 'PAID')
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  const overdueCount = invoices.filter((i) => i.status === 'OVERDUE').length;
  const overdueTotal = invoices
    .filter((i) => i.status === 'OVERDUE')
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  // Status Change Handler
  const handleStatusChange = async (id: string, newStatus: string) => {
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return;

    setInvoices((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
    );

    setAlert({
      message: `✨ Invoice ${inv.invoiceNum || inv.id.slice(0, 8)} marked as ${newStatus}`,
      type: 'success',
    });
    setTimeout(() => setAlert(null), 3000);

    startTransition(async () => {
      try {
        await updateInvoiceStatus(id, newStatus);
      } catch (err) {
        console.error('Failed to update invoice status:', err);
      }
    });
  };

  // Create Invoice Handler
  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get('amount'));
    const clientName = (formData.get('clientName') as string) || 'Commercial Account';

    const tempInvoice: InvoiceItem = {
      id: `inv_${Date.now()}`,
      invoiceNum: `INV-${Date.now().toString().slice(-6)}`,
      amount,
      clientName,
      status: (formData.get('status') as string) || 'SENT',
      dueDate: (formData.get('dueDate') as string) || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
    };

    setInvoices((prev) => [tempInvoice, ...prev]);
    setIsCreateModalOpen(false);

    setAlert({
      message: `✅ Created commercial invoice for ${clientName} ($${amount.toLocaleString()})`,
      type: 'success',
    });
    setTimeout(() => setAlert(null), 3000);

    startTransition(async () => {
      try {
        await createInvoice(formData);
      } catch (err) {
        console.error('Failed to create invoice:', err);
      }
    });
  };

  // Seed sample invoices
  const handleSeedInvoices = () => {
    startTransition(async () => {
      setAlert({
        message: '⚡ Seeding enterprise invoices into Finance microservice...',
        type: 'info',
      });
      await seedDemoInvoices();
      router.refresh();
      setTimeout(() => {
        setAlert({
          message: '✅ Populated live commercial billing ledger!',
          type: 'success',
        });
        setTimeout(() => setAlert(null), 3000);
      }, 800);
    });
  };

  const handleDelete = (id: string, num?: string) => {
    if (!confirm(`Are you sure you want to delete invoice ${num || id}?`)) return;
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    startTransition(async () => {
      await deleteInvoice(id);
    });
  };

  const openDispatch = (invoice: InvoiceItem, tab: 'email' | 'receipt') => {
    setSelectedInvoice(invoice);
    setDispatchTab(tab);
    setIsDispatchModalOpen(true);
  };

  const formattedSelectedInvoice = selectedInvoice
    ? {
        invoiceNumber: selectedInvoice.invoiceNum || `INV-${selectedInvoice.id.slice(0, 8)}`,
        vendorName: selectedInvoice.vendorName || 'Apex Global Enterprise Solutions',
        vendorEmail: 'billing@apexglobal.io',
        vendorAddress: '100 Montgomery St, Suite 1400, San Francisco, CA',
        vendorTaxId: 'US-EIN-94-3829104',
        clientName: selectedInvoice.clientName || 'Commercial Enterprise Client',
        clientEmail: selectedInvoice.clientEmail || 'accounts.payable@client.com',
        issueDate: selectedInvoice.createdAt ? new Date(selectedInvoice.createdAt).toISOString().split('T')[0] : '2026-08-01',
        dueDate: selectedInvoice.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        currency: '$',
        taxRate: 8.5,
        discount: 0,
        items: selectedInvoice.items && selectedInvoice.items.length > 0 ? selectedInvoice.items : [
          {
            description: 'Enterprise Multi-Region License & Infrastructure Fee',
            quantity: 1,
            unitPrice: Number(selectedInvoice.amount) || 0,
            total: Number(selectedInvoice.amount) || 0,
          }
        ],
        subtotal: Number(selectedInvoice.amount) || 0,
        taxAmount: (Number(selectedInvoice.amount) || 0) * 0.085,
        grandTotal: (Number(selectedInvoice.amount) || 0) * 1.085,
      }
    : null;

  return (
    <div className="w-full h-full flex flex-col space-y-4 max-w-7xl mx-auto text-white">
      {/* Toast Alert Banner */}
      {alert && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs font-semibold flex items-center justify-between gap-3 shadow-xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            <span>{alert.message}</span>
          </div>
          <button
            onClick={() => setAlert(null)}
            className="text-[11px] text-emerald-400 hover:text-white underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. EXECUTIVE HEADER & ACTIONS BAR                         */}
      {/* ========================================================= */}
      <div className="botanical-glass-card p-4 px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-emerald-500/25 border border-emerald-300/30 shrink-0">
            <Receipt size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-black text-white tracking-tight">Commercial Invoices & Billing</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {invoices.length} Invoices
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Accounts receivable, customer ledgers, and automated payment reconciliation.
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/ocr-invoice"
            className="px-3.5 py-2 botanical-pill hover:border-teal-500/50 text-xs font-bold text-teal-300 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Scan physical receipt or invoice via Neural OCR"
          >
            <Scan size={14} className="text-teal-400" />
            <span>AI OCR Scanner</span>
          </Link>

          {invoices.length === 0 && (
            <button
              onClick={handleSeedInvoices}
              disabled={isPending}
              className="px-3.5 py-2 botanical-pill hover:border-emerald-500/50 text-xs font-bold text-emerald-300 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles size={14} className="text-emerald-400" />
              <span>Seed Demo Invoices</span>
            </button>
          )}

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
          >
            <Plus size={15} className="stroke-[3]" />
            <span>New Commercial Invoice</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. 3 HIGH-DENSITY FINANCIAL KPI CARDS                     */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Outstanding */}
        <div className="botanical-glass-card p-5 space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Total Outstanding</span>
            <span className="text-emerald-400 font-mono font-bold">
              {invoices.filter((i) => i.status !== 'PAID').length} Unpaid
            </span>
          </div>
          <div className="text-3xl font-black font-mono text-white tracking-tight">
            ${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-white/[0.08] text-xs text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-slate-300 font-medium">Awaiting customer wire transfer</span>
          </div>
        </div>

        {/* Overdue */}
        <div className="botanical-glass-card p-5 space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Overdue Invoices</span>
            <span className={`font-mono font-bold ${overdueCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {overdueCount} Accounts
            </span>
          </div>
          <div className={`text-3xl font-black font-mono tracking-tight ${overdueCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            ${overdueTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-white/[0.08] text-xs">
            <span className={`w-2 h-2 rounded-full ${overdueCount > 0 ? 'bg-rose-400' : 'bg-emerald-400'}`} />
            <span className="text-[11px] text-slate-300 font-medium">
              {overdueCount > 0 ? 'Delinquent accounts requiring follow-up' : 'Zero delinquent accounts'}
            </span>
          </div>
        </div>

        {/* Paid (Last 30 Days) */}
        <div className="botanical-glass-card p-5 space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Paid Revenue (Settled)</span>
            <span className="text-teal-400 font-mono font-bold">
              {invoices.filter((i) => i.status === 'PAID').length} Settled
            </span>
          </div>
          <div className="text-3xl font-black font-mono text-emerald-400 tracking-tight">
            ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-white/[0.08] text-xs text-teal-400">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <span className="text-[11px] text-slate-300 font-medium">Auto-reconciled with bank ledger</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. FILTER TABS & SEARCH BAR                               */}
      {/* ========================================================= */}
      <div className="botanical-glass-card p-3 px-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'ALL', label: 'All Invoices', count: invoices.length },
            { id: 'PAID', label: 'Paid', count: invoices.filter((i) => i.status === 'PAID').length },
            { id: 'SENT', label: 'Pending / Sent', count: invoices.filter((i) => i.status === 'SENT').length },
            { id: 'OVERDUE', label: 'Overdue', count: invoices.filter((i) => i.status === 'OVERDUE').length },
            { id: 'DRAFT', label: 'Draft', count: invoices.filter((i) => i.status === 'DRAFT').length },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                  isActive ? 'botanical-pill-active text-slate-950 font-bold' : 'botanical-pill hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-black/20 text-slate-950' : 'bg-white/10 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Search */}
        <div className="relative w-full md:w-64">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoices, clients, amounts..."
            className="w-full bg-white/[0.05] border border-white/10 rounded-full pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. COMMERCIAL BILLING DATA LEDGER TABLE                   */}
      {/* ========================================================= */}
      <div className="botanical-glass-card overflow-hidden flex flex-col flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-white/[0.04] border-b border-white/[0.08] text-slate-400 uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Invoice #</th>
                <th className="py-3.5 px-6">Client / Account</th>
                <th className="py-3.5 px-6">Payment Status</th>
                <th className="py-3.5 px-6">Due Date</th>
                <th className="py-3.5 px-6 text-right">Total Amount</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/[0.04] transition-colors group">
                  {/* Invoice # */}
                  <td className="py-4 px-6 font-mono font-bold text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <FileText size={14} />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-white block">
                          {inv.invoiceNum || `INV-${inv.id.slice(0, 8)}`}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : 'Today'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Client Name */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-slate-500 shrink-0" />
                      <span className="font-bold text-xs text-slate-200">
                        {inv.clientName || 'Commercial Enterprise Account'}
                      </span>
                    </div>
                  </td>

                  {/* Payment Status Dropdown Mover */}
                  <td className="py-4 px-6">
                    <select
                      value={inv.status}
                      onChange={(e) => handleStatusChange(inv.id, e.target.value)}
                      className={`text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : inv.status === 'OVERDUE'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : inv.status === 'SENT'
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                          : 'bg-white/[0.08] text-slate-300 border border-white/10'
                      }`}
                    >
                      <option value="PAID">● PAID</option>
                      <option value="SENT">● SENT / PENDING</option>
                      <option value="OVERDUE">● OVERDUE</option>
                      <option value="DRAFT">● DRAFT</option>
                    </select>
                  </td>

                  {/* Due Date */}
                  <td className="py-4 px-6 text-slate-300 font-mono">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Calendar size={13} className="text-slate-500" />
                      <span>{inv.dueDate || '30 Days Net'}</span>
                    </div>
                  </td>

                  {/* Total Amount */}
                  <td className="py-4 px-6 text-right font-mono font-black text-sm text-emerald-400">
                    ${Number(inv.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openDispatch(inv, 'email')}
                        className="px-2.5 py-1 botanical-glass-inset hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                        title="Send invoice via email"
                      >
                        <Mail size={12} className="text-emerald-400" />
                        <span>Email</span>
                      </button>

                      <button
                        onClick={() => openDispatch(inv, 'receipt')}
                        className="px-2.5 py-1 botanical-glass-inset hover:border-teal-500/50 text-slate-300 hover:text-teal-300 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                        title="View / Print PDF Receipt"
                      >
                        <Printer size={12} className="text-teal-400" />
                        <span>Receipt</span>
                      </button>

                      <button
                        onClick={() => handleDelete(inv.id, inv.invoiceNum)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete invoice record"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20">
                        <Receipt size={24} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">No invoice records found</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Create your first commercial invoice or scan paper receipts using the AI Vision Scanner.
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2.5 pt-2">
                        <button
                          onClick={() => setIsCreateModalOpen(true)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 cursor-pointer"
                        >
                          + New Commercial Invoice
                        </button>
                        <button
                          onClick={handleSeedInvoices}
                          className="px-4 py-2 botanical-pill text-xs font-semibold text-emerald-300 cursor-pointer"
                        >
                          Seed Demo Records
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. CREATE COMMERCIAL INVOICE MODAL                        */}
      {/* ========================================================= */}
      {isCreateModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-gradient-to-b dark:from-slate-900/95 dark:via-slate-950/98 dark:to-slate-950/99 border border-slate-200 dark:border-white/[0.14] rounded-3xl p-6 sm:p-7 shadow-2xl dark:shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(16,185,129,0.15)] backdrop-blur-2xl text-slate-900 dark:text-white space-y-5 animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Top Specular Glow Lines */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-emerald-500/10 blur-3xl rounded-full" />

            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-white/[0.08] relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <Receipt size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-black tracking-widest text-emerald-700 dark:text-emerald-300 uppercase">
                      BILLING LEDGER
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">Generate Commercial Invoice</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Issue formal client invoice draft to receivable ledger</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs relative z-10">
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-slate-400">Client / Organization Name</label>
                <div className="relative">
                  <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    required
                    name="clientName"
                    type="text"
                    placeholder="e.g. Acme Global Logistics Corp"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/[0.12] rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-slate-400">Invoice Amount ($)</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      required
                      name="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="25000.00"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/[0.12] rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-mono font-bold focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-slate-400">Initial Status</label>
                  <div className="relative">
                    <select
                      name="status"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0c1411] border border-slate-200 dark:border-white/[0.12] rounded-xl text-slate-900 dark:text-emerald-300 font-bold focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    >
                      <option value="SENT">SENT / PENDING</option>
                      <option value="PAID">PAID</option>
                      <option value="DRAFT">DRAFT</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-slate-400">Payment Due Date</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    name="dueDate"
                    defaultValue={new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/[0.12] rounded-xl text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-end gap-3 relative z-10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.08] text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black tracking-wide shadow-lg shadow-emerald-500/25 active:scale-[0.98] border border-emerald-400/40 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles size={13} />
                  <span>Issue Commercial Invoice</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================= */}
      {/* 6. INVOICE DISPATCH & PDF RECEIPT MODAL                   */}
      {/* ========================================================= */}
      {isDispatchModalOpen && formattedSelectedInvoice && (
        <InvoiceDispatchModal
          isOpen={isDispatchModalOpen}
          onClose={() => setIsDispatchModalOpen(false)}
          initialTab={dispatchTab}
          invoice={formattedSelectedInvoice}
        />
      )}
    </div>
  );
}
