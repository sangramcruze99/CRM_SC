import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmployeesModule } from './employees/employees.module';
import { NDAController } from './ndas/ndas.controller';
import { NDAService } from './ndas/ndas.service';
import { OfferLetterController } from './offer-letters/offer-letters.controller';
import { OfferLetterService } from './offer-letters/offer-letters.service';
import { OnboardingTaskController } from './onboarding/onboarding.controller';
import { OnboardingTaskService } from './onboarding/onboarding.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    JwtModule.register({ secret: process.env.JWT_SECRET || 'super-secret-business-os-key' }),
    EmployeesModule,
    PrismaModule,
  ],
  controllers: [
    OnboardingTaskController,
    NDAController,
    OfferLetterController,
    AppController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    OnboardingTaskService,
    NDAService,
    OfferLetterService,
    AppService,
  ],
})
export class AppModule {}
