import { getTenantHeaders } from "../../../../lib/auth";
import Link from "next/link";
import { ObjectClient } from "./ObjectClient";

export const dynamic = 'force-dynamic';

async function getCustomObject(id: string) {
  try {
    const res = await fetch(`http://localhost:3008/custom-objects/${id}`, {
      headers: await getTenantHeaders(),
      cache: 'no-store'
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching custom object:", error);
    return null;
  }
}

async function getCustomRecords(id: string) {
  try {
    const res = await fetch(`http://localhost:3008/custom-objects/${id}/records`, {
      headers: await getTenantHeaders(),
      cache: 'no-store'
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Error fetching records:", error);
    return [];
  }
}

export default async function CustomObjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await params;
  const [obj, records] = await Promise.all([
    getCustomObject(p.id),
    getCustomRecords(p.id)
  ]);

  if (!obj) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <h2 className="text-xl font-medium text-slate-800">Object Not Found</h2>
        <Link href="/platform/schema" className="text-indigo-600 hover:text-indigo-500">
          Return to Schema Builder
        </Link>
      </div>
    );
  }

  return <ObjectClient customObject={obj} initialRecords={records} />;
}
