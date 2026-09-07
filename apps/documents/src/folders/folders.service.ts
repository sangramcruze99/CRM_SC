import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FoldersService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, parentId?: string) {
    if (parentId === 'root') parentId = '';
    return this.prisma.folder.findMany({
      where: {
        tenantId,
        parentId: parentId || null,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    return this.prisma.folder.findFirst({
      where: { id, tenantId },
      include: {
        children: { orderBy: { name: 'asc' } },
        documents: { orderBy: { name: 'asc' } },
      },
    });
  }

  async create(data: { name: string; parentId?: string }, tenantId: string) {
    if (data.parentId === 'root') data.parentId = '';
    return this.prisma.folder.create({
      data: {
        name: data.name,
        parentId: data.parentId || null,
        tenantId,
      },
    });
  }

  async delete(id: string, tenantId: string) {
    return this.prisma.folder.deleteMany({
      where: { id, tenantId },
    });
  }
}
