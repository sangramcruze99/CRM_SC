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
import { KnowledgeModule } from '../knowledge/knowledge.module';

// Stage 2 Production Agent Subsystems
import { AgentOrchestratorService } from './orchestrator/agent-orchestrator.service';
import { OrchestratorController } from './orchestrator/orchestrator.controller';
import { AgentContextEngineService } from './context/agent-context-engine.service';
import { AgentPolicyEngineService } from './policy/agent-policy-engine.service';
import { AgentMemoryGovernanceService } from './memory/agent-memory-governance.service';
import { AgentPlanService } from './plans/agent-plan.service';

@Module({
  imports: [PrismaModule, PromptsModule, KnowledgeModule],
  controllers: [
    AgentFrameworkController,
    AgentBuilderController,
    OrchestratorController,
  ],
  providers: [
    AgentFrameworkService,
    AgentToolRegistryService,
    AgentMemoryService,
    AgentRuntimeService,
    AgentOrchestratorService,
    AgentContextEngineService,
    AgentPolicyEngineService,
    AgentMemoryGovernanceService,
    AgentPlanService,
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
    AgentOrchestratorService,
    AgentContextEngineService,
    AgentPolicyEngineService,
    AgentMemoryGovernanceService,
    AgentPlanService,
    SalesOutboundAgentService,
    ContentOptimizationAgentService,
    RecruitmentAgentService,
    EcommerceAgentService,
  ],
})
export class AgentsModule {}

