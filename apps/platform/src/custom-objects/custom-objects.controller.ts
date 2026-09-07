import { Controller, Get, Post, Body, Patch, Param, Delete, Headers } from '@nestjs/common';
import { CustomObjectsService } from './custom-objects.service';

@Controller('custom-objects')
export class CustomObjectsController {
  constructor(private readonly customObjectsService: CustomObjectsService) {}

  private getTenant(tenantIdHeader?: string) {
    return tenantIdHeader || 'default-tenant';
  }

  @Post()
  create(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() createCustomObjectDto: any
  ) {
    return this.customObjectsService.create(this.getTenant(tenantIdHeader), createCustomObjectDto);
  }

  @Get()
  async findAll(@Headers('x-tenant-id') tenantIdHeader: string) {
    const tenantId = this.getTenant(tenantIdHeader);
    return this.customObjectsService.findAll(tenantId);
  }

  @Get(':id')
  findOne(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string
  ) {
    return this.customObjectsService.findOne(this.getTenant(tenantIdHeader), id);
  }

  @Patch(':id')
  update(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string, 
    @Body() updateCustomObjectDto: any
  ) {
    return this.customObjectsService.update(this.getTenant(tenantIdHeader), id, updateCustomObjectDto);
  }

  @Delete(':id')
  remove(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string
  ) {
    return this.customObjectsService.remove(this.getTenant(tenantIdHeader), id);
  }
}
