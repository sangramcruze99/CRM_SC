import { Controller, Get, Post, Param, Query, Headers, Body } from '@nestjs/common';
import { WorkflowTemplatesService } from './workflow-templates.service';

@Controller('templates')
export class WorkflowTemplatesController {
  constructor(private readonly templatesService: WorkflowTemplatesService) {}

  private getTenant(tenantIdHeader?: string) {
    return tenantIdHeader || 'default-tenant';
  }

  @Get()
  getTemplates(@Query('category') category?: string) {
    return this.templatesService.getTemplates(category);
  }

  @Get(':id')
  getTemplateById(@Param('id') id: string) {
    return this.templatesService.getTemplateById(id);
  }

  @Post(':id/clone')
  cloneTemplate(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
    @Body() body: { name?: string },
  ) {
    return this.templatesService.cloneTemplateToWorkflow(this.getTenant(tenantIdHeader), id, body?.name);
  }
}
