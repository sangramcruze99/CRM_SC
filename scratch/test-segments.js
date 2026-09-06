const routes = [
  { url: '/industry', name: 'Industry & Niche Workspace Adapter' },
  { url: '/industry/realestate', name: 'Real Estate Segment' },
  { url: '/industry/hospital', name: 'Healthcare & Hospital Segment' },
  { url: '/industry/restaurant', name: 'Hospitality & Restaurant Segment' },
  { url: '/industry/retail', name: 'Omnichannel Retail & POS Segment' },
  { url: '/dashboard', name: 'Cockpit Dashboard' },
  { url: '/deals', name: 'Commercial Deals Pipeline' },
  { url: '/invoices', name: 'Finance & Invoices' },
  { url: '/projects', name: 'Project & Sprint Tasks' },
  { url: '/automation', name: 'Automation Command Center' },
  { url: '/automation/workflows', name: 'Autonomous Workflows' },
  { url: '/automation/approvals', name: 'AI Approval Center' },
  { url: '/marketplace', name: 'Agent & Automation Marketplace' },
  { url: '/contacts', name: 'Contacts & Accounts' },
  { url: '/customer-360', name: 'Customer 360' },
  { url: '/chat', name: 'Enterprise Collaboration Chat' },
  { url: '/documents', name: 'Documents Management' },
];

async function testAll() {
  console.log('Testing segment routes on http://127.0.0.1:4000 ...\n');
  let passed = 0;
  for (const r of routes) {
    try {
      const res = await fetch('http://127.0.0.1:4000' + r.url);
      const isOk = res.status === 200;
      console.log(`[${isOk ? 'PASS' : 'FAIL'}] ${r.name.padEnd(40)} ${r.url.padEnd(25)} -> HTTP ${res.status}`);
      if (isOk) passed++;
    } catch (e) {
      console.log(`[FAIL] ${r.name.padEnd(40)} ${r.url.padEnd(25)} -> ${e.message}`);
    }
  }
  console.log(`\nSummary: ${passed}/${routes.length} segment routes rendering with HTTP 200 OK.`);
}

testAll();
