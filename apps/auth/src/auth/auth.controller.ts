import { Controller, Post, Get, Body, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @Post('login')
  async login(@Body() body: any) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }
}
