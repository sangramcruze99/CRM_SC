import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlansService } from '../plans/plans.service';

export interface SafeEntitlementsResponse {
  tenantId: string;
  plan: string;
  status: string;
  billingInterval: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  features: Record<string, boolean>;
  limits: Record<string, number>;
  usage: Record<string, number>;
  hasEnterpriseContract: boolean;
}

@Injectable()
export class EntitlementService {
  private readonly logger = new Logger(EntitlementService.name);
  private cache = new Map<string, { data: any; expiry: number }>();
  private readonly CACHE_TTL_MS = 30_000; // 30s cache with immediate invalidation on events

  constructor(
    private readonly prisma: PrismaService,
    private readonly plansService: PlansService,
  ) {}

  /**
   * Invalidate cached entitlements for a tenant
   */
  invalidateCache(tenantId: string) {
    this.cache.delete(tenantId);
    this.logger.debug(`[Entitlements] Invalidated cache for tenant ${tenantId}`);
  }

  /**
   * Resolve authoritative effective plan and limits for tenant
   */
  private async resolveEffectivePlan(tenantId: string) {
    const cached = this.cache.get(tenantId);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    // 1. Check for Active Enterprise Contract
    const contract = await this.prisma.enterpriseContract.findFirst({
      where: { tenantId, status: 'ACTIVE', endDate: { gte: new Date() } },
    });

    // 2. Check for Active Local Subscription
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        tenantId,
        status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    const activePlanKey = contract?.planId || subscription?.planId || 'FREE';
    const plan = await this.plansService.getPlanByKey(activePlanKey).catch(() =>
      this.plansService.getPlanByKey('FREE'),
    );

    // Merge baseline features & limits
    const features: Record<string, boolean> = { ...plan.features };
    const limits: Record<string, number> = { ...plan.limits };

    // Apply contract customizations if present
    if (contract?.customEntitlements) {
      try {
        const customFeat = JSON.parse(contract.customEntitlements);
        Object.assign(features, customFeat);
      } catch {}
    }
    if (contract?.customLimits) {
      try {
        const customLim = JSON.parse(contract.customLimits);
        Object.assign(limits, customLim);
      } catch {}
    }

    // 3. Apply Tenant-specific Overrides
    const overrides = await this.prisma.tenantEntitlementOverride.findMany({
      where: {
        tenantId,
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
    });

    for (const ov of overrides) {
      if (ov.overrideType === 'BOOLEAN') {
        features[ov.featureKey] = ov.value === 'true';
      } else {
        const numVal = parseFloat(ov.value);
        if (!isNaN(numVal)) {
          limits[ov.featureKey] = numVal;
        }
      }
    }

    const result = {
      tenantId,
      planKey: plan.key,
      planName: plan.name,
      subscription: subscription || {
        status: contract ? 'ACTIVE' : 'TRIALING',
        billingInterval: 'monthly',
        currentPeriodStart: new Date(Date.now() - 30 * 86400000),
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
        cancelAtPeriodEnd: false,
      },
      features,
      limits,
      hasEnterpriseContract: !!contract,
    };

    this.cache.set(tenantId, { data: result, expiry: Date.now() + this.CACHE_TTL_MS });
    return result;
  }

  /**
   * Check if tenant is entitled to a boolean feature
   */
  async can(tenantId: string, featureKey: string): Promise<boolean> {
    const effective = await this.resolveEffectivePlan(tenantId);
    return Boolean(effective.features[featureKey]);
  }

  /**
   * Retrieve numerical limit for a metric
   */
  async limit(tenantId: string, resourceMetric: string): Promise<number> {
    const effective = await this.resolveEffectivePlan(tenantId);
    let key = resourceMetric;
    if (
      resourceMetric === 'ai_tokens' ||
      resourceMetric === 'ai.tokens.total' ||
      resourceMetric === 'aiTokens'
    ) {
      key = 'aiTokensMonthly';
    } else if (
      resourceMetric === 'workflow.executions' ||
      resourceMetric === 'workflows_executed' ||
      resourceMetric === 'workflows'
    ) {
      key = 'workflowExecutionsMonthly';
    }
    return effective.limits[key] ?? effective.limits[resourceMetric] ?? Infinity;
  }

  /**
   * Retrieve current usage for a metric during the active billing period
   */
  async usage(tenantId: string, resourceMetric: string): Promise<number> {
    const effective = await this.resolveEffectivePlan(tenantId);
    const periodStart = new Date(effective.subscription.currentPeriodStart);
    const periodEnd = new Date(effective.subscription.currentPeriodEnd);

    // Map common high-level metric keys to stored event metrics
    let dbMetrics: string[] = [resourceMetric];
    if (resourceMetric === 'aiTokens' || resourceMetric === 'aiTokensMonthly' || resourceMetric === 'ai_tokens' || resourceMetric === 'ai.tokens.total') {
      dbMetrics = ['ai.tokens.total', 'ai_tokens', 'aiTokens', 'aiTokensMonthly'];
    } else if (resourceMetric === 'workflows' || resourceMetric === 'workflowExecutionsMonthly' || resourceMetric === 'workflow.executions' || resourceMetric === 'workflows_executed') {
      dbMetrics = ['workflow.executions', 'workflows', 'workflowExecutionsMonthly'];
    }

    const aggregate = await this.prisma.usageEvent.aggregate({
      where: {
        tenantId,
        metric: { in: dbMetrics },
        timestamp: { gte: periodStart, lte: periodEnd },
      },
      _sum: { quantity: true },
    });

    return aggregate._sum.quantity || 0;
  }

  /**
   * Calculate remaining balance before quota exhaustion
   */
  async remaining(tenantId: string, resourceMetric: string): Promise<number> {
    const maxLimit = await this.limit(tenantId, resourceMetric);
    const currentUsage = await this.usage(tenantId, resourceMetric);
    return Math.max(0, maxLimit - currentUsage);
  }

  /**
   * Safe payload for frontend UI consumption
   */
  async getSafeEntitlements(tenantId: string): Promise<SafeEntitlementsResponse> {
    const effective = await this.resolveEffectivePlan(tenantId);

    const [aiTokensUsage, workflowUsage, usersCount] = await Promise.all([
      this.usage(tenantId, 'aiTokensMonthly'),
      this.usage(tenantId, 'workflowExecutionsMonthly'),
      this.prisma.user.count({ where: { tenantId } }).catch(() => 1),
    ]);

    return {
      tenantId,
      plan: effective.planKey,
      status: effective.subscription.status,
      billingInterval: effective.subscription.billingInterval,
      currentPeriodStart: new Date(effective.subscription.currentPeriodStart).toISOString(),
      currentPeriodEnd: new Date(effective.subscription.currentPeriodEnd).toISOString(),
      cancelAtPeriodEnd: Boolean(effective.subscription.cancelAtPeriodEnd),
      features: effective.features,
      limits: effective.limits,
      usage: {
        aiTokensMonthly: aiTokensUsage,
        workflowExecutionsMonthly: workflowUsage,
        users: usersCount,
      },
      hasEnterpriseContract: effective.hasEnterpriseContract,
    };
  }
}
