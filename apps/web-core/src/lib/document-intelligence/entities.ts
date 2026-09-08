/**
 * Entity Detection & Cross-Page Entity Resolution Engine
 * Accurately extracts and classifies Person vs Company vs Organization,
 * resolves semantic roles (vendor, customer, contact), and deduplicates across pages.
 */

import { ExtractedEntity, EntityType, EntityRole, EntityRelationship } from './types';

const CORPORATE_SUFFIXES = [
  'company',
  'co',
  'co.',
  'ltd',
  'ltd.',
  'limited',
  'inc',
  'inc.',
  'incorporated',
  'corp',
  'corp.',
  'corporation',
  'llc',
  'llc.',
  'gmbh',
  'plc',
  'sa',
  's.a.',
  'pty',
  'pty ltd',
  'technologies',
  'solutions',
  'services',
  'enterprises',
  'group',
  'holdings',
  'industries',
  'logistics',
  'medical center',
  'hospital',
  'clinic',
  'university',
  'foundation',
  'agency',
  'consulting',
];

const ORGANIZATION_KEYWORDS = [
  'hospital',
  'medical center',
  'health system',
  'foundation',
  'university',
  'college',
  'institute',
  'authority',
  'ministry',
  'board of',
  'association',
  'chamber of commerce',
];

/**
 * Normalizes an entity name for cross-page matching & deduplication.
 * e.g. "Acme Technologies Ltd." -> "acme technologies"
 * "Acme Tech Ltd." -> "acme tech"
 */
