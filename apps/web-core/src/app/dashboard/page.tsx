import { DashboardClient } from './DashboardClient';
import { getTenantHeaders, safeFetch } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const headers = await getTenantHeaders();

  // Parallel fetch from all active microservices
  const [contacts, deals, invoices, projects, tickets] = await Promise.all([
    safeFetch<any[]>('http://localhost:3001/contacts', { headers, cache: 'no-store' }, []),
    safeFetch<any[]>('http://localhost:3005/deals', { headers, cache: 'no-store' }, []),
    safeFetch<any[]>('http://localhost:3015/invoices', { headers, cache: 'no-store' }, []),
    safeFetch<any[]>('http://localhost:3017/projects', { headers, cache: 'no-store' }, []),
    safeFetch<any[]>('http://localhost:3016/tickets', { headers, cache: 'no-store' }, []),
  ]);

  // Dynamic live aggregations
  const totalDealsValue = deals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const closedWonValue = deals
    .filter((d) => d.stage === 'Closed Won')
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const totalInvoicedValue = invoices.reduce((sum, inv) => sum + (Number(inv.amount || inv.total) || 0), 0);

  const totalBalance = closedWonValue + totalInvoicedValue;
  const grossEarnings = totalDealsValue + totalInvoicedValue;
  const estimatedExpenses = Math.round(grossEarnings * 0.08);

  // Compile real activity timeline from deals and invoices
  const recentActivities: any[] = [
    ...deals.map((d) => ({
      id: `deal-${d.id}`,
      title: d.title || 'Deal Opportunity',
      type: 'DEAL',
      stage: d.stage || 'Lead',
      amount: Number(d.amount) || 0,
      date: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Today',
      href: `/deals/${d.id}`,
    })),
    ...invoices.map((inv) => ({
      id: `inv-${inv.id}`,
      title: inv.clientName ? `Invoice: ${inv.clientName}` : `Commercial Invoice #${inv.id?.slice(0, 6) || ''}`,
      type: 'INVOICE',
      stage: inv.status || 'Issued',
      amount: Number(inv.amount || inv.total) || 0,
      date: inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : 'Today',
      href: `/invoices`,
    })),
  ].sort((a, b) => (b.amount || 0) - (a.amount || 0));

  const initialData = {
    contacts,
    deals,
    invoices,
    projects,
    tickets,
    metrics: {
      totalBalance,
      grossEarnings,
      monthlyExpenses: estimatedExpenses,
      totalDealsValue,
      closedWonValue,
      totalInvoicedValue,
      contactsCount: contacts.length,
      dealsCount: deals.length,
      invoicesCount: invoices.length,
      projectsCount: projects.length,
      ticketsCount: tickets.length,
    },
    recentActivities,
  };

  return <DashboardClient initialData={initialData} />;
}
