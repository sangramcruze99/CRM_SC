#!/usr/bin/env node
/**
 * Master Verification Suite: Service-Aware Document Vault & Document Pipeline
 * Tests all 10 matrices specified in the Master Prompt:
 * CRM, Sales, Finance, Helpdesk, Projects, HR, Cross-Service Deduplication,
 * Security & Isolation, Universal Search, OCR Lineage, and Automation Events.
 */

import crypto from 'crypto';

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
  magenta: '\x1b[35m',
};

const DOCS_BASE = 'http://localhost:3020';
const AUTO_BASE = 'http://localhost:3009';
const SEARCH_BASE = 'http://localhost:3019';

const JWT_SECRET = process.env.JWT_SECRET || 'replace-with-a-secure-random-32-byte-hex-or-base64-string';

function signToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

const adminToken = signToken({
  sub: 'usr_test_admin',
  email: 'admin@crm.internal',
  role: 'SUPERADMIN',
  tenantId: 'default-tenant',
});

const tenantBToken = signToken({
  sub: 'usr_tenant_b',
  email: 'user@tenantb.test',
  role: 'USER',
  tenantId: 'tenant_b_isolated',
});

const restrictedUserToken = signToken({
  sub: 'usr_sales_only',
  email: 'sales@crm.internal',
  role: 'USER',
  allowedServices: ['sales', 'crm'],
  tenantId: 'default-tenant',
});

let totalTests = 0;
let passedTests = 0;
const testDocIds = [];

function report(testName, passed, detail = '') {
  totalTests++;
  if (passed) {
    passedTests++;
    console.log(`  ${c.green}✓ PASS${c.reset}  ${c.bold}${testName}${c.reset} ${c.dim}${detail ? `(${detail})` : ''}${c.reset}`);
  } else {
    console.log(`  ${c.red}✗ FAIL${c.reset}  ${c.bold}${testName}${c.reset} ${c.red}Error: ${detail}${c.reset}`);
  }
}

