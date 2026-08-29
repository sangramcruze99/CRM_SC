import { getTenantHeaders, safeFetch } from '@/lib/auth';
import { SubscriptionsClient } from './SubscriptionsClient';

export const dynamic = 'force-dynamic';

export default async function SubscriptionsPage() {
  const headers = await getTenantHeaders();
  const subscriptions = await safeFetch(
    'http://localhost:3015/subscriptions',
    {
      headers,
      cache: 'no-store',
    },
    []
  );

  return <SubscriptionsClient initialSubscriptions={subscriptions} />;
}
