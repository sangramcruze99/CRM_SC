import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FoldersService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, parentId?: string, service?: string) {
    if (parentId === 'root') parentId = '';
    const where: any = {
      tenantId,
      parentId: parentId || null,
    };
    if (service && service !== 'all') {
      where.service = service.toLowerCase();
    }
    return this.prisma.folder.findMany({
      where,
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

  async create(data: { name: string; parentId?: string; service?: string }, tenantId: string) {
    if (data.parentId === 'root') data.parentId = '';
    return this.prisma.folder.create({
      data: {
        name: data.name,
        service: data.service ? data.service.toLowerCase() : 'documents',
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
