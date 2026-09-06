import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NODE_CATALOG } from '../executor/node-catalog';
import {
  WorkflowNode,
  WorkflowEdge,
  WorkflowValidationResult,
  WorkflowValidationError,
} from '@repo/core-types';

@Injectable()
export class WorkflowGeneratorService {
  private readonly logger = new Logger(WorkflowGeneratorService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Translate natural language prompt into a valid DAG workflow draft
   */
  async generateFromPrompt(tenantId: string, prompt: string): Promise<{
    name: string;
    description: string;
    status: 'DRAFT';
    version: number;
    triggerType: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    explanation: string;
    validation: WorkflowValidationResult;
  }> {
    this.logger.log(`[AI Workflow Generator] Synthesizing workflow draft for prompt: "${prompt}"`);

    const lower = prompt.toLowerCase();
    const nodes: WorkflowNode[] = [];
    const edges: WorkflowEdge[] = [];

    // 1. Determine Trigger Node
    let triggerNode: WorkflowNode;
    if (lower.includes('lead') || lower.includes('demo form') || lower.includes('signup') || lower.includes('contact')) {
      triggerNode = {
        id: 'node_trigger_1',
        type: 'trigger:form_submitted',
        name: 'Demo Form Ingestion',
        config: { formId: 'demo_request_form', source: 'Website' },
        enabled: true,
        position: { x: 250, y: 50 },
      };
    } else if (lower.includes('invoice') || lower.includes('overdue') || lower.includes('payment')) {
      triggerNode = {
        id: 'node_trigger_1',
        type: 'trigger:invoice_overdue',
        name: 'Invoice Overdue Trigger',
        config: { graceDays: 3 },
        enabled: true,
        position: { x: 250, y: 50 },
      };
    } else if (lower.includes('ticket') || lower.includes('support') || lower.includes('escalat')) {
      triggerNode = {
        id: 'node_trigger_1',
        type: 'trigger:ticket_escalated',
        name: 'Critical Support Ticket',
        config: { priority: 'URGENT' },
        enabled: true,
        position: { x: 250, y: 50 },
      };
    } else if (lower.includes('deal') || lower.includes('closed won') || lower.includes('win')) {
      triggerNode = {
        id: 'node_trigger_1',
        type: 'trigger:deal_stage_changed',
        name: 'Deal Closed Won Trigger',
        config: { targetStage: 'Won' },
        enabled: true,
        position: { x: 250, y: 50 },
      };
    } else {
      triggerNode = {
        id: 'node_trigger_1',
        type: 'trigger:manual',
        name: 'Manual Initiation Trigger',
        config: {},
        enabled: true,
        position: { x: 250, y: 50 },
      };
    }
    nodes.push(triggerNode);

    let prevNodeId = triggerNode.id;
    let yPos = 180;
    let stepCount = 2;

    // 2. Add AI Agent Node (e.g. Qualification, Athena, Midas, Ares)
    if (lower.includes('qualif') || lower.includes('score') || lower.includes('enrich') || lower.includes('lead')) {
      const agentNode: WorkflowNode = {
        id: `node_agent_${stepCount}`,
        type: 'ai:agent',
        name: 'AI Lead Qualification Agent',
        config: {
          agentId: 'agent_lead_qual',
          task: 'Enrich lead firmographics, verify business email domain, and calculate ICP score.',
        },
        enabled: true,
        position: { x: 250, y: yPos },
      };
      nodes.push(agentNode);
      edges.push({ id: `e_${prevNodeId}_${agentNode.id}`, source: prevNodeId, target: agentNode.id });
      prevNodeId = agentNode.id;
      yPos += 130;
      stepCount++;
    } else if (lower.includes('invoice') || lower.includes('dunning')) {
      const midasNode: WorkflowNode = {
        id: `node_agent_${stepCount}`,
        type: 'ai:agent',
        name: 'Midas Financial Governance Agent',
        config: {
          agentId: 'agent_finance',
          task: 'Analyze aging delinquency, calculate payment plan, and draft polite reminder.',
        },
        enabled: true,
        position: { x: 250, y: yPos },
      };
      nodes.push(midasNode);
      edges.push({ id: `e_${prevNodeId}_${midasNode.id}`, source: prevNodeId, target: midasNode.id });
      prevNodeId = midasNode.id;
      yPos += 130;
      stepCount++;
    }

    // 3. Add Condition Node if branching logic mentioned
    if (lower.includes('if') || lower.includes('score') || lower.includes('qualif') || lower.includes('high-value')) {
      const condNode: WorkflowNode = {
        id: `node_cond_${stepCount}`,
        type: 'logic:if_else',
        name: 'ICP Match Score >= 80',
        config: {
          field: 'leadScore',
          operator: 'GREATER_THAN_OR_EQUAL',
          value: 80,
        },
        enabled: true,
        position: { x: 250, y: yPos },
      };
      nodes.push(condNode);
      edges.push({ id: `e_${prevNodeId}_${condNode.id}`, source: prevNodeId, target: condNode.id });
      prevNodeId = condNode.id;
      yPos += 130;
      stepCount++;

      // YES Branch: Create Deal
      const dealNode: WorkflowNode = {
        id: `node_deal_${stepCount}`,
        type: 'crm:create_deal',
        name: 'Create Enterprise Deal',
        config: {
          title: 'Qualified Enterprise Pipeline Lead',
          amount: 25000,
          stage: 'Proposal',
        },
        enabled: true,
        position: { x: 120, y: yPos },
      };
      nodes.push(dealNode);
      edges.push({
        id: `e_${condNode.id}_${dealNode.id}`,
        source: condNode.id,
        target: dealNode.id,
        sourceHandle: 'true',
      });
      prevNodeId = dealNode.id;
      yPos += 130;
      stepCount++;

      // NO Branch: Nurture Activity
      const nurtureNode: WorkflowNode = {
        id: `node_nurture_${stepCount}`,
        type: 'crm:add_activity',
        name: 'Add to Marketing Nurture',
        config: {
          type: 'NOTE',
          title: 'Unqualified Lead Routed to Nurture',
          content: 'Prospect ICP score below 80 threshold. Added to educational newsletter drip.',
        },
        enabled: true,
        position: { x: 420, y: yPos - 130 },
      };
      nodes.push(nurtureNode);
      edges.push({
        id: `e_${condNode.id}_${nurtureNode.id}`,
        source: condNode.id,
        target: nurtureNode.id,
        sourceHandle: 'false',
      });
      stepCount++;
    }

    // 4. Add Communication Node
    if (lower.includes('email') || lower.includes('send') || lower.includes('message')) {
      const emailNode: WorkflowNode = {
        id: `node_email_${stepCount}`,
        type: 'comm:email',
        name: 'Send Personalized VIP Outreach',
        config: {
          subject: 'Personalized Executive Introduction & Platform Demo',
          body: 'Hello {{firstName}},\n\nThank you for reaching out to evaluate our Business OS platform. Let us connect for a brief 15-minute walkthrough.',
        },
        enabled: true,
        position: { x: 120, y: yPos },
      };
      nodes.push(emailNode);
      edges.push({ id: `e_${prevNodeId}_${emailNode.id}`, source: prevNodeId, target: emailNode.id });
      prevNodeId = emailNode.id;
      yPos += 130;
      stepCount++;
    }

    // 5. Add Delay Node if wait mentioned
    if (lower.includes('day') || lower.includes('wait') || lower.includes('follow up') || lower.includes('after')) {
      const delayNode: WorkflowNode = {
        id: `node_delay_${stepCount}`,
        type: 'logic:delay',
        name: 'Wait 3 Days',
        config: { duration: 3, unit: 'DAYS' },
        enabled: true,
        position: { x: 120, y: yPos },
      };
      nodes.push(delayNode);
      edges.push({ id: `e_${prevNodeId}_${delayNode.id}`, source: prevNodeId, target: delayNode.id });
      prevNodeId = delayNode.id;
      yPos += 130;
      stepCount++;

      // Follow-up task
      const taskNode: WorkflowNode = {
        id: `node_task_${stepCount}`,
        type: 'crm:add_activity',
        name: 'Create Follow-up Call Task',
        config: {
          type: 'CALL',
          title: 'Day-3 Executive Follow-up Call',
          content: 'Prospect has not responded to initial email. Re-engagement task assigned to sales executive.',
        },
        enabled: true,
        position: { x: 120, y: yPos },
      };
      nodes.push(taskNode);
      edges.push({ id: `e_${prevNodeId}_${taskNode.id}`, source: prevNodeId, target: taskNode.id });
    }

    const workflowName = prompt.length > 50 ? `${prompt.substring(0, 47)}...` : prompt;
    const validation = this.validateWorkflowGraph(nodes, edges);

    return {
      name: workflowName,
      description: `AI-generated autonomous business workflow synthesized from prompt: "${prompt}"`,
      status: 'DRAFT',
      version: 1,
      triggerType: triggerNode.type,
      nodes,
      edges,
      explanation: this.explainWorkflow(nodes, edges),
      validation,
    };
  }

  /**
   * Plain-English explanation of workflow structure
   */
  explainWorkflow(nodes: WorkflowNode[], edges: WorkflowEdge[]): string {
    const trigger = nodes.find((n) => n.type.startsWith('trigger:')) || nodes[0];
    const lines = [
      `### Workflow Architecture Summary`,
      `1. **Trigger Phase**: Initiated by \`${trigger?.name || 'Trigger'}\`.`,
    ];

    const actions = nodes.filter((n) => !n.type.startsWith('trigger:'));
    actions.forEach((act, idx) => {
      lines.push(`${idx + 2}. **${act.name}** (\`${act.type}\`): ${JSON.stringify(act.config)}`);
    });

    lines.push(`\n**Total Flow**: ${nodes.length} nodes connected across ${edges.length} execution edges.`);
    return lines.join('\n');
  }

  /**
   * Comprehensive graph validation
   */
  validateWorkflowGraph(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowValidationResult {
    const errors: WorkflowValidationError[] = [];
    const warnings: WorkflowValidationError[] = [];

    // 1. Must have at least one trigger node
    const triggers = nodes.filter((n) => n.type.startsWith('trigger:') || n.type === 'TRIGGER');
    if (triggers.length === 0) {
      errors.push({
        code: 'MISSING_TRIGGER',
        message: 'Workflow must contain at least one Trigger node.',
        severity: 'ERROR',
      });
    }

    // 2. Check for orphan nodes (nodes not connected to anything)
    const connectedNodeIds = new Set<string>();
    edges.forEach((e) => {
      connectedNodeIds.add(e.source);
      connectedNodeIds.add(e.target);
    });

    nodes.forEach((n) => {
      if (nodes.length > 1 && !connectedNodeIds.has(n.id)) {
        warnings.push({
          nodeId: n.id,
          code: 'UNREACHABLE_NODE',
          message: `Node "${n.name}" is not connected to any edges.`,
          severity: 'WARNING',
        });
      }
    });

    // 3. Condition branches verification
    const conditionNodes = nodes.filter(
      (n) => n.type === 'logic:if_else' || n.type === 'CONDITION'
    );
    conditionNodes.forEach((cond) => {
      const outEdges = edges.filter((e) => e.source === cond.id);
      const hasTrue = outEdges.some((e) => e.sourceHandle === 'true');
      const hasFalse = outEdges.some((e) => e.sourceHandle === 'false');

      if (outEdges.length > 0 && (!hasTrue || !hasFalse)) {
        warnings.push({
          nodeId: cond.id,
          code: 'INCOMPLETE_BRANCHING',
          message: `Condition node "${cond.name}" should define both true and false branching paths.`,
          severity: 'WARNING',
        });
      }
    });

    // 4. High-risk actions must require human approval
    const highRiskKeywords = ['refund', 'delete', 'terminate', 'discount'];
    nodes.forEach((n) => {
      const nodeText = `${n.type} ${n.name} ${JSON.stringify(n.config)}`.toLowerCase();
      const isHighRisk = highRiskKeywords.some((k) => nodeText.includes(k));
      if (isHighRisk && !n.approvalPolicy?.required && n.type !== 'logic:human_approval') {
        errors.push({
          nodeId: n.id,
          code: 'APPROVAL_REQUIRED',
          message: `Node "${n.name}" performs high-risk operations; human approval is required.`,
          severity: 'ERROR',
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
