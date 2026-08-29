import { getTenantHeaders, safeFetch } from '@/lib/auth';
import { SuperAdminClient } from './SuperAdminClient';

export const dynamic = 'force-dynamic';

export default async function SuperAdminPage() {
  const headers = await getTenantHeaders();
  const tenants = await safeFetch(
    'http://localhost:3021/tenants',
    {
      headers,
      cache: 'no-store',
    },
    []
  );

  return <SuperAdminClient initialTenants={tenants} />;
}
