import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard, getJwtSecret } from '@repo/auth';
import { TaxRuleController } from './taxes/taxes.controller';
import { TaxRuleService } from './taxes/taxes.service';
import { LocalizationController } from './localization/localization.controller';
import { LocalizationService } from './localization/localization.service';
import { WorkspaceSettingsController } from './workspace/workspace.controller';
import { WorkspaceSettingsService } from './workspace/workspace.service';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    JwtModule.register({ secret: getJwtSecret() }),
    PrismaModule,
  ],
  controllers: [
    WorkspaceSettingsController,
    TaxRuleController,
    LocalizationController,
    AppController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    WorkspaceSettingsService,
    TaxRuleService,
    LocalizationService,
    AppService,
  ],
})
export class AppModule {}

