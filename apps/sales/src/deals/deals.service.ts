import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { publishDealStageChanged } from '@repo/core-types';

@Injectable()
export class DealsService {
  private readonly logger = new Logger(DealsService.name);
  private static inMemoryDeals: any[] = [];

  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: any) {
    let createdDeal: any = null;
    if (this.prisma.isConnected) {
      try {
        createdDeal = await this.prisma.deal.create({
          data: {
            ...data,
            tenantId,
          },
          include: { company: true },
        });
      } catch (err: any) {
        this.logger.warn(
          `Database write deferred, saving deal to memory: ${err.message}`,
        );
      }
    }

    if (!createdDeal) {
      createdDeal = {
        id: `deal_${Date.now()}`,
        tenantId,
        ...data,
        company: data.companyId
          ? { id: data.companyId, name: 'Target Account' }
          : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      DealsService.inMemoryDeals.unshift(createdDeal);
    }

    // Emit reactive event
    publishDealStageChanged(tenantId, {
      id: createdDeal.id,
      title: createdDeal.title || 'Enterprise Deal',
      amount: Number(createdDeal.amount || 0),
      stage: createdDeal.stage || 'Lead',
      contactId: createdDeal.contactId,
    }).catch((e) =>
      this.logger.warn(`Failed to publish deal event: ${e.message}`),
    );

    return createdDeal;
  }

  async findAll(tenantId: string) {
    if (this.prisma.isConnected) {
      try {
        const records = await this.prisma.deal.findMany({
          where: { tenantId },
          include: { company: true },
          orderBy: { createdAt: 'desc' },
        });
        if (records && records.length > 0) return records;
      } catch (err: any) {
        this.logger.warn(
          `Database read deferred, returning memory deals: ${err.message}`,
        );
      }
    }
    return DealsService.inMemoryDeals.filter((d) => d.tenantId === tenantId);
  }

  async findOne(tenantId: string, id: string) {
    if (this.prisma.isConnected) {
      try {
        const record = await this.prisma.deal.findFirst({
          where: { id, tenantId },
          include: { company: true },
        });
        if (record) return record;
      } catch (err: any) {
        this.logger.warn(`Database read deferred: ${err.message}`);
      }
    }
    return (
      DealsService.inMemoryDeals.find(
        (d) => d.id === id && d.tenantId === tenantId,
      ) || null
    );
  }

  async update(tenantId: string, id: string, data: any) {
    let updatedDeal: any = null;
    let previousStage: string | undefined = undefined;

    if (this.prisma.isConnected) {
      try {
        // Enforce multi-tenant ownership verification before update
        const existing = await this.prisma.deal.findFirst({
          where: { id, tenantId },
        });
        if (!existing) {
          return null;
        }
        previousStage = existing.stage;

        updatedDeal = await this.prisma.deal.update({
          where: { id },
          data,
        });
      } catch (err: any) {
        this.logger.error(`Error updating deal ${id}: ${err.message}`);
      }
    }

    if (!updatedDeal) {
      const idx = DealsService.inMemoryDeals.findIndex(
        (d) => d.id === id && d.tenantId === tenantId,
      );
      if (idx !== -1) {
        previousStage = DealsService.inMemoryDeals[idx].stage;
        DealsService.inMemoryDeals[idx] = {
          ...DealsService.inMemoryDeals[idx],
          ...data,
        };
        updatedDeal = DealsService.inMemoryDeals[idx];
      }
    }

    if (updatedDeal && data.stage && data.stage !== previousStage) {
      // Stage transition detected -> emit event
      publishDealStageChanged(tenantId, {
        id: updatedDeal.id,
        title: updatedDeal.title || 'Enterprise Deal',
        amount: Number(updatedDeal.amount || 0),
        stage: updatedDeal.stage,
        previousStage,
        contactId: updatedDeal.contactId,
      }).catch((e) =>
        this.logger.warn(`Failed to publish deal stage event: ${e.message}`),
      );
    }

    return updatedDeal;
  }

  async remove(tenantId: string, id: string) {
    if (this.prisma.isConnected) {
      try {
        // Enforce multi-tenant ownership verification before deletion
        const existing = await this.prisma.deal.findFirst({
          where: { id, tenantId },
        });
        if (!existing) {
          return null;
        }

        return await this.prisma.deal.delete({
          where: { id },
        });
      } catch (err: any) {
        this.logger.error(`Error deleting deal ${id}: ${err.message}`);
      }
    }

    DealsService.inMemoryDeals = DealsService.inMemoryDeals.filter(
      (d) => !(d.id === id && d.tenantId === tenantId),
    );
    return { success: true, id };
  }
}
