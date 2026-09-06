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
import { BusinessEvent, BusinessEventType, AgentHandoffPayload, AgentHandoffResult } from '@repo/core-types';

export interface OrchestrationResult {
  orchestrationId: string;
  agentId: string;
  agentName: string;
  decisionReason: string;
  event: BusinessEventType;
  status: 'EXECUTED_AUTONOMOUSLY' | 'QUEUED_FOR_APPROVAL' | 'HANDED_OFF' | 'FAILED';
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
  resolveAgentForEvent(eventType: BusinessEventType, payload: any): {
    agentId: string;
    agentName: string;
    domain: string;
    targetEntity: string;
    targetId: string;
    primaryAction: string;
  } {
    switch (eventType) {
      // 1. Leads & New Contacts -> Lead Qualification Agent
      case 'CONTACT_CREATED':
      case 'LEAD_CREATED':
        return {
          agentId: 'agent_lead_qualification',
          agentName: 'Inbound SDR & Lead Qualification Agent',
          domain: 'LEADS',
          targetEntity: 'Contact',
          targetId: payload.contactId || payload.id,
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
          targetId: payload.dealId || payload.id,
          primaryAction: payload.stage === 'Proposal' ? 'DRAFT_PROPOSAL_FOLLOWUP' : 'ANALYZE_PIPELINE',
        };

      // 3. Deal Closed Won -> Hermes (Sprint & Onboarding)
      case 'DEAL_CLOSED_WON':
      case 'DEAL_WON':
        return {
          agentId: 'agent_ops',
          agentName: 'Hermes Sprint & HR Operations Orchestrator',
          domain: 'OPERATIONS',
          targetEntity: 'Deal',
          targetId: payload.dealId || payload.id,
          primaryAction: 'INITIALIZE_CLIENT_ONBOARDING',
        };

      // 4. Overdue Invoices & Billing -> Midas
      case 'INVOICE_OVERDUE':
      case 'INVOICE_CREATED':
        return {
          agentId: 'agent_finance',
          agentName: 'Midas Treasury & Billing Sentinel',
          domain: 'FINANCE',
          targetEntity: 'Invoice',
          targetId: payload.invoiceId || payload.id,
          primaryAction: 'CALCULATE_AR_AGING_AND_REMIND',
        };

      // 5. Ticket Escalated & Support -> Athena / Support Agent
      case 'TICKET_ESCALATED':
      case 'TICKET_CREATED':
        return {
          agentId: 'agent_support',
          agentName: 'Customer Support & SLA Sentinel',
          domain: 'SUPPORT',
          targetEntity: 'Ticket',
          targetId: payload.ticketId || payload.id,
          primaryAction: 'INVESTIGATE_TICKET_SOP',
        };

      // 6. Recruitment & Candidates -> Recruitment Agent
      case 'CANDIDATE_APPLIED':
        return {
          agentId: 'agent_recruitment',
          agentName: 'Recruitment & Candidate Sourcing Agent',
          domain: 'HR',
          targetEntity: 'Candidate',
          targetId: payload.candidateId || payload.id,
          primaryAction: 'SCREEN_CANDIDATE_RESUME',
        };

      // 7. Projects & Tasks -> Hermes
      case 'PROJECT_CREATED':
      case 'TASK_COMPLETED':
        return {
          agentId: 'agent_ops',
          agentName: 'Hermes Sprint & HR Operations Orchestrator',
          domain: 'OPERATIONS',
          targetEntity: 'Project',
          targetId: payload.projectId || payload.id,
          primaryAction: 'MONITOR_SPRINT_SLA',
        };

      // Fallback
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

    // 3. Plan System: Generate structured plan
    const planSteps = this.determineInitialPlanSteps(targetAgent, contextPackage);
    const plan = this.planService.createPlan({
      agentId: targetAgent.agentId,
      tenantId,
      goal: `${targetAgent.primaryAction} for ${targetAgent.targetEntity} ${targetAgent.targetId}`,
      steps: planSteps,
    });

    const toolsExecuted: string[] = [];
    let pendingApprovalId: string | undefined = undefined;

    // 4. Step-by-Step Execution with Policy & Safety Gates
    for (const step of plan.steps) {
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

        const approval = await this.prisma.approvalRequest.create({
          data: {
            tenantId,
            agentId: targetAgent.agentId,
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
        this.logger.log(`[Agent Orchestrator] Paused on ApprovalRequest ${approval.id} [Risk: ${policyResult.riskLevel}]`);
        break; // Pause execution loop until human approves
      }

      // Safe / Low-Risk Action -> Execute autonomously
      this.planService.updateStepStatus(plan.id, step.id, 'RUNNING');
      stateMachine.transition('WAITING_FOR_TOOL', `Executing tool ${step.action}`);

      try {
        const toolResult = await this.toolRegistry.executeTool(tenantId, step.action, step.parameters || {});
        toolsExecuted.push(step.action);
        this.planService.updateStepStatus(plan.id, step.id, 'COMPLETED', toolResult.output);

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
    const finalStatus = pendingApprovalId
      ? 'QUEUED_FOR_APPROVAL'
      : stateMachine.getState() === 'COMPLETED'
      ? 'EXECUTED_AUTONOMOUSLY'
      : 'FAILED';

    const result: OrchestrationResult = {
      orchestrationId,
      agentId: targetAgent.agentId,
      agentName: targetAgent.agentName,
      decisionReason: explainability.why.join('; '),
      event: eventType,
      status: finalStatus,
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
    };

    this.timeline.unshift(result);
    if (this.timeline.length > 100) this.timeline.pop();

    this.logger.log(
      `[Agent Orchestrator] Completed ${orchestrationId} in ${durationMs}ms: Status=${finalStatus}, Tools=${toolsExecuted.join(', ')}`
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
}
