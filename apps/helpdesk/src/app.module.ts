import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatWidgetController } from './chat-widgets/chat-widgets.controller';
import { ChatWidgetService } from './chat-widgets/chat-widgets.service';
import { PrismaModule } from './prisma/prisma.module';
import { SLAController } from './slas/slas.controller';
import { SLAService } from './slas/slas.service';
import { TicketsModule } from './tickets/tickets.module';

@Module({
  imports: [
    JwtModule.register({ secret: process.env.JWT_SECRET || 'super-secret-business-os-key' }),
    TicketsModule,
    PrismaModule,
  ],
  controllers: [
    ChatWidgetController,
    SLAController,
    AppController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    ChatWidgetService,
    SLAService,
    AppService,
  ],
})
export class AppModule {}
