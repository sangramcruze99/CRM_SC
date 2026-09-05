import { Module } from '@nestjs/common';
import { WhatsAppController } from './whatsapp.controller';
import { ConversationEngineService } from './conversation-engine.service';
import { WhatsAppCloudService } from './whatsapp-cloud.service';
import { TwilioWhatsAppService } from './twilio-whatsapp.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EventBusModule } from '../event-bus/event-bus.module';

@Module({
  imports: [PrismaModule, EventBusModule],
  controllers: [WhatsAppController],
  providers: [
    WhatsAppCloudService,
    TwilioWhatsAppService,
    ConversationEngineService,
  ],
  exports: [ConversationEngineService, WhatsAppCloudService, TwilioWhatsAppService],
})
export class WhatsAppModule {}
