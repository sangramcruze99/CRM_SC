import { getTenantHeaders, safeFetch } from '@/lib/auth';
import { LocalizationClient } from './LocalizationClient';

export const dynamic = 'force-dynamic';

export default async function LocalizationPage() {
  const headers = await getTenantHeaders();
  const items = await safeFetch(
    'http://localhost:3025/localization',
    {
      headers,
      cache: 'no-store',
    },
    []
  );

  return <LocalizationClient initialLocales={items} />;
}
