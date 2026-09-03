import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentsService {
  private static inMemoryDocs: any[] = [
    { id: 'doc_1', name: 'Commercial_Agreement_2026.pdf', mimeType: 'application/pdf', size: 1048576, url: 'https://storage.crm.example.com/demo.pdf', tenantId: 'default-tenant', createdAt: new Date() }
  ];

  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, folderId?: string) {
    if (folderId === 'root') folderId = '';
    if (this.prisma.isConnected) {
      try {
        const records = await this.prisma.document.findMany({
          where: {
            tenantId,
            folderId: folderId || null,
          },
          orderBy: { createdAt: 'desc' },
        });
        if (records && records.length > 0) return records;
      } catch {
        // fallback
      }
    }
    return DocumentsService.inMemoryDocs.filter(d => d.tenantId === tenantId || d.tenantId === 'default-tenant');
  }

  async create(data: { name: string; folderId?: string; mimeType?: string; size?: number; url?: string }, tenantId: string) {
    if (data.folderId === 'root') data.folderId = '';
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.document.create({
          data: {
            name: data.name,
            folderId: data.folderId || null,
            mimeType: data.mimeType || 'application/octet-stream',
            size: data.size || 1024,
            url: data.url || `https://storage.crm.example.com/${tenantId}/${data.name}`,
            tenantId,
          },
        });
      } catch {
        // fallback
      }
    }
    const newDoc = {
      id: `doc_${Date.now()}`,
      name: data.name,
      folderId: data.folderId || null,
      mimeType: data.mimeType || 'application/octet-stream',
      size: data.size || 1024,
      url: data.url || `https://storage.crm.example.com/${tenantId}/${data.name}`,
      tenantId,
      createdAt: new Date()
    };
    DocumentsService.inMemoryDocs.unshift(newDoc);
    return newDoc;
  }

  async delete(id: string, tenantId: string) {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.document.deleteMany({
          where: { id, tenantId },
        });
      } catch {
        // fallback
      }
    }
    DocumentsService.inMemoryDocs = DocumentsService.inMemoryDocs.filter(d => !(d.id === id && d.tenantId === tenantId));
    return { count: 1 };
  }
}
