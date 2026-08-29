import { getTenantHeaders, safeFetch } from '@/lib/auth';
import { SearchIndexClient } from './SearchIndexClient';

export const dynamic = 'force-dynamic';

export default async function SearchIndexPage() {
  const headers = await getTenantHeaders();
  const items = await safeFetch(
    'http://localhost:3019/search-index',
    {
      headers,
      cache: 'no-store',
    },
    []
  );

  return <SearchIndexClient initialRecords={items} />;
}
