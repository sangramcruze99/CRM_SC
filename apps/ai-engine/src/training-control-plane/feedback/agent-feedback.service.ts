import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DatasetPipelineService } from '../datasets/dataset-pipeline.service';

export interface SubmitFeedbackDto {
  tenantId: string;
  executionId: string;
  agentId: string;
  userRating: 'CORRECT' | 'INCORRECT' | 'NEEDS_CORRECTION';
  errorCategory?: 'AMOUNT' | 'VENDOR' | 'DATE' | 'PAYMENT_STATUS' | 'WRONG_TOOL' | 'MISSING_INFO' | 'BAD_RECOMMENDATION' | 'BAD_EXTRACTION' | 'OTHER';
  correctionValue?: string;
  userNotes?: string;
  submittedBy?: string;
}

@Injectable()
export class AgentFeedbackService {
  private readonly logger = new Logger(AgentFeedbackService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly datasetService: DatasetPipelineService,
  ) {}

  async submitFeedback(dto: SubmitFeedbackDto) {
    const feedback = await this.prisma.agentResultFeedback.create({
      data: {
        tenantId: dto.tenantId,
        executionId: dto.executionId,
        agentId: dto.agentId,
        userRating: dto.userRating,
        errorCategory: dto.errorCategory || null,
        correctionValue: dto.correctionValue || null,
        userNotes: dto.userNotes || null,
        submittedBy: dto.submittedBy || 'AUTHORIZED_USER',
        isCandidateForDataset: dto.userRating !== 'CORRECT', // Candidates for improvement
        isSanitized: false,
      },
    });

    this.logger.log(
      `[Agent Result Feedback] Recorded ${dto.userRating} feedback for Agent '${dto.agentId}' on Execution '${dto.executionId}' (Tenant: ${dto.tenantId})`,
    );

    return feedback;
  }

  async listFeedback(tenantId?: string, agentId?: string, candidateOnly?: boolean) {
    return this.prisma.agentResultFeedback.findMany({
      where: {
        ...(tenantId ? { tenantId } : {}),
        ...(agentId ? { agentId } : {}),
        ...(candidateOnly ? { isCandidateForDataset: true } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  /**
   * Promotes a verified, human-reviewed feedback item into a structured dataset example.
   * Enforces sanitization before the item can be added to any training/evaluation dataset.
   */
  async promoteFeedbackToDataset(params: {
    feedbackId: string;
    targetDatasetId: string;
    reviewedBy: string;
  }) {
    const feedback = await this.prisma.agentResultFeedback.findUnique({
      where: { id: params.feedbackId },
    });

    if (!feedback) throw new Error(`Feedback with ID '${params.feedbackId}' not found.`);

    // Find original execution record if available to get the input and context
    const execution = await this.prisma.agentExecution.findUnique({
      where: { id: feedback.executionId },
    }).catch(() => null);

    const inputPrompt = execution?.inputPrompt || `Execution ${feedback.executionId} task`;
    const sanitizedInput = this.datasetService.sanitizeText(inputPrompt).cleaned;
    const sanitizedCorrection = this.datasetService.sanitizeText(feedback.correctionValue || '').cleaned;

    // Create candidate dataset example
    const example = await this.prisma.datasetExample.create({
      data: {
        datasetId: params.targetDatasetId,
        exampleId: `ex-feedback-${feedback.id.slice(-6)}`,
        agentId: feedback.agentId,
        input: sanitizedInput,
        context: JSON.stringify({ originExecutionId: feedback.executionId, originalTenant: 'ANONYMIZED' }),
        expectedBehavior: JSON.stringify({
          errorCorrected: feedback.errorCategory,
          userNote: feedback.userNotes,
        }),
        expectedToolCalls: '[]',
        expectedResult: JSON.stringify({
          correctedValue: sanitizedCorrection,
          sourceRating: feedback.userRating,
        }),
        riskLevel: (feedback.errorCategory === 'AMOUNT' || feedback.errorCategory === 'PAYMENT_STATUS') ? 'HIGH' : 'MEDIUM',
        tags: JSON.stringify(['human_feedback', feedback.errorCategory?.toLowerCase() || 'correction']),
        isEdgeCase: true,
      },
    });

    // Mark feedback as sanitized and promoted
    await this.prisma.agentResultFeedback.update({
      where: { id: params.feedbackId },
      data: {
        isSanitized: true,
        promotedToDatasetId: params.targetDatasetId,
      },
    });

    // Increment dataset sample count
    await this.prisma.agentDataset.update({
      where: { datasetId: params.targetDatasetId },
      data: { sampleCount: { increment: 1 } },
    });

    this.logger.log(`[Feedback Promoted] Feedback '${params.feedbackId}' promoted to Dataset '${params.targetDatasetId}' by '${params.reviewedBy}'.`);

    return {
      success: true,
      exampleId: example.exampleId,
      datasetId: params.targetDatasetId,
      promotedAt: new Date().toISOString(),
    };
  }
}
