/**
 * Provenance & "Why This Value?" Debug Engine
 * Tracks verifiable extraction evidence, source snippets, and validation checks
 * for every field without exposing hidden chain-of-thought.
 */

import { ProvenanceSource } from './types';

export class ProvenanceTracker {
  private records: Map<string, ProvenanceSource> = new Map();

  record(source: ProvenanceSource) {
    this.records.set(source.field, source);
  }

  get(field: string): ProvenanceSource | undefined {
    return this.records.get(field);
  }

  getAll(): Record<string, ProvenanceSource> {
    const result: Record<string, ProvenanceSource> = {};
    for (const [k, v] of this.records.entries()) {
      result[k] = v;
    }
    return result;
  }
}
