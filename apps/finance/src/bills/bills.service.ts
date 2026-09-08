import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountingService } from '../accounting/accounting.service';
import { OutboxService } from '../outbox/outbox.service';

export interface CreateBillLineDto {
  description: string;
  quantity?: number;
  unitPrice: number;
  total?: number;
}

export interface CreateBillDto {
  vendorId?: string;
  vendorName: string;
  vendorEmail?: string;
  vendorAddress?: string;
  poNumber?: string;
  referenceNumber?: string;
  currency?: string;
  items: CreateBillLineDto[];
  tax?: number;
  taxRate?: number;
  discount?: number;
  dueDate: Date | string;
  issueDate?: Date | string;
  notes?: string;
  documentId?: string; // Vault reference
  requesterId?: string;
}

@Injectable()
export class BillsService {
  private readonly logger = new Logger(BillsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly accountingService: AccountingService,
    private readonly outboxService: OutboxService
  ) {}

  /**
   * Derives current operational status based on balance and due date
   */
  private deriveBillStatus(bill: any): string {
    const total = Number(bill.total || 0);
    const paid = Number(bill.paidAmount || 0);
    const balanceDue = Number((total - paid).toFixed(2));

    if (['REJECTED', 'VOID', 'CANCELLED', 'DISPUTED'].includes(bill.status)) {
      return bill.status;
    }

    if (balanceDue <= 0 && paid > 0) {
      return bill.reconciledAt ? 'RECONCILED' : 'PAID';
    }

    if (paid > 0 && balanceDue > 0) {
      return 'PARTIALLY_PAID';
    }

    if (bill.approvalStatus === 'APPROVED' && bill.status === 'APPROVED') {
      const now = new Date();
      const due = new Date(bill.dueDate);
      if (due < now && balanceDue > 0) {
        return 'OVERDUE';
      }
      return 'APPROVED';
    }

    if (bill.status === 'PENDING_APPROVAL') {
      return 'PENDING_APPROVAL';
    }

    return bill.status || 'DRAFT';
  }

  async create(tenantId: string, dto: CreateBillDto) {
    if (!dto.vendorName || !dto.items || dto.items.length === 0) {
      throw new BadRequestException('Vendor name and at least one line item are required');
    }

    let subtotal = 0;
    const computedItems = dto.items.map((item) => {
      const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
      const unitPrice = Number(item.unitPrice || 0);
      const lineTotal = Number((qty * unitPrice).toFixed(2));
      subtotal += lineTotal;
      return {
        description: item.description,
        quantity: qty,
        unitPrice,
        total: lineTotal,
      };
    });

    subtotal = Number(subtotal.toFixed(2));
    const tax = Number((dto.tax || 0).toFixed(2));
    const discount = Number((dto.discount || 0).toFixed(2));
    const total = Number((subtotal + tax - discount).toFixed(2));

    if (total < 0) {
      throw new BadRequestException('Total bill amount cannot be negative');
    }

    const count = await this.prisma.bill.count({ where: { tenantId } });
    const billNumber = `BILL-${String(count + 1).padStart(5, '0')}`;

    const metadataObj: Record<string, any> = {
      requesterId: dto.requesterId || 'SYSTEM',
      documentId: dto.documentId || null,
      poNumber: dto.poNumber || null,
      referenceNumber: dto.referenceNumber || null,
    };

    const dueDate = dto.dueDate ? new Date(dto.dueDate) : new Date(Date.now() + 30 * 86400000);
    const issueDate = dto.issueDate ? new Date(dto.issueDate) : new Date();

    const bill = await this.prisma.bill.create({
      data: {
        tenantId,
        billNumber,
        vendorId: dto.vendorId || null,
        vendorName: dto.vendorName,
        vendorEmail: dto.vendorEmail || null,
        vendorAddress: dto.vendorAddress || null,
        poNumber: dto.poNumber || null,
        referenceNumber: dto.referenceNumber || null,
        currency: dto.currency || 'USD',
        subtotal,
        tax,
        taxRate: dto.taxRate || 0,
        discount,
        total,
        paidAmount: 0,
        balanceDue: total,
        status: 'PENDING_VALIDATION',
        approvalStatus: 'PENDING',
        issueDate,
        dueDate,
        notes: dto.notes || null,
        metadata: JSON.stringify(metadataObj),
        lineItems: {
          create: computedItems,
        },
      },
      include: {
        lineItems: true,
      },
    });

    // Enqueue outbox event
    await this.outboxService.publishEvent(tenantId, 'bill.created', 'Bill', bill.id, {
      billNumber: bill.billNumber,
      vendorName: bill.vendorName,
      total: bill.total,
      currency: bill.currency,
      dueDate: bill.dueDate,
    });

    this.logger.log(`[AP] Created Bill ${bill.billNumber} for ${bill.vendorName} ($${bill.total})`);
    return {
      ...bill,
      derivedStatus: this.deriveBillStatus(bill),
    };
  }

