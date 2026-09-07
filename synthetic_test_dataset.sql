-- ==============================================================================
-- SYNTHETIC TEST DATASET & AUTOMATION TRIGGER RECORDS
-- Target Tenant: tenant_synthetic_eval
-- Matches Canonical Prisma DDL Schema (schema.sql)
-- ==============================================================================

BEGIN TRANSACTION;

-- Clean existing evaluation tenant records if present for idempotency
DELETE FROM "AuditLog" WHERE "tenantId" = 'tenant_synthetic_eval';
DELETE FROM "ApprovalRequest" WHERE "tenantId" = 'tenant_synthetic_eval';
DELETE FROM "ToolExecution" WHERE "tenantId" = 'tenant_synthetic_eval';
DELETE FROM "Agent" WHERE "tenantId" = 'tenant_synthetic_eval';
DELETE FROM "WorkflowExecution" WHERE "tenantId" = 'tenant_synthetic_eval';
DELETE FROM "Workflow" WHERE "tenantId" = 'tenant_synthetic_eval';
DELETE FROM "PageBlock" WHERE "landingPageId" IN (SELECT "id" FROM "LandingPage" WHERE "tenantId" = 'tenant_synthetic_eval');
DELETE FROM "LandingPage" WHERE "tenantId" = 'tenant_synthetic_eval';
DELETE FROM "KnowledgeBaseDocument" WHERE "tenantId" = 'tenant_synthetic_eval';
DELETE FROM "CustomRecord" WHERE "tenantId" = 'tenant_synthetic_eval';
DELETE FROM "CustomField" WHERE "customObjectId" IN (SELECT "id" FROM "CustomObject" WHERE "tenantId" = 'tenant_synthetic_eval');
DELETE FROM "CustomObject" WHERE "tenantId" = 'tenant_synthetic_eval';
DELETE FROM "Document" WHERE "tenantId" = 'tenant_synthetic_eval';
DELETE FROM "Task" WHERE "projectId" IN (SELECT "id" FROM "Project" WHERE "tenantId" = 'tenant_synthetic_eval');
DELETE FROM "Project" WHERE "tenantId" = 'tenant_synthetic_eval';
DELETE FROM "TicketMessage" WHERE "ticketId" IN (SELECT "id" FROM "Ticket" WHERE "tenantId" = 'tenant_synthetic_eval');
DELETE FROM "Ticket" WHERE "tenantId" = 'tenant_synthetic_eval';
DELETE FROM "InvoiceLineItem" WHERE "invoiceId" IN (SELECT "id" FROM "Invoice" WHERE "tenantId" = 'tenant_synthetic_eval');
DELETE FROM "Invoice" WHERE "tenantId" = 'tenant_synthetic_eval';
DELETE FROM "Activity" WHERE "tenantId" = 'tenant_synthetic_eval';
DELETE FROM "Deal" WHERE "tenantId" = 'tenant_synthetic_eval';
DELETE FROM "Contact" WHERE "tenantId" = 'tenant_synthetic_eval';
DELETE FROM "Company" WHERE "tenantId" = 'tenant_synthetic_eval';
DELETE FROM "User" WHERE "tenantId" = 'tenant_synthetic_eval';
DELETE FROM "Tenant" WHERE "id" = 'tenant_synthetic_eval';

-- ------------------------------------------------------------------------------
-- 1. Dedicated Evaluation Tenant & Users
-- ------------------------------------------------------------------------------
INSERT INTO "Tenant" ("id", "name", "domain", "createdAt", "updatedAt")
VALUES ('tenant_synthetic_eval', 'Synthetic Automation Evaluation Org', 'eval.businessos.test', (strftime('%s', 'now', '-60 days') * 1000), (strftime('%s', 'now') * 1000));

INSERT INTO "User" ("id", "tenantId", "email", "passwordHash", "name", "role", "createdAt", "updatedAt")
VALUES 
  ('usr_eval_admin', 'tenant_synthetic_eval', 'eval.admin@businessos.test', '$2a$10$w09Z5Xm0z9l9Gf3J5.91iOyYlF2jXQv2i7O2W8b9jV8mN5o1P8Kte', 'Evaluation Lead Administrator', 'ADMIN', (strftime('%s', 'now', '-60 days') * 1000), (strftime('%s', 'now') * 1000)),
  ('usr_eval_sdr', 'tenant_synthetic_eval', 'sdr.lead@businessos.test', '$2a$10$w09Z5Xm0z9l9Gf3J5.91iOyYlF2jXQv2i7O2W8b9jV8mN5o1P8Kte', 'SDR Sentinel Representative', 'USER', (strftime('%s', 'now', '-50 days') * 1000), (strftime('%s', 'now') * 1000)),
  ('usr_eval_ae', 'tenant_synthetic_eval', 'ae.closer@businessos.test', '$2a$10$w09Z5Xm0z9l9Gf3J5.91iOyYlF2jXQv2i7O2W8b9jV8mN5o1P8Kte', 'Enterprise Account Executive', 'USER', (strftime('%s', 'now', '-50 days') * 1000), (strftime('%s', 'now') * 1000)),
  ('usr_eval_support', 'tenant_synthetic_eval', 'support.lead@businessos.test', '$2a$10$w09Z5Xm0z9l9Gf3J5.91iOyYlF2jXQv2i7O2W8b9jV8mN5o1P8Kte', 'Tier-1 Support Lead', 'USER', (strftime('%s', 'now', '-50 days') * 1000), (strftime('%s', 'now') * 1000));

