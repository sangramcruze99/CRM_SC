import { Logger } from '@nestjs/common';

const logger = new Logger('SecretsManager');

export const KNOWN_INSECURE_SECRETS = new Set([
  'super-secret-business-os-key',
  'replace-with-a-secure-random-32-byte-hex-or-base64-string',
  'default-jwt-secret',
  'secret',
  'changeme',
  'password',
  'admin',
  '12345678',
]);

export interface SecretValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates critical infrastructure secrets at application startup.
 * In production (NODE_ENV === 'production'), any invalid, missing, or default secret
 * triggers an immediate FAIL-CLOSED process exit.
 */
export function validateSecrets(): SecretValidationResult {
  const isProduction = process.env.NODE_ENV === 'production';
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. JWT_SECRET Validation
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    if (isProduction) {
      errors.push('CRITICAL: JWT_SECRET environment variable is missing.');
    } else {
      warnings.push('JWT_SECRET is missing; falling back to temporary local development key.');
    }
  } else {
    const trimmed = jwtSecret.trim().toLowerCase();
    let isKnownInsecure = false;
    for (const bad of KNOWN_INSECURE_SECRETS) {
      if (trimmed === bad.toLowerCase() || trimmed.includes('replace-with')) {
        isKnownInsecure = true;
        break;
      }
    }

    if (isKnownInsecure) {
      if (isProduction) {
        errors.push('CRITICAL: Known placeholder or default JWT_SECRET detected in production environment.');
      } else {
        warnings.push('Insecure default JWT_SECRET detected in non-production mode.');
      }
    } else if (jwtSecret.length < 32) {
      if (isProduction) {
        errors.push(`CRITICAL: JWT_SECRET entropy too low (${jwtSecret.length} chars). Minimum 32 characters required in production.`);
      } else {
        warnings.push('JWT_SECRET has fewer than 32 characters.');
      }
    }
  }

  // 2. DATABASE_URL Validation
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    if (isProduction) {
      errors.push('CRITICAL: DATABASE_URL environment variable is missing.');
    }
  } else if (isProduction && (dbUrl.startsWith('file:') || dbUrl.includes('.db'))) {
    errors.push('CRITICAL: SQLite DATABASE_URL detected in production mode. PostgreSQL is mandatory for production.');
  }

  // 3. API_KEY & SYSTEM_API_KEY Validation
  const apiKey = process.env.API_KEY || process.env.SYSTEM_API_KEY;
  if (!apiKey && isProduction) {
    warnings.push('API_KEY or SYSTEM_API_KEY not defined in environment.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Strict fail-closed verification invoked during microservice bootstrap.
 * Terminates process immediately if security invariants are violated in production.
 */
export function assertProductionSecrets(): void {
  const result = validateSecrets();

  for (const warning of result.warnings) {
    logger.warn(`[Security Warning] ${warning}`);
  }

  if (!result.valid) {
    for (const error of result.errors) {
      logger.error(`[FATAL SECURITY ERROR] ${error}`);
    }
    logger.error('CRITICAL: Security invariants violated. System failing closed to prevent unauthorized compromise.');
    process.exit(1);
  }
}

/**
 * Returns the active JWT secret, enforcing production validation.
 */
export function getJwtSecret(): string {
  const jwtSecret = process.env.JWT_SECRET;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!jwtSecret || KNOWN_INSECURE_SECRETS.has(jwtSecret.trim().toLowerCase()) || jwtSecret.includes('replace-with')) {
    if (isProduction) {
      logger.error('[FATAL SECURITY ERROR] Attempted to use default/insecure JWT_SECRET in production.');
      throw new Error('FATAL SECURITY ERROR: Insecure or missing JWT_SECRET in production.');
    }
    return 'dev-ephemeral-jwt-secret-do-not-use-in-production-min32chars';
  }

  return jwtSecret;
}

/**
 * Masks sensitive secrets for safe diagnostic logging (e.g., "sk_...3a4f")
 */
export function maskSecret(secret?: string): string {
  if (!secret) return '[UNSET]';
  if (secret.length <= 8) return '********';
  return `${secret.substring(0, 4)}...${secret.substring(secret.length - 4)}`;
}
