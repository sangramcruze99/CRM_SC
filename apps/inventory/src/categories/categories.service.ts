import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CategoryDto {
  name: string;
  description?: string;
}

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  // In-memory fallback cache
  private memoryCategories: any[] = [
    { id: 'cat_hardware', tenantId: 'default-tenant', name: 'Server Hardware', description: 'Enterprise rack servers, blade systems, and power modules', createdAt: new Date(), updatedAt: new Date() },
    { id: 'cat_networking', tenantId: 'default-tenant', name: 'Optical Networking', description: 'Transceivers, fiber optic patches, switches, and routers', createdAt: new Date(), updatedAt: new Date() },
    { id: 'cat_security', tenantId: 'default-tenant', name: 'Hardware Security', description: 'HSMs, cryptographic accelerators, and physical security keys', createdAt: new Date(), updatedAt: new Date() },
    { id: 'cat_peripherals', tenantId: 'default-tenant', name: 'Datacenter Components', description: 'Cooling units, cables, rails, and chassis accessories', createdAt: new Date(), updatedAt: new Date() },
  ];

  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId = 'default-tenant') {
    if (this.prisma.isConnected) {
      try {
        const count = await this.prisma.category.count({ where: { tenantId } });
        if (count === 0) {
          await this.seedDefaults(tenantId);
        }
        return await this.prisma.category.findMany({
          where: { tenantId },
          include: {
            _count: {
              select: { products: true },
            },
          },
          orderBy: { name: 'asc' },
        });
      } catch (err: any) {
        this.logger.warn(`Failed to query categories from DB, using fallback: ${err.message}`);
      }
    }
    return this.memoryCategories.filter(c => c.tenantId === tenantId);
  }

  async findOne(id: string, tenantId = 'default-tenant') {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.category.findFirst({
          where: { id, tenantId },
          include: { products: true },
        });
      } catch (err: any) {
        this.logger.warn(`Failed to find category ${id}: ${err.message}`);
      }
    }
    return this.memoryCategories.find(c => c.id === id && c.tenantId === tenantId) || null;
  }

  async create(dto: CategoryDto, tenantId = 'default-tenant') {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.category.create({
          data: {
            name: dto.name,
            description: dto.description,
            tenantId,
          },
        });
      } catch (err: any) {
        this.logger.warn(`DB category create failed: ${err.message}`);
      }
    }

    const newCat = {
      id: `cat_${Date.now()}`,
      tenantId,
      name: dto.name,
      description: dto.description || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.memoryCategories.push(newCat);
    return newCat;
  }

  async update(id: string, dto: Partial<CategoryDto>, tenantId = 'default-tenant') {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.category.update({
          where: { id },
          data: {
            name: dto.name,
            description: dto.description,
          },
        });
      } catch (err: any) {
        this.logger.warn(`DB category update failed: ${err.message}`);
      }
    }

    const idx = this.memoryCategories.findIndex(c => c.id === id && c.tenantId === tenantId);
    if (idx !== -1) {
      this.memoryCategories[idx] = { ...this.memoryCategories[idx], ...dto, updatedAt: new Date() };
      return this.memoryCategories[idx];
    }
    return null;
  }

  async delete(id: string, tenantId = 'default-tenant') {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.category.delete({
          where: { id },
        });
      } catch (err: any) {
        this.logger.warn(`DB category delete failed: ${err.message}`);
      }
    }

    const idx = this.memoryCategories.findIndex(c => c.id === id && c.tenantId === tenantId);
    if (idx !== -1) {
      const removed = this.memoryCategories.splice(idx, 1);
      return removed[0];
    }
    return { success: true };
  }

  private async seedDefaults(tenantId: string) {
    try {
      for (const cat of this.memoryCategories) {
        await this.prisma.category.upsert({
          where: { tenantId_name: { tenantId, name: cat.name } },
          create: {
            id: cat.id,
            tenantId,
            name: cat.name,
            description: cat.description,
          },
          update: {},
        });
      }
    } catch {
      // ignore
    }
  }
}
