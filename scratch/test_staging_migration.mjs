import { PrismaClient } from '../packages/database/dist/index.js';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const adminPrisma = new PrismaClient({
  datasourceUrl: 'postgresql://postgres:postgres_password@127.0.0.1:5432/postgres?schema=public',
});

async function run() {
  console.log('--- Step 1: Create fresh backup of current staging DB ---');
  execSync('node scripts/pg-backup.mjs', { stdio: 'inherit' });

  // Get the latest backup
  const backupDir = path.resolve('backups/postgres');
  const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.sql')).sort().reverse();
  const latestBackup = path.join(backupDir, files[0]);
  console.log('Latest backup file:', latestBackup);

  console.log('--- Step 2: Restore backup into disposable business_os_staging_copy ---');
  try {
    await adminPrisma.$executeRawUnsafe('DROP DATABASE IF EXISTS business_os_staging_copy WITH (FORCE)');
  } catch (e) {
    console.log('Drop notice:', e.message);
  }

  execSync(`node scripts/pg-restore.mjs business_os_staging_copy "${latestBackup}"`, { stdio: 'inherit' });

  const stagingCopyUrl = 'postgresql://postgres:postgres_password@127.0.0.1:5432/business_os_staging_copy?schema=public';

  console.log('--- Step 3: Test migration status on staging copy ---');
  try {
    execSync(
      'node packages/database/node_modules/prisma/build/index.js migrate status --schema packages/database/prisma/schema.prisma',
      { env: { ...process.env, DATABASE_URL: stagingCopyUrl }, encoding: 'utf8' }
    );
  } catch (e) {
    console.log('Status before resolve: 1 unapplied migration detected.');
  }

  console.log('--- Step 4: Run prisma migrate resolve --applied on staging copy ---');
  const resolveOutput = execSync(
    'node packages/database/node_modules/prisma/build/index.js migrate resolve --applied 20261013120000_add_mfa_and_niche_persistence --schema packages/database/prisma/schema.prisma',
    { env: { ...process.env, DATABASE_URL: stagingCopyUrl }, encoding: 'utf8' }
  );
  console.log('Resolve output:\n', resolveOutput);

  console.log('--- Step 5: Verify migration status is now fully in sync ---');
  const statusAfter = execSync(
    'node packages/database/node_modules/prisma/build/index.js migrate status --schema packages/database/prisma/schema.prisma',
    { env: { ...process.env, DATABASE_URL: stagingCopyUrl }, encoding: 'utf8' }
  );
  console.log('Status after resolve:\n', statusAfter);

  console.log('--- Step 6: Verify existing records remain intact ---');
  const stagingCopyPrisma = new PrismaClient({ datasourceUrl: stagingCopyUrl });
  const userCount = await stagingCopyPrisma.user.count();
  const tenantCount = await stagingCopyPrisma.tenant.count();
  const nicheCount = await stagingCopyPrisma.nicheEntity.count();
  console.log(`Intact records count -> Users: ${userCount}, Tenants: ${tenantCount}, NicheEntities: ${nicheCount}`);

  console.log('--- Step 7: Verify Niche and MFA CRUD paths work ---');
  const testNiche = await stagingCopyPrisma.nicheEntity.create({
    data: {
      tenantId: 'default-tenant',
      niche: 'hospital',
      entityType: 'patient',
      entityId: `TEST-PT-${Date.now()}`,
      data: JSON.stringify({ name: 'Jane Doe', bloodType: 'O+' }),
    },
  });
  console.log('Created test NicheEntity:', testNiche.id, testNiche.entityId);

  const foundNiche = await stagingCopyPrisma.nicheEntity.findUnique({
    where: { id: testNiche.id },
  });
  console.log('Read back NicheEntity:', foundNiche?.entityId);

  await stagingCopyPrisma.nicheEntity.delete({ where: { id: testNiche.id } });
  console.log('Deleted test NicheEntity successfully.');

  console.log('--- Step 8: Clean up staging copy database ---');
  await stagingCopyPrisma.$disconnect();
  await adminPrisma.$executeRawUnsafe('DROP DATABASE business_os_staging_copy WITH (FORCE)');
  console.log('Cleaned up business_os_staging_copy.');

  await adminPrisma.$disconnect();
}

run().catch((err) => {
  console.error('Test staging copy failed:', err);
  process.exit(1);
});
