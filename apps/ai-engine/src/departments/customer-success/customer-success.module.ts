import { Module } from '@nestjs/common';
import { CustomerSuccessController } from './customer-success.controller';
import { CustomerSuccessService } from './customer-success.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { PromptsModule } from '../../prompts/prompts.module';
import { AgentsModule } from '../../agents/agents.module';

@Module({
  imports: [PrismaModule, PromptsModule, AgentsModule],
  controllers: [CustomerSuccessController],
  providers: [CustomerSuccessService],
  exports: [CustomerSuccessService],
})
export class CustomerSuccessModule {}
