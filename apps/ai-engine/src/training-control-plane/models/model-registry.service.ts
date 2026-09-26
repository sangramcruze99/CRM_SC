import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AgentRegistryService } from '../registry/agent-registry.service';

export interface DeploymentGateCheckResult {
  canPromote: boolean;
  targetStage: 'STAGING' | 'PRODUCTION';
  gateChecks: {
    evaluationPassed: boolean;
    regressionPassed: boolean;
    safetyChecksPassed: boolean;
    toolTestsPassed: boolean;
    humanApprovalPresent: boolean;
  };
  reasons: string[];
}

@Injectable()
export class ModelRegistryService implements OnModuleInit {
  private readonly logger = new Logger(ModelRegistryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly registryService: AgentRegistryService,
  ) {}

  async onModuleInit() {
    await this.seedBaselineModels().catch((err) =>
      this.logger.warn(`Could not seed baseline models: ${err.message}`),
    );
  }

  async seedBaselineModels(): Promise<void> {
    const baselineModels = [
      {
        modelId: 'ares-groq-v1.2',
        baseModel: 'groq/compound',
        provider: 'groq',
        version: '1.2.0',
        agentId: 'ares',
        status: 'PRODUCTION',
        approvedBy: 'SYSTEM_ADMIN',
        deploymentStatus: 'ACTIVE',
      },
      {
        modelId: 'midas-gemma-v1.4',
        baseModel: 'ollama/gemma4:e4b',
        provider: 'ollama',
        version: '1.4.0',
        agentId: 'midas',
        status: 'PRODUCTION',
        approvedBy: 'CHIEF_FINANCIAL_OFFICER',
        deploymentStatus: 'ACTIVE',
      },
      {
        modelId: 'recruitment-gemma-v1.3',
        baseModel: 'ollama/gemma4:e4b',
        provider: 'ollama',
        version: '1.3.0',
        agentId: 'recruitment',
        status: 'PRODUCTION',
        approvedBy: 'HEAD_OF_PEOPLE',
        deploymentStatus: 'ACTIVE',
      },
      {
        modelId: 'athena-groq-v1.1',
        baseModel: 'groq/compound',
        provider: 'groq',
        version: '1.1.0',
        agentId: 'athena',
        status: 'PRODUCTION',
        approvedBy: 'SYSTEM_ADMIN',
        deploymentStatus: 'ACTIVE',
      },
      {
        modelId: 'hermes-groq-v1.0',
        baseModel: 'groq/compound',
        provider: 'groq',
        version: '1.0.0',
        agentId: 'hermes',
        status: 'PRODUCTION',
        approvedBy: 'SYSTEM_ADMIN',
        deploymentStatus: 'ACTIVE',
      },
    ];

    for (const m of baselineModels) {
      await this.prisma.modelRegistry.upsert({
        where: { modelId: m.modelId },
        update: {
          status: m.status,
          deploymentStatus: m.deploymentStatus,
        },
        create: {
          modelId: m.modelId,
          baseModel: m.baseModel,
          provider: m.provider,
          version: m.version,
          agentId: m.agentId,
          status: m.status,
          approvedBy: m.approvedBy,
          approvedAt: new Date(),
          deploymentStatus: m.deploymentStatus,
          metricsSnapshot: JSON.stringify({ accuracy: 0.94, latencyMs: 850 }),
        },
      });
    }

    this.logger.log(`Seeded baseline models into Model Registry.`);
  }

