import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface StoreMemoryDto {
  agentId: string;
  memoryType: 'SHORT_TERM' | 'LONG_TERM' | 'WORKFLOW' | 'CUSTOMER';
  key: string;
  value: string;
  entityType?: string;
  entityId?: string;
  confidence?: number;
}

@Injectable()
export class AgentMemoryService {
  private readonly logger = new Logger(AgentMemoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async storeMemory(tenantId: string, dto: StoreMemoryDto) {
    this.logger.log(`Storing ${dto.memoryType} memory for Agent ${dto.agentId} (Key: ${dto.key})`);

    return this.prisma.agentMemory.create({
      data: {
        tenantId,
        agentId: dto.agentId,
        memoryType: dto.memoryType,
        key: dto.key,
        value: dto.value,
        entityType: dto.entityType,
        entityId: dto.entityId,
        confidence: dto.confidence ?? 1.0,
      },
    });
  }

  async getMemories(tenantId: string, agentId: string, type?: string, entityId?: string) {
    const where: any = { tenantId, agentId };
    if (type) where.memoryType = type;
    if (entityId) where.entityId = entityId;

    return this.prisma.agentMemory.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });
  }

  async searchCustomerMemories(tenantId: string, contactId: string) {
    return this.prisma.agentMemory.findMany({
      where: {
        tenantId,
        OR: [{ entityId: contactId }, { memoryType: 'CUSTOMER' }],
      },
      take: 10,
    });
  }

  async deleteMemory(tenantId: string, id: string) {
    return this.prisma.agentMemory.deleteMany({
      where: { id, tenantId },
    });
  }
}
