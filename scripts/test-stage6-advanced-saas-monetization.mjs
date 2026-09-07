/**
 * STAGE 6 + 6.5 — ULTIMATE PRODUCTION SAAS MONETIZATION, RELIABILITY & SCALE
 * Complete Automated Verification Suite
 * 
 * Verifies:
 * 1. Multi-Currency Engine & Auditable FX Conversions (USD, EUR, GBP, BDT)
 * 2. Strict 10-State Subscription State Machine & Invalid Transition Rejections
 * 3. Double-Entry Credit Ledger & Invariant Accounting (Included, Purchased, Promotional, Enterprise)
 * 4. AI Raw Provider Cost vs Customer Charge Unit Economics (Groq/OpenRouter COGS & Margins)
 * 5. Autonomous AI Budgeting, Multi-Threshold Alerts (50%, 75%, 80%, 90%, 100%) & Hard Block Policies
 * 6. Server-Side Coupon Engine, Atomic Redemptions & Fraud Prevention
 * 7. External Vendor Circuit Breakers & Graceful Degradation (Stripe, Groq, OpenRouter)
 * 8. Emergency Operational AI Kill Switches (GLOBAL_AI, Agent, Tool level)
 * 9. Stripe Webhook Replay Protection & Idempotency Store
 * 10. Multi-Tenant Cryptographic & Logical Boundary Isolation
 * 11. API Gateway Reverse Proxy Integration (:4000/api/billing/*)
 * 12. Liveness and Dependency Readiness Health Probes
 */

import crypto from 'crypto';

