import { PrismaClient } from '../packages/database/dist/index.js';
import { execSync } from 'child_process';

const adminPrisma = new PrismaClient({
  datasourceUrl: 'postgresql://postgres:postgres_password@127.0.0.1:5432/postgres?schema=public',
});

async function run() {
  console.log('--- Step 1: Create clean disposable PostgreSQL database ---');
  try {
    await adminPrisma.$executeRawUnsafe('DROP DATABASE IF EXISTS business_os_clean_test WITH (FORCE)');
  } catch (e) {
    console.log('Drop note:', e.message);
  }
  await adminPrisma.$executeRawUnsafe('CREATE DATABASE business_os_clean_test');
  console.log('Created business_os_clean_test database.');

  const cleanDbUrl = 'postgresql://postgres:postgres_password@127.0.0.1:5432/business_os_clean_test?schema=public';

  console.log('--- Step 2: Apply all migrations to clean database using prisma migrate deploy ---');
  const deployOutput = execSync(
    'node packages/database/node_modules/prisma/build/index.js migrate deploy --schema packages/database/prisma/schema.prisma',
    {
      env: { ...process.env, DATABASE_URL: cleanDbUrl },
      encoding: 'utf8',
    }
  );
  console.log('Migrate deploy output:\n', deployOutput);

  console.log('--- Step 3: Verify the resulting schema matches Prisma ---');
  const cleanPrisma = new PrismaClient({ datasourceUrl: cleanDbUrl });
  const migrationsApplied = await cleanPrisma.$queryRawUnsafe(`
    SELECT migration_name, finished_at 
    FROM _prisma_migrations 
    ORDER BY finished_at ASC
  `);
  console.log('Migrations applied on clean DB:', migrationsApplied);

  const mfaCols = await cleanPrisma.$queryRawUnsafe(`
    SELECT column_name, data_type, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'User' AND column_name LIKE 'mfa%'
  `);
  console.log('MFA columns on User in clean DB:', mfaCols);

  const nicheTables = await cleanPrisma.$queryRawUnsafe(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name IN ('NicheEntity', 'NicheAuditLog')
  `);
  console.log('Niche tables in clean DB:', nicheTables);

  // Check diff between clean DB and schema.prisma (should be empty / 0 diff!)
  const diffOutput = execSync(
    'node packages/database/node_modules/prisma/build/index.js migrate diff --from-schema-datamodel packages/database/prisma/schema.prisma --to-url postgresql://postgres:postgres_password@127.0.0.1:5432/business_os_clean_test?schema=public --script',
    { encoding: 'utf8' }
  );
  console.log('Schema diff between schema.prisma and clean DB:\n', diffOutput || '(No difference - 100% matched!)');

  console.log('--- Step 4: Clean up disposable database ---');
  await cleanPrisma.$disconnect();
  await adminPrisma.$executeRawUnsafe('DROP DATABASE business_os_clean_test WITH (FORCE)');
  console.log('Disposable database cleaned up.');

  await adminPrisma.$disconnect();
}

run().catch((err) => {
  console.error('Test clean migration failed:', err);
  process.exit(1);
});
