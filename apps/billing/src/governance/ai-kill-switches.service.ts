import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface KillSwitchState {
  scope: 'GLOBAL' | 'TENANT' | 'AGENT' | 'TOOL';
  target: string;
  isEnabled: boolean; // true = active, false = killed / blocked
  reason?: string;
  updatedAt: string;
}

@Injectable()
export class AiKillSwitchesService {
  private readonly logger = new Logger(AiKillSwitchesService.name);

  // In-memory fast cache
  private readonly switchCache: Map<string, boolean> = new Map();

  constructor(private readonly prisma: PrismaService) {
    this.initDefaultSwitches();
  }

  private initDefaultSwitches() {
    this.switchCache.set('GLOBAL:GLOBAL', true);
    this.switchCache.set('AGENT:ares', true);
    this.switchCache.set('AGENT:athena', true);
    this.switchCache.set('AGENT:midas', true);
    this.switchCache.set('AGENT:hermes', true);
    this.switchCache.set('AGENT:vesta', true);
    this.switchCache.set('TOOL:create_payment_link', true);
    this.switchCache.set('TOOL:apply_service_credit', true);
  }

  /**
   * Check if an execution is permitted by all active kill switches
   */
  async isExecutionAllowed(options: { tenantId?: string; agentId?: string; toolId?: string }): Promise<{
    allowed: boolean;
    blockedBy?: string;
    reason?: string;
  }> {
    // 1. Global AI Kill Switch
    if (this.switchCache.get('GLOBAL:GLOBAL') === false) {
      return { allowed: false, blockedBy: 'GLOBAL_AI_KILL_SWITCH', reason: 'Global AI operations are currently emergency suspended.' };
    }

    // 2. Tenant AI Kill Switch
    if (options.tenantId && this.switchCache.get(`TENANT:${options.tenantId}`) === false) {
      return { allowed: false, blockedBy: 'TENANT_AI_KILL_SWITCH', reason: `AI operations for tenant ${options.tenantId} are suspended.` };
    }

    // 3. Agent-specific Kill Switch
    if (options.agentId) {
      const agentKey = `AGENT:${options.agentId.toLowerCase()}`;
      if (this.switchCache.get(agentKey) === false) {
        return { allowed: false, blockedBy: `AGENT_KILL_SWITCH_${options.agentId.toUpperCase()}`, reason: `Agent ${options.agentId} is currently disabled.` };
      }
    }

    // 4. Tool-specific Kill Switch
    if (options.toolId) {
      const toolKey = `TOOL:${options.toolId.toLowerCase()}`;
      if (this.switchCache.get(toolKey) === false) {
        return { allowed: false, blockedBy: `TOOL_KILL_SWITCH_${options.toolId.toUpperCase()}`, reason: `High-risk tool ${options.toolId} is currently disabled.` };
      }
    }

    return { allowed: true };
  }

  /**
   * Set or toggle an emergency kill switch
   */
  async setKillSwitch(
    scope: 'GLOBAL' | 'TENANT' | 'AGENT' | 'TOOL',
    target: string,
    isEnabled: boolean,
    reason?: string,
    updatedBy?: string,
  ) {
    const key = `${scope}:${target.toLowerCase()}`;
    this.switchCache.set(key, isEnabled);

    try {
      await this.prisma.aiKillSwitch.upsert({
        where: {
          scope_target: {
            scope,
            target: target.toLowerCase(),
          },
        },
        update: {
          isEnabled,
          reason,
          updatedBy,
        },
        create: {
          scope,
          target: target.toLowerCase(),
          isEnabled,
          reason,
          updatedBy,
        },
      });
    } catch {
      // safe fallback
    }

    this.logger.warn(`[AiKillSwitches] Kill switch [${scope}:${target}] set to ${isEnabled ? 'ACTIVE' : 'KILLED'}. Reason: ${reason || 'N/A'}`);

    return {
      scope,
      target,
      isEnabled,
      updatedAt: new Date().toISOString(),
      reason,
    };
  }

  /**
   * List all current kill switch statuses
   */
  async getAllSwitches(): Promise<KillSwitchState[]> {
    const result: KillSwitchState[] = [];
    for (const [k, v] of this.switchCache.entries()) {
      const [scope, target] = k.split(':');
      result.push({
        scope: scope as any,
        target,
        isEnabled: v,
        updatedAt: new Date().toISOString(),
      });
    }
    return result;
  }
}
