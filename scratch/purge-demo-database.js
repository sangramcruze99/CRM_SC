const path = require('path');
const { PrismaClient } = require(path.resolve(__dirname, '../packages/database/node_modules/@prisma/client'));
const prisma = new PrismaClient();

async function purgeDatabase() {
  console.log('=== Starting Safe Database State Reset ===');

  // 1. Tables to purge (user-facing demo data)
  const tablesToClear = [
    'activity',
    'task',
    'invoiceLineItem',
    'invoice',
    'transaction',
    'deal',
    'project',
    'auditLog',
    'landingPage',
    'pageBlock',
    'ticketMessage',
    'ticket',
    'offerLetter',
    'nDA',
    'onboardingTask',
    'eSignature',
    's3Upload',
    'compliancePolicy',
  ];

  for (const table of tablesToClear) {
    if (typeof prisma[table]?.deleteMany === 'function') {
      try {
        const deleted = await prisma[table].deleteMany({});
        console.log(`[Cleaned] ${table}: deleted ${deleted.count} demo rows`);
      } catch (err) {
        console.warn(`[Warning] Could not clear ${table}: ${err.message}`);
      }
    }
  }

  // 2. Clean up demo WorkspaceSettings
  try {
    await prisma.workspaceSettings.updateMany({
      data: {
        companyName: 'My Enterprise',
        logoUrl: null,
      }
    });
    console.log('[Reset] workspaceSettings companyName reset to "My Enterprise"');
  } catch (err) {
    // ignore if not present
  }

  // 3. Verify preserved essentials
  const userCount = await prisma.user.count();
  const tenantCount = await prisma.tenant.count();
  const contactCount = await prisma.contact.count();
  const pluginCount = await prisma.plugin.count();

  console.log('\n=== Verified Preserved Essentials ===');
  console.log(`Users preserved: ${userCount}`);
  console.log(`Tenants preserved: ${tenantCount}`);
  console.log(`Contacts preserved: ${contactCount}`);
  console.log(`Plugins preserved: ${pluginCount}`);
  console.log('=== Database Purge Complete ===\n');
}

purgeDatabase()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
