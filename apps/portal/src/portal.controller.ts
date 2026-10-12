import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
} from '@nestjs/common';
import { PortalService } from './portal.service';

@Controller('portal')
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'portal',
      port: 3029,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('invoices')
  async getInvoices(
    @Headers('x-tenant-id') tenantId = 'default-tenant',
    @Query('clientEmail') clientEmail?: string,
  ) {
    const data = await this.portalService.getClientInvoices(tenantId, clientEmail);
    return { data, count: data.length };
  }

  @Post('pay')
  async payInvoice(
    @Headers('x-tenant-id') tenantId = 'default-tenant',
    @Body('invoiceId') invoiceId: string,
  ) {
    return this.portalService.initiatePayment(tenantId, invoiceId);
  }

  @Get('documents')
  async getDocuments(
    @Headers('x-tenant-id') tenantId = 'default-tenant',
    @Query('clientEmail') clientEmail?: string,
  ) {
    const data = await this.portalService.getClientDocuments(tenantId, clientEmail);
    return { data, count: data.length };
  }

  @Post('documents/:id/sign')
  async signDocument(
    @Headers('x-tenant-id') tenantId = 'default-tenant',
    @Param('id') documentId: string,
    @Body('clientEmail') clientEmail: string,
    @Body('signatureDigest') signatureDigest: string,
  ) {
    return this.portalService.signDocument(tenantId, documentId, clientEmail, signatureDigest);
  }

  @Get('tickets')
  async getTickets(
    @Headers('x-tenant-id') tenantId = 'default-tenant',
    @Query('clientEmail') clientEmail?: string,
  ) {
    const data = await this.portalService.getClientTickets(tenantId, clientEmail);
    return { data, count: data.length };
  }

  @Post('tickets')
  async createTicket(
    @Headers('x-tenant-id') tenantId = 'default-tenant',
    @Body() dto: { subject: string; description: string; clientEmail: string },
  ) {
    const data = await this.portalService.createClientTicket(tenantId, dto);
    return { success: true, data };
  }
}
