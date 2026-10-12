#!/usr/bin/env node
/**
 * BUSINESS OS — RELEASE BLOCKER REMEDIATION VERIFICATION SUITE
 * 
 * Validates the 3 critical release blockers:
 * 1. Authentication boundaries in Billing, Notifications, Portal, Storage, and Events.
 * 2. Versioned Prisma migration for MFA and Niche persistence.
 * 3. Authenticated AES-256-GCM encryption for TOTP secrets at rest.
 */

import * as crypto from 'crypto';
import { PrismaClient } from '../packages/database/dist/index.js';
import {
  encryptMfaSecret,
  decryptMfaSecret,
  isEncryptedMfaSecret,
  resolveMfaSecret,
  rotateMfaSecretKey,
  getMfaEncryptionKey,
  generateTotpSecret,
  generateTotpCode,
  verifyTotpCode,
  generateOtpauthUrl,
  generateRecoveryCodes,
  getJwtSecret,
} from '../packages/auth/dist/index.js';
import jwt from 'jsonwebtoken';

if (typeof process.loadEnvFile === 'function') {
  try { process.loadEnvFile('.env'); } catch {}
}

const prisma = new PrismaClient({
  datasourceUrl:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres_password@127.0.0.1:5432/business_os?schema=public',
});

const PORTS = {
  billing: 3027,
  notifications: 3028,
  portal: 3029,
  storage: 3031,
  events: 3032,
  gateway: 3000,
  auth: 3011,
};

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`\x1b[32m[PASS]\x1b[0m ${message}`);
  } else {
    failed++;
    console.error(`\x1b[31m[FAIL]\x1b[0m ${message}`);
  }
}

function makeToken(payload, secret = getJwtSecret()) {
  return jwt.sign(payload, secret, { algorithm: 'HS256' });
}

async function fetchJson(url, options = {}) {
  try {
    const res = await fetch(url, options);
    let body;
    const text = await res.text();
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
    return { status: res.status, headers: res.headers, body };
  } catch (err) {
    return { status: 0, error: err.message };
  }
}

