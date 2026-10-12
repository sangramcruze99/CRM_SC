import { cookies } from 'next/headers';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-business-os-key';

export interface VerifiedJwtPayload {
  sub?: string;
  email?: string;
  tenantId?: string;
  role?: string;
  iat?: number;
  exp?: number;
  [key: string]: any;
}

export function signInternalToken(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyInternalToken(token?: string): VerifiedJwtPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts;

  try {
    const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf8'));
    if (header.alg !== 'HS256') {
      return null;
    }

    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${headerB64}.${payloadB64}`).digest('base64url');

    const expectedBuf = Buffer.from(expectedSig);
    const actualBuf = Buffer.from(signatureB64);

    if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
      return null;
    }

    const payload: VerifiedJwtPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));

    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function getTenantHeaders() {
  let token: string | undefined;
  let tenantId = 'default-tenant';

  try {
    const cookieStore = await cookies();
    token = cookieStore.get('access_token')?.value;

    if (token) {
      const verified = verifyInternalToken(token);
      if (verified && verified.tenantId) {
        tenantId = verified.tenantId;
      }
    }
  } catch {
    // ignore cookie reading errors
  }

  const headers: Record<string, string> = {
    'x-tenant-id': tenantId,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export async function safeFetch<T = any>(
  url: string,
  options?: RequestInit,
  fallback: T = [] as any,
  timeoutMs = 5000
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
    return fallback;
  }
}
