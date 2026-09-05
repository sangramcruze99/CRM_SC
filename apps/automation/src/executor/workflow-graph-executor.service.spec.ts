import { WorkflowGraphExecutorService } from './workflow-graph-executor.service';
import { ApprovalService } from '../approvals/approval.service';

describe('WorkflowGraphExecutorService', () => {
  let executor: WorkflowGraphExecutorService;
  let mockApprovalsService: any;
  let mockPrisma: any;
  let mockWhatsAppCloud: any;

  beforeEach(() => {
    mockApprovalsService = {
      createApproval: jest.fn().mockResolvedValue({ id: 'appr-123' }),
      setResumeCallback: jest.fn(),
    };
    mockPrisma = {
      workflowExecution: {
        create: jest.fn().mockResolvedValue({ id: 'exec-test-1' }),
        findUnique: jest.fn().mockResolvedValue({ id: 'exec-test-1', contextData: '{}' }),
        update: jest.fn().mockResolvedValue({}),
      },
      workflowExecutionStep: {
        create: jest.fn().mockResolvedValue({ id: 'step-1' }),
      },
    };

    const mockBrowserAgent = {} as any;
    const mockConnectors = {} as any;
    mockWhatsAppCloud = {
      sendTextMessage: jest.fn().mockResolvedValue({ success: true, messageId: 'wa_msg_981' }),
    };
    const mockTwilioWhatsApp = {} as any;

    executor = new WorkflowGraphExecutorService(
      mockPrisma,
      mockApprovalsService as ApprovalService,
      mockBrowserAgent,
      mockConnectors,
      mockWhatsAppCloud,
      mockTwilioWhatsApp,
    );
  });

  it('should execute a deterministic linear workflow graph and record step logs', async () => {
    const nodes = [
      {
        id: 'trigger-1',
        type: 'crm:new_lead',
        data: {
          type: 'crm:new_lead',
          title: 'New Lead Ingested',
          config: {},
        },
      },
      {
        id: 'crm-update-1',
        type: 'crm:update_lead_score',
        data: {
          type: 'crm:update_lead_score',
          title: 'Update CRM Score',
          config: { score: 90 },
        },
      },
    ];

    const edges = [
      { id: 'e1-2', source: 'trigger-1', target: 'crm-update-1' },
    ];

    const result = await executor.executeGraph({
      workflowId: 'wf-test-1',
      tenantId: 'tenant-default',
      nodes,
      edges,
      triggerPayload: { leadId: 'lead-001', email: 'test@example.com' },
    });

    expect(result.status).toBe('SUCCESS');
    expect(result.stepsExecuted).toBe(2);
    expect(mockPrisma.workflowExecutionStep.create).toHaveBeenCalledTimes(2);
  });

  it('should evaluate conditional branching logic:if_else and take the correct edge', async () => {
    const nodes = [
      {
        id: 'trigger-1',
        type: 'crm:new_lead',
        data: {
          type: 'crm:new_lead',
          title: 'New Lead Ingested',
        },
      },
      {
        id: 'branch-1',
        type: 'logic:if_else',
        data: {
          type: 'logic:if_else',
          title: 'High Value Lead Check',
          config: { field: 'score', operator: 'GREATER_THAN', value: 50 },
        },
      },
      {
        id: 'action-vip',
        type: 'comm:whatsapp',
        data: {
          type: 'comm:whatsapp',
          title: 'VIP Instant Concierge',
        },
      },
      {
        id: 'action-standard',
        type: 'comm:email',
        data: {
          type: 'comm:email',
          title: 'Standard Email Nurture',
        },
      },
    ];

    const edges = [
      { id: 'e1', source: 'trigger-1', target: 'branch-1' },
      { id: 'e-true', source: 'branch-1', target: 'action-vip', sourceHandle: 'true' },
      { id: 'e-false', source: 'branch-1', target: 'action-standard', sourceHandle: 'false' },
    ];

    // Case 1: Score 80 (> 50) -> should take true branch to WhatsApp
    const resHigh = await executor.executeGraph({
      workflowId: 'wf-test-branch',
      tenantId: 'tenant-default',
      nodes,
      edges,
      triggerPayload: { score: 80 },
    });

    expect(resHigh.status).toBe('SUCCESS');
    expect(resHigh.stepsExecuted).toBe(3);
    expect(mockWhatsAppCloud.sendTextMessage).toHaveBeenCalled();

    // Reset mock
    mockWhatsAppCloud.sendTextMessage.mockClear();

    // Case 2: Score 30 (<= 50) -> should take false branch to Email
    const resLow = await executor.executeGraph({
      workflowId: 'wf-test-branch',
      tenantId: 'tenant-default',
      nodes,
      edges,
      triggerPayload: { score: 30 },
    });

    expect(resLow.status).toBe('SUCCESS');
    expect(resLow.stepsExecuted).toBe(3);
    expect(mockWhatsAppCloud.sendTextMessage).not.toHaveBeenCalled();
  });

  it('should pause workflow execution when encountering a high-risk approval node', async () => {
    const nodes = [
      {
        id: 'trigger-1',
        type: 'crm:deal_stage_changed',
        data: {
          type: 'crm:deal_stage_changed',
          title: 'Deal Moved to Proposal',
        },
      },
      {
        id: 'approval-1',
        type: 'hitl:approval',
        data: {
          type: 'hitl:approval',
          title: 'VP Sales Deal Approval',
          riskLevel: 'HIGH',
          config: { reason: 'Deal amount exceeds $25,000 threshold' },
        },
      },
      {
        id: 'send-contract',
        type: 'doc:generate_contract',
        data: {
          type: 'doc:generate_contract',
          title: 'Generate PDF Contract',
        },
      },
    ];

    const edges = [
      { id: 'e1', source: 'trigger-1', target: 'approval-1' },
      { id: 'e2', source: 'approval-1', target: 'send-contract' },
    ];

    const result = await executor.executeGraph({
      workflowId: 'wf-approval-test',
      tenantId: 'tenant-default',
      nodes,
      edges,
      triggerPayload: { dealId: 'deal-999', amount: 50000 },
    });

    expect(result.status).toBe('APPROVAL_REQUIRED');
    expect(mockApprovalsService.createApproval).toHaveBeenCalled();
  });
});