async function testBlocker1AuthBoundaries() {
  console.log('\n=============================================================');
  console.log('BLOCKER 1: AUTHENTICATION BOUNDARIES & TENANT SCOPING');
  console.log('=============================================================');

  const tenantA = 'tenant-alpha-001';
  const tenantB = 'tenant-beta-002';

  const userTokenTenantA = makeToken({
    sub: 'user-alpha',
    email: 'alpha@enterprise.com',
    role: 'USER',
    tenantId: tenantA,
    jti: `session-${Date.now()}-alpha`,
  });

  const adminToken = makeToken({
    sub: 'user-admin',
    email: 'admin@enterprise.com',
    role: 'ADMIN',
    tenantId: tenantA,
    jti: `session-${Date.now()}-admin`,
  });

  const mfaChallengeToken = makeToken({
    sub: 'user-challenge',
    email: 'challenge@enterprise.com',
    typ: 'mfa_challenge',
    tenantId: tenantA,
  });

  // 1. BILLING SERVICE (port 3027)
  console.log('\n--- 1.1 Billing Service (port 3027) ---');
  
  // Public routes: health, plans
  const billingHealth = await fetchJson(`http://127.0.0.1:${PORTS.billing}/billing/health`);
  assert(billingHealth.status === 200 && billingHealth.body?.status === 'ok', 'Billing GET /billing/health is public (200 OK)');

  const billingPlan = await fetchJson(`http://127.0.0.1:${PORTS.billing}/billing/plan`);
  assert(billingPlan.status === 200, 'Billing GET /billing/plan is public catalog (200 OK)');

  // Protected route: entitlements anonymous check
  const billingEntitlementsAnon = await fetchJson(`http://127.0.0.1:${PORTS.billing}/billing/entitlements`);
  assert(billingEntitlementsAnon.status === 401, 'Billing GET /billing/entitlements rejects anonymous callers (401 Unauthorized)');

  // Protected route with MFA challenge token (must be rejected)
  const billingEntitlementsChallenge = await fetchJson(`http://127.0.0.1:${PORTS.billing}/billing/entitlements`, {
    headers: { Authorization: `Bearer ${mfaChallengeToken}` },
  });
  assert(billingEntitlementsChallenge.status === 401, 'Billing GET /billing/entitlements rejects MFA challenge tokens (401 Unauthorized)');

  // Protected route with valid user token
  const billingEntitlementsUser = await fetchJson(`http://127.0.0.1:${PORTS.billing}/billing/entitlements`, {
    headers: { Authorization: `Bearer ${userTokenTenantA}` },
  });
  assert(billingEntitlementsUser.status === 200, 'Billing GET /billing/entitlements succeeds with valid JWT (200 OK)');

  // Admin route with standard user token (must be forbidden)
  const billingAdminUser = await fetchJson(`http://127.0.0.1:${PORTS.billing}/admin/billing/tenants`, {
    headers: { Authorization: `Bearer ${userTokenTenantA}` },
  });
  assert(billingAdminUser.status === 403, 'Billing GET /admin/billing/tenants rejects standard non-admin user (403 Forbidden)');

  // Admin route with admin token
  const billingAdminAdmin = await fetchJson(`http://127.0.0.1:${PORTS.billing}/admin/billing/tenants`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(billingAdminAdmin.status === 200, 'Billing GET /admin/billing/tenants succeeds for verified ADMIN role (200 OK)');

  // Cross-tenant spoofing attempt (Token is tenantA, header claims tenantB)
  const billingSpoof = await fetchJson(`http://127.0.0.1:${PORTS.billing}/billing/entitlements`, {
    headers: {
      Authorization: `Bearer ${userTokenTenantA}`,
      'X-Tenant-Id': tenantB,
    },
  });
  assert(billingSpoof.status === 401, 'Billing rejects cross-tenant spoofing attempt via header mismatch (401 Unauthorized)');

  // 1.2 Stripe Webhook security
  console.log('\n--- 1.2 Stripe Webhook Security ---');
  // Missing signature
  const webhookNoSig = await fetchJson(`http://127.0.0.1:${PORTS.billing}/billing/stripe/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 'evt_test_1', type: 'customer.subscription.created' }),
  });
  assert(webhookNoSig.status === 400, 'Stripe webhook rejects request missing stripe-signature header (400 Bad Request)');

  // Invalid HMAC signature
  const webhookBadSig = await fetchJson(`http://127.0.0.1:${PORTS.billing}/billing/stripe/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': 't=1700000000,v1=bad_signature_digest_000000000000000000000000000000000000000000000000',
    },
    body: JSON.stringify({ id: 'evt_test_2', type: 'customer.subscription.created' }),
  });
  assert(webhookBadSig.status === 400, 'Stripe webhook rejects invalid HMAC signature (400 Bad Request)');

  // Replay attack protection (timestamp outside 300s window)
  const expiredTimestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_business_os_placeholder_webhook_secret';
  const payloadStr = JSON.stringify({ id: 'evt_test_replay', type: 'customer.subscription.created' });
  const expiredSig = crypto.createHmac('sha256', webhookSecret).update(`${expiredTimestamp}.${payloadStr}`).digest('hex');
  const webhookReplay = await fetchJson(`http://127.0.0.1:${PORTS.billing}/billing/stripe/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': `t=${expiredTimestamp},v1=${expiredSig}`,
    },
    body: payloadStr,
  });
  assert(webhookReplay.status === 400, 'Stripe webhook rejects replayed timestamp outside 5-minute tolerance window (400 Bad Request)');

  // Valid webhook signature and idempotency
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const testEventId = `evt_valid_${Date.now()}`;
  const validPayload = JSON.stringify({ id: testEventId, type: 'payment_intent.succeeded' });
  const validSig = crypto.createHmac('sha256', webhookSecret).update(`${currentTimestamp}.${validPayload}`).digest('hex');
  const webhookValid1 = await fetchJson(`http://127.0.0.1:${PORTS.billing}/billing/stripe/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': `t=${currentTimestamp},v1=${validSig}`,
    },
    body: validPayload,
  });
  assert([200, 201].includes(webhookValid1.status) && webhookValid1.body?.received === true, 'Stripe webhook accepts validly signed HMAC payload (200/201 OK)');

  // Re-send same event id (idempotency check)
  const webhookValid2 = await fetchJson(`http://127.0.0.1:${PORTS.billing}/billing/stripe/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': `t=${currentTimestamp},v1=${validSig}`,
    },
    body: validPayload,
  });
  assert([200, 201].includes(webhookValid2.status) && webhookValid2.body?.idempotent === true, 'Stripe webhook duplicate handled idempotently (status: IGNORED_DUPLICATE)');

  // 2. NOTIFICATIONS SERVICE (port 3028)
  console.log('\n--- 2. Notifications Service (port 3028) ---');
  const notifHealth = await fetchJson(`http://127.0.0.1:${PORTS.notifications}/notifications/health`);
  assert(notifHealth.status === 200 && notifHealth.body?.status === 'ok', 'Notifications GET /notifications/health is public (200 OK)');

  const notifAnon = await fetchJson(`http://127.0.0.1:${PORTS.notifications}/notifications`);
  assert(notifAnon.status === 401, 'Notifications GET /notifications rejects anonymous requests (401 Unauthorized)');

  const notifUser = await fetchJson(`http://127.0.0.1:${PORTS.notifications}/notifications`, {
    headers: { Authorization: `Bearer ${userTokenTenantA}` },
  });
  assert(notifUser.status === 200, 'Notifications GET /notifications succeeds with valid token (200 OK)');

  // 3. PORTAL SERVICE (port 3029)
  console.log('\n--- 3. Portal Service (port 3029) ---');
  const portalHealth = await fetchJson(`http://127.0.0.1:${PORTS.portal}/portal/health`);
  assert(portalHealth.status === 200 && portalHealth.body?.status === 'ok', 'Portal GET /portal/health is public (200 OK)');

  const portalAnon = await fetchJson(`http://127.0.0.1:${PORTS.portal}/portal/invoices`);
  assert(portalAnon.status === 401, 'Portal GET /portal/invoices rejects anonymous requests (401 Unauthorized)');

  const portalUser = await fetchJson(`http://127.0.0.1:${PORTS.portal}/portal/invoices`, {
    headers: { Authorization: `Bearer ${userTokenTenantA}` },
  });
  assert(portalUser.status === 200, 'Portal GET /portal/invoices succeeds with valid token (200 OK)');

  // 4. STORAGE SERVICE (port 3031)
  console.log('\n--- 4. Storage Service (port 3031) ---');
  const storageHealth = await fetchJson(`http://127.0.0.1:${PORTS.storage}/storage/health`);
  assert(storageHealth.status === 200 && storageHealth.body?.status === 'ok', 'Storage GET /storage/health is public (200 OK)');

  const storageAnon = await fetchJson(`http://127.0.0.1:${PORTS.storage}/storage/assets`);
  assert(storageAnon.status === 401, 'Storage GET /storage/assets rejects anonymous requests (401 Unauthorized)');

  const storageUser = await fetchJson(`http://127.0.0.1:${PORTS.storage}/storage/assets`, {
    headers: { Authorization: `Bearer ${userTokenTenantA}` },
  });
  assert(storageUser.status === 200, 'Storage GET /storage/assets succeeds with valid token (200 OK)');

  // 5. EVENTS SERVICE (port 3032)
  console.log('\n--- 5. Events Service (port 3032) ---');
  const eventsHealth = await fetchJson(`http://127.0.0.1:${PORTS.events}/events/health`);
  assert(eventsHealth.status === 200 && eventsHealth.body?.status === 'ok', 'Events GET /events/health is public (200 OK)');

  const eventsAnon = await fetchJson(`http://127.0.0.1:${PORTS.events}/events/history`);
  assert(eventsAnon.status === 401, 'Events GET /events/history rejects anonymous requests (401 Unauthorized)');

  const eventsUser = await fetchJson(`http://127.0.0.1:${PORTS.events}/events/history`, {
    headers: { Authorization: `Bearer ${userTokenTenantA}` },
  });
  assert(eventsUser.status === 200, 'Events GET /events/history succeeds with valid token (200 OK)');

  const eventsSubUser = await fetchJson(`http://127.0.0.1:${PORTS.events}/events/subscribers`, {
    headers: { Authorization: `Bearer ${userTokenTenantA}` },
  });
  assert(eventsSubUser.status === 403, 'Events GET /events/subscribers rejects standard user without admin role (403 Forbidden)');

  const eventsSubAdmin = await fetchJson(`http://127.0.0.1:${PORTS.events}/events/subscribers`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(eventsSubAdmin.status === 200, 'Events GET /events/subscribers succeeds with verified ADMIN token (200 OK)');
}

async function testBlocker2VersionedMigration() {
  console.log('\n=============================================================');
  console.log('BLOCKER 2: VERSIONED PRISMA MIGRATION (MFA & NICHE)');
  console.log('=============================================================');

  // Verify migrations table in PostgreSQL
  const migrations = await prisma.$queryRawUnsafe(`
    SELECT migration_name, finished_at 
    FROM _prisma_migrations 
    ORDER BY finished_at ASC
  `);
  
  const migrationNames = migrations.map((m) => m.migration_name);
  assert(
    migrationNames.includes('20261012161012_init_postgresql'),
    'Baseline migration 20261012161012_init_postgresql is recorded in database'
  );
  assert(
    migrationNames.includes('20261013120000_add_mfa_and_niche_persistence'),
    'Versioned migration 20261013120000_add_mfa_and_niche_persistence is recorded in database'
  );

  // Verify User table columns
  const userColumns = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'User' AND column_name IN ('mfaEnabled', 'mfaSecret', 'mfaRecoveryCodes')
  `);
  assert(userColumns.length === 3, 'User table contains all 3 MFA columns (mfaEnabled, mfaSecret, mfaRecoveryCodes)');

  // Verify NicheEntity & NicheAuditLog tables
  const nicheTables = await prisma.$queryRawUnsafe(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name IN ('NicheEntity', 'NicheAuditLog')
  `);
  assert(nicheTables.length === 2, 'PostgreSQL contains both NicheEntity and NicheAuditLog tables');

  // Verify Niche CRUD functionality via Prisma
  const testNicheRecord = await prisma.nicheEntity.upsert({
    where: {
      tenantId_niche_entityType_entityId: {
        tenantId: 'test-tenant-verify',
        niche: 'hospital',
        entityType: 'patient',
        entityId: 'PT-VERIFY-99',
      },
    },
    update: { data: JSON.stringify({ name: 'Verification Patient', active: true }) },
    create: {
      tenantId: 'test-tenant-verify',
      niche: 'hospital',
      entityType: 'patient',
      entityId: 'PT-VERIFY-99',
      data: JSON.stringify({ name: 'Verification Patient', active: true }),
    },
  });
  assert(testNicheRecord.id && testNicheRecord.entityId === 'PT-VERIFY-99', 'Prisma successfully creates/upserts record in NicheEntity table');

  const retrievedNiche = await prisma.nicheEntity.findUnique({
    where: { id: testNicheRecord.id },
  });
  assert(retrievedNiche?.entityId === 'PT-VERIFY-99', 'Prisma successfully queries persisted NicheEntity record');

  await prisma.nicheEntity.delete({ where: { id: testNicheRecord.id } });
  assert(true, 'Prisma successfully deletes test NicheEntity record');
}

