const http = require('http');

// Generate a valid mock JWT with tenantId and role
const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
const payload = Buffer.from(JSON.stringify({ 
  sub: 'user_123', 
  email: 'admin@gmail.com', 
  role: 'SUPERADMIN', 
  tenantId: 'default-tenant' 
})).toString('base64');
const mockJwt = `${header}.${payload}.mockSignature`;

const routes = [
  '/',
  '/login',
  '/dashboard',
  '/invoices',
  '/deals',
  '/projects',
  '/tickets',
  '/customization',
  '/subscriptions',
  '/quotes',
  '/price-books',
  '/payment-links',
  '/e-signatures',
  '/compliance',
  '/developer',
  '/super-admin',
  '/reports',
  '/slas',
  '/taxes',
  '/directory',
  '/marketplace',
  '/social',
  '/email-marketing',
  '/ocr-invoice',
  '/lead-prospector',
  '/chat',
  '/documents',
  '/chat-widgets',
  '/audit-logs',
  '/search-index',
  '/s3-uploads',
  '/offer-letters',
  '/ndas',
  '/localization',
  '/contacts',
  '/contacts/1',
  '/onboarding',
  '/smart-upload',
  '/industry',
  '/industry/hospital',
  '/industry/realestate',
  '/industry/restaurant',
  '/industry/retail',
  '/platform/schema',
  '/platform/roles',
  '/platform/navigation',
  '/platform/ai',
  '/platform/objects',
  '/voice',
  '/inbox',
  '/automations',
  '/leaderboard',
  '/portal',
  '/banking',
  '/forecast',
  '/migration',
  '/sim-gateway'
];

async function checkRoute(route) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: route,
      method: 'GET',
      headers: {
        'Cookie': `access_token=${mockJwt}`,
        'x-tenant-id': 'default-tenant',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ route, status: res.statusCode, ok: res.statusCode === 200 });
      });
    });
    req.on('error', (err) => {
      resolve({ route, status: 'ERROR', error: err.message, ok: false });
    });
    req.setTimeout(8000, () => {
      req.destroy();
      resolve({ route, status: 'TIMEOUT', ok: false });
    });
    req.end();
  });
}

async function run() {
  console.log(`Starting full authenticated route verification across ${routes.length} platform surfaces...`);
  let passed = 0;
  let failed = 0;
  
  for (const route of routes) {
    const res = await checkRoute(route);
    if (res.ok) {
      console.log(`✅ [${res.status}] ${route}`);
      passed++;
    } else {
      console.log(`❌ [${res.status}] ${route} ${res.error || ''}`);
      failed++;
    }
  }
  
  console.log(`\n=================================================`);
  console.log(`Results: ${passed}/${routes.length} HTTP 200 OK (${failed} failed)`);
  console.log(`=================================================`);
}

run();
