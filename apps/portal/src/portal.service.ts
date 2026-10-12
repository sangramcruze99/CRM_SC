import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class PortalService {
  private readonly logger = new Logger(PortalService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getClientInvoices(tenantId: string, clientEmail?: string) {
    const where: any = { tenantId };
    return this.prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async getClientDocuments(tenantId: string, clientEmail?: string) {
    return this.prisma.document.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async getClientTickets(tenantId: string, clientEmail?: string) {
    return this.prisma.ticket.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async createClientTicket(tenantId: string, dto: { subject: string; description: string; clientEmail: string }) {
    return this.prisma.ticket.create({
      data: {
        tenantId,
        title: dto.subject,
        description: dto.description,
        status: 'OPEN',
        priority: 'MEDIUM',
      },
    });
  }

  async signDocument(tenantId: string, documentId: string, clientEmail: string, signatureDigest: string) {
    return this.prisma.eSignature.create({
      data: {
        tenantId,
        documentId,
        status: 'SIGNED',
      },
    });
  }

  async initiatePayment(tenantId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
    });
    if (!invoice) {
      throw new Error(`Invoice ${invoiceId} not found`);
    }

    return {
      success: true,
      invoiceId,
      amount: invoice.amount,
      checkoutUrl: `/invoices?pay=${invoiceId}`,
      status: 'AWAITING_PAYMENT',
    };
  }
}
