import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/nicheStorage';
import net from 'node:net';

function checkTcpService(host: string, port: number, timeoutMs = 1500): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let resolved = false;

    socket.setTimeout(timeoutMs);

    socket.on('connect', () => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve(true);
      }
    });

    socket.on('timeout', () => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.on('error', () => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.connect(port, host);
  });
}

export async function GET(req: NextRequest) {
  const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();
  const checks: Record<string, 'UP' | 'DOWN'> = {
    database: 'DOWN',
    redis: 'DOWN',
    objectStorage: 'DOWN',
  };

  const startTime = Date.now();

  // 1. Check PostgreSQL Database Connection
  try {
    const prisma = getPrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'UP';
  } catch (err) {
    checks.database = 'DOWN';
  }

  // 2. Check Redis 8.10 Connection
  try {
    const redisOk = await checkTcpService('127.0.0.1', 6379);
    checks.redis = redisOk ? 'UP' : 'DOWN';
  } catch {
    checks.redis = 'DOWN';
  }

  // 3. Check MinIO Object Storage
  try {
    const minioRes = await fetch('http://127.0.0.1:9000/minio/health/live', {
      signal: AbortSignal.timeout(2000),
    });
    checks.objectStorage = minioRes.ok || minioRes.status === 200 ? 'UP' : 'DOWN';
  } catch {
    checks.objectStorage = 'DOWN';
  }

  const allHealthy = Object.values(checks).every((s) => s === 'UP');
  const latencyMs = Date.now() - startTime;

  return NextResponse.json(
    {
      status: allHealthy ? 'READY' : 'NOT_READY',
      checks,
      latencyMs,
      timestamp: new Date().toISOString(),
      correlationId,
    },
    {
      status: allHealthy ? 200 : 503,
      headers: {
        'x-correlation-id': correlationId,
      },
    }
  );
}
