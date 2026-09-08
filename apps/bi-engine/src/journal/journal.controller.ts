import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { JournalService } from './journal.service';

@Controller('journal')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Get('daily')
  async getDaily(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Query('date') date: string,
    @Query('tenantId') tenantIdQuery?: string
  ) {
    const tenantId = tenantIdHeader || tenantIdQuery || 'default-tenant';
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.journalService.getOrCreateDailyRecord(tenantId, targetDate);
  }

  @Get('period')
  async getPeriod(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Query('type') type: 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR',
    @Query('key') key?: string,
    @Query('date') date?: string,
    @Query('tenantId') tenantIdQuery?: string
  ) {
    const tenantId = tenantIdHeader || tenantIdQuery || 'default-tenant';
    const periodType = (type || 'MONTH').toUpperCase() as any;
    let periodKey = key || date;
    if (!periodKey) {
      if (periodType === 'DAY' || periodType === 'WEEK') {
        periodKey = new Date().toISOString().split('T')[0];
      } else if (periodType === 'MONTH') {
        periodKey = new Date().toISOString().substring(0, 7);
      } else if (periodType === 'QUARTER') {
        const m = new Date().getUTCMonth();
        const q = Math.floor(m / 3) + 1;
        periodKey = `${new Date().getUTCFullYear()}-Q${q}`;
      } else {
        periodKey = `${new Date().getUTCFullYear()}`;
      }
    }
    return this.journalService.aggregatePeriod(tenantId, periodType, periodKey);
  }

  @Get('calendar')
  async getCalendar(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('tenantId') tenantIdQuery?: string
  ) {
    const tenantId = tenantIdHeader || tenantIdQuery || 'default-tenant';
    let monthKey = month || new Date().toISOString().substring(0, 7);
    if (year && month && !month.includes('-')) {
      monthKey = `${year}-${String(month).padStart(2, '0')}`;
    }
    return this.journalService.getCalendarMonth(tenantId, monthKey);
  }

  @Get('timeline')
  async getTimeline(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Query('date') date: string,
    @Query('tenantId') tenantIdQuery?: string
  ) {
    const tenantId = tenantIdHeader || tenantIdQuery || 'default-tenant';
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.journalService.getDayTimeline(tenantId, targetDate);
  }

  @Post('recalculate')
  async recalculate(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Headers('x-user-id') userId: string,
    @Body() body: { startDate: string; endDate: string; tenantId?: string }
  ) {
    const tenantId = tenantIdHeader || body.tenantId || 'default-tenant';
    if (!body.startDate || !body.endDate) {
      throw new BadRequestException('startDate and endDate are required in format YYYY-MM-DD');
    }
    return this.journalService.recalculateRange(tenantId, body.startDate, body.endDate, userId || 'Admin');
  }

  @Post('lock')
  async lock(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Headers('x-user-id') userId: string,
    @Body() body: { periodType: string; periodKey?: string; startDate?: string; endDate?: string; status: 'OPEN' | 'CALCULATING' | 'FINALIZED' | 'LOCKED'; tenantId?: string }
  ) {
    const tenantId = tenantIdHeader || body.tenantId || 'default-tenant';
    let periodKey = body.periodKey;
    if (!periodKey && body.startDate) {
      periodKey = body.periodType?.toUpperCase() === 'MONTH' ? body.startDate.substring(0, 7) : body.startDate;
    }
    if (!body.periodType || !periodKey || !body.status) {
      throw new BadRequestException('periodType, periodKey (or startDate), and status are required');
    }
    return this.journalService.lockPeriod(tenantId, body.periodType, periodKey, body.status, userId || 'Admin');
  }

  @Post('event')
  async recordEvent(
    @Headers('x-tenant-id') tenantIdHeader: string,
    @Body() body: any
  ) {
    const tenantId = tenantIdHeader || body.tenantId || 'default-tenant';
    if (!body.eventType || !body.service || !body.entityType || !body.entityId) {
      throw new BadRequestException('eventType, service, entityType, and entityId are required');
    }
    return this.journalService.recordJournalEvent(tenantId, body);
  }
}
