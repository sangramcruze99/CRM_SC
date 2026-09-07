import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '@repo/auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { OcrModule } from './ocr/ocr.module';
import { PrismaModule } from './prisma/prisma.module';
import { PromptsModule } from './prompts/prompts.module';
import { AgentsModule } from './agents/agents.module';
import { SalesDepartmentModule } from './departments/sales/sales-department.module';
import { CustomerSuccessModule } from './departments/customer-success/customer-success.module';
import { FinanceDepartmentModule } from './departments/finance/finance-department.module';

@Module({
  imports: [
    JwtModule.register({ secret: process.env.JWT_SECRET || 'super-secret-business-os-key' }),
    PromptsModule,
    AgentsModule,
    KnowledgeModule,
    OcrModule,
    PrismaModule,
    SalesDepartmentModule,
    CustomerSuccessModule,
    FinanceDepartmentModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    AppService,
  ],
})
export class AppModule {}
