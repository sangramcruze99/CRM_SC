import { Controller, Get, Post, Param, Body, Headers, BadRequestException } from '@nestjs/common';
import { BillsService, CreateBillDto } from './bills.service';

@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Get()
  async getBills(@Headers('x-tenant-id') tenantId: string) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.billsService.findAll(effectiveTenantId);
  }

  @Get(':id')
  async getBill(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.billsService.findOne(effectiveTenantId, id);
  }

  @Post()
  async createBill(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateBillDto
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.billsService.create(effectiveTenantId, dto);
  }

  @Post(':id/validate')
  async validateBill(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.billsService.validate(effectiveTenantId, id);
  }

  @Post(':id/approve')
  async approveBill(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() body: { approverId?: string; role?: string }
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    const approverId = body?.approverId || 'FINANCE_MANAGER';
    return this.billsService.approve(effectiveTenantId, id, approverId, body?.role);
  }

  @Post(':id/reject')
  async rejectBill(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() body: { approverId?: string; reason?: string }
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    const approverId = body?.approverId || 'FINANCE_MANAGER';
    return this.billsService.reject(effectiveTenantId, id, approverId, body?.reason || 'Policy mismatch');
  }
}
