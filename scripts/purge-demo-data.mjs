import { PrismaClient } from '../packages/database/dist/index.js';
import bcrypt from '../apps/auth/node_modules/bcryptjs/index.js';

const prisma = new PrismaClient();

console.log('========================================================================');
console.log('🧹 MASTER DATABASE DEMO DATA PURGE & SYSTEM INTEGRITY CLEANSER');
console.log('========================================================================\n');

async function purge() {
  try {
    // 1. Ensure default tenant exists
    const defaultTenant = await prisma.tenant.upsert({
      where: { id: 'default-tenant' },
      update: {},
      create: {
        id: 'default-tenant',
        name: 'Default Organization',
        domain: 'default.crm.local',
      },
    });
    console.log(`✅ Verified production tenant: ${defaultTenant.name} (${defaultTenant.id})`);

    // 2. Ensure real admin user is seeded with bcrypt password in SQLite
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
    console.log(`✅ Verified real admin user in database: ${adminUser.email} (Role: ${adminUser.role})`);

    // 3. Identify synthetic test tenants to purge
    const demoTenantIds = [
      'tenant_sales_dept_test',
      'tenant-1',
      'tenant-2',
      'tenant_prod_audit_alpha',
      'tenant_prod_audit_beta',
      'tenant_prod_finance_alpha',
    ];

    console.log('\n--- Purging Synthetic Test Data ---');
    for (const tenantId of demoTenantIds) {
      const existingTenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
      if (!existingTenant) continue;

      console.log(`Purging demo tenant: ${existingTenant.name} (${tenantId})...`);

      // Delete associated test records
      if (prisma.activity) {
        const deletedActivities = await prisma.activity.deleteMany({ where: { tenantId } });
        if (deletedActivities.count > 0) console.log(`  - Deleted ${deletedActivities.count} test activities`);
      }
      if (prisma.deal) {
        const deletedDeals = await prisma.deal.deleteMany({ where: { tenantId } });
        if (deletedDeals.count > 0) console.log(`  - Deleted ${deletedDeals.count} test deals`);
      }
      if (prisma.contact) {
        // Keep non-synthetic contacts if any, but in test tenants delete them
        const deletedContacts = await prisma.contact.deleteMany({ where: { tenantId } });
        if (deletedContacts.count > 0) console.log(`  - Deleted ${deletedContacts.count} test contacts`);
      }
      if (prisma.invoice) {
        const deletedInvoices = await prisma.invoice.deleteMany({ where: { tenantId } });
        if (deletedInvoices.count > 0) console.log(`  - Deleted ${deletedInvoices.count} test invoices`);
      }
      if (prisma.ticket) {
        const deletedTickets = await prisma.ticket.deleteMany({ where: { tenantId } });
        if (deletedTickets.count > 0) console.log(`  - Deleted ${deletedTickets.count} test tickets`);
      }
      if (prisma.project) {
        const projects = await prisma.project.findMany({ where: { tenantId }, select: { id: true } });
        const projectIds = projects.map((p) => p.id);
        if (projectIds.length > 0 && prisma.task) {
          const deletedTasks = await prisma.task.deleteMany({ where: { projectId: { in: projectIds } } });
          if (deletedTasks.count > 0) console.log(`  - Deleted ${deletedTasks.count} test tasks`);
        }
        const deletedProjects = await prisma.project.deleteMany({ where: { tenantId } });
        if (deletedProjects.count > 0) console.log(`  - Deleted ${deletedProjects.count} test projects`);
      }

      // Finally delete the tenant
      await prisma.tenant.delete({ where: { id: tenantId } });
      console.log(`  ✅ Demo tenant ${tenantId} completely removed.`);
    }

    // 4. Report remaining clean production database state
    console.log('\n--- Production Database Record Counts ---');
    const models = ['tenant', 'user', 'contact', 'company', 'deal', 'invoice', 'ticket', 'project', 'task', 'activity'];
    for (const m of models) {
      if (prisma[m]) {
        const count = await prisma[m].count();
        console.log(`${m.padEnd(15)} : ${count}`);
      }
    }

    console.log('\n🎉 DATABASE PURGE COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Database purge error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

purge();
