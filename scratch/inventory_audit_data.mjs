import { PrismaClient } from 'file:///e:/businessos/packages/database/dist/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log('=== TEST-DATA RECONCILIATION INVENTORY ===');
  
  const tenants = await prisma.tenant.findMany({
    select: { id: true, name: true, domain: true, createdAt: true }
  });
  console.log(`Total Tenants: ${tenants.length}`);
  tenants.forEach(t => console.log(`  - [${t.id}] ${t.domain} ("${t.name}")`));

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, tenantId: true }
  });
  console.log(`\nTotal Users: ${users.length}`);
  users.forEach(u => console.log(`  - [${u.id}] ${u.email} (Tenant: ${u.tenantId})`));

  const contacts = await prisma.contact.count();
  const deals = await prisma.deal.count();
  const invoices = await prisma.invoice.count();
  const auditLogs = await prisma.auditLog.count();
  const workflows = await prisma.workflow.count();
  const executions = await prisma.workflowExecution.count();

  console.log(`\nDomain Record Counts:`);
  console.log(`  - Contacts: ${contacts}`);
  console.log(`  - Deals: ${deals}`);
  console.log(`  - Invoices: ${invoices}`);
  console.log(`  - Workflows: ${workflows}`);
  console.log(`  - Workflow Executions: ${executions}`);
  console.log(`  - Audit Logs (Immutable): ${auditLogs}`);

  // Check disposable audit tenants created during audit
  const auditTenants = tenants.filter(t => t.id.startsWith('tenant_audit_'));
  console.log(`\nDisposable Audit Tenants Found: ${auditTenants.length}`);
  for (const at of auditTenants) {
    const c = await prisma.contact.count({ where: { tenantId: at.id } });
    const d = await prisma.deal.count({ where: { tenantId: at.id } });
    const i = await prisma.invoice.count({ where: { tenantId: at.id } });
    const u = await prisma.user.count({ where: { tenantId: at.id } });
    console.log(`  - ${at.id}: ${u} users, ${c} contacts, ${d} deals, ${i} invoices`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
