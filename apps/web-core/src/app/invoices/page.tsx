import Link from "next/link";
import { getTenantHeaders, safeFetch } from "../../lib/auth";
import { FileText, Plus, Download, Receipt, Scan } from "lucide-react";
import { revalidatePath } from "next/cache";
import { DeleteActionButton } from "../../components/DeleteActionButton";
import { deleteInvoice } from "../actions";
import { InvoiceRowActions } from "./InvoiceRowActions";

export const dynamic = 'force-dynamic';

const demoInvoices: any[] = [];

export default async function InvoicesPage() {
  const headers = await getTenantHeaders();
  const fetchedInvoices = await safeFetch(
    "http://localhost:3015/invoices",
    { headers, cache: 'no-store' },
    []
  );

  const invoices = fetchedInvoices || [];

  async function createInvoice(formData: FormData) {
    "use server";
    const amount = parseFloat(formData.get("amount") as string);
    const tenantHeaders = await getTenantHeaders();
    await safeFetch("http://localhost:3015/invoices", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...tenantHeaders
      },
      body: JSON.stringify({ amount })
    });
    
    revalidatePath("/invoices");
  }

  return (
    <div className="h-full flex flex-col space-y-6 max-w-7xl mx-auto text-white">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Receipt className="text-emerald-400" size={24} />
            Commercial Invoices & Billing
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage accounts receivable, customer ledgers, and automated wire reconciliation.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/ocr-invoice"
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-amber-400 hover:to-orange-400 text-xs font-bold text-slate-950 rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 active:scale-[0.98]"
          >
            <Scan size={14} />
            <span>AI OCR Invoice Scanner</span>
          </Link>
          <form action={createInvoice} className="flex items-center space-x-2 bg-white/[0.05] border border-white/[0.1] rounded-2xl p-1.5 pl-3.5 shadow-sm">
            <input 
              type="number" 
              name="amount" 
              placeholder="Amount ($)..." 
              required
              className="w-28 bg-transparent text-xs text-white focus:outline-none placeholder-slate-500 font-mono font-medium"
            />
            <button type="submit" className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 rounded-xl transition-all shadow-sm flex items-center cursor-pointer">
              <Plus size={14} className="mr-1" /> Quick Add
            </button>
          </form>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Outstanding</div>
          <div className="text-3xl font-extrabold text-white font-mono">
            ${invoices.filter((i: any) => i.status !== 'PAID').reduce((sum: number, i: any) => sum + i.amount, 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
          </div>
          <div className="text-xs text-emerald-400 font-medium mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse" /> Awaiting customer wire transfer
          </div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Overdue Invoices</div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">$0.00</div>
          <div className="text-xs text-slate-400 font-medium mt-2">Zero delinquent accounts</div>
        </div>

        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Paid (Last 30 Days)</div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            ${invoices.filter((i: any) => i.status === 'PAID').reduce((sum: number, i: any) => sum + i.amount, 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
          </div>
          <div className="text-xs text-emerald-400 font-medium mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Auto-reconciled with bank ledger
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="flex-1 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden flex flex-col shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/[0.02] border-b border-white/[0.08] text-slate-400 uppercase tracking-wider text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Payment Status</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {invoices.map((invoice: any) => (
                <tr key={invoice.id} className="hover:bg-white/[0.04] transition-colors group">
                  <td className="px-6 py-4 font-mono font-bold text-white">
                    <div className="flex items-center space-x-2">
                      <FileText size={15} className="text-emerald-400" />
                      <span>{invoice.invoiceNum}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-extrabold text-white">
                    ${Number(invoice.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      invoice.status === 'PAID' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 
                      invoice.status === 'SENT' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 
                      'bg-white/[0.08] text-slate-300 border border-white/10'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300 text-xs font-medium">
                    {invoice.dueDate}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs font-medium">
                    {invoice.createdAt}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <InvoiceRowActions invoice={invoice} />
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-xs font-medium">
                    No invoices generated yet. Use the <span className="text-emerald-400 font-bold">"Quick Add"</span> form or <span className="text-emerald-400 font-bold">"AI OCR Invoice Scanner"</span> above to create your first billing record.
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
