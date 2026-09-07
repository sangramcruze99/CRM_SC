import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class S3UploadService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.s3Upload.findMany({ where: { tenantId } });
  }

  async create(tenantId: string, data: any) {
    return this.prisma.s3Upload.create({ data: { ...data, tenantId } });
  }
}
