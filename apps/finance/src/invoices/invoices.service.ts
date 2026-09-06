import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { publishInvoiceOverdue } from '@repo/core-types';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);
  private static inMemoryInvoices: any[] = [];

  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    if (this.prisma.isConnected) {
      try {
        const records = await this.prisma.invoice.findMany({
          where: { tenantId },
          include: { lineItems: true },
          orderBy: { createdAt: 'desc' }
        });
        if (records && records.length > 0) return records;
      } catch {
        // fallback
      }
    }
    return InvoicesService.inMemoryInvoices.filter(i => i.tenantId === tenantId);
  }

  async findOne(id: string, tenantId: string) {
    if (this.prisma.isConnected) {
      try {
        const record = await this.prisma.invoice.findFirst({
          where: { id, tenantId },
          include: { lineItems: true }
        });
        if (record) return record;
      } catch {
        // fallback
      }
    }
    return InvoicesService.inMemoryInvoices.find(i => i.id === id && i.tenantId === tenantId) || null;
  }

  async create(tenantId: string, data: { amount: number, status?: string, dueDate?: Date, lineItems?: any[] }) {
    let created: any = null;
    if (this.prisma.isConnected) {
      try {
        created = await this.prisma.invoice.create({
          data: {
            tenantId,
            invoiceNum: `INV-${Date.now().toString().slice(-4)}`,
            amount: data.amount,
            status: data.status || 'DRAFT',
            dueDate: data.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            lineItems: {
              create: data.lineItems || []
            }
          },
          include: { lineItems: true }
        });
      } catch {
        // fallback
      }
    }

    if (!created) {
      created = {
        id: `inv_${Date.now()}`,
        tenantId,
        invoiceNum: `INV-${Date.now()}`,
        amount: data.amount,
        status: data.status || 'DRAFT',
        dueDate: data.dueDate || new Date(Date.now() + 30 * 86400000),
        createdAt: new Date(),
        lineItems: data.lineItems || []
      };
      InvoicesService.inMemoryInvoices.unshift(created);
    }

    return created;
  }

  async update(id: string, tenantId: string, data: any) {
    let updated: any = null;
    if (this.prisma.isConnected) {
      try {
        const existing = await this.prisma.invoice.findFirst({
          where: { id, tenantId }
        });
        if (!existing) return null;

        updated = await this.prisma.invoice.update({
          where: { id },
          data,
          include: { lineItems: true }
        });
      } catch {
        // fallback
      }
    }

    if (!updated) {
      const idx = InvoicesService.inMemoryInvoices.findIndex(i => i.id === id && i.tenantId === tenantId);
      if (idx !== -1) {
        InvoicesService.inMemoryInvoices[idx] = { ...InvoicesService.inMemoryInvoices[idx], ...data };
        updated = InvoicesService.inMemoryInvoices[idx];
      }
    }

    if (updated && (data.status === 'OVERDUE' || updated.status === 'OVERDUE')) {
      publishInvoiceOverdue(tenantId, {
        id: updated.id,
        invoiceNum: updated.invoiceNum || `INV-${updated.id}`,
        amount: Number(updated.amount || 0),
        dueDate: updated.dueDate || new Date(),
      }).catch((e) => this.logger.warn(`Failed to publish INVOICE_OVERDUE: ${e.message}`));
    }

    return updated;
  }


  async delete(id: string, tenantId: string) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.invoice.deleteMany({
          where: { id, tenantId }
        });
      } catch {
        // fallback
      }
    }

    InvoicesService.inMemoryInvoices = InvoicesService.inMemoryInvoices.filter(i => !(i.id === id && i.tenantId === tenantId));
    return { count: 1 };
  }

  async send(id: string, tenantId: string) {
    return this.update(id, tenantId, { status: 'SENT' });
  }

  async generatePdf(id: string, tenantId: string): Promise<Buffer> {
    const invoice = await this.findOne(id, tenantId);
    if (!invoice) throw new Error('Invoice not found');

    const PDFDocument = require('pdfkit');
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      
      doc.fontSize(25).text(`Invoice ${invoice.invoiceNum}`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Status: ${invoice.status}`);
      doc.text(`Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toDateString() : ''}`);
      doc.text(`Total Amount: $${Number(invoice.amount).toFixed(2)}`);
      
      if (invoice.lineItems && invoice.lineItems.length > 0) {
        doc.moveDown();
        doc.fontSize(16).text('Line Items:', { underline: true });
        invoice.lineItems.forEach((item: any) => {
          doc.fontSize(12).text(`${item.description} - ${item.quantity} x $${Number(item.unitPrice).toFixed(2)} = $${Number(item.total).toFixed(2)}`);
        });
      }
      
      doc.end();
    });
  }
}
