import { Controller, Get, Post, Param, Body, Headers, BadRequestException } from '@nestjs/common';
import { ReconciliationService } from './reconciliation.service';

@Controller('reconciliation')
export class ReconciliationController {
  constructor(private readonly reconciliationService: ReconciliationService) {}

  @Get('candidates/:transactionId')
  async getCandidates(
    @Headers('x-tenant-id') tenantId: string,
    @Param('transactionId') transactionId: string
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.reconciliationService.findCandidates(effectiveTenantId, transactionId);
  }

  @Post('match')
  async reconcileMatch(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { transactionId: string; paymentId: string }
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    if (!body.transactionId || !body.paymentId) {
      throw new BadRequestException('transactionId and paymentId are required');
    }
    return this.reconciliationService.reconcile(effectiveTenantId, body.transactionId, body.paymentId);
  }

  @Get('exceptions')
  async getExceptions(@Headers('x-tenant-id') tenantId: string) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.reconciliationService.getExceptions(effectiveTenantId);
  }
}
