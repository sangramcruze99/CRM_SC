import { getTenantHeaders, safeFetch } from '@/lib/auth';
import { OnboardingClient } from './OnboardingClient';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const headers = await getTenantHeaders();
  const items = await safeFetch(
    'http://localhost:3018/onboarding',
    {
      headers,
      cache: 'no-store',
    },
    []
  );

  return <OnboardingClient initialCandidates={items} />;
}
