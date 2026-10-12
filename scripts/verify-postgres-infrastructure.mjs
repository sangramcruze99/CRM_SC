/**
 * Comprehensive PostgreSQL Production Infrastructure Verification Suite
 * Validates:
 * 1. Connection Pooling & Concurrent Writes
 * 2. Foreign Key Constraint Enforcement
 * 3. Uniqueness Constraints (P2002)
 * 4. Multi-Tenant Query Scoping & Data Isolation
 * 5. Safe Transactional Boundaries & withTenantContext Isolation
 * 6. Clean Rollback on Failure
 */

import assert from 'node:assert';
import { PrismaClient, withTenantContext } from '../packages/database/dist/index.js';

console.log('='.repeat(70));
console.log('🐘  BUSINESS OS — POSTGRESQL INFRASTRUCTURE VERIFICATION SUITE');
console.log('='.repeat(70));

const prisma = new PrismaClient();
let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
    failed++;
  }
}

try {
  console.log('\n🔍 TEST GROUP 1: Connection & Pool Concurrency');
  await test('PostgreSQL connection is healthy and responsive', async () => {
    const res = await prisma.$queryRaw`SELECT 1 as connected, current_database() as db;`;
    assert.strictEqual(res[0].connected, 1);
    assert.strictEqual(res[0].db, 'business_os');
  });

  await test('Concurrent writes: 20 parallel transactions succeed under connection pool', async () => {
    const promises = Array.from({ length: 20 }, async (_, i) => {
      return prisma.auditLog.create({
        data: {
          tenantId: 'default-tenant',
          action: `CONCURRENT_TEST_PING_${i}`,
          entityType: 'SystemBenchmark',
          entityId: `bench_${i}`,
          metadata: JSON.stringify({ thread: i, timestamp: Date.now() }),
        },
      });
    });
    const results = await Promise.all(promises);
    assert.strictEqual(results.length, 20);

    // Clean up test audit logs
    await prisma.auditLog.deleteMany({
      where: { action: { startsWith: 'CONCURRENT_TEST_PING_' } },
    });
  });

  console.log('\n🔍 TEST GROUP 2: Relational Integrity & Constraints');
  await test('Foreign Key Enforcement: Inserting contact with invalid tenantId is rejected', async () => {
    let rejected = false;
    try {
      await prisma.contact.create({
        data: {
          id: `invalid_contact_${Date.now()}`,
          tenantId: 'non_existent_tenant_99999',
          firstName: 'Orphan',
          lastName: 'Contact',
          email: 'orphan@test.com',
        },
      });
    } catch (err) {
      rejected = true;
      assert(err.message.includes('Foreign key constraint failed') || err.code === 'P2003');
    }
    assert.strictEqual(rejected, true, 'Database allowed orphan record without valid tenant foreign key!');
  });

  await test('Uniqueness Constraint Enforcement: Duplicate tenant domain is rejected', async () => {
    const testDomain = `unique-test-${Date.now()}.crm.local`;
    const t1 = await prisma.tenant.create({
      data: { name: 'Tenant Uni 1', domain: testDomain },
    });

    let duplicateRejected = false;
    try {
      await prisma.tenant.create({
        data: { name: 'Tenant Uni 2', domain: testDomain },
      });
    } catch (err) {
      duplicateRejected = true;
      assert(err.message.includes('Unique constraint') || err.code === 'P2002');
    } finally {
      await prisma.tenant.delete({ where: { id: t1.id } });
    }
    assert.strictEqual(duplicateRejected, true, 'Database allowed duplicate unique domain!');
  });

  console.log('\n🔍 TEST GROUP 3: Multi-Tenant Data Isolation');
  await test('Two-Tenant Cross-Boundary Query Isolation', async () => {
    const tenantA = await prisma.tenant.create({
      data: { name: 'Alpha Corp', domain: `alpha-${Date.now()}.local` },
    });
    const tenantB = await prisma.tenant.create({
      data: { name: 'Beta Ltd', domain: `beta-${Date.now()}.local` },
    });

    try {
      // Create contacts in Tenant A and Tenant B
      await prisma.contact.create({
        data: { tenantId: tenantA.id, firstName: 'Alice', lastName: 'Alpha', email: 'alice@alpha.local' },
      });
      await prisma.contact.create({
        data: { tenantId: tenantB.id, firstName: 'Bob', lastName: 'Beta', email: 'bob@beta.local' },
      });

      // Tenant A query
      const alphaContacts = await prisma.contact.findMany({
        where: { tenantId: tenantA.id },
      });
      assert.strictEqual(alphaContacts.length, 1);
      assert.strictEqual(alphaContacts[0].firstName, 'Alice');

      // Tenant B query
      const betaContacts = await prisma.contact.findMany({
        where: { tenantId: tenantB.id },
      });
      assert.strictEqual(betaContacts.length, 1);
      assert.strictEqual(betaContacts[0].firstName, 'Bob');

      // Cross-tenant bleed check
      const leakedInAlpha = alphaContacts.some(c => c.tenantId === tenantB.id);
      const leakedInBeta = betaContacts.some(c => c.tenantId === tenantA.id);
      assert.strictEqual(leakedInAlpha, false, 'Tenant A saw Tenant B records!');
      assert.strictEqual(leakedInBeta, false, 'Tenant B saw Tenant A records!');
    } finally {
      // Clean up test records
      await prisma.contact.deleteMany({
        where: { tenantId: { in: [tenantA.id, tenantB.id] } },
      });
      await prisma.tenant.deleteMany({
        where: { id: { in: [tenantA.id, tenantB.id] } },
      });
    }
  });

  console.log('\n🔍 TEST GROUP 4: Transactional Boundaries & Tenant Context Isolation');
  await test('withTenantContext safely executes and prevents connection session bleeding', async () => {
    const result = await withTenantContext(prisma, 'tenant_test_ctx_01', async (tx) => {
      const sessionVar = await tx.$queryRaw`SELECT current_setting('app.current_tenant_id', true) as val;`;
      assert.strictEqual(sessionVar[0].val, 'tenant_test_ctx_01');
      return 'SUCCESS';
    });
    assert.strictEqual(result, 'SUCCESS');

    // Outside transaction, session variable should NOT persist on pooled connection
    const outerVar = await prisma.$queryRaw`SELECT current_setting('app.current_tenant_id', true) as val;`;
    assert(
      outerVar[0].val === null || outerVar[0].val === '' || outerVar[0].val !== 'tenant_test_ctx_01',
      'Session variable leaked outside transaction onto connection pool!'
    );
  });

  await test('Atomic Rollback: Transaction fails cleanly and discards partial writes', async () => {
    let failedCleanly = false;
    const testEmail = `rollback_test_${Date.now()}@test.com`;

    try {
      await prisma.$transaction(async (tx) => {
        await tx.contact.create({
          data: {
            tenantId: 'default-tenant',
            firstName: 'Transient',
            lastName: 'Contact',
            email: testEmail,
          },
        });
        // Intentionally throw error to trigger rollback
        throw new Error('INTENTIONAL_SIMULATED_FAILURE');
      });
    } catch (err) {
      if (err.message && err.message.includes('INTENTIONAL_SIMULATED_FAILURE')) {
        failedCleanly = true;
      }
    }

    assert.strictEqual(failedCleanly, true, 'Transaction error was not caught as expected');
    const existing = await prisma.contact.findFirst({ where: { email: testEmail } });
    assert.strictEqual(existing, null, 'Uncommitted transaction write leaked into database!');
  });

} finally {
  await prisma.$disconnect();
}

console.log('='.repeat(70));
console.log(`📊 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('='.repeat(70));

if (failed > 0) {
  process.exit(1);
} else {
  console.log('✅ ALL POSTGRESQL INFRASTRUCTURE TESTS VERIFIED SUCCESSFULLY!\n');
}
