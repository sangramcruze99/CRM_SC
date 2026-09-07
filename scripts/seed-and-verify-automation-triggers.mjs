#!/usr/bin/env node
/**
 * ==============================================================================
 * SYNTHETIC TEST DATASET SEEDER & AUTOMATION TRIGGER VERIFICATION SUITE
 * ==============================================================================
 * Validates real database schema entities, relationships, foreign keys,
 * 10 intended AI agent trigger scenarios, and realistic edge cases.
 */

import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PrismaClient } from '../packages/database/dist/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const prisma = new PrismaClient();
const EVAL_TENANT_ID = 'tenant_synthetic_eval';

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

let totalTests = 0;
let passedTests = 0;

function report(testName, passed, detail) {
  totalTests++;
  if (passed) {
    passedTests++;
    console.log(`  ${c.green}✓ PASS${c.reset}  ${c.bold}${testName}${c.reset} ${c.dim}(${detail})${c.reset}`);
  } else {
    console.log(`  ${c.red}✗ FAIL${c.reset}  ${c.bold}${testName}${c.reset} ${c.red}Error: ${detail}${c.reset}`);
  }
}

async function main() {
  console.log(`\n${c.bold}${c.cyan}========================================================================================${c.reset}`);
  console.log(`${c.bold}🚀 SYNTHETIC TEST DATASET & AUTOMATION TRIGGER VERIFICATION SUITE${c.reset}`);
  console.log(`${c.dim}Tenant: ${EVAL_TENANT_ID} | Database: packages/database/prisma/dev.db${c.reset}`);
  console.log(`${c.bold}${c.cyan}========================================================================================${c.reset}\n`);

  try {
    // --------------------------------------------------------------------------
    // STEP 1: Execute SQL Seeding Script
    // --------------------------------------------------------------------------
    console.log(`${c.bold}${c.magenta}--- STEP 1: Seeding Synthetic Dataset into SQLite ---${c.reset}`);
    const sqlPath = join(rootDir, 'synthetic_test_dataset.sql');
    const pythonCmd = `python -c "import sqlite3; conn = sqlite3.connect('packages/database/prisma/dev.db'); f = open(r'${sqlPath}', 'r', encoding='utf-8'); conn.executescript(f.read()); conn.commit(); conn.close()"`;
    
    execSync(pythonCmd, { cwd: rootDir, stdio: 'pipe' });
    report('Seed Execution (synthetic_test_dataset.sql)', true, 'All SQL DML statements executed with commit');

    // --------------------------------------------------------------------------
    // STEP 2: Database Schema & Foreign Key Integrity
    // --------------------------------------------------------------------------
    console.log(`\n${c.bold}${c.magenta}--- STEP 2: Verifying Foreign Key Integrity & Table Counts ---${c.reset}`);
    
    const fkCheckCmd = `python -c "import sqlite3; conn = sqlite3.connect('packages/database/prisma/dev.db'); cursor = conn.cursor(); cursor.execute('PRAGMA foreign_key_check;'); v = cursor.fetchall(); print(len(v)); conn.close()"`;
    const fkViolations = parseInt(execSync(fkCheckCmd, { cwd: rootDir, encoding: 'utf-8' }).trim(), 10);
    report('PRAGMA foreign_key_check', fkViolations === 0, `${fkViolations} violations found`);

    const tenantCount = await prisma.tenant.count({ where: { id: EVAL_TENANT_ID } });
    report('Tenant Table Entity', tenantCount === 1, `Found ${tenantCount} tenant record`);

    const userCount = await prisma.user.count({ where: { tenantId: EVAL_TENANT_ID } });
    report('User Table Entities', userCount === 4, `Found ${userCount} users (Admin, SDR, AE, Support)`);

    const companyCount = await prisma.company.count({ where: { tenantId: EVAL_TENANT_ID } });
    report('Company Table Entities', companyCount === 6, `Found ${companyCount} companies`);

    const contactCount = await prisma.contact.count({ where: { tenantId: EVAL_TENANT_ID } });
    report('Contact Table Entities', contactCount === 10, `Found ${contactCount} contacts (including edge cases)`);

    const dealCount = await prisma.deal.count({ where: { tenantId: EVAL_TENANT_ID } });
    report('Deal Table Entities', dealCount === 5, `Found ${dealCount} deals across stages`);

    const invoiceCount = await prisma.invoice.count({ where: { tenantId: EVAL_TENANT_ID } });
    const lineItemCount = await prisma.invoiceLineItem.count({
      where: { invoice: { tenantId: EVAL_TENANT_ID } },
    });
    report('Invoice & Line Items', invoiceCount === 5 && lineItemCount === 5, `Found ${invoiceCount} invoices with ${lineItemCount} line items`);

    const ticketCount = await prisma.ticket.count({ where: { tenantId: EVAL_TENANT_ID } });
    const messageCount = await prisma.ticketMessage.count({
      where: { ticket: { tenantId: EVAL_TENANT_ID } },
    });
    report('Ticket & Message Entities', ticketCount === 4 && messageCount === 3, `Found ${ticketCount} tickets and ${messageCount} messages`);

    const agentCount = await prisma.agent.count({ where: { tenantId: EVAL_TENANT_ID } });
    report('AI Agents Registry', agentCount === 10, `Found ${agentCount} central AI agents registered`);

    const toolExecCount = await prisma.toolExecution.count({ where: { tenantId: EVAL_TENANT_ID } });
    report('Tool Execution Telemetry', toolExecCount === 3, `Found ${toolExecCount} tool execution records`);

    const workflowCount = await prisma.workflow.count({ where: { tenantId: EVAL_TENANT_ID } });
    const wfExecCount = await prisma.workflowExecution.count({ where: { tenantId: EVAL_TENANT_ID } });
    report('Workflows & Executions', workflowCount === 2 && wfExecCount === 2, `Found ${workflowCount} workflows and ${wfExecCount} execution runs`);

    const approvalCount = await prisma.approvalRequest.count({ where: { tenantId: EVAL_TENANT_ID } });
    report('Approval Requests (HITL)', approvalCount === 1, `Found ${approvalCount} pending approval request`);

    const auditCount = await prisma.auditLog.count({ where: { tenantId: EVAL_TENANT_ID } });
    report('Audit Log Entries', auditCount === 5, `Found ${auditCount} audit trail entries`);

    // --------------------------------------------------------------------------
    // STEP 3: Validate 10 Intended Automation Trigger Scenarios
    // --------------------------------------------------------------------------
    console.log(`\n${c.bold}${c.magenta}--- STEP 3: Validating 10 Automation Trigger Scenarios ---${c.reset}`);

    // Scenario 1: Deal inactive 8+ days -> Ares
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
    const stalledDeals = await prisma.deal.findMany({
      where: {
        tenantId: EVAL_TENANT_ID,
        stage: { notIn: ['Won', 'Lost'] },
        updatedAt: { lte: eightDaysAgo },
      },
      include: { company: true },
    });
    const aresMatch = stalledDeals.find((d) => d.id === 'deal_ares_stalled');
    report(
      'Scenario 1: Deal Inactive 8+ Days (Ares Trigger)',
      Boolean(aresMatch && aresMatch.amount === 85000),
      `Matched deal "${aresMatch?.title}" ($${aresMatch?.amount}) inactive >= 8 days`
    );

    // Scenario 2: High-risk customer / declining health -> Athena
    const apexCompany = await prisma.company.findUnique({
      where: { id: 'cmp_apex_global' },
    });
    const apexTickets = await prisma.ticket.findMany({
      where: {
        tenantId: EVAL_TENANT_ID,
        status: 'OPEN',
        priority: 'URGENT',
      },
    });
    const apexOverdueInvoices = await prisma.invoice.findMany({
      where: {
        tenantId: EVAL_TENANT_ID,
        status: 'OVERDUE',
      },
    });
    const apexCustomData = JSON.parse(apexCompany?.customData || '{}');
    const isAtRisk = apexTickets.length >= 2 && apexOverdueInvoices.length >= 1 && apexCustomData.healthScore < 50;
    report(
      'Scenario 2: High-Risk Customer / Declining Health (Athena Trigger)',
      isAtRisk,
      `Company ${apexCompany?.name} healthScore=${apexCustomData.healthScore} with ${apexTickets.length} urgent tickets and overdue invoices`
    );

    // Scenario 3: Invoice 30+ days overdue -> Midas
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const overdue30Invoices = await prisma.invoice.findMany({
      where: {
        tenantId: EVAL_TENANT_ID,
        status: 'OVERDUE',
        dueDate: { lte: thirtyDaysAgo },
      },
      include: { lineItems: true },
    });
    const midasMatch = overdue30Invoices.find((i) => i.id === 'inv_midas_overdue');
    report(
      'Scenario 3: Invoice 30+ Days Overdue (Midas Trigger)',
      Boolean(midasMatch && midasMatch.amount === 14500 && midasMatch.lineItems.length === 2),
      `Matched ${midasMatch?.invoiceNum} ($${midasMatch?.amount}) overdue > 30 days with ${midasMatch?.lineItems.length} line items`
    );

    // Scenario 4: Newly closed deal -> Hermes
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const newlyWonDeals = await prisma.deal.findMany({
      where: {
        tenantId: EVAL_TENANT_ID,
        stage: 'Won',
        updatedAt: { gte: oneDayAgo },
      },
      include: { company: true },
    });
    const hermesDeal = newlyWonDeals.find((d) => d.id === 'deal_hermes_won');
    const onboardingProject = await prisma.project.findUnique({
      where: { id: 'prj_stark_onboarding' },
      include: { tasks: true },
    });
    report(
      'Scenario 4: Newly Closed Deal (Hermes Trigger)',
      Boolean(hermesDeal && onboardingProject && onboardingProject.tasks.length === 2),
      `Matched deal "${hermesDeal?.title}" ($${hermesDeal?.amount}) with linked onboarding project & ${onboardingProject?.tasks.length} tasks`
    );

    // Scenario 5: New qualified lead -> Lead Qualification Agent
    const inboundLead = await prisma.contact.findUnique({
      where: { id: 'cnt_david_miller' },
    });
    const leadData = JSON.parse(inboundLead?.customData || '{}');
    const isQualifiedICP =
      leadData.source === 'website' &&
      leadData.budget >= 100000 &&
      leadData.employees >= 200 &&
      leadData.jobTitle.includes('VP');
    report(
      'Scenario 5: New Qualified Lead (Lead Qualification Trigger)',
      isQualifiedICP,
      `Candidate "${inboundLead?.firstName} ${inboundLead?.lastName}" (${leadData.jobTitle}), budget: $${leadData.budget}, employees: ${leadData.employees} (ICP Tier 1)`
    );

    // Scenario 6: Multiple high-priority tickets -> Support Agent
    const highPriorityTickets = await prisma.ticket.findMany({
      where: {
        tenantId: EVAL_TENANT_ID,
        status: 'OPEN',
        priority: { in: ['URGENT', 'HIGH'] },
      },
    });
    report(
      'Scenario 6: Multiple High-Priority Tickets (Support Agent Trigger)',
      highPriorityTickets.length >= 3,
      `Found ${highPriorityTickets.length} open high/urgent tickets requiring immediate L1/L2 triage`
    );

    // Scenario 7: New resume submission -> Recruitment Agent
    const candidateRecord = await prisma.customRecord.findUnique({
      where: { id: 'crec_candidate_elena' },
    });
    const resumeDoc = await prisma.document.findUnique({
      where: { id: 'doc_resume_candidate' },
    });
    const candData = JSON.parse(candidateRecord?.data || '{}');
    const isRecruitmentTriggered =
      candData.stage === 'APPLIED' &&
      candData.hasResume === true &&
      resumeDoc?.mimeType === 'application/pdf';
    report(
      'Scenario 7: New Resume Submission (Recruitment Agent Trigger)',
      isRecruitmentTriggered,
      `Applicant "${candData.candidate_name}" (${candData.target_role}) with validated PDF resume attachment`
    );

    // Scenario 8: $1,000+ purchase -> E-Commerce Agent
    const vipPurchases = await prisma.invoice.findMany({
      where: {
        tenantId: EVAL_TENANT_ID,
        status: 'PAID',
        amount: { gte: 1000.0 },
      },
    });
    const ecomMatch = vipPurchases.find((i) => i.id === 'inv_ecom_vip_purchase');
    report(
      'Scenario 8: $1,000+ Purchase (E-Commerce Agent Trigger)',
      Boolean(ecomMatch && ecomMatch.amount >= 1000.0),
      `Matched order ${ecomMatch?.invoiceNum} ($${ecomMatch?.amount}) >= $1,000 threshold for VIP tagging`
    );

    // Scenario 9: Content needing repurposing -> Content Agent
    const draftLandingPage = await prisma.landingPage.findUnique({
      where: { id: 'lp_q3_release_notes' },
      include: { blocks: true },
    });
    const kbDoc = await prisma.knowledgeBaseDocument.findUnique({
      where: { id: 'kb_doc_q3_whitepaper' },
    });
    const hasLongFormContent =
      draftLandingPage?.published === false &&
      draftLandingPage.blocks.length >= 2 &&
      Boolean(kbDoc?.content.length > 50);
    report(
      'Scenario 9: Content Needing Repurposing (Content Agent Trigger)',
      hasLongFormContent,
      `Draft landing page "${draftLandingPage?.title}" (${draftLandingPage?.blocks.length} blocks) and technical whitepaper ready for social repurposing`
    );

    // Scenario 10: Property transaction approaching deadline -> Vesta
    const escrowRecord = await prisma.customRecord.findUnique({
      where: { id: 'crec_escrow_vesta' },
    });
    const escrowData = JSON.parse(escrowRecord?.data || '{}');
    const isClosingSoon =
      escrowData.status === 'CLOSING' &&
      escrowData.daysUntilClosing <= 3 &&
      escrowData.escrowOpened === true;
    report(
      'Scenario 10: Escrow Closing Within Deadline (Vesta Agent Trigger)',
      isClosingSoon,
      `Property "${escrowData.property_address}" ($${escrowData.contractPrice}) closing in ${escrowData.daysUntilClosing} days with pending contingencies`
    );

    // --------------------------------------------------------------------------
    // STEP 4: Realistic Edge Cases Verification
    // --------------------------------------------------------------------------
    console.log(`\n${c.bold}${c.magenta}--- STEP 4: Validating Realistic Edge Cases ---${c.reset}`);

    // Edge Case 1: Duplicates
    const duplicateContacts = await prisma.contact.findMany({
      where: {
        tenantId: EVAL_TENANT_ID,
        email: 'lead.duplicate@target.example',
      },
    });
    report(
      'Edge Case 1: Duplicate Lead Submissions',
      duplicateContacts.length === 2,
      `Detected ${duplicateContacts.length} duplicate contact records sharing email lead.duplicate@target.example`
    );

    // Edge Case 2: Missing Fields Tolerance
    const missingContact = await prisma.contact.findUnique({
      where: { id: 'cnt_missing_fields' },
    });
    const missingCompany = await prisma.company.findUnique({
      where: { id: 'cmp_missing_data' },
    });
    const missingDeal = await prisma.deal.findUnique({
      where: { id: 'deal_missing_date' },
    });
    const missingFieldsHandled =
      missingContact?.email === null &&
      missingCompany?.domain === null &&
      missingDeal?.amount === 0;
    report(
      'Edge Case 2: Missing Fields & Null Value Tolerance',
      missingFieldsHandled,
      `Successfully loaded contacts and deals with null emails, domains, and $0 amounts without schema errors`
    );

    // Edge Case 3: Stale Records
    const staleDeal = await prisma.deal.findUnique({
      where: { id: 'deal_stale_abandoned' },
    });
    const staleTicket = await prisma.ticket.findUnique({
      where: { id: 'tck_stale_closed' },
    });
    const isStaleHandled =
      staleDeal?.stage === 'Discovery' &&
      staleTicket?.status === 'CLOSED';
    report(
      'Edge Case 3: Stale & Abandoned Records (> 90 Days)',
      isStaleHandled,
      `Correctly cataloged abandoned discovery deal and 120-day-old closed ticket`
    );

    // Edge Case 4: Failed Execution States
    const failedToolExec = await prisma.toolExecution.findUnique({
      where: { id: 'texec_erp_timeout' },
    });
    const failedWfExec = await prisma.workflowExecution.findUnique({
      where: { id: 'wfexec_failed_retry' },
    });
    const failedStatesHandled =
      failedToolExec?.status === 'FAILED' &&
      failedToolExec.error?.includes('timeout') &&
      failedWfExec?.status === 'FAILED';
    report(
      'Edge Case 4: Failed Execution States & Error Logs',
      Boolean(failedStatesHandled),
      `Captured ERP timeout (${failedToolExec?.durationMs}ms) and HTTP 429 webhook workflow failure for retry pipeline`
    );

    // Edge Case 5: Conflicting Data
    const conflictingDeal = await prisma.deal.findUnique({
      where: { id: 'deal_conflict_won_unpaid' },
    });
    const disputedInvoice = await prisma.invoice.findUnique({
      where: { id: 'inv_conflict_disputed' },
    });
    const hasConflict =
      conflictingDeal?.stage === 'Won' &&
      disputedInvoice?.status === 'DISPUTED';
    report(
      'Edge Case 5: Conflicting Data (Deal Won vs Disputed Invoice)',
      hasConflict,
      `Identified accounting mismatch between Won deal ($${conflictingDeal?.amount}) and disputed invoice ($${disputedInvoice?.amount})`
    );

    // Edge Case 6: High-Value Customer & Human-In-The-Loop Gate
    const approval = await prisma.approvalRequest.findUnique({
      where: { id: 'appr_ares_discount' },
      include: { agent: true },
    });
    const isHitlActive =
      approval?.status === 'PENDING' &&
      approval?.riskLevel === 'HIGH' &&
      approval?.agent?.name?.includes('Ares');
    report(
      'Edge Case 6: High-Value Customer & Human-In-The-Loop Gate',
      Boolean(isHitlActive),
      `Pending HIGH risk concession request ($17,000) for Hyperion expansion gated by HITL safety policy`
    );

    // --------------------------------------------------------------------------
    // SUMMARY
    // --------------------------------------------------------------------------
    console.log(`\n${c.bold}${c.cyan}========================================================================================${c.reset}`);
    const passRate = Math.round((passedTests / totalTests) * 100);
    const summaryColor = passedTests === totalTests ? c.green : c.red;
    console.log(`${c.bold}📊 TEST SUITE SUMMARY: ${summaryColor}${passedTests}/${totalTests} TESTS PASSED (${passRate}%)${c.reset}`);
    console.log(`${c.bold}${c.cyan}========================================================================================${c.reset}\n`);

    if (passedTests !== totalTests) {
      process.exit(1);
    }
  } catch (err) {
    console.error(`\n${c.red}${c.bold}Fatal Test Suite Error:${c.reset}`, err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
