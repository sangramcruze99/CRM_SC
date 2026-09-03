import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('inventory')
  getInventory() {
    return [
      { id: 'sku_1', name: 'Enterprise Cloud Server Rack', sku: 'SRV-ECR-900', stock: 24, price: 4999.00 },
      { id: 'sku_2', name: 'Optical Network Transceiver 100G', sku: 'OPT-NT-100', stock: 120, price: 299.00 },
      { id: 'sku_3', name: 'Secure Hardware Security Module', sku: 'HSM-SEC-50', stock: 15, price: 1250.00 }
    ];
  }
}