-- ------------------------------------------------------------------------------
-- 2. Companies
-- ------------------------------------------------------------------------------
INSERT INTO "Company" ("id", "tenantId", "name", "domain", "industry", "customData", "createdAt", "updatedAt")
VALUES
  ('cmp_hyperion', 'tenant_synthetic_eval', 'Hyperion Dynamics', 'hyperiondynamics.example', 'Enterprise Software', '{"tier":"ENTERPRISE","employees":450,"arr":85000}', (strftime('%s', 'now', '-45 days') * 1000), (strftime('%s', 'now') * 1000)),
  ('cmp_apex_global', 'tenant_synthetic_eval', 'Apex Global Enterprises', 'apexglobal.example', 'FinTech & Banking', '{"tier":"STRATEGIC","healthScore":42,"riskTier":"CRITICAL"}', (strftime('%s', 'now', '-60 days') * 1000), (strftime('%s', 'now') * 1000)),
  ('cmp_stark_cloud', 'tenant_synthetic_eval', 'Stark Cloud Core Inc.', 'starkcloud.example', 'Cloud Infrastructure', '{"tier":"ENTERPRISE_VIP","acv":120000}', (strftime('%s', 'now', '-20 days') * 1000), (strftime('%s', 'now') * 1000)),
  ('cmp_cyberdyne_retail', 'tenant_synthetic_eval', 'CyberDyne Commerce', 'cyberdynecommerce.example', 'E-Commerce Retail', '{"tier":"COMMERCE","ltv":4200}', (strftime('%s', 'now', '-30 days') * 1000), (strftime('%s', 'now') * 1000)),
  ('cmp_vance_logistics', 'tenant_synthetic_eval', 'Vance Logistics Group', 'vancelogistics.example', 'Logistics & Supply Chain', '{"tier":"MIDMARKET","paymentTerms":"NET_30"}', (strftime('%s', 'now', '-90 days') * 1000), (strftime('%s', 'now') * 1000)),
  ('cmp_missing_data', 'tenant_synthetic_eval', 'Stealth Startup Inc', NULL, NULL, '{}', (strftime('%s', 'now', '-10 days') * 1000), (strftime('%s', 'now') * 1000));

-- ------------------------------------------------------------------------------
-- 3. Contacts (Including Key Personas & Edge Cases)
-- ------------------------------------------------------------------------------
INSERT INTO "Contact" ("id", "tenantId", "firstName", "lastName", "email", "phone", "companyId", "customData", "createdAt", "updatedAt")
VALUES
  -- Scenario 1 Champion: Evelyn Reed
  ('cnt_evelyn_reed', 'tenant_synthetic_eval', 'Evelyn', 'Reed', 'evelyn.reed@hyperiondynamics.example', '+1-555-0144', 'cmp_hyperion', '{"title":"VP of Engineering","roleSeniority":"EXECUTIVE","buyerPersona":"DECISION_MAKER"}', (strftime('%s', 'now', '-40 days') * 1000), (strftime('%s', 'now') * 1000)),
  -- Scenario 2 Declining Champion: Marcus Vance
  ('cnt_marcus_vance', 'tenant_synthetic_eval', 'Marcus', 'Vance', 'marcus.vance@apexglobal.example', '+1-555-0188', 'cmp_apex_global', '{"title":"VP Operations","healthTier":"CRITICAL_CHURN"}', (strftime('%s', 'now', '-60 days') * 1000), (strftime('%s', 'now') * 1000)),
  -- Scenario 4 Won Deal Executive: Tony Stark
  ('cnt_tony_stark', 'tenant_synthetic_eval', 'Tony', 'Stark', 'tony@starkcloud.example', '+1-555-0199', 'cmp_stark_cloud', '{"title":"CTO","vip":true}', (strftime('%s', 'now', '-20 days') * 1000), (strftime('%s', 'now') * 1000)),
  -- Scenario 3 Overdue Debtor: Arthur Vance
  ('cnt_arthur_vance', 'tenant_synthetic_eval', 'Arthur', 'Vance', 'arthur@vancelogistics.example', '+1-555-0122', 'cmp_vance_logistics', '{"title":"Finance Director","dunningStage":"NOTICE_2"}', (strftime('%s', 'now', '-90 days') * 1000), (strftime('%s', 'now') * 1000)),
  -- Scenario 5 Qualified Inbound Lead: David Miller
  ('cnt_david_miller', 'tenant_synthetic_eval', 'David', 'Miller', 'david.miller@acmetech.example', '+1-555-0177', NULL, '{"source":"website","jobTitle":"VP of Engineering","companyName":"Acme Tech Solutions","employees":350,"revenueMillions":45,"budget":150000,"timelineMonths":3,"notes":"Evaluating CRM migration from legacy platform. Seeking enterprise SOC2."}', (strftime('%s', 'now', '-2 hours') * 1000), (strftime('%s', 'now') * 1000)),
  -- Scenario 8 E-Commerce Buyer: Alice Buyer
  ('cnt_alice_buyer', 'tenant_synthetic_eval', 'Alice', 'Buyer', 'alice@cyberdynecommerce.example', '+1-555-0155', 'cmp_cyberdyne_retail', '{"role":"Procurement Lead","loyaltyTier":"VIP"}', (strftime('%s', 'now', '-15 days') * 1000), (strftime('%s', 'now') * 1000)),
  -- Edge Case: Duplicate Leads
  ('cnt_dup_lead_1', 'tenant_synthetic_eval', 'Jane', 'Duplicate', 'lead.duplicate@target.example', '+1-555-0131', NULL, '{"source":"inbound_form","submissionSeq":1}', (strftime('%s', 'now', '-1 day') * 1000), (strftime('%s', 'now') * 1000)),
  ('cnt_dup_lead_2', 'tenant_synthetic_eval', 'Jane', 'Duplicate-Reentered', 'lead.duplicate@target.example', '+1-555-0132', NULL, '{"source":"apollo_sync","submissionSeq":2}', (strftime('%s', 'now', '-3 hours') * 1000), (strftime('%s', 'now') * 1000)),
  -- Edge Case: Missing Fields
  ('cnt_missing_fields', 'tenant_synthetic_eval', 'Ghost', 'Contact', NULL, NULL, NULL, '{}', (strftime('%s', 'now', '-5 days') * 1000), (strftime('%s', 'now') * 1000)),
  -- Edge Case: Stale Record (> 90 days inactive)
  ('cnt_stale_record', 'tenant_synthetic_eval', 'John', 'Stale', 'john.stale@dormant.example', '+1-555-0100', NULL, '{"status":"INACTIVE"}', (strftime('%s', 'now', '-120 days') * 1000), (strftime('%s', 'now', '-110 days') * 1000));

