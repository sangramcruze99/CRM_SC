/**
 * Human Correction & Continuous Learning Loop Engine
 * Records human corrections as structured evaluation datasets for rule calibration,
 * prompt improvements, and automated regression benchmarking.
 */

import { HumanCorrection } from './types';

export class CorrectionRecorder {
  private static corrections: HumanCorrection[] = [];

  static record(correction: HumanCorrection) {
    this.corrections.push(correction);
  }

  static getCorrectionsForDocument(documentId: string): HumanCorrection[] {
    return this.corrections.filter((c) => c.documentId === documentId);
  }

  static getAllCorrections(): HumanCorrection[] {
    return [...this.corrections];
  }

  static clear() {
    this.corrections = [];
  }
}
