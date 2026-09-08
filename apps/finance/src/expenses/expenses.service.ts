import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountingService } from '../accounting/accounting.service';

export interface CreateExpenseDto {
  category: 'TRAVEL' | 'SOFTWARE' | 'OFFICE' | 'MARKETING' | 'EQUIPMENT' | 'OTHER';
  employeeId?: string;
  vendorName?: string;
  amount: number;
  tax?: number;
  currency?: string;
  receiptDocumentId?: string; // Central Document Vault reference
  date?: Date | string;
  notes?: string;
}

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly accountingService: AccountingService
  ) {}

  async create(tenantId: string, dto: CreateExpenseDto) {
    if (!dto.amount || dto.amount <= 0) {
      throw new BadRequestException('Expense amount must be greater than zero');
    }

    const count = await this.prisma.expense.count({ where: { tenantId } });
    const expenseNumber = `EXP-${String(count + 1).padStart(5, '0')}`;

    const expense = await this.prisma.expense.create({
      data: {
        tenantId,
        expenseNumber,
        category: dto.category || 'OFFICE',
        employeeId: dto.employeeId || null,
        vendorName: dto.vendorName || null,
        amount: Number(dto.amount.toFixed(2)),
        tax: Number((dto.tax || 0).toFixed(2)),
        currency: dto.currency || 'USD',
        status: 'PENDING_APPROVAL',
        receiptDocumentId: dto.receiptDocumentId || null,
        date: dto.date ? new Date(dto.date) : new Date(),
        notes: dto.notes || null,
      },
    });

    this.logger.log(`[Expenses] Created expense ${expense.expenseNumber} for $${expense.amount}`);
    return expense;
  }

  async findAll(tenantId: string) {
    return this.prisma.expense.findMany({
      where: { tenantId },
      orderBy: { date: 'desc' },
    });
  }

  async approve(tenantId: string, id: string, approverId = 'FINANCE_MANAGER') {
    const expense = await this.prisma.expense.findFirst({ where: { id, tenantId } });
    if (!expense) throw new NotFoundException('Expense not found');

    // Post double-entry journal entry: Debit Expense (5100 / 5300), Credit AP (2000)
    const expenseAccountCode = expense.category === 'SOFTWARE' ? '5300' : '5100';
    const expAccount = await this.accountingService.getAccountByCode(tenantId, expenseAccountCode);
    const apAccount = await this.accountingService.getAccountByCode(tenantId, '2000');

    if (expAccount && apAccount) {
      await this.accountingService.createJournalEntry(tenantId, {
        memo: `Expense Approval: ${expense.expenseNumber} (${expense.category})`,
        sourceType: 'BILL',
        sourceId: expense.id,
        lines: [
          {
            accountId: expAccount.id,
            debit: expense.amount,
            credit: 0,
            description: `${expense.category} expense: ${expense.vendorName || 'General'}`,
          },
          {
            accountId: apAccount.id,
            debit: 0,
            credit: expense.amount,
            description: `Payable obligation for ${expense.expenseNumber}`,
          },
        ],
      });
    }

    const updated = await this.prisma.expense.update({
      where: { id: expense.id },
      data: {
        status: 'APPROVED',
        approvedBy: approverId,
        approvedAt: new Date(),
      },
    });

    return updated;
  }
}
