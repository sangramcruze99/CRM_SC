import { Module } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { ReportingController } from './reporting.controller';
import { ReportTemplateService } from './reports.service';
import { ReportTemplateController } from './reports.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JournalModule } from '../journal/journal.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [PrismaModule, JournalModule, AnalyticsModule],
  controllers: [ReportingController, ReportTemplateController],
  providers: [ReportingService, ReportTemplateService],
  exports: [ReportingService, ReportTemplateService],
})
export class ReportsModule {}
