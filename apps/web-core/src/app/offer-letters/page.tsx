import { getTenantHeaders, safeFetch } from '@/lib/auth';
import { OfferLettersClient } from './OfferLettersClient';

export const dynamic = 'force-dynamic';

export default async function OfferLettersPage() {
  const headers = await getTenantHeaders();
  const items = await safeFetch(
    'http://localhost:3018/offer-letters',
    {
      headers,
      cache: 'no-store',
    },
    []
  );

  return <OfferLettersClient initialOffers={items} />;
}
