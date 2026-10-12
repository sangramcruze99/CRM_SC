import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from './prisma/prisma.service';
import { ReconciliationService } from './reconciliation/reconciliation.service';
import { EnterpriseService, CreateEnterpriseContractDto } from './enterprise/enterprise.service';

@Controller('admin/billing')
export class AdminBillingController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reconciliationService: ReconciliationService,
    private readonly enterpriseService: EnterpriseService,
  ) {}

  private assertAdmin(req: Request) {
    const user = (req as any)?.user;
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      throw new ForbiddenException('Admin or Superadmin privileges required for admin billing endpoints');
    }
  }

  /**
   * List all tenants with plan, subscription status, and revenue
   */
  @Get('tenants')
  async listTenants(@Req() req: Request) {
    this.assertAdmin(req);
    const tenants = await this.prisma.tenant.findMany({
      include: {
        users: { select: { id: true, email: true } },
      },
    });

    const subscriptions = await this.prisma.subscription.findMany();
    const subMap = new Map(subscriptions.map((s) => [s.tenantId, s]));

    return tenants.map((t) => {
      const sub = subMap.get(t.id);
      return {
        tenantId: t.id,
        tenantName: t.name,
        userCount: t.users.length,
        planId: sub?.planId || 'FREE',
        status: sub?.status || 'TRIALING',
        billingInterval: sub?.billingInterval || 'monthly',
        currentPeriodEnd: sub?.currentPeriodEnd,
      };
    });
  }

  /**
   * Audit reconciliation between local DB and Stripe
   */
  @Get('reconciliation')
  async getReconciliationReport(@Req() req: Request) {
    this.assertAdmin(req);
    return this.reconciliationService.runReconciliationAudit(true);
  }

  /**
   * Set custom tenant entitlement override
   */
  @Post('entitlements/override')
  async setOverride(
    @Req() req: Request,
    @Body()
    body: {
      tenantId: string;
      featureKey: string;
      overrideType: 'BOOLEAN' | 'LIMIT' | 'QUOTA';
      value: string;
      reason?: string;
      createdBy?: string;
    },
  ) {
    this.assertAdmin(req);
    return this.enterpriseService.setOverride(body);
  }

  /**
   * Create bespoke Enterprise Contract
   */
  @Post('enterprise/contract')
  async createEnterpriseContract(@Req() req: Request, @Body() body: CreateEnterpriseContractDto) {
    this.assertAdmin(req);
    return this.enterpriseService.createContract(body);
  }

  /**
   * Platform-Wide AI Unit Economics (Provider Cost vs Subscription Revenue)
   */
  @Get('unit-economics')
  async getUnitEconomics(@Req() req: Request) {
    this.assertAdmin(req);
    const [usageStats, activeSubscriptions, plans] = await Promise.all([
      this.prisma.usageEvent.aggregate({
        where: { metric: 'ai.tokens.total' },
        _sum: { quantity: true, estimatedCost: true },
        _count: { id: true },
      }),
      this.prisma.subscription.findMany({
        where: { status: 'ACTIVE' },
      }),
      this.prisma.plan.findMany(),
    ]);

    const planPriceMap = new Map(plans.map((p) => [p.key, p.monthlyPrice]));

    // Calculate total MRR
    let totalMrr = 0;
    for (const sub of activeSubscriptions) {
      const price = planPriceMap.get(sub.planId) || 0;
      totalMrr += sub.billingInterval === 'annual' ? price * 0.8 : price;
    }

    const totalProviderAiCost = usageStats._sum.estimatedCost || 0;
    const totalAiTokensServed = usageStats._sum.quantity || 0;
    const totalInferenceCalls = usageStats._count.id || 0;

    const grossMarginPercent =
      totalMrr > 0 ? Math.round(((totalMrr - totalProviderAiCost) / totalMrr) * 100) : 100;

    return {
      monthlyRecurringRevenue: totalMrr,
      annualRecurringRevenue: totalMrr * 12,
      activePaidTenants: activeSubscriptions.length,
      aiUnitEconomics: {
        totalAiTokensServed,
        totalInferenceCalls,
        totalProviderAiCost: Number(totalProviderAiCost.toFixed(4)),
        aiCostPercentOfMrr: totalMrr > 0 ? Number(((totalProviderAiCost / totalMrr) * 100).toFixed(2)) : 0,
        grossMarginPercent,
      },
      healthIndicator: grossMarginPercent > 70 ? 'HEALTHY_SaaS_MARGINS' : 'HIGH_AI_BURN',
    };
  }
}
