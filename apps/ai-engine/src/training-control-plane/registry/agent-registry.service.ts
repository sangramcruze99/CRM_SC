import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface AgentRegistryDefinition {
  agentId: string;
  name: string;
  description: string;
  version: string;
  status: 'ACTIVE' | 'PAUSED' | 'EVALUATING' | 'STAGED' | 'RETIRED';
  lifecycleStage: 'CONFIGURED' | 'EVALUATED' | 'FINE_TUNED' | 'STAGED' | 'PRODUCTION';
  domain: 'SALES' | 'FINANCE' | 'HR' | 'OPERATIONS' | 'SUPPORT' | 'REALESTATE' | 'ECOMMERCE' | 'MARKETING' | 'LEADS';
  service: string;
  modelProvider: string;
  model: string;
  systemInstructions: string;
  businessRules: string[];
  allowedTools: string[];
  knowledgeSources: string[];
  memoryPolicy: Record<string, any>;
  approvalPolicy: Record<string, any>;
  resultSchema: Record<string, any>;
  evaluationProfile: Record<string, any>;
  trainingProfile: Record<string, any>;
}

@Injectable()
export class AgentRegistryService implements OnModuleInit {
  private readonly logger = new Logger(AgentRegistryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedAllAgents().catch((err) =>
      this.logger.warn(`Could not seed agents into database: ${err.message}`),
    );
  }

