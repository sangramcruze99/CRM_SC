import { getTenantHeaders, safeFetch } from "../../../lib/auth";
import { SchemaBuilderClient } from "./SchemaBuilderClient";

export default async function SchemaPage() {
  const customObjects = await safeFetch('http://localhost:3008/custom-objects', {
    headers: await getTenantHeaders(),
    cache: 'no-store'
  }, []);

  return (
    <div className="flex flex-col h-full space-y-6 max-w-7xl mx-auto text-white">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Schema Builder</h1>
        <p className="text-sm text-slate-400">Visually build and manage custom database objects and fields.</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <SchemaBuilderClient initialObjects={customObjects} />
      </div>
    </div>
  );
}
