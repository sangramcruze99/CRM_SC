import { PrismaClient } from '../packages/database/dist/index.js';

const p = new PrismaClient({
  datasourceUrl:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres_password@127.0.0.1:5432/business_os?schema=public',
});

async function main() {
  const usersWithMfa = await p.user.findMany({
    where: {
      OR: [
        { mfaEnabled: true },
        { mfaSecret: { not: null } },
      ],
    },
    select: {
      id: true,
      email: true,
      mfaEnabled: true,
      mfaSecret: true,
    },
  });

  console.log(`Found ${usersWithMfa.length} users with MFA enabled or mfaSecret set:`);
  for (const u of usersWithMfa) {
    const isEncrypted = u.mfaSecret ? u.mfaSecret.startsWith('enc:v1:') : false;
    console.log(`- User ID: ${u.id}, Email: ${u.email}, mfaEnabled: ${u.mfaEnabled}, Secret Length: ${u.mfaSecret ? u.mfaSecret.length : 0}, isEncrypted: ${isEncrypted}`);
  }

  await p.$disconnect();
}

main().catch(console.error);
