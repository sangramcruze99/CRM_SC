import { NextRequest, NextResponse } from 'next/server';

// Map of prefixes to internal microservice URLs
const serviceMap: Record<string, string> = {
  'crm': 'http://localhost:3001',
  'sales': 'http://localhost:3005',
  'platform': 'http://localhost:3008',
  'custom-objects': 'http://localhost:3008',
  'automation': 'http://localhost:3009',
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
};

export async function processRequest(req: NextRequest, { params }: { params: Promise<{ route: string[] }> }) {
  const resolvedParams = await params;
  const servicePrefix = resolvedParams.route[0];
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
  } else if (servicePrefix === 'ai' && remainingPath === 'ask') {
    backendPath = 'prompts/ask';
  }
  
  const targetUrl = `${targetBase}/${backendPath}${req.nextUrl.search}`;

  // Extract tenantId from headers or extract directly from JWT cookie/bearer
  let tenantId = req.headers.get('x-tenant-id');
  const authHeader = req.headers.get('authorization');
  const token = req.cookies.get('access_token')?.value || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined);

  if (!tenantId && token) {
    try {
      const payloadBase64 = token.split('.')[1];
      if (payloadBase64) {
        const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
        const payload = JSON.parse(payloadJson);
        if (payload.tenantId) {
          tenantId = payload.tenantId;
        }
      }
    } catch {
      // ignore token parse error
    }
  }

  // Fallback to default tenant if not in production
  if (!tenantId && process.env.NODE_ENV !== 'production') {
    tenantId = 'default-tenant';
  }

  const isPublicCms = servicePrefix === 'cms' && remainingPath.startsWith('pages/public');
  
  if (!tenantId && servicePrefix !== 'auth' && !isPublicCms) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const newHeaders = new Headers();
  // Copy content type
  if (req.headers.get('content-type')) {
    newHeaders.set('content-type', req.headers.get('content-type')!);
  }
  // Inject secured headers
  if (tenantId) {
    newHeaders.set('x-tenant-id', tenantId);
  }
  if (authHeader) {
    newHeaders.set('authorization', authHeader);
  } else if (token) {
    newHeaders.set('authorization', `Bearer ${token}`);
  }

  try {
    const fetchOptions: RequestInit = {
      method: req.method,
      headers: newHeaders,
    };
    
    // Only pass body for non-GET/HEAD
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const body = await req.text();
      if (body) {
        fetchOptions.body = body;
      }
    }

    const res = await fetch(targetUrl, fetchOptions);
    
    // Pass back the response
    const resBody = await res.text();
    const resHeaders = new Headers(res.headers);
    // Don't forward transfer-encoding
    resHeaders.delete('transfer-encoding');
    
    // Intercept login/register to set HttpOnly cookie
    if (backendPath === 'auth/login' || backendPath === 'auth/register') {
      if (res.status === 200 || res.status === 201) {
        try {
          const data = JSON.parse(resBody);
          if (data.access_token) {
            resHeaders.set('Set-Cookie', `access_token=${data.access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`);
          }
        } catch (e) {
          console.error('Failed to parse auth response', e);
        }
      }
    }
    
    return new NextResponse(resBody, {
      status: res.status,
      headers: resHeaders,
    });
  } catch (error) {
    console.error('API Gateway proxy error:', error);
    return NextResponse.json({ error: 'Internal Gateway Error' }, { status: 500 });
  }
}

export const GET = processRequest;
export const POST = processRequest;
export const PUT = processRequest;
export const DELETE = processRequest;
export const PATCH = processRequest;
