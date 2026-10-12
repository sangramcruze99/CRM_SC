import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
  private s3Client?: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET || process.env.AWS_S3_BUCKET || 'business-os-vault';
    const accessKeyId = process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
    const endpoint = process.env.S3_ENDPOINT || process.env.AWS_S3_ENDPOINT;
    const region = process.env.S3_REGION || process.env.AWS_REGION || 'us-east-1';

    if (accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({
        region,
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true' || Boolean(endpoint),
      });
      this.logger.log(`StorageService initialized with S3/MinIO backend (bucket: ${this.bucket})`);
    } else if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: Private cloud object storage credentials missing in production.');
    }

    // Seed sample enterprise assets
    this.seedDefaultAssets();
  }

  async generatePresignedUrl(tenantId: string, fileName: string, contentType: string) {
    const fileKey = `uploads/${tenantId}/${Date.now()}-${fileName.replace(/\s+/g, '_')}`;
    const fileId = `ast_${crypto.randomBytes(8).toString('hex')}`;
    let uploadUrl = `/api/storage/raw-upload?key=${encodeURIComponent(fileKey)}`;
    const publicUrl = `/storage/assets/${fileId}`;

    if (this.s3Client) {
      try {
        const cmd = new PutObjectCommand({
          Bucket: this.bucket,
          Key: fileKey,
          ContentType: contentType,
        });
        uploadUrl = await getSignedUrl(this.s3Client, cmd, { expiresIn: 900 });
      } catch (err: any) {
        this.logger.warn(`Could not generate S3 presigned URL: ${err.message}`);
      }
    }

    const record: StoredAssetRecord = {
      id: fileId,
      tenantId,
      fileName,
      contentType,
      sizeBytes: 0,
      storageProvider: this.s3Client ? (process.env.S3_ENDPOINT?.includes(':9000') ? 'minio' : 's3') : 'local',
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
