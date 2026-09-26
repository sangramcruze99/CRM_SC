import { Controller, Get, Post, Put, Delete, Body, Param, Headers } from '@nestjs/common';
import { Public } from '../jwt-auth.guard';
import { CategoriesService, CategoryDto } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  async findAll(@Headers('x-tenant-id') tenantId?: string) {
    return this.categoriesService.findAll(tenantId || 'default-tenant');
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string, @Headers('x-tenant-id') tenantId?: string) {
    return this.categoriesService.findOne(id, tenantId || 'default-tenant');
  }

  @Post()
  async create(@Body() dto: CategoryDto, @Headers('x-tenant-id') tenantId?: string) {
    return this.categoriesService.create(dto, tenantId || 'default-tenant');
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<CategoryDto>, @Headers('x-tenant-id') tenantId?: string) {
    return this.categoriesService.update(id, dto, tenantId || 'default-tenant');
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Headers('x-tenant-id') tenantId?: string) {
    return this.categoriesService.delete(id, tenantId || 'default-tenant');
  }
}
