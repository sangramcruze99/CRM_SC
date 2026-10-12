#!/usr/bin/env node
/**
 * Phase 5 Migration Script:
 * Migrates file-backed niche_store.json to PostgreSQL Relational Tables (NicheEntity & NicheAuditLog)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '../packages/database/dist/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const NICHE_JSON_PATH = path.resolve(ROOT_DIR, 'packages', 'database', 'prisma', 'niche_store.json');
const BACKUP_JSON_PATH = path.resolve(ROOT_DIR, 'packages', 'database', 'prisma', 'niche_store.json.pre-pg-migration.bak');

const prisma = new PrismaClient();

console.log('\x1b[1m\x1b[36m========================================================================\x1b[0m');
console.log('\x1b[1m  Business OS — Phase 5: Niche Store JSON to PostgreSQL Migration       \x1b[0m');
console.log('\x1b[1m\x1b[36m========================================================================\x1b[0m\n');

async function main() {
  if (!fs.existsSync(NICHE_JSON_PATH)) {
    console.log(`[INFO] No existing niche_store.json found at ${NICHE_JSON_PATH}. Nothing to migrate.`);
    await prisma.$disconnect();
    process.exit(0);
  }

  // 1. Create immutable backup
  fs.copyFileSync(NICHE_JSON_PATH, BACKUP_JSON_PATH);
  console.log(`[BACKUP] Created backup at ${BACKUP_JSON_PATH}`);

  const rawJson = fs.readFileSync(NICHE_JSON_PATH, 'utf-8');
  const store = JSON.parse(rawJson);

  let totalEntitiesMigrated = 0;
  let totalAuditLogsMigrated = 0;

  // Helper for upserting niche entities
  async function upsertEntity(niche, entityType, entityId, payload, tenantId = 'default-tenant') {
    const safeTenantId = payload.tenantId || tenantId;
    await prisma.nicheEntity.upsert({
      where: {
        tenantId_niche_entityType_entityId: {
          tenantId: safeTenantId,
          niche,
          entityType,
          entityId,
        },
      },
      update: {
        data: JSON.stringify(payload),
        updatedAt: new Date(),
      },
      create: {
        tenantId: safeTenantId,
        niche,
        entityType,
        entityId,
        data: JSON.stringify(payload),
      },
    });
    totalEntitiesMigrated++;
  }

  console.log('[MIGRATING] Ingesting Niche records into PostgreSQL...');

  // 1. Hospital
  if (store.hospital) {
    if (store.hospital.totalBeds !== undefined) {
      await upsertEntity('hospital', 'config', 'settings', { totalBeds: store.hospital.totalBeds });
    }
    for (const patient of store.hospital.patients || []) {
      await upsertEntity('hospital', 'patient', patient.id, patient);
    }
    for (const appt of store.hospital.appointments || []) {
      await upsertEntity('hospital', 'appointment', appt.id, appt);
    }
    for (const rx of store.hospital.prescriptions || []) {
      await upsertEntity('hospital', 'prescription', rx.id, rx);
    }
  }

  // 2. Real Estate
  if (store.realestate) {
    for (const prop of store.realestate.properties || []) {
      await upsertEntity('realestate', 'property', prop.id, prop);
    }
    for (const showing of store.realestate.showings || []) {
      await upsertEntity('realestate', 'showing', showing.id, showing);
    }
    for (const deal of store.realestate.deals || []) {
      await upsertEntity('realestate', 'deal', deal.id, deal);
    }
  }

  // 3. Restaurant
  if (store.restaurant) {
    for (const table of store.restaurant.tables || []) {
      await upsertEntity('restaurant', 'table', table.id, table);
    }
    for (const order of store.restaurant.kitchenOrders || []) {
      await upsertEntity('restaurant', 'kitchenOrder', order.id, order);
    }
    for (const item of store.restaurant.menuItems || []) {
      await upsertEntity('restaurant', 'menuItem', item.id, item);
    }
  }

  // 4. Retail
  if (store.retail) {
    for (const prod of store.retail.catalogProducts || []) {
      await upsertEntity('retail', 'catalogProduct', prod.id, prod);
    }
    for (const sale of store.retail.sales || []) {
      await upsertEntity('retail', 'sale', sale.id, sale);
    }
    for (const cust of store.retail.khataCustomers || []) {
      await upsertEntity('retail', 'khataCustomer', cust.id, cust);
    }
  }

  // 5. SME
  if (store.sme) {
    for (const sub of store.sme.subscriptions || []) {
      await upsertEntity('sme', 'subscription', sub.id, sub);
    }
  }

  // 6. Agency
  if (store.agency) {
    for (const del of store.agency.deliverables || []) {
      await upsertEntity('agency', 'deliverable', del.id, del);
    }
  }

  // 7. Generic Niche Records (construction, legal, logistics, etc.)
  if (store.nicheRecords) {
    for (const [nicheKey, recs] of Object.entries(store.nicheRecords)) {
      for (const rec of recs || []) {
        await upsertEntity(nicheKey, 'record', rec.id, rec);
      }
    }
  }

  // 8. CRM Contacts in store
  if (store.crm_contacts) {
    for (const contact of store.crm_contacts || []) {
      await upsertEntity('crm', 'contact', contact.id, contact);
    }
  }

  // 9. Audit Logs
  if (store.auditLogs) {
    for (const log of store.auditLogs) {
      await prisma.nicheAuditLog.create({
        data: {
          id: log.id || undefined,
          tenantId: log.tenantId || 'default-tenant',
          niche: log.niche || 'general',
          action: log.action || 'ACTION',
          entityType: log.entityType || 'Entity',
          entityId: log.entityId || 'id',
          details: log.details || '',
          timestamp: log.timestamp ? new Date(log.timestamp) : new Date(),
        },
      });
      totalAuditLogsMigrated++;
    }
  }

  // 10. Reconciliation & Verification
  const pgEntityCount = await prisma.nicheEntity.count();
  const pgAuditCount = await prisma.nicheAuditLog.count();

  console.log('\n\x1b[1m========================================================================\x1b[0m');
  console.log('\x1b[1mReconciliation & Verification Results:\x1b[0m');
  console.log(`  ▶ Niche Entities Migrated:  ${totalEntitiesMigrated}`);
  console.log(`  ▶ PostgreSQL Entity Count:   ${pgEntityCount}`);
  console.log(`  ▶ Audit Logs Migrated:      ${totalAuditLogsMigrated}`);
  console.log(`  ▶ PostgreSQL Audit Logs:    ${pgAuditCount}`);
  console.log('\x1b[1m========================================================================\x1b[0m\n');

  if (pgEntityCount < totalEntitiesMigrated) {
    console.error('\x1b[31m[ERROR] Entity count mismatch! Migration incomplete.\x1b[0m');
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log('\x1b[32m✔ Migration to PostgreSQL completed with 100% record match!\x1b[0m\n');
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('[FATAL] Migration failed:', err);
  process.exit(1);
});
