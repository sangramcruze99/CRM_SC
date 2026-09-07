import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OfferLetterService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.offerLetter.findMany({ where: { tenantId } });
  }

  async create(tenantId: string, data: any) {
    return this.prisma.offerLetter.create({ data: { ...data, tenantId } });
  }
}
