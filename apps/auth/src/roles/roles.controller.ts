import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  getAllRoles() {
    return this.rolesService.findAllRoles();
  }

  @Get(':roleName')
  getRoleDetails(@Param('roleName') roleName: string) {
    return this.rolesService.getRole(roleName);
  }

  @Get('user/:userId')
  getUserPermissions(
    @Headers('x-tenant-id') tenantId: string,
    @Param('userId') userId: string,
  ) {
    return this.rolesService.getUserRole(tenantId || 'default-tenant', userId);
  }

  @Post('assign')
  assignRole(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { userId: string; role: string },
  ) {
    return this.rolesService.assignUserRole(
      tenantId || 'default-tenant',
      body.userId,
      body.role,
    );
  }

  @Post('check-permission')
  checkPermission(@Body() body: { role: string; permission: string }) {
    const hasPermission = this.rolesService.hasPermission(body.role, body.permission);
    return { role: body.role, permission: body.permission, allowed: hasPermission };
  }
}
