import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class GatewayThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Distributed & tenant-aware rate limiting:
    // Tracks by tenant ID when authenticated, and falls back to client IP / forwarded-for
    const tenantId = req.headers?.['x-tenant-id'];
    const clientIp =
      req.ips?.[0] ||
      req.ip ||
      req.headers?.['x-forwarded-for'] ||
      req.socket?.remoteAddress ||
      'unknown-ip';

    if (tenantId && typeof tenantId === 'string' && tenantId !== 'default-tenant') {
      return `tenant:${tenantId}:${clientIp}`;
    }
    return `ip:${clientIp}`;
  }
}
