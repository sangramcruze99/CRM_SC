// apps/automation/src/intent/intent.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { IntentParserService } from './intent-parser.service';
import { IntentCompilerService } from './intent-compiler.service';
import { IntentSimulatorService } from './intent-simulator.service';
import { IntentService } from './intent.service';
import { IntentController } from './intent.controller';

@Module({
  imports: [PrismaModule],
  controllers: [IntentController],
  providers: [
    IntentParserService,
    IntentCompilerService,
    IntentSimulatorService,
    IntentService,
  ],
  exports: [
    IntentService,
    IntentParserService,
    IntentCompilerService,
    IntentSimulatorService,
  ],
})
export class IntentModule {}
