import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, data: any) {
    return this.prisma.activity.create({
      data: {
        tenantId,
        type: data.type,
        title: data.title,
        content: data.content,
        contactId: data.contactId,
        companyId: data.companyId,
        dealId: data.dealId,
        userId: data.userId,
      },
    });
  }

  async findAll(tenantId: string, query: any) {
    const where: any = { tenantId };
    if (query.contactId) where.contactId = query.contactId;
    if (query.companyId) where.companyId = query.companyId;
    if (query.dealId) where.dealId = query.dealId;

    const activities = await this.prisma.activity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return activities;
  }

  async findOne(tenantId: string, id: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id, tenantId },
    });
    if (!activity) throw new NotFoundException('Activity not found');
    return activity;
  }

  async remove(tenantId: string, id: string) {
    const activity = await this.findOne(tenantId, id);
    return this.prisma.activity.delete({
      where: { id: activity.id },
    });
  }
}
