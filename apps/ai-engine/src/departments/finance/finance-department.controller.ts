import { Controller, Get, Post, Body, Headers, Query } from '@nestjs/common';
import { FinanceDepartmentService } from './finance-department.service';

@Controller('departments/finance')
export class FinanceDepartmentController {
  constructor(private readonly financeService: FinanceDepartmentService) {}

  @Get('overview')
  async getOverview(@Headers('x-tenant-id') tenantIdHeader: string) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.financeService.getDepartmentOverview(tenantId);
  }

  @Get('kpis')
  async getKPIs(@Headers('x-tenant-id') tenantIdHeader: string) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.financeService.getDepartmentKPIs(tenantId);
  }

  @Get('aging/audit')
  async getAgingAudit(@Headers('x-tenant-id') tenantIdHeader: string) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.financeService.getAgingAudit(tenantId);
  }

  @Post('dunning/recommend')
  async recommendDunning(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: { invoiceId?: string },
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.financeService.recommendDunningAction(tenantId, body?.invoiceId);
  }

  @Post('dunning/execute')
  async executeDunning(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body()
    body: {
      invoiceId?: string;
      channel?: string;
      customSubject?: string;
      customBody?: string;
      appliedDiscountPercent?: number;
      recipientEmail?: string;
    },
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.financeService.executeDunningAction(tenantId, body || {});
  }

  @Get('anomalies/audit')
  async auditAnomalies(@Headers('x-tenant-id') tenantIdHeader: string) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.financeService.auditDualKhataAnomalies(tenantId);
  }

  @Post('anomalies/resolve')
  async resolveAnomaly(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body()
    body: {
      anomalyId: string;
      resolutionAction: 'WRITE_OFF' | 'MARK_RECONCILED' | 'POST_ADJUSTMENT';
      notes?: string;
    },
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.financeService.resolveAnomaly(tenantId, body);
  }

  @Get('cashflow/forecast')
  async getCashflowForecast(@Headers('x-tenant-id') tenantIdHeader: string) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.financeService.getCashflowForecast(tenantId);
  }

  @Post('disputes/analyze')
  async analyzeDispute(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: { invoiceId?: string; disputeText?: string },
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.financeService.analyzeDispute(tenantId, body?.invoiceId, body?.disputeText);
  }
}
