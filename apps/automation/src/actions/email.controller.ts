import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ResendService, SendEmailOptions } from './resend.service';

@Controller('email')
export class EmailController {
  constructor(private readonly resendService: ResendService) {}

  @Get('status')
  getStatus() {
    const isConfigured = Boolean(
      process.env.RESEND_API_KEY
    );
    return {
      provider: 'Resend',
      configured: isConfigured,
      defaultFrom: process.env.RESEND_FROM_EMAIL || 'Business OS <onboarding@resend.dev>',
      status: 'OPERATIONAL',
    };
  }

  @Post('send')
  @HttpCode(HttpStatus.OK)
  async sendEmail(@Body() body: SendEmailOptions) {
    return this.resendService.sendEmail(body);
  }
}
