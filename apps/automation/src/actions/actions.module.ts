import { Module } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { ActionsController } from './actions.controller';
import { TwilioController } from './twilio.controller';
import { TwilioService } from './twilio.service';
import { ResendService } from './resend.service';
import { EmailController } from './email.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ActionsController, TwilioController, EmailController],
  providers: [ActionsService, TwilioService, ResendService],
  exports: [ActionsService, TwilioService, ResendService],
})
export class ActionsModule {}

