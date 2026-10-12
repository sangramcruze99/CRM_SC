import assert from 'node:assert';
import http from 'node:http';
import { PrismaClient } from 'file:///e:/businessos/packages/database/dist/index.js';

const WEB_CORE_URL = 'http://127.0.0.1:4000';
const prisma = new PrismaClient();

function fetchJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = http.request(
      {
        host: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: options.method || 'GET',
        headers: {
          'content-type': 'application/json',
          ...(options.headers || {}),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, headers: res.headers, body });
          }
        });
      }
    );
    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function run() {
  console.log('=== REGRESSION TEST: WEB CORE READINESS & NICHE PERSISTENCE ===\n');
  let passed = 0;

  // Test 1: Healthz endpoint
  const testCorrId = `corr-test-${Date.now()}`;
  const healthRes = await fetchJson(`${WEB_CORE_URL}/api/healthz`, {
    headers: { 'x-correlation-id': testCorrId },
  });
  assert.strictEqual(healthRes.status, 200, 'Healthz should return 200');
  assert.strictEqual(healthRes.data.status, 'UP', 'Healthz status should be UP');
  assert.strictEqual(healthRes.data.service, 'web-core', 'Service should be web-core');
  assert.strictEqual(healthRes.headers['x-correlation-id'], testCorrId, 'Correlation ID should be reflected');
  console.log('✅ Test 1 Passed: /api/healthz responds 200 UP and reflects correlation ID');
  passed++;

  // Test 2: Readyz endpoint deep probes
  const readyRes = await fetchJson(`${WEB_CORE_URL}/api/readyz`);
  assert.strictEqual(readyRes.status, 200, 'Readyz should return 200');
  assert.strictEqual(readyRes.data.status, 'READY', 'Readyz status should be READY');
  assert.strictEqual(readyRes.data.checks.database, 'UP', 'DB check should be UP');
  assert.strictEqual(readyRes.data.checks.redis, 'UP', 'Redis check should be UP');
  assert.strictEqual(readyRes.data.checks.objectStorage, 'UP', 'MinIO check should be UP');
  console.log('✅ Test 2 Passed: /api/readyz responds 200 READY with DB=UP, Redis=UP, S3=UP');
  passed++;

  // Test 3: Niche entity creation and PostgreSQL persistence
  const testPatientId = `PT-REG-${Date.now()}`;
  const testTenant = 'tenant_regression_test';
  const admitRes = await fetchJson(`${WEB_CORE_URL}/api/niche/hospital`, {
    method: 'POST',
    headers: { 'x-tenant-id': testTenant },
    body: {
      action: 'admit_patient',
      payload: {
        id: testPatientId,
        name: 'Jane Doe Regression',
        age: 34,
        department: 'Cardiology',
        triageLevel: 'URGENT',
      },
    },
  });
  assert.strictEqual(admitRes.status, 200, 'Admit patient should return 200');
  assert.strictEqual(admitRes.data.success, true, 'Admit patient should succeed');

  // Verify in PostgreSQL NicheEntity table directly
  const dbEntity = await prisma.nicheEntity.findUnique({
    where: {
      tenantId_niche_entityType_entityId: {
        tenantId: testTenant,
        niche: 'hospital',
        entityType: 'patient',
        entityId: testPatientId,
      },
    },
  });
  assert.ok(dbEntity, 'Entity must exist in PostgreSQL NicheEntity table');
  const parsedData = JSON.parse(dbEntity.data);
  assert.strictEqual(parsedData.name, 'Jane Doe Regression');
  console.log('✅ Test 3 Passed: Niche API persisted record directly to PostgreSQL NicheEntity');
  passed++;

  // Test 4: NicheAuditLog created in PostgreSQL
  const dbAudit = await prisma.nicheAuditLog.findFirst({
    where: {
      tenantId: testTenant,
      niche: 'hospital',
      action: 'ADMIT_PATIENT',
      entityId: testPatientId,
    },
  });
  assert.ok(dbAudit, 'Audit log must exist in PostgreSQL NicheAuditLog');
  console.log('✅ Test 4 Passed: Niche action logged directly to PostgreSQL NicheAuditLog');
  passed++;

  // Clean up test records
  await prisma.nicheEntity.deleteMany({ where: { tenantId: testTenant } });
  await prisma.nicheAuditLog.deleteMany({ where: { tenantId: testTenant } });
  console.log('✅ Cleanup Passed: Test records safely removed from PostgreSQL');
  passed++;

  console.log(`\n🎉 All ${passed}/5 Regression Tests Passed Successfully!`);
}

run()
  .catch((err) => {
    console.error('❌ Regression Test Failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
