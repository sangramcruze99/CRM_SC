import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ScreeningProfilesService } from './screening-profiles.service';
import { JwtAuthGuard } from '@repo/auth';

@Controller('screening-profiles')
@UseGuards(JwtAuthGuard)
export class ScreeningProfilesController {
  constructor(private readonly screeningService: ScreeningProfilesService) {}

  @Post('parse-natural-language')
  @HttpCode(HttpStatus.OK)
  async parseNaturalLanguage(
    @Body() body: { prompt: string; jobTitle?: string },
  ) {
    return this.screeningService.parseNaturalLanguage(body.prompt, body.jobTitle);
  }

  @Post('extract-from-jd')
  @HttpCode(HttpStatus.OK)
  async extractFromJobDescription(@Body() body: { jobDescription: string }) {
    return this.screeningService.extractFromJobDescription(body.jobDescription);
  }

  @Get('templates')
  getPrebuiltTemplates() {
    return this.screeningService.getPrebuiltTemplates();
  }

  @Get()
  async getProfiles(@Headers('x-tenant-id') tenantId: string = 'tenant_master_audit') {
    return this.screeningService.getProfiles(tenantId);
  }

  @Get(':id')
  async getProfileById(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string = 'tenant_master_audit',
  ) {
    return this.screeningService.getProfileById(tenantId, id);
  }

  @Post()
  async saveProfile(
    @Body() body: any,
    @Headers('x-tenant-id') tenantId: string = 'tenant_master_audit',
  ) {
    return this.screeningService.saveProfile(tenantId, body);
  }

  @Post('screen-resume')
  @HttpCode(HttpStatus.OK)
  async screenResume(
    @Body() body: any,
    @Headers('x-tenant-id') tenantId: string = 'tenant_master_audit',
  ) {
    return this.screeningService.screenResume(tenantId, body);
  }

  @Post('results/:id/review')
  @HttpCode(HttpStatus.OK)
  async reviewCandidate(
    @Param('id') id: string,
    @Body() body: { verdict: 'APPROVE' | 'REQUEST_INFO' | 'REJECT'; notes?: string; reviewer?: string },
    @Headers('x-tenant-id') tenantId: string = 'tenant_master_audit',
  ) {
    return this.screeningService.reviewCandidate(tenantId, id, body);
  }
}
