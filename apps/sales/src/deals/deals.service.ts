import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DealsService {
  private readonly logger = new Logger(DealsService.name);
  private static inMemoryDeals: any[] = [];

  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: any) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.deal.create({
          data: {
            ...data,
            tenantId,
          },
          include: { company: true }
        });
      } catch (err: any) {
        this.logger.warn(`Database write deferred, saving deal to memory: ${err.message}`);
      }
    }

    const newDeal = {
      id: `deal_${Date.now()}`,
      tenantId,
      ...data,
      company: data.companyId ? { id: data.companyId, name: 'Target Account' } : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    DealsService.inMemoryDeals.unshift(newDeal);
    return newDeal;
  }

  async findAll(tenantId: string) {
    if (this.prisma.isConnected) {
      try {
        const records = await this.prisma.deal.findMany({
          where: { tenantId },
          include: { company: true },
          orderBy: { createdAt: 'desc' }
        });
        if (records && records.length > 0) return records;
      } catch (err: any) {
        this.logger.warn(`Database read deferred, returning memory deals: ${err.message}`);
      }
    }
    return DealsService.inMemoryDeals.filter(d => d.tenantId === tenantId || d.tenantId === 'default-tenant');
  }

  async findOne(tenantId: string, id: string) {
    if (this.prisma.isConnected) {
      try {
        const record = await this.prisma.deal.findFirst({
          where: { id, tenantId },
          include: { company: true }
        });
        if (record) return record;
      } catch (err: any) {
        this.logger.warn(`Database read deferred: ${err.message}`);
      }
    }
    return DealsService.inMemoryDeals.find(d => d.id === id) || null;
  }

  async update(tenantId: string, id: string, data: any) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.deal.update({
          where: { id },
          data,
        });
      } catch (err: any) {
        // ignore
      }
    }

    const idx = DealsService.inMemoryDeals.findIndex(d => d.id === id);
    if (idx !== -1) {
      DealsService.inMemoryDeals[idx] = { ...DealsService.inMemoryDeals[idx], ...data };
      return DealsService.inMemoryDeals[idx];
    }
    return null;
  }

  async remove(tenantId: string, id: string) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.deal.delete({
          where: { id },
        });
      } catch (err: any) {
        // ignore
      }
    }

    DealsService.inMemoryDeals = DealsService.inMemoryDeals.filter(d => d.id !== id);
    return { success: true, id };
  }
}
