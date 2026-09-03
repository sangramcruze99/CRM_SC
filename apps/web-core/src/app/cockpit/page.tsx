import { BotanicalGlassCockpit } from '@/components/dashboard/BotanicalGlassCockpit';
import { getTenantHeaders, safeFetch } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function CockpitPage() {
  const headers = await getTenantHeaders();

  const [deals, invoices] = await Promise.all([
    safeFetch<any[]>('http://localhost:3005/deals', { headers, cache: 'no-store' }, []),
    safeFetch<any[]>('http://localhost:3015/invoices', { headers, cache: 'no-store' }, []),
  ]);

  const totalDealsValue = deals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const closedWonValue = deals
    .filter((d) => d.stage === 'Closed Won')
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const totalInvoicedValue = invoices.reduce((sum, inv) => sum + (Number(inv.amount || inv.total) || 0), 0);

  const metrics = {
    totalBalance: closedWonValue + totalInvoicedValue,
    grossEarnings: totalDealsValue + totalInvoicedValue,
    monthlyExpenses: Math.round((totalDealsValue + totalInvoicedValue) * 0.08),
    totalDealsValue,
    closedWonValue,
    totalInvoicedValue,
    dealsCount: deals.length,
    invoicesCount: invoices.length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <BotanicalGlassCockpit metrics={metrics} />
    </div>
  );
}
