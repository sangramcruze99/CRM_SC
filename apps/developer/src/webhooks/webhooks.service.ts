import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { validateSafeUrl } from '@repo/core-types';

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
    if (!data.url || typeof data.url !== 'string') {
      throw new BadRequestException('Webhook URL is required');
    }

    // SSRF Prevention: Validate destination URL against loopback, private CIDR, and cloud metadata
    const validation = await validateSafeUrl(data.url);
    if (!validation.isValid) {
      throw new BadRequestException(`Invalid webhook destination: ${validation.reason}`);
    }

    return this.prisma.webhook.create({
      data: {
        url: data.url.trim(),
        events: Array.isArray(data.events) ? JSON.stringify(data.events) : '["*"]',
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
    await this.prisma.webhook.updateMany({
      where: { id, tenantId },
      data: { isActive },
    });
    return this.prisma.webhook.findFirst({ where: { id, tenantId } });
  }
}
