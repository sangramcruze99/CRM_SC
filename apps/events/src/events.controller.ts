import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Headers,
} from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

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
    @Headers('x-tenant-id') tenantId = 'default-tenant',
    @Body() dto: { eventType: string; sourceService: string; payload: any },
  ) {
    return this.eventsService.publish({
      tenantId,
      eventType: dto.eventType,
      sourceService: dto.sourceService || 'mesh-node',
      payload: dto.payload || {},
    });
  }

  @Get('history')
  async getHistory(
    @Headers('x-tenant-id') tenantId = 'default-tenant',
    @Query('limit') limit?: string,
  ) {
    const data = await this.eventsService.getHistory(tenantId, limit ? parseInt(limit, 10) : 50);
    return { data, count: data.length };
  }

  @Get('subscribers')
  async getSubscribers() {
    const data = await this.eventsService.getSubscribers();
    return { data, count: data.length };
  }

  @Post('subscribe')
  async subscribe(
    @Body('eventTypePattern') eventTypePattern: string,
    @Body('targetUrl') targetUrl: string,
  ) {
    return this.eventsService.registerSubscriber(eventTypePattern || '*', targetUrl);
  }
}
