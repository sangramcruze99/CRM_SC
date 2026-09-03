
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TaxRuleService {
  private static inMemoryRules: any[] = [
    { id: 'tax_1', name: 'Standard GST/VAT', rate: 18, tenantId: 'default-tenant', createdAt: new Date() }
  ];

  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    if (this.prisma.isConnected) {
      try {
        const records = await this.prisma.taxRule.findMany({ where: { tenantId } });
        if (records && records.length > 0) return records;
      } catch {
        // fallback
      }
    }
    return TaxRuleService.inMemoryRules.filter(t => t.tenantId === tenantId || t.tenantId === 'default-tenant');
  }

  async create(tenantId: string, data: any) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.taxRule.create({ data: { ...data, tenantId } });
      } catch {
        // fallback
      }
    }
    const newTax = { id: `tax_${Date.now()}`, ...data, tenantId, createdAt: new Date() };
    TaxRuleService.inMemoryRules.unshift(newTax);
    return newTax;
  }
}
