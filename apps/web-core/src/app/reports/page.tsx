import { getTenantHeaders, safeFetch } from '@/lib/auth';
import { ReportsClient } from './ReportsClient';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const headers = await getTenantHeaders();
  const reports = await safeFetch(
    'http://localhost:3013/reports',
    {
      headers,
      cache: 'no-store',
    },
    []
  );

  return <ReportsClient initialReports={reports} />;
}
