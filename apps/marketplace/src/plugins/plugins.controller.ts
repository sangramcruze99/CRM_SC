import { Controller, Get, Post, Delete, Param, Headers, Body, Query } from '@nestjs/common';
import { PluginsService } from './plugins.service';

@Controller('plugins')
export class PluginsController {
  constructor(private readonly pluginsService: PluginsService) {}

  private getTenant(tenantIdHeader?: string) {
    return tenantIdHeader || 'default-tenant';
  }

  @Get()
  findAll(
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Query('type') type?: string,
    @Query('category') category?: string
  ) {
    const tenantId = this.getTenant(tenantIdHeader);
    return this.pluginsService.getMarketplaceItems(tenantId, { type, category });
  }

  @Get('items')
  getItems(
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Query('type') type?: string,
    @Query('category') category?: string
  ) {
    const tenantId = this.getTenant(tenantIdHeader);
    return this.pluginsService.getMarketplaceItems(tenantId, { type, category });
  }

  @Get('items/:id')
  getItemById(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader?: string
  ) {
    const tenantId = this.getTenant(tenantIdHeader);
    return this.pluginsService.getMarketplaceItemById(tenantId, id);
  }

  @Post(':id/install')
  install(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Body() body?: { permissions?: string[]; configuration?: Record<string, any> }
  ) {
    const tenantId = this.getTenant(tenantIdHeader);
    return this.pluginsService.installMarketplaceItem(
      tenantId,
      id,
      body?.permissions || [],
      body?.configuration || {}
    );
  }

  @Delete(':id/uninstall')
  uninstall(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantIdHeader?: string
  ) {
    const tenantId = this.getTenant(tenantIdHeader);
    return this.pluginsService.uninstallMarketplaceItem(tenantId, id);
  }
}
