import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExperimentTrackerService {
  private readonly logger = new Logger(ExperimentTrackerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listExperiments(agentId?: string) {
    const list = await this.prisma.agentExperiment.findMany({
      where: agentId ? { agentId } : {},
      orderBy: { createdAt: 'desc' },
    });

    return list.map((e) => ({
      ...e,
      hyperparameters: JSON.parse(e.hyperparameters || '{}'),
      metricsSummary: JSON.parse(e.metricsSummary || '{}'),
    }));
  }

  async recordExperiment(data: {
    name: string;
    agentId: string;
    model: string;
    promptVersion: string;
    datasetId: string;
    hyperparameters?: Record<string, any>;
    metricsSummary?: Record<string, any>;
    notes?: string;
    status?: 'CANDIDATE' | 'REJECTED' | 'PROMOTED';
  }) {
    const experimentId = `exp_${data.agentId}_${Date.now()}`;
    const record = await this.prisma.agentExperiment.create({
      data: {
        experimentId,
        name: data.name,
        agentId: data.agentId,
        model: data.model,
        promptVersion: data.promptVersion,
        datasetId: data.datasetId,
        hyperparameters: JSON.stringify(data.hyperparameters || {}),
        metricsSummary: JSON.stringify(data.metricsSummary || {}),
        notes: data.notes || null,
        status: data.status || 'CANDIDATE',
      },
    });

    this.logger.log(`[Experiment Logged] ${data.name} (${experimentId}) recorded for Agent ${data.agentId}`);
    return record;
  }
}
