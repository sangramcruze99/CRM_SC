import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';

export interface StorageKeyOptions {
  tenantId: string;
  service: string;
  module: string;
  entityType?: string;
  entityId?: string;
  category: string;
  filename: string;
}

/**
 * Sanitizes user-provided filenames to prevent Directory Traversal and file system exploits.
 * Removes directory separators, control characters, and unsafe sequences.
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return `file_${Date.now()}`;

  // 1. Strip directory traversal tokens and paths
  let clean = path.basename(filename);

  // 2. Remove null bytes and control chars
  clean = clean.replace(/[\x00-\x1f\x80-\x9f]/g, '');

  // 3. Remove dangerous shell and filesystem symbols
  clean = clean.replace(/[^a-zA-Z0-9._-]/g, '_');

  // 4. Remove leading periods to prevent hidden system files
  clean = clean.replace(/^\.+/, '');

  // 5. Fallback if empty after sanitization
  if (!clean || clean === '.' || clean === '..') {
    clean = `doc_${Date.now()}`;
  }

  // 6. Limit max length
  if (clean.length > 200) {
    const ext = path.extname(clean);
    const base = path.basename(clean, ext);
    clean = `${base.substring(0, 180)}${ext}`;
  }

  return clean;
}

/**
 * Builds the canonical logical namespace storage key.
 * Follows: tenant/{tenantId}/{service}/{module}/{entityType}/{entityId}/{category}/{filename}
 */
export function buildCanonicalStorageKey(options: StorageKeyOptions): string {
  const safeTenant = (options.tenantId || 'default-tenant').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeService = (options.service || 'documents').toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeModule = (options.module || 'general').toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeEntityType = (options.entityType || 'general').toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeEntityId = (options.entityId || 'root').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeCategory = (options.category || 'upload').toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeFilename = sanitizeFilename(options.filename);

  return `tenant/${safeTenant}/${safeService}/${safeModule}/${safeEntityType}/${safeEntityId}/${safeCategory}/${safeFilename}`;
}

/**
 * Calculates SHA-256 content checksum for deduplication and file integrity verification.
 */
export function calculateChecksum(data: Buffer | string): string {
  const hash = crypto.createHash('sha256');
  hash.update(data);
  return hash.digest('hex');
}

/**
 * Resolves local physical storage root path and ensures directory tree exists.
 */
export function resolvePhysicalStoragePath(storageKey: string, baseDir?: string): string {
  const root = baseDir || path.resolve(process.cwd(), 'storage', 'vault');
  const sanitizedRelPath = storageKey.replace(/^tenant[\\/]/, '');
  const fullPath = path.resolve(root, sanitizedRelPath);

  // Path traversal check
  if (!fullPath.startsWith(root)) {
    throw new Error('Path traversal detected in storage path resolution');
  }

  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return fullPath;
}
