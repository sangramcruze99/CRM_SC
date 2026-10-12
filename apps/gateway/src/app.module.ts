import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { GatewayThrottlerGuard } from './gateway-throttler.guard';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'burst',
        ttl: 1000,
        limit: 25,
      },
      {
        name: 'sustained',
        ttl: 60000,
        limit: 300,
      },
    ]),
  ],
  controllers: [GatewayController],
  providers: [
    GatewayService,
    {
      provide: APP_GUARD,
      useClass: GatewayThrottlerGuard,
    },
  ],
  exports: [GatewayService],
})
export class AppModule {}

