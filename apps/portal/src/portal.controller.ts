import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { Public } from '@repo/auth';
import { PortalService } from './portal.service';

@Controller('portal')
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  private extractTenantId(req?: Request, headersTenantId?: string): string {
    const user = (req as any)?.user;
    if (user?.tenantId) {
      if (user.role === 'SUPERADMIN' && headersTenantId) {
        return headersTenantId;
      }
      return user.tenantId;
    }
    return headersTenantId || 'default-tenant';
  }

  @Public()
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
    @Req() req: Request,
    @Headers('x-tenant-id') rawTenantId?: string,
    @Query('clientEmail') clientEmail?: string,
  ) {
    const tenantId = this.extractTenantId(req, rawTenantId);
    const data = await this.portalService.getClientInvoices(tenantId, clientEmail);
    return { data, count: data.length };
  }

  @Post('pay')
  async payInvoice(
    @Req() req: Request,
    @Body('invoiceId') invoiceId: string,
    @Headers('x-tenant-id') rawTenantId?: string,
  ) {
    const tenantId = this.extractTenantId(req, rawTenantId);
    return this.portalService.initiatePayment(tenantId, invoiceId);
  }

  @Get('documents')
  async getDocuments(
    @Req() req: Request,
    @Headers('x-tenant-id') rawTenantId?: string,
    @Query('clientEmail') clientEmail?: string,
  ) {
    const tenantId = this.extractTenantId(req, rawTenantId);
    const data = await this.portalService.getClientDocuments(tenantId, clientEmail);
    return { data, count: data.length };
  }

  @Post('documents/:id/sign')
  async signDocument(
    @Req() req: Request,
    @Param('id') documentId: string,
    @Body('clientEmail') clientEmail: string,
    @Body('signatureDigest') signatureDigest: string,
    @Headers('x-tenant-id') rawTenantId?: string,
  ) {
    const tenantId = this.extractTenantId(req, rawTenantId);
    return this.portalService.signDocument(tenantId, documentId, clientEmail, signatureDigest);
  }

  @Get('tickets')
  async getTickets(
    @Req() req: Request,
    @Headers('x-tenant-id') rawTenantId?: string,
    @Query('clientEmail') clientEmail?: string,
  ) {
    const tenantId = this.extractTenantId(req, rawTenantId);
    const data = await this.portalService.getClientTickets(tenantId, clientEmail);
    return { data, count: data.length };
  }

  @Post('tickets')
  async createTicket(
    @Req() req: Request,
    @Body() dto: { subject: string; description: string; clientEmail: string },
    @Headers('x-tenant-id') rawTenantId?: string,
  ) {
    const tenantId = this.extractTenantId(req, rawTenantId);
    const data = await this.portalService.createClientTicket(tenantId, dto);
    return { success: true, data };
  }
}
