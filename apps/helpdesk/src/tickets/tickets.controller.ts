import { Controller, Get, Post, Body, Headers, BadRequestException, Param, Patch, Delete } from '@nestjs/common';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  async getTickets(@Headers('x-tenant-id') tenantId: string) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.ticketsService.findAll(effectiveTenantId);
  }

  @Post()
  async createTicket(
    @Headers('x-tenant-id') tenantId: string,
    @Body() data: { title: string, description: string, priority?: string }
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.ticketsService.create(effectiveTenantId, data);
  }

  @Post(':id/messages')
  async addMessage(
    @Param('id') id: string,
    @Body() data: { content: string, isStaff?: boolean }
  ) {
    return this.ticketsService.addMessage(id, data.content, data.isStaff);
  }

  @Patch(':id/status')
  async updateStatus(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() data: { status: string }
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.ticketsService.updateStatus(effectiveTenantId, id, data.status);
  }

  @Delete(':id')
  async deleteTicket(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string
  ) {
    const effectiveTenantId = tenantId || 'default-tenant';
    return this.ticketsService.delete(effectiveTenantId, id);
  }
}
