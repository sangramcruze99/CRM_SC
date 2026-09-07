import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { ServiceAuthGuard } from './guards/service-auth.guard';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, ServiceAuthGuard],
  exports: [DocumentsService],
})
export class DocumentsModule {}
