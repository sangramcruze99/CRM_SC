/**
 * Document Idempotency & Duplicate Detection Engine
 * Computes cryptographically secure SHA-256 fingerprints to prevent redundant duplicate processing.
 */

import crypto from 'crypto';

interface ProcessedDocumentRecord {
  fingerprint: string;
  documentId: string;
  processedAt: string;
  documentType: string;
  total?: number | null;
  invoiceNumber?: string | null;
}

export class IdempotencyManager {
  private static cache: Map<string, ProcessedDocumentRecord> = new Map();

  /**
   * Computes SHA-256 fingerprint from buffer or base64 string.
   */
  static computeFingerprint(content: Buffer | string): string {
    const hash = crypto.createHash('sha256');
    if (Buffer.isBuffer(content)) {
      hash.update(content);
    } else {
      const clean = content.includes('base64,') ? content.split('base64,')[1] : content;
      hash.update(Buffer.from(clean, 'utf-8'));
    }
    return hash.digest('hex');
  }

  /**
   * Checks if this fingerprint has already been processed for the tenant.
   */
  static checkDuplicate(tenantId: string, fingerprint: string): ProcessedDocumentRecord | null {
    const key = `${tenantId}:${fingerprint}`;
    return this.cache.get(key) || null;
  }

  /**
   * Records a processed document fingerprint.
   */
  static record(tenantId: string, record: ProcessedDocumentRecord) {
    const key = `${tenantId}:${record.fingerprint}`;
    this.cache.set(key, record);
  }

  /**
   * Clears record for a specific document (e.g. on forced reprocess).
   */
  static clear(tenantId: string, fingerprint: string) {
    const key = `${tenantId}:${fingerprint}`;
    this.cache.delete(key);
  }
}
