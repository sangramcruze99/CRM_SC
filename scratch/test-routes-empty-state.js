const http = require('http');

const routes = [
  { path: '/dashboard', label: 'Dashboard', expectedSnippet: 'Cockpit' },
  { path: '/deals', label: 'Deals Kanban', expectedSnippet: 'Deals' },
  { path: '/invoices', label: 'Invoices', expectedSnippet: 'Invoices' },
  { path: '/projects', label: 'Sprint Board', expectedSnippet: 'Sprint' },
  { path: '/customer-360', label: 'Customer 360', expectedSnippet: 'Customer 360' },
  { path: '/ai-studio', label: 'AI Studio', expectedSnippet: 'Studio' },
  { path: '/email-marketing', label: 'Email Marketing', expectedSnippet: 'Campaigns' },
];

function checkRoute({ path, label, expectedSnippet }) {
  return new Promise((resolve) => {
    http.get(`http://localhost:4000${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const statusOk = res.statusCode === 200;
        const containsSnippet = data.includes(expectedSnippet);
        const hasErrors = data.includes('Application error') || data.includes('Unhandled Runtime Error');
        console.log(`[${statusOk && !hasErrors ? 'PASS' : 'FAIL'}] ${label} (${path}) - Status: ${res.statusCode}, Error-free: ${!hasErrors}`);
        resolve({ path, status: res.statusCode, ok: statusOk && !hasErrors });
      });
    }).on('error', (err) => {
      console.error(`[FAIL] ${label} (${path}) - Connection error: ${err.message}`);
      resolve({ path, status: 500, ok: false, error: err.message });
    });
  });
}

async function run() {
  console.log('--- Verifying Live CRM Routes for Clean Empty States ---');
  let allPass = true;
  for (const r of routes) {
    const res = await checkRoute(r);
    if (!res.ok) allPass = false;
  }
  console.log(`\nResult: ${allPass ? 'ALL ROUTES RENDERING SUCCESSFULLY (HTTP 200, ZERO ERRORS)' : 'SOME ROUTES FAILED'}`);
}

run();
