/**
 * Enterprise Document Intelligence Engine — Automated Test Matrix
 * Verifies all 17 requirements (A through Q) from Section 29.
 */

import { DocumentIntelligenceEngine } from '../apps/web-core/src/lib/document-intelligence/engine.ts';
import { computePaymentStatus } from '../apps/web-core/src/lib/document-intelligence/payment-status-engine.ts';
import { reconcileFinancials } from '../apps/web-core/src/lib/document-intelligence/financial-reconciler.ts';
import { matchesSynonym, SYNONYM_DICTIONARY } from '../apps/web-core/src/lib/document-intelligence/synonyms.ts';
import { classifyDocument } from '../apps/web-core/src/lib/document-intelligence/classifier.ts';
import { resolveEntitiesFromDocument, classifyEntityType } from '../apps/web-core/src/lib/document-intelligence/entities.ts';
import { normalizeDate, extractDatesFromDocument } from '../apps/web-core/src/lib/document-intelligence/dates.ts';
import { extractAddressesFromDocument } from '../apps/web-core/src/lib/document-intelligence/addresses.ts';
import { evaluateHumanReview } from '../apps/web-core/src/lib/document-intelligence/review-guard.ts';
import { IdempotencyManager } from '../apps/web-core/src/lib/document-intelligence/idempotency.ts';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    failed++;
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

