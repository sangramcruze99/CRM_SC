import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);
  private static inMemoryDocs: any[] = [
    { id: 'kb_1', title: 'Standard Operating Procedures & Brand Guide', content: 'Enterprise standard procedures and brand identity guidelines.', tenantId: 'default-tenant', createdAt: new Date() }
  ];

  constructor(private readonly prisma: PrismaService) {}

  private async generateEmbeddings(text: string): Promise<number[]> {
    try {
      const { pipeline } = await import('@xenova/transformers');
      const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      const output = await extractor(text, { pooling: 'mean', normalize: true });
      return Array.from(output.data);
    } catch {
      return Array.from({ length: 384 }).map(() => Math.random());
    }
  }

  async create(tenantId: string, data: any) {
    const vector = await this.generateEmbeddings(data.content || '');

    if (this.prisma.isConnected) {
      try {
        return await this.prisma.knowledgeBaseDocument.create({
          data: {
            tenantId,
            title: data.title,
            content: data.content,
            vectorEmbeddings: vector
          },
        });
      } catch {
        // fallback
      }
    }

    const newDoc = {
      id: `kb_${Date.now()}`,
      tenantId,
      title: data.title,
      content: data.content,
      vectorEmbeddings: vector,
      createdAt: new Date()
    };
    KnowledgeService.inMemoryDocs.unshift(newDoc);
    return newDoc;
  }

  async findAll(tenantId: string) {
    if (this.prisma.isConnected) {
      try {
        const records = await this.prisma.knowledgeBaseDocument.findMany({
          where: { tenantId }
        });
        if (records && records.length > 0) return records;
      } catch {
        // fallback
      }
    }
    return KnowledgeService.inMemoryDocs.filter(d => d.tenantId === tenantId || d.tenantId === 'default-tenant');
  }

  async findOne(tenantId: string, id: string) {
    if (this.prisma.isConnected) {
      try {
        const doc = await this.prisma.knowledgeBaseDocument.findFirst({
          where: { id, tenantId }
        });
        if (doc) return doc;
      } catch {
        // fallback
      }
    }
    const found = KnowledgeService.inMemoryDocs.find(d => d.id === id && (d.tenantId === tenantId || d.tenantId === 'default-tenant'));
    if (!found) throw new NotFoundException('Knowledge Base Document not found');
    return found;
  }

  async update(tenantId: string, id: string, data: any) {
    const doc = await this.findOne(tenantId, id);
    let updateData: any = { title: data.title, content: data.content };
    
    if (data.content) {
      updateData.vectorEmbeddings = await this.generateEmbeddings(data.content);
    }

    if (this.prisma.isConnected) {
      try {
        return await this.prisma.knowledgeBaseDocument.update({
          where: { id: doc.id },
          data: updateData,
        });
      } catch {
        // fallback
      }
    }
    Object.assign(doc, updateData);
    return doc;
  }

  async remove(tenantId: string, id: string) {
    const doc = await this.findOne(tenantId, id);
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.knowledgeBaseDocument.delete({
          where: { id: doc.id },
        });
      } catch {
        // fallback
      }
    }
    const idx = KnowledgeService.inMemoryDocs.findIndex(d => d.id === doc.id);
    if (idx !== -1) KnowledgeService.inMemoryDocs.splice(idx, 1);
    return doc;
  }
}