-- ------------------------------------------------------------------------------
-- 4. Deals (Ares Trigger, Hermes Trigger, and Edge Cases)
-- ------------------------------------------------------------------------------
INSERT INTO "Deal" ("id", "tenantId", "title", "amount", "stage", "companyId", "contactId", "customData", "createdAt", "updatedAt")
VALUES
  -- Scenario 1 (Ares Trigger): Deal inactive 11 days (>= 8 days)
  ('deal_ares_stalled', 'tenant_synthetic_eval', 'Hyperion Q3 Enterprise Expansion', 85000.0, 'Proposal', 'cmp_hyperion', 'cnt_evelyn_reed', '{"inactiveDays":11,"probability":65,"solution":"Enterprise Multi-Agent Platform"}', (strftime('%s', 'now', '-30 days') * 1000), (strftime('%s', 'now', '-11 days') * 1000)),
  
  -- Scenario 4 (Hermes Trigger): Newly Closed Won Deal
  ('deal_hermes_won', 'tenant_synthetic_eval', 'Stark Cloud Core Enterprise Deployment', 120000.0, 'Won', 'cmp_stark_cloud', 'cnt_tony_stark', '{"probability":100,"contractSignedAt":"2026-09-07T12:00:00Z","onboardingStatus":"PENDING_KICKOFF"}', (strftime('%s', 'now', '-14 days') * 1000), (strftime('%s', 'now', '-1 hour') * 1000)),
  
  -- Edge Case: Missing Expected Close Date & 0 Amount
  ('deal_missing_date', 'tenant_synthetic_eval', 'Exploratory Discovery Discussion', 0.0, 'Lead', 'cmp_missing_data', 'cnt_missing_fields', '{}', (strftime('%s', 'now', '-4 days') * 1000), (strftime('%s', 'now') * 1000)),
  
  -- Edge Case: Stale Deal (> 120 days)
  ('deal_stale_abandoned', 'tenant_synthetic_eval', 'Legacy Pilot 2025 (Abandoned)', 25000.0, 'Discovery', 'cmp_vance_logistics', 'cnt_arthur_vance', '{"isStale":true}', (strftime('%s', 'now', '-180 days') * 1000), (strftime('%s', 'now', '-120 days') * 1000)),
  
  -- Edge Case: Conflicting State (Deal Won but Invoices Disputed)
  ('deal_conflict_won_unpaid', 'tenant_synthetic_eval', 'Solvent BioTech Annual SaaS License', 50000.0, 'Won', 'cmp_hyperion', 'cnt_evelyn_reed', '{"financeStatus":"DISPUTED"}', (strftime('%s', 'now', '-45 days') * 1000), (strftime('%s', 'now', '-10 days') * 1000));

-- ------------------------------------------------------------------------------
-- 5. Activities (Linking Deal & Contact Interactions)
-- ------------------------------------------------------------------------------
INSERT INTO "Activity" ("id", "tenantId", "type", "title", "content", "contactId", "companyId", "dealId", "userId", "createdAt", "updatedAt")
VALUES
  ('act_ares_note', 'tenant_synthetic_eval', 'NOTE', 'Proposal Stage Review', 'Sent formal proposal for $85,000 with SOC2 compliance playbook. Evelyn acknowledged receipt but has gone dark for 11 days.', 'cnt_evelyn_reed', 'cmp_hyperion', 'deal_ares_stalled', 'usr_eval_ae', (strftime('%s', 'now', '-11 days') * 1000), (strftime('%s', 'now', '-11 days') * 1000)),
  ('act_hermes_won', 'tenant_synthetic_eval', 'STAGE_CHANGE', 'Deal Closed Won', 'Contract executed via DocuSign. Total contract value: $120,000 ARR. Triggering operational onboarding.', 'cnt_tony_stark', 'cmp_stark_cloud', 'deal_hermes_won', 'usr_eval_ae', (strftime('%s', 'now', '-1 hour') * 1000), (strftime('%s', 'now', '-1 hour') * 1000)),
  ('act_apex_complaint', 'tenant_synthetic_eval', 'EMAIL', 'Executive Complaint on Platform Latency', 'Marcus Vance emailed stating their daily ETL batch is timing out. Expressed extreme dissatisfaction.', 'cnt_marcus_vance', 'cmp_apex_global', NULL, 'usr_eval_support', (strftime('%s', 'now', '-2 days') * 1000), (strftime('%s', 'now', '-2 days') * 1000));

