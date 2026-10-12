import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { Logger } from '@nestjs/common';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: any;
  private readonly logger = new Logger(RedisIoAdapter.name);

  async connectToRedis(): Promise<boolean> {
    const host = process.env.REDIS_HOST || '127.0.0.1';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);
    const password = process.env.REDIS_PASSWORD || undefined;
    const isProduction = process.env.NODE_ENV === 'production';

    try {
      const pubClient = new Redis({
        host,
        port,
        password,
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 1000)),
        enableOfflineQueue: false,
      });

      const subClient = pubClient.duplicate();

      await Promise.all([
        new Promise<void>((resolve, reject) => {
          pubClient.once('ready', () => resolve());
          pubClient.once('error', (err) => reject(err));
        }),
        new Promise<void>((resolve, reject) => {
          subClient.once('ready', () => resolve());
          subClient.once('error', (err) => reject(err));
        }),
      ]);

      this.adapterConstructor = createAdapter(pubClient, subClient);
      this.logger.log('Redis Socket.IO horizontal clustering adapter initialized successfully.');
      return true;
    } catch (err: any) {
      if (isProduction) {
        this.logger.error(`[FATAL] Failed connecting Redis WebSocket adapter in production: ${err.message}`);
        throw new Error(`Production requires Redis WebSocket adapter. In-memory fallback is forbidden in production: ${err.message}`);
      }
      this.logger.warn(`Redis adapter unavailable for WebSockets, using standalone in-memory mode: ${err.message}`);
      return false;
    }
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }
    return server;
  }
}
