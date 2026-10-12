import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Headers,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { Public } from '@repo/auth';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  private extractTenantId(req?: Request, headersTenantId?: string): string {
    const user = (req as any)?.user;
    if (user?.tenantId) {
      if (user.role === 'SUPERADMIN' && headersTenantId) {
        return headersTenantId;
      }
      return user.tenantId;
    }
    return headersTenantId || 'default-tenant';
  }

  private assertAdmin(req: Request) {
    const user = (req as any)?.user;
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      throw new ForbiddenException('Admin or Superadmin privileges required for mesh configuration');
    }
  }

  @Public()
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'events',
      port: 3032,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('publish')
  async publishEvent(
    @Req() req: Request,
    @Body() dto: { eventType: string; sourceService: string; payload: any },
    @Headers('x-tenant-id') rawTenantId?: string,
  ) {
    const tenantId = this.extractTenantId(req, rawTenantId);
    return this.eventsService.publish({
      tenantId,
      eventType: dto.eventType,
      sourceService: dto.sourceService || 'mesh-node',
      payload: dto.payload || {},
    });
  }

  @Get('history')
  async getHistory(
    @Req() req: Request,
    @Headers('x-tenant-id') rawTenantId?: string,
    @Query('limit') limit?: string,
  ) {
    const tenantId = this.extractTenantId(req, rawTenantId);
    const data = await this.eventsService.getHistory(tenantId, limit ? parseInt(limit, 10) : 50);
    return { data, count: data.length };
  }

  @Get('subscribers')
  async getSubscribers(@Req() req: Request) {
    this.assertAdmin(req);
    const data = await this.eventsService.getSubscribers();
    return { data, count: data.length };
  }

  @Post('subscribe')
  async subscribe(
    @Req() req: Request,
    @Body('eventTypePattern') eventTypePattern: string,
    @Body('targetUrl') targetUrl: string,
  ) {
    this.assertAdmin(req);
    return this.eventsService.registerSubscriber(eventTypePattern || '*', targetUrl);
  }
}
