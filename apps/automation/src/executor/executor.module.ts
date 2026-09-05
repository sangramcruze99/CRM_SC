import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { WorkflowProcessor } from './workflow.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { ActionsModule } from '../actions/actions.module';
import { WorkflowsModule } from '../workflows/workflows.module';

@Module({
  imports: [
    PrismaModule,
    ActionsModule,
    forwardRef(() => WorkflowsModule),
    BullModule.registerQueue({
      name: 'workflows',
    }),
  ],
  providers: [WorkflowProcessor],
})
export class ExecutorModule {}
