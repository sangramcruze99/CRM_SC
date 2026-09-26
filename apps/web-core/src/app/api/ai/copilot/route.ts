/**
 * /api/ai/copilot — Master AI Copilot Endpoint
 *
 * Every message from AskAICopilot goes here.
 * Builds a full live system snapshot, constructs the master system prompt,
 * then routes to Ollama Gemma (primary brain) with API key failsafe chain.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getTenantHeaders } from '@/lib/auth';
import { buildSystemSnapshot, buildMasterSystemPrompt } from '@/lib/systemContext';
import { getDefaultBlueprint, getActiveBlueprint } from '@/lib/blueprint/blueprintEngine';
import { resolveAgentExecutionContext, formatContextPromptForAgent } from '@/lib/blueprint/agentContextResolver';
import { UNIVERSAL_SERVICE_CATALOG } from '@/lib/services/serviceCatalog';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const query: string = (body.query || body.message || '').trim();
    const currentPage: string = body.currentPage || '';
    const conversationHistory: Array<{ role: string; content: string }> = body.history || [];

    if (!query) {
      return NextResponse.json({ error: 'Query is required.' }, { status: 400 });
    }

    const headers = (await getTenantHeaders()) as Record<string, string>;

    // Resolve active Workspace Blueprint & AgentExecutionContext
    let blueprint = body.blueprint;
    if (!blueprint) {
      const niche = body.niche || (currentPage.includes('/industry/') ? currentPage.split('/industry/')[1]?.split('/')[0] : 'hospital');
      blueprint = getDefaultBlueprint(niche);
    }

    const agentContext = resolveAgentExecutionContext({
      blueprint,
      agentId: body.agentId || 'master_copilot',
      agentName: 'Business OS Master AI Copilot',
      userId: headers['x-user-id'] || 'usr_current',
      userRole: headers['x-user-role'] || 'ADMIN',
      query,
    });

    // Deterministic Service Guard (Master Prompt Section 7 & 22)
    // If the user query is asking for a capability of a disabled service, refuse directly without hallucination.
    const lowerQuery = query.toLowerCase();
    for (const disabledId of agentContext.disabledServices) {
      const serviceMeta = (UNIVERSAL_SERVICE_CATALOG as any)[disabledId];
      if (serviceMeta) {
        const srvNameLower = serviceMeta.name.toLowerCase();
        const isAskingDisabled =
          (disabledId === 'srv_inventory_stock' && (lowerQuery.includes('inventory') || lowerQuery.includes('stock level') || lowerQuery.includes('warehouse'))) ||
          (disabledId === 'srv_invoicing_ledger' && (lowerQuery.includes('invoice') || lowerQuery.includes('billing') || lowerQuery.includes('payment link'))) ||
          (disabledId === 'srv_pipeline_deals' && (lowerQuery.includes('pipeline deal') || lowerQuery.includes('sales pipeline'))) ||
          (lowerQuery.includes(srvNameLower));

        if (isAskingDisabled) {
          return NextResponse.json({
            reply: `${serviceMeta.name} is not enabled for this workspace.`,
            model: 'deterministic-rule-engine',
            provider: 'rule-engine',
            isLocalEngine: true,
            latencyMs: Date.now() - startTime,
            agentContext: {
              workspace: agentContext.workspace.name,
              industry: agentContext.industry,
              businessType: agentContext.businessType,
              configurationVersion: agentContext.configurationVersion,
              serviceGated: serviceMeta.name,
            },
          });
        }
      }
    }

    const dynamicContextPrompt = formatContextPromptForAgent(agentContext, undefined, query);

    // Build full live system snapshot (parallel fetch from all 24 services)
    const snapshot = await buildSystemSnapshot(headers);
    const baseSystemPrompt = buildMasterSystemPrompt(snapshot, currentPage, query);
    const systemPrompt = `${baseSystemPrompt}\n\n═══════════════════════════════════════════════════════\nDYNAMIC WORKSPACE & INDUSTRY CONTEXT (ENFORCED)\n═══════════════════════════════════════════════════════\n${dynamicContextPrompt}`;

    // Build message history for multi-turn context
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: query },
    ];

    const ollamaBase = (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11435').replace(/\/$/, '');
    const ollamaModel = process.env.OLLAMA_DEFAULT_MODEL || 'gemma4:e4b';

    // ── PRIORITY 0: Ollama Gemma (local brain) ──────────────────────────
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 30000); // 30s for complex reasoning
      const ollamaRes = await fetch(`${ollamaBase}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModel,
          messages,
          stream: false,
          options: { temperature: 0.65, num_ctx: 8192 },
        }),
        signal: ctrl.signal,
      });
      clearTimeout(tid);

      if (ollamaRes.ok) {
        const d = (await ollamaRes.json()) as any;
        const reply = d.message?.content || d.response || '';
        if (reply) {
          return NextResponse.json({
            reply,
            model: ollamaModel,
            provider: 'ollama-gemma',
            isLocalEngine: true,
            latencyMs: Date.now() - startTime,
            systemHealth: {
              servicesOnline: snapshot.servicesOnline,
              servicesTotal: snapshot.servicesTotal,
            },
          });
        }
      }
    } catch (err: any) {
      console.warn('[Copilot] Ollama Gemma unavailable:', err?.message);
    }

    // ── PRIORITY 1: Python-AI GPU (secondary local) ──────────────────────
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 10000);
      const pyRes = await fetch(`http://localhost:3030/v1/inference/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': headers['x-tenant-id'] || 'default',
          'X-Service-Key': process.env.PYTHON_AI_API_KEY || 'business-os-internal-ai-key-secret',
        },
        body: JSON.stringify({
          model: `ollama/${ollamaModel}`,
          messages,
          tenant_id: headers['x-tenant-id'] || 'default',
          temperature: 0.65,
        }),
        signal: ctrl.signal,
      });
      clearTimeout(tid);
      if (pyRes.ok) {
        const pyData = (await pyRes.json()) as any;
        const reply = pyData.content || '';
        if (reply) {
          return NextResponse.json({
            reply,
            model: ollamaModel,
            provider: 'python-gpu-gemma',
            isLocalEngine: true,
            latencyMs: Date.now() - startTime,
          });
        }
      }
    } catch {
      // fall through to API failsafe
    }

    // ── FAILSAFE CHAIN: API keys (only when all local engines offline) ───
    const groqKey = process.env.GROQ_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    const openAICall = async (baseURL: string, apiKey: string, model: string, extraHeaders?: Record<string, string>) => {
      const url = `${baseURL.replace(/\/$/, '')}/chat/completions`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          ...(extraHeaders || {}),
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.65,
          max_tokens: 2048,
        }),
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) throw new Error(`${model} returned ${res.status}`);
      const d = (await res.json()) as any;
      return d.choices?.[0]?.message?.content || '';
    };


    // FS1: Groq Gemma2
    if (groqKey) {
      try {
        const reply = await openAICall('https://api.groq.com/openai/v1', groqKey, 'gemma2-9b-it');
        if (reply) return NextResponse.json({ reply, model: 'gemma2-9b-it', provider: 'groq-gemma-failsafe', isLocalEngine: false, latencyMs: Date.now() - startTime });
      } catch { /* next */ }
    }

    // FS2: Google Gemini
    if (geminiKey) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(geminiKey)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: [
                ...conversationHistory.slice(-6).map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
                { role: 'user', parts: [{ text: query }] },
              ],
              generationConfig: { temperature: 0.65 },
            }),
            signal: AbortSignal.timeout(15000),
          }
        );
        if (res.ok) {
          const d = (await res.json()) as any;
          const reply = d.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (reply) return NextResponse.json({ reply, model: 'gemini-2.0-flash', provider: 'gemini-failsafe', isLocalEngine: false, latencyMs: Date.now() - startTime });
        }
      } catch { /* next */ }
    }

    // FS3: OpenRouter Gemma 2 27B
    if (openRouterKey) {
      try {
        const reply = await openAICall(
          'https://openrouter.ai/api/v1', openRouterKey, 'google/gemma-2-27b-it',
          { 'HTTP-Referer': 'http://localhost:4000', 'X-Title': 'Business OS CRM' }
        );
        if (reply) return NextResponse.json({ reply, model: 'gemma-2-27b-it', provider: 'openrouter-gemma-failsafe', isLocalEngine: false, latencyMs: Date.now() - startTime });
      } catch { /* next */ }
    }

    // FS4: Last resort — Groq compound
    if (groqKey) {
      try {
        const reply = await openAICall('https://api.groq.com/openai/v1', groqKey, 'compound-beta-mini');
        if (reply) return NextResponse.json({ reply, model: 'compound-beta-mini', provider: 'groq-last-resort', isLocalEngine: false, latencyMs: Date.now() - startTime });
      } catch { /* next */ }
    }

    // Offline context reply
    return NextResponse.json({
      reply: `[Offline Mode] Based on live system data:\n\n• **Contacts**: ${snapshot.crm.contacts}\n• **Active Deals**: ${snapshot.sales.activeDeals} ($${snapshot.sales.pipelineValue.toLocaleString()} pipeline)\n• **Overdue Invoices**: ${snapshot.finance.overdue}\n• **Open Tickets**: ${snapshot.helpdesk.open}\n• **AI Agents Active**: ${snapshot.agents.active}/${snapshot.agents.total}\n\n*Gemma local engine is offline. Start Ollama: \`ollama serve\`*`,
      model: 'offline-context',
      provider: 'offline',
      isLocalEngine: false,
      latencyMs: Date.now() - startTime,
    });
  } catch (err: any) {
    console.error('[Copilot API Error]', err);
    return NextResponse.json({ error: 'Copilot encountered an internal error. Please try again.' }, { status: 500 });
  }
}
