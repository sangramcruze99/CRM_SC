import { CustomerSuccessClient } from './CustomerSuccessClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'AI Customer Success Department — Business OS',
  description: 'Autonomous retention operations combining Athena Sentinel, proactive churn diagnosis, root-cause interventions, and EBR dossiers.',
};

export default function CustomerSuccessPage() {
  return <CustomerSuccessClient />;
}
