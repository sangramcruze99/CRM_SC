import { Controller, Get, Post, Query, Body, Headers, BadRequestException } from '@nestjs/common';
import { GlobalSearchService } from './global-search.service';

@Controller('search')
export class GlobalSearchController {
  constructor(private readonly searchService: GlobalSearchService) {}

  @Get()
  async search(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Query('q') query: string
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';
    if (!query) return [];
    
    return this.searchService.search(tenantId, query);
  }

  @Post('ai')
  async aiSearch(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: { query: string }
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';
    if (!body || !body.query) {
      throw new BadRequestException('Natural language search query is required');
    }

    return this.searchService.aiSearch(tenantId, body.query);
  }
}
