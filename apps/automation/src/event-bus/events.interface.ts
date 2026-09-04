export type BusinessEventType =
  // CRM & Leads
  | 'CONTACT_CREATED'
  | 'CONTACT_UPDATED'
  | 'CONTACT_DELETED'
  | 'COMPANY_CREATED'
  | 'COMPANY_UPDATED'
  | 'LEAD_CREATED'
  | 'LEAD_QUALIFIED'
  | 'LEAD_SCORE_CHANGED'
  // Sales & Pipeline
  | 'DEAL_CREATED'
  | 'DEAL_STAGE_CHANGED'
  | 'DEAL_WON'
  | 'DEAL_LOST'
  // Tasks & Operations
  | 'TASK_CREATED'
  | 'TASK_COMPLETED'
  // Helpdesk & Support
  | 'TICKET_CREATED'
  | 'TICKET_ESCALATED'
  | 'TICKET_RESOLVED'
  // Finance & Treasury
  | 'INVOICE_CREATED'
  | 'INVOICE_OVERDUE'
  | 'PAYMENT_RECEIVED'
  | 'SUBSCRIPTION_CREATED'
  | 'SUBSCRIPTION_RENEWING'
  | 'SUBSCRIPTION_CANCELLED'
  // Documents & Legal
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_SIGNED'
  // HR & Employee
  | 'EMPLOYEE_CREATED'
  | 'EMPLOYEE_ONBOARDED'
  // Projects & Delivery
  | 'PROJECT_CREATED'
  | 'PROJECT_COMPLETED'
  // Customer Health & Success
  | 'CUSTOMER_CHURN_RISK'
  | 'CUSTOMER_HEALTH_CHANGED'
  // Omnichannel Communication
  | 'EMAIL_SENT'
  | 'EMAIL_OPENED'
  | 'EMAIL_CLICKED'
  | 'SMS_SENT'
  | 'CALL_COMPLETED'
  // Custom Events
  | 'CUSTOM_EVENT';

export interface BusinessEventActor {
  id?: string;
  name?: string;
  email?: string;
  type: 'USER' | 'SYSTEM' | 'AI_AGENT' | 'API' | 'WORKFLOW';
}

export interface BusinessEvent<T = Record<string, any>> {
  id: string;
  tenantId: string;
  type: BusinessEventType;
  version: string;
  correlationId: string;
  causationId?: string;
  timestamp: string;
  source: string;
  actor?: BusinessEventActor;
  payload: T;
  idempotencyKey?: string;
}

export interface EventBusSubscription {
  id: string;
  tenantId: string;
  eventType: BusinessEventType | '*';
  targetHandler: string;
  subscriberType: 'WORKFLOW' | 'SERVICE' | 'WEBHOOK' | 'AI_AGENT';
  createdAt: string;
}

export interface EventDeliveryReport {
  eventId: string;
  eventType: BusinessEventType;
  tenantId: string;
  correlationId: string;
  timestamp: string;
  status: 'DELIVERED' | 'FAILED' | 'DEAD_LETTER' | 'DUPLICATE_IGNORED';
  matchedSubscribers: number;
  dispatchedWorkflows: string[];
  executionTimeMs: number;
  error?: string;
}
