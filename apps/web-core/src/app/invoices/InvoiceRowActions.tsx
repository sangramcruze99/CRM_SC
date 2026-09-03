'use client';

import React, { useState } from 'react';
import { Mail, Printer, Download } from 'lucide-react';
import { InvoiceDispatchModal } from '@/components/billing/InvoiceDispatchModal';
import { DeleteActionButton } from '@/components/DeleteActionButton';
import { deleteInvoice } from '../actions';

interface InvoiceRowActionsProps {
  invoice: {
    id: string;
    invoiceNum?: string;
    amount: number;
    status?: string;
    dueDate?: string;
    createdAt?: string;
    clientName?: string;
    clientEmail?: string;
    vendorName?: string;
    items?: any[];
  };
}

export function InvoiceRowActions({ invoice }: InvoiceRowActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'receipt'>('email');

  const formattedInvoice = {
    invoiceNumber: invoice.invoiceNum || `INV-${invoice.id.slice(0, 8)}`,
    vendorName: invoice.vendorName || 'Apex Global Enterprise Solutions',
    vendorEmail: 'billing@apexglobal.io',
    vendorAddress: '100 Montgomery St, Suite 1400, San Francisco, CA',
    vendorTaxId: 'US-EIN-94-3829104',
    clientName: invoice.clientName || 'Enterprise Client',
    clientEmail: invoice.clientEmail || 'accounts.payable@client.com',
    issueDate: invoice.createdAt || new Date().toISOString().split('T')[0],
    dueDate: invoice.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    currency: '$',
    taxRate: 8.5,
    discount: 0,
    items: invoice.items && invoice.items.length > 0 ? invoice.items : [
      {
        description: 'Enterprise Platform Subscription & Cloud License',
        quantity: 1,
        unitPrice: Number(invoice.amount) || 0,
        total: Number(invoice.amount) || 0,
      }
    ],
    subtotal: Number(invoice.amount) || 0,
    taxAmount: ((Number(invoice.amount) || 0) * 0.085),
    grandTotal: (Number(invoice.amount) || 0) * 1.085,
  };

  return (
    <>
      <div className="flex items-center justify-end space-x-1.5">
        <button
          type="button"
          onClick={() => {
            setActiveTab('email');
            setIsModalOpen(true);
          }}
          className="px-2.5 py-1 bg-white/[0.06] hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 rounded-xl text-xs font-semibold transition-all border border-white/[0.1] inline-flex items-center gap-1 cursor-pointer"
          title="Send invoice via email"
        >
          <Mail size={12} className="text-emerald-400" />
          <span>Email</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('receipt');
            setIsModalOpen(true);
          }}
          className="px-2.5 py-1 bg-white/[0.06] hover:bg-teal-500/20 text-slate-300 hover:text-teal-300 rounded-xl text-xs font-semibold transition-all border border-white/[0.1] inline-flex items-center gap-1 cursor-pointer"
          title="Print physical thermal receipt or A4 invoice"
        >
          <Printer size={12} className="text-teal-400" />
          <span>Receipt</span>
        </button>

        <DeleteActionButton
          onDeleteAction={async () => {
            await deleteInvoice(invoice.id);
          }}
          confirmTitle={`Delete invoice "${invoice.invoiceNum || invoice.id}"?`}
        />
      </div>

      <InvoiceDispatchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTab={activeTab}
        invoice={formattedInvoice}
      />
    </>
  );
}
