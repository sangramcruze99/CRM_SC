import { Controller, Get, Post, Put, Delete, Body, Param, Query, Headers } from '@nestjs/common';
import { Public } from '../jwt-auth.guard';
import { ProductsService, CreateProductDto } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get('stats')
  async getStats(@Headers('x-tenant-id') tenantId?: string) {
    return this.productsService.getStats(tenantId || 'default-tenant');
  }

  @Public()
  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('supplierId') supplierId?: string,
    @Query('status') status?: string,
    @Query('lowStock') lowStock?: string,
    @Query('limit') limit?: string,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    return this.productsService.findAll(
      {
        search,
        categoryId,
        supplierId,
        status,
        lowStockOnly: lowStock === 'true',
        limit: limit ? Number(limit) : undefined,
      },
      tenantId || 'default-tenant',
    );
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string, @Headers('x-tenant-id') tenantId?: string) {
    return this.productsService.findOne(id, tenantId || 'default-tenant');
  }

  @Post()
  async create(@Body() dto: CreateProductDto, @Headers('x-tenant-id') tenantId?: string) {
    return this.productsService.create(dto, tenantId || 'default-tenant');
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateProductDto>,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    return this.productsService.update(id, dto, tenantId || 'default-tenant');
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Headers('x-tenant-id') tenantId?: string) {
    return this.productsService.delete(id, tenantId || 'default-tenant');
  }
}
