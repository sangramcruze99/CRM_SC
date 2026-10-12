import Redis from 'ioredis';
import * as crypto from 'crypto';
import { Logger, UnauthorizedException } from '@nestjs/common';

const logger = new Logger('SessionRevocation');

let redisClient: Redis | null = null;
let isRedisConnected = false;

export function getRedisClient(): Redis {
  if (redisClient) {
    return redisClient;
  }

  const host = process.env.REDIS_HOST?.replace(/^["']|["']$/g, '') || '127.0.0.1';
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD?.replace(/^["']|["']$/g, '') || 'business_os_redis_secure_pass_2026';

  redisClient = new Redis({
    host,
    port,
    password: password || undefined,
    lazyConnect: true,
    maxRetriesPerRequest: 2,
    retryStrategy: (times) => Math.min(times * 100, 2000),
  });

  redisClient.connect().catch((err: any) => {
    logger.warn(`Initial Redis connection attempt deferred: ${err.message}`);
  });

  redisClient.on('connect', () => {
    isRedisConnected = true;
    logger.log('Connected to Redis for session revocation service');
  });

  redisClient.on('error', (err) => {
    isRedisConnected = false;
    logger.warn(`Redis connection warning in session revocation: ${err.message}`);
  });

  redisClient.on('close', () => {
    isRedisConnected = false;
  });

  return redisClient;
}

/**
 * Computes a secure, opaque SHA-256 session key for Redis storage.
 * Never stores raw JWT tokens in Redis keys.
 */
export function computeSessionHash(tokenOrJti: string): string {
  if (!tokenOrJti || typeof tokenOrJti !== 'string') {
    throw new Error('Invalid token or JTI supplied for session hashing');
  }
  return crypto.createHash('sha256').update(tokenOrJti.trim()).digest('hex');
}

/**
 * Revokes a session server-side in Redis.
 * Sets key: `revoked_session:${sha256(jti || token)}` with TTL bounded by token expiration.
 */
export async function revokeSession(
  identifier: string,
  ttlSeconds: number = 604800 // Default 7 days
): Promise<boolean> {
  if (!identifier) {
    return false;
  }

  try {
    const client = getRedisClient();
    const hashKey = `revoked_session:${computeSessionHash(identifier)}`;
    const effectiveTtl = Math.max(Math.floor(ttlSeconds), 60); // Minimum 60 seconds

    await client.set(hashKey, 'revoked', 'EX', effectiveTtl);
    logger.log(`Session revoked successfully in Redis: ${hashKey.substring(0, 32)}... (TTL: ${effectiveTtl}s)`);
    return true;
  } catch (err: any) {
    logger.error(`Failed to record session revocation in Redis: ${err.message}`);
    // Fail-closed in production if Redis is unreachable during revocation
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Session revocation failed: storage error (${err.message})`);
    }
    return false;
  }
}

/**
 * Verifies whether a token/session identifier has been revoked.
 * Fails closed in production if Redis is unreachable for protected requests.
 */
export async function isSessionRevoked(identifier: string): Promise<boolean> {
  if (!identifier) {
    return false;
  }

  try {
    const client = getRedisClient();
    const hashKey = `revoked_session:${computeSessionHash(identifier)}`;
    const result = await client.exists(hashKey);
    return result === 1;
  } catch (err: any) {
    logger.error(`Failed to verify session revocation status: ${err.message}`);
    // Fail-closed for protected requests if revocation status cannot be safely checked
    if (process.env.NODE_ENV === 'production') {
      throw new UnauthorizedException('Security check failed: revocation service unreachable');
    }
    return false;
  }
}
