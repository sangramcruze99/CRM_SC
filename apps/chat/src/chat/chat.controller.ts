import { Controller, Get, Headers, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('chat')
export class ChatController {
  private static inMemoryChannels: any[] = [];

  constructor(private readonly prisma: PrismaService) {}

  @Get('channels')
  async getChannels(@Headers('x-tenant-id') tenantId: string) {
    const effectiveTenant = tenantId || 'default-tenant';
    
    if (this.prisma.isConnected) {
      try {
        const count = await this.prisma.channel.count({ where: { tenantId: effectiveTenant } });
        if (count === 0) {
          await this.prisma.channel.create({
            data: {
              tenantId: effectiveTenant,
              name: 'general',
              isPrivate: false
            }
          });
        }

        const records = await this.prisma.channel.findMany({
          where: { tenantId: effectiveTenant },
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 50,
              include: { user: true }
            }
          }
        });
        if (records && records.length > 0) return records;
      } catch {
        // fallback
      }
    }

    return ChatController.inMemoryChannels.filter(c => c.tenantId === effectiveTenant || c.tenantId === 'default-tenant');
  }
}