-- ------------------------------------------------------------------------------
-- 6. Invoices & Line Items (Midas Trigger, E-Commerce Trigger, and Edge Cases)
-- ------------------------------------------------------------------------------
INSERT INTO "Invoice" ("id", "tenantId", "invoiceNum", "amount", "status", "dueDate", "createdAt", "updatedAt")
VALUES
  -- Scenario 3 (Midas Trigger): Invoice 35 days overdue (> 30 days)
  ('inv_midas_overdue', 'tenant_synthetic_eval', 'INV-2026-MIDAS-01', 14500.0, 'OVERDUE', (strftime('%s', 'now', '-35 days') * 1000), (strftime('%s', 'now', '-65 days') * 1000), (strftime('%s', 'now', '-5 days') * 1000)),
  
  -- Scenario 2 Support Entity: Overdue invoice on declining account
  ('inv_apex_overdue', 'tenant_synthetic_eval', 'INV-2026-APEX-09', 9800.0, 'OVERDUE', (strftime('%s', 'now', '-18 days') * 1000), (strftime('%s', 'now', '-48 days') * 1000), (strftime('%s', 'now', '-2 days') * 1000)),
  
  -- Scenario 8 (E-Commerce Agent Trigger): $1,000+ purchase ($1,499.00)
  ('inv_ecom_vip_purchase', 'tenant_synthetic_eval', 'INV-2026-ECOM-1001', 1499.0, 'PAID', (strftime('%s', 'now', '-3 hours') * 1000), (strftime('%s', 'now', '-3 hours') * 1000), (strftime('%s', 'now', '-3 hours') * 1000)),
  
  -- Edge Case: Conflicting/Disputed Invoice
  ('inv_conflict_disputed', 'tenant_synthetic_eval', 'INV-2026-DISPUTE-01', 50000.0, 'DISPUTED', (strftime('%s', 'now', '-10 days') * 1000), (strftime('%s', 'now', '-40 days') * 1000), (strftime('%s', 'now', '-2 days') * 1000)),
  
  -- Edge Case: Zero-line item draft invoice
  ('inv_empty_draft', 'tenant_synthetic_eval', 'INV-2026-DRAFT-00', 0.0, 'DRAFT', (strftime('%s', 'now', '+30 days') * 1000), (strftime('%s', 'now', '-1 day') * 1000), (strftime('%s', 'now') * 1000));

INSERT INTO "InvoiceLineItem" ("id", "invoiceId", "description", "quantity", "unitPrice", "total")
VALUES
  ('ili_midas_1', 'inv_midas_overdue', 'Business OS Core Platform License - 50 Seats', 1, 12000.0, 12000.0),
  ('ili_midas_2', 'inv_midas_overdue', 'Dedicated Customer Success Support SLA', 1, 2500.0, 2500.0),
  ('ili_apex_1', 'inv_apex_overdue', 'FinTech Analytics & Dual Khata Reconciliation Module', 1, 9800.0, 9800.0),
  ('ili_ecom_1', 'inv_ecom_vip_purchase', 'Autonomous Enterprise POS & Storefront Bundle', 1, 1499.0, 1499.0),
  ('ili_dispute_1', 'inv_conflict_disputed', 'Annual BioTech SaaS Subscription', 1, 50000.0, 50000.0);

-- ------------------------------------------------------------------------------
-- 7. Tickets & Messages (Athena Trigger, Support Agent Trigger, and Edge Cases)
-- ------------------------------------------------------------------------------
INSERT INTO "Ticket" ("id", "tenantId", "title", "description", "status", "priority", "createdAt", "updatedAt")
VALUES
  -- Scenario 2 & 6: Multiple High-Severity/Urgent Tickets on Apex Global
  ('tck_eval_critical_1', 'tenant_synthetic_eval', 'Production API Gateway 502 Bad Gateway Outage', 'Critical API gateway latency exceeding 4500ms causing transaction timeouts across payment pipelines.', 'OPEN', 'URGENT', (strftime('%s', 'now', '-1 day') * 1000), (strftime('%s', 'now', '-1 hour') * 1000)),
  ('tck_eval_critical_2', 'tenant_synthetic_eval', 'Database Replication Lag & Failed Webhook Deliveries', 'Postgres/Redis replication lag resulting in dropped customer notification webhooks.', 'OPEN', 'URGENT', (strftime('%s', 'now', '-2 days') * 1000), (strftime('%s', 'now', '-3 hours') * 1000)),
  ('tck_eval_high_3', 'tenant_synthetic_eval', 'Single Sign-On SAML Certificate Expiration Warning', 'Identity provider SAML cert expires in 48 hours; enterprise login at risk.', 'OPEN', 'HIGH', (strftime('%s', 'now', '-12 hours') * 1000), (strftime('%s', 'now', '-2 hours') * 1000)),
  
  -- Edge Case: Stale Resolved Ticket (> 90 days ago)
  ('tck_stale_closed', 'tenant_synthetic_eval', 'Legacy Python 2 Deprecation Warning Notice', 'Legacy worker pool successfully migrated to Python 3.12.', 'CLOSED', 'LOW', (strftime('%s', 'now', '-120 days') * 1000), (strftime('%s', 'now', '-110 days') * 1000));

INSERT INTO "TicketMessage" ("id", "ticketId", "content", "isStaff", "createdAt")
VALUES
  ('tmsg_eval_1', 'tck_eval_critical_1', 'Marcus Vance: Our production payment processing is failing. We need immediate escalation to senior engineering.', 0, (strftime('%s', 'now', '-1 day') * 1000)),
  ('tmsg_eval_2', 'tck_eval_critical_1', 'Support Lead: Escalated to SRE On-Call. Traffic re-routed to backup node.', 1, (strftime('%s', 'now', '-20 hours') * 1000)),
  ('tmsg_eval_3', 'tck_eval_critical_2', 'Webhook retry queue currently backlogged with 1,240 pending delivery jobs.', 0, (strftime('%s', 'now', '-2 days') * 1000));

