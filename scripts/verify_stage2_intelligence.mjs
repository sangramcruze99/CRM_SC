import assert from 'assert';

console.log('\n================================================================');
console.log('🤖 STAGE 2: PRODUCTION AGENT INTELLIGENCE VERIFICATION');
console.log('================================================================\n');

// ----------------------------------------------------------------------------
// 1. VERIFY AGENT STATE MACHINE
// ----------------------------------------------------------------------------
console.log('--- 1. Testing AgentExecutionStateMachine ---');

import { AgentExecutionStateMachine } from '../apps/ai-engine/src/agents/state-machine/agent-state-machine.ts';

const sm = new AgentExecutionStateMachine('exec_test_01', 'agent_sales', 'default-tenant', 'PENDING', 2);
assert.strictEqual(sm.getState(), 'PENDING', 'Initial state must be PENDING');

sm.transition('RUNNING', 'Event matched and execution started');
assert.strictEqual(sm.getState(), 'RUNNING');

sm.transition('WAITING_FOR_TOOL', 'Calling search_crm_deals');
assert.strictEqual(sm.getState(), 'WAITING_FOR_TOOL');

sm.transition('RUNNING', 'Tool search_crm_deals returned results');
assert.strictEqual(sm.getState(), 'RUNNING');

sm.transition('WAITING_FOR_APPROVAL', 'send_email requires human sign-off', { approvalRequestId: 'appr_99' });
assert.strictEqual(sm.getState(), 'WAITING_FOR_APPROVAL');
assert.strictEqual(sm.isWaitingForHuman(), true);

sm.transition('EXECUTING', 'Operator approved email dispatch');
assert.strictEqual(sm.getState(), 'EXECUTING');

sm.transition('COMPLETED', 'All plan steps finished');
assert.strictEqual(sm.getState(), 'COMPLETED');
assert.strictEqual(sm.isTerminal(), true);

// Test retry policy on failure
const failureSm = new AgentExecutionStateMachine('exec_fail_01', 'agent_finance', 'default-tenant', 'PENDING', 2);
failureSm.transition('RUNNING');
failureSm.transition('FAILED', 'API timeout');
failureSm.transition('RETRYING', 'Attempting retry 1');
failureSm.transition('RUNNING');
failureSm.transition('FAILED', 'API timeout again');
failureSm.transition('RETRYING', 'Attempting retry 2');
failureSm.transition('RUNNING');
failureSm.transition('FAILED', 'Persistent failure');
failureSm.transition('RETRYING', 'Attempting retry 3 (exceeds max of 2)');
assert.strictEqual(failureSm.getState(), 'FAILED_PERMANENTLY', 'Exceeded retries must transition to FAILED_PERMANENTLY');

console.log('✅ AgentExecutionStateMachine: All state transitions & retry bounds verified!');

// ----------------------------------------------------------------------------
// 2. VERIFY AGENT PLAN SYSTEM
// ----------------------------------------------------------------------------
console.log('\n--- 2. Testing AgentPlanService ---');

import { AgentPlanService } from '../apps/ai-engine/src/agents/plans/agent-plan.service.ts';

const planService = new AgentPlanService();
const testPlan = planService.createPlan({
  agentId: 'agent_sales',
  tenantId: 'default-tenant',
  goal: 'Recover stalled enterprise deal for Acme Corp',
  steps: [
    { action: 'SEARCH_DEAL', description: 'Query deal status', riskLevel: 'LOW' },
    { action: 'CHECK_RECENT_ACTIVITY', description: 'Inspect last email contact', riskLevel: 'LOW' },
    { action: 'CREATE_FOLLOWUP_TASK', description: 'Add rep reminder to workspace', riskLevel: 'LOW' },
    { action: 'SEND_EMAIL', description: 'Send proposal followup', riskLevel: 'HIGH', requiresApproval: true },
  ],
});

assert.strictEqual(testPlan.status, 'PLANNED');
assert.strictEqual(testPlan.steps.length, 4);

const firstStep = planService.getNextPendingStep(testPlan.id);
assert.strictEqual(firstStep?.action, 'SEARCH_DEAL');

planService.updateStepStatus(testPlan.id, firstStep.id, 'COMPLETED', { dealFound: true });
const secondStep = planService.getNextPendingStep(testPlan.id);
assert.strictEqual(secondStep?.action, 'CHECK_RECENT_ACTIVITY');

const highRiskStep = testPlan.steps.find((s) => s.action === 'SEND_EMAIL');
assert.strictEqual(highRiskStep?.requiresApproval, true, 'High-risk steps must require approval');

console.log('✅ AgentPlanService: Structured plan sequencing and step progression verified!');

