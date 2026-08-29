import { getTenantHeaders, safeFetch } from '@/lib/auth';
import { PaymentLinksClient } from './PaymentLinksClient';

export const dynamic = 'force-dynamic';

export default async function PaymentLinksPage() {
  const headers = await getTenantHeaders();
  const items = await safeFetch(
    'http://localhost:3015/payment-links',
    {
      headers,
      cache: 'no-store',
    },
    []
  );

  return <PaymentLinksClient initialLinks={items} />;
}
