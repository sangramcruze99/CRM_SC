import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InvoicesModule } from './invoices/invoices.module';
import { KhataModule } from './khata/khata.module';
import { PaymentLinkController } from './payment-links/payment-links.controller';
import { PaymentLinkService } from './payment-links/payment-links.service';
import { PriceBookController } from './price-books/price-books.controller';
import { PriceBookService } from './price-books/price-books.service';
import { PrismaModule } from './prisma/prisma.module';
import { QuoteController } from './quotes/quotes.controller';
import { QuoteService } from './quotes/quotes.service';
import { SubscriptionController } from './subscriptions/subscriptions.controller';
import { SubscriptionService } from './subscriptions/subscriptions.service';

@Module({
  imports: [
    JwtModule.register({ secret: process.env.JWT_SECRET || 'super-secret-business-os-key' }),
    InvoicesModule,
    PrismaModule,
    KhataModule,
  ],
  controllers: [
    PriceBookController,
    QuoteController,
    PaymentLinkController,
    SubscriptionController,
    AppController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    PriceBookService,
    QuoteService,
    PaymentLinkService,
    SubscriptionService,
    AppService,
  ],
})
export class AppModule {}
