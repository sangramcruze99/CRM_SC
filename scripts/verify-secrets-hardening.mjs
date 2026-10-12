/**
 * Secrets Management & Fail-Closed Validation Test Suite
 * Verifies that all production security invariants hold.
 */

import assert from 'node:assert';
import { validateSecrets, getJwtSecret, maskSecret, KNOWN_INSECURE_SECRETS } from '../packages/auth/dist/index.js';

console.log('='.repeat(70));
console.log('🔐  BUSINESS OS — SECRETS MANAGEMENT & FAIL-CLOSED TEST SUITE');
console.log('='.repeat(70));

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
    failed++;
  }
}

// Save original env
const origEnv = { ...process.env };

try {
  console.log('\n🔍 TEST GROUP 1: Fail-Closed Production Secrets Invariants');

  test('validateSecrets rejects missing JWT_SECRET in production', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.JWT_SECRET;
    const res = validateSecrets();
    assert.strictEqual(res.valid, false);
    assert(res.errors.some(e => e.includes('JWT_SECRET environment variable is missing')));
  });

  test('validateSecrets rejects placeholder JWT_SECRET in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'super-secret-business-os-key';
    const res = validateSecrets();
    assert.strictEqual(res.valid, false);
    assert(res.errors.some(e => e.includes('Known placeholder or default JWT_SECRET detected')));
  });

  test('validateSecrets rejects low-entropy JWT_SECRET in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'short-secret-123';
    const res = validateSecrets();
    assert.strictEqual(res.valid, false);
    assert(res.errors.some(e => e.includes('entropy too low')));
  });

  test('validateSecrets rejects SQLite DATABASE_URL in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'a'.repeat(64);
    process.env.DATABASE_URL = 'file:./dev.db';
    const res = validateSecrets();
    assert.strictEqual(res.valid, false);
    assert(res.errors.some(e => e.includes('SQLite DATABASE_URL detected in production mode')));
  });

  test('validateSecrets accepts compliant 256-bit secret and PostgreSQL in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'ccb144cf00f27e32ca810ced180b5c64d5933be8340034d1b1adc1ce57c9d739';
    process.env.DATABASE_URL = 'postgresql://postgres:pass@localhost:5432/business_os?schema=public';
    const res = validateSecrets();
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.errors.length, 0);
  });

  console.log('\n🔍 TEST GROUP 2: getJwtSecret() Fail-Closed Execution');

  test('getJwtSecret throws FATAL SECURITY ERROR in production when secret is placeholder', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'super-secret-business-os-key';
    assert.throws(
      () => getJwtSecret(),
      /FATAL SECURITY ERROR/
    );
  });

  test('getJwtSecret returns valid secret in compliant production environment', () => {
    process.env.NODE_ENV = 'production';
    const validSecret = 'ccb144cf00f27e32ca810ced180b5c64d5933be8340034d1b1adc1ce57c9d739';
    process.env.JWT_SECRET = validSecret;
    const result = getJwtSecret();
    assert.strictEqual(result, validSecret);
  });

  console.log('\n🔍 TEST GROUP 3: Secret Masking & Safe Logging');

  test('maskSecret correctly redacts credentials without leaking entropy', () => {
    assert.strictEqual(maskSecret(''), '[UNSET]');
    assert.strictEqual(maskSecret('12345'), '********');
    assert.strictEqual(maskSecret('sk_live_1234567890abcdef'), 'sk_l...cdef');
  });

} finally {
  // Restore original env
  process.env = origEnv;
}

console.log('='.repeat(70));
console.log(`📊 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('='.repeat(70));

if (failed > 0) {
  process.exit(1);
} else {
  console.log('✅ ALL SECRETS HARDENING TESTS VERIFIED SUCCESSFULLY!\n');
}
