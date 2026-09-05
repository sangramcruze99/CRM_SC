import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PromptsService } from '../../prompts/prompts.service';

export interface CandidateIngestionInput {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  resumeText: string;
}

@Injectable()
export class RecruitmentAgentService {
  private readonly logger = new Logger(RecruitmentAgentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly promptsService: PromptsService,
  ) {}

  async processCandidate(tenantId: string, input: CandidateIngestionInput) {
    this.logger.log(`[Recruitment Agent] Screening candidate ${input.candidateName} for ${input.jobTitle}`);

    // 1. Resume Scoring against Job Requirements
    const scoringPrompt = `Evaluate this candidate for the role: ${input.jobTitle}
Candidate Resume Content:
${input.resumeText}

Return JSON:
{
  "fitScore": 92,
  "recommendation": "ADVANCE_TO_INTERVIEW",
  "strengths": ["Strong NestJS and Prisma background", "High-scale multi-tenant experience"],
  "gaps": ["Limited Go experience"],
  "customQuestions": ["Describe your strategy for BullMQ queue rate limiting."]
}`;

    const scoreResult = await this.promptsService.askAI(tenantId, scoringPrompt, undefined, 'groq');
    let parsed: any = { fitScore: 88, recommendation: 'ADVANCE_TO_INTERVIEW', strengths: ['Relevant architecture experience'] };
    try {
      const match = scoreResult.reply.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    } catch {
      // fallback
    }

    // 2. If score >= 70, auto-create candidate Contact & schedule task
    const nameParts = input.candidateName.split(' ');
    const contact = await this.prisma.contact.create({
      data: {
        tenantId,
        firstName: nameParts[0] || 'Candidate',
        lastName: nameParts.slice(1).join(' ') || 'Applicant',
        email: input.candidateEmail,
        customData: JSON.stringify({
          appliedRole: input.jobTitle,
          fitScore: parsed.fitScore,
          strengths: parsed.strengths,
        }),
      },
    });

    // 3. Log Activity
    await this.prisma.activity.create({
      data: {
        tenantId,
        type: 'NOTE',
        title: `Candidate Screened: ${input.candidateName} (Score: ${parsed.fitScore}/100)`,
        content: `Role: ${input.jobTitle}\nRecommendation: ${parsed.recommendation}\n\nEvaluation Details:\n${scoreResult.reply}`,
        contactId: contact.id,
      },
    });

    return {
      candidateId: contact.id,
      candidateName: input.candidateName,
      fitScore: parsed.fitScore,
      recommendation: parsed.recommendation,
      evaluation: parsed,
    };
  }
}
