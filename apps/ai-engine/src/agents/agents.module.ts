import { Module } from '@nestjs/common';
import { AgentFrameworkService } from './agent-framework.service';
import { AgentFrameworkController } from './agent-framework.controller';

@Module({
  controllers: [AgentFrameworkController],
  providers: [AgentFrameworkService],
  exports: [AgentFrameworkService],
})
export class AgentsModule {}