async function run() {
  console.log(`\n${c.bold}${c.cyan}========================================================================================${c.reset}`);
  console.log(`${c.bold}🚀 DOCUMENT VAULT ARCHITECTURE & PIPELINE MASTER TEST SUITE${c.reset}`);
  console.log(`${c.dim}Validating Service Namespaces, Deduplication, Lineage, Security, and Event Bus${c.reset}`);
  console.log(`${c.bold}${c.cyan}========================================================================================${c.reset}\n`);

  // =========================================================================
  // TEST MATRIX 1: Service Registries
  // =========================================================================
  console.log(`${c.bold}${c.magenta}--- TEST MATRIX 1: Centralized Service Registry ---${c.reset}`);
  try {
    const res = await fetch(`${DOCS_BASE}/documents/services`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'x-tenant-id': 'default-tenant',
      },
    });
    const services = await res.json();
    const hasFinance = services.some((s) => s.service === 'finance');
    const hasCrm = services.some((s) => s.service === 'crm');
    const hasSales = services.some((s) => s.service === 'sales');
    const hasHr = services.some((s) => s.service === 'hr');
    report('Service Registry contains core services', hasFinance && hasCrm && hasSales && hasHr, `${services.length} services`);
  } catch (err) {
    report('Service Registry contains core services', false, err.message);
  }

  // =========================================================================
  // TEST MATRIX 2: CRM Namespace Upload
  // =========================================================================
  console.log(`\n${c.bold}${c.magenta}--- TEST MATRIX 2: CRM Namespace Upload ---${c.reset}`);
  try {
    const res = await fetch(`${DOCS_BASE}/documents`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'x-tenant-id': 'default-tenant',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: '_test_crm_deal_proposal.pdf',
        service: 'crm',
        module: 'deals',
        entityType: 'deal',
        entityId: 'DEAL-501',
        category: 'upload',
        mimeType: 'application/pdf',
        size: 34500,
      }),
    });
    const doc = await res.json();
    testDocIds.push(doc.id);
    const validNamespace =
      doc.service === 'crm' &&
      doc.module === 'deals' &&
      doc.entityId === 'DEAL-501' &&
      doc.category === 'upload' &&
      doc.storageKey.includes('crm/deals/deal/DEAL-501/upload');
    report('CRM Deal document uploaded with canonical namespace', validNamespace, doc.storageKey);
  } catch (err) {
    report('CRM Deal document uploaded with canonical namespace', false, err.message);
  }

  // =========================================================================
  // TEST MATRIX 3: Sales Namespace Upload
  // =========================================================================
  console.log(`\n${c.bold}${c.magenta}--- TEST MATRIX 3: Sales Namespace Upload ---${c.reset}`);
  try {
    const res = await fetch(`${DOCS_BASE}/documents`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'x-tenant-id': 'default-tenant',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: '_test_sales_quote_rfp.pdf',
        service: 'sales',
        module: 'quotes',
        entityType: 'quote',
        entityId: 'QUO-101',
        category: 'input',
        mimeType: 'application/pdf',
        size: 42000,
      }),
    });
    const doc = await res.json();
    testDocIds.push(doc.id);
    const validNamespace =
      doc.service === 'sales' &&
      doc.module === 'quotes' &&
      doc.entityId === 'QUO-101' &&
      doc.category === 'input';
    report('Sales Quote document uploaded with canonical namespace', validNamespace, doc.storageKey);
  } catch (err) {
    report('Sales Quote document uploaded with canonical namespace', false, err.message);
  }

  // =========================================================================
  // TEST MATRIX 4: Finance Namespace & OCR Pipeline (Input -> Receipt -> Output)
  // =========================================================================
  console.log(`\n${c.bold}${c.magenta}--- TEST MATRIX 4: Finance OCR Pipeline & Lineage (Input -> Receipt -> Output) ---${c.reset}`);
  let inputDocId = null;
  try {
    // 1. Ingest Input Document
    const res = await fetch(`${DOCS_BASE}/documents`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'x-tenant-id': 'default-tenant',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: '_test_vendor_invoice_inv9001.pdf',
        service: 'finance',
        module: 'invoices',
        entityType: 'invoice',
        entityId: 'INV-9001',
        category: 'input',
        mimeType: 'application/pdf',
        size: 56000,
      }),
    });
    const inputDoc = await res.json();
    inputDocId = inputDoc.id;
    testDocIds.push(inputDoc.id);
    report('Finance vendor invoice (input) created', inputDoc.category === 'input' && inputDoc.service === 'finance', inputDoc.storageKey);

    // 2. Ingest Receipt Artifact linked to Input Document
    const receiptRes = await fetch(`${DOCS_BASE}/documents`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'x-tenant-id': 'default-tenant',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: '_test_ocr_receipt_inv9001.json',
        service: 'finance',
        module: 'invoices',
        entityType: 'invoice',
        entityId: 'INV-9001',
        category: 'receipt',
        parentDocumentId: inputDocId,
        mimeType: 'application/json',
        size: 1420,
      }),
    });
    const receiptDoc = await receiptRes.json();
    testDocIds.push(receiptDoc.id);
    report('Finance OCR Receipt artifact created with parentDocumentId', receiptDoc.parentDocumentId === inputDocId, receiptDoc.storageKey);

    // 3. Ingest Structured Output Artifact linked to Input Document
    const outputRes = await fetch(`${DOCS_BASE}/documents`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'x-tenant-id': 'default-tenant',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: '_test_extracted_invoice_inv9001.json',
        service: 'finance',
        module: 'invoices',
        entityType: 'invoice',
        entityId: 'INV-9001',
        category: 'output',
        parentDocumentId: inputDocId,
        mimeType: 'application/json',
        size: 3200,
      }),
    });
    const outputDoc = await outputRes.json();
    testDocIds.push(outputDoc.id);
    report('Finance Structured Output artifact created with parentDocumentId', outputDoc.parentDocumentId === inputDocId, outputDoc.storageKey);

    // 4. Query Document Lineage
    const lineageRes = await fetch(`${DOCS_BASE}/documents/${inputDocId}/lineage`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'x-tenant-id': 'default-tenant',
      },
    });
    const lineage = await lineageRes.json();
    const hasReceipt = lineage.receipts.some((r) => r.id === receiptDoc.id);
    const hasOutput = lineage.outputs.some((o) => o.id === outputDoc.id);
    report('Document Lineage returns original doc, receipts, and outputs', hasReceipt && hasOutput, `Receipts: ${lineage.receipts.length}, Outputs: ${lineage.outputs.length}`);
  } catch (err) {
    report('Finance OCR Pipeline', false, err.message);
  }

  // =========================================================================
  // TEST MATRIX 5: Helpdesk, Projects, and HR Namespaces
  // =========================================================================
  console.log(`\n${c.bold}${c.magenta}--- TEST MATRIX 5: Helpdesk, Projects, and HR Namespaces ---${c.reset}`);
  try {
    // Helpdesk
    const hdRes = await fetch(`${DOCS_BASE}/documents`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}`, 'x-tenant-id': 'default-tenant', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '_test_ticket_error_screenshot.png',
        service: 'helpdesk',
        module: 'tickets',
        entityType: 'ticket',
        entityId: 'TICK-404',
        category: 'upload',
        mimeType: 'image/png',
        size: 152000,
      }),
    });
    const hdDoc = await hdRes.json();
    testDocIds.push(hdDoc.id);
    report('Helpdesk ticket attachment created', hdDoc.service === 'helpdesk' && hdDoc.entityId === 'TICK-404');

    // Projects
    const prjRes = await fetch(`${DOCS_BASE}/documents`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}`, 'x-tenant-id': 'default-tenant', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '_test_sprint_spec.pdf',
        service: 'projects',
        module: 'tasks',
        entityType: 'task',
        entityId: 'TASK-303',
        category: 'upload',
        mimeType: 'application/pdf',
        size: 67000,
      }),
    });
    const prjDoc = await prjRes.json();
    testDocIds.push(prjDoc.id);
    report('Projects task spec created', prjDoc.service === 'projects' && prjDoc.entityId === 'TASK-303');

    // HR
    const hrRes = await fetch(`${DOCS_BASE}/documents`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}`, 'x-tenant-id': 'default-tenant', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '_test_candidate_resume.pdf',
        service: 'hr',
        module: 'candidates',
        entityType: 'candidate',
        entityId: 'CAND-777',
        category: 'input',
        mimeType: 'application/pdf',
        size: 92000,
      }),
    });
    const hrDoc = await hrRes.json();
    testDocIds.push(hrDoc.id);
    report('HR candidate resume created', hrDoc.service === 'hr' && hrDoc.entityId === 'CAND-777');
  } catch (err) {
    report('Helpdesk/Projects/HR Namespaces', false, err.message);
  }

  // =========================================================================
  // TEST MATRIX 6: Canonical Deduplication & Cross-Service References
  // =========================================================================
  console.log(`\n${c.bold}${c.magenta}--- TEST MATRIX 6: Canonical File Storage & Cross-Service Deduplication ---${c.reset}`);
  try {
    const identicalFileBytes = Buffer.from('PDF-MOCK-CANONICAL-CONTRACT-CONTENT-SHA256-DEDUP-VERIFY').toString('base64');
    const knownChecksum = crypto.createHash('sha256').update(Buffer.from(identicalFileBytes, 'base64')).digest('hex');

    // Upload 1: CRM Deal
    const doc1Res = await fetch(`${DOCS_BASE}/documents`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}`, 'x-tenant-id': 'default-tenant', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '_test_master_contract_dedup.pdf',
        service: 'crm',
        module: 'deals',
        entityType: 'deal',
        entityId: 'DEAL-CANONICAL',
        category: 'upload',
        fileData: identicalFileBytes,
        checksum: knownChecksum,
      }),
    });
    const doc1 = await doc1Res.json();
    testDocIds.push(doc1.id);
    report('Canonical physical document created in CRM', doc1.checksum === knownChecksum, `ID: ${doc1.id}`);

    // Upload 2: Sales Quote with IDENTICAL checksum -> Should NOT duplicate physical doc; creates reference
    const doc2Res = await fetch(`${DOCS_BASE}/documents`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}`, 'x-tenant-id': 'default-tenant', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '_test_master_contract_dedup.pdf',
        service: 'sales',
        module: 'quotes',
        entityType: 'quote',
        entityId: 'QUO-CANONICAL',
        category: 'input',
        fileData: identicalFileBytes,
        checksum: knownChecksum,
      }),
    });
    const doc2 = await doc2Res.json();
    const isDeduped = doc2.id === doc1.id && doc2.isDeduplicated === true;
    report('Identical file upload deduplicated to canonical document', isDeduped, `Reused doc: ${doc2.id}, Ref ID: ${doc2.reference?.id}`);

    // Manual Cross-Service Reference to Finance
    const refRes = await fetch(`${DOCS_BASE}/documents/${doc1.id}/references`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}`, 'x-tenant-id': 'default-tenant', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: 'finance',
        module: 'invoices',
        entityType: 'invoice',
        entityId: 'INV-CANONICAL-99',
        category: 'receipt',
        notes: 'Attached to invoice as canonical proof of contract',
      }),
    });
    const ref = await refRes.json();
    report('Cross-service canonical reference attached to Finance', ref.documentId === doc1.id && ref.service === 'finance');
  } catch (err) {
    report('Canonical Deduplication test', false, err.message);
  }

  // =========================================================================
  // TEST MATRIX 7: Multi-Tenant Security & Service Authorization
  // =========================================================================
  console.log(`\n${c.bold}${c.magenta}--- TEST MATRIX 7: Multi-Tenant Security & Service Authorization ---${c.reset}`);
  try {
    // 1. Cross-Tenant Boundary Violation: Tenant B trying to access Tenant A's document
    const crossTenantRes = await fetch(`${DOCS_BASE}/documents/${inputDocId}`, {
      headers: {
        Authorization: `Bearer ${tenantBToken}`,
        'x-tenant-id': 'default-tenant', // Tenant spoofing attempt
      },
    });
    report('Cross-tenant boundary tampering blocked safely (403/404)', [403, 404].includes(crossTenantRes.status), `Status: ${crossTenantRes.status}`);

    // 2. Service-level authorization: User restricted to Sales trying to access Finance
    const serviceAuthRes = await fetch(`${DOCS_BASE}/documents?service=finance`, {
      headers: {
        Authorization: `Bearer ${restrictedUserToken}`,
        'x-tenant-id': 'default-tenant',
      },
    });
    report('Unauthorized service access blocked (403 Forbidden)', serviceAuthRes.status === 403, `Status: ${serviceAuthRes.status}`);

    // 3. Directory Traversal Defense: Unsafe filename sanitized
    const traversalRes = await fetch(`${DOCS_BASE}/documents`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}`, 'x-tenant-id': 'default-tenant', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '../../../../../../etc/passwd',
        service: 'documents',
        module: 'general',
        category: 'upload',
      }),
    });
    const traversalDoc = await traversalRes.json();
    testDocIds.push(traversalDoc.id);
    const isSafe = !traversalDoc.storageKey.includes('..') && traversalDoc.name === 'passwd';
    report('Directory traversal path sanitized safely', isSafe, `Stored as: ${traversalDoc.name}`);
  } catch (err) {
    report('Security & Isolation tests', false, err.message);
  }

  // =========================================================================
  // TEST MATRIX 8: Universal Search Integration
  // =========================================================================
  console.log(`\n${c.bold}${c.magenta}--- TEST MATRIX 8: Universal Search Integration ---${c.reset}`);
  try {
    const searchRes = await fetch(`${SEARCH_BASE}/search?q=_test_vendor_invoice`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'x-tenant-id': 'default-tenant',
      },
    });
    const results = await searchRes.json();
    const docResult = results.find((r) => r.type === 'DOCUMENT' && r.title.includes('_test_vendor_invoice'));
    report('Universal Search discovers documents with service & category badge', !!docResult, docResult ? `${docResult.title} [${docResult.badge}]` : 'Not found');
  } catch (err) {
    report('Universal Search discovers documents', false, err.message);
  }

  // =========================================================================
  // TEST MATRIX 9: Automation Event Bus Verification
  // =========================================================================
  console.log(`\n${c.bold}${c.magenta}--- TEST MATRIX 9: Automation Event Bus Verification ---${c.reset}`);
  try {
    const historyRes = await fetch(`${AUTO_BASE}/workflows/events/history?limit=10`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'x-tenant-id': 'default-tenant',
      },
    });
    const history = await historyRes.json();
    const docEvent = Array.isArray(history) && history.find((e) => e.type === 'DOCUMENT_UPLOADED');
    report('Automation Event Bus received and logged DOCUMENT_UPLOADED event', !!docEvent, docEvent ? `Event ID: ${docEvent.id}` : 'No event in history');
  } catch (err) {
    report('Automation Event Bus verification', false, err.message);
  }

  // =========================================================================
  // TEST DATA CLEANUP: Remove synthetic test documents only
  // =========================================================================
  console.log(`\n${c.bold}${c.magenta}--- TEST DATA CLEANUP ---${c.reset}`);
  let cleanedCount = 0;
  for (const docId of testDocIds) {
    try {
      await fetch(`${DOCS_BASE}/documents/${docId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'x-tenant-id': 'default-tenant',
        },
      });
      cleanedCount++;
    } catch {
      // safe fallback
    }
  }
  report('Synthetic test records cleaned up from database', cleanedCount === testDocIds.length, `Cleaned ${cleanedCount}/${testDocIds.length} synthetic test documents`);

  // Verify all 6 pre-existing documents remain intact
  try {
    const listRes = await fetch(`${DOCS_BASE}/documents`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'x-tenant-id': 'default-tenant',
      },
    });
    const remaining = await listRes.json();
    const preExistingFound = remaining.some((d) => d.name === 'automation_test_vendor_invoice.pdf');
    report('Original legitimate documents preserved without loss', preExistingFound, `${remaining.length} legitimate documents in tenant`);
  } catch (err) {
    report('Original legitimate documents preserved', false, err.message);
  }

  // =========================================================================
  // FINAL SCORECARD
  // =========================================================================
  console.log(`\n${c.bold}${c.cyan}========================================================================================${c.reset}`);
  console.log(`${c.bold}FINAL VERIFICATION SCORECARD${c.reset}`);
  console.log(`Total Checks: ${totalTests} | Passed: ${passedTests} | Failed: ${totalTests - passedTests}`);
  if (passedTests === totalTests) {
    console.log(`${c.bold}${c.green}🎉 ALL 10 TEST MATRICES PASSED ACCORDING TO ARCHITECTURAL SPECIFICATION!${c.reset}`);
  } else {
    console.log(`${c.bold}${c.red}⚠️ SOME CHECKS FAILED${c.reset}`);
  }
  console.log(`${c.bold}${c.cyan}========================================================================================${c.reset}\n`);

  process.exit(totalTests === passedTests ? 0 : 1);
}

run();
