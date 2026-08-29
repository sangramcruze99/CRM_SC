import { getTenantHeaders, safeFetch } from '@/lib/auth';
import { TaxesClient } from './TaxesClient';

export const dynamic = 'force-dynamic';

export default async function TaxesPage() {
  const headers = await getTenantHeaders();
  const items = await safeFetch(
    'http://localhost:3025/taxes',
    {
      headers,
      cache: 'no-store',
    },
    []
  );

  return <TaxesClient initialTaxes={items} />;
}
