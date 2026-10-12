#!/usr/bin/env node
/**
 * Phase 3 Automated Verification Suite:
 * Production Redis 8+, BullMQ Distributed Queues, DLQ & Socket.IO Horizontal Clustering
 */

import assert from 'node:assert';
import crypto from 'node:crypto';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || 'business_os_redis_secure_pass_2026';
const AUTOMATION_URL = 'http://localhost:3009';
const AUTH_URL = 'http://localhost:3011';

// Dynamic import of ioredis from chat
let Redis;
try {
  const ioredisPkg = await import('../apps/chat/node_modules/ioredis/built/index.js');
  Redis = ioredisPkg.default || ioredisPkg;
} catch {
  const ioredisFallback = await import('ioredis');
  Redis = ioredisFallback.default || ioredisFallback;
}

let testsPassed = 0;
let testsFailed = 0;

async function runTest(name, fn) {
  process.stdout.write(`  ▶ ${name} ... `);
  try {
    await fn();
    console.log('\x1b[32m✔ PASS\x1b[0m');
    testsPassed++;
  } catch (err) {
    console.log(`\x1b[31m✖ FAIL\x1b[0m\n    ${err.message}`);
    testsFailed++;
  }
}

async function getAdminToken() {
  const res = await fetch(`${AUTH_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@gmail.com',
      password: 'AdminSecure2026!#',
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to login as admin: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.access_token;
}

console.log('\x1b[1m\x1b[36m========================================================================\x1b[0m');
console.log('\x1b[1m  Business OS — Phase 3: Redis 8+, BullMQ & Distributed Infrastructure  \x1b[0m');
console.log('\x1b[1m\x1b[36m========================================================================\x1b[0m\n');

// ----------------------------------------------------------------------------
// SUITE 1: Redis Authentication & Operational Parameters
// ----------------------------------------------------------------------------
console.log('\x1b[1m🔍 SUITE 1: Redis Authentication & Operational Hardening\x1b[0m');

await runTest('Redis Auth: Authenticated client receives PONG', async () => {
  const client = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    lazyConnect: true,
  });
  await client.connect();
  const pong = await client.ping();
  assert.strictEqual(pong, 'PONG');
  await client.quit();
});

await runTest('Redis Auth: Unauthenticated connection is rejected (NOAUTH)', async () => {
  const response = await new Promise((resolve, reject) => {
    const s = net.createConnection({ host: REDIS_HOST, port: REDIS_PORT }, () => {
      s.write('PING\r\n');
    });
    s.on('data', (d) => {
      s.end();
      resolve(d.toString());
    });
    s.on('error', reject);
  });
  assert.match(response, /NOAUTH/i);
});

await runTest('Redis Auth: Incorrect password is rejected (WRONGPASS)', async () => {
  const response = await new Promise((resolve, reject) => {
    const s = net.createConnection({ host: REDIS_HOST, port: REDIS_PORT }, () => {
      s.write('AUTH default bad-attacker-password\r\n');
    });
    s.on('data', (d) => {
      s.end();
      resolve(d.toString());
    });
    s.on('error', reject);
  });
  assert.match(response, /WRONGPASS/i);
});

await runTest('Redis Config: Append-Only File (AOF) persistence is active', async () => {
  const client = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
  });
  const config = await client.config('GET', 'appendonly');
  assert.strictEqual(config[1], 'yes', 'appendonly must be set to yes');
  await client.quit();
});

await runTest('Redis Config: Memory eviction policy is strict noeviction', async () => {
  const client = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
  });
  const config = await client.config('GET', 'maxmemory-policy');
  assert.strictEqual(config[1], 'noeviction', 'maxmemory-policy must be noeviction');
  await client.quit();
});

// ----------------------------------------------------------------------------
// SUITE 2: BullMQ Job Enqueue & Worker Execution
// ----------------------------------------------------------------------------
console.log('\n\x1b[1m🔍 SUITE 2: BullMQ Job Enqueue, Deduplication & Execution\x1b[0m');

const token = await getAdminToken();

await runTest('BullMQ Enqueue: Ingestion triggers asynchronous job submission', async () => {
  const eventId = `test_evt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const res = await fetch(`${AUTOMATION_URL}/workflows/trigger`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-tenant-id': 'default-tenant',
    },
    body: JSON.stringify({
      workflowId: 'wf_flagship_enterprise',
      eventId,
      triggerData: { eventId, contactEmail: 'queue-test@enterprise.internal' },
    }),
  });

  assert.strictEqual(res.status, 201);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.queued, true);
  assert.ok(data.jobId, 'jobId must be present in response');
});

