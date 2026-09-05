import { Module } from '@nestjs/common';
import { AgentFrameworkService } from './agent-framework.service';
import { AgentFrameworkController } from './agent-framework.controller';
import { AgentToolRegistryService } from './agent-tool-registry.service';
import { AgentMemoryService } from './agent-memory.service';
import { AgentRuntimeService } from './agent-runtime.service';
import { AgentBuilderController } from './agent-builder.controller';
import { SalesOutboundAgentService } from './specialized/sales-outbound-agent.service';
import { ContentOptimizationAgentService } from './specialized/content-optimization-agent.service';
import { RecruitmentAgentService } from './specialized/recruitment-agent.service';
import { EcommerceAgentService } from './specialized/ecommerce-agent.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PromptsModule } from '../prompts/prompts.module';

@Module({
  imports: [PrismaModule, PromptsModule],
  controllers: [AgentFrameworkController, AgentBuilderController],
  providers: [
    AgentFrameworkService,
    AgentToolRegistryService,
    AgentMemoryService,
    AgentRuntimeService,
    SalesOutboundAgentService,
    ContentOptimizationAgentService,
    RecruitmentAgentService,
    EcommerceAgentService,
  ],
  exports: [
    AgentFrameworkService,
    AgentToolRegistryService,
    AgentMemoryService,
    AgentRuntimeService,
    SalesOutboundAgentService,
    ContentOptimizationAgentService,
    RecruitmentAgentService,
    EcommerceAgentService,
  ],
})
export class AgentsModule {}
