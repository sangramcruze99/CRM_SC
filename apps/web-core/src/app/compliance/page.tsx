import { getTenantHeaders, safeFetch } from '@/lib/auth';
import { ComplianceClient } from './ComplianceClient';

export const dynamic = 'force-dynamic';

export default async function CompliancePage() {
  const headers = await getTenantHeaders();
  const items = await safeFetch(
    'http://localhost:3023/compliance',
    {
      headers,
      cache: 'no-store',
    },
    []
  );

  return <ComplianceClient initialAudits={items} />;
}
