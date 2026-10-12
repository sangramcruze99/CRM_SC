import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

export interface StoredAssetRecord {
  id: string;
  tenantId: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  storageProvider: 's3' | 'local' | 'minio';
  url: string;
  createdAt: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly assetRegistry: Map<string, StoredAssetRecord> = new Map();

  constructor() {
    // Seed sample enterprise assets
    this.seedDefaultAssets();
  }

  async generatePresignedUrl(tenantId: string, fileName: string, contentType: string) {
    const fileKey = `uploads/${tenantId}/${Date.now()}-${fileName.replace(/\s+/g, '_')}`;
    const fileId = `ast_${crypto.randomBytes(8).toString('hex')}`;
    const uploadUrl = `/api/storage/raw-upload?key=${encodeURIComponent(fileKey)}`;
    const publicUrl = `/storage/assets/${fileId}`;

    const record: StoredAssetRecord = {
      id: fileId,
      tenantId,
      fileName,
      contentType,
      sizeBytes: 0,
      storageProvider: process.env.S3_BUCKET ? 's3' : 'local',
      url: publicUrl,
      createdAt: new Date().toISOString(),
    };

    this.assetRegistry.set(fileId, record);

    return {
      success: true,
      fileId,
      fileKey,
      uploadUrl,
      publicUrl,
      expiresInSeconds: 900,
    };
  }

  async getAsset(tenantId: string, id: string): Promise<StoredAssetRecord | null> {
    const asset = this.assetRegistry.get(id);
    if (!asset || asset.tenantId !== tenantId) {
      return null;
    }
    return asset;
  }

  async listAssets(tenantId: string): Promise<StoredAssetRecord[]> {
    return Array.from(this.assetRegistry.values()).filter((a) => a.tenantId === tenantId);
  }

  private seedDefaultAssets() {
    const seeds: StoredAssetRecord[] = [
      {
        id: 'ast_logo_default',
        tenantId: 'default-tenant',
        fileName: 'brand_master_logo.svg',
        contentType: 'image/svg+xml',
        sizeBytes: 14200,
        storageProvider: 'local',
        url: '/branding/logo.svg',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'ast_invoice_template',
        tenantId: 'default-tenant',
        fileName: 'commercial_invoice_standard.pdf',
        contentType: 'application/pdf',
        sizeBytes: 154200,
        storageProvider: 'local',
        url: '/templates/invoice.pdf',
        createdAt: new Date().toISOString(),
      },
    ];

    for (const item of seeds) {
      this.assetRegistry.set(item.id, item);
    }
  }
}
