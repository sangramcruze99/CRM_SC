
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompliancePolicyService {
  private static inMemoryPolicies: any[] = [
    { id: 'pol_1', name: 'SOC2 Data Encryption & Access Control', status: 'ACTIVE', tenantId: 'default-tenant', createdAt: new Date() }
  ];

  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    if (this.prisma.isConnected) {
      try {
        const records = await this.prisma.compliancePolicy.findMany({ where: { tenantId } });
        if (records && records.length > 0) return records;
      } catch {
        // fallback
      }
    }
    return CompliancePolicyService.inMemoryPolicies.filter(p => p.tenantId === tenantId || p.tenantId === 'default-tenant');
  }

  async create(tenantId: string, data: any) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.compliancePolicy.create({ data: { ...data, tenantId } });
      } catch {
        // fallback
      }
    }
    const newPol = { id: `pol_${Date.now()}`, ...data, tenantId, createdAt: new Date() };
    CompliancePolicyService.inMemoryPolicies.unshift(newPol);
    return newPol;
  }
}
