/**
 * Semantic Synonym & Alias Normalization Layer
 * Matches real-world label variants to canonical business schema fields.
 */

export const SYNONYM_DICTIONARY = {
  TOTAL_DUE: [
    'amount due',
    'balance due',
    'outstanding',
    'outstanding amount',
    'remaining',
    'remaining balance',
    'open balance',
    'due amount',
    'amount outstanding',
    'total due',
    'net payable',
    'amount to pay',
    'current amount due',
    'balance remaining',
  ],

  AMOUNT_PAID: [
    'paid',
    'amount paid',
    'paid amount',
    'payment received',
    'received',
    'paid to date',
    'settled amount',
    'settled',
    'total paid',
    'credits applied',
    'funds received',
  ],

  SUBTOTAL: [
    'subtotal',
    'sub-total',
    'net total',
    'net amount',
    'amount before tax',
    'base amount',
    'gross total before tax',
    'total before discount',
  ],

  TAX: [
    'tax',
    'vat',
    'gst',
    'sales tax',
    'hst',
    'tva',
    'consumption tax',
    'tax amount',
    'total tax',
  ],

  DISCOUNT: [
    'discount',
    'special discount',
    'rebate',
    'deduction',
    'promo',
    'promotional discount',
    'allowance',
    'credit applied',
  ],

  SHIPPING: [
    'shipping',
    'freight',
    'delivery',
    'shipping & handling',
    'postage',
    'carriage',
    'transport',
  ],

  TOTAL: [
    'grand total',
    'total',
    'total amount',
    'invoice total',
    'receipt total',
    'bill total',
    'amount payable',
    'final amount',
    'total payable',
    'gross amount',
  ],

  INVOICE_DATE: [
    'invoice date',
    'issue date',
    'issued',
    'date issued',
    'billing date',
    'created',
    'creation date',
    'document date',
    'tax date',
    'date of invoice',
  ],

  DUE_DATE: [
    'due date',
    'payment due',
    'pay by',
    'due',
    'payment deadline',
    'maturity date',
    'payment terms due',
    'expiry date',
    'settlement date',
  ],

  PAYMENT_DATE: [
    'payment date',
    'paid on',
    'transaction date',
    'cleared date',
    'date paid',
    'received date',
  ],

  CUSTOMER: [
    'bill to',
    'billed to',
    'customer',
    'client',
    'buyer',
    'purchaser',
    'sold to',
    'recipient',
    'invoice to',
    'account of',
  ],

  VENDOR: [
    'from',
    'vendor',
    'supplier',
    'seller',
    'issued by',
    'billed by',
    'remit to',
    'service provider',
    'contractor',
    'merchant',
  ],

  SHIPPING_ADDRESS: [
    'ship to',
    'shipped to',
    'delivery address',
    'shipping address',
    'destination',
    'deliver to',
    'consignee',
  ],

  BILLING_ADDRESS: [
    'bill to',
    'billing address',
    'billed to address',
    'invoice address',
    'registered address',
  ],

  INVOICE_NUMBER: [
    'invoice number',
    'invoice #',
    'inv #',
    'invoice no',
    'inv no',
    'bill number',
    'bill #',
    'receipt number',
    'receipt #',
    'tax invoice no',
  ],

  PO_NUMBER: [
    'purchase order',
    'purchase order #',
    'po number',
    'po #',
    'p.o. number',
    'p.o. #',
    'order reference',
  ],
};

/**
 * Checks if candidate text matches any synonyms in a given dictionary key.
 */
export function matchesSynonym(text: string, category: keyof typeof SYNONYM_DICTIONARY): boolean {
  if (!text) return false;
  const clean = text.trim().toLowerCase().replace(/[:#|_-]/g, ' ');
  const synonyms = SYNONYM_DICTIONARY[category] || [];
  return synonyms.some((syn) => clean.includes(syn) || syn.includes(clean));
}

/**
 * Returns matching confidence (0 to 1) for a label against a semantic dictionary key.
 */
export function scoreSynonymMatch(text: string, category: keyof typeof SYNONYM_DICTIONARY): number {
  if (!text) return 0;
  const clean = text.trim().toLowerCase().replace(/[:#|_-]/g, ' ');
  const synonyms = SYNONYM_DICTIONARY[category] || [];

  for (const syn of synonyms) {
    if (clean === syn) return 1.0;
    if (clean.startsWith(syn) || clean.endsWith(syn)) return 0.95;
    if (clean.includes(syn)) return 0.85;
  }
  return 0;
}
