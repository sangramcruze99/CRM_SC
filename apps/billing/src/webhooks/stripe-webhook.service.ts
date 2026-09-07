import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EntitlementService } from '../entitlements/entitlement.service';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly entitlementService: EntitlementService,
    private readonly stripeService: StripeService,
  ) {}

  /**
   * Secure, idempotent webhook dispatcher
   */
  async handleWebhook(rawBody: string | Buffer, signature: string) {
    const event = this.stripeService.verifyWebhookSignature(rawBody, signature);
    const eventId = event.id;
    const eventType = event.type;

    this.logger.log(`[Stripe Webhook] Received ${eventType} (${eventId})`);

    // 1. Check Webhook Idempotency
    const existing = await this.prisma.stripeWebhookEvent.findUnique({
      where: { stripeEventId: eventId },
    });

    if (existing && existing.status === 'PROCESSED') {
      this.logger.log(`[Stripe Webhook] Event ${eventId} already processed idempotently. Skipping.`);
      return { status: 'IGNORED_DUPLICATE', eventId };
    }

    // 2. Persist Webhook Event in PENDING state
    const webhookRecord = await this.prisma.stripeWebhookEvent.upsert({
      where: { stripeEventId: eventId },
      update: { attempts: { increment: 1 } },
      create: {
        stripeEventId: eventId,
        eventType,
        payload: typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8'),
        status: 'PENDING',
        attempts: 1,
      },
    });

    try {
      // 3. Process Event by Type
      switch (eventType) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object as any);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as any);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as any);
          break;

        case 'invoice.paid':
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaid(event.data.object as any);
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as any);
          break;

        default:
          this.logger.debug(`[Stripe Webhook] Unhandled event type: ${eventType}`);
      }

      // 4. Mark PROCESSED
      await this.prisma.stripeWebhookEvent.update({
        where: { id: webhookRecord.id },
        data: {
          status: 'PROCESSED',
          processedAt: new Date(),
        },
      });

      return { status: 'PROCESSED', eventId };
    } catch (err: any) {
      this.logger.error(`[Stripe Webhook] Error processing event ${eventId}: ${err.message}`, err.stack);
      await this.prisma.stripeWebhookEvent.update({
        where: { id: webhookRecord.id },
        data: {
          status: 'FAILED',
          error: err.message,
        },
      });
      throw err;
    }
  }

  private async handleCheckoutSessionCompleted(session: any) {
    const tenantId = session.metadata?.tenantId;
    const planKey = session.metadata?.planKey || 'BUSINESS';
    const interval = session.metadata?.billingInterval || 'monthly';
    const stripeSubscriptionId = session.subscription || `sub_checkout_${Date.now()}`;
    const stripeCustomerId = session.customer || `cus_${tenantId}`;

    if (!tenantId) {
      this.logger.warn('[Stripe Webhook] checkout.session.completed missing tenantId in metadata');
      return;
    }

    const now = new Date();
    const periodEnd = new Date(now.getTime() + (interval === 'annual' ? 365 : 30) * 86400000);

    // Upsert subscription
    const existingSub = await this.prisma.subscription.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    if (existingSub) {
      await this.prisma.subscription.update({
        where: { id: existingSub.id },
        data: {
          stripeCustomerId,
          stripeSubscriptionId,
          planId: planKey,
          status: 'ACTIVE',
          billingInterval: interval,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
        },
      });
    } else {
      await this.prisma.subscription.create({
        data: {
          tenantId,
          stripeCustomerId,
          stripeSubscriptionId,
          planId: planKey,
          status: 'ACTIVE',
          billingInterval: interval,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });
    }

    this.entitlementService.invalidateCache(tenantId);
    this.logger.log(`[Stripe Webhook] Activated ${planKey} subscription for tenant ${tenantId}`);
  }

  private async handleSubscriptionUpdated(subscription: any) {
    const stripeSubscriptionId = subscription.id;
    const stripeCustomerId = subscription.customer;
    const statusMap: Record<string, string> = {
      active: 'ACTIVE',
      trialing: 'TRIALING',
      past_due: 'PAST_DUE',
      unpaid: 'UNPAID',
      canceled: 'CANCELED',
    };
    const localStatus = statusMap[subscription.status] || 'ACTIVE';

    const localSub = await this.prisma.subscription.findFirst({
      where: {
        OR: [
          { stripeSubscriptionId },
          { stripeCustomerId },
        ],
      },
    });

    if (localSub) {
      await this.prisma.subscription.update({
        where: { id: localSub.id },
        data: {
          status: localStatus,
          cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
          currentPeriodStart: subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : undefined,
          currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : undefined,
        },
      });
      this.entitlementService.invalidateCache(localSub.tenantId);
      this.logger.log(`[Stripe Webhook] Updated subscription for tenant ${localSub.tenantId} to ${localStatus}`);
    }
  }

  private async handleSubscriptionDeleted(subscription: any) {
    const stripeSubscriptionId = subscription.id;
    const localSub = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId },
    });

    if (localSub) {
      await this.prisma.subscription.update({
        where: { id: localSub.id },
        data: {
          status: 'CANCELED',
          canceledAt: new Date(),
        },
      });
      this.entitlementService.invalidateCache(localSub.tenantId);
      this.logger.log(`[Stripe Webhook] Canceled subscription for tenant ${localSub.tenantId}`);
    }
  }

  private async handleInvoicePaid(invoice: any) {
    const stripeInvoiceId = invoice.id;
    const stripeCustomerId = invoice.customer;

    let tenantId = invoice.metadata?.tenantId;
    if (!tenantId) {
      const billingCustomer = await this.prisma.billingCustomer.findFirst({
        where: { stripeCustomerId },
      });
      tenantId = billingCustomer?.tenantId;
    }
    if (!tenantId) {
      const sub = await this.prisma.subscription.findFirst({
        where: { stripeCustomerId },
      });
      tenantId = sub?.tenantId;
    }
    if (!tenantId) {
      tenantId = 'default-tenant';
    }

    await this.prisma.billingInvoice.upsert({
      where: { stripeInvoiceId },
      update: {
        status: 'PAID',
        amountPaid: (invoice.amount_paid || 0) / 100,
        paidAt: new Date(),
        hostedInvoiceUrl: invoice.hosted_invoice_url,
        invoicePdfUrl: invoice.invoice_pdf,
      },
      create: {
        tenantId,
        stripeInvoiceId,
        invoiceNumber: invoice.number || `INV-${Date.now().toString().slice(-6)}`,
        amountDue: (invoice.amount_due || 0) / 100,
        amountPaid: (invoice.amount_paid || 0) / 100,
        currency: invoice.currency?.toUpperCase() || 'USD',
        status: 'PAID',
        hostedInvoiceUrl: invoice.hosted_invoice_url,
        invoicePdfUrl: invoice.invoice_pdf,
        paidAt: new Date(),
      },
    });

    // If tenant had PAST_DUE status, restore to ACTIVE
    const sub = await this.prisma.subscription.findFirst({
      where: { tenantId, status: 'PAST_DUE' },
    });
    if (sub) {
      await this.prisma.subscription.update({
        where: { id: sub.id },
        data: { status: 'ACTIVE' },
      });
      this.entitlementService.invalidateCache(tenantId);
    }
  }

  private async handleInvoicePaymentFailed(invoice: any) {
    const stripeCustomerId = invoice.customer;
    const billingCustomer = await this.prisma.billingCustomer.findFirst({
      where: { stripeCustomerId },
    });

    if (billingCustomer) {
      await this.prisma.subscription.updateMany({
        where: { tenantId: billingCustomer.tenantId, status: 'ACTIVE' },
        data: { status: 'PAST_DUE' },
      });
      this.entitlementService.invalidateCache(billingCustomer.tenantId);
      this.logger.warn(`[Stripe Webhook] Payment failed for tenant ${billingCustomer.tenantId}. Entered PAST_DUE grace period.`);
    }
  }
}
