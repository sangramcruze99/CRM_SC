import { FinanceDepartmentClient } from './FinanceDepartmentClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'AI Finance Department — Business OS',
  description:
    'Autonomous accounts receivable command center powered by Midas AR Sentinel, Collections Copilot, and Dual Khata Anomaly Auditor.',
};

export default function FinanceDepartmentPage() {
  return <FinanceDepartmentClient />;
}
