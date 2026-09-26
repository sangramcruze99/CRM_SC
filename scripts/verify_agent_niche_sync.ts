/**
 * Comprehensive Test Suite for Agent ↔ Niche / Workspace Configuration Sync
 * Tests:
 * 1. Multi-Industry Context Resolution (Healthcare, Real Estate, Restaurant, Retail, Agency, SaaS, Custom)
 * 2. Dynamic Terminology Mapping (Customer -> Patient / Buyer / Guest / Client)
 * 3. Service-to-Tool Dynamic Resolution & Capability Manifest
 * 4. Service Disablement Guard & Honest Refusal Verification
 * 5. RBAC / ABAC Permission Gating
 * 6. High-Risk Action & Human Approval Requirements
 * 7. Authoritative Deterministic Business Rules
 * 8. Custom Record Support (e.g., Equipment in Construction)
 * 9. Configuration Impact Analysis (Blast Radius Calculation)
 * 10. Agent Prompt Synthesis (Token-Budgeted, Anti-Hallucination)
 */

import { getDefaultBlueprint, createBlueprintFromProfile } from '../apps/web-core/src/lib/blueprint/blueprintEngine';
import {
  resolveAgentExecutionContext,
  generateAgentCapabilityManifest,
  formatContextPromptForAgent,
  ResolvedAgentTool,
  BlockedAgentTool,
  ActiveBusinessRule,
  ConfiguredRecordType,
} from '../apps/web-core/src/lib/blueprint/agentContextResolver';
import { analyzeConfigurationImpact } from '../apps/web-core/src/lib/blueprint/agentImpactAnalyzer';

interface TestResult {
  testId: string;
  name: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, testId: string, name: string, details?: string) {
  if (condition) {
    results.push({ testId, name, passed: true, details });
    console.log(`✅ [PASS] ${testId}: ${name} ${details ? `(${details})` : ''}`);
  } else {
    results.push({ testId, name, passed: false, details, error: 'Assertion failed' });
    console.error(`❌ [FAIL] ${testId}: ${name} ${details ? `(${details})` : ''}`);
  }
}

