import { Controller, Get, Post, Body, Headers, Query, Param } from '@nestjs/common';
import { SalesDepartmentService, QualifyLeadInput } from './sales-department.service';

@Controller('departments/sales')
export class SalesDepartmentController {
  constructor(private readonly salesService: SalesDepartmentService) {}

  @Get('overview')
  async getOverview(@Headers('x-tenant-id') tenantIdHeader: string) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.salesService.getDepartmentOverview(tenantId);
  }

  @Get('kpis')
  async getKPIs(@Headers('x-tenant-id') tenantIdHeader: string) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.salesService.getDepartmentKPIs(tenantId);
  }

  @Get('forecast')
  async getForecast(@Headers('x-tenant-id') tenantIdHeader: string) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.salesService.getPipelineForecast(tenantId);
  }

  @Get('recommendations')
  async getRecommendations(@Headers('x-tenant-id') tenantIdHeader: string) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.salesService.getRepRecommendations(tenantId);
  }

  @Post('leads/qualify')
  async qualifyLead(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: QualifyLeadInput & { autoCreateCrmRecords?: boolean },
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.salesService.qualifyLead(tenantId, body, body.autoCreateCrmRecords ?? true);
  }

  @Post('companies/analyze')
  async analyzeCompany(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: { domain: string; name?: string; industry?: string; employees?: number },
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.salesService.analyzeCompanyICP(tenantId, body);
  }

  @Post('deals/create')
  async createDeal(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: {
      title: string;
      amount: number;
      contactEmail: string;
      contactName?: string;
      companyName?: string;
      stage?: string;
    },
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.salesService.createDealOpportunity(tenantId, body);
  }

  @Post('deals/analyze')
  async analyzeDeal(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: { dealId: string },
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';
    const [score, risk, nextAction] = await Promise.all([
      this.salesService.scoreOpportunity(tenantId, body.dealId),
      this.salesService.detectDealRisk(tenantId, body.dealId),
      this.salesService.determineNextBestAction(tenantId, body.dealId),
    ]);

    return {
      dealId: body.dealId,
      score,
      risk,
      nextAction,
    };
  }

  @Post('deals/stalled-recovery')
  async recoverStalledDeals(@Headers('x-tenant-id') tenantIdHeader: string) {
    const tenantId = tenantIdHeader || 'default-tenant';
    const plans = await this.salesService.recoverStalledDeals(tenantId);
    return {
      recoveredDealsCount: plans.length,
      recoveryPlans: plans,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('meetings/prepare')
  async prepareMeeting(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: { dealId?: string; contactId?: string; meetingAgenda?: string },
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.salesService.prepareMeeting(tenantId, body);
  }

  @Post('emails/generate')
  async generateEmail(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: {
      type: 'COLD_OUTREACH' | 'POST_DISCOVERY' | 'PROPOSAL_FOLLOWUP' | 'REENGAGEMENT';
      prospectName: string;
      companyName: string;
      keyPainPoint?: string;
      customOffer?: string;
    },
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.salesService.generateSalesEmail(tenantId, body);
  }

  @Post('follow-up')
  async sendFollowUp(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: {
      dealId: string;
      customNote?: string;
      proposedDiscountPercent?: number;
      dispatchImmediately?: boolean;
    },
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.salesService.generateFollowUp(tenantId, body);
  }
}
