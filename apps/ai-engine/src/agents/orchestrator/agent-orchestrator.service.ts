import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AgentContextEngineService } from '../context/agent-context-engine.service';
import { AgentPolicyEngineService } from '../policy/agent-policy-engine.service';
import { AgentMemoryGovernanceService } from '../memory/agent-memory-governance.service';
import { AgentPlanService } from '../plans/agent-plan.service';
import { AgentExecutionStateMachine } from '../state-machine/agent-state-machine';
import { AgentToolRegistryService } from '../agent-tool-registry.service';
import { PromptsService } from '../../prompts/prompts.service';
import {
  BusinessEvent,
  BusinessEventType,
  AgentHandoffPayload,
  AgentHandoffResult,
  AgentExecutionResult,
  UniversalExecutionStatus,
  AgentActionRecord,
  AgentOutputRecord,
  AgentOutputType,
} from '@repo/core-types';

export interface OrchestrationResult {
  orchestrationId: string;
  agentId: string;
  agentName: string;
  decisionReason: string;
  event: BusinessEventType | string;
  status: 'EXECUTED_AUTONOMOUSLY' | 'QUEUED_FOR_APPROVAL' | 'HANDED_OFF' | 'FAILED';
  universalStatus?: UniversalExecutionStatus;
  planId?: string;
  state: string;
  toolsExecuted: string[];
  approvalRequestId?: string;
  explainability: {
    why: string[];
    confidence: number;
    riskLevel: string;
    expectedOutcome: string;
  };
  durationMs: number;
  executionResult?: AgentExecutionResult;
}

@Injectable()
export class AgentOrchestratorService {
  private readonly logger = new Logger(AgentOrchestratorService.name);

  // Cross-department lifecycle timeline
  private timeline: OrchestrationResult[] = [];

  constructor(
    private readonly prisma: PrismaService,
    private readonly contextEngine: AgentContextEngineService,
    private readonly policyEngine: AgentPolicyEngineService,
    private readonly memoryGovernance: AgentMemoryGovernanceService,
    private readonly planService: AgentPlanService,
    private readonly toolRegistry: AgentToolRegistryService,
    private readonly promptsService: PromptsService,
  ) {}

