const path = require('path');
const { PrismaClient } = require(path.resolve(__dirname, '../packages/database/node_modules/@prisma/client'));
const prisma = new PrismaClient();

async function inspect() {
  console.log('=== Database Row Counts & Samples ===');
  
  const modelKeys = Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_'));
  
  for (const model of modelKeys) {
    if (typeof prisma[model]?.count === 'function') {
      try {
        const count = await prisma[model].count();
        if (count > 0) {
          const sample = await prisma[model].findMany({ take: 3 });
          console.log(`\n[${model}]: ${count} rows`);
          console.log('Sample data:', JSON.stringify(sample, null, 2).slice(0, 300));
        } else {
          console.log(`[${model}]: 0 rows`);
        }
      } catch (err) {
        // model might not support count directly
      }
    }
  }
}

inspect()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
