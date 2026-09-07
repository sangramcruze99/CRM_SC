import { Module } from '@nestjs/common';
import { FinanceDepartmentController } from './finance-department.controller';
import { FinanceDepartmentService } from './finance-department.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { PromptsModule } from '../../prompts/prompts.module';
import { AgentsModule } from '../../agents/agents.module';

@Module({
  imports: [PrismaModule, PromptsModule, AgentsModule],
  controllers: [FinanceDepartmentController],
  providers: [FinanceDepartmentService],
  exports: [FinanceDepartmentService],
})
export class FinanceDepartmentModule {}
