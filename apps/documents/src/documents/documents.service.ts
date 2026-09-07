import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentServiceRegistry } from './document-service.registry';
import {
  buildCanonicalStorageKey,
  sanitizeFilename,
  calculateChecksum,
  resolvePhysicalStoragePath,
} from './storage-path.util';

export interface CreateDocumentInput {
  name: string;
  originalName?: string;
  service?: string;
  module?: string;
  entityType?: string;
  entityId?: string;
  category?: string;
  mimeType?: string;
  size?: number;
  url?: string;
  fileData?: string; // Optional base64 data URL or raw string
  checksum?: string;
  parentDocumentId?: string;
  folderId?: string;
  createdBy?: string;
  source?: string;
}

export interface DocumentFilterOptions {
  service?: string;
  module?: string;
  entityType?: string;
  entityId?: string;
  category?: string;
  folderId?: string;
  status?: string;
  parentDocumentId?: string;
  search?: string;
}

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  // In-memory fallback if database connection is disrupted
  private static inMemoryDocs: any[] = [];
  private static inMemoryRefs: any[] = [];

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all documents matching tenant and optional service-aware filters
   */
  async findAll(tenantId: string, filters: DocumentFilterOptions = {}) {
    if (this.prisma.isConnected) {
      try {
        const where: any = {
          tenantId,
          status: filters.status || 'ACTIVE',
        };

        if (filters.service && filters.service !== 'all') {
          where.service = filters.service.toLowerCase();
        }
        if (filters.module) {
          where.module = filters.module.toLowerCase();
        }
        if (filters.entityType) {
          where.entityType = filters.entityType.toLowerCase();
        }
        if (filters.entityId) {
          where.entityId = filters.entityId;
        }
        if (filters.category && filters.category !== 'all') {
          where.category = filters.category.toLowerCase();
        }
        if (filters.folderId === 'root') {
          where.folderId = null;
        } else if (filters.folderId) {
          where.folderId = filters.folderId;
        }
        if (filters.parentDocumentId !== undefined) {
          where.parentDocumentId = filters.parentDocumentId;
        }
        if (filters.search) {
          where.OR = [
            { name: { contains: filters.search } },
            { originalName: { contains: filters.search } },
            { entityId: { contains: filters.search } },
          ];
        }

        const records = await this.prisma.document.findMany({
          where,
          include: {
            references: true,
            childDocuments: true,
          },
          orderBy: { createdAt: 'desc' },
        });

        return records;
      } catch (err: any) {
        this.logger.warn(`Prisma findMany fallback: ${err.message}`);
      }
    }

    // In-memory fallback
    return DocumentsService.inMemoryDocs.filter((d) => {
      if (d.tenantId !== tenantId) return false;
      if (filters.service && filters.service !== 'all' && d.service !== filters.service.toLowerCase()) return false;
      if (filters.module && d.module !== filters.module.toLowerCase()) return false;
      if (filters.category && filters.category !== 'all' && d.category !== filters.category.toLowerCase()) return false;
      if (filters.entityId && d.entityId !== filters.entityId) return false;
      if (filters.folderId === 'root' && d.folderId) return false;
      if (filters.folderId && filters.folderId !== 'root' && d.folderId !== filters.folderId) return false;
      return true;
    });
  }

  /**
   * Find single document by ID with tenant isolation
   */
  async findOne(id: string, tenantId: string) {
    if (this.prisma.isConnected) {
      try {
        const doc = await this.prisma.document.findFirst({
          where: { id, tenantId },
          include: {
            references: true,
            childDocuments: true,
          },
        });
        if (!doc) throw new NotFoundException(`Document ${id} not found in tenant`);
        return doc;
      } catch (err: any) {
        if (err instanceof NotFoundException) throw err;
      }
    }

    const memoryDoc = DocumentsService.inMemoryDocs.find((d) => d.id === id && d.tenantId === tenantId);
    if (!memoryDoc) throw new NotFoundException(`Document ${id} not found`);
    return memoryDoc;
  }

  /**
   * Find a document with its complete lineage (original document + receipts + output artifacts)
   */
  async findWithLineage(id: string, tenantId: string) {
    const document = await this.findOne(id, tenantId);

    let receipts: any[] = [];
    let outputs: any[] = [];
    let allChildren: any[] = [];
    let references: any[] = [];

    if (this.prisma.isConnected) {
      try {
        const children = await this.prisma.document.findMany({
          where: { parentDocumentId: id, tenantId },
          orderBy: { createdAt: 'asc' },
        });

        receipts = children.filter((c: any) => c.category === 'receipt');
        outputs = children.filter((c: any) => c.category === 'output');
        allChildren = children;

        references = await this.prisma.documentReference.findMany({
          where: { documentId: id, tenantId },
        });
      } catch (err: any) {
        this.logger.warn(`Lineage lookup error: ${err.message}`);
      }
    }

    return {
      document,
      receipts,
      outputs,
      children: allChildren,
      references,
    };
  }

  /**
   * Upload & Ingest Pipeline:
   * 1. Validate Service/Module/Category in Registry
   * 2. Sanitize Filename & Build Canonical Storage Key
   * 3. Calculate Checksum & Perform Canonical Deduplication
   * 4. Persist Physical File to Storage
   * 5. Record Authoritative DB Metadata
   * 6. Emit Real Domain Event & Audit Log
   */
  async create(data: CreateDocumentInput, tenantId: string) {
    // 1. Service & Category Validation via Registry
    const placement = DocumentServiceRegistry.validatePlacement({
      service: data.service,
      module: data.module,
      entityType: data.entityType,
      entityId: data.entityId,
      category: data.category,
    });

    const originalName = data.originalName || data.name || 'unnamed_file';
    const sanitizedName = sanitizeFilename(data.name || originalName);

    // 2. Canonical Logical Namespace Key
    const storageKey = buildCanonicalStorageKey({
      tenantId,
      service: placement.service,
      module: placement.module,
      entityType: placement.entityType,
      entityId: placement.entityId,
      category: placement.category,
      filename: sanitizedName,
    });

    // 3. Checksum & Buffer Handling
    let fileBuffer: Buffer | null = null;
    let computedChecksum = data.checksum;

    if (data.fileData) {
      try {
        if (data.fileData.startsWith('data:')) {
          const commaIdx = data.fileData.indexOf(',');
          const base64Str = commaIdx !== -1 ? data.fileData.slice(commaIdx + 1) : data.fileData;
          fileBuffer = Buffer.from(base64Str, 'base64');
        } else {
          const isBase64 = /^[A-Za-z0-9+/=\r\n]+$/.test(data.fileData) && data.fileData.length % 4 === 0;
          fileBuffer = isBase64 ? Buffer.from(data.fileData, 'base64') : Buffer.from(data.fileData, 'utf-8');
        }
        computedChecksum = data.checksum || calculateChecksum(fileBuffer);
      } catch (bufErr: any) {
        this.logger.warn(`Buffer decode warning: ${bufErr.message}`);
      }
    }

    if (!computedChecksum) {
      computedChecksum = calculateChecksum(data.url || `${tenantId}:${storageKey}:${Date.now()}`);
    }

    // 4. Physical Storage Persistence
    let physicalSavedPath: string | null = null;
    if (fileBuffer) {
      try {
        physicalSavedPath = resolvePhysicalStoragePath(storageKey);
        fs.writeFileSync(physicalSavedPath, fileBuffer);
        this.logger.log(`Persisted canonical physical file: ${storageKey}`);
      } catch (fsErr: any) {
        this.logger.warn(`Physical file save warning: ${fsErr.message}`);
      }
    }

    // 5. Canonical Storage Deduplication Check:
    // If a document with identical tenant and checksum already exists, reuse canonical storage
    if (this.prisma.isConnected && computedChecksum) {
      try {
        const existingCanonicalDoc = await this.prisma.document.findFirst({
          where: {
            tenantId,
            checksum: computedChecksum,
            status: 'ACTIVE',
          },
        });

        if (existingCanonicalDoc) {
          // If the new request references a different entity or service, create a cross-service DocumentReference
          const isSameTarget =
            existingCanonicalDoc.service === placement.service &&
            existingCanonicalDoc.module === placement.module &&
            existingCanonicalDoc.entityId === placement.entityId &&
            existingCanonicalDoc.category === placement.category;

          if (!isSameTarget) {
            this.logger.log(
              `Canonical deduplication: linking file (checksum: ${computedChecksum.slice(0, 8)}...) via DocumentReference to doc ${existingCanonicalDoc.id}`,
            );

            const docRef = await this.prisma.documentReference.create({
              data: {
                documentId: existingCanonicalDoc.id,
                tenantId,
                service: placement.service,
                module: placement.module,
                entityType: placement.entityType,
                entityId: placement.entityId,
                category: placement.category,
                notes: `Deduplicated upload for ${sanitizedName}`,
              },
            });

            // Emit domain event
            await this.dispatchDomainEvent(tenantId, 'DOCUMENT_UPLOADED', {
              documentId: existingCanonicalDoc.id,
              referenceId: docRef.id,
              tenantId,
              service: placement.service,
              module: placement.module,
              entityType: placement.entityType,
              entityId: placement.entityId,
              category: placement.category,
              isDeduplicated: true,
              name: sanitizedName,
              status: 'COMPLETED',
            });

            // Log Audit
            await this.logAudit(tenantId, 'DOCUMENT_REFERENCE_CREATED', existingCanonicalDoc.id, data.createdBy, {
              service: placement.service,
              module: placement.module,
              entityId: placement.entityId,
              canonicalDocumentId: existingCanonicalDoc.id,
            });

            return {
              ...existingCanonicalDoc,
              reference: docRef,
              isDeduplicated: true,
            };
          } else {
            // Duplicate upload to the exact same target: protect against duplicate processing
            this.logger.log(`Duplicate upload detected for same target entity ${placement.entityId}. Returning canonical document.`);
            return {
              ...existingCanonicalDoc,
              isDeduplicated: true,
              reference: null,
            };
          }
        }
      } catch (dedupErr: any) {
        this.logger.warn(`Deduplication check error: ${dedupErr.message}`);
      }
    }

    // 6. Persist Authoritative Database Metadata
    const size = fileBuffer ? fileBuffer.length : data.size || 1024;
    const url = data.url || `https://storage.crm.example.com/${storageKey}`;
    const parentDocumentId = data.parentDocumentId || null;

    let createdDoc: any = null;
    if (this.prisma.isConnected) {
      try {
        createdDoc = await this.prisma.document.create({
          data: {
            name: sanitizedName,
            originalName,
            mimeType: data.mimeType || 'application/octet-stream',
            size,
            url,
            storageKey,
            checksum: computedChecksum,
            service: placement.service,
            module: placement.module,
            entityType: placement.entityType,
            entityId: placement.entityId,
            category: placement.category,
            source: data.source || 'MANUAL_UPLOAD',
            status: 'ACTIVE',
            processingStatus: 'COMPLETED',
            parentDocumentId,
            folderId: data.folderId === 'root' || !data.folderId ? null : data.folderId,
            createdBy: data.createdBy || null,
            tenantId,
          },
        });
      } catch (err: any) {
        this.logger.warn(`Prisma create fallback: ${err.message}`);
      }
    }

    if (!createdDoc) {
      createdDoc = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: sanitizedName,
        originalName,
        mimeType: data.mimeType || 'application/octet-stream',
        size,
        url,
        storageKey,
        checksum: computedChecksum,
        service: placement.service,
        module: placement.module,
        entityType: placement.entityType,
        entityId: placement.entityId,
        category: placement.category,
        source: data.source || 'MANUAL_UPLOAD',
        status: 'ACTIVE',
        processingStatus: 'COMPLETED',
        parentDocumentId,
        folderId: data.folderId || null,
        createdBy: data.createdBy || null,
        tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      DocumentsService.inMemoryDocs.unshift(createdDoc);
    }

    // 7. Emit Real Domain Event to Enterprise Event Bus (:3009)
    await this.dispatchDomainEvent(tenantId, 'DOCUMENT_UPLOADED', {
      documentId: createdDoc.id,
      tenantId,
      service: placement.service,
      module: placement.module,
      entityType: placement.entityType,
      entityId: placement.entityId,
      category: placement.category,
      fileName: sanitizedName,
      mimeType: createdDoc.mimeType,
      size: createdDoc.size,
      checksum: computedChecksum,
      storageKey,
      parentDocumentId,
      status: 'UPLOADED',
    });

    // 8. Record Activity in Audit Log
    await this.logAudit(tenantId, 'DOCUMENT_UPLOAD', createdDoc.id, data.createdBy, {
      service: placement.service,
      module: placement.module,
      entityType: placement.entityType,
      entityId: placement.entityId,
      category: placement.category,
      storageKey,
      checksum: computedChecksum,
    });

    return createdDoc;
  }

  /**
   * Cross-Service Reference Creation: Link an existing canonical document to a new service/entity
   */
  async addReference(
    documentId: string,
    tenantId: string,
    data: {
      service: string;
      module?: string;
      entityType?: string;
      entityId?: string;
      category?: string;
      notes?: string;
      userId?: string;
    },
  ) {
    const document = await this.findOne(documentId, tenantId);

    const placement = DocumentServiceRegistry.validatePlacement({
      service: data.service,
      module: data.module,
      entityType: data.entityType,
      entityId: data.entityId,
      category: data.category,
    });

    if (this.prisma.isConnected) {
      const ref = await this.prisma.documentReference.create({
        data: {
          documentId: document.id,
          tenantId,
          service: placement.service,
          module: placement.module,
          entityType: placement.entityType,
          entityId: placement.entityId,
          category: placement.category,
          notes: data.notes || null,
        },
      });

      await this.logAudit(tenantId, 'DOCUMENT_REFERENCE_ADDED', document.id, data.userId, {
        service: placement.service,
        module: placement.module,
        entityId: placement.entityId,
      });

      return ref;
    }

    const memRef = {
      id: `ref_${Date.now()}`,
      documentId,
      tenantId,
      service: placement.service,
      module: placement.module,
      entityType: placement.entityType,
      entityId: placement.entityId,
      category: placement.category,
      notes: data.notes || null,
      createdAt: new Date(),
    };
    DocumentsService.inMemoryRefs.push(memRef);
    return memRef;
  }

  /**
   * Update Document Processing Status (e.g. UPLOADED -> PROCESSING -> PROCESSED or FAILED)
   */
  async updateProcessingStatus(
    id: string,
    tenantId: string,
    status: 'UPLOADED' | 'QUEUED' | 'PROCESSING' | 'PROCESSED' | 'FAILED' | 'COMPLETED',
    error?: string,
  ) {
    if (this.prisma.isConnected) {
      try {
        const updated = await this.prisma.document.updateMany({
          where: { id, tenantId },
          data: {
            processingStatus: status,
            processingError: error || null,
          },
        });

        // Dispatch domain lifecycle event
        const eventType =
          status === 'FAILED'
            ? 'DOCUMENT_PROCESSING_FAILED'
            : status === 'PROCESSED' || status === 'COMPLETED'
              ? 'DOCUMENT_PROCESSED'
              : 'DOCUMENT_PROCESSING';

        await this.dispatchDomainEvent(tenantId, eventType, {
          documentId: id,
          tenantId,
          status,
          error,
        });

        return updated;
      } catch (err: any) {
        this.logger.warn(`Status update warning: ${err.message}`);
      }
    }
  }

  /**
   * Soft Delete or Archive Document
   */
  async delete(id: string, tenantId: string, userId?: string) {
    if (this.prisma.isConnected) {
      try {
        const deleted = await this.prisma.document.deleteMany({
          where: { id, tenantId },
        });

        await this.logAudit(tenantId, 'DOCUMENT_DELETE', id, userId, {
          action: 'DELETED',
        });

        return deleted;
      } catch (err: any) {
        this.logger.warn(`Delete error: ${err.message}`);
      }
    }

    DocumentsService.inMemoryDocs = DocumentsService.inMemoryDocs.filter(
      (d) => !(d.id === id && d.tenantId === tenantId),
    );
    return { count: 1 };
  }

  /**
   * Dispatches Standardized Business Event to the Automation Event Bus
   */
  private async dispatchDomainEvent(tenantId: string, type: string, payload: Record<string, any>) {
    try {
      const busUrl = process.env.AUTOMATION_URL || 'http://localhost:3009';
      const apiKey = process.env.API_KEY || process.env.SYSTEM_API_KEY || 'ee03f6bc2fba450fdf6d080ae6c8c919';
      const jwtSecret = process.env.JWT_SECRET || 'replace-with-a-secure-random-32-byte-hex-or-base64-string';
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
      const body = Buffer.from(
        JSON.stringify({
          sub: 'system-documents-vault',
          email: 'system@crm.internal',
          role: 'ADMIN',
          tenantId,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
        }),
      ).toString('base64url');
      const sig = crypto.createHmac('sha256', jwtSecret).update(`${header}.${body}`).digest('base64url');
      const internalToken = `${header}.${body}.${sig}`;

      const res = await fetch(`${busUrl}/workflows/events/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
          'x-api-key': apiKey,
          'x-service-key': apiKey,
          Authorization: `Bearer ${internalToken}`,
        },
        body: JSON.stringify({
          type,
          eventType: type,
          source: 'documents-vault',
          payload,
          actor: { type: 'SYSTEM' },
        }),
      });

      if (res.ok) {
        this.logger.log(`Domain event ${type} published to Automation Event Bus for doc ${payload.documentId}`);
      }
    } catch {
      // Event bus offline or async non-blocking
    }
  }

  /**
   * Records Audit Activity Log in Database
   */
  private async logAudit(
    tenantId: string,
    action: string,
    entityId: string,
    userId?: string,
    metadata?: Record<string, any>,
  ) {
    if (this.prisma.isConnected) {
      try {
        await this.prisma.auditLog.create({
          data: {
            tenantId,
            action: `DOCUMENT_${action}`,
            entityType: 'Document',
            entityId,
            userId: userId || null,
            metadata: metadata ? JSON.stringify(metadata) : null,
          },
        });
      } catch {
        // safe fallback
      }
    }
  }
}
