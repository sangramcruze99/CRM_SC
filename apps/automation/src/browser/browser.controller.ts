import { Controller, Get, Post, Body, Param, Headers, Query } from '@nestjs/common';
import { BrowserAgentService, BrowserExecutionRequest } from './browser-agent.service';

@Controller('browser')
export class BrowserController {
  constructor(private readonly browserService: BrowserAgentService) {}

  private getTenant(tenantIdHeader?: string) {
    return tenantIdHeader || 'default-tenant';
  }

  @Post('run')
  runBrowserSession(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: BrowserExecutionRequest,
  ) {
    return this.browserService.executeSession(this.getTenant(tenantIdHeader), body);
  }

  @Get('sessions')
  getSessions(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Query('limit') limit?: string,
  ) {
    return this.browserService.getSessions(
      this.getTenant(tenantIdHeader),
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('sessions/:id')
  getSessionById(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
  ) {
    return this.browserService.getSessionById(this.getTenant(tenantIdHeader), id);
  }
}
