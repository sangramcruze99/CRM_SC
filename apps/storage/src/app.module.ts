import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard, getJwtSecret } from '@repo/auth';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

@Module({
  imports: [
    JwtModule.register({ secret: getJwtSecret() }),
  ],
  controllers: [StorageController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class AppModule {}
