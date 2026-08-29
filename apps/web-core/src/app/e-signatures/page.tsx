import { getTenantHeaders, safeFetch } from '@/lib/auth';
import { ESignaturesClient } from './ESignaturesClient';

export const dynamic = 'force-dynamic';

export default async function ESignaturesPage() {
  const headers = await getTenantHeaders();
  const items = await safeFetch(
    'http://localhost:3020/e-signatures',
    {
      headers,
      cache: 'no-store',
    },
    []
  );

  return <ESignaturesClient initialEnvelopes={items} />;
}
