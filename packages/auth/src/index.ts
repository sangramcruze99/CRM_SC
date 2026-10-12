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

import { getJwtSecret } from './secrets';
export * from './secrets';
export * from './revocation';
export * from './totp';
export * from './encryption';
export const ALLOWED_JWT_ALGORITHMS = ['HS256'] as const;

import { isSessionRevoked } from './revocation';

/**
 * Verifies a JWT token using HS256 and checks server-side session revocation in Redis.
 */
export async function verifyJwtToken(token: string, options: { checkRevocation?: boolean } = { checkRevocation: true }): Promise<any> {
  const jwtService = new JwtService();
  const payload = await jwtService.verifyAsync(token, {
    secret: getJwtSecret(),
    algorithms: ['HS256'],
  });

  if (payload.typ === 'mfa_challenge') {
    throw new UnauthorizedException('Challenge token cannot be used for resource access. MFA verification required.');
  }

  if (options.checkRevocation !== false && payload) {
    const identifier = payload.jti || token;
    let revoked = await isSessionRevoked(identifier);
    if (!revoked && token && token !== identifier) {
      revoked = await isSessionRevoked(token);
    }
    if (revoked) {
      throw new UnauthorizedException('Session has been revoked');
    }
  }

  return payload;
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

    // Direct reflection fallback for @Public() metadata
    try {
      const handler = context.getHandler();
      if (handler && typeof (Reflect as any)?.getMetadata === 'function') {
        const isPublicHandler = (Reflect as any).getMetadata(IS_PUBLIC_KEY, handler);
        if (isPublicHandler) return true;
      }
      const targetClass = context.getClass();
      if (targetClass && typeof (Reflect as any)?.getMetadata === 'function') {
        const isPublicClass = (Reflect as any).getMetadata(IS_PUBLIC_KEY, targetClass);
        if (isPublicClass) return true;
      }
    } catch {}

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

      // Explicitly reject intermediate MFA challenge tokens from accessing protected resources
      if (payload.typ === 'mfa_challenge') {
        this.logger.warn(`Rejected resource access attempt with intermediate MFA challenge token for user ${payload.sub}`);
        throw new UnauthorizedException('Challenge token cannot be used for resource access. MFA verification required.');
      }

      // Enforce Server-Side Session Revocation check in Redis
      const sessionIdentifier = payload.jti || token;
      let revoked = await isSessionRevoked(sessionIdentifier);
      if (!revoked && token && token !== sessionIdentifier) {
        revoked = await isSessionRevoked(token);
      }
      if (revoked) {
        this.logger.warn(`Rejected request with revoked session for user ${payload.sub} (session: ${payload.jti || 'token-hash'})`);
        throw new UnauthorizedException('Session has been revoked');
      }

      const verifiedTenantId = payload.tenantId || 'default-tenant';
      const requestedTenantId = request.headers['x-tenant-id'] as string | undefined;

      // Prevent BOLA / IDOR: if client explicitly requested a tenant differing from their token,
      // only allow if caller is verified SUPERADMIN
      if (requestedTenantId && requestedTenantId !== verifiedTenantId && payload.role !== 'SUPERADMIN') {
        this.logger.warn(`Cross-tenant spoofing attempt blocked: user ${payload.sub} (tenant ${verifiedTenantId}) requested ${requestedTenantId}`);
        throw new UnauthorizedException('Cross-tenant access forbidden: tenant header does not match token context');
      }

      // Enforce verified tenant context and store token on request
      (request as any)['token'] = token;
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
