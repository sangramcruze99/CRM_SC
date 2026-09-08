import { Controller, Get, Post, Param, Body, Headers } from '@nestjs/common';
import { ExpensesService, CreateExpenseDto } from './expenses.service';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  async getExpenses(@Headers('x-tenant-id') tenantId: string) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.expensesService.findAll(effectiveTenantId);
  }

  @Post()
  async createExpense(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateExpenseDto
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.expensesService.create(effectiveTenantId, dto);
  }

  @Post(':id/approve')
  async approveExpense(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() body: { approverId?: string }
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.expensesService.approve(effectiveTenantId, id, body?.approverId || 'FINANCE_MANAGER');
  }
}
