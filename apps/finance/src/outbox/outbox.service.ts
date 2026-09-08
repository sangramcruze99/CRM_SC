import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface OutboxPayload {
  tenantId: string;
  eventType: string;
  entityType: string;
  entityId: string;
  payload: Record<string, any>;
}

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Enqueue domain event inside or outside an ongoing transaction
   */
  async recordEvent(event: OutboxPayload, txPrisma?: any) {
    const client = txPrisma || this.prisma;
    try {
      const created = await client.financialOutboxEvent.create({
        data: {
          tenantId: event.tenantId,
          eventType: event.eventType,
          entityType: event.entityType,
          entityId: event.entityId,
          payload: JSON.stringify(event.payload),
          status: 'PENDING',
        },
      });
      this.logger.log(`[Outbox] Enqueued event ${event.eventType} for ${event.entityType}:${event.entityId}`);
      return created;
    } catch (err: any) {
      this.logger.error(`[Outbox] Failed enqueuing event ${event.eventType}: ${err.message}`);
      return null;
    }
  }

  /**
   * Ergonomic publisher helper
   */
  async publishEvent(
    tenantId: string,
    eventType: string,
    entityType: string,
    entityId: string,
    payload: Record<string, any>,
    txPrisma?: any
  ) {
    return this.recordEvent(
      {
        tenantId,
        eventType,
        entityType,
        entityId,
        payload,
      },
      txPrisma
    );
  }

  /**
   * Fetch pending outbox events for publishing
   */
  async getPendingEvents(limit = 20) {
    return this.prisma.financialOutboxEvent.findMany({
      where: { status: 'PENDING' },
      take: limit,
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Mark event published
   */
  async markPublished(id: string) {
    return this.prisma.financialOutboxEvent.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    });
  }
}
