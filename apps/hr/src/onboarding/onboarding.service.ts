import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OnboardingTaskService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.onboardingTask.findMany({ where: { tenantId } });
  }

  async create(tenantId: string, data: any) {
    return this.prisma.onboardingTask.create({ data: { ...data, tenantId } });
  }
}
