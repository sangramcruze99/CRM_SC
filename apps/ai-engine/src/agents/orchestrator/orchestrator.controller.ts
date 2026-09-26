import { Body, Controller, Get, Headers, Param, Post, Query } from '@nestjs/common';
import { AgentOrchestratorService } from './agent-orchestrator.service';
import { BusinessEvent } from '@repo/core-types';

@Controller('orchestrator')
export class OrchestratorController {
  constructor(private readonly orchestratorService: AgentOrchestratorService) {}

  /**
   * Main entrypoint for Event Bus -> Agent Orchestrator
   */
  @Post('handle-event')
  handleBusinessEvent(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() event: BusinessEvent
  ) {
    const tenantId = tenantIdHeader || event.tenantId || 'default-tenant';
    return this.orchestratorService.handleEvent({
      ...event,
      tenantId,
    });
  }

  /**
   * Query cross-department agent timeline with explainability metadata
   */
  @Get('timeline')
  getTimeline(@Query('limit') limit?: string) {
    return this.orchestratorService.getTimeline(limit ? parseInt(limit, 10) : 30);
  }

  /**
   * Query persisted universal agent executions
   */
  @Get('executions')
  getExecutions(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('agentId') agentId?: string,
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.orchestratorService.getExecutions(tenantId, {
      limit: limit ? parseInt(limit, 10) : 50,
      status,
      agentId,
    });
  }

  /**
   * Get single execution with full contract details (actions, outputs, decisions)
   */
  @Get('executions/:id')
  getExecutionById(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.orchestratorService.getExecutionById(id, tenantId);
  }

  /**
   * Manual trigger test for a specific domain agent
   */
  @Post('trigger-agent')
  triggerAgent(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: { eventType: string; payload: any }
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';
    const fakeEvent: BusinessEvent = {
      id: `evt_manual_${Date.now()}`,
      tenantId,
      type: (body.eventType as any) || 'CUSTOM_EVENT',
      version: '1.0',
      correlationId: `corr_${Date.now()}`,
      timestamp: new Date().toISOString(),
      source: 'manual_trigger',
      payload: body.payload || {},
    };

    return this.orchestratorService.handleEvent(fakeEvent);
  }

  /**
   * Controlled Agent-to-Agent Handoff
   */
  @Post('handoff')
  handoffAgent(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: any
  ) {
    const tenantId = tenantIdHeader || body.tenantId || 'default-tenant';
    return this.orchestratorService.handoffToAgent({
      ...body,
      tenantId,
    });
  }

  /**
   * Query pending HITL approval requests
   */
  @Get('approvals')
  getPendingApprovals(@Headers('x-tenant-id') tenantIdHeader: string) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.orchestratorService.getPendingApprovals(tenantId);
  }

  /**
   * Approve a pending action -> executes tool and updates audit trail
   */
  @Post('approvals/:id/approve')
  approveAction(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
    @Body() body: { reviewerId?: string }
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.orchestratorService.resumeApprovedAction(id, tenantId, body?.reviewerId);
  }

  /**
   * Reject a pending action -> updates record and registers feedback in agent memory
   */
  @Post('approvals/:id/reject')
  rejectAction(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
    @Body() body: { feedback?: string; reviewerId?: string }
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.orchestratorService.rejectApprovalAction(id, tenantId, body?.feedback, body?.reviewerId);
  }
}
