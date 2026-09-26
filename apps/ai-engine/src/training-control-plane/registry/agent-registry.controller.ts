import { Controller, Get, Post, Body, Param, Query, BadRequestException } from '@nestjs/common';
import { AgentRegistryService } from './agent-registry.service';

@Controller('training-control-plane/agents')
export class AgentRegistryController {
  constructor(private readonly registryService: AgentRegistryService) {}

  @Get()
  async listAgents() {
    return this.registryService.listAgents();
  }

  @Get(':id')
  async getAgent(@Param('id') id: string) {
    return this.registryService.getAgent(id);
  }

  @Post(':id/versions')
  async createVersion(
    @Param('id') id: string,
    @Body() body: {
      version: string;
      changelog: string;
      systemInstructions?: string;
      businessRules?: string[];
      allowedTools?: string[];
      model?: string;
      modelProvider?: string;
    },
  ) {
    if (!body.version || !body.changelog) {
      throw new BadRequestException('version and changelog are required');
    }
    return this.registryService.createAgentVersion(id, body);
  }

  @Post(':id/rollback')
  async rollback(
    @Param('id') id: string,
    @Body() body: { targetVersion: string; user?: string },
  ) {
    if (!body.targetVersion) {
      throw new BadRequestException('targetVersion is required for rollback');
    }
    return this.registryService.rollbackToVersion(id, body.targetVersion, body.user || 'SUPERADMIN');
  }
}
