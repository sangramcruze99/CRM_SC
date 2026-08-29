import { getTenantHeaders, safeFetch } from "../../lib/auth";
import { DeveloperClient } from "./DeveloperClient";

export default async function DeveloperPage() {
  const headers = await getTenantHeaders();
  const [initialApiKeys, initialWebhooks] = await Promise.all([
    safeFetch('http://localhost:3022/api-keys', { cache: "no-store", headers }, []),
    safeFetch('http://localhost:3022/webhooks', { cache: "no-store", headers }, [])
  ]);

  return (
    <DeveloperClient initialApiKeys={initialApiKeys} initialWebhooks={initialWebhooks} />
  );
}
