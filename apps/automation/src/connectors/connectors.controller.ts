import { Controller, Get, Post, Delete, Param, Body, Headers } from '@nestjs/common';
import { ConnectorRegistryService } from './connector-registry.service';

@Controller('connectors')
export class ConnectorsController {
  constructor(private readonly registry: ConnectorRegistryService) {}

  private getTenant(tenantIdHeader?: string) {
    return tenantIdHeader || 'default-tenant';
  }

  @Get()
  getConnectors() {
    return this.registry.getConnectors();
  }

  @Get('accounts')
  getTenantAccounts(@Headers('x-tenant-id') tenantIdHeader: string) {
    return this.registry.getTenantAccounts(this.getTenant(tenantIdHeader));
  }

  @Post('accounts')
  connectAccount(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: { connectorKey: string; name: string; credentials: Record<string, any> },
  ) {
    return this.registry.connectAccount(
      this.getTenant(tenantIdHeader),
      body.connectorKey,
      body.name,
      body.credentials || {},
    );
  }

  @Post('accounts/:id/test')
  testHealth(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
  ) {
    return this.registry.testAccountHealth(this.getTenant(tenantIdHeader), id);
  }

  @Post('accounts/:id/execute')
  executeAction(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
    @Body() body: { actionKey: string; params: Record<string, any> },
  ) {
    return this.registry.executeConnectorAction(
      this.getTenant(tenantIdHeader),
      id,
      body.actionKey,
      body.params || {},
    );
  }
}
