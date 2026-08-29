import { getTenantHeaders, safeFetch } from '@/lib/auth';
import { SlasClient } from './SlasClient';

export const dynamic = 'force-dynamic';

export default async function SlasPage() {
  const headers = await getTenantHeaders();
  const items = await safeFetch(
    'http://localhost:3016/slas',
    {
      headers,
      cache: 'no-store',
    },
    []
  );

  return <SlasClient initialSlas={items} />;
}
