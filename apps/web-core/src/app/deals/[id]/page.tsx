import { getTenantHeaders, safeFetch } from "@/lib/auth";
import Link from "next/link";
import { Briefcase, ArrowLeft } from "lucide-react";
import { DealDetailClient } from "./DealDetailClient";

export const dynamic = 'force-dynamic';

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const headers = await getTenantHeaders();

  const [deal, dealDocuments, activities] = await Promise.all([
    safeFetch<any>(
      `http://localhost:3005/deals/${id}`,
      { headers, cache: 'no-store' },
      null
    ),
    safeFetch<any[]>(
      `http://localhost:3020/documents?entityId=${id}&service=crm`,
      { headers, cache: 'no-store' },
      []
    ),
    safeFetch<any[]>(
      `http://localhost:3001/activities?dealId=${id}`,
      { headers, cache: 'no-store' },
      []
    ),
  ]);

  if (!deal) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 text-white pt-8">
        <Link href="/deals" className="text-xs text-emerald-400 hover:underline flex items-center gap-1.5">
          <ArrowLeft size={14} /> Back to Pipeline
        </Link>
        <div className="botanical-glass-card p-8 text-center space-y-3">
          <Briefcase size={36} className="text-slate-500 mx-auto opacity-50" />
          <h2 className="text-lg font-bold">Opportunity Not Found</h2>
          <p className="text-xs text-slate-400">The opportunity record #{id} may have been moved or removed.</p>
          <Link href="/deals" className="btn-primary inline-flex items-center px-4 py-2 text-xs">
            Return to Pipeline
          </Link>
        </div>
      </div>
    );
  }

  let linkedContact = null;
  if (deal.contactId) {
    linkedContact = await safeFetch<any>(
      `http://localhost:3001/contacts/${deal.contactId}`,
      { headers, cache: 'no-store' },
      null
    );
  }

  return (
    <DealDetailClient
      initialDeal={deal}
      initialDocuments={Array.isArray(dealDocuments) ? dealDocuments : []}
      linkedContact={linkedContact}
      initialActivities={Array.isArray(activities) ? activities : []}
    />
  );
}


