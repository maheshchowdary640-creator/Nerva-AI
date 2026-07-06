/**
 * Helper to calculate a deterministic confidence score (0-100)
 * for detected anomalies and incidents using five weighted parameters:
 * 
 * 1. Deviation Magnitude (30% weight): Scale of deviation compared to normal bounds.
 * 2. Data Completeness (15% weight): Ratio of telemetry feeds active during detection.
 * 3. Persistence (20% weight): Duration/repeating nature of the signal drop.
 * 4. Threshold Distance (15% weight): How far the observed metric is beyond the critical line.
 * 5. Evidence Consistency (20% weight): Coincidence with other warning signals.
 */
export const confidenceUtils = {
  calculateConfidence(factors: {
    deviationMagnitude: number; // 0.0 - 1.0
    dataCompleteness: number;    // 0.0 - 1.0
    persistence: number;         // 0.0 - 1.0
    thresholdDistance: number;    // 0.0 - 1.0
    evidenceConsistency: number; // 0.0 - 1.0
  }): number {
    const wMagnitude = 30;
    const wCompleteness = 15;
    const wPersistence = 20;
    const wDistance = 15;
    const wConsistency = 20;

    const rawScore = 
      (factors.deviationMagnitude * wMagnitude) +
      (factors.dataCompleteness * wCompleteness) +
      (factors.persistence * wPersistence) +
      (factors.thresholdDistance * wDistance) +
      (factors.evidenceConsistency * wConsistency);

    // Guarantee score falls within 0 - 100, deterministic integer
    return Math.min(100, Math.max(0, Math.round(rawScore)));
  }
};
