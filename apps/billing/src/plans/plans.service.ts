import { Injectable, Logger, OnModuleInit, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface PlanConfig {
  key: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  stripeMonthlyPriceId?: string;
  stripeAnnualPriceId?: string;
  features: Record<string, boolean>;
  limits: Record<string, number>;
}

export const CANONICAL_PLANS: PlanConfig[] = [
  {
    key: 'FREE',
    name: 'Free Community',
    description: 'Basic CRM & entry-level exploration for solo founders.',
    monthlyPrice: 0,
    annualPrice: 0,
    features: {
      'crm.basic': true,
      'crm.deals': true,
      'ai.agents.use': true,
      'workflows.basic': true,
      'workflows.advanced': false,
      'marketplace.install': false,
      'analytics.advanced': false,
      'enterprise.sso': false,
      'enterprise.audit': false,
    },
    limits: {
      users: 2,
      workflows: 5,
      workflowExecutionsMonthly: 500,
      aiTokensMonthly: 100_000,
      storageBytes: 1 * 1024 * 1024 * 1024, // 1 GB
      apiRequestsDaily: 1_000,
    },
  },
  {
    key: 'STARTER',
    name: 'Starter Growth',
    description: 'Emerging teams scaling pipeline velocity and standard workflows.',
    monthlyPrice: 49,
    annualPrice: 470, // ~20% annual discount
    stripeMonthlyPriceId: 'price_starter_monthly',
    stripeAnnualPriceId: 'price_starter_annual',
    features: {
      'crm.basic': true,
      'crm.deals': true,
      'ai.agents.use': true,
      'workflows.basic': true,
      'workflows.advanced': true,
      'marketplace.install': true,
      'analytics.advanced': false,
      'enterprise.sso': false,
      'enterprise.audit': false,
    },
    limits: {
      users: 5,
      workflows: 25,
      workflowExecutionsMonthly: 5_000,
      aiTokensMonthly: 1_000_000,
      storageBytes: 10 * 1024 * 1024 * 1024, // 10 GB
      apiRequestsDaily: 10_000,
    },
  },
  {
    key: 'BUSINESS',
    name: 'Business Standard',
    description: 'Full CRM, autonomous AI departments, and advanced team collaboration.',
    monthlyPrice: 149,
    annualPrice: 1430,
    stripeMonthlyPriceId: 'price_business_monthly',
    stripeAnnualPriceId: 'price_business_annual',
    features: {
      'crm.basic': true,
      'crm.deals': true,
      'ai.agents.use': true,
      'ai.departments.sales': true,
      'ai.departments.cs': true,
      'ai.departments.finance': true,
      'workflows.basic': true,
      'workflows.advanced': true,
      'marketplace.install': true,
      'analytics.advanced': true,
      'enterprise.sso': false,
      'enterprise.audit': true,
    },
    limits: {
      users: 15,
      workflows: 100,
      workflowExecutionsMonthly: 25_000,
      aiTokensMonthly: 5_000_000,
      storageBytes: 50 * 1024 * 1024 * 1024, // 50 GB
      apiRequestsDaily: 50_000,
    },
  },
  {
    key: 'PRO',
    name: 'Pro Autonomous Intelligence',
    description: 'High-velocity enterprises deploying 24/7 autonomous sentinels and unlimited workflows.',
    monthlyPrice: 349,
    annualPrice: 3350,
    stripeMonthlyPriceId: 'price_pro_monthly',
    stripeAnnualPriceId: 'price_pro_annual',
    features: {
      'crm.basic': true,
      'crm.deals': true,
      'ai.agents.use': true,
      'ai.departments.sales': true,
      'ai.departments.cs': true,
      'ai.departments.finance': true,
      'ai.departments.operations': true,
      'ai.departments.realestate': true,
      'ai.departments.ecommerce': true,
      'workflows.basic': true,
      'workflows.advanced': true,
      'marketplace.install': true,
      'analytics.advanced': true,
      'enterprise.sso': false,
      'enterprise.audit': true,
    },
    limits: {
      users: 50,
      workflows: 500,
      workflowExecutionsMonthly: 100_000,
      aiTokensMonthly: 25_000_000,
      storageBytes: 250 * 1024 * 1024 * 1024, // 250 GB
      apiRequestsDaily: 250_000,
    },
  },
  {
    key: 'ENTERPRISE',
    name: 'Enterprise Bespoke',
    description: 'Custom governance, dedicated infrastructure, SAML SSO, and unlimited SLAs.',
    monthlyPrice: 999,
    annualPrice: 9590,
    stripeMonthlyPriceId: 'price_enterprise_monthly',
    stripeAnnualPriceId: 'price_enterprise_annual',
    features: {
      'crm.basic': true,
      'crm.deals': true,
      'ai.agents.use': true,
      'ai.departments.sales': true,
      'ai.departments.cs': true,
      'ai.departments.finance': true,
      'ai.departments.operations': true,
      'ai.departments.realestate': true,
      'ai.departments.ecommerce': true,
      'workflows.basic': true,
      'workflows.advanced': true,
      'marketplace.install': true,
      'analytics.advanced': true,
      'enterprise.sso': true,
      'enterprise.scim': true,
      'enterprise.audit': true,
      'enterprise.customAiPolicies': true,
    },
    limits: {
      users: 1_000,
      workflows: 10_000,
      workflowExecutionsMonthly: 2_000_000,
      aiTokensMonthly: 200_000_000,
      storageBytes: 2 * 1024 * 1024 * 1024 * 1024, // 2 TB
      apiRequestsDaily: 2_000_000,
    },
  },
];

@Injectable()
export class PlansService implements OnModuleInit {
  private readonly logger = new Logger(PlansService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedCanonicalPlans();
  }

  async seedCanonicalPlans() {
    this.logger.log('[Plans] Checking canonical plan catalog in database...');
    for (const plan of CANONICAL_PLANS) {
      await this.prisma.plan.upsert({
        where: { key: plan.key },
        update: {
          name: plan.name,
          description: plan.description,
          monthlyPrice: plan.monthlyPrice,
          annualPrice: plan.annualPrice,
          stripeMonthlyPriceId: plan.stripeMonthlyPriceId,
          stripeAnnualPriceId: plan.stripeAnnualPriceId,
          features: JSON.stringify(plan.features),
          limits: JSON.stringify(plan.limits),
        },
        create: {
          key: plan.key,
          name: plan.name,
          description: plan.description,
          monthlyPrice: plan.monthlyPrice,
          annualPrice: plan.annualPrice,
          stripeMonthlyPriceId: plan.stripeMonthlyPriceId,
          stripeAnnualPriceId: plan.stripeAnnualPriceId,
          features: JSON.stringify(plan.features),
          limits: JSON.stringify(plan.limits),
        },
      });
    }
    this.logger.log(`[Plans] Seeded ${CANONICAL_PLANS.length} canonical plans in database.`);
  }

  async getAllPlans() {
    const plans = await this.prisma.plan.findMany({
      where: { active: true },
      orderBy: { monthlyPrice: 'asc' },
    });

    return plans.map((p) => ({
      ...p,
      features: JSON.parse(p.features || '{}'),
      limits: JSON.parse(p.limits || '{}'),
    }));
  }

  async getPlanByKey(key: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { key: key.toUpperCase() },
    });
    if (!plan) {
      throw new NotFoundException(`Plan with key "${key}" does not exist in catalog`);
    }

    return {
      ...plan,
      features: JSON.parse(plan.features || '{}'),
      limits: JSON.parse(plan.limits || '{}'),
    };
  }
}
