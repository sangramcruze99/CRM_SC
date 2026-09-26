import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SupplierDto {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: string;
}

@Injectable()
export class SuppliersService {
  private readonly logger = new Logger(SuppliersService.name);

  // In-memory fallback
  private memorySuppliers: any[] = [
    {
      id: 'sup_supermicro',
      tenantId: 'default-tenant',
      name: 'Supermicro Systems Inc.',
      contactPerson: 'David Chen',
      email: 'dchen@supermicro-supply.com',
      phone: '+1 (408) 503-8000',
      address: '980 Rock Ave, San Jose, CA 95131',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'sup_fiberoptics',
      tenantId: 'default-tenant',
      name: 'Lumentum Photonics Global',
      contactPerson: 'Sarah Jenkins',
      email: 'sjenkins@lumentum-parts.com',
      phone: '+1 (408) 546-5400',
      address: '1001 Ridder Park Dr, San Jose, CA 95131',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'sup_yubico',
      tenantId: 'default-tenant',
      name: 'Yubico Physical Auth Group',
      contactPerson: 'Marcus Lindqvist',
      email: 'enterprise@yubico.com',
      phone: '+1 (844) 205-6700',
      address: '530 Lytton Ave, Palo Alto, CA 94301',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId = 'default-tenant') {
    if (this.prisma.isConnected) {
      try {
        const count = await this.prisma.supplier.count({ where: { tenantId } });
        if (count === 0) {
          await this.seedDefaults(tenantId);
        }
        return await this.prisma.supplier.findMany({
          where: { tenantId },
          include: {
            _count: {
              select: { products: true },
            },
          },
          orderBy: { name: 'asc' },
        });
      } catch (err: any) {
        this.logger.warn(`Failed to query suppliers from DB: ${err.message}`);
      }
    }
    return this.memorySuppliers.filter(s => s.tenantId === tenantId);
  }

  async findOne(id: string, tenantId = 'default-tenant') {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.supplier.findFirst({
          where: { id, tenantId },
          include: { products: true },
        });
      } catch (err: any) {
        this.logger.warn(`Failed to find supplier ${id}: ${err.message}`);
      }
    }
    return this.memorySuppliers.find(s => s.id === id && s.tenantId === tenantId) || null;
  }

  async create(dto: SupplierDto, tenantId = 'default-tenant') {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.supplier.create({
          data: {
            name: dto.name,
            contactPerson: dto.contactPerson,
            email: dto.email,
            phone: dto.phone,
            address: dto.address,
            status: dto.status || 'ACTIVE',
            tenantId,
          },
        });
      } catch (err: any) {
        this.logger.warn(`DB supplier create failed: ${err.message}`);
      }
    }

    const newSup = {
      id: `sup_${Date.now()}`,
      tenantId,
      name: dto.name,
      contactPerson: dto.contactPerson || '',
      email: dto.email || '',
      phone: dto.phone || '',
      address: dto.address || '',
      status: dto.status || 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.memorySuppliers.push(newSup);
    return newSup;
  }

  async update(id: string, dto: Partial<SupplierDto>, tenantId = 'default-tenant') {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.supplier.update({
          where: { id },
          data: dto,
        });
      } catch (err: any) {
        this.logger.warn(`DB supplier update failed: ${err.message}`);
      }
    }

    const idx = this.memorySuppliers.findIndex(s => s.id === id && s.tenantId === tenantId);
    if (idx !== -1) {
      this.memorySuppliers[idx] = { ...this.memorySuppliers[idx], ...dto, updatedAt: new Date() };
      return this.memorySuppliers[idx];
    }
    return null;
  }

  async delete(id: string, tenantId = 'default-tenant') {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.supplier.delete({
          where: { id },
        });
      } catch (err: any) {
        this.logger.warn(`DB supplier delete failed: ${err.message}`);
      }
    }

    const idx = this.memorySuppliers.findIndex(s => s.id === id && s.tenantId === tenantId);
    if (idx !== -1) {
      const removed = this.memorySuppliers.splice(idx, 1);
      return removed[0];
    }
    return { success: true };
  }

  private async seedDefaults(tenantId: string) {
    try {
      for (const sup of this.memorySuppliers) {
        await this.prisma.supplier.create({
          data: {
            id: sup.id,
            tenantId,
            name: sup.name,
            contactPerson: sup.contactPerson,
            email: sup.email,
            phone: sup.phone,
            address: sup.address,
            status: sup.status,
          },
        });
      }
    } catch {
      // ignore
    }
  }
}
