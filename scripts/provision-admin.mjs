/**
 * Secure Initial Administrator Provisioning & Password Rotation
 * Business OS Production Hardening
 */

import { createRequire } from 'module';
import * as crypto from 'crypto';

const require = createRequire(import.meta.url);
const bcrypt = require('../apps/auth/node_modules/bcryptjs');
const { PrismaClient } = require('../packages/database');

const prisma = new PrismaClient();

console.log('='.repeat(70));
console.log('👑  BUSINESS OS — SECURE ADMINISTRATOR PROVISIONING & ROTATION');
console.log('='.repeat(70));

const args = process.argv.slice(2);
const isRotate = args.includes('--rotate');
const emailArg = args.find(a => a.startsWith('--email='))?.split('=')[1] || 'admin@gmail.com';
const passwordArg = args.find(a => a.startsWith('--password='))?.split('=')[1];
const tenantIdArg = args.find(a => a.startsWith('--tenant='))?.split('=')[1] || 'default-tenant';

function generateSecurePassword(length = 18) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~|}{[]';
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset[bytes[i] % charset.length];
  }
  return result;
}

function validatePasswordPolicy(pwd) {
  if (pwd.length < 14) {
    return { valid: false, reason: 'Password must be at least 14 characters long.' };
  }
  if (!/[A-Z]/.test(pwd)) {
    return { valid: false, reason: 'Password must contain at least one uppercase letter.' };
  }
  if (!/[a-z]/.test(pwd)) {
    return { valid: false, reason: 'Password must contain at least one lowercase letter.' };
  }
  if (!/[0-9]/.test(pwd)) {
    return { valid: false, reason: 'Password must contain at least one number.' };
  }
  if (!/[^a-zA-Z0-9]/.test(pwd)) {
    return { valid: false, reason: 'Password must contain at least one special character.' };
  }
  return { valid: true };
}

async function main() {
  try {
    // 1. Ensure Tenant Exists
    let tenant = await prisma.tenant.findUnique({ where: { id: tenantIdArg } });
    if (!tenant) {
      console.log(`Provisioning baseline tenant: ${tenantIdArg}...`);
      tenant = await prisma.tenant.create({
        data: {
          id: tenantIdArg,
          name: 'Primary Enterprise Organization',
          domain: 'enterprise.crm.local',
        },
      });
      console.log(`✓ Tenant created: ${tenant.id}`);
    }

    // 2. Determine Password
    let rawPassword = passwordArg;
    let wasGenerated = false;

    if (!rawPassword) {
      rawPassword = generateSecurePassword(20);
      wasGenerated = true;
    } else {
      const check = validatePasswordPolicy(rawPassword);
      if (!check.valid) {
        console.error(`❌ Password policy violation: ${check.reason}`);
        process.exit(1);
      }
    }

    // 3. Hash Password with 12 bcrypt salt rounds
    console.log('Hashing administrator password with 12 bcrypt salt rounds...');
    const salt = bcrypt.genSaltSync(12);
    const passwordHash = bcrypt.hashSync(rawPassword, salt);

    // 4. Upsert Admin User
    const existingUser = await prisma.user.findUnique({ where: { email: emailArg } });

    let user;
    if (existingUser) {
      console.log(`Rotating credentials for existing administrator: ${emailArg}...`);
      user = await prisma.user.update({
        where: { email: emailArg },
        data: {
          passwordHash,
          role: 'SUPERADMIN',
          updatedAt: new Date(),
        },
      });
      console.log(`✓ Administrator password rotated successfully! (User ID: ${user.id})`);
    } else {
      console.log(`Provisioning new superadmin user: ${emailArg}...`);
      user = await prisma.user.create({
        data: {
          id: `usr_admin_${Date.now()}`,
          email: emailArg,
          name: 'Super Administrator',
          role: 'SUPERADMIN',
          passwordHash,
          tenantId: tenant.id,
        },
      });
      console.log(`✓ Administrator user provisioned successfully! (User ID: ${user.id})`);
    }

    // 5. Output Security Notice
    console.log('\n' + '='.repeat(70));
    console.log('🔒 SECURE CREDENTIAL DISCLOSURE (ONE-TIME DISPLAY)');
    console.log('='.repeat(70));
    console.log(`  Tenant ID: ${tenant.id}`);
    console.log(`  Email:     ${emailArg}`);
    console.log(`  Password:  ${rawPassword}`);
    console.log(`  Role:      SUPERADMIN`);
    console.log('='.repeat(70));
    console.log('⚠️  Store this password immediately in your secure enterprise password manager.');
    console.log('⚠️  This credential will NOT be shown again or stored in plaintext anywhere.\n');

  } catch (err) {
    console.error('Fatal provisioning error:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
