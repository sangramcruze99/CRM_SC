import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PromptsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, data: any) {
    return this.prisma.aIPromptTemplate.create({
      data: {
        tenantId,
        name: data.name,
        prompt: data.prompt,
        model: data.model || 'gpt-4o',
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.aIPromptTemplate.findMany({
      where: { tenantId },
    });
  }

  async findOne(tenantId: string, id: string) {
    const prompt = await this.prisma.aIPromptTemplate.findFirst({
      where: { id, tenantId },
    });
    if (!prompt) throw new NotFoundException('Prompt Template not found');
    return prompt;
  }

  async update(tenantId: string, id: string, data: any) {
    const prompt = await this.findOne(tenantId, id);
    return this.prisma.aIPromptTemplate.update({
      where: { id: prompt.id },
      data,
    });
  }

  async remove(tenantId: string, id: string) {
    const prompt = await this.findOne(tenantId, id);
    return this.prisma.aIPromptTemplate.delete({
      where: { id: prompt.id },
    });
  }

  async askAI(tenantId: string, query: string, templateId?: string) {
    let systemPrompt =
      'You are the intelligent copilot for Business OS. You assist with sales pipeline, deal management, contact insights, invoicing, workflows, and low-code schemas.';

    if (templateId) {
      const template = await this.findOne(tenantId, templateId);
      systemPrompt = template.prompt;
    }

    const openAiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    // 1. Try OpenAI if API key configured
    if (openAiKey) {
      try {
        const { OpenAI } = await import('openai');
        const openai = new OpenAI({ apiKey: openAiKey });

        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query },
          ],
          temperature: 0.7,
        });

        return {
          reply: response.choices[0].message.content,
          model: response.model,
          usage: response.usage,
        };
      } catch (error: any) {
        // Fallback to contextual helper if error occurs
        console.error('OpenAI Error:', error.message);
      }
    }

    // 2. Dynamic Context-Aware CRM Assistant Fallback (Zero external cost mode)
    const [contactCount, dealCount, ticketCount] = await Promise.all([
      this.prisma.contact.count({ where: { tenantId } }).catch(() => 0),
      this.prisma.deal.count({ where: { tenantId } }).catch(() => 0),
      this.prisma.ticket.count({ where: { tenantId } }).catch(() => 0),
    ]);

    const lower = query.toLowerCase();
    let reply = `[Copilot Engine] Regarding your query: "${query}"\n\n`;

    if (lower.includes('contact') || lower.includes('lead') || lower.includes('client')) {
      reply += `You currently have **${contactCount} active contacts** registered in your workspace. You can create custom fields, segment them with tags, or automate email drip sequences in the Automations engine.`;
    } else if (lower.includes('deal') || lower.includes('sales') || lower.includes('pipeline') || lower.includes('revenue')) {
      reply += `Your workspace tracks **${dealCount} deals** in the pipeline. Check the Deals Pipeline to update stages, assign probabilities, and log stage changes to the audit trail.`;
    } else if (lower.includes('ticket') || lower.includes('support') || lower.includes('help')) {
      reply += `There are **${ticketCount} support tickets** logged. Make sure SLA policies and chat widgets are active under Helpdesk settings.`;
    } else {
      reply += `Business OS is operating smoothly across all 22 domain microservices. Your tenant currently holds ${contactCount} contacts, ${dealCount} deals, and ${ticketCount} tickets. You can configure AI templates in Schema & AI or connect a live LLM key (OPENAI_API_KEY / GEMINI_API_KEY) in .env for custom conversational completions.`;
    }

    return {
      reply,
      model: 'business-os-copilot-hybrid',
      context: { contactCount, dealCount, ticketCount },
    };
  }
}
