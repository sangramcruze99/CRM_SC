import { cookies } from 'next/headers';

export async function getTenantHeaders() {
  let token: string | undefined;
  let tenantId = 'default-tenant';

  try {
    const cookieStore = await cookies();
    token = cookieStore.get('access_token')?.value;

    if (token) {
      const payloadBase64 = token.split('.')[1];
      if (payloadBase64) {
        const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
        const payload = JSON.parse(payloadJson);
        if (payload.tenantId) {
          tenantId = payload.tenantId;
        }
      }
    }
  } catch {
    // ignore cookie reading errors
  }

  return {
    'x-tenant-id': tenantId,
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

export async function safeFetch<T = any>(
  url: string,
  options?: RequestInit,
  fallback: T = [] as any,
  timeoutMs = 400
): Promise<T> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));

    if (!res.ok) {
      return fallback;
    }
    return (await res.json()) as T;
  } catch {
    // Silently return fallback without logging to avoid Next.js dev overlay triggers
    return fallback;
  }
}
