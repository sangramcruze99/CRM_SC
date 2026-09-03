import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  private static inMemoryInvoices: any[] = [];

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
    return InvoicesService.inMemoryInvoices.filter(i => i.tenantId === tenantId || i.tenantId === 'default-tenant');
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
    return InvoicesService.inMemoryInvoices.find(i => i.id === id) || null;
  }

  async create(tenantId: string, data: { amount: number, status?: string, dueDate?: Date, lineItems?: any[] }) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.invoice.create({
          data: {
            tenantId,
            invoiceNum: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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

    const newInv = {
      id: `inv_${Date.now()}`,
      tenantId,
      invoiceNum: `INV-${Date.now()}`,
      amount: data.amount,
      status: data.status || 'DRAFT',
      dueDate: data.dueDate || new Date(Date.now() + 30 * 86400000),
      createdAt: new Date(),
      lineItems: data.lineItems || []
    };
    InvoicesService.inMemoryInvoices.unshift(newInv);
    return newInv;
  }

  async update(id: string, tenantId: string, data: any) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.invoice.update({
          where: { id },
          data,
          include: { lineItems: true }
        });
      } catch {
        // fallback
      }
    }

    const idx = InvoicesService.inMemoryInvoices.findIndex(i => i.id === id);
    if (idx !== -1) {
      InvoicesService.inMemoryInvoices[idx] = { ...InvoicesService.inMemoryInvoices[idx], ...data };
      return InvoicesService.inMemoryInvoices[idx];
    }
    return null;
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

    InvoicesService.inMemoryInvoices = InvoicesService.inMemoryInvoices.filter(i => i.id !== id);
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
