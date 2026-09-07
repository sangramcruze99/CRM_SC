import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { StripeService } from './stripe/stripe.service';
import { PlansService } from './plans/plans.service';
import { EntitlementService } from './entitlements/entitlement.service';
import { UsageService } from './usage/usage.service';
import { StripeWebhookService } from './webhooks/stripe-webhook.service';
import { ReconciliationService } from './reconciliation/reconciliation.service';
import { EnterpriseService } from './enterprise/enterprise.service';
import { CreditsService } from './credits/credits.service';
import { AiCostService } from './ai-cost/ai-cost.service';
import { AiBudgetService } from './ai-cost/ai-budget.service';
import { CurrenciesService } from './pricing/currencies.service';
import { CouponsService } from './promotions/coupons.service';
import { AiKillSwitchesService } from './governance/ai-kill-switches.service';
import { CircuitBreakerService } from './resilience/circuit-breaker.service';
import { SubscriptionStateMachineService } from './lifecycle/subscription-state-machine.service';
import { BillingController } from './billing.controller';
import { AdminBillingController } from './admin-billing.controller';

@Module({
  imports: [PrismaModule],
  controllers: [BillingController, AdminBillingController],
  providers: [
    StripeService,
    PlansService,
    EntitlementService,
    UsageService,
    StripeWebhookService,
    ReconciliationService,
    EnterpriseService,
    CreditsService,
    AiCostService,
    AiBudgetService,
    CurrenciesService,
    CouponsService,
    AiKillSwitchesService,
    CircuitBreakerService,
    SubscriptionStateMachineService,
  ],
  exports: [
    StripeService,
    PlansService,
    EntitlementService,
    UsageService,
    StripeWebhookService,
    ReconciliationService,
    EnterpriseService,
    CreditsService,
    AiCostService,
    AiBudgetService,
    CurrenciesService,
    CouponsService,
    AiKillSwitchesService,
    CircuitBreakerService,
    SubscriptionStateMachineService,
  ],
})
export class AppModule {}

