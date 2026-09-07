import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchIndexService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.searchIndex.findMany({ where: { tenantId } });
  }

  async create(tenantId: string, data: any) {
    return this.prisma.searchIndex.create({ data: { ...data, tenantId } });
  }
}