-- ------------------------------------------------------------------------------
-- 8. Projects & Tasks (Hermes Kickoff Verification)
-- ------------------------------------------------------------------------------
INSERT INTO "Project" ("id", "tenantId", "name", "description", "status", "createdAt", "updatedAt")
VALUES
  ('prj_stark_onboarding', 'tenant_synthetic_eval', 'Stark Cloud Core - Enterprise Onboarding', 'Automated operational onboarding workflow initialized by Hermes Sentinel upon Closed-Won contract signing.', 'ACTIVE', (strftime('%s', 'now', '-1 hour') * 1000), (strftime('%s', 'now') * 1000));

INSERT INTO "Task" ("id", "projectId", "title", "description", "status", "priority", "createdAt", "updatedAt")
VALUES
  ('tsk_stark_1', 'prj_stark_onboarding', 'Verify Executed NDA & Master Services Agreement', 'Ensure legal countersignatures are archived in tenant document store.', 'TODO', 'HIGH', (strftime('%s', 'now', '-1 hour') * 1000), (strftime('%s', 'now') * 1000)),
  ('tsk_stark_2', 'prj_stark_onboarding', 'Provision Dedicated Tenant DB & Groq Model Budget', 'Set up enterprise isolation partition and configure AI rate limits.', 'TODO', 'HIGH', (strftime('%s', 'now', '-1 hour') * 1000), (strftime('%s', 'now') * 1000));

-- ------------------------------------------------------------------------------
-- 9. Content Repurposing (Scenario 9: Content Agent Trigger)
-- ------------------------------------------------------------------------------
INSERT INTO "LandingPage" ("id", "tenantId", "title", "slug", "published", "createdAt", "updatedAt")
VALUES
  ('lp_q3_release_notes', 'tenant_synthetic_eval', 'Business OS Q3 Major Architecture Release & Multi-Agent Roadmap', 'q3-architecture-roadmap', 0, (strftime('%s', 'now', '-2 days') * 1000), (strftime('%s', 'now') * 1000));

INSERT INTO "PageBlock" ("id", "landingPageId", "type", "content", "orderIndex", "createdAt", "updatedAt")
VALUES
  ('pb_q3_1', 'lp_q3_release_notes', 'HEADER', '{"headline":"Unifying 10 Autonomous Intelligence Sentinels","badge":"v1.8 Release"}', 1, (strftime('%s', 'now', '-2 days') * 1000), (strftime('%s', 'now') * 1000)),
  ('pb_q3_2', 'lp_q3_release_notes', 'ARTICLE_BODY', '{"body":"Today we unveil the production release of Business OS unifying Sales Intelligence (Ares), Customer Success (Athena), Treasury (Midas), Operations (Hermes), and Escrow (Vesta). Powered by sub-50ms inference and zero-trust human approval gates."}', 2, (strftime('%s', 'now', '-2 days') * 1000), (strftime('%s', 'now') * 1000));

INSERT INTO "KnowledgeBaseDocument" ("id", "tenantId", "title", "content", "vectorEmbeddings", "createdAt", "updatedAt")
VALUES
  ('kb_doc_q3_whitepaper', 'tenant_synthetic_eval', 'Autonomous AI Multi-Agent Orchestration Specification', 'Complete architectural reference covering BullMQ event queues, Redis bus, Groq LLM integration, and human-in-the-loop approval policies.', '[-0.012, 0.045, 0.088, -0.031]', (strftime('%s', 'now', '-5 days') * 1000), (strftime('%s', 'now') * 1000));

-- ------------------------------------------------------------------------------
-- 10. Custom Objects & Records (Scenario 7: Recruitment & Scenario 10: Vesta Real Estate)
-- ------------------------------------------------------------------------------
INSERT INTO "CustomObject" ("id", "tenantId", "name", "pluralName", "apiName", "description", "icon", "createdAt", "updatedAt")
VALUES
  ('cobj_recruitment', 'tenant_synthetic_eval', 'Job Candidate', 'Job Candidates', 'job_candidate', 'Technical recruitment candidates and competency scores', 'UserCheck', (strftime('%s', 'now', '-30 days') * 1000), (strftime('%s', 'now') * 1000)),
  ('cobj_re_escrow', 'tenant_synthetic_eval', 'Real Estate Escrow Transaction', 'Real Estate Escrow Transactions', 'real_estate_escrow', 'Escrow contingency timelines and closing schedules', 'Home', (strftime('%s', 'now', '-30 days') * 1000), (strftime('%s', 'now') * 1000));

INSERT INTO "CustomField" ("id", "customObjectId", "name", "apiName", "fieldType", "isRequired", "isSearchable", "createdAt", "updatedAt")
VALUES
  ('cf_cand_name', 'cobj_recruitment', 'Candidate Name', 'candidate_name', 'TEXT', 1, 1, (strftime('%s', 'now', '-30 days') * 1000), (strftime('%s', 'now') * 1000)),
  ('cf_cand_role', 'cobj_recruitment', 'Target Role', 'target_role', 'TEXT', 1, 1, (strftime('%s', 'now', '-30 days') * 1000), (strftime('%s', 'now') * 1000)),
  ('cf_cand_resume', 'cobj_recruitment', 'Resume URL', 'resume_url', 'URL', 1, 0, (strftime('%s', 'now', '-30 days') * 1000), (strftime('%s', 'now') * 1000)),
  ('cf_escrow_addr', 'cobj_re_escrow', 'Property Address', 'property_address', 'TEXT', 1, 1, (strftime('%s', 'now', '-30 days') * 1000), (strftime('%s', 'now') * 1000)),
  ('cf_escrow_close', 'cobj_re_escrow', 'Closing Date', 'closing_date', 'DATE', 1, 1, (strftime('%s', 'now', '-30 days') * 1000), (strftime('%s', 'now') * 1000));

