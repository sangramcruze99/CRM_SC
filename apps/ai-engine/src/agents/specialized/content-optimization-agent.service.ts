import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PromptsService } from '../../prompts/prompts.service';
import { AgentMemoryService } from '../agent-memory.service';

export interface ContentStrategyFeedback {
  postTitle: string;
  channel: string;
  impressions: number;
  clickThroughRate: number;
  conversions: number;
}

@Injectable()
export class ContentOptimizationAgentService {
  private readonly logger = new Logger(ContentOptimizationAgentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly promptsService: PromptsService,
    private readonly memoryService: AgentMemoryService,
  ) {}

  async ingestAnalyticsAndLearn(tenantId: string, agentId: string, analytics: ContentStrategyFeedback) {
    this.logger.log(`Ingesting content analytics for "${analytics.postTitle}": CTR ${analytics.clickThroughRate}%`);

    const isHighPerforming = analytics.clickThroughRate > 4.5 || analytics.conversions > 10;
    const learningInsight = isHighPerforming
      ? `Hook style in "${analytics.postTitle}" yielded ${analytics.clickThroughRate}% CTR. Repeat format for next cycle.`
      : `Topic "${analytics.postTitle}" underperformed (${analytics.clickThroughRate}% CTR). Shift focus to concrete case studies.`;

    // Store in Agent Memory
    await this.memoryService.storeMemory(tenantId, {
      agentId,
      memoryType: 'LONG_TERM',
      key: `content_insight_${Date.now()}`,
      value: learningInsight,
      confidence: isHighPerforming ? 0.95 : 0.85,
    });

    return {
      status: 'LEARNING_RECORDED',
      isHighPerforming,
      insight: learningInsight,
    };
  }

  async generateAutonomousNextContent(tenantId: string, agentId: string, coreTheme: string) {
    this.logger.log(`Generating autonomous next content cycle on theme: ${coreTheme}`);

    // Retrieve previous insights
    const pastMemories = await this.memoryService.getMemories(tenantId, agentId, 'LONG_TERM');
    const pastLearnings = pastMemories.map((m) => `- ${m.value}`).join('\n');

    const prompt = `You are the Autonomous Content Optimization Agent.
Core Theme: ${coreTheme}

Past Performance Insights from Analytics:
${pastLearnings || 'Default to high-converting tactical business operating systems hooks.'}

Generate:
1. High-converting LinkedIn thought-leadership post
2. 5-part Twitter/X thread
3. Email newsletter snippet
4. 3 suggested next topics based on learning curve`;

    const generated = await this.promptsService.askAI(tenantId, prompt, undefined, 'groq');

    return {
      theme: coreTheme,
      derivativeAssets: generated.reply,
      appliedLearningsCount: pastMemories.length,
    };
  }
}
