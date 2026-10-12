import { PrismaClient } from 'file:///e:/businessos/packages/database/dist/index.js';

const prisma = new PrismaClient();

async function main() {
  const cols = await prisma.$queryRawUnsafe(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'User' AND column_name LIKE 'mfa%'`
  );
  console.log('PostgreSQL MFA columns:', cols);
}

main().catch(console.error).finally(() => prisma.$disconnect());
