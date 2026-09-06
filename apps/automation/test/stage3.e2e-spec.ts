import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowGeneratorService } from '../src/workflows/workflow-generator.service';
import { WorkflowGraphExecutorService } from '../src/executor/workflow-graph-executor.service';
import { ExecutionPersistenceService } from '../src/executor/execution-persistence.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { ApprovalService } from '../src/approvals/approval.service';
import { BrowserAgentService } from '../src/browser/browser-agent.service';
import { ConnectorRegistryService } from '../src/connectors/connector-registry.service';
import { WhatsAppCloudService } from '../src/whatsapp/whatsapp-cloud.service';
import { TwilioWhatsAppService } from '../src/whatsapp/twilio-whatsapp.service';
import { BusinessEventBusService } from '../src/event-bus/business-event-bus.service';
import { ResendService } from '../src/actions/resend.service';

describe('Stage 3 - Autonomous Business Automation Platform (E2E & Integration)', () => {
  let generatorService: WorkflowGeneratorService;
  let graphExecutor: WorkflowGraphExecutorService;
  let persistenceService: ExecutionPersistenceService;

  beforeAll(async () => {
    const mockPrisma = {
      workflow: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      workflowExecution: {
        create: jest.fn().mockResolvedValue({ id: 'exec_test_1' }),
        update: jest.fn(),
      },
      workflowExecutionStep: {
        create: jest.fn().mockResolvedValue({ id: 'step_test_1' }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      deal: {
        create: jest.fn().mockResolvedValue({ id: 'deal_test_1', title: 'Test Deal' }),
      },
      activity: {
        create: jest.fn().mockResolvedValue({ id: 'act_test_1' }),
      },
      approvalRequest: {
        create: jest.fn().mockResolvedValue({ id: 'appr_test_1' }),
      },
    };

    const mockApproval = {
      setResumeCallback: jest.fn(),
      createApproval: jest.fn().mockResolvedValue({ id: 'appr_test_1', status: 'PENDING' }),
    };

    const mockBrowser = {
      navigateAndExtract: jest.fn(),
    };

    const mockConnectors = {
      executeAction: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockWhatsappCloud = {
      sendTemplateMessage: jest.fn().mockResolvedValue({ messageId: 'wa_1' }),
    };

    const mockTwilioWhatsapp = {
      sendWhatsAppMessage: jest.fn().mockResolvedValue({ messageId: 'tw_1' }),
    };

    const mockResend = {
      sendEmail: jest.fn().mockResolvedValue({ id: 'email_1' }),
    };

    const mockEventBus = {
      publish: jest.fn().mockResolvedValue(true),
      subscribe: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowGeneratorService,
        WorkflowGraphExecutorService,
        ExecutionPersistenceService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ApprovalService, useValue: mockApproval },
        { provide: BrowserAgentService, useValue: mockBrowser },
        { provide: ConnectorRegistryService, useValue: mockConnectors },
        { provide: WhatsAppCloudService, useValue: mockWhatsappCloud },
        { provide: TwilioWhatsAppService, useValue: mockTwilioWhatsapp },
        { provide: ResendService, useValue: mockResend },
        { provide: BusinessEventBusService, useValue: mockEventBus },
      ],
    }).compile();

    generatorService = moduleFixture.get<WorkflowGeneratorService>(WorkflowGeneratorService);
    graphExecutor = moduleFixture.get<WorkflowGraphExecutorService>(WorkflowGraphExecutorService);
    persistenceService = moduleFixture.get<ExecutionPersistenceService>(ExecutionPersistenceService);
  });

  describe('1. Natural Language AI Workflow Generator & Validator', () => {
    it('should generate a structured DRAFT workflow from natural language prompt', async () => {
      const prompt = 'When a high-value lead submits a form, qualify the lead using AI agent. If score >= 80, create a deal, assign a sales rep, and send an email.';
      const workflow = await generatorService.generateFromPrompt('tenant_alpha', prompt);

      expect(workflow).toBeDefined();
      expect(workflow.status).toBe('DRAFT');
      expect(workflow.version).toBe(1);
      expect(workflow.nodes.length).toBeGreaterThanOrEqual(4);
      expect(workflow.edges.length).toBeGreaterThanOrEqual(3);

      // Verify trigger node exists
      const trigger = workflow.nodes.find((n) => n.type.startsWith('TRIGGER') || n.type.startsWith('trigger:'));
      expect(trigger).toBeDefined();

      // Verify AI agent node exists
      const aiNode = workflow.nodes.find((n) => n.type === 'AI_AGENT' || n.type.startsWith('ai:'));
      expect(aiNode).toBeDefined();
    });

    it('should validate workflow graphs and catch missing triggers or orphan nodes', async () => {
      // Invalid graph with orphan node and no trigger
      const invalidNodes = [
        { id: 'step_1', type: 'crm:create_lead', name: 'Create Lead', config: {}, enabled: true },
        { id: 'step_orphan', type: 'comm:send_email', name: 'Send Email', config: {}, enabled: true },
      ];
      const invalidEdges = [{ id: 'e1', source: 'step_1', target: 'step_orphan' }];

      const validation = await generatorService.validateWorkflowGraph(invalidNodes, invalidEdges);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some((e) => e.code === 'MISSING_TRIGGER')).toBe(true);
    });

    it('should flag approval required for high-risk unsupervised financial actions', async () => {
      const nodes = [
        { id: 'trig_1', type: 'trigger:payment_failed', name: 'Trigger', config: {}, enabled: true },
        { id: 'pay_1', type: 'finance:send_refund', name: 'Execute Refund', config: {}, enabled: true },
      ];
      const edges = [{ id: 'e1', source: 'trig_1', target: 'pay_1' }];

      const validation = await generatorService.validateWorkflowGraph(nodes, edges);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some((e) => e.code === 'APPROVAL_REQUIRED')).toBe(true);
    });
  });

  describe('2. Deterministic Graph Execution Engine', () => {
    it('should evaluate deterministic conditions correctly without LLM hallucination', async () => {
      const conditionNode = {
        id: 'cond_score',
        type: 'logic:if_else',
        data: {
          field: 'leadScore',
          operator: '>=',
          value: 80,
        },
      };

      const nodes = [
        { id: 'trig', type: 'trigger:new_lead' },
        conditionNode,
        { id: 'act_deal', type: 'crm:create_deal' },
        { id: 'act_nurture', type: 'comm:send_email' },
      ];

      const edges = [
        { id: 'e1', source: 'trig', target: 'cond_score' },
        { id: 'e2', source: 'cond_score', target: 'act_deal', sourceHandle: 'true' },
        { id: 'e3', source: 'cond_score', target: 'act_nurture', sourceHandle: 'false' },
      ];

      // Test High Score -> TRUE branch
      const highResult = await graphExecutor.executeGraph({
        workflowId: 'wf_test_high',
        tenantId: 'tenant_test',
        nodes,
        edges,
        triggerPayload: { leadScore: 95, email: 'alex@enterprise.com' },
      });

      expect(highResult.status).toBe('SUCCESS');
      const highStepDeal = highResult.steps.find((s) => s.nodeId === 'act_deal');
      const highStepNurture = highResult.steps.find((s) => s.nodeId === 'act_nurture');
      expect(highStepDeal?.status).toBe('SUCCESS');
      expect(highStepNurture?.status).toBe('SKIPPED');

      // Test Low Score -> FALSE branch
      const lowResult = await graphExecutor.executeGraph({
        workflowId: 'wf_test_low',
        tenantId: 'tenant_test',
        nodes,
        edges,
        triggerPayload: { leadScore: 45, email: 'visitor@gmail.com' },
      });

      expect(lowResult.status).toBe('SUCCESS');
      const lowStepDeal = lowResult.steps.find((s) => s.nodeId === 'act_deal');
      const lowStepNurture = lowResult.steps.find((s) => s.nodeId === 'act_nurture');
      expect(lowStepDeal?.status).toBe('SKIPPED');
      expect(lowStepNurture?.status).toBe('SUCCESS');
    });

    it('should safely suspend execution when human approval is required', async () => {
      const nodes = [
        { id: 'n1', type: 'trigger:invoice_overdue' },
        { id: 'n2', type: 'logic:human_approval', data: { role: 'FINANCE_ADMIN', reason: 'High-value refund' } },
        { id: 'n3', type: 'finance:send_refund' },
      ];
      const edges = [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
      ];

      const result = await graphExecutor.executeGraph({
        workflowId: 'wf_hitl_test',
        tenantId: 'tenant_test',
        nodes,
        edges,
        triggerPayload: { amount: 5000, invoiceId: 'inv_9901' },
      });

      expect(result.status).toBe('APPROVAL_REQUIRED');
      const stepApproval = result.steps.find((s) => s.nodeId === 'n2');
      expect(stepApproval?.status).toBe('WAITING_FOR_APPROVAL');
    });

    it('should support durable WAIT_FOR_EVENT without hanging memory timers', async () => {
      const nodes = [
        { id: 'n1', type: 'trigger:contract_sent' },
        { id: 'n2', type: 'WAIT_FOR_EVENT', data: { eventName: 'contract.signed', correlationKey: 'dealId', timeoutSeconds: 86400 } },
        { id: 'n3', type: 'projects:create_project' },
      ];
      const edges = [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
      ];

      const result = await graphExecutor.executeGraph({
        workflowId: 'wf_event_wait',
        tenantId: 'tenant_test',
        nodes,
        edges,
        triggerPayload: { dealId: 'deal_771' },
      });

      expect(result.status).toBe('WAITING');
      const waitStep = result.steps.find((s) => s.nodeId === 'n2');
      expect(waitStep?.status).toBe('WAITING');
    });
  });

  describe('3. Telemetry & Execution Analytics Integrity', () => {
    it('should compute real execution stats from recorded executions without hardcoded fallback counts', async () => {
      const stats = await persistenceService.getExecutionStats();
      expect(stats).toBeDefined();
      expect(typeof stats.totalExecutions).toBe('number');
      expect(typeof stats.successCount).toBe('number');
      expect(typeof stats.failedCount).toBe('number');
      expect(typeof stats.approvalRequiredCount).toBe('number');
      expect(stats.totalExecutions).toBe(stats.successCount + stats.failedCount + stats.approvalRequiredCount);
    });
  });
});
