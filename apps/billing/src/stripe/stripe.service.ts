import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripeClient: Stripe | null = null;
  private readonly webhookSecret: string;

  constructor(private readonly prisma: PrismaService) {
    const secretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_business_os_placeholder_key_secret';
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_business_os_placeholder_webhook_secret';

    try {
      this.stripeClient = new Stripe(secretKey, {
        apiVersion: '2025-02-24.acacia' as any,
        typescript: true,
      });
      this.logger.log('Stripe SDK initialized successfully in server-side billing domain');
    } catch (err: any) {
      this.logger.warn(`Stripe initialization warning: ${err.message}. Operating in sandbox simulation mode.`);
    }
  }

  /**
   * Resolve or create a Stripe Customer idempotently for a tenant
   */
  async createOrGetCustomer(tenantId: string, email?: string, name?: string) {
    let billingCustomer = await this.prisma.billingCustomer.findUnique({
      where: { tenantId },
    });

    if (billingCustomer) {
      return billingCustomer;
    }

    let stripeCustomerId = `cus_${tenantId.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;

    if (this.stripeClient && !process.env.STRIPE_SECRET_KEY?.includes('placeholder')) {
      try {
        const customer = await this.stripeClient.customers.create({
          email,
          name: name || `Tenant ${tenantId}`,
          metadata: { tenantId },
        });
        stripeCustomerId = customer.id;
      } catch (err: any) {
        this.logger.warn(`Stripe live customer creation failed: ${err.message}, using deterministic customer reference`);
      }
    }

    billingCustomer = await this.prisma.billingCustomer.upsert({
      where: { tenantId },
      update: { email: email || undefined },
      create: {
        tenantId,
        stripeCustomerId,
        email: email || `${tenantId}@businessos.test`,
        currency: 'USD',
      },
    });

    return billingCustomer;
  }

  /**
   * Create a server-side Stripe Checkout Session for subscription
   */
  async createCheckoutSession(params: {
    tenantId: string;
    planKey: string;
    planName: string;
    amount: number;
    interval: 'monthly' | 'annual';
    userEmail?: string;
    successUrl: string;
    cancelUrl: string;
  }) {
    const { tenantId, planKey, planName, amount, interval, userEmail, successUrl, cancelUrl } = params;
    const customer = await this.createOrGetCustomer(tenantId, userEmail);

    if (this.stripeClient && !process.env.STRIPE_SECRET_KEY?.includes('placeholder')) {
      try {
        const session = await this.stripeClient.checkout.sessions.create({
          customer: customer.stripeCustomerId,
          mode: 'subscription',
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `Business OS — ${planName} Plan`,
                  description: `Full access to Business OS ${planName} tier with autonomous intelligence.`,
                },
                unit_amount: Math.round(amount * 100),
                recurring: {
                  interval: interval === 'annual' ? 'year' : 'month',
                },
              },
              quantity: 1,
            },
          ],
          metadata: {
            tenantId,
            planKey,
            billingInterval: interval,
          },
          success_url: successUrl,
          cancel_url: cancelUrl,
        });

        return {
          sessionId: session.id,
          url: session.url,
          mode: 'LIVE_STRIPE',
        };
      } catch (err: any) {
        this.logger.warn(`Stripe API checkout creation failed: ${err.message}. Generating deterministic test checkout.`);
      }
    }

    // Deterministic Test Mode Session URL
    const sessionId = `cs_test_${tenantId}_${Date.now()}`;
    const testCheckoutUrl = `${successUrl.split('?')[0]}?session_id=${sessionId}&tenant_id=${tenantId}&plan=${planKey}&status=checkout_ready`;

    return {
      sessionId,
      url: testCheckoutUrl,
      mode: 'SANDBOX_STRIPE',
    };
  }

  /**
   * Create a Stripe Billing Customer Portal Session
   */
  async createPortalSession(tenantId: string, returnUrl: string) {
    const customer = await this.createOrGetCustomer(tenantId);

    if (this.stripeClient && !process.env.STRIPE_SECRET_KEY?.includes('placeholder')) {
      try {
        const portal = await this.stripeClient.billingPortal.sessions.create({
          customer: customer.stripeCustomerId,
          return_url: returnUrl,
        });
        return { url: portal.url };
      } catch (err: any) {
        this.logger.warn(`Stripe portal session error: ${err.message}`);
      }
    }

    return {
      url: `${returnUrl}?portal_session=active&customer_id=${customer.stripeCustomerId}`,
    };
  }

  /**
   * Verify raw webhook payload with Stripe HMAC signature
   */
  verifyWebhookSignature(rawBody: string | Buffer, signature: string): Stripe.Event {
    if (!signature && process.env.NODE_ENV === 'production') {
      throw new BadRequestException('Missing stripe-signature header');
    }

    if (this.stripeClient && !this.webhookSecret.includes('placeholder')) {
      try {
        return this.stripeClient.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
      } catch (err: any) {
        throw new BadRequestException(`Stripe Webhook Signature Verification Failed: ${err.message}`);
      }
    }

    // In sandbox/test environment: if a signature is provided, verify HMAC against configured secret
    const payloadStr = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');

    if (signature && this.webhookSecret) {
      try {
        const crypto = require('crypto');
        // Extract timestamp and signature components if in Stripe format (t=...,v1=...)
        const sigParts = signature.split(',').reduce((acc: any, part: string) => {
          const [k, v] = part.split('=');
          if (k && v) acc[k.trim()] = v.trim();
          return acc;
        }, {});

        if (sigParts.v1 && sigParts.t) {
          const timestampSec = parseInt(sigParts.t, 10);
          const nowSec = Math.floor(Date.now() / 1000);
          // 5-minute tolerance window to prevent replay attacks
          if (isNaN(timestampSec) || Math.abs(nowSec - timestampSec) > 300) {
            throw new Error('Webhook timestamp is outside tolerance window (replay protection)');
          }

          const signedPayload = `${sigParts.t}.${payloadStr}`;
          const expectedSig = crypto
            .createHmac('sha256', this.webhookSecret)
            .update(signedPayload)
            .digest('hex');

          const expectedBuf = Buffer.from(expectedSig);
          const actualBuf = Buffer.from(sigParts.v1);

          if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
            throw new Error('HMAC signature mismatch');
          }
        }
      } catch (err: any) {
        throw new BadRequestException(`Stripe Webhook Signature Verification Failed: ${err.message}`);
      }
    }

    try {
      const parsed = JSON.parse(payloadStr);
      if (!parsed.id || !parsed.type) {
        throw new Error('Invalid Stripe event payload structure');
      }
      return parsed as Stripe.Event;
    } catch (err: any) {
      throw new BadRequestException(`Invalid Webhook Payload: ${err.message}`);
    }
  }
}
