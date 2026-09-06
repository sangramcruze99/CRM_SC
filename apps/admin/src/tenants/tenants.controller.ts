import { Controller, Get, Post, Body, Param, Delete, Req, ForbiddenException } from '@nestjs/common';
import { TenantsService } from './tenants.service';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  private checkSuperAdmin(req: any) {
    if (req.user?.role !== 'SUPERADMIN') {
      throw new ForbiddenException('Superadmin privileges required to manage tenant accounts');
    }
  }

  @Get()
  findAll(@Req() req: any) {
    this.checkSuperAdmin(req);
    return this.tenantsService.findAll();
  }

  @Post()
  create(@Req() req: any, @Body() data: { name: string; domain?: string }) {
    this.checkSuperAdmin(req);
    return this.tenantsService.create(data);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    this.checkSuperAdmin(req);
    return this.tenantsService.delete(id);
  }
}
