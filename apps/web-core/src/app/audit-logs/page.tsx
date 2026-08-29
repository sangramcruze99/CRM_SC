import { getTenantHeaders, safeFetch } from "../../lib/auth";
import { AuditLogsClient } from "./AuditLogsClient";

export default async function AuditLogsPage() {
  const initialLogs = await safeFetch(
    'http://localhost:3023/logs',
    { cache: "no-store", headers: await getTenantHeaders() },
    []
  );

  return (
    <AuditLogsClient initialLogs={initialLogs} />
  );
}
