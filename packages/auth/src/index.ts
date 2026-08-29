import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  SetMetadata,
  Optional,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class JwtAuthGuard implements CanActivate {
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
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token missing');
    }

    try {
      const secret = process.env.JWT_SECRET || 'super-secret-business-os-key';
      const payload = await this.jwtService.verifyAsync(token, {
        secret,
      });
      // Attach the user payload to the request object
      (request as any)['user'] = payload;

      // Override or set x-tenant-id from the JWT token for multi-tenancy context
      if (payload.tenantId) {
        request.headers['x-tenant-id'] = payload.tenantId;
      }
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