await runTest('BullMQ Deduplication: Identical eventId is rejected/deduped', async () => {
  const dedupEventId = `dedup_evt_${Date.now()}`;
  const payload = {
    workflowId: 'wf_flagship_enterprise',
    eventId: dedupEventId,
    triggerData: { eventId: dedupEventId, note: 'Idempotency test payload' },
  };

  const req1 = await fetch(`${AUTOMATION_URL}/workflows/trigger`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-tenant-id': 'default-tenant',
    },
    body: JSON.stringify(payload),
  });
  const data1 = await req1.json();

  const req2 = await fetch(`${AUTOMATION_URL}/workflows/trigger`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-tenant-id': 'default-tenant',
    },
    body: JSON.stringify(payload),
  });
  const data2 = await req2.json();

  assert.strictEqual(data1.jobId, data2.jobId, 'Both duplicate events must map to identical jobId');
});

await runTest('BullMQ Storage: Redis stores Bull queue state & metadata', async () => {
  const client = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
  });
  const keys = await client.keys('bull:workflows:*');
  assert.ok(keys.length > 0, 'BullMQ keys must exist in Redis');
  const metaExists = await client.exists('bull:workflows:meta');
  assert.strictEqual(metaExists, 1, 'bull:workflows:meta must exist in Redis');
  await client.quit();
});

// ----------------------------------------------------------------------------
// SUITE 3: Dead-Letter Queue (DLQ) & Failure Recovery
// ----------------------------------------------------------------------------
console.log('\n\x1b[1m🔍 SUITE 3: Dead-Letter Queue (DLQ) & Failure Handling\x1b[0m');

await runTest('DLQ Query: GET /workflows/dlq lists dead-lettered jobs with metadata', async () => {
  const res = await fetch(`${AUTOMATION_URL}/workflows/dlq`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'x-tenant-id': 'default-tenant',
    },
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.dlq), 'dlq must be an array');
  assert.strictEqual(typeof data.count, 'number');
  assert.strictEqual(data.tenantId, 'default-tenant');
});

await runTest('DLQ Replay: POST /workflows/dlq/:jobId/retry returns 404 for invalid job', async () => {
  const fakeId = `non_existent_job_${Date.now()}`;
  const res = await fetch(`${AUTOMATION_URL}/workflows/dlq/${fakeId}/retry`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'x-tenant-id': 'default-tenant',
    },
  });

  assert.strictEqual(res.status, 404);
});

await runTest('DLQ Purge: DELETE /workflows/dlq/:jobId returns 404 for invalid job', async () => {
  const fakeId = `non_existent_job_${Date.now()}`;
  const res = await fetch(`${AUTOMATION_URL}/workflows/dlq/${fakeId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'x-tenant-id': 'default-tenant',
    },
  });

  assert.strictEqual(res.status, 404);
});

// ----------------------------------------------------------------------------
// SUITE 4: Socket.IO Horizontal Clustering Adapter
// ----------------------------------------------------------------------------
console.log('\n\x1b[1m🔍 SUITE 4: Socket.IO Redis Adapter & Pub/Sub Clustering\x1b[0m');

await runTest('Socket.IO Clustering: Redis subscriber client active in client list', async () => {
  const client = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
  });
  const clientList = await client.client('LIST');
  // Check that at least one client has psub > 0 or sub > 0
  const lines = clientList.split('\n');
  const pubSubClients = lines.filter(
    (line) => line.includes('sub=') && (!line.includes('sub=0') || !line.includes('psub=0'))
  );
  assert.ok(
    pubSubClients.length > 0,
    'Redis must have at least one active pub/sub client for horizontal clustering'
  );
  await client.quit();
});

// ----------------------------------------------------------------------------
// Summary
// ----------------------------------------------------------------------------
console.log('\n\x1b[1m========================================================================\x1b[0m');
console.log(`\x1b[1mPhase 3 Verification Summary: ${testsPassed} passed, ${testsFailed} failed\x1b[0m`);
console.log('\x1b[1m========================================================================\x1b[0m\n');

if (testsFailed > 0) {
  process.exit(1);
}
