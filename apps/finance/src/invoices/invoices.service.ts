import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountingService } from '../accounting/accounting.service';
import { OutboxService } from '../outbox/outbox.service';
import { publishInvoiceOverdue } from '@repo/core-types';

export interface CreateInvoiceDto {
  amount?: number;
  currency?: string;
  status?: string;
  clientName?: string;
  customerName?: string;
  customerEmail?: string;
  customerId?: string;
  billingAddress?: string;
  shippingAddress?: string;
  dueDate?: Date | string;
  issueDate?: Date | string;
  paymentTerms?: string;
  notes?: string;
  documentId?: string; // Central Document Vault reference
  lineItems?: Array<{
    description: string;
    quantity?: number;
    unitPrice?: number;
    discount?: number;
    tax?: number;
    total?: number;
  }>;
}

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly accountingService: AccountingService,
    private readonly outboxService: OutboxService
  ) {}

  /**
   * Derives operational AR status based on payments and due date
   */
  private deriveInvoiceStatus(invoice: any): string {
    const total = Number(invoice.amount || 0);
    const paid = Number(invoice.paidAmount || 0);
    const balanceDue = Number((total - paid).toFixed(2));

    if (['VOID', 'CANCELLED', 'DISPUTED', 'WRITTEN_OFF'].includes(invoice.status)) {
      return invoice.status;
    }

    if (balanceDue <= 0.005 && paid > 0) {
      return invoice.reconciledAt ? 'RECONCILED' : 'PAID';
    }

    if (paid > 0 && balanceDue > 0.005) {
      return 'PARTIALLY_PAID';
    }

    if (['OPEN', 'SENT', 'FINALIZED'].includes(invoice.status)) {
      const now = new Date();
      const due = new Date(invoice.dueDate);
      if (due < now && balanceDue > 0.005) {
        return 'OVERDUE';
      }
      return invoice.status;
    }

    return invoice.status || 'DRAFT';
  }

  async findAll(tenantId: string) {
    const records = await this.prisma.invoice.findMany({
      where: { tenantId },
      include: {
        lineItems: true,
        allocations: { include: { payment: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((inv) => ({
      ...inv,
      derivedStatus: this.deriveInvoiceStatus(inv),
    }));
  }

  async findOne(id: string, tenantId: string) {
    const record = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: {
        lineItems: true,
        allocations: { include: { payment: true } },
      },
    });

    if (!record) return null;

    return {
      ...record,
      derivedStatus: this.deriveInvoiceStatus(record),
    };
  }

  async create(tenantId: string, data: CreateInvoiceDto) {
    const count = await this.prisma.invoice.count({ where: { tenantId } });
    const invoiceNum = `INV-${String(count + 1).padStart(5, '0')}`;

    let subtotal = 0;
    const computedItems = (data.lineItems || []).map((item) => {
      const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
      const unitPrice = Number(item.unitPrice || 0);
      const total = Number((qty * unitPrice).toFixed(2));
      subtotal += total;
      return {
        description: item.description,
        quantity: qty,
        unitPrice,
        discount: Number(item.discount || 0),
        tax: Number(item.tax || 0),
        total,
      };
    });

    const finalAmount = data.amount && data.amount > 0 ? Number(data.amount.toFixed(2)) : Number(subtotal.toFixed(2));
    const customerName = data.customerName || data.clientName || 'Direct Customer';
    const dueDate = data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 30 * 86400000);
    const issueDate = data.issueDate ? new Date(data.issueDate) : new Date();

    const metadataObj = {
      documentId: data.documentId || null,
      notes: data.notes || null,
    };

    const created = await this.prisma.invoice.create({
      data: {
        tenantId,
        invoiceNum,
        customerId: data.customerId || null,
        customerName,
        customerEmail: data.customerEmail || null,
        billingAddress: data.billingAddress || null,
        shippingAddress: data.shippingAddress || null,
        currency: data.currency || 'USD',
        subtotal,
        amount: finalAmount,
        paidAmount: 0,
        balanceDue: finalAmount,
        status: data.status || 'OPEN',
        issueDate,
        dueDate,
        paymentTerms: data.paymentTerms || 'Net 30',
        metadata: JSON.stringify(metadataObj),
        lineItems: {
          create: computedItems,
        },
      },
      include: { lineItems: true },
    });

    // Automatically post double-entry GL journal entry:
    // Debit Accounts Receivable (1200), Credit Commercial Sales Revenue (4000)
    const arAccount = await this.accountingService.getAccountByCode(tenantId, '1200');
    const revAccount = await this.accountingService.getAccountByCode(tenantId, '4000');

    if (arAccount && revAccount && finalAmount > 0) {
      await this.accountingService.createJournalEntry(tenantId, {
        memo: `AR Invoicing: ${created.invoiceNum} for ${customerName}`,
        sourceType: 'INVOICE',
        sourceId: created.id,
        lines: [
          {
            accountId: arAccount.id,
            debit: finalAmount,
            credit: 0,
            description: `Receivable from ${customerName}`,
          },
          {
            accountId: revAccount.id,
            debit: 0,
            credit: finalAmount,
            description: `Revenue for ${created.invoiceNum}`,
          },
        ],
      });
    }

    // Publish reliable outbox event
    await this.outboxService.publishEvent(tenantId, 'invoice.created', 'Invoice', created.id, {
      invoiceNum: created.invoiceNum,
      customerName,
      amount: created.amount,
      currency: created.currency,
      dueDate: created.dueDate,
    });

    this.logger.log(`[AR] Created Invoice ${created.invoiceNum} for ${customerName} ($${created.amount})`);
    return {
      ...created,
      derivedStatus: this.deriveInvoiceStatus(created),
    };
  }

  async update(id: string, tenantId: string, data: any) {
    const existing = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException('Invoice not found');

    const updated = await this.prisma.invoice.update({
      where: { id: existing.id },
      data,
      include: { lineItems: true },
    });

    const derived = this.deriveInvoiceStatus(updated);
    if (derived === 'OVERDUE' || data.status === 'OVERDUE') {
      publishInvoiceOverdue(tenantId, {
        id: updated.id,
        invoiceNum: updated.invoiceNum,
        amount: Number(updated.amount || 0),
        dueDate: updated.dueDate || new Date(),
      }).catch((e) => this.logger.warn(`Failed to publish INVOICE_OVERDUE: ${e.message}`));
    }

    return {
      ...updated,
      derivedStatus: derived,
    };
  }

  async delete(id: string, tenantId: string) {
    const inv = await this.prisma.invoice.findFirst({ where: { id, tenantId } });
    if (!inv) throw new NotFoundException('Invoice not found');

    // If payments are allocated or journal posted, mark VOID instead of hard delete
    if (inv.paidAmount > 0) {
      throw new BadRequestException('Cannot delete an invoice with recorded payments. Void or credit instead.');
    }

    return this.prisma.invoice.delete({
      where: { id: inv.id },
    });
  }

  async send(id: string, tenantId: string) {
    const updated = await this.update(id, tenantId, { status: 'SENT' });
    await this.outboxService.publishEvent(tenantId, 'invoice.sent', 'Invoice', id, {
      invoiceNum: updated.invoiceNum,
      sentAt: new Date(),
    });
    return updated;
  }

  async generatePdf(id: string, tenantId: string): Promise<Buffer> {
    const invoice = await this.findOne(id, tenantId);
    if (!invoice) throw new NotFoundException('Invoice not found');

    const PDFDocument = require('pdfkit');
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      doc.fontSize(25).text(`Invoice ${invoice.invoiceNum}`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Customer: ${invoice.customerName || 'N/A'}`);
      doc.text(`Status: ${invoice.derivedStatus || invoice.status}`);
      doc.text(`Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toDateString() : ''}`);
      doc.text(`Total Amount: $${Number(invoice.amount).toFixed(2)}`);
      doc.text(`Balance Due: $${Number(invoice.balanceDue).toFixed(2)}`);

      if (invoice.lineItems && invoice.lineItems.length > 0) {
        doc.moveDown();
        doc.fontSize(16).text('Line Items:', { underline: true });
        invoice.lineItems.forEach((item: any) => {
          doc.fontSize(12).text(
            `${item.description} - ${item.quantity} x $${Number(item.unitPrice).toFixed(2)} = $${Number(item.total).toFixed(2)}`
          );
        });
      }

      doc.end();
    });
  }
}