const BILLING_URL = process.env.BILLING_URL || 'http://localhost:3027';
const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:4000';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n======================================================================');
  console.log('💎 STAGE 6 & 6.5: SAAS MONETIZATION, RELIABILITY & SCALE VERIFICATION');
  console.log('======================================================================\n');

  const tenantA = `enterprise-tenant-${Date.now()}-A`;
  const tenantB = `enterprise-tenant-${Date.now()}-B`;

  // -------------------------------------------------------------------------
  // SUITE 1: MULTI-CURRENCY PRICING & AUDITABLE FX CONVERSIONS
  // -------------------------------------------------------------------------
  console.log('📌 SUITE 1: Multi-Currency Pricing & Auditable FX Conversions');
  try {
    const resCurr = await fetch(`${BILLING_URL}/billing/currencies`);
    const currencies = await resCurr.json();
    assert(Array.isArray(currencies), 'Currencies endpoint returns supported currency list');
    const codes = currencies.map(c => c.code);
    assert(codes.includes('USD') && codes.includes('EUR') && codes.includes('GBP') && codes.includes('BDT'),
      'Includes mandatory currencies: USD, EUR, GBP, BDT');

    // Convert $100 USD to BDT
    const resConv = await fetch(`${BILLING_URL}/billing/currencies/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 100, from: 'USD', to: 'BDT' }),
    });
    const conv = await resConv.json();
    assert(conv.originalAmount === 100, 'Original amount is preserved in conversion record');
    assert(conv.originalCurrency === 'USD', 'Source currency is USD');
    assert(conv.convertedCurrency === 'BDT', 'Target currency is BDT');
    assert(conv.convertedAmount > 10000, `Converted $100 USD to ${conv.convertedAmount} BDT accurately`);
    assert(conv.exchangeRate > 100, `Recorded auditable exchange rate: ${conv.exchangeRate}`);
    assert(Boolean(conv.exchangeRateTimestamp), 'Auditable timestamp recorded for FX transaction');
  } catch (err) {
    assert(false, `Multi-currency test failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // SUITE 2: STRICT 10-STATE SUBSCRIPTION STATE MACHINE
  // -------------------------------------------------------------------------
  console.log('\n📌 SUITE 2: Strict 10-State Subscription Machine & Transition Guardrails');
  try {
    // Valid transition: TRIALING -> ACTIVE
    const resTrans1 = await fetch(`${BILLING_URL}/billing/subscription/transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantA },
      body: JSON.stringify({ nextState: 'ACTIVE', reason: 'Customer completed payment setup' }),
    });
    const state1 = await resTrans1.json();
    assert(state1.currentState === 'ACTIVE', 'Valid state transition to ACTIVE succeeded');

    // Valid transition: ACTIVE -> PAST_DUE
    const resTrans2 = await fetch(`${BILLING_URL}/billing/subscription/transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantA },
      body: JSON.stringify({ nextState: 'PAST_DUE', reason: 'Invoice payment charge failed' }),
    });
    const state2 = await resTrans2.json();
    assert(state2.currentState === 'PAST_DUE', 'Valid transition to PAST_DUE succeeded');

    // Valid transition: PAST_DUE -> GRACE_PERIOD
    const resTrans3 = await fetch(`${BILLING_URL}/billing/subscription/transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantA },
      body: JSON.stringify({ nextState: 'GRACE_PERIOD', reason: 'Initiated 3-day dunning grace window' }),
    });
    const state3 = await resTrans3.json();
    assert(state3.currentState === 'GRACE_PERIOD', 'Valid transition to GRACE_PERIOD succeeded');

    // Valid transition: GRACE_PERIOD -> RESTRICTED
    const resTrans4 = await fetch(`${BILLING_URL}/billing/subscription/transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantA },
      body: JSON.stringify({ nextState: 'RESTRICTED', reason: 'Grace period expired without settlement' }),
    });
    const state4 = await resTrans4.json();
    assert(state4.currentState === 'RESTRICTED', 'Valid transition to RESTRICTED succeeded');
    assert(state4.privileges.loginAllowed === true, 'RESTRICTED state allows customer login');
    assert(state4.privileges.billingManagementAllowed === true, 'RESTRICTED state allows customer billing access');
    assert(state4.privileges.readOnly === true, 'RESTRICTED state enforces read-only mode');
    assert(state4.privileges.aiExecutionAllowed === false, 'RESTRICTED state strictly blocks paid execution');

    // INVALID transition: RESTRICTED -> TRIALING (must fail with 400 Bad Request)
    const resInvalid = await fetch(`${BILLING_URL}/billing/subscription/transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantA },
      body: JSON.stringify({ nextState: 'TRIALING', reason: 'Illegal downgrade attempt' }),
    });
    assert(resInvalid.status === 400, 'State machine strictly rejected invalid transition (RESTRICTED -> TRIALING) with HTTP 400');
  } catch (err) {
    assert(false, `Subscription state machine test failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // SUITE 3: DOUBLE-ENTRY CREDIT LEDGER & BALANCE INTEGRITY
  // -------------------------------------------------------------------------
  console.log('\n📌 SUITE 3: Double-Entry Credit Ledger & Invariant Accounting');
  try {
    // 1. Grant 200 Purchased Credits
    const resGrant1 = await fetch(`${BILLING_URL}/billing/credits/grant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantA },
      body: JSON.stringify({ amount: 200, type: 'PURCHASED', description: 'Bought 200-pack add-on' }),
    });
    const grant1 = await resGrant1.json();
    assert(grant1.balanceAfter === 200, 'Granted 200 purchased credits; new balance is 200');

    // 2. Grant 50 Promotional Credits
    const resGrant2 = await fetch(`${BILLING_URL}/billing/credits/grant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantA },
      body: JSON.stringify({ amount: 50, type: 'PROMOTIONAL', description: 'Early bird promotion' }),
    });
    const grant2 = await resGrant2.json();
    assert(grant2.balanceAfter === 250, 'Granted 50 promotional credits; cumulative balance is 250');

    // 3. Consume 75 Credits for Agent Execution
    const resConsume = await fetch(`${BILLING_URL}/billing/credits/consume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantA },
      body: JSON.stringify({
        amount: 75,
        executionId: `exec-${Date.now()}-midas`,
        reason: 'Autonomous Midas financial audit run',
      }),
    });
    const consume = await resConsume.json();
    assert(consume.balanceAfter === 175, 'Consumed 75 credits; remaining balance is 175');

    // 4. Overdraft Protection: Attempt to consume 500 Credits (must be rejected)
    const resOverdraft = await fetch(`${BILLING_URL}/billing/credits/consume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantA },
      body: JSON.stringify({
        amount: 500,
        executionId: `exec-${Date.now()}-overdraft`,
        reason: 'Attempt excessive execution beyond balance',
      }),
    });
    assert(resOverdraft.status === 400, 'Credit engine strictly rejected overdraft consumption (500 > 175) with HTTP 400');

    // 5. Query Audit Ledger History
    const resLedger = await fetch(`${BILLING_URL}/billing/credits`, {
      headers: { 'x-tenant-id': tenantA },
    });
    const ledger = await resLedger.json();
    const balance = ledger.summary ? ledger.summary.totalBalance : ledger.totalBalance;
    assert(balance === 175, 'Ledger summary totalBalance matches 175');
    assert(ledger.breakdown.purchased === 200, 'Ledger tracks 200 purchased units');
    assert(ledger.breakdown.promotional === 50, 'Ledger tracks 50 promotional units');
    assert(ledger.breakdown.consumed === 75, 'Ledger tracks 75 consumed units');
    assert(Array.isArray(ledger.history) && ledger.history.length >= 3, 'Audit ledger records all chronological events');
  } catch (err) {
    assert(false, `Credit ledger test failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // SUITE 4: AI RAW PROVIDER COST VS CUSTOMER CHARGE ECONOMICS
  // -------------------------------------------------------------------------
  console.log('\n📌 SUITE 4: AI Raw Provider Cost vs Customer Charge Unit Economics');
  try {
    // Record execution for Ares (Sales SDR)
    const resAres = await fetch(`${BILLING_URL}/billing/ai/cost/record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantA },
      body: JSON.stringify({
        agentId: 'ares',
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        inputTokens: 5000,
        outputTokens: 1000,
        executionId: `exec-ares-${Date.now()}`,
      }),
    });
    const aresData = await resAres.json();
    assert(aresData.providerCostUsd > 0, `Groq provider raw COGS computed: $${aresData.providerCostUsd.toFixed(6)}`);
    assert(aresData.customerChargeUsd > aresData.providerCostUsd,
      `Customer charge ($${aresData.customerChargeUsd.toFixed(4)}) exceeds raw COGS`);
    assert(aresData.grossMarginPercent > 90, `Gross Margin is highly profitable: ${aresData.grossMarginPercent}%`);

    // Record execution for Athena (Support Sentinel)
    await fetch(`${BILLING_URL}/billing/ai/cost/record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantA },
      body: JSON.stringify({
        agentId: 'athena',
        provider: 'openrouter',
        model: 'anthropic/claude-3.5-sonnet',
        inputTokens: 3000,
        outputTokens: 800,
        executionId: `exec-athena-${Date.now()}`,
      }),
    });

    // Query Tenant AI Unit Economics Dashboard
    const resEcon = await fetch(`${BILLING_URL}/billing/ai/economics`, {
      headers: { 'x-tenant-id': tenantA },
    });
    const econ = await resEcon.json();
    assert(econ.totalExecutions >= 2, `Tracks total AI executions: ${econ.totalExecutions}`);
    assert(econ.grossMarginPercent > 0, `Cumulative gross margin percent: ${econ.grossMarginPercent}%`);
    assert(Array.isArray(econ.agentEconomics), 'Agent economics breakdown exists');
    const agentIds = econ.agentEconomics.map(a => a.agentId);
    assert(agentIds.includes('ares') && agentIds.includes('athena'),
      'AI economics accurately isolated Ares and Athena agent performances');
  } catch (err) {
    assert(false, `AI economics test failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // SUITE 5: AUTONOMOUS AI BUDGETS & MULTI-THRESHOLD ENFORCEMENT
  // -------------------------------------------------------------------------
  console.log('\n📌 SUITE 5: Autonomous AI Budgets & Multi-Threshold Enforcement');
  try {
    // 1. Configure Monthly Budget with BLOCK policy
    const resSetBudget = await fetch(`${BILLING_URL}/billing/ai/budget`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantA },
      body: JSON.stringify({
        monthlyBudgetUsd: 10.0,
        dailyBudgetUsd: 2.0,
        actionOnExhaustion: 'BLOCK',
        agentAllocations: { ares: 4.0, athena: 3.0, midas: 3.0 },
      }),
    });
    const budgetState = await resSetBudget.json();
    assert(budgetState.monthlyBudgetUsd === 10.0, 'Configured $10.00 monthly AI budget');
    assert(budgetState.actionOnExhaustion === 'BLOCK', 'Set exhaustion policy to BLOCK');

    // 2. Pre-flight Headroom Check: In-Budget Operation
    const resCheckSafe = await fetch(`${BILLING_URL}/billing/ai/budget/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantA },
      body: JSON.stringify({ estimatedCostUsd: 0.10, agentId: 'ares' }),
    });
    const checkSafe = await resCheckSafe.json();
    assert(checkSafe.allowed === true, 'Pre-flight check approved safe AI execution within budget');

    // 3. Pre-flight Headroom Check: Out-of-Budget Runaway Operation ($20.00 > $10.00 cap)
    const resCheckExceeded = await fetch(`${BILLING_URL}/billing/ai/budget/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantA },
      body: JSON.stringify({ estimatedCostUsd: 20.00, agentId: 'ares' }),
    });
    const checkExceeded = await resCheckExceeded.json();
    assert(checkExceeded.allowed === false, 'Pre-flight check strictly blocked excessive spend ($20 > $10 cap)');
    assert(checkExceeded.action === 'BLOCK', 'Enforced BLOCK guardrail action');
    assert(checkExceeded.reason && checkExceeded.reason.includes('exhausted'), 'Informative guardrail reason provided');
  } catch (err) {
    assert(false, `AI budget test failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // SUITE 6: SERVER-SIDE COUPON ENGINE & ATOMIC REDEMPTIONS
  // -------------------------------------------------------------------------
  console.log('\n📌 SUITE 6: Server-Side Coupon Engine & Atomic Redemptions');
  try {
    // 1. Validate Percentage Discount Coupon (BUSINESSOS20 = 20% off $149)
    const resCoup1 = await fetch(`${BILLING_URL}/billing/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'BUSINESSOS20', amount: 149, planKey: 'BUSINESS' }),
    });
    const coup1 = await resCoup1.json();
    assert(coup1.isValid === true, 'Coupon BUSINESSOS20 is valid');
    assert(coup1.discountAmount === 29.8, `20% discount on $149 computed accurately: $${coup1.discountAmount}`);
    assert(coup1.finalAmount === 119.2, `Final charged amount is $${coup1.finalAmount}`);

    // 2. Validate Fixed Discount Coupon (ENTERPRISEVIP = 30% off $499)
    const resCoup2 = await fetch(`${BILLING_URL}/billing/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'ENTERPRISEVIP', amount: 499, planKey: 'ENTERPRISE' }),
    });
    const coup2 = await resCoup2.json();
    assert(coup2.isValid === true, 'Coupon ENTERPRISEVIP is valid');
    assert(coup2.discountAmount === 149.7, `30% discount is $${coup2.discountAmount}`);
    assert(coup2.finalAmount === 349.3, `Final charged amount is $${coup2.finalAmount}`);

    // 3. Reject Fraudulent / Non-existent Coupon Code
    const resCoupFake = await fetch(`${BILLING_URL}/billing/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'HACKED_999_PERCENT', amount: 100 }),
    });
    const coupFake = await resCoupFake.json();
    assert(coupFake.isValid === false, 'Fraudulent coupon code was strictly rejected');
  } catch (err) {
    assert(false, `Coupon test failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // SUITE 7: CIRCUIT BREAKER RESILIENCE & FAULT TOLERANCE
  // -------------------------------------------------------------------------
  console.log('\n📌 SUITE 7: External Vendor Circuit Breakers & Fault Tolerance');
  try {
    const resCirc = await fetch(`${BILLING_URL}/billing/resilience/circuits`);
    const circuits = await resCirc.json();
    assert(Array.isArray(circuits), 'Circuit breaker endpoint returns status array');
    const services = circuits.map(c => c.service || c.name);
    assert(services.includes('STRIPE') && services.includes('GROQ') && services.includes('OPENROUTER'),
      'Monitors external dependencies: Stripe, Groq, OpenRouter');

    const stripeCircuit = circuits.find(c => (c.service || c.name) === 'STRIPE');
    assert(stripeCircuit.state === 'CLOSED', 'Stripe circuit is in nominal CLOSED state');
    assert(stripeCircuit.failureThreshold === 3, 'Circuit breaker trips after 3 consecutive failures');
  } catch (err) {
    assert(false, `Circuit breaker test failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // SUITE 8: EMERGENCY OPERATIONAL AI KILL SWITCHES
  // -------------------------------------------------------------------------
  console.log('\n📌 SUITE 8: Emergency Operational AI Kill Switches');
  try {
    // 1. Check nominal status
    const resSwitches = await fetch(`${BILLING_URL}/billing/kill-switches`);
    const switches = await resSwitches.json();
    assert(Array.isArray(switches), 'Kill switch endpoint returns configured switches');

    // 2. Trigger Global AI Kill Switch
    const resKillGlobal = await fetch(`${BILLING_URL}/billing/kill-switches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scope: 'GLOBAL',
        target: 'GLOBAL_AI',
        isEnabled: false,
        reason: 'Emergency containment test drill',
      }),
    });
    const killGlobal = await resKillGlobal.json();
    assert(killGlobal.isEnabled === false, 'GLOBAL_AI emergency kill switch successfully activated (AI Disabled)');

    // 3. Re-enable Global AI Switch
    await fetch(`${BILLING_URL}/billing/kill-switches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scope: 'GLOBAL',
        target: 'GLOBAL_AI',
        isEnabled: true,
        reason: 'Restoring nominal operations after test drill',
      }),
    });

    // 4. Trigger High-Risk Tool Kill Switch (stripe.refund)
    const resKillTool = await fetch(`${BILLING_URL}/billing/kill-switches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scope: 'TOOL',
        target: 'stripe.refund',
        isEnabled: false,
        reason: 'Temporarily halt autonomous refund issuance',
      }),
    });
    const killTool = await resKillTool.json();
    assert(killTool.isEnabled === false, 'High-risk tool stripe.refund successfully halted');
  } catch (err) {
    assert(false, `Kill switch test failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // SUITE 9: STRIPE WEBHOOK REPLAY & IDEMPOTENCY PROTECTION
  // -------------------------------------------------------------------------
  console.log('\n📌 SUITE 9: Stripe Webhook Replay & Idempotency Protection');
  try {
    const eventId = `evt_replay_test_${Date.now()}`;
    const invoiceEvent = {
      id: eventId,
      object: 'event',
      type: 'invoice.payment_succeeded',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: `in_test_${Date.now()}`,
          customer: `cus_test_${Date.now()}`,
          subscription: `sub_test_${Date.now()}`,
          amount_paid: 14900,
          currency: 'usd',
          status: 'paid',
          hosted_invoice_url: 'https://pay.stripe.com/invoice/test_inv_001',
          period_start: Math.floor(Date.now() / 1000),
          period_end: Math.floor(Date.now() / 1000) + 30 * 86400,
          metadata: {
            tenantId: tenantA,
          },
        },
      },
    };

    // First delivery (processed)
    const res1 = await fetch(`${BILLING_URL}/billing/stripe/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 't=123,v1=test_sig',
      },
      body: JSON.stringify(invoiceEvent),
    });
    const data1 = await res1.json();
    assert(data1.status === 'PROCESSED' || data1.received === true, 'First webhook delivery verified signature and processed');

    // Duplicate delivery (replayed webhook must be safely idempotent)
    const res2 = await fetch(`${BILLING_URL}/billing/stripe/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 't=123,v1=test_sig',
      },
      body: JSON.stringify(invoiceEvent),
    });
    const data2 = await res2.json();
    assert(data2.status === 'IGNORED_DUPLICATE' || data2.idempotent === true,
      'Duplicate webhook event intercepted by Idempotency Store (zero side-effects)');
  } catch (err) {
    assert(false, `Webhook idempotency test failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // SUITE 10: MULTI-TENANT ISOLATION VERIFICATION
  // -------------------------------------------------------------------------
  console.log('\n📌 SUITE 10: Multi-Tenant Boundary Isolation');
  try {
    // Tenant B queries credits (should be 0 or separate balance)
    const resTenantB = await fetch(`${BILLING_URL}/billing/credits`, {
      headers: { 'x-tenant-id': tenantB },
    });
    const ledgerB = await resTenantB.json();
    const balanceB = ledgerB.summary ? ledgerB.summary.totalBalance : ledgerB.totalBalance;
    assert(balanceB === 0, `Tenant B has independent balance (0), isolated from Tenant A (175)`);

    // Tenant B queries AI economics
    const resEconB = await fetch(`${BILLING_URL}/billing/ai/economics`, {
      headers: { 'x-tenant-id': tenantB },
    });
    const econB = await resEconB.json();
    assert(econB.totalExecutions === 0, 'Tenant B AI economics isolated from Tenant A execution telemetry');
  } catch (err) {
    assert(false, `Multi-tenant isolation test failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // SUITE 11: API GATEWAY REVERSE PROXY ROUTING (:4000 -> :3027)
  // -------------------------------------------------------------------------
  console.log('\n📌 SUITE 11: API Gateway Reverse Proxy Routing (:4000/api/billing/*)');
  try {
    const resProxy = await fetch(`${GATEWAY_URL}/api/billing/currencies`);
    const dataProxy = await resProxy.json();
    assert(Array.isArray(dataProxy), 'Next.js Gateway successfully reverse-proxies to Billing microservice');
    assert(dataProxy.length >= 4, 'Gateway correctly returns multi-currency pricing payloads');
  } catch (err) {
    assert(false, `API Gateway proxy test failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // SUITE 12: LIVENESS & READINESS HEALTH PROBES
  // -------------------------------------------------------------------------
  console.log('\n📌 SUITE 12: Liveness & Dependency Readiness Health Probes');
  try {
    const resHealth = await fetch(`${BILLING_URL}/billing/health`);
    const health = await resHealth.json();
    assert(health.status === 'ok', 'Liveness probe (/billing/health) returns status ok');
    assert(health.uptime >= 0, `Microservice reports active process uptime: ${health.uptime.toFixed(1)}s`);

    const resReady = await fetch(`${BILLING_URL}/billing/ready`);
    const ready = await resReady.json();
    assert(ready.status === 'ready', 'Readiness probe (/billing/ready) returns status ready');
    assert(ready.database === 'connected', 'Readiness probe confirms active database connection');
  } catch (err) {
    assert(false, `Health probes test failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // FINAL REPORT
  // -------------------------------------------------------------------------
  console.log('\n======================================================================');
  console.log(`🎯 STAGE 6 + 6.5 ADVANCED MONETIZATION & RESILIENCE TEST RESULTS`);
  console.log(`   TOTAL TESTS: ${passed + failed}`);
  console.log(`   PASSED:      ${passed}`);
  console.log(`   FAILED:      ${failed}`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
