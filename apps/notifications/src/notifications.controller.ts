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
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { Public } from '@repo/auth';
import { NotificationsService, CreateNotificationDto } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

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

  @Public()
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
    @Req() req: Request,
    @Headers('x-tenant-id') rawTenantId: string | undefined,
    @Query('category') category?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const tenantId = this.extractTenantId(req, rawTenantId);
    const isUnreadOnly = unreadOnly === 'true' ? false : undefined;
    const notifications = await this.notificationsService.findAll(tenantId, category, isUnreadOnly);
    return {
      data: notifications,
      count: notifications.length,
    };
  }

  @Get('unread-count')
  async getUnreadCount(
    @Req() req: Request,
    @Headers('x-tenant-id') rawTenantId?: string,
  ) {
    const tenantId = this.extractTenantId(req, rawTenantId);
    return this.notificationsService.getUnreadCount(tenantId);
  }

  @Post('dispatch')
  async dispatchNotification(
    @Req() req: Request,
    @Body() dto: CreateNotificationDto,
    @Headers('x-tenant-id') rawTenantId?: string,
  ) {
    const tenantId = this.extractTenantId(req, rawTenantId);
    const created = await this.notificationsService.create(tenantId, dto);
    return {
      success: true,
      data: created,
    };
  }

  @Patch(':id/read')
  async markRead(
    @Req() req: Request,
    @Param('id') id: string,
    @Headers('x-tenant-id') rawTenantId?: string,
  ) {
    const tenantId = this.extractTenantId(req, rawTenantId);
    await this.notificationsService.markAsRead(tenantId, id);
    return { success: true, id };
  }

  @Post('mark-all-read')
  async markAllRead(
    @Req() req: Request,
    @Headers('x-tenant-id') rawTenantId?: string,
    @Body('category') category?: string,
  ) {
    const tenantId = this.extractTenantId(req, rawTenantId);
    const res = await this.notificationsService.markAllAsRead(tenantId, category);
    return { success: true, ...res };
  }

  @Delete(':id')
  async deleteNotification(
    @Req() req: Request,
    @Param('id') id: string,
    @Headers('x-tenant-id') rawTenantId?: string,
  ) {
    const tenantId = this.extractTenantId(req, rawTenantId);
    await this.notificationsService.remove(tenantId, id);
    return { success: true, id };
  }
}
