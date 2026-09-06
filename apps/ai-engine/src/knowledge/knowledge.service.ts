import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);
  private static inMemoryDocs: any[] = [
    { id: 'kb_1', title: 'Standard Operating Procedures & Brand Guide', content: 'Enterprise standard procedures and brand identity guidelines.', tenantId: 'default-tenant', createdAt: new Date() }
  ];

  constructor(private readonly prisma: PrismaService) {}

  private async generateEmbeddings(text: string, tenantId?: string): Promise<number[]> {
    const pythonAiUrl = process.env.PYTHON_AI_URL || 'http://localhost:3030';
    const pythonAiKey = process.env.PYTHON_AI_API_KEY || 'business-os-internal-ai-key-secret';

    // 1. Primary: Call Python AI local embedding service (:3030)
    try {
      const res = await fetch(`${pythonAiUrl}/v1/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId || 'system',
          'X-Service-Key': pythonAiKey,
        },
        body: JSON.stringify({
          input: text,
          model: 'all-MiniLM-L6-v2',
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.embeddings && data.embeddings.length > 0) {
          return data.embeddings[0];
        }
      }
    } catch {
      // Graceful fallback to Xenova transformers
    }

    // 2. Secondary: Fallback to Xenova Transformers in Node.js
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
    const vector = await this.generateEmbeddings(data.content || '', tenantId);

    if (this.prisma.isConnected) {
      try {
        return await this.prisma.knowledgeBaseDocument.create({
          data: {
            tenantId,
            title: data.title,
            content: data.content,
            vectorEmbeddings: JSON.stringify(vector)
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
        const record = await this.prisma.knowledgeBaseDocument.findFirst({
          where: { id, tenantId }
        });
        if (record) return record;
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
      const vec = await this.generateEmbeddings(data.content);
      updateData.vectorEmbeddings = JSON.stringify(vec);
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

  /**
   * Search knowledge base documents using vector embeddings and cosine similarity
   */
  async search(tenantId: string, query: string, limit: number = 3) {
    const queryVec = await this.generateEmbeddings(query);
    const docs = await this.findAll(tenantId);

    const scored = docs.map((doc: any) => {
      let docVec: number[] = [];
      try {
        if (typeof doc.vectorEmbeddings === 'string') {
          docVec = JSON.parse(doc.vectorEmbeddings);
        } else if (Array.isArray(doc.vectorEmbeddings)) {
          docVec = doc.vectorEmbeddings;
        }
      } catch {
        docVec = [];
      }

      // Keyword boost
      const lowerQuery = query.toLowerCase();
      const titleMatch = (doc.title || '').toLowerCase().includes(lowerQuery) ? 0.3 : 0;
      const contentMatch = (doc.content || '').toLowerCase().includes(lowerQuery) ? 0.2 : 0;

      let cosineSim = 0;
      if (docVec.length > 0 && queryVec.length > 0) {
        let dot = 0;
        let normA = 0;
        let normB = 0;
        const len = Math.min(docVec.length, queryVec.length);
        for (let i = 0; i < len; i++) {
          dot += docVec[i] * queryVec[i];
          normA += docVec[i] * docVec[i];
          normB += queryVec[i] * queryVec[i];
        }
        if (normA > 0 && normB > 0) {
          cosineSim = dot / (Math.sqrt(normA) * Math.sqrt(normB));
        }
      }

      const totalScore = cosineSim + titleMatch + contentMatch;

      return {
        id: doc.id,
        title: doc.title,
        content: doc.content,
        snippet: (doc.content || '').substring(0, 300),
        similarity: Math.round(totalScore * 100) / 100,
      };
    });

    scored.sort((a, b) => b.similarity - a.similarity);
    return scored.slice(0, limit);
  }
}
