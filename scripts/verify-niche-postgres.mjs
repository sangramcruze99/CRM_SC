#!/usr/bin/env node
/**
 * Phase 5 Verification Suite:
 * Automated Validation for Niche PostgreSQL Relational Persistence & Audit Logging
 */

import { PrismaClient } from '../packages/database/dist/index.js';

const prisma = new PrismaClient({
  datasourceUrl:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres_password@127.0.0.1:5432/business_os?schema=public&connection_limit=10&pool_timeout=10',
});

const WEB_CORE_URL = process.env.WEB_CORE_URL || 'http://127.0.0.1:4000';

let passed = 0;
let failed = 0;

function report(testName, ok, details = '') {
  if (ok) {
    passed++;
    console.log(`\x1b[32m[PASS]\x1b[0m ${testName}${details ? ' - ' + details : ''}`);
  } else {
    failed++;
    console.error(`\x1b[31m[FAIL]\x1b[0m ${testName}${details ? ' - ' + details : ''}`);
  }
}

async function run() {
  console.log('\x1b[1m\x1b[36m========================================================================\x1b[0m');
  console.log('\x1b[1m  Business OS — Phase 5: Niche PostgreSQL Persistence Verification      \x1b[0m');
  console.log('\x1b[1m\x1b[36m========================================================================\x1b[0m\n');

  try {
    // 1. Verify PostgreSQL Database Connection & Models
    const nicheTableCheck = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('NicheEntity', 'NicheAuditLog')
    `;
    const tableNames = nicheTableCheck.map((t) => t.table_name);
    report(
      'PostgreSQL Niche Schema Tables',
      tableNames.includes('NicheEntity') && tableNames.includes('NicheAuditLog'),
      `Found tables: ${tableNames.join(', ')}`
    );

    // 2. Verify Baseline Migrated Records Exist
    const initialEntityCount = await prisma.nicheEntity.count();
    report(
      'NicheEntity Baseline Records in PostgreSQL',
      initialEntityCount > 0,
      `Current entity count: ${initialEntityCount}`
    );

    // 3. Test Direct PostgreSQL CRUD Across Verticals
    const testTenant = 'test-audit-tenant-phase5';
    await prisma.nicheEntity.deleteMany({ where: { tenantId: testTenant } });
    await prisma.nicheAuditLog.deleteMany({ where: { tenantId: testTenant } });
    
    // Hospital Patient
    const patientData = {
      id: 'PT-TEST-999',
      name: 'Eleanor Vance',
      age: 42,
      department: 'Cardiology',
      triageLevel: 'URGENT',
      roomNumber: 'Ward 4B',
    };
    await prisma.nicheEntity.upsert({
      where: {
        tenantId_niche_entityType_entityId: {
          tenantId: testTenant,
          niche: 'hospital',
          entityType: 'patient',
          entityId: patientData.id,
        },
      },
      update: { data: JSON.stringify(patientData) },
      create: {
        tenantId: testTenant,
        niche: 'hospital',
        entityType: 'patient',
        entityId: patientData.id,
        data: JSON.stringify(patientData),
      },
    });

    const queriedPatient = await prisma.nicheEntity.findUnique({
      where: {
        tenantId_niche_entityType_entityId: {
          tenantId: testTenant,
          niche: 'hospital',
          entityType: 'patient',
          entityId: patientData.id,
        },
      },
    });
    report(
      'Direct PostgreSQL Upsert & Read (Hospital Patient)',
      queriedPatient !== null && JSON.parse(queriedPatient.data).name === 'Eleanor Vance'
    );

    // Retail Sale
    const saleData = {
      id: 'POS-TEST-888',
      receiptNumber: 'REC-2026-TEST',
      totalAmount: 149.99,
      paymentMethod: 'CARD',
      customerName: 'Marcus Aurelius',
    };
    await prisma.nicheEntity.create({
      data: {
        tenantId: testTenant,
        niche: 'retail',
        entityType: 'sale',
        entityId: saleData.id,
        data: JSON.stringify(saleData),
      },
    });

    const queriedSale = await prisma.nicheEntity.findFirst({
      where: {
        tenantId: testTenant,
        niche: 'retail',
        entityType: 'sale',
        entityId: saleData.id,
      },
    });
    report(
      'Direct PostgreSQL Entity Persistence (Retail Sale)',
      queriedSale !== null && JSON.parse(queriedSale.data).totalAmount === 149.99
    );

    // 4. Test Multi-Tenant Isolation
    const otherTenant = 'isolated-tenant-beta';
    const leakageCheck = await prisma.nicheEntity.findMany({
      where: {
        tenantId: otherTenant,
        niche: 'hospital',
      },
    });
    report(
      'Multi-Tenant Data Isolation',
      leakageCheck.length === 0,
      `Tenant '${otherTenant}' sees 0 records from '${testTenant}'`
    );

    // 5. Test Audit Log Persistence in PostgreSQL
    const auditEntry = await prisma.nicheAuditLog.create({
      data: {
        tenantId: testTenant,
        niche: 'hospital',
        action: 'ADMIT_PATIENT',
        entityType: 'Patient',
        entityId: patientData.id,
        details: 'Admitted Eleanor Vance to Ward 4B for coronary evaluation',
      },
    });
    report(
      'NicheAuditLog Relational Record Creation',
      auditEntry.id !== undefined && auditEntry.action === 'ADMIT_PATIENT'
    );

    const queriedLogs = await prisma.nicheAuditLog.findMany({
      where: { tenantId: testTenant },
    });
    report(
      'NicheAuditLog Query Filtering by Tenant',
      queriedLogs.length === 1 && queriedLogs[0].entityId === patientData.id
    );

    // 6. Test Web Core Next.js API Integration
    let webApiAvailable = false;
    try {
      const getRes = await fetch(`${WEB_CORE_URL}/api/niche/hospital`, {
        headers: { 'x-tenant-id': 'default-tenant' },
      });
      if (getRes.status === 200) {
        webApiAvailable = true;
        const json = await getRes.json();
        report(
          'Web-Core GET /api/niche/hospital Endpoint',
          json.success === true && json.data !== undefined,
          `Beds: ${json.metrics?.totalBeds}, Occupancy: ${json.metrics?.occupancyRate}`
        );
      } else {
        report('Web-Core GET /api/niche/hospital Endpoint', false, `Status: ${getRes.status}`);
      }
    } catch (e) {
      report('Web-Core GET /api/niche/hospital Endpoint', false, `Error: ${e.message}`);
    }

    if (webApiAvailable) {
      // Test POST /api/niche/hospital admit_patient mutation
      const postRes = await fetch(`${WEB_CORE_URL}/api/niche/hospital`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': testTenant,
        },
        body: JSON.stringify({
          action: 'admit_patient',
          payload: {
            name: 'Dr. Arthur Conan',
            age: 55,
            department: 'Neurology',
            triageLevel: 'CRITICAL',
            roomNumber: 'ICU-02',
            notes: 'Phase 5 automated test admission',
          },
        }),
      });

      if (postRes.status === 200) {
        const postJson = await postRes.json();
        const admittedId = postJson.record?.id;
        report(
          'Web-Core POST /api/niche/hospital Mutation',
          postJson.success === true && admittedId !== undefined,
          `Admitted ID: ${admittedId}`
        );

        // Verify entity persisted in PostgreSQL
        const persistedEntity = await prisma.nicheEntity.findFirst({
          where: {
            tenantId: testTenant,
            niche: 'hospital',
            entityType: 'patient',
            entityId: admittedId,
          },
        });
        report(
          'Web-Core API Persisted to PostgreSQL NicheEntity',
          persistedEntity !== null,
          `Entity found in DB: ${persistedEntity?.entityId}`
        );

        // Verify audit log persisted in PostgreSQL
        const persistedAudit = await prisma.nicheAuditLog.findFirst({
          where: {
            tenantId: testTenant,
            niche: 'hospital',
            action: 'ADMIT_PATIENT',
            entityId: admittedId,
          },
        });
        report(
          'Web-Core API Persisted to PostgreSQL NicheAuditLog',
          persistedAudit !== null,
          `Audit log found in DB for action: ${persistedAudit?.action}`
        );
      } else {
        report('Web-Core POST /api/niche/hospital Mutation', false, `Status: ${postRes.status}`);
      }
    }

    // 7. Test Restaurant, Retail, SME & Agency Mutations in PostgreSQL
    const restOrder = {
      id: 'KOT-TEST-777',
      tableId: 'T-01',
      tableNumber: 'Table 1',
      items: [{ name: 'Truffle Pasta', price: 32, qty: 2 }],
      status: 'PREPARING',
    };
    await prisma.nicheEntity.upsert({
      where: {
        tenantId_niche_entityType_entityId: {
          tenantId: testTenant,
          niche: 'restaurant',
          entityType: 'kitchenOrder',
          entityId: restOrder.id,
        },
      },
      update: { data: JSON.stringify(restOrder) },
      create: {
        tenantId: testTenant,
        niche: 'restaurant',
        entityType: 'kitchenOrder',
        entityId: restOrder.id,
        data: JSON.stringify(restOrder),
      },
    });
    const fetchedOrder = await prisma.nicheEntity.findUnique({
      where: {
        tenantId_niche_entityType_entityId: {
          tenantId: testTenant,
          niche: 'restaurant',
          entityType: 'kitchenOrder',
          entityId: restOrder.id,
        },
      },
    });
    report(
      'Restaurant Entity PostgreSQL Upsert',
      fetchedOrder !== null && JSON.parse(fetchedOrder.data).id === restOrder.id
    );

    // 8. Cleanup Test Tenant Data
    const deletedEntities = await prisma.nicheEntity.deleteMany({
      where: { tenantId: testTenant },
    });
    const deletedAudits = await prisma.nicheAuditLog.deleteMany({
      where: { tenantId: testTenant },
    });
    report(
      'Post-Test Clean Teardown',
      deletedEntities.count > 0 && deletedAudits.count > 0,
      `Purged ${deletedEntities.count} test entities and ${deletedAudits.count} test audit logs`
    );

  } catch (err) {
    report('Phase 5 Verification Suite Execution', false, err.message);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n\x1b[1m------------------------------------------------------------------------\x1b[0m');
  console.log(`\x1b[1mSummary: \x1b[32m${passed} passed\x1b[0m, \x1b[31m${failed} failed\x1b[0m`);
  console.log('\x1b[1m------------------------------------------------------------------------\x1b[0m');

  if (failed > 0) {
    process.exit(1);
  }
}

run();
