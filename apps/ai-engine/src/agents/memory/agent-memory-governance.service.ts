import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CandidateMemory } from '@repo/core-types';

export interface ProposeCandidateMemoryOptions {
  tenantId: string;
  agentId: string;
  memoryType: 'USER' | 'AGENT' | 'BUSINESS';
  key: string;
  value: string;
  confidence: number;
  source: string;
  entityType?: string;
  entityId?: string;
}

export interface ValidationRule {
  name: string;
  validate: (candidate: ProposeCandidateMemoryOptions) => { valid: boolean; reason?: string };
}

@Injectable()
export class AgentMemoryGovernanceService {
  private readonly logger = new Logger(AgentMemoryGovernanceService.name);

  // In-memory candidate staging queue
  private candidateQueue: CandidateMemory[] = [];

  // Validation Rules
  private validationRules: ValidationRule[] = [
    {
      name: 'Confidence Threshold',
      validate: (c) => ({
        valid: c.confidence >= 0.75,
        reason: c.confidence < 0.75 ? `Confidence ${c.confidence} below threshold (0.75)` : undefined,
      }),
    },
    {
      name: 'Content Length & Noise Filter',
      validate: (c) => ({
        valid: c.value.trim().length >= 3 && c.value.trim().length <= 2000,
        reason: 'Memory content must be between 3 and 2000 characters',
      }),
    },
    {
      name: 'PII & Security Filter',
      validate: (c) => {
        const sensitivePatterns = [/password/i, /secret/i, /api[_-]?key/i, /credit[_-]?card/i];
        const hasSensitive = sensitivePatterns.some((p) => p.test(c.key) || p.test(c.value));
        return {
          valid: !hasSensitive,
          reason: hasSensitive ? 'Candidate memory rejected due to potential secret or credentials pattern' : undefined,
        };
      },
    },
    {
      name: 'Business Memory Grounding',
      validate: (c) => {
        if (c.memoryType === 'BUSINESS') {
          // Must have explicit source or entity attribution
          return {
            valid: Boolean(c.source && c.source !== 'unknown'),
            reason: 'Business memory facts must have a verifiable source attribution',
          };
        }
        return { valid: true };
      },
    },
  ];

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Propose a candidate memory. Does NOT write directly to permanent storage.
   * Runs the candidate through validation and policy gates before persisting.
   */
  async proposeMemory(options: ProposeCandidateMemoryOptions): Promise<{
    status: 'COMMITTED' | 'REJECTED' | 'QUEUED_FOR_REVIEW';
    candidateId: string;
    memoryId?: string;
    reason?: string;
  }> {
    const candidateId = `cand_mem_${crypto.randomUUID().slice(0, 8)}`;
    this.logger.log(
      `[Memory Governance] Evaluating candidate memory ${candidateId} [${options.memoryType}] for Agent ${options.agentId}: "${options.key}"`
    );

    // 1. Run Validation Engine
    for (const rule of this.validationRules) {
      const check = rule.validate(options);
      if (!check.valid) {
        this.logger.warn(`[Memory Governance] Candidate memory ${candidateId} failed rule '${rule.name}': ${check.reason}`);
        this.candidateQueue.unshift({
          id: candidateId,
          ...options,
          status: 'REJECTED',
          validationNotes: check.reason,
          createdAt: new Date().toISOString(),
        });
        return { status: 'REJECTED', candidateId, reason: check.reason };
      }
    }

    // 2. Run Policy Check: High-confidence validated facts get committed to permanent store
    try {
      const permanentMemory = await this.prisma.agentMemory.create({
        data: {
          tenantId: options.tenantId,
          agentId: options.agentId,
          memoryType: options.memoryType,
          key: options.key,
          value: options.value,
          entityType: options.entityType || null,
          entityId: options.entityId || null,
          confidence: options.confidence,
        },
      });

      this.logger.log(
        `[Memory Governance] Candidate memory ${candidateId} validated and COMMITTED to permanent store (${permanentMemory.id})`
      );

      this.candidateQueue.unshift({
        id: candidateId,
        ...options,
        status: 'VALIDATED',
        validationNotes: 'Passed all validation and policy rules',
        createdAt: new Date().toISOString(),
      });

      return {
        status: 'COMMITTED',
        candidateId,
        memoryId: permanentMemory.id,
      };
    } catch (err: any) {
      this.logger.error(`[Memory Governance] Permanent memory write failed: ${err.message}`);
      return { status: 'REJECTED', candidateId, reason: err.message };
    }
  }

  /**
   * Retrieve categorized memories: User Memory, Agent Memory, Business Memory
   */
  async getCategorizedMemories(
    tenantId: string,
    agentId: string,
    entityId?: string
  ): Promise<{
    userMemories: any[];
    agentMemories: any[];
    businessMemories: any[];
  }> {
    try {
      const records = await this.prisma.agentMemory.findMany({
        where: {
          tenantId,
          ...(entityId ? { OR: [{ agentId }, { entityId }] } : { agentId }),
        },
        orderBy: { updatedAt: 'desc' },
        take: 30,
      });

      return {
        userMemories: records.filter((m) => m.memoryType === 'USER' || m.memoryType === 'SHORT_TERM'),
        agentMemories: records.filter((m) => m.memoryType === 'AGENT' || m.memoryType === 'LONG_TERM'),
        businessMemories: records.filter((m) => m.memoryType === 'BUSINESS' || m.memoryType === 'CUSTOMER'),
      };
    } catch {
      return { userMemories: [], agentMemories: [], businessMemories: [] };
    }
  }

  getCandidateHistory(tenantId?: string): CandidateMemory[] {
    return tenantId ? this.candidateQueue.filter((c) => c.tenantId === tenantId) : this.candidateQueue;
  }
}
