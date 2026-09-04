import { getTenantHeaders, safeFetch } from "../../lib/auth";
import { DealsKanbanBoard } from "../../components/deals/DealsKanbanBoard";

export const dynamic = 'force-dynamic';

export default async function DealsPage() {
  const headers = await getTenantHeaders();
  const fetchedDeals = await safeFetch(
    'http://localhost:3005/deals',
    {
      headers,
      cache: 'no-store'
    },
    []
  );

  const deals = Array.isArray(fetchedDeals) ? fetchedDeals : [];

  return <DealsKanbanBoard initialDeals={deals} />;
}
