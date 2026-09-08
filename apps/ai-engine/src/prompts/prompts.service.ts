import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    provider: 'groq' | 'openrouter' | 'gemini' | 'auto' = 'auto',
    model?: string,
  ) {
    const startTime = Date.now();

    // 0. SaaS Entitlement & Token Quota Gate
    try {
      const evalRes = await fetch('http://localhost:3027/billing/usage/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          metric: 'ai.tokens.total',
          requestedAmount: 500,
        }),
      });
      if (evalRes.ok) {
        const evalData = (await evalRes.json()) as any;
        if (!evalData.allowed && evalData.action === 'BLOCK') {
          throw new BadRequestException(
            'Monthly AI token quota exhausted for this tenant. Please upgrade your subscription plan in Settings > Billing.',
          );
        }
      }
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      // Continue if billing service is gracefully restarting
    }

    // Helper to asynchronously record billable token usage
    const recordMeteredUsage = (tokens: number, pName: string, mName: string) => {
      const estCost = tokens * 0.000001; // $1.00 / 1M tokens average
      fetch('http://localhost:3027/billing/usage/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          metric: 'ai.tokens.total',
          quantity: tokens,
          source: 'ai-engine',
          provider: pName,
          model: mName,
          estimatedCost: estCost,
          idempotencyKey: `ai_tok_${tenantId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        }),
      }).catch(() => {});
    };

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
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

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

    const executeGeminiCall = async (apiKey: string, modelName?: string) => {
      let targetModel = modelName || 'models/gemini-3.6-flash';
      if (!targetModel.startsWith('models/')) {
        targetModel = `models/${targetModel}`;
      }

      const candidateModels = [targetModel, 'models/gemini-3.6-flash', 'models/gemini-3-flash-preview'];
      const tested = new Set<string>();

      for (const m of candidateModels) {
        if (tested.has(m)) continue;
        tested.add(m);

        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/${m}:generateContent?key=${encodeURIComponent(apiKey)}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemPrompt }] },
                contents: [{ parts: [{ text: query }] }],
                generationConfig: { temperature: 0.7 },
              }),
              signal: AbortSignal.timeout(15000),
            },
          );

          if (res.ok) {
            const data = (await res.json()) as any;
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const tokens = data.usageMetadata?.totalTokenCount || 350;
            return {
              reply,
              model: m.replace('models/', ''),
              usage: {
                prompt_tokens: data.usageMetadata?.promptTokenCount || 100,
                completion_tokens: data.usageMetadata?.candidatesTokenCount || 250,
                total_tokens: tokens,
              },
            };
          }
        } catch {
          // try next model
        }
      }

      throw new Error('Gemini API call failed across candidate models');
    };

    // PRIORITY 1: LOCAL MACHINE FIRST (Python AI :3030 / NVIDIA GPU)
    // Always attempt offline local inference on host machine with zero API cost
    const pythonAiUrl = process.env.PYTHON_AI_URL || 'http://localhost:3030';
    const pythonAiKey = process.env.PYTHON_AI_API_KEY || 'business-os-internal-ai-key-secret';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);
      const pyResponse = await fetch(`${pythonAiUrl}/v1/inference/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          'X-Service-Key': pythonAiKey,
        },
        body: JSON.stringify({
          model: model || 'local/gtx1060-cuda',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query },
          ],
          tenant_id: tenantId,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (pyResponse.ok) {
        const pyData = (await pyResponse.json()) as any;
        const tokens = pyData.usage?.total_tokens || 40;
        recordMeteredUsage(tokens, 'local-gpu', pyData.model || 'local/gtx1060-cuda');
        return {
          reply: pyData.content || '',
          model: pyData.model || 'local/gtx1060-cuda',
          provider: 'local-gpu',
          isLocalEngine: true,
          usage: pyData.usage,
          latencyMs: Date.now() - startTime,
          context: { contactCount, dealCount, ticketCount },
        };
      }
    } catch {
      // Local machine engine unavailable or timed out; seamlessly proceed to secondary cloud fallback
    }

    // PRIORITY 2: SECONDARY CLOUD FALLBACK CASCADE (Groq -> Gemini -> OpenRouter)
    const wantsGemini = provider === 'gemini' || model?.toLowerCase().includes('gemini');
    const wantsOpenRouter = provider === 'openrouter' || model?.includes('gpt-4') || model?.includes('claude');

    // Secondary 2a: If Gemini is explicitly requested
    if (wantsGemini && geminiKey) {
      try {
        const result = await executeGeminiCall(geminiKey, model);
        const tokens = result.usage?.total_tokens || 350;
        recordMeteredUsage(tokens, 'gemini', result.model);
        return {
          ...result,
          provider: 'gemini',
          isLocalEngine: false,
          latencyMs: Date.now() - startTime,
          context: { contactCount, dealCount, ticketCount },
        };
      } catch (error: any) {
        console.warn('[AI-Engine] Direct Gemini call failed, trying fallback:', error?.message || error);
      }
    }

    // 3. Groq Fast Inference (Ultra-low latency)
    if (!wantsOpenRouter && groqKey) {
      try {
        const selectedModel = model || 'groq/compound';
        const result = await executeCall('https://api.groq.com/openai/v1', groqKey, selectedModel);
        const tokens = result.usage?.total_tokens || 350;
        recordMeteredUsage(tokens, 'groq', selectedModel);
        return {
          ...result,
          provider: 'groq',
          latencyMs: Date.now() - startTime,
          context: { contactCount, dealCount, ticketCount },
        };
      } catch (error: any) {
        console.warn('[AI-Engine] Groq call failed, falling back:', error?.message || error);
      }
    }

    // 4. Google Gemini Direct Call
    if (geminiKey) {
      try {
        const result = await executeGeminiCall(geminiKey, model);
        const tokens = result.usage?.total_tokens || 350;
        recordMeteredUsage(tokens, 'gemini', result.model);
        return {
          ...result,
          provider: 'gemini',
          latencyMs: Date.now() - startTime,
          context: { contactCount, dealCount, ticketCount },
        };
      } catch (error: any) {
        console.warn('[AI-Engine] Gemini fallback call failed:', error?.message || error);
      }
    }

    // 5. OpenRouter Gateway Call
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
        const tokens = result.usage?.total_tokens || 400;
        recordMeteredUsage(tokens, 'openrouter', selectedModel);
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

    // 6. Secondary fallback: If OpenRouter was tried first but failed, try Groq
    if (wantsOpenRouter && groqKey) {
      try {
        const result = await executeCall('https://api.groq.com/openai/v1', groqKey, 'groq/compound');
        const tokens = result.usage?.total_tokens || 350;
        recordMeteredUsage(tokens, 'groq', 'groq/compound');
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
    recordMeteredUsage(120, 'local', 'business-os-local-context');
    return {
      reply: `[Business OS Copilot] Regarding: "${query}"\n\n- **Active Pipeline Deals**: ${dealCount}\n- **Commercial Contacts**: ${contactCount}\n- **Open Tickets**: ${ticketCount}\n\n*Note: Configure or refresh LLM API keys in .env to enable continuous cloud completions.*`,
      model: 'business-os-local-context',
      provider: 'local',
      latencyMs: Date.now() - startTime,
      context: { contactCount, dealCount, ticketCount },
    };
  }
}