-- Scenario 7 (Recruitment Agent): Candidate with resume submitted
INSERT INTO "CustomRecord" ("id", "tenantId", "customObjectId", "data", "createdAt", "updatedAt")
VALUES
  ('crec_candidate_elena', 'tenant_synthetic_eval', 'cobj_recruitment', '{"candidate_name":"Elena Rostova","target_role":"Staff Full-Stack Engineer","email":"elena.rostova@engineer.example","yearsExperience":11,"primarySkills":["TypeScript","NestJS","React","PostgreSQL","Distributed Systems"],"stage":"APPLIED","resumeUrl":"https://cdn.businessos.test/resumes/elena_rostova_staff_eng.pdf","hasResume":true}', (strftime('%s', 'now', '-4 hours') * 1000), (strftime('%s', 'now') * 1000));

-- Scenario 10 (Vesta Real Estate Agent): Closing deadline in 2 days
INSERT INTO "CustomRecord" ("id", "tenantId", "customObjectId", "data", "createdAt", "updatedAt")
VALUES
  ('crec_escrow_vesta', 'tenant_synthetic_eval', 'cobj_re_escrow', '{"property_address":"742 Evergreen Terrace","contractPrice":865000,"escrowAgent":"First American Title","closing_date":"2026-09-09T18:00:00Z","daysUntilClosing":2,"contingenciesPending":["Final Loan Underwriting Signoff","Appraisal Verification"],"status":"CLOSING","escrowOpened":true}', (strftime('%s', 'now', '-10 days') * 1000), (strftime('%s', 'now') * 1000));

-- Document representing candidate's PDF resume
INSERT INTO "Document" ("id", "tenantId", "name", "mimeType", "size", "url", "folderId", "createdAt", "updatedAt")
VALUES
  ('doc_resume_candidate', 'tenant_synthetic_eval', 'Elena_Rostova_Staff_Engineer_Resume.pdf', 'application/pdf', 245800, 'https://cdn.businessos.test/resumes/elena_rostova_staff_eng.pdf', NULL, (strftime('%s', 'now', '-4 hours') * 1000), (strftime('%s', 'now') * 1000));

-- ------------------------------------------------------------------------------
-- 11. AI Agents Registry (Central Definition for 10 Business OS AI Agents)
-- ------------------------------------------------------------------------------
INSERT INTO "Agent" ("id", "tenantId", "name", "role", "domain", "model", "systemPrompt", "temperature", "maxIterations", "tokenBudget", "autonomyMode", "status", "allowedTools", "escalationPolicy", "createdAt", "updatedAt")
VALUES
  ('eval_agent_ares', 'tenant_synthetic_eval', 'Ares Sales Intelligence Sentinel', 'Sales SDR & Pipeline Velocity', 'SALES', 'groq/compound', 'You are Ares, the Sales Intelligence Sentinel. Analyze deal age, stage history, and proposal status. Propose consultative follow-ups and advance stalled deals.', 0.6, 10, 100000, 'HYBRID', 'ACTIVE', '["search_crm_contacts","search_crm_deals","move_crm_deal","send_email","create_crm_task","add_crm_activity"]', '{"maxDiscountWithoutApproval":5000}', (strftime('%s', 'now', '-30 days') * 1000), (strftime('%s', 'now') * 1000)),
  ('eval_agent_athena', 'tenant_synthetic_eval', 'Athena Customer Success Sentinel', 'Customer Success & Churn Prevention', 'SUPPORT', 'groq/compound', 'You are Athena, Customer Success Sentinel. Monitor ticket volume, sentiment, and health score. Prevent churn proactively.', 0.5, 10, 100000, 'AUTONOMOUS', 'ACTIVE', '["search_knowledge_base","create_support_ticket","reply_support_ticket","add_crm_activity","create_crm_task"]', '{}', (strftime('%s', 'now', '-30 days') * 1000), (strftime('%s', 'now') * 1000)),
  ('eval_agent_midas', 'tenant_synthetic_eval', 'Midas Treasury & Invoicing Sentinel', 'Accounts Receivable & Dunning', 'FINANCE', 'groq/compound', 'You are Midas, Treasury and Accounts Receivable Specialist. Audit overdue invoices accurately and create dynamic payment links.', 0.2, 10, 100000, 'HYBRID', 'ACTIVE', '["get_overdue_invoices","create_payment_link","send_email","add_crm_activity","create_crm_task"]', '{}', (strftime('%s', 'now', '-30 days') * 1000), (strftime('%s', 'now') * 1000)),
  ('eval_agent_hermes', 'tenant_synthetic_eval', 'Hermes Operations Sentinel', 'Delivery & Client Onboarding', 'OPERATIONS', 'groq/compound', 'You are Hermes, Operations and Onboarding Agent. When a deal is closed won, initialize delivery boards and dispatch starter tasks.', 0.4, 10, 100000, 'AUTONOMOUS', 'ACTIVE', '["create_crm_task","add_crm_activity","search_knowledge_base","send_email"]', '{}', (strftime('%s', 'now', '-30 days') * 1000), (strftime('%s', 'now') * 1000)),
  ('eval_agent_lead_qualification', 'tenant_synthetic_eval', 'Inbound SDR Lead Qualifier', 'Lead Qualification & ICP Scoring', 'LEADS', 'groq/compound', 'Evaluate prospect fit using ICP criteria. Score firmographics and title seniority.', 0.4, 10, 100000, 'HYBRID', 'ACTIVE', '["search_crm_contacts","create_crm_contact","update_crm_contact","create_crm_deal"]', '{}', (strftime('%s', 'now', '-30 days') * 1000), (strftime('%s', 'now') * 1000)),
  ('eval_agent_customer_support', 'tenant_synthetic_eval', 'Tier-1 Customer Support Specialist', 'Customer Support & Knowledge RAG', 'SUPPORT', 'groq/compound', 'Resolve customer inquiries strictly citing knowledge base documents.', 0.3, 10, 100000, 'AUTONOMOUS', 'ACTIVE', '["search_knowledge_base","reply_support_ticket","create_support_ticket"]', '{}', (strftime('%s', 'now', '-30 days') * 1000), (strftime('%s', 'now') * 1000)),
  ('eval_agent_recruitment', 'tenant_synthetic_eval', 'Technical Recruitment Screener', 'Talent Screening & Competency Scoring', 'HR', 'groq/compound', 'Score engineering candidates objectively on technical competencies.', 0.3, 10, 100000, 'HYBRID', 'ACTIVE', '["search_crm_contacts","create_crm_contact","create_crm_task"]', '{}', (strftime('%s', 'now', '-30 days') * 1000), (strftime('%s', 'now') * 1000)),
  ('eval_agent_ecommerce', 'tenant_synthetic_eval', 'E-Commerce Merchandising Sentinel', 'Order Processing & VIP Tagging', 'COMMERCE', 'groq/compound', 'Ingest order transactions, calculate customer spend, and flag VIPs.', 0.2, 10, 100000, 'AUTONOMOUS', 'ACTIVE', '["search_crm_contacts","create_crm_contact","add_crm_activity","send_email"]', '{}', (strftime('%s', 'now', '-30 days') * 1000), (strftime('%s', 'now') * 1000)),
  ('eval_agent_content', 'tenant_synthetic_eval', 'Content Repurposing Sentinel', 'Thought Leadership & Multi-Channel Copy', 'MARKETING', 'groq/compound', 'Transform long-form product releases into engaging LinkedIn posts and newsletters.', 0.7, 10, 100000, 'HYBRID', 'ACTIVE', '["search_knowledge_base","add_crm_activity","send_email"]', '{}', (strftime('%s', 'now', '-30 days') * 1000), (strftime('%s', 'now') * 1000)),
  ('eval_agent_vesta', 'tenant_synthetic_eval', 'Vesta Escrow & Transaction Sentinel', 'Escrow Timeline & Contingency Audit', 'REAL_ESTATE', 'groq/compound', 'Track inspection and appraisal contingencies and audit closing deadlines.', 0.2, 10, 100000, 'AUTONOMOUS', 'ACTIVE', '["audit_escrow_contingency","calculate_commission_split","schedule_property_showing"]', '{}', (strftime('%s', 'now', '-30 days') * 1000), (strftime('%s', 'now') * 1000));

