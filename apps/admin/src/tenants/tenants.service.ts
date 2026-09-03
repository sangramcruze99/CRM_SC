import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantsService implements OnModuleInit {
  private static inMemoryTenants: any[] = [
    { id: 'tenant-1', name: 'Acme Corporation', domain: 'acme.crm.example.com', createdAt: new Date(), _count: { users: 5, contacts: 12, companies: 3 } },
    { id: 'tenant-2', name: 'Globex Inc', domain: 'globex.crm.example.com', createdAt: new Date(), _count: { users: 2, contacts: 4, companies: 1 } },
  ];

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    if (this.prisma.isConnected) {
      try {
        const count = await this.prisma.tenant.count();
        if (count === 0) {
          await this.prisma.tenant.create({
            data: {
              id: 'tenant-1',
              name: 'Acme Corporation',
              domain: 'acme.crm.example.com',
            },
          });
          await this.prisma.tenant.create({
            data: {
              id: 'tenant-2',
              name: 'Globex Inc',
              domain: 'globex.crm.example.com',
            },
          });
        }
      } catch {
        // ignore
      }
    }
  }

  async findAll() {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.tenant.findMany({
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { users: true, contacts: true, companies: true }
            }
          }
        });
      } catch {
        // fallback
      }
    }
    return TenantsService.inMemoryTenants;
  }

  async create(data: { name: string; domain?: string }) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.tenant.create({
          data: {
            name: data.name,
            domain: data.domain || `${slug}.crm.example.com`,
          },
        });
      } catch {
        // fallback
      }
    }
    const newTenant = {
      id: `tenant-${Date.now()}`,
      name: data.name,
      domain: data.domain || `${slug}.crm.example.com`,
      createdAt: new Date(),
      _count: { users: 0, contacts: 0, companies: 0 },
    };
    TenantsService.inMemoryTenants.unshift(newTenant);
    return newTenant;
  }

  async delete(id: string) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.tenant.delete({
          where: { id },
        });
      } catch {
        // fallback
      }
    }
    const idx = TenantsService.inMemoryTenants.findIndex(t => t.id === id);
    if (idx !== -1) TenantsService.inMemoryTenants.splice(idx, 1);
    return { id };
  }
}
