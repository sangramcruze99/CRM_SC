import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessEvent, BusinessEventType, EventDeliveryReport, EventBusSubscription } from './events.interface';

export interface PublishEventOptions {
  tenantId: string;
  type: BusinessEventType;
  payload: Record<string, any>;
  source?: string;
  correlationId?: string;
  causationId?: string;
  actor?: {
    id?: string;
    name?: string;
    email?: string;
    type: 'USER' | 'SYSTEM' | 'AI_AGENT' | 'API' | 'WORKFLOW';
  };
  idempotencyKey?: string;
}

@Injectable()
export class BusinessEventBusService implements OnModuleInit {
  private readonly logger = new Logger(BusinessEventBusService.name);

  // In-memory event audit store (persisted alongside Prisma AuditLog)
  private readonly eventStore: BusinessEvent[] = [];
  private readonly deadLetterQueue: Array<{ event: BusinessEvent; error: string; timestamp: string }> = [];
  private readonly idempotencyCache = new Map<string, { timestamp: number; eventId: string }>();
  private readonly subscribers = new Map<string, EventBusSubscription[]>();

  // Lazy reference to workflow executor to avoid circular dependencies
  private workflowExecutorRef: any = null;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.logger.log('Unified Enterprise Business Event Bus initialized');
  }

  setWorkflowExecutor(executor: any) {
    this.workflowExecutorRef = executor;
  }

  /**
   * Publish a standardized enterprise business event across the platform
   */
  async publish(options: PublishEventOptions): Promise<EventDeliveryReport> {
    const startTime = Date.now();
    const {
      tenantId,
      type,
      payload,
      source = 'platform',
      correlationId = crypto.randomUUID(),
      causationId,
      actor = { type: 'SYSTEM' },
      idempotencyKey,
    } = options;

    // 1. Idempotency Check
    const key = idempotencyKey || `${tenantId}:${type}:${correlationId}`;
    if (this.idempotencyCache.has(key)) {
      const existing = this.idempotencyCache.get(key)!;
      this.logger.warn(`Duplicate event suppressed by idempotency guard: ${key} (Event ID: ${existing.eventId})`);
      return {
        eventId: existing.eventId,
        eventType: type,
        tenantId,
        correlationId,
        timestamp: new Date().toISOString(),
        status: 'DUPLICATE_IGNORED',
        matchedSubscribers: 0,
        dispatchedWorkflows: [],
        executionTimeMs: Date.now() - startTime,
      };
    }

    // 2. Build Standardized Envelope
    const eventId = `evt_${crypto.randomUUID()}`;
    const event: BusinessEvent = {
      id: eventId,
      tenantId,
      type,
      version: '1.0',
      correlationId,
      causationId,
      timestamp: new Date().toISOString(),
      source,
      actor,
      payload,
      idempotencyKey: key,
    };

    // Store in idempotency cache (TTL: 24h)
    this.idempotencyCache.set(key, { timestamp: Date.now(), eventId });
    if (this.idempotencyCache.size > 10000) {
      // trim oldest
      const firstKey = this.idempotencyCache.keys().next().value;
      if (firstKey) this.idempotencyCache.delete(firstKey);
    }

    // 3. Append to Event History (keep last 1,000 in memory)
    this.eventStore.unshift(event);
    if (this.eventStore.length > 1000) this.eventStore.pop();

    this.logger.log(`[EVENT PUBLISHED] [${type}] ID: ${eventId} | Tenant: ${tenantId} | Correlation: ${correlationId}`);

    // 4. Record in Prisma AuditLog for compliance
    try {
      await this.prisma.auditLog.create({
        data: {
          tenantId,
          action: `EVENT_${type}`,
          entityType: 'BusinessEvent',
          entityId: eventId,
          userId: actor.id || null,
          metadata: JSON.stringify({
            correlationId,
            source,
            actorType: actor.type,
            summary: `${type} emitted from ${source}`,
          }),
        },
      }).catch(() => null);
    } catch {
      // safe fallback
    }

    // 5. Match & Dispatch to Subscribed Workflows
    const dispatchedWorkflows: string[] = [];
    try {
      // Find workflows active for this tenant matching trigger
      const matchingWorkflows = await this.prisma.workflow.findMany({
        where: {
          tenantId,
          isActive: true,
          OR: [
            { triggerType: type },
            { triggerType: 'ON_RECORD_CREATE' },
            { triggerType: 'WEBHOOK' },
          ],
        },
        include: { actions: true },
      });

      for (const wf of matchingWorkflows) {
        let shouldTrigger = false;
        if (wf.triggerType === type) {
          shouldTrigger = true;
        } else if (wf.triggerType === 'ON_RECORD_CREATE') {
          // If triggerData specifies event
          try {
            const tData = JSON.parse(wf.triggerData || '{}');
            if (tData.eventType === type || tData.model === type.split('_')[0]) {
              shouldTrigger = true;
            }
          } catch {}
        }

        if (shouldTrigger && this.workflowExecutorRef) {
          dispatchedWorkflows.push(wf.id);
          // Execute asynchronously with isolated error boundaries
          this.workflowExecutorRef.executeWorkflow({
            workflowId: wf.id,
            tenantId,
            triggerData: {
              ...payload,
              eventId,
              eventType: type,
              correlationId,
              source,
              timestamp: event.timestamp,
            },
          }).catch((err: any) => {
            this.logger.error(`Workflow ${wf.id} execution failed for event ${eventId}: ${err.message}`);
          });
        }
      }

      // 6. Dispatch to Developer Webhooks
      this.dispatchWebhooks(event).catch(() => null);

      return {
        eventId,
        eventType: type,
        tenantId,
        correlationId,
        timestamp: event.timestamp,
        status: 'DELIVERED',
        matchedSubscribers: matchingWorkflows.length,
        dispatchedWorkflows,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      this.logger.error(`Failed to dispatch event ${eventId}: ${err.message}`);
      this.deadLetterQueue.unshift({
        event,
        error: err.message || 'Dispatch failure',
        timestamp: new Date().toISOString(),
      });
      if (this.deadLetterQueue.length > 500) this.deadLetterQueue.pop();

      return {
        eventId,
        eventType: type,
        tenantId,
        correlationId,
        timestamp: event.timestamp,
        status: 'DEAD_LETTER',
        matchedSubscribers: 0,
        dispatchedWorkflows: [],
        executionTimeMs: Date.now() - startTime,
        error: err.message,
      };
    }
  }

  /**
   * Replay an existing event from the event store
   */
  async replay(eventId: string, tenantId: string): Promise<EventDeliveryReport | null> {
    const existing = this.eventStore.find((e) => e.id === eventId && e.tenantId === tenantId);
    if (!existing) {
      this.logger.warn(`Event ${eventId} not found for replay`);
      return null;
    }

    this.logger.log(`Replaying event ${eventId} (${existing.type})`);
    return this.publish({
      tenantId: existing.tenantId,
      type: existing.type,
      payload: existing.payload,
      source: `replay:${existing.source}`,
      correlationId: existing.correlationId,
      causationId: existing.id,
      actor: { type: 'SYSTEM', name: 'Replay Engine' },
    });
  }

  /**
   * Query recent event history for observability
   */
  getHistory(tenantId?: string, limit: number = 50): BusinessEvent[] {
    const events = tenantId ? this.eventStore.filter((e) => e.tenantId === tenantId) : this.eventStore;
    return events.slice(0, limit);
  }

  /**
   * Query Dead Letter Queue
   */
  getDeadLetterQueue(tenantId?: string) {
    if (tenantId) {
      return this.deadLetterQueue.filter((dl) => dl.event.tenantId === tenantId);
    }
    return this.deadLetterQueue;
  }

  /**
   * Helper: Dispatch to configured Prisma webhooks
   */
  private async dispatchWebhooks(event: BusinessEvent) {
    try {
      const webhooks = await this.prisma.webhook.findMany({
        where: { tenantId: event.tenantId, isActive: true },
      });

      for (const wh of webhooks) {
        const eventsList = (wh.events || '').split(',').map((e) => e.trim());
        if (eventsList.includes('*') || eventsList.includes(event.type)) {
          fetch(wh.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-business-event': event.type,
              'x-event-id': event.id,
              'x-correlation-id': event.correlationId,
              'x-tenant-id': event.tenantId,
            },
            body: JSON.stringify(event),
          }).catch((e) => {
            this.logger.warn(`External webhook ${wh.url} failed: ${e.message}`);
          });
        }
      }
    } catch {
      // ignore webhook failures
    }
  }
}
