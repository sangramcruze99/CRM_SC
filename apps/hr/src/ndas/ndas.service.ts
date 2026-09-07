import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NDAService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.nDA.findMany({ where: { tenantId } });
  }

  async create(tenantId: string, data: any) {
    return this.prisma.nDA.create({ data: { ...data, tenantId } });
  }
}
