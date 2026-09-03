import { getTenantHeaders, safeFetch } from "../lib/auth";
import { Filter, Download, Mail, Phone, Building, Users, Sparkles } from "lucide-react";
import { CreateContactModal } from "../components/CreateContactModal";
import { DeleteActionButton } from "../components/DeleteActionButton";
import { deleteContact } from "./actions";
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const demoContacts: any[] = [];

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

  const contacts = fetchedContacts || [];

  return (
    <div className="h-full flex flex-col space-y-6 max-w-7xl mx-auto text-white">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Users className="text-emerald-400" size={24} />
            Contacts & Client Accounts
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage leads, commercial stakeholders, and account relationships.</p>
        </div>
        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
          <Link
            href="/migration"
            className="px-3.5 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition-all border border-white/[0.1] flex items-center space-x-1.5 cursor-pointer"
          >
            <Sparkles size={14} className="text-emerald-400" />
            <span>Migrate from Another CRM</span>
          </Link>
          <Link
            href="/lead-prospector"
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-xs font-bold text-slate-950 rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center space-x-1.5 active:scale-[0.98]"
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
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center text-xs font-bold shadow-2xs">
                        {contact.firstName?.[0]}{contact.lastName?.[0]}
                      </div>
                      <div>
                        <span className="font-bold text-white group-hover:text-emerald-400 transition-colors block text-sm">
                          {contact.firstName} {contact.lastName}
                        </span>
                        <div className="text-[11px] text-slate-500 font-mono">{contact.id}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    <div className="flex items-center space-x-2">
                      <Building size={15} className="text-emerald-400 flex-shrink-0" />
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
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/contacts/${contact.id}`}
                        className="px-3.5 py-1.5 bg-white/[0.06] hover:bg-emerald-500 hover:text-slate-950 text-slate-300 rounded-xl text-xs font-bold transition-all border border-white/[0.1] inline-block shadow-2xs cursor-pointer"
                      >
                        Profile & Khata →
                      </Link>
                      <DeleteActionButton
                        onDeleteAction={async () => {
                          'use server';
                          await deleteContact(contact.id);
                        }}
                        confirmTitle={`Delete contact "${contact.firstName} ${contact.lastName}"?`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {contacts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-xs font-medium">
                    No contacts created yet. Click <span className="text-emerald-400 font-bold">"Add Contact"</span> above to add your first client record.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
