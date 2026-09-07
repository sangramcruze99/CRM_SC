/**
 * Business OS Integration & Domain Dispatch Mapper
 * Converts CanonicalDocumentExtraction into structured payloads for downstream
 * microservices (Finance, CRM, Document Vault, HR, Real Estate).
 */

import { CanonicalDocumentExtraction } from './types';

export interface BusinessOsMappingResult {
  targetService: 'finance' | 'documents' | 'crm' | 'hr' | 'realestate';
  targetEndpoint: string;
  payload: Record<string, any>;
  vaultMetadata: {
    category: 'input' | 'output' | 'receipt' | 'contract' | 'general';
    service: string;
    module: string;
    entityType: string;
    entityId: string;
  };
}

export function mapToBusinessOs(
  extraction: CanonicalDocumentExtraction,
  tenantId: string
): BusinessOsMappingResult {
  const { document, financial, entities, lineItems, dates, identifiers } = extraction;

  const invoiceNumber = identifiers.find((i) => i.type === 'invoice_number')?.value || document.id;
  const customerEntity = entities.find((e) => e.role === 'customer');
  const vendorEntity = entities.find((e) => e.role === 'vendor' || e.role === 'issuer');
  const dueDate = dates.find((d) => d.type === 'due_date')?.value || new Date().toISOString().split('T')[0];

  // 1. Invoices & Bills -> Finance Microservice (:3015)
  if (document.type === 'invoice' || document.type === 'bill') {
    return {
      targetService: 'finance',
      targetEndpoint: 'http://localhost:3015/invoices',
      payload: {
        tenantId,
        invoiceNum: invoiceNumber,
        amount: financial.total || 0,
        status: financial.paymentStatus,
        dueDate,
        clientName: customerEntity?.name || 'Commercial Client',
        vendorName: vendorEntity?.name || 'Authorized Vendor',
        currency: financial.currency,
        subtotal: financial.subtotal,
        tax: financial.tax,
        discount: financial.discount,
        amountPaid: financial.amountPaid,
        balanceDue: financial.balanceDue,
        lineItems: lineItems.map((it) => ({
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          total: it.total,
          sku: it.sku,
        })),
      },
      vaultMetadata: {
        category: 'output',
        service: 'finance',
        module: 'invoices',
        entityType: 'invoice',
        entityId: invoiceNumber,
      },
    };
  }

  // 2. Receipts & Expenses -> Finance & Document Vault
  if (document.type === 'receipt' || document.type === 'expense_receipt' || document.type === 'payment_receipt') {
    return {
      targetService: 'finance',
      targetEndpoint: 'http://localhost:3015/transactions',
      payload: {
        tenantId,
        amount: financial.total || 0,
        type: 'DEBIT',
        description: `Receipt #${invoiceNumber} from ${vendorEntity?.name || 'Merchant'}`,
        status: financial.paymentStatus,
        paymentDate: dates.find((d) => d.type === 'payment_date')?.value || dates[0]?.value,
      },
      vaultMetadata: {
        category: 'receipt',
        service: 'finance',
        module: 'expenses',
        entityType: 'receipt',
        entityId: invoiceNumber,
      },
    };
  }

  // 3. Resumes & HR Documents -> HR Microservice (:3018)
  if (document.type === 'resume' || document.type === 'employee_document') {
    const person = entities.find((e) => e.type === 'PERSON');
    return {
      targetService: 'hr',
      targetEndpoint: 'http://localhost:3018/candidates',
      payload: {
        tenantId,
        candidateName: person?.name || 'Candidate',
        email: person?.email || '',
        phone: person?.phone || '',
        documentType: document.type,
      },
      vaultMetadata: {
        category: 'general',
        service: 'hr',
        module: 'candidates',
        entityType: 'candidate',
        entityId: person?.id || document.id,
      },
    };
  }

  // Default fallback -> Document Vault (:3020)
  return {
    targetService: 'documents',
    targetEndpoint: 'http://localhost:3020/documents',
    payload: {
      tenantId,
      documentId: document.id,
      type: document.type,
      extractedData: extraction,
    },
    vaultMetadata: {
      category: 'general',
      service: 'general',
      module: 'vault',
      entityType: 'document',
      entityId: document.id,
    },
  };
}
