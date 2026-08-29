import { getTenantHeaders, safeFetch } from '@/lib/auth';
import { QuotesClient } from './QuotesClient';

export const dynamic = 'force-dynamic';

export default async function QuotesPage() {
  const headers = await getTenantHeaders();
  const items = await safeFetch(
    'http://localhost:3015/quotes',
    {
      headers,
      cache: 'no-store',
    },
    []
  );

  return <QuotesClient initialQuotes={items} />;
}
