import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { Public } from '@repo/auth';
import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  private extractTenantId(req?: Request, headersTenantId?: string): string {
    const user = (req as any)?.user;
    if (user?.tenantId) {
      if (user.role === 'SUPERADMIN' && headersTenantId) {
        return headersTenantId;
      }
      return user.tenantId;
    }
    return headersTenantId || 'default-tenant';
  }

  @Public()
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
    @Req() req: Request,
    @Body('fileName') fileName: string,
    @Body('contentType') contentType: string,
    @Headers('x-tenant-id') rawTenantId?: string,
  ) {
    const tenantId = this.extractTenantId(req, rawTenantId);
    return this.storageService.generatePresignedUrl(tenantId, fileName || 'file.bin', contentType || 'application/octet-stream');
  }

  @Get('assets')
  async listAssets(
    @Req() req: Request,
    @Headers('x-tenant-id') rawTenantId?: string,
  ) {
    const tenantId = this.extractTenantId(req, rawTenantId);
    const assets = await this.storageService.listAssets(tenantId);
    return {
      data: assets,
      count: assets.length,
    };
  }

  @Get('assets/:id')
  async getAsset(
    @Req() req: Request,
    @Param('id') id: string,
    @Headers('x-tenant-id') rawTenantId?: string,
  ) {
    const tenantId = this.extractTenantId(req, rawTenantId);
    const asset = await this.storageService.getAsset(tenantId, id);
    if (!asset) {
      throw new NotFoundException(`Asset ${id} not found`);
    }
    return asset;
  }
}
