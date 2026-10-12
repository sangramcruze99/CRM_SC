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

export interface MagicByteValidationResult {
  isValid: boolean;
  detectedType: string;
  reason?: string;
}

const MAGIC_SIGNATURES: Array<{ type: string; mime: string; bytes: number[] }> = [
  { type: 'pdf', mime: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { type: 'png', mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { type: 'jpeg', mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { type: 'gif', mime: 'image/gif', bytes: [0x47, 0x49, 0x46, 0x38] }, // GIF8
  { type: 'zip', mime: 'application/zip', bytes: [0x50, 0x4b, 0x03, 0x04] }, // PK..
];

const DISALLOWED_MAGIC: Array<{ type: string; bytes: number[] }> = [
  { type: 'pe-executable', bytes: [0x4d, 0x5a] }, // MZ (Windows executable / dll)
  { type: 'elf-executable', bytes: [0x7f, 0x45, 0x4c, 0x46] }, // \x7fELF (Linux executable)
];

const DISALLOWED_EXTENSIONS = new Set([
  '.exe', '.dll', '.bat', '.cmd', '.sh', '.bash', '.ps1', '.vbs', '.js', '.mjs', '.jar', '.scr', '.msi', '.com'
]);

/**
 * Validates file buffer magic bytes against declared MIME type and enforces strict rejection
 * of executable binary formats (MZ, ELF) and prohibited file extensions.
 */
export function verifyFileMagicBytes(
  buffer: Buffer,
  filename?: string,
  declaredMimeType?: string
): MagicByteValidationResult {
  if (!buffer || buffer.length === 0) {
    return { isValid: false, detectedType: 'empty', reason: 'File buffer is empty' };
  }

  // 1. Prohibited extension check
  if (filename) {
    const ext = path.extname(filename).toLowerCase();
    if (DISALLOWED_EXTENSIONS.has(ext)) {
      return {
        isValid: false,
        detectedType: 'executable-extension',
        reason: `Prohibited executable file extension "${ext}" is blocked`,
      };
    }
  }

  // 2. Reject executable signatures (PE / ELF)
  for (const sig of DISALLOWED_MAGIC) {
    if (buffer.length >= sig.bytes.length) {
      const match = sig.bytes.every((b, idx) => buffer[idx] === b);
      if (match) {
        return {
          isValid: false,
          detectedType: sig.type,
          reason: `Executable binary signature (${sig.type}) detected. File upload rejected.`,
        };
      }
    }
  }

  // 3. Match known safe magic bytes
  let detectedType = 'binary/octet-stream';
  for (const sig of MAGIC_SIGNATURES) {
    if (buffer.length >= sig.bytes.length) {
      const match = sig.bytes.every((b, idx) => buffer[idx] === b);
      if (match) {
        detectedType = sig.type;
        break;
      }
    }
  }

  // 4. If declared as PDF, require %PDF header
  if (declaredMimeType === 'application/pdf' && detectedType !== 'pdf') {
    return {
      isValid: false,
      detectedType,
      reason: 'Declared PDF file does not contain valid %PDF magic header',
    };
  }

  // 5. If declared as image (png, jpeg, gif), verify magic signature
  if (declaredMimeType?.startsWith('image/')) {
    const expectedType = declaredMimeType.replace('image/', '');
    if (detectedType !== expectedType && detectedType !== 'binary/octet-stream') {
      return {
        isValid: false,
        detectedType,
        reason: `MIME type mismatch: declared "${declaredMimeType}" but signature matches "${detectedType}"`,
      };
    }
  }

  return { isValid: true, detectedType };
}

/**
 * Virus scan hook interface and test signature detector (EICAR standard).
 */
export function scanBufferForMalware(buffer: Buffer): { isClean: boolean; threat?: string } {
  const content = buffer.toString('latin1');
  // EICAR standard anti-virus test signature
  if (content.includes('X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*')) {
    return { isClean: false, threat: 'EICAR-Test-Signature' };
  }
  return { isClean: true };
}
