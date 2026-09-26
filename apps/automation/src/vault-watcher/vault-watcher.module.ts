import { Module } from '@nestjs/common';
import { VaultWatcherService } from './vault-watcher.service';
import { VaultWatcherController } from './vault-watcher.controller';

@Module({
  controllers: [VaultWatcherController],
  providers: [VaultWatcherService],
  exports: [VaultWatcherService],
})
export class VaultWatcherModule {}
