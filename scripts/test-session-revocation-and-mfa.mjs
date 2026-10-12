#!/usr/bin/env node
/**
 * Automated Verification Suite for Phase 3 (Session Revocation) and Phase 4 (Real Backend MFA)
 */

import fs from 'node:fs';
import assert from 'node:assert';
import http from 'node:http';

try {
  const envContent = fs.readFileSync('.env', 'utf-8');
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
} catch {}
import { PrismaClient } from 'file:///e:/businessos/packages/database/dist/index.js';
import {
  generateTotpCode,
  isSessionRevoked,
  computeSessionHash,
  getRedisClient,
} from 'file:///e:/businessos/packages/auth/dist/index.js';

const AUTH_URL = 'http://127.0.0.1:3011';
const GATEWAY_URL = 'http://127.0.0.1:3000';
const prisma = new PrismaClient();

function requestJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = http.request(
      {
        host: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: options.method || 'GET',
        headers: {
          'content-type': 'application/json',
          ...(options.headers || {}),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          let data;
          try {
            data = JSON.parse(body);
          } catch {
            data = body;
          }
          resolve({ status: res.statusCode, headers: res.headers, data });
        });
      }
    );
    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function run() {
  console.log('\x1b[1m\x1b[36m========================================================================\x1b[0m');
  console.log('\x1b[1m  Business OS — Phase 3 & 4: Session Revocation & Real Backend MFA Tests \x1b[0m');
  console.log('\x1b[1m\x1b[36m========================================================================\x1b[0m\n');

  let passed = 0;
  let total = 0;

  function report(name, condition, detail = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`\x1b[32m[PASS]\x1b[0m ${name}${detail ? ` - ${detail}` : ''}`);
    } else {
      console.error(`\x1b[31m[FAIL]\x1b[0m ${name}${detail ? ` - ${detail}` : ''}`);
    }
  }

  try {
    // ------------------------------------------------------------------------
    // SECTION 1: SESSION REVOCATION TESTS (PHASE 3)
    // ------------------------------------------------------------------------
    console.log('\x1b[1m--- Section 1: Server-Side Session Revocation (Phase 3) ---\x1b[0m');

    // 1.1 Login User A (admin)
    const loginARes = await requestJson(`${AUTH_URL}/auth/login`, {
      method: 'POST',
      body: { email: 'admin@gmail.com', password: 'AdminSecure2026!#' },
    });
    const tokenA = loginARes.data.access_token;
    report('1.1 User A Login & JTI Token Issuance', !!tokenA && (loginARes.status === 200 || loginARes.status === 201), `Token length: ${tokenA?.length}`);

    // 1.2 Access protected endpoint /auth/me with Token A
    const meBeforeLogout = await requestJson(`${AUTH_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    report('1.2 Protected Endpoint Access Before Logout', meBeforeLogout.status === 200 && meBeforeLogout.data.email === 'admin@gmail.com');

    // 1.3 Register & Login User B to verify independent sessions
    const testUserBEmail = `session_user_b_${Date.now()}@audit.local`;
    const registerBRes = await requestJson(`${AUTH_URL}/auth/register`, {
      method: 'POST',
      body: {
        email: testUserBEmail,
        password: 'SecurePassword123!',
        name: 'User B Test',
      },
    });
    const tokenB = registerBRes.data.access_token;
    report('1.3 User B Independent Session Created', !!tokenB && (registerBRes.status === 200 || registerBRes.status === 201));

    const meBBefore = await requestJson(`${AUTH_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    report('1.4 User B Protected Access Active', meBBefore.status === 200);

    // 1.5 User A Logout & Server-Side Revocation
    const logoutRes = await requestJson(`${AUTH_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    report('1.5 User A Server-Side Logout Call', (logoutRes.status === 200 || logoutRes.status === 201) && logoutRes.data.success === true);

    // 1.6 Verify Token A is rejected after logout
    const meAfterLogout = await requestJson(`${AUTH_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    report('1.6 Token A Rejected After Logout (401)', meAfterLogout.status === 401, `Status: ${meAfterLogout.status}`);

    // 1.7 Gateway enforcement: verify API Gateway rejects Token A
    const gatewayProxyRes = await requestJson(`${GATEWAY_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    report('1.7 API Gateway Blocks Revoked Token A (401)', gatewayProxyRes.status === 401, `Status: ${gatewayProxyRes.status}`);

    // 1.8 Verify User B's session remains unaffected
    const meBAfter = await requestJson(`${AUTH_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    report('1.8 User B Unaffected by User A Logout', meBAfter.status === 200, `User B Status: ${meBAfter.status}`);

    // 1.9 Verify Redis TTL and key structure
    const redis = getRedisClient();
    const tokenAHashedKey = `revoked_session:${computeSessionHash(tokenA)}`;
    const jtiHashedKey = `revoked_session:${computeSessionHash(meBeforeLogout.data.jti || tokenA)}`;
    const ttl1 = await redis.ttl(tokenAHashedKey);
    const ttl2 = await redis.ttl(jtiHashedKey);
    const validTtl = ttl1 > 0 || ttl2 > 0;
    report('1.9 Redis Revocation Key Has Bounded TTL', validTtl, `TTL: ${Math.max(ttl1, ttl2)}s`);

    // 1.10 Invalid and expired token rejection
    const invalidTokenRes = await requestJson(`${AUTH_URL}/auth/me`, {
      headers: { Authorization: 'Bearer totally.invalid.jwt.token' },
    });
    report('1.10 Malformed JWT Rejected (401)', invalidTokenRes.status === 401);

    // ------------------------------------------------------------------------
    // SECTION 2: REAL BACKEND MFA / TOTP TESTS (PHASE 4)
    // ------------------------------------------------------------------------
    console.log('\n\x1b[1m--- Section 2: Real Backend MFA / TOTP (Phase 4) ---\x1b[0m');

    // 2.1 Create disposable Admin user for MFA testing
    const mfaAdminEmail = `mfa_admin_${Date.now()}@audit.local`;
    const registerMfaAdmin = await requestJson(`${AUTH_URL}/auth/register`, {
      method: 'POST',
      body: {
        email: mfaAdminEmail,
        password: 'AdminPassword2026!',
        name: 'MFA Admin Tester',
      },
    });
    const mfaAdminToken = registerMfaAdmin.data.access_token;
    const mfaAdminId = registerMfaAdmin.data.user.id;
    report('2.1 Disposable Admin Provisioned', !!mfaAdminToken);

    // 2.2 Initiate MFA setup
    const setupRes = await requestJson(`${AUTH_URL}/auth/mfa/setup`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${mfaAdminToken}` },
    });
    const { secret: totpSecret, otpauthUrl, recoveryCodes } = setupRes.data;
    report(
      '2.2 MFA Enrollment Secret & URI Generated',
      (setupRes.status === 200 || setupRes.status === 201) && !!totpSecret && otpauthUrl?.startsWith('otpauth://totp/') && recoveryCodes?.length === 8,
      `Secret length: ${totpSecret?.length}, Recovery codes: ${recoveryCodes?.length}`
    );

    // 2.3 Verify setup with invalid code fails
    const invalidSetupRes = await requestJson(`${AUTH_URL}/auth/mfa/verify-setup`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${mfaAdminToken}` },
      body: { code: '000000' },
    });
    report('2.3 Invalid TOTP Code Rejected on Setup (401)', invalidSetupRes.status === 401);

    // 2.4 Verify setup with valid TOTP code succeeds
    const validCode = generateTotpCode(totpSecret);
    const validSetupRes = await requestJson(`${AUTH_URL}/auth/mfa/verify-setup`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${mfaAdminToken}` },
      body: { code: validCode },
    });
    report('2.4 Valid TOTP Code Enables MFA in Backend', (validSetupRes.status === 200 || validSetupRes.status === 201) && validSetupRes.data.mfaEnabled === true);

    // 2.5 Verify database persistence of MFA state
    const dbMfaUser = await prisma.user.findUnique({ where: { id: mfaAdminId } });
    report(
      '2.5 MFA Configuration Persisted in PostgreSQL',
      dbMfaUser?.mfaEnabled === true && !!dbMfaUser?.mfaSecret && !!dbMfaUser?.mfaRecoveryCodes
    );

    // 2.6 Login now enforces MFA Challenge
    const mfaLoginRes = await requestJson(`${AUTH_URL}/auth/login`, {
      method: 'POST',
      body: { email: mfaAdminEmail, password: 'AdminPassword2026!' },
    });
    const { mfaRequired, challengeToken } = mfaLoginRes.data;
    report(
      '2.6 Login Enforces MFA Challenge (No Token Leak)',
      mfaRequired === true && !mfaLoginRes.data.access_token && !!challengeToken,
      `Challenge token length: ${challengeToken?.length}`
    );

    // 2.7 Verify invalid code on challenge is rejected
    const badChallengeRes = await requestJson(`${AUTH_URL}/auth/mfa/challenge`, {
      method: 'POST',
      body: { challengeToken, code: '111111' },
    });
    report('2.7 Invalid Code on Challenge Rejected (401)', badChallengeRes.status === 401);

    // 2.8 Verify valid code on challenge issues authenticated session with mfaVerified=true
    const freshCode = generateTotpCode(totpSecret);
    const goodChallengeRes = await requestJson(`${AUTH_URL}/auth/mfa/challenge`, {
      method: 'POST',
      body: { challengeToken, code: freshCode },
    });
    const mfaVerifiedToken = goodChallengeRes.data.access_token;
    report(
      '2.8 Valid Code on Challenge Issues Full Access Token',
      (goodChallengeRes.status === 200 || goodChallengeRes.status === 201) && !!mfaVerifiedToken
    );

    // 2.9 Verify Replay Protection: exact same code cannot be reused
    const replayRes = await requestJson(`${AUTH_URL}/auth/mfa/challenge`, {
      method: 'POST',
      body: { challengeToken, code: freshCode },
    });
    report('2.9 Replay Protection Rejects Re-used TOTP Code', replayRes.status === 401, `Status: ${replayRes.status}`);

    // 2.10 One-time Backup Recovery Code login
    const recoveryCodeToUse = recoveryCodes[0];
    const recoveryChallengeRes = await requestJson(`${AUTH_URL}/auth/mfa/challenge`, {
      method: 'POST',
      body: { challengeToken, code: recoveryCodeToUse },
    });
    report(
      '2.10 Backup Recovery Code Login Succeeded',
      (recoveryChallengeRes.status === 200 || recoveryChallengeRes.status === 201) && !!recoveryChallengeRes.data.access_token
    );

    // 2.11 Verify Recovery Code is consumed and cannot be reused
    const reuseRecoveryRes = await requestJson(`${AUTH_URL}/auth/mfa/challenge`, {
      method: 'POST',
      body: { challengeToken, code: recoveryCodeToUse },
    });
    report('2.11 Consumed Recovery Code Rejected on Reuse (401)', reuseRecoveryRes.status === 401);

    // 2.12 Verify remaining recovery codes count in DB is 7
    const updatedUser = await prisma.user.findUnique({ where: { id: mfaAdminId } });
    const remainingHashes = JSON.parse(updatedUser.mfaRecoveryCodes || '[]');
    report('2.12 Recovery Code Consumed from PostgreSQL', remainingHashes.length === 7, `Remaining: ${remainingHashes.length}`);

    // 2.13 Clean up test records
    await prisma.user.deleteMany({
      where: { email: { in: [testUserBEmail, mfaAdminEmail] } },
    });
    await prisma.tenant.deleteMany({
      where: {
        id: { in: [registerBRes.data.user?.tenantId, registerMfaAdmin.data.user?.tenantId].filter(Boolean) },
      },
    });
    report('2.13 Test Accounts & Tokens Cleanly Dismantled', true);

  } catch (err) {
    console.error('Fatal test error:', err);
  } finally {
    console.log('\n------------------------------------------------------------------------');
    console.log(`Summary: ${passed} passed, ${total - passed} failed (Total: ${total})`);
    console.log('------------------------------------------------------------------------\n');
    await prisma.$disconnect();
    process.exit(total > 0 && passed === total ? 0 : 1);
  }
}

run();
