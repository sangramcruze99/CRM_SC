import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import * as crypto from 'crypto';

function secureTimingCompare(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKeyHeader = (request.headers['x-api-key'] ||
      request.headers['x-service-key']) as string | undefined;
    const configuredApiKey = process.env.API_KEY || process.env.SYSTEM_API_KEY;

    // Check direct X-API-Key or X-Service-Key authentication using constant-time comparison
    if (configuredApiKey && apiKeyHeader && secureTimingCompare(apiKeyHeader, configuredApiKey)) {
      const tenantId =
        (request.headers['x-tenant-id'] as string) || 'default-tenant';
      request['user'] = {
        sub: 'system-api-key',
        email: 'system@crm.internal',
        role: 'ADMIN',
        tenantId,
      };
      request.headers['x-tenant-id'] = tenantId;
      return true;
    }

    const token = this.extractTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException('Access token missing');
    }

    // Check direct API key passed as Bearer token
    if (configuredApiKey && secureTimingCompare(token, configuredApiKey)) {
      const tenantId =
        (request.headers['x-tenant-id'] as string) || 'default-tenant';
      request['user'] = {
        sub: 'system-api-key',
        email: 'system@crm.internal',
        role: 'ADMIN',
        tenantId,
      };
      request.headers['x-tenant-id'] = tenantId;
      return true;
    }

    try {
      const secret = process.env.JWT_SECRET || 'super-secret-business-os-key';
      const payload = await this.jwtService.verifyAsync(token, {
        secret,
        algorithms: ['HS256'],
      });

      if (!payload || typeof payload !== 'object') {
        throw new UnauthorizedException('Malformed token payload');
      }

      if (payload.exp && Date.now() >= payload.exp * 1000) {
        throw new UnauthorizedException('Token expired');
      }

      const verifiedTenantId = payload.tenantId || 'default-tenant';
      const requestedTenantId = request.headers['x-tenant-id'] as string | undefined;

      // Prevent BOLA / IDOR cross-tenant spoofing
      if (requestedTenantId && requestedTenantId !== verifiedTenantId && payload.role !== 'SUPERADMIN') {
        this.logger.warn(`Cross-tenant spoofing attempt blocked in auth service: ${payload.sub} tried accessing ${requestedTenantId}`);
        throw new UnauthorizedException('Cross-tenant access forbidden');
      }

      request['user'] = {
        ...payload,
        tenantId: verifiedTenantId,
      };
      request.headers['x-tenant-id'] = verifiedTenantId;
    } catch (err: any) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractTokenFromRequest(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer' && token) {
      return token;
    }

    const cookies = (request as any).cookies;
    if (cookies && cookies['access_token']) {
      return cookies['access_token'];
    }

    const rawCookieHeader = request.headers.cookie;
    if (rawCookieHeader) {
      const match = rawCookieHeader.match(/(?:^|;\s*)access_token=([^;]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    }

    return undefined;
  }
}
