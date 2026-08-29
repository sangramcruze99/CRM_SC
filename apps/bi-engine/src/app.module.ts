import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '@repo/auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MetricsModule } from './metrics/metrics.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReportTemplateController } from './reports/reports.controller';
import { ReportTemplateService } from './reports/reports.service';

@Module({
  imports: [
    JwtModule.register({ secret: process.env.JWT_SECRET || 'super-secret-business-os-key' }),
    MetricsModule,
    PrismaModule,
  ],
  controllers: [ReportTemplateController, AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    ReportTemplateService,
    AppService,
  ],
})
export class AppModule {}