-- ------------------------------------------------------------------------------
-- 12. Tool Executions (Telemetry & Edge Case: Failed Execution)
-- ------------------------------------------------------------------------------
INSERT INTO "ToolExecution" ("id", "tenantId", "toolName", "agentId", "workflowExecutionId", "inputData", "outputData", "status", "durationMs", "error", "createdAt")
VALUES
  ('texec_ares_search', 'tenant_synthetic_eval', 'search_crm_deals', 'eval_agent_ares', NULL, '{"filter":{"inactiveDaysMin":8}}', '{"matchedDeals":[{"id":"deal_ares_stalled","title":"Hyperion Q3 Enterprise Expansion","amount":85000,"daysInactive":11}]}', 'SUCCESS', 42, NULL, (strftime('%s', 'now', '-2 hours') * 1000)),
  ('texec_midas_link', 'tenant_synthetic_eval', 'create_payment_link', 'eval_agent_midas', NULL, '{"invoiceId":"inv_midas_overdue","amount":14500.0}', '{"paymentUrl":"https://pay.businessos.test/link_midas_eval_01","expiresIn":"7d"}', 'SUCCESS', 88, NULL, (strftime('%s', 'now', '-1 hour') * 1000)),
  -- Edge Case: Failed Tool Execution
  ('texec_erp_timeout', 'tenant_synthetic_eval', 'sync_external_erp', 'eval_agent_midas', NULL, '{"companyId":"cmp_vance_logistics","ledgerAction":"SYNC"}', '{}', 'FAILED', 30042, 'Connection timeout after 30000ms: External NetSuite ERP endpoint unreachable', (strftime('%s', 'now', '-50 minutes') * 1000));

-- ------------------------------------------------------------------------------
-- 13. Workflows & Executions (Workflow Automation Layer)
-- ------------------------------------------------------------------------------
INSERT INTO "Workflow" ("id", "tenantId", "name", "description", "isActive", "version", "status", "triggerType", "triggerData", "nodes", "edges", "variables", "errorPolicy", "concurrencyPolicy", "approvalPolicy", "createdAt", "updatedAt")
VALUES
  ('wf_stalled_deals', 'tenant_synthetic_eval', 'Stalled Deal Recovery Engine', 'Daily cron detecting deals inactive for 8+ days and triggering Ares consultative follow-up.', 1, 1, 'ACTIVE', 'CRON', '{"schedule":"0 9 * * 1-5"}', '[{"id":"1","type":"trigger","label":"Check Inactive Deals"},{"id":"2","type":"action","label":"Run Ares Analysis"}]', '[{"from":"1","to":"2"}]', '[]', '{"maxRetries":3}', '{"concurrency":1}', '{}', (strftime('%s', 'now', '-20 days') * 1000), (strftime('%s', 'now') * 1000)),
  ('wf_onboarding_dispatch', 'tenant_synthetic_eval', 'Closed-Won Client Onboarding Pipeline', 'Triggered when deal stage advances to Won.', 1, 1, 'ACTIVE', 'EVENT', '{"event":"crm:deal_stage_changed","stage":"Won"}', '[{"id":"1","type":"trigger","label":"Deal Won Event"},{"id":"2","type":"action","label":"Hermes Project Setup"}]', '[{"from":"1","to":"2"}]', '[]', '{"maxRetries":2}', '{"concurrency":5}', '{}', (strftime('%s', 'now', '-20 days') * 1000), (strftime('%s', 'now') * 1000));

