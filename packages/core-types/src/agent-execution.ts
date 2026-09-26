/**
 * Universal Agent Execution Contract & Output Models
 * Business OS / Enterprise CRM
 */

export type UniversalExecutionStatus =
  | 'SUCCESS'
  | 'FAILED'
  | 'PARTIALLY_COMPLETED'
  | 'WAITING_APPROVAL'
  | 'NEEDS_REVIEW'
  | 'ESCALATED'
  | 'NO_ACTION_REQUIRED'
  | 'CANCELLED'
  | 'DUPLICATE'
  | 'BLOCKED'
  | 'PROCESSING';

export type AgentOutputType =
  | 'TEXT'
  | 'STRUCTURED_DATA'
  | 'DOCUMENT'
  | 'ENTITY_UPDATE'
  | 'TASK'
  | 'EMAIL'
  | 'NOTIFICATION'
  | 'REPORT'
  | 'DECISION'
  | 'APPROVAL_REQUEST'
  | 'ERROR'
  | 'EXTERNAL_ACTION_RESULT';

export interface AgentActionRecord {
  actionId: string;
  actionType: string;
  toolName: string;
  targetService: string;
  targetEntityType?: string;
  targetEntityId?: string;
  parametersSummary?: string;
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED_APPROVAL' | 'SKIPPED';
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  resultSummary?: string;
  error?: string;
}

export interface AgentOutputRecord {
  outputId: string;
  type: AgentOutputType;
  title: string;
  summary: string;
  data?: Record<string, any>;
  documentId?: string;
  entityType?: string;
  entityId?: string;
  service: string;
  createdAt: string;
}

export interface ExecutionTriggerInfo {
  type: string;
  source: string;
  sourceId?: string;
  timestamp: string;
}

export interface ExecutionInputContext {
  sourceType: string;
  sourceId?: string;
  fileId?: string;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  dataSummary?: string;
}

export interface ExecutionProcessingTrace {
  stepsCount: number;
  model: string;
  provider: string;
  confidence: number;
  durationMs: number;
  tokensUsed?: number;
}

export interface ExecutionDecisionRecord {
  outcome: string;
  reason: string;
  confidence: number;
  policyChecksPassed?: boolean;
}

export interface ExecutionOutcomeSummary {
  status: UniversalExecutionStatus;
  code: string;
  summary: string;
  nextStep?: string;
}

export interface ExecutionHumanReviewInfo {
  required: boolean;
  reason?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_REQUIRED';
  approvalRequestId?: string;
  reviewerId?: string;
  reviewedAt?: string;
}

export interface ExecutionSourceReference {
  id: string;
  type: 'DOCUMENT' | 'ENTITY' | 'KNOWLEDGE_BASE' | 'WEBHOOK';
  name: string;
  url?: string;
  documentId?: string;
  service?: string;
}

export interface ExecutionMetrics {
  latencyMs: number;
  tokenUsage: number;
  toolCalls: number;
}

export interface ExecutionAuditStamp {
  recordedAt: string;
  auditLogId?: string;
  crmActivityId?: string;
}

export interface AgentExecutionResult {
  id: string;
  executionId: string;
  agentId: string;
  agentName: string;
  agentVersion?: string;

  tenantId: string;

  workflowId?: string;
  workflowName?: string;

  trigger: ExecutionTriggerInfo;
  input: ExecutionInputContext;
  processing: ExecutionProcessingTrace;
  decision: ExecutionDecisionRecord;

  actions: AgentActionRecord[];
  outputs: AgentOutputRecord[];

  outcome: ExecutionOutcomeSummary;
  humanReview: ExecutionHumanReviewInfo;

  sourceReferences: ExecutionSourceReference[];
  metrics: ExecutionMetrics;

  error?: string;
  audit?: ExecutionAuditStamp;

  createdAt: string;
  completedAt?: string;
}
