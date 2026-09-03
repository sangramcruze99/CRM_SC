
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportTemplateService {
  private static inMemoryTemplates: any[] = [
    { id: 'rep_1', name: 'Executive Sales Trajectory', type: 'REVENUE', tenantId: 'default-tenant', createdAt: new Date() }
  ];

  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    if (this.prisma.isConnected) {
      try {
        const records = await this.prisma.reportTemplate.findMany({ where: { tenantId } });
        if (records && records.length > 0) return records;
      } catch {
        // fallback
      }
    }
    return ReportTemplateService.inMemoryTemplates.filter(r => r.tenantId === tenantId || r.tenantId === 'default-tenant');
  }

  async create(tenantId: string, data: any) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.reportTemplate.create({ data: { ...data, tenantId } });
      } catch {
        // fallback
      }
    }
    const newRep = { id: `rep_${Date.now()}`, ...data, tenantId, createdAt: new Date() };
    ReportTemplateService.inMemoryTemplates.unshift(newRep);
    return newRep;
  }
}
