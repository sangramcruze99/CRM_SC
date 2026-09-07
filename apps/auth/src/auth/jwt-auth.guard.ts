import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKeyHeader = (request.headers['x-api-key'] || request.headers['x-service-key']) as string | undefined;
    const configuredApiKey = process.env.API_KEY || process.env.SYSTEM_API_KEY;

    // Check direct X-API-Key or X-Service-Key authentication
    if (configuredApiKey && apiKeyHeader === configuredApiKey) {
      const tenantId = (request.headers['x-tenant-id'] as string) || 'default-tenant';
      request['user'] = {
        sub: 'system-api-key',
        email: 'admin@gmail.com',
        role: 'ADMIN',
        tenantId,
      };
      request.headers['x-tenant-id'] = tenantId;
      return true;
    }

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token missing');
    }

    try {
      const secret = process.env.JWT_SECRET || 'super-secret-business-os-key';
      const payload = await this.jwtService.verifyAsync(token, { secret });
      // Attach the user payload to the request object
      request['user'] = payload;

      // Override or set x-tenant-id from the JWT token for multi-tenancy context
      if (payload.tenantId) {
        request.headers['x-tenant-id'] = payload.tenantId;
      }
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
