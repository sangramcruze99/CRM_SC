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

  async askAI(
    tenantId: string,
    query: string,
    templateId?: string,
    provider: 'groq' | 'openrouter' | 'auto' = 'auto',
    model?: string,
  ) {
    const startTime = Date.now();

    // 1. Live CRM Context Aggregation
    const [contactCount, dealCount, ticketCount, recentDeals, recentContacts] = await Promise.all([
      this.prisma.contact.count({ where: { tenantId } }).catch(() => 0),
      this.prisma.deal.count({ where: { tenantId } }).catch(() => 0),
      this.prisma.ticket.count({ where: { tenantId } }).catch(() => 0),
      this.prisma.deal.findMany({
        where: { tenantId },
        take: 4,
        orderBy: { createdAt: 'desc' },
        select: { title: true, amount: true, stage: true },
      }).catch(() => []),
      this.prisma.contact.findMany({
        where: { tenantId },
        take: 4,
        orderBy: { createdAt: 'desc' },
        select: { firstName: true, lastName: true, email: true },
      }).catch(() => []),
    ]);

    let systemPrompt = `You are the executive AI Business Copilot for Business OS & Enterprise CRM.
You assist users with sales pipeline strategy, deal closing, lead qualification, smart invoicing, custom low-code schemas, and workflow operations.

Current Workspace Context:
- Active Contacts: ${contactCount} (Recent: ${recentContacts.map(c => `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email || 'Client').join(', ') || 'None'})
- Active Pipeline Deals: ${dealCount} (Recent: ${recentDeals.map(d => `${d.title} ($${d.amount || 0}, Stage: ${d.stage})`).join(', ') || 'None'})
- Open Support Tickets: ${ticketCount}

Guidelines:
- Provide clear, direct, professional, and actionable business insights.
- Format responses cleanly with bold highlights and concise markdown bullet points.
- If asked about metrics or tenant data, reference the live workspace numbers above.`;

    if (templateId) {
      try {
        const template = await this.findOne(tenantId, templateId);
        if (template?.prompt) {
          systemPrompt = template.prompt;
        }
      } catch {
        // use default prompt
      }
    }

    const groqKey = process.env.GROQ_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    const executeCall = async (
      baseURL: string,
      apiKey: string,
      modelName: string,
      headers?: Record<string, string>,
    ) => {
      const { OpenAI } = await import('openai');
      const client = new OpenAI({
        apiKey,
        baseURL,
        defaultHeaders: headers,
      });

      const completion = await client.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ],
        temperature: 0.7,
      });

      return {
        reply: completion.choices[0]?.message?.content || '',
        model: completion.model || modelName,
        usage: completion.usage,
      };
    };

    // Determine engine order:
    // If user explicitly chose OpenRouter or requested gpt-4o / claude, use OpenRouter first.
    // Otherwise, prioritize Groq for sub-second, real-time responses!
    const wantsOpenRouter = provider === 'openrouter' || model?.includes('gpt-4') || model?.includes('claude');

    if (!wantsOpenRouter && groqKey) {
      try {
        const selectedModel = model || 'groq/compound';
        const result = await executeCall('https://api.groq.com/openai/v1', groqKey, selectedModel);
        return {
          ...result,
          provider: 'groq',
          latencyMs: Date.now() - startTime,
          context: { contactCount, dealCount, ticketCount },
        };
      } catch (error: any) {
        console.warn('[AI-Engine] Groq call failed, falling back to OpenRouter:', error?.message || error);
      }
    }

    if (openRouterKey) {
      try {
        const selectedModel = model || 'openai/gpt-4o-mini';
        const result = await executeCall(
          'https://openrouter.ai/api/v1',
          openRouterKey,
          selectedModel,
          {
            'HTTP-Referer': 'http://localhost:4000',
            'X-Title': 'Business OS CRM',
          },
        );
        return {
          ...result,
          provider: 'openrouter',
          latencyMs: Date.now() - startTime,
          context: { contactCount, dealCount, ticketCount },
        };
      } catch (error: any) {
        console.warn('[AI-Engine] OpenRouter call failed:', error?.message || error);
      }
    }

    // Secondary fallback: If OpenRouter was tried first but failed, try Groq
    if (wantsOpenRouter && groqKey) {
      try {
        const result = await executeCall('https://api.groq.com/openai/v1', groqKey, 'groq/compound');
        return {
          ...result,
          provider: 'groq (fallback)',
          latencyMs: Date.now() - startTime,
          context: { contactCount, dealCount, ticketCount },
        };
      } catch (error: any) {
        console.warn('[AI-Engine] Secondary Groq call failed:', error?.message || error);
      }
    }

    // Fallback: Local offline context-aware reply
    return {
      reply: `[Business OS Copilot] Regarding: "${query}"\n\n- **Active Pipeline Deals**: ${dealCount}\n- **Commercial Contacts**: ${contactCount}\n- **Open Tickets**: ${ticketCount}\n\n*Note: Configure or refresh LLM API keys in .env to enable continuous cloud completions.*`,
      model: 'business-os-local-context',
      provider: 'local',
      latencyMs: Date.now() - startTime,
      context: { contactCount, dealCount, ticketCount },
    };
  }
}
