import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { StripeService } from './stripe/stripe.service';
import { PlansService } from './plans/plans.service';
import { EntitlementService } from './entitlements/entitlement.service';
import { UsageService } from './usage/usage.service';
import { StripeWebhookService } from './webhooks/stripe-webhook.service';
import { ReconciliationService } from './reconciliation/reconciliation.service';
import { EnterpriseService } from './enterprise/enterprise.service';
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
  ],
  exports: [
    StripeService,
    PlansService,
    EntitlementService,
    UsageService,
    StripeWebhookService,
    ReconciliationService,
    EnterpriseService,
  ],
})
export class AppModule {}
