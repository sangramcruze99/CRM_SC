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
  | 'DEAL_INACTIVE'
  | 'DEAL_WON'
  | 'DEAL_CLOSED_WON'
  | 'DEAL_LOST'
  | 'RENEWAL_APPROACHING'
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
  | 'ESCROW_MILESTONE'
  // HR & Employee
  | 'EMPLOYEE_CREATED'
  | 'EMPLOYEE_ONBOARDED'
  | 'CANDIDATE_APPLIED'
  // E-Commerce & Retail
  | 'ORDER_CREATED'
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
  targetHandler: string; // Service name or workflow ID
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

// ----------------------------------------------------------------------------
// STAGE 2 PRODUCTION AGENT TYPES
// ----------------------------------------------------------------------------

export type AgentPlanStepStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'SKIPPED'
  | 'WAITING_APPROVAL';

export interface AgentPlanStep {
  id: string;
  action: string;
  description: string;
  status: AgentPlanStepStatus;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresApproval?: boolean;
  targetEntity?: string;
  targetId?: string;
  parameters?: Record<string, any>;
  result?: any;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface AgentPlan {
  id: string;
  goal: string;
  agentId: string;
  tenantId: string;
  status: 'PLANNED' | 'EXECUTING' | 'PAUSED' | 'COMPLETED' | 'FAILED';
  steps: AgentPlanStep[];
  createdAt: string;
  updatedAt: string;
}

export interface ExplainabilityMetadata {
  action: string;
  why: string[]; // Concrete factual bullet points of real business data
  confidence: number; // e.g. 0.94 (94%)
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  expectedOutcome: string;
  targetEntity?: string;
  targetId?: string;
  reasonCodes?: string[];
}

export interface CandidateMemory {
  id: string;
  tenantId: string;
  agentId: string;
  memoryType: 'USER' | 'AGENT' | 'BUSINESS';
  key: string;
  value: string;
  confidence: number;
  source: string;
  status: 'CANDIDATE' | 'VALIDATED' | 'REJECTED';
  validationNotes?: string;
  createdAt: string;
}

// ============================================================================
// STAGE 3: AUTONOMOUS BUSINESS AUTOMATION PLATFORM TYPES
// ============================================================================

export type WorkflowNodeType =
  | 'TRIGGER'
  | 'ACTION'
  | 'AI_AGENT'
  | 'CONDITION'
  | 'SWITCH'
  | 'DELAY'
  | 'WAIT_FOR_EVENT'
  | 'APPROVAL'
  | 'HUMAN_TASK'
  | 'WEBHOOK'
  | 'HTTP_REQUEST'
  | 'TRANSFORM'
  | 'PARALLEL'
  | 'MERGE'
  | 'LOOP'
  | 'RETRY'
  | 'NOTIFICATION'
  | 'SUB_WORKFLOW'
  | 'END';

export interface WorkflowErrorPolicy {
  maxAttempts?: number;
  backoff?: 'fixed' | 'exponential';
  onFailure?: 'ESCALATE' | 'PAUSE' | 'CONTINUE' | 'TERMINATE';
}

export interface WorkflowConcurrencyPolicy {
  maxConcurrentExecutions?: number;
  queueStrategy?: 'FIFO' | 'LIFO' | 'PRIORITY';
}

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType | string;
  name: string;
  config: Record<string, any>;
  inputSchema?: Record<string, any>;
  outputSchema?: Record<string, any>;
  timeoutMs?: number;
  retryPolicy?: WorkflowErrorPolicy;
  approvalPolicy?: {
    required: boolean;
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    approverRole?: string;
  };
  enabled: boolean;
  position?: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface AutonomousWorkflow {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  version: number;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  triggerType: string;
  triggerData?: Record<string, any>;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables?: Record<string, any>;
  errorPolicy?: WorkflowErrorPolicy;
  concurrencyPolicy?: WorkflowConcurrencyPolicy;
  createdAt: string;
  updatedAt: string;
}

export interface AgentHandoffPayload {
  workflowId: string;
  executionId: string;
  sourceAgent: string;
  targetAgentId: string;
  tenantId: string;
  entity: {
    type: string;
    id: string;
  };
  objective: string;
  facts: Record<string, any>;
  artifacts?: any[];
  previousResults?: any[];
  constraints?: string[];
  risk?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiredPermissions?: string[];
}

export interface AgentHandoffResult {
  success: boolean;
  targetAgent: string;
  executionId: string;
  status: 'COMPLETED' | 'WAITING_APPROVAL' | 'FAILED';
  output: Record<string, any>;
  planId?: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  tokensUsed?: number;
  error?: string;
}

export interface WorkflowValidationError {
  nodeId?: string;
  edgeId?: string;
  code: string;
  message: string;
  severity: 'ERROR' | 'WARNING';
}

export interface WorkflowValidationResult {
  valid: boolean;
  errors: WorkflowValidationError[];
  warnings: WorkflowValidationError[];
}

export interface MarketplaceItemDefinition {
  id: string;
  type: 'AGENT' | 'WORKFLOW' | 'INTEGRATION' | 'TEMPLATE' | 'AUTOMATION_PACK';
  name: string;
  description: string;
  version: string;
  publisherId: string;
  category: string;
  icon?: string;
  permissions: string[];
  requiredIntegrations: string[];
  configurationSchema?: Record<string, any>;
  pricing?: Record<string, any>;
  packageData?: Record<string, any>;
  status: 'DRAFT' | 'PUBLISHED' | 'SUSPENDED';
}


