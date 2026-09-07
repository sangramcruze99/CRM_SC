import { Controller, Get, Post, Body, Headers, Query } from '@nestjs/common';
import { CustomerSuccessService } from './customer-success.service';

@Controller('departments/cs')
export class CustomerSuccessController {
  constructor(private readonly csService: CustomerSuccessService) {}

  @Get('overview')
  async getOverview(@Headers('x-tenant-id') tenantIdHeader: string) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.csService.getDepartmentOverview(tenantId);
  }

  @Get('kpis')
  async getKPIs(@Headers('x-tenant-id') tenantIdHeader: string) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.csService.getDepartmentKPIs(tenantId);
  }

  @Get('accounts/scan')
  async scanAccounts(@Headers('x-tenant-id') tenantIdHeader: string) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.csService.scanAccountsForProactiveIntervention(tenantId);
  }

  @Post('health/evaluate')
  async evaluateHealth(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: { accountId?: string },
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.csService.evaluateCustomerHealth(tenantId, body.accountId);
  }

  @Post('churn/detect')
  async detectChurn(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: { accountId?: string },
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.csService.detectChurnRisk(tenantId, body.accountId);
  }

  @Post('interventions/recommend')
  async recommendIntervention(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: { accountId?: string },
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.csService.recommendIntervention(tenantId, body.accountId);
  }

  @Post('interventions/execute')
  async executeIntervention(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body()
    body: {
      accountId?: string;
      csmTaskTitle?: string;
      recipientEmail?: string;
      customEmailSubject?: string;
      customEmailBody?: string;
      proposedServiceCreditPercent?: number;
      dispatchImmediately?: boolean;
    },
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.csService.executeInterventionWorkflow(tenantId, body);
  }

  @Post('escalate')
  async escalateToCSM(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: { accountId?: string; reason?: string },
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.csService.escalateToCSM(tenantId, body);
  }

  @Post('ebr/generate')
  async generateEBR(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: { accountId?: string },
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.csService.generateEBRBriefing(tenantId, body.accountId);
  }
}
