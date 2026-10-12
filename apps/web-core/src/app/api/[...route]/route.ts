import { NextRequest, NextResponse } from 'next/server';
import { verifyInternalToken, signInternalToken } from '@/lib/auth';
import { revokeSessionWebCore } from '@/lib/sessionRevocation';

// Map of prefixes to internal microservice URLs
const serviceMap: Record<string, string> = {
  'crm': 'http://localhost:3001',
  'sales': 'http://localhost:3005',
  'platform': 'http://localhost:3008',
  'custom-objects': 'http://localhost:3008',
  'automation': 'http://localhost:3009',
  'intent': 'http://localhost:3009',
  'ai': 'http://localhost:3010',
  'auth': 'http://localhost:3011',
  'marketplace': 'http://localhost:3012',
  'bi': 'http://localhost:3013',
  'chat': 'http://localhost:3014',
  'finance': 'http://localhost:3015',
  'helpdesk': 'http://localhost:3016',
  'projects': 'http://localhost:3017',
  'hr': 'http://localhost:3018',
  'search': 'http://localhost:3019',
  'documents': 'http://localhost:3020',
  'admin': 'http://localhost:3021',
  'developer': 'http://localhost:3022',
  'audit': 'http://localhost:3023',
  'cms': 'http://localhost:3024',
  'settings': 'http://localhost:3025',
  'inventory': 'http://localhost:3026',
  'billing': 'http://localhost:3027',
  'gateway': 'http://localhost:3000',
  'notifications': 'http://localhost:3028',
  'portal': 'http://localhost:3029',
  'python-ai': 'http://localhost:3030',
  'storage': 'http://localhost:3031',
  'events': 'http://localhost:3032',
};

function isPublicRoute(servicePrefix: string, remainingPath: string): boolean {
  if (servicePrefix === 'auth') {
    return ['login', 'register'].includes(remainingPath);
  }
  if (servicePrefix === 'cms') {
    return remainingPath.startsWith('pages/public');
  }
  if (servicePrefix === 'billing') {
    return remainingPath === 'stripe/webhook' || remainingPath === 'webhook';
  }
  if (servicePrefix === 'gateway') {
    return ['health', 'routes', 'gateway/routes'].includes(remainingPath);
  }
  return false;
}

