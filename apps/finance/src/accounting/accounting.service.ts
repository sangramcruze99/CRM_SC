import { Injectable, Logger, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateJournalLineDto {
  accountId: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface CreateJournalEntryDto {
  memo: string;
  date?: Date | string;
  sourceType?: string; // 'INVOICE' | 'BILL' | 'PAYMENT' | 'TRANSFER' | 'MANUAL' | 'ADJUSTMENT'
  sourceId?: string;
  lines: CreateJournalLineDto[];
}

@Injectable()
export class AccountingService {
  private readonly logger = new Logger(AccountingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Initializes standard Chart of Accounts for a tenant if not present
   */
  async ensureChartOfAccounts(tenantId: string) {
    const existing = await this.prisma.chartOfAccount.findFirst({ where: { tenantId } });
    if (existing) return;

    const defaults = [
      { code: '1010', name: 'Cash & Cash Equivalents', type: 'ASSET' },
      { code: '1200', name: 'Accounts Receivable (AR)', type: 'ASSET' },
      { code: '1500', name: 'Equipment & Physical Assets', type: 'ASSET' },
      { code: '2000', name: 'Accounts Payable (AP)', type: 'LIABILITY' },
      { code: '2100', name: 'Tax Payable (GST/VAT)', type: 'LIABILITY' },
      { code: '3000', name: 'Retained Earnings & Owner Equity', type: 'EQUITY' },
      { code: '4000', name: 'Commercial Sales Revenue', type: 'REVENUE' },
      { code: '4100', name: 'Subscription & Recurring Revenue', type: 'REVENUE' },
      { code: '5000', name: 'Cost of Goods & Services (COGS)', type: 'EXPENSE' },
      { code: '5100', name: 'General & Administrative Expenses', type: 'EXPENSE' },
      { code: '5200', name: 'Payroll & Compensation', type: 'EXPENSE' },
      { code: '5300', name: 'Software & Cloud Infrastructure', type: 'EXPENSE' },
    ];

    for (const acc of defaults) {
      await this.prisma.chartOfAccount.create({
        data: {
          tenantId,
          code: acc.code,
          name: acc.name,
          type: acc.type,
          currency: 'USD',
          balance: 0,
        },
      });
    }
    this.logger.log(`[Accounting] Initialized standard Chart of Accounts for tenant: ${tenantId}`);
  }

  async getChartOfAccounts(tenantId: string) {
    await this.ensureChartOfAccounts(tenantId);
    return this.prisma.chartOfAccount.findMany({
      where: { tenantId, isActive: true },
      orderBy: { code: 'asc' },
    });
  }

  async getAccountByCode(tenantId: string, code: string) {
    await this.ensureChartOfAccounts(tenantId);
    return this.prisma.chartOfAccount.findFirst({
      where: { tenantId, code },
    });
  }

  /**
   * Post a balanced double-entry journal entry
   */
  async createJournalEntry(tenantId: string, dto: CreateJournalEntryDto, txPrisma?: any) {
    const client = txPrisma || this.prisma;
    await this.ensureChartOfAccounts(tenantId);

    const entryDate = dto.date ? new Date(dto.date) : new Date();

    // Check financial period status
    const closedPeriod = await client.financialPeriod.findFirst({
      where: {
        tenantId,
        status: 'CLOSED',
        startDate: { lte: entryDate },
        endDate: { gte: entryDate },
      },
    });

    if (closedPeriod) {
      throw new ForbiddenException(`Cannot post transaction to closed accounting period: ${closedPeriod.name}`);
    }

    // Validate double entry debits == credits
    let totalDebit = 0;
    let totalCredit = 0;

    for (const line of dto.lines) {
      totalDebit += Number(line.debit || 0);
      totalCredit += Number(line.credit || 0);
    }

    const diff = Math.abs(totalDebit - totalCredit);
    if (diff > 0.005) {
      throw new BadRequestException(
        `Accounting integrity failure: Total debits ($${totalDebit.toFixed(2)}) must equal total credits ($${totalCredit.toFixed(2)}). Discrepancy: $${diff.toFixed(2)}`
      );
    }

    const entryCount = await client.journalEntry.count({ where: { tenantId } });
    const entryNumber = `JE-${String(entryCount + 1).padStart(5, '0')}`;

    const created = await client.journalEntry.create({
      data: {
        tenantId,
        entryNumber,
        date: entryDate,
        memo: dto.memo,
        sourceType: dto.sourceType || 'MANUAL',
        sourceId: dto.sourceId || null,
        status: 'POSTED',
        lines: {
          create: dto.lines.map((l) => ({
            accountId: l.accountId,
            debit: Number(l.debit || 0),
            credit: Number(l.credit || 0),
            description: l.description || dto.memo,
          })),
        },
      },
      include: {
        lines: {
          include: { account: true },
        },
      },
    });

    // Update account balances
    for (const line of dto.lines) {
      const acc = await client.chartOfAccount.findUnique({ where: { id: line.accountId } });
      if (acc) {
        // Normal balances: Assets & Expenses increase on Debit; Liabilities, Equity, Revenue increase on Credit
        const isDebitNormal = acc.type === 'ASSET' || acc.type === 'EXPENSE';
        const delta = isDebitNormal
          ? Number(line.debit || 0) - Number(line.credit || 0)
          : Number(line.credit || 0) - Number(line.debit || 0);

        await client.chartOfAccount.update({
          where: { id: acc.id },
          data: { balance: { increment: delta } },
        });
      }
    }

    this.logger.log(`[Accounting] Posted Journal Entry ${entryNumber} ($${totalDebit.toFixed(2)})`);
    return created;
  }

  /**
   * Reverse an existing journal entry (immutability rule)
   */
  async reverseJournalEntry(tenantId: string, id: string, reversedById = 'SYSTEM') {
    const original = await this.prisma.journalEntry.findFirst({
      where: { id, tenantId },
      include: { lines: true },
    });

    if (!original) throw new NotFoundException('Journal entry not found');
    if (original.status === 'REVERSED') throw new BadRequestException('Journal entry is already reversed');

    // Create offsetting journal entry
    const reversalLines: CreateJournalLineDto[] = original.lines.map((l) => ({
      accountId: l.accountId,
      debit: l.credit, // swap debit and credit
      credit: l.debit,
      description: `Reversal of ${original.entryNumber}: ${l.description || original.memo}`,
    }));

    const reversalEntry = await this.createJournalEntry(tenantId, {
      memo: `Reversal of ${original.entryNumber}: ${original.memo}`,
      sourceType: 'REVERSAL',
      sourceId: original.id,
      lines: reversalLines,
    });

    await this.prisma.journalEntry.update({
      where: { id: original.id },
      data: {
        status: 'REVERSED',
        reversedAt: new Date(),
        reversedById,
      },
    });

    return reversalEntry;
  }

  async getJournalEntries(tenantId: string, limit = 50) {
    return this.prisma.journalEntry.findMany({
      where: { tenantId },
      include: {
        lines: {
          include: { account: true },
        },
      },
      orderBy: { date: 'desc' },
      take: limit,
    });
  }

  /**
   * Generates real-time Trial Balance report
   */
  async getTrialBalance(tenantId: string) {
    await this.ensureChartOfAccounts(tenantId);
    const accounts = await this.prisma.chartOfAccount.findMany({
      where: { tenantId, isActive: true },
      include: { journalLines: true },
      orderBy: { code: 'asc' },
    });

    let totalDebits = 0;
    let totalCredits = 0;

    const rows = accounts.map((acc) => {
      const sumDebit = acc.journalLines.reduce((accDebit, l) => accDebit + Number(l.debit || 0), 0);
      const sumCredit = acc.journalLines.reduce((accCredit, l) => accCredit + Number(l.credit || 0), 0);

      totalDebits += sumDebit;
      totalCredits += sumCredit;

      return {
        id: acc.id,
        code: acc.code,
        name: acc.name,
        type: acc.type,
        debit: Number(sumDebit.toFixed(2)),
        credit: Number(sumCredit.toFixed(2)),
        netBalance: Number(acc.balance.toFixed(2)),
      };
    });

    return {
      asOf: new Date().toISOString(),
      isBalanced: Math.abs(totalDebits - totalCredits) <= 0.01,
      totalDebits: Number(totalDebits.toFixed(2)),
      totalCredits: Number(totalCredits.toFixed(2)),
      difference: Number(Math.abs(totalDebits - totalCredits).toFixed(2)),
      accounts: rows,
    };
  }

  /**
   * Generates Balance Sheet: Assets = Liabilities + Equity
   */
  async getBalanceSheet(tenantId: string) {
    await this.ensureChartOfAccounts(tenantId);
    const accounts = await this.prisma.chartOfAccount.findMany({
      where: { tenantId, isActive: true },
      orderBy: { code: 'asc' },
    });

    const assets = accounts.filter((a) => a.type === 'ASSET');
    const liabilities = accounts.filter((a) => a.type === 'LIABILITY');
    const equity = accounts.filter((a) => a.type === 'EQUITY');

    const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0);
    const totalLiabilities = liabilities.reduce((sum, a) => sum + a.balance, 0);
    const totalEquity = equity.reduce((sum, a) => sum + a.balance, 0);

    return {
      asOf: new Date().toISOString(),
      assets: {
        total: Number(totalAssets.toFixed(2)),
        items: assets.map((a) => ({ code: a.code, name: a.name, balance: Number(a.balance.toFixed(2)) })),
      },
      liabilities: {
        total: Number(totalLiabilities.toFixed(2)),
        items: liabilities.map((a) => ({ code: a.code, name: a.name, balance: Number(a.balance.toFixed(2)) })),
      },
      equity: {
        total: Number(totalEquity.toFixed(2)),
        items: equity.map((a) => ({ code: a.code, name: a.name, balance: Number(a.balance.toFixed(2)) })),
      },
      isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) <= 0.01,
    };
  }

  /**
   * Generates Profit & Loss: Revenue - Expenses = Net Profit
   */
  async getProfitAndLoss(tenantId: string) {
    await this.ensureChartOfAccounts(tenantId);
    const accounts = await this.prisma.chartOfAccount.findMany({
      where: { tenantId, isActive: true },
      orderBy: { code: 'asc' },
    });

    const revenue = accounts.filter((a) => a.type === 'REVENUE');
    const expenses = accounts.filter((a) => a.type === 'EXPENSE');

    const totalRevenue = revenue.reduce((sum, a) => sum + a.balance, 0);
    const totalExpenses = expenses.reduce((sum, a) => sum + a.balance, 0);
    const netProfit = totalRevenue - totalExpenses;

    return {
      period: 'Year-to-Date',
      asOf: new Date().toISOString(),
      revenue: {
        total: Number(totalRevenue.toFixed(2)),
        items: revenue.map((r) => ({ code: r.code, name: r.name, amount: Number(r.balance.toFixed(2)) })),
      },
      expenses: {
        total: Number(totalExpenses.toFixed(2)),
        items: expenses.map((e) => ({ code: e.code, name: e.name, amount: Number(e.balance.toFixed(2)) })),
      },
      netProfit: Number(netProfit.toFixed(2)),
    };
  }

  /**
   * Financial Periods Management
   */
  async getPeriods(tenantId: string) {
    return this.prisma.financialPeriod.findMany({
      where: { tenantId },
      orderBy: { startDate: 'desc' },
    });
  }

  async closePeriod(tenantId: string, periodId: string, closedBy = 'SYSTEM') {
    const period = await this.prisma.financialPeriod.findFirst({ where: { id: periodId, tenantId } });
    if (!period) throw new NotFoundException('Period not found');

    return this.prisma.financialPeriod.update({
      where: { id: period.id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closedBy,
      },
    });
  }
}
