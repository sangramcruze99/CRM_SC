/**
 * Document Type Classification Engine
 * Classifies documents across 17+ enterprise document types using structural,
 * lexical, and layout cues with calibrated confidence scoring.
 */

import { DocumentType } from './types';

interface TypeRule {
  type: DocumentType;
  strongKeywords: string[];
  supportingKeywords: string[];
  negativeKeywords: string[];
  baseConfidence: number;
}

const CLASSIFICATION_RULES: TypeRule[] = [
  {
    type: 'invoice',
    strongKeywords: ['tax invoice', 'commercial invoice', 'invoice number', 'inv #', 'bill to', 'amount due', 'due date', 'invoice'],
    supportingKeywords: ['subtotal', 'line item', 'remit to', 'net 30', 'net 15', 'vat reg', 'gstin'],
    negativeKeywords: ['resume', 'curriculum vitae', 'employment contract', 'non-disclosure agreement', 'purchase order'],
    baseConfidence: 0.95,
  },
  {
    type: 'purchase_order',
    strongKeywords: ['purchase order', 'po number', 'p.o. #', 'vendor quote ref', 'purchase order date', 'order ack'],
    supportingKeywords: ['ship to', 'requisition', 'buyer', 'order total', 'procurement', 'terms & conditions'],
    negativeKeywords: ['tax invoice', 'receipt', 'resume'],
    baseConfidence: 0.93,
  },
  {
    type: 'receipt',
    strongKeywords: ['sales receipt', 'store receipt', 'cash receipt', 'receipt #', 'register #', 'cashier'],
    supportingKeywords: ['change due', 'cash tendered', 'card ending', 'auth code', 'subtotal', 'thank you for your business'],
    negativeKeywords: ['invoice number', 'due date', 'net 30', 'bill to'],
    baseConfidence: 0.92,
  },
  {
    type: 'payment_receipt',
    strongKeywords: ['payment receipt', 'acknowledgment of payment', 'payment confirmation', 'received with thanks', 'settlement receipt'],
    supportingKeywords: ['payment method', 'transaction reference', 'cleared funds', 'balance 0.00', 'paid in full'],
    negativeKeywords: ['amount due', 'pay by', 'unpaid'],
    baseConfidence: 0.94,
  },
  {
    type: 'quotation',
    strongKeywords: ['quotation', 'price quote', 'quote number', 'quote ref', 'formal quote', 'valid until'],
    supportingKeywords: ['scope of work', 'proposal', 'pricing breakdown', 'acceptance of quote', 'validity period'],
    negativeKeywords: ['invoice #', 'amount paid', 'settled'],
    baseConfidence: 0.91,
  },
  {
    type: 'estimate',
    strongKeywords: ['cost estimate', 'estimate #', 'project estimate', 'estimated total', 'job estimate'],
    supportingKeywords: ['estimated hours', 'labor rate', 'parts & labor', 'subject to revision', 'contingency'],
    negativeKeywords: ['tax invoice', 'paid receipt'],
    baseConfidence: 0.90,
  },
  {
    type: 'bill',
    strongKeywords: ['utility bill', 'electric bill', 'telecom bill', 'billing statement', 'account statement', 'statement of account'],
    supportingKeywords: ['meter reading', 'previous balance', 'current charges', 'due by', 'disconnect date'],
    negativeKeywords: ['resume', 'bill of lading'],
    baseConfidence: 0.89,
  },
  {
    type: 'contract',
    strongKeywords: ['master services agreement', 'service contract', 'independent contractor agreement', 'terms of agreement', 'in witness whereof'],
    supportingKeywords: ['parties', 'governing law', 'indemnification', 'confidentiality', 'signatures', 'effective date'],
    negativeKeywords: ['tax invoice', 'receipt', 'resume'],
    baseConfidence: 0.93,
  },
  {
    type: 'agreement',
    strongKeywords: ['non-disclosure agreement', 'nda', 'confidentiality agreement', 'memorandum of understanding', 'mou'],
    supportingKeywords: ['disclosing party', 'receiving party', 'confidential information', 'obligations', 'term of agreement'],
    negativeKeywords: ['tax invoice', 'receipt #'],
    baseConfidence: 0.94,
  },
  {
    type: 'bank_statement',
    strongKeywords: ['bank statement', 'account statement', 'opening balance', 'closing balance', 'statement period', 'iban', 'swift code'],
    supportingKeywords: ['withdrawals', 'deposits', 'cleared balance', 'transaction history', 'account number'],
    negativeKeywords: ['invoice #', 'resume', 'curriculum vitae'],
    baseConfidence: 0.95,
  },
  {
    type: 'expense_receipt',
    strongKeywords: ['expense report', 'meal expense', 'travel expense', 'taxi receipt', 'hotel bill', 'lodging receipt'],
    supportingKeywords: ['room rate', 'per diem', 'gratuity', 'tip', 'expense category', 'card last 4'],
    negativeKeywords: ['due date', 'net 60'],
    baseConfidence: 0.90,
  },
  {
    type: 'shipping_manifest',
    strongKeywords: ['bill of lading', 'shipping manifest', 'waybill', 'air waybill', 'awb #', 'packing list', 'consignor', 'consignee'],
    supportingKeywords: ['gross weight', 'net weight', 'tracking number', 'container #', 'vessel', 'port of entry'],
    negativeKeywords: ['payment terms', 'invoice date'],
    baseConfidence: 0.94,
  },
  {
    type: 'order_confirmation',
    strongKeywords: ['order confirmation', 'order acknowledged', 'thank you for your order', 'order summary', 'order #'],
    supportingKeywords: ['estimated delivery', 'shipping method', 'items ordered', 'billing info'],
    negativeKeywords: ['tax invoice', 'overdue'],
    baseConfidence: 0.90,
  },
  {
    type: 'resume',
    strongKeywords: ['curriculum vitae', 'resume', 'work experience', 'education', 'skills & competencies', 'employment history'],
    supportingKeywords: ['bachelor of', 'master of', 'references available', 'certifications', 'github.com', 'linkedin.com'],
    negativeKeywords: ['total due', 'invoice #', 'tax id', 'remit payment'],
    baseConfidence: 0.98,
  },
  {
    type: 'employee_document',
    strongKeywords: ['employment offer letter', 'appointment letter', 'employee handbook', 'nda for employees', 'compensation package'],
    supportingKeywords: ['annual salary', 'reporting manager', 'start date', 'probationary period', 'benefits package'],
    negativeKeywords: ['invoice #', 'due date'],
    baseConfidence: 0.92,
  },
  {
    type: 'property_document',
    strongKeywords: ['lease agreement', 'residential tenancy agreement', 'commercial lease', 'deed of trust', 'real estate sales contract'],
    supportingKeywords: ['premises', 'landlord', 'tenant', 'security deposit', 'monthly rent', 'demised premises', 'parcel id'],
    negativeKeywords: ['invoice number', 'resume'],
    baseConfidence: 0.94,
  },
  {
    type: 'generic_business',
    strongKeywords: ['memorandum', 'business plan', 'meeting minutes', 'project proposal', 'board resolution'],
    supportingKeywords: ['agenda', 'attendees', 'action items', 'summary', 'confidential'],
    negativeKeywords: [],
    baseConfidence: 0.70,
  },
];

