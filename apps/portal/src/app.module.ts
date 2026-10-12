import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard, getJwtSecret } from '@repo/auth';
import { PrismaModule } from './prisma/prisma.module';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';

@Module({
  imports: [
    JwtModule.register({ secret: getJwtSecret() }),
    PrismaModule,
  ],
  controllers: [PortalController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    PortalService,
  ],
  exports: [PortalService],
})
export class AppModule {}
