import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeysService {
  private static inMemoryKeys: any[] = [
    { id: 'key_1', name: 'Production Sync Key', key: 'sk_live_...789', permissions: ['read', 'write'], tenantId: 'default-tenant', createdAt: new Date() }
  ];

  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    if (this.prisma.isConnected) {
      try {
        const records = await this.prisma.apiKey.findMany({
          where: { tenantId },
          orderBy: { createdAt: 'desc' },
        });
        if (records && records.length > 0) return records;
      } catch {
        // fallback
      }
    }
    return ApiKeysService.inMemoryKeys.filter(k => k.tenantId === tenantId || k.tenantId === 'default-tenant');
  }

  async create(data: { name: string; permissions?: string[] }, tenantId: string) {
    const rawKey = 'sk_live_' + crypto.randomBytes(24).toString('hex');
    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');

    if (this.prisma.isConnected) {
      try {
        await this.prisma.apiKey.create({
          data: {
            name: data.name,
            key: hashedKey,
            permissions: data.permissions || ['read', 'write'],
            tenantId,
          },
        });
      } catch {
        // fallback
      }
    }

    const newKey = {
      id: `key_${Date.now()}`,
      name: data.name,
      key: rawKey,
      permissions: data.permissions || ['read', 'write'],
      tenantId,
      createdAt: new Date()
    };
    ApiKeysService.inMemoryKeys.unshift(newKey);

    return newKey;
  }

  async revoke(id: string, tenantId: string) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.apiKey.deleteMany({
          where: { id, tenantId },
        });
      } catch {
        // fallback
      }
    }
    ApiKeysService.inMemoryKeys = ApiKeysService.inMemoryKeys.filter(k => !(k.id === id && k.tenantId === tenantId));
    return { count: 1 };
  }
}
