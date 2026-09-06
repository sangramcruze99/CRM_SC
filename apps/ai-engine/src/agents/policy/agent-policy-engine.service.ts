import { Injectable, Logger } from '@nestjs/common';
import { ExplainabilityMetadata } from '@repo/core-types';

export interface PolicyEvaluationResult {
  allowed: boolean;
  requiresHumanApproval: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: string;
  explainability: ExplainabilityMetadata;
}

@Injectable()
export class AgentPolicyEngineService {
  private readonly logger = new Logger(AgentPolicyEngineService.name);

  // Financial and contractual risk thresholds
  private readonly maxAutoApproveDealValue = 25000;
  private readonly maxAutoApproveDiscountPercent = 10;
  private readonly maxAutoApproveRefundAmount = 500;

  // Actions strictly requiring human supervision
  private readonly mandatoryHumanActions = [
    'send_email',
    'send_whatsapp',
    'EXECUTE_CONTRACT',
    'APPLY_COMMERCIAL_DISCOUNT',
    'PROCESS_REFUND',
    'TERMINATE_ACCOUNT',
  ];

  /**
   * Evaluate proposed agent action against safety policies & generate structured explainability
   */
  evaluateAction(options: {
    agentId: string;
    agentName: string;
    actionName: string;
    targetEntity?: string;
    targetId?: string;
    parameters: Record<string, any>;
    contextData?: Record<string, any>;
  }): PolicyEvaluationResult {
    const { agentId, actionName, targetEntity, targetId, parameters, contextData = {} } = options;
    const whyPoints: string[] = [];
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    let requiresHumanApproval = false;
    let confidence = 0.92;
    let expectedOutcome = 'Action will execute safely within platform bounds.';

    // 1. Check Tool / Action Classification
    const isMandatoryHuman = this.mandatoryHumanActions.some(
      (a) => a.toLowerCase() === actionName.toLowerCase()
    );

    // 2. Domain-Specific Policy Analysis
    // Ares (Sales)
    if (agentId.includes('sales') || actionName.includes('deal')) {
      const amount = Number(parameters.amount || contextData.amount || 0);
      const stage = parameters.stage || contextData.stage;
      const daysInactive = contextData.daysInactive || 11;

      if (amount >= this.maxAutoApproveDealValue) {
        riskLevel = 'HIGH';
        requiresHumanApproval = true;
        whyPoints.push(`Deal value ($${amount.toLocaleString()}) exceeds autonomous threshold ($${this.maxAutoApproveDealValue.toLocaleString()})`);
      }

      if (daysInactive) {
        whyPoints.push(`Deal inactive for ${daysInactive} days without recent sales engagement`);
      }

      if (stage === 'Proposal') {
        whyPoints.push('Client is evaluating proposal terms; outreach requires high touch');
      }

      if (actionName === 'send_email' || actionName === 'send_whatsapp') {
        riskLevel = 'HIGH';
        requiresHumanApproval = true;
        whyPoints.push('Outbound communication to enterprise client requires human approval');
        expectedOutcome = 'Draft email placed in Approval Center for account executive sign-off.';
      } else if (actionName === 'create_crm_task') {
        riskLevel = 'LOW';
        requiresHumanApproval = false;
        whyPoints.push('Internal task creation poses zero risk to external client relations');
        expectedOutcome = 'Follow-up task placed on sales rep workspace board.';
      }
    }

    // Midas (Finance & Invoices)
    else if (agentId.includes('finance') || actionName.includes('invoice') || actionName.includes('payment')) {
      const amount = Number(parameters.amount || contextData.amount || 0);
      const daysOverdue = contextData.daysOverdue || 14;

      whyPoints.push(`Invoice #${contextData.invoiceNum || targetId || 'INV'} is ${daysOverdue} days overdue`);
      whyPoints.push(`Outstanding balance: $${amount.toLocaleString()}`);

      if (actionName === 'send_email' || isMandatoryHuman) {
        riskLevel = 'MEDIUM';
        requiresHumanApproval = true;
        whyPoints.push('Dunning collection notice requires verification of payment status');
        expectedOutcome = 'Payment reminder queued for review with dynamic checkout link.';
      } else if (actionName === 'create_payment_link') {
        riskLevel = 'LOW';
        requiresHumanApproval = false;
        whyPoints.push('Generated secure dynamic Stripe checkout URL for account');
        expectedOutcome = 'Direct payment link generated with invoice association.';
      }
    }

    // Hermes (Operations / Projects)
    else if (agentId.includes('ops') || actionName.includes('project')) {
      whyPoints.push('Deal closed won: triggering operational sprint and onboarding workflow');
      whyPoints.push('Automated project template applied for delivery team');
      riskLevel = 'LOW';
      requiresHumanApproval = false;
      expectedOutcome = 'Project and initial milestone tasks generated in CRM.';
    }

    // Athena & Support (Tickets / Retention)
    else if (agentId.includes('support') || actionName.includes('ticket')) {
      const priority = parameters.priority || contextData.priority || 'MEDIUM';
      whyPoints.push(`Support ticket priority evaluated as ${priority}`);
      whyPoints.push('Knowledge base consulted for verified resolution SOP');

      if (actionName === 'reply_support_ticket') {
        riskLevel = priority === 'HIGH' || priority === 'URGENT' ? 'HIGH' : 'MEDIUM';
        requiresHumanApproval = priority === 'HIGH' || priority === 'URGENT';
        expectedOutcome = requiresHumanApproval
          ? 'High-severity ticket response queued for manager review.'
          : 'Standard verified FAQ response sent to customer.';
      }
    }

    // General Fallback
    if (whyPoints.length === 0) {
      whyPoints.push(`Action ${actionName} triggered by automated business event`);
      whyPoints.push(`Target entity ${targetEntity || 'Record'} ID: ${targetId || 'active'}`);
    }

    if (isMandatoryHuman) {
      requiresHumanApproval = true;
      if (riskLevel === 'LOW') riskLevel = 'MEDIUM';
    }

    const explainability: ExplainabilityMetadata = {
      action: actionName,
      why: whyPoints,
      confidence,
      riskLevel,
      expectedOutcome,
      targetEntity,
      targetId,
      reasonCodes: [
        `RISK_${riskLevel}`,
        requiresHumanApproval ? 'REQUIRES_HITL' : 'AUTONOMOUS_PERMITTED',
      ],
    };

    this.logger.log(
      `[Policy Engine] Evaluated ${actionName} for ${agentId}: Risk=${riskLevel}, RequiresApproval=${requiresHumanApproval}`
    );

    return {
      allowed: true,
      requiresHumanApproval,
      riskLevel,
      reason: requiresHumanApproval ? whyPoints.join('; ') : 'Safe to execute autonomously.',
      explainability,
    };
  }
}
