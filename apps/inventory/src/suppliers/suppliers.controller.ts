import { Controller, Get, Post, Put, Delete, Body, Param, Headers } from '@nestjs/common';
import { Public } from '../jwt-auth.guard';
import { SuppliersService, SupplierDto } from './suppliers.service';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Public()
  @Get()
  async findAll(@Headers('x-tenant-id') tenantId?: string) {
    return this.suppliersService.findAll(tenantId || 'default-tenant');
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string, @Headers('x-tenant-id') tenantId?: string) {
    return this.suppliersService.findOne(id, tenantId || 'default-tenant');
  }

  @Post()
  async create(@Body() dto: SupplierDto, @Headers('x-tenant-id') tenantId?: string) {
    return this.suppliersService.create(dto, tenantId || 'default-tenant');
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<SupplierDto>, @Headers('x-tenant-id') tenantId?: string) {
    return this.suppliersService.update(id, dto, tenantId || 'default-tenant');
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Headers('x-tenant-id') tenantId?: string) {
    return this.suppliersService.delete(id, tenantId || 'default-tenant');
  }
}
