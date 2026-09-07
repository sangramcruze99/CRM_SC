import { getTenantHeaders, safeFetch } from '@/lib/auth';
import { BillingClient } from './BillingClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Billing & Subscriptions | Business OS',
  description: 'Manage SaaS subscription, usage quotas, entitlements, and Stripe billing.',
};

export default async function BillingSettingsPage() {
  const headers = await getTenantHeaders();

  const [plans, entitlements, usageData, invoices] = await Promise.all([
    safeFetch(
      'http://localhost:3027/billing/plan',
      { headers, cache: 'no-store' },
      [],
    ),
    safeFetch(
      'http://localhost:3027/billing/entitlements',
      { headers, cache: 'no-store' },
      null,
    ),
    safeFetch(
      'http://localhost:3027/billing/usage',
      { headers, cache: 'no-store' },
      null,
    ),
    safeFetch(
      'http://localhost:3027/billing/invoices',
      { headers, cache: 'no-store' },
      [],
    ),
  ]);

  return (
    <BillingClient
      initialPlans={plans}
      initialEntitlements={entitlements}
      initialUsage={usageData}
      initialInvoices={invoices}
    />
  );
}
