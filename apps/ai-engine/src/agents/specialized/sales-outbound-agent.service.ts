import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PromptsService } from '../../prompts/prompts.service';
import { AgentToolRegistryService } from '../agent-tool-registry.service';

export interface ProspectLeadInput {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  title?: string;
  industry?: string;
  channel?: 'EMAIL' | 'WHATSAPP' | 'SMS' | 'AUTO';
}

@Injectable()
export class SalesOutboundAgentService {
  private readonly logger = new Logger(SalesOutboundAgentService.name);

  // In-memory contact cooldown registry: contactId -> timestamp
  private contactCooldowns = new Map<string, number>();
  // Suppression list of opted-out domains and emails
  private suppressionList = new Set<string>(['optout@example.com', 'competitor.com']);

  constructor(
    private readonly prisma: PrismaService,
    private readonly promptsService: PromptsService,
    private readonly toolRegistry: AgentToolRegistryService,
  ) {}

  async processProspect(tenantId: string, lead: ProspectLeadInput) {
    this.logger.log(`[Sales Agent] Processing prospect ${lead.email} (${lead.company || 'Unknown'})`);

    // 1. Suppression & Cooldown Guard
    const emailLower = lead.email.toLowerCase().trim();
    const domain = emailLower.split('@')[1] || '';

    if (this.suppressionList.has(emailLower) || this.suppressionList.has(domain)) {
      this.logger.warn(`Prospect ${emailLower} is in suppression list. Bypassing outreach.`);
      return { status: 'SUPPRESSED', reason: 'Email or domain in suppression list' };
    }

    const lastContactTime = this.contactCooldowns.get(emailLower);
    const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3-day cooldown
    if (lastContactTime && Date.now() - lastContactTime < COOLDOWN_MS) {
      this.logger.warn(`Prospect ${emailLower} was contacted recently. In cooldown.`);
      return { status: 'COOLDOWN_ACTIVE', cooldownUntil: new Date(lastContactTime + COOLDOWN_MS) };
    }

    // 2. Firmographic & Person Enrichment
    const enrichedLead = {
      ...lead,
      firstName: lead.firstName || emailLower.split('@')[0],
      lastName: lead.lastName || 'Executive',
      company: lead.company || (domain ? domain.split('.')[0].toUpperCase() : 'Enterprise Co'),
      industry: lead.industry || 'Enterprise SaaS',
      title: lead.title || 'VP of Operations',
    };

    // 3. ICP Qualification & Pain Point Detection
    const icpPrompt = `Analyze B2B ICP qualification for:
Company: ${enrichedLead.company}
Title: ${enrichedLead.title}
Industry: ${enrichedLead.industry}

Return JSON with:
{
  "icpScore": 85,
  "fitTier": "TIER_1_ENTERPRISE",
  "primaryPainPoint": "Manual lead triage and delayed contract approvals",
  "recommendedChannel": "EMAIL"
}`;

    const icpAnalysis = await this.promptsService.askAI(tenantId, icpPrompt, undefined, 'groq');
    let parsedIcp: any = { icpScore: 88, fitTier: 'TIER_1', primaryPainPoint: 'Operational bottlenecks in sales workflows' };
    try {
      const jsonMatch = icpAnalysis.reply.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsedIcp = JSON.parse(jsonMatch[0]);
    } catch {
      // fallback
    }

    // If ICP is below threshold, log to low-touch list
    if (parsedIcp.icpScore < 50) {
      return { status: 'DISQUALIFIED_LOW_ICP', score: parsedIcp.icpScore };
    }

    // 4. Hyper-Personalized Copy Generation
    const copyPrompt = `Generate a concise, compelling 3-sentence executive cold email to:
Name: ${enrichedLead.firstName} (${enrichedLead.company})
Role: ${enrichedLead.title}
Pain Point: ${parsedIcp.primaryPainPoint}

Highlight how Business OS automates their workflow with AI agents and sub-10ms response times.
Include a call to action for a 15-min discovery call.`;

    const generatedCopy = await this.promptsService.askAI(tenantId, copyPrompt, undefined, 'groq');

    // 5. Channel Selection & Outreach
    const chosenChannel = lead.channel && lead.channel !== 'AUTO' ? lead.channel : (parsedIcp.recommendedChannel || 'EMAIL');

    // 6. Record Contact & Pipeline Deal in CRM
    let contact = await this.prisma.contact.findFirst({
      where: { email: emailLower, tenantId },
    });

    if (!contact) {
      contact = await this.prisma.contact.create({
        data: {
          tenantId,
          firstName: enrichedLead.firstName,
          lastName: enrichedLead.lastName,
          email: emailLower,
          customData: JSON.stringify({
            company: enrichedLead.company,
            title: enrichedLead.title,
            icpScore: parsedIcp.icpScore,
          }),
        },
      });
    }

    const deal = await this.prisma.deal.create({
      data: {
        tenantId,
        title: `${enrichedLead.company} - Outbound Agent Opportunity`,
        amount: 12000,
        stage: 'Lead',
        contactId: contact.id,
      },
    });

    // 7. Log Activity
    await this.prisma.activity.create({
      data: {
        tenantId,
        type: 'EMAIL',
        title: `Outbound Campaign Outreach Drafted (${chosenChannel})`,
        content: `Target: ${enrichedLead.firstName} (${enrichedLead.title} at ${enrichedLead.company})\nICP Score: ${parsedIcp.icpScore}/100\nPain Point: ${parsedIcp.primaryPainPoint}\n\nGenerated Copy:\n${generatedCopy.reply}`,
        contactId: contact.id,
        dealId: deal.id,
      },
    });

    // Mark Cooldown
    this.contactCooldowns.set(emailLower, Date.now());

    return {
      status: 'OUTREACH_GENERATED',
      prospect: enrichedLead,
      icpScore: parsedIcp.icpScore,
      dealId: deal.id,
      contactId: contact.id,
      channel: chosenChannel,
      outreachCopy: generatedCopy.reply,
    };
  }
}
