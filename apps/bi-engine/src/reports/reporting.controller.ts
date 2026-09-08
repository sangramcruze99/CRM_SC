import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  Res,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { ReportingService, GenerateReportInput } from './reporting.service';

@Controller('reports')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get()
  async listReports(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Query('periodType') periodType?: string,
    @Query('status') status?: string,
    @Query('tenantId') tenantIdQuery?: string
  ) {
    const tenantId = tenantIdHeader || tenantIdQuery || 'default-tenant';
    return this.reportingService.listReports(tenantId, { periodType, status });
  }

  @Get(':id')
  async getReport(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
    @Query('tenantId') tenantIdQuery?: string
  ) {
    const tenantId = tenantIdHeader || tenantIdQuery || 'default-tenant';
    return this.reportingService.getReport(tenantId, id);
  }

  @Post('generate')
  async generateReport(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Headers('x-user-id') userId: string,
    @Body() body: GenerateReportInput & { tenantId?: string }
  ) {
    const tenantId = tenantIdHeader || body.tenantId || 'default-tenant';
    let periodKey = body.periodKey;
    if (!periodKey && body.startDate) {
      const dStr = body.startDate.split('T')[0];
      if (body.periodType === 'DAY' || body.periodType === 'WEEK') {
        periodKey = dStr;
      } else if (body.periodType === 'MONTH') {
        periodKey = dStr.substring(0, 7);
      } else if (body.periodType === 'QUARTER') {
        const [y, mStr] = dStr.split('-');
        const m = parseInt(mStr, 10);
        const q = Math.ceil(m / 3);
        periodKey = `${y}-Q${q}`;
      } else {
        periodKey = dStr.substring(0, 4);
      }
    }
    if (!body.periodType || !periodKey) {
      throw new BadRequestException('periodType and periodKey (or startDate) are required');
    }
    return this.reportingService.generateReport(tenantId, {
      ...body,
      periodKey,
      generatedBy: body.generatedBy || userId || 'Executive Officer',
    });
  }

  @Get(':id/export')
  async exportReport(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
    @Query('format') format: string = 'csv',
    @Query('tenantId') tenantIdQuery?: string,
    @Res() res?: Response
  ) {
    const tenantId = tenantIdHeader || tenantIdQuery || 'default-tenant';
    const csvContent = await this.reportingService.exportCsv(tenantId, id);

    if (res) {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="report_${id}.csv"`);
      return res.send(csvContent);
    }
    return { content: csvContent };
  }
}
