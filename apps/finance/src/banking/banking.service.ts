import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountingService } from '../accounting/accounting.service';

export interface CreateBankAccountDto {
  name: string;
  type?: string; // 'BANK_ACCOUNT' | 'CARD' | 'PAYPAL' | 'STRIPE' | 'CRYPTO_VAULT' | 'CASH_DRAWER'
  provider?: string;
  accountNumberMasked: string;
  routingNumber?: string;
  currency?: string;
  initialBalance?: number;
  status?: string;
}

export interface ImportTransactionDto {
  date?: Date | string;
  description: string;
  amount: number;
  currency?: string;
  type: 'CREDIT' | 'DEBIT';
  matchedRecordType?: string;
  matchedRecordId?: string;
}

@Injectable()
export class BankingService {
  private readonly logger = new Logger(BankingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly accountingService: AccountingService
  ) {}

  /**
   * Auto-seeds standard commercial bank accounts for a tenant if none exist
   */
  async ensureDefaultAccounts(tenantId: string) {
    const count = await this.prisma.bankAccount.count({ where: { tenantId } });
    if (count > 0) return;

    const defaults = [
      {
        name: 'Silicon Valley Operating',
        type: 'BANK_ACCOUNT',
        provider: 'First Republic / Chase',
        accountNumberMasked: '•••• 8821',
        routingNumber: '021000021',
        currency: 'USD',
        balance: 245000.0,
        status: 'PRIMARY',
      },
      {
        name: 'Stripe Treasury Clearing',
        type: 'STRIPE',
        provider: 'Stripe Financial Connections',
        accountNumberMasked: '•••• 4920',
        currency: 'USD',
        balance: 62450.0,
        status: 'ACTIVE',
      },
      {
        name: 'Corporate Card Revolving',
        type: 'CARD',
        provider: 'Brex / Ramp',
        accountNumberMasked: '•••• 1042',
        currency: 'USD',
        balance: -12840.0,
        status: 'ACTIVE',
      },
      {
        name: 'Corporate Treasury Vault',
        type: 'CRYPTO_VAULT',
        provider: 'Fireblocks Institutional',
        accountNumberMasked: '0x8f...4e19',
        currency: 'USD',
        balance: 150000.0,
        status: 'ACTIVE',
      },
    ];

    for (const acc of defaults) {
      await this.prisma.bankAccount.create({
        data: {
          tenantId,
          name: acc.name,
          type: acc.type,
          provider: acc.provider,
          accountNumberMasked: acc.accountNumberMasked,
          routingNumber: (acc as any).routingNumber || null,
          currency: acc.currency,
          balance: acc.balance,
          status: acc.status,
        },
      });
    }

    this.logger.log(`[Banking] Auto-seeded default bank accounts for tenant: ${tenantId}`);
  }