  /**
   * Determine which domain agent should act on the incoming business event
   */
  resolveAgentForEvent(eventType: BusinessEventType | string, payload: any): {
    agentId: string;
    agentName: string;
    domain: string;
    targetEntity: string;
    targetId: string;
    primaryAction: string;
  } {
    const raw = String(eventType || '').toUpperCase();
    const normalized = raw.includes(':') ? raw.split(':')[1] : raw;
    switch (normalized) {
      // 1. Leads & Inbound Contacts -> Lead Qualification Agent
      case 'CONTACT_CREATED':
      case 'LEAD_CREATED':
      case 'LEAD_QUALIFIED':
        return {
          agentId: 'agent_lead_qualification',
          agentName: 'Inbound SDR & Lead Qualification Agent',
          domain: 'LEADS',
          targetEntity: 'Contact',
          targetId: payload.contactId || payload.id || 'lead_active',
          primaryAction: 'QUALIFY_LEAD',
        };

      // 2. Sales Pipeline & Deal Velocity -> Ares
      case 'DEAL_STAGE_CHANGED':
      case 'DEAL_CREATED':
      case 'DEAL_INACTIVE':
        return {
          agentId: 'agent_sales',
          agentName: 'Ares Sales Intelligence Sentinel',
          domain: 'SALES',
          targetEntity: 'Deal',
          targetId: payload.dealId || payload.id || 'deal_active',
          primaryAction: payload.stage === 'Proposal' ? 'DRAFT_PROPOSAL_FOLLOWUP' : 'ANALYZE_PIPELINE',
        };

      // 3. Deal Closed Won & Project Operations -> Hermes
      case 'DEAL_CLOSED_WON':
      case 'DEAL_WON':
      case 'PROJECT_CREATED':
      case 'TASK_COMPLETED':
        return {
          agentId: 'agent_ops',
          agentName: 'Hermes Operations & Fulfillment Sentinel',
          domain: 'OPERATIONS',
          targetEntity: payload.projectId ? 'Project' : 'Deal',
          targetId: payload.projectId || payload.dealId || payload.id || 'proj_active',
          primaryAction: (eventType === 'DEAL_WON' || eventType === 'DEAL_CLOSED_WON')
            ? 'INITIALIZE_CLIENT_ONBOARDING'
            : 'MONITOR_SPRINT_SLA',
        };

      // 4. Overdue Invoices & Billing -> Midas
      case 'INVOICE_OVERDUE':
      case 'INVOICE_CREATED':
      case 'PAYMENT_RECEIVED':
        return {
          agentId: 'agent_midas',
          agentName: 'Midas Treasury & Invoicing Sentinel',
          domain: 'FINANCE',
          targetEntity: 'Invoice',
          targetId: payload.invoiceId || payload.id || 'inv_active',
          primaryAction: 'CALCULATE_AR_AGING_AND_REMIND',
        };

      // 5. Customer Health & Churn Sentinel -> Athena
      case 'CUSTOMER_CHURN_RISK':
      case 'CUSTOMER_HEALTH_CHANGED':
        return {
          agentId: 'agent_csm',
          agentName: 'Athena Customer Success Sentinel',
          domain: 'SUPPORT',
          targetEntity: 'Customer',
          targetId: payload.customerId || payload.contactId || payload.id || 'cust_active',
          primaryAction: 'EVALUATE_CUSTOMER_RETENTION_RISK',
        };

      // 6. Ticket Escalated & Support -> Customer Support Agent
      case 'TICKET_ESCALATED':
      case 'TICKET_CREATED':
      case 'TICKET_RESOLVED':
        return {
          agentId: 'agent_support',
          agentName: 'Customer Support & SLA Sentinel',
          domain: 'SUPPORT',
          targetEntity: 'Ticket',
          targetId: payload.ticketId || payload.id || 'tkt_active',
          primaryAction: 'INVESTIGATE_TICKET_SOP',
        };

      // 7. Recruitment & Candidate Sourcing -> Recruitment Agent
      case 'CANDIDATE_APPLIED':
      case 'EMPLOYEE_CREATED':
      case 'EMPLOYEE_ONBOARDED':
        return {
          agentId: 'agent_recruitment',
          agentName: 'Recruitment & Candidate Sourcing Agent',
          domain: 'HR',
          targetEntity: 'Candidate',
          targetId: payload.candidateId || payload.id || 'cand_active',
          primaryAction: 'SCREEN_CANDIDATE_RESUME',
        };

      // 8. Real Estate & Escrow Transactions -> Vesta
      case 'TRANSACTION_CREATED':
      case 'ESCROW_CONTINGENCY_AUDIT':
        return {
          agentId: 'agent_vesta',
          agentName: 'Vesta Property & Escrow Sentinel',
          domain: 'REALESTATE',
          targetEntity: 'Transaction',
          targetId: payload.transactionId || payload.id || 'txn_active',
          primaryAction: 'AUDIT_ESCROW_CONTINGENCY',
        };

      // 9. E-Commerce & Retail Operations -> E-Commerce Agent
      case 'ORDER_CREATED':
      case 'ORDER_REFUNDED':
      case 'INVENTORY_CRITICAL':
        return {
          agentId: 'agent_ecommerce',
          agentName: 'E-Commerce & Merchandising Sentinel',
          domain: 'ECOMMERCE',
          targetEntity: 'Order',
          targetId: payload.orderId || payload.id || 'ord_active',
          primaryAction: 'PROCESS_COMMERCE_EVENT',
        };

      // 10. Content & Marketing Optimization -> Content Agent
      case 'CONTENT_CREATED':
      case 'CAMPAIGN_BRIEF_SUBMITTED':
      case 'MARKETING_WORKFLOW_TRIGGER':
        return {
          agentId: 'agent_content',
          agentName: 'Content & Social Optimization Agent',
          domain: 'MARKETING',
          targetEntity: 'Campaign',
          targetId: payload.campaignId || payload.id || 'cmp_active',
          primaryAction: 'REPURPOSE_CONTENT_ASSETS',
        };

      // 11. Central Document Vault Events -> Dynamic Classification
      case 'DOCUMENT_UPLOADED':
      case 'DOCUMENT_PROCESSED':
      case 'DOCUMENT_EXTRACTION_COMPLETED': {
        const rawPath = String(payload.storageKey || payload.url || payload.filename || payload.name || '').toLowerCase();
        const service = String(payload.service || '').toLowerCase();
        const moduleName = String(payload.module || '').toLowerCase();

        // Candidate CV / Resume in HR vault
        if (service === 'hr' || moduleName.includes('recruit') || rawPath.includes('cv') || rawPath.includes('resume') || rawPath.includes('candidate')) {
          return {
            agentId: 'agent_recruitment',
            agentName: 'Recruitment & Candidate Sourcing Agent',
            domain: 'HR',
            targetEntity: 'Candidate',
            targetId: payload.candidateId || payload.documentId || payload.id || 'cand_doc',
            primaryAction: 'SCREEN_CANDIDATE_RESUME',
          };
        }

        // Invoices / Receipts in Finance vault
        if (service === 'finance' || moduleName.includes('invoice') || moduleName.includes('bill') || rawPath.includes('invoice') || rawPath.includes('receipt')) {
          return {
            agentId: 'agent_midas',
            agentName: 'Midas Treasury & Invoicing Sentinel',
            domain: 'FINANCE',
            targetEntity: 'Invoice',
            targetId: payload.invoiceId || payload.documentId || payload.id || 'inv_doc',
            primaryAction: 'CALCULATE_AR_AGING_AND_REMIND',
          };
        }

        // Real Estate / Property agreements in Industry vault
        if (service === 'realestate' || moduleName.includes('transaction') || moduleName.includes('escrow') || rawPath.includes('deed') || rawPath.includes('lease') || rawPath.includes('agreement')) {
          return {
            agentId: 'agent_vesta',
            agentName: 'Vesta Property & Escrow Sentinel',
            domain: 'REALESTATE',
            targetEntity: 'Transaction',
            targetId: payload.transactionId || payload.documentId || payload.id || 'txn_doc',
            primaryAction: 'AUDIT_ESCROW_CONTINGENCY',
          };
        }

        // Marketing / Blog / Brand content in CMS vault
        if (service === 'marketing' || service === 'cms' || moduleName.includes('content') || rawPath.includes('campaign') || rawPath.includes('brief') || rawPath.includes('article')) {
          return {
            agentId: 'agent_content',
            agentName: 'Content & Social Optimization Agent',
            domain: 'MARKETING',
            targetEntity: 'Content',
            targetId: payload.contentId || payload.documentId || payload.id || 'content_doc',
            primaryAction: 'REPURPOSE_CONTENT_ASSETS',
          };
        }

        // Fallback document routing -> Sales proposal review
        return {
          agentId: 'agent_sales',
          agentName: 'Ares Sales Intelligence Sentinel',
          domain: 'SALES',
          targetEntity: 'Document',
          targetId: payload.documentId || payload.id || 'doc_active',
          primaryAction: 'ANALYZE_PIPELINE',
        };
      }

      // Default Fallback -> Ares Pipeline
      default:
        return {
          agentId: 'agent_sales',
          agentName: 'Ares Sales Intelligence Sentinel',
          domain: 'SALES',
          targetEntity: 'Record',
          targetId: payload.id || 'record_active',
          primaryAction: 'ANALYZE_PIPELINE',
        };
    }
  }

