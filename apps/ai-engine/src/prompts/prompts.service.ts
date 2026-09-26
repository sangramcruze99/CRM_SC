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
        model: data.model || 'ollama/gemma4:e4b',
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

    // ─────────────────────────────────────────────────────────────────────
    // API key references — used ONLY as failsafe when all local engines fail
    // ─────────────────────────────────────────────────────────────────────
    const groqKey = process.env.GROQ_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    // Ollama config (PRIMARY brain — always Gemma local)
    const ollamaBase = (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11435').replace(/\/$/, '');
    const ollamaDefaultModel = process.env.OLLAMA_DEFAULT_MODEL || 'gemma4:e4b';

    // Map any provider-prefixed Gemma model string → local Ollama tag
    const resolveOllamaModel = (requested?: string): string => {
      if (!requested) return ollamaDefaultModel;
      const bare = requested.split('/').pop() || ollamaDefaultModel;
      const tagMap: Record<string, string> = {
        'gemma2-9b-it': 'gemma4:e4b',
        'gemma2:9b': 'gemma4:e4b',
        'gemma-7b-it': 'gemma4:e4b',
        'gemma-2-27b-it': 'gemma4:e4b',
        'gemma4:e4b': 'gemma4:e4b',
        'gemma4': 'gemma4:e4b',
        'compound': 'gemma4:e4b',
      };
      return tagMap[bare] || ollamaDefaultModel;
    };

    // OpenAI-compatible call helper (used for cloud API failsafes)
    const executeCall = async (
      baseURL: string,
      apiKey: string,
      modelName: string,
      headers?: Record<string, string>,
    ) => {
      const { OpenAI } = await import('openai');
      const client = new OpenAI({ apiKey, baseURL, defaultHeaders: headers });
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

    // Google Gemini REST call helper
    const executeGeminiCall = async (apiKey: string, modelName?: string) => {
      let targetModel = modelName || 'models/gemini-3.6-flash';
      if (!targetModel.startsWith('models/')) targetModel = `models/${targetModel}`;
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
        } catch { /* try next */ }
      }
      throw new Error('Gemini API call failed across all candidate models');
    };

    // ═══════════════════════════════════════════════════════════════════
    // PRIORITY 0 — OLLAMA LOCAL GEMMA (primary agent brain, zero cost)
    // Always attempted first. Resolves model tag automatically from env.
    // ═══════════════════════════════════════════════════════════════════
    const ollamaModel = resolveOllamaModel(model);
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 60000);
      const ollamaRes = await fetch(`${ollamaBase}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query },
          ],
          stream: false,
          options: { temperature: 0.7 },
        }),
        signal: ctrl.signal,
      });
      clearTimeout(tid);
      if (ollamaRes.ok) {
        const d = (await ollamaRes.json()) as any;
        const reply = d.message?.content || d.response || '';
        const tokens = (d.eval_count || 0) + (d.prompt_eval_count || 0) || 200;
        recordMeteredUsage(tokens, 'ollama-gemma', ollamaModel);
        return {
          reply,
          model: ollamaModel,
          provider: 'ollama-gemma',
          isLocalEngine: true,
          usage: { total_tokens: tokens, prompt_tokens: d.prompt_eval_count || 100, completion_tokens: d.eval_count || 100 },
          latencyMs: Date.now() - startTime,
          context: { contactCount, dealCount, ticketCount },
        };
      }
    } catch (err: any) {
      console.warn('[AI-Engine] Ollama Gemma unreachable, activating failsafe chain:', err?.message || err);
    }

    // ═══════════════════════════════════════════════════════════════════
    // PRIORITY 1 — PYTHON-AI CUDA GPU (secondary local, if Ollama down)
    // ═══════════════════════════════════════════════════════════════════
    const pythonAiUrl = process.env.PYTHON_AI_URL || 'http://localhost:3030';
    const pythonAiKey = process.env.PYTHON_AI_API_KEY || 'business-os-internal-ai-key-secret';
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 7000);
      const pyRes = await fetch(`${pythonAiUrl}/v1/inference/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          'X-Service-Key': pythonAiKey,
        },
        body: JSON.stringify({
          model: `ollama/${ollamaModel}`,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query },
          ],
          tenant_id: tenantId,
          temperature: 0.7,
        }),
        signal: ctrl.signal,
      });
      clearTimeout(tid);
      if (pyRes.ok) {
        const pyData = (await pyRes.json()) as any;
        const tokens = pyData.usage?.total_tokens || 40;
        recordMeteredUsage(tokens, 'python-gpu-gemma', pyData.model || ollamaModel);
        return {
          reply: pyData.content || '',
          model: pyData.model || ollamaModel,
          provider: 'python-gpu-gemma',
          isLocalEngine: true,
          usage: pyData.usage,
          latencyMs: Date.now() - startTime,
          context: { contactCount, dealCount, ticketCount },
        };
      }
    } catch {
      // Python-AI also unavailable; engaging API failsafe chain below
    }

    // ═══════════════════════════════════════════════════════════════════
    // FAILSAFE CHAIN — API keys activate only when ALL local engines fail
    // Order: Groq Gemma2 → Google Gemini → OpenRouter Gemma2-27B → Groq compound
    // ═══════════════════════════════════════════════════════════════════
    console.warn('[AI-Engine] All local Gemma engines offline — API key failsafe activated.');

    // FAILSAFE 1 — Groq API with Gemma2-9B (fastest cloud Gemma equivalent)
    if (groqKey) {
      try {
        const groqModel = 'gemma2-9b-it';
        const result = await executeCall('https://api.groq.com/openai/v1', groqKey, groqModel);
        const tokens = result.usage?.total_tokens || 350;
        recordMeteredUsage(tokens, 'groq-gemma-failsafe', groqModel);
        return {
          ...result,
          provider: 'groq-gemma-failsafe',
          isLocalEngine: false,
          latencyMs: Date.now() - startTime,
          context: { contactCount, dealCount, ticketCount },
        };
      } catch (err: any) {
        console.warn('[AI-Engine] Groq Gemma failsafe failed:', err?.message || err);
      }
    }

    // FAILSAFE 2 — Google Gemini API
    if (geminiKey) {
      try {
        const result = await executeGeminiCall(geminiKey, model);
        const tokens = result.usage?.total_tokens || 350;
        recordMeteredUsage(tokens, 'gemini-failsafe', result.model);
        return {
          ...result,
          provider: 'gemini-failsafe',
          isLocalEngine: false,
          latencyMs: Date.now() - startTime,
          context: { contactCount, dealCount, ticketCount },
        };
      } catch (err: any) {
        console.warn('[AI-Engine] Gemini failsafe failed:', err?.message || err);
      }
    }

    // FAILSAFE 3 — OpenRouter with Gemma 2 27B
    if (openRouterKey) {
      try {
        const orModel = 'google/gemma-2-27b-it';
        const result = await executeCall(
          'https://openrouter.ai/api/v1',
          openRouterKey,
          orModel,
          { 'HTTP-Referer': 'http://localhost:4000', 'X-Title': 'Business OS CRM' },
        );
        const tokens = result.usage?.total_tokens || 400;
        recordMeteredUsage(tokens, 'openrouter-gemma-failsafe', orModel);
        return {
          ...result,
          provider: 'openrouter-gemma-failsafe',
          isLocalEngine: false,
          latencyMs: Date.now() - startTime,
          context: { contactCount, dealCount, ticketCount },
        };
      } catch (err: any) {
        console.warn('[AI-Engine] OpenRouter Gemma failsafe failed:', err?.message || err);
      }
    }

    // FAILSAFE 4 — Last resort: Groq compound-beta-mini
    if (groqKey) {
      try {
        const result = await executeCall('https://api.groq.com/openai/v1', groqKey, 'compound-beta-mini');
        const tokens = result.usage?.total_tokens || 350;
        recordMeteredUsage(tokens, 'groq-compound-last-resort', 'compound-beta-mini');
        return {
          ...result,
          provider: 'groq-last-resort',
          isLocalEngine: false,
          latencyMs: Date.now() - startTime,
          context: { contactCount, dealCount, ticketCount },
        };
      } catch (err: any) {
        console.warn('[AI-Engine] Groq last-resort failed:', err?.message || err);
      }
    }

    // FINAL OFFLINE FALLBACK — static context-aware reply
    recordMeteredUsage(120, 'local', 'business-os-context-fallback');
    return {
      reply: `[Business OS Copilot — Offline] Regarding: "${query}"\n\n- **Active Pipeline Deals**: ${dealCount}\n- **Commercial Contacts**: ${contactCount}\n- **Open Tickets**: ${ticketCount}\n\n*Gemma (Ollama) and all API failsafes are unreachable. Ensure Ollama is running: \`ollama serve\` and that gemma4:e4b is pulled.*`,
      model: 'business-os-context-fallback',
      provider: 'offline',
      latencyMs: Date.now() - startTime,
      context: { contactCount, dealCount, ticketCount },
    };
  }
}
