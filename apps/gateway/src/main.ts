import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import crypto from 'node:crypto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Distributed Correlation ID & Structured APM Logging Middleware
  app.use((req: any, res: any, next: any) => {
    const correlationId = (req.headers['x-correlation-id'] as string) || crypto.randomUUID();
    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('x-correlation-id', correlationId);

    const start = Date.now();
    res.on('finish', () => {
      const durationMs = Date.now() - start;
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARN' : 'INFO',
        service: 'gateway',
        correlationId,
        tenantId: req.headers['x-tenant-id'] || 'default-tenant',
        method: req.method,
        path: req.originalUrl || req.url,
        statusCode: res.statusCode,
        durationMs,
      };
      console.log(JSON.stringify(logEntry));
    });

    next();
  });

  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:4000', 'https://crm.cenedypalma.com'];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS security policy'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'x-api-key', 'x-service-key', 'x-correlation-id'],
    exposedHeaders: ['x-correlation-id', 'x-tenant-id'],
  });

  const port = process.env.GATEWAY_PORT || 3000;
  await app.listen(port);
  console.log(`[Enterprise API Gateway] Ready on http://localhost:${port}`);
}
bootstrap();
