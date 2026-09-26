import { Controller, Get, Post, Body, Query, BadRequestException } from '@nestjs/common';
import { EvaluationEngineService } from './evaluation-engine.service';

@Controller('training-control-plane/evaluations')
export class EvaluationEngineController {
  constructor(private readonly evalService: EvaluationEngineService) {}

  @Post('run')
  async runEvaluation(
    @Body() body: {
      agentId: string;
      agentVersion?: string;
      datasetId?: string;
      model?: string;
      tenantId?: string;
    },
  ) {
    if (!body.agentId) throw new BadRequestException('agentId is required');
    return this.evalService.runEvaluation(body);
  }

  @Post('regression')
  async runRegressionTest(
    @Body() body: {
      agentId: string;
      baselineVersion: string;
      candidateVersion: string;
      datasetId?: string;
    },
  ) {
    if (!body.agentId || !body.baselineVersion || !body.candidateVersion) {
      throw new BadRequestException('agentId, baselineVersion, and candidateVersion are required');
    }
    return this.evalService.runRegressionTest(body);
  }

  @Get('runs')
  async listRuns(@Query('agentId') agentId?: string, @Query('take') take?: string) {
    return this.evalService.listEvaluationRuns(agentId, take ? parseInt(take, 10) : 20);
  }

  @Get('golden-scenarios')
  async listGoldenScenarios(@Query('agentId') agentId?: string) {
    return this.evalService.listGoldenScenarios(agentId);
  }
}
