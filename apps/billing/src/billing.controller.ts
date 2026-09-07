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

@Controller('billing')
export class BillingController {
  constructor(
    private readonly plansService: PlansService,
    private readonly entitlementService: EntitlementService,
    private readonly usageService: UsageService,
    private readonly stripeService: StripeService,
    private readonly webhookService: StripeWebhookService,
    private readonly prisma: PrismaService,
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
  async handleStripeWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature?: string,
  ) {
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    const sig = signature || 'test_signature';
    return this.webhookService.handleWebhook(rawBody, sig);
  }
}
