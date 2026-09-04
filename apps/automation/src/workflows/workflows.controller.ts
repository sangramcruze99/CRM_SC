import { Controller, Get, Post, Body, Patch, Param, Delete, Headers, Query } from '@nestjs/common';
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

  /**
   * Behavioral website event ingestion trigger
   * Ingests PAGE_VISITED, FORM_SUBMITTED, CART_ABANDONED, etc.
   */
  @Post('events')
  ingestEvent(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: any
  ) {
    return this.workflowsService.ingestEvent(this.getTenant(tenantIdHeader), body);
  }

  /**
   * Unified Enterprise Event Bus: Publish Standardized Business Event
   */
  @Post('events/publish')
  publishEvent(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: any
  ) {
    return this.workflowsService.publishEvent(this.getTenant(tenantIdHeader), body);
  }

  /**
   * Query Event Bus History for Observability
   */
  @Get('events/history')
  getEventHistory(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Query('limit') limit?: string
  ) {
    return this.workflowsService.getEventHistory(
      this.getTenant(tenantIdHeader),
      limit ? parseInt(limit, 10) : 50
    );
  }

  /**
   * Query Dead Letter Queue
   */
  @Get('events/dead-letter')
  getDeadLetterQueue(@Headers('x-tenant-id') tenantIdHeader: string) {
    return this.workflowsService.getDeadLetterQueue(this.getTenant(tenantIdHeader));
  }

  /**
   * Replay Event from Dead Letter / History
   */
  @Post('events/:eventId/replay')
  replayEvent(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('eventId') eventId: string
  ) {
    return this.workflowsService.replayEvent(this.getTenant(tenantIdHeader), eventId);
  }

  /**
   * Workflow Collision Management Check
   */
  @Post('collisions')
  checkCollisions(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: { contacts: string[]; workflowId: string }
  ) {
    return this.workflowsService.checkCollisions(
      this.getTenant(tenantIdHeader),
      body.contacts || [],
      body.workflowId || 'current'
    );
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

  @Post('simulate')
  simulate(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: any
  ) {
    return this.workflowsService.simulate(this.getTenant(tenantIdHeader), body);
  }

  @Get(':id/analytics')
  getAnalytics(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string
  ) {
    return this.workflowsService.getAnalytics(this.getTenant(tenantIdHeader), id);
  }

  /**
   * Pause a workflow
   */
  @Post(':id/pause')
  pause(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string
  ) {
    return this.workflowsService.pauseWorkflow(this.getTenant(tenantIdHeader), id);
  }

  /**
   * Resume a workflow
   */
  @Post(':id/resume')
  resume(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string
  ) {
    return this.workflowsService.resumeWorkflow(this.getTenant(tenantIdHeader), id);
  }

  /**
   * Query past executions for audit logs
   */
  @Get(':id/executions')
  getExecutions(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string
  ) {
    return this.workflowsService.getExecutions(
      this.getTenant(tenantIdHeader),
      id,
      limit ? parseInt(limit, 10) : 50,
      status
    );
  }

  /**
   * Query single execution audit trail
   */
  @Get(':id/executions/:executionId')
  getExecutionById(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('executionId') executionId: string
  ) {
    return this.workflowsService.getExecutionById(this.getTenant(tenantIdHeader), executionId);
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
