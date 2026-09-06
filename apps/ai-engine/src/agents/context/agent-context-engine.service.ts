import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { KnowledgeService } from '../../knowledge/knowledge.service';
import { AgentMemoryGovernanceService } from '../memory/agent-memory-governance.service';

export interface ContextPackage {
  agentId: string;
  domain: string;
  triggerEvent: string;
  targetSummary: string;
  primaryEntity: Record<string, any> | null;
  relatedEntities: Record<string, any>;
  recentActivities: any[];
  knowledgeSnippets: string[];
  memories: {
    userFacts: string[];
    agentLessons: string[];
    businessFacts: string[];
  };
  tokenEstimate: number;
}

export interface ContextPlan {
  requiredEntities: string[];
  includeKnowledge: boolean;
  knowledgeQuery?: string;
  activityLimit: number;
  memoryEntityId?: string;
}

@Injectable()
export class AgentContextEngineService {
  private readonly logger = new Logger(AgentContextEngineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly knowledgeService: KnowledgeService,
    private readonly memoryGovernance: AgentMemoryGovernanceService,
  ) {}

  /**
   * Plan what information is strictly required for the specific agent and trigger
   */
  planContext(agentId: string, triggerEvent: string, targetEntity?: string): ContextPlan {
    // 1. Ares (Sales Agent)
    if (agentId.includes('sales') || agentId === 'agent_sales') {
      return {
        requiredEntities: ['Deal', 'Contact', 'Company'],
        includeKnowledge: true,
        knowledgeQuery: 'enterprise pricing terms discount policy competitor battlecards',
        activityLimit: 5,
        memoryEntityId: targetEntity,
      };
    }

    // 2. Midas (Finance & Dunning Agent)
    if (agentId.includes('finance') || agentId === 'agent_finance') {
      return {
        requiredEntities: ['Invoice', 'Contact', 'Company'],
        includeKnowledge: true,
        knowledgeQuery: 'payment terms late fee overdue invoice policy dunning schedule',
        activityLimit: 4,
        memoryEntityId: targetEntity,
      };
    }

    // 3. Hermes (Operations & Projects Orchestrator)
    if (agentId.includes('ops') || agentId === 'agent_ops') {
      return {
        requiredEntities: ['Deal', 'Project', 'Employee'],
        includeKnowledge: true,
        knowledgeQuery: 'client onboarding sprint delivery templates SLA commitments',
        activityLimit: 5,
      };
    }

    // 4. Athena & Support Agent (Helpdesk & Churn)
    if (agentId.includes('support') || agentId.includes('csm') || agentId === 'agent_csm') {
      return {
        requiredEntities: ['Ticket', 'Contact'],
        includeKnowledge: true,
        knowledgeQuery: 'support SOP troubleshooting refund SLA policy customer retention',
        activityLimit: 6,
        memoryEntityId: targetEntity,
      };
    }

    // Default selective plan
    return {
      requiredEntities: [targetEntity || 'Contact'],
      includeKnowledge: true,
      knowledgeQuery: triggerEvent.replace(/_/g, ' ').toLowerCase(),
      activityLimit: 3,
      memoryEntityId: targetEntity,
    };
  }

