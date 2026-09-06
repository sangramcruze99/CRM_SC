import { Injectable, OnModuleInit, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface MarketplaceSeedItem {
  id: string;
  type: 'AGENT' | 'WORKFLOW' | 'INTEGRATION' | 'TEMPLATE' | 'AUTOMATION_PACK';
  name: string;
  description: string;
  version: string;
  category: string;
  publisherId: string;
  icon?: string;
  permissions: string[];
  requiredIntegrations: string[];
  configurationSchema?: Record<string, any>;
  pricing?: Record<string, any>;
  status: 'PUBLISHED';
}

@Injectable()
export class PluginsService implements OnModuleInit {
  private readonly logger = new Logger(PluginsService.name);

  // Production Stage 3 Agent & Workflow Marketplace Items
  private static marketplaceCatalog: MarketplaceSeedItem[] = [
    {
      id: 'mkt_lead_qual',
      type: 'WORKFLOW',
      name: 'Lead Qualification & Pipeline Accelerator',
      category: 'Sales & Inbound',
      publisherId: 'System Core',
      description: 'Automatically qualifies inbound leads, computes ICP match score, injects qualified opportunities into CRM, and drafts outreach.',
      version: '1.2.0',
      icon: 'UserPlus',
      permissions: ['crm:read_contacts', 'crm:write_contacts', 'sales:write_deals', 'email:send_email'],
      requiredIntegrations: ['CRM', 'Sales', 'Email Provider'],
      configurationSchema: { minimumScore: 80, autoCreateDeal: true },
      pricing: { model: 'FREE_TIER' },
      status: 'PUBLISHED',
    },
    {
      id: 'mkt_ares_velocity',
      type: 'AGENT',
      name: 'Ares Sales Velocity Sentinel',
      category: 'Sales & Growth',
      publisherId: 'AI Intelligence Division',
      description: 'Autonomous sales closer that detects pipeline stalling, Formulates structured revival plans, and coordinates supervised touchpoints.',
      version: '2.1.0',
      icon: 'Briefcase',
      permissions: ['sales:read_deals', 'sales:write_deals', 'crm:write_activities', 'email:send_email'],
      requiredIntegrations: ['Sales Engine', 'CRM Activities'],
      configurationSchema: { inactivityThresholdDays: 10, maxAutoApproveDealValue: 25000 },
      pricing: { model: 'INCLUDED' },
      status: 'PUBLISHED',
    },
    {
      id: 'mkt_athena_retention',
      type: 'AGENT',
      name: 'Athena Customer Success Sentinel',
      category: 'Customer Success',
      publisherId: 'AI Intelligence Division',
      description: 'Monitors support sentiment, tracks SLA breaches, predicts customer churn signals, and escalates to dedicated Customer Success Managers.',
      version: '2.0.0',
      icon: 'ShieldAlert',
      permissions: ['helpdesk:read_tickets', 'helpdesk:write_tickets', 'crm:read_contacts', 'notifications:send_slack'],
      requiredIntegrations: ['Helpdesk Engine', 'Slack Connector'],
      configurationSchema: { sentimentAlertThreshold: 'NEGATIVE', urgentResponseMins: 15 },
      pricing: { model: 'INCLUDED' },
      status: 'PUBLISHED',
    },
    {
      id: 'mkt_midas_recovery',
      type: 'WORKFLOW',
      name: 'Midas Smart Invoice Recovery & Dunning',
      category: 'Finance & Billing',
      publisherId: 'Financial OS',
      description: 'Proactively identifies overdue receivables, evaluates aging terms, generates Stripe payment links, and manages progressive notices.',
      version: '1.5.0',
      icon: 'DollarSign',
      permissions: ['finance:read_invoices', 'finance:write_invoices', 'email:send_email', 'payments:create_links'],
      requiredIntegrations: ['Finance Engine', 'Stripe Connector'],
      configurationSchema: { gracePeriodDays: 3, reminderCadenceDays: [3, 7, 14, 30] },
      pricing: { model: 'INCLUDED' },
      status: 'PUBLISHED',
    },
    {
      id: 'mkt_hermes_onboarding',
      type: 'WORKFLOW',
      name: 'Hermes Client Onboarding Handover',
      category: 'Operations & Delivery',
      publisherId: 'Delivery OS',
      description: 'Triggers on Closed Won deals, parses signed agreements, scaffolds project sprint boards, delegates kickoff tasks, and sends welcome kits.',
      version: '1.4.0',
      icon: 'CheckCircle',
      permissions: ['sales:read_deals', 'projects:write_projects', 'projects:write_tasks', 'email:send_email'],
      requiredIntegrations: ['Sales', 'Projects Engine', 'Email Provider'],
      configurationSchema: { templateProjectName: 'Enterprise Onboarding Sprint' },
      pricing: { model: 'INCLUDED' },
      status: 'PUBLISHED',
    },
    {
      id: 'mkt_pack_sales_expansion',
      type: 'AUTOMATION_PACK',
      name: 'Revenue Acceleration Master Pack',
      category: 'Automation Packs',
      publisherId: 'Enterprise Bundles',
      description: 'Complete cross-department revenue automation bundle: Lead Qualification DAG + Ares Sales Closer + Executive Pipeline Digest.',
      version: '3.0.0',
      icon: 'Package',
      permissions: ['crm:read_contacts', 'crm:write_contacts', 'sales:read_deals', 'sales:write_deals', 'email:send_email'],
      requiredIntegrations: ['CRM', 'Sales', 'Email', 'AI Engine'],
      configurationSchema: { enableExecutiveDigest: true },
      pricing: { model: 'ENTERPRISE_PACK' },
      status: 'PUBLISHED',
    },
  ];

  // In-memory tenant fallback registry
  private static inMemoryInstalledItems: Array<{
    id: string;
    tenantId: string;
    itemId: string;
    version: string;
    configuration: any;
    grantedPermissions: string[];
    isActive: boolean;
    installedAt: Date;
  }> = [];

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    if (this.prisma.isConnected) {
      try {
        for (const item of PluginsService.marketplaceCatalog) {
          await this.prisma.marketplaceItem.upsert({
            where: { id: item.id },
            update: {
              name: item.name,
              description: item.description,
              version: item.version,
              category: item.category,
              permissions: JSON.stringify(item.permissions),
              requiredIntegrations: JSON.stringify(item.requiredIntegrations),
              configurationSchema: JSON.stringify(item.configurationSchema || {}),
              pricing: JSON.stringify(item.pricing || {}),
            },
            create: {
              id: item.id,
              type: item.type,
              name: item.name,
              description: item.description,
              version: item.version,
              category: item.category,
              publisherId: item.publisherId,
              icon: item.icon,
              permissions: JSON.stringify(item.permissions),
              requiredIntegrations: JSON.stringify(item.requiredIntegrations),
              configurationSchema: JSON.stringify(item.configurationSchema || {}),
              pricing: JSON.stringify(item.pricing || {}),
              status: item.status,
            },
          });
        }
        this.logger.log(`Seeded ${PluginsService.marketplaceCatalog.length} Stage 3 Marketplace packages.`);
      } catch (err: any) {
        this.logger.warn(`Could not seed Marketplace items into DB: ${err.message}`);
      }
    }
  }

  // --- Stage 3 Marketplace API ---

  async getMarketplaceItems(tenantId: string, filter?: { type?: string; category?: string }) {
    let items: any[] = [];
    let installed: any[] = [];

    if (this.prisma.isConnected) {
      try {
        const where: any = {};
        if (filter?.type && filter.type !== 'ALL') where.type = filter.type;
        if (filter?.category && filter.category !== 'ALL') where.category = filter.category;

        items = await this.prisma.marketplaceItem.findMany({ where });
        installed = await this.prisma.installedMarketplaceItem.findMany({ where: { tenantId } });
      } catch {
        // fallback
      }
    }

    if (items.length === 0) {
      items = PluginsService.marketplaceCatalog.filter((item) => {
        if (filter?.type && filter.type !== 'ALL' && item.type !== filter.type) return false;
        if (filter?.category && filter.category !== 'ALL' && item.category !== filter.category) return false;
        return true;
      });
    }

    return items.map((item) => {
      const inst = installed.find((i) => i.itemId === item.id) ||
        PluginsService.inMemoryInstalledItems.find((i) => i.tenantId === tenantId && i.itemId === item.id);

      return {
        id: item.id,
        type: item.type,
        name: item.name,
        description: item.description,
        version: item.version,
        category: item.category,
        icon: item.icon,
        permissions: typeof item.permissions === 'string' ? JSON.parse(item.permissions) : (item.permissions || []),
        requiredIntegrations: typeof item.requiredIntegrations === 'string' ? JSON.parse(item.requiredIntegrations) : (item.requiredIntegrations || []),
        isInstalled: Boolean(inst && inst.isActive),
        installedAt: inst?.installedAt || null,
        grantedPermissions: inst?.grantedPermissions ? (typeof inst.grantedPermissions === 'string' ? JSON.parse(inst.grantedPermissions) : inst.grantedPermissions) : [],
      };
    });
  }

  async getMarketplaceItemById(tenantId: string, itemId: string) {
    const items = await this.getMarketplaceItems(tenantId);
    const item = items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException(`Marketplace item ${itemId} not found`);
    return item;
  }

  async installMarketplaceItem(
    tenantId: string,
    itemId: string,
    acceptedPermissions: string[] = [],
    config: Record<string, any> = {}
  ) {
    this.logger.log(`[Marketplace] Installing ${itemId} for Tenant: ${tenantId}. Permissions Approved: ${acceptedPermissions.length}`);

    const catalogItem = PluginsService.marketplaceCatalog.find((i) => i.id === itemId);
    const version = catalogItem?.version || '1.0.0';

    if (this.prisma.isConnected) {
      try {
        const existing = await this.prisma.installedMarketplaceItem.findUnique({
          where: { tenantId_itemId: { tenantId, itemId } },
        });

        if (existing) {
          return await this.prisma.installedMarketplaceItem.update({
            where: { id: existing.id },
            data: {
              isActive: true,
              grantedPermissions: JSON.stringify(acceptedPermissions),
              configuration: JSON.stringify(config),
            },
          });
        }

        return await this.prisma.installedMarketplaceItem.create({
          data: {
            tenantId,
            itemId,
            version,
            grantedPermissions: JSON.stringify(acceptedPermissions),
            configuration: JSON.stringify(config),
            isActive: true,
          },
        });
      } catch (err: any) {
        this.logger.warn(`Could not record installation in DB: ${err.message}`);
      }
    }

    let memoryInst = PluginsService.inMemoryInstalledItems.find((i) => i.tenantId === tenantId && i.itemId === itemId);
    if (!memoryInst) {
      memoryInst = {
        id: `inst_${Date.now()}`,
        tenantId,
        itemId,
        version,
        configuration: config,
        grantedPermissions: acceptedPermissions,
        isActive: true,
        installedAt: new Date(),
      };
      PluginsService.inMemoryInstalledItems.push(memoryInst);
    } else {
      memoryInst.isActive = true;
      memoryInst.grantedPermissions = acceptedPermissions;
    }

    return memoryInst;
  }

  async uninstallMarketplaceItem(tenantId: string, itemId: string) {
    this.logger.log(`[Marketplace] Uninstalling ${itemId} for Tenant: ${tenantId}`);

    if (this.prisma.isConnected) {
      try {
        await this.prisma.installedMarketplaceItem.deleteMany({
          where: { tenantId, itemId },
        });
        return { success: true, itemId };
      } catch {
        // fallback
      }
    }

    PluginsService.inMemoryInstalledItems = PluginsService.inMemoryInstalledItems.filter(
      (i) => !(i.tenantId === tenantId && i.itemId === itemId)
    );

    return { success: true, itemId };
  }

  // --- Legacy Compatibility ---
  async findAll(tenantId: string) {
    return this.getMarketplaceItems(tenantId);
  }

  async install(tenantId: string, id: string) {
    return this.installMarketplaceItem(tenantId, id);
  }

  async uninstall(tenantId: string, id: string) {
    return this.uninstallMarketplaceItem(tenantId, id);
  }
}
