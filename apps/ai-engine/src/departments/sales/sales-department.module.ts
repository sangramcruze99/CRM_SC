import { Module } from '@nestjs/common';
import { SalesDepartmentController } from './sales-department.controller';
import { SalesDepartmentService } from './sales-department.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { PromptsModule } from '../../prompts/prompts.module';
import { AgentsModule } from '../../agents/agents.module';

@Module({
  imports: [PrismaModule, PromptsModule, AgentsModule],
  controllers: [SalesDepartmentController],
  providers: [SalesDepartmentService],
  exports: [SalesDepartmentService],
})
export class SalesDepartmentModule {}