  /**
   * Assemble a token-efficient, targeted Context Package for the LLM
   */
  async assembleContext(options: {
    tenantId: string;
    agentId: string;
    triggerEvent: string;
    targetEntity?: string;
    targetId?: string;
    triggerPayload?: Record<string, any>;
  }): Promise<ContextPackage> {
    const { tenantId, agentId, triggerEvent, targetEntity, targetId, triggerPayload = {} } = options;
    const plan = this.planContext(agentId, triggerEvent, targetEntity);

    this.logger.log(`[Context Engine] Assembling tailored Context Package for Agent ${agentId} on ${triggerEvent}`);

    let primaryEntity: Record<string, any> | null = null;
    const relatedEntities: Record<string, any> = {};
    let recentActivities: any[] = [];
    const knowledgeSnippets: string[] = [];

    // 1. Fetch Primary Entity (e.g. Deal, Invoice, Contact, Ticket)
    try {
      if (targetEntity === 'Deal' && targetId) {
        const deal = await this.prisma.deal.findFirst({
          where: { id: targetId, tenantId },
          include: { company: true },
        });
        if (deal) {
          let contact: any = null;
          if (deal.contactId) {
            contact = await this.prisma.contact.findFirst({
              where: { id: deal.contactId, tenantId },
            });
          }
          primaryEntity = {
            id: deal.id,
            title: deal.title,
            amount: deal.amount,
            stage: deal.stage,
            companyName: deal.company?.name,
            contactName: contact ? `${contact.firstName} ${contact.lastName}` : null,
            contactEmail: contact?.email,
          };
          // Also fetch recent deal activities
          recentActivities = await this.prisma.activity.findMany({
            where: { dealId: deal.id, tenantId },
            orderBy: { createdAt: 'desc' },
            take: plan.activityLimit,
          });
        }
      } else if (targetEntity === 'Invoice' && targetId) {
        const inv = await this.prisma.invoice.findFirst({
          where: { id: targetId, tenantId },
          include: { lineItems: true },
        });
        if (inv) {
          const now = Date.now();
          const dueTime = new Date(inv.dueDate).getTime();
          const daysOverdue = dueTime < now ? Math.floor((now - dueTime) / (1000 * 86400)) : 0;
          primaryEntity = {
            id: inv.id,
            invoiceNum: inv.invoiceNum,
            amount: inv.amount,
            status: inv.status,
            dueDate: inv.dueDate,
            daysOverdue,
            customerEmail: null,
            customerName: 'Client',
            itemCount: inv.lineItems?.length || 0,
          };
        }
      } else if (targetEntity === 'Ticket' && targetId) {
        const ticket = await this.prisma.ticket.findFirst({
          where: { id: targetId, tenantId },
          include: { messages: { take: 4, orderBy: { createdAt: 'desc' } } },
        });
        if (ticket) {
          primaryEntity = {
            id: ticket.id,
            title: ticket.title,
            priority: ticket.priority,
            status: ticket.status,
            messages: ticket.messages.map((m) => `[${m.isStaff ? 'Staff' : 'User'}]: ${m.content}`),
          };
        }
      } else if (targetEntity === 'Contact' && targetId) {
        const contact = await this.prisma.contact.findFirst({
          where: { id: targetId, tenantId },
          include: { company: true },
        });
        if (contact) {
          primaryEntity = {
            id: contact.id,
            name: `${contact.firstName} ${contact.lastName}`,
            email: contact.email,
            phone: contact.phone,
            company: contact.company?.name,
          };
        }
      }
    } catch (err: any) {
      this.logger.warn(`[Context Engine] Primary entity fetch error: ${err.message}`);
    }

    // Fallback to trigger payload if entity was not in DB
    if (!primaryEntity && Object.keys(triggerPayload).length > 0) {
      primaryEntity = { ...triggerPayload, id: targetId || 'synthetic_id' };
    }

    // 2. Fetch Targeted Knowledge Base RAG Snippets
    if (plan.includeKnowledge && plan.knowledgeQuery) {
      try {
        const docs = await this.knowledgeService.search(tenantId, plan.knowledgeQuery, 2);
        for (const doc of docs) {
          knowledgeSnippets.push(`[${doc.title}]: ${doc.content.slice(0, 300)}...`);
        }
      } catch (err: any) {
        this.logger.warn(`[Context Engine] Knowledge search deferred: ${err.message}`);
      }
    }

    // 3. Fetch Governed Memories
    const categorizedMemories = await this.memoryGovernance.getCategorizedMemories(
      tenantId,
      agentId,
      targetId
    );

    const targetSummary = primaryEntity
      ? `${targetEntity || 'Target'}: ${primaryEntity.title || primaryEntity.name || primaryEntity.invoiceNum || targetId}`
      : `Event: ${triggerEvent}`;

    // Calculate approximate token count for budgeting
    const serialized = JSON.stringify({ primaryEntity, relatedEntities, recentActivities, knowledgeSnippets });
    const tokenEstimate = Math.ceil(serialized.length / 4);

    return {
      agentId,
      domain: agentId.replace('agent_', '').toUpperCase(),
      triggerEvent,
      targetSummary,
      primaryEntity,
      relatedEntities,
      recentActivities,
      knowledgeSnippets,
      memories: {
        userFacts: categorizedMemories.userMemories.map((m) => `${m.key}: ${m.value}`),
        agentLessons: categorizedMemories.agentMemories.map((m) => `${m.key}: ${m.value}`),
        businessFacts: categorizedMemories.businessMemories.map((m) => `${m.key}: ${m.value}`),
      },
      tokenEstimate,
    };
  }
}
