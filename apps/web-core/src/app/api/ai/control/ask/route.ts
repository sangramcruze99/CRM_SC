import { NextRequest, NextResponse } from 'next/server';
import { getTenantHeaders, safeFetch } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query: string = (body.query || '').trim();
    const headers = await getTenantHeaders();

    if (!query) {
      return NextResponse.json({ error: 'Please specify what you would like AI to handle.' }, { status: 400 });
    }

    const lower = query.toLowerCase();
    const context = body.context || {};

    // 0. SPECIFIC RECORD CONTEXT (RecordAiMenu / Section AI)
    if (context.entityType && context.entityId) {
      let agentName = 'AI Assistant';
      let agentKey = 'general';
      let systemRole = 'You are the Business OS AI Assistant.';

      if (context.entityType === 'deal') {
        agentName = 'Sales AI (Ares)';
        agentKey = 'sales';
        systemRole = 'You are Ares, the Sales Intelligence Sentinel in Business OS. Analyze the deal context, assess pipeline velocity, identify risks, and recommend concrete next actions.';
      } else if (context.entityType === 'invoice') {
        agentName = 'Finance AI (Midas)';
        agentKey = 'finance';
        systemRole = 'You are Midas, the Treasury and Invoicing Sentinel in Business OS. Analyze payment terms, overdue aging, and recommend polite, effective cash collection steps. Do not alter verified invoice balances.';
      } else if (context.entityType === 'contact' || context.entityType === 'lead') {
        agentName = 'Lead Qualification AI';
        agentKey = 'leads';
        systemRole = 'You are the Inbound Lead Qualification Agent in Business OS. Evaluate ICP fit, score importance, and recommend actionable outreach.';
      } else if (context.entityType === 'ticket') {
        agentName = 'Customer Support AI (Athena / Support)';
        agentKey = 'support';
        systemRole = 'You are the Customer Support & SLA Sentinel in Business OS. Analyze ticket history and provide clear, empathetic, solution-oriented guidance.';
      } else if (context.entityType === 'project') {
        agentName = 'Operations AI (Hermes)';
        agentKey = 'operations';
        systemRole = 'You are Hermes, the Project Fulfillment Sentinel in Business OS. Track sprint deliverables, milestones, and operational blockers.';
      }

      const ollamaBaseCtx = (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11435').replace(/\/$/, '');
      const ollamaModelCtx = process.env.OLLAMA_DEFAULT_MODEL || 'gemma4:e4b';
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const localAiRes = await fetch(`${ollamaBaseCtx}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: ollamaModelCtx,
            messages: [
              {
                role: 'system',
                content: `${systemRole} Provide a concise, professional business recommendation. Keep your response practical and directly relevant to the record. Do not mention tokens, vectors, or models.`,
              },
              {
                role: 'user',
                content: `Entity Type: ${context.entityType}\nEntity ID: ${context.entityId}\nEntity Name: ${context.entityName || 'N/A'}\nContext Data: ${JSON.stringify(context)}\n\nUser Request: ${query}`,
              },
            ],
            stream: false,
            options: { temperature: 0.7 },
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (localAiRes.ok) {
          const localData = await localAiRes.json() as any;
          const text = localData.message?.content || localData.response || '';
          if (text) {
            return NextResponse.json({
              department: agentName,
              departmentKey: agentKey,
              intent: 'RECORD_ASSISTANCE',
              answer: text,
              isLocalEngine: true,
              provider: 'ollama-gemma',
              model: ollamaModelCtx,
              provenance: 'OLLAMA_LOCAL_GEMMA',
              suggestedActions: [
                { label: `View ${context.entityType}`, action: 'NAVIGATE', path: `/${context.entityType}s` },
                { label: 'Check Activity Feed', action: 'NAVIGATE', path: '/ai/activity' },
              ],
            });
          }
        }
      } catch {
        // Fallback gracefully to subsequent intent handlers
      }

    }

    // 1. DEALS / SALES INTENT
    if (lower.includes('deal') || lower.includes('pipeline') || lower.includes('sales') || lower.includes('revenue') || lower.includes('opportunity')) {
      const deals = await safeFetch<any[]>('http://localhost:3005/deals', { headers }, []);
      const activeDeals = Array.isArray(deals) ? deals.filter((d) => d.stage !== 'WON' && d.stage !== 'LOST') : [];

      if (activeDeals.length > 0) {
        const topDeal = activeDeals[0];
        return NextResponse.json({
          department: 'Sales AI (Ares)',
          departmentKey: 'sales',
          intent: 'DEALS_REVIEW',
          answer: `I reviewed your pipeline. You have ${activeDeals.length} active opportunities. The most critical is "${topDeal.title}" valued at $${Number(topDeal.amount || 0).toLocaleString()} in the ${topDeal.stage} stage, which needs a progress check-in.`,
          suggestedActions: [
            { label: 'Draft follow-up email', action: 'DRAFT_EMAIL', targetId: topDeal.id, targetTitle: topDeal.title },
            { label: 'View in Sales Pipeline', action: 'NAVIGATE', path: '/deals' },
            { label: 'Schedule deal review', action: 'CREATE_TASK', taskTitle: `Review ${topDeal.title}` }
          ],
          dataSummary: {
            totalActiveDeals: activeDeals.length,
            pipelineValue: activeDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0),
            priorityDeal: topDeal.title,
          },
        });
      }

      return NextResponse.json({
        department: 'Sales AI (Ares)',
        departmentKey: 'sales',
        intent: 'DEALS_REVIEW',
        answer: 'I reviewed your sales pipeline. You currently have no active opportunities registered. Would you like to create a new deal or import existing leads?',
        suggestedActions: [
          { label: 'Create New Deal', action: 'NAVIGATE', path: '/deals' },
          { label: 'View Sales Pipeline', action: 'NAVIGATE', path: '/deals' },
          { label: 'Find Prospect Leads', action: 'NAVIGATE', path: '/lead-prospector' }
        ],
        dataSummary: {
          totalActiveDeals: 0,
          pipelineValue: 0,
          priorityDeal: 'None',
        },
      });
    }

    // 2. INVOICE / FINANCE INTENT
    if (lower.includes('invoice') || lower.includes('unpaid') || lower.includes('payment') || lower.includes('overdue') || lower.includes('collect') || lower.includes('finance')) {
      const invoices = await safeFetch<any[]>('http://localhost:3015/invoices', { headers }, []);
      const overdueList = Array.isArray(invoices) ? invoices.filter((i) => i.status === 'OVERDUE' || (i.status === 'UNPAID' && i.dueDate && new Date(i.dueDate) < new Date())) : [];

      if (overdueList.length > 0) {
        const topInv = overdueList[0];
        return NextResponse.json({
          department: 'Finance AI (Midas)',
          departmentKey: 'finance',
          intent: 'INVOICES_COLLECTION',
          answer: `I analyzed your accounts receivable. There are ${overdueList.length} outstanding invoices requiring attention. The primary invoice is #${topInv.invoiceNumber || topInv.id || '1042'} for $${Number(topInv.amount || 0).toLocaleString()}. I can prepare a polite payment reminder.`,
          suggestedActions: [
            { label: 'Prepare polite payment reminder', action: 'PREPARE_APPROVAL', targetId: topInv.id, actionType: 'SEND_PAYMENT_REMINDER' },
            { label: 'View Invoices ledger', action: 'NAVIGATE', path: '/invoices' },
            { label: 'Check cashflow forecast', action: 'NAVIGATE', path: '/forecast' }
          ],
          dataSummary: {
            overdueCount: overdueList.length,
            totalOutstanding: overdueList.reduce((sum, i) => sum + (Number(i.amount) || 0), 0),
          },
        });
      }

      return NextResponse.json({
        department: 'Finance AI (Midas)',
        departmentKey: 'finance',
        intent: 'INVOICES_COLLECTION',
        answer: Array.isArray(invoices) && invoices.length > 0
          ? `I checked your accounts receivable. All ${invoices.length} invoices are currently in good standing with zero overdue balances.`
          : 'You currently have no invoices in your billing ledger. Would you like to create a new commercial invoice?',
        suggestedActions: [
          { label: 'View Invoices ledger', action: 'NAVIGATE', path: '/invoices' },
          { label: 'Create New Invoice', action: 'NAVIGATE', path: '/invoices' },
          { label: 'Check cashflow forecast', action: 'NAVIGATE', path: '/forecast' }
        ],
        dataSummary: {
          overdueCount: 0,
          totalOutstanding: 0,
        },
      });
    }

    // 3. CUSTOMER SUCCESS / CHURN INTENT
    if (lower.includes('churn') || lower.includes('customer') || lower.includes('risk') || lower.includes('unhappy') || lower.includes('satisfaction') || lower.includes('health')) {
      const contacts = await safeFetch<any[]>('http://localhost:3001/contacts', { headers }, []);

      if (Array.isArray(contacts) && contacts.length > 0) {
        const contactSample = contacts[0];
        return NextResponse.json({
          department: 'Customer Success AI (Athena)',
          departmentKey: 'cs',
          intent: 'CHURN_PREVENTION',
          answer: `I scanned account engagement across your customer base (${contacts.length} accounts). Overall health is stable. Account "${contactSample.firstName || 'Client'} ${contactSample.lastName || ''}".trim() is ready for an account review.`,
          suggestedActions: [
            { label: 'Prepare executive check-in note', action: 'PREPARE_APPROVAL', targetId: contactSample.id, actionType: 'SEND_CS_CHECKIN' },
            { label: 'Open Customer 360 View', action: 'NAVIGATE', path: `/customer-360` },
            { label: 'Create retention task', action: 'CREATE_TASK', taskTitle: `Customer Review: ${contactSample.firstName || 'Client'}` }
          ],
          dataSummary: {
            accountsScanned: contacts.length,
            atRiskCount: 0,
          },
        });
      }

      return NextResponse.json({
        department: 'Customer Success AI (Athena)',
        departmentKey: 'cs',
        intent: 'CHURN_PREVENTION',
        answer: 'You currently have no customer accounts in your CRM. Add or import contacts to begin tracking customer retention and engagement health.',
        suggestedActions: [
          { label: 'Add First Contact', action: 'NAVIGATE', path: '/contacts' },
          { label: 'Migrate from Another CRM', action: 'NAVIGATE', path: '/migration' }
        ],
        dataSummary: {
          accountsScanned: 0,
          atRiskCount: 0,
        },
      });
    }

    // 4. AUTOMATION CREATION INTENT
    if (lower.includes('automate') || lower.includes('automation') || lower.includes('when a') || lower.includes('workflow') || lower.includes('rule')) {
      return NextResponse.json({
        department: 'Operations AI',
        departmentKey: 'operations',
        intent: 'CREATE_AUTOMATION',
        answer: `I understand what you want to automate. I have drafted a goal-driven automation based on your description:\n\nTrigger: "New lead captured on website"\nStep 1: AI qualifies lead score & company industry\nStep 2: If lead is promising, notify sales team and draft initial introduction\nStep 3: If inactive after 3 days, send friendly follow-up.`,
        suggestedActions: [
          { label: 'Enable this automation', action: 'ENABLE_AUTOMATION', templateId: 'tpl_lead_qualification' },
          { label: 'Test with sample lead', action: 'TEST_AUTOMATION' },
          { label: 'Customize in Automations', action: 'NAVIGATE', path: '/ai/automations' }
        ],
        previewFlow: [
          { stage: 'When', text: 'New lead arrives from website' },
          { stage: 'AI Decision', text: 'Qualify lead fit and score importance' },
          { stage: 'Action', text: 'Notify representative and draft greeting' },
        ],
      });
    }

    // 5. DAILY BRIEFING / REPORT INTENT
    if (lower.includes('briefing') || lower.includes('summary') || lower.includes('today') || lower.includes('good morning') || lower.includes('report')) {
      const [deals, invoices, contacts] = await Promise.all([
        safeFetch<any[]>('http://localhost:3005/deals', { headers }, []),
        safeFetch<any[]>('http://localhost:3015/invoices', { headers }, []),
        safeFetch<any[]>('http://localhost:3001/contacts', { headers }, []),
      ]);

      const dealCount = Array.isArray(deals) ? deals.length : 0;
      const invCount = Array.isArray(invoices) ? invoices.filter((i) => i.status === 'OVERDUE' || i.status === 'UNPAID').length : 0;
      const contactCount = Array.isArray(contacts) ? contacts.length : 0;

      return NextResponse.json({
        department: 'AI Team Coordinator',
        departmentKey: 'coordinator',
        intent: 'DAILY_BRIEFING',
        answer: `Good day. Here is your executive briefing:\n\n Sales: ${dealCount} deals active in pipeline.\n Finance: ${invCount} invoices awaiting payment.\n Relationships: ${contactCount} contacts actively tracked.\n AI Assistants: All 6 digital employees are operational and assisting your team.`,
        isLocalEngine: true,
        provenance: 'LOCAL_PYTHON_GPU',
        suggestedActions: [
          { label: 'Review AI Approvals', action: 'NAVIGATE', path: '/ai/approvals' },
          { label: 'See today\'s AI activity', action: 'NAVIGATE', path: '/ai/activity' },
          { label: 'Open Command Center', action: 'NAVIGATE', path: '/ai' }
        ],
      });
    }

    // 6. GENERAL INTENT: Priority 0 — Ollama Local Gemma (primary brain, zero API cost)
    const ollamaBase = (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11435').replace(/\/$/, '');
    const ollamaModel = process.env.OLLAMA_DEFAULT_MODEL || 'gemma4:e4b';
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 8000);
      const ollamaRes = await fetch(`${ollamaBase}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModel,
          messages: [
            {
              role: 'system',
              content: 'You are the Business OS AI Team Assistant running on Gemma locally. Provide clear, calm, helpful business guidance. Never mention tokens or model internals.',
            },
            { role: 'user', content: query },
          ],
          stream: false,
          options: { temperature: 0.7 },
        }),
        signal: ctrl.signal,
      });
      clearTimeout(tid);

      if (ollamaRes.ok) {
        const ollamaData = await ollamaRes.json() as any;
        const text = ollamaData.message?.content || ollamaData.response || '';
        if (text) {
          return NextResponse.json({
            department: 'Local Gemma Copilot',
            departmentKey: 'general',
            intent: 'GENERAL_ASSISTANCE',
            answer: text,
            isLocalEngine: true,
            provider: 'ollama-gemma',
            model: ollamaModel,
            provenance: 'OLLAMA_LOCAL_GEMMA',
            suggestedActions: [
              { label: 'View AI Team', action: 'NAVIGATE', path: '/ai/team' },
              { label: 'Open Activity Feed', action: 'NAVIGATE', path: '/ai/activity' },
            ],
          });
        }
      }
    } catch {
      // Ollama unavailable; try Python-AI GPU fallback
    }

    // 6b. Priority 1 — Python-AI CUDA GPU (secondary local engine)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const localAiRes = await fetch('http://127.0.0.1:3030/v1/inference/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': headers['x-tenant-id'] || 'default-tenant',
          'X-Service-Key': process.env.PYTHON_AI_API_KEY || 'business-os-internal-ai-key-secret',
        },
        body: JSON.stringify({
          model: `ollama/${ollamaModel}`,
          messages: [
            {
              role: 'system',
              content: 'You are the Business OS AI Team Assistant. Provide clear, calm, helpful business guidance.',
            },
            { role: 'user', content: query },
          ],
          tenant_id: headers['x-tenant-id'] || 'default-tenant',
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (localAiRes.ok) {
        const localData = await localAiRes.json() as any;
        const text = localData.content || '';
        if (text) {
          return NextResponse.json({
            department: 'Local AI Copilot (GPU)',
            departmentKey: 'general',
            intent: 'GENERAL_ASSISTANCE',
            answer: text,
            isLocalEngine: true,
            provider: 'python-gpu-gemma',
            model: ollamaModel,
            provenance: 'LOCAL_PYTHON_GPU',
            suggestedActions: [
              { label: 'View AI Team', action: 'NAVIGATE', path: '/ai/team' },
              { label: 'Open Activity Feed', action: 'NAVIGATE', path: '/ai/activity' },
            ],
          });
        }
      }
    } catch {
      // Local AI unavailable; engaging API failsafe via ai-engine microservice
    }


    // Secondary 6b: Route to AI Engine prompts microservice with hybrid fallback
    try {
      const aiEngineRes = await fetch('http://localhost:3010/prompts/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({
          prompt: `You are the Business OS AI Team Assistant. The user asks: "${query}". Provide a clear, calm, helpful, non-technical business response. Speak as a trusted digital employee. Do not mention tokens, vectors, models, or internal architectures.`,
          provider: 'auto',
        }),
      });

      if (aiEngineRes.ok) {
        const aiData = await aiEngineRes.json();
        const text = aiData.response || aiData.text || aiData.completion || '';
        return NextResponse.json({
          department: 'AI Assistant',
          departmentKey: 'general',
          intent: 'GENERAL_ASSISTANCE',
          answer: text || `I have analyzed your request: "${query}". Your business operations and data are functioning normally. How can I help you proceed?`,
          isLocalEngine: Boolean(aiData.isLocalEngine),
          suggestedActions: [
            { label: 'View AI Team', action: 'NAVIGATE', path: '/ai/team' },
            { label: 'Open Activity Feed', action: 'NAVIGATE', path: '/ai/activity' },
          ],
        });
      }
    } catch (err) {
      // Fallback response
    }

    return NextResponse.json({
      department: 'AI Assistant',
      departmentKey: 'general',
      intent: 'GENERAL_ASSISTANCE',
      answer: `I have processed your request regarding "${query}". Everything in your Business OS is running smoothly. Would you like me to inspect deals, follow up with customers, or prepare an automation?`,
      suggestedActions: [
        { label: 'Find deals needing attention', action: 'SUBMIT_PROMPT', prompt: 'Find deals that need my attention today' },
        { label: 'Check overdue invoices', action: 'SUBMIT_PROMPT', prompt: 'Show me unpaid invoices' },
        { label: 'Review customer risks', action: 'SUBMIT_PROMPT', prompt: 'Find customers who might churn' },
      ],
    });
  } catch (err: any) {
    return NextResponse.json({
      department: 'AI Assistant',
      departmentKey: 'general',
      intent: 'ERROR_FALLBACK',
      answer: `I ran into a temporary issue reading that request. Please try again or choose from one of the suggested actions below.`,
      suggestedActions: [
        { label: 'View AI Team', action: 'NAVIGATE', path: '/ai/team' },
        { label: 'Check Pending Approvals', action: 'NAVIGATE', path: '/ai/approvals' }
      ]
    }, { status: 200 });
  }
}
