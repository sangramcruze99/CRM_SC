import { Controller, Get, Post, Body, Patch, Param, Delete, Headers } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';

@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  private getTenant(tenantIdHeader?: string) {
    return tenantIdHeader || 'default-tenant';
  }

  @Post()
  create(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() createWorkflowDto: any
  ) {
    return this.workflowsService.create(this.getTenant(tenantIdHeader), createWorkflowDto);
  }

  @Get()
  findAll(@Headers('x-tenant-id') tenantIdHeader: string) {
    return this.workflowsService.findAll(this.getTenant(tenantIdHeader));
  }

  @Get(':id')
  findOne(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string
  ) {
    return this.workflowsService.findOne(this.getTenant(tenantIdHeader), id);
  }

  @Post('trigger')
  triggerDirect(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: any
  ) {
    const workflowId = body.workflowId || body.id || 'default_workflow';
    return this.workflowsService.trigger(this.getTenant(tenantIdHeader), workflowId, body.triggerData || body);
  }

  @Post(':id/trigger')
  trigger(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
    @Body() triggerData: any
  ) {
    return this.workflowsService.trigger(this.getTenant(tenantIdHeader), id, triggerData);
  }

  @Patch(':id')
  update(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string, 
    @Body() updateWorkflowDto: any
  ) {
    return this.workflowsService.update(this.getTenant(tenantIdHeader), id, updateWorkflowDto);
  }

  @Delete(':id')
  remove(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string
  ) {
    return this.workflowsService.remove(this.getTenant(tenantIdHeader), id);
  }
}
