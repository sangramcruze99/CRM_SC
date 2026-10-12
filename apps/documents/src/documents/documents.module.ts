import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { S3StorageService } from './s3-storage.service';
import { ServiceAuthGuard } from './guards/service-auth.guard';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, S3StorageService, ServiceAuthGuard],
  exports: [DocumentsService, S3StorageService],
})
export class DocumentsModule {}
