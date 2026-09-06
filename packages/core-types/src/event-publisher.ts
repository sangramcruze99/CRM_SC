import { BusinessEventType } from './events';

export interface PublishBusinessEventOptions {
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

/**
 * Lightweight, resilient event publishing utility for internal microservices.
 * Dispatches to apps/automation's Event Bus endpoint asynchronously without
 * blocking or crashing the calling domain service.
 */
export async function publishBusinessEvent(
  options: PublishBusinessEventOptions,
  automationBaseUrl: string = process.env.AUTOMATION_URL || 'http://localhost:3009'
): Promise<boolean> {
  const url = `${automationBaseUrl}/workflows/events/publish`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': options.tenantId || 'default-tenant',
      },
      body: JSON.stringify({
        type: options.type,
        payload: options.payload,
        source: options.source || 'domain-service',
        correlationId: options.correlationId,
        causationId: options.causationId,
        actor: options.actor || { type: 'SYSTEM' },
        idempotencyKey: options.idempotencyKey,
      }),
    });

    if (!response.ok) {
      console.warn(`[EventPublisher] Failed to publish ${options.type}: HTTP ${response.status}`);
      return false;
    }
    return true;
  } catch (error: any) {
    // Graceful offline fallback: log warning but never throw in domain service
    console.warn(`[EventPublisher] Event bus connection offline (${options.type}): ${error.message}`);
    return false;
  }
}

// ----------------------------------------------------------------------------
// DOMAIN-SPECIFIC EVENT PUBLISHER HELPERS
// ----------------------------------------------------------------------------

export async function publishContactCreated(
  tenantId: string,
  contact: { id: string; email?: string | null; firstName?: string | null; lastName?: string | null; company?: string | null; customData?: any },
  actorId?: string
) {
  return publishBusinessEvent({
    tenantId,
    type: 'CONTACT_CREATED',
    source: 'crm',
    actor: { id: actorId, type: 'USER' },
    payload: {
      contactId: contact.id,
      email: contact.email,
      firstName: contact.firstName,
      lastName: contact.lastName,
      company: contact.company,
      customData: contact.customData,
    },
  });
}

export async function publishDealStageChanged(
  tenantId: string,
  deal: { id: string; title: string; amount: number; stage: string; contactId?: string | null; previousStage?: string },
  actorId?: string
) {
  const isWon = deal.stage?.toUpperCase() === 'WON' || deal.stage?.toUpperCase() === 'CLOSED_WON';
  const eventType: BusinessEventType = isWon ? 'DEAL_CLOSED_WON' : 'DEAL_STAGE_CHANGED';

  return publishBusinessEvent({
    tenantId,
    type: eventType,
    source: 'sales',
    actor: { id: actorId, type: 'USER' },
    payload: {
      dealId: deal.id,
      title: deal.title,
      amount: deal.amount,
      stage: deal.stage,
      previousStage: deal.previousStage,
      contactId: deal.contactId,
    },
  });
}

export async function publishInvoiceOverdue(
  tenantId: string,
  invoice: { id: string; invoiceNum: string; amount: number; dueDate: string | Date; contactId?: string | null; customerEmail?: string | null }
) {
  return publishBusinessEvent({
    tenantId,
    type: 'INVOICE_OVERDUE',
    source: 'finance',
    actor: { type: 'SYSTEM', name: 'Finance Dunning Engine' },
    payload: {
      invoiceId: invoice.id,
      invoiceNum: invoice.invoiceNum,
      amount: invoice.amount,
      dueDate: invoice.dueDate,
      contactId: invoice.contactId,
      customerEmail: invoice.customerEmail,
    },
  });
}

export async function publishTicketEscalated(
  tenantId: string,
  ticket: { id: string; title: string; priority: string; status: string; customerEmail?: string | null }
) {
  return publishBusinessEvent({
    tenantId,
    type: 'TICKET_ESCALATED',
    source: 'helpdesk',
    actor: { type: 'SYSTEM', name: 'SLA Escalation Engine' },
    payload: {
      ticketId: ticket.id,
      title: ticket.title,
      priority: ticket.priority,
      status: ticket.status,
      customerEmail: ticket.customerEmail,
    },
  });
}

export async function publishProjectCreated(
  tenantId: string,
  project: { id: string; name: string; description?: string | null }
) {
  return publishBusinessEvent({
    tenantId,
    type: 'PROJECT_CREATED',
    source: 'projects',
    actor: { type: 'USER' },
    payload: {
      projectId: project.id,
      name: project.name,
      description: project.description,
    },
  });
}

export async function publishCandidateApplied(
  tenantId: string,
  candidate: { id: string; name: string; email: string; roleApplied: string; resumeUrl?: string | null }
) {
  return publishBusinessEvent({
    tenantId,
    type: 'CANDIDATE_APPLIED',
    source: 'hr',
    actor: { type: 'USER' },
    payload: {
      candidateId: candidate.id,
      name: candidate.name,
      email: candidate.email,
      roleApplied: candidate.roleApplied,
      resumeUrl: candidate.resumeUrl,
    },
  });
}

