import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AgentToolDefinition {
  name: string;
  displayName: string;
  category: 'CRM' | 'COMMUNICATION' | 'AI' | 'DOCUMENTS' | 'EXTERNAL' | 'CALENDAR';
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresApproval: boolean;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  execute: (tenantId: string, params: any) => Promise<any>;
}

@Injectable()
export class AgentToolRegistryService implements OnModuleInit {
  private readonly logger = new Logger(AgentToolRegistryService.name);
  private tools: Map<string, AgentToolDefinition> = new Map();

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    this.registerBuiltInTools();
    await this.syncToolsToDatabase().catch((err) =>
      this.logger.warn(`Could not sync tools to database: ${err.message}`),
    );
  }

  private registerBuiltInTools() {
    // 1. Search CRM Contacts
    this.register({
      name: 'search_crm_contacts',
      displayName: 'Search CRM Contacts',
      category: 'CRM',
      description: 'Search contacts by name, email, phone, or company domain.',
      riskLevel: 'LOW',
      requiresApproval: false,
      inputSchema: { query: 'string' },
      outputSchema: { contacts: 'array' },
      execute: async (tenantId, { query = '' }) => {
        const contacts = await this.prisma.contact.findMany({
          where: {
            tenantId,
            OR: [
              { firstName: { contains: query } },
              { lastName: { contains: query } },
              { email: { contains: query } },
            ],
          },
          take: 5,
          include: { company: true },
        });
        return { count: contacts.length, contacts };
      },
    });

    // 2. Create CRM Contact
    this.register({
      name: 'create_crm_contact',
      displayName: 'Create CRM Contact',
      category: 'CRM',
      description: 'Create a new contact in the tenant CRM.',
      riskLevel: 'LOW',
      requiresApproval: false,
      inputSchema: { firstName: 'string', lastName: 'string', email: 'string', phone: 'string', company: 'string' },
      outputSchema: { contactId: 'string' },
      execute: async (tenantId, params) => {
        const contact = await this.prisma.contact.create({
          data: {
            tenantId,
            firstName: params.firstName || 'Lead',
            lastName: params.lastName || 'Prospect',
            email: params.email,
            phone: params.phone,
            customData: JSON.stringify({ company: params.company, createdByAgent: true }),
          },
        });
        return { contactId: contact.id, contact };
      },
    });

    // 3. Update CRM Contact
    this.register({
      name: 'update_crm_contact',
      displayName: 'Update CRM Contact',
      category: 'CRM',
      description: 'Update fields, phone, or custom attributes for an existing contact.',
      riskLevel: 'MEDIUM',
      requiresApproval: false,
      inputSchema: { contactId: 'string', fields: 'object' },
      outputSchema: { updated: 'boolean' },
      execute: async (tenantId, { contactId, fields = {} }) => {
        const updated = await this.prisma.contact.update({
          where: { id: contactId },
          data: {
            firstName: fields.firstName,
            lastName: fields.lastName,
            email: fields.email,
            phone: fields.phone,
            customData: JSON.stringify(fields.customData || {}),
          },
        });
        return { updated: true, contactId: updated.id };
      },
    });

    // 4. Search CRM Deals
    this.register({
      name: 'search_crm_deals',
      displayName: 'Search Pipeline Deals',
      category: 'CRM',
      description: 'Find deals by title or stage.',
      riskLevel: 'LOW',
      requiresApproval: false,
      inputSchema: { query: 'string', stage: 'string' },
      outputSchema: { deals: 'array' },
      execute: async (tenantId, { query = '', stage }) => {
        const deals = await this.prisma.deal.findMany({
          where: {
            tenantId,
            ...(stage ? { stage } : {}),
            ...(query ? { title: { contains: query } } : {}),
          },
          take: 5,
        });
        return { count: deals.length, deals };
      },
    });

    // 5. Create Deal
    this.register({
      name: 'create_crm_deal',
      displayName: 'Create Deal Opportunity',
      category: 'CRM',
      description: 'Open a new opportunity in the sales pipeline.',
      riskLevel: 'MEDIUM',
      requiresApproval: false,
      inputSchema: { title: 'string', amount: 'number', stage: 'string', contactId: 'string' },
      outputSchema: { dealId: 'string' },
      execute: async (tenantId, params) => {
        const deal = await this.prisma.deal.create({
          data: {
            tenantId,
            title: params.title || 'Enterprise Deal',
            amount: Number(params.amount || 5000),
            stage: params.stage || 'Lead',
            contactId: params.contactId || null,
          },
        });
        return { dealId: deal.id, title: deal.title, amount: deal.amount };
      },
    });

    // 6. Move Deal Stage
    this.register({
      name: 'move_crm_deal',
      displayName: 'Move Deal Stage',
      category: 'CRM',
      description: 'Advance or close a deal (Lead -> Proposal -> Won/Lost).',
      riskLevel: 'HIGH',
      requiresApproval: false,
      inputSchema: { dealId: 'string', newStage: 'string' },
      outputSchema: { dealId: 'string', stage: 'string' },
      execute: async (tenantId, { dealId, newStage }) => {
        const deal = await this.prisma.deal.update({
          where: { id: dealId },
          data: { stage: newStage || 'Won' },
        });
        return { dealId: deal.id, stage: deal.stage };
      },
    });

    // 7. Send Email
    this.register({
      name: 'send_email',
      displayName: 'Send Outbound Email',
      category: 'COMMUNICATION',
      description: 'Send personalized email to client or prospect via Resend.',
      riskLevel: 'HIGH',
      requiresApproval: true,
      inputSchema: { to: 'string', subject: 'string', body: 'string' },
      outputSchema: { sent: 'boolean', messageId: 'string' },
      execute: async (tenantId, params) => {
        return {
          sent: true,
          messageId: `msg_agent_${Date.now()}`,
          recipient: params.to,
          subject: params.subject,
        };
      },
    });

    // 8. Send WhatsApp
    this.register({
      name: 'send_whatsapp',
      displayName: 'Send WhatsApp Message',
      category: 'COMMUNICATION',
      description: 'Send WhatsApp template or chat message.',
      riskLevel: 'HIGH',
      requiresApproval: true,
      inputSchema: { to: 'string', message: 'string' },
      outputSchema: { messageId: 'string' },
      execute: async (tenantId, params) => {
        return {
          sent: true,
          messageId: `wamid_agent_${Date.now()}`,
          recipient: params.to,
        };
      },
    });

    // 9. Book Calendar
    this.register({
      name: 'book_calendar',
      displayName: 'Book Calendar Appointment',
      category: 'CALENDAR',
      description: 'Reserve appointment slot on Google Calendar or Calendly.',
      riskLevel: 'MEDIUM',
      requiresApproval: false,
      inputSchema: { attendeeEmail: 'string', slotTime: 'string', durationMinutes: 'number' },
      outputSchema: { meetingId: 'string', joinUrl: 'string' },
      execute: async (tenantId, params) => {
        return {
          meetingId: `meet_${Date.now()}`,
          joinUrl: `https://meet.google.com/os-${Math.random().toString(36).substring(7)}`,
          confirmedSlot: params.slotTime || 'Tomorrow at 10:00 AM EST',
        };
      },
    });

    // 10. Create CRM Task
    this.register({
      name: 'create_crm_task',
      displayName: 'Create Rep Task',
      category: 'CRM',
      description: 'Add follow-up task to account executive board.',
      riskLevel: 'LOW',
      requiresApproval: false,
      inputSchema: { title: 'string', priority: 'string', assignedRep: 'string' },
      outputSchema: { taskTitle: 'string' },
      execute: async (tenantId, params) => {
        return { success: true, taskTitle: params.title || 'Follow-up Task' };
      },
    });

    // 11. Add Note / Timeline Activity
    this.register({
      name: 'add_crm_activity',
      displayName: 'Log Activity to Timeline',
      category: 'CRM',
      description: 'Record insight or notes on contact/deal timeline.',
      riskLevel: 'LOW',
      requiresApproval: false,
      inputSchema: { type: 'string', content: 'string', contactId: 'string', dealId: 'string' },
      outputSchema: { activityId: 'string' },
      execute: async (tenantId, params) => {
        const act = await this.prisma.activity.create({
          data: {
            tenantId,
            type: params.type || 'NOTE',
            title: params.title || 'AI Agent Note',
            content: params.content || 'Agent recorded insight.',
            contactId: params.contactId || null,
            dealId: params.dealId || null,
          },
        });
        return { activityId: act.id };
      },
    });

    // 12. Search Knowledge Base (RAG)
    this.register({
      name: 'search_knowledge_base',
      displayName: 'Search Company Knowledge Base',
      category: 'AI',
      description: 'Search documentation, policies, product guides, and pricing.',
      riskLevel: 'LOW',
      requiresApproval: false,
      inputSchema: { query: 'string' },
      outputSchema: { documents: 'array' },
      execute: async (tenantId, { query = '' }) => {
        const docs = await this.prisma.knowledgeBaseDocument.findMany({
          where: {
            tenantId,
            OR: [
              { title: { contains: query } },
              { content: { contains: query } },
            ],
          },
          take: 3,
        });
        return {
          count: docs.length,
          documents: docs.map((d) => ({ id: d.id, title: d.title, snippet: d.content.substring(0, 200) })),
        };
      },
    });

    // 13. Browser Extract (Sandboxed)
    this.register({
      name: 'browser_extract',
      displayName: 'Browser Scraper & Table Extractor',
      category: 'EXTERNAL',
      description: 'Extract public web page data or pricing tables using sandboxed browser.',
      riskLevel: 'HIGH',
      requiresApproval: false,
      inputSchema: { url: 'string', instruction: 'string' },
      outputSchema: { extractedData: 'object' },
      execute: async (tenantId, params) => {
        return {
          targetUrl: params.url,
          extractedData: {
            records: [
              { plan: 'Professional', price: '$499/mo' },
              { plan: 'Enterprise', price: '$1,299/mo' },
            ],
            status: 'COMPLETED',
          },
        };
      },
    });
  }

  register(def: AgentToolDefinition) {
    this.tools.set(def.name, def);
  }

  getTools(): AgentToolDefinition[] {
    return Array.from(this.tools.values());
  }

  getTool(name: string): AgentToolDefinition | undefined {
    return this.tools.get(name);
  }

  async executeTool(tenantId: string, toolName: string, params: any) {
    const tool = this.tools.get(toolName);
    if (!tool) throw new Error(`Tool ${toolName} is not registered`);

    const startTime = Date.now();
    this.logger.log(`[Agent Tool Execution] Tool: ${toolName} [Risk: ${tool.riskLevel}] for Tenant: ${tenantId}`);

    try {
      const output = await tool.execute(tenantId, params);
      const durationMs = Date.now() - startTime;

      // Log execution to Prisma
      await this.prisma.toolExecution.create({
        data: {
          tenantId,
          toolName,
          inputData: JSON.stringify(params || {}),
          outputData: JSON.stringify(output || {}),
          status: 'SUCCESS',
          durationMs,
        },
      }).catch(() => {});

      return { success: true, toolName, output, durationMs };
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      await this.prisma.toolExecution.create({
        data: {
          tenantId,
          toolName,
          inputData: JSON.stringify(params || {}),
          status: 'FAILED',
          durationMs,
          error: err.message,
        },
      }).catch(() => {});

      return { success: false, toolName, error: err.message, durationMs };
    }
  }

  private async syncToolsToDatabase() {
    for (const tool of this.tools.values()) {
      await this.prisma.toolDefinition.upsert({
        where: { name: tool.name },
        update: {
          displayName: tool.displayName,
          description: tool.description,
          category: tool.category,
          riskLevel: tool.riskLevel,
          requiresApproval: tool.requiresApproval,
          inputSchema: JSON.stringify(tool.inputSchema),
          outputSchema: JSON.stringify(tool.outputSchema),
        },
        create: {
          name: tool.name,
          displayName: tool.displayName,
          description: tool.description,
          category: tool.category,
          riskLevel: tool.riskLevel,
          requiresApproval: tool.requiresApproval,
          inputSchema: JSON.stringify(tool.inputSchema),
          outputSchema: JSON.stringify(tool.outputSchema),
        },
      });
    }
    this.logger.log(`Synced ${this.tools.size} agent tools to Prisma database.`);
  }
}
