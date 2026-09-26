import { AgentOrchestratorService } from './agent-orchestrator.service';

describe('AgentOrchestratorService - Master AI Architecture', () => {
  let orchestrator: AgentOrchestratorService;
  let mockPrisma: any;
  let mockEventBus: any;
  let mockToolRegistry: any;
  let mockPolicyEngine: any;
  let mockMemoryGovernance: any;
  let mockKnowledgeService: any;
  let mockAudit: any;

  beforeEach(() => {
    mockPrisma = {
      deal: { findUnique: jest.fn().mockResolvedValue({ id: 'deal_1', title: 'Deal 1', amount: 35000, stage: 'Negotiation' }) },
      invoice: { findUnique: jest.fn().mockResolvedValue({ id: 'inv_1', amount: 12500, status: 'OVERDUE' }) },
      contact: { findUnique: jest.fn().mockResolvedValue({ id: 'cnt_1', email: 'john@example.com' }) },
      ticket: { findUnique: jest.fn().mockResolvedValue({ id: 'tkt_1', priority: 'URGENT', title: 'API outage' }) },
      project: { findUnique: jest.fn().mockResolvedValue({ id: 'prj_1', name: 'Cloud Migration' }) },
      transaction: { findUnique: jest.fn().mockResolvedValue({ id: 'txn_1', propertyAddress: '124 Market St' }) },
      customer: { findUnique: jest.fn().mockResolvedValue({ id: 'cst_1', name: 'Acme Corp' }) },
      order: { findUnique: jest.fn().mockResolvedValue({ id: 'ord_1', totalAmount: 499.0 }) },
      approvalRequest: {
        create: jest.fn().mockResolvedValue({ id: 'appr_1', reason: 'High-risk action' }),
        findFirst: jest.fn().mockResolvedValue({
          id: 'appr_1',
          agentId: 'agent_sales',
          actionType: 'send_email',
          targetEntity: 'Deal',
          targetId: 'deal_1',
          status: 'PENDING',
          reason: 'Discount exceeds threshold',
          payload: JSON.stringify({ parameters: { to: 'client@example.com', subject: 'Special discount' } }),
        }),
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn().mockResolvedValue({ id: 'appr_1', status: 'APPROVED' }),
      },
      toolExecution: {
        create: jest.fn().mockResolvedValue({ id: 'texec_1' }),
      },
      agentExecution: {
        create: jest.fn().mockImplementation((args) => Promise.resolve({ id: 'exec_1', ...args.data })),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit_1' }),
      },
      activity: {
        create: jest.fn().mockResolvedValue({ id: 'act_1' }),
      },
      agent: {
        findUnique: jest.fn().mockResolvedValue({ id: 'agent_midas', name: 'Midas' }),
      },
    };

    const mockContextEngine = {
      buildExecutionContext: jest.fn().mockResolvedValue({}),
      assembleContext: jest.fn().mockResolvedValue({
        systemPrompt: 'You are Midas',
        domainKnowledge: [],
        relevantMemories: [],
        entityContext: { invoiceId: 'inv_1' },
      }),
    };

    mockPolicyEngine = {
      evaluatePolicy: jest.fn().mockReturnValue({
        isAllowed: true,
        riskLevel: 'LOW',
        requiresApproval: false,
        reason: 'Autonomous action permitted within standard limits',
      }),
      evaluateAction: jest.fn().mockReturnValue({
        isAllowed: true,
        riskLevel: 'LOW',
        requiresHumanApproval: false,
        reason: 'Autonomous action permitted within standard limits',
        explainability: {
          why: ['Autonomous action permitted within standard limits'],
          confidence: 0.95,
        },
      }),
    };

    mockMemoryGovernance = {
      proposeMemory: jest.fn().mockResolvedValue({}),
    };

    const mockPlanService = {
      generatePlan: jest.fn().mockResolvedValue({
        id: 'plan_1',
        steps: [
          { id: 'step_1', action: 'add_crm_activity', parameters: { content: 'Sample activity' } },
        ],
      }),
      createPlan: jest.fn().mockImplementation((args) => ({
        id: 'plan_1',
        steps: args.steps || [
          { id: 'step_1', action: 'add_crm_activity', parameters: { content: 'Sample activity' } },
        ],
      })),
      updateStepStatus: jest.fn(),
    };

    mockToolRegistry = {
      executeTool: jest.fn().mockResolvedValue({ success: true, messageId: 'msg_101' }),
    };

    const mockPromptsService = {
      complete: jest.fn().mockResolvedValue('OK'),
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ decision: 'AUTONOMOUS_PASS', confidence: 0.95 }),
    }) as any;

    orchestrator = new AgentOrchestratorService(
      mockPrisma as any,
      mockContextEngine as any,
      mockPolicyEngine as any,
      mockMemoryGovernance as any,
      mockPlanService as any,
      mockToolRegistry as any,
      mockPromptsService as any,
    );
  });

  describe('1. 10/10 Agent Event Resolution Matrix', () => {
    it('resolves Lead Qualification Agent for inbound leads', () => {
      const res = orchestrator.resolveAgentForEvent('CONTACT_CREATED' as any, { id: 'lead_123' });
      expect(res.agentId).toBe('agent_lead_qualification');
      expect(res.targetEntity).toBe('Contact');
    });

    it('resolves Ares for deal pipeline events', () => {
      const res = orchestrator.resolveAgentForEvent('DEAL_STAGE_CHANGED' as any, { dealId: 'deal_456', stage: 'Proposal' });
      expect(res.agentId).toBe('agent_sales');
      expect(res.primaryAction).toBe('DRAFT_PROPOSAL_FOLLOWUP');
    });

    it('resolves Athena for customer health and churn events', () => {
      const res = orchestrator.resolveAgentForEvent('CUSTOMER_CHURN_RISK' as any, { customerId: 'cust_789' });
      expect(res.agentId).toBe('agent_csm');
      expect(res.domain).toBe('SUPPORT');
    });

    it('resolves Midas for overdue invoices and financial events', () => {
      const res = orchestrator.resolveAgentForEvent('INVOICE_OVERDUE' as any, { invoiceId: 'inv_999' });
      expect(res.agentId).toBe('agent_midas');
      expect(res.targetEntity).toBe('Invoice');
    });

    it('resolves Hermes for deal closed won onboarding', () => {
      const res = orchestrator.resolveAgentForEvent('DEAL_CLOSED_WON' as any, { dealId: 'deal_won_1' });
      expect(res.agentId).toBe('agent_ops');
      expect(res.primaryAction).toBe('INITIALIZE_CLIENT_ONBOARDING');
    });

    it('resolves Vesta for real estate escrow and contingency transactions', () => {
      const res = orchestrator.resolveAgentForEvent('ESCROW_CONTINGENCY_AUDIT', { transactionId: 'txn_escrow_1' });
      expect(res.agentId).toBe('agent_vesta');
      expect(res.domain).toBe('REALESTATE');
    });

    it('resolves Recruitment Agent for candidate applications', () => {
      const res = orchestrator.resolveAgentForEvent('CANDIDATE_APPLIED', { candidateId: 'cand_555' });
      expect(res.agentId).toBe('agent_recruitment');
      expect(res.domain).toBe('HR');
    });

    it('resolves E-Commerce Agent for online orders and refunds', () => {
      const res = orchestrator.resolveAgentForEvent('ORDER_REFUNDED', { orderId: 'ord_ref_1' });
      expect(res.agentId).toBe('agent_ecommerce');
      expect(res.domain).toBe('ECOMMERCE');
    });

    it('resolves Customer Support Agent for escalated support tickets', () => {
      const res = orchestrator.resolveAgentForEvent('TICKET_ESCALATED' as any, { ticketId: 'tkt_esc_1' });
      expect(res.agentId).toBe('agent_support');
      expect(res.domain).toBe('SUPPORT');
    });

    it('resolves Content Optimization Agent for campaign briefs and marketing workflows', () => {
      const res = orchestrator.resolveAgentForEvent('MARKETING_WORKFLOW_TRIGGER', { campaignId: 'cmp_spring_2026' });
      expect(res.agentId).toBe('agent_content');
      expect(res.domain).toBe('MARKETING');
    });
  });

  describe('2. Document Vault Dynamic Classification', () => {
    it('routes candidate CV in HR vault to Recruitment Agent', () => {
      const res = orchestrator.resolveAgentForEvent('DOCUMENT_UPLOADED', {
        service: 'hr',
        storageKey: 'vault/hr/resumes/john_doe_cv.pdf',
        documentId: 'doc_cv_1',
      });
      expect(res.agentId).toBe('agent_recruitment');
      expect(res.targetEntity).toBe('Candidate');
    });

    it('routes commercial bill in Finance vault to Midas Sentinel', () => {
      const res = orchestrator.resolveAgentForEvent('DOCUMENT_UPLOADED', {
        service: 'finance',
        storageKey: 'vault/finance/invoices/acme_invoice_1042.pdf',
        documentId: 'doc_inv_1',
      });
      expect(res.agentId).toBe('agent_midas');
      expect(res.targetEntity).toBe('Invoice');
    });

    it('routes property deed in Real Estate vault to Vesta Sentinel', () => {
      const res = orchestrator.resolveAgentForEvent('DOCUMENT_UPLOADED', {
        service: 'realestate',
        storageKey: 'vault/properties/transactions/deed_transfer.pdf',
        documentId: 'doc_deed_1',
      });
      expect(res.agentId).toBe('agent_vesta');
      expect(res.targetEntity).toBe('Transaction');
    });

    it('routes marketing article in CMS vault to Content Agent', () => {
      const res = orchestrator.resolveAgentForEvent('DOCUMENT_UPLOADED', {
        service: 'cms',
        storageKey: 'vault/cms/articles/q3_product_announcement.docx',
        documentId: 'doc_art_1',
      });
      expect(res.agentId).toBe('agent_content');
      expect(res.targetEntity).toBe('Content');
    });
  });

  describe('3. Human-In-The-Loop (HITL) Safety Gate & Execution', () => {
    it('executes tool and updates CRM activity when supervisor approves action', async () => {
      const result = await orchestrator.resumeApprovedAction('appr_1', 'tenant-test', 'cfo_sarah');

      expect(result.success).toBe(true);
      expect(mockToolRegistry.executeTool).toHaveBeenCalledWith(
        'tenant-test',
        'send_email',
        { to: 'client@example.com', subject: 'Special discount' },
      );
      expect(mockPrisma.approvalRequest.update).toHaveBeenCalledWith({
        where: { id: 'appr_1' },
        data: expect.objectContaining({
          status: 'APPROVED',
          reviewedBy: 'cfo_sarah',
        }),
      });
      expect(mockPrisma.activity.create).toHaveBeenCalled();
    });

    it('rejects action and registers feedback in agent memory governance', async () => {
      const result = await orchestrator.rejectApprovalAction(
        'appr_1',
        'tenant-test',
        'Do not offer more than 10% discount to this tier',
        'sales_director_mike',
      );

      expect(result.success).toBe(true);
      expect(mockPrisma.approvalRequest.update).toHaveBeenCalledWith({
        where: { id: 'appr_1' },
        data: expect.objectContaining({
          status: 'REJECTED',
          reviewedBy: 'sales_director_mike',
        }),
      });
      expect(mockMemoryGovernance.proposeMemory).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'SupervisorFeedback:send_email',
          value: expect.stringContaining('Do not offer more than 10%'),
        }),
      );
    });
  });

  describe('4. Universal Agent Execution Result & Output Architecture Contract', () => {
    it('executes full autonomous cycle and produces complete Universal AgentExecutionResult', async () => {
      const event = {
        type: 'INVOICE_OVERDUE',
        tenantId: 'tenant-enterprise',
        payload: { invoiceId: 'inv_1', amount: 12500 },
      };

      const res = await orchestrator.handleEvent(event as any);

      expect(res).toBeDefined();
      expect(res.status).toBe('EXECUTED_AUTONOMOUSLY');
      expect(res.universalStatus).toBe('SUCCESS');
      expect(res.executionResult).toBeDefined();

      const result = res.executionResult!;
      // 1. Universal Execution ID & Agent
      expect(result.id).toBeDefined();
      expect(result.executionId).toBeDefined();
      expect(result.agentId).toBe('agent_midas');
      expect(result.tenantId).toBe('tenant-enterprise');

      // 2. Separate Status from Business Outcome
      expect(result.outcome.status).toBe('SUCCESS');
      expect(result.outcome.code).toBe('REMINDER_SCHEDULED');
      expect(result.outcome.summary).toContain('Accounts receivable aging audited');

      // 3. Actions Recorded
      expect(result.actions).toHaveLength(1);
      expect(result.actions[0].actionType).toBe('add_crm_activity');
      expect(result.actions[0].status).toBe('SUCCESS');
      expect(result.actions[0].durationMs).toBeGreaterThanOrEqual(0);

      // 4. Outputs Recorded
      expect(result.outputs).toHaveLength(1);
      expect(result.outputs[0].type).toBe('STRUCTURED_DATA');
      expect(result.outputs[0].title).toBe('Result of add_crm_activity');

      // 5. Persistence Sync
      expect(mockPrisma.agentExecution.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: 'tenant-enterprise',
            agentId: 'agent_midas',
            status: 'SUCCESS',
            outcomeCode: 'REMINDER_SCHEDULED',
          }),
        }),
      );
      expect(mockPrisma.activity.create).toHaveBeenCalled();
      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });

    it('pauses on high-risk action and sets universal status to WAITING_APPROVAL', async () => {
      mockPolicyEngine.evaluateAction.mockReturnValue({
        isAllowed: true,
        riskLevel: 'HIGH',
        requiresHumanApproval: true,
        reason: 'Outbound email discount exceeds automated authority threshold',
        explainability: {
          why: ['Outbound email discount exceeds automated authority threshold'],
          confidence: 0.92,
        },
      });

      const event = {
        type: 'DEAL_STAGE_CHANGED',
        tenantId: 'tenant-sales-dept',
        payload: { dealId: 'deal_1', stage: 'Proposal' },
      };

      const res = await orchestrator.handleEvent(event as any);

      expect(res.status).toBe('QUEUED_FOR_APPROVAL');
      expect(res.universalStatus).toBe('WAITING_APPROVAL');
      expect(res.executionResult!.outcome.status).toBe('WAITING_APPROVAL');
      expect(res.executionResult!.humanReview!.required).toBe(true);
      expect(res.executionResult!.outputs[0].type).toBe('APPROVAL_REQUEST');
      expect(mockPrisma.approvalRequest.create).toHaveBeenCalled();
    });

    it('enforces multi-tenant isolation across execution queries', async () => {
      await orchestrator.getExecutions('tenant-isolated-1', { limit: 10 });
      expect(mockPrisma.agentExecution.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 'tenant-isolated-1',
          }),
        }),
      );
    });
  });
});
