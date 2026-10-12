#!/usr/bin/env node
/**
 * BUSINESS OS — INDEPENDENT APPLICATION SECURITY AUDIT TEST SUITE
 * Rigorous negative verification for Session Revocation, Backend MFA,
 * Race Conditions, Direct Microservice Guards, and Privilege Boundaries.
 */

import fs from 'node:fs';
import http from 'node:http';

// Load .env
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
  getRedisClient,
} from 'file:///e:/businessos/packages/auth/dist/index.js';

const AUTH_URL = 'http://127.0.0.1:3011';
const GATEWAY_URL = 'http://127.0.0.1:3000';
const CRM_URL = 'http://127.0.0.1:3001';
const SALES_URL = 'http://127.0.0.1:3005';
const FINANCE_URL = 'http://127.0.0.1:3015';

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
  console.log('\x1b[1m\x1b[35m========================================================================================\x1b[0m');
  console.log('\x1b[1m  BUSINESS OS — INDEPENDENT APPLICATION SECURITY AUDIT & NEGATIVE REGRESSION SUITE       \x1b[0m');
  console.log('\x1b[1m\x1b[35m========================================================================================\x1b[0m\n');

  let passed = 0;
  let total = 0;

  function report(name, condition, detail = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`\x1b[32m[PASS]\x1b[0m ${name}${detail ? ` — ${detail}` : ''}`);
    } else {
      console.error(`\x1b[31m[FAIL]\x1b[0m ${name}${detail ? ` — ${detail}` : ''}`);
    }
  }

  const testSuffix = Date.now();
  const testUserEmail = `audit_sec_${testSuffix}@example.local`;
  let testUserId = null;
  let userToken = null;
  let totpSecret = null;
  let recoveryCodes = [];
  let challengeToken = null;

  try {
    // ------------------------------------------------------------------------
    // SECTION 1: PROVISIONING & MFA REGISTRATION TAMPERING DEFENSE
    // ------------------------------------------------------------------------
    console.log('\x1b[1m--- Suite 1: Registration Parameter Tampering & MFA Setup ---\x1b[0m');

    // 1.1 Attempt to register with client-supplied MFA flags to bypass setup
    const regRes = await requestJson(`${AUTH_URL}/auth/register`, {
      method: 'POST',
      body: {
        email: testUserEmail,
        password: 'AuditSecurePassword2026!#',
        name: 'Sec Audit User',
        mfaEnabled: true,
        mfaSecret: 'MALICIOUS_PRESET_SECRET',
      },
    });

    userToken = regRes.data.access_token;
    testUserId = regRes.data.user?.id;
    report('1.1 User Self-Registration', regRes.status === 200 || regRes.status === 201);

    // Verify in DB that client-supplied MFA flags were ignored
    const dbUserBeforeSetup = await prisma.user.findUnique({ where: { id: testUserId } });
    report(
      '1.2 Client-Supplied MFA Flags Strictly Ignored',
      dbUserBeforeSetup.mfaEnabled === false && dbUserBeforeSetup.mfaSecret === null,
      'mfaEnabled is false, mfaSecret is null'
    );

    // 1.3 Setup MFA for test user
    const setupRes = await requestJson(`${AUTH_URL}/auth/mfa/setup`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    totpSecret = setupRes.data.secret;
    recoveryCodes = setupRes.data.recoveryCodes;
    report('1.3 MFA Enrollment Initiated', setupRes.status === 200 || setupRes.status === 201, `Codes: ${recoveryCodes?.length}`);

    // 1.4 Activate MFA with valid TOTP
    const activateCode = generateTotpCode(totpSecret);
    const verifySetupRes = await requestJson(`${AUTH_URL}/auth/mfa/verify-setup`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: { code: activateCode },
    });
    report('1.4 MFA Setup Verified & Activated in DB', verifySetupRes.status === 200 || verifySetupRes.status === 201);

    // ------------------------------------------------------------------------
    // SECTION 2: MFA CHALLENGE TOKEN SCOPE & BOUNDARY ENFORCEMENT
    // ------------------------------------------------------------------------
    console.log('\n\x1b[1m--- Suite 2: Challenge Token Scope & Boundary Enforcement ---\x1b[0m');

    // 2.1 Login returns challenge token, not full session
    const challengeLoginRes = await requestJson(`${AUTH_URL}/auth/login`, {
      method: 'POST',
      body: { email: testUserEmail, password: 'AuditSecurePassword2026!#' },
    });
    challengeToken = challengeLoginRes.data.challengeToken;
    report(
      '2.1 Login Issues Intermediate Challenge Token (No Full Token)',
      challengeLoginRes.data.mfaRequired === true && !!challengeToken && !challengeLoginRes.data.access_token
    );

    // 2.2 Rejection of challenge token at Auth /auth/me
    const authMeChallengeRes = await requestJson(`${AUTH_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${challengeToken}` },
    });
    report(
      '2.2 Challenge Token Rejected at Auth Microservice (/auth/me)',
      authMeChallengeRes.status === 401,
      `Status: ${authMeChallengeRes.status}`
    );

    // 2.3 Rejection of challenge token at Gateway proxy (/api/v1/crm/contacts)
    const gwCrmChallengeRes = await requestJson(`${GATEWAY_URL}/api/v1/crm/contacts`, {
      headers: { Authorization: `Bearer ${challengeToken}` },
    });
    report(
      '2.3 Challenge Token Rejected at API Gateway Proxy',
      gwCrmChallengeRes.status === 401,
      `Status: ${gwCrmChallengeRes.status}`
    );

    // 2.4 Rejection of challenge token directly on CRM microservice (:3001)
    const crmDirectChallengeRes = await requestJson(`${CRM_URL}/contacts`, {
      headers: { Authorization: `Bearer ${challengeToken}` },
    });
    report(
      '2.4 Challenge Token Rejected Directly on CRM Microservice (:3001)',
      crmDirectChallengeRes.status === 401,
      `Status: ${crmDirectChallengeRes.status}`
    );

    // 2.5 Rejection of challenge token directly on Sales microservice (:3004)
    const salesDirectChallengeRes = await requestJson(`${SALES_URL}/deals`, {
      headers: { Authorization: `Bearer ${challengeToken}` },
    });
    report(
      '2.5 Challenge Token Rejected Directly on Sales Microservice (:3004)',
      salesDirectChallengeRes.status === 401,
      `Status: ${salesDirectChallengeRes.status}`
    );

    // 2.6 Rejection of challenge token directly on Finance microservice (:3005)
    const finDirectChallengeRes = await requestJson(`${FINANCE_URL}/invoices`, {
      headers: { Authorization: `Bearer ${challengeToken}` },
    });
    report(
      '2.6 Challenge Token Rejected Directly on Finance Microservice (:3005)',
      finDirectChallengeRes.status === 401,
      `Status: ${finDirectChallengeRes.status}`
    );

    // ------------------------------------------------------------------------
    // SECTION 3: CONCURRENT TOTP VERIFICATION & REPLAY ELIMINATION
    // ------------------------------------------------------------------------
    console.log('\n\x1b[1m--- Suite 3: Race Condition & Concurrent Replay Defenses ---\x1b[0m');

    // 3.1 Concurrent TOTP Verification (2 parallel requests with same code)
    const concurrentTotpCode = generateTotpCode(totpSecret);
    const [resTotp1, resTotp2] = await Promise.all([
      requestJson(`${AUTH_URL}/auth/mfa/challenge`, {
        method: 'POST',
        body: { challengeToken, code: concurrentTotpCode },
      }),
      requestJson(`${AUTH_URL}/auth/mfa/challenge`, {
        method: 'POST',
        body: { challengeToken, code: concurrentTotpCode },
      }),
    ]);

    const totpStatuses = [resTotp1.status, resTotp2.status];
    const exactlyOneTotpSuccess = totpStatuses.includes(200) || totpStatuses.includes(201);
    const atLeastOneTotp401 = totpStatuses.includes(401);
    report(
      '3.1 Concurrent TOTP Verification Race Condition Handled (Atomic Lock)',
      exactlyOneTotpSuccess && atLeastOneTotp401,
      `Statuses: ${totpStatuses.join(', ')}`
    );

    // 3.2 Sequential replay of same TOTP code
    const sequentialTotpReplay = await requestJson(`${AUTH_URL}/auth/mfa/challenge`, {
      method: 'POST',
      body: { challengeToken, code: concurrentTotpCode },
    });
    report(
      '3.2 Sequential TOTP Replay Blocked (401)',
      sequentialTotpReplay.status === 401,
      `Status: ${sequentialTotpReplay.status}`
    );

    // 3.3 Concurrent Recovery Code Verification (2 parallel requests with same recovery code)
    const recoveryCodeToTest = recoveryCodes[0];
    const [resRec1, resRec2] = await Promise.all([
      requestJson(`${AUTH_URL}/auth/mfa/challenge`, {
        method: 'POST',
        body: { challengeToken, code: recoveryCodeToTest },
      }),
      requestJson(`${AUTH_URL}/auth/mfa/challenge`, {
        method: 'POST',
        body: { challengeToken, code: recoveryCodeToTest },
      }),
    ]);

    const recStatuses = [resRec1.status, resRec2.status];
    const exactlyOneRecSuccess = recStatuses.includes(200) || recStatuses.includes(201);
    const atLeastOneRec401 = recStatuses.includes(401);
    report(
      '3.3 Concurrent Recovery Code Race Condition Handled (Atomic Single-Use)',
      exactlyOneRecSuccess && atLeastOneRec401,
      `Statuses: ${recStatuses.join(', ')}`
    );

    // 3.4 Subsequent reuse of the same recovery code
    const recReuseRes = await requestJson(`${AUTH_URL}/auth/mfa/challenge`, {
      method: 'POST',
      body: { challengeToken, code: recoveryCodeToTest },
    });
    report(
      '3.4 Subsequent Recovery Code Reuse Blocked (401)',
      recReuseRes.status === 401,
      `Status: ${recReuseRes.status}`
    );

    // ------------------------------------------------------------------------
    // SECTION 4: MFA BRUTE-FORCE RATE LIMITING & LOCKOUT
    // ------------------------------------------------------------------------
    console.log('\n\x1b[1m--- Suite 4: Multi-Instance Rate Limiting & Lockout ---\x1b[0m');

    // Send 5 invalid codes sequentially
    let lastBadStatus = 0;
    for (let i = 0; i < 5; i++) {
      const badAttempt = await requestJson(`${AUTH_URL}/auth/mfa/challenge`, {
        method: 'POST',
        body: { challengeToken, code: '000000' },
      });
      lastBadStatus = badAttempt.status;
    }
    report('4.1 5 Failed MFA Attempts Recorded', lastBadStatus === 401);

    // 6th attempt should be blocked by rate limit lockout
    const lockedAttempt = await requestJson(`${AUTH_URL}/auth/mfa/challenge`, {
      method: 'POST',
      body: { challengeToken, code: '000000' },
    });
    report(
      '4.2 6th Attempt Enforces Rate-Limit Lockout',
      lockedAttempt.status === 401 && (lockedAttempt.data.message?.includes('Locked') || lockedAttempt.data.message?.includes('Too many')),
      `Message: ${lockedAttempt.data.message}`
    );

    // Clear lockout key in Redis for test teardown
    const redis = getRedisClient();
    await redis.del(`mfa_attempts:${testUserId}`);

    // ------------------------------------------------------------------------
    // SECTION 5: DOWNSTREAM DIRECT MICROSERVICE REVOCATION VERIFICATION
    // ------------------------------------------------------------------------
    console.log('\n\x1b[1m--- Suite 5: Downstream Microservice Direct Revocation Enforcement ---\x1b[0m');

    // 5.1 Obtain fresh authenticated session for test user using unused recovery code
    const validRecoveryCode = recoveryCodes[1];
    const freshLoginChallenge = await requestJson(`${AUTH_URL}/auth/login`, {
      method: 'POST',
      body: { email: testUserEmail, password: 'AuditSecurePassword2026!#' },
    });
    const freshTokenRes = await requestJson(`${AUTH_URL}/auth/mfa/challenge`, {
      method: 'POST',
      body: { challengeToken: freshLoginChallenge.data.challengeToken, code: validRecoveryCode },
    });
    const activeToken = freshTokenRes.data.access_token;
    report('5.1 Fresh Authenticated Token Acquired', !!activeToken);

    // 5.2 Verify activeToken works directly on CRM (:3001)
    const crmBeforeLogout = await requestJson(`${CRM_URL}/contacts`, {
      headers: { Authorization: `Bearer ${activeToken}` },
    });
    report('5.2 Token Accepted Directly on CRM Microservice (:3001)', crmBeforeLogout.status === 200);

    // 5.3 Verify activeToken works directly on Sales (:3004)
    const salesBeforeLogout = await requestJson(`${SALES_URL}/deals`, {
      headers: { Authorization: `Bearer ${activeToken}` },
    });
    report('5.3 Token Accepted Directly on Sales Microservice (:3004)', salesBeforeLogout.status === 200);

    // 5.4 Call server-side logout
    const logoutRes = await requestJson(`${AUTH_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${activeToken}` },
    });
    report('5.4 Logout Endpoint Executed (Session Revoked in Redis)', logoutRes.status === 200 || logoutRes.status === 201);

    // 5.5 Repeated Logout Idempotency (calling logout a second time does not fail or crash)
    const repeatLogoutRes = await requestJson(`${AUTH_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${activeToken}` },
    });
    report(
      '5.5 Repeated Logout Safely Handled (Idempotent)',
      repeatLogoutRes.status === 401 || repeatLogoutRes.status === 200,
      `Status: ${repeatLogoutRes.status}`
    );

    // 5.6 Directly call CRM microservice (:3001) with revoked token — MUST RETURN 401
    const crmAfterRevoke = await requestJson(`${CRM_URL}/contacts`, {
      headers: { Authorization: `Bearer ${activeToken}` },
    });
    report(
      '5.6 Direct CRM Microservice (:3001) Rejects Revoked Token (401)',
      crmAfterRevoke.status === 401,
      `Status: ${crmAfterRevoke.status}`
    );

    // 5.7 Directly call Sales microservice (:3004) with revoked token — MUST RETURN 401
    const salesAfterRevoke = await requestJson(`${SALES_URL}/deals`, {
      headers: { Authorization: `Bearer ${activeToken}` },
    });
    report(
      '5.7 Direct Sales Microservice (:3004) Rejects Revoked Token (401)',
      salesAfterRevoke.status === 401,
      `Status: ${salesAfterRevoke.status}`
    );

    // 5.8 Directly call Finance microservice (:3005) with revoked token — MUST RETURN 401
    const finAfterRevoke = await requestJson(`${FINANCE_URL}/invoices`, {
      headers: { Authorization: `Bearer ${activeToken}` },
    });
    report(
      '5.8 Direct Finance Microservice (:3005) Rejects Revoked Token (401)',
      finAfterRevoke.status === 401,
      `Status: ${finAfterRevoke.status}`
    );

    // ------------------------------------------------------------------------
    // SECTION 6: MFA RESET / DISABLE SECURITY FLOW
    // ------------------------------------------------------------------------
    console.log('\n\x1b[1m--- Suite 6: MFA Disable Security Flow ---\x1b[0m');

    // Login again with another recovery code to test disable flow
    const disableLoginChallenge = await requestJson(`${AUTH_URL}/auth/login`, {
      method: 'POST',
      body: { email: testUserEmail, password: 'AuditSecurePassword2026!#' },
    });
    const disableTokenRes = await requestJson(`${AUTH_URL}/auth/mfa/challenge`, {
      method: 'POST',
      body: { challengeToken: disableLoginChallenge.data.challengeToken, code: recoveryCodes[2] },
    });
    const disableToken = disableTokenRes.data.access_token;

    // 6.1 Disable with wrong password
    const disableBadPass = await requestJson(`${AUTH_URL}/auth/mfa/disable`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${disableToken}` },
      body: { password: 'WrongPassword!', code: generateTotpCode(totpSecret) },
    });
    report('6.1 Disable MFA with Wrong Password Rejected (401)', disableBadPass.status === 401);

    // 6.2 Disable with wrong TOTP code
    const disableBadCode = await requestJson(`${AUTH_URL}/auth/mfa/disable`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${disableToken}` },
      body: { password: 'AuditSecurePassword2026!#', code: '000000' },
    });
    report('6.2 Disable MFA with Wrong TOTP Code Rejected (401)', disableBadCode.status === 401);

    // 6.3 Disable with valid password + valid TOTP code
    const disableGood = await requestJson(`${AUTH_URL}/auth/mfa/disable`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${disableToken}` },
      body: { password: 'AuditSecurePassword2026!#', code: generateTotpCode(totpSecret) },
    });
    report('6.3 Disable MFA with Valid Credentials Succeeded', disableGood.status === 200 || disableGood.status === 201);

    // Verify in DB that MFA is disabled
    const userAfterDisable = await prisma.user.findUnique({ where: { id: testUserId } });
    report(
      '6.4 PostgreSQL User Record Confirms MFA Disabled',
      userAfterDisable.mfaEnabled === false && userAfterDisable.mfaSecret === null,
      'mfaEnabled: false, secret cleared'
    );

    // ------------------------------------------------------------------------
    // TEARDOWN
    // ------------------------------------------------------------------------
    console.log('\n🧹 Cleaning up test user and staging artifacts...');
    await prisma.user.deleteMany({ where: { id: testUserId } });
    await prisma.tenant.deleteMany({ where: { id: regRes.data.user?.tenantId } });
    report('Clean Teardown of Staging Test User & Tenant', true);

  } catch (err) {
    console.error('Audit execution error:', err);
  } finally {
    console.log('\n========================================================================================');
    console.log(`\x1b[1mAUDIT TEST RESULTS: ${passed} PASSED / ${total - passed} FAILED (Total: ${total})\x1b[0m`);
    console.log('========================================================================================\n');
    await prisma.$disconnect();
    process.exit(total > 0 && passed === total ? 0 : 1);
  }
}

run();
