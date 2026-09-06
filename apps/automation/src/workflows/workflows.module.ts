import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { WorkflowExecutionService } from '../executor/workflow-execution.service';
import { ExecutionPersistenceService } from '../executor/execution-persistence.service';
import { WorkflowGraphExecutorService } from '../executor/workflow-graph-executor.service';
import { WorkflowGeneratorService } from './workflow-generator.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ActionsModule } from '../actions/actions.module';
import { ApprovalsModule } from '../approvals/approvals.module';
import { ConnectorsModule } from '../connectors/connectors.module';
import { BrowserModule } from '../browser/browser.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';

const isRedisConfigured = Boolean(
  process.env.ENABLE_BULLMQ !== 'false' && (
    process.env.REDIS_HOST || 
    process.env.REDIS_URL || 
    process.env.ENABLE_BULLMQ === 'true' || 
    process.env.NODE_ENV === 'production'
  )
);

@Module({
  imports: [
    PrismaModule,
    ActionsModule,
    ApprovalsModule,
    ConnectorsModule,
    BrowserModule,
    WhatsAppModule,
    ...(isRedisConfigured ? [
      BullModule.registerQueue({
        name: 'workflows',
      })
    ] : [])
  ],
  controllers: [WorkflowsController],
  providers: [
    WorkflowsService,
    WorkflowExecutionService,
    ExecutionPersistenceService,
    WorkflowGraphExecutorService,
    WorkflowGeneratorService,
  ],
  exports: [
    WorkflowsService,
    WorkflowExecutionService,
    ExecutionPersistenceService,
    WorkflowGraphExecutorService,
    WorkflowGeneratorService,
  ],
})
export class WorkflowsModule {}
