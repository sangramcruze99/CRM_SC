#!/usr/bin/env node
/**
 * Stage 5.1 Verification Test: AI Sales Department
 * Tests all 13 core capabilities against the live microservice
 */

import { createRequire } from 'module';
process.loadEnvFile?.('.env');
const require = createRequire(import.meta.url);
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'replace-with-a-secure-random-32-byte-hex-or-base64-string';
const TENANT_ID = 'tenant_sales_dept_test';

const validToken = jwt.sign(
  {
    sub: 'sales-lead-ae',
    email: 'head-of-sales@businessos.test',
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

const BASE_URL = 'http://localhost:3010/departments/sales';
const GATEWAY_URL = 'http://localhost:4000/api/ai/departments/sales';

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
};

async function runSalesDepartmentTests() {
  console.log(`\n${c.bold}${c.cyan}========================================================================================${c.reset}`);
  console.log(`${c.bold}🚀 STAGE 5.1: AI SALES DEPARTMENT VERIFICATION SUITE${c.reset}`);
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

  let createdDealId = null;

  // 1. Overview & Architecture Pillars
  try {
    const res = await fetch(`${BASE_URL}/overview`, { headers });
    const data = await res.json();
    const passed = res.ok && data.department === 'AI_SALES_DEPARTMENT' && data.architecturePillars?.agents?.length >= 3;
    report(
      'Capability Pillar: Department Overview & Agents Ensemble',
      passed,
      `Agents: ${data.architecturePillars?.agents?.map(a => a.name).join(', ')}`
    );
  } catch (err) {
    report('Capability Pillar: Department Overview & Agents Ensemble', false, err.message);
  }

  // 2. Department KPIs
  try {
    const res = await fetch(`${BASE_URL}/kpis`, { headers });
    const data = await res.json();
    const passed = res.ok && typeof data.totalPipelineAmount === 'number' && typeof data.winRatePercent === 'number';
    report(
      'Capability Pillar: Department KPIs Engine',
      passed,
      `Active Deals: ${data.activeDealsCount}, Win Rate: ${data.winRatePercent}%, Avg Deal: $${data.avgDealSize}`
    );
  } catch (err) {
    report('Capability Pillar: Department KPIs Engine', false, err.message);
  }

  // 3. Lead Qualification & ICP Scoring (Tier 1 Enterprise)
  try {
    const res = await fetch(`${BASE_URL}/leads/qualify`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        firstName: 'Marcus',
        lastName: 'Vance',
        email: 'marcus.vance@hypergrowth-saas.com',
        company: 'HyperGrowth SaaS Inc',
        title: 'Chief Revenue Officer',
        industry: 'Enterprise Software',
        employees: 850,
        revenueMillions: 65,
        budget: 75000,
        timelineMonths: 1,
        notes: 'Needs to replace Salesforce with autonomous AI sentinels for 40 reps',
      }),
    });
    const data = await res.json();
    const passed = res.ok && data.icpScore >= 80 && data.fitTier === 'TIER_1_ENTERPRISE' && !!data.autoCreatedDealId;
    if (data.autoCreatedDealId) createdDealId = data.autoCreatedDealId;
    report(
      'Capability 1 & 3: Lead Qualification & Firmographic Enrichment',
      passed,
      `Score: ${data.icpScore}/100, Tier: ${data.fitTier}, Projected: $${data.recommendedContractValue}, DealId: ${data.autoCreatedDealId}`
    );
  } catch (err) {
    report('Capability 1 & 3: Lead Qualification & Firmographic Enrichment', false, err.message);
  }

  // 4. Company / ICP Analysis
  try {
    const res = await fetch(`${BASE_URL}/companies/analyze`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        domain: 'fintech-apex.io',
        name: 'Apex Global Financial',
        industry: 'Financial Services',
        employees: 620,
      }),
    });
    const data = await res.json();
    const passed = res.ok && data.tier === 'TIER_1_ENTERPRISE' && data.matchPercentage > 50;
    report(
      'Capability 2: Company / ICP Strategic Fit Analysis',
      passed,
      `Match: ${data.matchPercentage}%, Tier: ${data.tier}, Offer: ${data.recommendedEntryOffer}`
    );
  } catch (err) {
    report('Capability 2: Company / ICP Strategic Fit Analysis', false, err.message);
  }

  // 5. Automatic Deal Creation
  try {
    const res = await fetch(`${BASE_URL}/deals/create`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Apex Global — AI Inbound Operations',
        amount: 48000,
        contactEmail: 'cto@fintech-apex.io',
        contactName: 'Elena Rostova',
        companyName: 'Apex Global Financial',
        stage: 'Proposal',
      }),
    });
    const data = await res.json();
    const passed = res.ok && data.deal?.id && data.deal?.amount === 48000;
    if (!createdDealId && data.deal?.id) createdDealId = data.deal.id;
    report(
      'Capability 4: Automatic Deal Opportunity Creation',
      passed,
      `Created Deal: "${data.deal?.title}" ($${data.deal?.amount}), ContactId: ${data.contact?.id}`
    );
  } catch (err) {
    report('Capability 4: Automatic Deal Opportunity Creation', false, err.message);
  }

  // 6. Opportunity Scoring, Risk Detection, and Next-Best-Action (NBA)
  if (createdDealId) {
    try {
      const res = await fetch(`${BASE_URL}/deals/analyze`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ dealId: createdDealId }),
      });
      const data = await res.json();
      const passed = res.ok && typeof data.score?.winProbability === 'number' && !!data.risk?.riskLevel && !!data.nextAction?.recommendedAction;
      report(
        'Capability 5, 6 & 7: Opportunity Scoring, Risk & Next-Best-Action',
        passed,
        `Win Prob: ${data.score?.winProbability}%, Risk: ${data.risk?.riskLevel}, Next Best Action: "${data.nextAction?.recommendedAction}"`
      );
    } catch (err) {
      report('Capability 5, 6 & 7: Opportunity Scoring, Risk & Next-Best-Action', false, err.message);
    }
  }

  // 7. Meeting Preparation Dossier (Battlecards & Discovery)
  if (createdDealId) {
    try {
      const res = await fetch(`${BASE_URL}/meetings/prepare`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          dealId: createdDealId,
          meetingAgenda: 'Executive Architecture & Autonomous Rollout Briefing',
        }),
      });
      const data = await res.json();
      const passed = res.ok && data.recommendedDiscoveryQuestions?.length >= 3 && data.relevantBattlecards?.length >= 2;
      report(
        'Capability 9: Pre-Meeting Dossier & RAG Battlecards',
        passed,
        `Attendee: ${data.attendee?.name}, Questions: ${data.recommendedDiscoveryQuestions?.length}, Battlecards: ${data.relevantBattlecards?.map(b => b.category).join(', ')}`
      );
    } catch (err) {
      report('Capability 9: Pre-Meeting Dossier & RAG Battlecards', false, err.message);
    }
  }

  // 8. Sales Email Generation (Groq / OpenRouter AI)
  try {
    const res = await fetch(`${BASE_URL}/emails/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type: 'POST_DISCOVERY',
        prospectName: 'Marcus',
        companyName: 'HyperGrowth SaaS',
        keyPainPoint: 'Manual CRM data entry and 24h lead latency',
        customOffer: '14-day zero-downtime pilot',
      }),
    });
    const data = await res.json();
    const passed = res.ok && !!data.subject && !!data.body;
    report(
      'Capability 10: AI Sales Copy & Email Generation',
      passed,
      `Subject: "${data.subject}", CTA: "${data.callToAction || 'Schedule Call'}"`
    );
  } catch (err) {
    report('Capability 10: AI Sales Copy & Email Generation', false, err.message);
  }

  // 9. Automatic Follow-Up with Policy Enforcement (Discount > 15% requires HITL Approval)
  if (createdDealId) {
    try {
      const res = await fetch(`${BASE_URL}/follow-up`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          dealId: createdDealId,
          proposedDiscountPercent: 20, // > 15% trigger HITL
          customNote: 'Offering 20% discount if signed before end of month',
        }),
      });
      const data = await res.json();
      const passed = res.ok && data.status === 'QUEUED_FOR_APPROVAL' && !!data.approvalRequestId;
      report(
        'Capability 8 & Policy: Follow-Up with HITL Approval Gate',
        passed,
        `Status: ${data.status}, Approval ID: ${data.approvalRequestId}, Policy Reason: "${data.reason?.slice(0, 60)}..."`
      );
    } catch (err) {
      report('Capability 8 & Policy: Follow-Up with HITL Approval Gate', false, err.message);
    }
  }

  // 10. Stalled-Deal Recovery Loop
  try {
    const res = await fetch(`${BASE_URL}/deals/stalled-recovery`, {
      method: 'POST',
      headers,
    });
    const data = await res.json();
    const passed = res.ok && Array.isArray(data.recoveryPlans);
    report(
      'Capability 11: Stalled-Deal Autonomous Recovery Engine',
      passed,
      `Identified Stalled Deals: ${data.recoveredDealsCount}, Strategies: ${data.recoveryPlans?.map(p => p.recoveryStrategy).join(', ') || 'None'}`
    );
  } catch (err) {
    report('Capability 11: Stalled-Deal Autonomous Recovery Engine', false, err.message);
  }

  // 11. Pipeline Forecasting Engine
  try {
    const res = await fetch(`${BASE_URL}/forecast`, { headers });
    const data = await res.json();
    const passed = res.ok && typeof data.totalPipelineValue === 'number' && typeof data.weightedForecastValue === 'number';
    report(
      'Capability 12: Pipeline Forecasting & Stage Projection',
      passed,
      `Pipeline: $${data.totalPipelineValue?.toLocaleString() || 0}, Weighted Forecast: $${data.weightedForecastValue?.toLocaleString() || 0}, Q-Projection: $${data.quarterlyProjection?.toLocaleString() || 0}`
    );
  } catch (err) {
    report('Capability 12: Pipeline Forecasting & Stage Projection', false, err.message);
  }

  // 12. Sales Rep Daily Recommendations Board
  try {
    const res = await fetch(`${BASE_URL}/recommendations`, { headers });
    const data = await res.json();
    const passed = res.ok && Array.isArray(data.recommendations);
    report(
      'Capability 13: Rep Daily Priority Recommendations',
      passed,
      `Daily Recommendations: ${data.totalRecommendations}, Top Focus: "${data.recommendations[0]?.title || 'Pipeline review'}"`
    );
  } catch (err) {
    report('Capability 13: Rep Daily Priority Recommendations', false, err.message);
  }

  // 13. API Gateway Proxy Verification (:4000/api/ai/departments/sales/overview)
  try {
    const res = await fetch(`${GATEWAY_URL}/overview`, { headers });
    const data = await res.json();
    const passed = res.ok && data.department === 'AI_SALES_DEPARTMENT';
    report(
      'API Gateway Routing: :4000/api/ai/departments/sales/overview',
      passed,
      `Gateway Proxied HTTP ${res.status}, Department: ${data.name}`
    );
  } catch (err) {
    report('API Gateway Routing: :4000/api/ai/departments/sales/overview', false, err.message);
  }

  // Final Summary
  console.log(`\n${c.bold}${c.cyan}========================================================================================${c.reset}`);
  console.log(`${c.bold}SUMMARY: ${passedTests}/${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)${c.reset}`);
  console.log(`${c.bold}${c.cyan}========================================================================================${c.reset}\n`);

  if (passedTests === totalTests) {
    console.log(`${c.green}${c.bold}🎉 ALL 13 SALES DEPARTMENT CAPABILITIES & GATEWAY ROUTING PASSED!${c.reset}\n`);
    process.exit(0);
  } else {
    console.error(`${c.red}${c.bold}❌ SOME TESTS FAILED.${c.reset}\n`);
    process.exit(1);
  }
}

runSalesDepartmentTests().catch((err) => {
  console.error('Fatal test runner failure:', err);
  process.exit(1);
});
