const path = require('path');
const { PrismaClient } = require(path.resolve(__dirname, '../packages/database'));
const prisma = new PrismaClient();

async function inspectDb() {
  try {
    const tenants = await prisma.tenant.findMany();
    console.log('Tenants count:', tenants.length);
    console.log('Tenants:', tenants.map(t => ({ id: t.id, name: t.name, domain: t.domain })));

    const users = await prisma.user.findMany({ select: { id: true, email: true, tenantId: true, role: true } });
    console.log('Users count:', users.length);
    console.log('Sample Users:', users.slice(0, 5));

    const contacts = await prisma.contact.count();
    const deals = await prisma.deal.count();
    const invoices = await prisma.invoice.count();
    const payments = await prisma.payment.count();
    const workflows = await prisma.workflow.count();
    const products = await prisma.product.count();

    console.log('Counts:', { contacts, deals, invoices, payments, workflows, products });
  } catch (e) {
    console.error('Error inspecting DB:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
inspectDb();
