import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    if (!req.user) {
      throw new UnauthorizedException('Not authenticated');
    }
    return req.user;
  }

  @Post('login')
  async login(@Body() body: any) {
    if (!body.email || !body.password) {
      throw new BadRequestException('Email and password are required');
    }
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

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: any) {
    const token = req.token;
    const user = req.user;
    return this.authService.logout(token, user);
  }

  // --------------------------------------------------------------------------
  // MFA ENDPOINTS
  // --------------------------------------------------------------------------

  @UseGuards(JwtAuthGuard)
  @Post('mfa/setup')
  async setupMfa(@Req() req: any) {
    const userId = req.user?.sub;
    return this.authService.setupMfa(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(['mfa/verify', 'mfa/verify-setup'])
  async verifyMfaSetup(@Req() req: any, @Body() body: any) {
    const userId = req.user?.sub;
    if (!body.code) {
      throw new BadRequestException('Verification code is required');
    }
    return this.authService.verifyMfaSetup(userId, body.code);
  }

  @Post('mfa/challenge')
  async challengeMfa(@Body() body: any) {
    if (!body.challengeToken || !body.code) {
      throw new BadRequestException('Challenge token and code are required');
    }
    return this.authService.challengeMfa(body.challengeToken, body.code);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/disable')
  async disableMfa(@Req() req: any, @Body() body: any) {
    const userId = req.user?.sub;
    if (!body.password || !body.code) {
      throw new BadRequestException('Password and code are required to disable MFA');
    }
    return this.authService.disableMfa(userId, body);
  }
}
