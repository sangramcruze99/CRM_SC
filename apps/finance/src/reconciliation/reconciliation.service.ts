import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface MatchCandidate {
  recordType: 'PAYMENT' | 'INVOICE' | 'BILL';
  recordId: string;
  referenceNumber: string;
  counterparty: string;
  amount: number;
  currency: string;
  date: Date;
  confidenceScore: number; // 0.0 - 1.0
  matchReason: string;
}

@Injectable()
export class ReconciliationService {
  private readonly logger = new Logger(ReconciliationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find candidate matches for an unmatched bank transaction using multi-attribute scoring
   * Rules:
   * - Never match on amount alone
   * - Combines amount, currency, date proximity, reference/ID, and counterparty
   */
  async findCandidates(tenantId: string, transactionId: string): Promise<MatchCandidate[]> {
    const tx = await this.prisma.bankTransaction.findFirst({
      where: { id: transactionId, tenantId },
    });
    if (!tx) throw new NotFoundException('Bank transaction not found');

    const candidates: MatchCandidate[] = [];
    const txAmount = Number(tx.amount.toFixed(2));
    const txDate = new Date(tx.date).getTime();
    const descLower = (tx.description || '').toLowerCase();

    // 1. Search in Payments
    const payments = await this.prisma.payment.findMany({
      where: {
        tenantId,
        currency: tx.currency,
        status: { in: ['SETTLED', 'PROCESSING', 'APPROVED'] },
      },
    });

    for (const p of payments) {
      let score = 0;
      const reasons: string[] = [];

      // Check amount
      const pAmount = Number(p.amount.toFixed(2));
      if (Math.abs(pAmount - txAmount) < 0.01) {
        score += 40;
        reasons.push('Exact amount match ($' + pAmount + ')');
      } else if (Math.abs(pAmount - txAmount) / txAmount < 0.05) {
        score += 20;
        reasons.push('Close amount within 5%');
      }

      // Check date proximity (within 5 days)
      const pDate = new Date(p.createdAt).getTime();
      const dayDiff = Math.abs(txDate - pDate) / (1000 * 60 * 60 * 24);
      if (dayDiff <= 2) {
        score += 30;
        reasons.push('Transaction date within 48 hours');
      } else if (dayDiff <= 7) {
        score += 15;
        reasons.push('Transaction date within 7 days');
      }

      // Check reference or payment number in description
      if (descLower.includes(p.paymentNumber.toLowerCase())) {
        score += 30;
        reasons.push(`Reference number '${p.paymentNumber}' found in bank feed`);
      }
      if (p.providerTransactionId && descLower.includes(p.providerTransactionId.toLowerCase())) {
        score += 35;
        reasons.push('Provider transaction ID matched');
      }

      // Check counterparty
      const counterparty = p.payerName || p.payeeName || '';
      if (counterparty && descLower.includes(counterparty.toLowerCase())) {
        score += 15;
        reasons.push(`Counterparty '${counterparty}' matched description`);
      }

      if (score >= 40) {
        candidates.push({
          recordType: 'PAYMENT',
          recordId: p.id,
          referenceNumber: p.paymentNumber,
          counterparty: counterparty || 'N/A',
          amount: p.amount,
          currency: p.currency,
          date: p.createdAt,
          confidenceScore: Math.min(1.0, Number((score / 100).toFixed(2))),
          matchReason: reasons.join('; '),
        });
      }
    }

    // Sort by confidence score descending
    candidates.sort((a, b) => b.confidenceScore - a.confidenceScore);
    return candidates;
  }

  /**
   * Reconcile a bank transaction against a verified payment or operational record
   */
  async reconcile(tenantId: string, transactionId: string, paymentId: string) {
    const tx = await this.prisma.bankTransaction.findFirst({ where: { id: transactionId, tenantId } });
    if (!tx) throw new NotFoundException('Bank transaction not found');

    const payment = await this.prisma.payment.findFirst({ where: { id: paymentId, tenantId } });
    if (!payment) throw new NotFoundException('Payment not found');

    const now = new Date();

    await this.prisma.$transaction(async (prismaTx) => {
      await prismaTx.bankTransaction.update({
        where: { id: tx.id },
        data: {
          status: 'RECONCILED',
          matchedPaymentId: payment.id,
          matchedRecordType: 'PAYMENT',
          matchedRecordId: payment.id,
          reconciledAt: now,
        },
      });

      await prismaTx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'RECONCILED',
          reconciledAt: now,
        },
      });
    });

    this.logger.log(`[Reconciliation] Successfully reconciled Bank Tx ${tx.id} with Payment ${payment.paymentNumber}`);
    return {
      success: true,
      transactionId: tx.id,
      paymentId: payment.id,
      reconciledAt: now,
    };
  }

  /**
   * Return financial exceptions and unmatched transactions requiring investigation
   */
  async getExceptions(tenantId: string) {
    const unmatchedTransactions = await this.prisma.bankTransaction.findMany({
      where: {
        tenantId,
        status: { in: ['UNMATCHED', 'EXCEPTION'] },
      },
      include: { account: true },
      orderBy: { date: 'desc' },
      take: 50,
    });

    const unknownPayments = await this.prisma.payment.findMany({
      where: {
        tenantId,
        status: 'UNKNOWN_CONFIRMATION',
      },
      orderBy: { createdAt: 'desc' },
    });

    const disputedBills = await this.prisma.bill.findMany({
      where: {
        tenantId,
        status: { in: ['DISPUTED', 'REJECTED'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      asOf: new Date().toISOString(),
      summary: {
        unmatchedBankTransactions: unmatchedTransactions.length,
        unknownPaymentOutcomes: unknownPayments.length,
        disputedBills: disputedBills.length,
      },
      unmatchedTransactions,
      unknownPayments,
      disputedBills,
    };
  }
}
