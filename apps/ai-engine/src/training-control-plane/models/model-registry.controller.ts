import { Controller, Get, Post, Body, Param, Query, BadRequestException } from '@nestjs/common';
import { ModelRegistryService } from './model-registry.service';

@Controller('training-control-plane/models')
export class ModelRegistryController {
  constructor(private readonly modelService: ModelRegistryService) {}

  @Get()
  async listModels(@Query('agentId') agentId?: string) {
    return this.modelService.listModels(agentId);
  }

  @Post()
  async registerModel(
    @Body() body: {
      modelId: string;
      baseModel: string;
      provider: string;
      version: string;
      agentId: string;
      trainingDatasetId?: string;
      evaluationDatasetId?: string;
      metricsSnapshot?: Record<string, any>;
    },
  ) {
    if (!body.modelId || !body.baseModel || !body.provider || !body.version || !body.agentId) {
      throw new BadRequestException('modelId, baseModel, provider, version, and agentId are required');
    }
    return this.modelService.registerModel(body);
  }

  @Post(':id/verify-gates')
  async verifyGates(
    @Param('id') id: string,
    @Body() body: { targetStage: 'STAGING' | 'PRODUCTION'; approvedBy?: string },
  ) {
    if (!body.targetStage) throw new BadRequestException('targetStage is required');
    return this.modelService.verifyDeploymentGates(id, body.targetStage, body.approvedBy);
  }

  @Post(':id/promote')
  async promoteModel(
    @Param('id') id: string,
    @Body() body: { targetStage: 'STAGING' | 'PRODUCTION'; approvedBy?: string },
  ) {
    if (!body.targetStage) throw new BadRequestException('targetStage is required');
    return this.modelService.promoteModel(id, body.targetStage, body.approvedBy);
  }

  @Post('rollback')
  async rollbackModel(
    @Body() body: { agentId: string; targetModelId: string; user?: string },
  ) {
    if (!body.agentId || !body.targetModelId) {
      throw new BadRequestException('agentId and targetModelId are required for rollback');
    }
    return this.modelService.rollbackModel(body.agentId, body.targetModelId, body.user || 'SUPERADMIN');
  }
}
