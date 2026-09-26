import { Controller, Get, Post, Body } from '@nestjs/common';
import { VaultWatcherService } from './vault-watcher.service';

@Controller(['vault', 'automation/vault'])
export class VaultWatcherController {
  constructor(private readonly vaultWatcher: VaultWatcherService) {}

  @Get('status')
  getStatus() {
    return this.vaultWatcher.getStatus();
  }

  @Post('simulate')
  async simulateDrop(@Body() body: { folderId?: string; sampleData?: any }) {
    return this.vaultWatcher.simulateDrop(body?.folderId || 'crm_leads', body?.sampleData);
  }
}
