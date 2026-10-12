#!/usr/bin/env node
/**
 * Phase 4 Automated Verification Suite:
 * Private Cloud Object Storage (MinIO / S3), Presigned URLs, Vault Migration & Security
 */

import assert from 'node:assert';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const S3_ENDPOINT = process.env.S3_ENDPOINT || 'http://127.0.0.1:9000';
const S3_BUCKET = process.env.S3_BUCKET || 'business-os-vault';
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID || 'business_os_minio_admin';
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY || 'BusinessOsMinioSecurePass2026!';

const DOCUMENTS_URL = 'http://localhost:3020';
const STORAGE_URL = 'http://localhost:3031';
const AUTH_URL = 'http://localhost:3011';

// Dynamic import of S3 SDK
const {
  S3Client,
  HeadBucketCommand,
  HeadObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} = await import('../apps/documents/node_modules/@aws-sdk/client-s3/dist-cjs/index.js');

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
    throw new Error(`Failed to login as admin: ${res.status}`);
  }
  const data = await res.json();
  return data.access_token;
}

console.log('\x1b[1m\x1b[36m========================================================================\x1b[0m');
console.log('\x1b[1m  Business OS — Phase 4: Private Cloud Object Storage Infrastructure   \x1b[0m');
console.log('\x1b[1m\x1b[36m========================================================================\x1b[0m\n');

// ----------------------------------------------------------------------------
// SUITE 1: Object Storage Health & Infrastructure
// ----------------------------------------------------------------------------
console.log('\x1b[1m🔍 SUITE 1: Object Storage Server Health & S3 Engine\x1b[0m');

await runTest('MinIO Health: Live endpoint returns 200 OK', async () => {
  const res = await fetch(`${S3_ENDPOINT}/minio/health/live`);
  assert.strictEqual(res.status, 200);
});

await runTest('S3 Bucket: Target private bucket exists and is accessible', async () => {
  const s3 = new S3Client({
    endpoint: S3_ENDPOINT,
    region: 'us-east-1',
    credentials: {
      accessKeyId: S3_ACCESS_KEY_ID,
      secretAccessKey: S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });

  const res = await s3.send(new HeadBucketCommand({ Bucket: S3_BUCKET }));
  assert.strictEqual(res.$metadata.httpStatusCode, 200);
});

await runTest('S3 Security: Anonymous direct access without SigV4 is rejected (403 Forbidden)', async () => {
  const testKey = 'non-existent-or-private-file.pdf';
  const res = await fetch(`${S3_ENDPOINT}/${S3_BUCKET}/${testKey}`);
  assert.strictEqual(res.status, 403);
});

// ----------------------------------------------------------------------------
// SUITE 2: Presigned Direct-to-Cloud Uploads (apps/documents)
// ----------------------------------------------------------------------------
console.log('\n\x1b[1m🔍 SUITE 2: Presigned Direct Upload & Storage Verification\x1b[0m');

const token = await getAdminToken();
let testUploadedKey = '';
const samplePdfBytes = Buffer.from('%PDF-1.7\nSample Automated Verification Document Stream\n%%EOF');

await runTest('Presigned Upload: POST /documents/presign-upload returns SigV4 PUT URL', async () => {
  const res = await fetch(`${DOCUMENTS_URL}/documents/presign-upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-tenant-id': 'default-tenant',
    },
    body: JSON.stringify({
      filename: 'commercial_agreement.pdf',
      mimeType: 'application/pdf',
      service: 'sales',
      module: 'contracts',
      category: 'legal',
    }),
  });

  assert.strictEqual(res.status, 201);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(data.uploadUrl.includes('X-Amz-Signature='), 'Must contain SigV4 signature');
  assert.ok(data.uploadUrl.includes('X-Amz-Algorithm=AWS4-HMAC-SHA256'));
  assert.strictEqual(data.expiresInSeconds, 900);
  testUploadedKey = data.key;

  // Execute actual direct PUT to S3 using the presigned URL
  const putRes = await fetch(data.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/pdf' },
    body: samplePdfBytes,
  });
  assert.strictEqual(putRes.status, 200);
});

await runTest('S3 Verification: Uploaded object exists in bucket with exact byte length', async () => {
  const s3 = new S3Client({
    endpoint: S3_ENDPOINT,
    region: 'us-east-1',
    credentials: {
      accessKeyId: S3_ACCESS_KEY_ID,
      secretAccessKey: S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });

  const head = await s3.send(new HeadObjectCommand({ Bucket: S3_BUCKET, Key: testUploadedKey }));
  assert.strictEqual(head.ContentLength, samplePdfBytes.length);
});

// ----------------------------------------------------------------------------
// SUITE 3: Presigned Secure Downloads (apps/documents)
// ----------------------------------------------------------------------------
console.log('\n\x1b[1m🔍 SUITE 3: Document Ingestion & Presigned Download\x1b[0m');

let createdDocId = '';

await runTest('Document Ingestion: POST /documents uploads file and stores in S3', async () => {
  const docPayload = {
    name: 'signed_master_contract.pdf',
    mimeType: 'application/pdf',
    service: 'crm',
    module: 'deals',
    entityId: 'DEAL-999',
    category: 'signed',
    fileData: samplePdfBytes.toString('base64'),
  };

  const res = await fetch(`${DOCUMENTS_URL}/documents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-tenant-id': 'default-tenant',
    },
    body: JSON.stringify(docPayload),
  });

  assert.strictEqual(res.status, 201);
  const doc = await res.json();
  assert.ok(doc.id, 'Document must have ID');
  createdDocId = doc.id;
});

