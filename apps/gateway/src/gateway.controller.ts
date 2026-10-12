import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  Param,
  All,
  HttpStatus,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { verifyJwtToken } from '@repo/auth';
import { GatewayService } from './gateway.service';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @SkipThrottle()
  @Get(['health', 'api/health', 'healthz', 'api/healthz'])
  getHealth() {
    return this.gatewayService.getMeshHealth();
  }

  @SkipThrottle()
  @Get(['readyz', 'api/readyz'])
  async getReadyz(@Res() res: Response) {
    const result = await this.gatewayService.checkReadiness();
    const statusCode = result.status === 'READY' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
    return res.status(statusCode).json(result);
  }

  @SkipThrottle()
  @Get(['gateway/routes', 'api/gateway/routes'])
  getRoutes() {
    return {
      success: true,
      routes: this.gatewayService.getRoutingMesh(),
    };
  }

  @All('api/v1/:service/*')
  async proxyService(
    @Param('service') service: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const targetConfig = this.gatewayService.resolveTarget(service);
    if (!targetConfig) {
      return res.status(HttpStatus.NOT_FOUND).json({
        error: 'Service Not Found',
        message: `Microservice '${service}' is not registered in Gateway routing mesh.`,
      });
    }

    // Verify Authorization & Tenant Boundaries
    const authHeader = req.headers.authorization;
    let verifiedUser: any = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        verifiedUser = await verifyJwtToken(token);
      } catch (err: any) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          error: 'Unauthorized',
          message: `Invalid access token: ${err.message}`,
        });
      }
    }

    const requestedTenant = req.headers['x-tenant-id'] as string;
    if (requestedTenant && verifiedUser && verifiedUser.role !== 'SUPERADMIN') {
      if (verifiedUser.tenantId && verifiedUser.tenantId !== requestedTenant) {
        return res.status(HttpStatus.FORBIDDEN).json({
          error: 'Forbidden',
          message: 'Cross-tenant access prohibited: requested tenant does not match token',
        });
      }
    }

    const subPath = req.url.replace(`/api/v1/${service}`, '');
    const upstreamUrl = `${targetConfig.targetUrl}${subPath}`;

    try {
      const headers: Record<string, string> = {};
      for (const [key, value] of Object.entries(req.headers)) {
        if (value && typeof value === 'string' && key !== 'host') {
          headers[key] = value;
        }
      }
      if (req.headers['x-correlation-id']) {
        headers['x-correlation-id'] = req.headers['x-correlation-id'] as string;
      }
      if (verifiedUser && verifiedUser.tenantId && verifiedUser.role !== 'SUPERADMIN') {
        headers['x-tenant-id'] = verifiedUser.tenantId;
      }

      const fetchOptions: RequestInit = {
        method: req.method,
        headers,
      };

      if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
        fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      }

      const upstreamRes = await fetch(upstreamUrl, fetchOptions);
      const text = await upstreamRes.text();

      res.status(upstreamRes.status);
      upstreamRes.headers.forEach((v, k) => {
        if (k !== 'transfer-encoding') res.setHeader(k, v);
      });
      return res.send(text);
    } catch (err: any) {
      return res.status(HttpStatus.BAD_GATEWAY).json({
        error: 'Bad Gateway',
        message: `Failed to proxy request to upstream microservice ${service} (${upstreamUrl}): ${err.message}`,
      });
    }
  }
}