  // Define canonical specifications for all 10 production agents
  getCanonicalAgentDefinitions(): AgentRegistryDefinition[] {
    return [
      // 1. ARES (Sales Intelligence)
      {
        agentId: 'ares',
        name: 'Ares Sales Intelligence Sentinel',
        description: 'Autonomous deal velocity, pipeline risk analysis, and next-best sales action engine.',
        version: '1.2.0',
        status: 'ACTIVE',
        lifecycleStage: 'PRODUCTION',
        domain: 'SALES',
        service: 'sales',
        modelProvider: 'groq',
        model: 'groq/compound',
        systemInstructions: `You are Ares, the autonomous AI Sales Sentinel for Business OS.
Your objective is to optimize pipeline velocity, detect stalled opportunities, identify ICP fit, and recommend high-converting next steps.
Ground all reasoning in CRM data and never invent fake deal terms.`,
        businessRules: [
          'Deals stalled in Proposal stage for >10 days must trigger proactive executive follow-up.',
          'Discounts greater than 15% require human approval before proposal issuance.',
          'Never advance deal stage to Won without verified contract attachment.',
          'CRM contacts must have valid email or phone before initiating outreach.',
        ],
        allowedTools: [
          'search_crm_contacts',
          'create_crm_contact',
          'update_crm_contact',
          'search_crm_deals',
          'create_crm_deal',
          'move_crm_deal',
          'create_crm_task',
          'add_crm_activity',
          'send_email',
          'book_calendar',
        ],
        knowledgeSources: ['sales_playbook_v2', 'objection_handling_matrix'],
        memoryPolicy: { retainShortTermDays: 30, retainAccountHistory: true },
        approvalPolicy: { requireApprovalForDealStageWon: true, maxAutoDiscountPercent: 15 },
        resultSchema: {
          type: 'object',
          required: ['decision', 'confidence', 'findings', 'actions', 'requiresApproval'],
          properties: {
            decision: { type: 'string' },
            confidence: { type: 'number', minimum: 0, maximum: 1 },
            findings: { type: 'array', items: { type: 'string' } },
            actions: { type: 'array', items: { type: 'string' } },
            requiresApproval: { type: 'boolean' },
          },
        },
        evaluationProfile: {
          minCorrectness: 0.88,
          minGrounding: 0.90,
          minToolAccuracy: 0.92,
          maxHallucinationRate: 0.03,
          maxLatencyMs: 3000,
        },
        trainingProfile: {
          recommendedMethod: 'PROMPT_AND_RAG',
          canaryCohortPercent: 10,
          evaluationThresholdForPromotion: 0.90,
        },
      },

      // 2. ATHENA (Customer Success)
      {
        agentId: 'athena',
        name: 'Athena Customer Success Sentinel',
        description: 'Customer health analytics, churn risk detection, and proactive retention workflow engine.',
        version: '1.1.0',
        status: 'ACTIVE',
        lifecycleStage: 'PRODUCTION',
        domain: 'SUPPORT',
        service: 'helpdesk',
        modelProvider: 'groq',
        model: 'groq/compound',
        systemInstructions: `You are Athena, Customer Success Sentinel for Business OS.
You analyze customer health scores, telemetry events, and support tickets to prevent churn.
Always ground your risk assessments in verifiable engagement metrics.`,
        businessRules: [
          'Health scores falling below 60 require immediate CSM intervention alert.',
          'Unresolved critical tickets >48h automatically flag account as at-risk.',
          'Renewal outreach must begin at least 90 days before contract expiration.',
        ],
        allowedTools: [
          'search_crm_contacts',
          'create_crm_task',
          'add_crm_activity',
          'send_email',
          'search_knowledge_base',
          'create_support_ticket',
        ],
        knowledgeSources: ['cs_retention_playbook', 'product_sla_guidelines'],
        memoryPolicy: { retainAccountHistory: true, trackSentimentTrends: true },
        approvalPolicy: { requireApprovalForConcessions: true },
        resultSchema: {
          type: 'object',
          required: ['churnRiskLevel', 'healthScore', 'recommendedActions', 'requiresEscalation'],
          properties: {
            churnRiskLevel: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
            healthScore: { type: 'number' },
            recommendedActions: { type: 'array', items: { type: 'string' } },
            requiresEscalation: { type: 'boolean' },
          },
        },
        evaluationProfile: {
          minCorrectness: 0.87,
          minGrounding: 0.92,
          minToolAccuracy: 0.90,
          maxHallucinationRate: 0.02,
          maxLatencyMs: 3500,
        },
        trainingProfile: {
          recommendedMethod: 'PROMPT_AND_RAG',
          canaryCohortPercent: 10,
          evaluationThresholdForPromotion: 0.88,
        },
      },

      // 3. MIDAS (Treasury & Finance)
      {
        agentId: 'midas',
        name: 'Midas Treasury & Invoicing Sentinel',
        description: 'Autonomous AR/AP aging audit, OCR invoice reconciliation, and dunning engine with deterministic math.',
        version: '1.4.0',
        status: 'ACTIVE',
        lifecycleStage: 'PRODUCTION',
        domain: 'FINANCE',
        service: 'finance',
        modelProvider: 'ollama',
        model: 'ollama/gemma4:e4b',
        systemInstructions: `You are Midas, autonomous Treasury and Finance Specialist for Business OS.
CRITICAL SAFETY DIRECTIVE:
1. Never hallucinate financial values or perform free-form LLM arithmetic.
2. Rely exclusively on deterministic application logic for calculations.
3. Classify payment status strictly into: FULLY_PAID, PARTIALLY_PAID, UNPAID, OVERDUE, or DUE.
4. High-risk financial actions (write-offs, refunds >$500, disbursements) ALWAYS require human approval.`,
        businessRules: [
          'Calculations must be performed by deterministic arithmetic, never inferred by LLM text generation.',
          'Invoices overdue >7 days receive polite automated reminder with payment link.',
          'Invoices overdue >30 days require formal dunning and human review.',
          'Never execute payment or balance adjustments without explicit approval.',
          'Document OCR values must be verified against purchase order or vendor ledger.',
        ],
        allowedTools: [
          'get_overdue_invoices',
          'create_payment_link',
          'send_email',
          'create_crm_task',
          'add_crm_activity',
          'search_knowledge_base',
        ],
        knowledgeSources: ['finance_policy_sop_v8', 'tax_compliance_manual'],
        memoryPolicy: { retainAuditLogsYears: 7, strictTenantIsolation: true },
        approvalPolicy: {
          requireApprovalForDisbursements: true,
          requireApprovalForRefundsOver: 500,
          requireApprovalForBadDebtWriteoff: true,
        },
        resultSchema: {
          type: 'object',
          required: ['invoiceNum', 'amount', 'paidAmount', 'remainingBalance', 'paymentStatus', 'requiresApproval'],
          properties: {
            invoiceNum: { type: 'string' },
            amount: { type: 'number' },
            paidAmount: { type: 'number' },
            remainingBalance: { type: 'number' },
            paymentStatus: { type: 'string', enum: ['FULLY_PAID', 'PARTIALLY_PAID', 'UNPAID', 'OVERDUE', 'DUE', 'UNKNOWN'] },
            requiresApproval: { type: 'boolean' },
            recommendedAction: { type: 'string' },
          },
        },
        evaluationProfile: {
          minCorrectness: 0.98,
          minGrounding: 0.99,
          minToolAccuracy: 0.97,
          maxHallucinationRate: 0.00, // Zero tolerance for financial hallucination
          maxLatencyMs: 2500,
        },
        trainingProfile: {
          recommendedMethod: 'FEW_SHOT_WITH_DETERMINISTIC_GUARD',
          canaryCohortPercent: 5,
          evaluationThresholdForPromotion: 0.97,
        },
      },

      // 4. HERMES (Operations & Project Fulfillment)
      {
        agentId: 'hermes',
        name: 'Hermes Operations & Fulfillment Sentinel',
        description: 'Deal-to-project onboarding handoff, task dependency planning, and sprint delivery monitor.',
        version: '1.0.0',
        status: 'ACTIVE',
        lifecycleStage: 'PRODUCTION',
        domain: 'OPERATIONS',
        service: 'projects',
        modelProvider: 'groq',
        model: 'groq/compound',
        systemInstructions: `You are Hermes, Operations & Fulfillment Sentinel for Business OS.
You convert newly closed deals into structured delivery projects, generate onboarding tasks, and ensure project SLAs.`,
        businessRules: [
          'Every closed-won deal must create an onboarding project within 1 hour.',
          'Project milestones must have explicit assignees and delivery target dates.',
          'Prevent duplicate task generation on identical trigger events.',
        ],
        allowedTools: [
          'create_crm_task',
          'add_crm_activity',
          'send_email',
          'book_calendar',
          'search_knowledge_base',
        ],
        knowledgeSources: ['onboarding_sop', 'project_management_framework'],
        memoryPolicy: { retainProjectMilestones: true },
        approvalPolicy: { requireApprovalForSprintDateChanges: true },
        resultSchema: {
          type: 'object',
          required: ['projectId', 'milestonesCreated', 'tasksAssigned', 'status'],
          properties: {
            projectId: { type: 'string' },
            milestonesCreated: { type: 'number' },
            tasksAssigned: { type: 'array', items: { type: 'string' } },
            status: { type: 'string' },
          },
        },
        evaluationProfile: {
          minCorrectness: 0.90,
          minGrounding: 0.91,
          minToolAccuracy: 0.93,
          maxHallucinationRate: 0.02,
          maxLatencyMs: 3000,
        },
        trainingProfile: {
          recommendedMethod: 'PROMPT_AND_RAG',
          canaryCohortPercent: 10,
          evaluationThresholdForPromotion: 0.90,
        },
      },

      // 5. VESTA (Real Estate & Escrow)
      {
        agentId: 'vesta',
        name: 'Vesta Property & Escrow Sentinel',
        description: 'Contract deadline extraction, escrow contingency auditing, and transaction risk alerting.',
        version: '1.0.0',
        status: 'ACTIVE',
        lifecycleStage: 'PRODUCTION',
        domain: 'REALESTATE',
        service: 'documents',
        modelProvider: 'groq',
        model: 'groq/compound',
        systemInstructions: `You are Vesta, Real Estate and Escrow Sentinel for Business OS.
You audit real estate purchase agreements, extract financing/inspection contingencies, and alert on upcoming deadlines.`,
        businessRules: [
          'Missing disclosures or incomplete signatures must be flagged immediately.',
          'Contingency expiration dates must be logged with 72-hour and 24-hour alerts.',
          'Never sign or legally bind contracts autonomously.',
        ],
        allowedTools: [
          'search_knowledge_base',
          'create_crm_task',
          'add_crm_activity',
          'send_email',
        ],
        knowledgeSources: ['real_estate_standard_forms', 'escrow_contingency_rules'],
        memoryPolicy: { retainTransactionVault: true },
        approvalPolicy: { requireApprovalForContingencyWaivers: true },
        resultSchema: {
          type: 'object',
          required: ['transactionId', 'contingencies', 'deadlines', 'missingDocuments'],
          properties: {
            transactionId: { type: 'string' },
            contingencies: { type: 'array', items: { type: 'string' } },
            deadlines: { type: 'array', items: { type: 'object' } },
            missingDocuments: { type: 'array', items: { type: 'string' } },
          },
        },
        evaluationProfile: {
          minCorrectness: 0.92,
          minGrounding: 0.95,
          minToolAccuracy: 0.92,
          maxHallucinationRate: 0.01,
          maxLatencyMs: 3500,
        },
        trainingProfile: {
          recommendedMethod: 'PROMPT_AND_RAG',
          canaryCohortPercent: 10,
          evaluationThresholdForPromotion: 0.92,
        },
      },

      // 6. LEAD QUALIFICATION AGENT
      {
        agentId: 'lead_qualification',
        name: 'Inbound SDR & Lead Qualification Agent',
        description: 'Inbound lead enrichment, ICP scoring, qualification routing, and CRM opportunity creation.',
        version: '1.1.0',
        status: 'ACTIVE',
        lifecycleStage: 'PRODUCTION',
        domain: 'LEADS',
        service: 'crm',
        modelProvider: 'groq',
        model: 'groq/compound',
        systemInstructions: `You are the Lead Qualification Agent for Business OS.
You evaluate incoming leads against ICP criteria, enrich company information, score buyer intent, and route qualified prospects to Sales.`,
        businessRules: [
          'Leads scoring >= 75 ICP fit must be automatically routed to Account Executives.',
          'Leads with personal/disposable emails require additional verification before qualification.',
          'Do not create duplicate CRM deals for existing active accounts.',
        ],
        allowedTools: [
          'search_crm_contacts',
          'create_crm_contact',
          'update_crm_contact',
          'create_crm_deal',
          'create_crm_task',
          'add_crm_activity',
          'send_email',
        ],
        knowledgeSources: ['icp_definition_v3', 'lead_scoring_model'],
        memoryPolicy: { retainContactTimeline: true },
        approvalPolicy: { requireApprovalForEnterpriseRouting: false },
        resultSchema: {
          type: 'object',
          required: ['isQualified', 'icpScore', 'reasoning', 'recommendedRouting'],
          properties: {
            isQualified: { type: 'boolean' },
            icpScore: { type: 'number' },
            reasoning: { type: 'string' },
            recommendedRouting: { type: 'string' },
          },
        },
        evaluationProfile: {
          minCorrectness: 0.89,
          minGrounding: 0.91,
          minToolAccuracy: 0.93,
          maxHallucinationRate: 0.03,
          maxLatencyMs: 2500,
        },
        trainingProfile: {
          recommendedMethod: 'FEW_SHOT_WITH_EXAMPLES',
          canaryCohortPercent: 10,
          evaluationThresholdForPromotion: 0.90,
        },
      },

      // 7. RECRUITMENT AGENT (HR)
      {
        agentId: 'recruitment',
        name: 'Recruitment & Candidate Sourcing Agent',
        description: 'CV parsing, structured candidate profile extraction, JD requirement matching, and interview question generator.',
        version: '1.3.0',
        status: 'ACTIVE',
        lifecycleStage: 'PRODUCTION',
        domain: 'HR',
        service: 'hr',
        modelProvider: 'ollama',
        model: 'ollama/gemma4:e4b',
        systemInstructions: `You are the Recruitment and Candidate Screening Agent for Business OS.
You parse resumes, extract skills/experience, match candidates against Job Descriptions, and generate objective evaluation scorecards.
CRITICAL SAFETY DIRECTIVE:
You must NOT make autonomous hiring or rejection decisions. All candidate evaluations are advisory scorecards subject to human HR governance.`,
        businessRules: [
          'Autonomous final hiring or rejection decisions are strictly prohibited.',
          'Candidate extraction must remain objective, skill-grounded, and free from demographic bias.',
          'Missing requirements must be highlighted explicitly in the candidate scorecard.',
          'Interview question generation must directly address identified skill gaps.',
        ],
        allowedTools: [
          'search_knowledge_base',
          'create_crm_task',
          'add_crm_activity',
          'send_email',
          'book_calendar',
        ],
        knowledgeSources: ['hr_compliance_handbook', 'job_descriptions_catalog'],
        memoryPolicy: { anonymizeCandidatePIIAfterDays: 90 },
        approvalPolicy: { requireHumanReviewForCandidateProgression: true },
        resultSchema: {
          type: 'object',
          required: ['candidateName', 'matchScore', 'skillsMatched', 'skillsMissing', 'scorecardSummary', 'requiresHumanDecision'],
          properties: {
            candidateName: { type: 'string' },
            matchScore: { type: 'number', minimum: 0, maximum: 100 },
            skillsMatched: { type: 'array', items: { type: 'string' } },
            skillsMissing: { type: 'array', items: { type: 'string' } },
            scorecardSummary: { type: 'string' },
            suggestedInterviewQuestions: { type: 'array', items: { type: 'string' } },
            requiresHumanDecision: { type: 'boolean', default: true },
          },
        },
        evaluationProfile: {
          minCorrectness: 0.93,
          minGrounding: 0.96,
          minToolAccuracy: 0.92,
          maxHallucinationRate: 0.01,
          maxLatencyMs: 3000,
        },
        trainingProfile: {
          recommendedMethod: 'FEW_SHOT_STRUCTURED_OUTPUT',
          canaryCohortPercent: 10,
          evaluationThresholdForPromotion: 0.92,
        },
      },

      // 8. CUSTOMER SUPPORT AGENT
      {
        agentId: 'customer_support',
        name: 'Customer Support & SLA Sentinel',
        description: 'Ticket classification, knowledge retrieval response drafting, SLA monitoring, and escalation router.',
        version: '1.2.0',
        status: 'ACTIVE',
        lifecycleStage: 'PRODUCTION',
        domain: 'SUPPORT',
        service: 'helpdesk',
        modelProvider: 'groq',
        model: 'groq/compound',
        systemInstructions: `You are the Customer Support Agent for Business OS.
You classify support tickets, search company SOPs and documentation, draft polite and accurate replies, and escalate when out of scope.`,
        businessRules: [
          'Draft responses must be strictly grounded in verified Knowledge Base articles.',
          'Security or data loss issues must escalate immediately to Tier 3 human engineering.',
          'Replies must never promise roadmap features or unauthorized refunds.',
        ],
        allowedTools: [
          'search_knowledge_base',
          'reply_support_ticket',
          'create_crm_task',
          'add_crm_activity',
        ],
        knowledgeSources: ['customer_support_kb', 'sla_escalation_matrices'],
        memoryPolicy: { trackCustomerTicketHistory: true },
        approvalPolicy: { requireApprovalForPublicReplies: false, requireApprovalForEscalations: false },
        resultSchema: {
          type: 'object',
          required: ['ticketId', 'category', 'resolutionDraft', 'groundedSources', 'isEscalated'],
          properties: {
            ticketId: { type: 'string' },
            category: { type: 'string' },
            resolutionDraft: { type: 'string' },
            groundedSources: { type: 'array', items: { type: 'string' } },
            isEscalated: { type: 'boolean' },
          },
        },
        evaluationProfile: {
          minCorrectness: 0.90,
          minGrounding: 0.94,
          minToolAccuracy: 0.91,
          maxHallucinationRate: 0.02,
          maxLatencyMs: 2000,
        },
        trainingProfile: {
          recommendedMethod: 'PROMPT_AND_RAG',
          canaryCohortPercent: 10,
          evaluationThresholdForPromotion: 0.90,
        },
      },

      // 9. E-COMMERCE AGENT
      {
        agentId: 'ecommerce',
        name: 'E-Commerce & Merchandising Sentinel',
        description: 'Order event handling, VIP customer segment identification, inventory alerts, and loyalty outreach.',
        version: '1.0.0',
        status: 'ACTIVE',
        lifecycleStage: 'PRODUCTION',
        domain: 'ECOMMERCE',
        service: 'inventory',
        modelProvider: 'groq',
        model: 'groq/compound',
        systemInstructions: `You are the E-Commerce Agent for Business OS.
You process order events, identify VIP customers, recommend cross-sell opportunities, and flag critical inventory shortages.`,
        businessRules: [
          'Customers with lifetime value >$5,000 receive VIP concierge engagement.',
          'Products falling below reorder threshold must trigger automated inventory alerts.',
          'Never issue automated refunds without inventory return receipt verification.',
        ],
        allowedTools: [
          'search_crm_contacts',
          'create_crm_task',
          'add_crm_activity',
          'send_email',
          'send_whatsapp',
        ],
        knowledgeSources: ['merchandising_catalog', 'loyalty_program_rules'],
        memoryPolicy: { retainPurchaseHistoryYears: 3 },
        approvalPolicy: { requireApprovalForPromotions: true },
        resultSchema: {
          type: 'object',
          required: ['orderId', 'customerTier', 'actionsExecuted', 'inventoryStatus'],
          properties: {
            orderId: { type: 'string' },
            customerTier: { type: 'string' },
            actionsExecuted: { type: 'array', items: { type: 'string' } },
            inventoryStatus: { type: 'string' },
          },
        },
        evaluationProfile: {
          minCorrectness: 0.88,
          minGrounding: 0.90,
          minToolAccuracy: 0.91,
          maxHallucinationRate: 0.03,
          maxLatencyMs: 2500,
        },
        trainingProfile: {
          recommendedMethod: 'PROMPT_AND_RAG',
          canaryCohortPercent: 10,
          evaluationThresholdForPromotion: 0.88,
        },
      },

      // 10. CONTENT OPTIMIZATION AGENT
      {
        agentId: 'content',
        name: 'Content & Social Optimization Agent',
        description: 'Multi-channel content transformation, SEO copy adaptation, newsletter formatting, and brand tone compliance.',
        version: '1.1.0',
        status: 'ACTIVE',
        lifecycleStage: 'PRODUCTION',
        domain: 'MARKETING',
        service: 'cms',
        modelProvider: 'groq',
        model: 'groq/compound',
        systemInstructions: `You are the Content Optimization Agent for Business OS.
You repurpose source articles and product briefs into optimized LinkedIn posts, Twitter threads, newsletter snippets, and SEO meta copy.`,
        businessRules: [
          'Brand voice guidelines and forbidden terms must be strictly observed.',
          'Original facts and numbers from the source brief must not be altered.',
          'All social drafts must be queued for marketing editor review before publication.',
        ],
        allowedTools: [
          'search_knowledge_base',
          'add_crm_activity',
        ],
        knowledgeSources: ['brand_guidelines_2026', 'seo_playbook'],
        memoryPolicy: { retainCampaignHistory: true },
        approvalPolicy: { requireApprovalForSocialPublishing: true },
        resultSchema: {
          type: 'object',
          required: ['channelsGenerated', 'seoScore', 'drafts', 'requiresApproval'],
          properties: {
            channelsGenerated: { type: 'array', items: { type: 'string' } },
            seoScore: { type: 'number' },
            drafts: { type: 'object' },
            requiresApproval: { type: 'boolean', default: true },
          },
        },
        evaluationProfile: {
          minCorrectness: 0.91,
          minGrounding: 0.93,
          minToolAccuracy: 0.90,
          maxHallucinationRate: 0.02,
          maxLatencyMs: 3000,
        },
        trainingProfile: {
          recommendedMethod: 'FEW_SHOT_STYLE_ADAPTATION',
          canaryCohortPercent: 10,
          evaluationThresholdForPromotion: 0.90,
        },
      },
    ];
  }

