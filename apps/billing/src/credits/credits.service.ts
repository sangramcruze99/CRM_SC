import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface GrantCreditsDto {
  tenantId: string;
  type: 'INCLUDED' | 'PURCHASED' | 'PROMOTIONAL' | 'ENTERPRISE' | 'ROLLOVER';
  amount: number;
  source: string;
  sourceId?: string;
  expiresAt?: Date;
  idempotencyKey?: string;
  metadata?: Record<string, any>;
}

export interface ConsumeCreditsDto {
  tenantId: string;
  amount: number;
  source: string;
  sourceId?: string;
  idempotencyKey?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class CreditsService {
  private readonly logger = new Logger(CreditsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get current net credit balance for a tenant
   */
  async getBalance(tenantId: string): Promise<{
    tenantId: string;
    totalBalance: number;
    breakdown: {
      included: number;
      purchased: number;
      promotional: number;
      enterprise: number;
      consumed: number;
    };
    recentTransactionsCount: number;
  }> {
    const entries = await this.prisma.creditLedger.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    let included = 0;
    let purchased = 0;
    let promotional = 0;
    let enterprise = 0;
    let consumed = 0;

    for (const e of entries) {
      if (e.amount < 0) {
        consumed += Math.abs(e.amount);
      } else if (e.type === 'INCLUDED') {
        included += e.amount;
      } else if (e.type === 'PURCHASED') {
        purchased += e.amount;
      } else if (e.type === 'PROMOTIONAL') {
        promotional += e.amount;
      } else if (e.type === 'ENTERPRISE') {
        enterprise += e.amount;
      }
    }

    const latest = entries[0];
    const totalBalance = latest ? latest.balanceAfter : Math.max(0, included + purchased + promotional + enterprise - consumed);

    return {
      tenantId,
      totalBalance: Math.max(0, totalBalance),
      breakdown: {
        included,
        purchased,
        promotional,
        enterprise,
        consumed,
      },
      recentTransactionsCount: entries.length,
    };
  }

  /**
   * Grant credits via double-entry ledger entry
   */
  async grantCredits(dto: GrantCreditsDto) {
    if (dto.amount <= 0) {
      throw new BadRequestException('Credit grant amount must be positive');
    }

    // Check idempotency
    if (dto.idempotencyKey) {
      const existing = await this.prisma.creditLedger.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
      });
      if (existing) {
        this.logger.debug(`[Credits] Idempotent grant hit for key: ${dto.idempotencyKey}`);
        return existing;
      }
    }

    const { totalBalance } = await this.getBalance(dto.tenantId);
    const balanceAfter = totalBalance + dto.amount;

    const entry = await this.prisma.creditLedger.create({
      data: {
        tenantId: dto.tenantId,
        type: dto.type,
        amount: dto.amount,
        balanceAfter,
        source: dto.source,
        sourceId: dto.sourceId,
        expiresAt: dto.expiresAt,
        idempotencyKey: dto.idempotencyKey,
        metadata: JSON.stringify(dto.metadata || {}),
      },
    });

    this.logger.log(`[Credits] Granted ${dto.amount} ${dto.type} credits to ${dto.tenantId}. New balance: ${balanceAfter}`);
    return entry;
  }

  /**
   * Consume credits with balance check
   */
  async consumeCredits(dto: ConsumeCreditsDto) {
    if (dto.amount <= 0) {
      throw new BadRequestException('Credit consumption amount must be positive');
    }

    // Check idempotency
    if (dto.idempotencyKey) {
      const existing = await this.prisma.creditLedger.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
      });
      if (existing) {
        this.logger.debug(`[Credits] Idempotent debit hit for key: ${dto.idempotencyKey}`);
        return existing;
      }
    }

    const { totalBalance } = await this.getBalance(dto.tenantId);
    if (totalBalance < dto.amount) {
      throw new BadRequestException(`Insufficient credit balance. Available: ${totalBalance}, Requested: ${dto.amount}`);
    }

    const balanceAfter = totalBalance - dto.amount;

    const entry = await this.prisma.creditLedger.create({
      data: {
        tenantId: dto.tenantId,
        type: 'CONSUMED',
        amount: -dto.amount,
        balanceAfter,
        source: dto.source,
        sourceId: dto.sourceId,
        idempotencyKey: dto.idempotencyKey,
        metadata: JSON.stringify(dto.metadata || {}),
      },
    });

    this.logger.log(`[Credits] Consumed ${dto.amount} credits for ${dto.tenantId}. Balance: ${balanceAfter}`);
    return entry;
  }

  /**
   * Fetch chronological credit ledger history
   */
  async getLedgerHistory(tenantId: string, limit = 50) {
    return this.prisma.creditLedger.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
