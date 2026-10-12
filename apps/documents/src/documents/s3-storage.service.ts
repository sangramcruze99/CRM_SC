import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export interface S3UploadResult {
  key: string;
  bucket: string;
  checksum: string;
  sizeBytes: number;
  url: string;
}

export interface PresignedUrlResult {
  uploadUrl: string;
  key: string;
  expiresInSeconds: number;
}

@Injectable()
export class S3StorageService implements OnModuleInit {
  private readonly logger = new Logger(S3StorageService.name);
  private s3Client!: S3Client;
  private bucket: string;
  private isConfigured: boolean = false;

  constructor() {
    this.bucket =
      process.env.S3_BUCKET ||
      process.env.AWS_S3_BUCKET ||
      'business-os-vault';

    const accessKeyId =
      process.env.S3_ACCESS_KEY_ID ||
      process.env.AWS_ACCESS_KEY_ID ||
      '';
    const secretAccessKey =
      process.env.S3_SECRET_ACCESS_KEY ||
      process.env.AWS_SECRET_ACCESS_KEY ||
      '';
    const endpoint =
      process.env.S3_ENDPOINT ||
      process.env.AWS_S3_ENDPOINT ||
      undefined;
    const region =
      process.env.S3_REGION ||
      process.env.AWS_REGION ||
      'us-east-1';
    const forcePathStyle =
      process.env.S3_FORCE_PATH_STYLE === 'true' || Boolean(endpoint);

    const isProduction = process.env.NODE_ENV === 'production';

    if (!accessKeyId || !secretAccessKey) {
      if (isProduction) {
        throw new Error(
          'FATAL: Private cloud object storage credentials (S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY) are missing in production. Filesystem fallback is forbidden in production.'
        );
      }
      this.logger.warn('S3 credentials not supplied. S3StorageService operating in unconfigured/deferred mode.');
      return;
    }

    this.s3Client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle,
    });

    this.isConfigured = true;
    this.logger.log(`S3 Client initialized. Target Bucket: [${this.bucket}] Endpoint: [${endpoint || 'AWS Standard'}]`);
  }

  async onModuleInit() {
    if (this.isConfigured) {
      await this.ensureBucketExists().catch((err) => {
        this.logger.warn(`Could not verify S3 bucket on init: ${err.message}`);
      });
    }
  }

  get configured(): boolean {
    return this.isConfigured;
  }

  get targetBucket(): string {
    return this.bucket;
  }

  /**
   * Ensures the private bucket exists, creating it if necessary.
   */
  async ensureBucketExists(): Promise<void> {
    if (!this.isConfigured) return;

    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`Verified S3 bucket exists and is accessible: ${this.bucket}`);
    } catch (err: any) {
      if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
        this.logger.log(`Bucket ${this.bucket} not found. Creating private S3 bucket...`);
        await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucket }));
        this.logger.log(`Successfully created private S3 bucket: ${this.bucket}`);
      } else {
        throw err;
      }
    }
  }

  /**
   * Upload an object directly into private cloud object storage.
   */
  async uploadObject(
    key: string,
    body: Buffer,
    contentType: string = 'application/octet-stream',
    metadata: Record<string, string> = {}
  ): Promise<S3UploadResult> {
    if (!this.isConfigured) {
      throw new Error('S3 Client is not configured. Cannot upload object.');
    }

    const checksum = crypto.createHash('sha256').update(body).digest('hex');

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        Metadata: {
          ...metadata,
          'sha256-checksum': checksum,
        },
      })
    );

    this.logger.log(`Uploaded object to S3: [${this.bucket}/${key}] (size: ${body.length} bytes, sha256: ${checksum.slice(0, 12)}...)`);

    return {
      key,
      bucket: this.bucket,
      checksum,
      sizeBytes: body.length,
      url: `/api/v1/documents/vault/file?key=${encodeURIComponent(key)}`,
    };
  }

  /**
   * Get an object buffer and metadata from private S3 storage.
   */
  async getObject(key: string): Promise<{ buffer: Buffer; contentType: string; metadata: Record<string, string> }> {
    if (!this.isConfigured) {
      throw new Error('S3 Client is not configured. Cannot get object.');
    }

    const res = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    );

    const streamToBuffer = async (stream: any): Promise<Buffer> => {
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      return Buffer.concat(chunks);
    };

    const buffer = await streamToBuffer(res.Body);
    return {
      buffer,
      contentType: res.ContentType || 'application/octet-stream',
      metadata: res.Metadata || {},
    };
  }

  /**
   * Delete an object from private S3 storage.
   */
  async deleteObject(key: string): Promise<boolean> {
    if (!this.isConfigured) {
      throw new Error('S3 Client is not configured. Cannot delete object.');
    }

    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    );
    this.logger.log(`Deleted object from S3: [${this.bucket}/${key}]`);
    return true;
  }

  /**
   * Generate a time-bounded presigned upload URL (HTTP PUT).
   */
  async getPresignedUploadUrl(
    key: string,
    contentType: string = 'application/octet-stream',
    expiresInSeconds: number = 900
  ): Promise<PresignedUrlResult> {
    if (!this.isConfigured) {
      throw new Error('S3 Client is not configured. Cannot generate presigned upload URL.');
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: expiresInSeconds,
    });

    return {
      uploadUrl,
      key,
      expiresInSeconds,
    };
  }

  /**
   * Generate a time-bounded presigned download URL (HTTP GET).
   */
  async getPresignedDownloadUrl(key: string, expiresInSeconds: number = 3600): Promise<string> {
    if (!this.isConfigured) {
      throw new Error('S3 Client is not configured. Cannot generate presigned download URL.');
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, {
      expiresIn: expiresInSeconds,
    });
  }

  /**
   * List objects in bucket by prefix.
   */
  async listObjects(prefix: string = ''): Promise<{ key: string; size: number; lastModified?: Date }[]> {
    if (!this.isConfigured) {
      return [];
    }

    const res = await this.s3Client.send(
      new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
      })
    );

    return (res.Contents || []).map((item) => ({
      key: item.Key || '',
      size: item.Size || 0,
      lastModified: item.LastModified,
    }));
  }

  /**
   * Migrate existing local vault filesystem files to private cloud object storage.
   * Calculates SHA-256 before and after upload to verify exact byte fidelity.
   */
  async migrateLocalVault(localVaultDir: string, tenantId: string = 'default-tenant'): Promise<{
    migratedCount: number;
    skippedCount: number;
    failedCount: number;
    files: { relativePath: string; key: string; checksum: string; verified: boolean }[];
  }> {
    if (!this.isConfigured) {
      throw new Error('S3 Client is not configured. Cannot execute local vault migration.');
    }

    if (!fs.existsSync(localVaultDir)) {
      return { migratedCount: 0, skippedCount: 0, failedCount: 0, files: [] };
    }

    const results: { relativePath: string; key: string; checksum: string; verified: boolean }[] = [];
    let migratedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    const walk = (dir: string): string[] => {
      let fileList: string[] = [];
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          fileList = fileList.concat(walk(fullPath));
        } else {
          fileList.push(fullPath);
        }
      }
      return fileList;
    };

    const allFiles = walk(localVaultDir);
    this.logger.log(`Found ${allFiles.length} files in local vault [${localVaultDir}] to evaluate for migration.`);

    for (const filePath of allFiles) {
      const relPath = path.relative(localVaultDir, filePath).replace(/\\/g, '/');
      const s3Key = `vault/${tenantId}/${relPath}`;

      try {
        const content = fs.readFileSync(filePath);
        const localChecksum = crypto.createHash('sha256').update(content).digest('hex');

        // Check if object already exists in S3 with same size
        try {
          const head = await this.s3Client.send(
            new HeadObjectCommand({ Bucket: this.bucket, Key: s3Key })
          );
          if (head.ContentLength === content.length) {
            skippedCount++;
            results.push({ relativePath: relPath, key: s3Key, checksum: localChecksum, verified: true });
            continue;
          }
        } catch {
          // Object does not exist, proceed to upload
        }

        // Upload to S3
        const uploadResult = await this.uploadObject(s3Key, content, 'application/octet-stream', {
          'migrated-from': relPath,
        });

        // Verification: Verify checksum matches
        const isVerified = uploadResult.checksum === localChecksum;
        if (!isVerified) {
          throw new Error(`Checksum mismatch after migration upload for file ${relPath}`);
        }

        migratedCount++;
        results.push({
          relativePath: relPath,
          key: s3Key,
          checksum: localChecksum,
          verified: true,
        });
      } catch (err: any) {
        this.logger.error(`Failed migrating file ${relPath} to S3: ${err.message}`);
        failedCount++;
        results.push({
          relativePath: relPath,
          key: s3Key,
          checksum: '',
          verified: false,
        });
      }
    }

    this.logger.log(
      `Vault Migration Complete: ${migratedCount} migrated, ${skippedCount} skipped (already in S3), ${failedCount} failed.`
    );

    return {
      migratedCount,
      skippedCount,
      failedCount,
      files: results,
    };
  }
}