  async seedAllAgents(): Promise<void> {
    const agents = this.getCanonicalAgentDefinitions();
    for (const def of agents) {
      await this.prisma.agentRegistryEntry.upsert({
        where: { agentId: def.agentId },
        update: {
          name: def.name,
          description: def.description,
          version: def.version,
          status: def.status,
          lifecycleStage: def.lifecycleStage,
          domain: def.domain,
          service: def.service,
          modelProvider: def.modelProvider,
          model: def.model,
          systemInstructions: def.systemInstructions,
          businessRules: JSON.stringify(def.businessRules),
          allowedTools: JSON.stringify(def.allowedTools),
          knowledgeSources: JSON.stringify(def.knowledgeSources),
          memoryPolicy: JSON.stringify(def.memoryPolicy),
          approvalPolicy: JSON.stringify(def.approvalPolicy),
          resultSchema: JSON.stringify(def.resultSchema),
          evaluationProfile: JSON.stringify(def.evaluationProfile),
          trainingProfile: JSON.stringify(def.trainingProfile),
        },
        create: {
          agentId: def.agentId,
          name: def.name,
          description: def.description,
          version: def.version,
          status: def.status,
          lifecycleStage: def.lifecycleStage,
          domain: def.domain,
          service: def.service,
          modelProvider: def.modelProvider,
          model: def.model,
          systemInstructions: def.systemInstructions,
          businessRules: JSON.stringify(def.businessRules),
          allowedTools: JSON.stringify(def.allowedTools),
          knowledgeSources: JSON.stringify(def.knowledgeSources),
          memoryPolicy: JSON.stringify(def.memoryPolicy),
          approvalPolicy: JSON.stringify(def.approvalPolicy),
          resultSchema: JSON.stringify(def.resultSchema),
          evaluationProfile: JSON.stringify(def.evaluationProfile),
          trainingProfile: JSON.stringify(def.trainingProfile),
        },
      });

      // Also ensure baseline production version record exists
      await this.prisma.agentVersion.upsert({
        where: {
          agentId_version: {
            agentId: def.agentId,
            version: def.version,
          },
        },
        update: {
          isCurrentProduction: true,
          status: 'PRODUCTION',
        },
        create: {
          agentId: def.agentId,
          version: def.version,
          changelog: 'Initial production baseline.',
          systemInstructions: def.systemInstructions,
          businessRules: JSON.stringify(def.businessRules),
          allowedTools: JSON.stringify(def.allowedTools),
          model: def.model,
          modelProvider: def.modelProvider,
          status: 'PRODUCTION',
          isCurrentProduction: true,
          approvedBy: 'SYSTEM_SUPERADMIN',
          approvedAt: new Date(),
        },
      });
    }
    this.logger.log(`Initialized Central Agent Registry with ${agents.length} production agents.`);
  }

