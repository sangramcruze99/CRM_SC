import { getTenantHeaders, safeFetch } from "../../lib/auth";
import { Briefcase } from "lucide-react";
import { CreateDealModal } from "../../components/CreateDealModal";
import { DeleteActionButton } from "../../components/DeleteActionButton";
import { deleteDeal } from "../actions";
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const demoDeals: any[] = [];

export default async function DealsPage() {
  const headers = await getTenantHeaders();
  const fetchedDeals = await safeFetch(
    'http://localhost:3005/deals',
    {
      headers,
      cache: 'no-store'
    },
    []
  );

  const deals = fetchedDeals || [];

  const stages = [
    { title: "Lead", color: "border-slate-500/40 text-slate-300 bg-white/[0.06]" },
    { title: "Meeting Scheduled", color: "border-sky-500/40 text-sky-300 bg-sky-500/10" },
    { title: "Proposal", color: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10" },
    { title: "Closed Won", color: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10" },
  ];

  const columns = stages.map(stage => ({
    ...stage,
    items: deals.filter((d: any) => d.stage === stage.title)
  }));

  return (
    <div className="h-full flex flex-col space-y-6 max-w-7xl mx-auto text-white">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Briefcase className="text-emerald-400" size={24} />
            Deals & Opportunities Pipeline
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage pipeline velocity, probability forecasts, and active negotiations.</p>
        </div>
        <CreateDealModal />
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {columns.map((col, i) => (
          <div key={i} className="flex-shrink-0 w-80 flex flex-col">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${col.color}`}>
                {col.title}
              </span>
              <span className="text-xs font-mono font-bold bg-white/[0.08] text-slate-300 px-2 py-0.5 rounded-full border border-white/10 shadow-2xs">
                {col.items.length}
              </span>
            </div>
            
            <div className="flex-1 flex flex-col gap-3 min-h-[140px] bg-white/[0.04] backdrop-blur-2xl rounded-3xl p-3 border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
              {col.items.map((item: any) => (
                <div key={item.id} className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4.5 hover:border-emerald-500/40 hover:bg-white/[0.07] transition-all shadow-xs group">
                  <div className="flex justify-between items-start mb-1.5 gap-2">
                    <Link href={`/deals/${item.id}`} className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors flex-1">
                      {item.title}
                    </Link>
                    <DeleteActionButton
                      onDeleteAction={async () => {
                        'use server';
                        await deleteDeal(item.id);
                      }}
                      confirmTitle={`Delete opportunity "${item.title}"?`}
                    />
                  </div>
                  <div className="text-xs text-slate-400 mb-3 font-medium">{item.company?.name || 'Enterprise Account'}</div>
                  <div className="flex justify-between items-center pt-2.5 border-t border-white/[0.06]">
                    <span className="text-sm font-mono font-extrabold text-emerald-400">
                      ${Number(item.amount).toLocaleString()}
                    </span>
                    <Link href={`/deals/${item.id}`} className="text-xs text-slate-400 group-hover:text-emerald-400 font-semibold transition-colors">
                      Overview →
                    </Link>
                  </div>
                </div>
              ))}
              {col.items.length === 0 && (
                <div className="flex-1 border border-dashed border-white/10 rounded-2xl flex items-center justify-center p-4 text-xs font-medium text-slate-500">
                  No opportunities in this stage
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
