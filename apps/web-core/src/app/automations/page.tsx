import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

/**
 * Canonical Route Consolidation:
 * Redirects legacy /automations to the authoritative /automation/workflows destination.
 */
export default function AutomationsPage() {
  redirect('/automation/workflows');
}