  async listModels(agentId?: string) {
    return this.prisma.modelRegistry.findMany({
      where: agentId ? { agentId } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async registerModel(data: {
    modelId: string;
    baseModel: string;
    provider: string;
    version: string;
    agentId: string;
    trainingDatasetId?: string;
    evaluationDatasetId?: string;
    metricsSnapshot?: Record<string, any>;
  }) {
    return this.prisma.modelRegistry.create({
      data: {
        modelId: data.modelId,
        baseModel: data.baseModel,
        provider: data.provider,
        version: data.version,
        agentId: data.agentId,
        trainingDatasetId: data.trainingDatasetId || null,
        evaluationDatasetId: data.evaluationDatasetId || null,
        metricsSnapshot: JSON.stringify(data.metricsSnapshot || {}),
        status: 'EXPERIMENTAL',
        deploymentStatus: 'IDLE',
      },
    });
  }

  /**
   * Evaluates deployment gates for promoting a model to STAGING or PRODUCTION.
   * A model cannot become production automatically.
   */
  async verifyDeploymentGates(
    modelId: string,
    targetStage: 'STAGING' | 'PRODUCTION',
    approvedBy?: string,
  ): Promise<DeploymentGateCheckResult> {
    const model = await this.prisma.modelRegistry.findUnique({
      where: { modelId },
    });

    if (!model) throw new Error(`Model '${modelId}' not found.`);

    // 1. Check evaluation runs for this agent & version
    const latestEval = await this.prisma.agentEvaluationRun.findFirst({
      where: { agentId: model.agentId, agentVersion: model.version },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Check regression test run
    const latestRegression = await this.prisma.agentRegressionRun.findFirst({
      where: { agentId: model.agentId, candidateVersion: model.version },
      orderBy: { executedAt: 'desc' },
    });

    const reasons: string[] = [];

    const evaluationPassed = !!latestEval && latestEval.passedOverall && latestEval.taskCorrectness >= 0.85;
    if (!evaluationPassed) {
      reasons.push(
        latestEval
          ? `Evaluation correctness (${latestEval.taskCorrectness}) did not meet the gate threshold, or evaluation failed.`
          : 'No completed evaluation run found for this model version.',
      );
    }

    const regressionPassed = targetStage === 'STAGING' || (!!latestRegression && latestRegression.isApproved);
    if (!regressionPassed && targetStage === 'PRODUCTION') {
      reasons.push('No passing regression run found comparing candidate against baseline production version.');
    }

    const safetyChecksPassed = !latestEval || (latestEval.safetyScore >= 0.95 && latestEval.hallucinationRate <= 0.05);
    if (!safetyChecksPassed) {
      reasons.push(`Safety score (${latestEval?.safetyScore}) or hallucination rate (${latestEval?.hallucinationRate}) violated safety limits.`);
    }

    const toolTestsPassed = !latestEval || latestEval.toolSelectionScore >= 0.90;
    if (!toolTestsPassed) {
      reasons.push(`Tool accuracy score (${latestEval?.toolSelectionScore}) below required 0.90 threshold.`);
    }

    const humanApprovalPresent = targetStage === 'STAGING' || !!approvedBy;
    if (!humanApprovalPresent && targetStage === 'PRODUCTION') {
      reasons.push('Production promotion requires explicit human approver identifier.');
    }

    const canPromote =
      evaluationPassed &&
      regressionPassed &&
      safetyChecksPassed &&
      toolTestsPassed &&
      humanApprovalPresent;

    return {
      canPromote,
      targetStage,
      gateChecks: {
        evaluationPassed,
        regressionPassed,
        safetyChecksPassed,
        toolTestsPassed,
        humanApprovalPresent,
      },
      reasons,
    };
  }

  /**
   * Promotes a model through deployment gates:
   * EXPERIMENTAL -> EVALUATED -> STAGING -> PRODUCTION
   */
  async promoteModel(
    modelId: string,
    targetStage: 'STAGING' | 'PRODUCTION',
    approvedBy?: string,
  ) {
    const gateResult = await this.verifyDeploymentGates(modelId, targetStage, approvedBy);

    if (!gateResult.canPromote) {
      throw new Error(
        `Deployment Gate Violation for target stage '${targetStage}': ${gateResult.reasons.join(' | ')}`,
      );
    }

    // Update current active model to RETIRED if promoting to PRODUCTION
    const model = await this.prisma.modelRegistry.findUnique({
      where: { modelId },
    });
    if (!model) throw new Error(`Model '${modelId}' not found.`);

    if (targetStage === 'PRODUCTION') {
      await this.prisma.modelRegistry.updateMany({
        where: { agentId: model.agentId, status: 'PRODUCTION' },
        data: { status: 'RETIRED', deploymentStatus: 'IDLE' },
      });

      // Update Central Agent Registry to point to this new model & version
      await this.prisma.agentRegistryEntry.update({
        where: { agentId: model.agentId },
        data: {
          model: model.baseModel,
          modelProvider: model.provider,
          version: model.version,
          lifecycleStage: 'PRODUCTION',
        },
      });
    }

    const updated = await this.prisma.modelRegistry.update({
      where: { modelId },
      data: {
        status: targetStage,
        deploymentStatus: 'ACTIVE',
        approvedBy: approvedBy || 'SYSTEM_GATES',
        approvedAt: new Date(),
      },
    });

    this.logger.log(`[Deployment Gate Passed] Model '${modelId}' successfully promoted to '${targetStage}' by '${approvedBy || 'SYSTEM'}'.`);

    return {
      success: true,
      modelId,
      status: updated.status,
      deploymentStatus: updated.deploymentStatus,
      promotedAt: updated.approvedAt,
    };
  }

  /**
   * Instantly rollback model to the previous approved or baseline version.
   */
  async rollbackModel(agentId: string, targetModelId: string, user: string = 'SUPERADMIN') {
    const targetModel = await this.prisma.modelRegistry.findUnique({
      where: { modelId: targetModelId },
    });

    if (!targetModel || targetModel.agentId !== agentId) {
      throw new Error(`Target rollback model '${targetModelId}' not found for agent '${agentId}'.`);
    }

    // Deactivate current active models
    await this.prisma.modelRegistry.updateMany({
      where: { agentId, status: 'PRODUCTION' },
      data: { status: 'RETIRED', deploymentStatus: 'ROLLED_BACK' },
    });

    // Activate rollback model
    await this.prisma.modelRegistry.update({
      where: { modelId: targetModelId },
      data: {
        status: 'PRODUCTION',
        deploymentStatus: 'ACTIVE',
        approvedBy: user,
        approvedAt: new Date(),
      },
    });

    // Sync Agent Registry
    await this.prisma.agentRegistryEntry.update({
      where: { agentId },
      data: {
        model: targetModel.baseModel,
        modelProvider: targetModel.provider,
        version: targetModel.version,
      },
    });

    this.logger.log(`[Model Rollback] Agent '${agentId}' model successfully rolled back to '${targetModelId}' by '${user}'.`);

    return {
      success: true,
      agentId,
      activeModelId: targetModelId,
      rolledBackAt: new Date().toISOString(),
    };
  }
}
