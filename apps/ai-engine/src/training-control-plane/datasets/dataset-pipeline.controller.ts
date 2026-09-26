import { Controller, Get, Post, Body, Param, Query, BadRequestException } from '@nestjs/common';
import { DatasetPipelineService, StructuredExampleInput } from './dataset-pipeline.service';

@Controller('training-control-plane/datasets')
export class DatasetPipelineController {
  constructor(private readonly datasetService: DatasetPipelineService) {}

  @Get()
  async listDatasets(
    @Query('agentId') agentId?: string,
    @Query('purpose') purpose?: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.datasetService.listDatasets(agentId, purpose, tenantId);
  }

  @Get(':id')
  async getDataset(
    @Param('id') id: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.datasetService.getDataset(id, tenantId);
  }

  @Post()
  async createDataset(
    @Body() body: {
      datasetId: string;
      agentId: string;
      name: string;
      version: string;
      purpose: 'TRAINING' | 'VALIDATION' | 'EVALUATION' | 'REGRESSION' | 'SAFETY' | 'TOOL_USAGE' | 'EDGE_CASE';
      tenantId?: string;
      examples?: StructuredExampleInput[];
    },
  ) {
    if (!body.datasetId || !body.agentId || !body.name || !body.purpose) {
      throw new BadRequestException('datasetId, agentId, name, and purpose are required.');
    }
    return this.datasetService.createDataset(body);
  }

  @Post(':id/examples')
  async ingestExamples(
    @Param('id') id: string,
    @Body() body: { examples: StructuredExampleInput[] },
  ) {
    if (!body.examples || !Array.isArray(body.examples)) {
      throw new BadRequestException('examples must be a non-empty array.');
    }
    return this.datasetService.ingestExamples(id, body.examples);
  }

  @Post('sanitize-preview')
  async sanitizePreview(@Body() body: { text: string }) {
    if (!body.text) throw new BadRequestException('text is required.');
    return this.datasetService.sanitizeText(body.text);
  }
}
