import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  NotFoundException,
} from '@nestjs/common';
import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'storage',
      port: 3031,
      provider: process.env.S3_BUCKET ? 's3' : 'local_storage',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('presign')
  async presign(
    @Headers('x-tenant-id') tenantId = 'default-tenant',
    @Body('fileName') fileName: string,
    @Body('contentType') contentType: string,
  ) {
    return this.storageService.generatePresignedUrl(tenantId, fileName || 'file.bin', contentType || 'application/octet-stream');
  }

  @Get('assets')
  async listAssets(@Headers('x-tenant-id') tenantId = 'default-tenant') {
    const assets = await this.storageService.listAssets(tenantId);
    return {
      data: assets,
      count: assets.length,
    };
  }

  @Get('assets/:id')
  async getAsset(
    @Headers('x-tenant-id') tenantId = 'default-tenant',
    @Param('id') id: string,
  ) {
    const asset = await this.storageService.getAsset(tenantId, id);
    if (!asset) {
      throw new NotFoundException(`Asset ${id} not found`);
    }
    return asset;
  }
}
