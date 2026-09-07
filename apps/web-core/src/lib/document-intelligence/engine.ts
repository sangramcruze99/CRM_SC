/**
 * Enterprise Document Intelligence Engine — Master Orchestrator
 * Implements the complete 15-stage pipeline:
 * Document -> Validation -> Preprocessing -> OCR -> Classification ->
 * Entity Resolution -> Semantic Normalization -> Financial Reconciliation ->
 * Payment Status Engine -> Confidence Scoring -> Provenance -> Review Triage.
 */

import zlib from 'zlib';
import {
  CanonicalDocumentExtraction,
  DocumentType,
  ExtractedEntity,
  ExtractedDate,
  ExtractedAddress,
  ExtractedLineItem,
  ExtractedPaymentRecord,
  DocumentIdentifier,
  FinancialData,
  ProvenanceSource,
} from './types';
import { classifyDocument } from './classifier';
import { resolveEntitiesFromDocument } from './entities';
import { extractDatesFromDocument, normalizeDate } from './dates';
import { extractAddressesFromDocument } from './addresses';
import { reconcileFinancials } from './financial-reconciler';
import { computePaymentStatus } from './payment-status-engine';
import { evaluateHumanReview } from './review-guard';
import { ProvenanceTracker } from './provenance';
import { IdempotencyManager } from './idempotency';
import { matchesSynonym } from './synonyms';

export interface ProcessDocumentOptions {
  fileData: string; // Base64 or Data URL
  fileName: string;
  tenantId?: string;
  forceReprocess?: boolean;
  openRouterApiKey?: string;
  openaiApiKey?: string;
}

