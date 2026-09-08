import { Controller, Get, Post, Body, Param, Headers, BadRequestException } from '@nestjs/common';
import { AccountingService, CreateJournalEntryDto } from './accounting.service';

@Controller('accounting')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Get('chart-of-accounts')
  async getChartOfAccounts(@Headers('x-tenant-id') tenantId: string) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.accountingService.getChartOfAccounts(effectiveTenantId);
  }

  @Get('journal-entries')
  async getJournalEntries(@Headers('x-tenant-id') tenantId: string) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.accountingService.getJournalEntries(effectiveTenantId);
  }

  @Post('journal-entries')
  async createJournalEntry(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateJournalEntryDto
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    if (!dto.memo || !dto.lines || dto.lines.length === 0) {
      throw new BadRequestException('Journal entry must include memo and at least one line item');
    }
    return this.accountingService.createJournalEntry(effectiveTenantId, dto);
  }

  @Post('journal-entries/:id/reverse')
  async reverseJournalEntry(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() body: { reversedById?: string }
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.accountingService.reverseJournalEntry(effectiveTenantId, id, body?.reversedById);
  }

  @Get('trial-balance')
  async getTrialBalance(@Headers('x-tenant-id') tenantId: string) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.accountingService.getTrialBalance(effectiveTenantId);
  }

  @Get('balance-sheet')
  async getBalanceSheet(@Headers('x-tenant-id') tenantId: string) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.accountingService.getBalanceSheet(effectiveTenantId);
  }

  @Get('profit-and-loss')
  async getProfitAndLoss(@Headers('x-tenant-id') tenantId: string) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.accountingService.getProfitAndLoss(effectiveTenantId);
  }

  @Get('periods')
  async getPeriods(@Headers('x-tenant-id') tenantId: string) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.accountingService.getPeriods(effectiveTenantId);
  }

  @Post('periods/:id/close')
  async closePeriod(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() body: { closedBy?: string }
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.accountingService.closePeriod(effectiveTenantId, id, body?.closedBy);
  }
}
