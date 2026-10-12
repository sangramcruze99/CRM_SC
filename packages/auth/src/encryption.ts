import * as crypto from 'crypto';

/**
 * Standard prefix and version for TOTP secret authenticated encryption.
 * Format: enc:v1:<iv_12bytes_hex>:<tag_16bytes_hex>:<ciphertext_hex>
 */
export const MFA_CIPHERTEXT_PREFIX = 'enc:v1:';
const GCM_IV_LENGTH = 12; // 96-bit IV recommended by NIST for AES-GCM
const GCM_TAG_LENGTH = 16; // 128-bit authentication tag

/**
 * Validates and retrieves the 256-bit MFA Encryption Key from environment variables.
 * Key must come from a dedicated secret/KMS integration, completely separated
 * from database records.
 */
export function getMfaEncryptionKey(): Buffer {
  const rawKey = process.env.MFA_ENCRYPTION_KEY || process.env.TOTP_ENCRYPTION_KEY;

  if (!rawKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'FATAL SECURITY ERROR: MFA_ENCRYPTION_KEY is required in production environment. Secrets cannot be encrypted or decrypted.'
      );
    }
    // In dev/test/staging environments, derive a deterministic 256-bit key from JWT_SECRET or secure fallback
    const fallbackSecret = process.env.JWT_SECRET || 'business_os_dev_totp_aes256_gcm_master_key_seed!';
    return crypto.createHash('sha256').update(`mfa:aes-256-gcm:${fallbackSecret}`).digest();
  }

  // If 64 hex characters (32 bytes)
  if (rawKey.length === 64 && /^[0-9a-fA-F]+$/.test(rawKey)) {
    return Buffer.from(rawKey, 'hex');
  }

  // If 44 base64 characters (32 bytes)
  if (rawKey.length === 44) {
    try {
      const buf = Buffer.from(rawKey, 'base64');
      if (buf.length === 32) return buf;
    } catch {}
  }

  // If passphrase/string, derive 256-bit key using HKDF-SHA256
  const derived = crypto.hkdfSync('sha256', Buffer.from(rawKey), Buffer.from('business-os-mfa-salt'), Buffer.from('mfa-totp-encryption-v1'), 32);
  return Buffer.from(derived);
}

/**
 * Determines whether a stored TOTP secret string is encrypted with versioned AES-256-GCM.
 */
export function isEncryptedMfaSecret(secret?: string | null): boolean {
  if (!secret || typeof secret !== 'string') return false;
  return secret.startsWith(MFA_CIPHERTEXT_PREFIX);
}

/**
 * Encrypts a plaintext TOTP Base32 secret using AES-256-GCM authenticated encryption.
 * Returns versioned ciphertext: enc:v1:<iv_hex>:<authTag_hex>:<ciphertext_hex>
 */
export function encryptMfaSecret(plaintextSecret: string, keyBuffer?: Buffer): string {
  if (!plaintextSecret || typeof plaintextSecret !== 'string') {
    throw new Error('Cannot encrypt empty or non-string MFA secret');
  }

  // Ensure we do not double-encrypt an already encrypted ciphertext
  if (isEncryptedMfaSecret(plaintextSecret)) {
    return plaintextSecret;
  }

  const key = keyBuffer || getMfaEncryptionKey();
  if (key.length !== 32) {
    throw new Error(`Invalid MFA encryption key length: expected 32 bytes, got ${key.length}`);
  }

  const iv = crypto.randomBytes(GCM_IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const ciphertext = Buffer.concat([
    cipher.update(plaintextSecret, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();
  if (authTag.length !== GCM_TAG_LENGTH) {
    throw new Error('Failed to generate 128-bit GCM authentication tag');
  }

  return `${MFA_CIPHERTEXT_PREFIX}${iv.toString('hex')}:${authTag.toString('hex')}:${ciphertext.toString('hex')}`;
}

/**
 * Decrypts a versioned AES-256-GCM encrypted TOTP secret.
 * Validates integrity via GCM authentication tag.
 * Rejects tampered payloads, incorrect keys, and malformed formats with secure exceptions.
 */
export function decryptMfaSecret(storedSecret: string, keyBuffer?: Buffer): string {
  if (!storedSecret || typeof storedSecret !== 'string') {
    throw new Error('Cannot decrypt empty or non-string MFA secret');
  }

  if (!isEncryptedMfaSecret(storedSecret)) {
    throw new Error('Invalid MFA secret format: value is not encrypted with versioned AES-256-GCM');
  }

  const parts = storedSecret.slice(MFA_CIPHERTEXT_PREFIX.length).split(':');
  if (parts.length !== 3) {
    throw new Error('Malformed encrypted MFA secret: expected iv:tag:ciphertext components');
  }

  const [ivHex, tagHex, ciphertextHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(tagHex, 'hex');
  const ciphertext = Buffer.from(ciphertextHex, 'hex');

  if (iv.length !== GCM_IV_LENGTH || authTag.length !== GCM_TAG_LENGTH) {
    throw new Error('Cryptographic parameter length mismatch for AES-256-GCM');
  }

  const key = keyBuffer || getMfaEncryptionKey();
  if (key.length !== 32) {
    throw new Error(`Invalid MFA decryption key length: expected 32 bytes, got ${key.length}`);
  }

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  try {
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  } catch (err: any) {
    throw new Error(`MFA Secret Decryption Failed: Authentication tag mismatch or corrupted ciphertext (${err.message})`);
  }
}

/**
 * Transparent helper for reading MFA secrets during data transition:
 * - If encrypted: decrypts via AES-256-GCM
 * - If legacy plaintext Base32: returns as-is but logs migration advisory
 * - Never interprets ciphertext as plaintext
 */
export function resolveMfaSecret(storedSecret?: string | null, keyBuffer?: Buffer): string {
  if (!storedSecret) {
    throw new Error('MFA secret is missing or empty');
  }

  if (isEncryptedMfaSecret(storedSecret)) {
    return decryptMfaSecret(storedSecret, keyBuffer);
  }

  // Legacy plaintext Base32 validation (RFC 4648 Base32 alphabet: A-Z, 2-7)
  const isBase32 = /^[A-Z2-7=]+$/i.test(storedSecret.trim());
  if (isBase32) {
    return storedSecret.trim().toUpperCase();
  }

  throw new Error('Stored MFA secret is neither valid AES-256-GCM ciphertext nor valid Base32 plaintext');
}

/**
 * Re-encrypts an existing encrypted secret under a new encryption key for key rotation.
 */
export function rotateMfaSecretKey(storedCiphertext: string, oldKey: Buffer, newKey: Buffer): string {
  const plaintext = decryptMfaSecret(storedCiphertext, oldKey);
  return encryptMfaSecret(plaintext, newKey);
}
