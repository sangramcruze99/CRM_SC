#!/usr/bin/env node
/**
 * Stage 5.2 Verification Test: AI Customer Success Department
 * Tests all proactive customer health, churn detection, and automated intervention capabilities
 */

import { createRequire } from 'module';
process.loadEnvFile?.('.env');
const require = createRequire(import.meta.url);
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'replace-with-a-secure-random-32-byte-hex-or-base64-string';
const TENANT_ID = 'tenant_prod_audit_alpha';

const validToken = jwt.sign(
  {
    sub: 'cs-lead-csm',
    email: 'head-of-cs@businessos.test',
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

const BASE_URL = 'http://localhost:3010/departments/cs';
const GATEWAY_URL = 'http://localhost:4000/api/ai/departments/cs';

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
};

async function runCustomerSuccessDepartmentTests() {
  console.log(`\n${c.bold}${c.cyan}========================================================================================${c.reset}`);
  console.log(`${c.bold}🛡️ STAGE 5.2: AI CUSTOMER SUCCESS DEPARTMENT VERIFICATION SUITE${c.reset}`);
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
    const passed = res.ok && data.department === 'AI_CUSTOMER_SUCCESS_DEPARTMENT' && data.architecturePillars?.agents?.length >= 3;
    report(
      'Capability Pillar: CS Department Overview & Ensemble Agents',
      passed,
      `Agents: ${data.architecturePillars?.agents?.map(a => a.name).join(', ')}`
    );
  } catch (err) {
    report('Capability Pillar: CS Department Overview & Ensemble Agents', false, err.message);
  }

  // 2. Department KPIs Engine
  try {
    const res = await fetch(`${BASE_URL}/kpis`, { headers });
    const data = await res.json();
    const passed = res.ok && typeof data.avgAccountHealthScore === 'number' && typeof data.netRevenueRetentionPercent === 'number';
    report(
      'Capability Pillar: Customer Success Live KPIs Engine',
      passed,
      `Avg Health: ${data.avgAccountHealthScore}/100, NRR: ${data.netRevenueRetentionPercent}%, At-Risk ARR: $${data.atRiskArrAmount?.toLocaleString()}`
    );
  } catch (err) {
    report('Capability Pillar: Customer Success Live KPIs Engine', false, err.message);
  }

  // 3. Customer Health Evaluation (Multi-Dimensional Scoring)
  try {
    const res = await fetch(`${BASE_URL}/health/evaluate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
    });
    const data = await res.json();
    const passed = res.ok && typeof data.healthScore === 'number' && !!data.healthTier && !!data.metricsBreakdown;
    report(
      'Capability 1: Multi-Dimensional Customer Health Evaluation',
      passed,
      `Score: ${data.healthScore}/100, Tier: ${data.healthTier}, Trend: ${data.trend}, SupportScore: ${data.metricsBreakdown?.supportTicketScore}/25`
    );
  } catch (err) {
    report('Capability 1: Multi-Dimensional Customer Health Evaluation', false, err.message);
  }

  // 4. Proactive Churn Risk Detection & Root Cause Analysis
  try {
    const res = await fetch(`${BASE_URL}/churn/detect`, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
    });
    const data = await res.json();
    const passed = res.ok && typeof data.churnProbability === 'number' && !!data.urgencyLevel && !!data.primaryRootCause;
    report(
      'Capability 2 & 3: Proactive Churn Risk & Root-Cause Diagnosis',
      passed,
      `Churn Prob: ${data.churnProbability}%, Urgency: ${data.urgencyLevel}, Root Cause: ${data.primaryRootCause}`
    );
  } catch (err) {
    report('Capability 2 & 3: Proactive Churn Risk & Root-Cause Diagnosis', false, err.message);
  }

  // 5. Athena Recommended Intervention (OODA Loop)
  try {
    const res = await fetch(`${BASE_URL}/interventions/recommend`, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
    });
    const data = await res.json();
    const passed = res.ok && !!data.interventionTitle && Array.isArray(data.actionablePlaybook) && !!data.preDraftedEmail?.subject;
    report(
      'Capability 4: Athena Sentinel OODA Recommended Intervention',
      passed,
      `Intervention: "${data.interventionTitle}", Steps: ${data.actionablePlaybook?.length}, Email Subject: "${data.preDraftedEmail?.subject}"`
    );
  } catch (err) {
    report('Capability 4: Athena Sentinel OODA Recommended Intervention', false, err.message);
  }

  // 6. Execute Intervention Workflow (Task creation + Activity log)
  try {
    const res = await fetch(`${BASE_URL}/interventions/execute`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        csmTaskTitle: 'Athena Intervention: Review Onboarding Bottleneck for Apex Global',
        proposedServiceCreditPercent: 10, // within 15% auto limit
      }),
    });
    const data = await res.json();
    const passed = res.ok && data.status === 'INTERVENTION_DEPLOYED' && !!data.taskId;
    report(
      'Capability 5: Execute Autonomous Intervention Workflow',
      passed,
      `Status: ${data.status}, TaskId: ${data.taskId}, TaskTitle: "${data.taskTitle}"`
    );
  } catch (err) {
    report('Capability 5: Execute Autonomous Intervention Workflow', false, err.message);
  }

  // 7. Policy Gate: Concession Approval (>15% requires HITL Sign-off)
  try {
    const res = await fetch(`${BASE_URL}/interventions/execute`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        csmTaskTitle: 'Executive Goodwill Credit Offer',
        proposedServiceCreditPercent: 25, // > 15% trigger approval
      }),
    });
    const data = await res.json();
    const passed = res.ok && data.status === 'QUEUED_FOR_APPROVAL' && !!data.approvalRequestId;
    report(
      'Policy Gate: Retention Concession HITL Approval Trigger',
      passed,
      `Status: ${data.status}, Approval ID: ${data.approvalRequestId}, Reason: "${data.reason?.slice(0, 60)}..."`
    );
  } catch (err) {
    report('Policy Gate: Retention Concession HITL Approval Trigger', false, err.message);
  }

  // 8. CSM P1 Escalation Engine
  try {
    const res = await fetch(`${BASE_URL}/escalate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        reason: 'Client technical champion unresponsive; critical support ticket pending',
      }),
    });
    const data = await res.json();
    const passed = res.ok && data.status === 'ESCALATED_TO_CSM' && !!data.assignedTaskId;
    report(
      'Capability 6: Autonomous CSM Escalation Engine',
      passed,
      `Status: ${data.status}, Assigned Task: ${data.assignedTaskId}, Account: ${data.accountName}`
    );
  } catch (err) {
    report('Capability 6: Autonomous CSM Escalation Engine', false, err.message);
  }

  // 9. Proactive Workspace Account Scanner
  try {
    const res = await fetch(`${BASE_URL}/accounts/scan`, { headers });
    const data = await res.json();
    const passed = res.ok && typeof data.totalAccountsScanned === 'number' && Array.isArray(data.accounts);
    report(
      'Capability 7: Proactive Account Scanner (Pre-Complaint Detection)',
      passed,
      `Total Audited: ${data.totalAccountsScanned}, Healthy: ${data.healthyAccountsCount}, At-Risk: ${data.atRiskAccountsCount}`
    );
  } catch (err) {
    report('Capability 7: Proactive Account Scanner (Pre-Complaint Detection)', false, err.message);
  }

  // 10. Executive Business Review (EBR) Briefing Generator
  try {
    const res = await fetch(`${BASE_URL}/ebr/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
    });
    const data = await res.json();
    const passed = res.ok && !!data.ebrId && data.recommendedExpansionOpportunities?.length >= 1;
    report(
      'Capability 8: Executive Business Review (EBR) Briefing Dossier',
      passed,
      `Account: ${data.accountName}, Saved Hours: ${data.keySuccessMetrics?.manualHoursSavedPerMonth}/mo, Expansions: ${data.recommendedExpansionOpportunities?.length}`
    );
  } catch (err) {
    report('Capability 8: Executive Business Review (EBR) Briefing Dossier', false, err.message);
  }

  // 11. API Gateway Proxy Verification (:4000/api/ai/departments/cs/overview)
  try {
    const res = await fetch(`${GATEWAY_URL}/overview`, { headers });
    const data = await res.json();
    const passed = res.ok && data.department === 'AI_CUSTOMER_SUCCESS_DEPARTMENT';
    report(
      'API Gateway Routing: :4000/api/ai/departments/cs/overview',
      passed,
      `Gateway Proxied HTTP ${res.status}, Department: ${data.name}`
    );
  } catch (err) {
    report('API Gateway Routing: :4000/api/ai/departments/cs/overview', false, err.message);
  }

  // Final Summary
  console.log(`\n${c.bold}${c.cyan}========================================================================================${c.reset}`);
  console.log(`${c.bold}SUMMARY: ${passedTests}/${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)${c.reset}`);
  console.log(`${c.bold}${c.cyan}========================================================================================${c.reset}\n`);

  if (passedTests === totalTests) {
    console.log(`${c.green}${c.bold}🎉 ALL 11 CUSTOMER SUCCESS DEPARTMENT CAPABILITIES & GATEWAY ROUTING PASSED!${c.reset}\n`);
    process.exit(0);
  } else {
    console.error(`${c.red}${c.bold}❌ SOME TESTS FAILED.${c.reset}\n`);
    process.exit(1);
  }
}

runCustomerSuccessDepartmentTests().catch((err) => {
  console.error('Fatal test runner failure:', err);
  process.exit(1);
});