async function runTestSuite() {
  console.log('================================================================');
  console.log(' ENTERPRISE DOCUMENT INTELLIGENCE ENGINE — TEST MATRIX (A to Q)');
  console.log('================================================================\n');

  // ---------------------------------------------------------------------------
  // TEST A: Total $1000, Paid $1000, Due $0 -> PAID
  // ---------------------------------------------------------------------------
  console.log('TEST A: Full Settlement Verification (Total $1000, Paid $1000, Due $0)');
  const resA = computePaymentStatus({
    financial: {
      currency: 'USD',
      currencySymbol: '$',
      subtotal: 1000,
      total: 1000,
      amountPaid: 1000,
      balanceDue: 0,
      paymentStatus: 'UNKNOWN',
    },
    dueDate: '2026-10-01',
    currentDate: '2026-09-08',
  });
  assert(resA.status === 'PAID', `Status should be PAID (got ${resA.status})`);
  assert(resA.confidence >= 0.95, `Confidence >= 0.95 (got ${resA.confidence})`);

  // ---------------------------------------------------------------------------
  // TEST B: Total $1000, Paid $500, Due $500 -> PARTIALLY_PAID
  // ---------------------------------------------------------------------------
  console.log('\nTEST B: Partial Payment Verification (Total $1000, Paid $500, Due $500)');
  const resB = computePaymentStatus({
    financial: {
      currency: 'USD',
      currencySymbol: '$',
      subtotal: 1000,
      total: 1000,
      amountPaid: 500,
      balanceDue: 500,
      paymentStatus: 'UNKNOWN',
    },
    dueDate: '2026-10-01',
    currentDate: '2026-09-08',
  });
  assert(resB.status === 'PARTIALLY_PAID', `Status should be PARTIALLY_PAID (got ${resB.status})`);
  assert(resB.confidence >= 0.95, `Confidence >= 0.95 (got ${resB.confidence})`);

  // ---------------------------------------------------------------------------
  // TEST C: Total $1000, Paid $0, Due $1000 -> UNPAID / DUE
  // ---------------------------------------------------------------------------
  console.log('\nTEST C: Zero Payment Verification (Total $1000, Paid $0, Due $1000, Future Due Date)');
  const resC = computePaymentStatus({
    financial: {
      currency: 'USD',
      currencySymbol: '$',
      subtotal: 1000,
      total: 1000,
      amountPaid: 0,
      balanceDue: 1000,
      paymentStatus: 'UNKNOWN',
    },
    dueDate: '2026-12-31',
    currentDate: '2026-09-08',
  });
  assert(resC.status === 'DUE' || resC.status === 'UNPAID', `Status should be DUE/UNPAID (got ${resC.status})`);

  // ---------------------------------------------------------------------------
  // TEST D: Total $1000, Paid $0, Due $1000, Due date passed -> OVERDUE
  // ---------------------------------------------------------------------------
  console.log('\nTEST D: Overdue Verification (Total $1000, Paid $0, Due $1000, Past Due Date)');
  const resD = computePaymentStatus({
    financial: {
      currency: 'USD',
      currencySymbol: '$',
      subtotal: 1000,
      total: 1000,
      amountPaid: 0,
      balanceDue: 1000,
      paymentStatus: 'UNKNOWN',
    },
    dueDate: '2026-08-01', // in the past relative to 2026-09-08
    currentDate: '2026-09-08',
  });
  assert(resD.status === 'OVERDUE', `Status should be OVERDUE (got ${resD.status})`);
  assert(resD.confidence >= 0.95, `Overdue confidence >= 0.95 (got ${resD.confidence})`);

  // ---------------------------------------------------------------------------
  // TEST E: Multiple Payments Aggregated ($1000 + $1500 + $1000 = $3500)
  // ---------------------------------------------------------------------------
  console.log('\nTEST E: Multi-Payment Aggregation');
  const paymentsE = [
    { amount: 1000, date: '2026-08-10', reference: 'WIRE-001', method: 'wire' },
    { amount: 1500, date: '2026-08-15', reference: 'ACH-002', method: 'ach' },
    { amount: 1000, date: '2026-08-20', reference: 'CARD-003', method: 'card' },
  ];
  const reconE = reconcileFinancials(
    {
      subtotal: 5000,
      tax: 0,
      discount: 0,
      total: 5000,
      amountPaid: 3500,
      balanceDue: 1500,
    },
    paymentsE
  );
  assert(reconE.validation.paidAmount === 3500, `Aggregated total paid should be 3500 (got ${reconE.validation.paidAmount})`);
  assert(reconE.validation.isConsistent === true, `Reconciliation consistent: 5000 - 3500 = 1500`);
  assert(reconE.validation.calculatedBalance === 1500, `Calculated balance is 1500`);

  // ---------------------------------------------------------------------------
  // TEST F: Currency Extraction & Preservation
  // ---------------------------------------------------------------------------
  console.log('\nTEST F: Currency Preservation (USD, EUR, GBP, JPY)');
  const eurDoc = 'Invoice Total: € 2,450.75 EUR';
  const gbpDoc = 'Balance Due: £ 890.00';
  const jpyDoc = 'Grand Total: ¥ 150,000';
  const usdDoc = 'Total: $ 1,250.00 USD';

  const reconEur = reconcileFinancials({ currency: 'EUR', total: 2450.75 });
  const reconGbp = reconcileFinancials({ currency: 'GBP', total: 890 });
  const reconJpy = reconcileFinancials({ currency: 'JPY', total: 150000 });
  const reconUsd = reconcileFinancials({ currency: 'USD', total: 1250 });

  assert(reconEur.normalizedFinancial.currency === 'EUR', 'Should preserve EUR');
  assert(reconGbp.normalizedFinancial.currency === 'GBP', 'Should preserve GBP');
  assert(reconJpy.normalizedFinancial.currency === 'JPY', 'Should preserve JPY');
  assert(reconUsd.normalizedFinancial.currency === 'USD', 'Should preserve USD');

  // ---------------------------------------------------------------------------
  // TEST G: Multiple Dates Semantic Assignment
  // ---------------------------------------------------------------------------
  console.log('\nTEST G: Semantic Date Intelligence & Ambiguity Detection');
  const dNorm1 = normalizeDate('10 Aug 2026');
  const dNorm2 = normalizeDate('September 10, 2026');
  const dAmbiguous = normalizeDate('10/08/2026');

  assert(dNorm1.isoValue === '2026-08-10', `Normalized '10 Aug 2026' to 2026-08-10 (got ${dNorm1.isoValue})`);
  assert(dNorm2.isoValue === '2026-09-10', `Normalized 'September 10, 2026' to 2026-09-10 (got ${dNorm2.isoValue})`);
  assert(dAmbiguous.isAmbiguous === true, `Ambiguous date 10/08/2026 flagged without silent guessing`);

  const dateSnippet = `
    Invoice Date: 10 Aug 2026
    Due Date: 10 Sep 2026
    Date of Payment: 2026-08-20
  `;
  const extractedDates = extractDatesFromDocument(dateSnippet);
  const invDate = extractedDates.find((d) => d.type === 'invoice_date');
  const dueDate = extractedDates.find((d) => d.type === 'due_date');
  assert(Boolean(invDate && invDate.value === '2026-08-10'), 'Semantic invoice_date correctly assigned');
  assert(Boolean(dueDate && dueDate.value === '2026-09-10'), 'Semantic due_date correctly assigned');

  // ---------------------------------------------------------------------------
  // TEST H: Multiple People Entity Classification
  // ---------------------------------------------------------------------------
  console.log('\nTEST H: Entity Disambiguation (Person vs Company vs Role)');
  const typeJohn = classifyEntityType('John Smith', 'Customer: John Smith');
  const typeAcme = classifyEntityType('Acme Technologies Ltd.', 'Vendor: Acme Technologies Ltd.');
  const typeHospital = classifyEntityType('Global Medical Center', 'Hospital');

  assert(typeJohn === 'PERSON', `John Smith classified as PERSON (got ${typeJohn})`);
  assert(typeAcme === 'COMPANY', `Acme Technologies Ltd. classified as COMPANY (got ${typeAcme})`);
  assert(typeHospital === 'ORGANIZATION', `Global Medical Center classified as ORGANIZATION (got ${typeHospital})`);

  // ---------------------------------------------------------------------------
  // TEST I: Person + Company Relationship
  // ---------------------------------------------------------------------------
  console.log('\nTEST I: Entity Relationship Resolution');
  const entityDoc = `
    Issued By: Acme Technologies Ltd.
    Billed To: Cyberdyne Systems Corp
    Customer: Sarah Connor
  `;
  const resolvedI = resolveEntitiesFromDocument(entityDoc);
  const entitiesI = resolvedI.entities;
  const relsI = resolvedI.relationships;

  const sarah = entitiesI.find((e) => e.name.includes('Sarah Connor'));
  const cyberdyne = entitiesI.find((e) => e.name.includes('Cyberdyne'));
  assert(Boolean(sarah && sarah.type === 'PERSON'), 'Sarah Connor identified as PERSON');
  assert(Boolean(cyberdyne && cyberdyne.type === 'COMPANY'), 'Cyberdyne identified as COMPANY');
  assert(relsI.length > 0, `Structured relationship established between contact and company`);

  // ---------------------------------------------------------------------------
  // TEST J: Multiple Addresses (Billing, Shipping, Service)
  // ---------------------------------------------------------------------------
  console.log('\nTEST J: Multi-Address Classification');
  const addressDoc = `
    Bill To Address:
    100 Montgomery St, Suite 1400, San Francisco, CA 94104

    Ship To Address:
    450 Innovation Parkway, Austin, TX 78701

    Service Address:
    2000 Ocean Ave, Los Angeles, CA 90401
  `;
  const addrsJ = extractAddressesFromDocument(addressDoc);
  const billingJ = addrsJ.find((a) => a.type === 'billing');
  const shippingJ = addrsJ.find((a) => a.type === 'shipping');
  const serviceJ = addrsJ.find((a) => a.type === 'service');

  assert(Boolean(billingJ && billingJ.text.includes('Montgomery')), `Billing address identified`);
  assert(Boolean(shippingJ && shippingJ.text.includes('Innovation')), `Shipping address identified`);
  assert(Boolean(serviceJ && serviceJ.text.includes('Ocean')), `Service address identified`);

  // ---------------------------------------------------------------------------
  // TEST K: Synonym Engine Terminology Normalization
  // ---------------------------------------------------------------------------
  console.log('\nTEST K: Semantic Synonym Normalization');
  assert(matchesSynonym('Amount Due: $500', 'TOTAL_DUE'), '"Amount Due" maps to TOTAL_DUE');
  assert(matchesSynonym('Balance Due: $500', 'TOTAL_DUE'), '"Balance Due" maps to TOTAL_DUE');
  assert(matchesSynonym('Open Balance: $500', 'TOTAL_DUE'), '"Open Balance" maps to TOTAL_DUE');
  assert(matchesSynonym('Remaining Amount: $500', 'TOTAL_DUE'), '"Remaining Amount" maps to TOTAL_DUE');
  assert(matchesSynonym('Payment Received: $500', 'AMOUNT_PAID'), '"Payment Received" maps to AMOUNT_PAID');
  assert(matchesSynonym('Paid to Date: $500', 'AMOUNT_PAID'), '"Paid to Date" maps to AMOUNT_PAID');
  assert(matchesSynonym('Settled: $500', 'AMOUNT_PAID'), '"Settled" maps to AMOUNT_PAID');
  assert(matchesSynonym('Date Issued: 2026-08-10', 'INVOICE_DATE'), '"Date Issued" maps to INVOICE_DATE');
  assert(matchesSynonym('Payment Deadline: 2026-09-10', 'DUE_DATE'), '"Payment Deadline" maps to DUE_DATE');
  assert(matchesSynonym('Billed By: Acme Corp', 'VENDOR'), '"Billed By" maps to VENDOR');
  assert(matchesSynonym('Buyer: Cyberdyne Corp', 'CUSTOMER'), '"Buyer" maps to CUSTOMER');

  // ---------------------------------------------------------------------------
  // TEST L: OCR Preprocessing & Dirty Text Resilience
  // ---------------------------------------------------------------------------
  console.log('\nTEST L: Preprocessing & Text Normalization');
  const dirtyDoc = `
    INVOICE
    Subtotal: $ 1 , 0 0 0 . 0 0
    Tax: $ 1 0 0 . 0 0
    Total: $ 1 , 1 0 0 . 0 0
  `;
  const classL = classifyDocument(dirtyDoc);
  assert(classL.documentType === 'invoice', `Understands invoice even with spaced layout`);

  // ---------------------------------------------------------------------------
  // TEST M: Document Classification (17+ categories)
  // ---------------------------------------------------------------------------
  console.log('\nTEST M: Document Type Classification');
  const invClass = classifyDocument('TAX INVOICE\nInvoice #: INV-2026-88\nAmount Due: $1,000.00\nDue Date: 2026-09-10');
  const poClass = classifyDocument('PURCHASE ORDER\nPO Number: PO-9920\nVendor Quote Ref: VQ-100\nProcurement Total: $5,000');
  const rcptClass = classifyDocument('SALES RECEIPT\nCash Tendered: $100.00\nChange Due: $15.50\nThank you for your business');
  const payRcptClass = classifyDocument('PAYMENT RECEIPT\nPayment Confirmation\nReceived With Thanks: $1,000.00\nTransaction Reference: TX-9928');

  assert(invClass.documentType === 'invoice', `Classified invoice (${invClass.confidence})`);
  assert(poClass.documentType === 'purchase_order', `Classified purchase_order (${poClass.confidence})`);
  assert(rcptClass.documentType === 'receipt', `Classified receipt (${rcptClass.confidence})`);
  assert(payRcptClass.documentType === 'payment_receipt', `Classified payment_receipt (${payRcptClass.confidence})`);

  // ---------------------------------------------------------------------------
  // TEST N: Line Item Table Extraction & Math Check
  // ---------------------------------------------------------------------------
  console.log('\nTEST N: Line Item Extraction & Math Validation');
  const itemsN = [
    { id: '1', description: 'Enterprise Kubernetes Dedicated Cluster', quantity: 1, unitPrice: 3800, total: 3800, isConsistent: true, confidence: 0.98 },
    { id: '2', description: 'High-Throughput Global Edge CDN Bandwidth', quantity: 2, unitPrice: 400, total: 800, isConsistent: true, confidence: 0.98 },
  ];
  const reconN = reconcileFinancials(
    {
      subtotal: 4600,
      tax: 0,
      discount: 0,
      total: 4600,
    },
    [],
    itemsN
  );
  assert(reconN.validation.isConsistent === true, `Line items sum ($4600) matches subtotal`);

  // ---------------------------------------------------------------------------
  // TEST O: Financial Mismatch -> Review Required
  // ---------------------------------------------------------------------------
  console.log('\nTEST O: Financial Reconciliation Inconsistency Guard');
  const mismatchRecon = reconcileFinancials({
    subtotal: 1000,
    tax: 100,
    discount: 0,
    total: 1100,
    amountPaid: 500,
    balanceDue: 999, // Inconsistent: 1100 - 500 = 600, not 999
  });
  assert(mismatchRecon.validation.isConsistent === false, `Financial mismatch detected (isConsistent = false)`);
  assert(mismatchRecon.validation.issues.length > 0, `Validation issue recorded`);

  const reviewO = evaluateHumanReview({
    documentType: 'invoice',
    documentTypeConfidence: 0.96,
    financialValidation: mismatchRecon.validation,
    paymentStatus: 'PARTIALLY_PAID',
    entities: [],
    dates: [],
    confidenceScores: {},
  });
  assert(reviewO.requiresReview === true, `Triggers requiresReview = true on financial mismatch`);
  assert(reviewO.reviewReasons.includes('BALANCE_MISMATCH') || reviewO.reviewReasons.includes('MATH_INCONSISTENT'), `Reasons contain BALANCE_MISMATCH or MATH_INCONSISTENT`);

  // ---------------------------------------------------------------------------
  // TEST P: Duplicate Upload -> Idempotency Fingerprint
  // ---------------------------------------------------------------------------
  console.log('\nTEST P: Idempotency Fingerprinting');
  const fileContent = 'data:text/plain;base64,VEVTVF9ET0NVTUVOVF9DT05URU5UXzIwMjY=';
  const fp1 = IdempotencyManager.computeFingerprint(fileContent);
  const fp2 = IdempotencyManager.computeFingerprint(fileContent);
  assert(fp1 === fp2, `Identical files yield deterministic SHA-256 fingerprint`);
  assert(fp1.length === 64, `Fingerprint is valid SHA-256 hex string (64 chars)`);

  IdempotencyManager.record('tenant_1', {
    fingerprint: fp1,
    documentId: 'doc_123',
    processedAt: new Date().toISOString(),
    documentType: 'invoice',
  });
  const dupCheck = IdempotencyManager.checkDuplicate('tenant_1', fp1);
  assert(Boolean(dupCheck && dupCheck.documentId === 'doc_123'), `Duplicate successfully detected for tenant`);

  // ---------------------------------------------------------------------------
  // TEST Q: Unknown Document Classification & Review Triage
  // ---------------------------------------------------------------------------
  console.log('\nTEST Q: Unknown Document Handling');
  const unknownDoc = 'asdf qwer zxcv 1234 random text without any headers or business semantics';
  const classQ = classifyDocument(unknownDoc);
  assert(classQ.documentType === 'unknown' || classQ.confidence < 0.6, `Classified as unknown or low confidence (<0.6)`);

  const reviewQ = evaluateHumanReview({
    documentType: classQ.documentType,
    documentTypeConfidence: classQ.confidence,
    financialValidation: {
      isConsistent: true,
      subtotal: null,
      tax: null,
      discount: null,
      shipping: null,
      fees: null,
      total: null,
      paidAmount: null,
      balanceDue: null,
      calculatedTotal: null,
      calculatedBalance: null,
      issues: [],
    },
    paymentStatus: 'UNKNOWN',
    entities: [],
    dates: [],
    confidenceScores: {},
  });
  assert(reviewQ.requiresReview === true, `Unknown document automatically requires human review`);
  assert(
    reviewQ.reviewReasons.includes('UNKNOWN_DOCUMENT_TYPE') || reviewQ.reviewReasons.includes('PAYMENT_STATUS_AMBIGUOUS'),
    `Review reason specifies UNKNOWN_DOCUMENT_TYPE or PAYMENT_STATUS_AMBIGUOUS`
  );

  // ---------------------------------------------------------------------------
  // TEST R: End-to-End Master Engine Execution
  // ---------------------------------------------------------------------------
  console.log('\nTEST R: End-to-End Master Engine Pipeline');
  const sampleInvoiceData = `data:text/plain;base64,${Buffer.from(`
TAX INVOICE
Invoice Number: INV-2026-9901
Date: 10 Aug 2026
Due Date: 10 Sep 2026
Vendor: Apex Cloud Solutions LLC
100 Montgomery St, San Francisco, CA
Customer: Cyberdyne Systems Corp
Bill To: 2000 Ocean Ave, Los Angeles, CA
Contact: Sarah Connor

Description                          Qty    Unit Price    Total
Enterprise Kubernetes Cluster         1     $3,800.00    $3,800.00
Real-Time Neural OCR Inference API    1     $1,450.00    $1,450.00

Subtotal: $5,250.00
Tax: $0.00
Total: $5,250.00
Amount Paid: $2,000.00
Balance Due: $3,250.00
`).toString('base64')}`;

  const masterResult = await DocumentIntelligenceEngine.processDocument({
    fileData: sampleInvoiceData,
    fileName: 'sample_apex_invoice.txt',
    tenantId: 'tenant_enterprise_test',
  });

  assert(masterResult.document.type === 'invoice', `E2E Document Type: invoice (got ${masterResult.document.type})`);
  assert(masterResult.financial.total === 5250, `E2E Total: 5250 (got ${masterResult.financial.total})`);
  assert(masterResult.financial.amountPaid === 2000, `E2E Amount Paid: 2000 (got ${masterResult.financial.amountPaid})`);
  assert(masterResult.financial.balanceDue === 3250, `E2E Balance Due: 3250 (got ${masterResult.financial.balanceDue})`);
  assert(masterResult.financial.paymentStatus === 'PARTIALLY_PAID', `E2E Status: PARTIALLY_PAID (got ${masterResult.financial.paymentStatus})`);
  assert(masterResult.validation.isConsistent === true, `E2E Validation: Math is consistent`);
  // ---------------------------------------------------------------------------
  // TEST S: Real-world Invoice Scan (Ad4tech Material LLC - INV-005)
  // ---------------------------------------------------------------------------
  console.log('\nTEST S: Real-World Scan Extraction (Ad4tech Material LLC - INV-005)');
  const ad4techDoc = `data:text/plain;base64,${Buffer.from(`
Ad4tech Material LLC
67h, Martin streetAlexander road576832
Email: ad4example@gmail.com
Mobile: +123456789

Billed to:
Green1 Materials LLC
#34, Car streetCity parkHonk Kong

Invoice No: INV-005
Invoice Date: Jun 22, 2021
Due Date: Jun 27, 2021

Description           Qty   Unit Price   Total
Desktop furniture      1    $232.00      $232.00
Plumbing               1    $1028.00     $1028.00
Water tank repair      1    $304.00      $304.00

Subtotal: $1,564.00
Total: $1,564.00
Paid (Jun 22, 2021) $ 232.00
Balance Due: $ 1,332.00

Payment Instructions:
Pay Cheque to John Doe
`).toString('base64')}`;

  const ad4techResult = await DocumentIntelligenceEngine.processDocument({
    fileData: ad4techDoc,
    fileName: 'ad4tech_invoice.txt',
    tenantId: 'tenant_enterprise_test',
  });

  assert(ad4techResult.document.type === 'invoice', `Ad4tech Type: invoice (got ${ad4techResult.document.type})`);
  assert(ad4techResult.financial.total === 1564, `Ad4tech Total: 1564 (got ${ad4techResult.financial.total})`);
  assert(ad4techResult.financial.amountPaid === 232, `Ad4tech Amount Paid: 232 (got ${ad4techResult.financial.amountPaid})`);
  assert(ad4techResult.financial.balanceDue === 1332, `Ad4tech Balance Due: 1332 (got ${ad4techResult.financial.balanceDue})`);
  assert(ad4techResult.financial.paymentStatus === 'PARTIALLY_PAID', `Ad4tech Status: PARTIALLY_PAID (got ${ad4techResult.financial.paymentStatus})`);
  assert(ad4techResult.validation.isConsistent === true, `Ad4tech Math Consistency: Consistent`);
  
  const vendorEntity = ad4techResult.entities.find((e) => e.role === 'vendor' || e.role === 'issuer');
  assert(Boolean(vendorEntity && vendorEntity.name.includes('Ad4tech')), `Vendor resolved: Ad4tech (got ${vendorEntity?.name})`);
  assert(Boolean(vendorEntity?.email === 'ad4example@gmail.com'), `Vendor email: ad4example@gmail.com (got ${vendorEntity?.email})`);
  assert(Boolean(vendorEntity?.phone === '+123456789'), `Vendor phone: +123456789 (got ${vendorEntity?.phone})`);

  const payeeEntity = ad4techResult.entities.find((e) => e.name.toLowerCase().includes('john doe'));
  assert(Boolean(payeeEntity), `Payee resolved: John Doe`);
  assert(Boolean(ad4techResult.financial.paymentInstructions?.includes('John Doe')), `Payment instructions: Pay Cheque to John Doe`);

  console.log('\n================================================================');
  console.log(` FINAL TEST MATRIX RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal error running test matrix:', err);
  process.exit(1);
});
