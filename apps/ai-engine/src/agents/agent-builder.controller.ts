import { Controller, Get, Post, Patch, Param, Body, Headers, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AgentRuntimeService } from './agent-runtime.service';
import { AgentToolRegistryService } from './agent-tool-registry.service';
import { AgentMemoryService } from './agent-memory.service';
import { SalesOutboundAgentService } from './specialized/sales-outbound-agent.service';
import { ContentOptimizationAgentService } from './specialized/content-optimization-agent.service';
import { RecruitmentAgentService } from './specialized/recruitment-agent.service';
import { EcommerceAgentService } from './specialized/ecommerce-agent.service';

@Controller('agents')
export class AgentBuilderController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly runtime: AgentRuntimeService,
    private readonly toolRegistry: AgentToolRegistryService,
    private readonly memoryService: AgentMemoryService,
    private readonly salesAgent: SalesOutboundAgentService,
    private readonly contentAgent: ContentOptimizationAgentService,
    private readonly recruitmentAgent: RecruitmentAgentService,
    private readonly ecomAgent: EcommerceAgentService,
  ) {}

  private getTenant(tenantIdHeader?: string) {
    return tenantIdHeader || 'default-tenant';
  }

  @Get()
  async getAgents(@Headers('x-tenant-id') tenantIdHeader: string) {
    const tenantId = this.getTenant(tenantIdHeader);
    let list = await this.prisma.agent.findMany({
      where: { tenantId },
      include: {
        _count: { select: { executions: true, memories: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (list.length === 0) {
      // Seed default agents for tenant
      const defaultAgent = await this.prisma.agent.create({
        data: {
          tenantId,
          name: 'Ares Autonomous Sales Sentinel',
          role: 'Enterprise Account Executive & Closer',
          domain: 'Sales & Growth',
          model: 'groq/compound',
          systemPrompt: 'You are Ares, the autonomous AI Sales Sentinel for Business OS. You qualify leads and execute sales tools.',
          autonomyMode: 'AUTONOMOUS',
          allowedTools: JSON.stringify(['search_crm_contacts', 'create_crm_deal', 'send_email', 'book_calendar']),
        },
        include: {
          _count: { select: { executions: true, memories: true } },
        },
      });
      list = [defaultAgent];
    }

    return list.map((a) => ({
      ...a,
      allowedTools: a.allowedTools ? JSON.parse(a.allowedTools) : [],
    }));
  }

  @Get('tools/catalog')
  getToolsCatalog() {
    return this.toolRegistry.getTools();
  }

  @Get(':id')
  async getAgentById(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
  ) {
    const tenantId = this.getTenant(tenantIdHeader);
    const agent = await this.prisma.agent.findFirst({
      where: { id, tenantId },
      include: {
        memories: { take: 10, orderBy: { updatedAt: 'desc' } },
        executions: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!agent) throw new Error('Agent not found');

    return {
      ...agent,
      allowedTools: agent.allowedTools ? JSON.parse(agent.allowedTools) : [],
    };
  }

  @Post()
  async createAgent(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: any,
  ) {
    const tenantId = this.getTenant(tenantIdHeader);
    return this.prisma.agent.create({
      data: {
        tenantId,
        name: body.name || 'New Sentinel Agent',
        role: body.role || 'Workflow Operator',
        domain: body.domain || 'Operations',
        model: body.model || 'groq/compound',
        systemPrompt: body.systemPrompt || 'You are an autonomous agent.',
        temperature: body.temperature ?? 0.7,
        maxIterations: body.maxIterations ?? 8,
        tokenBudget: body.tokenBudget ?? 100000,
        autonomyMode: body.autonomyMode || 'HYBRID',
        allowedTools: JSON.stringify(body.allowedTools || []),
      },
    });
  }

  @Patch(':id')
  async updateAgent(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const tenantId = this.getTenant(tenantIdHeader);
    return this.prisma.agent.update({
      where: { id },
      data: {
        name: body.name,
        role: body.role,
        domain: body.domain,
        model: body.model,
        systemPrompt: body.systemPrompt,
        temperature: body.temperature,
        maxIterations: body.maxIterations,
        autonomyMode: body.autonomyMode,
        status: body.status,
        allowedTools: body.allowedTools ? JSON.stringify(body.allowedTools) : undefined,
      },
    });
  }

  @Post(':id/run')
  runAgent(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
    @Body() body: { inputPrompt: string; targetEntity?: string; targetId?: string },
  ) {
    return this.runtime.runAgent({
      agentId: id,
      tenantId: this.getTenant(tenantIdHeader),
      inputPrompt: body.inputPrompt || 'Execute autonomous task sweep',
      targetEntity: body.targetEntity,
      targetId: body.targetId,
    });
  }

  @Get(':id/memories')
  getMemories(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
    @Query('type') type?: string,
  ) {
    return this.memoryService.getMemories(this.getTenant(tenantIdHeader), id, type);
  }

  @Post(':id/memories')
  storeMemory(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
    @Body() body: { memoryType: any; key: string; value: string; confidence?: number },
  ) {
    return this.memoryService.storeMemory(this.getTenant(tenantIdHeader), {
      agentId: id,
      memoryType: body.memoryType || 'LONG_TERM',
      key: body.key,
      value: body.value,
      confidence: body.confidence,
    });
  }

  @Get(':id/executions')
  getExecutions(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Param('id') id: string,
  ) {
    return this.prisma.agentExecution.findMany({
      where: { agentId: id, tenantId: this.getTenant(tenantIdHeader) },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  // --- Specialized Agents Triggers ---
  @Post('specialized/sales/prospect')
  runSalesProspecting(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: any,
  ) {
    return this.salesAgent.processProspect(this.getTenant(tenantIdHeader), body);
  }

  @Post('specialized/content/learn')
  ingestContentAnalytics(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: { agentId: string; analytics: any },
  ) {
    return this.contentAgent.ingestAnalyticsAndLearn(
      this.getTenant(tenantIdHeader),
      body.agentId,
      body.analytics,
    );
  }

  @Post('specialized/content/generate')
  generateContentLoop(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: { agentId: string; theme: string },
  ) {
    return this.contentAgent.generateAutonomousNextContent(
      this.getTenant(tenantIdHeader),
      body.agentId,
      body.theme || 'Modern Business OS Automation',
    );
  }

  @Post('specialized/recruitment/screen')
  screenCandidate(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: any,
  ) {
    return this.recruitmentAgent.processCandidate(this.getTenant(tenantIdHeader), body);
  }

  @Post('specialized/ecommerce/order')
  processEcommerceOrder(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: any,
  ) {
    return this.ecomAgent.processOrder(this.getTenant(tenantIdHeader), body);
  }
}
