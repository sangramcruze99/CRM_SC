import { Controller, Get, Post, Param, Body, Headers, Query, NotFoundException } from '@nestjs/common';
import { AgentFrameworkService, SafetyPolicy } from './agent-framework.service';
import { PrismaService } from '../prisma/prisma.service';
import { AgentToolRegistryService } from './agent-tool-registry.service';

@Controller('agents')
export class AgentFrameworkController {
  constructor(
    private readonly agentService: AgentFrameworkService,
    private readonly prisma: PrismaService,
    private readonly toolRegistry: AgentToolRegistryService,
  ) {}

  @Get()
  getAgents() {
    return this.agentService.getAgents();
  }

  @Get('telemetry')
  getTelemetry() {
    return this.agentService.getTelemetry();
  }

  @Get('approvals')
  async getApprovals(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Query('status') status?: string
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';

    try {
      const dbApprovals = await this.prisma.approvalRequest.findMany({
        where: {
          tenantId,
          ...(status ? { status } : { status: 'PENDING' }),
        },
        include: { agent: true },
        orderBy: { requestedAt: 'desc' },
      });

      if (dbApprovals.length > 0) {
        return dbApprovals.map((appr) => {
          let parsedPayload: any = {};
          try {
            parsedPayload = JSON.parse(appr.payload || '{}');
          } catch {}

          return {
            id: appr.id,
            agentId: appr.agentId || 'agent_sales',
            agentName: appr.agent?.name || 'Ares Sales Intelligence Sentinel',
            actionType: appr.actionType,
            targetEntity: appr.targetEntity || 'Target Entity',
            targetId: appr.targetId || 'active',
            target: `${appr.targetEntity || 'Entity'}: ${appr.targetId}`,
            riskLevel: appr.riskLevel,
            status: appr.status,
            reason: appr.reason,
            payload: parsedPayload,
            createdAt: appr.requestedAt.toISOString(),
            expiresAt: appr.expiresAt?.toISOString() || new Date(Date.now() + 86400000).toISOString(),
          };
        });
      }
    } catch {
      // safe fallback
    }

    return this.agentService.getApprovals();
  }

  @Get('approvals/:id/inspect')
  async inspectApproval(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';

    let item: any = null;
    try {
      item = await this.prisma.approvalRequest.findFirst({
        where: { id, tenantId },
        include: { agent: true },
      });
    } catch {}

    if (!item) {
      const memoryItem = this.agentService.getApprovals().find((a) => a.id === id);
      if (memoryItem) {
        return {
          id: memoryItem.id,
          agent: memoryItem.agentName,
          model: 'groq/llama-3.3-70b-versatile',
          trigger: 'Autonomous Pipeline Velocity Scan',
          action: memoryItem.actionType,
          risk: memoryItem.riskLevel,
          confidence: memoryItem.confidence || 0.94,
          why: [
            memoryItem.rationale || 'High-value opportunity exceeds automated threshold',
            'No communication detected in 9+ days',
            'Proposal awaiting executive sign-off',
          ],
          reasonCodes: [`RISK_${memoryItem.riskLevel}`, 'REQUIRES_HUMAN_OVERSIGHT'],
          expectedOutcome: 'Outbound proposal followup drafted and queued for client transmission.',
          knowledgeUsed: ['Enterprise SaaS Pricing Matrix', 'Standard Customer SLA Terms'],
          toolsRequested: [{ tool: memoryItem.actionType, parameters: memoryItem.parameters }],
          contextSummary: `Target: ${memoryItem.targetName} (${memoryItem.targetEntity})`,
        };
      }
      throw new NotFoundException(`Approval request ${id} not found`);
    }

    let payloadData: any = {};
    try {
      payloadData = JSON.parse(item.payload || '{}');
    } catch {}

    const explainability = payloadData.explainability || {};

    return {
      id: item.id,
      agent: item.agent?.name || 'Autonomous Agent',
      model: item.agent?.model || 'groq/llama-3.3-70b-versatile',
      trigger: payloadData.contextSummary || `${item.actionType} triggered by Business OS`,
      action: item.actionType,
      risk: item.riskLevel,
      confidence: explainability.confidence || 0.94,
      why: explainability.why || [item.reason],
      reasonCodes: explainability.reasonCodes || [`RISK_${item.riskLevel}`, 'REQUIRES_HUMAN_OVERSIGHT'],
      expectedOutcome: explainability.expectedOutcome || 'Action will execute securely upon approval.',
      knowledgeUsed: ['Company Sales Playbook & Pricing Guidelines', 'Compliance Rules & SLA Framework'],
      toolsRequested: [{ tool: item.actionType, parameters: payloadData.parameters || {} }],
      contextSummary: payloadData.contextSummary || `${item.targetEntity}: ${item.targetId}`,
    };
  }

  @Post('approvals/:id/approve')
  async approveAction(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
    @Body() body: { reviewedBy?: string }
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';
    const reviewer = body?.reviewedBy || 'Executive Admin';

    try {
      const appr = await this.prisma.approvalRequest.findFirst({
        where: { id, tenantId },
      });

      if (appr) {
        let payloadData: any = {};
        try {
          payloadData = JSON.parse(appr.payload || '{}');
        } catch {}

        // Execute the approved tool
        let executionResult: any = { executed: true };
        if (appr.actionType) {
          executionResult = await this.toolRegistry.executeTool(
            tenantId,
            appr.actionType,
            payloadData.parameters || {}
          );
        }

        const updated = await this.prisma.approvalRequest.update({
          where: { id: appr.id },
          data: {
            status: 'APPROVED',
            reviewedBy: reviewer,
            reviewedAt: new Date(),
            executionResult: JSON.stringify(executionResult),
          },
        });

        return {
          success: true,
          status: 'APPROVED',
          id: updated.id,
          executionResult,
        };
      }
    } catch {
      // fallback to in-memory
    }

    return this.agentService.approveAction(id, reviewer);
  }

  @Post('approvals/:id/reject')
  async rejectAction(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
    @Body() body: { reviewedBy?: string; reason?: string }
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';
    const reviewer = body?.reviewedBy || 'Executive Admin';

    try {
      const appr = await this.prisma.approvalRequest.findFirst({
        where: { id, tenantId },
      });

      if (appr) {
        const updated = await this.prisma.approvalRequest.update({
          where: { id: appr.id },
          data: {
            status: 'REJECTED',
            reviewedBy: reviewer,
            reviewedAt: new Date(),
            comments: body?.reason || 'Rejected by operator',
          },
        });

        return {
          success: true,
          status: 'REJECTED',
          id: updated.id,
        };
      }
    } catch {
      // fallback
    }

    return this.agentService.rejectAction(id, reviewer);
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
    @Body() body: { targetEntity: string; targetId: string; scenario?: string; parameters?: Record<string, any> }
  ) {
    const tenantId = tenantIdHeader || 'default-tenant';
    return this.agentService.runDecisionLoop(
      tenantId,
      body.targetEntity || 'Contact',
      body.targetId || 'default-target',
      body.scenario,
      body.parameters,
    );
  }
}