export async function processRequest(req: NextRequest, { params }: { params: Promise<{ route: string[] }> }) {
  const resolvedParams = await params;
  const servicePrefix = resolvedParams.route[0];

  if (servicePrefix === 'ocr') {
    const { POST: handleOcrPost, GET: handleOcrGet } = await import('../ocr/route');
    if (req.method === 'POST') {
      return handleOcrPost(req);
    }
    return handleOcrGet(req);
  }

  const targetBase = serviceMap[servicePrefix];
  if (!targetBase) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  }

  const remainingPath = resolvedParams.route.slice(1).join('/');

  let backendPath = remainingPath;
  if (servicePrefix === 'custom-objects') {
    backendPath = `custom-objects${remainingPath ? '/' + remainingPath : ''}`;
  } else if (servicePrefix === 'chat') {
    backendPath = `chat/${remainingPath}`;
  } else if (servicePrefix === 'search') {
    backendPath = `search/${remainingPath}`;
  } else if (servicePrefix === 'auth') {
    if (['login', 'register', 'me'].includes(remainingPath)) {
      backendPath = `auth/${remainingPath}`;
    } else {
      backendPath = remainingPath;
    }
  } else if (servicePrefix === 'hr') {
    if (remainingPath.startsWith('employees')) {
      backendPath = `hr/${remainingPath}`;
    } else {
      backendPath = remainingPath;
    }
  } else if (servicePrefix === 'settings') {
    if (remainingPath === 'workspace' || remainingPath.startsWith('workspace/')) {
      backendPath = `settings/${remainingPath}`;
    } else {
      backendPath = remainingPath;
    }
  } else if (servicePrefix === 'billing') {
    backendPath = `billing${remainingPath ? '/' + remainingPath : ''}`;
  } else if (servicePrefix === 'intent') {
    backendPath = `intent${remainingPath ? '/' + remainingPath : ''}`;
  } else if (servicePrefix === 'automation') {
    if (
      remainingPath.startsWith('approvals') ||
      remainingPath.startsWith('workflows') ||
      remainingPath.startsWith('screening-profiles') ||
      remainingPath.startsWith('templates') ||
      remainingPath.startsWith('intent')
    ) {
      backendPath = remainingPath;
    } else {
      backendPath = `workflows/${remainingPath}`;
    }
  } else if (servicePrefix === 'ai' && remainingPath === 'ask') {
    backendPath = 'prompts/ask';
  }

  const targetUrl = `${targetBase}/${backendPath}${req.nextUrl.search}`;

  // Authentication extraction
  const cookieToken = req.cookies.get('access_token')?.value;
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
  const token = cookieToken || bearerToken;

  const apiKeyHeader = req.headers.get('x-api-key') || req.headers.get('x-service-key');
  const configuredApiKey = process.env.API_KEY || process.env.SYSTEM_API_KEY;
  const hasValidApiKey = Boolean(configuredApiKey && apiKeyHeader && apiKeyHeader === configuredApiKey);

  const isPublic = isPublicRoute(servicePrefix, remainingPath);

  let verifiedTenantId: string | null = null;
  let verifiedUser: any = null;

  if (token) {
    const verified = verifyInternalToken(token);
    if (verified) {
      verifiedTenantId = verified.tenantId || 'default-tenant';
      verifiedUser = verified;
    } else if (!isPublic) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or expired access token' },
        { status: 401 }
      );
    }
  } else if (hasValidApiKey) {
    verifiedTenantId = req.headers.get('x-tenant-id') || 'default-tenant';
    verifiedUser = {
      sub: 'system-api-key',
      email: 'system@crm.internal',
      role: 'ADMIN',
      tenantId: verifiedTenantId,
    };
  }

  // Reject unauthenticated requests to protected endpoints
  if (!isPublic && !verifiedUser) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required to access Business OS APIs' },
      { status: 401 }
    );
  }

  // CSRF Protection for Cookie-Authenticated Mutations
  const isMutatingMethod = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method);
  const isCookieAuth = Boolean(cookieToken && !bearerToken && !hasValidApiKey);

  if (isCookieAuth && isMutatingMethod && !isPublic) {
    // 1. Sec-Fetch-Site check: reject cross-site requests
    const secFetchSite = req.headers.get('sec-fetch-site');
    if (secFetchSite === 'cross-site') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'CSRF violation: Cross-site request rejected for cookie-authenticated session' },
        { status: 403 }
      );
    }

    // 2. Origin & Referer verification against host
    const originHeader = req.headers.get('origin');
    const refererHeader = req.headers.get('referer');
    const hostHeader = req.headers.get('host') || req.nextUrl.host;

    if (originHeader) {
      try {
        const originUrl = new URL(originHeader);
        if (originUrl.host !== hostHeader) {
          return NextResponse.json(
            { error: 'Forbidden', message: 'CSRF violation: Request origin does not match target host' },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: 'Forbidden', message: 'CSRF violation: Malformed origin header' },
          { status: 403 }
        );
      }
    } else if (refererHeader) {
      try {
        const refererUrl = new URL(refererHeader);
        if (refererUrl.host !== hostHeader) {
          return NextResponse.json(
            { error: 'Forbidden', message: 'CSRF violation: Request referer does not match target host' },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: 'Forbidden', message: 'CSRF violation: Malformed referer header' },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Forbidden', message: 'CSRF violation: Missing Origin/Referer headers for cookie mutation' },
        { status: 403 }
      );
    }
  }

  // Tenant Boundary Enforcement & IDOR/BOLA Protection
  const requestedTenantId = req.headers.get('x-tenant-id');
  let effectiveTenantId = verifiedTenantId || 'default-tenant';

  if (requestedTenantId && verifiedUser && verifiedUser.role !== 'SUPERADMIN' && requestedTenantId !== verifiedTenantId) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Cross-tenant access forbidden: requested tenant does not match verified session' },
      { status: 403 }
    );
  }

  if (requestedTenantId && verifiedUser?.role === 'SUPERADMIN') {
    effectiveTenantId = requestedTenantId;
  }

  const newHeaders = new Headers();
  if (req.headers.get('content-type')) {
    newHeaders.set('content-type', req.headers.get('content-type')!);
  }
  newHeaders.set('x-tenant-id', effectiveTenantId);

  if (token) {
    newHeaders.set('authorization', `Bearer ${token}`);
  } else if (hasValidApiKey && apiKeyHeader) {
    newHeaders.set('x-api-key', apiKeyHeader);
  }

  if (verifiedUser) {
    newHeaders.set('x-user-id', verifiedUser.sub || verifiedUser.id || 'system');
    if (verifiedUser.email) newHeaders.set('x-user-email', verifiedUser.email);
    if (verifiedUser.role) newHeaders.set('x-user-role', verifiedUser.role);
  }

  try {
    const fetchOptions: RequestInit = {
      method: req.method,
      headers: newHeaders,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const body = await req.text();
      if (body) {
        fetchOptions.body = body;
      }
    }

    const res = await fetch(targetUrl, fetchOptions);
    const resBody = await res.text();
    const resHeaders = new Headers(res.headers);
    resHeaders.delete('transfer-encoding');

    // Dual-Mode Cookie & Token Handling for Auth responses
    if (backendPath === 'auth/login' || backendPath === 'auth/register') {
      if (res.status === 200 || res.status === 201) {
        try {
          const data = JSON.parse(resBody);
          if (data.access_token) {
            const isProd = process.env.NODE_ENV === 'production';
            const secureFlag = isProd ? '; Secure' : '';
            resHeaders.set(
              'Set-Cookie',
              `access_token=${data.access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secureFlag}`
            );
          }
        } catch {
          // ignore parsing error
        }
      }
    } else if (backendPath === 'auth/logout' || remainingPath === 'logout') {
      try {
        const tokenToRevoke =
          req.cookies.get('access_token')?.value ||
          req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
        if (tokenToRevoke) {
          const verified = verifyInternalToken(tokenToRevoke);
          const sessionIdentifier = verified?.jti || tokenToRevoke;
          let ttlSeconds = 604800;
          if (verified?.exp) {
            ttlSeconds = Math.max(verified.exp - Math.floor(Date.now() / 1000), 60);
          }
          await revokeSessionWebCore(sessionIdentifier, ttlSeconds);
        }
      } catch (e: any) {
        console.warn('[LOGOUT WARN] Session revocation notice:', e.message);
      }

      resHeaders.set(
        'Set-Cookie',
        'access_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
      );
    }

    return new NextResponse(resBody, {
      status: res.status,
      headers: resHeaders,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Bad Gateway',
        message: `Upstream microservice '${servicePrefix}' (${targetBase}) is unavailable or failed to respond.`,
        service: servicePrefix,
        timestamp: new Date().toISOString(),
      },
      { status: 502 }
    );
  }
}

export const GET = processRequest;
export const POST = processRequest;
export const PUT = processRequest;
export const DELETE = processRequest;
export const PATCH = processRequest;
