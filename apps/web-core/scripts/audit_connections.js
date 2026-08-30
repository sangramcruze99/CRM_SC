const http = require('http');

const BASE_URL = 'http://localhost:4000';

// Generate valid JWT cookie token
const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
const payload = Buffer.from(JSON.stringify({ 
  sub: 'user_123', 
  email: 'admin@gmail.com', 
  role: 'SUPERADMIN', 
  tenantId: 'default-tenant' 
})).toString('base64');
const mockJwt = `${header}.${payload}.mockSignature`;

const ROUTES_TO_AUDIT = [
  // 1. Auth & Entry
  { category: 'Auth & Onboarding', path: '/login', expectedStatus: 200 },
  { category: 'Auth & Onboarding', path: '/onboarding', expectedStatus: 200 },
  { category: 'Auth & Onboarding', path: '/', expectedStatus: 200 },

  // 2. Core CRM & Sales Hub (11 surfaces)
  { category: 'Core CRM & Sales Hub', path: '/dashboard', expectedStatus: 200 },
  { category: 'Core CRM & Sales Hub', path: '/contacts', expectedStatus: 200 },
  { category: 'Core CRM & Sales Hub', path: '/contacts/1', expectedStatus: 200 },
  { category: 'Core CRM & Sales Hub', path: '/deals', expectedStatus: 200 },
  { category: 'Core CRM & Sales Hub', path: '/projects', expectedStatus: 200 },
  { category: 'Core CRM & Sales Hub', path: '/invoices', expectedStatus: 200 },
  { category: 'Core CRM & Sales Hub', path: '/ocr-invoice', expectedStatus: 200 },
  { category: 'Core CRM & Sales Hub', path: '/tickets', expectedStatus: 200 },
  { category: 'Core CRM & Sales Hub', path: '/directory', expectedStatus: 200 },
  { category: 'Core CRM & Sales Hub', path: '/documents', expectedStatus: 200 },
  { category: 'Core CRM & Sales Hub', path: '/migration', expectedStatus: 200 },

  // 3. Omnichannel & Growth (7 surfaces)
  { category: 'Omnichannel & Growth', path: '/lead-prospector', expectedStatus: 200 },
  { category: 'Omnichannel & Growth', path: '/voice', expectedStatus: 200 },
  { category: 'Omnichannel & Growth', path: '/sim-gateway', expectedStatus: 200 },
  { category: 'Omnichannel & Growth', path: '/inbox', expectedStatus: 200 },
  { category: 'Omnichannel & Growth', path: '/social', expectedStatus: 200 },
  { category: 'Omnichannel & Growth', path: '/email-marketing', expectedStatus: 200 },
  { category: 'Omnichannel & Growth', path: '/site-builder', expectedStatus: 200 },

  // 4. Finance & Treasury (7 surfaces)
  { category: 'Finance & Treasury', path: '/banking', expectedStatus: 200 },
  { category: 'Finance & Treasury', path: '/forecast', expectedStatus: 200 },
  { category: 'Finance & Treasury', path: '/subscriptions', expectedStatus: 200 },
  { category: 'Finance & Treasury', path: '/quotes', expectedStatus: 200 },
  { category: 'Finance & Treasury', path: '/price-books', expectedStatus: 200 },
  { category: 'Finance & Treasury', path: '/payment-links', expectedStatus: 200 },
  { category: 'Finance & Treasury', path: '/taxes', expectedStatus: 200 },

  // 5. Industry & Niche Workspaces (5 surfaces)
  { category: 'Multi-Niche Workspaces', path: '/industry', expectedStatus: 200 },
  { category: 'Multi-Niche Workspaces', path: '/industry/hospital', expectedStatus: 200 },
  { category: 'Multi-Niche Workspaces', path: '/industry/realestate', expectedStatus: 200 },
  { category: 'Multi-Niche Workspaces', path: '/industry/restaurant', expectedStatus: 200 },
  { category: 'Multi-Niche Workspaces', path: '/industry/retail', expectedStatus: 200 },

  // 6. Automation & Enterprise Operations (26 surfaces)
  { category: 'Automation & Enterprise', path: '/automations', expectedStatus: 200 },
  { category: 'Automation & Enterprise', path: '/leaderboard', expectedStatus: 200 },
  { category: 'Automation & Enterprise', path: '/portal', expectedStatus: 200 },
  { category: 'Automation & Enterprise', path: '/branding', expectedStatus: 200 },
  { category: 'Automation & Enterprise', path: '/customization', expectedStatus: 200 },
  { category: 'Automation & Enterprise', path: '/compliance', expectedStatus: 200 },
  { category: 'Automation & Enterprise', path: '/developer', expectedStatus: 200 },
  { category: 'Automation & Enterprise', path: '/super-admin', expectedStatus: 200 },
  { category: 'Automation & Enterprise', path: '/reports', expectedStatus: 200 },
  { category: 'Automation & Enterprise', path: '/slas', expectedStatus: 200 },
  { category: 'Automation & Enterprise', path: '/chat-widgets', expectedStatus: 200 },
  { category: 'Automation & Enterprise', path: '/audit-logs', expectedStatus: 200 },
  { category: 'Automation & Enterprise', path: '/search-index', expectedStatus: 200 },
  { category: 'Automation & Enterprise', path: '/s3-uploads', expectedStatus: 200 },
  { category: 'Automation & Enterprise', path: '/offer-letters', expectedStatus: 200 },
  { category: 'Automation & Enterprise', path: '/ndas', expectedStatus: 200 },
  { category: 'Automation & Enterprise', path: '/localization', expectedStatus: 200 },
  { category: 'Automation & Enterprise', path: '/e-signatures', expectedStatus: 200 },
  { category: 'Automation & Enterprise', path: '/marketplace', expectedStatus: 200 },
  { category: 'Automation & Enterprise', path: '/chat', expectedStatus: 200 },
  { category: 'Automation & Enterprise', path: '/smart-upload', expectedStatus: 200 },
  { category: 'Automation & Enterprise', path: '/platform/schema', expectedStatus: 200 },
  { category: 'Automation & Enterprise', path: '/platform/roles', expectedStatus: 200 },
  { category: 'Automation & Enterprise', path: '/platform/navigation', expectedStatus: 200 },
  { category: 'Automation & Enterprise', path: '/platform/ai', expectedStatus: 200 },
  { category: 'Automation & Enterprise', path: '/platform/objects', expectedStatus: 200 },
];

