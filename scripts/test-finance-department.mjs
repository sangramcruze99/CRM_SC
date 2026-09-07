#!/usr/bin/env node
/**
 * Stage 5.3 Verification Test: AI Finance Department
 * Tests Midas AR Sentinel, Collections Copilot, Dual Khata Anomaly Auditor, and Cashflow Forecasting
 */

import { createRequire } from 'module';
process.loadEnvFile?.('.env');
const require = createRequire(import.meta.url);
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'replace-with-a-secure-random-32-byte-hex-or-base64-string';
const TENANT_ID = 'tenant_prod_finance_alpha';

const validToken = jwt.sign(
  {
    sub: 'cfo-finance-lead',
    email: 'treasury@businessos.test',
    tenantId: TENANT_ID,
    role: 'ADMIN',
  },
  JWT_SECRET,
  { expiresIn: '2h' }
);

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${validToken}`,
  'x-tenant-id': TENANT_ID,
};

const BASE_URL = 'http://localhost:3010/departments/finance';
const GATEWAY_URL = 'http://localhost:4000/api/ai/departments/finance';

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
};

async function runFinanceDepartmentTests() {
  console.log(`\n${c.bold}${c.cyan}========================================================================================${c.reset}`);
  console.log(`${c.bold}🛡️ STAGE 5.3: AI FINANCE DEPARTMENT VERIFICATION SUITE${c.reset}`);
  console.log(`${c.bold}${c.cyan}========================================================================================${c.reset}\n`);

  let totalTests = 0;
  let passedTests = 0;

  function report(name, passed, detail) {
    totalTests++;
    if (passed) {
      passedTests++;
      console.log(`  ${c.green}✓ PASS${c.reset}  ${c.bold}${name}${c.reset} ${c.dim}(${detail})${c.reset}`);
    } else {
      console.log(`  ${c.red}✗ FAIL${c.reset}  ${c.bold}${name}${c.reset} ${c.red}Error: ${detail}${c.reset}`);
    }
  }

  // 1. Department Overview & Ensemble Pillars
  try {
    const res = await fetch(`${BASE_URL}/overview`, { headers });
    const data = await res.json();
    const passed =
      res.ok &&
      data.department === 'AI_FINANCE_DEPARTMENT' &&
      data.architecturePillars?.agents?.length >= 4 &&
      data.architecturePillars?.policies?.length >= 4;
    report(
      'Capability Pillar: Finance Department Overview & Ensemble Pillars',
      passed,
      `Agents: ${data.architecturePillars?.agents?.map((a) => a.name).join(', ')}`
    );
  } catch (err) {
    report('Capability Pillar: Finance Department Overview & Ensemble Pillars', false, err.message);
  }

  // 2. Department Live KPIs Engine
  try {
    const res = await fetch(`${BASE_URL}/kpis`, { headers });
    const data = await res.json();
    const passed =
      res.ok &&
      typeof data.totalOutstandingAr === 'number' &&
      typeof data.avgDsoDays === 'number' &&
      typeof data.collectionEfficiencyIndex === 'number' &&
      typeof data.projected30DayCollections === 'number';
    report(
      'Capability Pillar: Live Accounts Receivable & Cashflow KPIs',
      passed,
      `AR: $${data.totalOutstandingAr?.toLocaleString()}, DSO: ${data.avgDsoDays} days, CEI: ${data.collectionEfficiencyIndex}%`
    );
  } catch (err) {
    report('Capability Pillar: Live Accounts Receivable & Cashflow KPIs', false, err.message);
  }

  // 3. Accounts Receivable Aging Audit Matrix
  try {
    const res = await fetch(`${BASE_URL}/aging/audit`, { headers });
    const data = await res.json();
    const passed =
      res.ok &&
      typeof data.totalAr === 'number' &&
      Array.isArray(data.brackets) &&
      data.brackets.length === 4;
    report(
      'Capability 1: Accounts Receivable 4-Bracket Aging Matrix',
      passed,
      `Total AR: $${data.totalAr?.toLocaleString()}, Brackets: ${data.brackets?.map((b) => b.label.split(' ')[0]).join(', ')}`
    );
  } catch (err) {
    report('Capability 1: Accounts Receivable 4-Bracket Aging Matrix', false, err.message);
  }

  // 4. Collections Copilot: Tone-Calibrated Dunning Recommendation
  let recData;
  try {
    const res = await fetch(`${BASE_URL}/dunning/recommend`, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
    });
    recData = await res.json();
    const passed =
      res.ok &&
      !!recData.tier &&
      !!recData.tone &&
      !!recData.emailSubject &&
      !!recData.emailBody &&
      recData.emailBody.includes('https://pay.businessos.internal');
    report(
      'Capability 2: Tone-Calibrated Dunning Recommendation',
      passed,
      `Tier: ${recData.tier}, Tone: ${recData.tone}, Account: ${recData.accountName}`
    );
  } catch (err) {
    report('Capability 2: Tone-Calibrated Dunning Recommendation', false, err.message);
  }

  // 5. Automated Payment Link Generation & Dunning Execution
  try {
    const res = await fetch(`${BASE_URL}/dunning/execute`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        invoiceId: recData?.invoiceId,
        channel: 'EMAIL',
        appliedDiscountPercent: 5,
        recipientEmail: 'client-ap@acmeglobal.test',
      }),
    });
    const data = await res.json();
    const passed =
      res.ok &&
      data.success === true &&
      data.deliveryStatus === 'DELIVERED' &&
      data.finalAmount > 0 &&
      typeof data.paymentLink === 'string';
    report(
      'Capability 3: Dunning Dispatch & Instant Payment Link Generation',
      passed,
      `Action: ${data.actionId}, Amount: $${data.finalAmount}, Recipient: ${data.recipientEmail}`
    );
  } catch (err) {
    report('Capability 3: Dunning Dispatch & Instant Payment Link Generation', false, err.message);
  }

  // 6. Dual Khata Ledger Anomaly Detection & Revenue Leakage Audit
  let anomalies;
  try {
    const res = await fetch(`${BASE_URL}/anomalies/audit`, { headers });
    anomalies = await res.json();
    const passed =
      res.ok &&
      Array.isArray(anomalies) &&
      anomalies.length >= 3 &&
      anomalies.some((a) => a.severity === 'CRITICAL');
    report(
      'Capability 4: Dual Khata Ledger Revenue Leakage & Anomaly Audit',
      passed,
      `Detected ${anomalies.length} anomalies across General Ledger & Stripe Subscriptions`
    );
  } catch (err) {
    report('Capability 4: Dual Khata Ledger Revenue Leakage & Anomaly Audit', false, err.message);
  }

  // 7. Human-in-the-Loop Anomaly Resolution
  try {
    const targetAnomaly = anomalies?.find((a) => a.status === 'DETECTED') || anomalies?.[0];
    const res = await fetch(`${BASE_URL}/anomalies/resolve`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        anomalyId: targetAnomaly?.id || 'anom_leakage_104',
        resolutionAction: 'MARK_RECONCILED',
        notes: 'Verified bank wire deposit match in weekly treasury ledger.',
      }),
    });
    const data = await res.json();
    const passed = res.ok && data.success === true && data.status === 'RESOLVED';
    report(
      'Capability 5: Human-in-the-Loop (HITL) Anomaly Remediation',
      passed,
      `Resolved: ${data.anomalyId} via ${data.resolutionAction}`
    );
  } catch (err) {
    report('Capability 5: Human-in-the-Loop (HITL) Anomaly Remediation', false, err.message);
  }

  // 8. Probabilistic 30/60/90-Day Cashflow Forecasting Engine
  try {
    const res = await fetch(`${BASE_URL}/cashflow/forecast`, { headers });
    const data = await res.json();
    const passed =
      res.ok &&
      Array.isArray(data.projections) &&
      data.projections.length === 3 &&
      typeof data.currentOutstandingAr === 'number';
    report(
      'Capability 6: Probabilistic 30/60/90-Day Cashflow Forecasting',
      passed,
      `30d: $${data.projections?.[0]?.projectedCashInflow?.toLocaleString()} (${data.projections?.[0]?.collectionProbability}), 60d: $${data.projections?.[1]?.projectedCashInflow?.toLocaleString()}`
    );
  } catch (err) {
    report('Capability 6: Probabilistic 30/60/90-Day Cashflow Forecasting', false, err.message);
  }

  // 9. RAG Playbook Dispute & Deduction Claim Analysis
  try {
    const res = await fetch(`${BASE_URL}/disputes/analyze`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        disputeText: 'Client claims 4-hour SLA outage during payroll batch run and demands 10% credit memo.',
      }),
    });
    const data = await res.json();
    const passed =
      res.ok &&
      data.matchedCategory === 'SERVICE_QUALITY' &&
      typeof data.eligibleServiceCreditPercent === 'number' &&
      !!data.suggestedResponseTemplate;
    report(
      'Capability 7: RAG Dispute & SLA Deduction Analysis',
      passed,
      `Matched: ${data.matchedCategory}, Max Credit: ${data.eligibleServiceCreditPercent}%, Response Template Ready`
    );
  } catch (err) {
    report('Capability 7: RAG Dispute & SLA Deduction Analysis', false, err.message);
  }

  // 10. API Gateway Reverse Proxy Integration (:4000/api/ai/departments/finance/*)
  try {
    const res = await fetch(`${GATEWAY_URL}/overview`, { headers });
    const data = await res.json();
    const passed = res.ok && data.department === 'AI_FINANCE_DEPARTMENT';
    report(
      'API Gateway Routing: :4000/api/ai/departments/finance/overview',
      passed,
      `Gateway Proxied HTTP ${res.status}, Department: ${data.department}`
    );
  } catch (err) {
    report('API Gateway Routing: :4000/api/ai/departments/finance/overview', false, err.message);
  }

  console.log(`\n${c.bold}${c.cyan}========================================================================================${c.reset}`);
  console.log(`${c.bold}SUMMARY: ${passedTests}/${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)${c.reset}`);
  console.log(`${c.bold}${c.cyan}========================================================================================${c.reset}\n`);

  if (passedTests !== totalTests) {
    console.error(`${c.red}❌ SOME TESTS FAILED.${c.reset}`);
    process.exit(1);
  } else {
    console.log(`${c.green}✅ ALL STAGE 5.3 AI FINANCE DEPARTMENT CAPABILITIES VERIFIED!${c.reset}\n`);
    process.exit(0);
  }
}

runFinanceDepartmentTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