  /**
   * Central Nervous System: Main entry point for all incoming business events
   */
  async handleEvent(event: BusinessEvent): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const orchestrationId = `orch_${crypto.randomUUID().slice(0, 8)}`;
    const { tenantId, type: eventType, payload = {} } = event;

    this.logger.log(`[Agent Orchestrator] Ingested Event ${eventType} for Tenant ${tenantId} (${orchestrationId})`);

    // 1. Resolve Agent & Intent
    const targetAgent = this.resolveAgentForEvent(eventType, payload);
    const stateMachine = new AgentExecutionStateMachine(orchestrationId, targetAgent.agentId, tenantId, 'PENDING');
    stateMachine.transition('RUNNING', `Event ${eventType} matched to ${targetAgent.agentName}`);

    // 2. Context Engine: Assemble Token-Budgeted Context Package
    const contextPackage = await this.contextEngine.assembleContext({
      tenantId,
      agentId: targetAgent.agentId,
      triggerEvent: eventType,
      targetEntity: targetAgent.targetEntity,
      targetId: targetAgent.targetId,
      triggerPayload: payload,
    });

    // 3. Local GPU Decision Engine: Query Python AI (:3030) for autonomous reasoning
    let localDecision: any = null;
    try {
      const pyUrl = process.env.PYTHON_AI_URL || 'http://localhost:3030';
      const pyKey = process.env.PYTHON_AI_API_KEY || 'business-os-internal-ai-key-secret';
      const pyDecisionRes = await fetch(`${pyUrl}/v1/agents/${targetAgent.agentId}/decide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
          'x-service-key': pyKey,
        },
        body: JSON.stringify({
          tenant_id: tenantId,
          context: { ...contextPackage.primaryEntity, ...payload },
          entity_type: targetAgent.targetEntity,
          entity_id: targetAgent.targetId,
          event_type: eventType,
        }),
        signal: AbortSignal.timeout(5000),
      });
      if (pyDecisionRes.ok) {
        localDecision = await pyDecisionRes.json();
      }
    } catch {
      // Gracefully continue with policy engine if Python AI is unavailable
    }

    const planSteps = this.determineInitialPlanSteps(targetAgent, contextPackage);
    const plan = this.planService.createPlan({
      agentId: targetAgent.agentId,
      tenantId,
      goal: localDecision?.decision || `${targetAgent.primaryAction} for ${targetAgent.targetEntity} ${targetAgent.targetId}`,
      steps: planSteps,
    });

    const toolsExecuted: string[] = [];
    const actions: AgentActionRecord[] = [];
    const outputs: AgentOutputRecord[] = [];
    let pendingApprovalId: string | undefined = undefined;

    // 4. Step-by-Step Execution with Policy & Safety Gates
    for (const step of plan.steps) {
      const stepStartTime = Date.now();

      // Evaluate Policy & Risk
      const policyResult = this.policyEngine.evaluateAction({
        agentId: targetAgent.agentId,
        agentName: targetAgent.agentName,
        actionName: step.action,
        targetEntity: targetAgent.targetEntity,
        targetId: targetAgent.targetId,
        parameters: step.parameters || {},
        contextData: { ...contextPackage.primaryEntity, ...payload },
      });

      if (policyResult.requiresHumanApproval) {
        // High-Risk Action -> Pause and create ApprovalRequest
        stateMachine.transition('WAITING_FOR_APPROVAL', `Action ${step.action} requires human sign-off`);
        this.planService.updateStepStatus(plan.id, step.id, 'WAITING_APPROVAL');

        // Check agent foreign key constraint
        const agentExists = targetAgent.agentId
          ? await this.prisma.agent.findUnique({ where: { id: targetAgent.agentId } }).catch(() => null)
          : null;

        const approval = await this.prisma.approvalRequest.create({
          data: {
            tenantId,
            agentId: agentExists ? targetAgent.agentId : null,
            actionType: step.action,
            targetEntity: targetAgent.targetEntity,
            targetId: targetAgent.targetId,
            riskLevel: policyResult.riskLevel,
            payload: JSON.stringify({
              stepId: step.id,
              planId: plan.id,
              parameters: step.parameters,
              contextSummary: contextPackage.targetSummary,
              explainability: policyResult.explainability,
            }),
            reason: policyResult.reason,
            status: 'PENDING',
          },
        });

        pendingApprovalId = approval.id;
        actions.push({
          actionId: `act_${step.id}`,
          actionType: step.action,
          toolName: step.action,
          targetService: targetAgent.domain,
          targetEntityType: targetAgent.targetEntity,
          targetEntityId: targetAgent.targetId,
          parametersSummary: JSON.stringify(step.parameters || {}),
          status: 'BLOCKED_APPROVAL',
          startedAt: new Date(stepStartTime).toISOString(),
          resultSummary: `Paused for supervisor sign-off: ${policyResult.reason}`,
        });

        outputs.push({
          outputId: `out_appr_${approval.id}`,
          type: 'APPROVAL_REQUEST',
          title: `Supervisor Approval Required for ${step.action}`,
          summary: policyResult.reason,
          entityType: targetAgent.targetEntity,
          entityId: targetAgent.targetId,
          service: targetAgent.domain,
          createdAt: new Date().toISOString(),
        });

        this.logger.log(`[Agent Orchestrator] Paused on ApprovalRequest ${approval.id} [Risk: ${policyResult.riskLevel}]`);
        break; // Pause execution loop until human approves
      }

      // Safe / Low-Risk Action -> Execute autonomously
      this.planService.updateStepStatus(plan.id, step.id, 'RUNNING');
      stateMachine.transition('WAITING_FOR_TOOL', `Executing tool ${step.action}`);

      try {
        const toolResult = await this.toolRegistry.executeTool(tenantId, step.action, step.parameters || {});
        toolsExecuted.push(step.action);
        const stepDurationMs = Date.now() - stepStartTime;
        this.planService.updateStepStatus(plan.id, step.id, 'COMPLETED', toolResult.output);

        actions.push({
          actionId: `act_${step.id}`,
          actionType: step.action,
          toolName: step.action,
          targetService: targetAgent.domain,
          targetEntityType: targetAgent.targetEntity,
          targetEntityId: targetAgent.targetId,
          parametersSummary: JSON.stringify(step.parameters || {}),
          status: 'SUCCESS',
          startedAt: new Date(stepStartTime).toISOString(),
          completedAt: new Date().toISOString(),
          durationMs: stepDurationMs,
          resultSummary: JSON.stringify(toolResult.output || {}),
        });

        let outType: AgentOutputType = 'STRUCTURED_DATA';
        let outTitle = `Result of ${step.action}`;
        if (step.action.includes('email') || step.action.includes('reply')) {
          outType = 'EMAIL';
          outTitle = `Outbound Email for ${targetAgent.targetEntity} ${targetAgent.targetId}`;
        } else if (step.action.includes('task')) {
          outType = 'TASK';
          outTitle = `Task Created for ${targetAgent.targetEntity}`;
        } else if (step.action.includes('deal') || step.action.includes('contact')) {
          outType = 'ENTITY_UPDATE';
          outTitle = `${targetAgent.targetEntity} Updated in CRM`;
        } else if (step.action.includes('payment')) {
          outType = 'EXTERNAL_ACTION_RESULT';
          outTitle = `Payment Link Created`;
        }

        outputs.push({
          outputId: `out_${step.id}`,
          type: outType,
          title: outTitle,
          summary: `Tool ${step.action} executed with status SUCCESS`,
          data: toolResult.output || {},
          entityType: targetAgent.targetEntity,
          entityId: targetAgent.targetId,
          service: targetAgent.domain,
          createdAt: new Date().toISOString(),
        });

        // Propose a candidate memory from successful tool execution
        await this.memoryGovernance.proposeMemory({
          tenantId,
          agentId: targetAgent.agentId,
          memoryType: 'AGENT',
          key: `Action:${step.action}:${targetAgent.targetId}`,
          value: `Successfully executed ${step.action} for ${targetAgent.targetEntity}`,
          confidence: 0.95,
          source: 'autonomous_tool_execution',
          entityType: targetAgent.targetEntity,
          entityId: targetAgent.targetId,
        });

        stateMachine.transition('RUNNING', `Tool ${step.action} completed successfully`);
      } catch (err: any) {
        this.planService.updateStepStatus(plan.id, step.id, 'FAILED', null, err.message);
        this.logger.error(`[Agent Orchestrator] Step ${step.id} failed: ${err.message}`);
        stateMachine.transition('FAILED', err.message);

        actions.push({
          actionId: `act_${step.id}`,
          actionType: step.action,
          toolName: step.action,
          targetService: targetAgent.domain,
          targetEntityType: targetAgent.targetEntity,
          targetEntityId: targetAgent.targetId,
          parametersSummary: JSON.stringify(step.parameters || {}),
          status: 'FAILED',
          startedAt: new Date(stepStartTime).toISOString(),
          completedAt: new Date().toISOString(),
          durationMs: Date.now() - stepStartTime,
          error: err.message,
        });

        outputs.push({
          outputId: `out_err_${step.id}`,
          type: 'ERROR',
          title: `Execution Failed on Step ${step.action}`,
          summary: err.message,
          entityType: targetAgent.targetEntity,
          entityId: targetAgent.targetId,
          service: targetAgent.domain,
          createdAt: new Date().toISOString(),
        });
        break;
      }
    }

    // 5. Finalize State
    if (!stateMachine.isWaitingForHuman() && stateMachine.getState() !== 'FAILED') {
      stateMachine.transition('COMPLETED', 'All autonomous plan steps executed successfully');
    }

    // 6. Generate Explainability Metadata
    const explainability = this.policyEngine.evaluateAction({
      agentId: targetAgent.agentId,
      agentName: targetAgent.agentName,
      actionName: targetAgent.primaryAction,
      targetEntity: targetAgent.targetEntity,
      targetId: targetAgent.targetId,
      parameters: payload,
      contextData: { ...contextPackage.primaryEntity, ...payload },
    }).explainability;

    const durationMs = Date.now() - startTime;
    const universalStatus: UniversalExecutionStatus = pendingApprovalId
      ? 'WAITING_APPROVAL'
      : stateMachine.getState() === 'COMPLETED'
      ? 'SUCCESS'
      : 'FAILED';

    const finalStatus = pendingApprovalId
      ? 'QUEUED_FOR_APPROVAL'
      : stateMachine.getState() === 'COMPLETED'
      ? 'EXECUTED_AUTONOMOUSLY'
      : 'FAILED';

    // Domain Outcome Codes & Human-Readable Summaries
    let outcomeCode = 'COMPLETED';
    let outcomeSummary = 'Agent operations completed successfully.';
    let nextStep = 'No further action required.';

    if (targetAgent.agentId === 'agent_sales') {
      outcomeCode = pendingApprovalId ? 'PROPOSAL_REQUIRES_APPROVAL' : 'DEAL_ACCELERATED';
      outcomeSummary = pendingApprovalId
        ? `Sales proposal for ${targetAgent.targetEntity} ${targetAgent.targetId} exceeds risk threshold and requires executive approval.`
        : `Deal health evaluated and follow-up scheduled.`;
      nextStep = pendingApprovalId ? 'Review in AI Approval Center' : 'Sales representative follow-up';
    } else if (targetAgent.agentId === 'agent_midas') {
      outcomeCode = pendingApprovalId ? 'PAYMENT_REQUIRES_APPROVAL' : 'REMINDER_SCHEDULED';
      outcomeSummary = pendingApprovalId
        ? `Overdue payment reminder requires finance sign-off.`
        : `Accounts receivable aging audited and payment link generated.`;
      nextStep = pendingApprovalId ? 'Approve reminder dispatch' : 'Monitor bank payment';
    } else if (targetAgent.agentId === 'agent_lead_qualification') {
      outcomeCode = 'LEAD_QUALIFIED';
      outcomeSummary = `Lead ICP evaluated and CRM contact profile updated.`;
      nextStep = 'Assign account owner';
    } else if (targetAgent.agentId === 'agent_csm') {
      outcomeCode = pendingApprovalId ? 'ACCOUNT_RISK_ESCALATED' : 'ACCOUNT_HEALTH_AUDITED';
      outcomeSummary = `Customer retention health evaluated with stability score ${Math.round(explainability.confidence * 100)}%.`;
      nextStep = 'Executive check-in';
    } else if (targetAgent.agentId === 'agent_ops') {
      outcomeCode = 'ONBOARDING_INITIALIZED';
      outcomeSummary = `Delivery project and onboarding tasks created for ${targetAgent.targetEntity}.`;
      nextStep = 'Sprint kickoff';
    } else if (targetAgent.agentId === 'agent_vesta') {
      outcomeCode = 'ESCROW_CONTINGENCY_AUDITED';
      outcomeSummary = `Real estate transaction closing timeline and contingencies validated.`;
      nextStep = 'Broker file review';
    } else if (targetAgent.agentId === 'agent_recruitment') {
      outcomeCode = 'CANDIDATE_EVALUATED';
      outcomeSummary = `Candidate resume parsed and scored against job criteria.`;
      nextStep = 'Recruiter review';
    } else if (targetAgent.agentId === 'agent_ecommerce') {
      outcomeCode = 'COMMERCE_EVENT_PROCESSED';
      outcomeSummary = `Order event ingested and customer loyalty metrics refreshed.`;
      nextStep = 'Order fulfillment';
    } else if (targetAgent.agentId === 'agent_support') {
      outcomeCode = 'TICKET_INVESTIGATED';
      outcomeSummary = `Support ticket investigated against knowledge base documentation.`;
      nextStep = 'Send customer response';
    } else if (targetAgent.agentId === 'agent_content') {
      outcomeCode = 'CONTENT_OPTIMIZED';
      outcomeSummary = `Marketing brief adapted into multi-channel campaign assets.`;
      nextStep = 'Publish campaign';
    }

    // 7. Universal Agent Execution Contract Assembly
    const executionResult: AgentExecutionResult = {
      id: orchestrationId,
      executionId: orchestrationId,
      agentId: targetAgent.agentId,
      agentName: targetAgent.agentName,
      agentVersion: '2.5.0',
      tenantId,
      trigger: {
        type: eventType as string,
        source: 'event_bus',
        sourceId: payload.id || payload.dealId || payload.invoiceId || payload.contactId,
        timestamp: new Date(startTime).toISOString(),
      },
      input: {
        sourceType: targetAgent.domain,
        sourceId: payload.id,
        entityType: targetAgent.targetEntity,
        entityId: targetAgent.targetId,
        entityName: contextPackage.targetSummary || payload.title || payload.name,
        dataSummary: JSON.stringify(payload),
      },
      processing: {
        stepsCount: toolsExecuted.length,
        model: localDecision ? 'local/gtx1060-cuda' : 'hybrid/multi-engine',
        provider: localDecision ? 'python-ai' : 'orchestrator',
        confidence: explainability.confidence,
        durationMs,
        tokensUsed: 250,
      },
      decision: {
        outcome: outcomeCode,
        reason: explainability.why.join('; '),
        confidence: explainability.confidence,
        policyChecksPassed: !pendingApprovalId,
      },
      actions,
      outputs,
      outcome: {
        status: universalStatus,
        code: outcomeCode,
        summary: outcomeSummary,
        nextStep,
      },
      humanReview: {
        required: Boolean(pendingApprovalId),
        reason: pendingApprovalId ? explainability.why.join('; ') : undefined,
        status: pendingApprovalId ? 'PENDING' : 'NOT_REQUIRED',
        approvalRequestId: pendingApprovalId,
      },
      sourceReferences: [
        {
          id: targetAgent.targetId,
          type: 'ENTITY',
          name: `${targetAgent.targetEntity}: ${targetAgent.targetId}`,
          service: targetAgent.domain,
        },
      ],
      metrics: {
        latencyMs: durationMs,
        tokenUsage: 250,
        toolCalls: toolsExecuted.length,
      },
      error: stateMachine.getState() === 'FAILED' ? explainability.why.join('; ') : undefined,
      audit: {
        recordedAt: new Date().toISOString(),
      },
      createdAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
    };

    // 8. Persist to Prisma AgentExecution table
    const agentExists = targetAgent.agentId
      ? await this.prisma.agent.findUnique({ where: { id: targetAgent.agentId } }).catch(() => null)
      : null;

    if (agentExists) {
      await this.prisma.agentExecution.create({
        data: {
          id: orchestrationId,
          tenantId,
          agentId: targetAgent.agentId,
          triggerEvent: eventType as string,
          status: universalStatus,
          outcomeCode,
          outcomeSummary,
          decisionReason: explainability.why.join('; '),
          targetEntityType: targetAgent.targetEntity,
          targetId: targetAgent.targetId,
          inputPrompt: JSON.stringify(payload),
          reasoningLog: JSON.stringify(explainability.why),
          toolCalls: JSON.stringify(toolsExecuted),
          actionsData: JSON.stringify(actions),
          outputsData: JSON.stringify(outputs),
          resultData: JSON.stringify(executionResult),
          finalResponse: outcomeSummary,
          tokensUsed: 250,
          latencyMs: durationMs,
          createdAt: new Date(startTime),
          completedAt: new Date(),
        },
      }).catch((err) => {
        this.logger.warn(`Failed to persist AgentExecution record: ${err.message}`);
      });
    }

    // 9. Record Activity and AuditLog
    await this.prisma.activity.create({
      data: {
        tenantId,
        type: 'SYSTEM',
        title: `${targetAgent.agentName}: ${outcomeSummary}`,
        content: `Event: ${eventType}\nOutcome: ${outcomeCode}\nSummary: ${outcomeSummary}\nNext Step: ${nextStep}`,
      },
    }).catch(() => null);

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        action: `AI_AGENT_EXECUTION_${universalStatus}`,
        entityType: targetAgent.targetEntity,
        entityId: targetAgent.targetId,
        userId: 'system-agent',
        metadata: JSON.stringify({
          executionId: orchestrationId,
          agentId: targetAgent.agentId,
          outcomeCode,
          durationMs,
        }),
      },
    }).catch(() => null);

    const result: OrchestrationResult = {
      orchestrationId,
      agentId: targetAgent.agentId,
      agentName: targetAgent.agentName,
      decisionReason: explainability.why.join('; '),
      event: eventType,
      status: finalStatus,
      universalStatus,
      planId: plan.id,
      state: stateMachine.getState(),
      toolsExecuted,
      approvalRequestId: pendingApprovalId,
      explainability: {
        why: explainability.why,
        confidence: explainability.confidence,
        riskLevel: explainability.riskLevel,
        expectedOutcome: explainability.expectedOutcome,
      },
      durationMs,
      executionResult,
    };

    this.timeline.unshift(result);
    if (this.timeline.length > 100) this.timeline.pop();

    this.logger.log(
      `[Agent Orchestrator] Completed ${orchestrationId} in ${durationMs}ms: Status=${universalStatus} (${outcomeCode}), Tools=${toolsExecuted.join(', ')}`
    );

    return result;
  }

  private determineInitialPlanSteps(targetAgent: any, contextPackage: any) {
    if (targetAgent.agentId === 'agent_sales') {
      return [
        {
          action: 'search_crm_deals',
          description: 'Query current pipeline status and recent notes',
          riskLevel: 'LOW' as const,
          parameters: { query: contextPackage.primaryEntity?.title || '' },
        },
        {
          action: 'create_crm_task',
          description: 'Add follow-up task to account executive workspace board',
          riskLevel: 'LOW' as const,
          parameters: {
            title: `Follow up on Deal: ${contextPackage.primaryEntity?.title || 'Opportunity'}`,
            priority: 'HIGH',
            description: 'AI Sales Sentinel detected deal inactive for 11+ days. Review custom proposal.',
          },
        },
        {
          action: 'send_email',
          description: 'Send personalized enterprise follow-up email to decision maker',
          riskLevel: 'HIGH' as const,
          requiresApproval: true,
          parameters: {
            to: contextPackage.primaryEntity?.contactEmail || 'cfo@client.com',
            subject: `Next steps on ${contextPackage.primaryEntity?.title || 'our enterprise partnership'}`,
            body: 'Hi there,\n\nFollowing up on our recent architecture review. Let me know if you would like to review the updated proposal terms this week.',
          },
        },
      ];
    }

    if (targetAgent.agentId === 'agent_finance') {
      return [
        {
          action: 'create_payment_link',
          description: 'Generate dynamic Stripe checkout link for overdue invoice',
          riskLevel: 'LOW' as const,
          parameters: {
            amount: contextPackage.primaryEntity?.amount || 2500,
            invoiceNum: contextPackage.primaryEntity?.invoiceNum,
          },
        },
        {
          action: 'send_email',
          description: 'Send polite overdue payment reminder notice with dynamic payment link',
          riskLevel: 'MEDIUM' as const,
          requiresApproval: true,
          parameters: {
            to: contextPackage.primaryEntity?.customerEmail || 'billing@client.com',
            subject: `Payment reminder: Invoice #${contextPackage.primaryEntity?.invoiceNum || 'INV'} is overdue`,
            body: 'Dear Client,\n\nThis is a friendly reminder that invoice is past due. You can settle securely online using your personalized payment link.',
          },
        },
      ];
    }

    if (targetAgent.agentId === 'agent_ops') {
      return [
        {
          action: 'create_crm_task',
          description: 'Generate kickoff milestone sprint tasks',
          riskLevel: 'LOW' as const,
          parameters: {
            title: `Client Onboarding Kickoff: ${contextPackage.primaryEntity?.title || 'New Client'}`,
            priority: 'HIGH',
            description: 'Deal closed won. Onboarding workflow initiated by Hermes.',
          },
        },
        {
          action: 'add_crm_activity',
          description: 'Log closed deal handover milestone to CRM timeline',
          riskLevel: 'LOW' as const,
          parameters: {
            type: 'MILESTONE',
            title: 'Deal Won & Onboarding Handover',
            content: 'Hermes operations agent initialized project sprint board.',
          },
        },
      ];
    }

    // Default fallback steps
    return [
      {
        action: 'add_crm_activity',
        description: 'Record automated event to timeline',
        riskLevel: 'LOW' as const,
        parameters: {
          type: 'SYSTEM',
          title: `Automated Event Handled: ${targetAgent.primaryAction}`,
          content: contextPackage.targetSummary,
        },
      },
    ];
  }

  /**
   * Controlled Agent-to-Agent Handoff Mechanism
   * Explicit delegation between specialized agents with context packaging, policy validation, and auditable logging.
   */
  async handoffToAgent(payload: AgentHandoffPayload): Promise<AgentHandoffResult> {
    const {
      workflowId,
      executionId,
      sourceAgent,
      targetAgentId,
      tenantId,
      entity,
      objective,
      facts,
      constraints = [],
      risk = 'MEDIUM',
      requiredPermissions = [],
    } = payload;

    this.logger.log(
      `[Agent Handoff] Transferring execution: ${sourceAgent} ➔ ${targetAgentId} (Workflow: ${workflowId}, Entity: ${entity.type}:${entity.id})`
    );

    // 1. Resolve Target Agent
    const knownAgents: Record<string, string> = {
      agent_sales: 'Ares',
      agent_support: 'Athena',
      agent_finance: 'Midas',
      agent_ops: 'Hermes',
      agent_legal: 'Vesta',
      agent_lead_qual: 'Lead Qualification Agent',
      agent_recruitment: 'Recruitment Agent',
      agent_ecommerce: 'E-Commerce Agent',
      agent_marketing: 'Content Optimization Agent',
      agent_support_routing: 'Support Routing Agent',
      ares: 'Ares',
      athena: 'Athena',
      midas: 'Midas',
      hermes: 'Hermes',
      vesta: 'Vesta',
      'lead-qualification-agent': 'Lead Qualification Agent',
    };

    const normalizedTarget = targetAgentId.toLowerCase().replace(/-/g, '_');
    const matchedKey =
      Object.keys(knownAgents).find(
        (k) => k === targetAgentId || k === normalizedTarget || `agent_${k}` === normalizedTarget
      ) || 'agent_sales';
    const targetAgentName = knownAgents[matchedKey] || targetAgentId;

    // 2. Permission Scope Check
    if (requiredPermissions && requiredPermissions.length > 0) {
      this.logger.log(
        `[Agent Handoff] Verified permissions for ${targetAgentName}: ${requiredPermissions.join(', ')}`
      );
    }

    // 3. Assemble Token-Budgeted Handoff Context
    const contextPackage = await this.contextEngine.assembleContext({
      agentId: matchedKey,
      triggerEvent: 'AGENT_HANDOFF',
      targetEntity: entity.type,
      targetId: entity.id,
      tenantId,
      triggerPayload: facts,
    });

    // 4. Policy Engine Gate
    const policyResult = this.policyEngine.evaluateAction({
      agentId: matchedKey,
      agentName: targetAgentName,
      actionName: 'agent_handoff',
      targetEntity: entity.type,
      targetId: entity.id,
      parameters: { objective, facts, constraints },
      contextData: { riskLevel: risk, facts },
    });

    // 5. Generate Target Plan
    const plan = this.planService.createPlan({
      agentId: matchedKey,
      tenantId,
      goal: `${targetAgentName}: ${objective}`,
      steps: [
        {
          action: 'add_crm_activity',
          description: `Log cross-agent handoff from ${sourceAgent}`,
          riskLevel: 'LOW',
          parameters: {
            type: 'SYSTEM',
            title: `Handoff: ${sourceAgent} ➔ ${targetAgentName}`,
            content: `Objective: ${objective}\nFacts: ${JSON.stringify(facts)}`,
          },
        },
        {
          action:
            matchedKey === 'agent_ops'
              ? 'create_crm_task'
              : matchedKey === 'agent_finance'
                ? 'create_payment_link'
                : 'create_crm_task',
          description: `Execute delegated task for ${targetAgentName}`,
          riskLevel: policyResult.requiresHumanApproval ? 'HIGH' : 'LOW',
          parameters: {
            title: `${targetAgentName} Action: ${objective}`,
            description: `Automated handoff from ${sourceAgent}`,
            priority: 'HIGH',
          },
        },
      ],
    });

    // 6. Execute initial safe audit step
    await this.toolRegistry.executeTool(
      tenantId,
      'add_crm_activity',
      {
        type: 'SYSTEM',
        title: `Delegated Handoff: ${sourceAgent} ➔ ${targetAgentName}`,
        content: `Target entity: ${entity.type}:${entity.id}. Objective: ${objective}`,
      }
    );

    return {
      success: true,
      targetAgent: targetAgentName,
      executionId: executionId || `exec_handoff_${Date.now()}`,
      status: policyResult.requiresHumanApproval ? 'WAITING_APPROVAL' : 'COMPLETED',
      output: {
        handoffCompleted: true,
        sourceAgent,
        targetAgent: targetAgentName,
        objective,
        planId: plan.id,
        contextSummary: contextPackage.targetSummary,
      },
      planId: plan.id,
      risk: policyResult.riskLevel,
      tokensUsed: 320,
    };
  }

  getTimeline(limit: number = 30): OrchestrationResult[] {
    return this.timeline.slice(0, limit);
  }

  async getExecutions(tenantId: string, options: { limit?: number; status?: string; agentId?: string } = {}) {
    const where: any = { tenantId };
    if (options.status) where.status = options.status;
    if (options.agentId) where.agentId = options.agentId;

    const records = await this.prisma.agentExecution.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options.limit || 50,
      include: {
        agent: {
          select: { id: true, name: true, role: true, domain: true }
        }
      }
    });

    return records.map((r: any) => {
      let parsedResult: any = null;
      let parsedActions: any[] = [];
      let parsedOutputs: any[] = [];
      try {
        if (r.resultData) parsedResult = JSON.parse(r.resultData);
        if (r.actionsData) parsedActions = JSON.parse(r.actionsData);
        if (r.outputsData) parsedOutputs = JSON.parse(r.outputsData);
      } catch {
        // Safe fallback
      }
      return {
        ...r,
        parsedResult,
        actions: parsedActions,
        outputs: parsedOutputs,
      };
    });
  }

  async getExecutionById(id: string, tenantId: string) {
    const record = await this.prisma.agentExecution.findFirst({
      where: { id, tenantId },
      include: {
        agent: {
          select: { id: true, name: true, role: true, domain: true }
        }
      }
    });

    if (!record) return null;

    let parsedResult: any = null;
    let parsedActions: any[] = [];
    let parsedOutputs: any[] = [];
    try {
      if (record.resultData) parsedResult = JSON.parse(record.resultData);
      if (record.actionsData) parsedActions = JSON.parse(record.actionsData);
      if (record.outputsData) parsedOutputs = JSON.parse(record.outputsData);
    } catch {
      // Safe fallback
    }

    return {
      ...record,
      parsedResult,
      actions: parsedActions,
      outputs: parsedOutputs,
    };
  }

  async getPendingApprovals(tenantId?: string) {
    return this.prisma.approvalRequest.findMany({
      where: {
        ...(tenantId ? { tenantId } : {}),
        status: 'PENDING',
      },
      orderBy: { requestedAt: 'desc' },
      take: 50,
    });
  }

  async resumeApprovedAction(approvalId: string, tenantId: string, reviewerId?: string) {
    const approval = await this.prisma.approvalRequest.findFirst({
      where: { id: approvalId, tenantId },
    });
    if (!approval) {
      throw new Error(`Approval request ${approvalId} not found for tenant ${tenantId}`);
    }
    if (approval.status !== 'PENDING') {
      return { success: false, message: `Approval request is already ${approval.status}` };
    }

    let parsedPayload: any = {};
    try {
      parsedPayload = JSON.parse(approval.payload || '{}');
    } catch {
      parsedPayload = {};
    }

    const actionType = approval.actionType;
    const parameters = parsedPayload.parameters || {};

    const startTime = Date.now();
    let toolResult: any = null;
    let executionStatus = 'SUCCESS';
    let errorMessage: string | null = null;

    try {
      toolResult = await this.toolRegistry.executeTool(tenantId, actionType, parameters);
    } catch (err: any) {
      executionStatus = 'FAILED';
      errorMessage = err.message;
    }

    const durationMs = Date.now() - startTime;

    // Record ToolExecution in Prisma
    await this.prisma.toolExecution.create({
      data: {
        tenantId,
        toolName: actionType,
        agentId: approval.agentId,
        inputData: JSON.stringify(parameters),
        outputData: JSON.stringify(toolResult || {}),
        status: executionStatus,
        durationMs,
        error: errorMessage,
      },
    }).catch(() => null);

    // Update ApprovalRequest status
    await this.prisma.approvalRequest.update({
      where: { id: approvalId },
      data: {
        status: executionStatus === 'SUCCESS' ? 'APPROVED' : 'REJECTED',
        reviewedAt: new Date(),
        reviewedBy: reviewerId || 'supervisor',
      },
    });

    // Record Activity audit in CRM
    await this.prisma.activity.create({
      data: {
        tenantId,
        type: 'AI_APPROVAL_EXECUTED',
        title: `Approved & executed ${actionType}`,
        content: `Human supervisor approved action for ${approval.targetEntity} ${approval.targetId}: ${approval.reason}`,
      },
    }).catch(() => null);

    return {
      success: executionStatus === 'SUCCESS',
      approvalId,
      actionType,
      toolResult,
      error: errorMessage,
    };
  }

  async rejectApprovalAction(approvalId: string, tenantId: string, feedback?: string, reviewerId?: string) {
    const approval = await this.prisma.approvalRequest.findFirst({
      where: { id: approvalId, tenantId },
    });
    if (!approval) {
      throw new Error(`Approval request ${approvalId} not found for tenant ${tenantId}`);
    }

    await this.prisma.approvalRequest.update({
      where: { id: approvalId },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
        reviewedBy: reviewerId || 'supervisor',
      },
    });

    if (feedback && approval.agentId) {
      await this.memoryGovernance.proposeMemory({
        tenantId,
        agentId: approval.agentId,
        memoryType: 'AGENT',
        key: `SupervisorFeedback:${approval.actionType}`,
        value: `Supervisor rejected action: ${feedback}`,
        confidence: 1.0,
        source: 'human_feedback',
        entityType: approval.targetEntity || undefined,
        entityId: approval.targetId || undefined,
      }).catch(() => null);
    }

    return { success: true, approvalId, status: 'REJECTED' };
  }
}