export interface ClassificationResult {
  documentType: DocumentType;
  documentTypeConfidence: number;
  detectedCategories: { type: DocumentType; score: number }[];
}

/**
 * Classifies raw document text into canonical document type.
 */
export function classifyDocument(rawText: string, fileName?: string): ClassificationResult {
  if (!rawText || rawText.trim().length < 10) {
    return {
      documentType: 'unknown',
      documentTypeConfidence: 0.1,
      detectedCategories: [],
    };
  }

  const normalizedText = (rawText + ' ' + (fileName || '')).toLowerCase();
  const scoredCategories: { type: DocumentType; score: number }[] = [];

  for (const rule of CLASSIFICATION_RULES) {
    let score = 0;

    // Check strong keywords (+0.60 each)
    for (const kw of rule.strongKeywords) {
      if (normalizedText.includes(kw)) {
        score += 0.60;
      }
    }

    // Check supporting keywords (+0.20 each)
    for (const kw of rule.supportingKeywords) {
      if (normalizedText.includes(kw)) {
        score += 0.20;
      }
    }

    // Penalize negative keywords (-0.45 each)
    for (const kw of rule.negativeKeywords) {
      if (normalizedText.includes(kw)) {
        score -= 0.45;
      }
    }

    if (score > 0.25) {
      const confidence = Math.min(0.99, Number((rule.baseConfidence * Math.min(1.0, score)).toFixed(2)));
      scoredCategories.push({
        type: rule.type,
        score: confidence,
      });
    }
  }

  scoredCategories.sort((a, b) => b.score - a.score);

  const topMatch = scoredCategories[0];

  // Threshold: If top match is below 0.50 confidence, classify as 'unknown'
  if (!topMatch || topMatch.score < 0.50) {
    return {
      documentType: 'unknown',
      documentTypeConfidence: topMatch ? topMatch.score : 0.3,
      detectedCategories: scoredCategories,
    };
  }

  return {
    documentType: topMatch.type,
    documentTypeConfidence: topMatch.score,
    detectedCategories: scoredCategories,
  };
}
