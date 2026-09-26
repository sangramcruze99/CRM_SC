// apps/web-core/src/components/automation/intent/types.ts
// Client-side types for Universal Intent & Outcome Experience

export interface DomainField {
  id: string;
  name: string;
  category: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'date';
  operators: string[];
  options?: string[];
  placeholder?: string;
}

export interface DomainActionOption {
  id: string;
  name: string;
  description: string;
  defaultConfig?: Record<string, any>;
  fields?: { id: string; name: string; type: string; required?: boolean; placeholder?: string }[];
}

export interface DomainTemplate {
  id: string;
  title: string;
  description: string;
  samplePrompt: string;
  trigger: string;
  rulesSummary: string[];
  actionSummary: string;
  resultDestination: string;
}

export interface DomainPack {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  color: string;
  fields: DomainField[];
  actions: DomainActionOption[];
  resultDestinations: { id: string; name: string; description: string }[];
  templates: DomainTemplate[];
  samplePrompts: string[];
}

export interface StructuredRule {
  id: string;
  field: string;
  fieldLabel: string;
  operator: string;
  value: any;
  priority: 'REQUIRED' | 'PREFERRED' | 'OPTIONAL';
}

export interface AtLeastNRule {
  threshold: number;
  total: number;
  items: string[];
  priority: 'REQUIRED' | 'PREFERRED' | 'OPTIONAL';
}

export interface RuleGroup {
  logic: 'ALL' | 'ANY' | 'NONE';
  rules: StructuredRule[];
  atLeastNRules?: AtLeastNRule[];
}

export interface StructuredAction {
  id: string;
  type: string;
  name: string;
  description: string;
  config: Record<string, any>;
}

export interface StructuredIntent {
  id?: string;
  name: string;
  goal: string;
  domain: string;
  domainName: string;
  trigger: {
    type: string;
    description: string;
    timing: 'IMMEDIATELY' | 'AFTER_DELAY' | 'SCHEDULED' | 'BUSINESS_HOURS' | 'OUTSIDE_BUSINESS_HOURS';
    delayValue?: string;
    cronExpression?: string;
  };
  ruleGroups: RuleGroup[];
  actions: StructuredAction[];
  timing: {
    schedule: string;
    window?: 'BUSINESS_HOURS' | 'OUTSIDE_BUSINESS_HOURS' | 'ALWAYS';
    delay?: string;
  };
  channels: string[];
  approvalPolicy: {
    required: boolean;
    condition: 'NEVER' | 'ALWAYS' | 'AI_UNSURE' | 'THRESHOLD_EXCEEDED' | 'EXTERNAL_COMMUNICATION';
    reviewerRole?: string;
    thresholdAmount?: number;
  };
  resultDestination: {
    id: string;
    name: string;
    summary: string;
  };
  exceptions: {
    onFailure: 'ASK_HUMAN' | 'RETRY' | 'STOP' | 'FALLBACK';
    onUncertain: 'ESCALATE_TO_HUMAN' | 'ASK_FOR_INFO';
    fallbackAction?: string;
  };
  explanation: string;
  visualSummary: string[];
  validation: {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  };
}

export interface SimulationStep {
  stepNumber: number;
  phase: 'TRIGGER' | 'AI_EVALUATION' | 'CONDITION_CHECK' | 'HUMAN_APPROVAL' | 'ACTION_EXECUTION' | 'RESULT_DELIVERY';
  title: string;
  detail: string;
  outcome: 'PASSED' | 'FAILED' | 'BRANCHED' | 'ESCALATED' | 'COMPLETED';
  evidence?: string[];
  metrics?: Record<string, any>;
}

export interface SimulationResult {
  intentName: string;
  domain: string;
  overallStatus: 'SUCCESS_APPROVED' | 'SUCCESS_AUTO' | 'REJECTED_CRITERIA' | 'ESCALATED_HUMAN';
  finalSummary: string;
  steps: SimulationStep[];
  outputData: Record<string, any>;
}
