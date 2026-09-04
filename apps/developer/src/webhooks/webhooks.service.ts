import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WebhooksService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.webhook.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: { url: string; events: string[] }, tenantId: string) {
    return this.prisma.webhook.create({
      data: {
        url: data.url,
        events: JSON.stringify(data.events),
        isActive: true,
        tenantId,
      },
    });
  }

  async delete(id: string, tenantId: string) {
    return this.prisma.webhook.deleteMany({
      where: { id, tenantId },
    });
  }

  async toggleActive(id: string, isActive: boolean, tenantId: string) {
    // Need to use updateMany to include tenantId in the criteria
    await this.prisma.webhook.updateMany({
      where: { id, tenantId },
      data: { isActive },
    });
    return this.prisma.webhook.findFirst({ where: { id, tenantId } });
  }
}
