/**
 * Address & Location Intelligence Engine
 * Separates multiple addresses across billing, shipping, service, and corporate locations.
 */

import { ExtractedAddress, AddressType } from './types';
import { matchesSynonym } from './synonyms';

export function extractAddressesFromDocument(
  rawText: string,
  rawAddresses: { type?: AddressType; text: string; page?: number }[] = []
): ExtractedAddress[] {
  const addresses: ExtractedAddress[] = [];
  const lines = rawText.split('\n');

  let currentSectionType: AddressType | null = null;
  let buffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (matchesSynonym(line, 'SHIPPING_ADDRESS')) {
      if (buffer.length > 0 && currentSectionType) {
        addAddress(addresses, currentSectionType, buffer.join(', '));
        buffer = [];
      }
      currentSectionType = 'shipping';
      continue;
    } else if (matchesSynonym(line, 'BILLING_ADDRESS')) {
      if (buffer.length > 0 && currentSectionType) {
        addAddress(addresses, currentSectionType, buffer.join(', '));
        buffer = [];
      }
      currentSectionType = 'billing';
      continue;
    } else if (line.toLowerCase().includes('service location') || line.toLowerCase().includes('service address')) {
      if (buffer.length > 0 && currentSectionType) {
        addAddress(addresses, currentSectionType, buffer.join(', '));
        buffer = [];
      }
      currentSectionType = 'service';
      continue;
    }

    // Check if line looks like an address line (contains numbers + street keyword, or city/state/zip pattern)
    const isAddressLine =
      /\b\d+\s+[A-Za-z0-9\s.,]+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Lane|Ln|Dr|Drive|Parkway|Pkwy|Way|Suite|Ste|Floor|Fl)\b/i.test(line) ||
      /\b[A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/.test(line) ||
      /\b\d{5}\b/.test(line);

    if (isAddressLine) {
      buffer.push(line);
      if (buffer.length >= 2) {
        addAddress(addresses, currentSectionType || 'billing', buffer.join(', '));
        buffer = [];
        currentSectionType = null;
      }
    }
  }

  // Flush remaining buffer
  if (buffer.length > 0) {
    addAddress(addresses, currentSectionType || 'billing', buffer.join(', '));
  }

  // Merge explicitly declared addresses
  for (const raw of rawAddresses) {
    if (raw && raw.text && raw.text.trim().length > 5) {
      addAddress(addresses, raw.type || 'unknown', raw.text.trim(), raw.page || 1);
    }
  }

  return addresses;
}

/**
 * Clean and unglue OCR concatenated address text
 * e.g. "67h, Martin streetAlexander road576832" -> "67h, Martin street, Alexander road 576832"
 * e.g. "#34, Car streetCity parkHonk Kong" -> "#34, Car street, City park, Honk Kong"
 */
export function normalizeAddressText(text: string): string {
  if (!text) return '';
  let cleaned = text.trim();
  // Unglue lower-to-upper camel concatenations (e.g. streetAlexander -> street, Alexander)
  cleaned = cleaned.replace(/([a-z])([A-Z])/g, '$1, $2');
  // Add comma between street designators and city: e.g. "Street City" -> "Street, City"
  cleaned = cleaned.replace(/\b(Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Boulevard|Blvd|Way|Lane|Ln|Court|Ct)\s+([A-Z][a-z]+)\b/gi, '$1, $2');
  // Add comma between postal code and country name: e.g. "90210 United States" -> "90210, United States"
  cleaned = cleaned.replace(/\b(\d{5}(?:-\d{4})?)\s+([A-Z][a-zA-Z\s]+)\b/g, '$1, $2');
  // Unglue text glued to postal codes (e.g. road576832 -> road 576832)
  cleaned = cleaned.replace(/([a-zA-Z])(\d{4,})/g, '$1 $2');
  // Clean double commas or messy spacing
  cleaned = cleaned.replace(/,\s*,+/g, ',').replace(/\s+/g, ' ').trim();
  return cleaned;
}

function addAddress(
  collection: ExtractedAddress[],
  type: AddressType,
  text: string,
  page = 1
) {
  const normalized = normalizeAddressText(text);
  if (!normalized || normalized.length < 3) return;

  // Avoid duplicate addresses of same type
  if (collection.some((a) => a.type === type && (a.text.includes(normalized) || normalized.includes(a.text)))) {
    return;
  }

  const id = `addr_${collection.length + 1}_${Math.random().toString(36).substring(2, 6)}`;
  collection.push({
    id,
    type,
    text: normalized,
    confidence: 0.93,
    sourcePage: page,
  });
}

