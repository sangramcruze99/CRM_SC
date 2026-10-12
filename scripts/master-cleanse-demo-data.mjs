import { PrismaClient } from '../packages/database/dist/index.js';
import bcrypt from '../apps/auth/node_modules/bcryptjs/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const prisma = new PrismaClient();

console.log('========================================================================');
console.log('🧹 MASTER COMPREHENSIVE DEMO DATA & SECTION CLEANSER');
console.log('========================================================================\n');

async function cleanAll() {
  try {
    // 1. Ensure Default Tenant & Production Admin exist
    const defaultTenant = await prisma.tenant.upsert({
      where: { id: 'default-tenant' },
      update: {},
      create: {
        id: 'default-tenant',
        name: 'Default Organization',
        domain: 'default.crm.local',
      },
    });
    console.log(`✅ Preserved Root Tenant: ${defaultTenant.name} (${defaultTenant.id})`);

    const passwordHash = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@gmail.com' },
      update: {
        passwordHash,
        tenantId: 'default-tenant',
        role: 'SUPERADMIN',
      },
      create: {
        id: 'usr_default_admin',
        email: 'admin@gmail.com',
        passwordHash,
        name: 'Admin User',
        tenantId: 'default-tenant',
        role: 'SUPERADMIN',
      },
    });
    console.log(`✅ Preserved Superadmin User: ${adminUser.email}`);

    // 2. Delete all non-default / test tenants
    const nonDefaultTenants = await prisma.tenant.findMany({
      where: { id: { not: 'default-tenant' } },
      select: { id: true, name: true },
    });

    if (nonDefaultTenants.length > 0) {
      console.log(`\nRemoving ${nonDefaultTenants.length} synthetic / test tenants:`);
      for (const t of nonDefaultTenants) {
        console.log(`  - Deleting tenant: ${t.name} (${t.id})`);
        await prisma.tenant.delete({ where: { id: t.id } });
      }
    }

    // 3. Clean all transactional & demo tables in dev.db
    console.log('\n--- Purging Demo Records from Database Tables ---');

    const cleanModel = async (modelName, where = {}) => {
      if (prisma[modelName] && typeof prisma[modelName].deleteMany === 'function') {
        try {
          const res = await prisma[modelName].deleteMany({ where });
          if (res.count > 0) {
            console.log(`  ✓ ${modelName.padEnd(25)}: deleted ${res.count} records`);
          } else {
            console.log(`  • ${modelName.padEnd(25)}: already clean (0 records)`);
          }
        } catch (e) {
          console.warn(`  ! ${modelName.padEnd(25)}: ${e.message}`);
        }
      }
    };

    // User data
    await cleanModel('user', { id: { not: 'usr_default_admin' } });
    await cleanModel('activity');
    await cleanModel('contact');
    await cleanModel('company');
    await cleanModel('deal');
    await cleanModel('ticket');
    await cleanModel('task');
    await cleanModel('project');

    // Finance & Invoices
    await cleanModel('invoice');
    await cleanModel('bill');
    await cleanModel('payment');
    await cleanModel('bankTransaction');
    await cleanModel('bankAccount');
    await cleanModel('journalEntry');
    await cleanModel('expense');
    await cleanModel('dailyBusinessRecord');
    await cleanModel('businessJournalEvent');

    // Inventory
    await cleanModel('stockMovement');
    await cleanModel('product');
    await cleanModel('category');
    await cleanModel('supplier');

    // Recruitment / Screening
    await cleanModel('candidateScreeningResult');
    await cleanModel('screeningProfile');

    // Automation Executions & Approvals
    await cleanModel('workflowExecutionStep');
    await cleanModel('workflowExecution');
    await cleanModel('approvalRequest');

    // Workflows: delete temporary / test / verification workflows
    await cleanModel('workflow', {
      OR: [
        { name: { contains: 'Verification' } },
        { name: { contains: 'test' } },
        { name: { contains: 'Test' } },
        { name: { contains: 'temp' } },
        { name: { contains: 'Temp' } },
      ],
    });

    // Documents & Notifications
    await cleanModel('documentReference');
    await cleanModel('document');
    await cleanModel('notification');

    // Telemetry & Audit Logs
    await cleanModel('usageEvent');
    await cleanModel('usageDailyAggregate');
    await cleanModel('auditLog');

    // 4. Reset niche_store.json to clean initial state
    console.log('\n--- Cleaning Industry Sections (niche_store.json) ---');
    const nicheStorePath = path.resolve(ROOT_DIR, 'packages/database/prisma/niche_store.json');
    const cleanNicheStore = {
      hospital: {
        totalBeds: 165,
        patients: [],
        appointments: [],
        prescriptions: [],
      },
      realestate: {
        properties: [],
        showings: [],
        deals: [],
      },
      restaurant: {
        tables: [
          { id: 'T-01', number: 'Table 1', capacity: 2, status: 'AVAILABLE', billTotal: 0 },
          { id: 'T-02', number: 'Table 2', capacity: 4, status: 'AVAILABLE', billTotal: 0 },
          { id: 'T-03', number: 'Table 3', capacity: 4, status: 'AVAILABLE', billTotal: 0 },
          { id: 'T-04', number: 'Table 4', capacity: 6, status: 'AVAILABLE', billTotal: 0 },
          { id: 'T-05', number: 'Table 5', capacity: 8, status: 'AVAILABLE', billTotal: 0 },
          { id: 'T-06', number: 'Table 6 (Patio)', capacity: 4, status: 'AVAILABLE', billTotal: 0 },
          { id: 'T-07', number: 'Table 7 (Patio)', capacity: 4, status: 'AVAILABLE', billTotal: 0 },
          { id: 'T-08', number: 'Table 8 (Chef Booth)', capacity: 6, status: 'AVAILABLE', billTotal: 0 },
        ],
        kitchenOrders: [],
        menuItems: [],
      },
      retail: {
        catalogProducts: [],
        sales: [],
        khataCustomers: [],
      },
      sme: {
        subscriptions: [],
      },
      agency: {
        deliverables: [],
      },
      nicheRecords: {
        construction: [],
        legal: [],
        logistics: [],
        fitness: [],
        automotive: [],
      },
      crm_contacts: [],
      auditLogs: [],
    };

    fs.writeFileSync(nicheStorePath, JSON.stringify(cleanNicheStore, null, 2), 'utf-8');
    console.log(`  ✓ niche_store.json successfully reset to clean schema with 0 demo entities.`);

    // 5. Clean Physical Storage Vault of test files
    console.log('\n--- Cleaning Physical Document Storage Vault ---');
    const vaultPath = path.resolve(ROOT_DIR, 'storage', 'vault');
    if (fs.existsSync(vaultPath)) {
      const t1Path = path.resolve(vaultPath, 't1');
      if (fs.existsSync(t1Path)) {
        fs.rmSync(t1Path, { recursive: true, force: true });
        console.log('  ✓ Removed test tenant storage directory (storage/vault/t1)');
      }
      const defaultTenantVault = path.resolve(vaultPath, 'default-tenant');
      if (fs.existsSync(defaultTenantVault)) {
        fs.rmSync(defaultTenantVault, { recursive: true, force: true });
        fs.mkdirSync(defaultTenantVault, { recursive: true });
        console.log('  ✓ Cleaned demo files from storage/vault/default-tenant');
      }
    }

    // 6. Report Clean Database Status
    console.log('\n========================================================================');
    console.log('📊 PRODUCTION DATABASE STATUS AFTER MASTER CLEANSE');
    console.log('========================================================================');
    const verifyModels = [
      'tenant', 'user', 'contact', 'company', 'deal', 'invoice', 
      'project', 'task', 'activity', 'product', 'bankAccount', 
      'candidateScreeningResult', 'document', 'notification', 'auditLog'
    ];

    for (const m of verifyModels) {
      if (prisma[m]) {
        const count = await prisma[m].count();
        console.log(`  ${m.padEnd(26)} : ${count}`);
      }
    }

    console.log('\n✨ ALL DEMO DATA SUCCESSFULLY REMOVED & ALL SECTIONS CLEANSED!\n');
  } catch (err) {
    console.error('❌ Error during master cleanse:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanAll();
