import { getTenantHeaders, safeFetch } from "../../../../lib/auth";
import { ActivityTimeline } from "../../../../components/crm/ActivityTimeline";
import { Building2, Mail, Phone, ArrowLeft, Wallet } from "lucide-react";
import Link from 'next/link';
import { WhatsAppButton } from "../../../../components/crm/WhatsAppButton";

export const dynamic = 'force-dynamic';

const fallbackContact = {
  id: 'cnt_01',
  firstName: 'Sarah',
  lastName: 'Connor',
  email: 'sarah.connor@cyberdyne.io',
  phone: '+1 (555) 019-2834',
  company: { name: 'Cyberdyne Systems Corp' },
};

const fallbackKhata = {
  balance: 4500,
  dueSince: '2026-08-15',
  status: 'PENDING'
};

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await params;
  const headers = await getTenantHeaders();
  
  const contact = await safeFetch(
    `http://localhost:3001/contacts/${p.id}`,
    { headers, cache: 'no-store' },
    fallbackContact
  );

  const khata = await safeFetch(
    `http://localhost:3015/khata/balance/${p.id}`,
    { headers, cache: 'no-store' },
    fallbackKhata
  );

  return (
    <div className="h-full flex flex-col space-y-6 max-w-7xl mx-auto text-white">
      {/* Back link */}
      <div>
        <Link href="/" className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center space-x-1 transition-colors">
          <ArrowLeft size={14} />
          <span>Back to Contacts</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1">
        {/* Left Column: Contact Info & Ledger */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-slate-950 flex items-center justify-center text-2xl font-bold shadow-lg shadow-orange-500/25">
                {contact.firstName?.[0] || 'C'}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  {contact.firstName} {contact.lastName}
                </h1>
                <p className="text-amber-400 text-xs font-semibold mt-0.5">Primary Enterprise Lead</p>
              </div>
            </div>

            <div className="space-y-3.5 pt-4 border-t border-white/[0.08] font-medium">
              <div className="flex items-center space-x-3 text-xs text-slate-300">
                <Mail size={15} className="text-slate-500" />
                <span>{contact.email || 'sarah.connor@cyberdyne.io'}</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-300">
                <Phone size={15} className="text-slate-500" />
                <span>{contact.phone || '+1 (555) 019-2834'}</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-300">
                <Building2 size={15} className="text-slate-500" />
                <span>{contact.company?.name || 'Cyberdyne Systems Corp'}</span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-white/[0.08]">
              <WhatsAppButton contactId={contact.id} phone={contact.phone} />
            </div>
          </div>

          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white flex items-center"><Wallet size={16} className="text-amber-400 mr-2" /> Ledger Balance (Khata)</h2>
            </div>
            <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
              <div className="text-xs text-slate-400 font-medium mb-1">Current Ledger Outstanding</div>
              <div className={`text-2xl font-extrabold font-mono ${khata.balance < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {khata.balance < 0 ? '-' : ''}${Math.abs(khata.balance).toFixed(2)}
              </div>
              {khata.dueSince && (
                <p className="text-[11px] text-slate-500 mt-2 font-medium">Due since: {new Date(khata.dueSince).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Activity Timeline */}
        <div className="xl:col-span-2">
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden p-6 h-full shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex flex-col">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Universal Timeline & Interactions</h2>
            <p className="text-xs text-slate-400 mb-6 font-medium">Merged realtime stream of notes, calls, WhatsApp pings, and Khata ledger reconciliation.</p>
            <ActivityTimeline entityType="contact" entityId={contact.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
