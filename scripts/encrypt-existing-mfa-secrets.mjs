#!/usr/bin/env node
/**
 * Safe, reversible data migration script for encrypting legacy plaintext TOTP secrets at rest.
 * Uses AES-256-GCM via @repo/auth encryption module.
 *
 * Usage:
 *   node scripts/encrypt-existing-mfa-secrets.mjs            # Dry-run inspection
 *   node scripts/encrypt-existing-mfa-secrets.mjs --apply    # Execute encryption
 *   node scripts/encrypt-existing-mfa-secrets.mjs --rollback # Reversible recovery from backup
 */

import { PrismaClient } from '../packages/database/dist/index.js';
import {
  encryptMfaSecret,
  isEncryptedMfaSecret,
  decryptMfaSecret,
} from '../packages/auth/dist/index.js';
import * as fs from 'fs';
import * as path from 'path';

if (typeof process.loadEnvFile === 'function') {
  try { process.loadEnvFile('.env'); } catch {}
} else if (fs.existsSync('.env')) {
  for (const line of fs.readFileSync('.env', 'utf8').split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = (match[2] || '').trim().replace(/^["']|["']$/g, '');
    }
  }
}

const prisma = new PrismaClient({
  datasourceUrl:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres_password@127.0.0.1:5432/business_os?schema=public',
});

const isApply = process.argv.includes('--apply');
const isRollback = process.argv.includes('--rollback');
const backupDir = path.resolve('backups/mfa-migration');

async function main() {
  console.log('=== BUSINESS OS: TOTP SECRETS AT REST MIGRATION ===');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  if (isRollback) {
    console.log('Mode: ROLLBACK RECOVERY');
    const backupFiles = fs.readdirSync(backupDir).filter((f) => f.endsWith('.json')).sort().reverse();
    if (backupFiles.length === 0) {
      console.error('No rollback backup files found in', backupDir);
      process.exit(1);
    }
    const latestBackup = path.join(backupDir, backupFiles[0]);
    console.log(`Loading rollback snapshot: ${latestBackup}`);
    const backupData = JSON.parse(fs.readFileSync(latestBackup, 'utf8'));

    let restoredCount = 0;
    for (const record of backupData) {
      await prisma.user.update({
        where: { id: record.id },
        data: { mfaSecret: record.originalSecret },
      });
      restoredCount++;
    }
    console.log(`✓ Successfully restored ${restoredCount} user records from backup.`);
    await prisma.$disconnect();
    return;
  }

  console.log(`Mode: ${isApply ? 'EXECUTE (--apply)' : 'DRY-RUN (Pass --apply to execute)'}`);

  // Query all users with an active MFA secret
  const usersWithMfa = await prisma.user.findMany({
    where: {
      mfaSecret: { not: null },
    },
    select: {
      id: true,
      email: true,
      mfaEnabled: true,
      mfaSecret: true,
    },
  });

  const plaintextUsers = [];
  const alreadyEncryptedUsers = [];

  for (const user of usersWithMfa) {
    if (isEncryptedMfaSecret(user.mfaSecret)) {
      alreadyEncryptedUsers.push(user);
    } else {
      plaintextUsers.push(user);
    }
  }

  console.log(`Total users with MFA secrets: ${usersWithMfa.length}`);
  console.log(`Already encrypted (AES-256-GCM): ${alreadyEncryptedUsers.length}`);
  console.log(`Plaintext records requiring migration: ${plaintextUsers.length}`);

  if (plaintextUsers.length === 0) {
    console.log('✓ All MFA secrets are already encrypted at rest. No action required.');
    await prisma.$disconnect();
    return;
  }

  if (!isApply) {
    console.log('\nDRY-RUN SUMMARY:');
    console.log(`Found ${plaintextUsers.length} user(s) with unencrypted secrets:`);
    for (const u of plaintextUsers) {
      console.log(`  - User ID: ${u.id} (Email: ${u.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')})`);
    }
    console.log('\nTo execute migration and encrypt records at rest, run:');
    console.log('  node scripts/encrypt-existing-mfa-secrets.mjs --apply\n');
    await prisma.$disconnect();
    return;
  }

  // Backup records before modifying
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `mfa_backup_${timestamp}.json`);
  const backupRecords = plaintextUsers.map((u) => ({
    id: u.id,
    originalSecret: u.mfaSecret,
  }));
  fs.writeFileSync(backupFile, JSON.stringify(backupRecords, null, 2), 'utf8');
  console.log(`✓ Reversible recovery backup saved to: ${backupFile}`);

  // Migrate records
  let migratedCount = 0;
  for (const user of plaintextUsers) {
    const encrypted = encryptMfaSecret(user.mfaSecret);

    // Verify round-trip decryption before writing to DB
    const verifiedPlaintext = decryptMfaSecret(encrypted);
    if (verifiedPlaintext !== user.mfaSecret) {
      throw new Error(`Integrity check failed for user ${user.id}: round-trip decryption mismatch!`);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { mfaSecret: encrypted },
    });
    migratedCount++;
  }

  console.log(`\n✓ Migration completed successfully: ${migratedCount} record(s) encrypted with AES-256-GCM at rest.`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Migration failed:', err.message);
  await prisma.$disconnect();
  process.exit(1);
});
