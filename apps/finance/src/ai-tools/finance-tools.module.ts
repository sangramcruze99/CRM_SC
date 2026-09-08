import { Module } from '@nestjs/common';
import { FinanceToolsService } from './finance-tools.service';
import { FinanceToolsController } from './finance-tools.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FinanceToolsController],
  providers: [FinanceToolsService],
  exports: [FinanceToolsService],
})
export class FinanceToolsModule {}
