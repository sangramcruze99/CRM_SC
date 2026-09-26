// apps/automation/src/intent/intent-compiler.service.ts
// Intent-to-Workflow Compiler: Maps StructuredIntent to Universal Workflow DAG

import { Injectable, Logger } from '@nestjs/common';
import { StructuredIntent } from './intent-parser.service';
import { WorkflowNode, WorkflowEdge } from '@repo/core-types';

export interface CompiledWorkflow {
  id: string;
  name: string;
  description: string;
  status: 'DRAFT' | 'ACTIVE';
  version: number;
  triggerType: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  humanSummary: string[];
  destinationSummary: string;
}

@Injectable()
export class IntentCompilerService {
  private readonly logger = new Logger(IntentCompilerService.name);

  /**
   * Compile StructuredIntent into universal workflow nodes and edges
   */
  compile(intent: StructuredIntent): CompiledWorkflow {
    this.logger.log(`[IntentCompiler] Compiling intent "${intent.name}" (${intent.domain})`);

    const nodes: WorkflowNode[] = [];
    const edges: WorkflowEdge[] = [];
    const workflowId = intent.id || `wf_${intent.domain}_${Date.now()}`;

    let yPosition = 50;
    const xCenter = 280;
    let nodeIndex = 1;

    // 1. Trigger Node
    const triggerId = `node_trigger_${nodeIndex++}`;
    let triggerType = 'trigger:manual';
    let triggerConfig: Record<string, any> = {};

    if (intent.trigger.type.includes('call')) {
      triggerType = 'voice:trigger_call_received';
      triggerConfig = { scheduleWindow: intent.trigger.timing };
    } else if (intent.trigger.type.includes('invoice')) {
      triggerType = 'finance:trigger_invoice_received';
      triggerConfig = { source: 'email_or_upload' };
    } else if (intent.trigger.type.includes('lead')) {
      triggerType = 'sales:trigger_lead_created';
      triggerConfig = { source: 'web_form' };
    } else if (intent.trigger.type.includes('support') || intent.trigger.type.includes('ticket')) {
      triggerType = 'support:trigger_ticket_message';
      triggerConfig = { channel: 'all' };
    } else if (intent.trigger.type.includes('cron') || intent.trigger.timing === 'SCHEDULED') {
      triggerType = 'scheduler:cron';
      triggerConfig = { cron: intent.trigger.cronExpression || '0 9 * * 1' };
    } else if (intent.trigger.type.includes('candidate')) {
      triggerType = 'recruitment:candidate_applied';
      triggerConfig = { source: 'career_portal' };
    } else {
      triggerType = 'trigger:webhook';
      triggerConfig = { event: intent.trigger.type };
    }

    nodes.push({
      id: triggerId,
      type: triggerType,
      name: intent.trigger.description || 'Trigger Event',
      config: triggerConfig,
      enabled: true,
      position: { x: xCenter, y: yPosition },
    });

    let prevNodeId = triggerId;

    // 2. Domain Primary AI / Evaluation Node
    yPosition += 130;
    const aiNodeId = `node_ai_${nodeIndex++}`;

    switch (intent.domain) {
      case 'recruitment':
        nodes.push({
          id: aiNodeId,
          type: 'recruitment:screen_candidate',
          name: 'Screen Candidate against Profile',
          config: {
            useScreeningProfile: true,
            ruleGroups: intent.ruleGroups,
          },
          enabled: true,
          position: { x: xCenter, y: yPosition },
        });
        break;

      case 'front_desk':
        nodes.push({
          id: aiNodeId,
          type: 'ai:voice_receptionist',
          name: 'AI Voice Receptionist (Knowledge & Triage)',
          config: {
            timingWindow: intent.timing?.window || 'OUTSIDE_BUSINESS_HOURS',
            tools: ['calendar_booking', 'knowledge_base', 'human_transfer'],
          },
          enabled: true,
          position: { x: xCenter, y: yPosition },
        });
        break;

      case 'sales':
        nodes.push({
          id: aiNodeId,
          type: 'ai:lead_scoring',
          name: 'Calculate AI Lead Score & ICP Fit',
          config: { minScore: 75, enrichFirmographics: true },
          enabled: true,
          position: { x: xCenter, y: yPosition },
        });
        break;

      case 'finance':
        nodes.push({
          id: aiNodeId,
          type: 'ai:ocr_extract',
          name: 'OCR Extract Invoice Total & Due Date',
          config: { autoClassify: true },
          enabled: true,
          position: { x: xCenter, y: yPosition },
        });
        break;

      case 'support':
        nodes.push({
          id: aiNodeId,
          type: 'ai:sentiment_analysis',
          name: 'Sentiment Analysis & Resolution Check',
          config: { detectFrustration: true },
          enabled: true,
          position: { x: xCenter, y: yPosition },
        });
        break;

      default:
        nodes.push({
          id: aiNodeId,
          type: 'ai:agent',
          name: 'AI Evaluation & Triage Agent',
          config: { goal: intent.goal },
          enabled: true,
          position: { x: xCenter, y: yPosition },
        });
        break;
    }

    edges.push({
      id: `edge_${prevNodeId}_${aiNodeId}`,
      source: prevNodeId,
      target: aiNodeId,
    });
    prevNodeId = aiNodeId;

    // 3. Conditional Branch Node (if business rules exist)
    if (intent.ruleGroups && intent.ruleGroups.length > 0) {
      yPosition += 130;
      const conditionNodeId = `node_condition_${nodeIndex++}`;
      nodes.push({
        id: conditionNodeId,
        type: 'logic:condition',
        name: 'Evaluate Business Criteria',
        config: {
          groups: intent.ruleGroups,
          summary: intent.ruleGroups.map((g) => `${g.logic} of ${g.rules.length} conditions`).join('; '),
        },
        enabled: true,
        position: { x: xCenter, y: yPosition },
      });

      edges.push({
        id: `edge_${prevNodeId}_${conditionNodeId}`,
        source: prevNodeId,
        target: conditionNodeId,
      });
      prevNodeId = conditionNodeId;
    }

    // 4. Human Approval Gateway (if configured)
    if (intent.approvalPolicy?.required) {
      yPosition += 130;
      const approvalNodeId = `node_approval_${nodeIndex++}`;
      nodes.push({
        id: approvalNodeId,
        type: 'approval:request',
        name: `Human Review (${intent.approvalPolicy.reviewerRole || 'Manager'})`,
        config: {
          policy: intent.approvalPolicy.condition,
          reviewerRole: intent.approvalPolicy.reviewerRole,
          thresholdAmount: intent.approvalPolicy.thresholdAmount,
        },
        enabled: true,
        position: { x: xCenter, y: yPosition },
      });

      edges.push({
        id: `edge_${prevNodeId}_${approvalNodeId}`,
        source: prevNodeId,
        target: approvalNodeId,
      });
      prevNodeId = approvalNodeId;
    }

    // 5. Configured Action Nodes
    for (const act of intent.actions) {
      // Skip the action if it was already handled by the primary AI node
      if (act.id === 'act_screen' || act.id === 'act_ocr') continue;

      yPosition += 130;
      const actionNodeId = `node_action_${nodeIndex++}`;
      nodes.push({
        id: actionNodeId,
        type: act.type,
        name: act.name,
        config: act.config || {},
        enabled: true,
        position: { x: xCenter, y: yPosition },
      });

      edges.push({
        id: `edge_${prevNodeId}_${actionNodeId}`,
        source: prevNodeId,
        target: actionNodeId,
      });
      prevNodeId = actionNodeId;
    }

    // 6. Explicit Result Sink / Output Destination Node
    yPosition += 130;
    const destNodeId = `node_dest_${nodeIndex++}`;
    nodes.push({
      id: destNodeId,
      type: 'destination:sink',
      name: `Record in ${intent.resultDestination.name}`,
      config: {
        destinationId: intent.resultDestination.id,
        summary: intent.resultDestination.summary,
      },
      enabled: true,
      position: { x: xCenter, y: yPosition },
    });

    edges.push({
      id: `edge_${prevNodeId}_${destNodeId}`,
      source: prevNodeId,
      target: destNodeId,
    });

    return {
      id: workflowId,
      name: intent.name,
      description: intent.goal,
      status: 'DRAFT',
      version: 1,
      triggerType,
      nodes,
      edges,
      humanSummary: intent.visualSummary,
      destinationSummary: intent.resultDestination.summary,
    };
  }
}
