/**
 * Enterprise Document Intelligence Engine — Canonical Types & Schema
 * Specification compliant with Section 21 & enterprise requirements.
 */

export type DocumentType =
  | 'invoice'
  | 'receipt'
  | 'payment_receipt'
  | 'purchase_order'
  | 'quotation'
  | 'estimate'
  | 'bill'
  | 'contract'
  | 'agreement'
  | 'bank_statement'
  | 'expense_receipt'
  | 'shipping_manifest'
  | 'order_confirmation'
  | 'employee_document'
  | 'resume'
  | 'property_document'
  | 'generic_business'
  | 'unknown';

export type EntityType =
  | 'PERSON'
  | 'COMPANY'
  | 'ORGANIZATION'
  | 'VENDOR'
  | 'CUSTOMER'
  | 'EMPLOYEE'
  | 'CONTACT'
  | 'UNKNOWN';

export type EntityRole =
  | 'issuer'
  | 'customer'
  | 'vendor'
  | 'recipient'
  | 'contact'
  | 'employee'
  | 'authorized_representative'
  | 'signatory'
  | 'unknown';

export interface ExtractedEntity {
  id: string;
  name: string;
  type: EntityType;
  role: EntityRole;
  confidence: number;
  taxId?: string;
  registrationNumber?: string;
  email?: string;
  phone?: string;
  website?: string;
  sourcePage?: number;
  aliases?: string[];
}

export type DateType =
  | 'invoice_date'
  | 'issue_date'
  | 'due_date'
  | 'payment_date'
  | 'service_date'
  | 'delivery_date'
  | 'start_date'
  | 'end_date'
  | 'closing_date'
  | 'contract_date'
  | 'unknown';

export interface ExtractedDate {
  type: DateType;
  value: string; // Normalized ISO YYYY-MM-DD
  rawValue: string; // Original verbatim string
  isAmbiguous: boolean; // Flagged when e.g. 10/08/2026 can be MM/DD or DD/MM
  confidence: number;
  sourcePage?: number;
}

export type AddressType =
  | 'billing'
  | 'shipping'
  | 'service'
  | 'registered'
  | 'office'
  | 'property'
  | 'vendor'
  | 'customer'
  | 'unknown';

export interface ExtractedAddress {
  id: string;
  type: AddressType;
  text: string;
  rawText?: string;
  confidence: number;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  sourcePage?: number;
}

export type PaymentStatus =
  | 'PAID'
  | 'PARTIALLY_PAID'
  | 'UNPAID'
  | 'OVERDUE'
  | 'DUE'
  | 'CREDIT'
  | 'REFUNDED'
  | 'VOID'
  | 'UNKNOWN';

export interface ExtractedPaymentRecord {
  id: string;
  amount: number;
  currency?: string;
  date?: string; // ISO format
  reference?: string;
  method?: string; // Credit Card, ACH, Wire, Cash, Cheque, etc.
  confidence: number;
  sourcePage?: number;
}

export interface ExtractedLineItem {
  id: string;
  description: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
  total: number;
  isConsistent: boolean; // quantity * unitPrice ≈ total
  confidence: number;
  sourcePage?: number;
}

export interface FinancialData {
  currency: string;
  currencySymbol: string;
  subtotal: number | null;
  tax: number | null;
  taxRate?: number;
  discount: number | null;
  discountType?: 'amount' | 'percentage';
  shipping: number | null;
  fees: number | null;
  total: number | null;
  amountPaid: number | null;
  balanceDue: number | null;
  paymentStatus: PaymentStatus;
  paymentTerms?: string;
  paymentInstructions?: string;
  payeeName?: string;
  bankDetails?: string;
}

export interface FinancialValidationIssue {
  code: string;
  message: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  expected?: number | string;
  actual?: number | string;
  difference?: number;
}

export interface FinancialValidation {
  isConsistent: boolean;
  subtotal: number | null;
  tax: number | null;
  discount: number | null;
  shipping: number | null;
  fees: number | null;
  total: number | null;
  paidAmount: number | null;
  balanceDue: number | null;
  calculatedTotal: number | null;
  calculatedBalance: number | null;
  issues: FinancialValidationIssue[];
}

export interface DocumentIdentifier {
  type: 'invoice_number' | 'po_number' | 'order_number' | 'tax_id' | 'account_number' | 'reference_number';
  value: string;
  confidence: number;
  sourcePage?: number;
}

export interface EntityRelationship {
  sourceEntityId: string;
  targetEntityId: string;
  relationship: 'EMPLOYED_BY' | 'SUBSIDIARY_OF' | 'CONTACT_FOR' | 'BILLED_BY' | 'REPRESENTATIVE_OF';
  confidence: number;
}

export interface ProvenanceSource {
  field: string;
  value: any;
  rawTextSnippet?: string;
  pageNumber: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
  ocrConfidence: number;
  semanticConfidence: number;
  validationCheck: 'PASS' | 'FAIL' | 'SKIPPED' | 'MANUAL';
  reasoning: string;
}

export type ReviewReason =
  | 'PAYMENT_STATUS_AMBIGUOUS'
  | 'BALANCE_MISMATCH'
  | 'MATH_INCONSISTENT'
  | 'LOW_CONFIDENCE_CRITICAL_FIELD'
  | 'AMBIGUOUS_DATE'
  | 'UNKNOWN_DOCUMENT_TYPE'
  | 'MULTIPLE_COMPANIES_UNRESOLVED'
  | 'OVERPAYMENT_DETECTED'
  | 'MISSING_MANDATORY_IDENTIFIER';

export interface HumanCorrection {
  documentId: string;
  field: string;
  originalValue: any;
  correctedValue: any;
  correctedBy: string;
  timestamp: string;
  notes?: string;
}

/**
 * CANONICAL EXTRACTION SCHEMA (Section 21)
 */
export interface CanonicalDocumentExtraction {
  document: {
    id: string;
    type: DocumentType;
    confidence: number;
    fingerprint: string; // SHA-256 hash for idempotency
    fileName: string;
    mimeType: string;
    size: number;
    pageCount: number;
  };

  entities: ExtractedEntity[];

  dates: ExtractedDate[];

  addresses: ExtractedAddress[];

  identifiers: DocumentIdentifier[];

  financial: FinancialData;

  payments: ExtractedPaymentRecord[];

  lineItems: ExtractedLineItem[];

  relationships: EntityRelationship[];

  validation: FinancialValidation;

  confidence: {
    overall: number;
    documentType: number;
    financial: number;
    entities: number;
    dates: number;
    addresses: number;
    lineItems: number;
    fieldScores: Record<string, number>;
  };

  requiresReview: boolean;
  reviewReasons: ReviewReason[];
  flaggedFields: string[];

  provenance: Record<string, ProvenanceSource>;

  rawText: string;

  processing: {
    ocrEngine: string;
    model: string;
    processedAt: string;
    processingVersion: string;
    durationMs: number;
    provider: string;
    isFallback: boolean;
  };
}

export interface ProvenanceRecord {
  field: string;
  extractedValue?: any;
  value?: any;
  sourceText?: string;
  rawTextSnippet?: string;
  pageNumber: number;
  boundingBox?: number[] | { x: number; y: number; width: number; height: number };
  ocrConfidence: number;
  semanticConfidence: number;
  validationStatus?: 'PASS' | 'FAIL' | 'SKIPPED' | 'MANUAL';
  validationCheck?: 'PASS' | 'FAIL' | 'SKIPPED' | 'MANUAL';
  ruleApplied?: string;
  reasoning?: string;
}

export type CanonicalDocument = CanonicalDocumentExtraction;

