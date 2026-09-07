/**
 * Date Intelligence Engine
 * Parses, types, and normalizes business dates to ISO YYYY-MM-DD while detecting ambiguity.
 */

import { ExtractedDate, DateType } from './types';
import { matchesSynonym } from './synonyms';

const MONTH_NAMES: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

/**
 * Normalizes a date candidate string to ISO (YYYY-MM-DD) and checks for ambiguity.
 */
export function normalizeDate(dateStr: string, preferredLocale: 'US' | 'EU' = 'US'): {
  isoValue: string | null;
  isAmbiguous: boolean;
  confidence: number;
} {
  if (!dateStr) return { isoValue: null, isAmbiguous: false, confidence: 0 };
  const clean = dateStr.trim();

  // 1. ISO Format: YYYY-MM-DD
  const isoMatch = clean.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    if (isValidDate(year, month, day)) {
      return {
        isoValue: formatIso(year, month, day),
        isAmbiguous: false,
        confidence: 0.99,
      };
    }
  }

  // 2. Named Month: "10 Aug 2026" or "August 10, 2026" or "10-August-2026"
  const namedMonthMatch = clean.match(/([a-zA-Z]+)\s+(\d{1,2}),?\s+(\d{4})/) ||
    clean.match(/(\d{1,2})[- \s]+([a-zA-Z]+)[- \s]+(\d{4})/);

  if (namedMonthMatch) {
    let day = 1;
    let month = 1;
    let year = 2026;

    if (isNaN(Number(namedMonthMatch[1]))) {
      // "August 10, 2026"
      const mName = namedMonthMatch[1].toLowerCase();
      month = MONTH_NAMES[mName] || 1;
      day = parseInt(namedMonthMatch[2], 10);
      year = parseInt(namedMonthMatch[3], 10);
    } else {
      // "10 Aug 2026"
      day = parseInt(namedMonthMatch[1], 10);
      const mName = namedMonthMatch[2].toLowerCase();
      month = MONTH_NAMES[mName] || 1;
      year = parseInt(namedMonthMatch[3], 10);
    }

    if (isValidDate(year, month, day)) {
      return {
        isoValue: formatIso(year, month, day),
        isAmbiguous: false,
        confidence: 0.98,
      };
    }
  }

  // 3. Numeric Slash/Dash formats: MM/DD/YYYY vs DD/MM/YYYY
  const numMatch = clean.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (numMatch) {
    const part1 = parseInt(numMatch[1], 10);
    const part2 = parseInt(numMatch[2], 10);
    const year = parseInt(numMatch[3], 10);

    // Case 1: part1 > 12 -> must be DD/MM/YYYY
    if (part1 > 12 && part2 <= 12) {
      if (isValidDate(year, part2, part1)) {
        return {
          isoValue: formatIso(year, part2, part1),
          isAmbiguous: false,
          confidence: 0.95,
        };
      }
    }

    // Case 2: part2 > 12 -> must be MM/DD/YYYY
    if (part2 > 12 && part1 <= 12) {
      if (isValidDate(year, part1, part2)) {
        return {
          isoValue: formatIso(year, part1, part2),
          isAmbiguous: false,
          confidence: 0.95,
        };
      }
    }

    // Case 3: Both parts <= 12 and distinct -> AMBIGUOUS! (e.g. 10/08/2026 can be Oct 8 or Aug 10)
    if (part1 <= 12 && part2 <= 12 && part1 !== part2) {
      const month = preferredLocale === 'US' ? part1 : part2;
      const day = preferredLocale === 'US' ? part2 : part1;
      return {
        isoValue: formatIso(year, month, day),
        isAmbiguous: true, // Mark ambiguous as strictly instructed!
        confidence: 0.70,
      };
    }

    // Case 4: part1 === part2 (e.g. 05/05/2026) -> Unambiguous
    if (part1 <= 12 && part2 <= 12 && part1 === part2) {
      return {
        isoValue: formatIso(year, part1, part2),
        isAmbiguous: false,
        confidence: 0.95,
      };
    }
  }

  return { isoValue: null, isAmbiguous: false, confidence: 0 };
}

function isValidDate(year: number, month: number, day: number): boolean {
  if (year < 1970 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  return true;
}

function formatIso(year: number, month: number, day: number): string {
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

/**
 * Extracts and categorizes all date candidates from text with semantic role assignment.
 */
export function extractDatesFromDocument(
  rawText: string,
  declaredDates: { type?: DateType; rawValue: string; page?: number }[] = []
): ExtractedDate[] {
  const dates: ExtractedDate[] = [];
  const lines = rawText.split('\n');

  for (const line of lines) {
    // Check line for date label + pattern
    const dateRegex = /(\d{4}[/-]\d{1,2}[/-]\d{1,2}|\d{1,2}[/-]\d{1,2}[/-]\d{4}|[a-zA-Z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}\s+[a-zA-Z]+\s+\d{4})/g;
    let m: RegExpExecArray | null;

    while ((m = dateRegex.exec(line)) !== null) {
      const rawVal = m[1];
      const { isoValue, isAmbiguous, confidence } = normalizeDate(rawVal);
      if (!isoValue) continue;

      // Determine date type from surrounding text on line
      let type: DateType = 'unknown';
      if (matchesSynonym(line, 'INVOICE_DATE')) {
        type = 'invoice_date';
      } else if (matchesSynonym(line, 'DUE_DATE')) {
        type = 'due_date';
      } else if (matchesSynonym(line, 'PAYMENT_DATE')) {
        type = 'payment_date';
      } else if (line.toLowerCase().includes('service date')) {
        type = 'service_date';
      } else if (line.toLowerCase().includes('delivery date')) {
        type = 'delivery_date';
      }

      // Prevent exact duplicates
      if (!dates.some((d) => d.type === type && d.value === isoValue)) {
        dates.push({
          type,
          value: isoValue,
          rawValue: rawVal,
          isAmbiguous,
          confidence: isAmbiguous ? 0.70 : confidence,
          sourcePage: 1,
        });
      }
    }
  }

  // Merge declared dates
  for (const dec of declaredDates) {
    if (!dec.rawValue) continue;
    const { isoValue, isAmbiguous, confidence } = normalizeDate(dec.rawValue);
    if (!isoValue) continue;

    const existing = dates.find((d) => d.type === dec.type);
    if (existing) {
      existing.value = isoValue;
      existing.rawValue = dec.rawValue;
      existing.isAmbiguous = isAmbiguous;
      existing.confidence = confidence;
      if (dec.page) existing.sourcePage = dec.page;
    } else {
      dates.push({
        type: dec.type || 'unknown',
        value: isoValue,
        rawValue: dec.rawValue,
        isAmbiguous,
        confidence,
        sourcePage: dec.page || 1,
      });
    }
  }

  return dates;
}
