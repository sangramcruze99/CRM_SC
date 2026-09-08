/**
 * Financial Reconciliation & Multi-Payment Aggregator
 * Mathematically validates invoice balance, sums multiple payments, and validates line items.
 */

import { FinancialData, FinancialValidation, FinancialValidationIssue, ExtractedPaymentRecord, ExtractedLineItem } from './types';

const ROUNDING_TOLERANCE = 0.05;

export function reconcileFinancials(
  data: Partial<FinancialData>,
  payments: ExtractedPaymentRecord[] = [],
  lineItems: ExtractedLineItem[] = []
): {
  normalizedFinancial: FinancialData;
  validation: FinancialValidation;
  aggregatedPayments: ExtractedPaymentRecord[];
} {
  const issues: FinancialValidationIssue[] = [];

  const subtotal = data.subtotal !== undefined && data.subtotal !== null ? Number(data.subtotal) : null;
  const tax = data.tax !== undefined && data.tax !== null ? Number(data.tax) : 0;
  const discount = data.discount !== undefined && data.discount !== null ? Number(data.discount) : 0;
  const shipping = data.shipping !== undefined && data.shipping !== null ? Number(data.shipping) : 0;
  const fees = data.fees !== undefined && data.fees !== null ? Number(data.fees) : 0;
  const declaredTotal = data.total !== undefined && data.total !== null ? Number(data.total) : null;

  // 1. Calculate Expected Total from Subtotal, Tax, Shipping, Fees, Discount
  let calculatedTotal: number | null = null;
  if (subtotal !== null) {
    calculatedTotal = Number((subtotal + tax + shipping + fees - discount).toFixed(2));

    if (declaredTotal !== null) {
      const diff = Math.abs(declaredTotal - calculatedTotal);
      if (diff > ROUNDING_TOLERANCE) {
        issues.push({
          code: 'TOTAL_MATH_MISMATCH',
          message: `Calculated total (${calculatedTotal}) does not match declared total (${declaredTotal}). Difference: $${diff.toFixed(2)}`,
          severity: 'CRITICAL',
          expected: calculatedTotal,
          actual: declaredTotal,
          difference: diff,
        });
      }
    }
  }

  // Final effective total
  const effectiveTotal = declaredTotal !== null ? declaredTotal : calculatedTotal;

  // 2. Aggregate Payments (Section 11)
  let totalPaymentsPaid = 0;
  for (const p of payments) {
    totalPaymentsPaid += Number(p.amount) || 0;
  }
  totalPaymentsPaid = Number(totalPaymentsPaid.toFixed(2));

  // Determine amountPaid: either from payments array or declared amountPaid
  const declaredPaid = data.amountPaid !== undefined && data.amountPaid !== null ? Number(data.amountPaid) : null;
  const effectivePaid = payments.length > 0 ? totalPaymentsPaid : (declaredPaid !== null ? declaredPaid : 0);

  // 3. Reconcile Balance Due: Total - Paid
  let calculatedBalance: number | null = null;
  if (effectiveTotal !== null) {
    calculatedBalance = Number((effectiveTotal - effectivePaid).toFixed(2));
  }

  const declaredBalance = data.balanceDue !== undefined && data.balanceDue !== null ? Number(data.balanceDue) : null;
  const declaredDeposit = data.depositDue !== undefined && data.depositDue !== null ? Number(data.depositDue) : null;

  let effectiveBalance = calculatedBalance;
  if (declaredBalance !== null && calculatedBalance !== null) {
    const diff = Math.abs(declaredBalance - calculatedBalance);
    // If the declared balance matches a deposit requirement (e.g. Deposit Due $169.95 on a $1699.48 invoice with 0 paid)
    const isDeposit =
      (declaredDeposit !== null && Math.abs(declaredBalance - declaredDeposit) <= ROUNDING_TOLERANCE) ||
      (effectivePaid === 0 && declaredBalance < calculatedBalance && declaredBalance > 0 && Math.abs(declaredBalance - calculatedBalance * 0.1) <= 1.0);

    if (isDeposit && effectivePaid === 0) {
      // Retain declaredBalance as depositDue, use calculatedBalance as the true remaining invoice balance
      effectiveBalance = calculatedBalance;
      if (!data.depositDue) {
        data.depositDue = declaredBalance;
      }
    } else if (diff > ROUNDING_TOLERANCE) {
      issues.push({
        code: 'BALANCE_DUE_MISMATCH',
        message: `Declared balance due (${declaredBalance}) does not match total minus paid (${calculatedBalance}). Difference: $${diff.toFixed(2)}`,
        severity: 'CRITICAL',
        expected: calculatedBalance,
        actual: declaredBalance,
        difference: diff,
      });
      effectiveBalance = declaredBalance;
    } else {
      effectiveBalance = declaredBalance;
    }
  }

  // 4. Overpayment / Credit Detection
  if (effectiveTotal !== null && effectivePaid > effectiveTotal + ROUNDING_TOLERANCE) {
    issues.push({
      code: 'OVERPAYMENT_DETECTED',
      message: `Paid amount (${effectivePaid}) exceeds total invoice amount (${effectiveTotal}). Possible credit or adjustment.`,
      severity: 'WARNING',
      expected: effectiveTotal,
      actual: effectivePaid,
      difference: effectivePaid - effectiveTotal,
    });
  }

  // 5. Line Item Validation
  let lineItemsTotal = 0;
  for (const item of lineItems) {
    const expectedLineTotal = Number((item.quantity * item.unitPrice).toFixed(2));
    const lineDiff = Math.abs(item.total - expectedLineTotal);
    if (lineDiff > ROUNDING_TOLERANCE) {
      item.isConsistent = false;
      issues.push({
        code: 'LINE_ITEM_MATH_MISMATCH',
        message: `Line item "${item.description}" total (${item.total}) doesn't equal qty (${item.quantity}) × price (${item.unitPrice}) = ${expectedLineTotal}`,
        severity: 'WARNING',
        expected: expectedLineTotal,
        actual: item.total,
        difference: lineDiff,
      });
    } else {
      item.isConsistent = true;
    }
    lineItemsTotal += item.total;
  }

  // If subtotal is present, check line items sum vs subtotal
  if (lineItems.length > 0 && subtotal !== null) {
    const lineSubtotalDiff = Math.abs(lineItemsTotal - subtotal);
    if (lineSubtotalDiff > ROUNDING_TOLERANCE) {
      issues.push({
        code: 'LINE_ITEMS_SUBTOTAL_MISMATCH',
        message: `Sum of line items (${lineItemsTotal.toFixed(2)}) does not match subtotal (${subtotal.toFixed(2)})`,
        severity: 'WARNING',
        expected: subtotal,
        actual: lineItemsTotal,
        difference: lineSubtotalDiff,
      });
    }
  }

  const isConsistent = issues.filter((i) => i.severity === 'CRITICAL').length === 0;

  const normalizedFinancial: FinancialData = {
    currency: data.currency || 'USD',
    currencySymbol: data.currencySymbol || '$',
    subtotal,
    tax,
    taxRate: data.taxRate,
    discount,
    discountType: data.discountType || 'amount',
    shipping,
    fees,
    total: effectiveTotal,
    amountPaid: effectivePaid,
    balanceDue: effectiveBalance,
    depositDue: data.depositDue || declaredDeposit || null,
    paymentStatus: data.paymentStatus || 'UNKNOWN',
    paymentTerms: data.paymentTerms,
    paymentInstructions: data.paymentInstructions,
    payeeName: data.payeeName,
    bankDetails: data.bankDetails,
  };

  const validation: FinancialValidation = {
    isConsistent,
    subtotal,
    tax,
    discount,
    shipping,
    fees,
    total: effectiveTotal,
    paidAmount: effectivePaid,
    balanceDue: normalizedFinancial.balanceDue,
    depositDue: normalizedFinancial.depositDue,
    calculatedTotal,
    calculatedBalance,
    issues,
  };

  return {
    normalizedFinancial,
    validation,
    aggregatedPayments: payments,
  };
}
