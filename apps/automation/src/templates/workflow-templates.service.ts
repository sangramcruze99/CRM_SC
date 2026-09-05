import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface WorkflowTemplateData {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  author: string;
  requiredIntegrations: string[];
  requiredCredentials: string[];
  nodes: any[];
  edges: any[];
  variables: Record<string, any>;
}

@Injectable()
export class WorkflowTemplatesService implements OnModuleInit {
  private readonly logger = new Logger(WorkflowTemplatesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaultTemplates();
  }

  private async seedDefaultTemplates() {
    const templates: WorkflowTemplateData[] = [
      {
        id: 'tmpl_ai_lead_qual',
        name: 'AI Lead Qualification & Fast-Track Routing',
        description: 'Enriches inbound leads with Apollo-style data, calculates ICP score, assigns owner, and alerts sales Slack.',
        category: 'Sales',
        version: '1.2.0',
        author: 'Business OS Enterprise Team',
        requiredIntegrations: ['crm', 'slack'],
        requiredCredentials: ['SLACK_BOT_TOKEN'],
        variables: { minScoreForFastTrack: 75, targetSlackChannel: '#hot-leads' },
        nodes: [
          { id: '1', type: 'trigger:new_lead', position: { x: 100, y: 150 }, data: { title: 'New Lead Ingested' } },
          { id: '2', type: 'ai:score', position: { x: 350, y: 150 }, data: { title: 'AI ICP Score Evaluation' } },
          { id: '3', type: 'logic:if_else', position: { x: 600, y: 150 }, data: { title: 'Score >= 75?' } },
          { id: '4', type: 'crm:create_deal', position: { x: 850, y: 50 }, data: { title: 'Create Fast-Track Deal' } },
          { id: '5', type: 'comm:slack', position: { x: 1100, y: 50 }, data: { title: 'Notify Reps in Slack' } },
          { id: '6', type: 'crm:add_activity', position: { x: 850, y: 250 }, data: { title: 'Queue for Low-Touch Nurture' } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
          { id: 'e3-4', source: '3', target: '4', sourceHandle: 'true' },
          { id: 'e4-5', source: '4', target: '5' },
          { id: 'e3-6', source: '3', target: '6', sourceHandle: 'false' },
        ],
      },
      {
        id: 'tmpl_whatsapp_sales',
        name: 'WhatsApp Autonomous Sales Concierge',
        description: 'Engages inbound WhatsApp leads, qualifies budget and intent via natural language, and books appointments.',
        category: 'WhatsApp',
        version: '2.0.0',
        author: 'Business OS Enterprise Team',
        requiredIntegrations: ['whatsapp', 'crm', 'calendar'],
        requiredCredentials: ['WHATSAPP_ACCESS_TOKEN'],
        variables: { defaultGreeting: 'Hi! How can we assist your business today?' },
        nodes: [
          { id: '1', type: 'trigger:whatsapp_received', position: { x: 100, y: 150 }, data: { title: 'WhatsApp Message Inbound' } },
          { id: '2', type: 'ai:agent', position: { x: 350, y: 150 }, data: { title: 'AI Conversational Agent' } },
          { id: '3', type: 'logic:if_else', position: { x: 600, y: 150 }, data: { title: 'High Intent Detected?' } },
          { id: '4', type: 'comm:calendar', position: { x: 850, y: 50 }, data: { title: 'Book Discovery Call' } },
          { id: '5', type: 'comm:whatsapp', position: { x: 1100, y: 50 }, data: { title: 'Send Calendar Confirmation' } },
          { id: '6', type: 'comm:whatsapp', position: { x: 850, y: 250 }, data: { title: 'Send FAQ Guide' } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
          { id: 'e3-4', source: '3', target: '4', sourceHandle: 'true' },
          { id: 'e4-5', source: '4', target: '5' },
          { id: 'e3-6', source: '3', target: '6', sourceHandle: 'false' },
        ],
      },
      {
        id: 'tmpl_missed_call_recovery',
        name: 'Missed Call Rapid AI Recovery',
        description: 'Detects unanswered calls and dispatches instant SMS / WhatsApp follow-ups within 15 seconds.',
        category: 'Voice',
        version: '1.1.0',
        author: 'Business OS Telephony',
        requiredIntegrations: ['twilio', 'whatsapp'],
        requiredCredentials: ['TWILIO_ACCOUNT_SID'],
        variables: { waitSeconds: 15 },
        nodes: [
          { id: '1', type: 'trigger:call_received', position: { x: 100, y: 150 }, data: { title: 'Missed Inbound Call' } },
          { id: '2', type: 'comm:sms', position: { x: 350, y: 150 }, data: { title: 'Instant SMS: Sorry we missed you!' } },
          { id: '3', type: 'comm:whatsapp', position: { x: 600, y: 150 }, data: { title: 'Send Interactive Booking Card' } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
        ],
      },
      {
        id: 'tmpl_invoice_processing',
        name: 'Autonomous OCR Invoice & Dual Khata Reconciler',
        description: 'Parses uploaded vendor bills with vision AI, extracts line items, applies tax rules, and creates Dual Khata ledger entry.',
        category: 'Finance',
        version: '1.5.0',
        author: 'Business OS Finance Ops',
        requiredIntegrations: ['documents', 'finance'],
        requiredCredentials: [],
        variables: { autoApproveUnder: 1000 },
        nodes: [
          { id: '1', type: 'trigger:document_uploaded', position: { x: 100, y: 150 }, data: { title: 'Invoice Deposited' } },
          { id: '2', type: 'doc:ocr', position: { x: 350, y: 150 }, data: { title: 'Neural Vision Extraction' } },
          { id: '3', type: 'logic:human_approval', position: { x: 600, y: 150 }, data: { title: 'CFO Approval (if > $1,000)' } },
          { id: '4', type: 'crm:add_activity', position: { x: 850, y: 150 }, data: { title: 'Post to Dual Khata Ledger' } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
          { id: 'e3-4', source: '3', target: '4', sourceHandle: 'approved' },
        ],
      },
      {
        id: 'tmpl_recruitment_screening',
        name: 'Autonomous Recruitment Resume Screener & Scheduler',
        description: 'Parses incoming candidate resumes via OCR, scores against job description, and schedules interviews.',
        category: 'HR',
        version: '1.0.0',
        author: 'Business OS People Team',
        requiredIntegrations: ['hr', 'documents', 'calendar'],
        requiredCredentials: [],
        variables: { targetRole: 'Senior Full Stack Engineer' },
        nodes: [
          { id: '1', type: 'trigger:document_uploaded', position: { x: 100, y: 150 }, data: { title: 'Candidate Resume Ingested' } },
          { id: '2', type: 'doc:ocr', position: { x: 350, y: 150 }, data: { title: 'Extract Experience & Skills' } },
          { id: '3', type: 'ai:score', position: { x: 600, y: 150 }, data: { title: 'Evaluate Fit against JD' } },
          { id: '4', type: 'comm:calendar', position: { x: 850, y: 150 }, data: { title: 'Send Interview Self-Scheduler' } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
          { id: 'e3-4', source: '3', target: '4' },
        ],
      },
      {
        id: 'tmpl_abandoned_cart_recovery',
        name: 'Shopify Abandoned Cart Omnichannel Recovery',
        description: 'Recovers lost e-commerce revenue by sending sequence across WhatsApp, Email, and dynamic discount links.',
        category: 'Ecommerce',
        version: '1.3.0',
        author: 'Business OS E-Commerce',
        requiredIntegrations: ['shopify', 'whatsapp', 'resend'],
        requiredCredentials: [],
        variables: { discountPercent: 10, waitMinutes: 60 },
        nodes: [
          { id: '1', type: 'trigger:website_event', position: { x: 100, y: 150 }, data: { title: 'Cart Abandoned (60 min)' } },
          { id: '2', type: 'comm:whatsapp', position: { x: 350, y: 150 }, data: { title: 'WhatsApp Reminder + 10% Off' } },
          { id: '3', type: 'logic:delay', position: { x: 600, y: 150 }, data: { title: 'Wait 24 Hours' } },
          { id: '4', type: 'comm:email', position: { x: 850, y: 150 }, data: { title: 'Final Email Last-Chance Alert' } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
          { id: 'e3-4', source: '3', target: '4' },
        ],
      },
      {
        id: 'tmpl_content_autopilot',
        name: 'Autonomous Content Optimization & Repurposing Loop',
        description: 'Analyzes engagement metrics, repurposes top-performing threads into 5 formats, and schedules broadcasts.',
        category: 'Content',
        version: '2.1.0',
        author: 'Business OS Social Growth',
        requiredIntegrations: ['ai', 'crm'],
        requiredCredentials: [],
        variables: { repurposeFormats: ['LinkedIn', 'Twitter', 'Newsletter', 'Instagram'] },
        nodes: [
          { id: '1', type: 'trigger:schedule', position: { x: 100, y: 150 }, data: { title: 'Weekly Content Sweep (Monday 8am)' } },
          { id: '2', type: 'ai:agent', position: { x: 350, y: 150 }, data: { title: 'Content Performance Sentinel' } },
          { id: '3', type: 'ai:generate', position: { x: 600, y: 150 }, data: { title: 'Generate Multi-Format Derivatives' } },
          { id: '4', type: 'logic:human_approval', position: { x: 850, y: 150 }, data: { title: 'Social Editor Sign-Off' } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
          { id: 'e3-4', source: '3', target: '4' },
        ],
      },
      {
        id: 'tmpl_voice_receptionist',
        name: 'AI Voice Receptionist & Smart Triage',
        description: 'Answers telephone calls, provides business hours & pricing FAQs, and transfers VIPs to account reps.',
        category: 'Voice',
        version: '1.4.0',
        author: 'Business OS Telephony',
        requiredIntegrations: ['twilio', 'crm'],
        requiredCredentials: [],
        variables: { repDirectNumber: '+15550192834' },
        nodes: [
          { id: '1', type: 'trigger:call_received', position: { x: 100, y: 150 }, data: { title: 'Inbound Customer Call' } },
          { id: '2', type: 'comm:voice_call', position: { x: 350, y: 150 }, data: { title: 'Voice Receptionist Agent' } },
          { id: '3', type: 'crm:add_activity', position: { x: 600, y: 150 }, data: { title: 'Log Call Audio & Transcript' } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
        ],
      },
      {
        id: 'tmpl_browser_extraction',
        name: 'Sandboxed Browser Competitor & Pricing Scraper',
        description: 'Executes sandboxed browser sessions to extract competitor pricing tables and inject into CRM pricebooks.',
        category: 'Browser',
        version: '1.0.0',
        author: 'Business OS Research Ops',
        requiredIntegrations: ['browser', 'crm'],
        requiredCredentials: [],
        variables: { competitorUrl: 'https://example.com/pricing' },
        nodes: [
          { id: '1', type: 'trigger:schedule', position: { x: 100, y: 150 }, data: { title: 'Weekly Research Schedule' } },
          { id: '2', type: 'ext:browser_agent', position: { x: 350, y: 150 }, data: { title: 'Extract Pricing Table' } },
          { id: '3', type: 'crm:add_activity', position: { x: 600, y: 150 }, data: { title: 'Update Market Intelligence Log' } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
          { id: 'e2-3', source: '2', target: '3' },
        ],
      },
    ];

    for (const t of templates) {
      await this.prisma.workflowTemplate.upsert({
        where: { id: t.id },
        update: {
          name: t.name,
          description: t.description,
          category: t.category,
          version: t.version,
          author: t.author,
          requiredIntegrations: JSON.stringify(t.requiredIntegrations),
          requiredCredentials: JSON.stringify(t.requiredCredentials),
          nodes: JSON.stringify(t.nodes),
          edges: JSON.stringify(t.edges),
          variables: JSON.stringify(t.variables),
        },
        create: {
          id: t.id,
          name: t.name,
          description: t.description,
          category: t.category,
          version: t.version,
          author: t.author,
          requiredIntegrations: JSON.stringify(t.requiredIntegrations),
          requiredCredentials: JSON.stringify(t.requiredCredentials),
          nodes: JSON.stringify(t.nodes),
          edges: JSON.stringify(t.edges),
          variables: JSON.stringify(t.variables),
        },
      });
    }

    this.logger.log(`Initialized ${templates.length} pre-built enterprise workflow templates.`);
  }

  async getTemplates(category?: string) {
    const where: any = { isPublished: true };
    if (category && category !== 'ALL') {
      where.category = category;
    }

    const templates = await this.prisma.workflowTemplate.findMany({
      where,
      orderBy: { usageCount: 'desc' },
    });

    return templates.map((t) => ({
      ...t,
      requiredIntegrations: t.requiredIntegrations ? JSON.parse(t.requiredIntegrations) : [],
      requiredCredentials: t.requiredCredentials ? JSON.parse(t.requiredCredentials) : [],
      nodes: t.nodes ? JSON.parse(t.nodes) : [],
      edges: t.edges ? JSON.parse(t.edges) : [],
      variables: t.variables ? JSON.parse(t.variables) : {},
    }));
  }

  async getTemplateById(id: string) {
    const t = await this.prisma.workflowTemplate.findUnique({ where: { id } });
    if (!t) throw new Error('Template not found');

    return {
      ...t,
      requiredIntegrations: t.requiredIntegrations ? JSON.parse(t.requiredIntegrations) : [],
      requiredCredentials: t.requiredCredentials ? JSON.parse(t.requiredCredentials) : [],
      nodes: t.nodes ? JSON.parse(t.nodes) : [],
      edges: t.edges ? JSON.parse(t.edges) : [],
      variables: t.variables ? JSON.parse(t.variables) : {},
    };
  }

  async cloneTemplateToWorkflow(tenantId: string, templateId: string, customName?: string) {
    const template = await this.getTemplateById(templateId);

    // Create live Workflow in tenant
    const workflow = await this.prisma.workflow.create({
      data: {
        tenantId,
        name: customName || template.name,
        description: template.description,
        isActive: true,
        triggerType: template.nodes[0]?.type || 'MANUAL',
        triggerData: JSON.stringify({
          sourceTemplateId: template.id,
          nodes: template.nodes,
          edges: template.edges,
          variables: template.variables,
        }),
      },
    });

    // Increment usage count
    await this.prisma.workflowTemplate.update({
      where: { id: templateId },
      data: { usageCount: { increment: 1 } },
    });

    this.logger.log(`Cloned template ${template.name} into Workflow ${workflow.id} for Tenant ${tenantId}`);
    return workflow;
  }
}
