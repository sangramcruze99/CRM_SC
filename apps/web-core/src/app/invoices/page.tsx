import { getTenantHeaders, safeFetch } from "../../lib/auth";
import { CommercialInvoicesManager, InvoiceItem } from "../../components/billing/CommercialInvoicesManager";

export const dynamic = 'force-dynamic';

export default async function InvoicesPage() {
  const headers = await getTenantHeaders();
  const fetchedInvoices = await safeFetch<InvoiceItem[]>(
    "http://localhost:3015/invoices",
    { headers, cache: 'no-store' },
    []
  );

  const invoices = Array.isArray(fetchedInvoices) ? fetchedInvoices : [];

  return <CommercialInvoicesManager initialInvoices={invoices} />;
}
