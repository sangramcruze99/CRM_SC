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
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('folderId') folderId?: string,
  ) {
    const tenant = tenantId || 'default-tenant';
    return this.documentsService.findAll(tenant, folderId);
  }

  @Post()
  create(@Body() data: any, @Headers('x-tenant-id') tenantId: string) {
    const tenant = tenantId || 'default-tenant';
    return this.documentsService.create(data, tenant);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    const tenant = tenantId || 'default-tenant';
    return this.documentsService.delete(id, tenant);
  }
}
