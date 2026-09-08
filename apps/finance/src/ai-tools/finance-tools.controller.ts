import { Controller, Get, Post, Param, Headers } from '@nestjs/common';
import { FinanceToolsService } from './finance-tools.service';

@Controller('ai-tools')
export class FinanceToolsController {
  constructor(private readonly toolsService: FinanceToolsService) {}

  @Get('ar-summary')
  async getArSummary(@Headers('x-tenant-id') tenantId: string) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.toolsService.getArSummary(effectiveTenantId);
  }

  @Get('ap-summary')
  async getApSummary(@Headers('x-tenant-id') tenantId: string) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.toolsService.getApSummary(effectiveTenantId);
  }

  @Get('overdue-invoices')
  async getOverdueInvoices(@Headers('x-tenant-id') tenantId: string) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.toolsService.getOverdueInvoices(effectiveTenantId);
  }

  @Get('cash-forecast')
  async getCashForecast(@Headers('x-tenant-id') tenantId: string) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.toolsService.getCashForecast(effectiveTenantId);
  }

  @Get('anomalies')
  async getAnomalies(@Headers('x-tenant-id') tenantId: string) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.toolsService.detectAnomalies(effectiveTenantId);
  }

  @Post('prepare-collection/:invoiceId')
  async prepareCollection(
    @Headers('x-tenant-id') tenantId: string,
    @Param('invoiceId') invoiceId: string
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.toolsService.prepareCollectionFollowup(effectiveTenantId, invoiceId);
  }
}
