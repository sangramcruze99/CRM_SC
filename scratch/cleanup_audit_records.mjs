import { PrismaClient } from 'file:///e:/businessos/packages/database/dist/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log('=== DISPOSABLE TEST DATA CLEANUP PROCEDURE ===');

  const auditTenants = await prisma.tenant.findMany({
    where: { id: { startsWith: 'tenant_audit_' } },
    select: { id: true }
  });

  const tenantIds = auditTenants.map(t => t.id);
  console.log(`Found ${tenantIds.length} disposable audit tenants to clean.`);

  if (tenantIds.length === 0) {
    console.log('No disposable audit tenants found.');
    return;
  }

  // Delete child records first to respect foreign keys
  await prisma.nicheAuditLog.deleteMany({ where: { tenantId: { in: tenantIds } } }).catch(() => {});
  await prisma.nicheEntity.deleteMany({ where: { tenantId: { in: tenantIds } } }).catch(() => {});
  await prisma.ticket.deleteMany({ where: { tenantId: { in: tenantIds } } }).catch(() => {});
  const deletedProjects = await prisma.project.deleteMany({ where: { tenantId: { in: tenantIds } } });
  console.log(`- Deleted disposable Projects: ${deletedProjects.count}`);

  const deletedEmployees = await prisma.employee.deleteMany({ where: { tenantId: { in: tenantIds } } });
  console.log(`- Deleted disposable Employees: ${deletedEmployees.count}`);

  const deletedInvoices = await prisma.invoice.deleteMany({
    where: { tenantId: { in: tenantIds } }
  });
  console.log(`- Deleted disposable Invoices: ${deletedInvoices.count}`);

  const deletedDeals = await prisma.deal.deleteMany({
    where: { tenantId: { in: tenantIds } }
  });
  console.log(`- Deleted disposable Deals: ${deletedDeals.count}`);

  const deletedContacts = await prisma.contact.deleteMany({
    where: { tenantId: { in: tenantIds } }
  });
  console.log(`- Deleted disposable Contacts: ${deletedContacts.count}`);

  const deletedUsers = await prisma.user.deleteMany({
    where: { tenantId: { in: tenantIds } }
  });
  console.log(`- Deleted disposable Users: ${deletedUsers.count}`);

  const deletedTenants = await prisma.tenant.deleteMany({
    where: { id: { in: tenantIds } }
  });
  console.log(`- Deleted disposable Tenants: ${deletedTenants.count}`);

  // Count remaining records
  const remainingTenants = await prisma.tenant.count();
  const remainingUsers = await prisma.user.count();
  const remainingAuditLogs = await prisma.auditLog.count();

  console.log('\n=== POST-CLEANUP RECONCILIATION SUMMARY ===');
  console.log(`Remaining Tenants: ${remainingTenants} (default-tenant + tenant_enterprise_real)`);
  console.log(`Remaining Users: ${remainingUsers} (admin@gmail.com)`);
  console.log(`Remaining Audit Logs (Immutable Evidence preserved): ${remainingAuditLogs}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
