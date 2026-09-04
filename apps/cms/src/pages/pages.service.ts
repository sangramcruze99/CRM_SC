import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PagesService {
  private static inMemoryPages: any[] = [];

  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    if (this.prisma.isConnected) {
      try {
        const records = await this.prisma.landingPage.findMany({
          where: { tenantId },
          include: { blocks: { orderBy: { orderIndex: 'asc' } } },
        });
        if (records && records.length > 0) return records;
      } catch {
        // fallback
      }
    }
    return PagesService.inMemoryPages.filter(p => p.tenantId === tenantId || p.tenantId === 'default-tenant');
  }

  async findOne(tenantId: string, id: string) {
    if (this.prisma.isConnected) {
      try {
        const page = await this.prisma.landingPage.findFirst({
          where: { id, tenantId },
          include: { blocks: { orderBy: { orderIndex: 'asc' } } },
        });
        if (page) return page;
      } catch {
        // fallback
      }
    }
    const page = PagesService.inMemoryPages.find(p => p.id === id);
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async findBySlug(slug: string) {
    if (this.prisma.isConnected) {
      try {
        const page = await this.prisma.landingPage.findFirst({
          where: { slug, published: true },
          include: { blocks: { orderBy: { orderIndex: 'asc' } } },
        });
        if (page) return page;
      } catch {
        // fallback
      }
    }
    const page = PagesService.inMemoryPages.find(p => p.slug === slug && p.published);
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async create(tenantId: string, data: any) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.landingPage.create({
          data: {
            tenantId,
            title: data.title,
            slug: data.slug,
            published: Boolean(data.published || data.status === 'PUBLISHED'),
          },
        });
      } catch {
        // fallback
      }
    }
    const newPage = {
      id: `page_${Date.now()}`,
      tenantId,
      title: data.title,
      slug: data.slug,
      published: Boolean(data.published || data.status === 'PUBLISHED'),
      blocks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    PagesService.inMemoryPages.unshift(newPage);
    return newPage;
  }

  async updateBlocks(tenantId: string, id: string, blocks: any[]) {
    const page = await this.findOne(tenantId, id);
    
    if (this.prisma.isConnected) {
      try {
        await this.prisma.pageBlock.deleteMany({
          where: { landingPageId: id },
        });
        if (blocks && blocks.length > 0) {
          await this.prisma.pageBlock.createMany({
            data: blocks.map((b, idx) => ({
              landingPageId: id,
              type: b.type,
              content: b.content,
              orderIndex: idx,
            })),
          });
        }
        return this.findOne(tenantId, id);
      } catch {
        // fallback
      }
    }

    page.blocks = (blocks || []).map((b, idx) => ({
      id: `block_${Date.now()}_${idx}`,
      landingPageId: id,
      type: b.type,
      content: b.content,
      orderIndex: idx
    }));
    return page;
  }
}
