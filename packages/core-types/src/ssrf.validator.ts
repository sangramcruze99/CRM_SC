import * as dns from 'dns';
import * as net from 'net';

/**
 * Checks whether an IP address belongs to loopback, private, link-local,
 * cloud metadata (169.254.169.254), or reserved ranges.
 */
export function isPrivateOrInternalIp(ip: string): boolean {
  if (!ip) return true;

  // Handle IPv4-mapped IPv6 addresses (e.g., ::ffff:127.0.0.1 or ::ffff:169.254.169.254)
  if (ip.toLowerCase().startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  // IPv6 checks
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === '::1' || lower === '0000:0000:0000:0000:0000:0000:0000:0001') return true; // Loopback
    if (lower.startsWith('fe80:') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) return true; // Link-local
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // Unique local
    if (lower === '::' || lower === '0000:0000:0000:0000:0000:0000:0000:0000') return true; // Unspecified
    return false;
  }

  // IPv4 checks
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map((p) => parseInt(p, 10));
    if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
      return true;
    }

    const [b0, b1] = parts;

    // 0.0.0.0/8 (Current network)
    if (b0 === 0) return true;

    // 127.0.0.0/8 (Loopback)
    if (b0 === 127) return true;

    // 10.0.0.0/8 (Private-Use)
    if (b0 === 10) return true;

    // 172.16.0.0/12 (Private-Use: 172.16.0.0 - 172.31.255.255)
    if (b0 === 172 && b1 >= 16 && b1 <= 31) return true;

    // 192.168.0.0/16 (Private-Use)
    if (b0 === 192 && b1 === 168) return true;

    // 169.254.0.0/16 (Link-Local / AWS/GCP/Azure Metadata Endpoint: 169.254.169.254)
    if (b0 === 169 && b1 === 254) return true;

    // 100.64.0.0/10 (Shared Address Space / CGNAT)
    if (b0 === 100 && b1 >= 64 && b1 <= 127) return true;

    // 192.0.0.0/24, 192.0.2.0/24 (Documentation / Protocol Assignments)
    if (b0 === 192 && b1 === 0) return true;

    // 198.51.100.0/24, 203.0.113.0/24 (Documentation)
    if (b0 === 198 && b1 === 51) return true;
    if (b0 === 203 && b1 === 0) return true;

    // 224.0.0.0/4 (Multicast)
    if (b0 >= 224 && b0 <= 239) return true;

    // 240.0.0.0/4 (Reserved)
    if (b0 >= 240) return true;

    return false;
  }

  return true;
}

export interface SsrfValidationResult {
  isValid: boolean;
  reason?: string;
  resolvedIp?: string;
}

/**
 * Validates a URL against SSRF vulnerabilities:
 * - Only http: and https: protocols allowed
 * - Disallows loopback hostnames (localhost, internal domains)
 * - Resolves DNS and verifies all resolved IP addresses are public
 * - Blocks cloud metadata endpoints (169.254.169.254)
 */
export async function validateSafeUrl(
  urlString: string,
  options?: { allowLocalInTest?: boolean }
): Promise<SsrfValidationResult> {
  if (!urlString || typeof urlString !== 'string') {
    return { isValid: false, reason: 'URL must be a non-empty string' };
  }

  let parsed: URL;
  try {
    parsed = new URL(urlString.trim());
  } catch {
    return { isValid: false, reason: 'Malformed URL format' };
  }

  // 1. Protocol allowlist
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      isValid: false,
      reason: `Prohibited URL protocol "${parsed.protocol}". Only HTTP and HTTPS are permitted.`,
    };
  }

  // 2. Prohibited internal / loopback hostnames
  const hostname = parsed.hostname.toLowerCase().trim();
  const blockedHostnames = [
    'localhost',
    'localhost.localdomain',
    'ip6-localhost',
    'ip6-loopback',
    'metadata.google.internal',
    'metadata.internal',
    'instance-data',
  ];

  if (blockedHostnames.includes(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    if (options?.allowLocalInTest && process.env.NODE_ENV === 'test') {
      return { isValid: true, resolvedIp: '127.0.0.1' };
    }
    return {
      isValid: false,
      reason: `Access to internal host "${hostname}" is prohibited (SSRF prevention).`,
    };
  }

  // If hostname is directly an IP literal
  if (net.isIP(hostname)) {
    if (isPrivateOrInternalIp(hostname)) {
      if (options?.allowLocalInTest && process.env.NODE_ENV === 'test') {
        return { isValid: true, resolvedIp: hostname };
      }
      return {
        isValid: false,
        reason: `Target IP ${hostname} is a restricted private/internal address (SSRF prevention).`,
      };
    }
    return { isValid: true, resolvedIp: hostname };
  }

  // 3. DNS Resolution to prevent DNS Rebinding / IP-literal domains
  try {
    const addresses = await dns.promises.lookup(hostname, { all: true });
    if (!addresses || addresses.length === 0) {
      return { isValid: false, reason: `Could not resolve hostname "${hostname}"` };
    }

    for (const record of addresses) {
      if (isPrivateOrInternalIp(record.address)) {
        if (options?.allowLocalInTest && process.env.NODE_ENV === 'test') {
          return { isValid: true, resolvedIp: record.address };
        }
        return {
          isValid: false,
          reason: `Hostname "${hostname}" resolved to restricted internal IP ${record.address} (SSRF prevention).`,
          resolvedIp: record.address,
        };
      }
    }

    return { isValid: true, resolvedIp: addresses[0]?.address };
  } catch (err: any) {
    return {
      isValid: false,
      reason: `DNS lookup failed for "${hostname}": ${err.message}`,
    };
  }
}

/**
 * SSRF-safe wrapper for outbound fetch requests.
 */
export async function safeFetchSsrf(
  urlString: string,
  init?: RequestInit,
  options?: { timeoutMs?: number; allowLocalInTest?: boolean }
): Promise<Response> {
  const validation = await validateSafeUrl(urlString, options);
  if (!validation.isValid) {
    throw new Error(`SSRF Blocked: ${validation.reason}`);
  }

  const timeoutMs = options?.timeoutMs || 5000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(urlString, {
      ...init,
      signal: controller.signal,
      redirect: 'error', // Prevent SSRF bypass via redirect to loopback/metadata
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}
