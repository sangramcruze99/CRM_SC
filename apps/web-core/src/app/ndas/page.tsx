import { getTenantHeaders, safeFetch } from '@/lib/auth';
import { NdasClient } from './NdasClient';

export const dynamic = 'force-dynamic';

export default async function NdasPage() {
  const headers = await getTenantHeaders();
  const items = await safeFetch(
    'http://localhost:3018/ndas',
    {
      headers,
      cache: 'no-store',
    },
    []
  );

  return <NdasClient initialNdas={items} />;
}
