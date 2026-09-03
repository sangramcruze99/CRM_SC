import { Controller, Get, Post, Body, Param, Delete, Headers } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';

@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Get()
  async findAll(@Headers('x-tenant-id') tenantId: string) {
    const tenant = tenantId || 'default-tenant';
    const keys = await this.apiKeysService.findAll(tenant);
    // Mask the keys before returning them to the client
    return keys.map(k => ({
      ...k,
      key: k.key ? (k.key.length > 12 ? k.key.substring(0, 12) + '... (Masked)' : k.key) : 'sk_live_...masked',
    }));
  }

  @Post()
  create(@Body() data: { name: string; permissions?: string[] }, @Headers('x-tenant-id') tenantId: string) {
    const tenant = tenantId || 'default-tenant';
    return this.apiKeysService.create(data, tenant);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    const tenant = tenantId || 'default-tenant';
    return this.apiKeysService.revoke(id, tenant);
  }
}
