import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Headers,
  Query,
} from '@nestjs/common';
import { FoldersService } from './folders.service';

@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Get()
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('parentId') parentId?: string,
  ) {
    // Default tenant for development
    const tenant = tenantId || 'default-tenant';
    return this.foldersService.findAll(tenant, parentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    const tenant = tenantId || 'default-tenant';
    return this.foldersService.findOne(id, tenant);
  }

  @Post()
  create(
    @Body() data: { name: string; parentId?: string },
    @Headers('x-tenant-id') tenantId: string,
  ) {
    const tenant = tenantId || 'default-tenant';
    return this.foldersService.create(data, tenant);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    const tenant = tenantId || 'default-tenant';
    return this.foldersService.delete(id, tenant);
  }
}
