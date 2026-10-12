import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const isDev = process.env.NODE_ENV !== 'production';

  // Extract or generate unique distributed correlation ID
  const correlationId = request.headers.get('x-correlation-id') || crypto.randomUUID();

  // In production, require token for non-public routes
  if (
    !isDev &&
    !token &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/_next') &&
    !request.nextUrl.pathname.startsWith('/api') &&
    !request.nextUrl.pathname.startsWith('/healthz') &&
    !request.nextUrl.pathname.startsWith('/readyz')
  ) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const incomingTenantId = request.headers.get('x-tenant-id');
  let tenantId = incomingTenantId || 'default-tenant';

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-correlation-id', correlationId);

  if (token) {
    try {
      const payloadBase64 = token.split('.')[1];
      if (payloadBase64) {
        const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
        const payload = JSON.parse(payloadJson);
        if (payload.tenantId) {
          tenantId = payload.tenantId;
          requestHeaders.set('Authorization', `Bearer ${token}`);
        }
      }
    } catch (e) {
      console.error('Error extracting tenant from JWT in middleware', e);
    }
  }

  requestHeaders.set('x-tenant-id', tenantId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Echo correlation ID and tenant ID to client response headers
  response.headers.set('x-correlation-id', correlationId);
  response.headers.set('x-tenant-id', tenantId);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