export function normalizeEntityKey(name: string): string {
  if (!name) return '';
  let cleaned = name.toLowerCase().trim();

  // Strip corporate suffixes
  for (const sfx of CORPORATE_SUFFIXES) {
    const regex = new RegExp(`\\b${sfx}\\b`, 'gi');
    cleaned = cleaned.replace(regex, '');
  }

  // Remove punctuation and extra whitespace
  return cleaned.replace(/[.,\-_#&()]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Calculates string similarity (Levenshtein-based ratio) between two entity names.
 */
export function entitySimilarity(a: string, b: string): number {
  const normA = normalizeEntityKey(a);
  const normB = normalizeEntityKey(b);

  if (normA === normB) return 1.0;
  if (!normA || !normB) return 0.0;

  if (normA.includes(normB) || normB.includes(normA)) {
    const longer = Math.max(normA.length, normB.length);
    const shorter = Math.min(normA.length, normB.length);
    return shorter / longer >= 0.7 ? 0.92 : 0.75;
  }

  // Common abbreviation matching (e.g., Acme Tech vs Acme Technologies)
  const wordsA = normA.split(' ');
  const wordsB = normB.split(' ');
  if (wordsA[0] === wordsB[0] && wordsA[0].length >= 3) {
    return 0.88;
  }

  return 0.0;
}

/**
 * Classifies entity type (PERSON, COMPANY, ORGANIZATION) based on lexical cues.
 */
export function classifyEntityType(name: string, surroundingText = ''): EntityType {
  const lower = name.toLowerCase().trim();
  const context = surroundingText.toLowerCase();
  // 0. Filter out Address patterns, dates, and generic document headers
  if (
    /\b(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Boulevard|Blvd|Lane|Ln|Court|Ct|Parkway|Pkwy|Suite|Ste)\b/i.test(name) ||
    /\b(?:City,\s*[A-Z][a-z]+|\d{5}|United States|USA|UK|Canada)\b/i.test(name) ||
    /^(?:Sample\s*Invoice|Invoice|Receipt|Bill|Statement|Amount\s*Due|Total|Subtotal)\b/i.test(name)
  ) {
    return 'UNKNOWN';
  }

  // 1. Check Organization
  if (ORGANIZATION_KEYWORDS.some((kw) => lower.includes(kw) || context.includes(kw))) {
    return 'ORGANIZATION';
  }

  // 2. Check Corporate Suffixes / Company Markers
  if (
    CORPORATE_SUFFIXES.some((sfx) => {
      const re = new RegExp(`\\b${sfx}\\b`, 'i');
      return re.test(lower);
    }) ||
    lower.includes('& co') ||
    lower.includes('llp')
  ) {
    return 'COMPANY';
  }

  // 3. Person Name Heuristics
  // Standard two or three word capitalization (e.g. John Smith, Sarah Jane Connor)
  const words = name.trim().split(/\s+/);
  const isLikelyPersonName =
    words.length >= 2 &&
    words.length <= 4 &&
    words.every((w) => /^[A-Z][a-zA-Z'\-]*$/.test(w)) &&
    !CORPORATE_SUFFIXES.some((sfx) => {
      const escaped = sfx.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${escaped}\\b`, 'i').test(lower);
    });

  if (isLikelyPersonName) {
    return 'PERSON';
  }

  // Fallback to Company if multiple uppercase words or includes business terms
  if (words.length >= 2) {
    return 'COMPANY';
  }

  return 'UNKNOWN';
}

/**
 * Resolves entity roles and relationships in the document context.
 */
export function resolveEntitiesFromDocument(
  rawText: string,
  rawEntities: { name: string; role?: EntityRole; page?: number }[] = []
): { entities: ExtractedEntity[]; relationships: EntityRelationship[] } {
  const resolved: ExtractedEntity[] = [];
  const relationships: EntityRelationship[] = [];

  // Candidate extraction heuristics from text lines
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

  let currentSection: 'HEADER' | 'VENDOR' | 'CUSTOMER' | 'BODY' = 'HEADER';
  let sectionIndex = 0;

  for (const line of lines) {
    sectionIndex++;
    const lowerLine = line.toLowerCase();

    // Check explicit patterns first (e.g. Issued By: Acme, Customer: Sarah)
    const vendorMatch = line.match(/(?:Vendor|Seller|From|Issued By)\s*[:|]\s*([A-Za-z0-9\s.,&'-]+)/i);
    if (vendorMatch && vendorMatch[1].trim().length > 2) {
      const name = vendorMatch[1].trim();
      addOrMergeEntity(resolved, {
        name,
        role: 'vendor',
        context: line,
      });
      currentSection = 'VENDOR';
      continue;
    }

    const customerMatch = line.match(/(?:Customer|Client|Bill To|Billed To)\s*[:|]\s*([A-Za-z0-9\s.,&'-]+)/i);
    if (customerMatch && customerMatch[1].trim().length > 2) {
      const name = customerMatch[1].trim();
      addOrMergeEntity(resolved, {
        name,
        role: 'customer',
        context: line,
      });
      currentSection = 'CUSTOMER';
      continue;
    }

    // Section context switches when label is standalone on its own line
    if (lowerLine.startsWith('bill to') || lowerLine.startsWith('billed to') || lowerLine.startsWith('customer') || lowerLine.startsWith('client')) {
      currentSection = 'CUSTOMER';
      const afterColon = line.split(/[:|]/)[1]?.trim();
      if (afterColon && afterColon.length > 2) {
        addOrMergeEntity(resolved, {
          name: afterColon,
          role: 'customer',
          context: line,
        });
      }
      continue;
    }
    if (lowerLine.startsWith('from') || lowerLine.startsWith('vendor') || lowerLine.startsWith('supplier') || lowerLine.startsWith('issued by')) {
      currentSection = 'VENDOR';
      const afterColon = line.split(/[:|]/)[1]?.trim();
      if (afterColon && afterColon.length > 2) {
        addOrMergeEntity(resolved, {
          name: afterColon,
          role: 'vendor',
          context: line,
        });
      }
      continue;
    }

    // Switch to BODY section when line item table headers or tabular columns are encountered
    if (
      lowerLine.startsWith('description') ||
      /\b(?:rate\s+qty|qty\s+price|quantity|unit\s*price)\b/i.test(line)
    ) {
      currentSection = 'BODY';
      continue;
    }

    // Skip all table rows, price lines, and totals from entity parsing
    if (/\d+\.\d{2}/.test(line) || /[$€£¥]\s*\d+/.test(line)) {
      continue;
    }

    if (currentSection === 'BODY') {
      continue;
    }

    // Line detection by entity classification if line is concise (< 60 chars)
    if (
      line.length <= 60 &&
      !lowerLine.startsWith('description') &&
      !lowerLine.startsWith('invoice') &&
      !lowerLine.startsWith('email') &&
      !lowerLine.startsWith('mobile') &&
      !lowerLine.startsWith('phone') &&
      !lowerLine.startsWith('tel') &&
      !lowerLine.startsWith('due') &&
      !lowerLine.startsWith('date') &&
      !lowerLine.startsWith('subtotal') &&
      !lowerLine.startsWith('total') &&
      !lowerLine.startsWith('amount') &&
      !lowerLine.startsWith('balance') &&
      !lowerLine.startsWith('deposit') &&
      !lowerLine.startsWith('notes') &&
      !lowerLine.startsWith('terms') &&
      !lowerLine.startsWith('sample') &&
      !lowerLine.startsWith('rate') &&
      !lowerLine.startsWith('qty') &&
      !/^\d+/.test(line) &&
      !/\b(?:Street|Road|Avenue|Boulevard|Lane|Drive|City,\s*[A-Z][a-z]+|\d{5}|United States)\b/i.test(line)
    ) {
      const type = classifyEntityType(line.trim());
      if (type === 'COMPANY' || type === 'ORGANIZATION') {
        const role = currentSection === 'CUSTOMER' ? 'customer' : 'vendor';
        addOrMergeEntity(resolved, {
          name: line.trim(),
          role,
          context: line,
        });
        continue;
      } else if (currentSection === 'CUSTOMER' && !resolved.some((e) => e.role === 'customer')) {
        // Direct customer entity under Billed To section (e.g., "Your Client")
        addOrMergeEntity(resolved, {
          name: line.trim(),
          role: 'customer',
          context: line,
        });
        continue;
      }
    }
  }

  // Merge any explicitly passed rawEntities (e.g. from LLM / Vision)
  for (const raw of rawEntities) {
    if (raw && raw.name && raw.name.trim().length > 2) {
      addOrMergeEntity(resolved, {
        name: raw.name.trim(),
        role: raw.role || 'unknown',
        page: raw.page || 1,
      });
    }
  }

  // If no vendor was explicitly tagged but we have a company in the header, infer vendor role
  const vendorEntity = resolved.find((e) => e.role === 'vendor' || e.role === 'issuer');
  if (!vendorEntity && resolved.length > 0) {
    const firstCompany = resolved.find((e) => e.type === 'COMPANY' || e.type === 'ORGANIZATION');
    if (firstCompany) {
      firstCompany.role = 'vendor';
    }
  }

  // Cross-Entity Relationship Inference (e.g. Person contact at Company)
  const persons = resolved.filter((e) => e.type === 'PERSON');
  const companies = resolved.filter((e) => e.type === 'COMPANY' || e.type === 'ORGANIZATION');

  for (const person of persons) {
    // If person has role 'customer' and there is a company with role 'customer',
    // link person as 'REPRESENTATIVE_OF' or 'CONTACT_FOR' the company!
    const customerCompany = companies.find((c) => c.role === 'customer');
    if (customerCompany && (person.role === 'customer' || person.role === 'contact') && person.name !== customerCompany.name) {
      person.role = 'contact';
      relationships.push({
        sourceEntityId: person.id,
        targetEntityId: customerCompany.id,
        relationship: 'CONTACT_FOR',
        confidence: 0.94,
      });
    }

    const vendorCompany = companies.find((c) => c.role === 'vendor' || c.role === 'issuer');
    if (vendorCompany && person.role === 'vendor') {
      person.role = 'authorized_representative';
      relationships.push({
        sourceEntityId: person.id,
        targetEntityId: vendorCompany.id,
        relationship: 'REPRESENTATIVE_OF',
        confidence: 0.91,
      });
    }
  }

  return { entities: resolved, relationships };
}

function addOrMergeEntity(
  collection: ExtractedEntity[],
  params: { name: string; role?: EntityRole; context?: string; page?: number }
) {
  const { name, role, context, page } = params;
  const existing = collection.find((e) => entitySimilarity(e.name, name) >= 0.85);

  if (existing) {
    // Update aliases if this is a variant (e.g. Acme Tech vs Acme Technologies Ltd.)
    if (existing.name !== name) {
      existing.aliases = existing.aliases || [];
      if (!existing.aliases.includes(name)) {
        existing.aliases.push(name);
      }
      // Upgrade name to the more specific version (with corporate suffix)
      if (name.length > existing.name.length) {
        existing.aliases.push(existing.name);
        existing.name = name;
      }
    }
    if (role && role !== 'unknown' && existing.role === 'unknown') {
      existing.role = role;
    }
    return;
  }

  const entityType = classifyEntityType(name, context || '');
  const id = `ent_${collection.length + 1}_${Math.random().toString(36).substring(2, 7)}`;

  collection.push({
    id,
    name,
    type: entityType,
    role: role || (entityType === 'PERSON' ? 'contact' : 'unknown'),
    confidence: entityType !== 'UNKNOWN' ? 0.95 : 0.70,
    sourcePage: page || 1,
    aliases: [],
  });
}
