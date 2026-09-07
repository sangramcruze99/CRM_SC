import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ESignatureService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.eSignature.findMany({ where: { tenantId } });
  }

  async create(tenantId: string, data: any) {
    return this.prisma.eSignature.create({ data: { ...data, tenantId } });
  }
}
