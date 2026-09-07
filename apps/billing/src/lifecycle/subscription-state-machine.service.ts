import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type SubscriptionState =
  | 'TRIALING'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'GRACE_PERIOD'
  | 'RESTRICTED'
  | 'SUSPENDED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'DELETED_PENDING'
  | 'DELETED';

export interface StatePrivileges {
  loginAllowed: boolean;
  readOnly: boolean;
  mutationsAllowed: boolean;
  aiExecutionAllowed: boolean;
  billingManagementAllowed: boolean;
  retentionWarningActive: boolean;
}

@Injectable()
export class SubscriptionStateMachineService {
  private readonly logger = new Logger(SubscriptionStateMachineService.name);

  // Strict transition graph: Key = Source State, Value = Set of valid Target States
  private readonly VALID_TRANSITIONS: Record<SubscriptionState, Set<SubscriptionState>> = {
    TRIALING: new Set(['ACTIVE', 'EXPIRED', 'CANCELLED', 'PAST_DUE']),
    ACTIVE: new Set(['PAST_DUE', 'CANCELLED', 'SUSPENDED', 'ACTIVE']),
    PAST_DUE: new Set(['ACTIVE', 'GRACE_PERIOD', 'RESTRICTED', 'CANCELLED']),
    GRACE_PERIOD: new Set(['ACTIVE', 'RESTRICTED', 'CANCELLED', 'PAST_DUE']),
    RESTRICTED: new Set(['ACTIVE', 'SUSPENDED', 'CANCELLED']),
    SUSPENDED: new Set(['ACTIVE', 'DELETED_PENDING', 'CANCELLED']),
    CANCELLED: new Set(['ACTIVE', 'EXPIRED', 'DELETED_PENDING']),
    EXPIRED: new Set(['ACTIVE', 'DELETED_PENDING', 'CANCELLED']),
    DELETED_PENDING: new Set(['DELETED', 'ACTIVE']),
    DELETED: new Set([]), // Terminal state
  };

  // State-specific operational privileges
  private readonly PRIVILEGES_MAP: Record<SubscriptionState, StatePrivileges> = {
    TRIALING: {
      loginAllowed: true,
      readOnly: false,
      mutationsAllowed: true,
      aiExecutionAllowed: true,
      billingManagementAllowed: true,
      retentionWarningActive: false,
    },
    ACTIVE: {
      loginAllowed: true,
      readOnly: false,
      mutationsAllowed: true,
      aiExecutionAllowed: true,
      billingManagementAllowed: true,
      retentionWarningActive: false,
    },
    PAST_DUE: {
      loginAllowed: true,
      readOnly: false,
      mutationsAllowed: true,
      aiExecutionAllowed: true,
      billingManagementAllowed: true,
      retentionWarningActive: true,
    },
    GRACE_PERIOD: {
      loginAllowed: true,
      readOnly: false,
      mutationsAllowed: true,
      aiExecutionAllowed: false, // AI throttled during grace period
      billingManagementAllowed: true,
      retentionWarningActive: true,
    },
    RESTRICTED: {
      loginAllowed: true,
      readOnly: true, // Read-only mode
      mutationsAllowed: false,
      aiExecutionAllowed: false,
      billingManagementAllowed: true,
      retentionWarningActive: true,
    },
    SUSPENDED: {
      loginAllowed: true, // Can only view suspension message and pay
      readOnly: true,
      mutationsAllowed: false,
      aiExecutionAllowed: false,
      billingManagementAllowed: true,
      retentionWarningActive: true,
    },
    CANCELLED: {
      loginAllowed: true,
      readOnly: true,
      mutationsAllowed: false,
      aiExecutionAllowed: false,
      billingManagementAllowed: true,
      retentionWarningActive: true,
    },
    EXPIRED: {
      loginAllowed: true,
      readOnly: true,
      mutationsAllowed: false,
      aiExecutionAllowed: false,
      billingManagementAllowed: true,
      retentionWarningActive: true,
    },
    DELETED_PENDING: {
      loginAllowed: false,
      readOnly: true,
      mutationsAllowed: false,
      aiExecutionAllowed: false,
      billingManagementAllowed: false,
      retentionWarningActive: true,
    },
    DELETED: {
      loginAllowed: false,
      readOnly: false,
      mutationsAllowed: false,
      aiExecutionAllowed: false,
      billingManagementAllowed: false,
      retentionWarningActive: false,
    },
  };

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validate whether a state transition is legal
   */
  isValidTransition(current: SubscriptionState, next: SubscriptionState): boolean {
    const validTargets = this.VALID_TRANSITIONS[current];
    return !!validTargets && validTargets.has(next);
  }

  /**
   * Get operational privileges for a subscription status
   */
  getPrivileges(state: SubscriptionState | string): StatePrivileges {
    const norm = (state?.toUpperCase() || 'TRIALING') as SubscriptionState;
    return this.PRIVILEGES_MAP[norm] || this.PRIVILEGES_MAP.TRIALING;
  }

  /**
   * Transition tenant subscription to next state with validation
   */
  async transitionState(tenantId: string, nextState: SubscriptionState, reason?: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    const currentState = ((sub?.status?.toUpperCase() || 'TRIALING') as SubscriptionState);

    if (currentState === nextState) {
      return { success: true, state: nextState, changed: false, privileges: this.getPrivileges(nextState) };
    }

    if (!this.isValidTransition(currentState, nextState)) {
      throw new BadRequestException(
        `Invalid subscription state transition: cannot transition from ${currentState} to ${nextState}.`,
      );
    }

    if (sub) {
      await this.prisma.subscription.update({
        where: { id: sub.id },
        data: {
          status: nextState,
          canceledAt: nextState === 'CANCELLED' ? new Date() : sub.canceledAt,
        },
      });
    } else {
      await this.prisma.subscription.create({
        data: {
          tenantId,
          planId: 'FREE',
          status: nextState,
          billingInterval: 'monthly',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
          canceledAt: nextState === 'CANCELLED' ? new Date() : null,
        },
      });
    }

    this.logger.log(`[SubscriptionStateMachine] Tenant ${tenantId} transitioned: ${currentState} -> ${nextState}. Reason: ${reason || 'Automated policy'}`);

    return {
      success: true,
      previousState: currentState,
      currentState: nextState,
      changed: true,
      privileges: this.getPrivileges(nextState),
    };
  }
}