  async getAccounts(tenantId: string) {
    await this.ensureDefaultAccounts(tenantId);
    return this.prisma.bankAccount.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getAccount(tenantId: string, id: string) {
    await this.ensureDefaultAccounts(tenantId);
    const account = await this.prisma.bankAccount.findFirst({
      where: { id, tenantId },
      include: {
        transactions: {
          orderBy: { date: 'desc' },
          take: 50,
        },
      },
    });
    if (!account) throw new NotFoundException('Bank account not found');
    return account;
  }

  async createAccount(tenantId: string, dto: CreateBankAccountDto) {
    const created = await this.prisma.bankAccount.create({
      data: {
        tenantId,
        name: dto.name,
        type: dto.type || 'BANK_ACCOUNT',
        provider: dto.provider || 'Commercial Bank',
        accountNumberMasked: dto.accountNumberMasked || '•••• 0000',
        routingNumber: dto.routingNumber || null,
        currency: dto.currency || 'USD',
        balance: dto.initialBalance || 0,
        status: dto.status || 'ACTIVE',
      },
    });

    return created;
  }

  async getTransactions(tenantId: string, accountId?: string) {
    await this.ensureDefaultAccounts(tenantId);
    const where: any = { tenantId };
    if (accountId) where.accountId = accountId;

    return this.prisma.bankTransaction.findMany({
      where,
      include: { account: true },
      orderBy: { date: 'desc' },
      take: 100,
    });
  }

  async importTransactions(tenantId: string, accountId: string, dtos: ImportTransactionDto[]) {
    const account = await this.prisma.bankAccount.findFirst({ where: { id: accountId, tenantId } });
    if (!account) throw new NotFoundException('Target bank account not found');

    const createdList = [];
    let balanceDelta = 0;

    for (const dto of dtos) {
      const amount = Number(Math.abs(dto.amount).toFixed(2));
      const txType = dto.type || (dto.amount >= 0 ? 'CREDIT' : 'DEBIT');
      const delta = txType === 'CREDIT' ? amount : -amount;
      balanceDelta += delta;

      const created = await this.prisma.bankTransaction.create({
        data: {
          tenantId,
          accountId: account.id,
          date: dto.date ? new Date(dto.date) : new Date(),
          description: dto.description,
          amount,
          currency: dto.currency || account.currency || 'USD',
          type: txType,
          status: 'UNMATCHED',
          matchedRecordType: dto.matchedRecordType || null,
          matchedRecordId: dto.matchedRecordId || null,
        },
      });
      createdList.push(created);
    }

    // Update bank balance
    await this.prisma.bankAccount.update({
      where: { id: account.id },
      data: {
        balance: Number((account.balance + balanceDelta).toFixed(2)),
        lastSynced: new Date(),
      },
    });

    this.logger.log(`[Banking] Imported ${createdList.length} transactions into account ${account.name}`);
    return createdList;
  }

  /**
   * Internal funds transfer between accounts with double-entry general ledger posting
   */
  async transferFunds(
    tenantId: string,
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    memo?: string
  ) {
    if (fromAccountId === toAccountId) {
      throw new BadRequestException('Source and destination accounts must be different');
    }
    if (!amount || amount <= 0) {
      throw new BadRequestException('Transfer amount must be greater than zero');
    }

    const transferAmount = Number(amount.toFixed(2));

    const fromAccount = await this.prisma.bankAccount.findFirst({ where: { id: fromAccountId, tenantId } });
    const toAccount = await this.prisma.bankAccount.findFirst({ where: { id: toAccountId, tenantId } });

    if (!fromAccount || !toAccount) {
      throw new NotFoundException('Source or destination bank account not found');
    }

    const transferDate = new Date();
    const description = memo || `Internal Transfer: ${fromAccount.name} -> ${toAccount.name}`;

    // Execute atomic transaction for bank feeds
    await this.prisma.$transaction(async (tx) => {
      // 1. Debit outgoing from source
      await tx.bankTransaction.create({
        data: {
          tenantId,
          accountId: fromAccount.id,
          date: transferDate,
          description: `Transfer to ${toAccount.name}: ${description}`,
          amount: transferAmount,
          currency: fromAccount.currency,
          type: 'DEBIT',
          status: 'RECONCILED',
        },
      });

      // 2. Credit incoming to destination
      await tx.bankTransaction.create({
        data: {
          tenantId,
          accountId: toAccount.id,
          date: transferDate,
          description: `Transfer from ${fromAccount.name}: ${description}`,
          amount: transferAmount,
          currency: toAccount.currency,
          type: 'CREDIT',
          status: 'RECONCILED',
        },
      });

      // 3. Update account balances
      await tx.bankAccount.update({
        where: { id: fromAccount.id },
        data: { balance: Number((fromAccount.balance - transferAmount).toFixed(2)) },
      });

      await tx.bankAccount.update({
        where: { id: toAccount.id },
        data: { balance: Number((toAccount.balance + transferAmount).toFixed(2)) },
      });
    });

    // 4. Post double-entry GL entry (Debit Cash Clearing/Dest, Credit Cash Source)
    const cashAccount = await this.accountingService.getAccountByCode(tenantId, '1010');
    if (cashAccount) {
      await this.accountingService.createJournalEntry(tenantId, {
        memo: `Bank Transfer: ${fromAccount.name} to ${toAccount.name} ($${transferAmount.toFixed(2)})`,
        sourceType: 'TRANSFER',
        lines: [
          {
            accountId: cashAccount.id,
            debit: transferAmount,
            credit: 0,
            description: `Transfer In to ${toAccount.name}`,
          },
          {
            accountId: cashAccount.id,
            debit: 0,
            credit: transferAmount,
            description: `Transfer Out from ${fromAccount.name}`,
          },
        ],
      });
    }

    this.logger.log(`[Banking] Completed transfer of $${transferAmount} from ${fromAccount.name} to ${toAccount.name}`);
    return {
      success: true,
      amount: transferAmount,
      fromAccount: fromAccount.name,
      toAccount: toAccount.name,
      timestamp: transferDate,
    };
  }
}
