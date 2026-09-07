import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

export interface ExtractedDocumentResult {
  processingStatus: 'COMPLETED' | 'PARTIAL' | 'REVIEW_REQUIRED' | 'FAILED';
  errorCode?: string;
  message?: string;
  documentType?: string;
  documentTypeConfidence?: number;
  entities?: Array<{ type: string; name: string; role: string; confidence?: number }>;
  dates?: Array<{ type: string; value: string; rawValue: string; ambiguous?: boolean }>;
  addresses?: Array<{ type: string; text: string; confidence?: number }>;
  financial?: {
    currency?: string;
    subtotal?: number;
    tax?: number;
    discount?: number;
    total?: number;
    amountPaid?: number;
    balanceDue?: number;
    paymentStatus: string;
  };
  payments?: Array<{ amount: number; date?: string; reference?: string; method?: string }>;
  lineItems?: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
  validation?: { isConsistent: boolean; issues: string[] };
  confidence?: Record<string, number>;
  requiresReview?: boolean;
  reviewReasons?: string[];
  schema?: {
    name: string;
    apiName: string;
    description: string;
    fields: Array<{ name: string; apiName: string; fieldType: string }>;
  };
  data?: Record<string, any>;
}

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  private openai: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    if (apiKey) {
      const baseURL = process.env.OPENROUTER_API_KEY ? 'https://openrouter.ai/api/v1' : undefined;
      const defaultHeaders = process.env.OPENROUTER_API_KEY
        ? { 'HTTP-Referer': 'http://localhost:4000', 'X-Title': 'Business OS Document Intelligence' }
        : undefined;

      this.openai = new OpenAI({
        apiKey,
        baseURL,
        defaultHeaders,
      });
    } else {
      this.logger.warn('No OPENROUTER_API_KEY or OPENAI_API_KEY found. AI vision extraction requires active API key.');
    }
  }

  /**
   * Processes a document (image base64 or URL) and returns enterprise document intelligence extraction.
   * Never returns fake mock data. Fails with structured error if unconfigured.
   */
  async parseInvoiceAndInferSchema(imageUrlOrBase64: string): Promise<ExtractedDocumentResult> {
    this.logger.log('Processing document for Enterprise Document Intelligence extraction...');

    if (!this.openai) {
      this.logger.error('Document extraction failed: Vision AI provider not configured with API key.');
      return {
        processingStatus: 'FAILED',
        errorCode: 'PROVIDER_NOT_CONFIGURED',
        message: 'No active AI Vision API key configured (OPENROUTER_API_KEY or OPENAI_API_KEY required).',
        requiresReview: true,
        reviewReasons: ['AI_PROVIDER_UNAVAILABLE'],
      };
    }

    try {
      const model = process.env.OPENROUTER_API_KEY ? 'google/gemini-2.5-flash' : 'gpt-4o';
      const prompt = `You are an Enterprise Document Intelligence Engine.
Analyze the provided document image and extract structured data conforming strictly to the Enterprise Document Schema.

Analyze:
1. Document classification (invoice, receipt, payment receipt, purchase order, quotation, estimate, bill, contract, expense receipt, shipping document, employee document, resume, generic business document, unknown).
2. Entities: Disambiguate PERSON vs COMPANY vs ORGANIZATION vs VENDOR vs CUSTOMER.
3. Addresses: Categorize billing, shipping, service, registered.
4. Dates: Normalize to ISO YYYY-MM-DD format (invoice_date, due_date, payment_date). Mark ambiguous if format is uncertain.
5. Financial amounts: currency, subtotal, tax, discount, total, amountPaid, balanceDue.
6. Payment Status: PAID, PARTIALLY_PAID, UNPAID, OVERDUE, DUE, CREDIT, REFUNDED, VOID, UNKNOWN based on evidence (total vs paid vs due vs dates).
7. Individual payments if multiple payments exist.
8. Line items with quantity, unitPrice, line total.
9. Mathematical validation (subtotal + tax - discount == total, total - amountPaid == balanceDue).

Return ONLY valid JSON matching this structure:
{
  "document": {
    "type": "invoice",
    "confidence": 0.97
  },
  "entities": [
    { "type": "COMPANY", "name": "...", "role": "issuer", "confidence": 0.95 }
  ],
  "dates": [
    { "type": "invoice_date", "value": "YYYY-MM-DD", "rawValue": "...", "ambiguous": false }
  ],
  "addresses": [
    { "type": "billing", "text": "...", "confidence": 0.9 }
  ],
  "identifiers": [
    { "type": "invoice_number", "value": "..." }
  ],
  "financial": {
    "currency": "USD",
    "subtotal": 0,
    "tax": 0,
    "discount": 0,
    "total": 0,
    "amountPaid": 0,
    "balanceDue": 0,
    "paymentStatus": "UNPAID"
  },
  "payments": [],
  "lineItems": [
    { "description": "...", "quantity": 1, "unitPrice": 0, "total": 0 }
  ],
  "validation": {
    "isConsistent": true,
    "issues": []
  },
  "confidence": {
    "overall": 0.95
  },
  "requiresReview": false,
  "reviewReasons": []
}`;

      const response = await this.openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: prompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extract enterprise document intelligence and return strict JSON.' },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrlOrBase64,
                },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
      });

      const resultText = response.choices[0]?.message?.content;
      if (!resultText) {
        throw new Error('Empty response from AI vision model');
      }

      const parsed = JSON.parse(resultText);

      // Build backward-compatible schema and data view for legacy consumers
      const legacyFields = [
        { name: 'Document Type', apiName: 'document_type', fieldType: 'TEXT' },
        { name: 'Invoice Number', apiName: 'invoice_number', fieldType: 'TEXT' },
        { name: 'Vendor / Issuer', apiName: 'vendor_name', fieldType: 'TEXT' },
        { name: 'Customer / Client', apiName: 'customer_name', fieldType: 'TEXT' },
        { name: 'Date', apiName: 'issue_date', fieldType: 'DATE' },
        { name: 'Due Date', apiName: 'due_date', fieldType: 'DATE' },
        { name: 'Total Amount', apiName: 'total_amount', fieldType: 'NUMBER' },
        { name: 'Amount Paid', apiName: 'amount_paid', fieldType: 'NUMBER' },
        { name: 'Balance Due', apiName: 'balance_due', fieldType: 'NUMBER' },
        { name: 'Payment Status', apiName: 'payment_status', fieldType: 'TEXT' },
      ];

      const invNum = parsed.identifiers?.find((id: any) => id.type === 'invoice_number')?.value || '';
      const vendorEntity = parsed.entities?.find((e: any) => e.role === 'issuer' || e.role === 'vendor');
      const customerEntity = parsed.entities?.find((e: any) => e.role === 'customer' || e.role === 'client');
      const issueDate = parsed.dates?.find((d: any) => d.type === 'invoice_date' || d.type === 'issue_date')?.value || '';
      const dueDate = parsed.dates?.find((d: any) => d.type === 'due_date')?.value || '';

      return {
        processingStatus: parsed.requiresReview ? 'REVIEW_REQUIRED' : 'COMPLETED',
        documentType: parsed.document?.type || 'generic_business_document',
        documentTypeConfidence: parsed.document?.confidence || 0.85,
        entities: parsed.entities || [],
        dates: parsed.dates || [],
        addresses: parsed.addresses || [],
        financial: parsed.financial || { paymentStatus: 'UNKNOWN' },
        payments: parsed.payments || [],
        lineItems: parsed.lineItems || [],
        validation: parsed.validation || { isConsistent: true, issues: [] },
        confidence: parsed.confidence || {},
        requiresReview: Boolean(parsed.requiresReview),
        reviewReasons: parsed.reviewReasons || [],
        schema: {
          name: `${(parsed.document?.type || 'Document').toUpperCase()} Record`,
          apiName: `${parsed.document?.type || 'document'}_record`,
          description: 'Inferred schema from Enterprise Document Intelligence extraction',
          fields: legacyFields,
        },
        data: {
          invoice_number: invNum,
          vendor_name: vendorEntity?.name || '',
          customer_name: customerEntity?.name || '',
          issue_date: issueDate,
          due_date: dueDate,
          total_amount: parsed.financial?.total || 0,
          amount_paid: parsed.financial?.amountPaid || 0,
          balance_due: parsed.financial?.balanceDue || 0,
          payment_status: parsed.financial?.paymentStatus || 'UNKNOWN',
        },
      };
    } catch (error: any) {
      this.logger.error('Error parsing document in Document Intelligence Service', error);
      return {
        processingStatus: 'FAILED',
        errorCode: 'EXTRACTION_PROCESSING_ERROR',
        message: error?.message || 'Failed to extract structured data from document.',
        requiresReview: true,
        reviewReasons: ['EXTRACTION_PIPELINE_ERROR'],
      };
    }
  }
}

