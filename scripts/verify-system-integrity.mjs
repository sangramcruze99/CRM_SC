import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '../packages/database/dist/index.js';

const prisma = new PrismaClient();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

console.log('========================================================================');
console.log('🛡️ MASTER PRODUCTION AUDIT & SYSTEM INTEGRITY TEST SUITE');
console.log('========================================================================\n');

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
  }
}

const BASE_URL = 'http://localhost:4000';
const API_KEY = process.env.API_KEY || 'ee03f6bc2fba450fdf6d080ae6c8c919';

async function runAudit() {
  let authToken = '';

  // --------------------------------------------------------------------------
  // TEST SUITE 1: AUTHENTICATION & AUTHORIZATION INTEGRITY
  // --------------------------------------------------------------------------
  console.log('▶ [1/6] Testing Authentication & Authorization Security...');
  try {
    // 1.1 Bad credentials must be rejected
    const badRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@gmail.com', password: 'wrongpassword' }),
    });
    assert(badRes.status === 401, `Invalid credentials correctly rejected with HTTP 401 (got ${badRes.status})`);

    // 1.2 Real admin login with bcrypt hash
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@gmail.com', password: 'admin123' }),
    });
    assert(loginRes.ok, `Real admin login succeeds with HTTP ${loginRes.status}`);
    const loginData = await loginRes.json();
    assert(typeof loginData.access_token === 'string' && loginData.access_token.length > 20, 'Signed JWT token returned');
    authToken = loginData.access_token;

    // 1.3 Unauthenticated /auth/me must return 401
    const unauthMe = await fetch(`${BASE_URL}/api/auth/me`);
    assert(unauthMe.status === 401, `Unauthenticated /auth/me rejected with HTTP 401 (got ${unauthMe.status})`);

    // 1.4 Authenticated /auth/me with Bearer token
    const authMe = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert(authMe.ok, `/auth/me with valid Bearer token returns HTTP ${authMe.status}`);
    const meData = await authMe.json();
    assert(meData.email === 'admin@gmail.com', `Returned authenticated user: ${meData.email}`);
  } catch (err) {
    assert(false, `Auth suite failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 2: DEMO DATA PURGE & EMPTY STATE INTEGRITY
  // --------------------------------------------------------------------------
  console.log('\n▶ [2/6] Testing Demo Data Purge & Real Database Empty States...');
  try {
    // 2.1 CRM Contacts returns real data
    const contactsRes = await fetch(`${BASE_URL}/api/crm/contacts`, {
      headers: { 'x-api-key': API_KEY, 'x-tenant-id': 'default-tenant' },
    });
    assert(contactsRes.ok, `Contacts API returns HTTP ${contactsRes.status}`);
    const contacts = await contactsRes.json();
    assert(Array.isArray(contacts), `Contacts returns an array (length: ${contacts.length})`);

    // 2.2 Sales Deals returns real data
    const dealsRes = await fetch(`${BASE_URL}/api/sales/deals`, {
      headers: { 'x-api-key': API_KEY, 'x-tenant-id': 'default-tenant' },
    });
    assert(dealsRes.ok, `Deals API returns HTTP ${dealsRes.status}`);
    const deals = await dealsRes.json();
    assert(Array.isArray(deals), `Deals returns an array (length: ${deals.length})`);
    const hasFakeApex = deals.some((d) => d.title && d.title.includes('Apex Global Systems'));
    assert(!hasFakeApex, 'No synthetic "Apex Global Systems" demo deals in database');

    // 2.3 Finance Invoices returns real data
    const invoicesRes = await fetch(`${BASE_URL}/api/finance/invoices`, {
      headers: { 'x-api-key': API_KEY, 'x-tenant-id': 'default-tenant' },
    });
    assert(invoicesRes.ok, `Invoices API returns HTTP ${invoicesRes.status}`);
    const invoices = await invoicesRes.json();
    assert(Array.isArray(invoices), `Invoices returns an array (length: ${invoices.length})`);
  } catch (err) {
    assert(false, `Demo data purge check failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 3: HELPDESK TICKETS END-TO-END WIRING
  // --------------------------------------------------------------------------
  console.log('\n▶ [3/6] Testing Helpdesk Tickets Real API CRUD...');
  let createdTicketId = '';
  try {
    // 3.1 Create ticket
    const createRes = await fetch(`${BASE_URL}/api/helpdesk/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'x-tenant-id': 'default-tenant',
      },
      body: JSON.stringify({
        title: 'System Audit Verification Incident',
        description: 'Automated integration test verifying ticket creation and resolution pipeline.',
        priority: 'HIGH',
      }),
    });
    assert(createRes.ok, `Ticket creation returned HTTP ${createRes.status}`);
    const createdTicket = await createRes.json();
    assert(createdTicket && createdTicket.id, `Ticket created with ID: ${createdTicket.id}`);
    createdTicketId = createdTicket.id;

    // 3.2 Fetch tickets list and verify presence
    const listRes = await fetch(`${BASE_URL}/api/helpdesk/tickets`, {
      headers: { 'x-api-key': API_KEY, 'x-tenant-id': 'default-tenant' },
    });
    const ticketList = await listRes.json();
    const found = Array.isArray(ticketList) && ticketList.some((t) => t.id === createdTicketId);
    assert(found, `Created ticket found in Helpdesk service list`);

    // 3.3 Add message to ticket
    const msgRes = await fetch(`${BASE_URL}/api/helpdesk/tickets/${createdTicketId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
      body: JSON.stringify({ content: 'Investigation initiated by SRE lead.', isStaff: true }),
    });
    assert(msgRes.ok, `Ticket message addition returned HTTP ${msgRes.status}`);

    // 3.4 Update status
    const statusRes = await fetch(`${BASE_URL}/api/helpdesk/tickets/${createdTicketId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'x-tenant-id': 'default-tenant',
      },
      body: JSON.stringify({ status: 'RESOLVED' }),
    });
    assert(statusRes.ok, `Ticket status update returned HTTP ${statusRes.status}`);

    // 3.5 Cleanup test ticket
    const delRes = await fetch(`${BASE_URL}/api/helpdesk/tickets/${createdTicketId}`, {
      method: 'DELETE',
      headers: { 'x-api-key': API_KEY, 'x-tenant-id': 'default-tenant' },
    });
    assert(delRes.ok, `Cleaned up test ticket`);
  } catch (err) {
    assert(false, `Helpdesk tickets test failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 4: AI TRUTHFULNESS & EMPTY STATE ACCURACY
  // --------------------------------------------------------------------------
  console.log('\n▶ [4/6] Testing AI Truthfulness & Non-Fabrication...');
  try {
    // 4.1 Invoices inquiry when 0 overdue
    const invAsk = await fetch(`${BASE_URL}/api/ai/control/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Show me unpaid invoices' }),
    });
    const invData = await invAsk.json();
    assert(!invData.answer.includes('INV-2026-089'), 'AI did not fabricate fake invoice "INV-2026-089"');
    assert(invData.dataSummary.overdueCount === 0, 'Accurately reports 0 overdue invoices');

    // 4.2 Customer success inquiry
    const csAsk = await fetch(`${BASE_URL}/api/ai/control/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Find customers who might churn' }),
    });
    const csData = await csAsk.json();
    assert(!csData.answer.includes('sconnor@acme.corp'), 'AI did not fabricate fake contact "Sarah Connor"');
  } catch (err) {
    assert(false, `AI truthfulness test failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 5: MULTI-TENANT ISOLATION AT API & DATABASE BOUNDARIES
  // --------------------------------------------------------------------------
  console.log('\n▶ [5/6] Testing Multi-Tenant Data Isolation...');
  try {
    const tenantA = 'tenant_isolation_test_a';
    const tenantB = 'tenant_isolation_test_b';

    await prisma.tenant.upsert({
      where: { id: tenantA },
      update: {},
      create: { id: tenantA, name: 'Tenant A Isolation Test' },
    });
    await prisma.tenant.upsert({
      where: { id: tenantB },
      update: {},
      create: { id: tenantB, name: 'Tenant B Isolation Test' },
    });

    // 5.1 Create contact in Tenant A
    const createContactRes = await fetch(`${BASE_URL}/api/crm/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'x-tenant-id': tenantA,
      },
      body: JSON.stringify({
        firstName: 'Confidential',
        lastName: 'Executive',
        email: 'ceo@tenant-a-confidential.com',
      }),
    });
    assert(createContactRes.ok, `Created confidential contact in ${tenantA}`);
    const contactA = await createContactRes.json();

    // 5.2 Query contacts from Tenant B
    const listTenantB = await fetch(`${BASE_URL}/api/crm/contacts`, {
      headers: { 'x-api-key': API_KEY, 'x-tenant-id': tenantB },
    });
    const contactsB = await listTenantB.json();
    const leaked = Array.isArray(contactsB) && contactsB.some((c) => c.email === 'ceo@tenant-a-confidential.com');
    assert(!leaked, `Tenant B CANNOT see Tenant A's contacts (Zero cross-tenant leakage)`);

    // 5.3 Direct query by ID from Tenant B must fail
    const getByIdFromB = await fetch(`${BASE_URL}/api/crm/contacts/${contactA.id}`, {
      headers: { 'x-api-key': API_KEY, 'x-tenant-id': tenantB },
    });
    let dataByIdB = null;
    try {
      const text = await getByIdFromB.text();
      dataByIdB = text ? JSON.parse(text) : null;
    } catch {
      // ignore
    }
    assert(!dataByIdB || dataByIdB.id !== contactA.id || getByIdFromB.status === 404, `Direct IDOR cross-tenant access blocked (status: ${getByIdFromB.status})`);

    // Cleanup Tenant A contact & tenants
    await fetch(`${BASE_URL}/api/crm/contacts/${contactA.id}`, {
      method: 'DELETE',
      headers: { 'x-api-key': API_KEY, 'x-tenant-id': tenantA },
    });
    await prisma.contact.deleteMany({ where: { tenantId: { in: [tenantA, tenantB] } } });
    await prisma.tenant.deleteMany({ where: { id: { in: [tenantA, tenantB] } } });
    console.log(`  ✅ Cleaned up temporary isolation test records.`);
  } catch (err) {
    assert(false, `Multi-tenant isolation test failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 6: DASHBOARD PRODUCTION ACCURACY
  // --------------------------------------------------------------------------
  console.log('\n▶ [6/6] Testing Dashboard Production Accuracy...');
  try {
    const dashRes = await fetch(`${BASE_URL}/dashboard`, {
      headers: { 'x-tenant-id': 'default-tenant' },
    });
    assert(dashRes.ok, `Dashboard HTML renders with HTTP ${dashRes.status}`);
    const dashHtml = await dashRes.text();
    assert(!dashHtml.includes('Apex Global Systems - Enterprise License'), 'Dashboard HTML does not contain fake "Apex Global Systems" demo deal');
    assert(!dashHtml.includes('BioTech Pharma - Multi-Seat SLA'), 'Dashboard HTML does not contain fake "BioTech Pharma" demo deal');
  } catch (err) {
    assert(false, `Dashboard verification failed: ${err.message}`);
  }

  console.log('\n========================================================================');
  console.log(`📊 MASTER AUDIT SUMMARY: ${passed}/${total} assertions passed (${Math.round((passed / total) * 100)}%)`);
  console.log('========================================================================\n');

  if (passed === total) {
    console.log('🎉 ALL PRODUCTION AUDIT & SYSTEM INTEGRITY CHECKS PASSED!\n');
    process.exit(0);
  } else {
    console.error(`❌ AUDIT FAILED: ${total - passed} checks did not pass.`);
    process.exit(1);
  }
}

runAudit();
