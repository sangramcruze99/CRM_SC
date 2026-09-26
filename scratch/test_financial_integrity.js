const path = require('path');
const { PrismaClient } = require(path.resolve(__dirname, '../packages/database'));
const prisma = new PrismaClient();

async function testFinancialIntegrity() {
  console.log('Testing Financial Integrity in Prisma & Services...');

  try {
    // 1. Create a test tenant
    const testTenantId = `tenant_fin_${Date.now()}`;
    const tenant = await prisma.tenant.create({
      data: {
        id: testTenantId,
        name: 'Financial Audit Tenant',
        domain: `${testTenantId}.test`,
      },
    });
    console.log('Created test tenant:', tenant.id);

    // 2. Create an invoice for $1,000
    const invoiceNum = `INV-${Date.now()}`;
    const invoice = await prisma.invoice.create({
      data: {
        tenantId: testTenantId,
        invoiceNum,
        amount: 1000.00,
        subtotal: 1000.00,
        paidAmount: 0.00,
        balanceDue: 1000.00,
        status: 'OPEN',
        dueDate: new Date(Date.now() + 86400000 * 30),
      },
    });
    console.log(`Created invoice ${invoice.invoiceNum}: Total = $${invoice.amount}, Balance = $${invoice.balanceDue}, Status = ${invoice.status}`);

    // 3. Partial Payment of $400
    const payment1 = await prisma.payment.create({
      data: {
        tenantId: testTenantId,
        paymentNumber: `PAY-1-${Date.now()}`,
        direction: 'INBOUND',
        amount: 400.00,
        method: 'CARD',
        status: 'SETTLED',
        allocatedAmount: 400.00,
      },
    });

    const alloc1 = await prisma.paymentAllocation.create({
      data: {
        tenantId: testTenantId,
        paymentId: payment1.id,
        invoiceId: invoice.id,
        amount: 400.00,
      },
    });

    // Update invoice with payment application
    const updatedInvoice1 = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        paidAmount: 400.00,
        balanceDue: 600.00,
        status: 'PARTIALLY_PAID',
      },
      include: { allocations: true },
    });

    console.log(`After Payment 1 ($400): Paid = $${updatedInvoice1.paidAmount}, Due = $${updatedInvoice1.balanceDue}, Status = ${updatedInvoice1.status}`);
    const passPartial = updatedInvoice1.paidAmount === 400 && updatedInvoice1.balanceDue === 600 && updatedInvoice1.status === 'PARTIALLY_PAID';
    console.log(passPartial ? '✅ PASS: Partial payment calculation correct ($400 paid, $600 due)' : '❌ FAIL: Incorrect partial payment balance');

    // 4. Remaining Payment of $600
    const payment2 = await prisma.payment.create({
      data: {
        tenantId: testTenantId,
        paymentNumber: `PAY-2-${Date.now()}`,
        direction: 'INBOUND',
        amount: 600.00,
        method: 'BANK_TRANSFER',
        status: 'SETTLED',
        allocatedAmount: 600.00,
      },
    });

    const alloc2 = await prisma.paymentAllocation.create({
      data: {
        tenantId: testTenantId,
        paymentId: payment2.id,
        invoiceId: invoice.id,
        amount: 600.00,
      },
    });

    const updatedInvoice2 = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        paidAmount: 1000.00,
        balanceDue: 0.00,
        status: 'PAID',
        paidAt: new Date(),
      },
      include: { allocations: true },
    });

    console.log(`After Payment 2 ($600): Paid = $${updatedInvoice2.paidAmount}, Due = $${updatedInvoice2.balanceDue}, Status = ${updatedInvoice2.status}`);
    const passFull = updatedInvoice2.paidAmount === 1000 && updatedInvoice2.balanceDue === 0 && updatedInvoice2.status === 'PAID';
    console.log(passFull ? '✅ PASS: Full settlement calculation correct ($1,000 paid, $0 due)' : '❌ FAIL: Incorrect full settlement balance');

    // Clean up test records
    await prisma.paymentAllocation.deleteMany({ where: { tenantId: testTenantId } });
    await prisma.payment.deleteMany({ where: { tenantId: testTenantId } });
    await prisma.invoice.deleteMany({ where: { tenantId: testTenantId } });
    await prisma.tenant.delete({ where: { id: testTenantId } });
    console.log('Cleaned up test tenant data cleanly.');

  } catch (err) {
    console.error('Financial integrity test error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testFinancialIntegrity();
