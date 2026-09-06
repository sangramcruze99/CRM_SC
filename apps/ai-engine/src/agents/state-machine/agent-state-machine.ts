export type AgentState =
  | 'PENDING'
  | 'RUNNING'
  | 'WAITING_FOR_TOOL'
  | 'WAITING_FOR_APPROVAL'
  | 'EXECUTING'
  | 'COMPLETED'
  | 'FAILED'
  | 'RETRYING'
  | 'FAILED_PERMANENTLY';

export interface StateTransitionEvent {
  from: AgentState;
  to: AgentState;
  timestamp: string;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface StateMachineContext {
  executionId: string;
  agentId: string;
  tenantId: string;
  currentState: AgentState;
  history: StateTransitionEvent[];
  retryCount: number;
  maxRetries: number;
  approvalRequestId?: string;
  lastError?: string;
  startedAt: string;
  updatedAt: string;
}

const ALLOWED_TRANSITIONS: Record<AgentState, AgentState[]> = {
  PENDING: ['RUNNING', 'FAILED'],
  RUNNING: ['WAITING_FOR_TOOL', 'WAITING_FOR_APPROVAL', 'EXECUTING', 'COMPLETED', 'FAILED'],
  WAITING_FOR_TOOL: ['RUNNING', 'FAILED', 'EXECUTING'],
  WAITING_FOR_APPROVAL: ['RUNNING', 'EXECUTING', 'FAILED', 'COMPLETED'],
  EXECUTING: ['COMPLETED', 'FAILED', 'WAITING_FOR_TOOL', 'WAITING_FOR_APPROVAL'],
  COMPLETED: [], // Terminal state
  FAILED: ['RETRYING', 'FAILED_PERMANENTLY'],
  RETRYING: ['RUNNING', 'FAILED_PERMANENTLY'],
  FAILED_PERMANENTLY: [], // Terminal state
};

export class AgentExecutionStateMachine {
  private context: StateMachineContext;

  constructor(
    executionId: string,
    agentId: string,
    tenantId: string,
    initialState: AgentState = 'PENDING',
    maxRetries: number = 3
  ) {
    const now = new Date().toISOString();
    this.context = {
      executionId,
      agentId,
      tenantId,
      currentState: initialState,
      history: [
        {
          from: 'PENDING',
          to: initialState,
          timestamp: now,
          reason: 'Initial state creation',
        },
      ],
      retryCount: 0,
      maxRetries,
      startedAt: now,
      updatedAt: now,
    };
  }

  getState(): AgentState {
    return this.context.currentState;
  }

  getContext(): StateMachineContext {
    return { ...this.context };
  }

  canTransition(to: AgentState): boolean {
    const allowed = ALLOWED_TRANSITIONS[this.context.currentState] || [];
    return allowed.includes(to);
  }

  transition(to: AgentState, reason?: string, metadata?: Record<string, any>): StateMachineContext {
    const from = this.context.currentState;

    if (!this.canTransition(to)) {
      throw new Error(
        `Invalid agent state transition: Cannot move from ${from} to ${to} for execution ${this.context.executionId}`
      );
    }

    const now = new Date().toISOString();

    if (to === 'RETRYING') {
      this.context.retryCount++;
      if (this.context.retryCount > this.context.maxRetries) {
        to = 'FAILED_PERMANENTLY';
        reason = `Exceeded max retry budget (${this.context.maxRetries})`;
      }
    }

    this.context.currentState = to;
    this.context.updatedAt = now;
    this.context.history.push({
      from,
      to,
      timestamp: now,
      reason,
      metadata,
    });

    if (metadata?.approvalRequestId) {
      this.context.approvalRequestId = metadata.approvalRequestId;
    }
    if (metadata?.error) {
      this.context.lastError = metadata.error;
    }

    return this.getContext();
  }

  isTerminal(): boolean {
    return this.context.currentState === 'COMPLETED' || this.context.currentState === 'FAILED_PERMANENTLY';
  }

  isWaitingForHuman(): boolean {
    return this.context.currentState === 'WAITING_FOR_APPROVAL';
  }
}
