import * as crypto from 'crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Encodes a buffer to RFC 4648 Base32.
 */
export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Decodes an RFC 4648 Base32 string to a Buffer.
 */
export function base32Decode(base32: string): Buffer {
  const cleaned = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (idx === -1) {
      throw new Error(`Invalid Base32 character: ${cleaned[i]}`);
    }
    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Generates a 160-bit (20 bytes) cryptographically secure Base32 TOTP secret.
 */
export function generateTotpSecret(byteLength: number = 20): string {
  const bytes = crypto.randomBytes(byteLength);
  return base32Encode(bytes);
}

/**
 * Builds the standard RFC 6238 otpauth:// URI for authenticator applications.
 */
export function generateOtpauthUrl(email: string, secret: string, issuer: string = 'BusinessOS'): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedEmail = encodeURIComponent(email);
  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Computes the 6-digit TOTP code for a specific Unix timestamp.
 */
export function generateTotpCode(secretBase32: string, time: number = Date.now(), timeStepSeconds: number = 30): string {
  const secretBuffer = base32Decode(secretBase32);
  const counter = Math.floor(time / 1000 / timeStepSeconds);

  // 8-byte big-endian buffer for counter
  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigInt64BE(BigInt(counter));

  const hmac = crypto.createHmac('sha1', secretBuffer).update(counterBuf).digest();

  // Dynamic truncation
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = binary % 1_000_000;
  return otp.toString().padStart(6, '0');
}

/**
 * Verifies a user-supplied 6-digit TOTP code against the secret within a drift window (+-1 interval = 30s).
 */
export function verifyTotpCode(secretBase32: string, code: string, window: number = 1): boolean {
  if (!code || typeof code !== 'string' || !/^\d{6}$/.test(code.trim())) {
    return false;
  }

  const cleanCode = code.trim();
  const now = Date.now();
  const stepMs = 30 * 1000;

  for (let offset = -window; offset <= window; offset++) {
    const checkTime = now + offset * stepMs;
    const expectedCode = generateTotpCode(secretBase32, checkTime);
    if (crypto.timingSafeEqual(Buffer.from(cleanCode), Buffer.from(expectedCode))) {
      return true;
    }
  }

  return false;
}

/**
 * Generates 8 one-time backup recovery codes, returned as plaintext (for initial user display)
 * and SHA-256 hashes (for safe immutable storage).
 */
export function generateRecoveryCodes(count: number = 8): {
  plaintextCodes: string[];
  hashedCodes: string[];
} {
  const plaintextCodes: string[] = [];
  const hashedCodes: string[] = [];

  for (let i = 0; i < count; i++) {
    // 10-character uppercase hexadecimal code: e.g. "A3F8B109C2"
    const code = crypto.randomBytes(5).toString('hex').toUpperCase();
    plaintextCodes.push(code);

    const hash = crypto.createHash('sha256').update(code).digest('hex');
    hashedCodes.push(hash);
  }

  return { plaintextCodes, hashedCodes };
}

/**
 * Validates and consumes a recovery code against the stored hashed recovery codes list.
 */
export function verifyAndConsumeRecoveryCode(
  inputCode: string,
  storedHashedJson?: string | null
): { valid: boolean; remainingHashedJson: string } {
  if (!inputCode || !storedHashedJson) {
    return { valid: false, remainingHashedJson: '[]' };
  }

  let hashes: string[] = [];
  try {
    hashes = JSON.parse(storedHashedJson);
    if (!Array.isArray(hashes)) hashes = [];
  } catch {
    return { valid: false, remainingHashedJson: '[]' };
  }

  const cleanCode = inputCode.trim().toUpperCase();
  const inputHash = crypto.createHash('sha256').update(cleanCode).digest('hex');

  const matchIndex = hashes.findIndex((h) => crypto.timingSafeEqual(Buffer.from(h), Buffer.from(inputHash)));

  if (matchIndex === -1) {
    return { valid: false, remainingHashedJson: JSON.stringify(hashes) };
  }

  // Consume the code
  hashes.splice(matchIndex, 1);
  return { valid: true, remainingHashedJson: JSON.stringify(hashes) };
}
