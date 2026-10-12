import crypto from 'crypto';
import net from 'node:net';

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || 'business_os_redis_secure_pass_2026';

function computeSessionHash(tokenOrJti: string): string {
  return crypto.createHash('sha256').update(tokenOrJti.trim()).digest('hex');
}

/**
 * Executes a simple Redis command via TCP using RESP protocol.
 */
function sendRedisCommand(commands: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let responseData = '';
    let authenticated = false;

    socket.setTimeout(2500);

    socket.on('connect', () => {
      // Authenticate first
      if (REDIS_PASSWORD) {
        socket.write(`AUTH ${REDIS_PASSWORD}\r\n`);
      } else {
        authenticated = true;
        for (const cmd of commands) {
          socket.write(`${cmd}\r\n`);
        }
      }
    });

    socket.on('data', (data) => {
      responseData += data.toString();
      if (!authenticated && REDIS_PASSWORD && responseData.includes('+OK')) {
        authenticated = true;
        responseData = '';
        for (const cmd of commands) {
          socket.write(`${cmd}\r\n`);
        }
      } else if (authenticated) {
        socket.destroy();
        resolve(responseData);
      }
    });

    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('Redis connection timed out'));
    });

    socket.on('error', (err) => {
      socket.destroy();
      reject(err);
    });

    socket.connect(REDIS_PORT, REDIS_HOST);
  });
}

/**
 * Revokes a session in Redis from web-core.
 */
export async function revokeSessionWebCore(identifier: string, ttlSeconds = 604800): Promise<boolean> {
  if (!identifier) return false;
  const hashKey = `revoked_session:${computeSessionHash(identifier)}`;
  const effectiveTtl = Math.max(Math.floor(ttlSeconds), 60);

  try {
    const res = await sendRedisCommand([`SET ${hashKey} revoked EX ${effectiveTtl}`]);
    return res.includes('+OK');
  } catch (err: any) {
    console.error('[WEB-CORE REVOCATION ERROR] Failed to record revocation in Redis:', err.message);
    if (process.env.NODE_ENV === 'production') {
      throw err;
    }
    return false;
  }
}

/**
 * Verifies if a session is revoked in Redis.
 */
export async function isSessionRevokedWebCore(identifier: string): Promise<boolean> {
  if (!identifier) return false;
  const hashKey = `revoked_session:${computeSessionHash(identifier)}`;

  try {
    const res = await sendRedisCommand([`EXISTS ${hashKey}`]);
    // RESP integer format: :1\r\n or :0\r\n
    return res.includes(':1');
  } catch (err: any) {
    console.error('[WEB-CORE REVOCATION ERROR] Failed to query revocation in Redis:', err.message);
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Revocation check failed: Redis unreachable');
    }
    return false;
  }
}
