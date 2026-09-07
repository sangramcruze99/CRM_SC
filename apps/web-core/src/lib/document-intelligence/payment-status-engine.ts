/**
 * Payment Status Engine
 * Calculates canonical payment status using multi-factor financial evidence,
 * dates, transactions, and status labels rather than a single field.
 */

import { PaymentStatus, FinancialData } from './types';

const ROUNDING_TOLERANCE = 0.05;

export interface PaymentStatusEvidence {
  financial: FinancialData;
  dueDate?: string | null; // ISO YYYY-MM-DD
  rawStatusLabels?: string[];
  currentDate?: string; // ISO YYYY-MM-DD for testing/overdue evaluation
}

export function computePaymentStatus(evidence: PaymentStatusEvidence): {
  status: PaymentStatus;
  confidence: number;
  reasons: string[];
} {
  const { financial, dueDate, rawStatusLabels = [], currentDate } = evidence;
  const reasons: string[] = [];

  const total = financial.total;
  const paid = financial.amountPaid !== null ? financial.amountPaid : 0;
  const balance = financial.balanceDue !== null ? financial.balanceDue : (total !== null ? total - paid : 0);

  const rawLabelsCombined = rawStatusLabels.join(' ').toLowerCase();

  // 1. Explicit Void or Cancelled
  if (rawLabelsCombined.includes('void') || rawLabelsCombined.includes('cancelled')) {
    reasons.push('Explicit VOID/CANCELLED marker detected in document text');
    return { status: 'VOID', confidence: 0.98, reasons };
  }

  // 2. Explicit Refund
  if (rawLabelsCombined.includes('refund') || rawLabelsCombined.includes('reversed')) {
    reasons.push('Explicit REFUND marker detected in document text');
    return { status: 'REFUNDED', confidence: 0.95, reasons };
  }

  // 3. Overpayment / Credit Investigation (Section 9 Example 5)
  if (total !== null && paid > total + ROUNDING_TOLERANCE) {
    reasons.push(`Paid amount ($${paid}) exceeds total invoice ($${total}). Classified as CREDIT / OVERPAYMENT.`);
    return { status: 'CREDIT', confidence: 0.92, reasons };
  }

  // 4. Fully Paid: Total === Paid OR Balance <= 0 (when total > 0)
  if (
    (total !== null && total > 0 && Math.abs(total - paid) <= ROUNDING_TOLERANCE) ||
    (total !== null && total > 0 && balance <= ROUNDING_TOLERANCE && paid > 0) ||
    rawLabelsCombined.includes('paid in full')
  ) {
    reasons.push(`Total ($${total}) equals amount paid ($${paid}) with $0.00 balance`);
    return { status: 'PAID', confidence: 0.98, reasons };
  }

  // 5. Partially Paid: Paid > 0 AND Balance > 0
  if (total !== null && paid > ROUNDING_TOLERANCE && balance > ROUNDING_TOLERANCE && paid < total - ROUNDING_TOLERANCE) {
    reasons.push(`Partial payment detected: $${paid} paid out of $${total} total (remaining: $${balance})`);
    return { status: 'PARTIALLY_PAID', confidence: 0.97, reasons };
  }

  // 6. Unpaid / Due / Overdue evaluation
  if (total !== null && (paid <= ROUNDING_TOLERANCE || Math.abs(balance - total) <= ROUNDING_TOLERANCE)) {
    // Check if due date has passed
    if (dueDate) {
      const nowStr = currentDate || new Date().toISOString().split('T')[0];
      if (dueDate < nowStr) {
        reasons.push(`Invoice unpaid ($${balance} due) and due date (${dueDate}) has passed (current: ${nowStr})`);
        return { status: 'OVERDUE', confidence: 0.96, reasons };
      } else {
        reasons.push(`Invoice unpaid ($${balance} due) with future due date (${dueDate})`);
        return { status: 'DUE', confidence: 0.95, reasons };
      }
    }

    if (rawLabelsCombined.includes('overdue') || rawLabelsCombined.includes('past due')) {
      reasons.push('Explicit OVERDUE / PAST DUE badge in document text');
      return { status: 'OVERDUE', confidence: 0.94, reasons };
    }

    reasons.push(`Zero payment recorded ($${paid}), full balance due ($${balance})`);
    return { status: 'UNPAID', confidence: 0.92, reasons };
  }

  // Fallback
  return { status: 'UNKNOWN', confidence: 0.40, reasons: ['Insufficient financial evidence to confirm status'] };
}
