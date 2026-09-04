import { Controller, Get, Post, Param, Body, Headers } from '@nestjs/common';
import { AgentFrameworkService, SafetyPolicy } from './agent-framework.service';

@Controller('agents')
export class AgentFrameworkController {
  constructor(private readonly agentService: AgentFrameworkService) {}

  @Get()
  getAgents() {
    return this.agentService.getAgents();
  }

  @Get('telemetry')
  getTelemetry() {
    return this.agentService.getTelemetry();
  }

  @Get('approvals')
  getApprovals() {
    return this.agentService.getApprovals();
  }

  @Post('approvals/:id/approve')
  approveAction(
    @Param('id') id: string,
    @Body() body: { reviewedBy?: string }
  ) {
    return this.agentService.approveAction(id, body?.reviewedBy);
  }

  @Post('approvals/:id/reject')
  rejectAction(
    @Param('id') id: string,
    @Body() body: { reviewedBy?: string }
  ) {
    return this.agentService.rejectAction(id, body?.reviewedBy);
  }

  @Post('sweep')
  runFullSwarmSweep(
    @Headers('x-tenant-id') tenantIdHeader: string
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.agentService.runFullSwarmSweep(tenantId);
  }

  @Post('daemon/toggle')
  toggleDaemon(
    @Body() body: { enabled?: boolean }
  ) {
    return this.agentService.toggleDaemon(body?.enabled);
  }

  @Post('chain')
  runCollaboration(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: { scenario?: string; targetId?: string }
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.agentService.runMultiAgentCollaboration(
      tenantId,
      body?.scenario || 'ACCOUNT_RETENTION_INTERVENTION',
      body?.targetId || 'cnt_sarah_lin'
    );
  }

  @Get('collaboration')
  getCollaborationLogs() {
    return this.agentService.getCollaborationLogs();
  }

  @Get('policy')
  getPolicy() {
    return this.agentService.getPolicy();
  }

  @Post('policy')
  updatePolicy(
    @Body() body: Partial<SafetyPolicy>
  ) {
    return this.agentService.updatePolicy(body);
  }

  @Post('decide')
  runDecisionLoop(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: { targetEntity: string; targetId: string }
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.agentService.runDecisionLoop(tenantId, body.targetEntity || 'Contact', body.targetId || 'default-target');
  }
}
