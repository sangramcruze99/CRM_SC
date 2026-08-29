import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '@repo/auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AutomationsModule } from './automations/automations.module';
import { CustomFieldsModule } from './custom-fields/custom-fields.module';
import { CustomObjectsModule } from './custom-objects/custom-objects.module';
import { CustomRecordsModule } from './custom-records/custom-records.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    JwtModule.register({ secret: process.env.JWT_SECRET || 'super-secret-business-os-key' }),
    CustomObjectsModule,
    CustomFieldsModule,
    CustomRecordsModule,
    AutomationsModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    AppService,
  ],
})
export class AppModule {}
