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
import { Request, Response } from 'express';
import { GatewayService } from './gateway.service';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Get('health')
  getHealth() {
    return this.gatewayService.getMeshHealth();
  }

  @Get('gateway/routes')
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

    const subPath = req.url.replace(`/api/v1/${service}`, '');
    const upstreamUrl = `${targetConfig.targetUrl}${subPath}`;

    try {
      const headers: Record<string, string> = {};
      for (const [key, value] of Object.entries(req.headers)) {
        if (value && typeof value === 'string' && key !== 'host') {
          headers[key] = value;
        }
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
