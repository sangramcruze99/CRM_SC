/**
 * Human Review Guard & Triage Engine
 * Selectively routes documents to human review only when critical discrepancies,
 * low-confidence fields, or mathematical inconsistencies occur.
 */

import {
  ReviewReason,
  FinancialValidation,
  PaymentStatus,
  DocumentType,
  ExtractedDate,
  ExtractedEntity,
} from './types';

export interface ReviewTriageInput {
  documentType: DocumentType;
  documentTypeConfidence: number;
  financialValidation: FinancialValidation;
  paymentStatus: PaymentStatus;
  entities: ExtractedEntity[];
  dates: ExtractedDate[];
  confidenceScores: Record<string, number>;
}

export function evaluateHumanReview(input: ReviewTriageInput): {
  requiresReview: boolean;
  reviewReasons: ReviewReason[];
  flaggedFields: string[];
} {
  const reasons: ReviewReason[] = [];
  const flaggedFields: string[] = [];

  // 1. Math / Financial Inconsistency
  if (!input.financialValidation.isConsistent) {
    reasons.push('MATH_INCONSISTENT');
    flaggedFields.push('financial.total', 'financial.subtotal');
  }

  // 2. Balance mismatch
  const hasBalanceMismatch = input.financialValidation.issues.some((i) => i.code === 'BALANCE_DUE_MISMATCH');
  if (hasBalanceMismatch) {
    reasons.push('BALANCE_MISMATCH');
    flaggedFields.push('financial.balanceDue', 'financial.amountPaid');
  }

  // 3. Overpayment / Credit
  const hasOverpayment = input.financialValidation.issues.some((i) => i.code === 'OVERPAYMENT_DETECTED');
  if (hasOverpayment) {
    reasons.push('OVERPAYMENT_DETECTED');
    flaggedFields.push('financial.amountPaid');
  }

  // 4. Payment status ambiguous
  if (input.paymentStatus === 'UNKNOWN') {
    reasons.push('PAYMENT_STATUS_AMBIGUOUS');
    flaggedFields.push('financial.paymentStatus');
  }

  // 5. Unknown Document Type or Low Type Confidence (< 0.60)
  if (input.documentType === 'unknown' || input.documentTypeConfidence < 0.60) {
    reasons.push('UNKNOWN_DOCUMENT_TYPE');
    flaggedFields.push('document.type');
  }

  // 6. Ambiguous Dates
  const ambiguousDates = input.dates.filter((d) => d.isAmbiguous);
  if (ambiguousDates.length > 0) {
    reasons.push('AMBIGUOUS_DATE');
    ambiguousDates.forEach((d) => flaggedFields.push(`dates.${d.type}`));
  }

  // 7. Unresolved Companies (e.g. no vendor / issuer identified)
  const hasVendorOrIssuer = input.entities.some((e) => e.role === 'vendor' || e.role === 'issuer');
  if (!hasVendorOrIssuer && input.documentType === 'invoice') {
    reasons.push('MULTIPLE_COMPANIES_UNRESOLVED');
    flaggedFields.push('entities.vendor');
  }

  // 8. Low Confidence on Critical Fields
  const criticalFields = ['invoiceNumber', 'total', 'issueDate'];
  for (const f of criticalFields) {
    if (input.confidenceScores[f] !== undefined && input.confidenceScores[f] < 0.70) {
      if (!reasons.includes('LOW_CONFIDENCE_CRITICAL_FIELD')) {
        reasons.push('LOW_CONFIDENCE_CRITICAL_FIELD');
      }
      flaggedFields.push(f);
    }
  }

  return {
    requiresReview: reasons.length > 0,
    reviewReasons: reasons,
    flaggedFields: Array.from(new Set(flaggedFields)),
  };
}