await runTest('Presigned Download: GET /documents/:id/presign-download generates GET URL', async () => {
  const res = await fetch(`${DOCUMENTS_URL}/documents/${createdDocId}/presign-download`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'x-tenant-id': 'default-tenant',
    },
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(data.downloadUrl.includes('X-Amz-Signature='), 'Must contain SigV4 signature');

  // Fetch using the presigned download URL
  const getRes = await fetch(data.downloadUrl);
  assert.strictEqual(getRes.status, 200);
  const downloadedBuf = Buffer.from(await getRes.arrayBuffer());
  assert.strictEqual(downloadedBuf.toString(), samplePdfBytes.toString());
});

// ----------------------------------------------------------------------------
// SUITE 4: Vault Migration & Checksum Verification
// ----------------------------------------------------------------------------
console.log('\n\x1b[1m🔍 SUITE 4: Local Vault to Cloud Object Storage Migration\x1b[0m');

await runTest('Vault Migration: POST /documents/migrate-vault migrates all files with 100% hash verification', async () => {
  const res = await fetch(`${DOCUMENTS_URL}/documents/migrate-vault`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'x-tenant-id': 'default-tenant',
    },
  });

  assert.strictEqual(res.status, 201);
  const report = await res.json();
  assert.strictEqual(report.success, true);
  assert.strictEqual(report.totalFailed, 0, 'No migration files should fail');
  assert.ok(report.totalMigrated + report.totalSkipped > 0, 'Must process files');
  for (const file of report.files) {
    assert.strictEqual(file.verified, true, `File ${file.relativePath} checksum must be verified`);
  }
});

// ----------------------------------------------------------------------------
// SUITE 5: Storage Service Presigned URLs (apps/storage)
// ----------------------------------------------------------------------------
console.log('\n\x1b[1m🔍 SUITE 5: Media & Storage Service Presigned URLs\x1b[0m');

await runTest('Storage Service: POST /storage/presign generates SigV4 upload URL', async () => {
  const res = await fetch(`${STORAGE_URL}/storage/presign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': 'default-tenant',
    },
    body: JSON.stringify({
      fileName: 'company_header.webp',
      contentType: 'image/webp',
    }),
  });

  assert.strictEqual(res.status, 201);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert.ok(data.uploadUrl.includes('X-Amz-Signature='), 'Must contain SigV4 signature');
  assert.strictEqual(data.expiresInSeconds, 900);
});

// ----------------------------------------------------------------------------
// Summary
// ----------------------------------------------------------------------------
console.log('\n\x1b[1m========================================================================\x1b[0m');
console.log(`\x1b[1mPhase 4 Verification Summary: ${testsPassed} passed, ${testsFailed} failed\x1b[0m`);
console.log('\x1b[1m========================================================================\x1b[0m\n');

if (testsFailed > 0) {
  process.exit(1);
}
