import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '@repo/auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompliancePolicyController } from './compliance/compliance.controller';
import { CompliancePolicyService } from './compliance/compliance.service';
import { LogsModule } from './logs/logs.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    JwtModule.register({ secret: process.env.JWT_SECRET || 'super-secret-business-os-key' }),
    PrismaModule,
    LogsModule,
  ],
  controllers: [CompliancePolicyController, AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    CompliancePolicyService,
    AppService,
  ],
})
export class AppModule {}
