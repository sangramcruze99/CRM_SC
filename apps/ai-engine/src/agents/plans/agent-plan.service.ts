import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { AgentPlan, AgentPlanStep, AgentPlanStepStatus } from '@repo/core-types';

@Injectable()
export class AgentPlanService {
  private readonly logger = new Logger(AgentPlanService.name);
  private plans: Map<string, AgentPlan> = new Map();

  /**
   * Create a structured, executable agent plan with sequenced steps
   */
  createPlan(options: {
    agentId: string;
    tenantId: string;
    goal: string;
    steps: Array<{
      action: string;
      description: string;
      riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      requiresApproval?: boolean;
      targetEntity?: string;
      targetId?: string;
      parameters?: Record<string, any>;
    }>;
  }): AgentPlan {
    const planId = `plan_${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const formattedSteps: AgentPlanStep[] = options.steps.map((step, idx) => ({
      id: `step_${idx + 1}_${step.action.toLowerCase()}`,
      action: step.action,
      description: step.description,
      status: 'PENDING',
      riskLevel: step.riskLevel || 'LOW',
      requiresApproval: step.requiresApproval || (step.riskLevel === 'HIGH' || step.riskLevel === 'CRITICAL'),
      targetEntity: step.targetEntity,
      targetId: step.targetId,
      parameters: step.parameters || {},
    }));

    const plan: AgentPlan = {
      id: planId,
      agentId: options.agentId,
      tenantId: options.tenantId,
      goal: options.goal,
      status: 'PLANNED',
      steps: formattedSteps,
      createdAt: now,
      updatedAt: now,
    };

    this.plans.set(planId, plan);
    this.logger.log(`[Plan Service] Created plan ${planId} (${options.goal}) with ${formattedSteps.length} steps`);
    return plan;
  }

  getPlan(planId: string): AgentPlan | undefined {
    return this.plans.get(planId);
  }

  getNextPendingStep(planId: string): AgentPlanStep | null {
    const plan = this.plans.get(planId);
    if (!plan) return null;
    return plan.steps.find((s: AgentPlanStep) => s.status === 'PENDING') || null;
  }

  updateStepStatus(
    planId: string,
    stepId: string,
    status: AgentPlanStepStatus,
    result?: any,
    error?: string
  ): AgentPlanStep | null {
    const plan = this.plans.get(planId);
    if (!plan) return null;

    const step = plan.steps.find((s: AgentPlanStep) => s.id === stepId);
    if (!step) return null;

    step.status = status;
    const now = new Date().toISOString();
    if (status === 'RUNNING') step.startedAt = now;
    if (status === 'COMPLETED' || status === 'FAILED') step.completedAt = now;
    if (result !== undefined) step.result = result;
    if (error !== undefined) step.error = error;

    plan.updatedAt = now;

    // Update overall plan status
    const allCompleted = plan.steps.every((s: AgentPlanStep) => s.status === 'COMPLETED' || s.status === 'SKIPPED');
    const anyFailed = plan.steps.some((s: AgentPlanStep) => s.status === 'FAILED');
    const waitingApproval = plan.steps.some((s: AgentPlanStep) => s.status === 'WAITING_APPROVAL');

    if (allCompleted) {
      plan.status = 'COMPLETED';
    } else if (anyFailed) {
      plan.status = 'FAILED';
    } else if (waitingApproval) {
      plan.status = 'PAUSED';
    } else {
      plan.status = 'EXECUTING';
    }

    return step;
  }

  listPlans(tenantId: string, limit: number = 20): AgentPlan[] {
    return Array.from(this.plans.values())
      .filter((p) => p.tenantId === tenantId)
      .slice(0, limit);
  }
}
