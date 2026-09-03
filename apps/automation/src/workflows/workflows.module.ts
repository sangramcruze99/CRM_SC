import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { PrismaModule } from '../prisma/prisma.module';

const isRedisConfigured = Boolean(process.env.REDIS_HOST && process.env.REDIS_HOST !== '127.0.0.1' && process.env.REDIS_HOST !== 'localhost');

@Module({
  imports: [
    PrismaModule,
    ...(isRedisConfigured ? [
      BullModule.registerQueue({
        name: 'workflows',
      })
    ] : [])
  ],
  controllers: [WorkflowsController],
  providers: [WorkflowsService]
})
export class WorkflowsModule {}
