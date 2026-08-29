import { getTenantHeaders, safeFetch } from "../../../lib/auth";
import { Database } from "lucide-react";
import Link from "next/link";
import { CreateCustomObjectModal } from "../../../components/platform/CreateCustomObjectModal";

export const dynamic = 'force-dynamic';

const demoObjects = [
  { id: 'obj_01', name: 'Software Licenses', apiName: 'software_licenses', description: 'Tracks software seat allocation, activation keys, and machine hashes.', fields: [{ id: 'f1' }, { id: 'f2' }, { id: 'f3' }] },
  { id: 'obj_02', name: 'Equipment Assets', apiName: 'equipment_assets', description: 'Tracks hardware laptops, serial numbers, and employee assignments.', fields: [{ id: 'f1' }, { id: 'f2' }] },
  { id: 'obj_03', name: 'Legal Agreements', apiName: 'legal_agreements', description: 'Enterprise master service agreements and security exhibits.', fields: [{ id: 'f1' }, { id: 'f2' }, { id: 'f3' }, { id: 'f4' }] },
];

export default async function PlatformObjectsPage() {
  const headers = await getTenantHeaders();
  const fetchedObjects = await safeFetch(
    'http://localhost:3008/custom-objects',
    { headers, cache: 'no-store' },
    []
  );

  const objects = fetchedObjects.length > 0 ? fetchedObjects : demoObjects;

  return (
    <div className="h-full flex flex-col space-y-6 max-w-7xl mx-auto text-white">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Database className="text-amber-400" size={24} />
            Schema Builder & Dynamic Entities
          </h1>
          <p className="text-sm text-slate-400 mt-1">Design relational database models, custom fields, and automated audit rules.</p>
        </div>
        <CreateCustomObjectModal />
      </div>

      {/* Content */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-white/[0.02] border-b border-white/[0.08] font-semibold">
              <tr>
                <th className="px-6 py-4 font-semibold">Object Entity Name</th>
                <th className="px-6 py-4 font-semibold">API Slug Identifier</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">Schema Fields</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {objects.map((obj: any) => (
                <tr key={obj.id} className="hover:bg-white/[0.04] transition-colors group">
                  <td className="px-6 py-4">
                    <Link href={`/platform/objects/${obj.id}`} className="font-bold text-white group-hover:text-amber-400 transition-colors text-sm">
                      {obj.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs bg-amber-500/15 px-2.5 py-1 rounded-xl border border-amber-500/30 text-amber-300 font-bold">
                      {obj.apiName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300 text-xs font-medium">{obj.description || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-mono font-bold bg-white/[0.06] text-slate-300 rounded-full border border-white/10">
                      {obj.fields?.length || 0} fields
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/platform/objects/${obj.id}`} className="px-3.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-white/[0.1] inline-block shadow-2xs">
                      Manage Records →
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