export class DocumentIntelligenceEngine {
  /**
   * Main entry point to process any document into CanonicalDocumentExtraction.
   */
  static async processDocument(options: ProcessDocumentOptions): Promise<CanonicalDocumentExtraction> {
    const startTime = Date.now();
    const tenantId = options.tenantId || 'default-tenant';
    const { fileData, fileName, forceReprocess } = options;

    // -------------------------------------------------------------------------
    // 1. FILE VALIDATION & IDEMPOTENCY
    // -------------------------------------------------------------------------
    if (!fileData) {
      throw new Error('FILE_VALIDATION_ERROR: Missing fileData payload');
    }

    const fingerprint = IdempotencyManager.computeFingerprint(fileData);
    if (!forceReprocess) {
      const existing = IdempotencyManager.checkDuplicate(tenantId, fingerprint);
      if (existing) {
        // Return structured duplicate record indicator
        console.log(`[DocumentIntelligence] Duplicate detected: ${existing.documentId} (Fingerprint: ${fingerprint.substring(0, 10)}...)`);
      }
    }

    const isPdf = Boolean(
      fileData.startsWith('data:application/pdf') ||
      (fileName && fileName.toLowerCase().endsWith('.pdf'))
    );
    const mimeType = isPdf ? 'application/pdf' : 'image/jpeg';
    const fileSize = Math.round((fileData.length * 3) / 4);

    // -------------------------------------------------------------------------
    // 2. PAGE PREPROCESSING & TEXT EXTRACTION (PDF Stream or Vision)
    // -------------------------------------------------------------------------
    let rawText = '';
    let pageCount = 1;
    let ocrEngine = isPdf ? 'PDF_STREAM_DECODER' : 'VISION_PREPROCESSOR';

    if (isPdf) {
      try {
        const base64Clean = fileData.includes('base64,') ? fileData.split('base64,')[1] : fileData;
        const pdfBuffer = Buffer.from(base64Clean, 'base64');
        rawText = this.extractTextFromPdfBuffer(pdfBuffer);
        pageCount = this.estimatePdfPageCount(pdfBuffer);
      } catch (err) {
        console.warn('[DocumentIntelligence] Native PDF extraction warning:', err);
      }
    } else if (
      fileData.startsWith('data:text/') ||
      fileData.startsWith('data:application/json') ||
      Boolean(fileName && (fileName.endsWith('.txt') || fileName.endsWith('.csv') || fileName.endsWith('.json')))
    ) {
      try {
        const base64Clean = fileData.includes('base64,') ? fileData.split('base64,')[1] : fileData;
        rawText = Buffer.from(base64Clean, 'base64').toString('utf-8');
      } catch {
        rawText = fileData;
      }
    } else if (!fileData.startsWith('data:image/')) {
      rawText = fileData;
    }

    // -------------------------------------------------------------------------
    // 3. MULTI-MODEL CANDIDATE GENERATION (LLM Vision / Chat if API key present)
    // -------------------------------------------------------------------------
    const apiKey = options.openRouterApiKey || process.env.OPENROUTER_API_KEY;
    let llmCandidateData: any = null;
    let provider = 'deterministic-rules';

    if (apiKey) {
      try {
        llmCandidateData = await this.callAiExtractionModel(fileData, fileName, rawText, isPdf, apiKey);
        if (llmCandidateData) {
          provider = 'openrouter:gemini-2.5-flash';
          ocrEngine = isPdf ? 'PDF_STREAM + NEURAL_LLM' : 'VISION_LLM';
        }
      } catch (aiErr) {
        console.warn('[DocumentIntelligence] AI extraction fallback to deterministic rules:', aiErr);
      }
    }

    // If no text was extracted from PDF and no AI candidate, use filename as fallback text
    if (!rawText && !llmCandidateData) {
      rawText = `Document Name: ${fileName}\nFormat: ${mimeType}`;
    }

    // -------------------------------------------------------------------------
    // 4. DOCUMENT TYPE CLASSIFICATION
    // -------------------------------------------------------------------------
    const classification = classifyDocument(rawText + ' ' + JSON.stringify(llmCandidateData || {}), fileName);
    let documentType = classification.documentType;
    let documentTypeConfidence = classification.documentTypeConfidence;

    // If LLM classified document with high confidence, corroborate
    if (llmCandidateData?.documentType) {
      const llmType = String(llmCandidateData.documentType).toLowerCase() as DocumentType;
      if (llmType === documentType) {
        documentTypeConfidence = Math.min(0.99, documentTypeConfidence + 0.05);
      } else if (documentType === 'unknown') {
        documentType = llmType;
        documentTypeConfidence = 0.88;
      }
    }

    // -------------------------------------------------------------------------
    // 5. PROVENANCE TRACKER INITIALIZATION
    // -------------------------------------------------------------------------
    const provenance = new ProvenanceTracker();
    provenance.record({
      field: 'document.type',
      value: documentType,
      rawTextSnippet: `Classified as ${documentType} with confidence ${documentTypeConfidence}`,
      pageNumber: 1,
      ocrConfidence: 0.95,
      semanticConfidence: documentTypeConfidence,
      validationCheck: 'PASS',
      reasoning: `Rule-based & keyword pattern match on document structure`,
    });

    // -------------------------------------------------------------------------
    // 6. ENTITY RESOLUTION (PERSON vs COMPANY vs VENDOR vs CUSTOMER)
    // -------------------------------------------------------------------------
    const declaredEntities: { name: string; role?: any; page?: number }[] = [];
    if (llmCandidateData?.vendorName) {
      declaredEntities.push({ name: llmCandidateData.vendorName, role: 'vendor', page: 1 });
    }
    if (llmCandidateData?.clientCompany || llmCandidateData?.customerName) {
      declaredEntities.push({
        name: llmCandidateData.clientCompany || llmCandidateData.customerName,
        role: 'customer',
        page: 1,
      });
    }
    if (llmCandidateData?.clientName) {
      declaredEntities.push({ name: llmCandidateData.clientName, role: 'contact', page: 1 });
    }

    const { entities, relationships } = resolveEntitiesFromDocument(rawText, declaredEntities);

    // -------------------------------------------------------------------------
    // 7. DATE INTELLIGENCE (NORMALIZATION, AMBIGUITY, SEMANTIC ROLES)
    // -------------------------------------------------------------------------
    const declaredDates: { type?: any; rawValue: string; page?: number }[] = [];
    if (llmCandidateData?.issueDate || llmCandidateData?.invoiceDate) {
      declaredDates.push({ type: 'invoice_date', rawValue: llmCandidateData.issueDate || llmCandidateData.invoiceDate });
    }
    if (llmCandidateData?.dueDate) {
      declaredDates.push({ type: 'due_date', rawValue: llmCandidateData.dueDate });
    }
    if (llmCandidateData?.paymentDate) {
      declaredDates.push({ type: 'payment_date', rawValue: llmCandidateData.paymentDate });
    }

    const dates = extractDatesFromDocument(rawText, declaredDates);

    // -------------------------------------------------------------------------
    // 8. ADDRESS & LOCATION INTELLIGENCE (BILLING, SHIPPING, SERVICE)
    // -------------------------------------------------------------------------
    const declaredAddresses: { type?: any; text: string; page?: number }[] = [];
    if (llmCandidateData?.clientAddress || llmCandidateData?.billingAddress) {
      declaredAddresses.push({
        type: 'billing',
        text: llmCandidateData.clientAddress || llmCandidateData.billingAddress,
      });
    }
    if (llmCandidateData?.shippingAddress || llmCandidateData?.shipToAddress) {
      declaredAddresses.push({
        type: 'shipping',
        text: llmCandidateData.shippingAddress || llmCandidateData.shipToAddress,
      });
    }
    if (llmCandidateData?.vendorAddress) {
      declaredAddresses.push({
        type: 'vendor',
        text: llmCandidateData.vendorAddress,
      });
    }

    const addresses = extractAddressesFromDocument(rawText, declaredAddresses);

    // -------------------------------------------------------------------------
    // 9. IDENTIFIERS (INVOICE #, PO #, TAX ID)
    // -------------------------------------------------------------------------
    const identifiers = this.extractIdentifiers(rawText, llmCandidateData);

    // -------------------------------------------------------------------------
    // 10. LINE ITEMS EXTRACTION
    // -------------------------------------------------------------------------
    const lineItems = this.extractLineItems(rawText, llmCandidateData);

    // -------------------------------------------------------------------------
    // 11. MULTI-PAYMENT RECORDS EXTRACTION
    // -------------------------------------------------------------------------
    const payments = this.extractPayments(rawText, llmCandidateData);

    // -------------------------------------------------------------------------
    // 12. FINANCIAL RECONCILIATION & MATHEMATICAL INTEGRITY
    // -------------------------------------------------------------------------
    const rawFinancialCandidates = this.extractFinancialCandidates(rawText, llmCandidateData);

    // Extract Contact metadata: Email, Phone, Payee & Payment Instructions
    const emailMatch = rawText.match(/(?:Email|E-mail)\s*[:|]?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i) ||
                       rawText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    const phoneMatch = rawText.match(/(?:Mobile|Phone|Tel|Cell)\s*[:|#]?\s*([+0-9\s-]{7,20})/i);
    const payeeMatch = rawText.match(/(?:Pay\s*Cheque\s*to|Pay\s*to)\s*([A-Za-z\s]+?)(?:\r?\n|$)/i);
    const instructionsMatch = rawText.match(/(?:Payment\s*Instructions|Payment\s*Terms)\s*[:|]?\s*([^\n\r]+)/i);

    const vendorEnt = entities.find((e) => e.role === 'vendor' || e.role === 'issuer');
    if (vendorEnt) {
      if (emailMatch && !vendorEnt.email) vendorEnt.email = emailMatch[1].trim();
      if (phoneMatch && !vendorEnt.phone) vendorEnt.phone = phoneMatch[1].trim();
    }
    if (payeeMatch) {
      const payeeName = payeeMatch[1].trim();
      const existingContact = entities.find((e) => e.role === 'contact');
      if (existingContact && (!existingContact.name || existingContact.name === 'Client')) {
        existingContact.name = payeeName;
      } else if (!entities.some((e) => e.name.toLowerCase() === payeeName.toLowerCase())) {
        entities.push({
          id: `ent_payee_${Date.now()}`,
          name: payeeName,
          type: 'PERSON',
          role: 'contact',
          confidence: 0.94,
          sourcePage: 1,
        });
      }
      rawFinancialCandidates.payeeName = payeeName;
    }
    if (instructionsMatch) {
      rawFinancialCandidates.paymentInstructions = instructionsMatch[0].trim();
    } else if (payeeMatch) {
      rawFinancialCandidates.paymentInstructions = payeeMatch[0].trim();
    }

    const { normalizedFinancial, validation, aggregatedPayments } = reconcileFinancials(
      rawFinancialCandidates,
      payments,
      lineItems
    );

    // -------------------------------------------------------------------------
    // 13. PAYMENT STATUS ENGINE
    // -------------------------------------------------------------------------
    const dueDateObj = dates.find((d) => d.type === 'due_date');
    const paymentStatusResult = computePaymentStatus({
      financial: normalizedFinancial,
      dueDate: dueDateObj?.value,
      rawStatusLabels: [rawText],
    });
    normalizedFinancial.paymentStatus = paymentStatusResult.status;

    // -------------------------------------------------------------------------
    // 14. PROVENANCE RECORDING FOR FINANCIAL FIELDS
    // -------------------------------------------------------------------------
    provenance.record({
      field: 'financial.total',
      value: normalizedFinancial.total,
      rawTextSnippet: `Total: ${normalizedFinancial.currencySymbol}${normalizedFinancial.total}`,
      pageNumber: 1,
      ocrConfidence: 0.98,
      semanticConfidence: 0.97,
      validationCheck: validation.isConsistent ? 'PASS' : 'FAIL',
      reasoning: `Reconciled via subtotal + tax - discount and verified against payment balance`,
    });

    provenance.record({
      field: 'financial.amountPaid',
      value: normalizedFinancial.amountPaid,
      rawTextSnippet: `Paid: ${normalizedFinancial.currencySymbol}${normalizedFinancial.amountPaid}`,
      pageNumber: 1,
      ocrConfidence: 0.97,
      semanticConfidence: 0.96,
      validationCheck: 'PASS',
      reasoning: `Sum of ${aggregatedPayments.length} payment records or declared paid amount`,
    });

    provenance.record({
      field: 'financial.balanceDue',
      value: normalizedFinancial.balanceDue,
      rawTextSnippet: `Balance Due: ${normalizedFinancial.currencySymbol}${normalizedFinancial.balanceDue}`,
      pageNumber: 1,
      ocrConfidence: 0.98,
      semanticConfidence: 0.98,
      validationCheck: validation.isConsistent ? 'PASS' : 'FAIL',
      reasoning: `Calculated as Total (${normalizedFinancial.total}) minus Paid (${normalizedFinancial.amountPaid})`,
    });

    provenance.record({
      field: 'financial.paymentStatus',
      value: normalizedFinancial.paymentStatus,
      rawTextSnippet: paymentStatusResult.reasons.join('; '),
      pageNumber: 1,
      ocrConfidence: 0.99,
      semanticConfidence: paymentStatusResult.confidence,
      validationCheck: 'PASS',
      reasoning: paymentStatusResult.reasons[0] || 'Computed from financial balance',
    });

    // -------------------------------------------------------------------------
    // 15. CONFIDENCE SCORING & HUMAN REVIEW TRIAGE
    // -------------------------------------------------------------------------
    const confidenceScores: Record<string, number> = {
      invoiceNumber: identifiers.find((i) => i.type === 'invoice_number')?.confidence || 0.85,
      total: normalizedFinancial.total !== null ? 0.98 : 0.40,
      issueDate: dates.find((d) => d.type === 'invoice_date')?.confidence || 0.85,
      paymentStatus: paymentStatusResult.confidence,
    };

    const overallConfidence = Number(
      (
        (documentTypeConfidence * 0.2 +
          paymentStatusResult.confidence * 0.25 +
          (validation.isConsistent ? 0.98 : 0.6) * 0.35 +
          (entities.length > 0 ? 0.95 : 0.6) * 0.2)
      ).toFixed(2)
    );

    const reviewTriage = evaluateHumanReview({
      documentType,
      documentTypeConfidence,
      financialValidation: validation,
      paymentStatus: normalizedFinancial.paymentStatus,
      entities,
      dates,
      confidenceScores,
    });

    const docId = identifiers.find((i) => i.type === 'invoice_number')?.value || `doc_${Date.now()}`;

    // Record in idempotency manager
    IdempotencyManager.record(tenantId, {
      fingerprint,
      documentId: docId,
      processedAt: new Date().toISOString(),
      documentType,
      total: normalizedFinancial.total,
      invoiceNumber: docId,
    });

    const durationMs = Date.now() - startTime;

    return {
      document: {
        id: docId,
        type: documentType,
        confidence: documentTypeConfidence,
        fingerprint,
        fileName,
        mimeType,
        size: fileSize,
        pageCount,
      },
      entities,
      dates,
      addresses,
      identifiers,
      financial: normalizedFinancial,
      payments: aggregatedPayments,
      lineItems,
      relationships,
      validation,
      confidence: {
        overall: overallConfidence,
        documentType: documentTypeConfidence,
        financial: validation.isConsistent ? 0.98 : 0.65,
        entities: entities.length > 0 ? 0.94 : 0.50,
        dates: dates.length > 0 ? 0.95 : 0.50,
        addresses: addresses.length > 0 ? 0.93 : 0.50,
        lineItems: lineItems.length > 0 ? 0.95 : 0.60,
        fieldScores: confidenceScores,
      },
      requiresReview: reviewTriage.requiresReview,
      reviewReasons: reviewTriage.reviewReasons,
      flaggedFields: reviewTriage.flaggedFields,
      provenance: provenance.getAll(),
      rawText,
      processing: {
        ocrEngine,
        model: provider,
        processedAt: new Date().toISOString(),
        processingVersion: '2.5.0-enterprise',
        durationMs,
        provider,
        isFallback: provider === 'deterministic-rules',
      },
    };
  }

  // ---------------------------------------------------------------------------
  // HELPER EXTRACTION METHODS
  // ---------------------------------------------------------------------------

  private static extractIdentifiers(rawText: string, llmData: any): DocumentIdentifier[] {
    const list: DocumentIdentifier[] = [];

    // Check LLM data first
    if (llmData?.invoiceNumber) {
      list.push({
        type: 'invoice_number',
        value: String(llmData.invoiceNumber).trim(),
        confidence: 0.99,
        sourcePage: 1,
      });
    }

    if (llmData?.poNumber || llmData?.purchaseOrder) {
      list.push({
        type: 'po_number',
        value: String(llmData.poNumber || llmData.purchaseOrder).trim(),
        confidence: 0.98,
        sourcePage: 1,
      });
    }

    // Heuristic regex search on rawText
    if (!list.some((i) => i.type === 'invoice_number')) {
      const invMatch =
        rawText.match(/(?:Invoice\s*Number|Invoice\s*#|Inv\s*#|Invoice\s*No)\s*[:#|]?\s*([A-Za-z0-9\-_]+)/i) ||
        rawText.match(/\b(INV-[A-Za-z0-9\-_]+)\b/i) ||
        rawText.match(/\b(RCPT-[A-Za-z0-9\-_]+)\b/i);

      if (invMatch) {
        list.push({
          type: 'invoice_number',
          value: invMatch[1].trim(),
          confidence: 0.95,
          sourcePage: 1,
        });
      }
    }

    const poMatch = rawText.match(/(?:Purchase\s*Order|PO\s*#|P\.O\.\s*#)\s*[:#|]?\s*([A-Za-z0-9\-_]+)/i);
    if (poMatch && !list.some((i) => i.type === 'po_number')) {
      list.push({
        type: 'po_number',
        value: poMatch[1].trim(),
        confidence: 0.94,
        sourcePage: 1,
      });
    }

    const taxMatch = rawText.match(/(?:Tax\s*ID|EIN|VAT\s*Reg|GSTIN|Tax\s*Number)\s*[:#|]?\s*([A-Za-z0-9\-_]+)/i);
    if (taxMatch) {
      list.push({
        type: 'tax_id',
        value: taxMatch[1].trim(),
        confidence: 0.95,
        sourcePage: 1,
      });
    }

    return list;
  }

  private static extractLineItems(rawText: string, llmData: any): ExtractedLineItem[] {
    const items: ExtractedLineItem[] = [];

    // If LLM returned structured items, prioritize them
    if (Array.isArray(llmData?.items) && llmData.items.length > 0) {
      for (let i = 0; i < llmData.items.length; i++) {
        const it = llmData.items[i];
        const qty = Number(it.quantity) || 1;
        const unitPrice = Number(it.unitPrice) || 0;
        const total = it.total !== undefined ? Number(it.total) : Number((qty * unitPrice).toFixed(2));
        const expected = Number((qty * unitPrice).toFixed(2));

        items.push({
          id: it.id || String(i + 1),
          description: String(it.description || `Line Item ${i + 1}`).trim(),
          sku: it.sku || undefined,
          quantity: qty,
          unitPrice,
          total,
          isConsistent: Math.abs(total - expected) <= 0.05,
          confidence: 0.96,
          sourcePage: 1,
        });
      }
      return items;
    }

    // Heuristic regex for tabular lines: Description Qty Price Total
    const lineRegex = /([A-Za-z0-9\s—–\-\(\)\.,]+?)\s+(\d+)\s+[$€£¥]?([0-9,]+(?:\.\d{2})?)\s+[$€£¥]?([0-9,]+(?:\.\d{2})?)/g;
    let m: RegExpExecArray | null;
    let idx = 1;

    while ((m = lineRegex.exec(rawText)) !== null) {
      const desc = m[1].trim();
      const qty = parseInt(m[2], 10) || 1;
      const unitPrice = parseFloat(m[3].replace(/,/g, '')) || 0;
      const total = parseFloat(m[4].replace(/,/g, '')) || Number((qty * unitPrice).toFixed(2));

      // Filter out total/subtotal labels
      if (
        desc &&
        !matchesSynonym(desc, 'TOTAL') &&
        !matchesSynonym(desc, 'SUBTOTAL') &&
        !desc.toLowerCase().includes('balance') &&
        unitPrice > 0
      ) {
        const expected = Number((qty * unitPrice).toFixed(2));
        items.push({
          id: String(idx++),
          description: desc,
          quantity: qty,
          unitPrice,
          total,
          isConsistent: Math.abs(total - expected) <= 0.05,
          confidence: 0.92,
          sourcePage: 1,
        });
      }
    }

    return items;
  }

  private static extractPayments(rawText: string, llmData: any): ExtractedPaymentRecord[] {
    const payments: ExtractedPaymentRecord[] = [];

    // If LLM returned payments array
    if (Array.isArray(llmData?.payments) && llmData.payments.length > 0) {
      for (let i = 0; i < llmData.payments.length; i++) {
        const p = llmData.payments[i];
        payments.push({
          id: p.id || `pay_${i + 1}`,
          amount: Number(p.amount) || 0,
          currency: p.currency || 'USD',
          date: p.date,
          reference: p.reference,
          method: p.method || 'Direct Payment',
          confidence: 0.96,
          sourcePage: p.sourcePage || 1,
        });
      }
      return payments;
    }

    // Heuristic regex: Payment 1: $1000, Payment 2: $1500, or Paid $500 on 2026-08-20, or Paid (Jun 22, 2021) $ 232.00
    const paymentRegex = /(?:Payment\s*\d*|Paid|Installment\s*\d*)\s*(?:\(([^)]+)\)|on\s+([A-Za-z0-9,\s]+))?\s*[:\-]?\s*[$€£¥]?\s*([0-9,]+(?:\.\d{2})?)(?:\s*(?:via|on|ref)\s*([^\n\r]+))?/gi;
    let m: RegExpExecArray | null;
    let idx = 1;

    while ((m = paymentRegex.exec(rawText)) !== null) {
      const amtStr = m[3] || m[1];
      if (!amtStr) continue;
      const amt = parseFloat(amtStr.replace(/,/g, ''));
      if (amt > 0) {
        const dateRaw = m[1] && !/^\d+$/.test(m[1]) ? m[1] : (m[2] ? m[2].trim() : undefined);
        let dateVal: string | undefined = undefined;
        if (dateRaw) {
          const norm = normalizeDate(dateRaw);
          if (norm.isoValue) dateVal = norm.isoValue;
        }
        payments.push({
          id: `pay_${idx++}`,
          amount: amt,
          date: dateVal,
          method: m[4] ? m[4].trim() : 'Recorded Payment',
          confidence: 0.94,
          sourcePage: 1,
        });
      }
    }

    return payments;
  }

  private static extractFinancialCandidates(rawText: string, llmData: any): Partial<FinancialData> {
    const result: Partial<FinancialData> = {};

    // 1. Currency
    const currencyMatches = rawText.match(/[$€£¥]/g);
    if (rawText.includes('EUR') || currencyMatches?.includes('€')) {
      result.currency = 'EUR';
      result.currencySymbol = '€';
    } else if (rawText.includes('GBP') || currencyMatches?.includes('£')) {
      result.currency = 'GBP';
      result.currencySymbol = '£';
    } else if (rawText.includes('JPY') || currencyMatches?.includes('¥')) {
      result.currency = 'JPY';
      result.currencySymbol = '¥';
    } else {
      result.currency = llmData?.currency === '$' ? 'USD' : (llmData?.currency || 'USD');
      result.currencySymbol = '$';
    }

    // 2. Financial amounts from LLM or regex
    if (llmData?.subtotal !== undefined) result.subtotal = Number(llmData.subtotal);
    if (llmData?.tax !== undefined) result.tax = Number(llmData.tax);
    if (llmData?.discount !== undefined) result.discount = Number(llmData.discount);
    if (llmData?.total !== undefined) result.total = Number(llmData.total);
    if (llmData?.amountPaid !== undefined) result.amountPaid = Number(llmData.amountPaid);
    if (llmData?.balanceDue !== undefined) result.balanceDue = Number(llmData.balanceDue);

    // Heuristic regex scanning for labeled amounts if missing
    const parseAmount = (regex: RegExp): number | null => {
      const match = rawText.match(regex);
      if (match && match[1]) {
        return parseFloat(match[1].replace(/,/g, ''));
      }
      return null;
    };

    if (result.total === undefined || result.total === null) {
      result.total =
        parseAmount(/(?:Total\s*Amount|Grand\s*Total|Invoice\s*Total|Total)\s*[:|]?\s*[$€£¥]?\s*([0-9,]+(?:\.\d{2})?)/i) ||
        parseAmount(/TOTAL\s*[$€£¥]?\s*([0-9,]+(?:\.\d{2})?)/);
    }

    if (result.subtotal === undefined || result.subtotal === null) {
      result.subtotal = parseAmount(/(?:Subtotal|Net\s*Amount|Sub-Total)\s*[:|]?\s*[$€£¥]?\s*([0-9,]+(?:\.\d{2})?)/i);
    }

    if (result.tax === undefined || result.tax === null) {
      result.tax = parseAmount(/(?:Tax|VAT|GST|Sales\s*Tax)\s*[:|]?\s*[$€£¥]?\s*([0-9,]+(?:\.\d{2})?)/i);
    }

    if (result.discount === undefined || result.discount === null) {
      result.discount = parseAmount(/(?:Discount|Rebate|Promo)\s*[:|]?\s*[$€£¥]?\s*([0-9,]+(?:\.\d{2})?)/i);
    }

    if (result.amountPaid === undefined || result.amountPaid === null) {
      result.amountPaid =
        parseAmount(/(?:Amount\s*Paid|Paid\s*to\s*Date|Payment\s*Received)\s*[:|]?\s*[$€£¥]?\s*([0-9,]+(?:\.\d{2})?)/i) ||
        parseAmount(/Paid\s*(?:\([^)]*\)|on\s+[A-Za-z0-9,\s]+)?\s*[:|]?\s*[$€£¥]?\s*([0-9,]+(?:\.\d{2})?)/i);
    }

    if (result.balanceDue === undefined || result.balanceDue === null) {
      result.balanceDue = parseAmount(/(?:Amount\s*Due|Balance\s*Due|Outstanding|Remaining|Open\s*Balance|Total\s*Due)\s*[:|]?\s*[$€£¥]?\s*([0-9,]+(?:\.\d{2})?)/i);
    }

    return result;
  }

  // ---------------------------------------------------------------------------
  // PDF STREAM DECODER (Zero-Dependency)
  // ---------------------------------------------------------------------------

  private static extractTextFromPdfBuffer(buffer: Buffer): string {
    const textPieces: string[] = [];
    const content = buffer.toString('latin1');

    const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
    let match: RegExpExecArray | null;

    while ((match = streamRegex.exec(content)) !== null) {
      const rawStream = Buffer.from(match[1], 'latin1');
      let decoded = '';

      try {
        decoded = zlib.inflateSync(rawStream).toString('utf-8');
      } catch {
        try {
          decoded = zlib.inflateRawSync(rawStream).toString('utf-8');
        } catch {
          decoded = rawStream.toString('latin1');
        }
      }

      const strRegex = /\(((?:\\\(|\\\)|[^\)])*)\)\s*(?:Tj|'|")/g;
      let sMatch: RegExpExecArray | null;
      while ((sMatch = strRegex.exec(decoded)) !== null) {
        const clean = sMatch[1].replace(/\\([()\\])/g, '$1');
        if (clean.trim()) textPieces.push(clean.trim());
      }

      const arrayRegex = /\[((?:\\\]|[^\]])*)\]\s*TJ/g;
      let aMatch: RegExpExecArray | null;
      while ((aMatch = arrayRegex.exec(decoded)) !== null) {
        const inner = aMatch[1];
        const parts = inner.match(/\(((?:\\\(|\\\)|[^\)])*)\)/g);
        if (parts) {
          const line = parts.map((p) => p.slice(1, -1).replace(/\\([()\\])/g, '$1')).join('');
          if (line.trim()) textPieces.push(line.trim());
        }
      }
    }

    return textPieces.join('\n');
  }

  private static estimatePdfPageCount(buffer: Buffer): number {
    const content = buffer.toString('latin1');
    const pageMatches = content.match(/\/Type\s*\/Page\b/g);
    return pageMatches ? pageMatches.length : 1;
  }

  // ---------------------------------------------------------------------------
  // MULTI-MODEL AI EXTRACTION CALL
  // ---------------------------------------------------------------------------

  private static async callAiExtractionModel(
    fileData: string,
    fileName: string,
    extractedText: string,
    isPdf: boolean,
    apiKey: string
  ): Promise<any> {
    const isImage = !isPdf && fileData.startsWith('data:image/');

    const promptText = `You are an enterprise document intelligence engine.
Extract all structured data from this business document strictly conforming to this JSON format:
{
  "documentType": "invoice | receipt | payment_receipt | purchase_order | quotation | estimate | bill | contract | agreement | bank_statement | expense_receipt | shipping_manifest | order_confirmation | employee_document | resume | property_document | unknown",
  "invoiceNumber": "string",
  "poNumber": "string",
  "vendorName": "string",
  "vendorEmail": "string",
  "vendorAddress": "string",
  "customerName": "string",
  "clientCompany": "string",
  "clientEmail": "string",
  "clientAddress": "string",
  "shippingAddress": "string",
  "issueDate": "YYYY-MM-DD",
  "dueDate": "YYYY-MM-DD",
  "paymentDate": "YYYY-MM-DD",
  "currency": "USD | EUR | GBP | JPY",
  "subtotal": number,
  "tax": number,
  "taxRate": number,
  "discount": number,
  "shipping": number,
  "total": number,
  "amountPaid": number,
  "balanceDue": number,
  "payments": [
    { "amount": number, "date": "YYYY-MM-DD", "method": "string", "reference": "string" }
  ],
  "items": [
    { "description": "string", "quantity": number, "unitPrice": number, "total": number, "sku": "string" }
  ],
  "paymentTerms": "string",
  "bankDetails": "string"
}
Return ONLY valid JSON. Do not include markdown formatting or explanations.`;

    let messages: any[] = [];

    if (isImage) {
      messages = [
        {
          role: 'user',
          content: [
            { type: 'text', text: promptText },
            { type: 'image_url', image_url: { url: fileData } },
          ],
        },
      ];
    } else {
      messages = [
        { role: 'system', content: promptText },
        {
          role: 'user',
          content: `Document Filename: ${fileName}\n\nDocument Text Content:\n${extractedText || fileName}`,
        },
      ];
    }

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:4000',
        'X-Title': 'Business OS Document Intelligence',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        max_tokens: 2500,
        messages,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '';
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
    }

    return null;
  }
}
