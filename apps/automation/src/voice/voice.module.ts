import { Module } from '@nestjs/common';
import { VoiceAgentService } from './voice-agent.service';
import { VoiceController } from './voice.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VoiceController],
  providers: [VoiceAgentService],
  exports: [VoiceAgentService],
})
export class VoiceModule {}
