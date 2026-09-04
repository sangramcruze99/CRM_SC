import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AgentDefinition {
  id: string;
  name: string;
  role: string;
  domain: string;
  autonomyMode: 'AUTONOMOUS' | 'HYBRID' | 'MONITOR_ONLY';
  status: 'ACTIVE' | 'PAUSED' | 'EVALUATING';
  allowedTools: string[];
  totalDecisions: number;
  accuracyRate: number;
  lastActive: string;
}

export interface ProposedAction {
  id: string;
  agentId: string;
  agentName: string;
  actionType: string;
  targetEntity: string;
  targetId: string;
  targetName: string;
  confidence: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  rationale: string;
  parameters: Record<string, any>;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXECUTED_AUTONOMOUSLY';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface DecisionEngineResult {
  observe: {
    metricsAnalyzed: Record<string, any>;
    detectedAnomalies: string[];
  };
  predict: {
    event: string;
    probability: number;
    impactScore: number;
  };
  recommend: {
    action: string;
    confidence: number;
    rationale: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  act: {
    disposition: 'EXECUTED_AUTONOMOUSLY' | 'QUEUED_FOR_APPROVAL';
    actionId: string;
    details: string;
  };
}

export interface SafetyPolicy {
  confidenceThreshold: number; // e.g. 0.85
  maxValueAutoApprove: number; // e.g. 50000
  restrictedActions: string[];
  requireHumanForContractDiscounts: boolean;
}

export interface SwarmSweepResult {
  sweepId: string;
  timestamp: string;
  entitiesScanned: {
    contacts: number;
    deals: number;
    invoices: number;
    tickets: number;
    properties: number;
  };
  anomaliesDetected: number;
  autonomousActionsExecuted: number;
  actionsQueuedForApproval: number;
  actions: ProposedAction[];
  summary: string;
}

export interface MultiAgentCollaborationResult {
  chainId: string;
  timestamp: string;
  triggerEvent: string;
  leadSentinel: string;
  participants: string[];
  handoffSteps: {
    step: number;
    sentinelId: string;
    sentinelName: string;
    action: string;
    reasoning: string;
    status: 'COMPLETED' | 'HANDED_OFF' | 'QUEUED_FOR_APPROVAL';
  }[];
  finalOutcome: string;
}

@Injectable()
export class AgentFrameworkService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AgentFrameworkService.name);

  private agents: Map<string, AgentDefinition> = new Map();
  private pendingApprovals: ProposedAction[] = [];
  private decisionLog: DecisionEngineResult[] = [];
  private collaborationLogs: MultiAgentCollaborationResult[] = [];

  // Autonomous Daemon configuration
  private isDaemonActive = true;
  private sweepIntervalSeconds = 120;
  private daemonTimer: NodeJS.Timeout | null = null;
  private lastSweepTimestamp: string = new Date().toISOString();
  private totalSwarmSweeps = 42;

  // Policy Guardrails
  private safetyPolicy: SafetyPolicy = {
    confidenceThreshold: 0.85,
    maxValueAutoApprove: 50000,
    restrictedActions: ['APPLY_COMMERCIAL_DISCOUNT', 'CREDIT_HOLD_ENFORCEMENT', 'EXECUTIVE_ESCALATION'],
    requireHumanForContractDiscounts: true,
  };

  constructor(private prisma: PrismaService) {
    this.initializeDefaultAgents();
    this.seedSampleApprovals();
  }

  onModuleInit() {
    this.startDaemon();
  }

  onModuleDestroy() {
    this.stopDaemon();
  }

  private initializeDefaultAgents() {
    const defaultAgents: AgentDefinition[] = [
      {
        id: 'agent_sales',
        name: 'Ares Sales Intelligence Sentinel',
        role: 'Autonomous Pipeline Strategist',
        domain: 'Sales & Deal Velocity',
        autonomyMode: 'HYBRID',
        status: 'ACTIVE',
        allowedTools: ['ANALYZE_PIPELINE', 'DRAFT_PROPOSAL', 'ENROLL_SALES_SEQUENCE', 'CALCULATE_WIN_PROBABILITY'],
        totalDecisions: 1428,
        accuracyRate: 94.8,
        lastActive: new Date().toISOString(),
      },
      {
        id: 'agent_csm',
        name: 'Athena Customer Success Sentinel',
        role: 'Proactive Retention & Churn Sentinel',
        domain: 'Customer Retention & Health',
        autonomyMode: 'AUTONOMOUS',
        status: 'ACTIVE',
        allowedTools: ['EVALUATE_HEALTH', 'SCHEDULE_RETENTION_CALL', 'ESCALATE_TICKET', 'SURVEY_NPS'],
        totalDecisions: 2896,
        accuracyRate: 97.2,
        lastActive: new Date().toISOString(),
      },
      {
        id: 'agent_finance',
        name: 'Midas Treasury & Billing Sentinel',
        role: 'Cash-flow & AR Aging Guard',
        domain: 'Finance & Treasury',
        autonomyMode: 'HYBRID',
        status: 'ACTIVE',
        allowedTools: ['AUDIT_INVOICES', 'SEND_PAYMENT_REMINDER', 'CALCULATE_AR_AGING', 'FLAG_DISCREPANCY'],
        totalDecisions: 874,
        accuracyRate: 99.1,
        lastActive: new Date().toISOString(),
      },
      {
        id: 'agent_ops',
        name: 'Hermes Sprint & HR Orchestrator',
        role: 'Cross-functional Operations Coordinator',
        domain: 'Operations & Sprint Deliveries',
        autonomyMode: 'AUTONOMOUS',
        status: 'ACTIVE',
        allowedTools: ['MONITOR_SPRINT_SLA', 'PROVISION_ONBOARDING', 'AUDIT_COMPLIANCE'],
        totalDecisions: 642,
        accuracyRate: 96.5,
        lastActive: new Date().toISOString(),
      },
      {
        id: 'agent_vesta',
        name: 'Vesta Property & Escrow Sentinel',
        role: 'Real Estate Transaction & MLS Coordinator',
        domain: 'Real Estate & Brokerage Operations',
        autonomyMode: 'AUTONOMOUS',
        status: 'ACTIVE',
        allowedTools: [
          'AUDIT_ESCROW_CONTINGENCY',
          'CALCULATE_COMMISSION_SPLIT',
          'SCHEDULE_PROPERTY_SHOWING',
          'VERIFY_DISCLOSURES',
          'ANALYZE_MLS_VALUATION',
        ],
        totalDecisions: 486,
        accuracyRate: 98.4,
        lastActive: new Date().toISOString(),
      },
    ];

    for (const ag of defaultAgents) {
      this.agents.set(ag.id, ag);
    }
  }

  private seedSampleApprovals() {
    this.pendingApprovals = [
      {
        id: 'appr_001',
        agentId: 'agent_sales',
        agentName: 'Ares Sales Intelligence Sentinel',
        actionType: 'APPLY_COMMERCIAL_DISCOUNT',
        targetEntity: 'Deal',
        targetId: 'deal_hyperion_q3',
        targetName: 'Hyperion Enterprise Cloud Expansion',
        confidence: 0.93,
        riskLevel: 'HIGH',
        rationale: 'Elena Rostova viewed proposal 4 times in 24 hours. A 10% commercial concession ($18,500) will accelerate contract closing before quarter-end.',
        parameters: { originalAmount: 185000, discountPercent: 10, proposedAmount: 166500 },
        status: 'PENDING_APPROVAL',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'appr_002',
        agentId: 'agent_csm',
        agentName: 'Athena Customer Success Sentinel',
        actionType: 'EXECUTIVE_ESCALATION',
        targetEntity: 'Contact',
        targetId: 'cnt_sarah_lin',
        targetName: 'Sarah Lin (Nova Global FinTech)',
        confidence: 0.89,
        riskLevel: 'HIGH',
        rationale: 'Customer health score declined to 42/100 following 2 overdue invoices and 3 open API latency tickets. Recommend scheduling an immediate VP Engineering check-in.',
        parameters: { meetingType: 'RETENTION_SYNC', priority: 'URGENT' },
        status: 'PENDING_APPROVAL',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'appr_003',
        agentId: 'agent_finance',
        agentName: 'Midas Treasury & Billing Sentinel',
        actionType: 'CREDIT_HOLD_ENFORCEMENT',
        targetEntity: 'Company',
        targetId: 'comp_vertex',
        targetName: 'Vertex Autonomous AI',
        confidence: 0.95,
        riskLevel: 'MEDIUM',
        rationale: 'Invoice #INV-3981 is 45 days past due. Recommend pausing non-critical compute credits until outstanding balance ($14,200) is settled.',
        parameters: { invoiceId: 'inv_3981', balanceDue: 14200 },
        status: 'PENDING_APPROVAL',
        createdAt: new Date(Date.now() - 14400000).toISOString(),
      },
      {
        id: 'appr_004',
        agentId: 'agent_vesta',
        agentName: 'Vesta Property & Escrow Sentinel',
        actionType: 'ESCROW_CONTINGENCY_RELEASE',
        targetEntity: 'PropertyTransaction',
        targetId: 'escrow_ocean_blvd_702',
        targetName: '702 Ocean Blvd Penthouse ($2.45M)',
        confidence: 0.96,
        riskLevel: 'HIGH',
        rationale: 'Buyer loan commitment received & title search clear. Escrow contingency deadline in 48 hours. Require managing broker sign-off to proceed to closing.',
        parameters: { contractAmount: 2450000, earnestMoney: 120000, escrowStage: 'TITLE_CLEARED' },
        status: 'PENDING_APPROVAL',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
    ];
  }

  private startDaemon() {
    if (this.daemonTimer) return;
    this.isDaemonActive = true;
    this.logger.log(`Autonomous Background Daemon initialized (Sweep Interval: ${this.sweepIntervalSeconds}s)`);
    this.daemonTimer = setInterval(async () => {
      if (this.isDaemonActive) {
        try {
          await this.runFullSwarmSweep('default-tenant', true);
        } catch (err: any) {
          this.logger.warn(`Autonomous daemon sweep encountered error: ${err.message}`);
        }
      }
    }, this.sweepIntervalSeconds * 1000);
  }

  private stopDaemon() {
    if (this.daemonTimer) {
      clearInterval(this.daemonTimer);
      this.daemonTimer = null;
    }
    this.isDaemonActive = false;
  }

  toggleDaemon(enabled?: boolean) {
    if (enabled !== undefined) {
      this.isDaemonActive = enabled;
    } else {
      this.isDaemonActive = !this.isDaemonActive;
    }

    if (this.isDaemonActive && !this.daemonTimer) {
      this.startDaemon();
    }
    return { isDaemonActive: this.isDaemonActive, sweepIntervalSeconds: this.sweepIntervalSeconds };
  }

  getAgents(): AgentDefinition[] {
    return Array.from(this.agents.values());
  }

  getApprovals(): ProposedAction[] {
    return this.pendingApprovals;
  }

  getPolicy(): SafetyPolicy {
    return this.safetyPolicy;
  }

  updatePolicy(updated: Partial<SafetyPolicy>): SafetyPolicy {
    this.safetyPolicy = { ...this.safetyPolicy, ...updated };
    this.logger.log(`Updated Agent Safety Policy: ${JSON.stringify(this.safetyPolicy)}`);
    return this.safetyPolicy;
  }

  getTelemetry() {
    const totalDecisions = Array.from(this.agents.values()).reduce((acc, a) => acc + a.totalDecisions, 0);
    const pendingCount = this.pendingApprovals.filter(a => a.status === 'PENDING_APPROVAL').length;
    const approvedCount = this.pendingApprovals.filter(a => a.status === 'APPROVED').length;

    return {
      isDaemonActive: this.isDaemonActive,
      sweepIntervalSeconds: this.sweepIntervalSeconds,
      lastSweepTimestamp: this.lastSweepTimestamp,
      totalSwarmSweeps: this.totalSwarmSweeps,
      totalDecisions,
      pendingApprovalsCount: pendingCount,
      approvedCount,
      accuracyRate: 96.9,
      activeSentinelsCount: this.agents.size,
      policy: this.safetyPolicy,
    };
  }

  async runFullSwarmSweep(tenantId: string, fromDaemon = false): Promise<SwarmSweepResult> {
    const sweepId = `swp_${Date.now()}`;
    this.lastSweepTimestamp = new Date().toISOString();
    this.totalSwarmSweeps += 1;

    // Simulated multi-entity audit telemetry across Prisma
    const entitiesScanned = {
      contacts: 14,
      deals: 8,
      invoices: 12,
      tickets: 6,
      properties: 5,
    };

    const newActions: ProposedAction[] = [];

    // 1. Athena CSM Sentinel check
    const csmAction: ProposedAction = {
      id: `act_csm_${Date.now()}`,
      agentId: 'agent_csm',
      agentName: 'Athena Customer Success Sentinel',
      actionType: 'PROACTIVE_HEALTH_INTERVENTION',
      targetEntity: 'Contact',
      targetId: 'cnt_sarah_lin',
      targetName: 'Sarah Lin (Nova Global FinTech)',
      confidence: 0.94,
      riskLevel: 'LOW',
      rationale: 'Health score audit: Sent automatic survey & scheduled CSM touchpoint.',
      parameters: { action: 'EMAIL_SENT', template: 'HEALTH_CHECKIN' },
      status: 'EXECUTED_AUTONOMOUSLY',
      createdAt: new Date().toISOString(),
    };
    newActions.push(csmAction);

    // 2. Vesta Real Estate Sentinel check
    const vestaAction: ProposedAction = {
      id: `act_vst_${Date.now()}`,
      agentId: 'agent_vesta',
      agentName: 'Vesta Property & Escrow Sentinel',
      actionType: 'AUDIT_ESCROW_CONTINGENCY',
      targetEntity: 'PropertyListing',
      targetId: 'listing_sunset_402',
      targetName: 'Sunset Ridge Commercial Villa',
      confidence: 0.96,
      riskLevel: 'LOW',
      rationale: 'Inspection period expired with zero buyer objections. Escrow milestone marked Cleared.',
      parameters: { milestone: 'INSPECTION_CLEARED' },
      status: 'EXECUTED_AUTONOMOUSLY',
      createdAt: new Date().toISOString(),
    };
    newActions.push(vestaAction);

    // Increment agent counters
    for (const ag of this.agents.values()) {
      ag.totalDecisions += 2;
      ag.lastActive = new Date().toISOString();
    }

    const autoExecuted = newActions.filter(a => a.status === 'EXECUTED_AUTONOMOUSLY').length;
    const queuedApproval = newActions.filter(a => a.status === 'PENDING_APPROVAL').length;

    // Dispatch background event to Unified Event Bus
    try {
      await fetch('http://localhost:3009/workflows/events/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId || 'default-tenant',
        },
        body: JSON.stringify({
          type: 'AI_SWARM_SWEEP_COMPLETED',
          aggregateType: 'SwarmFleet',
          aggregateId: sweepId,
          payload: {
            fromDaemon,
            entitiesScanned,
            autonomousActionsExecuted: autoExecuted,
            actionsQueuedForApproval: queuedApproval,
          },
        }),
      });
    } catch {
      // ignore in offline test
    }

    this.logger.log(`Swarm sweep [${sweepId}] completed: ${autoExecuted} autonomous actions, ${queuedApproval} queued.`);

    return {
      sweepId,
      timestamp: this.lastSweepTimestamp,
      entitiesScanned,
      anomaliesDetected: 2,
      autonomousActionsExecuted: autoExecuted,
      actionsQueuedForApproval: queuedApproval,
      actions: newActions,
      summary: `Swarm sweep completed across ${Object.values(entitiesScanned).reduce((a, b) => a + b, 0)} business entities. ${autoExecuted} actions executed with 0 human intervention.`,
    };
  }

  async runMultiAgentCollaboration(tenantId: string, scenario: string, targetId: string): Promise<MultiAgentCollaborationResult> {
    const chainId = `chain_${Date.now()}`;

    const handoffSteps = [
      {
        step: 1,
        sentinelId: 'agent_csm',
        sentinelName: 'Athena Customer Success Sentinel',
        action: 'DETECT_CHURN_ANOMALY',
        reasoning: 'Customer health metric flagged at 42/100 due to open tickets. Requesting sales intervention.',
        status: 'COMPLETED' as const,
      },
      {
        step: 2,
        sentinelId: 'agent_sales',
        sentinelName: 'Ares Sales Intelligence Sentinel',
        action: 'CALCULATE_RETENTION_CONCESSION',
        reasoning: 'Calculated 10% contract renewal credit ($18,500). Verifying treasury terms with Midas.',
        status: 'HANDED_OFF' as const,
      },
      {
        step: 3,
        sentinelId: 'agent_finance',
        sentinelName: 'Midas Treasury & Billing Sentinel',
        action: 'VERIFY_AR_CREDIT_MARGIN',
        reasoning: 'Credit audit confirms enterprise client qualifies for restructured payment terms. Submitting to executive queue.',
        status: 'QUEUED_FOR_APPROVAL' as const,
      },
    ];

    const result: MultiAgentCollaborationResult = {
      chainId,
      timestamp: new Date().toISOString(),
      triggerEvent: scenario || 'ACCOUNT_RETENTION_INTERVENTION',
      leadSentinel: 'Athena Customer Success Sentinel',
      participants: ['Athena (CSM)', 'Ares (Sales)', 'Midas (Treasury)'],
      handoffSteps,
      finalOutcome: 'Collaborative resolution reached across 3 sentinels. High-value proposal submitted to approval center.',
    };

    this.collaborationLogs.unshift(result);

    // Publish event
    try {
      await fetch('http://localhost:3009/workflows/events/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId || 'default-tenant',
        },
        body: JSON.stringify({
          type: 'MULTI_AGENT_CHAIN_EXECUTED',
          aggregateType: 'CollaborationChain',
          aggregateId: chainId,
          payload: {
            scenario,
            participants: result.participants,
            finalOutcome: result.finalOutcome,
          },
        }),
      });
    } catch {
      // ignore
    }

    return result;
  }

  getCollaborationLogs(): MultiAgentCollaborationResult[] {
    return this.collaborationLogs;
  }

  approveAction(actionId: string, reviewedBy = 'Executive Admin'): ProposedAction {
    const item = this.pendingApprovals.find(a => a.id === actionId);
    if (!item) {
      throw new Error(`Approval item not found for ID: ${actionId}`);
    }

    item.status = 'APPROVED';
    item.reviewedBy = reviewedBy;
    item.reviewedAt = new Date().toISOString();

    const agent = this.agents.get(item.agentId);
    if (agent) {
      agent.totalDecisions += 1;
      agent.lastActive = new Date().toISOString();
    }

    // Publish approval event onto the Unified Event Bus
    fetch('http://localhost:3009/workflows/events/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': 'default-tenant',
      },
      body: JSON.stringify({
        type: 'HUMAN_APPROVAL_GRANTED',
        aggregateType: item.targetEntity,
        aggregateId: item.targetId,
        payload: {
          actionId: item.id,
          actionType: item.actionType,
          reviewedBy,
          parameters: item.parameters,
        },
      }),
    }).catch(() => {});

    this.logger.log(`Approved AI Agent action: ${item.actionType} on ${item.targetName} by ${reviewedBy}`);
    return item;
  }

  rejectAction(actionId: string, reviewedBy = 'Executive Admin'): ProposedAction {
    const item = this.pendingApprovals.find(a => a.id === actionId);
    if (!item) {
      throw new Error(`Approval item not found for ID: ${actionId}`);
    }

    item.status = 'REJECTED';
    item.reviewedBy = reviewedBy;
    item.reviewedAt = new Date().toISOString();

    this.logger.log(`Rejected AI Agent action: ${item.actionType} on ${item.targetName} by ${reviewedBy}`);
    return item;
  }

  async runDecisionLoop(tenantId: string, targetEntity: string, targetId: string): Promise<DecisionEngineResult> {
    // 1. Observe
    const observe = {
      metricsAnalyzed: {
        entityType: targetEntity,
        entityId: targetId,
        recentTouchpoints: 5,
        sentimentScore: 0.82,
        overdueItems: targetId.includes('lin') ? 2 : 0,
      },
      detectedAnomalies: targetId.includes('lin') ? ['Customer health dropped below 50% threshold'] : [],
    };

    // 2. Predict
    const isAtRisk = targetId.includes('lin');
    const predict = {
      event: isAtRisk ? 'CHURN_LIKELIHOOD_NEXT_30D' : 'EXPANSION_CONTRACT_CLOSURE',
      probability: isAtRisk ? 0.74 : 0.88,
      impactScore: isAtRisk ? 85 : 92,
    };

    // 3. Recommend
    const recommend = {
      action: isAtRisk ? 'TRIGGER_RETENTION_CONCIERGE' : 'SEND_EXECUTIVE_EXPANSION_DECK',
      confidence: 0.92,
      rationale: isAtRisk
        ? 'High probability of account churn detected due to invoice delinquency and support backlog.'
        : 'Strong engagement and positive sentiment index indicate optimal timing for upsell.',
      riskLevel: (isAtRisk ? 'HIGH' : 'LOW') as 'HIGH' | 'LOW',
    };

    // 4. Act with Safety Policy
    let disposition: 'EXECUTED_AUTONOMOUSLY' | 'QUEUED_FOR_APPROVAL' = 'EXECUTED_AUTONOMOUSLY';
    const actionId = `act_${Date.now()}`;

    if (
      recommend.riskLevel === 'HIGH' ||
      recommend.confidence < this.safetyPolicy.confidenceThreshold
    ) {
      disposition = 'QUEUED_FOR_APPROVAL';
      this.pendingApprovals.unshift({
        id: actionId,
        agentId: isAtRisk ? 'agent_csm' : 'agent_sales',
        agentName: isAtRisk ? 'Athena Customer Success Sentinel' : 'Ares Sales Intelligence Sentinel',
        actionType: recommend.action,
        targetEntity,
        targetId,
        targetName: `Account Target [${targetId}]`,
        confidence: recommend.confidence,
        riskLevel: recommend.riskLevel,
        rationale: recommend.rationale,
        parameters: { targetEntity, targetId },
        status: 'PENDING_APPROVAL',
        createdAt: new Date().toISOString(),
      });
    }

    const result: DecisionEngineResult = {
      observe,
      predict,
      recommend,
      act: {
        disposition,
        actionId,
        details: disposition === 'QUEUED_FOR_APPROVAL'
          ? 'High-risk action submitted to Managerial Approval Queue in accordance with Safety Policy.'
          : 'Low-risk action executed autonomously via Unified Event Bus.',
      },
    };

    this.decisionLog.unshift(result);
    return result;
  }
}
