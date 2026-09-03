import { Controller, Get, Post, Delete, Param, Headers, BadRequestException } from '@nestjs/common';
import { PluginsService } from './plugins.service';

@Controller('plugins')
export class PluginsController {
  constructor(private readonly pluginsService: PluginsService) {}

  @Get()
  findAll(@Headers('x-tenant-id') tenantIdHeader?: string) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.pluginsService.findAll(tenantId);
  }

  @Post(':id/install')
  install(@Param('id') id: string, @Headers('x-tenant-id') tenantIdHeader?: string) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.pluginsService.install(tenantId, id);
  }

  @Delete(':id/uninstall')
  uninstall(@Param('id') id: string, @Headers('x-tenant-id') tenantIdHeader?: string) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.pluginsService.uninstall(tenantId, id);
  }
}