  async listAgents() {
    const list = await this.prisma.agentRegistryEntry.findMany({
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        evaluations: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return list.map((a) => ({
      ...a,
      businessRules: JSON.parse(a.businessRules || '[]'),
      allowedTools: JSON.parse(a.allowedTools || '[]'),
      knowledgeSources: JSON.parse(a.knowledgeSources || '[]'),
      memoryPolicy: JSON.parse(a.memoryPolicy || '{}'),
      approvalPolicy: JSON.parse(a.approvalPolicy || '{}'),
      resultSchema: JSON.parse(a.resultSchema || '{}'),
      evaluationProfile: JSON.parse(a.evaluationProfile || '{}'),
      trainingProfile: JSON.parse(a.trainingProfile || '{}'),
      lastEvaluation: a.evaluations[0] || null,
    }));
  }

  async getAgent(agentId: string): Promise<any> {
    const agent = await this.prisma.agentRegistryEntry.findUnique({
      where: { agentId },
      include: {
        versions: { orderBy: { createdAt: 'desc' } },
        datasets: { orderBy: { updatedAt: 'desc' } },
        evaluations: { orderBy: { createdAt: 'desc' }, take: 10 },
        goldenScenarios: { where: { isActive: true } },
      },
    });

    if (!agent) {
      // Check fallback from canonical list
      const canonical = this.getCanonicalAgentDefinitions().find((a) => a.agentId === agentId);
      if (canonical) {
        await this.seedAllAgents();
        return this.getAgent(agentId);
      }
      throw new Error(`Agent with ID '${agentId}' not found in Central Agent Registry.`);
    }

    return {
      ...agent,
      businessRules: JSON.parse(agent.businessRules || '[]'),
      allowedTools: JSON.parse(agent.allowedTools || '[]'),
      knowledgeSources: JSON.parse(agent.knowledgeSources || '[]'),
      memoryPolicy: JSON.parse(agent.memoryPolicy || '{}'),
      approvalPolicy: JSON.parse(agent.approvalPolicy || '{}'),
      resultSchema: JSON.parse(agent.resultSchema || '{}'),
      evaluationProfile: JSON.parse(agent.evaluationProfile || '{}'),
      trainingProfile: JSON.parse(agent.trainingProfile || '{}'),
    };
  }

  async createAgentVersion(agentId: string, versionData: {
    version: string;
    changelog: string;
    systemInstructions?: string;
    businessRules?: string[];
    allowedTools?: string[];
    model?: string;
    modelProvider?: string;
  }) {
    const agent = await this.getAgent(agentId);

    const newVersion = await this.prisma.agentVersion.create({
      data: {
        agentId,
        version: versionData.version,
        changelog: versionData.changelog,
        systemInstructions: versionData.systemInstructions || agent.systemInstructions,
        businessRules: JSON.stringify(versionData.businessRules || agent.businessRules),
        allowedTools: JSON.stringify(versionData.allowedTools || agent.allowedTools),
        model: versionData.model || agent.model,
        modelProvider: versionData.modelProvider || agent.modelProvider,
        status: 'EXPERIMENTAL',
        isCurrentProduction: false,
      },
    });

    return newVersion;
  }

  async rollbackToVersion(agentId: string, targetVersion: string, user: string = 'SUPERADMIN') {
    const versionRecord = await this.prisma.agentVersion.findUnique({
      where: {
        agentId_version: { agentId, version: targetVersion },
      },
    });

    if (!versionRecord) {
      throw new Error(`Target version '${targetVersion}' for agent '${agentId}' does not exist.`);
    }

    // Set all other versions to not production
    await this.prisma.agentVersion.updateMany({
      where: { agentId },
      data: { isCurrentProduction: false },
    });

    // Mark target version as production
    await this.prisma.agentVersion.update({
      where: { id: versionRecord.id },
      data: {
        isCurrentProduction: true,
        status: 'PRODUCTION',
        approvedBy: user,
        approvedAt: new Date(),
      },
    });

    // Update main registry entry
    const updatedAgent = await this.prisma.agentRegistryEntry.update({
      where: { agentId },
      data: {
        version: versionRecord.version,
        systemInstructions: versionRecord.systemInstructions,
        businessRules: versionRecord.businessRules,
        allowedTools: versionRecord.allowedTools,
        model: versionRecord.model,
        modelProvider: versionRecord.modelProvider,
        lifecycleStage: 'PRODUCTION',
        status: 'ACTIVE',
      },
    });

    this.logger.log(`[Rollback] Agent ${agentId} rolled back to version ${targetVersion} by ${user}.`);

    return {
      success: true,
      agentId,
      currentVersion: updatedAgent.version,
      rolledBackAt: new Date().toISOString(),
    };
  }
}
