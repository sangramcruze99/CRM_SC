import { PrismaClient } from '../packages/database/dist/index.js';

const prisma = new PrismaClient({
  datasourceUrl:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres_password@127.0.0.1:5432/business_os?schema=public&connection_limit=10&pool_timeout=10',
});

async function run() {
  const cols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'User' AND column_name LIKE 'mfa%'
  `);
  console.log('User MFA cols in DB:', cols);

  const tables = await prisma.$queryRawUnsafe(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name IN ('NicheEntity', 'NicheAuditLog')
  `);
  console.log('Niche tables in DB:', tables);

  const migrations = await prisma.$queryRawUnsafe(`
    SELECT migration_name, finished_at, rolled_back_at 
    FROM _prisma_migrations 
    ORDER BY finished_at ASC
  `);
  console.log('Prisma migrations recorded in DB:', migrations);

  await prisma.$disconnect();
}

run().catch(console.error);