INSERT INTO "WorkflowExecution" ("id", "tenantId", "workflowId", "workflowName", "status", "triggerType", "triggerData", "contextData", "outputData", "startedAt", "completedAt", "durationMs", "currentStepIndex", "error", "tokensUsed", "createdAt", "updatedAt")
VALUES
  ('wfexec_stalled_success', 'tenant_synthetic_eval', 'wf_stalled_deals', 'Stalled Deal Recovery Engine', 'COMPLETED', 'CRON', '{"scheduledTime":"2026-09-07T09:00:00Z"}', '{"dealsScanned":5}', '{"stalledCount":1,"recoveryPlansGenerated":1}', (strftime('%s', 'now', '-4 hours') * 1000), (strftime('%s', 'now', '-4 hours', '+12 seconds') * 1000), 12450, 2, NULL, 480, (strftime('%s', 'now', '-4 hours') * 1000), (strftime('%s', 'now', '-4 hours') * 1000)),
  -- Edge Case: Failed Workflow Execution
  ('wfexec_failed_retry', 'tenant_synthetic_eval', 'wf_stalled_deals', 'Stalled Deal Recovery Engine', 'FAILED', 'WEBHOOK', '{"payload":{"dealId":"deal_ares_stalled"}}', '{"attempt":3}', '{}', (strftime('%s', 'now', '-8 hours') * 1000), (strftime('%s', 'now', '-8 hours', '+3 seconds') * 1000), 3200, 1, 'HTTP 429 Too Many Requests: Rate limit exceeded on third-party verification service', 120, (strftime('%s', 'now', '-8 hours') * 1000), (strftime('%s', 'now', '-8 hours') * 1000));

-- ------------------------------------------------------------------------------
-- 14. Human-In-The-Loop Approval Requests (HITL Safety Gate)
-- ------------------------------------------------------------------------------
INSERT INTO "ApprovalRequest" ("id", "tenantId", "workflowExecutionId", "workflowId", "agentId", "actionType", "targetEntity", "targetId", "riskLevel", "payload", "reason", "status", "requestedAt", "expiresAt", "reviewedBy", "reviewedAt", "comments", "executionResult")
VALUES
  ('appr_ares_discount', 'tenant_synthetic_eval', NULL, 'wf_stalled_deals', 'eval_agent_ares', 'apply_commercial_discount', 'Deal', 'deal_ares_stalled', 'HIGH', '{"dealId":"deal_ares_stalled","requestedDiscountPercent":20,"discountValue":17000.0,"proposedAmount":68000.0}', 'Ares proposed 20% commercial concession ($17,000) to revive stalled Hyperion Q3 proposal. Exceeds standard $5,000 threshold.', 'PENDING', (strftime('%s', 'now', '-2 hours') * 1000), (strftime('%s', 'now', '+22 hours') * 1000), NULL, NULL, NULL, NULL);

-- ------------------------------------------------------------------------------
-- 15. Audit Logs (Complete Audit Trail of Dataset Operations)
-- ------------------------------------------------------------------------------
INSERT INTO "AuditLog" ("id", "tenantId", "action", "entityType", "entityId", "userId", "metadata", "createdAt")
VALUES
  ('audit_01_seed', 'tenant_synthetic_eval', 'TENANT_SEEDED', 'Tenant', 'tenant_synthetic_eval', 'usr_eval_admin', '{"dataset":"synthetic_test_dataset.sql","version":"1.8.0","scenarios":10}', (strftime('%s', 'now', '-1 hour') * 1000)),
  ('audit_02_ares', 'tenant_synthetic_eval', 'DEAL_INSPECTED', 'Deal', 'deal_ares_stalled', 'usr_eval_admin', '{"agent":"ares","action":"stalled_deal_scan","daysInactive":11}', (strftime('%s', 'now', '-50 minutes') * 1000)),
  ('audit_03_athena', 'tenant_synthetic_eval', 'HEALTH_SCORE_UPDATED', 'Company', 'cmp_apex_global', 'usr_eval_admin', '{"agent":"athena","previousScore":78,"currentScore":42,"reason":"multiple_urgent_tickets"}', (strftime('%s', 'now', '-45 minutes') * 1000)),
  ('audit_04_midas', 'tenant_synthetic_eval', 'INVOICE_DUNNING_STAGED', 'Invoice', 'inv_midas_overdue', 'usr_eval_admin', '{"agent":"midas","daysOverdue":35,"action":"payment_link_created"}', (strftime('%s', 'now', '-40 minutes') * 1000)),
  ('audit_05_hitl', 'tenant_synthetic_eval', 'APPROVAL_REQUEST_SUBMITTED', 'ApprovalRequest', 'appr_ares_discount', 'usr_eval_admin', '{"riskLevel":"HIGH","threshold":5000,"requested":17000}', (strftime('%s', 'now', '-35 minutes') * 1000));

COMMIT;
