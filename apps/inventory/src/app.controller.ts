import { Controller, Get, Headers } from '@nestjs/common';
import { Public } from './jwt-auth.guard';
import { AppService } from './app.service';
import { ProductsService } from './products/products.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly productsService: ProductsService,
  ) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'inventory',
      port: 3026,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('inventory')
  async getInventory(@Headers('x-tenant-id') tenantId?: string) {
    return this.productsService.findAll({}, tenantId || 'default-tenant');
  }
}
