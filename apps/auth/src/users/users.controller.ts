import { Controller, Get, Req } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return [
      {
        id: 'usr_default_admin',
        email: 'admin@gmail.com',
        name: 'Sangram Cruze',
        role: 'SUPERADMIN',
        tenantId: 'default-tenant'
      }
    ];
  }

  @Get('me')
  async getMe(@Req() req: any) {
    return req.user || {
      id: 'usr_default_admin',
      email: 'admin@gmail.com',
      name: 'Sangram Cruze',
      role: 'SUPERADMIN',
      tenantId: 'default-tenant'
    };
  }
}
