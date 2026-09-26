import { Controller, Get, Post, Body, Param, Query, BadRequestException } from '@nestjs/common';
import { AgentFeedbackService, SubmitFeedbackDto } from './agent-feedback.service';

@Controller('training-control-plane/feedback')
export class AgentFeedbackController {
  constructor(private readonly feedbackService: AgentFeedbackService) {}

  @Post()
  async submitFeedback(@Body() dto: SubmitFeedbackDto) {
    if (!dto.executionId || !dto.agentId || !dto.userRating || !dto.tenantId) {
      throw new BadRequestException('tenantId, executionId, agentId, and userRating are required.');
    }
    return this.feedbackService.submitFeedback(dto);
  }

  @Get()
  async listFeedback(
    @Query('tenantId') tenantId?: string,
    @Query('agentId') agentId?: string,
    @Query('candidateOnly') candidateOnly?: string,
  ) {
    return this.feedbackService.listFeedback(tenantId, agentId, candidateOnly === 'true');
  }

  @Post(':id/promote-to-dataset')
  async promoteToDataset(
    @Param('id') id: string,
    @Body() body: { targetDatasetId: string; reviewedBy: string },
  ) {
    if (!body.targetDatasetId || !body.reviewedBy) {
      throw new BadRequestException('targetDatasetId and reviewedBy are required.');
    }
    return this.feedbackService.promoteFeedbackToDataset({
      feedbackId: id,
      targetDatasetId: body.targetDatasetId,
      reviewedBy: body.reviewedBy,
    });
  }
}
