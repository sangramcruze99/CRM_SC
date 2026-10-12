import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

export interface CreateNotificationDto {
  title: string;
  message: string;
  category?: 'APPROVAL' | 'SYSTEM' | 'BILLING' | 'CRM_DEAL' | 'ALERT';
  severity?: 'INFO' | 'WARNING' | 'SUCCESS' | 'CRITICAL';
  link?: string;
  metadata?: any;
  userId?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, category?: string, readOnly?: boolean) {
    await this.seedDefaultsIfEmpty(tenantId);

    const where: any = { tenantId };
    if (category && category !== 'ALL') {
      where.category = category;
    }
    if (typeof readOnly === 'boolean') {
      where.read = readOnly;
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getUnreadCount(tenantId: string) {
    await this.seedDefaultsIfEmpty(tenantId);
    const count = await this.prisma.notification.count({
      where: {
        tenantId,
        read: false,
      },
    });

    const categoryBreakdown = await this.prisma.notification.groupBy({
      by: ['category'],
      where: {
        tenantId,
        read: false,
      },
      _count: {
        _all: true,
      },
    });

    const breakdown: Record<string, number> = {};
    for (const item of categoryBreakdown) {
      breakdown[item.category] = item._count._all;
    }

    return {
      unreadTotal: count,
      byCategory: breakdown,
    };
  }

  async create(tenantId: string, dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        tenantId,
        userId: dto.userId || null,
        title: dto.title,
        message: dto.message,
        category: dto.category || 'SYSTEM',
        severity: dto.severity || 'INFO',
        link: dto.link || null,
        metadata: dto.metadata ? JSON.stringify(dto.metadata) : '{}',
        read: false,
      },
    });
  }

  async markAsRead(tenantId: string, id: string) {
    return this.prisma.notification.updateMany({
      where: { id, tenantId },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(tenantId: string, category?: string) {
    const where: any = { tenantId, read: false };
    if (category && category !== 'ALL') {
      where.category = category;
    }
    const result = await this.prisma.notification.updateMany({
      where,
      data: {
        read: true,
        readAt: new Date(),
      },
    });
    return { markedCount: result.count };
  }

  async remove(tenantId: string, id: string) {
    return this.prisma.notification.deleteMany({
      where: { id, tenantId },
    });
  }

  async seedDefaultsIfEmpty(tenantId: string) {
    try {
      const existing = await this.prisma.notification.count({ where: { tenantId } });
      if (existing > 0) return;

      const seeds: CreateNotificationDto[] = [
        {
          title: 'Action Required: Hiring Candidate Interview Approval',
          message: 'Senior Fullstack Candidate Sarah Connor scored 92% match. Workflow execution paused waiting for recruiter approval.',
          category: 'APPROVAL',
          severity: 'WARNING',
          link: '/automation',
          metadata: { executionId: 'exec_wf_8912', candidate: 'Sarah Connor' },
        },
        {
          title: 'AI Spend Rate Warning (80% Monthly Budget)',
          message: 'Athena & Groq neural inference budget crossed 80% threshold ($80.40 / $100.00). Rate guardrails active.',
          category: 'BILLING',
          severity: 'WARNING',
          link: '/billing',
          metadata: { budgetCap: 100, currentSpend: 80.4 },
        },
        {
          title: 'New Commercial Deal: Titan Industrial Expansion ($120,000)',
          message: 'Lead qualification engine automatically advanced Titan Industrial to Negotiating stage.',
          category: 'CRM_DEAL',
          severity: 'SUCCESS',
          link: '/deals',
          metadata: { dealAmount: 120000, stage: 'Negotiating' },
        },
        {
          title: 'Direct Settlement Confirmed: Commercial Invoice #INV-2026-089',
          message: 'Stripe wire webhook reconciled and settled for $14,500.00 via Double-Entry Ledger.',
          category: 'BILLING',
          severity: 'SUCCESS',
          link: '/invoices',
          metadata: { invoiceNumber: 'INV-2026-089', amount: 14500 },
        },
        {
          title: 'System Node Health & Mesh Verification',
          message: 'Universal microservice cluster verified healthy. 24 nodes synced with zero audit telemetry anomalies.',
          category: 'SYSTEM',
          severity: 'INFO',
          link: '/settings',
          metadata: { status: 'OPTIMAL' },
        },
      ];

      for (const item of seeds) {
        await this.create(tenantId, item);
      }
      this.logger.log(`Seeded ${seeds.length} initial notifications for tenant ${tenantId}`);
    } catch (err: any) {
      this.logger.warn(`Could not seed default notifications: ${err?.message}`);
    }
  }
}
