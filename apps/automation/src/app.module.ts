import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtAuthGuard } from '@repo/auth';
import { ActionsModule } from './actions/actions.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExecutorModule } from './executor/executor.module';
import { PrismaModule } from './prisma/prisma.module';
import { WorkflowsModule } from './workflows/workflows.module';

const isRedisConfigured = Boolean(process.env.REDIS_HOST && process.env.REDIS_HOST !== '127.0.0.1' && process.env.REDIS_HOST !== 'localhost');

@Module({
  imports: [
    JwtModule.register({ secret: process.env.JWT_SECRET || 'super-secret-business-os-key' }),
    ScheduleModule.forRoot(),
    ...(isRedisConfigured ? [
      BullModule.forRoot({
        connection: {
          host: process.env.REDIS_HOST || '127.0.0.1',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
          maxRetriesPerRequest: null,
        },
      }),
      ExecutorModule,
    ] : []),
    WorkflowsModule,
    ActionsModule,
    PrismaModule,
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