async function runTestSuite() {
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log('AGENT ↔ NICHE CONFIGURATION SYNC: COMPREHENSIVE VERIFICATION SUITE');
  console.log('═══════════════════════════════════════════════════════════════════════\n');

  // =========================================================================
  // TEST 1: Healthcare (Dental Clinic)
  // =========================================================================
  const dentalBp = getDefaultBlueprint('hospital');
  const dentalCtx = resolveAgentExecutionContext({
    blueprint: dentalBp,
    agentId: 'front_desk',
    agentName: 'Front Desk Assistant',
    agentRole: 'Reception & Appointment Coordinator',
  });

  assert(
    dentalCtx.industry === 'HEALTHCARE',
    'T1.1',
    'Healthcare Industry Resolution',
    `Industry is ${dentalCtx.industry}`
  );
  assert(
    dentalCtx.terminology.customer.displayTerm.toLowerCase().includes('patient'),
    'T1.2',
    'Healthcare Terminology (Customer -> Patient)',
    `Display Term: "${dentalCtx.terminology.customer.displayTerm}"`
  );
  assert(
    dentalCtx.availableTools.some((t: ResolvedAgentTool) => t.name === 'book_calendar'),
    'T1.3',
    'Appointment Booking Tool Available in Healthcare',
    'Found book_calendar tool'
  );
  assert(
    dentalCtx.businessRules.some((r: ActiveBusinessRule) => r.id === 'rule_hc_provider_avail' && r.authoritative),
    'T1.4',
    'Authoritative Provider Availability Rule Present',
    'Provider licensure constraint active'
  );

  // =========================================================================
  // TEST 2: Real Estate (Brokerage)
  // =========================================================================
  const reBp = getDefaultBlueprint('realestate');
  const reCtx = resolveAgentExecutionContext({
    blueprint: reBp,
    agentId: 'ares',
    agentName: 'Ares Real Estate Agent',
  });

  assert(
    reCtx.industry === 'REAL_ESTATE',
    'T2.1',
    'Real Estate Industry Resolution',
    `Industry is ${reCtx.industry}`
  );
  assert(
    reCtx.terminology.customer.displayTerm.toLowerCase().includes('client') ||
    reCtx.terminology.customer.displayTerm.toLowerCase().includes('buyer'),
    'T2.2',
    'Real Estate Terminology Active',
    `Display Term: "${reCtx.terminology.customer.displayTerm}"`
  );
  assert(
    reCtx.businessRules.some((r: ActiveBusinessRule) => r.id === 'rule_re_viewing_escort'),
    'T2.3',
    'Licensed Agent Showing Requirement Active',
    'Real estate showing rule enforced'
  );

  // =========================================================================
  // TEST 3: Hospitality / Restaurant (Cafe)
  // =========================================================================
  const restBp = getDefaultBlueprint('restaurant');
  const restCtx = resolveAgentExecutionContext({
    blueprint: restBp,
    agentId: 'front_desk',
    agentName: 'Front Desk Host',
  });

  assert(
    restCtx.industry === 'HOSPITALITY',
    'T3.1',
    'Hospitality Industry Resolution',
    `Industry is ${restCtx.industry}`
  );
  assert(
    restCtx.terminology.customer.displayTerm.toLowerCase().includes('guest') ||
    restCtx.terminology.customer.plural.toLowerCase().includes('guests'),
    'T3.2',
    'Hospitality Terminology (Customer -> Guest)',
    `Display Term: "${restCtx.terminology.customer.displayTerm}"`
  );
  assert(
    restCtx.businessRules.some((r: ActiveBusinessRule) => r.id === 'rule_hosp_table_capacity'),
    'T3.3',
    'Dining Floor Capacity Constraint Active',
    'Kitchen and table capacity rule enforced'
  );

  // =========================================================================
  // TEST 4: Retail (Supermarket / POS)
  // =========================================================================
  const retBp = getDefaultBlueprint('retail');
  const retCtx = resolveAgentExecutionContext({
    blueprint: retBp,
    agentId: 'sales',
    agentName: 'Retail Assistant',
  });

  assert(
    retCtx.industry === 'RETAIL',
    'T4.1',
    'Retail Industry Resolution',
    `Industry is ${retCtx.industry}`
  );
  assert(
    retCtx.availableTools.some((t: ResolvedAgentTool) => t.name === 'search_inventory_stock'),
    'T4.2',
    'Inventory Stock Tool Available in Retail',
    'Product and stock search exposed'
  );

  // =========================================================================
  // TEST 5: Custom Workspace (Construction with Equipment Custom Record)
  // =========================================================================
  const constrBp = createBlueprintFromProfile({
    businessName: 'Apex Construction Builders',
    industry: 'CONSTRUCTION',
    businessTypeId: 'construction_contractor',
    companySize: 'MID_51_200',
    locationsCount: 3,
    employeesCount: 65,
    customerBaseType: 'B2B',
    productsOrServices: 'Commercial Infrastructure',
    salesModel: 'DIRECT',
    billingModel: 'MILESTONE_RETAINER',
    operatingHours: '07:00 - 17:00',
    currency: 'USD ($)',
    taxConfiguration: 'Standard',
    businessRegion: 'Midwest USA',
    departments: ['Field Operations', 'Equipment Logistics', 'Project Estimating'],
  }, 'construction_contractor');

  // Add custom record "Equipment" to the blueprint
  constrBp.recordTypes.push({
    id: 'rec_equipment',
    name: 'Heavy Equipment & Machinery',
    singular: 'Equipment',
    plural: 'Equipment',
    category: 'OPERATIONS',
    route: '/equipment',
    iconName: 'Truck',
    description: 'Track excavators, cranes, generators, and site assignments.',
    isCustom: true,
    fields: [
      { id: 'f1', name: 'Serial Number', label: 'Serial Number', key: 'serialNumber', type: 'TEXT', required: true, searchable: true, filterable: true, reportable: true, visibility: 'ALWAYS' },
      { id: 'f2', name: 'Equipment Type', label: 'Type', key: 'equipmentType', type: 'DROPDOWN', required: true, searchable: true, filterable: true, reportable: true, visibility: 'ALWAYS' },
      { id: 'f3', name: 'Site Location', label: 'Location', key: 'siteLocation', type: 'TEXT', required: true, searchable: true, filterable: true, reportable: true, visibility: 'ALWAYS' },
      { id: 'f4', name: 'Operational Status', label: 'Status', key: 'status', type: 'STATUS', required: true, searchable: true, filterable: true, reportable: true, visibility: 'ALWAYS' },
    ],
    statuses: [
      { id: 'st1', name: 'DEPLOYED', label: 'Deployed to Site', color: '#10b981', order: 1 },
      { id: 'st2', name: 'MAINTENANCE', label: 'Under Repair', color: '#f59e0b', order: 2 },
    ],
    relationships: [],
    views: ['TABLE', 'KANBAN'],
  });

  const constrCtx = resolveAgentExecutionContext({
    blueprint: constrBp,
    agentId: 'ops',
    agentName: 'Operations Agent',
  });

  assert(
    constrCtx.recordTypes.some((r: ConfiguredRecordType) => r.name.includes('Equipment') && r.isCustom),
    'T5.1',
    'Custom Record Type "Equipment" Recognized',
    'Operations agent recognizes custom fields: serialNumber, equipmentType, siteLocation'
  );
  assert(
    constrCtx.availableTools.some((t: ResolvedAgentTool) => t.name === 'create_crm_task'),
    'T5.2',
    'Operations Task Tool Available for Field Work',
    'Found create_crm_task'
  );

  // =========================================================================
  // TEST 6: Service Disablement Test (Section 55)
  // =========================================================================
  // Clone healthcare blueprint and DISABLE billing (srv_invoicing_ledger)
  const modifiedDentalBp = JSON.parse(JSON.stringify(dentalBp));
  modifiedDentalBp.activeServiceIds = modifiedDentalBp.activeServiceIds.filter(
    (id: string) => id !== 'srv_invoices_billing' && id !== 'srv_invoicing_ledger'
  );
  const disabledBillingCtx = resolveAgentExecutionContext({
    blueprint: modifiedDentalBp,
    agentId: 'midas',
  });

  const invoiceToolAvailable = disabledBillingCtx.availableTools.some(
    (t: ResolvedAgentTool) => t.name === 'create_payment_link' || t.name === 'get_overdue_invoices'
  );
  const invoiceToolBlocked = disabledBillingCtx.blockedTools.some(
    (b: BlockedAgentTool) => b.name === 'create_payment_link'
  );
  const blockedReason = disabledBillingCtx.blockedTools.find(
    (b: BlockedAgentTool) => b.name === 'create_payment_link'
  )?.reason;

  assert(
    !invoiceToolAvailable && invoiceToolBlocked,
    'T6.1',
    'Disabling Billing Immediately Removes Invoice Tools',
    'create_payment_link removed from available and moved to blockedTools'
  );
  assert(
    blockedReason?.includes('not enabled for this workspace') === true,
    'T6.2',
    'Blocked Tool Has Exact Honest Reason',
    `Reason: "${blockedReason}"`
  );

  // =========================================================================
  // TEST 7: RBAC / ABAC Permission Gating (Section 56)
  // =========================================================================
  const userNoFinanceCtx = resolveAgentExecutionContext({
    blueprint: dentalBp,
    userId: 'usr_receptionist',
    userRole: 'RECEPTIONIST',
    userPermissions: { canAccessFinancials: false },
  });

  const userWithFinanceCtx = resolveAgentExecutionContext({
    blueprint: dentalBp,
    userId: 'usr_billing_officer',
    userRole: 'FINANCE_MANAGER',
    userPermissions: { canAccessFinancials: true },
  });

  const noFinanceCanAccess = userNoFinanceCtx.availableTools.some(
    (t: ResolvedAgentTool) => t.name === 'create_payment_link'
  );
  const withFinanceCanAccess = userWithFinanceCtx.availableTools.some(
    (t: ResolvedAgentTool) => t.name === 'create_payment_link'
  );

  assert(
    !noFinanceCanAccess && withFinanceCanAccess,
    'T7.1',
    'Permission Gating on Financial Actions',
    'User without canAccessFinancials blocked; User with permission allowed'
  );

  // =========================================================================
  // TEST 8: High-Risk Action & Human Approval Requirements (Section 10)
  // =========================================================================
  const refundTool = dentalCtx.availableTools.find((t: ResolvedAgentTool) => t.name === 'process_refund');
  assert(
    refundTool !== undefined && refundTool.requiresApproval && refundTool.status === 'REQUIRES_APPROVAL',
    'T8.1',
    'Process Refund Strictly Requires Approval',
    `requiresApproval: ${refundTool?.requiresApproval}, status: ${refundTool?.status}`
  );

  const manifest = generateAgentCapabilityManifest(dentalCtx);
  assert(
    manifest.approvalRules.some((r: { action: string; reason: string; requiredRole?: string }) => r.action === 'process_refund'),
    'T8.2',
    'Capability Manifest Records Approval Rules',
    `Manifest approval rules count: ${manifest.approvalRules.length}`
  );

  // =========================================================================
  // TEST 9: Configuration Impact Analysis (Section 63 & 64)
  // =========================================================================
  const impact = analyzeConfigurationImpact(dentalBp, ['srv_contacts', 'srv_calendar_meetings']);
  assert(
    impact.affectedAgents.length > 0,
    'T9.1',
    'Impact Analysis Flags Affected Agents',
    `Affected agents: ${impact.affectedAgents.map((a: { agentId: string; agentName: string; reason?: string }) => a.agentName).join(', ')}`
  );
  assert(
    impact.affectedTools.includes('book_calendar') && impact.affectedTools.includes('search_crm_contacts'),
    'T9.2',
    'Impact Analysis Flags Disabled Tool Capabilities',
    `Disabled tools count: ${impact.affectedTools.length}`
  );

  // =========================================================================
  // TEST 10: Agent Prompt Synthesis & Anti-Hallucination Directives
  // =========================================================================
  const prompt = formatContextPromptForAgent(dentalCtx, { type: 'Patient', id: 'PT-101', data: { name: 'Sarah Lin' } });
  assert(
    prompt.includes('ACTIVE WORKSPACE TERMINOLOGY') && prompt.includes('Patient'),
    'T10.1',
    'Agent Prompt Synthesizes Active Terminology',
    'Contains Patient terminology instruction'
  );
  assert(
    prompt.includes('CRITICAL SERVICE REFUSAL RULE') && prompt.includes('is not enabled for this workspace'),
    'T10.2',
    'Agent Prompt Enforces Honest Refusal Directives',
    'Mandatory anti-hallucination guard present in prompt'
  );

  console.log('\n═══════════════════════════════════════════════════════════════════════');
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`TEST RUN COMPLETE: ${passedCount} / ${results.length} PASSED (100% Target)`);
  console.log('═══════════════════════════════════════════════════════════════════════\n');

  if (passedCount === results.length) {
    console.log('🎉 ALL AGENT ↔ NICHE CONFIGURATION SYNC TESTS PASSED SUCCESSFULLY!');
  } else {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal Test Suite Error:', err);
  process.exit(1);
});
