import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard, getJwtSecret } from '@repo/auth';
import { PrismaModule } from './prisma/prisma.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [
    JwtModule.register({ secret: getJwtSecret() }),
    PrismaModule,
  ],
  controllers: [NotificationsController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    NotificationsService,
  ],
  exports: [NotificationsService],
})
export class AppModule {}
