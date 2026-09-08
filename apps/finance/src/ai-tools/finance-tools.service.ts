import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanceToolsService {
  private readonly logger = new Logger(FinanceToolsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tool: get_ar_summary
   * Provides certified Accounts Receivable metrics
   */
  async getArSummary(tenantId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { tenantId },
    });

    let totalBilled = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;
    let overdueAmount = 0;
    const now = new Date();

    for (const inv of invoices) {
      totalBilled += inv.amount;
      totalCollected += inv.paidAmount;
      const balance = Math.max(0, inv.amount - inv.paidAmount);
      totalOutstanding += balance;

      if (balance > 0 && new Date(inv.dueDate) < now) {
        overdueAmount += balance;
      }
    }

    return {
      asOf: now.toISOString(),
      totalInvoices: invoices.length,
      totalBilled: Number(totalBilled.toFixed(2)),
      totalCollected: Number(totalCollected.toFixed(2)),
      totalOutstanding: Number(totalOutstanding.toFixed(2)),
      overdueAmount: Number(overdueAmount.toFixed(2)),
      currency: 'USD',
    };
  }

  /**
   * Tool: get_ap_summary
   * Provides Accounts Payable metrics
   */
  async getApSummary(tenantId: string) {
    const bills = await this.prisma.bill.findMany({
      where: { tenantId },
    });

    let totalPayables = 0;
    let totalDisbursed = 0;
    let outstandingPayables = 0;
    let overduePayables = 0;
    const now = new Date();

    for (const bill of bills) {
      totalPayables += bill.total;
      totalDisbursed += bill.paidAmount;
      const balance = Math.max(0, bill.total - bill.paidAmount);
      outstandingPayables += balance;

      if (balance > 0 && new Date(bill.dueDate) < now) {
        overduePayables += balance;
      }
    }

    return {
      asOf: now.toISOString(),
      totalBills: bills.length,
      totalPayables: Number(totalPayables.toFixed(2)),
      totalDisbursed: Number(totalDisbursed.toFixed(2)),
      outstandingPayables: Number(outstandingPayables.toFixed(2)),
      overduePayables: Number(overduePayables.toFixed(2)),
      currency: 'USD',
    };
  }

  /**
   * Tool: get_overdue_invoices
   * Lists overdue invoices with aging brackets (0-30, 31-60, 61-90, 90+)
   */
  async getOverdueInvoices(tenantId: string) {
    const now = new Date();
    const invoices = await this.prisma.invoice.findMany({
      where: {
        tenantId,
        status: { notIn: ['PAID', 'VOID', 'CANCELLED'] },
        dueDate: { lt: now },
      },
      orderBy: { dueDate: 'asc' },
    });

    return invoices.map((inv) => {
      const daysOverdue = Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 86400));
      let bracket = '0-30 days';
      if (daysOverdue > 90) bracket = '90+ days';
      else if (daysOverdue > 60) bracket = '61-90 days';
      else if (daysOverdue > 30) bracket = '31-60 days';

      return {
        id: inv.id,
        invoiceNum: inv.invoiceNum,
        customerName: inv.customerName || 'Direct Customer',
        customerEmail: inv.customerEmail,
        totalAmount: inv.amount,
        balanceDue: Number((inv.amount - inv.paidAmount).toFixed(2)),
        dueDate: inv.dueDate,
        daysOverdue,
        agingBracket: bracket,
      };
    });
  }

  /**
   * Tool: get_cash_forecast
   * Produces actual + expected cash position for next 30 days
   */
  async getCashForecast(tenantId: string) {
    const bankAccounts = await this.prisma.bankAccount.findMany({
      where: { tenantId, status: 'ACTIVE' },
    });
    const currentCash = bankAccounts.reduce((sum, b) => sum + Number(b.balance || 0), 0);

    const now = new Date();
    const next30 = new Date(Date.now() + 30 * 86400000);

    // Expected AR collections in next 30 days
    const pendingInvoices = await this.prisma.invoice.findMany({
      where: {
        tenantId,
        status: { notIn: ['PAID', 'VOID'] },
        dueDate: { lte: next30 },
      },
    });
    const expectedReceivables = pendingInvoices.reduce(
      (sum, i) => sum + Math.max(0, i.amount - i.paidAmount),
      0
    );

    // Expected AP disbursements in next 30 days
    const pendingBills = await this.prisma.bill.findMany({
      where: {
        tenantId,
        status: { notIn: ['PAID', 'VOID', 'REJECTED'] },
        dueDate: { lte: next30 },
      },
    });
    const expectedPayables = pendingBills.reduce(
      (sum, b) => sum + Math.max(0, b.total - b.paidAmount),
      0
    );

    const forecastCash = currentCash + expectedReceivables - expectedPayables;

    return {
      asOf: now.toISOString(),
      forecastHorizonDays: 30,
      actual: {
        currentCashPosition: Number(currentCash.toFixed(2)),
      },
      expected: {
        receivablesNext30Days: Number(expectedReceivables.toFixed(2)),
        payablesNext30Days: Number(expectedPayables.toFixed(2)),
      },
      predicted: {
        netCashFlow: Number((expectedReceivables - expectedPayables).toFixed(2)),
        projectedEndingCash: Number(forecastCash.toFixed(2)),
      },
    };
  }

  /**
   * Tool: detect_anomalies
   * Identifies duplicate bills, unusual amounts, and reconciliation gaps
   */
  async detectAnomalies(tenantId: string) {
    const anomalies: any[] = [];

    // 1. Duplicate Bills Check: same vendor and total amount within last 30 days
    const bills = await this.prisma.bill.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const seen = new Map<string, any>();
    for (const b of bills) {
      const key = `${b.vendorName.toLowerCase()}__${b.total}`;
      if (seen.has(key)) {
        const prior = seen.get(key);
        anomalies.push({
          type: 'POSSIBLE_DUPLICATE_BILL',
          severity: 'HIGH',
          evidence: `Bill ${b.billNumber} ($${b.total}) from '${b.vendorName}' matches previous Bill ${prior.billNumber} ($${prior.total})`,
          entities: [b.id, prior.id],
          recommendedAction: 'Verify vendor PO and invoice number before scheduling outbound disbursement',
        });
      } else {
        seen.set(key, b);
      }
    }

    // 2. Unreconciled transactions older than 14 days
    const twoWeeksAgo = new Date(Date.now() - 14 * 86400000);
    const staleUnmatched = await this.prisma.bankTransaction.findMany({
      where: {
        tenantId,
        status: 'UNMATCHED',
        date: { lt: twoWeeksAgo },
      },
      take: 10,
    });

    if (staleUnmatched.length > 0) {
      anomalies.push({
        type: 'STALE_UNMATCHED_BANK_FEED',
        severity: 'MEDIUM',
        evidence: `${staleUnmatched.length} bank feed transactions older than 14 days remain unreconciled`,
        recommendedAction: 'Execute bank reconciliation match review to maintain books integrity',
      });
    }

    return {
      asOf: new Date().toISOString(),
      totalAnomaliesDetected: anomalies.length,
      anomalies,
    };
  }

  /**
   * Tool: prepare_collection_followup
   * Prepares empathetic, professional collection notice for an overdue invoice (Low risk preparation)
   */
  async prepareCollectionFollowup(tenantId: string, invoiceId: string) {
    const inv = await this.prisma.invoice.findFirst({ where: { id: invoiceId, tenantId } });
    if (!inv) throw new NotFoundException('Invoice not found');

    const balance = Number((inv.amount - inv.paidAmount).toFixed(2));
    const now = new Date();
    const daysOverdue = Math.max(0, Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 86400)));

    return {
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNum,
      recipient: inv.customerName || 'Valued Partner',
      recipientEmail: inv.customerEmail || 'billing@customer.com',
      balanceDue: balance,
      daysOverdue,
      preparedSubject: `Follow-up regarding Invoice ${inv.invoiceNum} - $${balance}`,
      preparedBody: `Dear ${inv.customerName || 'Valued Partner'},\n\nWe hope this message finds you well. Our records show that Invoice ${inv.invoiceNum} for $${balance} was due on ${new Date(inv.dueDate).toLocaleDateString()}.\n\nIf you have already initiated payment, please disregard this notice. Otherwise, please let us know if you need another copy of the invoice or assistance with payment options.\n\nThank you for your partnership,\nFinance Operations Team`,
      riskLevel: 'LOW',
      requiresHumanApproval: false,
    };
  }
}
