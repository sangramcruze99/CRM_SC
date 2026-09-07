import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EntitlementService } from '../entitlements/entitlement.service';

export interface RecordUsageDto {
  tenantId: string;
  metric: string;
  quantity: number;
  source: string;
  sourceId?: string;
  agentId?: string;
  workflowId?: string;
  executionId?: string;
  userId?: string;
  provider?: string;
  model?: string;
  estimatedCost?: number;
  idempotencyKey: string;
  timestamp?: Date;
}

export interface QuotaEvaluationResult {
  allowed: boolean;
  currentUsage: number;
  maxLimit: number;
  usagePercent: number;
  thresholdStatus: 'NOMINAL' | 'WARNING_80' | 'WARNING_90' | 'EXHAUSTED';
  action: 'ALLOW' | 'BLOCK' | 'ALLOW_OVERAGE';
}

@Injectable()
export class UsageService {
  private readonly logger = new Logger(UsageService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly entitlementService: EntitlementService,
  ) {}

  /**
   * Idempotently record a billable usage event
   */
  async recordUsage(dto: RecordUsageDto) {
    const {
      tenantId,
      metric,
      quantity,
      source,
      sourceId,
      agentId,
      workflowId,
      executionId,
      userId,
      provider,
      model,
      estimatedCost = 0,
      idempotencyKey,
      timestamp = new Date(),
    } = dto;

    // 1. Check idempotency
    const existing = await this.prisma.usageEvent.findUnique({
      where: { idempotencyKey },
    });
    if (existing) {
      this.logger.debug(`[Usage] Idempotent hit: event ${idempotencyKey} already processed`);
      return existing;
    }

    // 2. Persist Usage Event
    const event = await this.prisma.usageEvent.create({
      data: {
        tenantId,
        metric,
        quantity,
        source,
        sourceId,
        agentId,
        workflowId,
        executionId,
        userId,
        provider,
        model,
        estimatedCost,
        idempotencyKey,
        timestamp,
      },
    });

    // 3. Roll up into Daily Aggregate
    const dateStr = timestamp.toISOString().split('T')[0];
    try {
      await this.prisma.usageDailyAggregate.upsert({
        where: {
          tenantId_metric_date: {
            tenantId,
            metric,
            date: dateStr,
          },
        },
        update: {
          totalQuantity: { increment: quantity },
          totalCost: { increment: estimatedCost },
          eventCount: { increment: 1 },
        },
        create: {
          tenantId,
          metric,
          date: dateStr,
          totalQuantity: quantity,
          totalCost: estimatedCost,
          eventCount: 1,
        },
      });
    } catch (err: any) {
      this.logger.warn(`Daily aggregate update warning: ${err.message}`);
    }

    return event;
  }

  /**
   * Evaluate if a tenant can consume an additional unit before hitting hard blocks
   */
  async evaluateQuota(tenantId: string, metric: string, requestedAmount: number = 1): Promise<QuotaEvaluationResult> {
    const maxLimit = await this.entitlementService.limit(tenantId, metric);
    const currentUsage = await this.entitlementService.usage(tenantId, metric);
    const projectedUsage = currentUsage + requestedAmount;
    const usagePercent = maxLimit > 0 && maxLimit !== Infinity ? Math.round((currentUsage / maxLimit) * 100) : 0;

    let thresholdStatus: 'NOMINAL' | 'WARNING_80' | 'WARNING_90' | 'EXHAUSTED' = 'NOMINAL';
    if (usagePercent >= 100 || projectedUsage > maxLimit) {
      thresholdStatus = 'EXHAUSTED';
    } else if (usagePercent >= 90) {
      thresholdStatus = 'WARNING_90';
    } else if (usagePercent >= 80) {
      thresholdStatus = 'WARNING_80';
    }

    // Policy check: FREE and STARTER block at 100%. BUSINESS and above can allow overage if configured.
    const effective = await this.entitlementService.getSafeEntitlements(tenantId);
    const isEnterpriseOrPro = ['PRO', 'ENTERPRISE'].includes(effective.plan);

    let allowed = true;
    let action: 'ALLOW' | 'BLOCK' | 'ALLOW_OVERAGE' = 'ALLOW';

    if (projectedUsage > maxLimit) {
      if (isEnterpriseOrPro) {
        allowed = true;
        action = 'ALLOW_OVERAGE';
      } else {
        allowed = false;
        action = 'BLOCK';
      }
    }

    return {
      allowed,
      currentUsage,
      maxLimit,
      usagePercent,
      thresholdStatus,
      action,
    };
  }

  /**
   * Retrieve multi-dimensional usage analytics for dashboard
   */
  async getUsageAnalytics(tenantId: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

    const [events, aggregates] = await Promise.all([
      this.prisma.usageEvent.findMany({
        where: { tenantId, timestamp: { gte: thirtyDaysAgo } },
        orderBy: { timestamp: 'desc' },
        take: 100,
      }),
      this.prisma.usageDailyAggregate.findMany({
        where: { tenantId, createdAt: { gte: thirtyDaysAgo } },
        orderBy: { date: 'asc' },
      }),
    ]);

    // Breakdown by Agent
    const byAgent: Record<string, { tokens: number; cost: number; calls: number }> = {};
    const byProvider: Record<string, { tokens: number; cost: number }> = {};
    const byModel: Record<string, { tokens: number; calls: number }> = {};

    let totalTokens = 0;
    let totalEstimatedCost = 0;

    for (const ev of events) {
      if (ev.metric === 'ai.tokens.total') {
        totalTokens += ev.quantity;
        totalEstimatedCost += ev.estimatedCost || 0;

        const agent = ev.agentId || 'general_copilot';
        if (!byAgent[agent]) byAgent[agent] = { tokens: 0, cost: 0, calls: 0 };
        byAgent[agent].tokens += ev.quantity;
        byAgent[agent].cost += ev.estimatedCost || 0;
        byAgent[agent].calls += 1;

        const provider = ev.provider || 'groq';
        if (!byProvider[provider]) byProvider[provider] = { tokens: 0, cost: 0 };
        byProvider[provider].tokens += ev.quantity;
        byProvider[provider].cost += ev.estimatedCost || 0;

        const model = ev.model || 'llama-3.3-70b';
        if (!byModel[model]) byModel[model] = { tokens: 0, calls: 0 };
        byModel[model].tokens += ev.quantity;
        byModel[model].calls += 1;
      }
    }

    return {
      tenantId,
      totalTokens,
      totalEstimatedCost: Number(totalEstimatedCost.toFixed(4)),
      breakdown: {
        byAgent,
        byProvider,
        byModel,
      },
      dailyHistory: aggregates,
      recentEvents: events.slice(0, 10).map((e) => ({
        id: e.id,
        metric: e.metric,
        quantity: e.quantity,
        source: e.source,
        agentId: e.agentId,
        provider: e.provider,
        model: e.model,
        timestamp: e.timestamp,
      })),
    };
  }
}