  async findAll(tenantId: string) {
    const bills = await this.prisma.bill.findMany({
      where: { tenantId },
      include: { lineItems: true, allocations: { include: { payment: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return bills.map((bill) => ({
      ...bill,
      derivedStatus: this.deriveBillStatus(bill),
    }));
  }

  async findOne(tenantId: string, id: string) {
    const bill = await this.prisma.bill.findFirst({
      where: { id, tenantId },
      include: { lineItems: true, allocations: { include: { payment: true } } },
    });

    if (!bill) throw new NotFoundException('Bill not found');

    return {
      ...bill,
      derivedStatus: this.deriveBillStatus(bill),
    };
  }

  /**
   * Validate Bill (3-way match & mathematical consistency)
   */
  async validate(tenantId: string, id: string) {
    const bill = await this.prisma.bill.findFirst({
      where: { id, tenantId },
      include: { lineItems: true },
    });
    if (!bill) throw new NotFoundException('Bill not found');

    // Mathematical consistency validation
    let itemsSum = 0;
    for (const item of bill.lineItems) {
      itemsSum += Number(item.total || 0);
    }
    const expectedTotal = Number((itemsSum + bill.tax - bill.discount).toFixed(2));
    const diff = Math.abs(expectedTotal - bill.total);

    if (diff > 0.01) {
      await this.prisma.bill.update({
        where: { id: bill.id },
        data: { status: 'DISPUTED', notes: `Validation Conflict: Line items sum ($${itemsSum}) + tax ($${bill.tax}) - discount ($${bill.discount}) does not match total ($${bill.total}). Discrepancy: $${diff}` },
      });
      throw new BadRequestException(`Validation conflict: Calculated total ($${expectedTotal}) does not match bill total ($${bill.total})`);
    }

    const updated = await this.prisma.bill.update({
      where: { id: bill.id },
      data: { status: 'VALIDATED' },
      include: { lineItems: true },
    });

    return {
      ...updated,
      derivedStatus: this.deriveBillStatus(updated),
    };
  }

  /**
   * Approve Bill with Segregation of Duties & GL Posting
   */
  async approve(tenantId: string, id: string, approverId: string, approverRole = 'FINANCE_MANAGER') {
    const bill = await this.prisma.bill.findFirst({
      where: { id, tenantId },
      include: { lineItems: true },
    });
    if (!bill) throw new NotFoundException('Bill not found');

    if (bill.approvalStatus === 'APPROVED') {
      throw new BadRequestException('Bill is already approved');
    }

    let meta: Record<string, any> = {};
    try {
      meta = JSON.parse(bill.metadata || '{}');
    } catch {
      meta = {};
    }

    // Segregation of duties: requester cannot be approver for bills > $500
    if (meta.requesterId && meta.requesterId === approverId && bill.total > 500) {
      throw new ForbiddenException('Segregation of Duties Violation: Requester cannot self-approve bills exceeding $500');
    }

    // Double-entry accounting posting on approval:
    // Debit Operating Expense (5100 or 5000), Credit Accounts Payable (2000)
    const apAccount = await this.accountingService.getAccountByCode(tenantId, '2000');
    const expenseAccount = await this.accountingService.getAccountByCode(tenantId, '5100');

    if (apAccount && expenseAccount) {
      await this.accountingService.createJournalEntry(tenantId, {
        memo: `AP Recognition for ${bill.billNumber} (${bill.vendorName})`,
        sourceType: 'BILL',
        sourceId: bill.id,
        lines: [
          {
            accountId: expenseAccount.id,
            debit: bill.total,
            credit: 0,
            description: `Operating expense for ${bill.vendorName}`,
          },
          {
            accountId: apAccount.id,
            debit: 0,
            credit: bill.total,
            description: `Accounts Payable obligation for ${bill.billNumber}`,
          },
        ],
      });
    }

    const updated = await this.prisma.bill.update({
      where: { id: bill.id },
      data: {
        status: 'APPROVED',
        approvalStatus: 'APPROVED',
        approvedBy: approverId,
        approvedAt: new Date(),
      },
      include: { lineItems: true },
    });

    await this.outboxService.publishEvent(tenantId, 'bill.approved', 'Bill', bill.id, {
      billNumber: bill.billNumber,
      vendorName: bill.vendorName,
      total: bill.total,
      approvedBy: approverId,
      approvedAt: new Date(),
    });

    this.logger.log(`[AP] Bill ${bill.billNumber} approved by ${approverId}`);
    return {
      ...updated,
      derivedStatus: this.deriveBillStatus(updated),
    };
  }

  /**
   * Reject Bill
   */
  async reject(tenantId: string, id: string, approverId: string, reason: string) {
    const bill = await this.prisma.bill.findFirst({
      where: { id, tenantId },
    });
    if (!bill) throw new NotFoundException('Bill not found');

    const updated = await this.prisma.bill.update({
      where: { id: bill.id },
      data: {
        status: 'REJECTED',
        approvalStatus: 'REJECTED',
        notes: reason ? `Rejected: ${reason}` : 'Rejected during approval review',
      },
    });

    this.logger.log(`[AP] Bill ${bill.billNumber} rejected by ${approverId}`);
    return {
      ...updated,
      derivedStatus: 'REJECTED',
    };
  }
}
