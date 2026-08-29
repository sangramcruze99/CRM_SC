import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '@repo/auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocumentsModule } from './documents/documents.module';
import { ESignatureController } from './e-signatures/e-signatures.controller';
import { ESignatureService } from './e-signatures/e-signatures.service';
import { FoldersModule } from './folders/folders.module';
import { PrismaModule } from './prisma/prisma.module';
import { S3UploadController } from './s3-uploads/s3-uploads.controller';
import { S3UploadService } from './s3-uploads/s3-uploads.service';

@Module({
  imports: [
    JwtModule.register({ secret: process.env.JWT_SECRET || 'super-secret-business-os-key' }),
    PrismaModule,
    FoldersModule,
    DocumentsModule,
  ],
  controllers: [
    ESignatureController,
    S3UploadController,
    AppController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    ESignatureService,
    S3UploadService,
    AppService,
  ],
})
export class AppModule {}
