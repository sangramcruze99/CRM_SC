import { getTenantHeaders, safeFetch } from "../lib/auth";
import { Filter, Download, Mail, Phone, Building, Users, Sparkles } from "lucide-react";
import { CreateContactModal } from "../components/CreateContactModal";
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const demoContacts = [
  {
    id: 'cnt_01',
    firstName: 'Sarah',
    lastName: 'Connor',
    email: 'sarah.connor@cyberdyne.io',
    phone: '+1 (555) 019-2834',
    company: { name: 'Cyberdyne Systems Corp' },
  },
  {
    id: 'cnt_02',
    firstName: 'Alex',
    lastName: 'Vance',
    email: 'alex.vance@blackmesa.org',
    phone: '+1 (555) 342-8911',
    company: { name: 'Black Mesa Research' },
  },
  {
    id: 'cnt_03',
    firstName: 'David',
    lastName: 'Ross',
    email: 'd.ross@hyperscale.ai',
    phone: '+1 (555) 782-9021',
    company: { name: 'HyperScale AI Labs' },
  },
  {
    id: 'cnt_04',
    firstName: 'Elena',
    lastName: 'Rostova',
    email: 'elena.rostova@vanguard.tech',
    phone: '+1 (555) 431-7782',
    company: { name: 'Vanguard Security Systems' },
  },
];

export default async function ContactsPage() {
  const headers = await getTenantHeaders();
  const fetchedContacts = await safeFetch(
    'http://localhost:3001/contacts',
    {
      headers,
      cache: 'no-store',
    },
    []
  );

  const contacts = fetchedContacts.length > 0 ? fetchedContacts : demoContacts;

  return (
    <div className="h-full flex flex-col space-y-6 max-w-7xl mx-auto text-white">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Users className="text-amber-400" size={24} />
            Contacts & Client Accounts
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage leads, commercial stakeholders, and account relationships.</p>
        </div>
        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
          <Link
            href="/migration"
            className="px-3.5 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition-all border border-white/[0.1] flex items-center space-x-1.5 cursor-pointer"
          >
            <Sparkles size={14} className="text-amber-400" />
            <span>Migrate from Another CRM</span>
          </Link>
          <Link
            href="/lead-prospector"
            className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-xs font-bold text-slate-950 rounded-xl transition-all shadow-lg shadow-orange-500/25 flex items-center space-x-1.5 active:scale-[0.98]"
          >
            <Sparkles size={14} />
            <span>⚡ Import from Apollo / ZoomInfo</span>
          </Link>
          <button className="px-3.5 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition-all shadow-xs border border-white/[0.1] flex items-center space-x-1.5 cursor-pointer">
            <Filter size={14} className="text-slate-400" />
            <span>Filter</span>
          </button>
          <button className="px-3.5 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition-all shadow-xs border border-white/[0.1] flex items-center space-x-1.5 cursor-pointer">
            <Download size={14} className="text-slate-400" />
            <span>Export CSV</span>
          </button>
          <CreateContactModal />
        </div>
      </div>

      {/* Data Grid Card */}
      <div className="flex-1 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden flex flex-col shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/[0.02] border-b border-white/[0.08] text-slate-400 uppercase tracking-wider text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Client Name</th>
                <th className="px-6 py-4">Company Account</th>
                <th className="px-6 py-4">Contact Coordinates</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {contacts.map((contact: any) => (
                <tr key={contact.id} className="hover:bg-white/[0.04] transition-colors group">
                  <td className="px-6 py-4">
                    <Link href={`/contacts/${contact.id}`} className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xs font-bold shadow-2xs">
                        {contact.firstName?.[0]}{contact.lastName?.[0]}
                      </div>
                      <div>
                        <span className="font-bold text-white group-hover:text-amber-400 transition-colors block text-sm">
                          {contact.firstName} {contact.lastName}
                        </span>
                        <div className="text-[11px] text-slate-500 font-mono">{contact.id}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    <div className="flex items-center space-x-2">
                      <Building size={15} className="text-amber-400 flex-shrink-0" />
                      <span className="font-medium text-xs text-white">{contact.company?.name || 'Enterprise Account'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2 text-slate-300">
                        <Mail size={13} className="text-slate-500" />
                        <span className="text-xs">{contact.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-400">
                        <Phone size={13} className="text-slate-500" />
                        <span className="text-xs">{contact.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/contacts/${contact.id}`}
                      className="px-3.5 py-1.5 bg-white/[0.06] hover:bg-amber-500 hover:text-slate-950 text-slate-300 rounded-xl text-xs font-bold transition-all border border-white/[0.1] inline-block shadow-2xs cursor-pointer"
                    >
                      Profile & Khata →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