async function testBlocker3TotpSecretEncryption() {
  console.log('\n=============================================================');
  console.log('BLOCKER 3: TOTP SECRETS AUTHENTICATED ENCRYPTION AT REST');
  console.log('=============================================================');

  const sampleSecret = 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP'; // 32-char Base32 seed
  const key = getMfaEncryptionKey();
  assert(key && key.length === 32, 'MFA encryption key is active and strictly 256 bits (32 bytes)');

  // 1. Encrypt / Decrypt round trip
  const ciphertext = encryptMfaSecret(sampleSecret);
  assert(ciphertext.startsWith('enc:v1:'), 'Ciphertext uses versioned format with enc:v1: prefix');
  assert(ciphertext !== sampleSecret, 'Ciphertext differs completely from plaintext Base32 seed');

  const decrypted = decryptMfaSecret(ciphertext);
  assert(decrypted === sampleSecret, 'AES-256-GCM decrypts cleanly back to exact plaintext seed');

  // 2. Tamper resistance
  const parts = ciphertext.split(':');
  // Corrupt last character of ciphertext
  const tamperedCiphertext = `${parts[0]}:${parts[1]}:${parts[2]}:${parts[3]}:${parts[4].slice(0, -2)}ff`;
  let tamperCaught = false;
  try {
    decryptMfaSecret(tamperedCiphertext);
  } catch (err) {
    tamperCaught = true;
  }
  assert(tamperCaught, 'Tampered ciphertext fails AES-256-GCM authentication tag verification safely');

  // Corrupt authentication tag
  const tamperedTag = `${parts[0]}:${parts[1]}:${parts[2]}:00000000000000000000000000000000:${parts[4]}`;
  let tagCaught = false;
  try {
    decryptMfaSecret(tamperedTag);
  } catch (err) {
    tagCaught = true;
  }
  assert(tagCaught, 'Tampered auth tag fails authentication safely without silent corruption');

  // 3. Incorrect key fails safely
  const wrongKey = crypto.randomBytes(32);
  let wrongKeyCaught = false;
  try {
    decryptMfaSecret(ciphertext, wrongKey);
  } catch (err) {
    wrongKeyCaught = true;
  }
  assert(wrongKeyCaught, 'Decryption with wrong key fails safely with authentication error');

  // 4. Key rotation support
  const newKey = crypto.randomBytes(32);
  const rotatedCiphertext = rotateMfaSecretKey(ciphertext, key, newKey);
  assert(rotatedCiphertext.startsWith('enc:v1:'), 'Rotated ciphertext has valid versioned format');
  const decryptedWithNewKey = decryptMfaSecret(rotatedCiphertext, newKey);
  assert(decryptedWithNewKey === sampleSecret, 'Rotated ciphertext decrypts perfectly with new key');

  // 5. Database check: Verify all stored MFA secrets in PostgreSQL are encrypted
  const dbUsers = await prisma.user.findMany({
    where: { mfaSecret: { not: null } },
    select: { id: true, mfaSecret: true },
  });
  const unencryptedDbUsers = dbUsers.filter((u) => !isEncryptedMfaSecret(u.mfaSecret));
  assert(
    unencryptedDbUsers.length === 0,
    `Zero plaintext MFA secrets in database (all ${dbUsers.length} records start with enc:v1:)`
  );

  // 6. End-to-end MFA Enrollment, Encrypted Storage, and Challenge Verification
  console.log('\n--- 3.2 End-to-End Encrypted MFA Flow in Auth Service ---');
  const testEmail = `verify_mfa_${Date.now()}@test.internal`;
  const testPassword = 'SecurePassword2026!';
  
  // Register new user
  const regRes = await fetchJson(`http://127.0.0.1:${PORTS.auth}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword, name: 'MFA Test User' }),
  });
  assert(regRes.status === 201 && regRes.body?.user?.id, 'User registration succeeds (201 Created)');
  const newUserId = regRes.body.user.id;
  const userToken = regRes.body.access_token;

  // Setup MFA
  const setupRes = await fetchJson(`http://127.0.0.1:${PORTS.auth}/auth/mfa/setup`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
  });
  assert(setupRes.status === 201 && setupRes.body?.secret, 'MFA setup initiates and returns one-time enrollment secret');
  const enrollmentSecret = setupRes.body.secret;

  // Generate 6-digit TOTP code
  const totpCode = generateTotpCode(enrollmentSecret);

  // Verify & Enable MFA
  const verifyRes = await fetchJson(`http://127.0.0.1:${PORTS.auth}/auth/mfa/verify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code: totpCode }),
  });
  assert([200, 201].includes(verifyRes.status) && verifyRes.body?.mfaEnabled === true, 'MFA setup verified and enabled (200/201 OK)');

  // Inspect database directly to verify secret is stored encrypted
  const storedUser = await prisma.user.findUnique({
    where: { id: newUserId },
    select: { mfaEnabled: true, mfaSecret: true },
  });
  assert(
    storedUser?.mfaEnabled === true && storedUser?.mfaSecret?.startsWith('enc:v1:'),
    'Database record contains AES-256-GCM encrypted ciphertext (enc:v1:...), NEVER plaintext seed'
  );

  // Login requires MFA challenge
  const loginRes = await fetchJson(`http://127.0.0.1:${PORTS.auth}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });
  assert(
    [200, 201].includes(loginRes.status) && loginRes.body?.mfaRequired === true && loginRes.body?.challengeToken,
    'Login returns intermediate MFA challenge token (mfaRequired: true)'
  );
  const challengeToken = loginRes.body.challengeToken;

  // Solve MFA challenge with new TOTP code
  const currentTotp = generateTotpCode(enrollmentSecret);
  const challengeRes = await fetchJson(`http://127.0.0.1:${PORTS.auth}/auth/mfa/challenge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ challengeToken, code: currentTotp }),
  });
  assert(
    [200, 201].includes(challengeRes.status) && challengeRes.body?.access_token && !challengeRes.body.user?.mfaSecret,
    'MFA challenge verification succeeds with decrypted secret; user payload never exposes secret seed'
  );

  // Clean up test user
  await prisma.user.delete({ where: { id: newUserId } });
  assert(true, 'Test MFA user cleaned up successfully');
}

async function main() {
  console.log('=============================================================');
  console.log('BUSINESS OS: TARGETED RELEASE BLOCKER VERIFICATION');
  console.log('=============================================================');

  try {
    await testBlocker1AuthBoundaries();
    await testBlocker2VersionedMigration();
    await testBlocker3TotpSecretEncryption();

    console.log('\n=============================================================');
    console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('=============================================================');

    await prisma.$disconnect();
    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
