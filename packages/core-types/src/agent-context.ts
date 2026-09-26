/**
 * Universal Agent Execution Context & Configuration Sync Contracts
 * AGENT ↔ NICHE / WORKSPACE CONFIGURATION SYNC
 */

export type ToolAvailabilityStatus =
  | 'AVAILABLE'
  | 'BLOCKED'
  | 'REQUIRES_APPROVAL'
  | 'REQUIRES_CONNECTION'
  | 'UNAVAILABLE';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type KnowledgeScope =
  | 'GLOBAL'
  | 'INDUSTRY'
  | 'BUSINESS_TYPE'
  | 'WORKSPACE'
  | 'SERVICE'
  | 'RECORD';

export interface AgentTermInfo {
  singular: string;
  plural: string;
  verbAdd?: string;
  systemObject: string; // e.g. "customer", "invoice", "deal"
  displayTerm: string;  // e.g. "patient", "member", "guest", "buyer"
}

export interface ConfiguredRecordField {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  visibility?: 'ALWAYS' | 'CONDITIONAL' | 'HIDDEN' | 'ADMIN_ONLY';
}

export interface ConfiguredRecordType {
  id: string;
  name: string;
  singular: string;
  plural: string;
  category?: string;
  isCustom?: boolean;
  fields: ConfiguredRecordField[];
  statuses?: Array<{
    id: string;
    name: string;
    label: string;
    color?: string;
    order?: number;
  }>;
  relationships?: Array<{
    targetRecordId: string;
    relationshipType: string;
    label: string;
  }>;
}

export interface AgentUserPermissions {
  userId: string;
  role: string;
  allowedActions: string[];
  canAccessFinancials: boolean;
  canDeleteRecords: boolean;
  canTriggerExternalComms: boolean;
  canApproveActions: boolean;
}

export interface ResolvedAgentTool {
  name: string;
  displayName: string;
  serviceId: string;
  serviceName: string;
  category: string;
  riskLevel: RiskLevel;
  requiresApproval: boolean;
  status: ToolAvailabilityStatus;
  statusReason?: string;
  description: string;
  inputSchema?: Record<string, any>;
  outputSchema?: Record<string, any>;
}

export interface BlockedAgentTool {
  name: string;
  displayName?: string;
  serviceId?: string;
  reason: string;
  category?: string;
}

export interface ScopedKnowledgeSource {
  id: string;
  title: string;
  scope: KnowledgeScope;
  serviceId?: string;
  industry?: string;
  businessType?: string;
  summary?: string;
  snippets?: string[];
}

export interface ScopedMemoryContext {
  globalAgentFacts: string[];
  workspaceFacts: string[];
  businessFacts: string[];
  serviceFacts: string[];
  customerFacts: string[];
  recordFacts: string[];
  conversationHistory: Array<{ role: string; content: string }>;
}

export interface ConnectedIntegrationInfo {
  id: string;
  name: string;
  category: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'REQUIRES_SETUP';
  missingReason?: string;
}

export interface ActiveBusinessRule {
  id: string;
  serviceId: string;
  serviceName?: string;
  name: string;
  description: string;
  ruleExpression?: string;
  authoritative: boolean; // LLM must NEVER override authoritative rules
}

export interface ActiveWorkflowInfo {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
  category?: string;
}

export interface AgentExecutionContext {
  agent: {
    id: string;
    name: string;
    role: string;
    domain?: string;
    model?: string;
    autonomyMode?: 'AUTONOMOUS' | 'HYBRID' | 'MONITOR_ONLY';
  };

  workspace: {
    id: string;
    name: string;
    tenantId: string;
    region?: string;
    currency?: string;
  };

  industry: string;
  businessType: string;

  enabledServices: string[];
  disabledServices: string[];

  terminology: Record<string, AgentTermInfo>;
  recordTypes: ConfiguredRecordType[];

  permissions: AgentUserPermissions;

  availableTools: ResolvedAgentTool[];
  blockedTools: BlockedAgentTool[];

  knowledgeSources: ScopedKnowledgeSource[];

  memoryScopes: {
    globalAgentId: string;
    workspaceId: string;
    serviceId?: string;
    customerId?: string;
    recordId?: string;
    conversationId?: string;
  };
  memories: ScopedMemoryContext;

  integrations: ConnectedIntegrationInfo[];

  businessRules: ActiveBusinessRule[];

  activeWorkflows: ActiveWorkflowInfo[];

  outputDestinations: string[];

  configurationVersion: number;
}

export interface AgentCapabilityManifest {
  agentId: string;
  agentName: string;
  workspaceId: string;
  industry: string;
  businessType: string;
  configurationVersion: number;
  services: {
    enabled: string[];
    disabled: string[];
  };
  tools: {
    available: string[];
    requiresApproval: string[];
    blocked: string[];
    requiresConnection: string[];
  };
  permissions: {
    role: string;
    allowedActions: string[];
    canAccessFinancials: boolean;
  };
  knowledgeScopes: KnowledgeScope[];
  memoryScopes: string[];
  records: string[];
  outputDestinations: string[];
  approvalRules: Array<{ action: string; reason: string }>;
}

export interface AgentPolicy {
  tenantId: string;
  workspaceId: string;
  role: string;
  maxAutonomousFinancialValue: number;
  restrictedActions: string[];
  mandatoryApprovalActions: string[];
  prohibitedActions: string[];
}

export interface AgentPolicyDecision {
  allowed: boolean;
  requiresApproval: boolean;
  status: ToolAvailabilityStatus;
  riskLevel: RiskLevel;
  reason: string;
  why: string[];
}

export interface UniversalAgentResult {
  status: 'COMPLETED' | 'WAITING_APPROVAL' | 'PARTIALLY_COMPLETED' | 'FAILED' | 'BLOCKED';
  summary: string;
  actionsTaken: Array<{
    actionId: string;
    toolName: string;
    status: 'SUCCESS' | 'FAILED' | 'REQUIRES_APPROVAL';
    params?: any;
    result?: any;
    error?: string;
  }>;
  recordsCreated: Array<{ recordType: string; recordId: string; summary: string }>;
  recordsUpdated: Array<{ recordType: string; recordId: string; summary: string }>;
  documentsCreated: Array<{ documentId: string; title: string; url?: string }>;
  messagesSent: Array<{ channel: 'EMAIL' | 'WHATSAPP' | 'SMS' | 'CHAT'; recipient: string; messageId: string }>;
  workflowsStarted: Array<{ workflowId: string; workflowName: string; executionId: string }>;
  approvalRequired: boolean;
  approvalRequest?: {
    requestId: string;
    actionType: string;
    riskLevel: RiskLevel;
    reason: string;
    payload: any;
  };
  needsAttention: boolean;
  nextSteps: string[];
  configurationVersion: number;
}

export interface AgentConfigurationImpact {
  affectedAgents: Array<{
    agentId: string;
    agentName: string;
    impactLevel: 'CRITICAL' | 'MODERATE' | 'LOW';
    impactDetails: string[];
    disabledTools: string[];
  }>;
  affectedWorkflows: Array<{
    workflowId: string;
    workflowName: string;
    missingServiceId: string;
  }>;
  affectedTools: string[];
  affectedDashboards: string[];
  affectedReports: string[];
  canSafelyApply: boolean;
  blockingReasons: string[];
}
