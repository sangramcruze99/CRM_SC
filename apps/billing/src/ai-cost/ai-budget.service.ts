import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SetAiBudgetDto {
  tenantId: string;
  monthlyBudgetUsd: number;
  dailyBudgetUsd?: number;
  agentAllocations?: Record<string, number>; // e.g. { ares: 30, athena: 25, midas: 15 }
  actionOnExhaustion?: 'WARN' | 'THROTTLE' | 'BLOCK' | 'REQUIRE_APPROVAL';
  notifyEmails?: string[];
}

export type BudgetThreshold = 'NOMINAL' | 'THRESHOLD_50' | 'THRESHOLD_75' | 'THRESHOLD_80' | 'THRESHOLD_90' | 'EXHAUSTED';

@Injectable()
export class AiBudgetService {
  private readonly logger = new Logger(AiBudgetService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get or create default AI budget for a tenant
   */
  async getBudget(tenantId: string) {
    let budget = await this.prisma.aiBudget.findUnique({
      where: { tenantId },
    });

    if (!budget) {
      budget = await this.prisma.aiBudget.create({
        data: {
          tenantId,
          monthlyBudgetUsd: 100.0,
          dailyBudgetUsd: 10.0,
          agentAllocations: JSON.stringify({ ares: 30, athena: 25, midas: 15, other: 30 }),
          actionOnExhaustion: 'BLOCK',
          notifyEmails: '[]',
        },
      });
    }

    // Calculate current monthly spend from AiExecutionCost
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const spendAggregate = await this.prisma.aiExecutionCost.aggregate({
      where: {
        tenantId,
        timestamp: { gte: firstDayOfMonth },
      },
      _sum: { customerCharge: true, totalTokens: true },
    });

    const currentMonthlySpend = spendAggregate._sum.customerCharge || 0;
    const currentTokensConsumed = spendAggregate._sum.totalTokens || 0;

    const usageRatio = budget.monthlyBudgetUsd > 0 ? currentMonthlySpend / budget.monthlyBudgetUsd : 0;
    let threshold: BudgetThreshold = 'NOMINAL';

    if (usageRatio >= 1.0) {
      threshold = 'EXHAUSTED';
    } else if (usageRatio >= 0.9) {
      threshold = 'THRESHOLD_90';
    } else if (usageRatio >= 0.8) {
      threshold = 'THRESHOLD_80';
    } else if (usageRatio >= 0.75) {
      threshold = 'THRESHOLD_75';
    } else if (usageRatio >= 0.5) {
      threshold = 'THRESHOLD_50';
    }

    let parsedAllocations: Record<string, number> = {};
    try {
      parsedAllocations = JSON.parse(budget.agentAllocations || '{}');
    } catch {
      parsedAllocations = { ares: 30, athena: 25, midas: 15, other: 30 };
    }

    return {
      tenantId,
      monthlyBudgetUsd: budget.monthlyBudgetUsd,
      dailyBudgetUsd: budget.dailyBudgetUsd,
      currentMonthlySpend: Number(currentMonthlySpend.toFixed(4)),
      currentTokensConsumed,
      remainingBudgetUsd: Number(Math.max(0, budget.monthlyBudgetUsd - currentMonthlySpend).toFixed(4)),
      usagePercentage: Math.min(100, Math.round(usageRatio * 100)),
      threshold,
      actionOnExhaustion: budget.actionOnExhaustion,
      agentAllocations: parsedAllocations,
    };
  }

  /**
   * Configure AI budget and exhaustion action
   */
  async setBudget(dto: SetAiBudgetDto) {
    if (dto.monthlyBudgetUsd <= 0) {
      throw new BadRequestException('Monthly AI budget must be greater than 0');
    }

    const budget = await this.prisma.aiBudget.upsert({
      where: { tenantId: dto.tenantId },
      update: {
        monthlyBudgetUsd: dto.monthlyBudgetUsd,
        dailyBudgetUsd: dto.dailyBudgetUsd || dto.monthlyBudgetUsd / 10,
        agentAllocations: JSON.stringify(dto.agentAllocations || { ares: 30, athena: 25, midas: 15, other: 30 }),
        actionOnExhaustion: dto.actionOnExhaustion || 'BLOCK',
        notifyEmails: JSON.stringify(dto.notifyEmails || []),
      },
      create: {
        tenantId: dto.tenantId,
        monthlyBudgetUsd: dto.monthlyBudgetUsd,
        dailyBudgetUsd: dto.dailyBudgetUsd || dto.monthlyBudgetUsd / 10,
        agentAllocations: JSON.stringify(dto.agentAllocations || { ares: 30, athena: 25, midas: 15, other: 30 }),
        actionOnExhaustion: dto.actionOnExhaustion || 'BLOCK',
        notifyEmails: JSON.stringify(dto.notifyEmails || []),
      },
    });

    this.logger.log(`[AiBudget] Updated AI budget for ${dto.tenantId}: $${dto.monthlyBudgetUsd}/mo, action: ${dto.actionOnExhaustion}`);
    return this.getBudget(dto.tenantId);
  }

  /**
   * Check if an AI execution is allowed under current budget constraints
   */
  async checkHeadroom(tenantId: string, estimatedCostUsd = 0.01, agentId?: string): Promise<{
    allowed: boolean;
    action: 'ALLOW' | 'WARN' | 'THROTTLE' | 'BLOCK' | 'REQUIRE_APPROVAL';
    threshold: BudgetThreshold;
    currentSpend: number;
    budgetLimit: number;
    remaining: number;
    reason?: string;
  }> {
    const budgetStatus = await this.getBudget(tenantId);

    if (budgetStatus.currentMonthlySpend + estimatedCostUsd > budgetStatus.monthlyBudgetUsd) {
      const action = budgetStatus.actionOnExhaustion;
      const isAllowed = action === 'WARN';

      return {
        allowed: isAllowed,
        action: action as any,
        threshold: 'EXHAUSTED',
        currentSpend: budgetStatus.currentMonthlySpend,
        budgetLimit: budgetStatus.monthlyBudgetUsd,
        remaining: 0,
        reason: `Monthly AI budget of $${budgetStatus.monthlyBudgetUsd} exhausted (Current: $${budgetStatus.currentMonthlySpend}). Action: ${action}`,
      };
    }

    return {
      allowed: true,
      action: budgetStatus.threshold === 'THRESHOLD_90' ? 'WARN' : 'ALLOW',
      threshold: budgetStatus.threshold,
      currentSpend: budgetStatus.currentMonthlySpend,
      budgetLimit: budgetStatus.monthlyBudgetUsd,
      remaining: budgetStatus.remainingBudgetUsd,
    };
  }
}
