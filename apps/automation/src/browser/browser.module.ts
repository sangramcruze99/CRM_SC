import { Module } from '@nestjs/common';
import { BrowserAgentService } from './browser-agent.service';
import { BrowserController } from './browser.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BrowserController],
  providers: [BrowserAgentService],
  exports: [BrowserAgentService],
})
export class BrowserModule {}
