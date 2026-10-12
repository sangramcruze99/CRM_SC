import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  SetMetadata,
  Optional,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import * as crypto from 'crypto';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const DEFAULT_JWT_SECRET = 'super-secret-business-os-key';
export const ALLOWED_JWT_ALGORITHMS = ['HS256'] as const;

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === DEFAULT_JWT_SECRET || secret.includes('replace-with')) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL SECURITY ERROR: Insecure or default JWT_SECRET detected in production environment.');
    }
    return DEFAULT_JWT_SECRET;
  }
  return secret;
}

/**
 * Constant-time string comparison to prevent timing attacks on API keys and tokens.
 */
export function secureTimingCompare(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  private jwtService = new JwtService();

  constructor(@Optional() private reflector?: any) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.reflector && typeof this.reflector.getAllAndOverride === 'function') {
      const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      if (isPublic) {
        return true;
      }
    }

    const request = context.switchToHttp().getRequest<Request>();
    const apiKeyHeader = (request.headers['x-api-key'] || request.headers['x-service-key']) as string | undefined;
    const configuredApiKey = process.env.API_KEY || process.env.SYSTEM_API_KEY;

    // Check direct X-API-Key or X-Service-Key authentication using constant-time comparison
    if (configuredApiKey && apiKeyHeader && secureTimingCompare(apiKeyHeader, configuredApiKey)) {
      const tenantId = (request.headers['x-tenant-id'] as string) || 'default-tenant';
      (request as any)['user'] = {
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
      const tenantId = (request.headers['x-tenant-id'] as string) || 'default-tenant';
      (request as any)['user'] = {
        sub: 'system-api-key',
        email: 'system@crm.internal',
        role: 'ADMIN',
        tenantId,
      };
      request.headers['x-tenant-id'] = tenantId;
      return true;
    }

    try {
      const secret = getJwtSecret();
      const payload = await this.jwtService.verifyAsync(token, {
        secret,
        algorithms: ['HS256'],
      });

      if (!payload || typeof payload !== 'object') {
        throw new UnauthorizedException('Malformed token payload');
      }

      // Check token expiration explicitly
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        throw new UnauthorizedException('Token expired');
      }

      const verifiedTenantId = payload.tenantId || 'default-tenant';
      const requestedTenantId = request.headers['x-tenant-id'] as string | undefined;

      // Prevent BOLA / IDOR: if client explicitly requested a tenant differing from their token,
      // only allow if caller is verified SUPERADMIN
      if (requestedTenantId && requestedTenantId !== verifiedTenantId && payload.role !== 'SUPERADMIN') {
        this.logger.warn(`Cross-tenant spoofing attempt blocked: user ${payload.sub} (tenant ${verifiedTenantId}) requested ${requestedTenantId}`);
        throw new UnauthorizedException('Cross-tenant access forbidden: tenant header does not match token context');
      }

      // Enforce verified tenant context
      (request as any)['user'] = {
        ...payload,
        tenantId: verifiedTenantId,
      };
      request.headers['x-tenant-id'] = verifiedTenantId;
    } catch (err: any) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Invalid or expired access token');
    }

    return true;
  }

  private extractTokenFromRequest(request: Request): string | undefined {
    // 1. Authorization: Bearer <token>
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer' && token) {
      return token;
    }

    // 2. Cookie extraction: access_token
    const cookies = (request as any).cookies;
    if (cookies && cookies['access_token']) {
      return cookies['access_token'];
    }

    // 3. Fallback header cookie parsing
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
