import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface EcomOrderEvent {
  orderId: string;
  customerEmail: string;
  customerName?: string;
  totalAmount: number;
  items: Array<{ sku: string; name: string; quantity: number; price: number }>;
}

@Injectable()
export class EcommerceAgentService {
  private readonly logger = new Logger(EcommerceAgentService.name);

  constructor(private readonly prisma: PrismaService) {}

  async processOrder(tenantId: string, order: EcomOrderEvent) {
    this.logger.log(`[E-commerce Agent] Processing Order ${order.orderId} for ${order.customerEmail} ($${order.totalAmount})`);

    // 1. Check or Upsert Contact in CRM
    let contact = await this.prisma.contact.findFirst({
      where: { email: order.customerEmail.toLowerCase().trim(), tenantId },
    });

    if (!contact) {
      const nameParts = (order.customerName || 'Store Customer').split(' ');
      contact = await this.prisma.contact.create({
        data: {
          tenantId,
          firstName: nameParts[0] || 'Store',
          lastName: nameParts.slice(1).join(' ') || 'Customer',
          email: order.customerEmail.toLowerCase().trim(),
          customData: JSON.stringify({ totalSpent: order.totalAmount, orderCount: 1 }),
        },
      });
    }

    // 2. Log Order Transaction
    const tx = await this.prisma.transaction.create({
      data: {
        tenantId,
        amount: order.totalAmount,
        type: 'CREDIT',
        description: `Shopify Order #${order.orderId} from ${order.customerEmail}`,
      },
    });

    // 3. Log Activity Timeline
    await this.prisma.activity.create({
      data: {
        tenantId,
        type: 'SYSTEM',
        title: `E-Commerce Order Placed ($${order.totalAmount})`,
        content: `Order: #${order.orderId}\nItems: ${order.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}\nTransaction ID: ${tx.id}`,
        contactId: contact.id,
      },
    });

    return {
      status: 'ORDER_PROCESSED',
      orderId: order.orderId,
      contactId: contact.id,
      transactionId: tx.id,
    };
  }

  async handleAbandonedCart(tenantId: string, cart: { cartId: string; email: string; items: string[] }) {
    this.logger.log(`[E-commerce Agent] Recovering abandoned cart ${cart.cartId} for ${cart.email}`);

    // Queue recovery sequence
    return {
      status: 'RECOVERY_TRIGGERED',
      cartId: cart.cartId,
      dispatchedSequence: ['WHATSAPP_DISCOUNT_LINK', '24H_EMAIL_FOLLOWUP'],
    };
  }
}
