import { getTenantHeaders, safeFetch } from "../../lib/auth";
import { getContactsFromStore } from "../../lib/nicheStorage";
import { Users, Sparkles } from "lucide-react";
import { CreateContactModal } from "../../components/CreateContactModal";
import { ImportSpreadsheetButton } from "../../components/ImportSpreadsheetButton";
import { DynamicContactsDataGrid } from "../../components/DynamicContactsDataGrid";
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ContactsPage() {
  const headers = await getTenantHeaders();
  const fetchedContacts = await safeFetch<any[]>(
    'http://localhost:3001/contacts',
    {
      headers,
      cache: 'no-store',
    },
    []
  );

  let contacts = fetchedContacts || [];
  if (contacts.length === 0) {
    const local = getContactsFromStore();
    if (local.length > 0) {
      contacts = local;
    }
  }

  return (
    <div className="h-full flex flex-col space-y-6 max-w-7xl mx-auto text-white">
      {/* 1. TOP EXECUTIVE COCKPIT HEADER CHASSIS */}
      <div className="botanical-glass-card p-5 sm:p-6 rounded-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-slate-950 flex items-center justify-center text-xl font-bold shadow-lg shadow-emerald-500/20 border border-emerald-300/30 shrink-0">
              <Users size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-black text-white tracking-tight">
                  Contacts &amp; Client Accounts
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  REAL-TIME SYNC
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/[0.06] text-slate-300 border border-white/10">
                  {contacts.length} Records
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Manage commercial stakeholders, verified corporate leads, and automated ingestion feeds powered by the Ares Sentinel.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/migration"
              className="px-3.5 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition-all border border-white/10 flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              <Sparkles size={14} className="text-emerald-400" />
              <span>CRM Migration</span>
            </Link>
            <Link
              href="/lead-prospector"
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <Sparkles size={14} />
              <span>Apollo / Zoom Prospector</span>
            </Link>
            <ImportSpreadsheetButton />
            <CreateContactModal />
          </div>
        </div>

        {/* Sentinel Automated Pulse Strip */}
        <div className="pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-2.5 py-1 rounded-lg bg-black/40 border border-emerald-500/30 flex items-center gap-2 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white">Ares</span>
              <span className="text-[10px] text-slate-400">Revenue Lead Hunter</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
              vault/inbound/crm_leads/
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1.5">
            <Sparkles size={11} />
            <span>Autonomous Ingestion Pipeline Active</span>
          </span>
        </div>
      </div>

      {/* 2. COCKPIT TELEMETRY METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="botanical-glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">Total Directory Records</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Users size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            {contacts.length} <span className="text-sm font-sans font-normal text-slate-400">contacts</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/[0.06] text-[11px]">
            <span className="text-slate-400">Direct Workspace CRM</span>
            <span className="text-emerald-400 font-mono font-bold">100% Synced</span>
          </div>
        </div>

        <div className="botanical-glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">Verified B2B Lead Engine</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
            275M+ <span className="text-sm font-sans font-normal text-slate-400">pool</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/[0.06] text-[11px]">
            <span className="text-slate-400">Apollo / Zoom Integration</span>
            <Link href="/lead-prospector" className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors">
              <span>Query Pool</span>
              <span className="text-xs">&rarr;</span>
            </Link>
          </div>
        </div>

        <div className="botanical-glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">CRM Migration Stream</span>
            <div className="w-7 h-7 rounded-lg bg-white/[0.08] border border-white/10 flex items-center justify-center text-slate-300">
              <Sparkles size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            HubSpot / SF
          </div>
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/[0.06] text-[11px]">
            <span className="text-slate-400">CSV &amp; Direct API</span>
            <Link href="/migration" className="text-slate-300 hover:text-white font-bold flex items-center gap-1 transition-colors">
              <span>Import Batches</span>
              <span className="text-xs">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. DYNAMIC DATA GRID */}
      <div className="botanical-glass-card rounded-2xl overflow-hidden border border-white/[0.08]">
        <DynamicContactsDataGrid contacts={contacts} />
      </div>
    </div>
  );
}
