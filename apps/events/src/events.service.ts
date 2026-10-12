import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

export interface DomainEvent<T = any> {
  id: string;
  tenantId: string;
  eventType: string; // e.g. 'crm.deal.won', 'invoice.paid', 'workflow.completed'
  sourceService: string;
  payload: T;
  timestamp: string;
}

export interface SubscriberConfig {
  id: string;
  eventTypePattern: string; // e.g. 'crm.*' or 'invoice.paid'
  targetUrl: string;
  registeredAt: string;
}

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  private readonly eventHistory: DomainEvent[] = [];
  private readonly subscribers: SubscriberConfig[] = [];

  constructor() {
    this.seedDefaultSubscribers();
  }

  async publish(dto: { tenantId: string; eventType: string; sourceService: string; payload: any }) {
    const event: DomainEvent = {
      id: `evt_${crypto.randomBytes(8).toString('hex')}`,
      tenantId: dto.tenantId,
      eventType: dto.eventType,
      sourceService: dto.sourceService,
      payload: dto.payload,
      timestamp: new Date().toISOString(),
    };

    this.eventHistory.unshift(event);
    if (this.eventHistory.length > 500) {
      this.eventHistory.pop();
    }

    this.logger.log(`[Event Broker] Dispatched '${event.eventType}' from '${event.sourceService}' (ID: ${event.id})`);

    // Asynchronously dispatch to matching registered subscribers
    this.dispatchToSubscribers(event);

    return {
      success: true,
      eventId: event.id,
      timestamp: event.timestamp,
    };
  }

  async getHistory(tenantId: string, limit = 50) {
    return this.eventHistory
      .filter((e) => e.tenantId === tenantId)
      .slice(0, limit);
  }

  async registerSubscriber(eventTypePattern: string, targetUrl: string) {
    const subscriber: SubscriberConfig = {
      id: `sub_${crypto.randomBytes(6).toString('hex')}`,
      eventTypePattern,
      targetUrl,
      registeredAt: new Date().toISOString(),
    };
    this.subscribers.push(subscriber);
    return subscriber;
  }

  async getSubscribers() {
    return this.subscribers;
  }

  private dispatchToSubscribers(event: DomainEvent) {
    for (const sub of this.subscribers) {
      const isMatch =
        sub.eventTypePattern === '*' ||
        sub.eventTypePattern === event.eventType ||
        (sub.eventTypePattern.endsWith('.*') &&
          event.eventType.startsWith(sub.eventTypePattern.slice(0, -2)));

      if (isMatch) {
        // Fire-and-forget async webhook dispatch
        fetch(sub.targetUrl, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-tenant-id': event.tenantId,
            'x-event-id': event.id,
            'x-event-type': event.eventType,
          },
          body: JSON.stringify(event),
        }).catch((err) => {
          this.logger.debug(`Webhook dispatch to ${sub.targetUrl} non-critical fail: ${err.message}`);
        });
      }
    }
  }

  private seedDefaultSubscribers() {
    this.subscribers.push(
      {
        id: 'sub_notifications_hub',
        eventTypePattern: '*',
        targetUrl: 'http://localhost:3028/notifications/dispatch',
        registeredAt: new Date().toISOString(),
      },
      {
        id: 'sub_audit_governance',
        eventTypePattern: '*',
        targetUrl: 'http://localhost:3023/audit/events',
        registeredAt: new Date().toISOString(),
      },
    );
  }
}
