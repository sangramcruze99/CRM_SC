import { Controller, Get, Post, Body, Query, Headers } from '@nestjs/common';
import { Public } from '../jwt-auth.guard';
import { StockMovementsService, CreateStockMovementDto } from './stock-movements.service';

@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Public()
  @Get()
  async findAll(@Query('productId') productId?: string, @Headers('x-tenant-id') tenantId?: string) {
    return this.stockMovementsService.findAll(productId, tenantId || 'default-tenant');
  }

  @Post()
  async create(@Body() dto: CreateStockMovementDto, @Headers('x-tenant-id') tenantId?: string) {
    return this.stockMovementsService.create(dto, tenantId || 'default-tenant');
  }
}
