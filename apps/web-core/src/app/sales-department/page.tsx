import { SalesDepartmentClient } from './SalesDepartmentClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'AI Sales Department — Business OS',
  description: 'Autonomous B2B revenue intelligence department combining Lead SDR, Ares Sentinel, RAG Playbooks, and CRM Pipeline Execution.',
};

export default function SalesDepartmentPage() {
  return <SalesDepartmentClient />;
}