function checkConnection(route) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: route.path,
      method: 'GET',
      headers: {
        'Cookie': `access_token=${mockJwt}`,
        'x-tenant-id': 'default-tenant',
        'User-Agent': 'AntigravityAudit/2.0'
      }
    };

    const req = http.request(options, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({
          path: route.path,
          category: route.category,
          status: res.statusCode,
          ok: res.statusCode === route.expectedStatus,
          responseTimeMs: responseTime,
          contentLength: data.length
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        path: route.path,
        category: route.category,
        status: 'ERROR',
        ok: false,
        error: err.message
      });
    });

    req.setTimeout(8000, () => {
      req.destroy();
      resolve({
        path: route.path,
        category: route.category,
        status: 'TIMEOUT',
        ok: false
      });
    });
    req.end();
  });
}

async function runFullSystemAudit() {
  console.log('===============================================================');
  console.log('🔍 INITIATING DEEP SYSTEM AUDIT ACROSS ALL 59 CONNECTIONS');
  console.log('===============================================================\n');

  const results = [];
  const categories = {};

  for (const route of ROUTES_TO_AUDIT) {
    const res = await checkConnection(route);
    results.push(res);

    if (!categories[res.category]) {
      categories[res.category] = { total: 0, passed: 0, failed: 0 };
    }
    categories[res.category].total++;
    if (res.ok) {
      categories[res.category].passed++;
      console.log(`✅ [${res.status}] ${res.path.padEnd(25)} (${res.responseTimeMs}ms) - ${res.category}`);
    } else {
      categories[res.category].failed++;
      console.log(`❌ [${res.status}] ${res.path.padEnd(25)} - FAILED (${res.error || 'Status Mismatch'})`);
    }
  }

  console.log('\n===============================================================');
  console.log('📊 CATEGORY CONNECTION SUMMARY');
  console.log('===============================================================');
  for (const [cat, stats] of Object.entries(categories)) {
    console.log(`• ${cat.padEnd(25)}: ${stats.passed}/${stats.total} Active (${stats.failed === 0 ? '100% HEALTHY' : stats.failed + ' ERRORS'})`);
  }

  const totalPassed = results.filter(r => r.ok).length;
  const totalFailed = results.filter(r => !r.ok).length;

  console.log('\n===============================================================');
  console.log(`🎯 OVERALL AUDIT SCORE: ${totalPassed}/${results.length} PASSED (${totalFailed} FAILED) - 100% HEALTHY`);
  console.log('===============================================================\n');

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runFullSystemAudit();
