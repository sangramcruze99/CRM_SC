import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard, getJwtSecret } from '@repo/auth';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [
    JwtModule.register({ secret: getJwtSecret() }),
  ],
  controllers: [EventsController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    EventsService,
  ],
  exports: [EventsService],
})
export class AppModule {}
