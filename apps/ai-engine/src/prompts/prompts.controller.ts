import { Controller, Get, Post, Body, Patch, Param, Delete, Headers } from '@nestjs/common';
import { PromptsService } from './prompts.service';

@Controller('prompts')
export class PromptsController {
  constructor(private readonly promptsService: PromptsService) {}

  private getTenant(tenantIdHeader?: string) {
    return tenantIdHeader || 'default-tenant';
  }

  @Post()
  create(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() createPromptDto: any
  ) {
    return this.promptsService.create(this.getTenant(tenantIdHeader), createPromptDto);
  }

  @Get()
  findAll(@Headers('x-tenant-id') tenantIdHeader: string) {
    return this.promptsService.findAll(this.getTenant(tenantIdHeader));
  }

  @Get(':id')
  findOne(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string
  ) {
    return this.promptsService.findOne(this.getTenant(tenantIdHeader), id);
  }

  @Patch(':id')
  update(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string, 
    @Body() updatePromptDto: any
  ) {
    return this.promptsService.update(this.getTenant(tenantIdHeader), id, updatePromptDto);
  }

  @Delete(':id')
  remove(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string
  ) {
    return this.promptsService.remove(this.getTenant(tenantIdHeader), id);
  }

  @Post('ask')
  askAI(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: { query: string; templateId?: string; provider?: 'groq' | 'openrouter' | 'auto'; model?: string }
  ) {
    return this.promptsService.askAI(
      this.getTenant(tenantIdHeader),
      body.query,
      body.templateId,
      body.provider,
      body.model,
    );
  }
}
