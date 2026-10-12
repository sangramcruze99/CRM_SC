import { PrismaClient } from '../packages/database/dist/index.js';

const p = new PrismaClient({
  datasourceUrl: 'postgresql://postgres:postgres_password@127.0.0.1:5432/postgres?schema=public',
});

async function main() {
  try {
    await p.$executeRawUnsafe('CREATE DATABASE business_os_shadow');
    console.log('Created business_os_shadow DB successfully');
  } catch (e) {
    console.log('Shadow DB notice:', e.message);
  } finally {
    await p.$disconnect();
  }
}

main();
