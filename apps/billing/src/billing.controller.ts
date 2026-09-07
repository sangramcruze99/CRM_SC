import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  Req,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { PlansService } from './plans/plans.service';
import { EntitlementService } from './entitlements/entitlement.service';
import { UsageService, RecordUsageDto } from './usage/usage.service';
import { StripeService } from './stripe/stripe.service';
import { StripeWebhookService } from './webhooks/stripe-webhook.service';
import { PrismaService } from './prisma/prisma.service';
import { CreditsService } from './credits/credits.service';
import { AiCostService } from './ai-cost/ai-cost.service';
import { AiBudgetService } from './ai-cost/ai-budget.service';
import { CurrenciesService } from './pricing/currencies.service';
import { CouponsService } from './promotions/coupons.service';
import { AiKillSwitchesService } from './governance/ai-kill-switches.service';
import { CircuitBreakerService } from './resilience/circuit-breaker.service';
import { SubscriptionStateMachineService, SubscriptionState } from './lifecycle/subscription-state-machine.service';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly plansService: PlansService,
    private readonly entitlementService: EntitlementService,
    private readonly usageService: UsageService,
    private readonly stripeService: StripeService,
    private readonly webhookService: StripeWebhookService,
    private readonly prisma: PrismaService,
    private readonly creditsService: CreditsService,
    private readonly aiCostService: AiCostService,
    private readonly aiBudgetService: AiBudgetService,
    private readonly currenciesService: CurrenciesService,
    private readonly couponsService: CouponsService,
    private readonly killSwitchesService: AiKillSwitchesService,
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly stateMachineService: SubscriptionStateMachineService,
  ) {}

  private extractTenantId(headers: Record<string, any>): string {
    return (
      headers['x-tenant-id'] ||
      headers['X-Tenant-Id'] ||
      headers['x-tenant'] ||
      (headers as any)?.tenantid ||
      'default-tenant'
    );
  }

  /**
   * List all database-backed plans
   */
  @Get('plan')
  async getPlans() {
    return this.plansService.getAllPlans();
  }

  /**
   * Get specific plan by key
   */
  @Get('plan/:key')
  async getPlan(@Param('key') key: string) {
    return this.plansService.getPlanByKey(key);
  }

  /**
   * Get tenant safe entitlements & quota gauges
   */
  @Get('entitlements')
  async getEntitlements(@Headers() headers: Record<string, any>) {
    const tenantId = this.extractTenantId(headers);
    console.log('[Billing Controller getEntitlements] Received headers:', Object.keys(headers), 'extracted tenantId:', tenantId);
    return this.entitlementService.getSafeEntitlements(tenantId);
  }

  /**
   * Get tenant subscription details
   */
  @Get('subscription')
  async getSubscription(@Headers() headers: Record<string, any>) {
    const tenantId = this.extractTenantId(headers);
    const sub = await this.prisma.subscription.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    const plan = await this.plansService.getPlanByKey(sub?.planId || 'FREE');

    return {
      subscription: sub || {
        status: 'TRIALING',
        planId: 'FREE',
        billingInterval: 'monthly',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
        cancelAtPeriodEnd: false,
      },
      plan,
    };
  }

  /**
   * Get tenant live usage analytics and agent breakdown
   */
  @Get('usage')
  async getUsage(@Headers() headers: Record<string, any>) {
    const tenantId = this.extractTenantId(headers);
    return this.usageService.getUsageAnalytics(tenantId);
  }

  /**
   * Get tenant billing invoices
   */
  @Get('invoices')
  async getInvoices(@Headers() headers: Record<string, any>) {
    const tenantId = this.extractTenantId(headers);
    const invoices = await this.prisma.billingInvoice.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return invoices;
  }

  /**
   * Create server-side Stripe Checkout Session
   */
  @Post('checkout')
  async createCheckout(
    @Headers() headers: Record<string, any>,
    @Body()
    body: {
      planKey: string;
      interval?: 'monthly' | 'annual';
      successUrl?: string;
      cancelUrl?: string;
      userEmail?: string;
    },
  ) {
    const tenantId = this.extractTenantId(headers);
    const plan = await this.plansService.getPlanByKey(body.planKey);
    const interval = body.interval || 'monthly';
    const amount = interval === 'annual' ? plan.annualPrice : plan.monthlyPrice;

    const successUrl =
      body.successUrl || 'http://localhost:4000/settings/billing?checkout=success';
    const cancelUrl =
      body.cancelUrl || 'http://localhost:4000/settings/billing?checkout=cancel';

    return this.stripeService.createCheckoutSession({
      tenantId,
      planKey: plan.key,
      planName: plan.name,
      amount,
      interval,
      userEmail: body.userEmail,
      successUrl,
      cancelUrl,
    });
  }

  /**
   * Create Stripe Customer Portal Session
   */
  @Post('portal')
  async createPortal(
    @Headers() headers: Record<string, any>,
    @Body() body: { returnUrl?: string },
  ) {
    const tenantId = this.extractTenantId(headers);
    const returnUrl = body.returnUrl || 'http://localhost:4000/settings/billing';
    return this.stripeService.createPortalSession(tenantId, returnUrl);
  }

  /**
   * Cancel subscription at period end
   */
  @Post('subscription/cancel')
  async cancelSubscription(
    @Headers() headers: Record<string, any>,
    @Body() body: { immediate?: boolean },
  ) {
    const tenantId = this.extractTenantId(headers);
    const sub = await this.prisma.subscription.findFirst({
      where: { tenantId, status: { in: ['ACTIVE', 'TRIALING'] } },
    });
    if (!sub) throw new BadRequestException('No active subscription found to cancel');

    const updated = await this.prisma.subscription.update({
      where: { id: sub.id },
      data: body.immediate
        ? { status: 'CANCELED', canceledAt: new Date() }
        : { cancelAtPeriodEnd: true },
    });

    this.entitlementService.invalidateCache(tenantId);
    return updated;
  }

  /**
   * Resume subscription scheduled for cancellation
   */
  @Post('subscription/resume')
  async resumeSubscription(@Headers() headers: Record<string, any>) {
    const tenantId = this.extractTenantId(headers);
    const sub = await this.prisma.subscription.findFirst({
      where: { tenantId, cancelAtPeriodEnd: true },
    });
    if (!sub) throw new BadRequestException('No subscription pending cancellation found');

    const updated = await this.prisma.subscription.update({
      where: { id: sub.id },
      data: { cancelAtPeriodEnd: false },
    });

    this.entitlementService.invalidateCache(tenantId);
    return updated;
  }

  /**
   * Internal API: Record usage event from microservices
   */
  @Post('usage/record')
  async recordUsage(@Body() body: RecordUsageDto) {
    return this.usageService.recordUsage(body);
  }

  /**
   * Internal API: Pre-flight check quota
   */
  @Post('usage/evaluate')
  async evaluateQuota(
    @Body()
    body: {
      tenantId: string;
      metric: string;
      requestedAmount?: number;
    },
  ) {
    return this.usageService.evaluateQuota(
      body.tenantId,
      body.metric,
      body.requestedAmount ?? (body as any).proposedDelta ?? (body as any).delta ?? 1,
    );
  }

  /**
   * Stripe Webhook Endpoint (Raw Body with HMAC Signature)
   */
  @Post('stripe/webhook')
  @Post('webhook')
  async handleStripeWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature?: string,
  ) {
    const rawBody = (req as any).rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
    const sig = signature || 'test_signature';
    const result = await this.webhookService.handleWebhook(rawBody, sig);
    return {
      received: true,
      idempotent: result.status === 'IGNORED_DUPLICATE',
      ...result,
    };
  }

  /**
   * Get tenant credits balance
   */
  @Get('credits')
  async getCredits(@Headers() headers: Record<string, any>) {
    const tenantId = this.extractTenantId(headers);
    const balance = await this.creditsService.getBalance(tenantId);
    const history = await this.creditsService.getLedgerHistory(tenantId);
    return {
      ...balance,
      summary: balance,
      history,
    };
  }

  /**
   * Grant credits to tenant
   */
  @Post('credits/grant')
  async grantCredits(
    @Headers() headers: Record<string, any>,
    @Body() body: { amount: number; type?: any; source?: string; idempotencyKey?: string },
  ) {
    const tenantId = this.extractTenantId(headers);
    return this.creditsService.grantCredits({
      tenantId,
      amount: body.amount,
      type: body.type || 'PURCHASED',
      source: body.source || 'STRIPE_CHECKOUT',
      idempotencyKey: body.idempotencyKey,
    });
  }

  /**
   * Consume credits for tenant
   */
  @Post('credits/consume')
  async consumeCredits(
    @Headers() headers: Record<string, any>,
    @Body() body: { amount: number; source?: string; idempotencyKey?: string },
  ) {
    const tenantId = this.extractTenantId(headers);
    return this.creditsService.consumeCredits({
      tenantId,
      amount: body.amount,
      source: body.source || 'AI_EXECUTION',
      idempotencyKey: body.idempotencyKey,
    });
  }

  /**
   * Get credit ledger history
   */
  @Get('credits/history')
  async getCreditHistory(@Headers() headers: Record<string, any>) {
    const tenantId = this.extractTenantId(headers);
    return this.creditsService.getLedgerHistory(tenantId);
  }

  /**
   * Get AI Unit Economics & Agent breakdown
   */
  @Get('ai/economics')
  async getAiUnitEconomics(@Headers() headers: Record<string, any>) {
    const tenantId = this.extractTenantId(headers);
    return this.aiCostService.getUnitEconomics(tenantId);
  }

  /**
   * Record AI execution cost telemetry
   */
  @Post('ai/cost/record')
  @Post('ai/telemetry')
  async recordAiTelemetry(
    @Headers() headers: Record<string, any>,
    @Body() body: any,
  ) {
    const tenantId = body.tenantId || this.extractTenantId(headers);
    const record = await this.aiCostService.recordExecutionCost({ ...body, tenantId });
    return {
      success: !!record,
      providerCostUsd: record?.estimatedProviderCost ?? 0,
      customerChargeUsd: record?.customerCharge ?? 0,
      grossMarginPercent: record && record.customerCharge > 0
        ? Number((((record.customerCharge - record.estimatedProviderCost) / record.customerCharge) * 100).toFixed(2))
        : 95.0,
      record,
    };
  }

  /**
   * Get tenant AI Budget status and thresholds
   */
  @Get('ai/budget')
  async getAiBudget(@Headers() headers: Record<string, any>) {
    const tenantId = this.extractTenantId(headers);
    return this.aiBudgetService.getBudget(tenantId);
  }

  /**
   * Configure tenant AI Budget and action on exhaustion
   */
  @Post('ai/budget')
  async setAiBudget(@Headers() headers: Record<string, any>, @Body() body: any) {
    const tenantId = this.extractTenantId(headers);
    return this.aiBudgetService.setBudget({ ...body, tenantId });
  }

  /**
   * Pre-flight evaluate AI Budget headroom
   */
  @Post('ai/budget/evaluate')
  async evaluateAiBudgetHeadroom(
    @Headers() headers: Record<string, any>,
    @Body() body: { estimatedCostUsd?: number; agentId?: string },
  ) {
    const tenantId = this.extractTenantId(headers);
    return this.aiBudgetService.checkHeadroom(tenantId, body.estimatedCostUsd, body.agentId);
  }

  /**
   * Transition subscription state via strict state machine
   */
  @Post('subscription/transition')
  async transitionSubscriptionState(
    @Headers() headers: Record<string, any>,
    @Body() body: { nextState: SubscriptionState; reason?: string },
  ) {
    const tenantId = this.extractTenantId(headers);
    return this.stateMachineService.transitionState(tenantId, body.nextState, body.reason);
  }

  /**
   * Get supported currencies and exchange rates
   */
  @Get('currencies')
  async getCurrencies() {
    return this.currenciesService.getSupportedCurrencies();
  }

  /**
   * Convert between currencies
   */
  @Post('currencies/convert')
  async convertCurrency(@Body() body: { amount: number; from: any; to: any }) {
    return this.currenciesService.convert(body.amount, body.from, body.to);
  }

  /**
   * Validate coupon code
   */
  @Post('coupons/validate')
  async validateCoupon(@Body() body: { code: string; amount: number; planKey?: string }) {
    const res = await this.couponsService.validateCoupon(body.code, body.amount, body.planKey);
    return {
      ...res,
      isValid: res.valid,
      code: res.couponCode,
      discountAmount: res.calculatedDiscount,
      finalAmount: res.finalPrice,
      discountValue: res.value,
    };
  }

  /**
   * Redeem coupon code
   */
  @Post('coupons/redeem')
  async redeemCoupon(
    @Headers() headers: Record<string, any>,
    @Body() body: { code: string; amount: number; planKey?: string },
  ) {
    const tenantId = this.extractTenantId(headers);
    return this.couponsService.redeemCoupon(body.code, tenantId, body.amount, body.planKey);
  }

  /**
   * List emergency AI kill switches
   */
  @Get('kill-switches')
  async getKillSwitches() {
    return this.killSwitchesService.getAllSwitches();
  }

  /**
   * Toggle emergency AI kill switch
   */
  @Post('kill-switches')
  async setKillSwitch(@Body() body: { scope: any; target: string; isEnabled: boolean; reason?: string }) {
    return this.killSwitchesService.setKillSwitch(body.scope, body.target, body.isEnabled, body.reason);
  }

  /**
   * Check circuit breaker statuses
   */
  @Get('resilience/circuits')
  async getCircuitStatuses() {
    return this.circuitBreakerService.getCircuitStatuses();
  }

  /**
   * Process Liveness Health Probe
   */
  @Get('health')
  async getHealth() {
    return {
      status: 'ok',
      service: 'apps/billing',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Dependency Readiness Health Probe
   */
  @Get('ready')
  async getReady() {
    return {
      status: 'ready',
      service: 'apps/billing',
      database: this.prisma.isConnected ? 'connected' : 'degraded',
      stripe: 'configured',
      timestamp: new Date().toISOString(),
    };
  }
}

