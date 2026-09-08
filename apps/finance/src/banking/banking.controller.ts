import { Controller, Get, Post, Param, Body, Headers, Query, BadRequestException } from '@nestjs/common';
import { BankingService, CreateBankAccountDto, ImportTransactionDto } from './banking.service';

@Controller('banking')
export class BankingController {
  constructor(private readonly bankingService: BankingService) {}

  @Get('accounts')
  async getAccounts(@Headers('x-tenant-id') tenantId: string) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.bankingService.getAccounts(effectiveTenantId);
  }

  @Get('accounts/:id')
  async getAccount(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.bankingService.getAccount(effectiveTenantId, id);
  }

  @Post('accounts')
  async createAccount(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateBankAccountDto
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.bankingService.createAccount(effectiveTenantId, dto);
  }

  @Get('transactions')
  async getTransactions(
    @Headers('x-tenant-id') tenantId: string,
    @Query('accountId') accountId?: string
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.bankingService.getTransactions(effectiveTenantId, accountId);
  }

  @Post('accounts/:id/import')
  async importTransactions(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() body: { transactions: ImportTransactionDto[] }
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    if (!body?.transactions || !Array.isArray(body.transactions)) {
      throw new BadRequestException('Payload must include an array of transactions to import');
    }
    return this.bankingService.importTransactions(effectiveTenantId, id, body.transactions);
  }

  @Post('transfer')
  async transferFunds(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { fromAccountId: string; toAccountId: string; amount: number; memo?: string }
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    if (!body.fromAccountId || !body.toAccountId || !body.amount) {
      throw new BadRequestException('fromAccountId, toAccountId, and amount are required');
    }
    return this.bankingService.transferFunds(
      effectiveTenantId,
      body.fromAccountId,
      body.toAccountId,
      body.amount,
      body.memo
    );
  }
}
