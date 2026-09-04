import { getTenantHeaders, safeFetch } from "@/lib/auth";
import Link from "next/link";
import {
  Briefcase,
  DollarSign,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  TrendingUp,
  FileText,
  Activity
} from "lucide-react";
import { updateDealStage, deleteDeal } from "@/app/actions";
import { DeleteActionButton } from "@/components/DeleteActionButton";

export const dynamic = 'force-dynamic';

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const headers = await getTenantHeaders();

  const deal = await safeFetch<any>(
    `http://localhost:3005/deals/${id}`,
    { headers, cache: 'no-store' },
    null
  );

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

  const STAGES = ['Lead', 'Meeting Scheduled', 'Proposal', 'Contract Negotiation', 'Closed Won'];
  const currentStageIndex = STAGES.indexOf(deal.stage);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-white pb-12">
      {/* Back Link */}
      <Link href="/deals" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors">
        <ArrowLeft size={14} /> Back to Deals Pipeline
      </Link>

      {/* Main Opportunity Header */}
      <div className="botanical-glass-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl shadow-emerald-500/30 border border-emerald-300/30 shrink-0">
            <Briefcase size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-black text-white tracking-tight">{deal.title}</h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {deal.stage}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <Building2 size={13} className="text-emerald-400" />
              <span>{deal.company?.name || deal.account || 'Enterprise Strategic Account'}</span>
              <span>•</span>
              <span>Ref ID: <strong className="font-mono text-slate-300">{deal.id}</strong></span>
            </p>
          </div>
        </div>

        {/* Valuation Badge */}
        <div className="sm:text-right space-y-1">
          <span className="text-[11px] text-slate-400 font-medium block">Total Contract Value</span>
          <div className="text-3xl font-black font-mono text-emerald-400 tracking-tight">
            ${Number(deal.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Stage Progression Stepper */}
      <div className="botanical-glass-card p-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Activity size={15} className="text-emerald-400" />
          <span>Pipeline Progression Lifecycle</span>
        </h3>

        <div className="grid grid-cols-5 gap-2 pt-2">
          {STAGES.map((stg, idx) => {
            const isCompleted = idx <= currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <div
                key={stg}
                className={`p-3 rounded-2xl border text-center space-y-1 transition-all ${
                  isCurrent
                    ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-500/30 text-white'
                    : isCompleted
                    ? 'bg-white/[0.06] border-emerald-500/30 text-emerald-300'
                    : 'bg-white/[0.02] border-white/10 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  {isCompleted ? (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  ) : (
                    <Clock size={16} className="text-slate-500" />
                  )}
                </div>
                <span className="text-xs font-bold block truncate">{stg}</span>
                <span className="text-[9px] font-mono text-slate-400 block">Step {idx + 1} of 5</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details & Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="botanical-glass-card p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Opportunity Specifications</h3>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="botanical-glass-inset p-3 space-y-1">
                <span className="text-[10px] text-slate-400 font-medium block">Account Entity</span>
                <span className="font-bold text-white block">{deal.company?.name || deal.account || 'Enterprise Partner'}</span>
              </div>
              <div className="botanical-glass-inset p-3 space-y-1">
                <span className="text-[10px] text-slate-400 font-medium block">Lead Origin</span>
                <span className="font-bold text-emerald-300 block">Direct Inbound Pipeline</span>
              </div>
              <div className="botanical-glass-inset p-3 space-y-1">
                <span className="text-[10px] text-slate-400 font-medium block">Expected Settlement</span>
                <span className="font-bold text-white block font-mono">Q3 Enterprise Close</span>
              </div>
              <div className="botanical-glass-inset p-3 space-y-1">
                <span className="text-[10px] text-slate-400 font-medium block">Compliance Tier</span>
                <span className="font-bold text-teal-300 block">SOC-2 Type II Certified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="botanical-glass-card p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Quick Actions</h3>
            
            <div className="space-y-2.5">
              <Link href="/invoices" className="w-full btn-primary px-4 py-2.5 text-xs text-center block font-bold">
                Generate Invoice Proposal
              </Link>
              <Link href="/banking" className="w-full btn-secondary px-4 py-2.5 text-xs text-center block font-bold">
                View Dual Khata Ledger
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