// ----------------------------------------------------------------------------
// 3. VERIFY AGENT POLICY & EXPLAINABILITY ENGINE ("Why did the AI do this?")
// ----------------------------------------------------------------------------
console.log('\n--- 3. Testing AgentPolicyEngineService & Explainability ---');

import { AgentPolicyEngineService } from '../apps/ai-engine/src/agents/policy/agent-policy-engine.service.ts';

const policyEngine = new AgentPolicyEngineService();

// Low-Risk internal action
const lowRiskEval = policyEngine.evaluateAction({
  agentId: 'agent_sales',
  agentName: 'Ares Sales Sentinel',
  actionName: 'create_crm_task',
  targetEntity: 'Deal',
  targetId: 'deal_123',
  parameters: { title: 'Follow-up on stalled deal' },
  contextData: { amount: 15000, stage: 'Proposal', daysInactive: 11 },
});

assert.strictEqual(lowRiskEval.riskLevel, 'LOW');
assert.strictEqual(lowRiskEval.requiresHumanApproval, false);
assert.ok(lowRiskEval.explainability.why.length > 0);
console.log('   [Explainability Output - Low Risk Task]:');
console.log('   - Action:', lowRiskEval.explainability.action);
console.log('   - Why:', lowRiskEval.explainability.why.join('; '));
console.log('   - Confidence:', `${lowRiskEval.explainability.confidence * 100}%`);
console.log('   - Expected Outcome:', lowRiskEval.explainability.expectedOutcome);

// High-Risk external action
const highRiskEval = policyEngine.evaluateAction({
  agentId: 'agent_sales',
  agentName: 'Ares Sales Sentinel',
  actionName: 'send_email',
  targetEntity: 'Deal',
  targetId: 'deal_456',
  parameters: { to: 'cfo@client.com', subject: 'Proposal followup' },
  contextData: { amount: 85000, stage: 'Proposal', daysInactive: 11 },
});

assert.strictEqual(highRiskEval.riskLevel, 'HIGH');
assert.strictEqual(highRiskEval.requiresHumanApproval, true, 'Outbound email over $25k must require approval');
assert.ok(highRiskEval.explainability.why.some((w) => w.includes('exceeds autonomous threshold')));

console.log('   [Explainability Output - High Risk Email]:');
console.log('   - Action:', highRiskEval.explainability.action);
console.log('   - Why:');
highRiskEval.explainability.why.forEach((w) => console.log(`     • ${w}`));
console.log('   - Risk:', highRiskEval.explainability.riskLevel);
console.log('   - Confidence:', `${highRiskEval.explainability.confidence * 100}%`);

console.log('✅ AgentPolicyEngineService: Risk analysis & Explainability Engine verified!');

// ----------------------------------------------------------------------------
// 4. VERIFY AGENT CONTEXT ENGINE PLANNING
// ----------------------------------------------------------------------------
console.log('\n--- 4. Testing AgentContextEngineService ---');

import { AgentContextEngineService } from '../apps/ai-engine/src/agents/context/agent-context-engine.service.ts';

const mockPrisma = {
  deal: { findFirst: async () => ({ id: 'deal_test', title: 'Enterprise Core License', amount: 48000, stage: 'Proposal' }) },
  activity: { findMany: async () => [{ id: 'act_1', title: 'Proposal Sent', createdAt: new Date() }] },
  invoice: { findFirst: async () => ({ id: 'inv_test', invoiceNum: 'INV-4029', amount: 12500, dueDate: new Date(Date.now() - 14 * 86400000) }) },
  contact: { findFirst: async () => null },
  ticket: { findFirst: async () => null },
  agentMemory: { findMany: async () => [] },
};
const mockKnowledge = { search: async () => [{ title: 'Pricing FAQ', content: 'Enterprise pricing is Net 30.' }] };
const mockMemoryGov = { getCategorizedMemories: async () => ({ userMemories: [], agentMemories: [], businessMemories: [] }) };

const contextEngine = new AgentContextEngineService(mockPrisma, mockKnowledge, mockMemoryGov);

const salesPlan = contextEngine.planContext('agent_sales', 'DEAL_STAGE_CHANGED');
assert.ok(salesPlan.requiredEntities.includes('Deal'));
assert.strictEqual(salesPlan.includeKnowledge, true);

const financePlan = contextEngine.planContext('agent_finance', 'INVOICE_OVERDUE');
assert.ok(financePlan.requiredEntities.includes('Invoice'));
assert.strictEqual(financePlan.includeKnowledge, true);

console.log('✅ AgentContextEngineService: Domain context planning verified!');

// ----------------------------------------------------------------------------
// 5. SUMMARY
// ----------------------------------------------------------------------------
console.log('\n================================================================');
console.log('🎉 ALL STAGE 2 PRODUCTION AGENT SUBSYSTEMS VERIFIED SUCCESSFULLY');
console.log('================================================================\n');
