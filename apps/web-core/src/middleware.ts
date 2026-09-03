import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const isDev = process.env.NODE_ENV !== 'production';

  // In production, require token for non-public routes
  if (!isDev && !token && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/_next') && !request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Set the tenant ID header based on the JWT token for all requests (UI or API)
  const response = NextResponse.next();
  const tenantId = 'default-tenant';
  
  if (token) {
    try {
      const payloadBase64 = token.split('.')[1];
      if (payloadBase64) {
        const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
        const payload = JSON.parse(payloadJson);
        if (payload.tenantId) {
          response.headers.set('x-tenant-id', payload.tenantId);
          response.headers.set('Authorization', `Bearer ${token}`);
          
          const requestHeaders = new Headers(request.headers);
          requestHeaders.set('x-tenant-id', payload.tenantId);
          requestHeaders.set('Authorization', `Bearer ${token}`);
          
          return NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
        }
      }
    } catch (e) {
      console.error('Error extracting tenant from JWT in middleware', e);
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-id', tenantId);
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
