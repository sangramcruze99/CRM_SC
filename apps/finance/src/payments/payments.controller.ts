import { Controller, Get, Post, Param, Body, Headers, Query, BadRequestException } from '@nestjs/common';
import { PaymentsService, CreatePaymentDto, PaymentDispatchDto } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  async getPayments(
    @Headers('x-tenant-id') tenantId: string,
    @Query('direction') direction?: string,
    @Query('status') status?: string
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.paymentsService.findAll(effectiveTenantId, { direction, status });
  }

  @Get(':id')
  async getPayment(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.paymentsService.findOne(effectiveTenantId, id);
  }

  @Get(':id/final-review')
  async getFinalReview(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.paymentsService.getFinalReview(effectiveTenantId, id);
  }

  @Post()
  async createPayment(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreatePaymentDto
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.paymentsService.create(effectiveTenantId, dto);
  }

  @Post(':id/dispatch')
  async dispatchPayment(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto?: PaymentDispatchDto
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.paymentsService.dispatch(effectiveTenantId, id, dto);
  }

  @Post(':id/resolve-unknown')
  async resolveUnknownOutcome(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() body: { resolution: 'CONFIRMED' | 'FAILED' }
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    if (!body?.resolution || !['CONFIRMED', 'FAILED'].includes(body.resolution)) {
      throw new BadRequestException('Resolution must be CONFIRMED or FAILED');
    }
    return this.paymentsService.resolveUnknownOutcome(effectiveTenantId, id, body.resolution);
  }

  @Post(':id/allocate')
  async allocatePayment(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() body: { amount: number; invoiceId?: string; billId?: string }
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.paymentsService.allocate(effectiveTenantId, id, body.amount, body.invoiceId, body.billId);
  }
}
