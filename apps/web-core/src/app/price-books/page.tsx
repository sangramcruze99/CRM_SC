import { getTenantHeaders, safeFetch } from '@/lib/auth';
import { PriceBooksClient } from './PriceBooksClient';

export const dynamic = 'force-dynamic';

export default async function PriceBooksPage() {
  const headers = await getTenantHeaders();
  const items = await safeFetch(
    'http://localhost:3015/price-books',
    {
      headers,
      cache: 'no-store',
    },
    []
  );

  return <PriceBooksClient initialPriceBooks={items} />;
}
