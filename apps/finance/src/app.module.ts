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

// Enterprise Finance Subsystem Modules
import { AccountingModule } from './accounting/accounting.module';
import { BillsModule } from './bills/bills.module';
import { PaymentsModule } from './payments/payments.module';
import { BankingModule } from './banking/banking.module';
import { ReconciliationModule } from './reconciliation/reconciliation.module';
import { ExpensesModule } from './expenses/expenses.module';
import { FinanceToolsModule } from './ai-tools/finance-tools.module';
import { OutboxModule } from './outbox/outbox.module';

@Module({
  imports: [
    JwtModule.register({ secret: process.env.JWT_SECRET || 'super-secret-business-os-key' }),
    PrismaModule,
    OutboxModule,
    AccountingModule,
    InvoicesModule,
    BillsModule,
    PaymentsModule,
    BankingModule,
    ReconciliationModule,
    ExpensesModule,
    FinanceToolsModule,
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
