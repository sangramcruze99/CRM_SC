// apps/automation/src/intent/intent.controller.ts
// Universal Intent Controller: Human-Friendly Automation Endpoints

import { Controller, Get, Post, Body, Param, Headers, UseGuards, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '@repo/auth';
import { IntentService } from './intent.service';
import { StructuredIntent } from './intent-parser.service';

@Controller('intent')
@UseGuards(JwtAuthGuard)
export class IntentController {
  constructor(private readonly intentService: IntentService) {}

  private getTenant(tenantIdHeader?: string): string {
    return tenantIdHeader || 'default-tenant';
  }

  @Get('domains')
  getDomains() {
    return this.intentService.getDomains();
  }

  @Get('domains/:id')
  getDomain(@Param('id') id: string) {
    return this.intentService.getDomain(id);
  }

  @Post('parse')
  @HttpCode(HttpStatus.OK)
  async parseIntent(
    @Body() body: { prompt: string; domain?: string },
  ) {
    return this.intentService.parse(body.prompt, body.domain);
  }

  @Post('compile')
  @HttpCode(HttpStatus.OK)
  compileIntent(
    @Body() body: { intent: StructuredIntent },
  ) {
    return this.intentService.compile(body.intent);
  }

  @Post('simulate')
  @HttpCode(HttpStatus.OK)
  async simulateIntent(
    @Body() body: { intent: StructuredIntent; mockInput?: Record<string, any> },
  ) {
    return this.intentService.simulate(body.intent, body.mockInput || {});
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  validateIntent(
    @Body() body: { intent: StructuredIntent },
  ) {
    return this.intentService.validate(body.intent);
  }

  @Post('save')
  async saveCompiledWorkflow(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: { intent: StructuredIntent; userId?: string },
  ) {
    const tenantId = this.getTenant(tenantIdHeader);
    const compiled = this.intentService.compile(body.intent);
    const saved = await this.intentService.saveCompiledWorkflow(tenantId, compiled, body.userId);
    return {
      message: 'Workflow successfully compiled and saved.',
      workflow: saved,
      compiled,
    };
  }
}
