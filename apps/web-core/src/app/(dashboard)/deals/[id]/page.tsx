import { getTenantHeaders, safeFetch } from "../../../../lib/auth";
import { ActivityTimeline } from "../../../../components/crm/ActivityTimeline";
import { DollarSign, Building2, User, ArrowLeft, Calendar, Tag } from "lucide-react";
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const fallbackDeal = {
  id: 'deal_01',
  title: 'Enterprise Business OS Expansion Deal',
  amount: 145000,
  stage: 'Proposal',
  createdAt: new Date().toISOString(),
  company: { name: 'Acme Corporation' },
  contact: { firstName: 'Sarah', lastName: 'Connor' },
};

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await params;
  const headers = await getTenantHeaders();
  const deal = await safeFetch(
    `http://localhost:3005/deals/${p.id}`,
    { headers, cache: 'no-store' },
    fallbackDeal
  );

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Back link */}
      <div>
        <Link href="/deals" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1">
          <ArrowLeft size={14} />
          <span>Back to Deals Pipeline</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1">
        {/* Left Column: Deal Info */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {deal.title}
              </h1>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-emerald-600 font-extrabold text-xl font-mono">${Number(deal.amount).toLocaleString()}</span>
                <span className="text-slate-300">•</span>
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-xs font-bold px-2.5 py-0.5 rounded-full">{deal.stage}</span>
              </div>
            </div>

            <div className="space-y-3.5 pt-4 border-t border-slate-100 font-medium">
              <div className="flex items-center space-x-3 text-xs text-slate-700">
                <Building2 size={15} className="text-slate-400" />
                <span>{deal.company?.name || 'Acme Global Holdings'}</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-700">
                <User size={15} className="text-slate-400" />
                <span>{deal.contact ? `${deal.contact.firstName} ${deal.contact.lastName}` : 'Primary Account Executive'}</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-700">
                <Calendar size={15} className="text-slate-400" />
                <span>Created {new Date(deal.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Activity Timeline */}
        <div className="xl:col-span-2">
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-6 shadow-sm h-full flex flex-col">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Deal Activity & Audit Trail</h2>
            <ActivityTimeline entityType="deal" entityId={deal.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
