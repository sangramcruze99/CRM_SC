import { Controller, Get, Post, Body, Query, BadRequestException } from '@nestjs/common';
import { ExperimentTrackerService } from './experiment-tracker.service';

@Controller('training-control-plane/experiments')
export class ExperimentTrackerController {
  constructor(private readonly experimentService: ExperimentTrackerService) {}

  @Get()
  async listExperiments(@Query('agentId') agentId?: string) {
    return this.experimentService.listExperiments(agentId);
  }

  @Post()
  async recordExperiment(
    @Body() body: {
      name: string;
      agentId: string;
      model: string;
      promptVersion: string;
      datasetId: string;
      hyperparameters?: Record<string, any>;
      metricsSummary?: Record<string, any>;
      notes?: string;
      status?: 'CANDIDATE' | 'REJECTED' | 'PROMOTED';
    },
  ) {
    if (!body.name || !body.agentId || !body.model || !body.datasetId) {
      throw new BadRequestException('name, agentId, model, and datasetId are required.');
    }
    return this.experimentService.recordExperiment(body);
  }
}
