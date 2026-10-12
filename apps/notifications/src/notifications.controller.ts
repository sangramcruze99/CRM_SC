import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
} from '@nestjs/common';
import { NotificationsService, CreateNotificationDto } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'notifications',
      port: 3028,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  async getNotifications(
    @Headers('x-tenant-id') tenantId = 'default-tenant',
    @Query('category') category?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const isUnreadOnly = unreadOnly === 'true' ? false : undefined;
    const notifications = await this.notificationsService.findAll(tenantId, category, isUnreadOnly);
    return {
      data: notifications,
      count: notifications.length,
    };
  }

  @Get('unread-count')
  async getUnreadCount(@Headers('x-tenant-id') tenantId = 'default-tenant') {
    return this.notificationsService.getUnreadCount(tenantId);
  }

  @Post('dispatch')
  async dispatchNotification(
    @Headers('x-tenant-id') tenantId = 'default-tenant',
    @Body() dto: CreateNotificationDto,
  ) {
    const created = await this.notificationsService.create(tenantId, dto);
    return {
      success: true,
      data: created,
    };
  }

  @Patch(':id/read')
  async markRead(
    @Headers('x-tenant-id') tenantId = 'default-tenant',
    @Param('id') id: string,
  ) {
    await this.notificationsService.markAsRead(tenantId, id);
    return { success: true, id };
  }

  @Post('mark-all-read')
  async markAllRead(
    @Headers('x-tenant-id') tenantId = 'default-tenant',
    @Body('category') category?: string,
  ) {
    const res = await this.notificationsService.markAllAsRead(tenantId, category);
    return { success: true, ...res };
  }

  @Delete(':id')
  async deleteNotification(
    @Headers('x-tenant-id') tenantId = 'default-tenant',
    @Param('id') id: string,
  ) {
    await this.notificationsService.remove(tenantId, id);
    return { success: true, id };
  }
}
